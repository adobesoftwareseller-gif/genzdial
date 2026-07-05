// Central Cloudinary helper.
// When the CLOUDINARY_* env vars are set (production/Render), uploads go to
// Cloudinary. When they are absent (e.g. local dev with no account), callers
// fall back to local disk storage so nothing breaks.
const cloudinary = require('cloudinary').v2;

const isConfigured = !!(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
);

if (isConfigured) {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
        secure: true,
    });
}

// Upload an in-memory buffer to Cloudinary. Resolves to the Cloudinary result
// (we use result.secure_url).
function uploadBuffer(buffer, { folder, resourceType = 'auto' } = {}) {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { folder, resource_type: resourceType },
            (err, result) => (err ? reject(err) : resolve(result))
        );
        stream.end(buffer);
    });
}

// Best-effort delete of a previously uploaded asset, given its Cloudinary URL.
// Never throws — failures are ignored so they can't break the request.
async function destroyByUrl(url, resourceType = 'image') {
    try {
        if (!isConfigured || !url || !url.includes('res.cloudinary.com')) return;
        // Pull the public_id out of the URL: .../upload/v123/<public_id>.<ext>
        const m = url.match(/\/upload\/(?:v\d+\/)?(.+)\.[a-z0-9]+$/i);
        if (!m) return;
        await cloudinary.uploader.destroy(m[1], { resource_type: resourceType });
    } catch (_) {
        /* best-effort — ignore */
    }
}

module.exports = { cloudinary, isConfigured, uploadBuffer, destroyByUrl };
