import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const YTDLP_CANDIDATES = [
  path.join(__dirname, 'venv311', 'Scripts', 'yt-dlp.exe'),
  path.join(__dirname, 'venv', 'Scripts', 'yt-dlp.exe')
];

export const YTDLP_BIN = YTDLP_CANDIDATES.find(candidate => fs.existsSync(candidate)) || 'yt-dlp';

export const YTDLP_NETWORK_ARGS = [
  '--force-ipv4',
  '--retries', '20',
  '--fragment-retries', '20',
  '--extractor-retries', '5',
  '--retry-sleep', 'http:exp=1:8',
  '--retry-sleep', 'fragment:exp=1:8',
  '--retry-sleep', 'extractor:exp=1:8'
];
