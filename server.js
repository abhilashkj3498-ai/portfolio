// Local dev API server — mirrors the Vercel serverless function exactly.
// Runs on port 3001; Vite proxies /api → http://localhost:3001
//
// Usage: npm run dev  (starts both this server AND Vite together via concurrently)

import 'dotenv/config';
import express from 'express';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const app  = express();
const PORT = 3001;

// ── Lightweight in-memory cache ──────────────────────────────────────────────
// Prevents hammering the Cloudinary API on every hot-reload during development.
const cache     = new Map();   // key: category slug, value: { data, expiresAt }
const CACHE_TTL = 60_000;      // 60 seconds

function getCached(key) {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) { cache.delete(key); return null; }
  return entry.data;
}
function setCache(key, data) {
  cache.set(key, { data, expiresAt: Date.now() + CACHE_TTL });
}

// ── Helper: inject optimisation transformations into image URLs ───────────────
function optimiseImageUrl(url) {
  return url.replace('/upload/', '/upload/q_auto,f_auto,w_800/');
}

// ── Helper: build preview thumbnail URL for PDFs stored as raw resources ────────
function pdfPreviewUrl(cloudName, publicId) {
  return `https://res.cloudinary.com/${cloudName}/image/upload/pg_1,q_auto,f_auto,w_800/${publicId}.jpg`;
}

// ── Helper: Fetch folder assets ──────────────────────────────────────────────
async function fetchFolderAssets(folder, type) {
  try {
    const res = await cloudinary.api.resources_by_asset_folder(folder, {
      resource_type: type,
      max_results: 100,
    });
    return res.resources || [];
  } catch (err) {
    console.warn(`[API] Fetch warning for folder "${folder}" (${type}):`, err.message || err);
    return [];
  }
}

// ── Route: GET /api/projects/:category ───────────────────────────────────────
// Mirrors /api/projects/[category].js in the Vercel functions directory.
app.get('/api/projects/:category', async (req, res) => {
  const { category } = req.params;

  if (!category) {
    return res.status(400).json({ error: 'Missing category parameter' });
  }

  // Return cached response if still fresh
  const cached = getCached(category);
  if (cached) {
    console.log(`[API] Cache hit for "${category}"`);
    return res.json(cached);
  }

  const mapping = {
    'social-media-promotional-videos': 'VEEDU/Social_Media_Fromotional_Videos',
    'photography-projects':            'VEEDU/Photography_Projects',
    'video-editing-works':             'VEEDU/Video_Editing_Works',
  };

  let folder = mapping[category] || `VEEDU/${category}`;
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME;
  console.log(`[API] Searching Cloudinary folder: ${folder}`);

  try {
    let [images, videos, raws] = await Promise.all([
      fetchFolderAssets(folder, 'image'),
      fetchFolderAssets(folder, 'video'),
      fetchFolderAssets(folder, 'raw'),
    ]);

    // Fallback if the folder returns empty and it is the promotional videos category
    if (category === 'social-media-promotional-videos' && images.length === 0 && videos.length === 0) {
      const fallbackFolder = 'VEEDU/Social_Media_Promotional_Videos';
      console.log(`[API] Folder "${folder}" was empty. Trying fallback folder "${fallbackFolder}"`);
      [images, videos, raws] = await Promise.all([
        fetchFolderAssets(fallbackFolder, 'image'),
        fetchFolderAssets(fallbackFolder, 'video'),
        fetchFolderAssets(fallbackFolder, 'raw'),
      ]);
    }

    console.log(`[API] Found ${images.length} images, ${videos.length} videos, ${raws.length} raws`);

    // Map images and videos
    const mediaItems = [...images, ...videos].map((r) => ({
      url:       r.resource_type === 'image'
                   ? optimiseImageUrl(r.secure_url)
                   : r.secure_url,
      preview:   r.resource_type === 'image'
                   ? optimiseImageUrl(r.secure_url)
                   : r.secure_url,
      type:      r.resource_type,
      format:    r.format,
      public_id: r.public_id,
      width:     r.width  ?? null,
      height:    r.height ?? null,
    }));

    // Map raw PDFs
    const pdfItems = raws
      .filter((r) => r.format === 'pdf')
      .map((r) => ({
        url:       r.secure_url,
        preview:   pdfPreviewUrl(cloudName, r.public_id),
        type:      'raw',
        format:    'pdf',
        public_id: r.public_id,
        width:     null,
        height:    null,
      }));

    const allItems = [...mediaItems, ...pdfItems];
    console.log(`[API] Returned ${allItems.length} items for "${category}"`);

    setCache(category, allItems);
    return res.json(allItems);

  } catch (err) {
    console.error('[API] Cloudinary Search error:', err);
    return res.status(500).json({
      error:  'Failed to fetch media from Cloudinary',
      detail: err.message || String(err),
    });
  }
});

app.listen(PORT, () => {
  console.log(`\n🚀 Local API server running at http://localhost:${PORT}`);
  console.log(`   Cloud: ${process.env.CLOUDINARY_CLOUD_NAME || '⚠ CLOUDINARY_CLOUD_NAME not set'}\n`);
});
