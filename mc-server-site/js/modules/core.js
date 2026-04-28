// ===================== 全局状态 =====================
const App = {
  config: null,
  players: null,
  plugins: null,
  docs: null,
  activities: [],
  gallery: [],
  changelog: [],
  currentPage: 'home',
  currentDoc: null,
  currentPlugin: null,
  filteredPlugins: [],
  ipUnlocked: false,
  sidebarCollapsed: false,
  activitiesOpen: false,
  pendingActivity: null,
  currentActivity: null,
  readActivities: new Set()
};

// ===================== 工具函数 =====================
function $(sel) { return document.querySelector(sel); }
function $$(sel) { return document.querySelectorAll(sel); }

function createElement(tag, attrs, ...children) {
  const el = document.createElement(tag);
  if (attrs) {
    Object.entries(attrs).forEach(([k, v]) => {
      if (k === 'className') el.className = v;
      else if (k === 'innerHTML') el.innerHTML = v;
      else if (k.startsWith('on')) el.addEventListener(k.slice(2).toLowerCase(), v);
      else el.setAttribute(k, v);
    });
  }
  children.forEach(c => {
    if (typeof c === 'string') el.appendChild(document.createTextNode(c));
    else if (c) el.appendChild(c);
  });
  return el;
}

function formatNumber(n) { return n.toLocaleString(); }

function getRankClass(rank) {
  const map = { '传奇': 'legend', '精英': 'elite', '资深': 'veteran', '成员': 'member', '新人': 'newbie' };
  return map[rank] || 'newbie';
}

// ===================== Markdown 转 HTML =====================
function markdownToHtml(md) {
  if (!md) return '';
  const cleanMd = String(md).replace(/\\n/g, '\n');
  marked.setOptions({ breaks: true, gfm: true });
  return marked.parse(cleanMd);
}

function escapeHtml(text) {
  return String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// ===================== 通用图标渲染（emoji / 图片二选一） =====================
function renderIcon(item, className) {
  if (item.iconImg) {
    return '<img src="' + item.iconImg + '" alt="' + (item.name || '') + '" class="' + (className || 'icon-img') + '">';
  }
  return '<span class="' + (className || 'icon-emoji') + '">' + (item.icon || '') + '</span>';
}

// ===================== 图片查看器（通用） =====================
function openImageViewer(src, alt) {
  const viewer = document.getElementById('image-viewer');
  if (!viewer) return;
  const img = viewer.querySelector('.image-viewer-img');
  const caption = viewer.querySelector('.image-viewer-caption');
  if (img) { img.src = src; img.alt = alt || ''; }
  if (caption) caption.textContent = alt || '';
  viewer.classList.add('show');
  document.body.style.overflow = 'hidden';
}

function closeImageViewer() {
  const viewer = document.getElementById('image-viewer');
  if (viewer) viewer.classList.remove('show');
  document.body.style.overflow = '';
}
