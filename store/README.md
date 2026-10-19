# Publishing FELEX Meet in the Microsoft Store

Why: the installer you download from GitHub is not signed, so Windows shows "Windows protected your PC". Apps installed from the
**Microsoft Store** are signed by Microsoft, update themselves, and install with no warning. Registering as a Store developer is free
(individuals since September 2025, companies since May 2026; check the sign-up page for the current terms).

The existing installer release (`release.yml`, `FELEX-Meet-Setup.exe`) is not touched by any of this. Keep it for people who prefer a download.

## What is in this folder
- `electron-builder.store.json`: the Store build settings (an AppX package; the three identity values come from Partner Center).
- `make-assets.ps1`: regenerates the Store logos in `build/appx/` from `build/icon.png`.
- `LISTING.md`: the text for the Store page, ready to paste.
- `screenshots/`: Store screenshots (1920 x 1080). Add one of the real app in a meeting before you submit if you can.
- `.github/workflows/store.yml`: builds the package on GitHub (Actions > Store package > Run workflow).
- `src/main.js` knows when it is running from the Store (`process.windowsStore`): it turns off the built-in updater (the Store updates it)
  and leaves the Windows app ID alone.

## Steps (you do 1 to 3 and 6; the rest is built)
1. **Register** at https://storedeveloper.microsoft.com (Partner Center). Choose the account type (individual or company), sign in with a
   Microsoft account, and complete identity verification. Free of charge at the time of writing.
2. **Reserve the app name** "FELEX Meet" (Apps and games > New product > MSIX or PWA app). If the name is taken, pick "FELEX Meet by FELEX".
3. **Copy the Product identity**: Product management > Product identity. You need three values, copied EXACTLY (they must match character for character):
   | Partner Center field | GitHub repository variable |
   |---|---|
   | Package/Identity/Name | `STORE_IDENTITY_NAME` |
   | Package/Identity/Publisher (looks like `CN=xxxxxxxx-xxxx-...`) | `STORE_PUBLISHER` |
   | Package/Properties/PublisherDisplayName | `STORE_PUBLISHER_DISPLAY_NAME` |

   Add them at https://github.com/alkamara-dev/felex-meet-desktop/settings/variables/actions (New repository variable, three times). They are
   identifiers, not secrets.
4. **Build the package**: GitHub > Actions > "Store package" > Run workflow. When it finishes, download the artifact `FELEX-Meet-Store-package`
   (a zip containing `FELEX-Meet-Store.appx`). The package version is the `version` in `package.json` with a `.0` added (1.0.1 becomes 1.0.1.0);
   raise `version` for every new submission.
5. **Fill in the Store page** with `LISTING.md` (description, categories, privacy policy, screenshots from `screenshots/`).
6. **Submit** in Partner Center: upload the `.appx`, pricing "Free", age rating questionnaire, then submit for certification. In "Notes for
   certification" give a TEST account (an email and password for a throwaway FELEX Meet account) so the reviewer can sign in. Do not put that
   password anywhere else. Certification usually takes a few days.

## After it is published
- Send the Store link to Claude (or edit `apps/web/src/app/(meet)/meet-app/download/page.tsx` yourself): the Windows card on
  meet.felexuss.com/download should lead with "Get it from Microsoft Store" and keep the direct download as the second choice.
- To ship a new version: raise `version` in `package.json`, run the Store package workflow again, upload the new package as a new submission.
  (The direct installer is released separately by tagging `v1.0.2` and so on, as before.)

## Things to know
- The Store has a quality rule (policy 10.1.4) about apps that add little beyond a website. FELEX Meet adds a real screen and window picker for
  sharing, its own window and taskbar icon, and notifications; the listing says so honestly. If certification is refused, the message says why;
  fix and resubmit. The direct installer keeps working either way.
- Signing the direct installer instead (so the GitHub download also stops warning) costs money and still needs download volume to build
  SmartScreen reputation: Microsoft's current guidance is that EV certificates no longer skip that. Not needed if the Store route works.
