// ===================== 全局状态 =====================
const App = {
  config: null,
  players: null,
  plugins: null,
  docs: null,
  activities: null,
  gallery: null,
  changelog: null,
  currentPage: 'home',
  currentDoc: null,
  currentPlugin: null,
  filteredPlugins: [],
  ipUnlocked: false,
  sidebarCollapsed: false,
  activitiesOpen: false,
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

  const lines = md.split('\n');
  let html = '';
  let inList = false;
  let inTable = false;
  let inCodeBlock = false;
  let codeBlockContent = '';
  let tableRows = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith('```')) {
      if (inCodeBlock) {
        html += `<pre style="background:var(--bg-primary);padding:12px 16px;border-radius:6px;overflow-x:auto;font-size:13px;margin:12px 0;"><code>${escapeHtml(codeBlockContent.trim())}</code></pre>`;
        codeBlockContent = ''; inCodeBlock = false;
      } else { inCodeBlock = true; }
      continue;
    }
    if (inCodeBlock) { codeBlockContent += line + '\n'; continue; }
    if (line.trim() === '') {
      if (inList) { html += '</ul>'; inList = false; }
      if (inTable) { html += closeTable(tableRows); inTable = false; tableRows = []; }
      continue;
    }
    if (line.startsWith('|') && line.endsWith('|')) {
      if (line.includes('---')) continue;
      if (!inTable) inTable = true;
      tableRows.push(line); continue;
    }
    if (inTable) { html += closeTable(tableRows); inTable = false; tableRows = []; }
    if (line.startsWith('> ')) {
      html += `<blockquote style="border-left:3px solid var(--accent-primary);padding:8px 16px;margin:8px 0;background:rgba(59,130,246,0.05);border-radius:0 6px 6px 0;"><p style="margin:0;">${parseInline(line.slice(2))}</p></blockquote>`;
      continue;
    }
    if (line.startsWith('### ')) { html += `<h4 style="font-size:16px;font-weight:600;margin:16px 0 8px;">${parseInline(line.slice(4))}</h4>`; continue; }
    if (line.startsWith('## ')) { html += `<h3 style="font-size:18px;font-weight:600;margin:20px 0 10px;color:var(--accent-primary);">${parseInline(line.slice(3))}</h3>`; continue; }
    if (line.startsWith('# ')) { html += `<h2 style="font-size:22px;font-weight:700;margin:20px 0 12px;">${parseInline(line.slice(2))}</h2>`; continue; }
    if (line.startsWith('- ')) {
      if (!inList) { html += '<ul style="padding-left:20px;margin:8px 0;">'; inList = true; }
      html += `<li style="margin-bottom:4px;color:var(--text-secondary);">${parseInline(line.slice(2))}</li>`; continue;
    }
    if (/^\d+\.\s/.test(line)) {
      if (!inList) { html += '<ol style="padding-left:20px;margin:8px 0;">'; inList = true; }
      html += `<li style="margin-bottom:4px;color:var(--text-secondary);">${parseInline(line.replace(/^\d+\.\s/, ''))}</li>`; continue;
    }
    if (inList) { html += '</ul>'; inList = false; }
    html += `<p style="margin-bottom:10px;color:var(--text-secondary);line-height:1.8;">${parseInline(line)}</p>`;
  }
  if (inList) html += '</ul>';
  if (inTable) html += closeTable(tableRows);
  if (inCodeBlock) html += `<pre><code>${escapeHtml(codeBlockContent)}</code></pre>`;
  return html;
}

function closeTable(rows) {
  if (rows.length === 0) return '';
  const cells = rows.map(r => r.split('|').filter(c => c.trim()).map(c => c.trim()));
  const headers = cells[0];
  const data = cells.slice(1);
  let tbl = '<table style="width:100%;border-collapse:collapse;margin:12px 0;"><thead><tr>';
  headers.forEach(h => { tbl += `<th style="border:1px solid var(--border-color);padding:8px 12px;background:rgba(59,130,246,0.1);color:var(--accent-primary);font-weight:600;text-align:left;">${h}</th>`; });
  tbl += '</tr></thead><tbody>';
  data.forEach(row => { tbl += '<tr>'; row.forEach(cell => { tbl += `<td style="border:1px solid var(--border-color);padding:8px 12px;color:var(--text-secondary);">${parseInline(cell)}</td>`; }); tbl += '</tr>'; });
  tbl += '</tbody></table>';
  return tbl;
}

function parseInline(text) {
  return text
    .replace(/`([^`]+)`/g, '<code style="background:rgba(59,130,246,0.1);color:var(--accent-primary);padding:2px 6px;border-radius:4px;font-size:13px;">$1</code>')
    .replace(/\*\*(.+?)\*\*/g, '<strong style="color:var(--text-primary);">$1</strong>');
}

function escapeHtml(text) {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// ===================== 图片查看器（通用） =====================
function openImageViewer(src, alt) {
  const viewer = document.getElementById('image-viewer');
  const img = viewer.querySelector('.image-viewer-img');
  const caption = viewer.querySelector('.image-viewer-caption');
  img.src = src; img.alt = alt || '';
  caption.textContent = alt || '';
  viewer.classList.add('show');
  document.body.style.overflow = 'hidden';
}

function closeImageViewer() {
  const viewer = document.getElementById('image-viewer');
  viewer.classList.remove('show');
  document.body.style.overflow = '';
}
