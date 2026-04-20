$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$iscc = "C:\Users\Administrator\AppData\Local\Programs\Inno Setup 6\ISCC.exe"
$iss = Join-Path $root "installer\TarkovMapLocator.iss"
$payloadScript = Join-Path $root "build_release_payload.ps1"

if (!(Test-Path $iscc)) {
  throw "ISCC not found: $iscc"
}
if (!(Test-Path $iss)) {
  throw "Installer script not found: $iss"
}
if (!(Test-Path $payloadScript)) {
  throw "Payload script not found: $payloadScript"
}

Write-Host "[1/2] Building release payload..."
& powershell -NoProfile -ExecutionPolicy Bypass -File $payloadScript
if ($LASTEXITCODE -ne 0) {
  throw "Failed to build release payload."
}

Write-Host "[2/2] Compiling installer with Inno Setup..."
& $iscc $iss
if ($LASTEXITCODE -ne 0) {
  throw "Inno Setup compile failed."
}

$out = Join-Path $root "release\TarkovMapLocator.exe"
if (!(Test-Path $out)) {
  throw "Installer not generated: $out"
}

Write-Host "Done: $out"
