# Google Meet Recorder with Profile & Headless Support 🎥

A robust bot to record Google Meet sessions with synchronized audio and video using **Playwright** (running with **Node.js / tsx** or **Bun**).

Supports **persistent Google login profiles** (to join meetings requiring authentication), **headless background recording**, automatic overlay dismissal, mic/camera auto-mute, kick & auto-exit detection, and stream-to-disk recording in `.webm` format.

---

## ✨ Key Features

| Feature | Details |
|---|---|
| 🔐 **Persistent Google Profile** | Run login once via `npm run auth` (or `bun run auth`), save cookies/session into `./user_data`, and join meetings that require Google login. |
| 🎬 **Headless Mode** | Pass `--headless` to record completely in the background without opening a browser window. |
| 🎥 **Composite A/V Recording** | Captures tab video via `getDisplayMedia` and page audio via `WebAudio`, merging them into a `.webm` file using `MediaRecorder`. |
| 📝 **Custom Filenames & Duration** | Specify duration in minutes (e.g. `300` for 5 hours) and custom file name with `--filename`. |
| 🤖 **Intelligent Auto-Join** | Automatically dismisses overlays ("Dismiss"/"Got it"/"OK"), mutes mic & camera, and clicks "Join now" / "Ask to join" (supports both English and Vietnamese UI). |
| ⏱️ **Smart Auto-Exit** | Monitors participant count and automatically leaves and saves the recording when the meeting ends or participants leave. |
| 💾 **Chunked Streaming** | Writes video data chunk-by-chunk directly to disk, keeping memory footprint low and preserving recorded footage even on sudden interruptions. |

---

## 🚀 Quick Start (Local Machine)

### 1. Install Dependencies & Chromium
Make sure you have Node.js (or Bun) installed, then run:

```bash
npm install
npx playwright install chromium
```

---

### 2. Login to Google (One-time Setup)
If your meeting requires Google authentication, run:

```bash
npm run auth
# or: npx tsx auth.ts
```

1. A Chromium browser window will open at Google Accounts.
2. Sign in with your Google Account (including 2FA if enabled).
3. Once logged in, simply **close the browser window**.
4. Your login session will be safely preserved in `./user_data/` (this folder is ignored in `.gitignore`).

---

### 3. Start Recording

#### Record in Headless Mode (Background)
```bash
npx tsx meet.ts "https://meet.google.com/your-meet-id" "Bot Name" 300 --headless
```

#### Record with Custom Filename
```bash
npx tsx meet.ts "https://meet.google.com/your-meet-id" "Bot Name" 300 --headless --filename "meeting-recording"
```

#### Run Stateless (Incognito / No Profile)
If you don't want to use the saved Google profile and prefer a guest session:
```bash
npx tsx meet.ts "https://meet.google.com/your-meet-id" "Guest Bot" 60 --no-profile
```

---

## ⚙️ CLI Arguments

```bash
npx tsx meet.ts "<MEET_URL>" "[BOT_NAME]" [DURATION_MINS] [--headless] [--filename <name>] [--no-profile] [--user-data-dir <path>]
```

| Argument | Required | Default | Description |
|---|---|---|---|
| `<MEET_URL>` | ✅ | — | Google Meet URL (e.g. `https://meet.google.com/abc-defg-hij`) |
| `[BOT_NAME]` | ❌ | `Shadow NoteTaker` | Display name of the bot |
| `[DURATION_MINS]` | ❌ | `15` | Maximum recording duration in minutes (e.g. `300` for 5h) |
| `--headless` | ❌ | `false` | Run Chromium without opening a visible window |
| `--filename` | ❌ | `<meetingId>_<timestamp>.webm` | Custom output filename |
| `--no-profile` | ❌ | `false` | Run in incognito mode (do not load `./user_data`) |
| `--user-data-dir` | ❌ | `./user_data` | Custom path to store/load browser profile |

---

## 📂 Output

All recorded files are saved directly to:
```
./recordings/<filename>.webm
```

You can stop recording at any time by pressing `Ctrl + C` in your terminal. The bot will stop the stream, leave the call cleanly, and flush the remaining video chunks to the file.
