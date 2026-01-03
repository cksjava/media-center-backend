# Media Center – Backend

<!--
Screenshot
Replace the image path below with the actual screenshot if needed.
The same screenshot is intentionally used in both frontend and backend READMEs
to reflect a tightly-coupled system.
-->
<p align="center">
  <img src="./docs/screenshot.png" alt="Nostalgia Music Player UI" width="900" />
</p>

Nostalgia Backend is a local media library and playback server built with Node.js, Express, TypeScript, Sequelize, and SQLite.

It is responsible for scanning music directories, extracting and normalizing metadata, managing albums, artists, playlists, and favourites, and serving data to the Nostalgia frontend.

This backend is designed to work in tandem with the frontend UI:

Frontend repository:  
https://github.com/cksjava/media-center-frontend.git

---

## Responsibilities

The backend acts as the single source of truth for all music data.

- Scan directories and index audio files
- Extract and normalize audio metadata
- Manage albums, artists, tracks, composers
- Store and serve album cover art
- Manage playlists and favourites
- Maintain scan state and library settings
- Expose a REST API consumed by the frontend

The frontend never parses audio files or reads metadata directly.

---

## Technology Stack

- Node.js
- Express
- TypeScript
- Sequelize ORM
- SQLite database

---

## Project Structure (simplified)

```

src/
├── api/              # Express route handlers
├── services/         # Scanning, metadata extraction, playback logic
├── models/           # Sequelize models
├── config/           # Database and environment configuration
├── utils/            # Shared helpers
└── app.ts            # Express app bootstrap

````

---

## Setup and Installation

### Prerequisites

- Node.js 18 or later
- Linux or macOS recommended for media device access

### Install dependencies

```bash
npm install
````

### Database

The backend uses SQLite. The database file is created automatically on first run.

No external database setup is required.

### Run the server (development)

```bash
npm run dev
```

The API server will start on the configured port (default: `http://localhost:3000`).

---

## Media Scanning

* Music directories are configured via backend settings
* Supported formats include MP3, FLAC, M4A/AAC, and other formats supported by the scanner
* Scans are incremental and safe to run multiple times
* Albums are deduplicated using normalized album titles and album artists where applicable
* Compilation and soundtrack albums are handled correctly

---

## Cover Art Handling

* Embedded cover art is extracted during scan
* Covers are stored on disk
* Album records store relative cover paths
* Cover images are served via a static `/covers` endpoint

---

## API Usage

The backend exposes a REST API consumed by the frontend.

Typical responsibilities include:

* Listing albums and tracks
* Fetching album details and album tracks
* Managing playlists and playlist items
* Toggling favourites
* Triggering scans and retrieving scan state

Refer to the frontend repository for usage patterns and API expectations.

---

## Design Principles

* Backend is the authoritative source of metadata
* No audio parsing or file system access in the frontend
* Explicit handling of compilations and mixed-artist albums
* Predictable and debuggable data flow

---

## License

MIT
