// ===================== QQ群页面 =====================
function renderQQGroup() {
  const container = document.getElementById('qqgroup-content');
  container.innerHTML = `
    <div class="page-header">
      <h2>💬 玩家交流群</h2>
      <p>加入我们的QQ群，和所有玩家一起交流吧！</p>
    </div>
    <div class="qq-group-section">
      <div class="qq-group-card">
        <div class="qq-icon">💬</div>
        <h3>DreamCraft 玩家交流群</h3>
        <p>群内可讨论游戏技巧、组队冒险、反馈问题、闲聊交友</p>
        <div class="qq-number">${App.config.qqGroup}</div>
        <div style="display:flex;gap:12px;justify-content:center;">
          <a href="${App.config.qqGroupLink}" target="_blank" class="btn btn-primary">💬 点击加群</a>
          <button class="btn btn-outline" onclick="copyQQ()">📋 复制群号</button>
        </div>
      </div>
      <div class="qq-rules">
        <div class="card">
          <h4>📋 群规须知</h4>
          <ul>
            <li>🤝 友好交流，禁止辱骂、引战</li>
            <li>🚫 禁止发送违法违规内容</li>
            <li>📢 禁止刷屏、广告、恶意@他人</li>
            <li>🎮 游戏相关问题请先查阅文档</li>
            <li>👮 遇到问题请联系群管理员</li>
            <li>💡 欢迎提出建设性建议和反馈</li>
          </ul>
        </div>
      </div>
    </div>
  `;
}

function copyQQ() {
  navigator.clipboard.writeText(App.config.qqGroup).then(() => alert('✅ 群号已复制到剪贴板'));
}

// ===================== 关于页面 =====================
function renderAbout() {
  const container = document.getElementById('about-content');
  const aboutDoc = App.docs.find(d => d.id === 'about-me');
  container.innerHTML = `
    <div class="page-header"><h2>💖 关于 / 我想说的话</h2><p>来自服主的一封信</p></div>
    <div class="about-content">
      ${aboutDoc ? aboutDoc.content.map(block => {
        if (block.type === 'text') return `<div class="about-section">${markdownToHtml(block.value)}</div>`;
        return '';
      }).join('') : '<p style="color:var(--text-muted);">暂无内容</p>'}
    </div>
  `;
}
