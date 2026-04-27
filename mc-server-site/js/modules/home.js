// ===================== 首页 - 全屏卡片堆叠覆盖 =====================
function renderHome() {
  const container = document.getElementById('home-content');
  if (container.dataset.rendered) return;
  container.dataset.rendered = 'true';

  const cfg = App.config;
  const galleryItems = (App.gallery || []).slice(0, 6);

  container.innerHTML = `
    <!-- 全屏堆叠容器 -->
    <div class="stack-wrap" id="stack-wrap">

      <!-- SLIDE 0: HERO -->
      <section class="stack-slide" data-index="0">
        <div class="stack-hero">
          <div class="stack-hero-slides">
            <div class="stack-hero-slide" style="background-image:url(assets/images/gallery/spawn-city.jpg)"></div>
            <div class="stack-hero-slide" style="background-image:url(assets/images/gallery/build-contest.jpg)"></div>
            <div class="stack-hero-slide" style="background-image:url(assets/images/gallery/group-photo.jpg)"></div>
          </div>
          <div class="stack-hero-mask"></div>
          <div class="stack-hero-grid"></div>
          <div class="stack-hero-body">
            <div class="stack-badge">DreamCraft 服务器</div>
            <h1 class="stack-title">欢迎来到<br><span class="stack-gold">${cfg.name}</span></h1>
            <p class="stack-sub">一个纯净、公平、有温度的 Minecraft 社区</p>
            <div class="stack-actions">
              ${App.ipUnlocked
                ? `<div class="stack-btn" onclick="copyIP(this)"><span class="stack-btn-t">${cfg.serverIp}</span><span class="stack-btn-e">📋 复制IP</span></div>`
                : `<div class="stack-btn locked" onclick="showAccessModal()"><span class="stack-btn-t">🔒 通行证验证</span><span class="stack-btn-e">🔑 获取密码</span></div>`
              }
              <a class="stack-btn ghost" href="#!" onclick="event.preventDefault();stackNext()"><span class="stack-btn-t">探索更多</span><span class="stack-btn-e">▼</span></a>
            </div>
            <div class="stack-stats">
              <div class="stack-stat"><span class="stack-stat-n">${cfg.mcVersion}</span><span class="stack-stat-l">游戏版本</span></div>
              <span class="stack-stat-dot"></span>
              <div class="stack-stat"><span class="stack-stat-n">${App.plugins.length}</span><span class="stack-stat-l">功能插件</span></div>
              <span class="stack-stat-dot"></span>
              <div class="stack-stat"><span class="stack-stat-n">${cfg.serverType}</span><span class="stack-stat-l">服务端核心</span></div>
            </div>
          </div>
          <div class="stack-scroll-hint">滚动探索 <span style="display:block;font-size:10px;margin-top:4px;">▼</span></div>
        </div>
      </section>

      <!-- SLIDE 1: 特色 -->
      <section class="stack-slide" data-index="1">
        <div class="stack-section">
          <div class="stack-section-head">
            <span class="stack-badge">特色</span>
            <h2 class="stack-section-title">服务器特色</h2>
            <p>为每一位玩家打造的极致体验</p>
          </div>
          <div class="stack-card-grid" style="grid-template-columns:repeat(auto-fill,minmax(280px,1fr));">
            ${cfg.features.map((f, i) => `
              <div class="stack-card feat" style="transition-delay:${i * 0.07}s">
                <div class="stack-card-bg" style="background-image:url(assets/images/gallery/spawn-city.jpg)"></div>
                <div class="stack-card-body">
                  <div class="stack-card-e">🎮</div>
                  <h3>${f}</h3>
                  <p>在 DreamCraft 体验最纯粹的 ${f}</p>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </section>

      <!-- SLIDE 2: 画廊 -->
      <section class="stack-slide" data-index="2">
        <div class="stack-section">
          <div class="stack-section-head">
            <span class="stack-badge">画廊</span>
            <h2 class="stack-section-title">玩家风采 & 世界风景</h2>
            <p>记录 DreamCraft 世界的每一个精彩瞬间</p>
          </div>
          <div class="stack-card-grid" style="grid-template-columns:repeat(auto-fill,minmax(260px,1fr));">
            ${galleryItems.map((g, i) => `
              <div class="stack-card gallery" style="transition-delay:${i * 0.05}s" onclick="navigateTo('gallery')">
                <div class="stack-card-bg" style="background-image:url('${g.thumbnail}')"></div>
                <div class="stack-card-overlay">
                  <h4>${g.title}</h4>
                  <span>${g.author} · ${g.date}</span>
                </div>
              </div>
            `).join('')}
          </div>
          <div style="text-align:center;margin-top:20px;">
            <a class="stack-btn ghost" href="#" onclick="event.preventDefault();navigateTo('gallery')"><span class="stack-btn-t">查看完整画廊 →</span></a>
          </div>
        </div>
      </section>

      <!-- SLIDE 3: 快速开始 -->
      <section class="stack-slide" data-index="3">
        <div class="stack-section">
          <div class="stack-section-head">
            <span class="stack-badge">开始</span>
            <h2 class="stack-section-title">快速开始</h2>
            <p>选择你想探索的方向</p>
          </div>
          <div class="stack-card-grid" style="grid-template-columns:repeat(auto-fill,minmax(200px,1fr));">
            <div class="stack-card quick" onclick="navigateTo('plugins')">
              <div class="stack-card-e big">🔌</div><h3>浏览插件</h3><p>了解服务器功能</p><span class="stack-arrow">→</span>
            </div>
            <div class="stack-card quick" onclick="navigateTo('docs')">
              <div class="stack-card-e big">📚</div><h3>阅读文档</h3><p>新手指南和规则</p><span class="stack-arrow">→</span>
            </div>
            <div class="stack-card quick" onclick="navigateTo('qq-group')">
              <div class="stack-card-e big">💬</div><h3>加入Q群</h3><p>和伙伴们交流</p><span class="stack-arrow">→</span>
            </div>
            <div class="stack-card quick" onclick="navigateTo('changelog')">
              <div class="stack-card-e big">📋</div><h3>更新日志</h3><p>查看最新更新</p><span class="stack-arrow">→</span>
            </div>
          </div>
        </div>
      </section>

    </div>

    <!-- 页码指示器 -->
    <div class="stack-dots" id="stack-dots">
      <span class="stack-dot active" data-slide="0"></span>
      <span class="stack-dot" data-slide="1"></span>
      <span class="stack-dot" data-slide="2"></span>
      <span class="stack-dot" data-slide="3"></span>
    </div>
  `;

  initStackScroll();
}

// ===================== 堆叠滚动控制 =====================
let stackCurrent = 0;
let stackAnimating = false;

function initStackScroll() {
  const wrap = document.getElementById('stack-wrap');
  if (!wrap) return;

  // 初始状态：只有 slide 0 可见
  const allSlides = wrap.querySelectorAll('.stack-slide');
  allSlides.forEach((s, i) => {
    if (i === 0) s.classList.add('active');
    else s.classList.add('hidden');
  });

  // 滚轮事件
  wrap.addEventListener('wheel', (e) => {
    e.preventDefault();
    if (stackAnimating) return;
    if (e.deltaY > 0) stackNext();
    else stackPrev();
  }, { passive: false });

  // 触摸事件
  let touchStartY = 0;
  wrap.addEventListener('touchstart', (e) => { touchStartY = e.touches[0].clientY; }, { passive: true });
  wrap.addEventListener('touchend', (e) => {
    const diff = touchStartY - e.changedTouches[0].clientY;
    if (Math.abs(diff) < 30) return;
    if (stackAnimating) return;
    if (diff > 0) stackNext();
    else stackPrev();
  }, { passive: true });

  // 点击指示点跳转
  document.querySelectorAll('.stack-dot').forEach(dot => {
    dot.addEventListener('click', () => {
      const idx = parseInt(dot.dataset.slide);
      if (idx !== stackCurrent && !stackAnimating) goToSlide(idx);
    });
  });
}

function stackNext() {
  const all = document.querySelectorAll('.stack-slide');
  if (stackCurrent < all.length - 1) goToSlide(stackCurrent + 1);
}

function stackPrev() {
  if (stackCurrent > 0) goToSlide(stackCurrent - 1);
}

function goToSlide(idx) {
  if (stackAnimating) return;
  stackAnimating = true;

  const all = document.querySelectorAll('.stack-slide');
  const current = all[stackCurrent];
  const next = all[idx];
  if (!current || !next) { stackAnimating = false; return; }

  const isForward = idx > stackCurrent;

  // 当前 slide 退场
  current.classList.remove('active');
  current.classList.add(isForward ? 'exit-up' : 'exit-down');

  // 目标 slide 入场
  next.classList.remove('hidden', 'exit-up', 'exit-down');
  next.classList.add(isForward ? 'enter-up' : 'enter-down');
  // 触发下一帧以启动 transition
  requestAnimationFrame(() => {
    next.classList.remove('enter-up', 'enter-down');
    next.classList.add('active');
  });

  // 更新指示点
  document.querySelectorAll('.stack-dot').forEach(d => d.classList.remove('active'));
  document.querySelector(`.stack-dot[data-slide="${idx}"]`)?.classList.add('active');

  // 入场后触发内部卡片动画
  setTimeout(() => {
    const cards = next.querySelectorAll('.stack-card');
    cards.forEach((card, i) => {
      setTimeout(() => card.classList.add('revealed'), i * 60);
    });
  }, 100);

  stackCurrent = idx;

  // 动画结束后解锁
  setTimeout(() => {
    // 清理退场 slide 的状态
    all.forEach((s, i) => {
      if (i !== idx && !s.classList.contains('active')) {
        s.classList.add('hidden');
        s.classList.remove('exit-up', 'exit-down');
      }
    });
    stackAnimating = false;
  }, 700);
}

function copyIP(el) {
  navigator.clipboard.writeText(App.config.serverIp).then(() => {
    const hint = el.querySelector('.stack-btn-e');
    hint.textContent = '✅ 已复制!';
    setTimeout(() => { hint.textContent = '📋 复制IP'; }, 2000);
  });
}

// ===================== 通行证验证 =====================
function showAccessModal() {
  document.getElementById('access-modal').classList.add('show');
  document.body.style.overflow = 'hidden';
  setTimeout(() => { document.getElementById('access-password-input')?.focus(); }, 300);
}
function closeAccessModal() {
  document.getElementById('access-modal').classList.remove('show');
  document.body.style.overflow = '';
}
function verifyAccess() {
  const input = document.getElementById('access-password-input');
  const error = document.getElementById('access-error');
  if (input.value.trim() === App.config.accessPassword) {
    App.ipUnlocked = true;
    try { localStorage.setItem('ipUnlocked', 'true'); } catch(e) {}
    document.getElementById('home-content').dataset.rendered = '';
    renderHome();
    closeAccessModal();
    document.querySelector('.sidebar-footer .server-status').innerHTML = '<span style="color:var(--accent-green);font-size:13px;">🔓 IP已解锁</span>';
  } else {
    error.textContent = '❌ 密码错误';
    input.value = ''; input.focus();
    setTimeout(() => { error.textContent = ''; }, 3000);
  }
}
