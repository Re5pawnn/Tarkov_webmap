$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$payloadDir = Join-Path $root "release_payload"
$runtimeDir = Join-Path $payloadDir "runtime\python"

Write-Host "[1/4] 清理发布目录..."
if (Test-Path $payloadDir) {
  Remove-Item -LiteralPath $payloadDir -Recurse -Force
}
New-Item -ItemType Directory -Path $payloadDir | Out-Null

Write-Host "[2/4] 复制项目文件..."
$required = @(
  "index.html",
  "app.js",
  "styles.css",
  "maps_detail.json",
  "maps_list.json",
  "launcher.py",
  "start_tool.bat",
  "README.md"
)
foreach ($file in $required) {
  $src = Join-Path $root $file
  if (!(Test-Path $src)) {
    throw "缺少必要文件: $file"
  }
  Copy-Item -LiteralPath $src -Destination (Join-Path $payloadDir $file) -Force
}

Get-ChildItem -Path $root -Filter "*.txt" -File -ErrorAction SilentlyContinue | ForEach-Object {
  Copy-Item -LiteralPath $_.FullName -Destination (Join-Path $payloadDir $_.Name) -Force
}

Write-Host "[3/4] 检测并复制 Python 运行时..."
$pyBase = (& py -3 -c "import sys; print(sys.base_prefix)" 2>$null)
if ([string]::IsNullOrWhiteSpace($pyBase)) {
  throw "未检测到 Python 运行时（py -3 不可用）"
}
$pyBase = $pyBase.Trim()
if (!(Test-Path (Join-Path $pyBase "python.exe"))) {
  throw "Python 路径无效: $pyBase"
}

New-Item -ItemType Directory -Path $runtimeDir -Force | Out-Null
$robo = Start-Process -FilePath "robocopy.exe" -ArgumentList @(
  $pyBase,
  $runtimeDir,
  "/E",
  "/XD", "__pycache__", "Doc",
  "/XF", "*.pyc", "*.pyo"
) -NoNewWindow -Wait -PassThru
if ($robo.ExitCode -ge 8) {
  throw "复制 Python 运行时失败，代码: $($robo.ExitCode)"
}

Write-Host "[4/4] 完成: $payloadDir"
