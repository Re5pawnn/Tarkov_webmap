@echo off
setlocal
chcp 65001 >nul
cd /d "%~dp0"

if exist ".build_venv\Scripts\python.exe" (
  ".build_venv\Scripts\python.exe" launcher.py
  goto :eof
)

py -3 launcher.py 2>nul
if not errorlevel 1 goto :eof

python launcher.py
