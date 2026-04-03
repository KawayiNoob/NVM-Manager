const { app, BrowserWindow, ipcMain, shell } = require('electron');
const { exec, execSync } = require('child_process');
const path = require('path');
const os = require('os');
const fs = require('fs');
const https = require('https');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 520,
    height: 680,
    frame: true,
    resizable: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },
    backgroundColor: '#0f172a'
  });

  mainWindow.loadFile('index.html');

  if (process.argv.includes('--dev')) {
    mainWindow.webContents.openDevTools();
  }
}

function isWindows() {
  return os.platform() === 'win32';
}

function findNvmRoot() {
  if (!isWindows()) {
    return path.join(os.homedir(), '.nvm');
  }

  const possiblePaths = [
    'E:\\nvm',
    path.join(process.env.USERPROFILE, 'AppData', 'Roaming', 'nvm'),
    path.join(process.env.PROGRAMFILES, 'nvm'),
    path.join(process.env['ProgramFiles(x86)'], 'nvm')
  ];

  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      return p;
    }
  }

  return null;
}

function getCurrentVersion() {
  return new Promise((resolve) => {
    try {
      const version = execSync('node -v', { encoding: 'utf8' }).trim();
      resolve(version);
    } catch {
      resolve('');
    }
  });
}

function getInstalledVersions() {
  return new Promise((resolve) => {
    const nvmRoot = findNvmRoot();

    if (!nvmRoot || !fs.existsSync(nvmRoot)) {
      resolve([]);
      return;
    }

    try {
      const items = fs.readdirSync(nvmRoot);
      const versions = [];

      for (const item of items) {
        const fullPath = path.join(nvmRoot, item);
        if (fs.statSync(fullPath).isDirectory()) {
          const match = item.match(/^v?(\d+\.\d+\.\d+)$/);
          if (match) {
            versions.push(item.startsWith('v') ? item : 'v' + item);
          }
        }
      }

      versions.sort((a, b) => {
        const pa = a.replace('v', '').split('.').map(Number);
        const pb = b.replace('v', '').split('.').map(Number);
        return pb[0] - pa[0] || pb[1] - pa[1] || pb[2] - pa[2];
      });

      resolve(versions);
    } catch (e) {
      console.error('Error reading installed versions:', e);
      resolve([]);
    }
  });
}

function getAvailableVersions() {
  return new Promise((resolve) => {
    https.get('https://nodejs.org/dist/index.json', (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const releases = JSON.parse(data);
          const versions = releases
            .filter((r) => !r.version.includes('rc') && !r.version.includes('nightly'))
            .map((r) => r.version)
            .slice(0, 100);

          if (versions.length > 0) {
            resolve(versions);
            return;
          }
        } catch (e) {
        }
        resolve(getFallbackVersions());
      });
    }).on('error', () => {
      resolve(getFallbackVersions());
    });
  });
}

function getFallbackVersions() {
  const versions = [];
  for (let major = 22; major >= 14; major--) {
    for (let minor = 20; minor >= 0; minor--) {
      for (let patch = 5; patch >= 0; patch--) {
        if (minor === 20 && patch > 1) continue;
        versions.push(`v${major}.${minor}.${patch}`);
      }
    }
  }
  return versions.slice(0, 150);
}

function useVersion(version) {
  return new Promise((resolve, reject) => {
    if (!isWindows()) {
      resolve('Version switching on non-Windows requires terminal.');
      return;
    }

    try {
      const nvmRoot = findNvmRoot();
      if (nvmRoot) {
        const settingsPath = path.join(nvmRoot, 'settings.txt');
        if (fs.existsSync(settingsPath)) {
          let settings = fs.readFileSync(settingsPath, 'utf8');
          const cleanVersion = version.replace('v', '');

          settings = settings.replace(/nodejs: .*/g, '');
          if (!settings.endsWith('\n') && !settings.endsWith('\r')) {
            settings += '\r\n';
          }
          settings += `nodejs: ${cleanVersion}`;

          fs.writeFileSync(settingsPath, settings);

          const match = settings.match(/path: (.+)/);
          if (match) {
            const linkPath = match[1].trim();
            const targetPath = path.join(nvmRoot, version.startsWith('v') ? version : 'v' + version);

            if (fs.existsSync(linkPath)) {
              const stat = fs.lstatSync(linkPath);
              if (stat.isSymbolicLink()) {
                fs.unlinkSync(linkPath);
              } else if (stat.isDirectory()) {
                fs.rmdirSync(linkPath, { recursive: true });
              }
            }

            fs.symlinkSync(targetPath, linkPath, 'junction');
          }
        }
      }
      resolve(`Switched to ${version}. Please restart terminal/IDE.`);
    } catch (e) {
      reject(e);
    }
  });
}

function installVersion(version) {
  return Promise.resolve(`Please run "nvm install ${version.replace('v', '')}" in terminal.`);
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

ipcMain.handle('get-current-version', getCurrentVersion);
ipcMain.handle('get-installed-versions', getInstalledVersions);
ipcMain.handle('get-available-versions', getAvailableVersions);
ipcMain.handle('use-version', async (event, version) => useVersion(version));
ipcMain.handle('install-version', async (event, version) => installVersion(version));
