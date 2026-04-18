@echo off
setlocal
chcp 65001 >nul
cd /d "%~dp0"

set "PAYLOAD_DIR=%cd%\release_payload"
set "RUNTIME_DIR=%PAYLOAD_DIR%\runtime\python"

echo [1/4] Cleaning payload directory...
if exist "%PAYLOAD_DIR%" rmdir /s /q "%PAYLOAD_DIR%"
mkdir "%PAYLOAD_DIR%"
if errorlevel 1 goto :error

echo [2/4] Copying runtime project files...
set FILES=index.html app.js styles.css maps_detail.json maps_list.json launcher.py start_tool.bat README.md
for %%F in (%FILES%) do (
  if not exist "%cd%\\%%F" (
    echo Missing required file: %%F
    goto :error
  )
  copy /y "%cd%\\%%F" "%PAYLOAD_DIR%\\%%F" >nul
  if errorlevel 1 goto :error
)

for %%F in (*.txt) do (
  copy /y "%cd%\\%%F" "%PAYLOAD_DIR%\\%%F" >nul
)

echo [3/4] Detecting local Python runtime...
set "PY_BASE="
for /f "usebackq delims=" %%I in (`py -3 -c "import sys; print(sys.base_prefix)" 2^>nul`) do set "PY_BASE=%%I"
if "%PY_BASE%"=="" for /f "usebackq delims=" %%I in (`python -c "import sys; print(sys.base_prefix)" 2^>nul`) do set "PY_BASE=%%I"
if "%PY_BASE%"=="" (
  for /d %%D in ("%LocalAppData%\\Python\\pythoncore-*") do (
    if exist "%%~fD\\python.exe" set "PY_BASE=%%~fD"
  )
)
if "%PY_BASE%"=="" (
  for /d %%D in ("%LocalAppData%\\Programs\\Python\\Python*") do (
    if exist "%%~fD\\python.exe" set "PY_BASE=%%~fD"
  )
)
if "%PY_BASE%"=="" (
  echo Python not found in PATH.
  goto :error
)
if not exist "%PY_BASE%\python.exe" (
  echo Invalid Python base path: "%PY_BASE%"
  goto :error
)

echo [4/4] Copying Python runtime to payload...
robocopy "%PY_BASE%" "%RUNTIME_DIR%" /E /XD "__pycache__" "Doc" /XF "*.pyc" "*.pyo"
if errorlevel 8 goto :error

echo.
echo Payload ready:
echo "%PAYLOAD_DIR%"
exit /b 0

:error
echo.
echo Release folder build failed.
exit /b 1
