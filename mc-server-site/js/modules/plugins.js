// ===================== 插件列表 + 搜索 =====================
function renderPluginList() {
  const container = document.getElementById('plugins-content');
  const categories = [...new Set(App.plugins.map(p => p.category))];
  App._pluginCategory = 'all';
  App._pluginQuery = '';

  container.innerHTML = `
    <div class="page-header">
      <h2>🔌 服务器插件</h2>
      <p>了解服务器安装的功能插件及其使用方法</p>
    </div>
    <div class="plugin-filters" id="plugin-filters">
      <button class="plugin-filter-btn active" data-cat="all" onclick="filterPlugins('all', this)">📦 全部</button>
      ${categories.map(c => `<button class="plugin-filter-btn" data-cat="${c}" onclick="filterPlugins('${c}', this)">${c}</button>`).join('')}
    </div>
    <div style="margin-bottom:16px;">
      <input type="text" class="search-box" id="plugin-search" placeholder="🔍 搜索插件名称或描述..." oninput="searchPlugins()">
    </div>
    <div class="plugin-grid" id="plugin-grid">
      ${renderPluginCards(App.plugins)}
    </div>
  `;
}

function renderPluginCards(plugins) {
  const catMap = { '核心': 'core', '管理': 'manage', '玩法': 'gameplay', '生存': 'survival', '经济': 'economy' };
  return plugins.map(p => `
    <div class="plugin-card" onclick="openPluginDetail('${p.id}')">
      <div class="plugin-header">
        <div class="plugin-icon">${p.icon}</div>
        <div class="plugin-info">
          <h4>${p.name}</h4>
          <div class="plugin-meta">
            <span class="plugin-category ${catMap[p.category] || ''}">${p.category}</span>
            <span>v${p.version}</span>
          </div>
        </div>
      </div>
      <div class="plugin-desc">${p.description}</div>
      <div class="plugin-footer"><span>👤 ${p.author}</span><span>📋 ${p.commands.length} 个指令</span></div>
    </div>
  `).join('');
}

function filterPlugins(category, btn) {
  $$('.plugin-filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  App._pluginCategory = category;
  applyPluginFilters();
}

function searchPlugins() {
  App._pluginQuery = (document.getElementById('plugin-search')?.value || '').toLowerCase();
  applyPluginFilters();
}

function applyPluginFilters() {
  const cat = App._pluginCategory || 'all';
  const q = App._pluginQuery || '';
  let filtered = cat === 'all' ? [...App.plugins] : App.plugins.filter(p => p.category === cat);
  if (q) {
    filtered = filtered.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      (p.author && p.author.toLowerCase().includes(q))
    );
  }
  App.filteredPlugins = filtered;
  const grid = document.getElementById('plugin-grid');
  if (grid) grid.innerHTML = renderPluginCards(filtered);
}

function openPluginDetail(pluginId) {
  const plugin = App.plugins.find(p => p.id === pluginId);
  if (!plugin) return;
  App.currentPlugin = plugin;
  document.getElementById('plugin-modal-title').textContent = `${plugin.icon} ${plugin.name}`;
  document.getElementById('plugin-modal-body').innerHTML = renderPluginDetail(plugin);
  document.getElementById('plugin-modal').classList.add('show');
  document.body.style.overflow = 'hidden';
}

function renderPluginDetail(plugin) {
  const catMap = { '核心': 'core', '管理': 'manage', '玩法': 'gameplay', '生存': 'survival', '经济': 'economy' };
  const usageHtml = markdownToHtml(plugin.usage);
  return `
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px;">
      <span style="font-size:28px;">${plugin.icon}</span>
      <div>
        <h4 style="font-size:16px;font-weight:600;">${plugin.name}</h4>
        <div style="display:flex;gap:8px;align-items:center;margin-top:4px;">
          <span class="plugin-category ${catMap[plugin.category] || ''}">${plugin.category}</span>
          <span style="font-size:12px;color:var(--text-muted);">v${plugin.version}</span>
          <span style="font-size:12px;color:var(--text-muted);">| 👤 ${plugin.author}</span>
        </div>
      </div>
    </div>
    <p style="color:var(--text-secondary);margin-bottom:16px;">${plugin.description}</p>
    <h3 style="font-size:16px;font-weight:600;margin:20px 0 12px;color:var(--accent-primary);">📋 可用指令</h3>
    <table><thead><tr><th>指令</th><th>说明</th></tr></thead><tbody>
      ${plugin.commands.map(c => `<tr><td><code>${c.cmd}</code></td><td>${c.desc}</td></tr>`).join('')}
    </tbody></table>
    <h3 style="font-size:16px;font-weight:600;margin:20px 0 12px;color:var(--accent-primary);">📖 使用指南</h3>
    <div class="plugin-usage-content">${usageHtml}</div>
  `;
}

function closePluginModal() {
  document.getElementById('plugin-modal').classList.remove('show');
  document.body.style.overflow = '';
}
