const { app, BrowserWindow, ipcMain, Menu, globalShortcut, shell } = require('electron');
const { exec, execSync } = require('child_process');
const path = require('path');
const os = require('os');
const fs = require('fs');
const https = require('https');

let mainWindow;

function createWindow() {
  const isDev = process.argv.includes('--dev');
  mainWindow = new BrowserWindow({
    width: 520,
    height: 680,
    frame: false,
    resizable: true,
    autoHideMenuBar: true,
    titleBarStyle: 'hidden',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      devTools: isDev,
    },
    backgroundColor: '#0f172a',
  });

  // 隐藏菜单栏
  Menu.setApplicationMenu(null);

  // 在开发模式下加载 Vite 开发服务器，生产模式下加载构建文件
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
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

function checkNvmInstalled() {
  return new Promise((resolve) => {
    // 首先检查 nvm 目录是否存在（避免命令阻塞）
    const nvmRoot = findNvmRoot();
    if (nvmRoot !== null && fs.existsSync(nvmRoot)) {
      resolve(true);
      return;
    }

    // 备选方案：尝试通过命令检测
    try {
      execSync('nvm version', { shell: true, stdio: 'ignore', timeout: 2000 });
      resolve(true);
      return;
    } catch {
      // 命令也失败
    }

    resolve(false);
  });
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
    // 首先使用目录扫描（避免命令阻塞）
    const nvmRoot = findNvmRoot();
    console.log('Scanning nvm root:', nvmRoot);

    if (nvmRoot && fs.existsSync(nvmRoot)) {
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

        if (versions.length > 0) {
          versions.sort((a, b) => {
            const pa = a.replace('v', '').split('.').map(Number);
            const pb = b.replace('v', '').split('.').map(Number);
            return pb[0] - pa[0] || pb[1] - pa[1] || pb[2] - pa[2];
          });

          console.log('Found versions via directory scan:', versions);
          resolve(versions);
          return;
        }
      } catch (e) {
        console.log('Directory scan failed, falling back to nvm ls:', e.message);
      }
    }

    // 备选方案：尝试使用 nvm ls 命令
    try {
      const output = execSync('nvm ls', { shell: true, encoding: 'utf8', timeout: 3000 });
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
      console.log('nvm ls also failed:', e.message);
    }

    resolve([]);
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
              // 只保留 v0.10 及以上的版本（避免太老的版本）
              const majorMatch = r.version.match(/^v?(\d+)/);
              if (majorMatch) {
                const major = parseInt(majorMatch[1], 10);
                return major >= 0; // 保留所有主要版本
              }
              return false;
            })
            .map((r) => r.version);
          // 不限制数量，显示所有可用版本

          if (versions.length > 0) {
            resolve({ success: true, versions });
            return;
          }
        } catch (e) {
          console.error('Failed to parse Node.js versions:', e);
        }
        resolve({ success: false, error: '解析版本数据失败', versions: [] });
      });
    }).on('error', (e) => {
      console.error('Failed to fetch Node.js versions:', e);
      resolve({ success: false, error: '网络连接失败，请检查网络后重试', versions: [] });
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
      // 增强错误提示
      if (e.code === 'EPERM') {
        reject(new Error('权限不足！请以管理员身份运行此应用。\n\n原因：修改 NVM 配置需要管理员权限。\n\n解决方法：右键点击应用图标，选择"以管理员身份运行"。'));
      } else {
        reject(e);
      }
    }
  });
}

function getNodeMirror() {
  return new Promise((resolve) => {
    try {
      const nvmRoot = findNvmRoot();
      if (nvmRoot) {
        const settingsPath = path.join(nvmRoot, 'settings.txt');
        if (fs.existsSync(settingsPath)) {
          const content = fs.readFileSync(settingsPath, 'utf8');
          const match = content.match(/node_mirror:\s*(.+)/);
          if (match) {
            let mirror = match[1].trim();
            if (!mirror.endsWith('/')) {
              mirror += '/';
            }
            resolve(mirror);
            return;
          }
        }
      }
    } catch (e) {
      console.log('Failed to read node_mirror:', e);
    }
    resolve('https://nodejs.org/dist/');
  });
}

function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destPath);

    const protocol = url.startsWith('https') ? https : require('http');

    protocol.get(url, (response) => {
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        // 处理重定向
        downloadFile(response.headers.location, destPath).then(resolve).catch(reject);
        return;
      }

      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download: ${response.statusCode}`));
        return;
      }

      response.pipe(file);

      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(destPath, () => {});
      reject(err);
    });
  });
}

function extractZip(zipPath, destDir) {
  return new Promise((resolve, reject) => {
    // 使用 PowerShell 解压
    const powershellCmd = `powershell.exe -NoProfile -Command "Expand-Archive -Path '${zipPath}' -DestinationPath '${destDir}' -Force"`;

    exec(powershellCmd, { shell: true, timeout: 300000 }, (error, stdout, stderr) => {
      if (error) {
        // 如果 PowerShell 解压失败，尝试使用 tar（Windows 10 17063+ 自带）
        const tarCmd = `tar -xf "${zipPath}" -C "${destDir}"`;
        exec(tarCmd, { shell: true, timeout: 300000 }, (tarError, tarStdout, tarStderr) => {
          if (tarError) {
            reject(new Error(`Failed to extract: ${error.message} || ${tarError.message}`));
          } else {
            resolve();
          }
        });
      } else {
        resolve();
      }
    });
  });
}

function installVersion(version) {
  return new Promise(async (resolve, reject) => {
    const cleanVersion = version.replace('v', '');
    const versionWithV = version.startsWith('v') ? version : 'v' + version;

    try {
      const nvmRoot = findNvmRoot();
      if (!nvmRoot) {
        resolve(`请在终端中运行: nvm install ${cleanVersion}`);
        return;
      }

      // 检查目标目录是否已存在
      const targetDir = path.join(nvmRoot, versionWithV);
      if (fs.existsSync(targetDir)) {
        resolve(`Version ${versionWithV} is already installed.`);
        return;
      }

      // 创建临时目录
      const tempDir = path.join(nvmRoot, 'temp');
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }

      // 获取下载镜像
      const nodeMirror = await getNodeMirror();
      console.log('Using mirror:', nodeMirror);

      // 构造下载 URL
      const zipFileName = `node-v${cleanVersion}-win-x64.zip`;
      const downloadUrl = `${nodeMirror}v${cleanVersion}/${zipFileName}`;
      const zipPath = path.join(tempDir, zipFileName);

      console.log('Downloading from:', downloadUrl);
      console.log('Saving to:', zipPath);

      // 下载文件
      await downloadFile(downloadUrl, zipPath);

      console.log('Download complete, extracting...');

      // 创建目标目录
      fs.mkdirSync(targetDir, { recursive: true });

      // 解压文件
      await extractZip(zipPath, targetDir);

      // 检查解压后的内容，可能需要把内容从子目录移出来
      const extractedDirs = fs.readdirSync(targetDir);
      if (extractedDirs.length === 1) {
        const subDir = path.join(targetDir, extractedDirs[0]);
        if (fs.statSync(subDir).isDirectory()) {
          // 把内容从子目录移出来
          const subFiles = fs.readdirSync(subDir);
          for (const file of subFiles) {
            fs.renameSync(path.join(subDir, file), path.join(targetDir, file));
          }
          // 删除空的子目录
          fs.rmdirSync(subDir);
        }
      }

      // 清理临时文件
      try {
        fs.unlinkSync(zipPath);
      } catch (e) {
        console.log('Failed to delete temp zip:', e);
      }

      console.log('Installation complete!');
      resolve(`Node.js ${versionWithV} installed successfully!`);

    } catch (error) {
      console.log('Manual installation failed:', error);

      // 如果手动安装失败，回退到提示用户使用终端
      resolve(`请在终端中运行: nvm install ${cleanVersion}`);
    }
  });
}

function uninstallVersion(version) {
  return new Promise((resolve, reject) => {
    const cleanVersion = version.replace('v', '');
    const versionWithV = version.startsWith('v') ? version : 'v' + version;

    try {
      const nvmRoot = findNvmRoot();
      if (!nvmRoot) {
        resolve(`请在终端中运行: nvm uninstall ${cleanVersion}`);
        return;
      }

      // 检查目标目录是否存在
      const targetDir = path.join(nvmRoot, versionWithV);
      if (!fs.existsSync(targetDir)) {
        resolve(`Version ${versionWithV} is not installed.`);
        return;
      }

      // 删除版本目录
      console.log('Uninstalling version:', versionWithV);
      fs.rmSync(targetDir, { recursive: true, force: true });

      console.log('Uninstallation complete!');
      resolve(`Node.js ${versionWithV} uninstalled successfully!`);

    } catch (error) {
      console.log('Manual uninstallation failed:', error);

      // 如果手动卸载失败，回退到提示用户使用终端
      resolve(`请在终端中运行: nvm uninstall ${cleanVersion}`);
    }
  });
}

app.whenReady().then(() => {
  createWindow();

  const isDev = process.argv.includes('--dev');

  // 只有开发环境才注册开发工具和刷新快捷键
  if (isDev) {
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
  }
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

// 窗口控制
ipcMain.handle('window-minimize', () => {
  if (mainWindow) {
    mainWindow.minimize();
  }
});

ipcMain.handle('window-maximize', () => {
  if (mainWindow) {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  }
});

ipcMain.handle('window-close', () => {
  if (mainWindow) {
    mainWindow.close();
  }
});

ipcMain.handle('window-is-maximized', () => {
  if (mainWindow) {
    return mainWindow.isMaximized();
  }
  return false;
});

ipcMain.handle('check-nvm-installed', checkNvmInstalled);

ipcMain.handle('get-current-version', getCurrentVersion);
ipcMain.handle('get-installed-versions', getInstalledVersions);
ipcMain.handle('get-available-versions', getAvailableVersions);
ipcMain.handle('use-version', async (_event, version) => useVersion(version));
ipcMain.handle('install-version', async (_event, version) => installVersion(version));
ipcMain.handle('uninstall-version', async (_event, version) => uninstallVersion(version));
ipcMain.handle('open-external-url', (_event, url) => {
  shell.openExternal(url);
});

ipcMain.handle('copy-to-clipboard', (_event, text) => {
  const { clipboard } = require('electron');
  clipboard.writeText(text);
  return true;
});

// 读取 nvm settings
ipcMain.handle('get-nvm-settings', () => {
  return new Promise((resolve) => {
    try {
      const nvmRoot = findNvmRoot();
      if (!nvmRoot) {
        resolve({});
        return;
      }

      const settingsPath = path.join(nvmRoot, 'settings.txt');
      if (!fs.existsSync(settingsPath)) {
        resolve({});
        return;
      }

      const content = fs.readFileSync(settingsPath, 'utf8');
      const settings = {};

      // 解析 key: value 格式
      const lines = content.split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.includes(':')) continue;

        const colonIndex = trimmed.indexOf(':');
        const key = trimmed.substring(0, colonIndex).trim();
        const value = trimmed.substring(colonIndex + 1).trim();

        if (key) {
          settings[key] = value;
        }
      }

      console.log('Loaded nvm settings:', settings);
      resolve(settings);
    } catch (e) {
      console.error('Failed to load nvm settings:', e);
      resolve({});
    }
  });
});

// 保存 nvm settings
ipcMain.handle('set-nvm-settings', (_event, newSettings) => {
  return new Promise((resolve, reject) => {
    try {
      const nvmRoot = findNvmRoot();
      if (!nvmRoot) {
        reject(new Error('NVM root not found'));
        return;
      }

      const settingsPath = path.join(nvmRoot, 'settings.txt');
      let content = '';

      // 如果文件存在，先读取现有内容
      if (fs.existsSync(settingsPath)) {
        content = fs.readFileSync(settingsPath, 'utf8');
      }

      // 更新或添加配置项
      for (const [key, value] of Object.entries(newSettings)) {
        if (value === undefined || value === null) continue;

        const regex = new RegExp(`^${key}:.*$`, 'gm');
        const newLine = `${key}: ${value}`;

        if (regex.test(content)) {
          // 替换已存在的配置
          content = content.replace(regex, newLine);
        } else {
          // 添加新配置
          if (content && !content.endsWith('\n')) {
            content += '\n';
          }
          content += `${newLine}\n`;
        }
      }

      // 写回文件
      fs.writeFileSync(settingsPath, content, 'utf8');
      console.log('Saved nvm settings:', newSettings);
      resolve(true);
    } catch (e) {
      console.error('Failed to save nvm settings:', e);
      // 增强错误提示
      if (e.code === 'EPERM') {
        reject(new Error('权限不足！请以管理员身份运行此应用。\n\n原因：修改 NVM 配置需要管理员权限。\n\n解决方法：右键点击应用图标，选择"以管理员身份运行"。'));
      } else {
        reject(e);
      }
    }
  });
});
