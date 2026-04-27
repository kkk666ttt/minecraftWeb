// ===================== 数据加载 =====================
async function loadData() {
  try {
    const [config, plugins, docs, activities, gallery, changelog] = await Promise.all([
      fetch('data/config.json').then(r => r.json()),
      fetch('data/plugins.json').then(r => r.json()),
      fetch('data/docs.json').then(r => r.json()),
      fetch('data/activities.json').then(r => r.json()),
      fetch('data/gallery.json').then(r => r.json()),
      fetch('data/changelog.json').then(r => r.json())
    ]);
    App.config = config;
    App.plugins = plugins;
    App.docs = docs;
    App.activities = activities;
    App.gallery = gallery;
    App.changelog = changelog;
    App.filteredPlugins = [...plugins];
    try {
      const saved = JSON.parse(localStorage.getItem('readActivities') || '[]');
      App.readActivities = new Set(saved);
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
function navigateTo(pageId) {
  $$('.page').forEach(p => p.classList.remove('active'));
  const page = document.getElementById(`page-${pageId}`);
  if (page) page.classList.add('active');
  $$('.nav-item').forEach(n => n.classList.remove('active'));
  const navItem = $(`.nav-item[data-page="${pageId}"]`);
  if (navItem) navItem.classList.add('active');
  if (pageId === 'activities' && !App.pendingActivity) {
    App.currentActivity = null;
  }
  App.currentPage = pageId;
  renderPage(pageId);
  document.querySelector('.sidebar').classList.remove('open');
}

function renderPage(pageId) {
  if (pageId === 'activities' && App.pendingActivity) {
    const actId = App.pendingActivity;
    App.pendingActivity = null;
    const act = App.activities?.find(a => a.id === actId);
    if (act) { renderActivityDetail(act); return; }
  }
  switch (pageId) {
    case 'home': renderHome(); break;
    case 'plugins': renderPluginList(); break;
    case 'docs': renderDocs(); break;
    case 'qq-group': renderQQGroup(); break;
    case 'about': renderAbout(); break;
    case 'activities': renderActivitiesPage(); break;
    case 'gallery': renderGallery(); break;
    case 'changelog': renderChangelog(); break;
  }
}
