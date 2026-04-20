const SCREENSHOT_RE =
  /^(?<date>\d{4}-\d{2}-\d{2})\[(?<hour>\d{2})-(?<minute>\d{2})\]_(?<x>-?\d+(?:\.\d+)?),\s*(?<y>-?\d+(?:\.\d+)?),\s*(?<z>-?\d+(?:\.\d+)?)_(?<qx>-?\d+(?:\.\d+)?),\s*(?<qy>-?\d+(?:\.\d+)?),\s*(?<qz>-?\d+(?:\.\d+)?),\s*(?<qw>-?\d+(?:\.\d+)?)_(?<scale>-?\d+(?:\.\d+)?)(?:\s*\((?<index>\d+)\))?\.png$/i;

const DB_NAME = "tarkov-map-locator";
const STORE_NAME = "handles";
const HANDLE_KEY = "screenshotDir";
const AUTO_MAP_ID = "__AUTO__";
const MAX_RECORDS = 500;
const MAX_POI_RENDER = 1800;
const POI_EDGE_TOLERANCE = 0.02;
const ICON_BASE = "https://cdn.kaedeori.com/uploads/tarkov/map-icons";

const $ = (selector) => document.querySelector(selector);

const dom = {
  pickDirBtn: $("#pickDirBtn"),
  scanBtn: $("#scanBtn"),
  watchBtn: $("#watchBtn"),
  intervalInput: $("#intervalInput"),
  mapSelect: $("#mapSelect"),
  dirLabel: $("#dirLabel"),
  status: $("#status"),
  mapStatus: $("#mapStatus"),
  poiCount: $("#poiCount"),
  mapViewport: $("#mapViewport"),
  mapCanvas: $("#mapCanvas"),
  mapImage: $("#mapImage"),
  poiLayer: $("#poiLayer"),
  mapMarker: $("#mapMarker"),
  mapArrow: $("#mapArrow"),
  mapNoData: $("#mapNoData"),
  toggleExtracts: $("#toggleExtracts"),
  toggleSpawnPmc: $("#toggleSpawnPmc"),
  toggleSpawnScav: $("#toggleSpawnScav"),
  toggleSpawnBoss: $("#toggleSpawnBoss"),
  toggleSpawnSniper: $("#toggleSpawnSniper"),
  toggleSpawnRogue: $("#toggleSpawnRogue"),
  toggleLocks: $("#toggleLocks"),
  toggleSwitches: $("#toggleSwitches"),
  toggleHazards: $("#toggleHazards"),
  toggleStationary: $("#toggleStationary"),
  toggleBtr: $("#toggleBtr"),
  toggleTransits: $("#toggleTransits"),
};

const state = {
  dirHandle: null,
  scanTimer: null,
  watching: false,
  records: [],
  byName: new Map(),
  maps: [],
  mapsById: new Map(),
  selectedMapId: AUTO_MAP_ID,
  currentMapImageSrc: null,
  layerToggles: {
    extracts: true,
    spawnPmc: true,
    spawnScav: true,
    spawnBoss: true,
    spawnSniper: true,
    spawnRogue: true,
    locks: true,
    switches: true,
    hazards: true,
    stationary: true,
    btr: true,
    transits: true,
  },
  zoom: {
    scale: 1,
    min: 1,
    max: 4,
    tx: 0,
    ty: 0,
  },
  drag: {
    active: false,
    lastClientX: 0,
    lastClientY: 0,
  },
};

function setStatus(message, isError = false) {
  dom.status.textContent = `状态: ${message}`;
  dom.status.style.color = isError ? "var(--danger)" : "var(--accent)";
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function normalize360(angle) {
  return ((angle % 360) + 360) % 360;
}

function quaternionToYawDeg(qx, qy, qz, qw) {
  const sinyCosp = 2 * (qw * qy + qx * qz);
  const cosyCosp = 1 - 2 * (qy * qy + qz * qz);
  const yawRad = Math.atan2(sinyCosp, cosyCosp);
  return normalize360((yawRad * 180) / Math.PI);
}

function parseScreenshotName(name) {
  const match = name.match(SCREENSHOT_RE);
  if (!match || !match.groups) {
    return null;
  }

  const g = match.groups;
  const x = Number.parseFloat(g.x);
  const y = Number.parseFloat(g.y);
  const z = Number.parseFloat(g.z);
  const qx = Number.parseFloat(g.qx);
  const qy = Number.parseFloat(g.qy);
  const qz = Number.parseFloat(g.qz);
  const qw = Number.parseFloat(g.qw);
  const index = Number.parseInt(g.index || "0", 10);
  const time = new Date(`${g.date}T${g.hour}:${g.minute}:00`);
  const order = (Number.isNaN(time.getTime()) ? 0 : time.getTime()) * 1000 + index;
  const yawDeg = quaternionToYawDeg(qx, qy, qz, qw);

  return {
    name,
    x,
    y,
    z,
    qx,
    qy,
    qz,
    qw,
    yawDeg,
    order,
  };
}

function parseMapEntry(entry) {
  const data = entry?.raw?.data;
  if (!data || !Array.isArray(data.bounds) || data.bounds.length !== 2) {
    return null;
  }

  const [b0, b1] = data.bounds;
  if (!Array.isArray(b0) || !Array.isArray(b1) || b0.length < 2 || b1.length < 2) {
    return null;
  }

  const x0 = Number(b0[0]);
  const z0 = Number(b0[1]);
  const x1 = Number(b1[0]);
  const z1 = Number(b1[1]);
  if (![x0, z0, x1, z1].every(Number.isFinite)) {
    return null;
  }

  return {
    id: data.id || "",
    name: data.name || "未知地图",
    bounds: [
      [x0, z0],
      [x1, z1],
    ],
    reverseCoordinate: Boolean(data.reverseCoordinate),
    area: Math.abs((x1 - x0) * (z1 - z0)),
    svgPath: data.svgPath || "",
    extracts: Array.isArray(data.extracts) ? data.extracts : [],
    spawns: Array.isArray(data.spawns) ? data.spawns : [],
    locks: Array.isArray(data.locks) ? data.locks : [],
    switches: Array.isArray(data.switches) ? data.switches : [],
    hazards: Array.isArray(data.hazards) ? data.hazards : [],
    stationaryWeapons: Array.isArray(data.stationaryWeapons) ? data.stationaryWeapons : [],
    btrStops: Array.isArray(data.btrStops) ? data.btrStops : [],
    transits: Array.isArray(data.transits) ? data.transits : [],
  };
}

function getBoundsMinMax(bounds) {
  const [[x0, z0], [x1, z1]] = bounds;
  return {
    minX: Math.min(x0, x1),
    maxX: Math.max(x0, x1),
    minZ: Math.min(z0, z1),
    maxZ: Math.max(z0, z1),
  };
}

function pointInBounds(point, map) {
  const mm = getBoundsMinMax(map.bounds);
  return point.x >= mm.minX && point.x <= mm.maxX && point.z >= mm.minZ && point.z <= mm.maxZ;
}

function chooseMapByRecentConsistency(latest) {
  const candidates = state.maps.filter((m) => pointInBounds(latest, m));
  if (candidates.length === 0) {
    return null;
  }
  const recent = state.records.slice(-30);
  const scored = candidates.map((map) => {
    let score = 0;
    for (const rec of recent) {
      if (pointInBounds(rec, map)) {
        score += 1;
      }
    }
    return { map, score };
  });
  scored.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    return a.map.area - b.map.area;
  });
  return scored[0].map;
}

function getMapBySelectionOrAuto(latest) {
  if (state.selectedMapId !== AUTO_MAP_ID) {
    return state.mapsById.get(state.selectedMapId) || null;
  }
  if (!latest) {
    return state.maps[0] || null;
  }
  return chooseMapByRecentConsistency(latest) || state.maps[0] || null;
}

function createRealToImageConverter(size = { width: 1, height: 1 }, bounds, reverseCoordinate) {
  return {
    x: (realX, realZ) => {
      const nx = (realX - bounds[0][0]) / (bounds[1][0] - bounds[0][0]);
      const nz = (realZ - bounds[0][1]) / (bounds[1][1] - bounds[0][1]);
      return reverseCoordinate ? nz * size.width : nx * size.width;
    },
    y: (realX, realZ) => {
      const nx = (realX - bounds[0][0]) / (bounds[1][0] - bounds[0][0]);
      const nz = (realZ - bounds[0][1]) / (bounds[1][1] - bounds[0][1]);
      return reverseCoordinate ? nx * size.height : nz * size.height;
    },
  };
}

function projectWorldToUnit(point, map) {
  const conv = createRealToImageConverter({ width: 1, height: 1 }, map.bounds, map.reverseCoordinate);
  return {
    u: conv.x(point.x, point.z),
    v: conv.y(point.x, point.z),
  };
}

function inUnitRange(v) {
  return Number.isFinite(v) && v >= 0 && v <= 1;
}

function normalizePoiUnit(pos) {
  if (!pos || !Number.isFinite(pos.u) || !Number.isFinite(pos.v)) {
    return null;
  }
  if (
    pos.u < -POI_EDGE_TOLERANCE ||
    pos.u > 1 + POI_EDGE_TOLERANCE ||
    pos.v < -POI_EDGE_TOLERANCE ||
    pos.v > 1 + POI_EDGE_TOLERANCE
  ) {
    return null;
  }
  return {
    u: Math.min(1, Math.max(0, pos.u)),
    v: Math.min(1, Math.max(0, pos.v)),
  };
}

function setMapOverlayVisible(visible, message = "") {
  dom.mapNoData.style.display = visible ? "grid" : "none";
  if (message) {
    dom.mapNoData.textContent = message;
  }
}

function hidePlayerMarker() {
  dom.mapMarker.style.display = "none";
  dom.mapArrow.style.display = "none";
}

function showPlayerMarker(unitPos, yawDeg) {
  const left = `${(unitPos.u * 100).toFixed(4)}%`;
  const top = `${(unitPos.v * 100).toFixed(4)}%`;
  dom.mapMarker.style.left = left;
  dom.mapMarker.style.top = top;
  dom.mapArrow.style.left = left;
  dom.mapArrow.style.top = top;
  dom.mapArrow.style.transform = `translate(-50%, -50%) rotate(${yawDeg}deg)`;
  dom.mapMarker.style.display = "block";
  dom.mapArrow.style.display = "block";
}

function getViewportSize() {
  const rect = dom.mapViewport.getBoundingClientRect();
  return {
    width: rect.width,
    height: rect.height,
  };
}

function clampZoomTranslation(scale, tx, ty) {
  if (scale <= 1) {
    return { tx: 0, ty: 0 };
  }
  const { width, height } = getViewportSize();
  if (width <= 0 || height <= 0) {
    return { tx: 0, ty: 0 };
  }

  const scaledWidth = width * scale;
  const scaledHeight = height * scale;
  const minX = Math.min(0, width - scaledWidth);
  const minY = Math.min(0, height - scaledHeight);

  return {
    tx: clamp(tx, minX, 0),
    ty: clamp(ty, minY, 0),
  };
}

function canDragMap() {
  return state.zoom.scale > 1 + 1e-6;
}

function updateMapDragCursor() {
  const canDrag = canDragMap();
  dom.mapViewport.classList.toggle("can-drag", canDrag);
  if (!canDrag) {
    state.drag.active = false;
    dom.mapViewport.classList.remove("is-dragging");
  }
}

function applyMapZoomTransform() {
  const z = state.zoom;
  dom.mapCanvas.style.transform = `translate(${z.tx}px, ${z.ty}px) scale(${z.scale})`;
  updateMapDragCursor();
}

function stopMapDrag() {
  if (!state.drag.active) {
    return;
  }
  state.drag.active = false;
  dom.mapViewport.classList.remove("is-dragging");
}

function resetMapZoom() {
  stopMapDrag();
  state.zoom.scale = 1;
  state.zoom.tx = 0;
  state.zoom.ty = 0;
  applyMapZoomTransform();
}

function setMapZoomAt(nextScale, originX, originY) {
  const z = state.zoom;
  const prevScale = z.scale;
  const clampedScale = clamp(nextScale, z.min, z.max);
  if (!Number.isFinite(clampedScale) || clampedScale <= 0) {
    return;
  }
  if (Math.abs(clampedScale - prevScale) < 1e-6) {
    return;
  }

  if (!Number.isFinite(originX) || !Number.isFinite(originY)) {
    z.scale = clampedScale;
    const next = clampZoomTranslation(clampedScale, z.tx, z.ty);
    z.tx = next.tx;
    z.ty = next.ty;
    applyMapZoomTransform();
    return;
  }

  const worldX = (originX - z.tx) / prevScale;
  const worldY = (originY - z.ty) / prevScale;
  const rawTx = originX - worldX * clampedScale;
  const rawTy = originY - worldY * clampedScale;
  const next = clampZoomTranslation(clampedScale, rawTx, rawTy);

  z.scale = clampedScale;
  z.tx = next.tx;
  z.ty = next.ty;
  applyMapZoomTransform();
}

function handleMapWheel(event) {
  event.preventDefault();
  const rect = dom.mapViewport.getBoundingClientRect();
  const originX = event.clientX - rect.left;
  const originY = event.clientY - rect.top;
  const zoomFactor = Math.exp(-event.deltaY * 0.0016);
  const nextScale = state.zoom.scale * zoomFactor;
  setMapZoomAt(nextScale, originX, originY);
}

function handleMapMouseDown(event) {
  if (event.button !== 0 || !canDragMap()) {
    return;
  }
  state.drag.active = true;
  state.drag.lastClientX = event.clientX;
  state.drag.lastClientY = event.clientY;
  dom.mapViewport.classList.add("is-dragging");
  event.preventDefault();
}

function handleMapMouseMove(event) {
  if (!state.drag.active) {
    return;
  }
  if (!canDragMap()) {
    stopMapDrag();
    return;
  }

  const dx = event.clientX - state.drag.lastClientX;
  const dy = event.clientY - state.drag.lastClientY;
  state.drag.lastClientX = event.clientX;
  state.drag.lastClientY = event.clientY;

  const next = clampZoomTranslation(state.zoom.scale, state.zoom.tx + dx, state.zoom.ty + dy);
  state.zoom.tx = next.tx;
  state.zoom.ty = next.ty;
  applyMapZoomTransform();
}

function setMapImage(map) {
  const nextSrc = map?.svgPath || "";
  if (state.currentMapImageSrc === nextSrc) {
    return;
  }
  state.currentMapImageSrc = nextSrc;
  dom.mapImage.src = nextSrc;
  resetMapZoom();
}

function getIconUrl(iconName) {
  return `${ICON_BASE}/${iconName}.png`;
}

function getExtractIconName(extract) {
  const faction = String(extract?.faction || "shared").toLowerCase();
  if (faction === "pmc" || faction === "scav" || faction === "shared") {
    return `extract_${faction}`;
  }
  return "extract_shared";
}

function getExtractDisplayName(extract) {
  const baseName = extract?.name || "未知撤离点";
  const faction = String(extract?.faction || "shared").toLowerCase();
  let factionZh = "共享";
  if (faction === "pmc") {
    factionZh = "PMC";
  } else if (faction === "scav") {
    factionZh = "Scav";
  }

  const tags = [factionZh];
  if (Array.isArray(extract?.switches) && extract.switches.length > 0) {
    tags.push("需拉闸");
  }
  if (Array.isArray(extract?.requirements) && extract.requirements.length > 0) {
    tags.push("有条件");
  }
  return `${baseName}（${tags.join("，")}）`;
}

function getSpawnIconName(spawn) {
  const categories = Array.isArray(spawn?.categories) ? spawn.categories.map((x) => String(x).toLowerCase()) : [];
  const sides = Array.isArray(spawn?.sides) ? spawn.sides.map((x) => String(x).toLowerCase()) : [];

  if (categories.includes("boss")) {
    return "spawn_boss";
  }
  if (categories.includes("sniper")) {
    return "spawn_sniper_scav";
  }
  if (categories.includes("botpmc")) {
    return "spawn_rogue";
  }
  if (sides.includes("pmc") && !sides.includes("scav")) {
    return "spawn_pmc";
  }
  return "spawn_scav";
}

function getSpawnLayerType(spawn) {
  const icon = getSpawnIconName(spawn);
  if (icon === "spawn_boss") {
    return "spawnBoss";
  }
  if (icon === "spawn_sniper_scav") {
    return "spawnSniper";
  }
  if (icon === "spawn_rogue") {
    return "spawnRogue";
  }
  if (icon === "spawn_pmc") {
    return "spawnPmc";
  }
  return "spawnScav";
}

function getTransitDisplayName(transit) {
  const desc = typeof transit?.description === "string" ? transit.description.trim() : "";
  if (desc) {
    return desc;
  }
  const targetId = transit?.map?.id;
  if (targetId && state.mapsById.has(targetId)) {
    return `前往 ${state.mapsById.get(targetId).name}`;
  }
  if (targetId) {
    return `前往 ${targetId}`;
  }
  return "转移点";
}

function pushPoi(pois, point, icon, label, opts = {}) {
  if (!point || !Number.isFinite(point.x) || !Number.isFinite(point.z)) {
    return;
  }
  pois.push({
    x: point.x,
    z: point.z,
    icon,
    label,
    type: opts.type || "misc",
    small: Boolean(opts.small),
    showLabel: Boolean(opts.showLabel),
    labelText: opts.labelText || "",
  });
}

function collectPois(map) {
  const pois = [];

  for (const e of map.extracts) {
    const displayName = getExtractDisplayName(e);
    const icon = getExtractIconName(e);
    pushPoi(pois, e?.position, icon, `[撤离点] ${displayName}`, {
      type: "extracts",
      showLabel: true,
      labelText: displayName,
    });
  }

  for (const s of map.spawns) {
    const side = Array.isArray(s?.sides) && s.sides.length > 0 ? s.sides.join("/") : "unknown";
    const spawnIcon = getSpawnIconName(s);
    const spawnLayerType = getSpawnLayerType(s);
    pushPoi(pois, s?.position, spawnIcon, `[出生点] ${s?.zoneName || "Zone"} (${side})`, {
      type: spawnLayerType,
      small: true,
    });
  }

  for (const l of map.locks) {
    pushPoi(pois, l?.position, "lock", `[钥匙门] ${l?.key?.name || "未命名"}`, {
      type: "locks",
      small: true,
    });
  }

  for (const s of map.switches) {
    pushPoi(pois, s?.position, "switch", `[开关] ${s?.name || "未命名开关"}`, {
      type: "switches",
    });
  }

  for (const h of map.hazards) {
    pushPoi(pois, h?.position, "hazard", `[危险区] ${h?.name || h?.hazardType || "危险区"}`, {
      type: "hazards",
      small: true,
    });
  }

  for (const w of map.stationaryWeapons) {
    pushPoi(pois, w?.position, "stationarygun", `[固定武器] ${w?.stationaryWeapon?.name || "武器点位"}`, {
      type: "stationary",
    });
  }

  for (const b of map.btrStops) {
    pushPoi(pois, b?.position, "btr_stop", `[BTR] ${b?.name || "停靠点"}`, {
      type: "btr",
    });
  }

  for (const tr of map.transits) {
    const transitName = getTransitDisplayName(tr);
    pushPoi(pois, tr?.position, "extract_transit", `[转移点] ${transitName}`, {
      type: "transits",
      showLabel: true,
      labelText: transitName,
    });
  }

  if (pois.length > MAX_POI_RENDER) {
    return pois.slice(0, MAX_POI_RENDER);
  }
  return pois;
}

function isPoiTypeEnabled(type) {
  return Boolean(state.layerToggles[type]);
}

function renderPoiLayer(map) {
  dom.poiLayer.innerHTML = "";
  if (!map) {
    dom.poiCount.textContent = "0 个点位";
    return 0;
  }

  const pois = collectPois(map);
  const frag = document.createDocumentFragment();
  let rendered = 0;

  for (const poi of pois) {
    if (!isPoiTypeEnabled(poi.type)) {
      continue;
    }
    const rawPos = projectWorldToUnit({ x: poi.x, z: poi.z }, map);
    const pos = normalizePoiUnit(rawPos);
    if (!pos) {
      continue;
    }

    const wrap = document.createElement("div");
    wrap.className = "poi-wrap";
    wrap.style.left = `${(pos.u * 100).toFixed(4)}%`;
    wrap.style.top = `${(pos.v * 100).toFixed(4)}%`;
    wrap.title = poi.label;

    const iconEl = document.createElement("div");
    iconEl.className = poi.small ? "poi poi-small" : "poi";
    iconEl.style.backgroundImage = `url("${getIconUrl(poi.icon)}")`;
    wrap.appendChild(iconEl);

    if (poi.showLabel && poi.labelText) {
      const labelEl = document.createElement("div");
      labelEl.className = "poi-name";
      labelEl.textContent = poi.labelText;
      wrap.appendChild(labelEl);
    }

    frag.appendChild(wrap);
    rendered += 1;
  }

  dom.poiLayer.appendChild(frag);
  dom.poiCount.textContent = `${rendered} 个点位`;
  return rendered;
}

function updateMapPanel(latest) {
  if (state.maps.length === 0) {
    dom.mapStatus.textContent = "地图状态: 未加载";
    hidePlayerMarker();
    renderPoiLayer(null);
    setMapImage(null);
    setMapOverlayVisible(true, "未读取到 maps_detail.json");
    return;
  }

  const map = getMapBySelectionOrAuto(latest);
  if (!map) {
    dom.mapStatus.textContent = "地图状态: 无可用地图";
    hidePlayerMarker();
    renderPoiLayer(null);
    setMapImage(null);
    setMapOverlayVisible(true, "无可用地图");
    return;
  }

  setMapImage(map);
  setMapOverlayVisible(false);
  const poiCount = renderPoiLayer(map);

  if (state.selectedMapId === AUTO_MAP_ID) {
    dom.mapStatus.textContent = `地图状态: 自动模式 / ${map.name} / ${poiCount} 点`;
  } else {
    dom.mapStatus.textContent = `地图状态: 手动模式 / ${map.name} / ${poiCount} 点`;
  }

  if (!latest) {
    hidePlayerMarker();
    return;
  }

  const p = projectWorldToUnit({ x: latest.x, z: latest.z }, map);
  if (!inUnitRange(p.u) || !inUnitRange(p.v)) {
    hidePlayerMarker();
    return;
  }
  showPlayerMarker(p, latest.yawDeg);
}

function refreshUi() {
  const latest = state.records[state.records.length - 1] || null;
  updateMapPanel(latest);
}

function populateMapSelect() {
  dom.mapSelect.innerHTML = "";

  const autoOption = document.createElement("option");
  autoOption.value = AUTO_MAP_ID;
  autoOption.textContent = "自动选择（按坐标）";
  dom.mapSelect.appendChild(autoOption);

  for (const map of state.maps) {
    const opt = document.createElement("option");
    opt.value = map.id;
    opt.textContent = map.name;
    dom.mapSelect.appendChild(opt);
  }

  dom.mapSelect.value = state.selectedMapId;
}

async function loadMapMetadata() {
  try {
    const res = await fetch("./maps_detail.json", { cache: "no-store" });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    const raw = await res.json();
    const maps = Object.values(raw)
      .map((entry) => parseMapEntry(entry))
      .filter(Boolean)
      .sort((a, b) => a.name.localeCompare(b.name, "zh-CN"));

    state.maps = maps;
    state.mapsById = new Map(maps.map((m) => [m.id, m]));
    populateMapSelect();
    setStatus(`地图元数据已加载: ${maps.length} 张`);
  } catch (error) {
    setStatus(`加载地图元数据失败: ${error.message}`, true);
  }
}

async function openDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function saveHandle(handle) {
  const db = await openDb();
  await new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).put(handle, HANDLE_KEY);
    tx.oncomplete = resolve;
    tx.onerror = () => reject(tx.error);
  });
}

async function loadHandle() {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const req = tx.objectStore(STORE_NAME).get(HANDLE_KEY);
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => reject(req.error);
  });
}

async function ensureReadPermission(handle) {
  const opts = { mode: "read" };
  if ((await handle.queryPermission(opts)) === "granted") {
    return true;
  }
  return (await handle.requestPermission(opts)) === "granted";
}

async function scanOnce() {
  if (!state.dirHandle) {
    setStatus("请先选择截图目录", true);
    return;
  }

  const found = [];
  let skippedNoCoordinate = 0;
  for await (const [name, handle] of state.dirHandle.entries()) {
    if (handle.kind !== "file" || !name.toLowerCase().endsWith(".png")) {
      continue;
    }
    const parsed = parseScreenshotName(name);
    if (!parsed) {
      skippedNoCoordinate += 1;
      continue;
    }
    found.push(parsed);
  }

  found.sort((a, b) => a.order - b.order);
  let added = 0;
  for (const item of found) {
    if (!state.byName.has(item.name)) {
      state.byName.set(item.name, item);
      state.records.push(item);
      added += 1;
    }
  }

  state.records.sort((a, b) => a.order - b.order);
  if (state.records.length > MAX_RECORDS) {
    state.records = state.records.slice(-MAX_RECORDS);
    state.byName = new Map(state.records.map((r) => [r.name, r]));
  }

  if (added === 0) {
    return;
  }

  refreshUi();
  setStatus(`扫描完成: 识别 ${found.length} 张, 新增 ${added} 张, 忽略无坐标 ${skippedNoCoordinate} 张`);
}

function stopWatch() {
  if (state.scanTimer) {
    clearInterval(state.scanTimer);
    state.scanTimer = null;
  }
  state.watching = false;
  dom.watchBtn.textContent = "开始监听";
}

function startWatch() {
  if (!state.dirHandle) {
    setStatus("请先选择截图目录", true);
    return;
  }
  const intervalSec = Math.max(1, Number.parseInt(dom.intervalInput.value || "2", 10));
  dom.intervalInput.value = String(intervalSec);
  stopWatch();
  state.scanTimer = setInterval(() => {
    scanOnce().catch((error) => {
      setStatus(`扫描失败: ${error.message}`, true);
    });
  }, intervalSec * 1000);
  state.watching = true;
  dom.watchBtn.textContent = "停止监听";
  setStatus(`监听已开启，间隔 ${intervalSec} 秒`);
}

async function chooseDirectory() {
  if (!window.showDirectoryPicker) {
    setStatus("当前浏览器不支持目录选择 API", true);
    return;
  }
  try {
    const handle = await window.showDirectoryPicker({ mode: "read" });
    const granted = await ensureReadPermission(handle);
    if (!granted) {
      setStatus("目录读取权限未授权", true);
      return;
    }

    state.dirHandle = handle;
    dom.dirLabel.textContent = handle.name || "已选择目录";
    try {
      await saveHandle(handle);
    } catch {
      setStatus("目录已选择，但浏览器未能持久化句柄");
    }
    await scanOnce();
  } catch (error) {
    if (error?.name !== "AbortError") {
      setStatus(`选择目录失败: ${error.message}`, true);
    }
  }
}

async function restoreDirectory() {
  if (!window.showDirectoryPicker) {
    return;
  }
  try {
    const saved = await loadHandle();
    if (!saved) {
      setStatus("未发现历史目录句柄，请手动选择目录");
      return;
    }
    const granted = await ensureReadPermission(saved);
    if (!granted) {
      setStatus("历史目录权限已失效，请重新选择目录");
      return;
    }
    state.dirHandle = saved;
    dom.dirLabel.textContent = saved.name || "目录已恢复";
    await scanOnce();
  } catch {
    setStatus("恢复目录失败，请手动选择目录");
  }
}

function bindEvents() {
  dom.pickDirBtn.addEventListener("click", () => {
    chooseDirectory().catch((e) => setStatus(`选择目录失败: ${e.message}`, true));
  });
  dom.scanBtn.addEventListener("click", () => {
    scanOnce().catch((e) => setStatus(`扫描失败: ${e.message}`, true));
  });
  dom.watchBtn.addEventListener("click", () => {
    if (state.watching) {
      stopWatch();
      setStatus("监听已停止");
    } else {
      startWatch();
    }
  });
  dom.mapSelect.addEventListener("change", () => {
    state.selectedMapId = dom.mapSelect.value || AUTO_MAP_ID;
    refreshUi();
  });

  const toggleBindings = [
    ["toggleExtracts", "extracts"],
    ["toggleSpawnPmc", "spawnPmc"],
    ["toggleSpawnScav", "spawnScav"],
    ["toggleSpawnBoss", "spawnBoss"],
    ["toggleSpawnSniper", "spawnSniper"],
    ["toggleSpawnRogue", "spawnRogue"],
    ["toggleLocks", "locks"],
    ["toggleSwitches", "switches"],
    ["toggleHazards", "hazards"],
    ["toggleStationary", "stationary"],
    ["toggleBtr", "btr"],
    ["toggleTransits", "transits"],
  ];
  for (const [domKey, stateKey] of toggleBindings) {
    dom[domKey].checked = Boolean(state.layerToggles[stateKey]);
    dom[domKey].addEventListener("change", () => {
      state.layerToggles[stateKey] = dom[domKey].checked;
      refreshUi();
    });
  }

  dom.mapViewport.addEventListener("wheel", handleMapWheel, { passive: false });
  dom.mapViewport.addEventListener("mousedown", handleMapMouseDown);
  window.addEventListener("mousemove", handleMapMouseMove);
  window.addEventListener("mouseup", stopMapDrag);
  window.addEventListener("blur", stopMapDrag);
  dom.mapViewport.addEventListener("mouseleave", (event) => {
    if (state.drag.active && event.buttons === 0) {
      stopMapDrag();
    }
  });

  window.addEventListener("resize", () => {
    const next = clampZoomTranslation(state.zoom.scale, state.zoom.tx, state.zoom.ty);
    state.zoom.tx = next.tx;
    state.zoom.ty = next.ty;
    applyMapZoomTransform();
  });

  dom.mapImage.addEventListener("load", () => {
    const w = dom.mapImage.naturalWidth;
    const h = dom.mapImage.naturalHeight;
    if (w > 0 && h > 0) {
      dom.mapViewport.style.aspectRatio = `${w} / ${h}`;
    }
    const next = clampZoomTranslation(state.zoom.scale, state.zoom.tx, state.zoom.ty);
    state.zoom.tx = next.tx;
    state.zoom.ty = next.ty;
    applyMapZoomTransform();
  });
}

async function boot() {
  bindEvents();
  resetMapZoom();
  await loadMapMetadata();
  refreshUi();
  await restoreDirectory();
  refreshUi();
}

boot().catch((error) => {
  setStatus(`初始化失败: ${error.message}`, true);
});
