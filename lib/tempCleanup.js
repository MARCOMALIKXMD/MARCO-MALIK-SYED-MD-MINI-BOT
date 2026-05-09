const fs   = require('fs');
const path = require('path');
const TMP  = path.join(process.cwd(), 'temp');

function cleanupTempFiles(maxAgeMs = 10 * 60 * 1000) {
    try {
        if (!fs.existsSync(TMP)) return;
        const files = fs.readdirSync(TMP);
        const now = Date.now();
        for (const f of files) {
            try {
                const fp = path.join(TMP, f);
                const stat = fs.statSync(fp);
                if (now - stat.mtimeMs > maxAgeMs) fs.unlinkSync(fp);
            } catch (e) {}
        }
    } catch (e) {}
}

// Auto-clean every 15 minutes
setInterval(() => cleanupTempFiles(), 15 * 60 * 1000);

module.exports = { cleanupTempFiles };
