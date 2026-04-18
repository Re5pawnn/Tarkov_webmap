@echo off
setlocal
chcp 65001 >nul
cd /d "%~dp0"

echo [1/3] Building standalone EXE...
call "%~dp0build_exe.bat"
if errorlevel 1 goto :error

set "ISCC="
if exist "%ProgramFiles(x86)%\Inno Setup 6\ISCC.exe" set "ISCC=%ProgramFiles(x86)%\Inno Setup 6\ISCC.exe"
if exist "%ProgramFiles%\Inno Setup 6\ISCC.exe" set "ISCC=%ProgramFiles%\Inno Setup 6\ISCC.exe"
if exist "%LocalAppData%\Programs\Inno Setup 6\ISCC.exe" set "ISCC=%LocalAppData%\Programs\Inno Setup 6\ISCC.exe"

if "%ISCC%"=="" (
  echo [2/3] Inno Setup not found. Installing via winget...
  winget install -e --id JRSoftware.InnoSetup --accept-package-agreements --accept-source-agreements
  if errorlevel 1 (
    echo Failed to install Inno Setup.
    goto :error
  )
)

if "%ISCC%"=="" if exist "%ProgramFiles(x86)%\Inno Setup 6\ISCC.exe" set "ISCC=%ProgramFiles(x86)%\Inno Setup 6\ISCC.exe"
if "%ISCC%"=="" if exist "%ProgramFiles%\Inno Setup 6\ISCC.exe" set "ISCC=%ProgramFiles%\Inno Setup 6\ISCC.exe"
if "%ISCC%"=="" if exist "%LocalAppData%\Programs\Inno Setup 6\ISCC.exe" set "ISCC=%LocalAppData%\Programs\Inno Setup 6\ISCC.exe"

if "%ISCC%"=="" (
  echo ISCC not found after installation.
  goto :error
)

echo [3/3] Building self-installing installer EXE...
"%ISCC%" "%~dp0installer\TarkovMapLocator.iss"
if errorlevel 1 goto :error

echo.
echo Done.
echo Installer output: "%~dp0release\Install-TarkovMapLocator.exe"
exit /b 0

:error
echo.
echo Installer build failed.
exit /b 1
