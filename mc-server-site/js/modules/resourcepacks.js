// ===================== 资源包列表 + 筛选 =====================
function renderResourcepacks() {
  var container = document.getElementById('resourcepacks-content');
  if (!container) return;

  var categories = [...new Set((App.resourcepacks || []).map(function(p) { return p.category; }))];
  App._rpCategory = 'all';
  App._rpQuery = '';

  container.innerHTML = 
    '<div class="page-header">' +
      '<h2>🎨 资源包</h2>' +
      '<p>为你的游戏体验增添色彩 — 精选资源包与材质</p>' +
    '</div>' +
    '<div class="plugin-filters" id="rp-filters">' +
      '<button class="plugin-filter-btn active" data-cat="all" onclick="filterResourcepacks(\'all\', this)">📦 全部</button>' +
      categories.map(function(c) { return '<button class="plugin-filter-btn" data-cat="' + c + '" onclick="filterResourcepacks(\'' + c + '\', this)">' + c + '</button>'; }).join('') +
    '</div>' +
    '<div style="margin-bottom:16px;">' +
      '<input type="text" class="search-box" id="rp-search" placeholder="🔍  搜索资源包名称或描述..." oninput="searchResourcepacks()">' +
    '</div>' +
    '<div class="plugin-grid" id="rp-grid">' +
      renderRpCards(App.resourcepacks || []) +
    '</div>';
}

function renderRpCards(packs) {
  return packs.map(function(p) {
    var featuresHtml = '';
    if (p.features && p.features.length) {
      featuresHtml = '<div style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:8px;">' +
        p.features.map(function(f) { return '<span class="rp-feature-tag">' + f + '</span>'; }).join('') +
      '</div>';
    }
    return '<div class="plugin-card" onclick="openRpDetail(\'' + p.id + '\')">' +
      '<div class="plugin-header">' +
        '<div class="plugin-icon">' + renderIcon(p) + '</div>' +
        '<div class="plugin-info">' +
          '<h4>' + p.name + '</h4>' +
          '<div class="plugin-meta">' +
            '<span class="plugin-category">' + p.category + '</span>' +
            '<span>v' + p.version + '</span>' +
          '</div>' +
        '</div>' +
      '</div>' +
      featuresHtml +
      '<div class="plugin-desc">' + p.description + '</div>' +
      '<div class="plugin-footer"><span>👤 ' + p.author + '</span></div>' +
    '</div>';
  }).join('');
}

function filterResourcepacks(category, btn) {
  document.querySelectorAll('#rp-filters .plugin-filter-btn').forEach(function(b) { b.classList.remove('active'); });
  btn.classList.add('active');
  App._rpCategory = category;
  applyRpFilters();
}

function searchResourcepacks() {
  var input = document.getElementById('rp-search');
  App._rpQuery = (input ? input.value : '').toLowerCase();
  applyRpFilters();
}

function applyRpFilters() {
  var cat = App._rpCategory || 'all';
  var q = App._rpQuery || '';
  var list = App.resourcepacks || [];
  var filtered = cat === 'all' ? [].concat(list) : list.filter(function(p) { return p.category === cat; });
  if (q) {
    filtered = filtered.filter(function(p) {
      return p.name.toLowerCase().indexOf(q) !== -1 ||
        p.description.toLowerCase().indexOf(q) !== -1 ||
        (p.author && p.author.toLowerCase().indexOf(q) !== -1);
    });
  }
  var grid = document.getElementById('rp-grid');
  if (grid) grid.innerHTML = renderRpCards(filtered);
}

// ===================== 资源包详情（基本信息 + MD 文档） =====================
function openRpDetail(packId) {
  var pack = (App.resourcepacks || []).find(function(p) { return p.id === packId; });
  if (!pack) return;
  App.currentRp = pack;
  document.getElementById('rp-modal-title').innerHTML = renderIcon(pack, 'modal-icon') + ' ' + pack.name;
  document.getElementById('rp-modal-body').innerHTML = renderRpDetail(pack);
  document.getElementById('rp-modal').classList.add('show');
  document.body.style.overflow = 'hidden';
  
  if (pack.path) {
    loadRpDocContent(pack);
  }
}

function loadRpDocContent(pack) {
  var container = document.getElementById('rp-usage-content');
  if (!container) return;
  
  container.innerHTML = '<div style="text-align:center;padding:30px;"><div class="loading-spinner"></div><p style="margin-top:12px;color:var(--text-muted);">正在加载文档...</p></div>';
  
  fetch(pack.path)
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
      container.innerHTML = tempDiv.innerHTML;
    })
    .catch(function(err) {
      container.innerHTML = '<div class="warning-box"><strong>文档加载失败</strong><p>' + err.message + '</p></div>';
    });
}

function renderRpDetail(pack) {
  var featuresHtml = '';
  if (pack.features && pack.features.length) {
    featuresHtml = '<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:16px;">' +
      pack.features.map(function(f) { return '<span class="rp-feature-tag" style="font-size:13px;padding:4px 12px;">' + f + '</span>'; }).join('') +
    '</div>';
  }

  return '' +
    '<div style="display:flex;align-items:center;gap:12px;margin-bottom:20px;">' +
      '<div class="plugin-icon" style="width:48px;height:48px;font-size:28px;">' + renderIcon(pack) + '</div>' +
      '<div>' +
        '<h4 style="font-size:16px;font-weight:600;">' + pack.name + '</h4>' +
        '<div style="display:flex;gap:8px;align-items:center;margin-top:4px;flex-wrap:wrap;">' +
          '<span class="plugin-category">' + pack.category + '</span>' +
          '<span style="font-size:12px;color:var(--text-muted);">v' + pack.version + '</span>' +
          '<span style="font-size:12px;color:var(--text-muted);">| 👤 ' + pack.author + '</span>' +
        '</div>' +
      '</div>' +
    '</div>' +
    featuresHtml +
    '<p style="color:var(--text-secondary);margin-bottom:16px;">' + pack.description + '</p>' +
    '<h3 style="font-size:16px;font-weight:600;margin:20px 0 12px;color:var(--accent-primary);">📖 详细介绍</h3>' +
    '<div class="plugin-usage-content" id="rp-usage-content">' +
      '<div style="text-align:center;padding:30px;"><div class="loading-spinner"></div><p style="margin-top:12px;color:var(--text-muted);">正在加载文档...</p></div>' +
    '</div>';
}

function closeRpModal() {
  document.getElementById('rp-modal').classList.remove('show');
  document.body.style.overflow = '';
}
