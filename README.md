# TarkovMapLocator（塔科夫网页地图定位工具）

基于《逃离塔科夫》截图文件名中的坐标与朝向信息，在网页地图上实时显示玩家位置和方向。

## 1. 功能概览

- 选择并监听截图目录（File System Access API）
- 解析截图文件名中的坐标、四元数和时间顺序
- 自动匹配地图并在地图上显示玩家位置与朝向
- 显示撤离点、出生点、转移点等 POI 图标及名称
- 支持图层开关（撤离点/出生点/钥匙门/开关/危险区等）
- 提供本地一键启动与自安装 EXE 打包

## 2. 项目目录（整理后）

```text
.
├─ index.html                  # 前端入口
├─ app.js                      # 业务逻辑
├─ styles.css                  # 样式
├─ maps_detail.json            # 地图元数据（核心）
├─ maps_list.json              # 地图列表
├─ launcher.py                 # 本地 HTTP 启动器
├─ start_tool.bat              # 启动入口（双击运行）
├─ 使用方法.txt                # 安装包内使用说明
├─ build_release_folder.bat    # 构建安装负载目录
├─ build_installer.bat         # 构建自安装 EXE
├─ build_exe.bat               # 可选：单文件 EXE 构建
├─ installer/
│  └─ TarkovMapLocator.iss     # Inno Setup 脚本
├─ scripts/
│  └─ map_fetch/               # 地图抓取相关历史脚本
└─ archive/                    # 历史抓包/镜像文件归档
```

## 3. 运行要求

- Windows 10/11
- Python 3.10+（本地开发运行时）
- 浏览器需支持 File System Access API（推荐 Chromium 内核）

## 4. 本地运行

1. 双击 `start_tool.bat`
2. 浏览器打开 `http://127.0.0.1:5173/index.html`（脚本会自动尝试打开）
3. 在页面中点击“选择截图目录”，授权塔科夫截图文件夹

## 5. 截图命名格式

工具依赖截图文件名中的坐标信息。当前解析正则对应格式类似：

```text
YYYY-MM-DD[HH-mm]_x, y, z_qx, qy, qz, qw_scale (index).png
```

示例：

```text
2026-04-10[15-33]_-333.38, 1.08, -87.57_0.02082, 0.95456, -0.06873, 0.28922_7.87 (0).png
```

## 6. 打包与发布

### 6.1 构建安装负载目录

双击：

```bat
build_release_folder.bat
```

产物目录：

```text
release_payload/
```

其中包含：
- 运行所需项目文件
- `runtime/python/`（内置 Python 运行时）

### 6.2 构建自安装 EXE

双击：

```bat
build_installer.bat
```

产物：

```text
release/TarkovMapLocator.exe
```

安装器特点：
- 支持自定义安装目录
- 安装后快捷方式指向 `start_tool.bat`
- 运行方式是 BAT 启动，不是业务单文件 EXE 启动

## 7. 安装后使用

- 打开安装目录，双击 `start_tool.bat`
- 或从桌面/开始菜单快捷方式启动（本质也是执行 `start_tool.bat`）

## 8. 常见问题

- 地图不显示：确认网络可访问地图与图标 CDN 地址
- 无法定位：确认截图文件名包含完整坐标/四元数信息
- 目录权限问题：重新选择截图目录并授权读取权限

## 9. 免责声明

本项目仅做本地工具与技术研究用途，不注入游戏进程、不修改游戏内存。使用时请自行遵守游戏服务条款与相关平台规则。
