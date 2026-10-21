# Correct Your Sleep Cycle

Workspace for turning Alarmy (`droom.sleepIfUCan`) 26.34.1 into a forked baseline
for a future rebranded alarm/sleep app.

## Repository contents

| Folder / file | Purpose |
|---|---|
| `outputs/CHANGE_REPORT.md` | Full static-analysis findings (permissions, components, splits) |
| `outputs/INSTALL_INSTRUCTIONS.md` | How to sideload the re-signed `.apkm` |
| `outputs/SHA256SUMS.txt` | Checksums of every signed artifact |
| `scripts/rebuild-decode.ps1` | Re-creates `work\decoded_res` from `Alarmy.apkm` |
| `scripts/sign-and-pack.ps1` | Zipalign + re-sign everything, then pack an `.apkm` |

Things intentionally **not** committed (GitHub blocks >100 MB anyway):
- `Alarmy.apkm` (146 MB) and every `*.apk` / decoded `work\` folder (223 MB each) — rebuild with `scripts/rebuild-decode.ps1`
- `tools/apktool_3.0.3.jar` (15 MB, official [Apktool release](https://github.com/iBotPeaches/Apktool/releases/tag/v3.0.3))
- signing key + password (generated with `keytool`, see below)

## Reproduce the workflow

```powershell
# 0) install JDK 17+ and Android build-tools 36.0.0, add Apktool jar to tools\
./scripts/rebuild-decode.ps1                          # unpack + decode
java -jar \"tools\apktool_3.0.3.jar\" b -o work\base_rebuilt.apk work\decoded_res
keytool -genkeypair -v -keystore work\signing\cywc.keystore ` # only once
    -storetype PKCS12 -alias cywc -keyalg RSA -keysize 2048 -validity 10950 `
    -storepass <set-own-pass> -keypass <set-own-pass> `
    -dname 'CN=Correct Your Sleep Cycle, OU=Personal, O=Personal, C=US'
./scripts/sign-and-pack.ps1                           # align + sign + pack .apkm
```

## Exchanging big APKs with collaborators / devices

Regular git pushes to GitHub reject >100 MB files. Options:
- Upload `Alarmy.apkm` (or the re-signed `.apkm`) as a **GitHub Releases** asset (≤2 GB per file)
- Or share via https://transfer.sh / Google Drive / SAI on-device everywhere app

## Future roadmap — Expo

The current Alarmy APK **cannot** run via Expo Go (Expo Go loads only pure-JS
React Native bundles, not native `.dex`/`.so`). Rebranding + shipping Expo-Go-
testable code will come from building a **new** Expo/React Native project
(`Phase 2`) — see `outputs/CHANGE_REPORT.md` for the plan staged so far.
