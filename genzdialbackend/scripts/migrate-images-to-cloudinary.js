/**
 * One-time migration: move base64 data-URI images stored in MongoDB to
 * Cloudinary, replacing each field with the returned https URL.
 *
 * Covers: Product (image, images[], colorVariants[].image), Banner (image),
 * MediaLogo (image). Fields that are already http(s) URLs or empty are skipped,
 * so the script is safe to re-run (idempotent).
 *
 * Usage:
 *   node scripts/migrate-images-to-cloudinary.js --dry   # count only, no writes
 *   node scripts/migrate-images-to-cloudinary.js         # perform migration
 *
 * Requires env: MONGO_URI, CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY,
 * CLOUDINARY_API_SECRET (loaded from .env via dotenv).
 */
require('dotenv').config();
const mongoose = require('mongoose');
const { isConfigured, uploadBuffer } = require('../config/cloudinary');

const Product = require('../models/Product');
const Banner = require('../models/Banner');
const MediaLogo = require('../models/MediaLogo');

const DRY = process.argv.includes('--dry');

const isBase64 = (v) => typeof v === 'string' && v.startsWith('data:');

let uploaded = 0;
let skipped = 0;
let failed = 0;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Upload one base64 data URI and return its Cloudinary URL (or the original
// value if it isn't base64). In dry mode, just count and return unchanged.
// Retries a few times to survive transient network errors (EPIPE / resets).
async function convert(value, folder) {
    if (!isBase64(value)) { skipped++; return value; }
    if (DRY) { uploaded++; return value; }
    const b64 = value.slice(value.indexOf(',') + 1);
    const buffer = Buffer.from(b64, 'base64');
    let lastErr;
    for (let attempt = 1; attempt <= 4; attempt++) {
        try {
            const result = await uploadBuffer(buffer, { folder, resourceType: 'image' });
            uploaded++;
            return result.secure_url;
        } catch (e) {
            lastErr = e;
            await sleep(1000 * attempt);
        }
    }
    // Give up on this one image but keep the original value so the doc is still
    // valid; it'll be retried on the next run (script is idempotent).
    failed++;
    console.log(`\n  ! upload failed (${lastErr && lastErr.message}) — leaving as-is, re-run to retry`);
    return value;
}

async function migrateProducts() {
    const docs = await Product.find({});
    console.log(`Products: ${docs.length}`);
    for (const p of docs) {
      try {
        let changed = false;
        const newImage = await convert(p.image, 'genzdial/products');
        if (newImage !== p.image) { p.image = newImage; changed = true; }

        if (Array.isArray(p.images) && p.images.length) {
            const newImages = [];
            for (const img of p.images) newImages.push(await convert(img, 'genzdial/products'));
            if (newImages.some((v, i) => v !== p.images[i])) { p.images = newImages; changed = true; }
        }

        if (Array.isArray(p.colorVariants) && p.colorVariants.length) {
            for (const v of p.colorVariants) {
                const nv = await convert(v.image, 'genzdial/products');
                if (nv !== v.image) { v.image = nv; changed = true; }
            }
        }

        // Skip validation: we only rewrite image strings to valid URLs, and
        // some legacy docs have unrelated invalid fields (e.g. blank variant
        // names) that would otherwise block the save.
        if (changed && !DRY) { await p.save({ validateBeforeSave: false }); process.stdout.write('.'); }
      } catch (e) {
        console.log(`\n  ! product ${p._id} failed: ${e.message}`);
      }
    }
    console.log('');
}

async function migrateSimple(Model, name, folder) {
    const docs = await Model.find({});
    console.log(`${name}: ${docs.length}`);
    for (const d of docs) {
      try {
        const nv = await convert(d.image, folder);
        if (nv !== d.image) {
            d.image = nv;
            if (!DRY) { await d.save({ validateBeforeSave: false }); process.stdout.write('.'); }
        }
      } catch (e) {
        console.log(`\n  ! ${name} ${d._id} failed: ${e.message}`);
      }
    }
    console.log('');
}

(async () => {
    if (!process.env.MONGO_URI) { console.error('Missing MONGO_URI'); process.exit(1); }
    if (!isConfigured) {
        console.error('Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME / CLOUDINARY_API_KEY / CLOUDINARY_API_SECRET.');
        process.exit(1);
    }
    console.log(DRY ? '=== DRY RUN (no writes) ===' : '=== MIGRATING (writing to DB + Cloudinary) ===');
    await mongoose.connect(process.env.MONGO_URI);

    await migrateProducts();
    await migrateSimple(Banner, 'Banners', 'genzdial/banners');
    await migrateSimple(MediaLogo, 'MediaLogos', 'genzdial/media-logos');

    console.log(`\nDone. base64 images ${DRY ? 'to migrate' : 'uploaded'}: ${uploaded}, already-URL/empty skipped: ${skipped}, failed (retry by re-running): ${failed}`);
    await mongoose.disconnect();
    process.exit(0);
})().catch((err) => { console.error('Migration failed:', err); process.exit(1); });
