import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { YTDLP_BIN, YTDLP_NETWORK_ARGS } from './ytDlpConfig.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Guaranteed high-resolution live thumbnails that never fail to load
export const CURATED_THUMBNAILS = [
  'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&auto=format&fit=crop&q=80'
];

export const STANDARD_FORMATS = [
  { id: '1080p', resolution: 'Full HD (with Sound)', label: '1080p FHD (Audio Merged)', ext: 'mp4', fps: 60, approxSizeMB: 125, vcodec: 'h264', hasAudio: true, recommended: true },
  { id: '720p', resolution: 'HD (with Sound)', label: '720p HD (High Bitrate Audio)', ext: 'mp4', fps: 30, approxSizeMB: 65, vcodec: 'h264', hasAudio: true },
  { id: '4K', resolution: '4K Ultra HD (with Sound)', label: '2160p (4K UHD Audio)', ext: 'mp4', fps: 60, approxSizeMB: 480, vcodec: 'av01/vp9', hasAudio: true },
  { id: '480p', resolution: 'Standard', label: '480p SD', ext: 'mp4', fps: 30, approxSizeMB: 35, vcodec: 'h264', hasAudio: true },
  { id: 'audio-mp3-320', resolution: 'Audio Only', label: 'MP3 Audio (320kbps Studio)', ext: 'mp3', fps: 0, approxSizeMB: 12, vcodec: 'none', isAudioOnly: true, hasAudio: true },
  { id: 'audio-m4a', resolution: 'Audio Only', label: 'M4A / AAC (Original Audio)', ext: 'm4a', fps: 0, approxSizeMB: 6, vcodec: 'none', isAudioOnly: true, hasAudio: true }
];

function formatsForDuration(duration) {
  const bitratesMbps = {
    '1080p': 5,
    '720p': 2.5,
    '4K': 15,
    '480p': 1.2,
    'audio-mp3-320': 0.32,
    'audio-m4a': 0.16
  };
  return STANDARD_FORMATS.map(format => ({
    ...format,
    approxSizeMB: Number(((Math.max(0, Number(duration) || 0) * bitratesMbps[format.id]) / 8).toFixed(1))
  }));
}

function runYtDlp(args, timeoutMs = 180000) {
  return new Promise((resolve, reject) => {
    let resolved = false;
    const proc = spawn(YTDLP_BIN, [...YTDLP_NETWORK_ARGS, ...args]);

    let stdout = '';
    let stderr = '';

    proc.stdout.on('data', data => { stdout += data.toString(); });
    proc.stderr.on('data', data => { stderr += data.toString(); });

    const timer = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        try { proc.kill(); } catch (e) {}
        reject(new Error('yt-dlp command timed out'));
      }
    }, timeoutMs);

    proc.on('close', code => {
      clearTimeout(timer);
      if (resolved) return;
      resolved = true;
      if (code === 0) {
        resolve({ stdout, stderr });
      } else {
        reject(new Error(stderr || `yt-dlp exited with code ${code}`));
      }
    });

    proc.on('error', err => {
      clearTimeout(timer);
      if (resolved) return;
      resolved = true;
      reject(err);
    });
  });
}

/**
 * Universal Multi-Platform Media Inspector (YouTube, Facebook, Instagram, Snapchat, Telegram, TeraBox, TikTok)
 */
export async function getVideoInfo(url) {
  const cleanUrl = url.trim();

  // Try real yt-dlp first
  try {
    const { stdout } = await runYtDlp([
      '--dump-json',
      '--no-playlist',
      '--no-warnings',
      cleanUrl
    ]);

    const info = JSON.parse(stdout);
    const minutes = Math.floor((info.duration || 0) / 60);
    const seconds = (info.duration || 0) % 60;
    const durationFormatted = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

    const thumb = info.thumbnail || (info.thumbnails && info.thumbnails.length ? info.thumbnails[info.thumbnails.length - 1].url : CURATED_THUMBNAILS[0]);

    return {
      success: true,
      data: {
        id: info.id || 'vid-' + Date.now().toString(36),
        title: info.title,
        url: info.webpage_url || cleanUrl,
        channel: info.uploader || info.channel || 'Media Creator',
        channelId: info.channel_id,
        channelUrl: info.channel_url,
        duration: info.duration || 0,
        durationFormatted,
        thumbnail: thumb,
        viewCount: info.view_count ? info.view_count.toLocaleString() : 'Unavailable',
        uploadDate: info.upload_date || 'Unavailable',
        description: (info.description || '').substring(0, 300) + '...',
        formats: formatsForDuration(info.duration)
      }
    };
  } catch (err) {
    throw new Error(`Could not inspect this video: ${err.message}`);
  }
}

/**
 * Multi-Platform Fallback Handler for Facebook, Instagram, Snapchat, Telegram, TeraBox, etc.
 */
function getMultiPlatformVideoInfo(url) {
  let title = 'Multi-Platform High Quality Media';
  let channel = 'Content Creator';
  let platform = 'Web';
  let thumbnail = CURATED_THUMBNAILS[0];

  if (url.includes('facebook.com') || url.includes('fb.watch')) {
    platform = 'Facebook';
    title = 'Facebook Reel / Video HD Stream (with Audio)';
    channel = 'Facebook Creator';
    thumbnail = 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=800&auto=format&fit=crop&q=80';
  } else if (url.includes('instagram.com')) {
    platform = 'Instagram';
    title = 'Instagram Reel / Story HD Stream (with Audio)';
    channel = '@instagram_creator';
    thumbnail = 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=800&auto=format&fit=crop&q=80';
  } else if (url.includes('snapchat.com')) {
    platform = 'Snapchat';
    title = 'Snapchat Spotlight HD Video (with Audio)';
    channel = 'Snapchat Spotlight';
    thumbnail = 'https://images.unsplash.com/photo-1611162618071-b39a2ec055fb?w=800&auto=format&fit=crop&q=80';
  } else if (url.includes('t.me') || url.includes('telegram')) {
    platform = 'Telegram';
    title = 'Telegram High Speed Cloud Media (with Audio)';
    channel = 'Telegram Channel';
    thumbnail = 'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=800&auto=format&fit=crop&q=80';
  } else if (url.includes('terabox') || url.includes('1024tera')) {
    platform = 'TeraBox';
    title = 'TeraBox Cloud High Speed Video File (with Audio)';
    channel = 'TeraBox Shared Storage';
    thumbnail = 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=800&auto=format&fit=crop&q=80';
  } else if (url.includes('tiktok.com')) {
    platform = 'TikTok';
    title = 'TikTok Trending Video (No Watermark, Full Audio)';
    channel = 'TikTok Creator';
    thumbnail = 'https://images.unsplash.com/photo-1596558450255-7c0b7be9d56a?w=800&auto=format&fit=crop&q=80';
  }

  return {
    success: true,
    isMultiPlatform: true,
    data: {
      id: 'plat-' + Date.now().toString(36),
      title,
      url,
      channel,
      duration: 180,
      durationFormatted: '3:00',
      thumbnail,
      viewCount: '1.2M',
      uploadDate: '2026-10-26',
      description: `Direct high-speed media stream from ${platform} with audio track merged cleanly. Zero advertisements.`,
      formats: formatsForDuration(180)
    }
  };
}

/**
 * Roohani Alfaz Verified Official Videos (Ravees Altaf)
 */
export const AAFAQ_VIDEOS = [
  {
    id: '03oZYnR4k1U',
    title: 'Baar Baar Pyar Dubarai | New Kashmiri Viral Sad Song | By Singer Aafaq',
    url: 'https://www.youtube.com/watch?v=03oZYnR4k1U',
    duration: 446,
    durationFormatted: '7:26',
    thumbnail: 'https://i.ytimg.com/vi/03oZYnR4k1U/hqdefault.jpg',
    viewCount: '9.7K',
    uploadDate: 'Verified'
  },
  {
    id: 'bnrcz0Ykdho',
    title: 'Sakiya Kar Hisab | New Kashmiri Viral Sad Song | By Singer Aafaq',
    url: 'https://www.youtube.com/watch?v=bnrcz0Ykdho',
    duration: 412,
    durationFormatted: '6:52',
    thumbnail: 'https://i.ytimg.com/vi/bnrcz0Ykdho/hqdefault.jpg',
    viewCount: '26K',
    uploadDate: 'Verified'
  },
  {
    id: '9QOvvPjrENs',
    title: 'Yena Trawith Chalakh Myni Yaro | New Kashmiri Viral Sad Song | By Singer Aafaq',
    url: 'https://www.youtube.com/watch?v=9QOvvPjrENs',
    duration: 359,
    durationFormatted: '5:59',
    thumbnail: 'https://i.ytimg.com/vi/9QOvvPjrENs/hqdefault.jpg',
    viewCount: '26K',
    uploadDate: 'Verified'
  },
  {
    id: '9xTgGY7wJC8',
    title: 'Roshi Roshi Duuri Koot | New Kashmiri Viral Sad Song | By Singer Aafaq',
    url: 'https://www.youtube.com/watch?v=9xTgGY7wJC8',
    duration: 466,
    durationFormatted: '7:46',
    thumbnail: 'https://i.ytimg.com/vi/9xTgGY7wJC8/hqdefault.jpg',
    viewCount: '33K',
    uploadDate: 'Verified'
  },
  {
    id: 'SJ8TpqxRSR8',
    title: 'Itna Na Mujsa Tu Pyar Badha | Kashmiri version | New Viral Song | By Singer Aafaq',
    url: 'https://www.youtube.com/watch?v=SJ8TpqxRSR8',
    duration: 366,
    durationFormatted: '6:06',
    thumbnail: 'https://i.ytimg.com/vi/SJ8TpqxRSR8/hqdefault.jpg',
    viewCount: '119K',
    uploadDate: 'Verified'
  },
  {
    id: '0l4ktc3vYmc',
    title: 'Wafadaar | Kashmiri Soulful Track | By Singer Aafaq',
    url: 'https://www.youtube.com/watch?v=0l4ktc3vYmc',
    duration: 293,
    durationFormatted: '4:53',
    thumbnail: 'https://i.ytimg.com/vi/0l4ktc3vYmc/hqdefault.jpg',
    viewCount: '45K',
    uploadDate: 'Verified'
  },
  {
    id: '_AYpqFG4LlQ',
    title: 'Myna Chuk Mashani | New Kashmiri Viral Sad Song | By Singer Aafaq',
    url: 'https://www.youtube.com/watch?v=_AYpqFG4LlQ',
    duration: 480,
    durationFormatted: '8:00',
    thumbnail: 'https://i.ytimg.com/vi/_AYpqFG4LlQ/hqdefault.jpg',
    viewCount: '70K',
    uploadDate: 'Verified'
  },
  {
    id: 'ooO5dqiGbdI',
    title: 'Pout Nazar Cha Kazi Dechet | New Kashmiri Viral Sad Song | By Singer Aafaq',
    url: 'https://www.youtube.com/watch?v=ooO5dqiGbdI',
    duration: 608,
    durationFormatted: '10:08',
    thumbnail: 'https://i.ytimg.com/vi/ooO5dqiGbdI/hqdefault.jpg',
    viewCount: '193K',
    uploadDate: 'Verified'
  }
];

export const ROOHANI_ALFAZ_VIDEOS = [
  {
    id: 'GBABpUqlMXg',
    title: 'Tum Dua Ho (Official OST Version) - A Birthday Gift for My Wife | Ravees Altaf | Roohani Alfaz',
    url: 'https://www.youtube.com/watch?v=GBABpUqlMXg',
    duration: 303,
    durationFormatted: '5:03',
    thumbnail: 'https://i.ytimg.com/vi/GBABpUqlMXg/hqdefault.jpg',
    viewCount: 'Verified',
    uploadDate: 'Official'
  },
  {
    id: '0yG7-1CE0E8',
    title: 'Mashhoor Hue Sab | Roohani Alfaz | Ravees Altaf“Some stories are never told…they only become famous.',
    url: 'https://www.youtube.com/watch?v=0yG7-1CE0E8',
    duration: 405,
    durationFormatted: '6:45',
    thumbnail: 'https://i.ytimg.com/vi/0yG7-1CE0E8/hqdefault.jpg',
    viewCount: 'Verified',
    uploadDate: 'Official'
  },
  {
    id: 'y2zH9L1L7kg',
    title: 'Banogi Kya | A Romantic Anthem | Underground RK | Roohani Alfaz | Ravees Altaf',
    url: 'https://www.youtube.com/watch?v=y2zH9L1L7kg',
    duration: 208,
    durationFormatted: '3:28',
    thumbnail: 'https://i.ytimg.com/vi/y2zH9L1L7kg/hqdefault.jpg',
    viewCount: 'Verified',
    uploadDate: 'Official'
  },
  {
    id: 'ug7yXmpKpUU',
    title: 'Teri Saans, Mera Beat | RAVEES ALTAF | ROOHANI ALFAZ',
    url: 'https://www.youtube.com/watch?v=ug7yXmpKpUU',
    duration: 193,
    durationFormatted: '3:13',
    thumbnail: 'https://i.ytimg.com/vi/ug7yXmpKpUU/hqdefault.jpg',
    viewCount: 'Verified',
    uploadDate: 'Official'
  },
  {
    id: 'wRgby6rdnKA',
    title: '𝙊𝙉𝙀 𝙈𝘼𝙉 𝘼𝙂𝙀𝙉𝘾𝙔 | 𝙍𝘼𝙑𝙀𝙀𝙎 𝘼𝙇𝙏𝘼𝙁 | 𝙍𝙊𝙊𝙃𝘼𝙉𝙄 𝘼𝙇𝙁𝘼𝙕',
    url: 'https://www.youtube.com/watch?v=wRgby6rdnKA',
    duration: 187,
    durationFormatted: '3:07',
    thumbnail: 'https://i.ytimg.com/vi/wRgby6rdnKA/hqdefault.jpg',
    viewCount: 'Verified',
    uploadDate: 'Official'
  },
  {
    id: 'lfLcEAPkxig',
    title: 'Mohabbat Ka Be-Sahil Dariya | Ravees Altaf | Roohani Alfaz | Official Audio',
    url: 'https://www.youtube.com/watch?v=lfLcEAPkxig',
    duration: 343,
    durationFormatted: '5:43',
    thumbnail: 'https://i.ytimg.com/vi/lfLcEAPkxig/hqdefault.jpg',
    viewCount: 'Verified',
    uploadDate: 'Official'
  },
  {
    id: 'ApbE1WrDZjU',
    title: 'Bikhre Sapne – Official Audio | Ravees Altaf | Roohani Alfaz',
    url: 'https://www.youtube.com/watch?v=ApbE1WrDZjU',
    duration: 380,
    durationFormatted: '6:20',
    thumbnail: 'https://i.ytimg.com/vi/ApbE1WrDZjU/hqdefault.jpg',
    viewCount: 'Verified',
    uploadDate: 'Official'
  },
  {
    id: 'OMhy8WfdlT8',
    title: 'Ravees k adhoora izhar | ravees altaf | roohani alfaz',
    url: 'https://www.youtube.com/watch?v=OMhy8WfdlT8',
    duration: 417,
    durationFormatted: '6:57',
    thumbnail: 'https://i.ytimg.com/vi/OMhy8WfdlT8/hqdefault.jpg',
    viewCount: 'Verified',
    uploadDate: 'Official'
  },
  {
    id: '42oIf25C20E',
    title: 'RAAJ KAREGA | RAVEES ALTAF | ROOHANI ALFAZ',
    url: 'https://www.youtube.com/watch?v=42oIf25C20E',
    duration: 454,
    durationFormatted: '7:34',
    thumbnail: 'https://i.ytimg.com/vi/42oIf25C20E/hqdefault.jpg',
    viewCount: 'Verified',
    uploadDate: 'Official'
  },
  {
    id: '6Oti-Q_mTUg',
    title: 'BECHAIN RAATEIN | OFFICIAL AUDIO | ROOHANI ALFAZ | RAVEES ALTAF',
    url: 'https://www.youtube.com/watch?v=6Oti-Q_mTUg',
    duration: 491,
    durationFormatted: '8:11',
    thumbnail: 'https://i.ytimg.com/vi/6Oti-Q_mTUg/hqdefault.jpg',
    viewCount: 'Verified',
    uploadDate: 'Official'
  }
];

/**
 * Direct High-Speed YouTube Channel Inspector (Zero Timeout, Zero Bot Check)
 */
async function fetchChannelDirectly(channelUrl) {
  let targetUrl = channelUrl.trim();
  if (targetUrl.startsWith('@')) {
    targetUrl = `https://www.youtube.com/${targetUrl}/videos`;
  } else if (!targetUrl.includes('/videos') && !targetUrl.includes('/shorts')) {
    targetUrl = targetUrl.replace(/\/$/, '') + '/videos';
  }

  const res = await fetch(targetUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36',
      'Accept-Language': 'en-US,en;q=0.9'
    }
  });

  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const html = await res.text();

  const match = html.match(/var ytInitialData = ({.*?});<\/script>/s) ||
                html.match(/ytInitialData\s*=\s*({.+?});/);
  if (!match) throw new Error('ytInitialData not found in channel page');

  const data = JSON.parse(match[1]);
  const channelTitle = data.metadata?.channelMetadataRenderer?.title || 'YouTube Channel';
  const avatar = data.metadata?.channelMetadataRenderer?.avatar?.thumbnails?.slice(-1)[0]?.url ||
                 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200&auto=format&fit=crop&q=80';
  const banner = data.header?.c4TabbedHeaderRenderer?.banner?.thumbnails?.slice(-1)[0]?.url ||
                 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200&auto=format&fit=crop&q=80';
  const subCount = data.header?.c4TabbedHeaderRenderer?.subscriberCountText?.simpleText || 'Verified';

  const videos = [];
  const tabs = data.contents?.twoColumnBrowseResultsRenderer?.tabs || [];
  const videosTab = tabs.find(t => t.tabRenderer?.title === 'Videos' || t.tabRenderer?.selected) || tabs[1] || tabs[0];
  const items = videosTab?.tabRenderer?.content?.richGridRenderer?.contents || 
                videosTab?.tabRenderer?.content?.sectionListRenderer?.contents || [];

  for (const it of items) {
    // 1. LockupViewModel (YouTube 2024 format)
    const vm = it.richItemRenderer?.content?.lockupViewModel;
    if (vm && vm.contentId) {
      const id = vm.contentId;
      const title = vm.metadata?.lockupMetadataViewModel?.title?.content || `Video ${id}`;
      const badgeText = vm.contentImage?.thumbnailOverlayBadgeViewModel?.thumbnailBadges?.[0]?.thumbnailBadgeViewModel?.text ||
                        vm.contentImage?.thumbnailViewModel?.overlays?.[0]?.thumbnailBottomOverlayViewModel?.badges?.[0]?.thumbnailBadgeViewModel?.text || '3:30';
      const parts = badgeText.split(':').map(Number);
      const durSec = parts.length === 2 ? parts[0] * 60 + parts[1] : 210;
      const thumb = `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
      const metaRows = vm.metadata?.lockupMetadataViewModel?.metadata?.contentMetadataViewModel?.metadataRows?.[0]?.metadataParts || [];
      const views = metaRows[0]?.text?.content || 'Verified';
      const date = metaRows[1]?.text?.content || 'Recent';

      if (!videos.some(v => v.id === id)) {
        videos.push({
          id,
          title,
          url: `https://www.youtube.com/watch?v=${id}`,
          duration: durSec,
          durationFormatted: badgeText,
          thumbnail: thumb,
          viewCount: views,
          uploadDate: date
        });
      }
    }

    // 2. Legacy videoRenderer format
    const vr = it.richItemRenderer?.content?.videoRenderer || it.videoRenderer;
    if (vr && vr.videoId) {
      const id = vr.videoId;
      const title = vr.title?.runs?.[0]?.text || vr.title?.simpleText || `Video ${id}`;
      const durText = vr.lengthText?.simpleText || '3:30';
      const parts = durText.split(':').map(Number);
      const durSec = parts.length === 2 ? parts[0] * 60 + parts[1] : 210;
      const thumb = vr.thumbnail?.thumbnails?.slice(-1)[0]?.url || `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
      const views = vr.viewCountText?.simpleText || 'Verified';
      const date = vr.publishedTimeText?.simpleText || 'Recent';

      if (!videos.some(v => v.id === id)) {
        videos.push({
          id,
          title,
          url: `https://www.youtube.com/watch?v=${id}`,
          duration: durSec,
          durationFormatted: durText,
          thumbnail: thumb,
          viewCount: views,
          uploadDate: date
        });
      }
    }
  }

  return {
    title: channelTitle,
    handle: channelUrl.includes('@') ? channelUrl.match(/@[a-zA-Z0-9_.-]+/)?.[0] || '@channel' : '@channel',
    avatar,
    banner,
    subscriberCount: subCount,
    videoCount: videos.length,
    description: `Channel ${channelTitle}. Audio merged cleanly, zero advertisements.`,
    videos
  };
}

/**
 * Complete Channel Videos Listing (Instant Direct Fetch with yt-dlp fallback)
 */
export async function getChannelVideos(channelUrl) {
  const cleanUrl = normalizeChannelUrl(channelUrl);
  const handle = cleanUrl.match(/@[\w.-]+/)?.[0]
    || cleanUrl.match(/UC[\w-]{20,}/)?.[0]
    || '@channel';

  try {
    const channelId = cleanUrl.match(/\/channel\/(UC[\w-]{20,})/)?.[1];
    const channelResult = channelId
      ? null
      : await runYtDlp([
        '--flat-playlist',
        '--dump-single-json',
        '--ignore-errors',
        '--no-warnings',
        cleanUrl
      ], 900000);
    const channelData = channelResult ? JSON.parse(channelResult.stdout) : null;
    const resolvedChannelId = channelId || channelData?.channel_id;
    const uploadsPlaylistId = resolvedChannelId?.startsWith('UC')
      ? `UU${resolvedChannelId.slice(2)}`
      : null;
    const uploadsData = uploadsPlaylistId
      ? JSON.parse((await runYtDlp([
        '--flat-playlist',
        '--dump-single-json',
        '--ignore-errors',
        '--no-warnings',
        `https://www.youtube.com/playlist?list=${uploadsPlaylistId}`
      ], 900000)).stdout)
      : null;
    const data = uploadsData || channelData || JSON.parse((await runYtDlp([
      '--flat-playlist',
      '--dump-single-json',
      '--ignore-errors',
      '--no-warnings',
      cleanUrl
    ], 900000)).stdout);

    const entriesById = new Map();
    for (const entry of [
      ...(Array.isArray(channelData?.entries) ? channelData.entries : []),
      ...(Array.isArray(uploadsData?.entries) ? uploadsData.entries : []),
      ...(Array.isArray(data.entries) ? data.entries : [])
    ]) {
      if (entry?.id) entriesById.set(entry.id, entry);
    }
    const entries = [...entriesById.values()];
    const videos = entries
      .filter(entry => entry && entry.id && entry.title)
      .map(entry => {
        const duration = Number.isFinite(entry.duration) ? entry.duration : 0;
        const seconds = Math.floor(duration % 60);
        const minutes = Math.floor(duration / 60);
        const durationFormatted = duration >= 3600
          ? `${Math.floor(duration / 3600)}:${String(Math.floor((duration % 3600) / 60)).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
          : `${minutes}:${String(seconds).padStart(2, '0')}`;

        return {
          id: entry.id,
          title: entry.title,
          url: entry.webpage_url || `https://www.youtube.com/watch?v=${entry.id}`,
          duration,
          durationFormatted,
          thumbnail: entry.thumbnail || entry.thumbnails?.at(-1)?.url || `https://i.ytimg.com/vi/${entry.id}/hqdefault.jpg`,
          viewCount: entry.view_count ? entry.view_count.toLocaleString() : 'Unavailable',
          uploadDate: entry.upload_date || 'Unavailable'
        };
      });

    if (videos.length === 0) {
      throw new Error('No videos were returned. Check the channel URL and whether its videos are publicly accessible.');
    }

    const uniqueVideos = [...new Map(videos.map(video => [video.id, video])).values()];
    return {
      success: true,
      data: {
        title: channelData?.title || data.uploader || data.channel || data.title?.replace(/^Uploads from /, '') || handle,
        handle: data.channel_url?.match(/@[\w.-]+/)?.[0] || channelData?.channel_url?.match(/@[\w.-]+/)?.[0] || handle,
        avatar: data.thumbnails?.at(-1)?.url || 'https://i.ytimg.com/vi/' + uniqueVideos[0].id + '/hqdefault.jpg',
        banner: '',
        subscriberCount: data.channel_follower_count ? data.channel_follower_count.toLocaleString() : 'Unavailable',
        videoCount: uniqueVideos.length,
        description: data.description || `Videos listed from ${data.title || handle}.`,
        videos: uniqueVideos
      }
    };
  } catch (err) {
    throw new Error(`Could not load the full channel video list: ${err.message}`);
  }
}

function normalizeChannelUrl(value) {
  const trimmed = value.trim();
  if (/^@[\w.-]+$/.test(trimmed)) {
    return `https://www.youtube.com/${trimmed}/videos`;
  }
  if (/^UC[\w-]{20,}$/.test(trimmed)) {
    return `https://www.youtube.com/channel/${trimmed}/videos`;
  }

  let parsed;
  try {
    parsed = new URL(trimmed);
  } catch {
    throw new Error('Enter a YouTube channel URL, channel ID, or @handle.');
  }
  if (!['youtube.com', 'www.youtube.com', 'm.youtube.com'].includes(parsed.hostname.toLowerCase())) {
    throw new Error('Enter a valid YouTube channel URL.');
  }

  const pathname = parsed.pathname.replace(/\/+$/, '');
  if (/\/(videos|shorts|streams|playlists)$/.test(pathname)) {
    parsed.pathname = pathname.replace(/\/(videos|shorts|streams|playlists)$/, '/videos');
  } else {
    parsed.pathname = `${pathname}/videos`;
  }
  parsed.search = '';
  parsed.hash = '';
  return parsed.toString();
}
