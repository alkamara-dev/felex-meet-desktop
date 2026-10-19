# FELEX Meet for desktop

The desktop app for [FELEX Meet](https://meet.felexuss.com), video meetings for small businesses by
FELEX Universal Services LLC.

**Download for Windows:** [FELEX-Meet-Setup.exe](https://github.com/alkamara-dev/felex-meet-desktop/releases/latest/download/FELEX-Meet-Setup.exe)

On Mac, iPhone and Android, install FELEX Meet from your browser instead: see
[meet.felexuss.com/download](https://meet.felexuss.com/download).

## What it does

It opens meet.felexuss.com in its own window and adds what a browser tab can't do as well:

- a screen and window picker for screen sharing;
- its own taskbar icon and Start-menu entry;
- automatic updates from this repository's releases.

The app contains no accounts or secrets. Sign-in happens on meet.felexuss.com as usual.

## Releasing a new version

1. Change `version` in `package.json` (for example `1.0.1`) and commit.
2. Tag and push: `git tag v1.0.1 && git push origin main v1.0.1`.
3. The **Release** workflow builds `FELEX-Meet-Setup.exe` on GitHub and publishes it.
   Installed apps update themselves the next time they are closed.

The installer is not code-signed yet, so Windows shows "Windows protected your PC" the
first time: choose **More info → Run anyway**.

## Develop

```bash
npm install
npm start          # runs against https://meet.felexuss.com
npm run dist:win   # local installer in release/ (no upload)
```

## Microsoft Store

The direct installer is not code-signed, so Windows shows a warning the first time. The Microsoft Store version is signed by Microsoft and installs with no warning; the build setup, listing text and the step-by-step guide are in [`store/`](store/README.md).
