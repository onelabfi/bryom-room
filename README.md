# Bryom Room

A regulation room for neurodivergent users — built for the Bryom app.

Users pick **how they feel** (not what they want to play) and are routed to a zone that matches their nervous system state. No failure states, no dark patterns, no ads, no IAP.

## V1 scope

Two zones active. Calm and Fidget stubbed as "Coming soon."

| Zone    | Games                                         | Purpose                                      |
| ------- | --------------------------------------------- | -------------------------------------------- |
| Focus   | Trail Runner · Orb Matcher · Sequence Tap     | Warm up attention without pressure           |
| Release | Troll Blaster · Smash Field · Pulse Burst     | Move pressure out, with automatic cooldown   |

Release games are followed by a **mandatory 30s de-escalation outro** (breathing light) before returning to the zone.

## State-based entry

`/` → "How are you feeling?" → 6 feelings → recommended zone. Users can also skip and pick a zone directly.

Feelings map:
- Overwhelmed → Calm
- Restless → Fidget
- Foggy → Focus
- Tense → Release
- Flat → Focus
- Just browsing → Focus (user can navigate)

## Analytics events (from day 1)

The app emits five events through a registered handler. Until a handler is registered, events are no-ops in prod (and logged in dev).

| Event         | Payload                                                         |
| ------------- | --------------------------------------------------------------- |
| `room_enter`  | `ts`                                                            |
| `zone_enter`  | `ts, zone`                                                      |
| `game_start`  | `ts, zone, game, recommended`                                   |
| `game_end`    | `ts, zone, game, durationMs, completed, reason`                 |
| `state_after` | `ts, zone, game, feeling`                                       |

Register a handler in the host app:

```ts
import { setAnalyticsHandler } from "./lib/analytics";

setAnalyticsHandler((e) => {
  bryomAnalytics.track(e.type, e);
});
```

## Tech

- Next.js 16 (App Router, Turbopack)
- Phaser 3 (games, lazy-loaded per scene)
- Tailwind v4 (shell UI)
- Framer Motion (entry transitions, mascot)
- Zustand (sensory settings, localStorage-persisted)

## Run locally

```bash
npm install
npm run dev        # http://localhost:3000
npm run build
npm run lint
```

## Integration into Bryom — three options

### 1. Route drop-in (recommended if Bryom is Next.js)
Copy these into Bryom's repo:

```
app/page.tsx                     → Bryom: app/room/page.tsx
app/room/[zone]/page.tsx         → Bryom: app/room/[zone]/page.tsx
app/room/play/[game]/page.tsx    → Bryom: app/room/play/[game]/page.tsx
components/room/*                → Bryom: components/room/*
lib/sensory.ts, analytics.ts,
  state.ts, orientation.ts       → Bryom: lib/*
games/**                         → Bryom: games/**
```

Then register an analytics handler in Bryom's root layout and swap the placeholder `Mascot.tsx` SVG for the real Bryom reindeer sprites.

### 2. Iframe / WebView embed (fastest)
Just point an iframe or WebView at `https://bryom-room.vercel.app/`. Pass user context via postMessage if needed. Zero code merge.

### 3. Component mount (future)
Extract into a `@onelabfi/bryom-room` npm package. Not built yet — do this only if multiple apps need to embed.

## Sensory guarantees

- **Landscape only.** Portrait shows a rotate prompt.
- **No failure states.** Soft fades and mascot reactions only.
- **Motion cap** (low/medium/high) scales game speeds.
- **Warm tint** overlay for light sensitivity.
- **Haptics** can be disabled globally.
- **Session caps.** Release games hard-cap at 90s.
- **No flashing > 3Hz.**
- **Phaser audio is muted by default** until user interaction (Web Audio).

## Placeholder assets

The reindeer in `components/room/Mascot.tsx` is a hand-drawn SVG placeholder.
Replace with Bryom's sprite pack — the component accepts `size` and `mood` props (`idle | happy | sleepy | cheer`).

## Project structure

```
app/
├── layout.tsx                # sensory boot, landscape guard
├── page.tsx                  # FeelingSelector (entry)
├── room/[zone]/page.tsx      # ZoneView
└── room/play/[game]/page.tsx # GameShell

components/room/
├── FeelingSelector.tsx
├── ZoneView.tsx
├── GameShell.tsx
├── DeescalationOutro.tsx
├── StateAfter.tsx
├── SensoryPanel.tsx
├── SensoryBoot.tsx
├── RotatePrompt.tsx
└── Mascot.tsx

games/
├── shared.ts
├── focus/{TrailRunner,OrbMatcher,SequenceTap}.ts
└── release/{TrollBlaster,SmashField,PulseBurst}.ts

lib/
├── analytics.ts  # track(), setAnalyticsHandler()
├── sensory.ts    # zustand store
├── state.ts      # FEELINGS, ZONE_META, GAMES
└── orientation.ts
```

## Roadmap

- [ ] Calm zone (5 experiences: Breathing Light, Flow Lines, Color Drift, Rain Field, Floating Objects)
- [ ] Fidget zone (Pop Grid, Spinner, Stretch & Snap, Tap Storm, Pattern Drawer)
- [ ] Replace placeholder reindeer with Bryom sprite pack
- [ ] Wire analytics handler to Bryom's existing pipeline
- [ ] PWA manifest + iOS standalone support
- [ ] Per-game tutorials (one-tap skippable)
- [ ] Zone recommendation learning from `state_after` feedback
