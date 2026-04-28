// ===================== 导航初始化 =====================
function initNavigation() {
  var navContainer = document.getElementById('sidebar-nav');
  if (!navContainer || !App.config) return;

  navContainer.innerHTML = App.config.navigation.map(function(nav) {
    return '<div class="nav-item" data-page="' + nav.id + '"><span>' + nav.label + '</span></div>';
  }).join('');

  document.querySelectorAll('.nav-item').forEach(function(item) {
    item.addEventListener('click', function(e) {
      e.stopPropagation();
      navigateTo(item.dataset.page);
    });
  });

  // IP 状态
  var statusEl = document.querySelector('.sidebar-footer .server-status');
  if (statusEl && App.config.serverIpHidden) {
    statusEl.innerHTML = App.ipUnlocked
      ? '<span style="color:var(--accent-green);font-size:13px;">🔓 IP已解锁</span>'
      : '<span style="color:var(--accent-red);font-size:13px;">🔒 IP已隐藏</span>';
  }

  // 活动通知面板默认展开
  App.activitiesOpen = true;
  var actBody = document.getElementById('activities-body');
  var actToggle = document.getElementById('activities-toggle');
  if (actBody) actBody.classList.remove('collapsed');
  if (actToggle) actToggle.classList.add('open');
  renderSidebarActivities();

  // 折叠按钮
  var collapseBtn = document.getElementById('sidebar-collapse');
  if (collapseBtn) {
    collapseBtn.onclick = function(e) {
      e.stopPropagation();
      toggleSidebar();
    };
  }

  // 恢复折叠状态
  try {
    if (localStorage.getItem('sidebarCollapsed') === 'true') {
      App.sidebarCollapsed = true;
      var sidebar = document.getElementById('sidebar');
      if (sidebar) sidebar.classList.add('collapsed');
      var main = document.querySelector('.main-content');
      if (main) main.classList.add('sidebar-collapsed');
      var btn = document.getElementById('sidebar-collapse');
      if (btn) {
        btn.classList.add('collapsed');
        btn.textContent = '▶';
        btn.title = '展开侧边栏';
      }
    }
  } catch(e) {}

  restoreCollapseBtnPosition();
  initCollapseBtnDrag();

  // 移动端菜单
  var menuToggle = document.getElementById('menu-toggle');
  if (menuToggle) {
    menuToggle.addEventListener('click', function(e) {
      e.stopPropagation();
      var sidebar = document.querySelector('.sidebar');
      if (sidebar) sidebar.classList.toggle('open');
    });
  }

  // 点击侧边栏外侧关闭或折叠
  document.addEventListener('click', function(e) {
    var sidebar = document.getElementById('sidebar');
    var toggle = document.getElementById('menu-toggle');
    var collapseBtn = document.getElementById('sidebar-collapse');
    if (!sidebar) return;

    // 移动端：关闭 open 状态
    if (sidebar.classList.contains('open') &&
        !sidebar.contains(e.target) &&
        toggle && !toggle.contains(e.target)) {
      sidebar.classList.remove('open');
    }

    // 桌面端：点击外侧折叠侧边栏（仅当未折叠且非移动端）
    if (window.innerWidth > 768 &&
        !App.sidebarCollapsed &&
        !sidebar.contains(e.target) &&
        collapseBtn && !collapseBtn.contains(e.target) &&
        toggle && !toggle.contains(e.target)) {
      toggleSidebar();
    }
  });
}

// ===================== 侧边栏折叠 =====================
function toggleSidebar() {
  App.sidebarCollapsed = !App.sidebarCollapsed;
  var sidebar = document.getElementById('sidebar');
  var main = document.querySelector('.main-content');
  var btn = document.getElementById('sidebar-collapse');
  if (!sidebar || !main || !btn) return;

  sidebar.classList.toggle('collapsed', App.sidebarCollapsed);
  main.classList.toggle('sidebar-collapsed', App.sidebarCollapsed);
  btn.classList.toggle('collapsed', App.sidebarCollapsed);
  btn.textContent = App.sidebarCollapsed ? '▶' : '◀';
  btn.title = App.sidebarCollapsed ? '展开侧边栏' : '折叠侧边栏';

  if (App.sidebarCollapsed) {
    btn.style.left = '0';
  } else {
    restoreCollapseBtnPosition();
  }
  try { localStorage.setItem('sidebarCollapsed', App.sidebarCollapsed); } catch(e) {}
}

function initCollapseBtnDrag() {
  // 占位函数，避免调用报错
}

function restoreCollapseBtnPosition() {
  var btn = document.getElementById('sidebar-collapse');
  if (!btn) return;
  try {
    var saved = localStorage.getItem('sidebarCollapseTop');
    if (saved) btn.style.top = saved;
  } catch(e) {}
}

// ===================== 启动入口 =====================
async function init() {
  var bar = document.getElementById('loading-bar');
  if (bar) { bar.style.display = 'block'; bar.style.width = '30%'; }

  var loaded = await loadData();

  if (bar) { bar.style.width = '100%'; setTimeout(function() { bar.style.display = 'none'; }, 400); }

  if (!loaded) {
    var appEl = document.getElementById('app');
    if (appEl) appEl.innerHTML = '<div style="text-align:center;padding:80px;color:red;">数据加载异常，请检查 JSON 文件。</div>';
    return;
  }

  initNavigation();

  setTimeout(function() {
    navigateTo('home');
    restoreTheme();
    showRulesIfNeeded();
  }, 10);
}

function showRulesIfNeeded() {
  try { if (localStorage.getItem('rulesAccepted') === 'true') return; } catch(e) {}
  var modal = document.getElementById('rules-modal');
  if (modal) modal.classList.add('show');
}

function acceptRules() {
  try { localStorage.setItem('rulesAccepted', 'true'); } catch(e) {}
  var modal = document.getElementById('rules-modal');
  if (modal) modal.classList.remove('show');
  document.body.style.overflow = '';
}

function declineRules() {
  try { localStorage.setItem('rulesAccepted', 'false'); } catch(e) {}
  window.location.href = 'https://www.minecraft.net';
}

function restoreTheme() {
  try {
    var saved = localStorage.getItem('siteTheme');
    if (saved === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
      var btn = document.getElementById('theme-toggle');
      if (btn) btn.textContent = '☀️';
    }
  } catch(e) {}
}

function toggleTheme() {
  var isDark = document.documentElement.getAttribute('data-theme') !== 'light';
  var newTheme = isDark ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', newTheme);
  var btn = document.getElementById('theme-toggle');
  if (btn) btn.textContent = isDark ? '☀️' : '🌙';
  try { localStorage.setItem('siteTheme', newTheme); } catch(e) {}
}

document.addEventListener('DOMContentLoaded', init);
