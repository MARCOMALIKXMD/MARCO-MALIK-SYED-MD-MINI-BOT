const fs      = require('fs');
const path    = require('path');
const { exec } = require('child_process');
const crypto  = require('crypto');
const webp    = require('node-webpmux');

const TMP = path.join(process.cwd(), 'temp');
if (!fs.existsSync(TMP)) fs.mkdirSync(TMP, { recursive: true });

function buildExif(metadata) {
    const json = {
        'sticker-pack-id':        crypto.randomBytes(32).toString('hex'),
        'sticker-pack-name':      metadata.packname || '𓆩 MARCO MALIK & SYED-MD MINI BOT 𓆪',
        'sticker-pack-publisher': metadata.author   || 'MARCO MĀLÏK',
        emojis: ['🤖'],
    };
    const attr = Buffer.from([
        0x49,0x49,0x2A,0x00,0x08,0x00,0x00,0x00,0x01,0x00,
        0x41,0x57,0x07,0x00,0x00,0x00,0x00,0x00,0x16,0x00,0x00,0x00,
    ]);
    const jsonBuf = Buffer.from(JSON.stringify(json), 'utf8');
    const exif = Buffer.concat([attr, jsonBuf]);
    exif.writeUIntLE(jsonBuf.length, 14, 4);
    return exif;
}

async function writeExifImg(buffer, metadata) {
    const tmpIn  = path.join(TMP, `in_${Date.now()}.jpg`);
    const tmpOut = path.join(TMP, `out_${Date.now()}.webp`);
    fs.writeFileSync(tmpIn, buffer);
    await new Promise((res, rej) =>
        exec(`ffmpeg -y -i "${tmpIn}" -vf "scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=white@0" "${tmpOut}"`,
            (e) => { try{fs.unlinkSync(tmpIn);}catch(x){} e ? rej(e) : res(); })
    );
    const img = new webp.Image();
    await img.load(tmpOut);
    img.exif = buildExif(metadata);
    await img.save(tmpOut);
    return tmpOut;
}

async function writeExifVid(buffer, metadata) {
    const tmpIn  = path.join(TMP, `in_${Date.now()}.mp4`);
    const tmpOut = path.join(TMP, `out_${Date.now()}.webp`);
    fs.writeFileSync(tmpIn, buffer);
    await new Promise((res, rej) =>
        exec(`ffmpeg -y -i "${tmpIn}" -vcodec libwebp -filter:v "fps=15,scale=512:512:flags=lanczos" -lossless 0 -compression_level 3 -q:v 70 -loop 0 -preset picture -an -t 00:00:08 "${tmpOut}"`,
            (e) => { try{fs.unlinkSync(tmpIn);}catch(x){} e ? rej(e) : res(); })
    );
    const img = new webp.Image();
    await img.load(tmpOut);
    img.exif = buildExif(metadata);
    await img.save(tmpOut);
    return tmpOut;
}

module.exports = { writeExifImg, writeExifVid };
