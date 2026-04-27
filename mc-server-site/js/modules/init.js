// ===================== 导航初始化 =====================
function initNavigation() {
  const navContainer = document.getElementById('sidebar-nav');
  navContainer.innerHTML = App.config.navigation.map(nav => `
    <div class="nav-item" data-page="${nav.id}">
      <span>${nav.label}</span>
    </div>
  `).join('');

  $$('.nav-item').forEach(item => {
    item.addEventListener('click', () => navigateTo(item.dataset.page));
  });

  // 侧边栏IP状态
  const statusEl = document.querySelector('.sidebar-footer .server-status');
  if (statusEl && App.config.serverIpHidden) {
    statusEl.innerHTML = App.ipUnlocked
      ? '<span style="color:var(--accent-green);font-size:13px;">🔓 IP已解锁</span>'
      : '<span style="color:var(--accent-red);font-size:13px;">🔒 IP已隐藏</span>';
  }

  // 默认折叠活动通知面板
  document.getElementById('activities-body')?.classList.add('collapsed');
  document.getElementById('activities-toggle')?.classList.remove('open');
  renderSidebarActivities();

  // 侧边栏折叠
  document.getElementById('sidebar-collapse').addEventListener('click', toggleSidebar);

  // 恢复折叠状态
  try {
    if (localStorage.getItem('sidebarCollapsed') === 'true') {
      App.sidebarCollapsed = true;
      document.getElementById('sidebar').classList.add('collapsed');
      document.querySelector('.main-content').classList.add('sidebar-collapsed');
      const btn = document.getElementById('sidebar-collapse');
      btn.classList.add('collapsed');
      btn.textContent = '▶';
      btn.title = '展开侧边栏';
    }
  } catch(e) {}

  // 恢复折叠按钮拖动位置
  restoreCollapseBtnPosition();

  // 初始化拖动
  initCollapseBtnDrag();

  // 移动端菜单
  document.getElementById('menu-toggle').addEventListener('click', () => {
    document.querySelector('.sidebar').classList.toggle('open');
  });
}

// ===================== 侧边栏折叠 =====================
function toggleSidebar() {
  App.sidebarCollapsed = !App.sidebarCollapsed;
  const sidebar = document.getElementById('sidebar');
  const main = document.querySelector('.main-content');
  const btn = document.getElementById('sidebar-collapse');

  sidebar.classList.toggle('collapsed', App.sidebarCollapsed);
  main.classList.toggle('sidebar-collapsed', App.sidebarCollapsed);
  btn.classList.toggle('collapsed', App.sidebarCollapsed);
  btn.textContent = App.sidebarCollapsed ? '▶' : '◀';
  btn.title = App.sidebarCollapsed ? '展开侧边栏' : '折叠侧边栏';

  // 展开时恢复用户保存的拖动位置（如果有），折叠时强制贴左
  if (App.sidebarCollapsed) {
    btn.style.left = '0';
  } else {
    restoreCollapseBtnPosition();
  }

  try { localStorage.setItem('sidebarCollapsed', App.sidebarCollapsed); } catch(e) {}
}

// ===================== 折叠按钮拖拽 =====================
function initCollapseBtnDrag() {
  const btn = document.getElementById('sidebar-collapse');
  if (!btn) return;

  let isDragging = false;
  let startY = 0;
  let startTop = 0;

  btn.addEventListener('mousedown', function(e) {
    // 只有左键拖动
    if (e.button !== 0) return;
    isDragging = true;
    startY = e.clientY;
    // 获取当前 top 值（可能为百分比或px）
    const rect = btn.getBoundingClientRect();
    const parentHeight = window.innerHeight;
    // 存为像素值
    startTop = rect.top;
    btn.style.top = rect.top + 'px';
    btn.style.transform = 'none'; // 移除 translateY，用像素控制
    btn.style.cursor = 'grabbing';
    btn.classList.add('dragging');
    e.preventDefault();
  });

  document.addEventListener('mousemove', function(e) {
    if (!isDragging) return;
    const dy = e.clientY - startY;
    let newTop = startTop + dy;
    // 限制在可视区域内
    const btnHeight = btn.offsetHeight;
    newTop = Math.max(0, Math.min(window.innerHeight - btnHeight, newTop));
    btn.style.top = newTop + 'px';
  });

  document.addEventListener('mouseup', function(e) {
    if (!isDragging) return;
    isDragging = false;
    btn.style.cursor = '';
    btn.classList.remove('dragging');
    // 保存位置
    const top = parseInt(btn.style.top);
    const ratio = top / window.innerHeight;
    try { localStorage.setItem('collapseBtnTop', ratio.toString()); } catch(ex) {}
  });

  // 窗口大小变化时适配比例
  window.addEventListener('resize', function() {
    if (App.sidebarCollapsed) return; // 折叠时不处理，展开时 restore 会处理
    restoreCollapseBtnPosition();
  });
}

function restoreCollapseBtnPosition() {
  const btn = document.getElementById('sidebar-collapse');
  if (!btn) return;
  try {
    const saved = localStorage.getItem('collapseBtnTop');
    if (saved !== null) {
      const ratio = parseFloat(saved);
      if (!isNaN(ratio) && ratio >= 0 && ratio <= 1) {
        // 折叠状态且没有自定义拖动时，折叠按钮固定在左边缘中间
        btn.style.top = (ratio * window.innerHeight) + 'px';
        btn.style.transform = 'none';
        return;
      }
    }
  } catch(e) {}
  // 默认居中
  btn.style.top = '50%';
  btn.style.transform = 'translateY(-50%)';
}

// ===================== 全局键盘事件 =====================
document.addEventListener('keydown', function(e) {
  if (e.key === 'Enter' && document.getElementById('access-modal')?.classList.contains('show')) {
    verifyAccess();
  }
  if (e.key === 'Escape') {
    closeImageViewer();
    closeGalleryViewer();
    if (document.getElementById('access-modal')?.classList.contains('show')) closeAccessModal();
  }
  if (document.getElementById('gallery-viewer')?.classList.contains('show')) {
    if (e.key === 'ArrowLeft') galleryPrev();
    if (e.key === 'ArrowRight') galleryNext();
  }
});

// 点击模态框遮罩关闭 + 点击侧边栏外部收回
document.addEventListener('click', function(e) {
  if (e.target === document.getElementById('plugin-modal')) closePluginModal();
  if (e.target === document.getElementById('access-modal')) closeAccessModal();
  if (e.target === document.getElementById('gallery-viewer')) closeGalleryViewer();

  // 桌面端：点击侧边栏外部区域收回侧边栏
  const sidebar = document.getElementById('sidebar');
  const toggleBtn = document.getElementById('menu-toggle');
  const collapseBtn = document.getElementById('sidebar-collapse');
  if (
    !App.sidebarCollapsed &&
    sidebar &&
    !sidebar.contains(e.target) &&
    toggleBtn && !toggleBtn.contains(e.target) &&
    collapseBtn && !collapseBtn.contains(e.target) &&
    window.innerWidth > 768
  ) {
    toggleSidebar();
  }
});

// ===================== 初始化 =====================
async function init() {
  // 进度条开始
  startLoadingBar();

  const loaded = await loadData();

  // 进度条结束
  finishLoadingBar();

  if (!loaded) {
    document.getElementById('app').innerHTML = '<div style="text-align:center;padding:80px 20px;color:var(--accent-red);"><h2>数据加载失败</h2><p>请确保数据文件存在且格式正确</p></div>';
    return;
  }
  initNavigation();
  navigateTo('home');

  // 恢复主题
  restoreTheme();

  // 首次访问规则弹窗
  showRulesIfNeeded();
}

document.addEventListener('DOMContentLoaded', init);

// ===================== 加载进度条 =====================
function startLoadingBar() {
  const bar = document.getElementById('loading-bar');
  if (!bar) return;
  bar.style.display = 'block';
  bar.style.width = '0%';
  // 先快速到 30%
  setTimeout(() => { bar.style.width = '30%'; }, 50);
  // 再到 60%
  setTimeout(() => { bar.style.width = '60%'; }, 200);
  // 再到 85%
  setTimeout(() => { bar.style.width = '85%'; }, 500);
}

function finishLoadingBar() {
  const bar = document.getElementById('loading-bar');
  if (!bar) return;
  bar.style.width = '100%';
  setTimeout(() => {
    bar.style.width = '0%';
    bar.style.display = 'none';
  }, 400);
}

// ===================== 规则弹窗 =====================
function showRulesIfNeeded() {
  try {
    if (localStorage.getItem('rulesAccepted') === 'true') return;
  } catch(e) {}
  document.getElementById('rules-modal').classList.add('show');
  document.body.style.overflow = 'hidden';
}

function acceptRules() {
  try { localStorage.setItem('rulesAccepted', 'true'); } catch(e) {}
  document.getElementById('rules-modal').classList.remove('show');
  document.body.style.overflow = '';
}

function declineRules() {
  // 拒绝则跳转到 Minecraft 官网（纯娱乐效果）
  try { localStorage.setItem('rulesAccepted', 'false'); } catch(e) {}
  window.location.href = 'https://www.minecraft.net';
}

// ===================== 主题切换 =====================
function toggleTheme() {
  const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
  const newTheme = isDark ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', newTheme);
  document.getElementById('theme-toggle').textContent = isDark ? '☀️' : '🌙';
  try { localStorage.setItem('siteTheme', newTheme); } catch(e) {}
}

function restoreTheme() {
  try {
    const saved = localStorage.getItem('siteTheme');
    if (saved === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
      document.getElementById('theme-toggle').textContent = '☀️';
    }
  } catch(e) {}
}
