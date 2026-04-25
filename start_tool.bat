@echo off
setlocal EnableExtensions
chcp 65001 >nul
cd /d "%~dp0"

set "APP_ROOT=%~dp0"
set "LAUNCHER=%APP_ROOT%launcher.py"
set "BUNDLED_HOME=%APP_ROOT%runtime\python"
set "BUNDLED_PY=%BUNDLED_HOME%\python.exe"
set "ERR_CODE=0"

if not exist "%LAUNCHER%" (
  echo [ERROR] launcher.py not found: %LAUNCHER%
  pause
  exit /b 1
)

if exist "%BUNDLED_PY%" (
  call :run_bundled %*
  if not errorlevel 1 goto :ok
  set "ERR_CODE=%errorlevel%"
  echo [WARN] Bundled Python failed with code: %ERR_CODE%
  echo [INFO] Trying system Python...
) else (
  echo [INFO] Bundled Python not found, trying system Python...
)

call :run_system %*
if not errorlevel 1 goto :ok
set "ERR_CODE=%errorlevel%"
echo [ERROR] Startup failed with code: %ERR_CODE%
echo [INFO] For source run, install Python 3.10+.
echo [INFO] For installer run, ensure runtime\python exists.
pause
exit /b %ERR_CODE%

:run_bundled
if not exist "%BUNDLED_PY%" exit /b 2
set "PYTHONHOME=%BUNDLED_HOME%"
set "PYTHONPATH="
set "PATH=%BUNDLED_HOME%;%PATH%"
"%BUNDLED_PY%" "%LAUNCHER%" %*
exit /b %errorlevel%

:run_system
set "PYTHONHOME="
set "PYTHONPATH="
py -3 "%LAUNCHER%" %* 2>nul
if not errorlevel 1 exit /b 0
python "%LAUNCHER%" %*
exit /b %errorlevel%

:ok
exit /b 0
