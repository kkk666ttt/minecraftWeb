// ===================== 插件列表 + 搜索 =====================
function renderPluginList() {
  var container = document.getElementById('plugins-content');
  var categories = [...new Set(App.plugins.map(function(p) { return p.category; }))];
  App._pluginCategory = 'all';
  App._pluginQuery = '';

  container.innerHTML = 
    '<div class="page-header">' +
      '<h2>🔌 服务器插件</h2>' +
      '<p>了解服务器安装的功能插件及其使用方法</p>' +
    '</div>' +
    '<div class="plugin-filters" id="plugin-filters">' +
      '<button class="plugin-filter-btn active" data-cat="all" onclick="filterPlugins(\'all\', this)">📦 全部</button>' +
      categories.map(function(c) { return '<button class="plugin-filter-btn" data-cat="' + c + '" onclick="filterPlugins(\'' + c + '\', this)">' + c + '</button>'; }).join('') +
    '</div>' +
    '<div style="margin-bottom:16px;">' +
      '<input type="text" class="search-box" id="plugin-search" placeholder="🔍  搜索插件名称或描述..." oninput="searchPlugins()">' +
    '</div>' +
    '<div class="plugin-grid" id="plugin-grid">' +
      renderPluginCards(App.plugins) +
    '</div>';
}

function renderPluginCards(plugins) {
  var catMap = { '核心': 'core', '管理': 'manage', '玩法': 'gameplay', '生存': 'survival', '经济': 'economy' };
  return plugins.map(function(p) {
    return '<div class="plugin-card" onclick="openPluginDetail(\'' + p.id + '\')">' +
      '<div class="plugin-header">' +
        '<div class="plugin-icon">' + renderIcon(p) + '</div>' +
        '<div class="plugin-info">' +
          '<h4>' + p.name + '</h4>' +
          '<div class="plugin-meta">' +
            '<span class="plugin-category ' + (catMap[p.category] || '') + '">' + p.category + '</span>' +
            '<span>v' + p.version + '</span>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div class="plugin-desc">' + p.description + '</div>' +
      '<div class="plugin-footer"><span>👤 ' + p.author + '</span></div>' +
    '</div>';
  }).join('');
}

function filterPlugins(category, btn) {
  document.querySelectorAll('.plugin-filter-btn').forEach(function(b) { b.classList.remove('active'); });
  btn.classList.add('active');
  App._pluginCategory = category;
  applyPluginFilters();
}

function searchPlugins() {
  var input = document.getElementById('plugin-search');
  App._pluginQuery = (input ? input.value : '').toLowerCase();
  applyPluginFilters();
}

function applyPluginFilters() {
  var cat = App._pluginCategory || 'all';
  var q = App._pluginQuery || '';
  var filtered = cat === 'all' ? [].concat(App.plugins) : App.plugins.filter(function(p) { return p.category === cat; });
  if (q) {
    filtered = filtered.filter(function(p) {
      return p.name.toLowerCase().indexOf(q) !== -1 ||
        p.description.toLowerCase().indexOf(q) !== -1 ||
        (p.author && p.author.toLowerCase().indexOf(q) !== -1);
    });
  }
  App.filteredPlugins = filtered;
  var grid = document.getElementById('plugin-grid');
  if (grid) grid.innerHTML = renderPluginCards(filtered);
}

// ===================== 插件详情（基本信息 + MD 文档） =====================
function openPluginDetail(pluginId) {
  var plugin = App.plugins.find(function(p) { return p.id === pluginId; });
  if (!plugin) return;
  App.currentPlugin = plugin;
  document.getElementById('plugin-modal-title').innerHTML = renderIcon(plugin, 'modal-icon') + ' ' + plugin.name;
  document.getElementById('plugin-modal-body').innerHTML = renderPluginDetail(plugin);
  document.getElementById('plugin-modal').classList.add('show');
  document.body.style.overflow = 'hidden';
  
  if (plugin.path) {
    loadPluginDocContent(plugin);
  }
}

function loadPluginDocContent(plugin) {
  var usageContainer = document.getElementById('plugin-usage-content');
  if (!usageContainer) return;
  
  usageContainer.innerHTML = '<div style="text-align:center;padding:30px;"><div class="loading-spinner"></div><p style="margin-top:12px;color:var(--text-muted);">正在加载文档...</p></div>';
  
  fetch(plugin.path)
    .then(function(r) {
      if (!r.ok) throw new Error('文档加载失败');
      return r.text();
    })
    .then(function(md) {
      var html = markdownToHtml(md);
      
      var tempDiv = document.createElement('div');
      tempDiv.innerHTML = html;
      tempDiv.querySelectorAll('img').forEach(function(img) {
        img.style.maxWidth = '100%';
        img.style.borderRadius = 'var(--radius-md)';
        img.style.cursor = 'zoom-in';
        img.onclick = function() {
          if (typeof openDocImage === 'function') openDocImage(img.src, img.alt);
        };
      });
      
      usageContainer.innerHTML = tempDiv.innerHTML;
    })
    .catch(function(err) {
      usageContainer.innerHTML = '<div class="warning-box"><strong>文档加载失败</strong><p>' + err.message + '</p></div>';
    });
}

function renderPluginDetail(plugin) {
  var catMap = { '核心': 'core', '管理': 'manage', '玩法': 'gameplay', '生存': 'survival', '经济': 'economy' };
  
  var imageHtml = '';
  if (plugin.image) {
    imageHtml = '<div style="margin-bottom:20px;"><img src="' + plugin.image + '" alt="' + plugin.name + '" style="width:100%;border-radius:var(--radius-md);margin-bottom:16px;cursor:zoom-in;" onclick="openDocImage(\'' + plugin.image + '\', \'' + plugin.name + '\')"></div>';
  }

  return '' +
    imageHtml +
    '<div style="display:flex;align-items:center;gap:12px;margin-bottom:20px;">' +
      '<div class="plugin-icon" style="width:48px;height:48px;font-size:28px;">' + renderIcon(plugin) + '</div>' +
      '<div>' +
        '<h4 style="font-size:16px;font-weight:600;">' + plugin.name + '</h4>' +
        '<div style="display:flex;gap:8px;align-items:center;margin-top:4px;flex-wrap:wrap;">' +
          '<span class="plugin-category ' + (catMap[plugin.category] || '') + '">' + plugin.category + '</span>' +
          '<span style="font-size:12px;color:var(--text-muted);">v' + plugin.version + '</span>' +
          '<span style="font-size:12px;color:var(--text-muted);">| 👤 ' + plugin.author + '</span>' +
        '</div>' +
      '</div>' +
    '</div>' +
    '<p style="color:var(--text-secondary);margin-bottom:16px;">' + plugin.description + '</p>' +
    '<h3 style="font-size:16px;font-weight:600;margin:20px 0 12px;color:var(--accent-primary);">📖 使用指南</h3>' +
    '<div class="plugin-usage-content" id="plugin-usage-content">' +
      '<div style="text-align:center;padding:30px;"><div class="loading-spinner"></div><p style="margin-top:12px;color:var(--text-muted);">正在加载文档...</p></div>' +
    '</div>';
}

function closePluginModal() {
  document.getElementById('plugin-modal').classList.remove('show');
  document.body.style.overflow = '';
}
