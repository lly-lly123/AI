#!/bin/bash

# 🔧 Admin后台访问问题快速修复脚本

echo "=========================================="
echo "🔍 Admin后台访问问题诊断和修复"
echo "=========================================="
echo ""

# 1. 检查admin.html文件
echo "📋 步骤1: 检查admin.html文件"
if [ -f "admin.html" ]; then
    echo "✅ admin.html 文件存在"
    echo "   文件大小: $(ls -lh admin.html | awk '{print $5}')"
    echo "   最后修改: $(ls -lT admin.html | awk '{print $6, $7, $8}')"
else
    echo "❌ admin.html 文件不存在！"
    exit 1
fi
echo ""

# 2. 检查Git状态
echo "📋 步骤2: 检查Git状态"
if git status admin.html | grep -q "干净的工作区"; then
    echo "✅ admin.html 已提交到Git"
    echo "   最新提交: $(git log -1 --oneline -- admin.html)"
else
    echo "⚠️  admin.html 有未提交的更改"
    echo "   正在添加到Git..."
    git add admin.html
    git commit -m "更新admin.html文件"
    echo "✅ 已提交到本地仓库"
    echo "   请运行: git push origin main"
fi
echo ""

# 3. 检查后端服务器配置
echo "📋 步骤3: 检查后端服务器配置"
if grep -q "express.static" backend/server.js; then
    echo "✅ 后端服务器已配置静态文件服务"
else
    echo "❌ 后端服务器未配置静态文件服务"
fi
echo ""

# 4. 检查zeabur.json配置
echo "📋 步骤4: 检查Zeabur配置"
if [ -f "zeabur.json" ]; then
    echo "✅ zeabur.json 存在"
    echo "   配置内容:"
    cat zeabur.json | sed 's/^/   /'
else
    echo "⚠️  zeabur.json 不存在"
fi
echo ""

# 5. 生成修复建议
echo "=========================================="
echo "🔧 修复建议"
echo "=========================================="
echo ""
echo "如果admin.html无法访问，请按以下步骤操作："
echo ""
echo "1. 确保文件已推送到GitHub:"
echo "   git push origin main"
echo ""
echo "2. 在Zeabur控制台中："
echo "   - 进入您的项目"
echo "   - 点击 'Redeploy' 或 '重新部署'"
echo "   - 等待部署完成（约3-5分钟）"
echo ""
echo "3. 检查部署日志："
echo "   - 在Zeabur控制台查看 'Logs' 标签页"
echo "   - 查找以下信息："
echo "     🔍 开始检测前端文件路径..."
echo "     ✅ 找到前端文件路径"
echo "     📂 配置静态文件服务"
echo ""
echo "4. 清除浏览器缓存："
echo "   - 按 Cmd+Shift+Delete (Mac) 或 Ctrl+Shift+Delete (Windows)"
echo "   - 选择 '缓存的图像和文件'"
echo "   - 点击 '清除数据'"
echo "   - 然后按 Cmd+Shift+R 强制刷新"
echo ""
echo "5. 验证访问："
echo "   - 访问: https://aipigeonai.zeabur.app/admin.html"
echo "   - 应该看到登录页面，标题为 '智鸽｜PigeonAI——智能管理系统'"
echo ""
echo "=========================================="
echo "✅ 诊断完成"
echo "=========================================="















