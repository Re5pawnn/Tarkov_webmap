# Tarkov Webmap

本项目用于读取《逃离塔科夫》截图文件名中的坐标与朝向，并在网页地图上实时定位玩家位置。

## 一键使用

- 双击 `start_tool.bat` 启动本地服务并打开网页
- 双击 `build_exe.bat` 生成单文件 `dist/TarkovMapLocator.exe`（内含 Python 运行时）
- 双击 `build_installer.bat` 生成自安装包 `release/Install-TarkovMapLocator.exe`
- 双击 `push_to_github.bat` 可一键提交并推送到指定 GitHub 仓库

## 网页入口

- `http://127.0.0.1:5173/index.html`
