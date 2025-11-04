# SoloSlate

SoloSlate is a browser-first assistant for solo filmmakers who need to wrangle shot lists without leaving the camera. Import your CSV, log takes hands-free with voice commands, jot notes, and export clean reports — all offline.

## Features

- **CSV import/export** powered by Papa Parse with automatic scene/shot normalisation.
- **Hands-free voice control** (via the Web Speech API) for new takes, marking good/bad, completing shots, adding notes, and navigating.
- **Local persistence** with Zustand + `localStorage`, so your data survives refreshes without any backend.
- **EDL-lite export** to quickly hand off timing notes with ISO timestamps.
- **Keyboard shortcuts & toasts** to keep track of actions even when the mic is off.
- **Tailwind-styled interface** optimised for quick scanning and a clean dark workspace.

## Project Structure

```
soloslate/
  public/
    sample.csv
  src/
    components/
    hooks/
    utils/
    App.tsx
    main.tsx
  index.html
  package.json
  tailwind.config.js
```

## Getting Started

> **Note:** Package installation requires internet access. If you're offline, clone the repo and install dependencies when connected.

```bash
cd soloslate
npm install
npm run dev
```

Open the Vite dev server (usually <http://localhost:5173>) to use the app.

## Keyboard & Voice Cheatsheet

| Action | Keyboard | Voice |
| --- | --- | --- |
| New take | `Enter` | “new take” |
| Mark good | `G` | “mark good” |
| Mark bad | `B` | “mark bad” |
| Add note | `N` | “note boom in frame” |
| Complete shot | — | “complete shot” / “mark shot three done” |
| Next/previous shot | `→` / `←` | “next shot” / “previous shot” |
| Set lens | — | “set lens 35 millimeter” |
| Set framing | — | “set framing close up” |

## 60-Second Demo Script

1. Import `sample.csv` from the toolbar.
2. Click the mic, then say: “new take … mark good … note ‘boom in frame’ … mark shot three done … next shot.”
3. Watch the take timeline update with timestamps and note badges.
4. Export CSV and EDL-lite, then open the downloaded files.
5. Refresh the page to confirm your state persists. Use **Reset** to clear everything when you’re done.

## Tech Stack

- React + TypeScript + Vite
- Zustand state management with persistence
- Tailwind CSS for styling
- Web Speech API for recognition (`webkitSpeechRecognition` fallback)
- Papa Parse for CSV handling

Enjoy a quieter slate! 

