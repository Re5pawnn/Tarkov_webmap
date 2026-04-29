const SCREENSHOT_RE =
  /^(?<date>\d{4}-\d{2}-\d{2})\[(?<hour>\d{2})-(?<minute>\d{2})\]_(?<x>-?\d+(?:\.\d+)?),\s*(?<y>-?\d+(?:\.\d+)?),\s*(?<z>-?\d+(?:\.\d+)?)_(?<qx>-?\d+(?:\.\d+)?),\s*(?<qy>-?\d+(?:\.\d+)?),\s*(?<qz>-?\d+(?:\.\d+)?),\s*(?<qw>-?\d+(?:\.\d+)?)_(?<scale>-?\d+(?:\.\d+)?)(?:\s*\((?<index>\d+)\))?\.png$/i;
const LOG_DIRECTORY_RE = /^log_(?<stamp>\d{4}\.\d{2}\.\d{2}_\d{1,2}-\d{2}-\d{2})_(?<suffix>[0-9.]+)$/i;
const LOG_ENTRY_START_RE = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3}(?: ?[+-]\d{2}:\d{2})?\|/;
const DB_NAME = "tarkov-map-locator";
const STORE_NAME = "handles";
const STORE_KEYS = {
  screenshotDir: "screenshotDir",
  gameDir: "gameDir",
};
const AUTO_MAP_ID = "__AUTO__";
const MAX_RECORDS = 500;
const MAX_POI_RENDER = 1800;
const MAX_RAID_EVENTS = 30;
const MAX_VISIBLE_RAID_EVENTS = 5;
const LAN_SYNC_STORAGE_KEY = "tarkov-map-locator.lan-sync";
const LAN_SYNC_POLL_MS = 1500;
const LAN_SYNC_MIN_PUBLISH_MS = 900;
const LAN_SYNC_DEFAULT_COLOR = "#4fd1ff";
const LAN_SYNC_DEFAULT_PORT = 39247;
const LAN_SYNC_REMOTE_REQUIRED_MESSAGE = "连接模式需要填写远端地址";
const LAN_SYNC_REMOTE_PORT_REQUIRED_MESSAGE = "连接模式需要填写远端端口";
const POI_EDGE_TOLERANCE = 0.02;
const ICON_BASE = "https://cdn.kaedeori.com/uploads/tarkov/map-icons";
const FLEA_MARKET_SOLD_TEMPLATE = "5bdabfb886f7743e152e867e 0";
const FLEA_MARKET_EXPIRED_TEMPLATE = "5bdabfe486f7743e1665df6e 0";
const TASK_MESSAGE_TYPES = {
  started: 10,
  failed: 11,
  finished: 12,
};
const TASK_TRADER_SLOT_COUNT = 9;
const TASK_TRADER_RAW_DATA = {
  Prapor: `打靶训练 <iframe src="//player.bilibili.com/player.html?isOutside=true&aid=792884338&bvid=BV1RC4y1q7mk&cid=34648490118&p=1" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true"></iframe>
首秀 <iframe src="//player.bilibili.com/player.html?isOutside=true&aid=770608182&bvid=BV1nr4y1u7A6&cid=761410348&p=1" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true"></iframe>
奢靡人生 <iframe src="//player.bilibili.com/player.html?isOutside=true&aid=580748626&bvid=BV1B64y1E7X6&cid=34657470472&p=1" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true"></iframe>
背景调查 <iframe src="//player.bilibili.com/player.html?isOutside=true&aid=300997943&bvid=BV1QF411N7pY&cid=772600757&p=1" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true"></iframe>
硝烟野餐 <iframe src="//player.bilibili.com/player.html?isOutside=true&aid=1952094121&bvid=BV1nC41187wK&cid=1477510629&p=1" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true"></iframe>
搜索任务 <iframe src="//player.bilibili.com/player.html?isOutside=true&aid=598125634&bvid=BV1vB4y1i7eU&cid=764952948&p=1" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true"></iframe>
往事速递 <iframe src="//player.bilibili.com/player.html?isOutside=true&aid=770933893&bvid=BV1Nr4y1J7vh&cid=34808204388&p=1" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true"></iframe>
石油存储 <iframe src="//player.bilibili.com/player.html?isOutside=true&aid=983537527&bvid=BV1xt4y1t7ZS&cid=776510804&p=1" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true"></iframe>
引路先驱 <iframe src="//player.bilibili.com/player.html?isOutside=true&aid=115719370967035&bvid=BV1Y9m6BsE25&cid=34742013317&p=1" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true"></iframe>
罪证 <iframe src="//player.bilibili.com/player.html?isOutside=true&aid=216381898&bvid=BV1na411T7rk&cid=786335492&p=1" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true"></iframe>
蛋卷冰淇淋 <iframe src="//player.bilibili.com/player.html?isOutside=true&aid=344029852&bvid=BV1fd4y1K7ex&cid=789600332&p=1" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true"></iframe>
地堡1 <iframe src="//player.bilibili.com/player.html?isOutside=true&aid=942095409&bvid=BV19W4y1h7ph&cid=804516558&p=1" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true"></iframe>
邮递员派特1＆2 <iframe src="//player.bilibili.com/player.html?isOutside=true&aid=259023726&bvid=BV1ta411Z7tt&cid=28721680142&p=1" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true"></iframe>
占有者 <iframe src="//player.bilibili.com/player.html?isOutside=true&aid=113089206813859&bvid=BV1jqHSe7EsY&cid=25759386010&p=1" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true"></iframe>
polikhim流浪汉 <iframe src="//player.bilibili.com/player.html?isOutside=true&aid=396333804&bvid=BV1Go4y1B7hi&cid=1063403229&p=1" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true"></iframe>
掷弹兵 <iframe src="//player.bilibili.com/player.html?isOutside=true&aid=1155116711&bvid=BV1sZ421W75Z&cid=1564802727&p=1" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true"></iframe>
无意冒犯 <iframe src="//player.bilibili.com/player.html?isOutside=true&aid=1002924379&bvid=BV1wx4y1e7up&cid=1498479265&p=1" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true"></iframe>
大客户 <iframe src="//player.bilibili.com/player.html?isOutside=true&aid=323119440&bvid=BV1yw411s7Ct&cid=1323976547&p=1" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true"></iframe>
探囊取物 <iframe src="//player.bilibili.com/player.html?isOutside=true&aid=217681908&bvid=BV1Ea411376k&cid=822327527&p=1" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true"></iframe>
地堡2 <iframe src="//player.bilibili.com/player.html?isOutside=true&aid=984733874&bvid=BV1ot4y1J7oU&cid=808065355&p=1" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true"></iframe>
一信之缘 <iframe src="//player.bilibili.com/player.html?isOutside=true&aid=224882987&bvid=BV1mb41197m1&cid=1022008227&p=1" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true"></iframe>
惩罚者1 <iframe src="//player.bilibili.com/player.html?isOutside=true&aid=560732934&bvid=BV1ve4y1t7Ja&cid=837573586&p=1" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true"></iframe>
叛无所依 <iframe src="//player.bilibili.com/player.html?isOutside=true&aid=113357558383588&bvid=BV1a41cYVEsy&cid=26432180172&p=1" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true"></iframe>
苏共之辉1 <iframe src="//player.bilibili.com/player.html?isOutside=true&aid=961637172&bvid=BV1KH4y1Z7Uc&cid=1286624527&p=1" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true"></iframe>
惩罚者2 <iframe src="//player.bilibili.com/player.html?isOutside=true&aid=388125380&bvid=BV1ad4y1674T&cid=837702370&p=1" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true"></iframe>
踩点行动 <iframe src="//player.bilibili.com/player.html?isOutside=true&aid=1353548369&bvid=BV1ez42167TZ&cid=1516481014&p=1" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true"></iframe>
小菜一碟1＆2 <iframe src="//player.bilibili.com/player.html?isOutside=true&aid=1706140206&bvid=BV1jT421k7uX&cid=1610432476&p=1" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true"></iframe>
多鱼之漏 <iframe src="//player.bilibili.com/player.html?isOutside=true&aid=113374151050358&bvid=BV1on1xYWEsu&cid=26476612703&p=1" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true"></iframe>
特别联络 <iframe src="//player.bilibili.com/player.html?isOutside=true&aid=114185094562926&bvid=BV1fCXJYfEB6&cid=28939718020&p=1" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true"></iframe>
惩罚者3 <iframe src="//player.bilibili.com/player.html?isOutside=true&aid=560938605&bvid=BV1qe4y1b7US&cid=844344991&p=1" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true"></iframe>
绿色通道 <iframe src="//player.bilibili.com/player.html?isOutside=true&aid=918305584&bvid=BV1ku4y1t7MU&cid=1329760080&p=1" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true"></iframe>
惩罚者4 <iframe src="//player.bilibili.com/player.html?isOutside=true&aid=1902783937&bvid=BV1cm4116744&cid=1501992564&p=1" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true"></iframe>
惩罚者5 <iframe src="//player.bilibili.com/player.html?isOutside=true&aid=1102754837&bvid=BV1bA4m1w7r5&cid=1501992568&p=1" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true"></iframe>
货运延误1 <iframe src="//player.bilibili.com/player.html?isOutside=true&aid=115748982752653&bvid=BV1AhBABVEYv&cid=34852310897&p=1" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true"></iframe>
半满半空 https://www.eftarkov.com/news/63.html
横插一杠 https://www.eftarkov.com/news/64.html
麻醉 <iframe src="//player.bilibili.com/player.html?isOutside=true&aid=794006792&bvid=BV1DC4y1C75X&cid=1414553696&p=1" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true"></iframe>
惩罚者6 <iframe src="//player.bilibili.com/player.html?isOutside=true&aid=1403501072&bvid=BV1Zr421G777&cid=1516473858&p=1" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true"></iframe>
不容置问 https://www.eftarkov.com/news/4907.html
出警商场 <iframe src="//player.bilibili.com/player.html?isOutside=true&aid=1104679018&bvid=BV1Qw4m1S7xa&cid=1544108680&p=1" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true"></iframe>
出警检票 <iframe src="//player.bilibili.com/player.html?isOutside=true&aid=1355032871&bvid=BV1wz421a7MG&cid=1560585781&p=1" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true"></iframe>
出警巡逻 <iframe src="//player.bilibili.com/player.html?isOutside=true&aid=1955012055&bvid=BV1oy411a7z1&cid=1563332170&p=1" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true"></iframe>
苏共之辉2 <iframe src="//player.bilibili.com/player.html?isOutside=true&aid=449182153&bvid=BV1Mj411b7sv&cid=1287797550&p=1" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true"></iframe>
屋顶战神 <iframe src="//player.bilibili.com/player.html?isOutside=true&aid=578271344&bvid=BV1Sz4y1P7KU&cid=1329785725&p=1" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true"></iframe>
财不外露 <iframe src="//player.bilibili.com/player.html?isOutside=true&aid=283827040&bvid=BV1tc41147hA&cid=34659110712&p=1" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true"></iframe>
管制材料 <iframe src="//player.bilibili.com/player.html?isOutside=true&aid=833318562&bvid=BV1Yg4y197vB&cid=1329740643&p=1" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true"></iframe>
最好的差事 https://www.eftarkov.com/news/25.html
占山为王 https://www.eftarkov.com/news/42.html
试驾1 https://www.eftarkov.com/news/29.html
试驾2 https://www.eftarkov.com/news/30.html
试驾3 https://www.eftarkov.com/news/31.html
试驾4 https://www.eftarkov.com/news/50.html
艺术就是爆炸 https://www.eftarkov.com/news/65.html
试驾5 https://www.eftarkov.com/news/57.html
试驾6 https://www.eftarkov.com/news/60.html
左右逢源 https://www.eftarkov.com/news/32.html
掠地攻城 <iframe src="//player.bilibili.com/player.html?isOutside=true&aid=1955007595&bvid=BV1dy411a7sY&cid=1560592601&p=1" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true"></iframe>
恐吓者 https://www.eftarkov.com/news/38.html
护送 https://www.eftarkov.com/news/39.html`,
};
const MAP_PRESET_TO_ID = {
  TarkovStreets: "5714dc692459777137212e12",
  Sandbox: "653e6760052c01c1c805532f",
  Sandbox_high: "65b8d6f5cdde2479cb2a3125",
  bigmap: "56f40101d2720b2a4d8b45d6",
  factory4_day: "55f2d3fd4bdc2d5f408b4567",
  factory4_night: "59fc81d786f774390775787e",
  Interchange: "5714dbc024597771384a510d",
  laboratory: "5b0fc42d86f7744a585f9105",
  Lighthouse: "5704e4dad2720bb55b8b4567",
  RezervBase: "5704e5fad2720bc05b8b4567",
  Shoreline: "5704e554d2720bac5b8b456e",
  Woods: "5704e3c2d2720bac5b8b4567",
};
const RAID_STATUS_TEXT = {
  idle: "待战局",
  matching: "匹配中",
  loading: "加载中",
  in_raid: "已进战局",
  extracting_or_over: "已结束",
  aborted: "已取消",
  error: "异常",
};

const $ = (selector) => document.querySelector(selector);

const dom = {
  mapTabBtn: $("#mapTabBtn"),
  taskTabBtn: $("#taskTabBtn"),
  mapView: $("#mapView"),
  taskView: $("#taskView"),
  taskTraderList: $("#taskTraderList"),
  taskVideoWrap: $("#taskVideoWrap"),
  taskVideoFrame: $("#taskVideoFrame"),
  taskVideoTip: $("#taskVideoTip"),
  taskLinkCard: $("#taskLinkCard"),
  taskLinkTitle: $("#taskLinkTitle"),
  taskLinkAnchor: $("#taskLinkAnchor"),
  pickDirBtn: $("#pickDirBtn"),
  pickGameDirBtn: $("#pickGameDirBtn"),
  scanBtn: $("#scanBtn"),
  watchBtn: $("#watchBtn"),
  intervalInput: $("#intervalInput"),
  mapSelect: $("#mapSelect"),
  dirLabel: $("#dirLabel"),
  gameDirLabel: $("#gameDirLabel"),
  status: $("#status"),
  mapStatus: $("#mapStatus"),
  poiCount: $("#poiCount"),
  mapViewport: $("#mapViewport"),
  mapCanvas: $("#mapCanvas"),
  mapImage: $("#mapImage"),
  poiLayer: $("#poiLayer"),
  peerLayer: $("#peerLayer"),
  mapMarker: $("#mapMarker"),
  mapArrow: $("#mapArrow"),
  mapSelfName: $("#mapSelfName"),
  mapNoData: $("#mapNoData"),
  raidInfoBar: $("#raidInfoBar"),
  raidSummary: $("#raidSummary"),
  raidDetails: $("#raidDetails"),
  raidCurrentInfo: $("#raidCurrentInfo"),
  raidTimingInfo: $("#raidTimingInfo"),
  raidEvents: $("#raidEvents"),
  raidToggleBtn: $("#raidToggleBtn"),
  syncPanel: $("#syncPanel"),
  syncModeBtn: $("#syncModeBtn"),
  syncToggleBtn: $("#syncToggleBtn"),
  syncNameInput: $("#syncNameInput"),
  syncColorInput: $("#syncColorInput"),
  syncRemoteGroup: $("#syncRemoteGroup"),
  syncRemoteHostInput: $("#syncRemoteHostInput"),
  syncRemotePortInput: $("#syncRemotePortInput"),
  syncStatus: $("#syncStatus"),
  syncPeerList: $("#syncPeerList"),
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

function createInitialRaidCurrent(previous = {}) {
  return {
    mapId: null,
    mapName: null,
    sessionMode: previous.sessionMode || null,
    raidId: null,
    serverIp: null,
    serverPort: null,
    status: "idle",
    rawStatus: null,
    matchStartAt: null,
    queueCompletedAt: null,
    gameStartAt: null,
    raidEndAt: null,
    queueDurationSec: null,
    loadDurationSec: null,
    isActive: false,
    profileId: previous.profileId || null,
    accountId: previous.accountId || null,
  };
}

function createInitialRaidSummary() {
  return {
    panelState: "not-connected",
    watchText: "未接入日志",
    mapName: "--",
    sessionMode: "--",
    raidStatusText: RAID_STATUS_TEXT.idle,
    lastLogTime: "--",
    currentRows: [],
    timingRows: [],
    events: [],
  };
}

function createInitialRaidState() {
  return {
    gameDirHandle: null,
    logDirHandle: null,
    applicationLogHandle: null,
    notificationsLogHandle: null,
    applicationLogHandles: [],
    notificationsLogHandles: [],
    watchingLogs: false,
    lastLogScanAt: null,
    logOffsets: {},
    logLastModified: {},
    current: createInitialRaidCurrent(),
    events: [],
    summary: createInitialRaidSummary(),
    ui: {
      expanded: false,
      error: "",
      lastUpdatedAt: null,
    },
  };
}

function createInitialLanState() {
  return {
    enabled: false,
    displayName: "本机玩家",
    color: LAN_SYNC_DEFAULT_COLOR,
    remoteHost: "",
    remotePort: "",
    syncMode: "host",
    mode: "off",
    transport: "frp-tcp",
    peers: [],
    backendReady: false,
    lastError: "",
    pollTimer: null,
    lastSentSignature: "",
    lastSentAt: 0,
    lastPublishedAt: 0,
  };
}

const state = {
  screenshotDirHandle: null,
  scanTimer: null,
  watching: false,
  records: [],
  byName: new Map(),
  maps: [],
  mapsById: new Map(),
  selectedMapId: AUTO_MAP_ID,
  lastRaidAutoMapId: "",
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
  raid: createInitialRaidState(),
  lan: createInitialLanState(),
};

const VIEW_SWITCH_ANIM_MS = 260;
let viewSwitchTimer = null;
let currentMainView = "map";
const taskState = {
  traders: [],
  taskByKey: new Map(),
  selectedTaskKey: "",
};

function setStatus(message, isError = false) {
  dom.status.textContent = `状态: ${message}`;
  dom.status.style.color = isError ? "var(--danger)" : "var(--accent)";
}

function setMainView(view, options = {}) {
  const activeView = view === "tasks" ? "tasks" : "map";
  const instant = Boolean(options.instant);
  if (viewSwitchTimer) {
    clearTimeout(viewSwitchTimer);
    viewSwitchTimer = null;
  }

  dom.mapView.hidden = activeView !== "map";
  dom.taskView.hidden = activeView !== "tasks";
  document.body.classList.toggle("task-view-active", activeView === "tasks");
  dom.mapTabBtn.classList.toggle("is-active", activeView === "map");
  dom.taskTabBtn.classList.toggle("is-active", activeView === "tasks");
  dom.mapTabBtn.setAttribute("aria-selected", activeView === "map" ? "true" : "false");
  dom.taskTabBtn.setAttribute("aria-selected", activeView === "tasks" ? "true" : "false");

  const nextView = activeView === "map" ? dom.mapView : dom.taskView;
  const prevView = activeView === "map" ? dom.taskView : dom.mapView;
  prevView.classList.remove("is-switch-enter");
  nextView.classList.remove("is-switch-enter");

  if (!instant && currentMainView !== activeView) {
    // Force reflow so rapid toggles replay the enter animation.
    void nextView.offsetWidth;
    nextView.classList.add("is-switch-enter");
    viewSwitchTimer = window.setTimeout(() => {
      nextView.classList.remove("is-switch-enter");
      viewSwitchTimer = null;
    }, VIEW_SWITCH_ANIM_MS);
  }

  currentMainView = activeView;
}

function normalizeTaskVideoUrl(rawUrl) {
  const text = String(rawUrl || "").trim();
  if (!text) {
    return "";
  }
  if (/^\/\//.test(text)) {
    return `https:${text}`;
  }
  return text;
}

function resolveTaskUrlType(rawUrl) {
  const normalized = normalizeTaskVideoUrl(rawUrl);
  if (!normalized) {
    return "link";
  }
  try {
    const parsed = new URL(normalized);
    const host = parsed.hostname.toLowerCase();
    if (host.includes("player.bilibili.com")) {
      return "video";
    }
  } catch {
    return "link";
  }
  return "link";
}

function parseTaskLine(line) {
  const text = String(line || "").trim();
  if (!text) {
    return null;
  }

  const iframeMatch = text.match(/^(?<name>.*?)\s*<iframe[^>]*\ssrc=["'](?<src>[^"']+)["']/i);
  if (iframeMatch?.groups?.src) {
    const name = String(iframeMatch.groups.name || "").trim() || "未命名任务";
    const url = normalizeTaskVideoUrl(iframeMatch.groups.src);
    return {
      name,
      url,
      type: resolveTaskUrlType(url),
    };
  }

  const linkMatch = text.match(/^(?<name>.+?)\s+(?<url>https?:\/\/\S+)$/i);
  if (linkMatch?.groups?.url) {
    const url = normalizeTaskVideoUrl(linkMatch.groups.url);
    return {
      name: String(linkMatch.groups.name || "").trim(),
      url,
      type: resolveTaskUrlType(url),
    };
  }

  return null;
}

function parseTraderTasks(traderName, rawText) {
  const lines = String(rawText || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const tasks = [];
  for (let index = 0; index < lines.length; index += 1) {
    const parsed = parseTaskLine(lines[index]);
    if (!parsed || !parsed.url) {
      continue;
    }
    tasks.push({
      key: `${traderName}:${index}:${parsed.name}`,
      name: parsed.name,
      url: parsed.url,
      type: parsed.type || "link",
    });
  }
  return tasks;
}

function buildTaskTraders() {
  return Object.entries(TASK_TRADER_RAW_DATA).map(([name, rawText]) => ({
    name,
    tasks: parseTraderTasks(name, rawText),
  }));
}

function rebuildTaskIndex() {
  const map = new Map();
  for (const trader of taskState.traders) {
    for (const task of trader.tasks) {
      map.set(task.key, task);
    }
  }
  taskState.taskByKey = map;
}

function updateTaskActiveButtons() {
  if (!dom.taskTraderList) {
    return;
  }
  const buttons = dom.taskTraderList.querySelectorAll(".task-link-btn");
  for (const btn of buttons) {
    const isActive = btn.dataset.taskKey === taskState.selectedTaskKey;
    btn.classList.toggle("is-active", isActive);
  }
}

function setTaskVideo(url, taskKey = "", taskName = "") {
  if (!dom.taskVideoFrame || !dom.taskVideoWrap || !dom.taskVideoTip || !dom.taskLinkCard || !dom.taskLinkTitle || !dom.taskLinkAnchor) {
    return;
  }
  const normalized = normalizeTaskVideoUrl(url);
  taskState.selectedTaskKey = taskKey;
  if (!normalized) {
    dom.taskVideoWrap.hidden = true;
    dom.taskVideoTip.hidden = true;
    dom.taskLinkCard.hidden = true;
    if (dom.taskVideoFrame.src !== "about:blank") {
      dom.taskVideoFrame.src = "about:blank";
    }
    updateTaskActiveButtons();
    return;
  }
  const resolvedType = resolveTaskUrlType(normalized);

  if (resolvedType === "video") {
    dom.taskVideoWrap.hidden = false;
    dom.taskVideoTip.hidden = false;
    dom.taskLinkCard.hidden = true;
    dom.taskLinkTitle.textContent = "";
    dom.taskLinkAnchor.href = "#";
    dom.taskLinkAnchor.textContent = "";
    if (dom.taskVideoFrame.src !== normalized) {
      dom.taskVideoFrame.src = normalized;
    }
  } else {
    dom.taskVideoWrap.hidden = true;
    dom.taskVideoTip.hidden = true;
    dom.taskLinkCard.hidden = false;
    dom.taskLinkTitle.textContent = taskName || "当前任务链接";
    dom.taskLinkAnchor.href = normalized;
    dom.taskLinkAnchor.textContent = normalized;
    if (dom.taskVideoFrame.src !== "about:blank") {
      dom.taskVideoFrame.src = "about:blank";
    }
  }

  updateTaskActiveButtons();
}

function renderTaskTraderList() {
  if (!dom.taskTraderList) {
    return;
  }

  const slots = [];
  for (let i = 0; i < TASK_TRADER_SLOT_COUNT; i += 1) {
    const trader = taskState.traders[i] || null;
    const traderName = trader?.name || `商人${i + 1}`;
    const taskButtons =
      trader && trader.tasks.length > 0
        ? `<div class="task-trader-content">${trader.tasks
            .map(
              (task) =>
                `<button type="button" class="task-link-btn" data-task-key="${escapeHtml(task.key)}">${escapeHtml(task.name)}</button>`,
            )
            .join("")}</div>`
        : '<div class="task-trader-empty">暂无内容</div>';
    slots.push(`<details class="task-trader-item"${i === 0 ? " open" : ""}><summary>${escapeHtml(traderName)}</summary>${taskButtons}</details>`);
  }

  dom.taskTraderList.innerHTML = slots.join("");
  updateTaskActiveButtons();
}

function initTaskPanel() {
  taskState.traders = buildTaskTraders();
  rebuildTaskIndex();
  renderTaskTraderList();
  const firstTask = taskState.traders.flatMap((trader) => trader.tasks)[0];
  if (firstTask) {
    setTaskVideo(firstTask.url, firstTask.key, firstTask.name);
  }
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function normalize360(angle) {
  return ((angle % 360) + 360) % 360;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function safeText(value, fallback = "--") {
  if (value === null || value === undefined) {
    return fallback;
  }
  const text = String(value).trim();
  return text ? text : fallback;
}

function formatClockTime(value) {
  if (!value) {
    return "--";
  }
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "--";
  }
  return date.toLocaleTimeString("zh-CN", { hour12: false });
}

function formatDuration(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) {
    return "--";
  }
  if (seconds < 60) {
    return `${seconds.toFixed(1)} 秒`;
  }
  const wholeSeconds = Math.round(seconds);
  const minutes = Math.floor(wholeSeconds / 60);
  const remain = wholeSeconds % 60;
  return `${minutes} 分 ${remain} 秒`;
}

function normalizeSyncName(value) {
  const text = String(value ?? "").trim();
  return (text || "本机玩家").slice(0, 24);
}

function normalizeHexColor(value) {
  const text = String(value ?? "").trim();
  return /^#[0-9a-fA-F]{6}$/.test(text) ? text.toLowerCase() : LAN_SYNC_DEFAULT_COLOR;
}

function normalizeSyncHost(value) {
  return String(value ?? "").trim().slice(0, 128);
}

function normalizeSyncPort(value, fallback = LAN_SYNC_DEFAULT_PORT) {
  const numeric = Number.parseInt(String(value ?? ""), 10);
  if (Number.isInteger(numeric) && numeric >= 1 && numeric <= 65535) {
    return numeric;
  }
  return fallback;
}

function normalizeSyncPortOptional(value) {
  const text = String(value ?? "").trim();
  if (!text) {
    return "";
  }
  return normalizeSyncPort(text);
}

function formatSyncPortInputValue(value) {
  const normalized = normalizeSyncPort(value, 0);
  return normalized >= 1 && normalized <= 65535 ? String(normalized) : "";
}

function formatSyncPortStatusText(value) {
  const text = formatSyncPortInputValue(value);
  return text || "--";
}

function normalizeSyncMode(value) {
  return value === "join" ? "join" : "host";
}

function getEffectiveSyncRemotePort() {
  if (state.lan.syncMode === "join") {
    return normalizeSyncPortOptional(state.lan.remotePort);
  }
  return LAN_SYNC_DEFAULT_PORT;
}

function buildLanConfigPayload() {
  const isJoinMode = state.lan.syncMode === "join";
  const remoteHost = isJoinMode ? normalizeSyncHost(state.lan.remoteHost) : "";
  const remotePort = getEffectiveSyncRemotePort();
  const requestedEnabled = Boolean(state.lan.enabled);
  const missingJoinHost = requestedEnabled && isJoinMode && !remoteHost;
  const missingJoinPort = requestedEnabled && isJoinMode && remotePort === "";
  const validationError = missingJoinHost
    ? LAN_SYNC_REMOTE_REQUIRED_MESSAGE
    : missingJoinPort
      ? LAN_SYNC_REMOTE_PORT_REQUIRED_MESSAGE
      : "";
  return {
    validationError,
    payload: {
      enabled: requestedEnabled && !validationError,
      displayName: normalizeSyncName(state.lan.displayName),
      color: normalizeHexColor(state.lan.color),
      remoteHost,
      remotePort: remotePort === "" ? LAN_SYNC_DEFAULT_PORT : remotePort,
    },
  };
}

function hexToRgba(hex, alpha) {
  const color = normalizeHexColor(hex).slice(1);
  const r = parseInt(color.slice(0, 2), 16);
  const g = parseInt(color.slice(2, 4), 16);
  const b = parseInt(color.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function formatRelativeAge(timestampMs) {
  if (!Number.isFinite(timestampMs) || timestampMs <= 0) {
    return "--";
  }
  const diffSec = Math.max(0, Math.round((Date.now() - timestampMs) / 1000));
  if (diffSec < 2) {
    return "刚刚";
  }
  if (diffSec < 60) {
    return `${diffSec} 秒前`;
  }
  const minutes = Math.floor(diffSec / 60);
  const remain = diffSec % 60;
  return remain > 0 ? `${minutes} 分 ${remain} 秒前` : `${minutes} 分前`;
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
  const candidates = state.maps.filter((map) => pointInBounds(latest, map));
  if (candidates.length === 0) {
    return null;
  }
  const recent = state.records.slice(-30);
  const scored = candidates.map((map) => {
    let score = 0;
    for (const record of recent) {
      if (pointInBounds(record, map)) {
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
  if (state.selectedMapId !== AUTO_MAP_ID && state.selectedMapId && state.mapsById.has(state.selectedMapId)) {
    return state.mapsById.get(state.selectedMapId) || null;
  }
  const raidPreferredMapId = resolveRaidPreferredMapId();
  if (raidPreferredMapId) {
    return state.mapsById.get(raidPreferredMapId) || null;
  }
  if (!latest) {
    return state.maps[0] || null;
  }
  return chooseMapByRecentConsistency(latest) || state.maps[0] || null;
}

function getRaidSummaryMapFallback(latest) {
  const raidPreferredMapId = resolveRaidPreferredMapId();
  if (raidPreferredMapId) {
    return state.mapsById.get(raidPreferredMapId) || null;
  }
  if (state.selectedMapId !== AUTO_MAP_ID && state.selectedMapId && state.mapsById.has(state.selectedMapId)) {
    return state.mapsById.get(state.selectedMapId) || null;
  }
  if (!latest) {
    return null;
  }
  return chooseMapByRecentConsistency(latest) || null;
}

function resolveRaidPreferredMapId() {
  const raidMapId = String(state.raid.current.mapId || "").trim();
  if (raidMapId && state.mapsById.has(raidMapId)) {
    return raidMapId;
  }
  const raidMapName = String(state.raid.current.mapName || "").trim();
  if (!raidMapName) {
    return null;
  }
  const targetName = raidMapName.toLowerCase();
  for (const map of state.maps) {
    if (String(map?.name || "").trim().toLowerCase() === targetName) {
      return map.id;
    }
  }
  return null;
}

function maybeAutoSwitchMapByRaid() {
  const preferredMapId = resolveRaidPreferredMapId();
  const raidId = String(state.raid.current.raidId || "").trim();
  if (!preferredMapId || !raidId) {
    return false;
  }
  const switchKey = `${raidId}:${preferredMapId}`;
  if (state.lastRaidAutoMapId === switchKey) {
    return false;
  }
  state.lastRaidAutoMapId = switchKey;
  if (state.selectedMapId === AUTO_MAP_ID && dom.mapSelect) {
    dom.mapSelect.value = AUTO_MAP_ID;
  }
  return true;
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

function inUnitRange(value) {
  return Number.isFinite(value) && value >= 0 && value <= 1;
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
  dom.mapSelfName.style.display = "none";
}

function showPlayerMarker(unitPos, yawDeg) {
  const left = `${(unitPos.u * 100).toFixed(4)}%`;
  const top = `${(unitPos.v * 100).toFixed(4)}%`;
  dom.mapMarker.style.left = left;
  dom.mapMarker.style.top = top;
  dom.mapArrow.style.left = left;
  dom.mapArrow.style.top = top;
  dom.mapArrow.style.transform = `translate(-50%, -50%) rotate(${yawDeg}deg)`;
  dom.mapSelfName.style.left = left;
  dom.mapSelfName.style.top = `calc(${top} + 18px)`;
  dom.mapSelfName.textContent = normalizeSyncName(state.lan.displayName);
  dom.mapMarker.style.display = "block";
  dom.mapArrow.style.display = "block";
  dom.mapSelfName.style.display = "block";
}

function applyLocalMarkerAppearance() {
  const color = normalizeHexColor(state.lan.color);
  dom.mapMarker.style.setProperty("--player-marker-color", color);
  dom.mapMarker.style.setProperty("--player-marker-glow", hexToRgba(color, 0.35));
  dom.mapArrow.style.setProperty("--player-arrow-color", color);
  dom.mapSelfName.style.borderColor = hexToRgba(color, 0.45);
}

function renderPeerLayer(map) {
  dom.peerLayer.innerHTML = "";
  if (!map || !state.lan.enabled || !state.lan.backendReady || !state.lan.peers.length) {
    return;
  }

  const frag = document.createDocumentFragment();
  for (const peer of state.lan.peers) {
    const peerState = peer?.state;
    if (!peerState || peerState.mapId !== map.id) {
      continue;
    }
    if (!Number.isFinite(peerState.x) || !Number.isFinite(peerState.z)) {
      continue;
    }
    const point = projectWorldToUnit({ x: peerState.x, z: peerState.z }, map);
    if (!inUnitRange(point.u) || !inUnitRange(point.v)) {
      continue;
    }

    const color = normalizeHexColor(peer.color);
    const wrap = document.createElement("div");
    wrap.className = "peer-wrap";
    wrap.style.left = `${(point.u * 100).toFixed(4)}%`;
    wrap.style.top = `${(point.v * 100).toFixed(4)}%`;
    wrap.title = `${peer.displayName || "队友"} / ${peerState.mapName || map.name || "未知地图"}`;

    const marker = document.createElement("div");
    marker.className = "peer-marker";
    marker.style.background = color;
    marker.style.boxShadow = `0 0 0 3px ${hexToRgba(color, 0.18)}`;
    wrap.appendChild(marker);

    const arrow = document.createElement("div");
    arrow.className = "peer-arrow";
    arrow.style.color = color;
    arrow.style.transform = `translate(-50%, -50%) rotate(${Number.isFinite(peerState.yawDeg) ? peerState.yawDeg : 0}deg)`;
    wrap.appendChild(arrow);

    const label = document.createElement("div");
    label.className = "peer-name";
    label.textContent = peer.displayName || "队友";
    label.style.borderColor = hexToRgba(color, 0.45);
    wrap.appendChild(label);

    frag.appendChild(wrap);
  }

  dom.peerLayer.appendChild(frag);
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

  for (const extract of map.extracts) {
    const displayName = getExtractDisplayName(extract);
    const icon = getExtractIconName(extract);
    pushPoi(pois, extract?.position, icon, `[撤离点] ${displayName}`, {
      type: "extracts",
      showLabel: true,
      labelText: displayName,
    });
  }

  for (const spawn of map.spawns) {
    const side = Array.isArray(spawn?.sides) && spawn.sides.length > 0 ? spawn.sides.join("/") : "unknown";
    const spawnIcon = getSpawnIconName(spawn);
    const spawnLayerType = getSpawnLayerType(spawn);
    pushPoi(pois, spawn?.position, spawnIcon, `[出生点] ${spawn?.zoneName || "Zone"} (${side})`, {
      type: spawnLayerType,
      small: true,
    });
  }

  for (const lock of map.locks) {
    pushPoi(pois, lock?.position, "lock", `[钥匙门] ${lock?.key?.name || "未命名"}`, {
      type: "locks",
      small: true,
    });
  }

  for (const sw of map.switches) {
    pushPoi(pois, sw?.position, "switch", `[开关] ${sw?.name || "未命名开关"}`, {
      type: "switches",
    });
  }

  for (const hazard of map.hazards) {
    pushPoi(pois, hazard?.position, "hazard", `[危险区] ${hazard?.name || hazard?.hazardType || "危险区"}`, {
      type: "hazards",
      small: true,
    });
  }

  for (const weapon of map.stationaryWeapons) {
    pushPoi(pois, weapon?.position, "stationarygun", `[固定武器] ${weapon?.stationaryWeapon?.name || "武器点位"}`, {
      type: "stationary",
    });
  }

  for (const stop of map.btrStops) {
    pushPoi(pois, stop?.position, "btr_stop", `[BTR] ${stop?.name || "停靠点"}`, {
      type: "btr",
    });
  }

  for (const transit of map.transits) {
    const transitName = getTransitDisplayName(transit);
    pushPoi(pois, transit?.position, "extract_transit", `[转移点] ${transitName}`, {
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
    return null;
  }

  const map = getMapBySelectionOrAuto(latest);
  if (!map) {
    dom.mapStatus.textContent = "地图状态: 无可用地图";
    hidePlayerMarker();
    renderPoiLayer(null);
    setMapImage(null);
    setMapOverlayVisible(true, "无可用地图");
    return null;
  }

  setMapImage(map);
  setMapOverlayVisible(false);
  renderPoiLayer(map);
  const selectValue = state.selectedMapId === AUTO_MAP_ID ? AUTO_MAP_ID : map.id;
  if (dom.mapSelect && dom.mapSelect.value !== selectValue) {
    dom.mapSelect.value = selectValue;
  }

  if (!latest) {
    hidePlayerMarker();
    return map;
  }

  const p = projectWorldToUnit({ x: latest.x, z: latest.z }, map);
  if (!inUnitRange(p.u) || !inUnitRange(p.v)) {
    hidePlayerMarker();
    return map;
  }
  showPlayerMarker(p, latest.yawDeg);
  return map;
}

function updateDirLabelsLegacy() {
  dom.dirLabel.textContent = state.screenshotDirHandle
    ? `截图目录: ${state.screenshotDirHandle.name || "已选择"}`
    : "截图目录: 未选择";
  dom.gameDirLabel.textContent = state.raid.gameDirHandle
    ? `游戏目录: ${state.raid.gameDirHandle.name || "已选择"}`
    : "游戏目录: 未选择";
}

function updateDirLabels() {
  dom.dirLabel.textContent = state.screenshotDirHandle
    ? state.screenshotDirHandle.name || "已选择"
    : "未选择";
  dom.gameDirLabel.textContent = state.raid.gameDirHandle
    ? state.raid.gameDirHandle.name || "已选择"
    : "未选择";
}

function renderDetailRows(container, rows) {
  container.innerHTML = rows
    .map(
      (row) => `
        <div class="raid-detail-row">
          <span class="raid-detail-label">${escapeHtml(row.label)}</span>
          <span class="raid-detail-value">${escapeHtml(row.value)}</span>
        </div>
      `,
    )
    .join("");
}

function renderRaidEvents(events) {
  if (!events.length) {
    dom.raidEvents.innerHTML = '<div class="raid-empty">暂无战局事件</div>';
    return;
  }
  dom.raidEvents.innerHTML = events
    .map(
      (event) => `
        <article class="raid-event">
          <div class="raid-event-head">
            <span class="raid-event-title">${escapeHtml(event.title)}</span>
            <span class="raid-event-time">${escapeHtml(event.time)}</span>
          </div>
          <div class="raid-event-detail">${escapeHtml(event.detail)}</div>
        </article>
      `,
    )
    .join("");
}

function renderRaidInfo(summaryState) {
  const summary = summaryState || createInitialRaidSummary();
  state.raid.summary = summary;
  dom.raidInfoBar.className = `raid-info-bar panel panel-inner status-${summary.panelState}`;
  dom.raidSummary.innerHTML = `
    <span class="raid-pill raid-pill-status">
      <span class="raid-pill-label">监听</span>
      <span class="raid-pill-value">${escapeHtml(summary.watchText)}</span>
    </span>
    <span class="raid-pill">
      <span class="raid-pill-label">当前地图</span>
      <span class="raid-pill-value">${escapeHtml(summary.mapName)}</span>
    </span>
    <span class="raid-pill">
      <span class="raid-pill-label">模式</span>
      <span class="raid-pill-value">${escapeHtml(summary.sessionMode)}</span>
    </span>
    <span class="raid-pill">
      <span class="raid-pill-label">战局状态</span>
      <span class="raid-pill-value">${escapeHtml(summary.raidStatusText)}</span>
    </span>
    <span class="raid-pill">
      <span class="raid-pill-label">最近日志</span>
      <span class="raid-pill-value">${escapeHtml(summary.lastLogTime)}</span>
    </span>
  `;

  const expanded = Boolean(state.raid.ui.expanded);
  dom.raidToggleBtn.textContent = expanded ? "收起详情" : "展开详情";
  dom.raidToggleBtn.setAttribute("aria-expanded", expanded ? "true" : "false");
  dom.raidDetails.hidden = !expanded;
  renderDetailRows(dom.raidCurrentInfo, summary.currentRows);
  renderDetailRows(dom.raidTimingInfo, summary.timingRows);
  renderRaidEvents(summary.events);
}

function getSummaryPanelState() {
  if (state.raid.ui.error) {
    return "error";
  }
  if (state.raid.current.status === "in_raid") {
    return "active";
  }
  if (state.raid.current.status === "extracting_or_over" || state.raid.current.status === "aborted") {
    return "ended";
  }
  if (state.raid.gameDirHandle) {
    return "listening";
  }
  return "not-connected";
}

function buildRaidSummary(latest, summaryMap) {
  const current = state.raid.current;
  const events = state.raid.events.slice(0, MAX_VISIBLE_RAID_EVENTS).map((event) => ({
    title: event.title,
    detail: event.detail || "已记录",
    time: formatClockTime(event.timestamp),
  }));
  const displayMapName = current.mapName || summaryMap?.name || "--";
  let watchText = "未接入日志";
  if (state.raid.ui.error) {
    watchText = "日志异常";
  } else if (state.raid.gameDirHandle && state.raid.watchingLogs) {
    watchText = "日志监听中";
  } else if (state.raid.gameDirHandle) {
    watchText = "日志待监听";
  } else if (latest) {
    watchText = "仅截图定位";
  }

  return {
    panelState: getSummaryPanelState(),
    watchText,
    mapName: displayMapName,
    sessionMode: safeText(current.sessionMode, "--"),
    raidStatusText: current.status === "error" ? "异常" : RAID_STATUS_TEXT[current.status] || "待战局",
    lastLogTime: formatClockTime(state.raid.lastLogScanAt || state.raid.ui.lastUpdatedAt),
    currentRows: [
      { label: "当前地图", value: displayMapName },
      { label: "会话模式", value: safeText(current.sessionMode, "未识别") },
      { label: "Raid ID", value: safeText(current.raidId) },
      { label: "服务器", value: current.serverIp ? `${current.serverIp}${current.serverPort ? `:${current.serverPort}` : ""}` : "--" },
      { label: "状态", value: RAID_STATUS_TEXT[current.status] || "待战局" },
    ],
    timingRows: [
      { label: "最近日志", value: formatClockTime(state.raid.lastLogScanAt || state.raid.ui.lastUpdatedAt) },
      { label: "排队耗时", value: formatDuration(current.queueDurationSec) },
      { label: "加载耗时", value: formatDuration(current.loadDurationSec) },
      { label: "进入战局", value: formatClockTime(current.gameStartAt) },
      { label: "结束时间", value: formatClockTime(current.raidEndAt) },
    ],
    events,
  };
}

function reflectLanConfigInputs() {
  if (document.activeElement !== dom.syncNameInput) {
    dom.syncNameInput.value = state.lan.displayName;
  }
  if (document.activeElement !== dom.syncColorInput) {
    dom.syncColorInput.value = normalizeHexColor(state.lan.color);
  }
  if (document.activeElement !== dom.syncRemoteHostInput) {
    dom.syncRemoteHostInput.value = state.lan.remoteHost;
  }
  if (document.activeElement !== dom.syncRemotePortInput) {
    dom.syncRemotePortInput.value = state.lan.syncMode === "join" ? formatSyncPortInputValue(state.lan.remotePort) : "";
  }
}

function loadLanSyncConfig() {
  try {
    const raw = localStorage.getItem(LAN_SYNC_STORAGE_KEY);
    if (!raw) {
      return;
    }
    const parsed = JSON.parse(raw);
    state.lan.enabled = Boolean(parsed?.enabled);
    state.lan.displayName = normalizeSyncName(parsed?.displayName);
    state.lan.color = normalizeHexColor(parsed?.color);
    state.lan.remoteHost = normalizeSyncHost(parsed?.remoteHost);
    state.lan.remotePort = normalizeSyncPortOptional(parsed?.remotePort);
    state.lan.syncMode = normalizeSyncMode(parsed?.syncMode ?? (state.lan.remoteHost ? "join" : "host"));
    // Migrate legacy default-port values to blank input in join mode.
    if (
      state.lan.syncMode === "join" &&
      Number.parseInt(String(parsed?.remotePort ?? ""), 10) === LAN_SYNC_DEFAULT_PORT
    ) {
      state.lan.remotePort = "";
    }
    if (state.lan.syncMode !== "join" && !state.lan.remoteHost) {
      state.lan.remotePort = "";
    }
  } catch {
    state.lan.enabled = false;
    state.lan.displayName = "本机玩家";
    state.lan.color = LAN_SYNC_DEFAULT_COLOR;
    state.lan.remoteHost = "";
    state.lan.remotePort = "";
    state.lan.syncMode = "host";
  }
}

function persistLanSyncConfig() {
  const payload = {
    enabled: Boolean(state.lan.enabled),
    displayName: normalizeSyncName(state.lan.displayName),
    color: normalizeHexColor(state.lan.color),
    remoteHost: normalizeSyncHost(state.lan.remoteHost),
    remotePort: normalizeSyncPortOptional(state.lan.remotePort),
    syncMode: normalizeSyncMode(state.lan.syncMode),
  };
  localStorage.setItem(LAN_SYNC_STORAGE_KEY, JSON.stringify(payload));
}

async function apiJson(path, init = {}) {
  const response = await fetch(path, {
    cache: "no-store",
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
  });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  return response.json();
}

function applyLanBackendSnapshot(snapshot) {
  const localValidationError =
    state.lan.lastError === LAN_SYNC_REMOTE_REQUIRED_MESSAGE || state.lan.lastError === LAN_SYNC_REMOTE_PORT_REQUIRED_MESSAGE
      ? state.lan.lastError
      : "";
  state.lan.backendReady = true;
  state.lan.lastError = String(snapshot?.lastError || "");
  state.lan.enabled = Boolean(snapshot?.enabled);
  state.lan.mode = ["off", "host", "join"].includes(snapshot?.mode) ? snapshot.mode : state.lan.mode;
  state.lan.displayName = normalizeSyncName(snapshot?.displayName ?? state.lan.displayName);
  state.lan.color = normalizeHexColor(snapshot?.color ?? state.lan.color);
  const snapshotHost = normalizeSyncHost(snapshot?.remoteHost);
  if (snapshotHost) {
    state.lan.remoteHost = snapshotHost;
  }
  state.lan.transport = safeText(snapshot?.transport, state.lan.transport);
  state.lan.peers = Array.isArray(snapshot?.peers) ? snapshot.peers : [];
  if (
    !state.lan.lastError &&
    localValidationError &&
    state.lan.syncMode === "join" &&
    !state.lan.enabled &&
    (!normalizeSyncHost(state.lan.remoteHost) || normalizeSyncPortOptional(state.lan.remotePort) === "")
  ) {
    state.lan.lastError = localValidationError;
  }
  reflectLanConfigInputs();
  applyLocalMarkerAppearance();
}

async function syncLanConfigToBackend() {
  const { payload, validationError } = buildLanConfigPayload();
  const snapshot = await apiJson("/api/lan-sync/config", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  applyLanBackendSnapshot(snapshot);
  if (validationError) {
    state.lan.lastError = validationError;
    persistLanSyncConfig();
  }
}

async function fetchLanSyncState() {
  try {
    const snapshot = await apiJson("/api/lan-sync/state");
    applyLanBackendSnapshot(snapshot);
  } catch (error) {
    state.lan.backendReady = false;
    state.lan.peers = [];
    state.lan.lastError = error.message || "联机后端不可用";
  }
  refreshUi();
}

function startLanSyncPolling() {
  if (state.lan.pollTimer) {
    clearInterval(state.lan.pollTimer);
  }
  state.lan.pollTimer = window.setInterval(() => {
    fetchLanSyncState().catch(() => {});
  }, LAN_SYNC_POLL_MS);
}

function getLatestCoordinateRecord() {
  return state.records[state.records.length - 1] || null;
}

function buildLocalLanPayload(latest, activeMap) {
  if (!latest) {
    return {
      mapId: null,
      mapName: null,
      x: null,
      y: null,
      z: null,
      yawDeg: null,
      raidStatus: state.raid.current.status || null,
      updatedAt: Date.now(),
    };
  }
  return {
    mapId: latest.mapId || activeMap?.id || null,
    mapName: latest.mapName || activeMap?.name || null,
    x: latest.x,
    y: latest.y,
    z: latest.z,
    yawDeg: latest.yawDeg,
    raidStatus: state.raid.current.status || null,
    updatedAt: Date.now(),
  };
}

async function publishLanState(latest, activeMap) {
  if (!state.lan.enabled || !state.lan.backendReady) {
    return;
  }
  const payload = buildLocalLanPayload(latest, activeMap);
  const signature = JSON.stringify(payload);
  const now = Date.now();
  if (signature === state.lan.lastSentSignature && now - state.lan.lastSentAt < LAN_SYNC_MIN_PUBLISH_MS) {
    return;
  }
  state.lan.lastSentSignature = signature;
  state.lan.lastSentAt = now;
  try {
    const snapshot = await apiJson("/api/lan-sync/update", {
      method: "POST",
      body: signature,
    });
    state.lan.lastPublishedAt = now;
    if (snapshot?.localState) {
      applyLanBackendSnapshot(snapshot);
    }
  } catch (error) {
    state.lan.backendReady = false;
    state.lan.lastError = error.message || "同步位置失败";
  }
}

function renderLanSyncPanelLegacy() {
  reflectLanConfigInputs();
  dom.syncToggleBtn.textContent = state.lan.enabled ? "关闭同步" : "开启同步";
  const modeText =
    state.lan.mode === "join"
      ? `连接模式（${safeText(state.lan.remoteHost, "--")}:${formatSyncPortStatusText(state.lan.remotePort)}）`
      : "房主模式（等待队友连接）";

  if (state.lan.lastError) {
    dom.syncStatus.textContent = `同步状态: ${modeText} / ${state.lan.lastError}`;
    dom.syncStatus.style.color = "var(--danger)";
  } else if (!state.lan.enabled) {
    dom.syncStatus.textContent = "同步状态: 未开启";
    dom.syncStatus.style.color = "var(--muted)";
  } else if (!state.lan.backendReady) {
    dom.syncStatus.textContent = "同步状态: 本机同步服务不可用";
    dom.syncStatus.style.color = "var(--danger)";
  } else if (!state.lan.peers.length) {
    dom.syncStatus.textContent = `同步状态: ${modeText} / 暂无在线队友`;
    dom.syncStatus.style.color = "var(--warn)";
  } else {
    dom.syncStatus.textContent = `同步状态: ${modeText} / 已连接 ${state.lan.peers.length} 名队友`;
    dom.syncStatus.style.color = "var(--accent)";
  }

  if (!state.lan.enabled) {
    dom.syncPeerList.innerHTML = '<div class="sync-empty">开启同步后，会在这里显示已连接的队友。</div>';
    return;
  }
  if (!state.lan.peers.length) {
    dom.syncPeerList.innerHTML = '<div class="sync-empty">暂无队友在线</div>';
    return;
  }

  dom.syncPeerList.innerHTML = state.lan.peers
    .map((peer) => {
      const peerState = peer?.state || {};
      const mapText = safeText(peerState.mapName, "暂无坐标");
      const raidText = safeText(RAID_STATUS_TEXT[peerState.raidStatus] || peerState.raidStatus, "未知状态");
      return `
        <article class="sync-peer-row">
          <div class="sync-peer-main">
            <span class="sync-peer-swatch" style="background:${escapeHtml(normalizeHexColor(peer.color))}"></span>
            <div class="sync-peer-name-block">
              <span class="sync-peer-name">${escapeHtml(peer.displayName || "队友")}</span>
              <span class="sync-peer-meta">${escapeHtml(mapText)} / ${escapeHtml(raidText)} / ${escapeHtml(peer.host || "--")}</span>
            </div>
          </div>
          <div class="sync-peer-side">
            最后更新: ${escapeHtml(formatRelativeAge(peer.lastSeenAt))}
          </div>
        </article>
      `;
    })
    .join("");
}

function renderLanSyncPanel() {
  reflectLanConfigInputs();
  const isJoinMode = state.lan.syncMode === "join";
  dom.syncPanel.dataset.syncMode = isJoinMode ? "join" : "host";
  dom.syncModeBtn.textContent = isJoinMode ? "切换到房主模式" : "切换到连接模式";
  dom.syncModeBtn.setAttribute("aria-pressed", isJoinMode ? "true" : "false");
  if (dom.syncRemoteGroup) {
    dom.syncRemoteGroup.hidden = !isJoinMode;
  }
  dom.syncToggleBtn.textContent = state.lan.enabled ? "关闭同步" : "开启同步";
  const modeText = isJoinMode
    ? `连接模式（${safeText(state.lan.remoteHost, "--")}:${formatSyncPortStatusText(state.lan.remotePort)}）`
    : "房主模式（等待队友连接）";

  if (state.lan.lastError) {
    dom.syncStatus.textContent = `同步状态: ${modeText} / ${state.lan.lastError}`;
    dom.syncStatus.style.color = "var(--danger)";
  } else if (!state.lan.enabled) {
    dom.syncStatus.textContent = "同步状态: 未开启";
    dom.syncStatus.style.color = "var(--muted)";
  } else if (!state.lan.backendReady) {
    dom.syncStatus.textContent = "同步状态: 本机同步服务不可用";
    dom.syncStatus.style.color = "var(--danger)";
  } else if (!state.lan.peers.length) {
    dom.syncStatus.textContent = `同步状态: ${modeText} / 暂无在线队友`;
    dom.syncStatus.style.color = "var(--warn)";
  } else {
    dom.syncStatus.textContent = `同步状态: ${modeText} / 已连接 ${state.lan.peers.length} 名队友`;
    dom.syncStatus.style.color = "var(--accent)";
  }

  if (!state.lan.enabled) {
    dom.syncPeerList.innerHTML = '<div class="sync-empty">开启同步后，会在这里显示已连接的队友。</div>';
    return;
  }
  if (!state.lan.peers.length) {
    dom.syncPeerList.innerHTML = '<div class="sync-empty">暂无队友在线</div>';
    return;
  }

  dom.syncPeerList.innerHTML = state.lan.peers
    .map((peer) => {
      const peerState = peer?.state || {};
      const mapText = safeText(peerState.mapName, "暂无坐标");
      const raidText = safeText(RAID_STATUS_TEXT[peerState.raidStatus] || peerState.raidStatus, "未知状态");
      return `
        <article class="sync-peer-row">
          <div class="sync-peer-main">
            <span class="sync-peer-swatch" style="background:${escapeHtml(normalizeHexColor(peer.color))}"></span>
            <div class="sync-peer-name-block">
              <span class="sync-peer-name">${escapeHtml(peer.displayName || "队友")}</span>
              <span class="sync-peer-meta">${escapeHtml(mapText)} / ${escapeHtml(raidText)} / ${escapeHtml(peer.host || "--")}</span>
            </div>
          </div>
          <div class="sync-peer-side">
            最后更新: ${escapeHtml(formatRelativeAge(peer.lastSeenAt))}
          </div>
        </article>
      `;
    })
    .join("");
}

function refreshUi() {
  const latest = getLatestCoordinateRecord();
  updateDirLabels();
  const activeMap = updateMapPanel(latest);
  renderRaidInfo(buildRaidSummary(latest, getRaidSummaryMapFallback(latest)));
  renderLanSyncPanel();
  renderPeerLayer(activeMap);
  publishLanState(latest, activeMap).catch(() => {});
}

function populateMapSelect() {
  dom.mapSelect.innerHTML = "";

  const autoOption = document.createElement("option");
  autoOption.value = AUTO_MAP_ID;
  autoOption.textContent = "自动选择";
  dom.mapSelect.appendChild(autoOption);

  for (const map of state.maps) {
    const option = document.createElement("option");
    option.value = map.id;
    option.textContent = map.name;
    dom.mapSelect.appendChild(option);
  }
  const currentValue =
    state.selectedMapId === AUTO_MAP_ID || state.mapsById.has(state.selectedMapId)
      ? state.selectedMapId
      : AUTO_MAP_ID;
  state.selectedMapId = currentValue;
  dom.mapSelect.value = currentValue;
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
    state.mapsById = new Map(maps.map((map) => [map.id, map]));
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

async function saveHandle(key, handle) {
  const db = await openDb();
  await new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).put(handle, key);
    tx.oncomplete = resolve;
    tx.onerror = () => reject(tx.error);
  });
}

async function loadHandle(key) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const req = tx.objectStore(STORE_NAME).get(key);
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

async function readFileText(handle) {
  const file = await handle.getFile();
  return file.text();
}

function resetRaidLogOffsets() {
  state.raid.logOffsets = {};
  state.raid.logLastModified = {};
}

function resetRaidDerivedState() {
  state.raid.current = createInitialRaidCurrent();
  state.raid.events = [];
  state.raid.lastLogScanAt = null;
  state.raid.ui.lastUpdatedAt = null;
  state.lastRaidAutoMapId = "";
}

function setRaidUiError(message = "") {
  state.raid.ui.error = message;
}

function parseLogDirectoryStamp(name) {
  const match = name.match(LOG_DIRECTORY_RE);
  if (!match?.groups?.stamp) {
    return null;
  }
  const [datePart, timePart] = match.groups.stamp.split("_");
  if (!datePart || !timePart) {
    return null;
  }
  const [hour = "", minute = "", second = ""] = timePart.split("-");
  const normalizedStamp = `${datePart.replaceAll(".", "-")}T${hour.padStart(2, "0")}:${minute}:${second}`;
  const time = new Date(normalizedStamp);
  return Number.isNaN(time.getTime()) ? null : time.getTime();
}

async function resolveGameRootPath(gameDirHandle) {
  if (gameDirHandle?.kind === "directory" && gameDirHandle.name === "Logs") {
    return gameDirHandle;
  }
  const entries = gameDirHandle.entries();
  for await (const [, handle] of entries) {
    if (handle.kind === "directory" && handle.name === "Logs") {
      return gameDirHandle.getDirectoryHandle(handle.name);
    }
  }
  return null;
}

async function resolveLatestLogPath(logsRootHandle) {
  const entries = logsRootHandle.entries();
  let latestHandle = null;
  let latestTime = -1;
  for await (const [, handle] of entries) {
    if (handle.kind !== "directory") {
      continue;
    }
    const stamp = parseLogDirectoryStamp(handle.name);
    if (stamp !== null && stamp > latestTime) {
      latestTime = stamp;
      latestHandle = logsRootHandle.getDirectoryHandle(handle.name);
    }
  }
  return latestHandle;
}

async function resolveLogFile(logDirHandle, namePart) {
  const files = await resolveLogFiles(logDirHandle, namePart);
  return files[0] || null;
}

async function resolveLogFiles(logDirHandle, namePart) {
  const entries = logDirHandle.entries();
  const files = [];
  for await (const [, handle] of entries) {
    if (handle.kind === "file" && handle.name.includes(namePart)) {
      files.push(handle);
    }
  }
  files.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: "base" }));
  return files;
}

async function checkGameDirectory(handle) {
  const logsRoot = await resolveGameRootPath(handle);
  if (!logsRoot) {
    return false;
  }
  const latestLogDir = await resolveLatestLogPath(logsRoot);
  return Boolean(latestLogDir);
}

async function scanScreenshots() {
  if (!state.screenshotDirHandle) {
    return 0;
  }

  const found = [];
  let skippedNoCoordinate = 0;
  for await (const [name, handle] of state.screenshotDirHandle.entries()) {
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
    state.byName = new Map(state.records.map((record) => [record.name, record]));
  }

  if (added > 0) {
    setStatus(`截图扫描完成: 识别 ${found.length} 张, 新增 ${added} 张, 忽略无坐标 ${skippedNoCoordinate} 张`);
  }
  return added;
}

function parseLogEntry(text) {
  const match = text.match(
    /^(?<date>\d{4}-\d{2}-\d{2}) (?<time>\d{2}:\d{2}:\d{2}\.\d{3})(?<tzoffset> ?[+-]\d{2}:\d{2})?\|(?<message>.+?)$/m,
  );
  if (!match?.groups) {
    return null;
  }
  const tail = text
    .split("\n")
    .slice(1)
    .join("\n")
    .trim();
  return {
    date: match.groups.date,
    time: match.groups.time,
    timeOffset: match.groups.tzoffset?.trim() || "",
    message: match.groups.message.trim(),
    json: tail || "",
    fullText: text,
  };
}

function parseLogLines(lines) {
  const entries = [];
  let current = "";
  for (const line of lines) {
    if (LOG_ENTRY_START_RE.test(line)) {
      if (current) {
        const parsed = parseLogEntry(current.trim());
        if (parsed) {
          entries.push(parsed);
        }
      }
      current = line;
    } else if (current) {
      current += `\n${line}`;
    }
  }
  if (current) {
    const parsed = parseLogEntry(current.trim());
    if (parsed) {
      entries.push(parsed);
    }
  }
  return entries;
}

function parseEntryTimestamp(entry) {
  const raw = entry.timeOffset
    ? `${entry.date}T${entry.time}${entry.timeOffset}`
    : `${entry.date}T${entry.time}`;
  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? Date.now() : date.getTime();
}

function parseProfileLine(message) {
  const match = message.match(
    /(?:SelectProfile|PrepareSelectedProfileLocally|CompleteSelectedProfile) ProfileId:(.+?) AccountId:(.+)/i,
  );
  if (!match || !match[1] || !match[2]) {
    return null;
  }
  return {
    profileId: match[1].trim(),
    accountId: match[2].trim(),
  };
}

function parseSessionMode(message) {
  const match = message.match(/Session mode: (?<mode>\w+)/i);
  const mode = match?.groups?.mode?.toUpperCase();
  if (!mode) {
    return null;
  }
  if (mode === "PVE") {
    return "PVE";
  }
  if (mode === "REGULAR") {
    return "Regular";
  }
  return mode;
}

function getMapInfoFromPreset(preset) {
  if (!preset) {
    return { mapId: null, mapName: null };
  }
  if (state.mapsById.has(preset)) {
    return {
      mapId: preset,
      mapName: state.mapsById.get(preset).name,
    };
  }
  const mapId = MAP_PRESET_TO_ID[preset] || null;
  if (mapId && state.mapsById.has(mapId)) {
    return {
      mapId,
      mapName: state.mapsById.get(mapId).name,
    };
  }
  return {
    mapId,
    mapName: preset,
  };
}

function parseRaidLine(message) {
  const match = message.match(
    /'Profileid: (.+?), Status: (.+?), RaidMode: (.+?), Ip: (.+?), Port: (.+?), Location: (.+?), Sid: (.+?), GameMode: (.+?), shortId: (.+?)'/i,
  );
  if (!match || match.length < 10) {
    return null;
  }
  const { mapId, mapName } = getMapInfoFromPreset(match[6]);
  return {
    profileId: match[1],
    rawStatus: match[2],
    raidMode: match[3],
    serverIp: match[4],
    serverPort: match[5],
    location: match[6],
    sid: match[7],
    gameMode: match[8],
    raidId: match[9],
    mapId,
    mapName,
  };
}

function parseMapLoading(message) {
  const match = message.match(/scene preset path:maps\/(?<mapBundleName>[a-zA-Z0-9_]+)\.bundle/i);
  const preset = match?.groups?.mapBundleName;
  if (!preset) {
    return null;
  }
  const { mapId, mapName } = getMapInfoFromPreset(preset);
  return {
    mapPreset: preset,
    mapId,
    mapName,
  };
}

function parseLocationLoaded(message) {
  const match = message.match(/LocationLoaded:[0-9.,]+ real:(?<loadTime>[0-9.,]+)/i);
  const raw = match?.groups?.loadTime;
  if (!raw) {
    return null;
  }
  const value = Number.parseFloat(raw.replace(",", "."));
  return Number.isFinite(value) ? { loadTime: value } : null;
}

function parseMatchingCompleted(message) {
  const match = message.match(/MatchingCompleted:[0-9.,]+ real:(?<queueTime>[0-9.,]+)/i);
  const raw = match?.groups?.queueTime;
  if (!raw) {
    return null;
  }
  const value = Number.parseFloat(raw.replace(",", "."));
  return Number.isFinite(value) ? { queueTime: value } : null;
}

function parseNetworkGameCreate(message) {
  if (!message.includes("application|TRACE-NetworkGameCreate profileStatus")) {
    return null;
  }
  const mapMatch = message.match(/Location: (?<map>[^,]+)/);
  const raidIdMatch = message.match(/shortId: (?<raidId>[A-Z0-9]{6})/);
  const preset = mapMatch?.groups?.map;
  if (!preset || !raidIdMatch?.groups?.raidId) {
    return null;
  }
  const { mapId, mapName } = getMapInfoFromPreset(preset);
  return {
    mapId,
    mapName,
    location: preset,
    raidId: raidIdMatch.groups.raidId,
    online: message.includes("RaidMode: Online"),
  };
}

function parseGameStarting(message) {
  return /application\|GameStarting/i.test(message);
}

function parseGameStarted(message) {
  return /application\|GameStarted/i.test(message);
}

function parseMatchingAborted(message) {
  return (
    /application\|Network game matching aborted/i.test(message) ||
    /application\|Network game matching cancelled/i.test(message)
  );
}

function parseUserMatchOver(entry) {
  if (!entry.message.includes("Got notification | UserMatchOver") || !entry.json) {
    return null;
  }
  try {
    const payload = JSON.parse(entry.json);
    const { mapId, mapName } = getMapInfoFromPreset(payload?.location);
    return {
      location: payload?.location || null,
      raidId: payload?.shortId || null,
      mapId,
      mapName,
    };
  } catch {
    return null;
  }
}

function parseTaskStatus(entry) {
  if (!entry.message.includes("Got notification | ChatMessageReceived") || !entry.json) {
    return null;
  }
  try {
    const payload = JSON.parse(entry.json);
    const type = payload?.message?.type;
    const templateId = payload?.message?.templateId;
    if (typeof templateId !== "string") {
      return null;
    }
    const taskId = templateId.trim().split(/\s+/)[0] || null;
    if (type === TASK_MESSAGE_TYPES.started) {
      return { status: "Started", taskId };
    }
    if (type === TASK_MESSAGE_TYPES.failed) {
      return { status: "Failed", taskId };
    }
    if (type === TASK_MESSAGE_TYPES.finished) {
      return { status: "Finished", taskId };
    }
    return null;
  } catch {
    return null;
  }
}

function parseFleaMarketInfo(payload) {
  const message = payload?.message || {};
  const items = message?.items?.data || [];
  const systemData = message?.systemData || {};
  const currencyMap = {
    "5449016a4bdc2d6f028b456f": "卢布",
    "5696686a4bdc2da3298b456a": "美元",
    "569668774bdc2da2298b4568": "欧元",
  };
  const receivedItems = items.map((item) => {
    const currency = currencyMap[item?._tpl] || "未知货币";
    const count = item?.upd?.StackObjectsCount || 0;
    return `${count}${currency}`;
  });
  return {
    itemCount: systemData.itemCount || 0,
    buyerNickname: systemData.buyerNickname || "未知玩家",
    receivedItems,
  };
}

function parseFleaMarketExpired(payload) {
  const first = payload?.message?.items?.data?.[0];
  return {
    expiredItem: first?._tpl || null,
  };
}

function parseFleaMarketMessage(entry) {
  if (!entry.message.includes("Got notification | ChatMessageReceived") || !entry.json) {
    return null;
  }
  try {
    const payload = JSON.parse(entry.json);
    if (payload?.message?.type !== 4) {
      return null;
    }
    const templateId = payload?.message?.templateId;
    if (templateId === FLEA_MARKET_SOLD_TEMPLATE) {
      return {
        type: "sold",
        data: parseFleaMarketInfo(payload),
      };
    }
    if (templateId === FLEA_MARKET_EXPIRED_TEMPLATE) {
      return {
        type: "expired",
        data: parseFleaMarketExpired(payload),
      };
    }
    return null;
  } catch {
    return null;
  }
}

function createRaidEvent(type, title, detail, timestamp, payload = {}) {
  return {
    id: `${type}:${timestamp}:${detail}`,
    type,
    title,
    detail,
    timestamp,
    payload,
  };
}

function extractRaidEvent(entry) {
  const timestamp = parseEntryTimestamp(entry);
  const sessionMode = parseSessionMode(entry.message);
  if (sessionMode) {
    return createRaidEvent("session_mode", "会话模式", sessionMode, timestamp, { mode: sessionMode });
  }

  const profile = parseProfileLine(entry.message);
  if (profile) {
    return createRaidEvent("profile_selected", "角色已选择", profile.profileId, timestamp, profile);
  }

  const raidLine = parseRaidLine(entry.message);
  if (raidLine) {
    return createRaidEvent(
      "raid_created",
      "战局已创建",
      `${safeText(raidLine.mapName)} / ${safeText(raidLine.serverIp, "未知服务器")}`,
      timestamp,
      raidLine,
    );
  }

  const networkGame = parseNetworkGameCreate(entry.message);
  if (networkGame) {
    return createRaidEvent(
      "network_game_create",
      "网络战局已创建",
      `${safeText(networkGame.mapName)} / Raid ${networkGame.raidId}`,
      timestamp,
      networkGame,
    );
  }

  const queue = parseMatchingCompleted(entry.message);
  if (queue) {
    return createRaidEvent(
      "matching_completed",
      "匹配完成",
      `排队耗时 ${formatDuration(queue.queueTime)}`,
      timestamp,
      queue,
    );
  }

  const mapLoading = parseMapLoading(entry.message);
  if (mapLoading) {
    return createRaidEvent(
      "map_loading",
      "开始载入地图",
      safeText(mapLoading.mapName),
      timestamp,
      mapLoading,
    );
  }

  if (parseGameStarting(entry.message)) {
    return createRaidEvent("game_starting", "进入战局中", "客户端正在切换到战局", timestamp);
  }

  const locationLoaded = parseLocationLoaded(entry.message);
  if (locationLoaded) {
    return createRaidEvent(
      "location_loaded",
      "地图载入完成",
      `加载耗时 ${formatDuration(locationLoaded.loadTime)}`,
      timestamp,
      locationLoaded,
    );
  }

  if (parseGameStarted(entry.message)) {
    return createRaidEvent("game_started", "已进入战局", "战局开始", timestamp);
  }

  if (parseMatchingAborted(entry.message)) {
    return createRaidEvent("matching_aborted", "匹配已取消", "本次匹配已中断", timestamp);
  }

  const matchOver = parseUserMatchOver(entry);
  if (matchOver) {
    return createRaidEvent(
      "user_match_over",
      "战局结束",
      matchOver.raidId ? `Raid ${matchOver.raidId}` : "收到战局结束通知",
      timestamp,
      matchOver,
    );
  }

  const taskStatus = parseTaskStatus(entry);
  if (taskStatus) {
    const titleMap = {
      Started: "任务开始",
      Failed: "任务失败",
      Finished: "任务完成",
    };
    return createRaidEvent(
      "task_status",
      titleMap[taskStatus.status] || "任务状态更新",
      safeText(taskStatus.taskId, "未知任务"),
      timestamp,
      taskStatus,
    );
  }

  const fleaMarket = parseFleaMarketMessage(entry);
  if (fleaMarket) {
    if (fleaMarket.type === "sold") {
      return createRaidEvent(
        "flea_market",
        "跳蚤售出",
        `${safeText(fleaMarket.data.buyerNickname)} 购买，收入 ${safeText(
          fleaMarket.data.receivedItems.join("、"),
          "--",
        )}`,
        timestamp,
        fleaMarket,
      );
    }
    return createRaidEvent("flea_market", "跳蚤过期", "报价已过期", timestamp, fleaMarket);
  }

  return null;
}

function createFreshRaidCurrent(previous) {
  const next = createInitialRaidCurrent(previous);
  next.sessionMode = previous.sessionMode || null;
  next.profileId = previous.profileId || null;
  next.accountId = previous.accountId || null;
  if (previous.status === "matching" || previous.status === "loading") {
    next.matchStartAt = previous.matchStartAt || null;
    next.queueCompletedAt = previous.queueCompletedAt || null;
    next.queueDurationSec = previous.queueDurationSec ?? null;
    next.loadDurationSec = previous.loadDurationSec ?? null;
  }
  return next;
}

function ensureMatchStart(current, timestamp) {
  if (!current.matchStartAt) {
    current.matchStartAt = timestamp;
  }
}

function reduceRaidState(previousState, raidEvent) {
  let next = { ...previousState };
  const { payload, timestamp, type } = raidEvent;

  if (type === "session_mode") {
    next.sessionMode = payload.mode || next.sessionMode;
    return next;
  }

  if (type === "profile_selected") {
    next.profileId = payload.profileId || next.profileId;
    next.accountId = payload.accountId || next.accountId;
    return next;
  }

  if (type === "raid_created" || type === "network_game_create") {
    const shouldReset =
      next.isActive ||
      next.status === "extracting_or_over" ||
      next.status === "aborted" ||
      (payload.raidId && next.raidId && payload.raidId !== next.raidId);
    if (shouldReset) {
      next = createFreshRaidCurrent(next);
    }
    ensureMatchStart(next, timestamp);
    next.mapId = payload.mapId || next.mapId;
    next.mapName = payload.mapName || next.mapName;
    next.raidId = payload.raidId || next.raidId;
    next.serverIp = payload.serverIp || next.serverIp;
    next.serverPort = payload.serverPort || next.serverPort;
    next.rawStatus = payload.rawStatus || next.rawStatus;
    next.status = "matching";
    next.isActive = false;
    return next;
  }

  if (type === "matching_completed") {
    if (next.status !== "matching" && next.status !== "loading") {
      next = createFreshRaidCurrent(next);
    }
    next.queueCompletedAt = timestamp;
    next.queueDurationSec = payload.queueTime ?? next.queueDurationSec;
    if (Number.isFinite(payload.queueTime)) {
      next.matchStartAt = timestamp - payload.queueTime * 1000;
    } else {
      ensureMatchStart(next, timestamp);
    }
    next.status = "loading";
    return next;
  }

  if (type === "map_loading") {
    if (next.status !== "matching" && next.status !== "loading") {
      next = createFreshRaidCurrent(next);
    }
    ensureMatchStart(next, timestamp);
    next.mapId = payload.mapId || next.mapId;
    next.mapName = payload.mapName || next.mapName;
    next.status = "loading";
    return next;
  }

  if (type === "game_starting") {
    ensureMatchStart(next, timestamp);
    next.status = "loading";
    return next;
  }

  if (type === "location_loaded") {
    next.loadDurationSec = payload.loadTime ?? next.loadDurationSec;
    if (!next.gameStartAt) {
      next.gameStartAt = timestamp;
    }
    return next;
  }

  if (type === "game_started") {
    next.gameStartAt = timestamp;
    next.status = "in_raid";
    next.isActive = true;
    next.raidEndAt = null;
    return next;
  }

  if (type === "user_match_over") {
    next.mapId = payload.mapId || next.mapId;
    next.mapName = payload.mapName || next.mapName;
    next.raidId = payload.raidId || next.raidId;
    next.raidEndAt = timestamp;
    next.status = "extracting_or_over";
    next.isActive = false;
    return next;
  }

  if (type === "matching_aborted") {
    next.raidEndAt = timestamp;
    next.status = "aborted";
    next.isActive = false;
    return next;
  }

  return next;
}

function applyRaidEvent(event) {
  state.raid.current = reduceRaidState(state.raid.current, event);
  maybeAutoSwitchMapByRaid();
  state.raid.events = [event, ...state.raid.events.filter((existing) => existing.id !== event.id)].slice(
    0,
    MAX_RAID_EVENTS,
  );
  state.raid.ui.lastUpdatedAt = event.timestamp;
}

async function resolveRaidLogHandles() {
  if (!state.raid.gameDirHandle) {
    state.raid.logDirHandle = null;
    state.raid.applicationLogHandle = null;
    state.raid.notificationsLogHandle = null;
    state.raid.applicationLogHandles = [];
    state.raid.notificationsLogHandles = [];
    return false;
  }

  const logsRoot = await resolveGameRootPath(state.raid.gameDirHandle);
  if (!logsRoot) {
    setRaidUiError("未找到 Logs 目录");
    state.raid.current.status = "error";
    return false;
  }

  const latestLogDir = await resolveLatestLogPath(logsRoot);
  if (!latestLogDir) {
    setRaidUiError("未找到最新日志目录");
    state.raid.current.status = "error";
    return false;
  }

  const directoryChanged = state.raid.logDirHandle?.name !== latestLogDir.name;
  state.raid.logDirHandle = latestLogDir;
  state.raid.applicationLogHandles = await resolveLogFiles(latestLogDir, "application");
  state.raid.notificationsLogHandles = await resolveLogFiles(latestLogDir, "notifications");
  state.raid.applicationLogHandle = state.raid.applicationLogHandles[0] || null;
  state.raid.notificationsLogHandle = state.raid.notificationsLogHandles[0] || null;
  if (directoryChanged) {
    resetRaidLogOffsets();
    resetRaidDerivedState();
  }
  setRaidUiError("");
  if (state.raid.current.status === "error") {
    state.raid.current.status = "idle";
  }
  return Boolean(state.raid.applicationLogHandles.length || state.raid.notificationsLogHandles.length);
}

async function scanLogFile(kind, handle, { fullRescan = false } = {}) {
  if (!handle) {
    return [];
  }

  const offsetKey = `${kind}:${handle.name}`;
  const file = await handle.getFile();
  const lastModified = file.lastModified;
  if (!fullRescan && lastModified <= (state.raid.logLastModified[offsetKey] || 0)) {
    return [];
  }

  const text = await file.text();
  const lines = typeof text === "string" ? text.split("\n") : [];
  const entries = parseLogLines(lines);
  if (fullRescan || entries.length < (state.raid.logOffsets[offsetKey] || 0)) {
    state.raid.logOffsets[offsetKey] = 0;
  }
  const stableOffset = state.raid.logOffsets[offsetKey] || 0;
  const startIndex = fullRescan ? 0 : Math.max(0, stableOffset - 1);
  const newEntries = entries.slice(startIndex);
  state.raid.logOffsets[offsetKey] = entries.length;
  state.raid.logLastModified[offsetKey] = lastModified;

  return newEntries;
}

async function scanLogHandles(kind, options = {}) {
  const handles = kind === "application" ? state.raid.applicationLogHandles : state.raid.notificationsLogHandles;
  const entries = [];
  for (const handle of handles) {
    entries.push(...(await scanLogFile(kind, handle, options)));
  }
  return entries;
}

async function scanRaidLogs(options = {}) {
  if (!state.raid.gameDirHandle) {
    return 0;
  }

  const resolved = await resolveRaidLogHandles();
  if (!resolved) {
    return 0;
  }

  const newEntries = [
    ...(await scanLogHandles("application", options)),
    ...(await scanLogHandles("notifications", options)),
  ].sort((a, b) => parseEntryTimestamp(a) - parseEntryTimestamp(b));
  for (const entry of newEntries) {
    const event = extractRaidEvent(entry);
    if (event) {
      applyRaidEvent(event);
    }
  }
  const changes = newEntries.length;
  if (changes > 0 || options.fullRescan) {
    state.raid.lastLogScanAt = Date.now();
  }
  return changes;
}

async function scanAllSources() {
  const addedScreenshots = await scanScreenshots();
  const addedLogEntries = await scanRaidLogs();
  refreshUi();
  return {
    addedScreenshots,
    addedLogEntries,
  };
}

function stopWatch() {
  if (state.scanTimer) {
    clearInterval(state.scanTimer);
    state.scanTimer = null;
  }
  state.watching = false;
  state.raid.watchingLogs = false;
  dom.watchBtn.textContent = "开始监听";
  refreshUi();
}

function startWatch() {
  if (!state.screenshotDirHandle && !state.raid.gameDirHandle) {
    setStatus("请先选择截图目录或游戏目录", true);
    return;
  }
  const intervalSec = Math.max(1, Number.parseInt(dom.intervalInput.value || "2", 10));
  dom.intervalInput.value = String(intervalSec);
  stopWatch();
  state.watching = true;
  state.raid.watchingLogs = Boolean(state.raid.gameDirHandle);
  state.scanTimer = setInterval(() => {
    scanAllSources().catch((error) => {
      setRaidUiError(error.message || "监听失败");
      state.raid.current.status = "error";
      refreshUi();
      setStatus(`监听失败: ${error.message}`, true);
    });
  }, intervalSec * 1000);
  dom.watchBtn.textContent = "停止监听";
  refreshUi();
  setStatus(`监听已开启，间隔 ${intervalSec} 秒`);
}

function buildDirectoryPickerOptions(kind) {
  const options = {
    mode: "read",
    id: kind === "screenshot" ? "tarkov-screenshot-dir" : "tarkov-game-dir",
  };
  const startHandle = kind === "screenshot" ? state.screenshotDirHandle : state.raid.gameDirHandle;
  if (startHandle) {
    options.startIn = startHandle;
  }
  return options;
}

async function openDirectoryPickerWithMemory(kind) {
  const options = buildDirectoryPickerOptions(kind);
  try {
    return await window.showDirectoryPicker(options);
  } catch (error) {
    if (error?.name === "TypeError") {
      return window.showDirectoryPicker({ mode: "read" });
    }
    throw error;
  }
}

async function chooseScreenshotDirectory() {
  if (!window.showDirectoryPicker) {
    setStatus("当前浏览器不支持目录选择 API", true);
    return;
  }
  try {
    const handle = await openDirectoryPickerWithMemory("screenshot");
    const granted = await ensureReadPermission(handle);
    if (!granted) {
      setStatus("目录读取权限未授权", true);
      return;
    }

    state.screenshotDirHandle = handle;
    updateDirLabels();
    try {
      await saveHandle(STORE_KEYS.screenshotDir, handle);
    } catch {
      setStatus("截图目录已选择，但浏览器未能持久化句柄");
    }
    await scanScreenshots();
    refreshUi();
  } catch (error) {
    if (error?.name !== "AbortError") {
      setStatus(`选择截图目录失败: ${error.message}`, true);
    }
  }
}

async function chooseGameDirectory() {
  if (!window.showDirectoryPicker) {
    setStatus("当前浏览器不支持目录选择 API", true);
    return;
  }
  try {
    const handle = await openDirectoryPickerWithMemory("game");
    const granted = await ensureReadPermission(handle);
    if (!granted) {
      setStatus("目录读取权限未授权", true);
      return;
    }

    const valid = await checkGameDirectory(handle);
    if (!valid) {
      setStatus("游戏目录无效：未找到 Logs 或最新 log_* 目录", true);
      return;
    }

    state.raid.gameDirHandle = handle;
    resetRaidLogOffsets();
    updateDirLabels();
    try {
      await saveHandle(STORE_KEYS.gameDir, handle);
    } catch {
      setStatus("游戏目录已选择，但浏览器未能持久化句柄");
    }
    await scanRaidLogs({ fullRescan: true });
    refreshUi();
  } catch (error) {
    if (error?.name !== "AbortError") {
      setStatus(`选择游戏目录失败: ${error.message}`, true);
    }
  }
}

async function restoreScreenshotDirectory() {
  if (!window.showDirectoryPicker) {
    return;
  }
  try {
    const saved = await loadHandle(STORE_KEYS.screenshotDir);
    if (!saved) {
      return;
    }
    const granted = await ensureReadPermission(saved);
    if (!granted) {
      setStatus("截图目录权限已失效，请重新选择截图目录");
      return;
    }
    state.screenshotDirHandle = saved;
    await scanScreenshots();
  } catch {
    setStatus("恢复截图目录失败，请手动选择截图目录");
  }
}

async function restoreGameDirectory() {
  if (!window.showDirectoryPicker) {
    return;
  }
  try {
    const saved = await loadHandle(STORE_KEYS.gameDir);
    if (!saved) {
      return;
    }
    const granted = await ensureReadPermission(saved);
    if (!granted) {
      setStatus("游戏目录权限已失效，请重新选择游戏目录");
      return;
    }
    const valid = await checkGameDirectory(saved);
    if (!valid) {
      setStatus("历史游戏目录无效，请重新选择游戏目录");
      return;
    }
    state.raid.gameDirHandle = saved;
    resetRaidLogOffsets();
    await scanRaidLogs({ fullRescan: true });
  } catch {
    setStatus("恢复游戏目录失败，请手动选择游戏目录");
  }
}

function bindEvents() {
  dom.mapTabBtn.addEventListener("click", () => setMainView("map"));
  dom.taskTabBtn.addEventListener("click", () => setMainView("tasks"));
  dom.taskTraderList?.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) {
      return;
    }
    const button = target.closest(".task-link-btn");
    if (!button) {
      return;
    }
    const taskKey = button.dataset.taskKey || "";
    const task = taskState.taskByKey.get(taskKey);
    if (!task) {
      return;
    }
    setTaskVideo(task.url, task.key, task.name);
  });
  dom.pickDirBtn.addEventListener("click", () => {
    chooseScreenshotDirectory().catch((error) => setStatus(`选择截图目录失败: ${error.message}`, true));
  });
  dom.pickGameDirBtn.addEventListener("click", () => {
    chooseGameDirectory().catch((error) => setStatus(`选择游戏目录失败: ${error.message}`, true));
  });
  dom.scanBtn.addEventListener("click", () => {
    if (!state.screenshotDirHandle && !state.raid.gameDirHandle) {
      setStatus("请先选择截图目录或游戏目录", true);
      return;
    }
    scanAllSources().catch((error) => setStatus(`扫描失败: ${error.message}`, true));
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
  dom.raidToggleBtn.addEventListener("click", () => {
    state.raid.ui.expanded = !state.raid.ui.expanded;
    refreshUi();
  });
  dom.syncModeBtn.addEventListener("click", () => {
    state.lan.syncMode = state.lan.syncMode === "join" ? "host" : "join";
    if (state.lan.syncMode === "join") {
      state.lan.remotePort = "";
    }
    persistLanSyncConfig();
    syncLanConfigToBackend()
      .then(() => refreshUi())
      .catch((error) => {
        state.lan.backendReady = false;
        state.lan.lastError = error.message || "切换同步模式失败";
        refreshUi();
      });
  });
  dom.syncToggleBtn.addEventListener("click", () => {
    state.lan.enabled = !state.lan.enabled;
    persistLanSyncConfig();
    syncLanConfigToBackend()
      .then(() => refreshUi())
      .catch((error) => {
        state.lan.backendReady = false;
        state.lan.lastError = error.message || "切换同步失败";
        refreshUi();
      });
  });
  dom.syncNameInput.addEventListener("change", () => {
    state.lan.displayName = normalizeSyncName(dom.syncNameInput.value);
    persistLanSyncConfig();
    syncLanConfigToBackend()
      .then(() => refreshUi())
      .catch((error) => {
        state.lan.backendReady = false;
        state.lan.lastError = error.message || "同步名称失败";
        refreshUi();
      });
  });
  dom.syncColorInput.addEventListener("input", () => {
    state.lan.color = normalizeHexColor(dom.syncColorInput.value);
    persistLanSyncConfig();
    applyLocalMarkerAppearance();
    syncLanConfigToBackend()
      .then(() => refreshUi())
      .catch((error) => {
        state.lan.backendReady = false;
        state.lan.lastError = error.message || "同步颜色失败";
        refreshUi();
      });
  });
  dom.syncRemoteHostInput.addEventListener("change", () => {
    state.lan.remoteHost = normalizeSyncHost(dom.syncRemoteHostInput.value);
    persistLanSyncConfig();
    syncLanConfigToBackend()
      .then(() => refreshUi())
      .catch((error) => {
        state.lan.backendReady = false;
        state.lan.lastError = error.message || "同步远端地址失败";
        refreshUi();
      });
  });
  dom.syncRemotePortInput.addEventListener("change", () => {
    state.lan.remotePort = normalizeSyncPortOptional(dom.syncRemotePortInput.value);
    persistLanSyncConfig();
    syncLanConfigToBackend()
      .then(() => refreshUi())
      .catch((error) => {
        state.lan.backendReady = false;
        state.lan.lastError = error.message || "同步远端端口失败";
        refreshUi();
      });
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
  loadLanSyncConfig();
  initTaskPanel();
  bindEvents();
  setMainView("map", { instant: true });
  resetMapZoom();
  reflectLanConfigInputs();
  applyLocalMarkerAppearance();
  updateDirLabels();
  renderRaidInfo(createInitialRaidSummary());
  renderLanSyncPanel();
  await loadMapMetadata();
  await syncLanConfigToBackend().catch((error) => {
    state.lan.backendReady = false;
    state.lan.lastError = error.message || "联机服务初始化失败";
  });
  startLanSyncPolling();
  await restoreScreenshotDirectory();
  await restoreGameDirectory();
  refreshUi();
}

boot().catch((error) => {
  setRaidUiError(error.message || "初始化失败");
  state.raid.current.status = "error";
  refreshUi();
  setStatus(`初始化失败: ${error.message}`, true);
});
