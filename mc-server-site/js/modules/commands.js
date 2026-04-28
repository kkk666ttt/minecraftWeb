// ===================== 指令大全（分类标签 + 搜索 + MD 加载） =====================
function renderCommands() {
  var container = document.getElementById('commands-content');
  if (!container) return;

  var list = App.commands || [];
  if (list.length === 0) {
    container.innerHTML = '<div style="text-align:center;padding:80px;color:var(--text-muted);"><div style="font-size:64px;margin-bottom:16px;">📖</div><p>暂无指令数据</p></div>';
    return;
  }

  container.innerHTML =
    '<div class="page-header">' +
      '<h2>📖 指令大全</h2>' +
      '<p>服务器所有可用指令一览，按分类整理</p>' +
    '</div>' +
    '<div class="cmd-sticky">' +
      '<div class="cmd-filters" id="cmd-filters">' +
        '<button class="cmd-filter-btn cmd-filter-all active" data-cat="all" onclick="filterCommands(\'all\', this)">📖 全部</button>' +
        list.map(function(cat) {
          return '<button class="cmd-filter-btn" data-cat="' + cat.category + '" onclick="filterCommands(\'' + cat.category + '\', this)">' + cat.icon + ' ' + cat.category + '</button>';
        }).join('') +
      '</div>' +
      '<div class="cmd-search-wrap">' +
        '<input type="text" class="search-box" id="cmd-search" placeholder="🔍 搜索指令（如 /home, tpa, 传送...）" oninput="searchCommands()">' +
      '</div>' +
    '</div>' +
    '<div class="cmd-wrap" id="cmd-wrap">' +
      list.map(function(cat) {
        return '<div class="cmd-category" data-cat="' + cat.category + '">' +
          '<div class="cmd-cat-header">' +
            '<span class="cmd-cat-icon">' + cat.icon + '</span>' +
            '<h3>' + cat.category + '</h3>' +
            '<span class="cmd-loading">加载中...</span>' +
          '</div>' +
          '<div class="cmd-body">' +
            '<div style="text-align:center;padding:20px;"><div class="loading-spinner" style="width:24px;height:24px;"></div></div>' +
          '</div>' +
        '</div>';
      }).join('') +
    '</div>';

  // 异步加载每个分类的 MD
  list.forEach(function(cat) {
    loadCategoryContent(cat);
  });
}

// ===================== 异步加载 =====================
function loadCategoryContent(cat) {
  if (!cat.path) return;

  var container = document.querySelector('.cmd-category[data-cat="' + cat.category + '"] .cmd-body');
  if (!container) return;

  fetch(cat.path)
    .then(function(r) {
      if (!r.ok) throw new Error('加载失败');
      return r.text();
    })
    .then(function(md) {
      var html = markdownToHtml(md);
      var tempDiv = document.createElement('div');
      tempDiv.innerHTML = html;

      var table = tempDiv.querySelector('table');
      if (table) {
        table.className = 'cmd-table';
        // 给每一行加 data-* 属性用于搜索
        var rows = table.querySelectorAll('tbody tr');
        rows.forEach(function(row) {
          var cells = row.querySelectorAll('td');
          if (cells.length >= 2) {
            var cmdText = cells[0].textContent.trim().toLowerCase();
            var descText = cells[1].textContent.trim().toLowerCase();
            row.setAttribute('data-cmd', cmdText);
            row.setAttribute('data-desc', descText);
            row.setAttribute('data-search', cmdText + ' ' + descText);
          }
        });
        container.innerHTML = '';
        container.appendChild(table);
      } else {
        container.innerHTML = html;
      }

      var loadingEl = document.querySelector('.cmd-category[data-cat="' + cat.category + '"] .cmd-loading');
      if (loadingEl) loadingEl.textContent = cat.category + ' ▼';
    })
    .catch(function(err) {
      container.innerHTML = '<div style="padding:20px;text-align:center;color:var(--text-muted);font-size:13px;">加载失败</div>';
      var loadingEl = document.querySelector('.cmd-category[data-cat="' + cat.category + '"] .cmd-loading');
      if (loadingEl) loadingEl.textContent = cat.category;
    });
}

// ===================== 分类标签筛选 =====================
function filterCommands(category, btn) {
  document.querySelectorAll('.cmd-filter-btn').forEach(function(b) { b.classList.remove('active'); });
  if (btn) btn.classList.add('active');

  var wrap = document.getElementById('cmd-wrap');
  if (!wrap) return;

  var categories = wrap.querySelectorAll('.cmd-category');
  categories.forEach(function(el) {
    if (category === 'all') {
      el.style.display = '';
    } else {
      el.style.display = el.getAttribute('data-cat') === category ? '' : 'none';
    }
  });
}

// ===================== 搜索 =====================
function searchCommands() {
  var input = document.getElementById('cmd-search');
  var q = input ? input.value.trim().toLowerCase() : '';

  // 切换到"全部"标签并高亮它
  var allBtn = document.querySelector('.cmd-filter-all');
  if (allBtn) filterCommands('all', allBtn);

  var wrap = document.getElementById('cmd-wrap');
  if (!wrap) return;

  // 先清除所有高亮
  clearHighlights(wrap);

  if (!q) {
    // 无搜索词，显示所有
    wrap.querySelectorAll('.cmd-category').forEach(function(el) { el.style.display = ''; });
    var rows = wrap.querySelectorAll('.cmd-table tbody tr');
    rows.forEach(function(r) { r.style.display = ''; });
    return;
  }

  var hasAnyMatch = false;
  var categories = wrap.querySelectorAll('.cmd-category');

  categories.forEach(function(cat) {
    var rows = cat.querySelectorAll('.cmd-table tbody tr');
    var catHasMatch = false;

    rows.forEach(function(row) {
      var searchData = row.getAttribute('data-search') || '';
      if (searchData.indexOf(q) !== -1) {
        row.style.display = '';
        catHasMatch = true;
        hasAnyMatch = true;
        // 高亮匹配行
        row.classList.add('cmd-match');
        row.style.background = 'rgba(245, 166, 35, 0.08)';
        // 自动滚动到第一个匹配项
        if (!wrap._scrolled) {
          wrap._scrolled = true;
          setTimeout(function() {
            row.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }, 100);
        }
      } else {
        row.style.display = 'none';
      }
    });

    cat.style.display = catHasMatch ? '' : 'none';
  });

  // 点击页面任意位置清除高亮
  if (hasAnyMatch) {
    document.removeEventListener('click', clearHighlightsOnClick);
    document.addEventListener('click', clearHighlightsOnClick);
  }
}

function clearHighlightsOnClick() {
  var wrap = document.getElementById('cmd-wrap');
  if (wrap) clearHighlights(wrap);
  document.removeEventListener('click', clearHighlightsOnClick);
}

function clearHighlights(wrap) {
  if (!wrap) return;
  wrap._scrolled = false;
  var matched = wrap.querySelectorAll('.cmd-match');
  matched.forEach(function(el) {
    el.classList.remove('cmd-match');
    el.style.background = '';
  });
}
