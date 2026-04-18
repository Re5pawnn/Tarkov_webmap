@echo off
setlocal
chcp 65001 >nul
cd /d "%~dp0"

echo [1/6] Preparing build virtual environment...
if not exist ".build_venv\Scripts\python.exe" (
  py -3 -m venv ".build_venv"
  if errorlevel 1 goto :error
)

call ".build_venv\Scripts\activate.bat"
if errorlevel 1 goto :error

echo [2/6] Installing build dependencies...
python -m pip install --upgrade pip setuptools wheel
if errorlevel 1 goto :error
python -m pip install --upgrade pyinstaller
if errorlevel 1 goto :error

echo [3/6] Cleaning old artifacts...
if exist "build" rmdir /s /q "build"
if exist "dist" rmdir /s /q "dist"
if exist "TarkovMapLocator.spec" del /f /q "TarkovMapLocator.spec"

echo [4/6] Building standalone EXE (includes Python runtime)...
python -m PyInstaller ^
  --noconfirm ^
  --clean ^
  --name "TarkovMapLocator" ^
  --onefile ^
  --add-data "index.html;." ^
  --add-data "styles.css;." ^
  --add-data "app.js;." ^
  --add-data "maps_detail.json;." ^
  --add-data "maps_list.json;." ^
  launcher.py
if errorlevel 1 goto :error

echo [5/6] Build complete.
echo Output: "%cd%\dist\TarkovMapLocator.exe"

echo [6/6] Validating output...
if not exist "%cd%\dist\TarkovMapLocator.exe" (
  echo EXE output not found.
  goto :error
)

echo.
echo Done.
exit /b 0

:error
echo.
echo Build failed.
exit /b 1
