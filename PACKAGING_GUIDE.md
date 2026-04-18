# Packaging And Publish Guide

## 1) One-click local run

Double-click:

`start_tool.bat`

It auto-detects Python and launches `launcher.py` with a local HTTP server.

## 2) Build standalone EXE (includes Python runtime)

Double-click:

`build_exe.bat`

Output:

`dist/TarkovMapLocator.exe`

## 3) Build self-installing installer EXE

Double-click:

`build_installer.bat`

It will:

1. Build the standalone EXE
2. Install Inno Setup automatically (if missing)
3. Build installer EXE

Installer output:

`release/Install-TarkovMapLocator.exe`

## 4) Push to GitHub with one BAT command

Double-click:

`push_to_github.bat`

or pass repo URL directly:

`push_to_github.bat https://github.com/<yourname>/<repo>.git`
