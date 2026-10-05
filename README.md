# emir.lol — gece istasyonu

A quiet, responsive homepage with a CSS landscape, three scenes, locally generated ambient audio, a persistent focus timer, notes and tasks. Turkish interface; no build step, dependencies, analytics or external media requests.

## Run

Serve this directory with any static server, e.g. `python3 -m http.server 8080`, then open http://localhost:8080. GitHub Pages can serve the root directly. All asset paths are relative, so repository subpaths work.

## Features

- Night, sunset and forest palettes; optional canvas rain respecting reduced motion and page visibility.
- 25-minute focus, 5/15-minute breaks; absolute deadline survives background tabs and reloads. Session counts use the local calendar day. Sessions never start automatically.
- Existing `emir-notes` data is preserved. Notes export as plain text; tasks are rendered using textContent.
- Three independent Web Audio channels with saved volume preferences. No autoplay; all sounds are synthesized locally, not streamed music.
- Keyboard-accessible native command dialog (Ctrl/Cmd K), visible focus indicators and a mobile-accessible exit from zen mode.

## Storage and privacy

Notes, tasks, scene, timer and settings stay in localStorage on this browser and origin. Clearing site data removes them; notes can be exported first. Storage failures do not prevent the homepage from loading. Sound does not restart after a refresh. Links to external services open only when clicked.

## Files

- `index.html`: semantic interface
- `style.css`: responsive layout and illustrated landscape
- `app.js`: local state, timer, canvas, audio and keyboard controls
- `favicon.svg`: site icon

## Shortcuts

Outside form controls: Space timer, F zen, 1/2/3 scene, R rain, M mute, N notes. Escape exits zen or closes the command dialog. Shortcuts do not intercept typing in notes or tasks.

## Immersive atmospheres

The scene selector changes the full-page landscape, cards, controls, dialog and browser theme color. Forest includes layered tree silhouettes and gentle mist; motion preferences disable the mist. Rain visuals cover the viewport and remain independent from sound.

The prominent rain button and S shortcut toggle stereo synthesized rain. Drizzle, window rain and downpour profiles change its tone, loudness and visual density. These are procedural sounds, not field recordings. The optional 15/30/60-minute sleep timer stops all audio; it resets on reload.

Run state tests with `node --test tests/*.test.cjs`. Audio tests use a mock Web Audio context to verify controls and cleanup; they do not validate perceived sound quality. Browser visual and listening checks remain necessary.
