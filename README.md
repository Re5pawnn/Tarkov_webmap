# TarkovMapLocator（塔科夫地图定位工具）

基于《逃离塔科夫》截图文件名中的坐标与朝向信息，在网页地图上实时显示玩家位置与朝向。

## 功能说明

- 监听截图目录并解析新截图文件名
- 自动匹配地图并定位玩家位置
- 显示玩家朝向
- 显示撤离点/转移点/钥匙门/危险区等地图图标与名称
- 支持图层开关、地图拖拽、滚轮缩放
- 纯本地运行（`localhost`），启动入口为 `start_tool.bat`

## 项目结构（当前有效）

- `index.html`：前端入口
- `app.js`：核心逻辑
- `styles.css`：样式
- `maps_detail.json`：地图与图标元数据
- `maps_list.json`：地图列表
- `launcher.py`：本地 HTTP 服务启动器
- `start_tool.bat`：一键启动脚本
- `使用方法.txt`：中文使用说明
- `build_release_payload.ps1`：构建发布载荷（含内置 Python）
- `build_installer.ps1` / `build_installer.bat`：构建自安装 EXE
- `installer/TarkovMapLocator.iss`：Inno Setup 安装脚本
- `installer/ChineseSimplified.isl`：安装器中文语言文件

## 本地运行

1. 双击 `start_tool.bat`
2. 浏览器会打开 `http://127.0.0.1:5173/index.html`
3. 在页面里选择塔科夫截图目录并授权

## 打包安装器

前置要求：

- Windows 10/11 x64
- 已安装 Inno Setup 6（`ISCC.exe`）

构建命令：

```bat
build_installer.bat
```

产物位置：

- `release/TarkovMapLocator.exe`

安装器特性：

- 可自定义安装目录
- 安装界面中文
- 安装后通过 `start_tool.bat` 启动工具
- 不依赖目标机器预装 Python（内置运行时）

## 截图命名格式

工具依赖塔科夫截图文件名中的坐标/四元数信息，示例：

```text
2026-04-10[15-33]_-333.38, 1.08, -87.57_0.02082, 0.95456, -0.06873, 0.28922_7.87 (0).png
```

## 免责声明

本项目仅用于本地工具与技术研究，不注入游戏进程、不修改游戏内存。请自行遵守游戏服务条款与平台规则。
