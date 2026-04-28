// ===================== 文档页面 =====================
function renderDocs() {
  const container = document.getElementById('docs-content');
  const categories = [...new Set(App.docs.map(d => d.category))];
  
  container.innerHTML = `
    <div class="page-header">
      <h2>📚 服务器文档</h2>
      <p>自动加载 Markdown 文档，支持实时更新</p>
    </div>
    <button class="docs-toggle-btn" id="docs-toggle-btn" onclick="toggleDocsSidebar()">📖</button>
    <div class="docs-layout">
      <div class="docs-sidebar" id="docs-sidebar">
        <div class="docs-toc" id="docs-toc-sidebar" style="margin-bottom:20px;display:none;">
          <div class="docs-nav-category">📍 本页目录</div>
          <div id="toc-list"></div>
        </div>
        <div class="docs-nav">
          ${categories.map(cat => `
            <div class="docs-nav-section">
              <div class="docs-nav-category">${cat}</div>
              ${App.docs.filter(d => d.category === cat).map(d => `
                <div class="docs-nav-item ${App.currentDoc === d.id ? 'active' : ''}" onclick="showDoc('${d.id}');closeDocsSidebar();">${d.title}</div>
              `).join('')}
            </div>
          `).join('')}
        </div>
      </div>
      <div class="docs-content" id="docs-view">
        <div style="text-align:center;padding:60px 20px;color:var(--text-muted);">
          <div style="font-size:48px;margin-bottom:16px;">⏳</div>
          <p>正在加载文档...</p>
        </div>
      </div>
    </div>
  `;

  if (App.docs.length > 0) showDoc(App.docs[0].id);
}

function toggleDocsSidebar() {
  var sidebar = document.getElementById('docs-sidebar');
  if (sidebar) sidebar.classList.toggle('open');
}

function closeDocsSidebar() {
  var sidebar = document.getElementById('docs-sidebar');
  if (sidebar) {
    sidebar.classList.remove('open');
  }
}

// 点击外侧关闭侧边栏浮层（所有屏幕）
document.addEventListener('click', function(e) {
  var sidebar = document.getElementById('docs-sidebar');
  var btn = document.getElementById('docs-toggle-btn');
  if (!sidebar || !btn) return;
  if (sidebar.classList.contains('open') &&
      !sidebar.contains(e.target) &&
      !btn.contains(e.target)) {
    sidebar.classList.remove('open');
  }
});

async function showDoc(docId) {
  const doc = App.docs.find(d => d.id === docId);
  if (!doc) return;
  App.currentDoc = docId;

  $$('.docs-nav-item').forEach(n => n.classList.remove('active'));
  const navItem = document.querySelector(`.docs-nav-item[onclick*="'${docId}'"]`);
  if (navItem) navItem.classList.add('active');

  const view = document.getElementById('docs-view');
  view.innerHTML = '<div style="text-align:center;padding:40px;"><div class="loading-spinner"></div><p>读取中...</p></div>';

  try {
    const response = await fetch(doc.path);
    if (!response.ok) throw new Error('文档加载失败');
    const md = await response.text();
    
    // 渲染 Markdown
    let html = markdownToHtml(md);
    
    // 注入图片点击画廊功能 (针对渲染后的 HTML 进行处理)
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    tempDiv.querySelectorAll('img').forEach(img => {
      img.style.cursor = 'zoom-in';
      img.style.borderRadius = 'var(--radius-md)';
      img.style.maxWidth = '100%';
      img.onclick = () => openDocImage(img.src, img.alt);
    });
    
    view.innerHTML = tempDiv.innerHTML;
    
    // 生成侧边栏纲目 (TOC)
    generateTOC(tempDiv);

  } catch (err) {
    view.innerHTML = `<div class="warning-box"><strong>加载出错</strong><p>${err.message}</p></div>`;
  }
}

function generateTOC(contentDiv) {
  const tocSidebar = document.getElementById('docs-toc-sidebar');
  const tocList = document.getElementById('toc-list');
  const headers = contentDiv.querySelectorAll('h1, h2, h3');
  
  if (headers.length < 2) {
    if (tocSidebar) tocSidebar.style.display = 'none';
    return;
  }
  
  if (tocSidebar) tocSidebar.style.display = 'block';
  tocList.innerHTML = Array.from(headers).map((h, i) => {
    const level = parseInt(h.tagName.substring(1));
    const text = h.textContent;
    const id = 'heading-' + i;
    
    // 直接在内容 DOM 中找到对应的标题并赋予 ID
    var docHeaders = document.querySelectorAll('#docs-view h1, #docs-view h2, #docs-view h3');
    if (docHeaders[i]) docHeaders[i].id = id;
    
    return '<div class="docs-nav-item toc-level-' + level + '" style="padding-left:' + ((level-1)*12 + 12) + 'px; font-size:12px; opacity:0.8;" onclick="scrollToHeading(\'' + id + '\')">' + escapeHtml(text) + '</div>';
  }).join('');
}

function scrollToHeading(id) {
  var el = document.getElementById(id);
  if (!el) return;
  
  // 平滑滚动到目标
  el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  
  // 添加高亮效果（2秒后移除）
  el.classList.add('docs-heading-highlight');
  setTimeout(function() {
    el.classList.remove('docs-heading-highlight');
  }, 2000);
}

// 专门为文档中的图片提供画廊功能
function openDocImage(src, title) {
  // 先初始化交互逻辑
  if (typeof initGalleryViewerInteractions === 'function') {
    initGalleryViewerInteractions();
  }
  
  const img = document.getElementById('gallery-viewer-img');
  if (!img) return;

  img.src = src;
  img.alt = title;
  
  // 设置基本信息
  document.getElementById('gallery-viewer-title').textContent = title || '图片预览';
  document.getElementById('gallery-viewer-desc').textContent = '';
  document.getElementById('gallery-viewer-author').textContent = '';
  
  // 隐藏切换按钮（因为是单个文档图片）
  document.querySelectorAll('#gallery-prev-btn,#gallery-next-btn').forEach(b => b.style.display = 'none');
  
  const counter = document.getElementById('gallery-counter');
  if (counter) counter.textContent = '1 / 1';

  document.getElementById('gallery-viewer').classList.add('show');
  document.body.style.overflow = 'hidden';
  
  // 调用画廊的缩放重置
  if (typeof galleryResetZoom === 'function') {
    galleryResetZoom();
  }
}
