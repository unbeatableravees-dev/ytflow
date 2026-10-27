<div align="center">

# 🎬 YTFlow

### Your videos. Your quality. Your control.

**A clean, locally run video inspector and bulk-download manager.**

[![Frontend](https://img.shields.io/badge/UI-React%2019-149eca?logo=react&logoColor=white)](./frontend)
[![Backend](https://img.shields.io/badge/API-Express-222222?logo=express&logoColor=white)](./backend)
[![TypeScript](https://img.shields.io/badge/Frontend-TypeScript-3178c6?logo=typescript&logoColor=white)](./frontend)

[Open YTFlow](https://ytdownloader-d4673.web.app) · [Quick start](#-run-locally) · [Troubleshooting](#-troubleshooting)

</div>

---

## 👨‍💻 Developer

**Ravees Altaf** — Founder and developer of YTFlow; creator of Roohani Alfaz.

- GitHub: [@unbeatableravees-dev](https://github.com/unbeatableravees-dev)
- GitHub: [@unbeatableravees](https://github.com/unbeatableravees)
- Instagram: [@bismil.writzz](https://instagram.com/bismil.writzz)

## ✨ What it does

## ✨ What it does

- 🔎 Inspect supported video links and YouTube channels.
- 📚 Browse channel uploads and add selected videos to a download queue.
- ⚡ Run multiple downloads with live progress, speed, and ETA updates.
- 🎚️ Configure up to 40 simultaneous download jobs; actual speed depends on your network and the source.
- ⏱️ Track elapsed download time alongside the estimated time remaining.
- 🎞️ Download video with merged audio, or choose audio-only formats.
- 📦 Download completed items individually or export a batch as a ZIP.
- 🧹 Manage queue history and completed-download history locally.
- 🛡️ Keep download processing on your own machine when using the local setup.

> Download only media you own or have permission to use, and follow the source platform's terms.

## 🧰 Built with

| App | Stack |
| --- | --- |
| Frontend | React, TypeScript, Vite, Tailwind CSS |
| Backend | Node.js, Express, yt-dlp |
| Media processing | FFmpeg |

## 🚀 Run locally

### Requirements

- Node.js 20 or newer and npm
- Python 3.11 or newer
- [`uv`](https://docs.astral.sh/uv/) to prepare the Python environment
- FFmpeg available on `PATH` for merging and converting media

### Install

From the repository root in PowerShell:

```powershell
npm run install:all
uv python install 3.11
uv venv --python 3.11 backend\venv311
uv pip install --python backend\venv311\Scripts\python.exe yt-dlp
```

Start the API and UI in separate terminals:

```powershell
npm run dev:backend
```

```powershell
npm run dev:frontend
```

Open **http://localhost:5173**. The Vite development server proxies `/api` to the local backend at `http://localhost:5000`.

## ⚙️ Configuration

| Variable | Purpose |
| --- | --- |
| `PORT` | Backend listen port (defaults to `5000`) |
| `VITE_API_BASE_URL` | Optional deployed backend API base URL, including `/api` |

Firebase Hosting serves the static frontend only. A separately hosted backend is required for channel analysis and downloads on the deployed site; no backend host is configured by this repository.

## 🧯 Troubleshooting

- **Backend unavailable:** Start the backend and confirm `http://localhost:5000/api/health` responds.
- **DNS/network errors:** Check that the machine can resolve and reach YouTube. yt-dlp retries transient network failures and uses IPv4.
- **Slow downloads:** Raising concurrent jobs can improve aggregate throughput when bandwidth is available, but cannot guarantee a 10× speed increase. Very high concurrency may cause throttling or HTTP 403 responses.
- **HTTP 403 during a large download:** The downloader retries once with a freshly extracted media URL and one fragment at a time. Some private, restricted, or region-limited videos may still be unavailable.
- **Python warning:** Ensure the backend's `venv311` environment was created with Python 3.11 or later.
- **Audio/video merge errors:** Install FFmpeg and make sure `ffmpeg` is available on `PATH`.
- **Hosted site cannot analyze videos:** Configure `VITE_API_BASE_URL` to a deployed backend's `/api` URL, then rebuild and redeploy the frontend.

## 📁 Project layout

```text
backend/     Express API, yt-dlp engine, download queue
frontend/    React + TypeScript application
firebase.json
```

Downloaded media, Python environments, runtime executables, build output, and local secrets are intentionally excluded from Git.

## 📄 License

No license file is currently included. Unless a license is added, the source is not granted an open-source reuse license.
