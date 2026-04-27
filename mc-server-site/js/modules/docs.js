// ===================== 文档页面 =====================
function renderDocs() {
  const container = document.getElementById('docs-content');
  const categories = [...new Set(App.docs.map(d => d.category))];
  
  container.innerHTML = `
    <div class="page-header">
      <h2>📚 服务器文档</h2>
      <p>新手指南、游戏玩法、规则说明等一切你需要知道的</p>
    </div>
    <div class="docs-layout">
      <div class="docs-sidebar">
        <div class="docs-nav">
          ${categories.map(cat => `
            <div class="docs-nav-section">
              <div class="docs-nav-category">${cat}</div>
              ${App.docs.filter(d => d.category === cat).map(d => `
                <div class="docs-nav-item ${App.currentDoc === d.id ? 'active' : ''}" onclick="showDoc('${d.id}')">${d.icon} ${d.title}</div>
              `).join('')}
            </div>
          `).join('')}
        </div>
      </div>
      <div class="docs-content" id="docs-view">
        <div style="text-align:center;padding:60px 20px;color:var(--text-muted);">
          <div style="font-size:48px;margin-bottom:16px;">📖</div>
          <p>请从左侧选择一个文档开始阅读</p>
        </div>
      </div>
    </div>
  `;

  if (App.docs.length > 0) showDoc(App.docs[0].id);
}

function showDoc(docId) {
  const doc = App.docs.find(d => d.id === docId);
  if (!doc) return;
  App.currentDoc = docId;

  $$('.docs-nav-item').forEach(n => n.classList.remove('active'));
  const navItem = document.querySelector(`.docs-nav-item[onclick*="'${docId}'"]`);
  if (navItem) navItem.classList.add('active');

  const view = document.getElementById('docs-view');
  view.innerHTML = doc.content.map(block => {
    switch (block.type) {
      case 'text': return markdownToHtml(block.value);
      case 'image': return `
        <div class="doc-image-wrapper">
          <img src="${block.src}" alt="${block.alt || ''}" class="doc-image" loading="lazy" onclick="openImageViewer('${block.src}', '${block.alt || ''}')">
          ${block.caption ? `<div class="doc-image-caption">${block.caption}</div>` : ''}
        </div>`;
      case 'section': return `<div style="margin:20px 0;"><h3>${block.title}</h3><ul>${block.items.map(i => `<li>${i}</li>`).join('')}</ul></div>`;
      case 'table': return `<table><thead><tr>${block.headers.map(h => `<th>${h}</th>`).join('')}</tr></thead><tbody>${block.rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
      case 'warning': return `<div class="warning-box"><strong>${block.title}</strong><p>${block.value}</p></div>`;
      default: return '';
    }
  }).join('');
}
