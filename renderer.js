const { ipcRenderer } = require('electron');

let currentVersion = '';
let installedVersions = [];
let availableVersions = [];

const elements = {
  currentVersionValue: document.getElementById('currentVersionValue'),
  installedList: document.getElementById('installedList'),
  availableList: document.getElementById('availableList'),
  refreshBtn: document.getElementById('refreshBtn'),
  toast: document.getElementById('toast')
};

function showToast(message, type = 'info') {
  elements.toast.textContent = message;
  elements.toast.className = 'toast ' + type;
  elements.toast.classList.add('show');
  setTimeout(() => {
    elements.toast.classList.remove('show');
  }, 3000);
}

async function refreshAll() {
  await Promise.all([
    refreshCurrentVersion(),
    refreshInstalledVersions(),
    refreshAvailableVersions()
  ]);
}

async function refreshCurrentVersion() {
  try {
    const version = await ipcRenderer.invoke('get-current-version');
    currentVersion = version;
    elements.currentVersionValue.textContent = version || '未安装';
  } catch (error) {
    console.error('Failed to get current version:', error);
    elements.currentVersionValue.textContent = '获取失败';
  }
}

async function refreshInstalledVersions() {
  elements.installedList.innerHTML = '<div class="loading">加载中...</div>';
  try {
    installedVersions = await ipcRenderer.invoke('get-installed-versions');
    renderInstalledList();
  } catch (error) {
    console.error('Failed to get installed versions:', error);
    elements.installedList.innerHTML = '<div class="loading">加载失败</div>';
  }
}

async function refreshAvailableVersions() {
  elements.availableList.innerHTML = '<div class="loading">加载中...</div>';
  try {
    availableVersions = await ipcRenderer.invoke('get-available-versions');
    renderAvailableList();
  } catch (error) {
    console.error('Failed to get available versions:', error);
    elements.availableList.innerHTML = '<div class="loading">加载失败</div>';
  }
}

function renderInstalledList() {
  if (installedVersions.length === 0) {
    elements.installedList.innerHTML = '<div class="loading">暂无已安装版本</div>';
    return;
  }

  elements.installedList.innerHTML = installedVersions.map(version => {
    const isCurrent = version === currentVersion || version === currentVersion.replace('v', '');
    return `
      <div class="version-item ${isCurrent ? 'current' : ''}">
        <div class="version-info">
          <div class="version-number">${version}</div>
          ${isCurrent ? '<div class="version-badge">当前使用</div>' : ''}
        </div>
        <div class="version-actions">
          ${!isCurrent ? `<button class="btn btn-primary" onclick="useVersion('${version}')">使用</button>` : ''}
        </div>
      </div>
    `;
  }).join('');
}

function renderAvailableList() {
  if (availableVersions.length === 0) {
    elements.availableList.innerHTML = '<div class="loading">暂无可用版本</div>';
    return;
  }

  elements.availableList.innerHTML = availableVersions.map(version => {
    const isInstalled = installedVersions.includes(version) || installedVersions.includes(version.replace('v', ''));
    const isCurrent = version === currentVersion || version === currentVersion.replace('v', '');
    return `
      <div class="version-item ${isCurrent ? 'current' : ''}">
        <div class="version-info">
          <div class="version-number">${version}</div>
          ${isCurrent ? '<div class="version-badge">当前使用</div>' : ''}
          ${isInstalled && !isCurrent ? '<div class="version-badge" style="background: rgba(96, 165, 250, 0.2); color: #60a5fa;">已安装</div>' : ''}
        </div>
        <div class="version-actions">
          ${!isInstalled ? `<button class="btn btn-success" onclick="installVersion('${version}')">安装</button>` : ''}
          ${isInstalled && !isCurrent ? `<button class="btn btn-primary" onclick="useVersion('${version}')">使用</button>` : ''}
        </div>
      </div>
    `;
  }).join('');
}

async function useVersion(version) {
  try {
    showToast(`正在切换到 ${version}...`, 'info');
    await ipcRenderer.invoke('use-version', version);
    await refreshCurrentVersion();
    renderInstalledList();
    renderAvailableList();
    showToast(`已切换到 ${version}`, 'success');
  } catch (error) {
    console.error('Failed to use version:', error);
    showToast('切换失败: ' + error.message, 'error');
  }
}

async function installVersion(version) {
  try {
    showToast(`正在安装 ${version}...`, 'info');
    await ipcRenderer.invoke('install-version', version);
    await refreshInstalledVersions();
    renderAvailableList();
    showToast(`${version} 安装成功`, 'success');
  } catch (error) {
    console.error('Failed to install version:', error);
    showToast('安装失败: ' + error.message, 'error');
  }
}

document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById(tab.dataset.tab).classList.add('active');
  });
});

elements.refreshBtn.addEventListener('click', refreshAll);

window.useVersion = useVersion;
window.installVersion = installVersion;

refreshAll();
