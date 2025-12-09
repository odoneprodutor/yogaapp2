import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- SETUP CONFIG ---
const CONFIG = {
    host: '72.61.39.23',
    user: 'yoga_deploy',
    sshKeyPath: 'C:\\Users\\odone\\.ssh\\id_yogaflow',
    remotePath: 'htdocs/yogaflowapp.cloud',
    backendPath: 'backend', // Local path
    distPath: 'dist'      // Local path
};

// --- HELPERS ---
const log = (msg) => console.log(`\n\x1b[36m[DEPLOY]\x1b[0m ${msg}`);
const run = (cmd) => {
    try {
        execSync(cmd, { stdio: 'inherit' });
    } catch (e) {
        console.error(`\x1b[31mCommand failed:\x1b[0m ${cmd}`);
        process.exit(1);
    }
};

// --- MAIN ---
(async () => {
    log('Starting deployment to ' + CONFIG.host + ' as user ' + CONFIG.user + '...');

    // 1. Build Frontend
    log('Building Frontend...');
    run('npm run build');

    // 2. Prepare Remote Directory (Create folders)
    // We use mkdir -p which creates parents if needed.
    log('Preparing remote directories...');
    run(`ssh -i "${CONFIG.sshKeyPath}" -o StrictHostKeyChecking=no ${CONFIG.user}@${CONFIG.host} "mkdir -p ${CONFIG.remotePath}/backend/config ${CONFIG.remotePath}/backend/api"`);

    // 3. Upload Backend (PHP)
    log('Uploading Backend (API & Configs)...');
    // Upload files directly
    run(`scp -i "${CONFIG.sshKeyPath}" -r -o StrictHostKeyChecking=no backend/* ${CONFIG.user}@${CONFIG.host}:${CONFIG.remotePath}/backend/`);

    // 4. Clean & Upload Frontend (Dist)
    log('Cleaning default files & Uploading Frontend...');
    // Try to remove default index files if they exist
    try {
        execSync(`ssh -i "${CONFIG.sshKeyPath}" -o StrictHostKeyChecking=no ${CONFIG.user}@${CONFIG.host} "rm -f ${CONFIG.remotePath}/index.php ${CONFIG.remotePath}/index.html"`, { stdio: 'ignore' });
    } catch (e) {
        // Ignore checking if file exists
    }

    // Upload dist content to root htdocs
    run(`scp -i "${CONFIG.sshKeyPath}" -r -o StrictHostKeyChecking=no dist/* ${CONFIG.user}@${CONFIG.host}:${CONFIG.remotePath}/`);

    log('Deployment Complete! 🚀');
    log('IMPORTANT: Go to CloudPanel -> Vhost and update root topoint to:');
    log(`/home/${CONFIG.user}/${CONFIG.remotePath}`);
})();
