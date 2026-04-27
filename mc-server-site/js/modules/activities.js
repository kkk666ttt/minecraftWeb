// ===================== 活动通知（侧边栏） =====================
function renderSidebarActivities() {
  const body = document.getElementById('activities-body');
  const badge = document.getElementById('activities-badge');
  if (!body || !App.activities) return;

  const active = App.activities.filter(a => !a.expired);
  const unreadCount = active.filter(a => !App.readActivities.has(a.id)).length;
  if (badge) {
    badge.style.display = unreadCount > 0 ? '' : 'none';
    if (unreadCount > 0) badge.textContent = unreadCount;
  }

  const pinned = active.filter(a => a.pinned);
  const normal = active.filter(a => !a.pinned);

  body.innerHTML = [...pinned, ...normal].slice(0, 5).map(a => {
    const isRead = App.readActivities.has(a.id);
    return `
    <div class="activity-item ${isRead ? 'read' : ''}" onclick="openActivityDetail('${a.id}')">
      ${!isRead ? `<span class="act-dot ${a.priority}"></span>` : '<span style="width:8px;flex-shrink:0;"></span>'}
      <div class="act-info">
        <div class="act-title">${a.pinned ? '📌 ' : ''}${a.title}</div>
        <div class="act-meta">
          <span>${a.date}</span>
          <span>${a.type}</span>
          ${a.pinned ? '<span class="pinned-tag">常驻</span>' : ''}
          ${!isRead ? '<span class="unread-tag">未读</span>' : ''}
        </div>
      </div>
    </div>`;
  }).join('');

  if (App.activities.length > 5) {
    body.innerHTML += `<div style="text-align:center;padding:4px 0;">
      <a href="#" onclick="event.preventDefault();navigateTo('activities');" style="font-size:12px;color:var(--accent-primary);">查看更多 →</a>
    </div>`;
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
  if (App.currentPage === 'activities' && !App.pendingActivity) renderActivitiesPage();
}

function markAllAsRead() {
  if (!App.activities) return;
  App.activities.forEach(a => App.readActivities.add(a.id));
  try { localStorage.setItem('readActivities', JSON.stringify([...App.readActivities])); } catch(e) {}
  renderSidebarActivities();
  if (App.currentPage === 'activities') renderActivitiesPage();
}

// ===================== 活动通知——单独详情页 =====================
function openActivityDetail(actId) {
  const act = App.activities.find(a => a.id === actId);
  if (!act) return;
  markAsRead(actId);
  App.currentActivity = act;
  App.pendingActivity = actId;
  navigateTo('activities');
}

function renderActivityDetail(act) {
  const container = document.getElementById('activities-content');
  const typeClass = { '活动': 'activity', '比赛': 'competition', '公告': 'announcement', '更新': 'update' };

  const imagesHtml = act.images && act.images.length > 0 ? `
    <div class="activity-images">
      ${act.images.map(img => `
        <div class="activity-image-item" onclick="openImageViewer('${img.url}', '${img.alt}')">
          <img src="${img.url}" alt="${img.alt}" loading="lazy">
          ${img.caption ? `<div class="image-caption">${img.caption}</div>` : ''}
        </div>
      `).join('')}
    </div>
  ` : '';

  const badges = [];
  if (act.pinned) badges.push('<span class="pinned-tag" style="font-size:12px;">📌 常驻</span>');
  if (act.expired) badges.push('<span class="expired-tag" style="font-size:12px;">📅 已过期</span>');

  container.innerHTML = `
    <div style="margin-bottom:20px;">
      <a href="#" onclick="event.preventDefault();navigateTo('activities');" style="color:var(--accent-primary);font-size:14px;">← 返回通知列表</a>
    </div>
    <div class="activity-detail-card priority-${act.priority}" style="border-left-width:4px;">
      <div class="act-head">
        <h3 style="font-size:20px;">${act.title}</h3>
        <div style="display:flex;gap:6px;flex-wrap:wrap;">
          ${badges.join('')}
          <span class="act-type act-type-tag ${typeClass[act.type] || 'announcement'}">${act.type}</span>
        </div>
      </div>
      <div style="display:flex;gap:16px;font-size:13px;color:var(--text-muted);margin-bottom:16px;padding-bottom:12px;border-bottom:1px solid var(--border-color);">
        <span>📅 ${act.date}</span><span>👤 ${act.author}</span>
      </div>
      ${imagesHtml}
      <div class="act-body" style="font-size:15px;line-height:1.9;white-space:pre-wrap;margin-top:16px;">${act.content}</div>
      <div class="act-footer" style="margin-top:20px;">
        <span></span>
        <span class="unread-tag" style="background:rgba(34,197,94,0.15);color:#86efac;border-color:rgba(34,197,94,0.2);">✅ 已读</span>
      </div>
    </div>
  `;
}

// ===================== 活动通知列表页 =====================
function renderActivitiesPage() {
  const container = document.getElementById('activities-content');
  const typeClass = { '活动': 'activity', '比赛': 'competition', '公告': 'announcement', '更新': 'update' };

  const active = App.activities.filter(a => !a.expired);
  const expired = App.activities.filter(a => a.expired);
  const pinned = active.filter(a => a.pinned);
  const normal = active.filter(a => !a.pinned);
  const unreadCount = active.filter(a => !App.readActivities.has(a.id)).length;

  function renderCard(a) {
    const isRead = App.readActivities.has(a.id);
    const badges = [];
    if (a.pinned) badges.push('<span class="pinned-tag">📌 常驻</span>');
    return `
    <div class="activity-detail-card priority-${a.priority} ${isRead ? 'read' : ''}" id="act-card-${a.id}" onclick="openActivityDetail('${a.id}')" style="cursor:pointer;">
      <div class="act-head">
        <h3>${a.title} ${!isRead ? '<span class="unread-tag">未读</span>' : ''}</h3>
        <div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center;">
          ${badges.join('')}
          <span class="act-type act-type-tag ${typeClass[a.type] || 'announcement'}">${a.type}</span>
        </div>
      </div>
      <div class="act-body" style="display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">${a.content}</div>
      <div class="act-footer"><span>📅 ${a.date}</span><span>👤 ${a.author}</span></div>
    </div>`;
  }

  container.innerHTML = `
    <div class="page-header" style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;">
      <div>
        <h2>📢 活动与通知</h2>
        <p>服务器最新活动、公告和更新动态 ${unreadCount > 0 ? `— ${unreadCount} 条未读` : ''}</p>
      </div>
      ${unreadCount > 0 ? `<button class="btn btn-outline" onclick="markAllAsRead()" style="font-size:13px;padding:8px 16px;">✅ 全部标为已读</button>` : ''}
    </div>
    <div class="activities-page-list">
      ${pinned.length > 0 ? `
        <div class="activities-section-header">📌 常驻通知</div>
        ${pinned.sort((a, b) => new Date(b.date) - new Date(a.date)).map(renderCard).join('')}
      ` : ''}
      ${normal.length > 0 ? `
        <div class="activities-section-header">📢 最新通知</div>
        ${normal.sort((a, b) => new Date(b.date) - new Date(a.date)).map(renderCard).join('')}
      ` : ''}
      ${expired.length > 0 ? `
        <div class="activities-section-header" style="cursor:pointer;" onclick="toggleExpiredSection()">
          📅 已过期 <span id="expired-toggle-btn" style="font-size:12px;color:var(--text-muted);">▼</span>
        </div>
        <div id="expired-section" style="display:none;">
          ${expired.sort((a, b) => new Date(b.date) - new Date(a.date)).map(renderCard).join('')}
        </div>
      ` : ''}
    </div>
  `;
}

function toggleExpiredSection() {
  const section = document.getElementById('expired-section');
  const btn = document.getElementById('expired-toggle-btn');
  if (!section || !btn) return;
  const isHidden = section.style.display === 'none';
  section.style.display = isHidden ? 'block' : 'none';
  btn.textContent = isHidden ? '▲' : '▼';
}
