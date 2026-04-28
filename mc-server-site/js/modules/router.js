// ===================== 数据加载 =====================
async function loadData() {
  try {
    const [config, plugins, resourcepacks, docs, activities, gallery, changelog, commands] = await Promise.all([
      fetch('data/config.json').then(r => r.json()),
      fetch('data/plugins.json').then(r => r.json()),
      fetch('data/resourcepacks.json').then(r => r.json()),
      fetch('data/docs.json').then(r => r.json()),
      fetch('data/activities.json').then(r => r.json()),
      fetch('data/gallery.json').then(r => r.json()),
      fetch('data/changelog.json').then(r => r.json()),
      fetch('data/commands.json').then(r => r.json())
    ]);
    App.config = config;
    App.plugins = Array.isArray(plugins) ? plugins : [];
    App.resourcepacks = Array.isArray(resourcepacks) ? resourcepacks : [];
    App.docs = Array.isArray(docs) ? docs : [];
    App.activities = Array.isArray(activities) ? activities : [];
    App.gallery = Array.isArray(gallery) ? gallery : [];
    App.changelog = Array.isArray(changelog) ? changelog : [];
    App.commands = Array.isArray(commands) ? commands : [];
    App.filteredPlugins = [...App.plugins];
    try {
      const saved = JSON.parse(localStorage.getItem('readActivities') || '[]');
      App.readActivities = new Set(Array.isArray(saved) ? saved : []);
    } catch(e) { App.readActivities = new Set(); }
    try {
      App.ipUnlocked = localStorage.getItem('ipUnlocked') === 'true';
    } catch(e) { App.ipUnlocked = false; }
    return true;
  } catch (e) {
    console.error('数据加载失败:', e);
    return false;
  }
}

// ===================== 路由 =====================
function navigateTo(pageId, pushState) {
  if (pushState !== false) {
    history.pushState({ page: pageId }, '', '#' + pageId);
  }
  $$('.page').forEach(p => p.classList.remove('active'));
  const page = document.getElementById('page-' + pageId);
  if (page) page.classList.add('active');
  $$('.nav-item').forEach(n => n.classList.remove('active'));
  const navItem = $('.nav-item[data-page="' + pageId + '"]');
  if (navItem) navItem.classList.add('active');
  if (pageId === 'activities' && !App.pendingActivity) {
    App.currentActivity = null;
  }
  App.currentPage = pageId;
  renderPage(pageId);
  const sidebar = document.querySelector('.sidebar');
  if (sidebar) sidebar.classList.remove('open');
}

// ===================== 浏览器回退 =====================
window.addEventListener('popstate', function(e) {
  // 关闭所有模态框
  document.querySelectorAll('.modal-overlay.show').forEach(function(m) {
    m.classList.remove('show');
  });
  document.body.style.overflow = '';

  var targetPage = 'home';
  var hash = window.location.hash.replace('#', '');
  if (hash && document.getElementById('page-' + hash)) {
    targetPage = hash;
  } else if (e.state && e.state.page) {
    targetPage = e.state.page;
  }
  navigateTo(targetPage, false);
});

function renderPage(pageId) {
  if (pageId === 'activities' && App.pendingActivity) {
    const actId = App.pendingActivity;
    App.pendingActivity = null;
    const act = (App.activities || []).find(a => a.id === actId);
    if (act) { renderActivityDetail(act); return; }
  }
  switch (pageId) {
    case 'home': renderHome(); break;
    case 'plugins': renderPluginList(); break;
    case 'resourcepacks': renderResourcepacks(); break;
    case 'commands': renderCommands(); break;
    case 'docs': renderDocs(); break;
    case 'qq-group': renderQQGroup(); break;
    case 'about': renderAbout(); break;
    case 'activities': renderActivitiesPage(); break;
    case 'gallery': renderGallery(); break;
    case 'changelog': renderChangelog(); break;
  }
}
