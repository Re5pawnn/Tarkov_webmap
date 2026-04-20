@echo off
setlocal
chcp 65001 >nul
cd /d "%~dp0"

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0build_installer.ps1"
if errorlevel 1 (
  echo.
  echo 安装包构建失败。
  pause
  exit /b 1
)

echo.
echo 安装包构建完成：release\TarkovMapLocator.exe
pause
