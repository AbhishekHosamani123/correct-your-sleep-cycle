# Change report — Alarmy 26.34.1 ("same to same" baseline)

Summary: **zero app-content changes were made.** Your original
`Alarmy.apkm` was left untouched on disk. A working, re-signed copy
was produced purely for use as a baseline you can plan changes against.

## 1. Source & tooling

| Item | Value |
|---|---|
| Source file (untouched) | `D:\Correct-Your-Sleep-Cycle\Alarmy.apkm` (146,641,526 bytes) |
| Bundle type | APKMirror split bundle (`.apkm`): base.apk + 33 splits, steps listed in `info.json`, apkm_version 5 |
| Apktool | 3.0.3 (latest official release, Jul 2026) — located in `tools\apktool_3.0.3.jar` |
| Android build-tools | 36.0.0 (`zipalign`, `apksigner`, `aapt`) already installed on this machine |
| Java | JDK 25.0.2 |
| Signing key gen | `keytool` via JDK 25 |
| Work copy splits | `work\bundles\alarmy_26.34.1\` and re-signed copies at `work\bundles\alarmy_26.34.1-signed\` |
| Decoded sources | `work\decoded\` (binary manifest/dex kept) and `work\decoded_res\` (manifest + res decoded in XML) |

## 2. App inspection

| Property | Value |
|---|---|
| Package name | `droom.sleepIfUCan` |
| Version | 26.34.1 (versionCode 263401) |
| minSdk / targetSdk / compileSdk | 28 (Android 9) / 36 (Android 16) / 36 |
| Native ABIs in bundle | arm64-v8a, armeabi-v7a |
| Density splits present | ldpi, mdpi, tvdpi, hdpi, xhdpi, xxhdpi, xxxhdpi |
| Language splits present | ar, de, en, es, et, fi, fr, hi, hu, in, it, ja, ko, ms, nl, pl, pt, ru, sv, th, tr, uk, vi, zh (24) |
| App label resource | `@string/alarmy_name` |
| Launcher icon | `@mipmap/ic_launcher` |
| allowBackup | false |
| extractNativeLibs | false |
| requiredSplitTypes | `base__abi, base__density` — base cannot install alone |

### Permissions (43 declared)
Highlights: CAMERA, RECORD_AUDIO, FOREGROUND_SERVICE(×5 types incl.
MEDIA_PLAYBACK / MICROPHONE / SYSTEM_EXEMPTED), RECEIVE_BOOT_COMPLETED,
SCHEDULE_EXACT_ALARM + USE_EXACT_ALARM, POST_NOTIFICATIONS,
USE_FULL_SCREEN_INTENT, DISABLE_KEYGUARD, WAKE_LOCK, VIBRATE, FLASHLIGHT,
SYSTEM_ALERT_WINDOW, WRITE_SETTINGS, ACCESS_FINE/COARSE_LOCATION,
ACCESS_NETWORK_STATE, INTERNET, MODIFY_AUDIO_SETTINGS,
REQUEST_IGNORE_BATTERY_OPTIMIZATIONS, BILLING / CHECK_LICENSE,
ACCESS_ADSERVICES_*, GMS AD_ID, custom apps perms:
`droom.sleepIfUCan.permission.SLEEP_TRACKING_RESULT`,
`DYNAMIC_RECEIVER_NOT_EXPORTED_PERMISSION`.

### Components (as declared in manifest)
- 132 activities — incl. launcher `droom.sleepIfUCan.activity.MainActivity`
- 27 services — incl. `AlarmyFirebaseMessagingService`, alarm/wakeup/snooze services
- 34 receivers — incl. `feature.alarm.receiver.AlarmReceiver`,
  `AlarmWarmupReceiver`, `AlarmPrepareReceiver`, `AdminReceiver` (device-admin),
  `BootReceiver` behavior via RECEIVE_BOOT_COMPLETED
- 25 providers — content/file providers
- Application class: `droom.sleepIfUCan.AlarmyApp`
- Ads/monetization SDKs present (AppLovin mediation + adapters, Chartboost,
  Unity, MobileFuse, Moloco, BidMachine, Pangle…), plus Datadog, AppMetrica,
  Snowplow, Firebase, Crashlytics, Play Billing

## 3. What was changed (and nothing else)

| File / step | Change |
|---|---|
| All 34 APKs | 4-byte zipalign (`-p` page-align for .so) then re-signed: APK Signature Scheme v2+v3 with new key `CN=Correct Your Sleep Cycle` (alias `cywc`, RSA-2048/PKCS12, 30-year validity) |
| `outputs\Alarmy_26.34.1_reshigned.apkm` | freshly packed container: 34 re-signed APKs + `info.json` + `icon.png` (original outer META-INF container signature intentionally not reproduced — installers do not require it) |
| Nothing else | No smali edits, no resource edits, no permission changes, no library removal, no rebuild of dex/resources via Apktool |

## 4. Verification (static, no device)

- [x] `apktool 3.0.3` decodes the base APK cleanly (both `-s` and `-rs` decodes earlier already present in `work\`)
- [x] aapt badging on **signed** `base.apk`: package/versionCode/versionName/sdk unchanged
- [x] zipalign: all 34 APKs aligned, no errors
- [x] `apksigner verify`: 34/34 verified, 0 errors (certificate SHA-256
      `25b4643fa1c2dae5cfea9247e58145a36003b23a95d7daf95027936a42590f7e`)
- [x] `.apkm` container contains exactly 34 `.apk` + `info.json` + `icon.png`
- [x] SHA-256 checksums written to `outputs\SHA256SUMS.txt`
- [ ] **NOT tested**: install/launch on a real device, alarm firing,
      notifications, billing. Ad SDKs expect certain refs from Play — normal.

## 5. Known risks & limitations for your future plan

1. **Same-signature dependency**: for now, this re-signed copy will *replace*
   official Alarmy on a test phone (same package name; official install must be
   uninstalled first → data loss). If you later want the new app to coexist
   with Alarmy, packages must also be renamed (see below).
2. **Package rename for "Correct Your Sleep Cycle"** (later phase) touches:
   - `AndroidManifest.xml` `package=` in base (decoded at `work\decoded_res\AndroidManifest.xml`),
   - the same `package=` attribute in **each split** manifest
     (PackageInstaller requires all splits to declare the same package),
   - custom permission names `droom.sleepIfUCan.*`,
   - `res/values/strings.xml` line 194 `<string name="alarmy_name">Alarmy</string>`
     (+ 24 localized `values-*` variants if desired), launcher icon
     `res/mipmap-*/ic_launcher.*`, optional deep-link scheme
     `alarmy://` URLs referenced in the app, and Google-services config
     (`google_app_id`/project number) if you want clean Firebase behavior.
3. **Split rebuild rule**: because `requiredSplitTypes` demands ABI+density
   splits, any future base-APK rebuild must be repackaged with **consistent**
   split versionCodes and **one shared signing cert** across all splits.
4. This is a minified (R8-processed) app: you cannot "recompile from source".
   All changes will be resource-level (Apktool) and/or smali-level edits.
