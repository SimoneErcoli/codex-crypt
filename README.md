# Codex Crypt

Offline-first web application for managing role-playing campaigns in a single JSON file, now structured as a Next.js App Router project.

## What it does

Codex Crypt is a lightweight campaign manager for Game Masters. The UI runs client-side, while the project itself is organized as a modern Next.js application.

Implemented features:

- Entity linking between locations and NPCs from text content.
- Interactive map with markers saved into the campaign JSON.
- Timeline for world events.
- Session journal for recent play notes.
- Quick generators for names and loot.
- Client-side encrypted export/import using Web Crypto (`AES-GCM` + `PBKDF2`).

## Project structure

- `app/`: Next.js App Router entrypoint and global styles.
- `components/`: client React components.
- `lib/`: campaign utilities, JSON normalization, encryption helpers.
- `examples/`: sample campaign JSON file.

## Run it

Requirements:

- Node.js `20.9.0` or newer.

Install and start the development server:

1. `npm install`
2. `npm run dev`
3. Open `http://localhost:3000`
4. The app starts with an empty campaign state
5. Use `Carica demo` or import `examples/campagna_fantasy.json`
6. Modify the campaign directly in the UI
7. Export as plain `.json` or encrypted `.enc`

## Encrypted archive format

Encrypted exports are JSON envelopes with this structure:

```json
{
  "format": "codex-crypt.enc.v1",
  "algorithm": "AES-GCM",
  "created_at": "2026-04-20T08:00:00.000Z",
  "kdf": {
    "name": "PBKDF2",
    "hash": "SHA-256",
    "iterations": 250000,
    "salt": "..."
  },
  "iv": "...",
  "ciphertext": "..."
}
```

The password never leaves the browser. Without the password, the exported `.enc` file is not readable.

## Campaign schema

The app normalizes a permissive JSON format. The canonical structure is:

```json
{
  "world_name": "Terre Alte",
  "summary": "Panoramica campagna",
  "locations": [
    {
      "id": "loc_drago",
      "name": "Locanda del Drago",
      "type": "Locanda",
      "description": "Posto sporco ma economico."
    }
  ],
  "npcs": [
    {
      "id": "npc_grog",
      "name": "Grog",
      "race": "Orco",
      "role": "Buttafuori",
      "location_ref": "loc_drago"
    }
  ],
  "events": [],
  "session_log": {
    "entries": []
  },
  "map": {
    "image_data": "data:image/...",
    "image_width": 1400,
    "image_height": 900,
    "markers": [
      {
        "id": "marker_secret",
        "x": 600,
        "y": 510,
        "x_ratio": 0.4286,
        "y_ratio": 0.5667,
        "label": "Ingresso segreto"
      }
    ]
  }
}
```
