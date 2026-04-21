@echo off
setlocal EnableExtensions
chcp 65001 >nul
cd /d "%~dp0"

set "APP_ROOT=%~dp0"
set "LAUNCHER=%APP_ROOT%launcher.py"
set "BUNDLED_HOME=%APP_ROOT%runtime\python"
set "BUNDLED_PY=%BUNDLED_HOME%\python.exe"

if not exist "%LAUNCHER%" (
  echo [错误] 未找到 launcher.py：%LAUNCHER%
  pause
  exit /b 1
)

call :run_bundled %*
if not errorlevel 1 goto :ok
set "ERR_CODE=%errorlevel%"
echo [警告] 内置 Python 启动失败，错误码：%ERR_CODE%
echo [提示] 正在尝试系统 Python...

call :run_system %*
if not errorlevel 1 goto :ok
set "ERR_CODE=%errorlevel%"
echo [错误] 启动失败，错误码：%ERR_CODE%
echo [提示] 请把此窗口报错内容发给开发者排查。
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
