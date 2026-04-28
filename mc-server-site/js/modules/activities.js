// ===================== 活动通知（侧边栏） =====================
function renderSidebarActivities() {
  const body = document.getElementById('activities-body');
  const badge = document.getElementById('activities-badge');
  if (!body) return;

  const list = App.activities || [];
  const active = list.filter(a => !a.expired);
  const unreadCount = active.filter(a => !App.readActivities.has(a.id)).length;

  if (badge) {
    badge.style.display = unreadCount > 0 ? '' : 'none';
    if (unreadCount > 0) badge.textContent = unreadCount;
  }

  const pinned = active.filter(a => a.pinned);
  const normal = active.filter(a => !a.pinned);
  const sorted = [...pinned, ...normal].slice(0, 5);

  if (sorted.length === 0) {
    body.innerHTML = '<div style="padding:12px;text-align:center;color:var(--text-muted);font-size:13px;">暂无活动通知</div>';
    return;
  }

  body.innerHTML = sorted.map(a => {
    const isRead = App.readActivities.has(a.id);
    var summaryText = a.summary || '';
    if (summaryText.length > 30) summaryText = summaryText.substring(0, 30) + '...';
    return '<div class="activity-item ' + (isRead ? 'read' : '') + '" onclick="openActivityDetail(\'' + a.id + '\')">' +
      (!isRead ? '<span class="act-dot ' + a.priority + '"></span>' : '<span style="width:8px;flex-shrink:0;"></span>') +
      '<div class="act-info">' +
        '<div class="act-title">' + (a.pinned ? '📌 ' : '') + a.title + '</div>' +
        (summaryText ? '<div style="font-size:11px;color:var(--text-muted);margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + summaryText + '</div>' : '') +
        '<div class="act-meta">' +
          '<span>' + a.date + '</span>' +
          '<span>' + a.type + '</span>' +
          (a.pinned ? '<span class="pinned-tag">常驻</span>' : '') +
          (!isRead ? '<span class="unread-tag">未读</span>' : '') +
        '</div>' +
      '</div>' +
    '</div>';
  }).join('');

  if (list.length > 5) {
    body.innerHTML += '<div style="text-align:center;padding:4px 0;"><a href="#" onclick="event.preventDefault();navigateTo(\'activities\');" style="font-size:12px;color:var(--accent-primary);">查看更多 →</a></div>';
  }
}

function toggleActivitiesPanel() {
  App.activitiesOpen = !App.activitiesOpen;
  const body = document.getElementById('activities-body');
  const toggle = document.getElementById('activities-toggle');
  if (body) body.classList.toggle('collapsed', !App.activitiesOpen);
  if (toggle) toggle.classList.toggle('open', App.activitiesOpen);
}

// ===================== 已读管理 =====================
function markAsRead(actId) {
  if (!actId) return;
  App.readActivities.add(actId);
  try { localStorage.setItem('readActivities', JSON.stringify([...App.readActivities])); } catch(e) {}
  renderSidebarActivities();
  if (App.currentPage === 'activities' && !App.pendingActivity) {
    renderActivitiesPage();
  }
}

function markAllAsRead() {
  (App.activities || []).forEach(a => App.readActivities.add(a.id));
  try { localStorage.setItem('readActivities', JSON.stringify([...App.readActivities])); } catch(e) {}
  renderSidebarActivities();
  if (App.currentPage === 'activities' && !App.currentActivity) {
    renderActivitiesPage();
  }
}

// ===================== 活动详情页 =====================
function openActivityDetail(actId) {
  const act = (App.activities || []).find(a => a.id === actId);
  if (!act) return;
  markAsRead(actId);
  if (App.currentPage === 'activities') {
    renderActivityDetail(act);
  } else {
    App.currentActivity = act;
    App.pendingActivity = actId;
    navigateTo('activities');
  }
}

async function renderActivityDetail(act) {
  const container = document.getElementById('activities-content');
  const typeClass = { '活动': 'activity', '比赛': 'competition', '公告': 'announcement', '更新': 'update' };

  container.innerHTML =
    '<div style="margin-bottom:20px;">' +
      '<a href="#" onclick="event.preventDefault();navigateTo(\'activities\');" style="color:var(--accent-primary);font-size:14px;">← 返回通知列表</a>' +
    '</div>' +
    '<div class="activity-detail-card" style="text-align:center;padding:60px;">' +
      '<div class="loading-spinner"></div>' +
      '<p style="margin-top:16px;color:var(--text-muted);">正在从文档库加载内容...</p>' +
    '</div>';

  try {
    const response = await fetch(act.path);
    if (!response.ok) throw new Error('无法加载文档文件');
    const md = await response.text();
    let html = markdownToHtml(md);

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    tempDiv.querySelectorAll('img').forEach(img => {
      img.style.cursor = 'zoom-in';
      img.style.borderRadius = 'var(--radius-md)';
      img.style.maxWidth = '100%';
      img.onclick = function() {
        if (typeof openDocImage === 'function') openDocImage(img.src, img.alt);
      };
    });

    var badges = '';
    if (act.pinned) badges += '<span class="pinned-tag" style="font-size:12px;">📌 常驻</span>';
    if (act.expired) badges += '<span class="expired-tag" style="font-size:12px;">📅 已过期</span>';

    container.innerHTML =
      '<div style="margin-bottom:20px;">' +
        '<a href="#" onclick="event.preventDefault();navigateTo(\'activities\');" style="color:var(--accent-primary);font-size:14px;">← 返回通知列表</a>' +
      '</div>' +
      '<div class="activity-detail-card priority-' + act.priority + '" style="border-left-width:4px;">' +
        '<div class="act-head">' +
          '<h3 style="font-size:24px;">' + act.title + '</h3>' +
          '<div style="display:flex;gap:6px;flex-wrap:wrap;">' +
            badges +
            '<span class="act-type act-type-tag ' + (typeClass[act.type] || 'announcement') + '">' + act.type + '</span>' +
          '</div>' +
        '</div>' +
        '<div style="display:flex;gap:16px;font-size:13px;color:var(--text-muted);margin-bottom:20px;padding-bottom:12px;border-bottom:1px solid var(--border-color);">' +
          '<span>📅 ' + act.date + '</span><span>👤 ' + act.author + '</span>' +
        '</div>' +
        '<div class="act-body" style="font-size:16px;line-height:1.9;">' + tempDiv.innerHTML + '</div>' +
        '<div class="act-footer" style="margin-top:32px;padding-top:16px;border-top:1px dashed var(--border-color);">' +
          '<span></span>' +
          '<span class="unread-tag" style="background:rgba(34,197,94,0.15);color:#86efac;border-color:rgba(34,197,94,0.2);">✅ 已读且确认</span>' +
        '</div>' +
      '</div>';
  } catch (err) {
    container.innerHTML = '<div class="warning-box"><strong>加载失败</strong><p>' + err.message + '</p></div>';
  }
}

// ===================== 活动列表页 =====================
function renderActivitiesPage() {
  const container = document.getElementById('activities-content');
  if (!container) return;

  const typeClass = { '活动': 'activity', '比赛': 'competition', '公告': 'announcement', '更新': 'update' };
  const list = App.activities || [];
  const active = list.filter(a => !a.expired);
  const expired = list.filter(a => a.expired);
  const pinned = active.filter(a => a.pinned);
  const normal = active.filter(a => !a.pinned);
  const unreadCount = active.filter(a => !App.readActivities.has(a.id)).length;

  function renderCard(a) {
    const isRead = App.readActivities.has(a.id);
    var badges = '';
    if (a.pinned) badges += '<span class="pinned-tag">📌 常驻</span>';
    var summaryText = a.summary || '点此查看活动详细内容...';
    return '<div class="activity-detail-card priority-' + a.priority + ' ' + (isRead ? 'read' : '') + '" id="act-card-' + a.id + '" onclick="openActivityDetail(\'' + a.id + '\')" style="cursor:pointer;">' +
      '<div class="act-head">' +
        '<h3>' + a.title + ' ' + (!isRead ? '<span class="unread-tag">未读</span>' : '') + '</h3>' +
        '<div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center;">' +
          badges +
          '<span class="act-type act-type-tag ' + (typeClass[a.type] || 'announcement') + '">' + a.type + '</span>' +
        '</div>' +
      '</div>' +
      '<div class="activities-summary">' + summaryText + '</div>' +
      '<div class="act-footer"><span>📅 ' + a.date + '</span><span>👤 ' + a.author + '</span></div>' +
    '</div>';
  }

  var pinnedHtml = '';
  if (pinned.length > 0) {
    pinnedHtml =
      '<div class="act-section-header pinned"><span class="sec-icon">📌</span> 常驻公告<span class="sec-count">' + pinned.length + '</span></div>' +
      '<div class="activities-grid" style="margin-bottom:32px;">' +
        pinned.map(function(a) { return renderCard(a); }).join('') +
      '</div>';
  }

  var expiredHtml = '';
  if (expired.length > 0) {
    expiredHtml =
      '<div class="act-expired-wrap">' +
        '<div class="act-section-header expired"><span class="sec-icon">📁</span> 往期历史<span class="sec-count">' + expired.length + '</span></div>' +
        '<div class="activities-grid">' +
          expired.map(function(a) { return renderCard(a); }).join('') +
        '</div>' +
      '</div>';
  }

  container.innerHTML =
    '<div class="page-header" style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;">' +
      '<div>' +
        '<h2>📢 活动与公告</h2>' +
        '<p>掌握服务器最新动态、赛事与福利</p>' +
      '</div>' +
      (unreadCount > 0 ? '<button class="btn-act-read" onclick="markAllAsRead()">✅ 全部标记已读</button>' : '') +
    '</div>' +
    '<div class="activities-layout">' +
      '<div style="margin-bottom:24px;">' +
        pinnedHtml +
        '<div class="act-section-header latest"><span class="sec-icon">⏰</span> 最新动态<span class="sec-count">' + normal.length + '</span></div>' +
        '<div class="activities-grid">' +
          normal.map(function(a) { return renderCard(a); }).join('') +
        '</div>' +
      '</div>' +
      expiredHtml +
    '</div>';

  if (App.pendingActivity) {
    var el = document.getElementById('act-card-' + App.pendingActivity);
    if (el) {
      setTimeout(function() {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.style.boxShadow = '0 0 0 2px var(--accent-primary)';
        setTimeout(function() { el.style.boxShadow = ''; }, 2000);
      }, 100);
    }
    App.pendingActivity = null;
  }
}
