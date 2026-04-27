// ===================== 更新日志 - Forza Horizon 风格 =====================
function renderChangelog() {
  const container = document.getElementById('changelog-content');
  if (!App.changelog || App.changelog.length === 0) {
    container.innerHTML = '<div style="text-align:center;padding:80px 20px;color:var(--text-muted);"><div style="font-size:64px;margin-bottom:16px;">📋</div><p>暂无更新记录</p></div>';
    return;
  }

  // 从旧到新排序
  const sorted = [...App.changelog].sort((a, b) => new Date(a.date) - new Date(b.date));
  const latest = sorted[sorted.length - 1];
  const older = sorted.slice(0, -1).reverse();

  const badges = { major: '大版本', minor: '小版本', patch: '修复' };

  // 最新版本 - 全屏大块
  function renderHero(log) {
    return `
      <div class="fh-hero" data-anim="hero">
        <div class="fh-hero-bg">
          <div class="fh-hero-glow-1"></div>
          <div class="fh-hero-glow-2"></div>
          <div class="fh-hero-grid"></div>
        </div>
        <div class="fh-hero-inner">
          <div class="fh-hero-overline" data-anim="slide-up">最新版本发布</div>
          <div class="fh-hero-version" data-anim="slide-up">v${log.version}</div>
          <h2 class="fh-hero-title" data-anim="slide-up">${log.title}</h2>
          <div class="fh-hero-desc" data-anim="slide-up">${log.content.replace(/\n/g, '<br>')}</div>
          <div class="fh-hero-footer" data-anim="slide-up">
            <span class="fh-tag ${log.type}">${badges[log.type] || '更新'}</span>
            <span>📅 ${log.date}</span>
            <span>✍️ ${log.author}</span>
          </div>
        </div>
      </div>`;
  }

  function renderOld(log, i) {
    const isLast = i === older.length - 1;
    return `
      <div class="fh-old-row" data-anim="card">
        <div class="fh-old-track">
          <div class="fh-old-dot ${log.type}"></div>
          ${!isLast ? '<div class="fh-old-line"></div>' : ''}
          <div class="fh-old-tag">${log.date}</div>
        </div>
        <div class="fh-old-card">
          <div class="fh-old-card-top">
            <span class="fh-old-version">v${log.version}</span>
            <span class="fh-tag ${log.type} sm">${badges[log.type] || '更新'}</span>
          </div>
          <h3 class="fh-old-title">${log.title}</h3>
          <div class="fh-old-desc">${log.content.replace(/\n/g, '<br>')}</div>
        </div>
      </div>`;
  }

  container.innerHTML = `
    <div class="fh-page">
      ${renderHero(latest)}
      <div class="fh-section-label">历史版本</div>
      <div class="fh-old-wrap">
        ${older.map((log, i) => renderOld(log, i)).join('')}
      </div>
    </div>
  `;

  // 入场动画 - Intersection Observer
  setTimeout(() => {
    const animEls = container.querySelectorAll('[data-anim]');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('fh-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

    animEls.forEach(el => observer.observe(el));

    // Hero 直接显示（已经在视口中）
    const hero = container.querySelector('[data-anim="hero"]');
    if (hero) {
      // 依次显示子元素
      const children = hero.querySelectorAll('[data-anim="slide-up"]');
      children.forEach((child, i) => {
        setTimeout(() => child.classList.add('fh-visible'), 150 + i * 120);
      });
    }
  }, 50);
}
