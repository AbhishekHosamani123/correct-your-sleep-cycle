# Alarmy 26.34.1 (re-signed) — Installation instructions

Package: `droom.sleepIfUCan` · versionCode `263401` · versionName `26.34.1`
Requires Android 9.0+ (minSdk 28), arm64-v8a or armeabi-v7a device.

## IMPORTANT — read first

1. **Signature changed.** This bundle is signed with a NEW local key
   (`CN=Correct Your Sleep Cycle`), not Alarmy's official certificate.
   - Android treats it as a *different* app with the *same package name*.
   - You **cannot install it over an existing official Alarmy install**
     (Play Store or otherwise) — you will get `INSTALL_FAILED_UPDATE_INCOMPATIBLE`.
   - To install it, you must first **uninstall the official Alarmy app.
     This permanently deletes its alarms, sleep data and settings.**
     Back up anything you care about first.
2. This is a **split bundle** (`base + 33 splits`). Never install
   `base.apk` alone — the manifest requires the ABI + density splits.
   Install the whole `.apkm`, or via `install-multiple`.

## Option A — Dedicated installer app (easiest, no PC)

- Install **SAI (Split APKs Installer)** or **APKMirror Installer** from Play / APKMirror.
- Put `outputs\Alarmy_26.34.1_reshigned.apkm` on the phone (USB /
  file transfer, e.g. into `Download`).
- Open the installer app → it shows the `.apkm` contents (base + splits)
  → press **Install**, confirm on the prompt.

## Option B — ADB (`install-multiple`) from your PC

Make sure USB debugging is enabled, then from a terminal:

```
adb install-multiple -S 512 ^
  base.apk split_config.arm64_v8a.apk split_config.xxxhdpi.apk split_config.en.apk
```

- Pick the ABI split matching your phone (arm64-v8a for almost all modern phones).
- Density: xxxhdpi suits most flagships; hdpi/xhdpi alternatives exist in the folder.
- Language: `en` is listable; more language splits can be added to the same command
  (they will be installed as additional splits of the same package).
- The `-S 512` bumps the per-stream size limit for this large base APK.

Files are in `work\bundles\alarmy_26.34.1-signed\` (same layout as the original).

## What does NOT survive

- **Google Play billing / subscriptions**: an APK installed outside the
  Play Store with a non-Play signature will fail license/billing checks —
  premium entitlements tied to the Play Store purchase history may not work.
- **Play Integrity / Play-protected features** may refuse the re-signed app.
- Local alarm functionality itself (alarms, sounds, camera, tracking)
  does not depend on the signature once installed.

## Not tested

No claim is made that the app has been launch-tested on a device. Static
verification (apktool decode, aapt badging, zipalign, apksigner verify) passed;
only a real install on your phone can confirm end-to-end behavior.
