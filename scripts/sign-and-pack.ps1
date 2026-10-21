# Zipaligns + re-signs every APK in work\bundles\<variant>, then packs a .apkm.
# Usage: ./scripts/sign-and-pack.ps1 <sourceBundlesDir> <keystore> <passwordFile>

param(
    [string]$Src   = "$PSScriptRoot\..\work\bundles\alarmy_26.34.1",
    [string]$Keys  = "$PSScriptRoot\..\work\signing\cywc.keystore",
    [string]$Pass  = "$PSScriptRoot\..\work\signing\password.txt"
)

$ErrorActionPreference = 'Stop'
$bt = "$env:LOCALAPPDATA\Android\Sdk\build-tools\36.0.0"
if (-not (Test-Path $bt)) { throw "Android build-tools not found at $bt (install via Android Studio SDK manager)." }

$pw  = Get-Content $Pass -Raw
$dst = "$Src-signed"
New-Item -ItemType Directory -Force -Path $dst | Out-Null

Get-ChildItem $Src -Filter '*.apk' | ForEach-Object {
    $name = $_.Name
    $tmp  = Join-Path $dst "$name.aligned"
    & "$bt\zipalign.exe" -f -p 4 $_.FullName $tmp
    if ($LASTEXITCODE -ne 0) { throw "zipalign failed for $name" }

    & "$bt\apksigner.bat" sign `
        --ks $Keys --ks-key-alias cywc `
        --ks-pass "pass:$pw" --key-pass "pass:$pw" `
        --out (Join-Path $dst $name) $tmp
    if ($LASTEXITCODE -ne 0) { throw "apksigner failed for $name" }
    Remove-Item $tmp -Force
}

Write-Host "All APKs aligned + signed into $dst"
