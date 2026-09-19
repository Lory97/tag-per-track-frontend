# 🌐 Tag-per-Track Frontend (`tag-per-track-frontend`)

**Tag-per-Track Frontend** is the official showcase and interactive testing playground for the **Tag-per-Track** automated audio analysis API. It enables users, music labels, and developers to upload tracks, preview playback, execute pay-per-use **x402 micro-payments in USDC on Base**, and visualize comprehensive musical and A&R insights in real-time.

---

## ✨ Features

- **Interactive Audio Playground**:
  - Drag & drop local audio file upload (MP3, WAV, FLAC, OGG) or pre-loaded sample tracks.
  - Interactive audio player with waveform preview.
  - Optional Whisper lyrics transcription toggle ($0.10 USDC vs $0.05 USDC).
- **Seamless Web3 & x402 Micropayments**:
  - Integrated with **Reown AppKit** (formerly Web3Modal) and **Wagmi** on Base Mainnet.
  - Automatic handling of the HTTP 402 flow: probes endpoint, displays payment invoice modal, requests EIP-712 signature (`TransferWithAuthorization`), and re-executes with `X-Payment-Proof`.
  - Displays on-chain transaction hash and BaseScan explorer links upon settlement.
- **Rich Music Metadata Visualization**:
  - **Acoustic Profile**: BPM, Musical Key & Scale, Discogs Genre classification with confidence bars, Jamendo Moods & Themes, Instruments detected.
  - **Lyrics & Transcription**: High-precision OpenAI Whisper lyrics when toggled.
- **A&R Qualification & Spotify Traction**:
  - Real-time artist search (`/api/artist-stats`).
  - Monthly listeners, followers, popularity index, and Spotify artist direct link.
- **Internationalization (i18n)**:
  - Instant French 🇫🇷 / English 🇬🇧 language switching.

---

## 🛠 Tech Stack

- **Framework**: Angular 18 (Standalone Components, Signals reactive state)
- **Styling**: TailwindCSS with modern dark-mode aesthetic and glassmorphism
- **Web3 Integration**: `@reown/appkit`, `@wagmi/core`, `viem`, `ox`
- **Icons**: `lucide-angular`

---

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- npm 10+

### Installation

```bash
npm install
```

### Development Server

Run the local development server:

```bash
npm start
# or
ng serve
```

Navigate to `http://localhost:4200/`. The app will automatically reload when you modify source files.

### Production Build

```bash
npm run build
```

Build artifacts are generated in `dist/frontend/browser/`.

---

## 📡 Configuration & Environment

The API endpoint and network parameters are configured in `src/environments/`:

- `src/environments/environment.ts` (Development)
- `src/environments/environment.prod.ts` (Production)

---

## 🚀 Deployment

1. **Build the production bundle**:
   ```bash
   npm run build
   ```
   The compiled static files will be generated in `dist/frontend/browser/`.

2. **Serve with any static web server** (Nginx, Caddy, Cloudflare Pages, Vercel, Netlify, etc.):
   Because this is a Single Page Application (SPA), ensure your server routes all client-side navigation requests to `index.html`.

   <details>
   <summary>Example Nginx Configuration</summary>

   ```nginx
   server {
       listen 80;
       server_name example.com;
       root /var/www/tag-per-track;
       index index.html;

       location / {
           try_files $uri $uri/ /index.html;
       }

       # Cache static assets
       location ~* \.(?:css|js|woff2?|svg|png|jpg|jpeg|gif|ico)$ {
           expires 1y;
           add_header Cache-Control "public, immutable";
       }
   }
   ```
   </details>

---

## 📄 License

MIT
