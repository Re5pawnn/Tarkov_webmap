@echo off
setlocal EnableExtensions
chcp 65001 >nul
cd /d "%~dp0"

if /I not "%TARKOV_MAP_HIDDEN_LAUNCH%"=="1" (
  if exist "%~dp0start_tool_hidden.vbs" (
    wscript.exe "%~dp0start_tool_hidden.vbs" %*
    exit /b 0
  )
)

set "APP_ROOT=%~dp0"
set "LAUNCHER=%APP_ROOT%launcher.py"
set "BUNDLED_HOME=%APP_ROOT%runtime\python"
set "BUNDLED_PY=%BUNDLED_HOME%\python.exe"
set "ERR_CODE=0"
if defined LOCALAPPDATA (
  set "APP_STATE_DIR=%LOCALAPPDATA%\TarkovMapLocator"
) else (
  set "APP_STATE_DIR=%TEMP%\TarkovMapLocator"
)
if not exist "%APP_STATE_DIR%" mkdir "%APP_STATE_DIR%" >nul 2>nul
set "STARTUP_LOG=%APP_STATE_DIR%\startup.log"
> "%STARTUP_LOG%" echo [%date% %time%] Starting TarkovMapLocator from %APP_ROOT%

if not exist "%LAUNCHER%" (
  echo [ERROR] launcher.py not found: %LAUNCHER%
  call :write_log "[ERROR] launcher.py not found: %LAUNCHER%"
  if /I "%TARKOV_MAP_HIDDEN_LAUNCH%"=="1" (
    if exist "%~dp0start_tool_hidden.vbs" wscript.exe "%~dp0start_tool_hidden.vbs" --show-error "%STARTUP_LOG%"
  ) else (
    pause
  )
  exit /b 1
)

if exist "%BUNDLED_PY%" (
  call :run_bundled %*
  if not errorlevel 1 goto :ok
  set "ERR_CODE=%errorlevel%"
  if "%ERR_CODE%"=="98" goto :fail
  echo [WARN] Bundled Python failed with code: %ERR_CODE%
  echo [INFO] Trying system Python...
) else (
  echo [INFO] Bundled Python not found, trying system Python...
)

call :run_system %*
if not errorlevel 1 goto :ok
set "ERR_CODE=%errorlevel%"
:fail
echo [ERROR] Startup failed with code: %ERR_CODE%
echo [INFO] For source run, install Python 3.10+.
echo [INFO] For installer run, ensure runtime\python exists.
call :write_log "[ERROR] Startup failed with code: %ERR_CODE%"
call :write_log "[INFO] For source run, install Python 3.10+."
call :write_log "[INFO] For installer run, ensure runtime\python exists."
if /I "%TARKOV_MAP_HIDDEN_LAUNCH%"=="1" (
  if exist "%~dp0start_tool_hidden.vbs" wscript.exe "%~dp0start_tool_hidden.vbs" --show-error "%STARTUP_LOG%"
) else (
  pause
)
exit /b %ERR_CODE%

:run_bundled
if not exist "%BUNDLED_PY%" exit /b 2
set "PYTHONHOME=%BUNDLED_HOME%"
set "PYTHONPATH="
set "PATH=%BUNDLED_HOME%;%PATH%"
"%BUNDLED_PY%" "%LAUNCHER%" --auto-port %*
exit /b %errorlevel%

:run_system
set "PYTHONHOME="
set "PYTHONPATH="
py -3 "%LAUNCHER%" --auto-port %* 2>nul
if not errorlevel 1 exit /b 0
python "%LAUNCHER%" --auto-port %*
exit /b %errorlevel%

:ok
exit /b 0

:write_log
if defined STARTUP_LOG >> "%STARTUP_LOG%" echo %~1
exit /b 0
