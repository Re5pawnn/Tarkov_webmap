# 打包说明

## 一、构建发布负载目录

执行：

```bat
build_release_folder.bat
```

输出：

```text
release_payload/
```

该目录包含最终运行所需文件与内置 Python 运行时。

## 二、构建自安装 EXE

执行：

```bat
build_installer.bat
```

输出：

```text
release/TarkovMapLocator.exe
```

说明：
- 安装器支持自定义安装目录
- 安装后通过 `start_tool.bat` 启动
- 快捷方式也指向 `start_tool.bat`
