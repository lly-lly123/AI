/**
 * 模块5：后台管理配置面板处理函数
 * 功能：智谱API配置、助手功能配置
 */

function showStatus(el, text, type = 'info') {
  if (!el) return;
  el.style.display = 'block';
  const colors = {
    info: { bg: 'var(--primary-50)', color: 'var(--primary-dark)' },
    success: { bg: 'var(--success-light)', color: '#047857' },
    error: { bg: 'var(--danger-light)', color: '#b91c1c' }
  };
  const c = colors[type] || colors.info;
  el.style.background = c.bg;
  el.style.color = c.color;
  el.textContent = text;
}

// 获取后台API请求头
function getAdminHeaders() {
  const token = localStorage.getItem('adminToken');
  if (!token) return null;
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
}

// 加载后台AI配置
async function loadAiSettingsBackend() {
  const statusEl = document.getElementById('aiSettingsStatus');
  const headers = getAdminHeaders();
  if (!headers) {
    showStatus(statusEl, '未登录管理员，无法读取后台配置', 'info');
    return;
  }
  try {
    const res = await fetch('/api/admin/ai-settings', { headers });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || '加载失败');
    const ai = data.data || {};
    const fill = (id, val) => {
      const el = document.getElementById(id);
      if (el && val) el.value = val;
    };
    fill('zhipuApiKeyEvo', ai.zhipuApiKeyEvo);
    fill('zhipuApiKeyAdmin', ai.zhipuApiKeyAdmin);
    fill('qwenApiKey', ai.qwenApiKey);
    fill('huggingFaceApiKey', ai.huggingFaceApiKey);
    if (document.getElementById('aiModel')) {
      document.getElementById('aiModel').value = ai.model || 'auto';
    }
    showStatus(statusEl, '已从后台加载AI配置', 'success');
    setTimeout(() => { if (statusEl) statusEl.style.display = 'none'; }, 3000);
  } catch (e) {
    console.error('加载后台AI配置失败:', e);
    showStatus(document.getElementById('aiSettingsStatus'), '加载后台AI配置失败：' + e.message, 'error');
  }
}

// 保存AI配置到后台
async function saveAiSettingsBackend() {
  const statusEl = document.getElementById('aiSettingsStatus');
  const headers = getAdminHeaders();
  if (!headers) {
    showStatus(statusEl, '未登录管理员，无法保存后台配置', 'error');
    return;
  }
  const payload = {
    zhipuApiKeyEvo: document.getElementById('zhipuApiKeyEvo')?.value.trim() || '',
    zhipuApiKeyAdmin: document.getElementById('zhipuApiKeyAdmin')?.value.trim() || '',
    qwenApiKey: document.getElementById('qwenApiKey')?.value.trim() || '',
    huggingFaceApiKey: document.getElementById('huggingFaceApiKey')?.value.trim() || '',
    model: document.getElementById('aiModel')?.value || 'auto'
  };
  try {
    showStatus(statusEl, '正在保存到后台...', 'info');
    const res = await fetch('/api/admin/ai-settings', {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.error || '保存失败');
    showStatus(statusEl, '✅ 已保存并立即生效', 'success');
    setTimeout(() => { if (statusEl) statusEl.style.display = 'none'; }, 3000);
  } catch (e) {
    console.error('保存后台AI配置失败:', e);
    showStatus(statusEl, '保存失败：' + e.message, 'error');
  }
}

// 加载智谱API配置（本地）
function loadZhipuConfig() {
  try {
    const config = localStorage.getItem('pigeon_api_config');
    if (config) {
      const parsed = JSON.parse(config);
      const apiKey = parsed.zhipuApiKeyEvo || parsed.zhipuApiKeyAdmin || '';
      if (apiKey && document.getElementById('zhipuApiKeyConfig')) {
        document.getElementById('zhipuApiKeyConfig').value = apiKey;
      }
      if (document.getElementById('zhipuApiKeyEvo') && apiKey && !document.getElementById('zhipuApiKeyEvo').value) {
        document.getElementById('zhipuApiKeyEvo').value = apiKey;
      }
      if (parsed.zhipuModel && document.getElementById('zhipuModelConfig')) {
        document.getElementById('zhipuModelConfig').value = parsed.zhipuModel;
      }
      if (parsed.zhipuTemperature !== undefined && document.getElementById('zhipuTemperatureConfig')) {
        document.getElementById('zhipuTemperatureConfig').value = parsed.zhipuTemperature;
        const tempValueEl = document.getElementById('zhipuTemperatureValue');
        if (tempValueEl) tempValueEl.textContent = parsed.zhipuTemperature;
      }
      if (parsed.zhipuMaxTokens && document.getElementById('zhipuMaxTokensConfig')) {
        document.getElementById('zhipuMaxTokensConfig').value = parsed.zhipuMaxTokens;
      }
    }
  } catch (e) {
    console.error('加载智谱API配置失败:', e);
  }
}

// 保存智谱API配置（本地）
function saveZhipuConfig() {
  try {
    const config = localStorage.getItem('pigeon_api_config');
    const parsed = config ? JSON.parse(config) : {};
    
    const apiKeyEl = document.getElementById('zhipuApiKeyConfig');
    const modelEl = document.getElementById('zhipuModelConfig');
    const tempEl = document.getElementById('zhipuTemperatureConfig');
    const tokensEl = document.getElementById('zhipuMaxTokensConfig');
    
    if (apiKeyEl) parsed.zhipuApiKeyEvo = apiKeyEl.value.trim();
    if (modelEl) parsed.zhipuModel = modelEl.value;
    if (tempEl) parsed.zhipuTemperature = parseFloat(tempEl.value);
    if (tokensEl) parsed.zhipuMaxTokens = parseInt(tokensEl.value);
    
    localStorage.setItem('pigeon_api_config', JSON.stringify(parsed));
    
    const statusDiv = document.getElementById('zhipuConfigStatus') || document.getElementById('aiSettingsStatus');
    if (statusDiv) {
      statusDiv.style.display = 'block';
      statusDiv.style.background = 'var(--success-light)';
      statusDiv.style.color = '#047857';
      statusDiv.textContent = '✅ 已保存到浏览器本地';
      setTimeout(() => { statusDiv.style.display = 'none'; }, 3000);
    }
  } catch (e) {
    console.error('保存智谱API配置失败:', e);
    alert('保存失败：' + e.message);
  }
}

// 验证智谱API Key
async function testZhipuKey() {
  const apiKeyEl = document.getElementById('zhipuApiKeyConfig');
  if (!apiKeyEl) return;
  
  const apiKey = apiKeyEl.value.trim();
  if (!apiKey) {
    alert('请输入API Key');
    return;
  }
  
  const resultDiv = document.getElementById('zhipuKeyTestResult');
  if (!resultDiv) return;
  
  resultDiv.style.display = 'block';
  resultDiv.textContent = '正在验证...';
  resultDiv.style.background = 'var(--primary-50)';
  resultDiv.style.color = 'var(--primary-dark)';
  
  try {
    const response = await fetch('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'glm-4',
        messages: [{ role: 'user', content: 'test' }],
        max_tokens: 10
      })
    });
    
    if (response.ok) {
      resultDiv.style.background = 'var(--success-light)';
      resultDiv.style.color = '#047857';
      resultDiv.textContent = '✅ API Key验证成功';
    } else {
      throw new Error('验证失败');
    }
  } catch (e) {
    resultDiv.style.background = 'var(--danger-light)';
    resultDiv.style.color = '#b91c1c';
    resultDiv.textContent = '❌ API Key验证失败，请检查Key是否正确';
  }
}

// 加载助手功能配置
function loadAssistantConfig() {
  try {
    const config = localStorage.getItem('pigeon_api_config');
    if (config) {
      const parsed = JSON.parse(config);
      const enabledEl = document.getElementById('assistantEnabledConfig');
      const welcomeEl = document.getElementById('assistantWelcomeMessageConfig');
      const errorEl = document.getElementById('assistantErrorMessageConfig');
      const historyEl = document.getElementById('assistantHistoryDaysConfig');
      
      if (enabledEl && parsed.assistantEnabled !== undefined) {
        enabledEl.checked = parsed.assistantEnabled;
      }
      if (welcomeEl && parsed.assistantWelcomeMessage) {
        welcomeEl.value = parsed.assistantWelcomeMessage;
        updateWelcomePreview();
      }
      if (errorEl && parsed.aiErrorMessage) {
        errorEl.value = parsed.aiErrorMessage;
      }
      if (historyEl && parsed.assistantMaxHistory !== undefined) {
        historyEl.value = parsed.assistantMaxHistory;
      }
    }
  } catch (e) {
    console.error('加载助手配置失败:', e);
  }
}

// 保存助手功能配置
function saveAssistantConfig() {
  try {
    const config = localStorage.getItem('pigeon_api_config');
    const parsed = config ? JSON.parse(config) : {};
    
    const enabledEl = document.getElementById('assistantEnabledConfig');
    const welcomeEl = document.getElementById('assistantWelcomeMessageConfig');
    const errorEl = document.getElementById('assistantErrorMessageConfig');
    const historyEl = document.getElementById('assistantHistoryDaysConfig');
    
    if (enabledEl) parsed.assistantEnabled = enabledEl.checked;
    if (welcomeEl) parsed.assistantWelcomeMessage = welcomeEl.value.trim();
    if (errorEl) parsed.aiErrorMessage = errorEl.value.trim();
    if (historyEl) parsed.assistantMaxHistory = parseInt(historyEl.value);
    
    localStorage.setItem('pigeon_api_config', JSON.stringify(parsed));
    
    const statusDiv = document.getElementById('assistantConfigStatus');
    if (statusDiv) {
      statusDiv.style.display = 'block';
      statusDiv.style.background = 'var(--success-light)';
      statusDiv.style.color = '#047857';
      statusDiv.textContent = '✅ 配置已保存并同步到PC/移动端';
      setTimeout(() => { statusDiv.style.display = 'none'; }, 3000);
    }
  } catch (e) {
    console.error('保存助手配置失败:', e);
    alert('保存失败：' + e.message);
  }
}

// 更新欢迎语预览
function updateWelcomePreview() {
  const welcomeEl = document.getElementById('assistantWelcomeMessageConfig');
  const previewDiv = document.getElementById('assistantWelcomePreview');
  const previewText = document.getElementById('assistantWelcomePreviewText');
  
  if (welcomeEl && previewDiv && previewText) {
    const welcomeText = welcomeEl.value.trim();
    if (welcomeText) {
      previewDiv.style.display = 'block';
      previewText.textContent = welcomeText;
    } else {
      previewDiv.style.display = 'none';
    }
  }
}

// 初始化配置面板事件绑定
function initConfigPanels() {
  // 延迟绑定，确保DOM已加载
  setTimeout(function() {
    const tempEl = document.getElementById('zhipuTemperatureConfig');
    if (tempEl) {
      tempEl.addEventListener('input', function() {
        const tempValueEl = document.getElementById('zhipuTemperatureValue');
        if (tempValueEl) tempValueEl.textContent = this.value;
      });
    }
    
    const welcomeEl = document.getElementById('assistantWelcomeMessageConfig');
    if (welcomeEl) {
      welcomeEl.addEventListener('input', updateWelcomePreview);
    }
    
    const saveZhipuBtn = document.getElementById('btnSaveZhipuConfig');
    if (saveZhipuBtn) {
      saveZhipuBtn.addEventListener('click', saveZhipuConfig);
    }
    const saveAiBackendBtn = document.getElementById('btnSaveAiSettings');
    if (saveAiBackendBtn) {
      saveAiBackendBtn.addEventListener('click', saveAiSettingsBackend);
    }
    
    const testZhipuBtn = document.getElementById('btnTestZhipuKey');
    if (testZhipuBtn) {
      testZhipuBtn.addEventListener('click', testZhipuKey);
    }
    
    const saveAssistantBtn = document.getElementById('btnSaveAssistantConfig');
    if (saveAssistantBtn) {
      saveAssistantBtn.addEventListener('click', saveAssistantConfig);
    }
    
    const syncAssistantBtn = document.getElementById('btnSyncAssistantConfig');
    if (syncAssistantBtn) {
      syncAssistantBtn.addEventListener('click', function() {
        saveAssistantConfig();
        alert('配置已同步到PC/移动端，刷新页面后生效');
      });
    }
  }, 500);

  // 初始化时尝试加载后台AI配置
  loadAiSettingsBackend();
}

// 自动初始化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initConfigPanels);
} else {
  initConfigPanels();
}
























