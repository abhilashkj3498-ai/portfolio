import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Inject Cloudinary image optimisation transformations.
 * Only applied to images — videos and raw files are returned as-is.
 */
function optimiseImageUrl(url) {
  return url.replace('/upload/', '/upload/q_auto,f_auto,w_800/');
}

/**
 * Build a preview thumbnail URL for a PDF stored as a raw Cloudinary resource.
 * Uses Cloudinary's pg_1 (page 1) transformation to render the first page as JPEG.
 */
function pdfPreviewUrl(cloudName, publicId) {
  return `https://res.cloudinary.com/${cloudName}/image/upload/pg_1,q_auto,f_auto,w_800/${publicId}.jpg`;
}

/**
 * Fetch assets from a folder by resource type
 */
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

/**
 * Vercel serverless handler
 * Route: GET /api/projects/[category]
 */
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate');

  const { category } = req.query;
  if (!category) return res.status(400).json({ error: 'Missing category parameter' });

  const mapping = {
    'social-media-promotional-videos': 'VEEDU/Social_Media_Fromotional_Videos',
    'photography-projects':            'VEEDU/Photography_Projects',
    'video-editing-works':             'VEEDU/Video_Editing_Works',
  };

  let folder = mapping[category] || `VEEDU/${category}`;
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME;

  console.log(`[API] Querying Cloudinary for folder: ${folder}`);

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
    console.log(`[API] Successfully mapped ${allItems.length} total items`);

    return res.status(200).json(allItems);

  } catch (error) {
    console.error('[API] Cloudinary API Error:', error);
    return res.status(500).json({
      error:  error.message || String(error),
      media:  [],
    });
  }
}
