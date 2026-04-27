// ===================== 画廊 =====================
const GViewerState = {
  scale: 1,
  x: 0,
  y: 0,
  minScale: 1,
  maxScale: 4,
  dragging: false,
  startX: 0,
  startY: 0,
  pointers: new Map(),
  pinchStartDistance: 0,
  pinchStartScale: 1,
  pinchCenterX: 0,
  pinchCenterY: 0,
  pinchStartPanX: 0,
  pinchStartPanY: 0,
  initialized: false
};

function gvEls() {
  return {
    overlay: document.getElementById('gallery-viewer'),
    wrap: document.querySelector('.gallery-viewer-img-wrap'),
    img: document.getElementById('gallery-viewer-img')
  };
}

function gvClampPan() {
  const { wrap, img } = gvEls();
  if (!wrap || !img) return;

  const maxX = Math.max(0, (img.clientWidth * GViewerState.scale - wrap.clientWidth) / 2);
  const maxY = Math.max(0, (img.clientHeight * GViewerState.scale - wrap.clientHeight) / 2);

  GViewerState.x = Math.min(maxX, Math.max(-maxX, GViewerState.x));
  GViewerState.y = Math.min(maxY, Math.max(-maxY, GViewerState.y));
}

function gvApplyTransform() {
  const { img } = gvEls();
  if (!img) return;
  gvClampPan();
  img.style.transform = `translate(${GViewerState.x}px, ${GViewerState.y}px) scale(${GViewerState.scale})`;
  img.style.cursor = GViewerState.scale > 1 ? (GViewerState.dragging ? 'grabbing' : 'grab') : 'zoom-in';
  img.classList.toggle('is-dragging', GViewerState.dragging);
}

function gvZoomAt(nextScale, clientX, clientY) {
  const { wrap } = gvEls();
  if (!wrap) return;
  const clamped = Math.min(GViewerState.maxScale, Math.max(GViewerState.minScale, nextScale));
  const rect = wrap.getBoundingClientRect();
  const anchorX = (clientX ?? (rect.left + rect.width / 2)) - rect.left - rect.width / 2;
  const anchorY = (clientY ?? (rect.top + rect.height / 2)) - rect.top - rect.height / 2;
  const prevScale = GViewerState.scale;
  if (prevScale === clamped) return;

  const ratio = clamped / prevScale;
  GViewerState.x = (GViewerState.x - anchorX) * ratio + anchorX;
  GViewerState.y = (GViewerState.y - anchorY) * ratio + anchorY;
  GViewerState.scale = +clamped.toFixed(3);

  if (GViewerState.scale <= 1) {
    GViewerState.x = 0;
    GViewerState.y = 0;
  }
  gvApplyTransform();
}

function galleryResetZoom() {
  GViewerState.scale = 1;
  GViewerState.x = 0;
  GViewerState.y = 0;
  GViewerState.dragging = false;
  GViewerState.pointers.clear();
  GViewerState.pinchStartDistance = 0;
  gvApplyTransform();
}

function galleryZoomBy(step) {
  gvZoomAt(GViewerState.scale + step);
}

function galleryZoomIn() { galleryZoomBy(0.2); }
function galleryZoomOut() { galleryZoomBy(-0.2); }

function initGalleryViewerInteractions() {
  if (GViewerState.initialized) return;
  const { wrap, img, overlay } = gvEls();
  if (!wrap || !img || !overlay) return;

  img.setAttribute('draggable', 'false');

  wrap.addEventListener('wheel', (e) => {
    if (!overlay.classList.contains('show')) return;
    e.preventDefault();
    const step = e.deltaY < 0 ? 0.2 : -0.2;
    gvZoomAt(GViewerState.scale + step, e.clientX, e.clientY);
  }, { passive: false });

  wrap.addEventListener('dblclick', () => {
    if (GViewerState.scale > 1) galleryResetZoom();
    else galleryZoomIn();
  });

  wrap.addEventListener('mousedown', (e) => {
    if (e.button !== 0 || GViewerState.scale <= 1) return;
    e.preventDefault();
    GViewerState.dragging = true;
    GViewerState.startX = e.clientX - GViewerState.x;
    GViewerState.startY = e.clientY - GViewerState.y;
    gvApplyTransform();
  });

  window.addEventListener('mousemove', (e) => {
    if (!GViewerState.dragging) return;
    GViewerState.x = e.clientX - GViewerState.startX;
    GViewerState.y = e.clientY - GViewerState.startY;
    gvApplyTransform();
  });

  window.addEventListener('mouseup', () => {
    if (!GViewerState.dragging) return;
    GViewerState.dragging = false;
    gvApplyTransform();
  });

  wrap.addEventListener('pointerdown', (e) => {
    if (!overlay.classList.contains('show')) return;
    GViewerState.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    wrap.setPointerCapture(e.pointerId);

    if (GViewerState.pointers.size === 1 && GViewerState.scale > 1) {
      const p = GViewerState.pointers.values().next().value;
      GViewerState.dragging = true;
      GViewerState.startX = p.x - GViewerState.x;
      GViewerState.startY = p.y - GViewerState.y;
      gvApplyTransform();
    }

    if (GViewerState.pointers.size === 2) {
      const points = [...GViewerState.pointers.values()];
      const dx = points[0].x - points[1].x;
      const dy = points[0].y - points[1].y;
      GViewerState.pinchStartDistance = Math.hypot(dx, dy) || 1;
      GViewerState.pinchStartScale = GViewerState.scale;
      GViewerState.pinchCenterX = (points[0].x + points[1].x) / 2;
      GViewerState.pinchCenterY = (points[0].y + points[1].y) / 2;
      GViewerState.pinchStartPanX = GViewerState.x;
      GViewerState.pinchStartPanY = GViewerState.y;
      GViewerState.dragging = false;
      gvApplyTransform();
    }
  });

  wrap.addEventListener('pointermove', (e) => {
    if (!overlay.classList.contains('show') || !GViewerState.pointers.has(e.pointerId)) return;
    GViewerState.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (GViewerState.pointers.size === 1 && GViewerState.dragging && GViewerState.scale > 1) {
      GViewerState.x = e.clientX - GViewerState.startX;
      GViewerState.y = e.clientY - GViewerState.startY;
      gvApplyTransform();
      return;
    }

    if (GViewerState.pointers.size === 2) {
      const points = [...GViewerState.pointers.values()];
      const dx = points[0].x - points[1].x;
      const dy = points[0].y - points[1].y;
      const dist = Math.hypot(dx, dy) || 1;
      const ratio = dist / (GViewerState.pinchStartDistance || 1);
      const nextScale = GViewerState.pinchStartScale * ratio;
      gvZoomAt(nextScale, GViewerState.pinchCenterX, GViewerState.pinchCenterY);

      const centerX = (points[0].x + points[1].x) / 2;
      const centerY = (points[0].y + points[1].y) / 2;
      GViewerState.x = GViewerState.pinchStartPanX + (centerX - GViewerState.pinchCenterX);
      GViewerState.y = GViewerState.pinchStartPanY + (centerY - GViewerState.pinchCenterY);
      gvApplyTransform();
    }
  });

  function onPointerEnd(e) {
    if (!GViewerState.pointers.has(e.pointerId)) return;
    GViewerState.pointers.delete(e.pointerId);
    if (GViewerState.pointers.size === 0) {
      GViewerState.dragging = false;
      gvApplyTransform();
      return;
    }
    if (GViewerState.pointers.size === 1 && GViewerState.scale > 1) {
      const p = GViewerState.pointers.values().next().value;
      GViewerState.dragging = true;
      GViewerState.startX = p.x - GViewerState.x;
      GViewerState.startY = p.y - GViewerState.y;
      gvApplyTransform();
    }
  }

  wrap.addEventListener('pointerup', onPointerEnd);
  wrap.addEventListener('pointercancel', onPointerEnd);
  wrap.addEventListener('pointerleave', onPointerEnd);

  window.addEventListener('keydown', (e) => {
    if (!overlay.classList.contains('show')) return;
    if (e.target && /input|textarea|select/i.test(e.target.tagName)) return;

    const key = e.key;
    if (key === '+' || key === '=') { e.preventDefault(); galleryZoomIn(); return; }
    if (key === '-' || key === '_') { e.preventDefault(); galleryZoomOut(); return; }
    if (key === '0') { e.preventDefault(); galleryResetZoom(); return; }
    if (key === 'Escape') { e.preventDefault(); closeGalleryViewer(); return; }

    const step = e.shiftKey ? 36 : 18;
    if (key === 'ArrowLeft') { e.preventDefault(); GViewerState.x -= step; gvApplyTransform(); return; }
    if (key === 'ArrowRight') { e.preventDefault(); GViewerState.x += step; gvApplyTransform(); return; }
    if (key === 'ArrowUp') { e.preventDefault(); GViewerState.y -= step; gvApplyTransform(); return; }
    if (key === 'ArrowDown') { e.preventDefault(); GViewerState.y += step; gvApplyTransform(); return; }
  });

  window.addEventListener('resize', gvApplyTransform);

  GViewerState.initialized = true;
}

function renderGallery() {
  const el = document.getElementById('gallery-content');
  if (!App.gallery || !App.gallery.length) {
    el.innerHTML = '<div style="text-align:center;padding:80px;color:var(--text-muted);font-size:48px;">📸<p style="font-size:16px;">暂无照片</p></div>';
    return;
  }

  const feat = App.gallery.filter(g => g.featured);
  const norm = App.gallery.filter(g => !g.featured);
  const tags = [...new Set(App.gallery.flatMap(g => g.tags))].sort();

  let ftHTML = '';
  if (feat.length) {
    const cards = feat.map(g => `
      <div class="gcard-feat" onclick="openGalleryViewer('${g.id}')">
        <img src="${g.thumbnail}" alt="${g.title}" loading="lazy" decoding="async">
        <div class="gcard-feat-over"><strong>${g.title}</strong><span>${g.description}</span></div>
      </div>
    `).join('');
    ftHTML = `
      <section class="g-panel g-panel-featured">
        <div class="g-section-head">
          <div class="g-section-title">⭐ 精选时刻 <span class="g-count">${feat.length}</span></div>
          <p>横向滚动展示服务器高光瞬间</p>
        </div>
        <div class="g-scroll-wrap"><div class="g-scroll-track">${cards}${cards}</div></div>
      </section>
    `;
  }

  el.innerHTML = `
    <div class="g-shell">
      <div class="page-header"><h2>📸 游戏画廊</h2><p>记录玩家们的精彩时刻</p></div>
      ${ftHTML}
      <section class="g-panel g-panel-grid">
        <div class="g-section-head">
          <div class="g-section-title">🖼️ 最新发布 <span class="g-count">${norm.length}</span></div>
          <p>按标签筛选，快速找到你想看的内容</p>
        </div>
        <div class="g-btns">
          <button class="g-btn active" data-t="all" onclick="filterGallery_('all',this)">📸 全部</button>
          ${tags.map(t => `<button class="g-btn" data-t="${t}" onclick="filterGallery_('${t}',this)">${t}</button>`).join('')}
        </div>
        <div class="g-grid" id="g-grid">${renderGrid_(norm)}</div>
      </section>
    </div>
  `;
}

function gCard_(g) {
  return `
    <div class="gcard" onclick="openGalleryViewer('${g.id}')">
      <div class="gcard-img"><img src="${g.thumbnail}" alt="${g.title}" loading="lazy" decoding="async"></div>
      <div class="gcard-body">
        <h4>${g.title}</h4>
        <div class="gcard-tags">${g.tags.map(t => `<span class="gcard-tag" data-t="${t}">${t}</span>`).join('')}</div>
        <div class="gcard-meta"><span>👤 ${g.author}</span><span>📅 ${g.date}</span></div>
      </div>
    </div>
  `;
}

function renderGrid_(items) {
  if (!items.length) {
    return '<div class="g-empty">这个标签下暂时没有图片，试试其他分类</div>';
  }
  return items.map(g => gCard_(g)).join('');
}

function filterGallery_(tag, btn) {
  document.querySelectorAll('.g-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const normalItems = App.gallery.filter(g => !g.featured);
  const filtered = tag === 'all'
    ? normalItems
    : App.gallery.filter(g => g.tags.includes(tag));
  document.getElementById('g-grid').innerHTML = renderGrid_(filtered);
}

// 图片查看器
function openGalleryViewer(id) {
  initGalleryViewerInteractions();
  const item = App.gallery.find(g => g.id === id);
  if (!item) return;
  App._gi = App.gallery.findIndex(g => g.id === id);
  const img = document.getElementById('gallery-viewer-img');
  img.src = item.src;
  img.alt = item.title;
  document.getElementById('gallery-viewer-title').textContent = item.title;
  document.getElementById('gallery-viewer-desc').textContent = item.description;
  document.getElementById('gallery-viewer-author').textContent = '👤 '+item.author+'  📅 '+item.date;
  document.querySelectorAll('#gallery-prev-btn,#gallery-next-btn').forEach(b => b.style.display = App.gallery.length>1?'':'none');
  const c=document.getElementById('gallery-counter');
  if(c)c.textContent=((App._gi||0)+1)+' / '+App.gallery.length;
  document.getElementById('gallery-viewer').classList.add('show');
  document.body.style.overflow='hidden';
  galleryResetZoom();
}
function closeGalleryViewer(){document.getElementById('gallery-viewer')?.classList.remove('show');document.body.style.overflow='';galleryResetZoom();}
function galleryPrev(){if(App._gi===undefined)return;openGalleryViewer(App.gallery[App._gi>0?App._gi-1:App.gallery.length-1].id);}
function galleryNext(){if(App._gi===undefined)return;openGalleryViewer(App.gallery[App._gi<App.gallery.length-1?App._gi+1:0].id);}
