// ===================== 更新日志 - 点击查看详情 =====================
function renderChangelog() {
  var container = document.getElementById('changelog-content');
  if (!App.changelog || App.changelog.length === 0) {
    container.innerHTML = '<div style="text-align:center;padding:80px 20px;color:var(--text-muted);"><div style="font-size:64px;margin-bottom:16px;">📋</div><p>暂无更新记录</p></div>';
    return;
  }

  var sorted = [].concat(App.changelog).sort(function(a, b) { return new Date(a.date) - new Date(b.date); });
  var latest = sorted[sorted.length - 1];
  var older = sorted.slice(0, -1).reverse();
  var badges = { major: '大版本', minor: '小版本', patch: '修复' };

  container.innerHTML = 
    '<div class="fh-page">' +
      renderHero(latest, badges) +
      '<div class="fh-section-label">历史版本</div>' +
      '<div class="fh-old-wrap">' +
        older.map(function(log, i) { return renderOld(log, i, badges); }).join('') +
      '</div>' +
    '</div>';

  // 异步加载每条记录的 MD 内容（预览）
  loadChangelogContent(latest, 'hero');
  older.forEach(function(log) {
    loadChangelogContent(log, 'old');
  });

  // 入场动画
  setTimeout(function() {
    var animEls = container.querySelectorAll('[data-anim]');
    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('fh-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    animEls.forEach(function(el) { observer.observe(el); });

    var hero = container.querySelector('[data-anim="hero"]');
    if (hero) {
      var children = hero.querySelectorAll('[data-anim="slide-up"]');
      children.forEach(function(child, i) {
        setTimeout(function() { child.classList.add('fh-visible'); }, 150 + i * 120);
      });
    }
  }, 50);
}

function renderHero(log, badges) {
  return '<div class="fh-hero" data-anim="hero" onclick="openChangelogDetail(\'' + log.id + '\')" style="cursor:pointer;">' +
    '<div class="fh-hero-bg">' +
      '<div class="fh-hero-glow-1"></div>' +
      '<div class="fh-hero-glow-2"></div>' +
      '<div class="fh-hero-grid"></div>' +
    '</div>' +
    '<div class="fh-hero-inner">' +
      '<div class="fh-hero-overline" data-anim="slide-up">最新版本发布</div>' +
      '<div class="fh-hero-version" data-anim="slide-up">v' + log.version + '</div>' +
      '<h2 class="fh-hero-title" data-anim="slide-up">' + log.title + '</h2>' +
      '<div class="fh-hero-desc fh-content-loading" data-anim="slide-up" data-log-id="' + log.id + '">' +
        '<div style="text-align:center;padding:20px;"><div class="loading-spinner"></div></div>' +
      '</div>' +
      '<div class="fh-hero-footer" data-anim="slide-up">' +
        '<span class="fh-tag ' + log.type + '">' + (badges[log.type] || '更新') + '</span>' +
        '<span>📅 ' + log.date + '</span>' +
        '<span>✍️ ' + log.author + '</span>' +
      '</div>' +
    '</div>' +
  '</div>';
}

function renderOld(log, i, badges) {
  var isLast = i === App.changelog.length - 2;
  return '<div class="fh-old-row" data-anim="card">' +
    '<div class="fh-old-track">' +
      '<div class="fh-old-dot ' + log.type + '"></div>' +
      (!isLast ? '<div class="fh-old-line"></div>' : '') +
      '<div class="fh-old-tag">' + log.date + '</div>' +
    '</div>' +
    '<div class="fh-old-card" onclick="openChangelogDetail(\'' + log.id + '\')" style="cursor:pointer;">' +
      '<div class="fh-old-card-top">' +
        '<span class="fh-old-version">v' + log.version + '</span>' +
        '<span class="fh-tag ' + log.type + ' sm">' + (badges[log.type] || '更新') + '</span>' +
      '</div>' +
      '<h3 class="fh-old-title">' + log.title + '</h3>' +
      '<div class="fh-old-desc fh-content-loading" data-log-id="' + log.id + '">' +
        '<div style="text-align:center;padding:12px;"><div class="loading-spinner" style="width:24px;height:24px;"></div></div>' +
      '</div>' +
    '</div>' +
  '</div>';
}

function loadChangelogContent(log, type) {
  if (!log.path) return;

  var selector = type === 'hero' ? '.fh-hero-desc.fh-content-loading[data-log-id="' + log.id + '"]' : '.fh-old-desc.fh-content-loading[data-log-id="' + log.id + '"]';
  var container = document.querySelector(selector);
  if (!container) return;

  fetch(log.path)
    .then(function(r) {
      if (!r.ok) throw new Error('加载失败');
      return r.text();
    })
    .then(function(md) {
      var html = markdownToHtml(md);
      container.innerHTML = html;
      container.classList.remove('fh-content-loading');
    })
    .catch(function(err) {
      container.innerHTML = '<span style="color:var(--text-muted);font-size:13px;">内容加载失败</span>';
      container.classList.remove('fh-content-loading');
    });
}

// ===================== 点击查看更新日志详情 =====================
function openChangelogDetail(logId) {
  var log = (App.changelog || []).find(function(l) { return l.id === logId; });
  if (!log) return;
  App.currentChangelog = log;

  var badges = { major: '大版本', minor: '小版本', patch: '修复' };

  document.getElementById('changelog-modal-title').textContent = 'v' + log.version + ' ' + log.title;
  document.getElementById('changelog-modal-body').innerHTML = 
    '<div style="display:flex;gap:10px;align-items:center;margin-bottom:20px;flex-wrap:wrap;">' +
      '<span class="fh-tag ' + log.type + '">' + (badges[log.type] || '更新') + '</span>' +
      '<span style="font-size:13px;color:var(--text-muted);">📅 ' + log.date + '</span>' +
      '<span style="font-size:13px;color:var(--text-muted);">✍️ ' + log.author + '</span>' +
    '</div>' +
    '<div id="changelog-modal-content" style="font-size:15px;line-height:1.9;">' +
      '<div style="text-align:center;padding:30px;"><div class="loading-spinner"></div><p style="margin-top:12px;color:var(--text-muted);">正在加载详情...</p></div>' +
    '</div>';

  document.getElementById('changelog-modal').classList.add('show');
  document.body.style.overflow = 'hidden';

  // 异步加载完整 MD
  if (log.path) {
    fetch(log.path)
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
        document.getElementById('changelog-modal-content').innerHTML = tempDiv.innerHTML;
      })
      .catch(function(err) {
        document.getElementById('changelog-modal-content').innerHTML = '<div class="warning-box"><strong>加载失败</strong><p>' + err.message + '</p></div>';
      });
  }
}

function closeChangelogModal() {
  document.getElementById('changelog-modal')?.classList.remove('show');
  document.body.style.overflow = '';
}
