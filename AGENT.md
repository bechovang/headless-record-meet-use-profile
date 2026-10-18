# AGENT.md - Guidelines for AI Coding Assistants 🤖

This document provides context, architecture details, and operational instructions for AI Agents (Cursor, Copilot, Antigravity, Claude, ChatGPT, etc.) working on this repository.

---

## 📌 Project Overview

This repository provides an automated Google Meet recorder built with **Playwright** and **TypeScript** (executed using `tsx` on Node.js or `bun`).

### Primary Capabilities:
- **Persistent Google Authentication:** Runs through an ephemeral or saved persistent browser context (`./user_data`) so it can join meetings restricted to authenticated Google / Google Workspace users.
- **Headless Composite A/V Recording:** Uses `getDisplayMedia` to capture the tab canvas and `WebAudio API` to route all `<video>` / `<audio>` elements into an `AudioContext` destination, merging both tracks into a `MediaRecorder` pipeline producing `.webm` files.
- **Low-memory Stream-to-Disk:** Chunks of recorded media are streamed directly to disk via `context.exposeFunction('saveRecordingChunk')` every 1 second, saving files in `./recordings/`.
- **Auto-Join & Auto-Exit:** Handles overlay dismissals ("Got it", "Dismiss"), auto-mutes mic/camera, auto-clicks join buttons (multilingual: EN & VI), and auto-quits when the meeting ends or when alone in the room.

---

## 🛠️ Environment & Runtime Notes

- **Node.js:** Recommended execution runtime on Windows using `npx tsx <file>.ts` due to stability with Playwright persistent contexts and stream IO.
- **Bun:** Also supported for running scripts (`bun meet.ts`), but on Windows `launchPersistentContext` can encounter pipe deadlock; prefer `tsx` on Windows.
- **Playwright Chromium:** Requires installation via `npx playwright install chromium`.
- **Sensitive Directories (Never commit):**
  - `./user_data/`: Contains user session tokens, Google cookies, and local database storage.
  - `./recordings/`: Output destination for `.webm` video recordings.

---

## 🚀 Key Commands for Agents

### 1. Project Setup
```bash
npm install
npx playwright install chromium
```

### 2. Google Authentication Setup (Interactive)
When a user asks to record a meeting requiring login:
```bash
# Must be run with a visible window (headless: false)
npx tsx auth.ts
```
*Prompt the user to complete Google login in the opened Chromium window and close the window once done.*

### 3. Launching the Recorder
```bash
# Basic background (headless) run:
npx tsx meet.ts "<MEET_URL>" "<BOT_NAME>" <DURATION_MINUTES> --headless

# Example: 300 minutes (5 hours) in background:
npx tsx meet.ts "https://meet.google.com/abc-defg-hij" "Bot Note" 300 --headless

# With custom filename:
npx tsx meet.ts "https://meet.google.com/abc-defg-hij" "Bot Note" 300 --headless --filename "my_meeting"

# Stateless mode (Incognito / No saved profile):
npx tsx meet.ts "https://meet.google.com/abc-defg-hij" "Guest Bot" 60 --headless --no-profile
```

---

## 🧩 Code Architecture (`meet.ts`)

1. **Profile Initialization:**
   - Checks for `--no-profile` or custom `--user-data-dir`.
   - Uses `chromium.launchPersistentContext(userDataDir, ...)` to load existing Google login cookies.
2. **Page Navigation & Sanity Checks:**
   - Navigates to target Meet URL with `domcontentloaded`.
   - Scans for invalid meeting markers (404, SPA error banners, "Return to home screen").
3. **Pre-meeting Preparation (`attemptJoin`):**
   - Dismisses dialog overlays (`button:has-text("Got it")`, `button:has-text("Dismiss")`).
   - Mutes mic and camera buttons using ARIA attributes and `data-is-muted` flags.
   - If not logged in, fills the guest name field.
   - Clicks Join button (`Join now`, `Ask to join`, `Tham gia ngay`, `Yêu cầu tham gia`).
4. **Composite Media Pipeline (`startMergedRecording`):**
   - **Evaluated in browser context via raw script string** (avoids bundler/transpiler identifier transformation issues like `__name is not defined`).
   - Hooks into `<audio>` and `<video>` tags dynamically every 3 seconds to catch newly arriving participant audio streams.
   - Writes chunks to Node file stream via `saveRecordingChunk`.
5. **Meeting Monitor Loop:**
   - Runs every 3 seconds.
   - Inspects participant count and tile elements.
   - Triggers graceful `cleanup()` if alone in meeting for > 15 seconds or upon receiving SIGINT/SIGTERM.

---

## 💡 Troubleshooting & Best Practices for Agents

- **Browser doesn't join or gets stuck on login:** Verify `./user_data` exists and has active credentials. If expired, advise user to re-run `npm run auth`.
- **Audio missing in recording:** Ensure Chromium is launched with `--autoplay-policy=no-user-gesture-required` and the bot simulates a user gesture (`page.click('body')`) before starting `MediaRecorder`.
- **Selector changes by Google Meet:** If Meet alters UI classes, inspect DOM attributes via Playwright locator with fallback strings (e.g. `[aria-label*="Join"]`, text matching).
