-- 自动推送代码到GitHub（AppleScript版本）
-- 双击运行此脚本

tell application "Terminal"
	activate
	set currentTab to do script "cd '/Users/macbookair/Desktop/智慧鸽系统备份文件/智鸽系统_副本'"
	
	-- 检查是否有未提交的文件
	do script "git status" in currentTab
	
	-- 添加所有文件
	do script "git add ." in currentTab
	
	-- 提交
	do script "git commit -m '准备部署：上传所有文件' || echo '没有新文件需要提交'" in currentTab
	
	-- 提示用户输入Token
	display dialog "准备推送到GitHub

需要输入GitHub Personal Access Token

如果没有Token，请：
1. 访问：https://github.com/settings/tokens
2. 创建新Token（勾选repo权限）
3. 复制Token

然后继续..." buttons {"取消", "继续"} default button "继续"
	
	-- 推送到GitHub
	do script "git push -u origin main" in currentTab
	
	display dialog "正在推送代码到GitHub...

请等待终端完成操作。

完成后，访问：
https://github.com/Ily-lly123/PigeonAI

确认代码已上传。" buttons {"好的"} default button "好的"
end tell

