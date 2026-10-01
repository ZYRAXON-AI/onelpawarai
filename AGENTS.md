<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Cross-platform by default

Every project in this folder must run on Windows, Linux and macOS.

- Relative paths only. No hardcoded `/home/...`, `/Users/...` or `C:\...`.
- No OS-specific shell commands. Detect the platform or use a library.
- POSIX-only scripts. Avoid GNU-only flags (`sed -i` without a suffix,
  `readlink -f`, `grep -P`, `date -d`).
- Ship installers for all three platforms (`.exe`, `.dmg`, `.AppImage` / `.deb`)
  using electron-builder, Tauri, PyInstaller, or a GitHub Actions matrix.
- Verify with `bash scripts/platform-check.sh .` before finishing.

## Any app can become an iPhone app

Use the `cross-platform-mobile` skill.

- Instant install, no Mac and no store: `manifest.webmanifest`, `sw.js`,
  `apple-touch-icon.png` plus HTTPS, then on the iPhone:
  Safari -> Share -> Add to Home Screen.
- Real App Store / TestFlight build:
  `bash scripts/make-ios-app.sh . "AppName" "com.company.appname"`, then Xcode
  on a Mac, or Codemagic in the cloud.
- Always tell the user how to install the iPhone app.

## Always give a live link

When a website or web app is built, hand over a URL the user can open, not just
the repository.

