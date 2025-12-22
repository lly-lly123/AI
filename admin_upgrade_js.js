// 系统升级功能JavaScript - 插入到admin.html的script标签中

// 加载系统升级数据
async function loadUpgradeData() {
  const CORE_ADMIN_API_BASE = 'http://localhost:3001/api';
  
  try {
    // 加载升级概览
    const overviewResponse = await fetch(`${CORE_ADMIN_API_BASE}/upgrade/overview`);
    if (overviewResponse.ok) {
      const overviewResult = await overviewResponse.json();
      if (overviewResult.success && overviewResult.data) {
        const overview = overviewResult.data;
        document.getElementById('upgradeVersion').textContent = `v${overview.version}`;
        document.getElementById('upgradePartsCount').textContent = overview.completedCount || '--';
        document.getElementById('upgradeNewFiles').textContent = overview.statistics?.newFiles || '--';
        document.getElementById('upgradeNewCode').textContent = (overview.statistics?.newCodeLines / 1000).toFixed(1) + 'K';
        document.getElementById('upgradeAutomation').textContent = overview.capabilities?.automation || '--';
      }
    }

    // 加载升级部分
    const partsResponse = await fetch(`${CORE_ADMIN_API_BASE}/upgrade/parts`);
    if (partsResponse.ok) {
      const partsResult = await partsResponse.json();
      if (partsResult.success && partsResult.data) {
        renderUpgradeParts(partsResult.data);
      }
    }

    // 加载能力提升
    const capabilitiesResponse = await fetch(`${CORE_ADMIN_API_BASE}/upgrade/capabilities`);
    if (capabilitiesResponse.ok) {
      const capabilitiesResult = await capabilitiesResponse.json();
      if (capabilitiesResult.success && capabilitiesResult.data) {
        renderCapabilities(capabilitiesResult.data);
      }
    }
  } catch (error) {
    console.error('加载升级数据失败:', error);
    document.getElementById('upgradePartsList').innerHTML = `
      <div style="padding:20px;text-align:center;background:#fef3c7;border-radius:8px;border:1px solid #f59e0b;">
        <p style="margin:0 0 12px 0;color:#92400e;font-weight:600;">⚠️ 无法连接到升级服务</p>
        <p style="margin:0;color:#78350f;font-size:14px;">请确保中枢管家服务正在运行</p>
      </div>
    `;
  }
}

// 渲染升级部分
function renderUpgradeParts(parts) {
  const container = document.getElementById('upgradePartsList');
  
  if (!parts || parts.length === 0) {
    container.innerHTML = '<p class="muted" style="text-align:center;padding:40px;">暂无升级记录</p>';
    return;
  }

  const html = parts.map(part => `
    <div style="background:#f8fafc;border-radius:12px;padding:24px;margin-bottom:16px;border:2px solid #e2e8f0;transition:all 0.3s ease;" 
         onmouseover="this.style.borderColor='#3b82f6';this.style.boxShadow='0 4px 12px rgba(59,130,246,0.15)'" 
         onmouseout="this.style.borderColor='#e2e8f0';this.style.boxShadow='none'">
      <div style="display:flex;align-items:start;gap:16px;">
        <div style="width:48px;height:48px;border-radius:12px;background:linear-gradient(135deg, #667eea 0%, #764ba2 100%);display:flex;align-items:center;justify-content:center;font-size:24px;flex-shrink:0;">
          ${part.id === 'frontend' ? '🎨' : part.id === 'security' ? '🔒' : part.id === 'database' ? '🗄️' : '🤖'}
        </div>
        <div style="flex:1;">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">
            <h4 style="margin:0;font-size:18px;font-weight:700;color:#1e293b;">${part.name}</h4>
            <span style="background:#10b981;color:#fff;padding:4px 12px;border-radius:6px;font-size:12px;font-weight:600;">✅ ${part.status === 'completed' ? '已完成' : '进行中'}</span>
          </div>
          <p style="margin:0 0 16px 0;color:#64748b;font-size:14px;line-height:1.6;">${part.description}</p>
          
          ${part.files && part.files.length > 0 ? `
            <div style="margin-bottom:12px;">
              <div style="font-size:13px;font-weight:600;color:#475569;margin-bottom:8px;">相关文件：</div>
              <div style="display:flex;flex-wrap:wrap;gap:8px;">
                ${part.files.map(file => `
                  <span style="background:#e2e8f0;color:#475569;padding:4px 10px;border-radius:6px;font-size:12px;font-family:monospace;">${file}</span>
                `).join('')}
              </div>
            </div>
          ` : ''}
          
          ${part.modules && part.modules.length > 0 ? `
            <div style="margin-bottom:12px;">
              <div style="font-size:13px;font-weight:600;color:#475569;margin-bottom:8px;">新增模块：</div>
              <div style="display:flex;flex-wrap:wrap;gap:8px;">
                ${part.modules.map(module => `
                  <div style="background:#dbeafe;color:#1e40af;padding:6px 12px;border-radius:6px;font-size:12px;display:flex;align-items:center;gap:6px;">
                    <span>📦</span>
                    <span>${module.name}</span>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}
          
          ${part.benefits && part.benefits.length > 0 ? `
            <div>
              <div style="font-size:13px;font-weight:600;color:#475569;margin-bottom:8px;">收益：</div>
              <ul style="margin:0;padding-left:20px;color:#64748b;font-size:13px;">
                ${part.benefits.map(benefit => `<li style="margin-bottom:4px;">${benefit}</li>`).join('')}
              </ul>
            </div>
          ` : ''}
        </div>
      </div>
    </div>
  `).join('');

  container.innerHTML = html;
}

// 渲染能力提升
function renderCapabilities(capabilities) {
  const container = document.getElementById('upgradeCapabilities');
  
  const html = `
    <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(200px, 1fr));gap:16px;">
      <div style="background:linear-gradient(135deg, #e6f0ff 0%, #dbeafe 100%);border-radius:12px;padding:20px;border:2px solid rgba(59,130,246,0.2);">
        <div style="font-size:14px;font-weight:600;color:#1e40af;margin-bottom:8px;">自动化率</div>
        <div style="font-size:32px;font-weight:700;color:#1e293b;">${capabilities.automation || '--'}</div>
      </div>
      <div style="background:linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);border-radius:12px;padding:20px;border:2px solid rgba(16,185,129,0.2);">
        <div style="font-size:14px;font-weight:600;color:#065f46;margin-bottom:8px;">智能化率</div>
        <div style="font-size:32px;font-weight:700;color:#1e293b;">${capabilities.intelligence || '--'}</div>
      </div>
      <div style="background:linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);border-radius:12px;padding:20px;border:2px solid rgba(245,158,11,0.2);">
        <div style="font-size:14px;font-weight:600;color:#92400e;margin-bottom:8px;">预测准确率</div>
        <div style="font-size:32px;font-weight:700;color:#1e293b;">${capabilities.prediction || '--'}</div>
      </div>
      <div style="background:linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%);border-radius:12px;padding:20px;border:2px solid rgba(236,72,153,0.2);">
        <div style="font-size:14px;font-weight:600;color:#9f1239;margin-bottom:8px;">API安全性</div>
        <div style="font-size:32px;font-weight:700;color:#1e293b;">${capabilities.security || '--'}</div>
      </div>
    </div>
  `;

  container.innerHTML = html;
}







// 加载系统升级数据
async function loadUpgradeData() {
  const CORE_ADMIN_API_BASE = 'http://localhost:3001/api';
  
  try {
    // 加载升级概览
    const overviewResponse = await fetch(`${CORE_ADMIN_API_BASE}/upgrade/overview`);
    if (overviewResponse.ok) {
      const overviewResult = await overviewResponse.json();
      if (overviewResult.success && overviewResult.data) {
        const overview = overviewResult.data;
        document.getElementById('upgradeVersion').textContent = `v${overview.version}`;
        document.getElementById('upgradePartsCount').textContent = overview.completedCount || '--';
        document.getElementById('upgradeNewFiles').textContent = overview.statistics?.newFiles || '--';
        document.getElementById('upgradeNewCode').textContent = (overview.statistics?.newCodeLines / 1000).toFixed(1) + 'K';
        document.getElementById('upgradeAutomation').textContent = overview.capabilities?.automation || '--';
      }
    }

    // 加载升级部分
    const partsResponse = await fetch(`${CORE_ADMIN_API_BASE}/upgrade/parts`);
    if (partsResponse.ok) {
      const partsResult = await partsResponse.json();
      if (partsResult.success && partsResult.data) {
        renderUpgradeParts(partsResult.data);
      }
    }

    // 加载能力提升
    const capabilitiesResponse = await fetch(`${CORE_ADMIN_API_BASE}/upgrade/capabilities`);
    if (capabilitiesResponse.ok) {
      const capabilitiesResult = await capabilitiesResponse.json();
      if (capabilitiesResult.success && capabilitiesResult.data) {
        renderCapabilities(capabilitiesResult.data);
      }
    }
  } catch (error) {
    console.error('加载升级数据失败:', error);
    document.getElementById('upgradePartsList').innerHTML = `
      <div style="padding:20px;text-align:center;background:#fef3c7;border-radius:8px;border:1px solid #f59e0b;">
        <p style="margin:0 0 12px 0;color:#92400e;font-weight:600;">⚠️ 无法连接到升级服务</p>
        <p style="margin:0;color:#78350f;font-size:14px;">请确保中枢管家服务正在运行</p>
      </div>
    `;
  }
}

// 渲染升级部分
function renderUpgradeParts(parts) {
  const container = document.getElementById('upgradePartsList');
  
  if (!parts || parts.length === 0) {
    container.innerHTML = '<p class="muted" style="text-align:center;padding:40px;">暂无升级记录</p>';
    return;
  }

  const html = parts.map(part => `
    <div style="background:#f8fafc;border-radius:12px;padding:24px;margin-bottom:16px;border:2px solid #e2e8f0;transition:all 0.3s ease;" 
         onmouseover="this.style.borderColor='#3b82f6';this.style.boxShadow='0 4px 12px rgba(59,130,246,0.15)'" 
         onmouseout="this.style.borderColor='#e2e8f0';this.style.boxShadow='none'">
      <div style="display:flex;align-items:start;gap:16px;">
        <div style="width:48px;height:48px;border-radius:12px;background:linear-gradient(135deg, #667eea 0%, #764ba2 100%);display:flex;align-items:center;justify-content:center;font-size:24px;flex-shrink:0;">
          ${part.id === 'frontend' ? '🎨' : part.id === 'security' ? '🔒' : part.id === 'database' ? '🗄️' : '🤖'}
        </div>
        <div style="flex:1;">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">
            <h4 style="margin:0;font-size:18px;font-weight:700;color:#1e293b;">${part.name}</h4>
            <span style="background:#10b981;color:#fff;padding:4px 12px;border-radius:6px;font-size:12px;font-weight:600;">✅ ${part.status === 'completed' ? '已完成' : '进行中'}</span>
          </div>
          <p style="margin:0 0 16px 0;color:#64748b;font-size:14px;line-height:1.6;">${part.description}</p>
          
          ${part.files && part.files.length > 0 ? `
            <div style="margin-bottom:12px;">
              <div style="font-size:13px;font-weight:600;color:#475569;margin-bottom:8px;">相关文件：</div>
              <div style="display:flex;flex-wrap:wrap;gap:8px;">
                ${part.files.map(file => `
                  <span style="background:#e2e8f0;color:#475569;padding:4px 10px;border-radius:6px;font-size:12px;font-family:monospace;">${file}</span>
                `).join('')}
              </div>
            </div>
          ` : ''}
          
          ${part.modules && part.modules.length > 0 ? `
            <div style="margin-bottom:12px;">
              <div style="font-size:13px;font-weight:600;color:#475569;margin-bottom:8px;">新增模块：</div>
              <div style="display:flex;flex-wrap:wrap;gap:8px;">
                ${part.modules.map(module => `
                  <div style="background:#dbeafe;color:#1e40af;padding:6px 12px;border-radius:6px;font-size:12px;display:flex;align-items:center;gap:6px;">
                    <span>📦</span>
                    <span>${module.name}</span>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}
          
          ${part.benefits && part.benefits.length > 0 ? `
            <div>
              <div style="font-size:13px;font-weight:600;color:#475569;margin-bottom:8px;">收益：</div>
              <ul style="margin:0;padding-left:20px;color:#64748b;font-size:13px;">
                ${part.benefits.map(benefit => `<li style="margin-bottom:4px;">${benefit}</li>`).join('')}
              </ul>
            </div>
          ` : ''}
        </div>
      </div>
    </div>
  `).join('');

  container.innerHTML = html;
}

// 渲染能力提升
function renderCapabilities(capabilities) {
  const container = document.getElementById('upgradeCapabilities');
  
  const html = `
    <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(200px, 1fr));gap:16px;">
      <div style="background:linear-gradient(135deg, #e6f0ff 0%, #dbeafe 100%);border-radius:12px;padding:20px;border:2px solid rgba(59,130,246,0.2);">
        <div style="font-size:14px;font-weight:600;color:#1e40af;margin-bottom:8px;">自动化率</div>
        <div style="font-size:32px;font-weight:700;color:#1e293b;">${capabilities.automation || '--'}</div>
      </div>
      <div style="background:linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);border-radius:12px;padding:20px;border:2px solid rgba(16,185,129,0.2);">
        <div style="font-size:14px;font-weight:600;color:#065f46;margin-bottom:8px;">智能化率</div>
        <div style="font-size:32px;font-weight:700;color:#1e293b;">${capabilities.intelligence || '--'}</div>
      </div>
      <div style="background:linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);border-radius:12px;padding:20px;border:2px solid rgba(245,158,11,0.2);">
        <div style="font-size:14px;font-weight:600;color:#92400e;margin-bottom:8px;">预测准确率</div>
        <div style="font-size:32px;font-weight:700;color:#1e293b;">${capabilities.prediction || '--'}</div>
      </div>
      <div style="background:linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%);border-radius:12px;padding:20px;border:2px solid rgba(236,72,153,0.2);">
        <div style="font-size:14px;font-weight:600;color:#9f1239;margin-bottom:8px;">API安全性</div>
        <div style="font-size:32px;font-weight:700;color:#1e293b;">${capabilities.security || '--'}</div>
      </div>
    </div>
  `;

  container.innerHTML = html;
}







// 加载系统升级数据
async function loadUpgradeData() {
  const CORE_ADMIN_API_BASE = 'http://localhost:3001/api';
  
  try {
    // 加载升级概览
    const overviewResponse = await fetch(`${CORE_ADMIN_API_BASE}/upgrade/overview`);
    if (overviewResponse.ok) {
      const overviewResult = await overviewResponse.json();
      if (overviewResult.success && overviewResult.data) {
        const overview = overviewResult.data;
        document.getElementById('upgradeVersion').textContent = `v${overview.version}`;
        document.getElementById('upgradePartsCount').textContent = overview.completedCount || '--';
        document.getElementById('upgradeNewFiles').textContent = overview.statistics?.newFiles || '--';
        document.getElementById('upgradeNewCode').textContent = (overview.statistics?.newCodeLines / 1000).toFixed(1) + 'K';
        document.getElementById('upgradeAutomation').textContent = overview.capabilities?.automation || '--';
      }
    }

    // 加载升级部分
    const partsResponse = await fetch(`${CORE_ADMIN_API_BASE}/upgrade/parts`);
    if (partsResponse.ok) {
      const partsResult = await partsResponse.json();
      if (partsResult.success && partsResult.data) {
        renderUpgradeParts(partsResult.data);
      }
    }

    // 加载能力提升
    const capabilitiesResponse = await fetch(`${CORE_ADMIN_API_BASE}/upgrade/capabilities`);
    if (capabilitiesResponse.ok) {
      const capabilitiesResult = await capabilitiesResponse.json();
      if (capabilitiesResult.success && capabilitiesResult.data) {
        renderCapabilities(capabilitiesResult.data);
      }
    }
  } catch (error) {
    console.error('加载升级数据失败:', error);
    document.getElementById('upgradePartsList').innerHTML = `
      <div style="padding:20px;text-align:center;background:#fef3c7;border-radius:8px;border:1px solid #f59e0b;">
        <p style="margin:0 0 12px 0;color:#92400e;font-weight:600;">⚠️ 无法连接到升级服务</p>
        <p style="margin:0;color:#78350f;font-size:14px;">请确保中枢管家服务正在运行</p>
      </div>
    `;
  }
}

// 渲染升级部分
function renderUpgradeParts(parts) {
  const container = document.getElementById('upgradePartsList');
  
  if (!parts || parts.length === 0) {
    container.innerHTML = '<p class="muted" style="text-align:center;padding:40px;">暂无升级记录</p>';
    return;
  }

  const html = parts.map(part => `
    <div style="background:#f8fafc;border-radius:12px;padding:24px;margin-bottom:16px;border:2px solid #e2e8f0;transition:all 0.3s ease;" 
         onmouseover="this.style.borderColor='#3b82f6';this.style.boxShadow='0 4px 12px rgba(59,130,246,0.15)'" 
         onmouseout="this.style.borderColor='#e2e8f0';this.style.boxShadow='none'">
      <div style="display:flex;align-items:start;gap:16px;">
        <div style="width:48px;height:48px;border-radius:12px;background:linear-gradient(135deg, #667eea 0%, #764ba2 100%);display:flex;align-items:center;justify-content:center;font-size:24px;flex-shrink:0;">
          ${part.id === 'frontend' ? '🎨' : part.id === 'security' ? '🔒' : part.id === 'database' ? '🗄️' : '🤖'}
        </div>
        <div style="flex:1;">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">
            <h4 style="margin:0;font-size:18px;font-weight:700;color:#1e293b;">${part.name}</h4>
            <span style="background:#10b981;color:#fff;padding:4px 12px;border-radius:6px;font-size:12px;font-weight:600;">✅ ${part.status === 'completed' ? '已完成' : '进行中'}</span>
          </div>
          <p style="margin:0 0 16px 0;color:#64748b;font-size:14px;line-height:1.6;">${part.description}</p>
          
          ${part.files && part.files.length > 0 ? `
            <div style="margin-bottom:12px;">
              <div style="font-size:13px;font-weight:600;color:#475569;margin-bottom:8px;">相关文件：</div>
              <div style="display:flex;flex-wrap:wrap;gap:8px;">
                ${part.files.map(file => `
                  <span style="background:#e2e8f0;color:#475569;padding:4px 10px;border-radius:6px;font-size:12px;font-family:monospace;">${file}</span>
                `).join('')}
              </div>
            </div>
          ` : ''}
          
          ${part.modules && part.modules.length > 0 ? `
            <div style="margin-bottom:12px;">
              <div style="font-size:13px;font-weight:600;color:#475569;margin-bottom:8px;">新增模块：</div>
              <div style="display:flex;flex-wrap:wrap;gap:8px;">
                ${part.modules.map(module => `
                  <div style="background:#dbeafe;color:#1e40af;padding:6px 12px;border-radius:6px;font-size:12px;display:flex;align-items:center;gap:6px;">
                    <span>📦</span>
                    <span>${module.name}</span>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}
          
          ${part.benefits && part.benefits.length > 0 ? `
            <div>
              <div style="font-size:13px;font-weight:600;color:#475569;margin-bottom:8px;">收益：</div>
              <ul style="margin:0;padding-left:20px;color:#64748b;font-size:13px;">
                ${part.benefits.map(benefit => `<li style="margin-bottom:4px;">${benefit}</li>`).join('')}
              </ul>
            </div>
          ` : ''}
        </div>
      </div>
    </div>
  `).join('');

  container.innerHTML = html;
}

// 渲染能力提升
function renderCapabilities(capabilities) {
  const container = document.getElementById('upgradeCapabilities');
  
  const html = `
    <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(200px, 1fr));gap:16px;">
      <div style="background:linear-gradient(135deg, #e6f0ff 0%, #dbeafe 100%);border-radius:12px;padding:20px;border:2px solid rgba(59,130,246,0.2);">
        <div style="font-size:14px;font-weight:600;color:#1e40af;margin-bottom:8px;">自动化率</div>
        <div style="font-size:32px;font-weight:700;color:#1e293b;">${capabilities.automation || '--'}</div>
      </div>
      <div style="background:linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);border-radius:12px;padding:20px;border:2px solid rgba(16,185,129,0.2);">
        <div style="font-size:14px;font-weight:600;color:#065f46;margin-bottom:8px;">智能化率</div>
        <div style="font-size:32px;font-weight:700;color:#1e293b;">${capabilities.intelligence || '--'}</div>
      </div>
      <div style="background:linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);border-radius:12px;padding:20px;border:2px solid rgba(245,158,11,0.2);">
        <div style="font-size:14px;font-weight:600;color:#92400e;margin-bottom:8px;">预测准确率</div>
        <div style="font-size:32px;font-weight:700;color:#1e293b;">${capabilities.prediction || '--'}</div>
      </div>
      <div style="background:linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%);border-radius:12px;padding:20px;border:2px solid rgba(236,72,153,0.2);">
        <div style="font-size:14px;font-weight:600;color:#9f1239;margin-bottom:8px;">API安全性</div>
        <div style="font-size:32px;font-weight:700;color:#1e293b;">${capabilities.security || '--'}</div>
      </div>
    </div>
  `;

  container.innerHTML = html;
}






