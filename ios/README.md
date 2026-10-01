# iOS packaging

This folder is a Capacitor wrapper. It takes the web app in the parent folder
and packages it as a native iOS app.

## Option A - install instantly, no Mac, no store

Host the parent folder over HTTPS and open it in Safari on the iPhone:

1. Share
2. Add to Home Screen

It installs as a full-screen app with its own icon. The PWA files
(`manifest.webmanifest`, `sw.js`, `apple-touch-icon.png`) make this work.

## Option B - a real .ipa for TestFlight or the App Store

On a Mac with Xcode:

```bash
npm install
npx cap add ios
npx cap sync ios
npx cap open ios      # Product > Run, or Product > Archive
```

On Linux or Windows (no Mac needed), use the cloud build:

1. Push this repository to GitHub.
2. Import it into Codemagic.
3. Add an App Store Connect integration named `ZyraxonAppStore`.
4. Run the `ios-release` workflow in `codemagic.yaml`.

Codemagic builds and signs the `.ipa` for you.

## Notes

- `webDir` points at `..` on purpose, so the wrapper packages the parent folder
  without copying files around.
- Change `appId` in `capacitor.config.json` to your own bundle identifier before
  shipping to the App Store.
