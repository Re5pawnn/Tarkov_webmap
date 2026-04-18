@echo off
setlocal
chcp 65001 >nul
cd /d "%~dp0"

set "BUNDLED_PY=%~dp0runtime\python"
if exist "%BUNDLED_PY%\python.exe" (
  set "PYTHONHOME=%BUNDLED_PY%"
  set "PATH=%BUNDLED_PY%;%PATH%"
  "%BUNDLED_PY%\python.exe" "%~dp0launcher.py"
  goto :eof
)

if exist ".build_venv\Scripts\python.exe" (
  ".build_venv\Scripts\python.exe" "%~dp0launcher.py"
  goto :eof
)

py -3 "%~dp0launcher.py" 2>nul
if not errorlevel 1 goto :eof

python "%~dp0launcher.py"
