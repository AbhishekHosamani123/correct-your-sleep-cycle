# Rebuilds the two working decode folders from source .apkm.
# Usage:  ./scripts/rebuild-decode.ps1
# Requires: tools\apktool_3.0.3.jar (see README) and JDK 17+.

$ErrorActionPreference = 'Stop'
$root = Split-Path $PSScriptRoot

if (-not (Test-Path "$root\tools\apktool_3.0.3.jar")) {
    Write-Warning "Downloading Apktool 3.0.3 to tools\ ..."
    New-Item -ItemType Directory -Force -Path "$root\tools" | Out-Null
    Invoke-WebRequest -Uri "https://github.com/iBotPeaches/Apktool/releases/download/v3.0.3/apktool_3.0.3.jar" `
        -OutFile "$root\tools\apktool_3.0.3.jar"
}

# 1. Unpack the split bundle to a flat working copy (base.apk + 33 splits + info.json)
$dest = "$root\work\bundles\alarmy_26.34.1"
New-Item -ItemType Directory -Force -Path $dest | Out-Null
Add-Type -AssemblyName System.IO.Compression.FileSystem
[System.IO.Compression.ZipFile]::ExtractToDirectory("$root\Alarmy.apkm", $dest)

# 2. Decode base.apk keeping sources raw, manifest + resources as XML
java -jar "$root\tools\apktool_3.0.3.jar" d -f -s -o "$root\work\decoded_res" "$dest\base.apk"

# 3. Also decode keeping both sources and resources raw (fastest rebuild path)
java -jar "$root\tools\apktool_3.0.3.jar" d -f -r -o "$root\work\decoded_res_res" "$dest\base.apk"

Write-Host "Done. Inspect work\decoded_res for AndroidManifest.xml and res\."
