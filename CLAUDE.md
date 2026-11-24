# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

BrandLab: educational Expo app (Expo SDK 58, React Native 0.88, React 19.3, TypeScript strict) demonstrating real dynamic launcher icons, app labels, and home screen widgets. Android uses activity aliases + Jetpack Glance; iOS uses alternate icons + WidgetKit. Original spec is in `writing-block.md`. Requires a custom dev build — does not run in Expo Go. Not a git repo.

## Commands

```sh
yarn install
yarn typecheck                 # tsc --noEmit
yarn test                      # jest --runInBand (jest-expo preset)
yarn test src/services/__tests__/storageService.test.ts   # single test file
yarn test -t "test name"       # single test by name
yarn expo install --check      # verify dependency compatibility
npx expo prebuild              # regenerate android/ and ios/
yarn android / yarn ios        # expo run:android / expo run:ios
npx eas-cli build --platform <android|ios> --profile development
swift scripts/generate-icons.swift <output-dir>   # regenerate 1024px icons + Android density PNGs (macOS)
```

Tests live only in `**/__tests__/**/*.test.ts` (`.tsx` tests are not matched). `@/` maps to `src/` in both tsconfig and jest.

## Architecture

Layers (full reference: `docs/PROJECT_CONTEXT.md`):

1. `app/` — Expo Router screens (typed routes). `src/state/BrandingContext.tsx` (`BrandingProvider`) exposes persisted state, theme, capabilities, operation status, and actions.
2. `src/services/` — all business logic. Engagement rules (`engagementService`) map simulator actions to variants; `brandingService.commitBrandingState` saves state then requests native icon + widget updates. UI must not contain state-mapping rules.
3. `src/native/BrandingNative.ts` — `requireOptionalNativeModule('BrandingNative')`; module may be null (Expo Go/tests), so services must handle absence.
4. `modules/dynamic-branding/` — local Expo Module: Kotlin (`android/.../BrandingNativeModule.kt`, `BrandLabWidget.kt` Glance widget) and Swift (`ios/BrandingNativeModule.swift`). Methods: `getCapabilities`, `getActiveIcon`, `setIcon`, `setAppName`, `updateWidget`. Each returns `{ ok, message }`; never report success when the platform call failed.

Operation results: the context keeps one `status` tagged with an `OperationKind` (`icon | name | widget | scenario`). Screens render `<OperationNotice kinds={[...]}>` so a result only shows on the screen that caused it.

Routing: `app-name` is a tab hidden via `tabBarButton: () => null`. Don't use `href: null`; it makes the route unreachable. Don't set a fixed `tabBarStyle.height`/`paddingBottom`; that breaks the safe-area inset on Android gesture/nav bars.

State: canonical `BrandingState` in AsyncStorage key `brandlab.state.v1`. Widgets run out-of-process and read a `WidgetPayload` projection: Android via app `SharedPreferences` then `updateAll`; iOS via `UserDefaults(suiteName: "group.com.brandlab.demo")` then `WidgetCenter.reloadAllTimelines`.

## Generated native folders

`android/` and `ios/` are Prebuild output and are gitignored (CNG). Never edit them for durable changes; put native changes in `modules/`, `plugins/with-brandlab-native.js`, `targets/widget/`, or `app.config.ts`. `npx expo prebuild --clean` is safe and recreates both folders.

`plugins/with-brandlab-native.js` generates: 20 Android `activity-alias` entries (5 icons × 4 labels, named `BrandLab_<variant>_<labelKey>`), label strings, widget receiver/metadata, copies density icons from `assets/icons/android/`, iOS `AppIcon-<Variant>` asset sets, and `ASSETCATALOG_COMPILER_ALTERNATE_APPICON_NAMES`. `@bacons/apple-targets` links `targets/widget/` (iOS 17 min).

## Hardcoded values that must stay in sync

Adding/renaming a variant or app-name preset requires editing all of:
- Variants (`default, happy, sleepy, sad, celebration`): `src/constants/branding.ts`, `src/types/branding.ts`, plugin `variants`, Kotlin `variants`, Swift `AppIcon-<Capitalized>` mapping, `scripts/generate-icons.swift`, icon assets.
- Name presets (`default/active/focus/celebration` keys ↔ labels): `APP_NAME_OPTIONS` in `src/constants/branding.ts`, plugin `namePresets`, Kotlin label list in `BrandingNativeModule.kt`. Android only; iOS cannot rename at runtime.
- App Group `group.com.brandlab.demo`: `app.config.ts`, `targets/widget/expo-target.config.js`, `BrandingNativeModule.swift`, `targets/widget/BrandLabWidget.swift`.

Then rerun `npx expo prebuild`. iOS signing needs `ios.appleTeamId` in `app.config.ts`.

Platform constraints (launcher caching, widget refresh budgets, no iOS runtime rename) are in `docs/PROJECT_CONTEXT.md` (sections 12–13). Keep that doc updated when architecture, sync points, or gotchas change.
