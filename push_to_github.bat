@echo off
setlocal
chcp 65001 >nul
cd /d "%~dp0"

set "REMOTE_URL=%~1"
if "%REMOTE_URL%"=="" (
  set /p REMOTE_URL=请输入 GitHub 仓库地址（例如 https://github.com/yourname/tarkov-map-locator.git）:
)

if "%REMOTE_URL%"=="" (
  echo 未提供仓库地址，退出。
  exit /b 1
)

if not exist ".git" (
  git init
  if errorlevel 1 goto :error
)

git add .
if errorlevel 1 goto :error

git diff --cached --quiet
if errorlevel 1 (
  git commit -m "chore: project setup and packaging automation"
) else (
  echo No staged changes to commit.
)

git branch -M main
git remote remove origin 2>nul
git remote add origin "%REMOTE_URL%"
if errorlevel 1 goto :error

git push -u origin main
if errorlevel 1 goto :error

echo.
echo Push complete.
exit /b 0

:error
echo.
echo Git push failed.
exit /b 1
