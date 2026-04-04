const { app, BrowserWindow, ipcMain, Menu, globalShortcut } = require('electron');
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
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
    backgroundColor: '#0f172a',
  });

  // 隐藏菜单栏
  Menu.setApplicationMenu(null);

  // 在开发模式下加载 Vite 开发服务器，生产模式下加载构建文件
  const isDev = process.argv.includes('--dev');
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
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
    path.join(process.env.USERPROFILE || '', 'AppData', 'Roaming', 'nvm'),
    path.join(process.env.PROGRAMFILES || '', 'nvm'),
    path.join(process.env['ProgramFiles(x86)'] || '', 'nvm'),
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
    // 首先尝试使用 nvm ls 命令获取已安装版本（更准确）
    try {
      const output = execSync('nvm ls', { shell: true, encoding: 'utf8' });
      const versions = [];
      const lines = output.split('\n');

      for (const line of lines) {
        // 匹配类似 "v20.12.0" 或 "  * 22.1.0" 的格式
        const match = line.match(/v?(\d+\.\d+\.\d+)/);
        if (match) {
          const version = match[0].startsWith('v') ? match[0] : 'v' + match[0];
          if (!versions.includes(version)) {
            versions.push(version);
          }
        }
      }

      if (versions.length > 0) {
        versions.sort((a, b) => {
          const pa = a.replace('v', '').split('.').map(Number);
          const pb = b.replace('v', '').split('.').map(Number);
          return pb[0] - pa[0] || pb[1] - pa[1] || pb[2] - pa[2];
        });
        console.log('Found versions via nvm ls:', versions);
        resolve(versions);
        return;
      }
    } catch (e) {
      console.log('nvm ls failed, falling back to directory scan:', e.message);
    }

    // 备用方案：扫描 nvm 目录
    const nvmRoot = findNvmRoot();
    console.log('Scanning nvm root:', nvmRoot);

    if (!nvmRoot || !fs.existsSync(nvmRoot)) {
      resolve([]);
      return;
    }

    try {
      const items = fs.readdirSync(nvmRoot);
      const versions = [];
      console.log('Items in nvm root:', items);

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

      console.log('Found versions via directory scan:', versions);
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
            .filter((r) => {
              // 过滤 rc 和 nightly 版本
              if (r.version.includes('rc') || r.version.includes('nightly')) return false;
              // 只保留 v24 及以下的版本（避免太新的版本）
              const majorMatch = r.version.match(/^v?(\d+)/);
              if (majorMatch) {
                const major = parseInt(majorMatch[1], 10);
                return major <= 24;
              }
              return false;
            })
            .map((r) => r.version)
            .slice(0, 100);

          if (versions.length > 0) {
            resolve(versions);
            return;
          }
        } catch (e) {
          console.error('Failed to parse Node.js versions:', e);
        }
        resolve([]);
      });
    }).on('error', (e) => {
      console.error('Failed to fetch Node.js versions:', e);
      resolve([]);
    });
  });
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
  return new Promise((resolve, reject) => {
    const cleanVersion = version.replace('v', '');

    // 首先尝试检测 nvm 是否可用
    try {
      execSync('nvm version', { shell: true, stdio: 'ignore' });
    } catch (e) {
      // nvm 不可用，回退到提示模式
      resolve(`Please run "nvm install ${cleanVersion}" in terminal.`);
      return;
    }

    // Windows 下需要使用 shell 来执行 nvm
    const options = {
      shell: true,
      env: { ...process.env }
    };

    console.log(`Executing: nvm install ${cleanVersion}`);

    exec(`nvm install ${cleanVersion}`, options, (error, stdout, stderr) => {
      console.log('stdout:', stdout);
      console.log('stderr:', stderr);

      // 即使有 error 码，也可能是成功的（nvm 有时返回非零退出码但实际成功）
      const output = (stdout || stderr || '').trim();

      // 检查输出中是否有成功的标志
      if (output && (
        output.toLowerCase().includes('complete') ||
        output.toLowerCase().includes('installed') ||
        output.toLowerCase().includes('using') ||
        output.includes(cleanVersion)
      )) {
        resolve(output);
        return;
      }

      // 如果有明显的错误信息
      if (error && output) {
        // 如果错误信息包含权限问题或其他问题，回退到提示
        if (output.toLowerCase().includes('access') ||
            output.toLowerCase().includes('permission') ||
            output.toLowerCase().includes('denied')) {
          resolve(`Please run "nvm install ${cleanVersion}" in terminal.`);
          return;
        }
        reject(new Error(output));
        return;
      }

      // 默认回退到提示模式
      resolve(`Please run "nvm install ${cleanVersion}" in terminal.`);
    });
  });
}

app.whenReady().then(() => {
  createWindow();

  // 注册开发工具快捷键
  globalShortcut.register('F12', () => {
    if (mainWindow) {
      mainWindow.webContents.toggleDevTools();
    }
  });

  globalShortcut.register('Ctrl+Shift+I', () => {
    if (mainWindow) {
      mainWindow.webContents.toggleDevTools();
    }
  });

  globalShortcut.register('Cmd+Option+I', () => {
    if (mainWindow) {
      mainWindow.webContents.toggleDevTools();
    }
  });

  // 注册刷新快捷键
  globalShortcut.register('F5', () => {
    if (mainWindow) {
      mainWindow.webContents.reload();
    }
  });

  globalShortcut.register('Ctrl+R', () => {
    if (mainWindow) {
      mainWindow.webContents.reload();
    }
  });

  globalShortcut.register('Cmd+R', () => {
    if (mainWindow) {
      mainWindow.webContents.reload();
    }
  });
});

app.on('will-quit', () => {
  // 注销所有快捷键
  globalShortcut.unregisterAll();
});

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
ipcMain.handle('use-version', async (_event, version) => useVersion(version));
ipcMain.handle('install-version', async (_event, version) => installVersion(version));
