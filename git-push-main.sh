#!/usr/bin/env bash
# 一键推送到 GitHub main 分支的脚本（Mac 专用，无需手动输入终端命令）
# 使用方式：在 Finder 或桌面上双击运行（建议把它命名为 GitHubPush.command）
#
# 功能：
# 1. 自动根据脚本所在位置检测本地 Git 仓库路径
# 2. 通过图形对话框（AppleScript）输入提交信息和仓库信息
# 3. 支持个人访问令牌（PAT），可选集成到推送 URL 中
# 4. 推送到指定 GitHub 仓库的 main 分支
# 5. 图形/文本双重错误提示

set -euo pipefail

log() {
  echo "[GitPush] $*"
}

alert() {
  # 使用系统弹窗提示错误
  /usr/bin/osascript <<EOF
display dialog "$1" with title "Git 一键推送" buttons {"确定"} default button "确定"
EOF
}

######################################
# 1. 自动定位 Git 仓库根目录
######################################
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

if ! repo_root=$(git rev-parse --show-toplevel 2>/dev/null); then
  msg="当前脚本所在目录不在任何 Git 仓库中。\n\n请把脚本放到你的项目目录（或其子目录）再双击运行。"
  log "错误：$msg"
  alert "$msg"
  exit 1
fi

cd "$repo_root"
log "仓库根目录：$repo_root"

######################################
# 2. 通过 GUI 获取提交信息
######################################
commit_msg=$(/usr/bin/osascript <<EOF
set defaultMessage to "auto-commit " & do shell script "date '+%Y-%m-%d %H:%M:%S'"
set dialogResult to display dialog "请输入本次 Git 提交信息：" default answer defaultMessage with title "Git 一键推送" buttons {"确定", "取消"} default button "确定"
if button returned of dialogResult is "取消" then
  return ""
else
  return text returned of dialogResult
end if
EOF
)

if [[ -z "$commit_msg" ]]; then
  log "用户取消操作。"
  exit 0
fi

log "提交信息：$commit_msg"

######################################
# 3. 确认/设置远程仓库（origin）
######################################
remote_name="origin"
default_remote_url=""
if default_remote_url=$(git remote get-url origin 2>/dev/null || true); then
  :
else
  default_remote_url=""
fi

repo_info=$(/usr/bin/osascript <<EOF
set defaultSlug to ""
set hasOrigin to "$default_remote_url"
if hasOrigin is not "" then
  set defaultSlug to ""
end if

set promptText to "请输入目标 GitHub 仓库（格式：用户名/仓库名）。" & return & return & "如果你的仓库已经配置了 origin，可以直接点“确定”使用现有配置。" & return & "当前 origin: $default_remote_url"

set dialogResult to display dialog promptText default answer defaultSlug with title "GitHub 仓库设置" buttons {"确定", "取消"} default button "确定"
if button returned of dialogResult is "取消" then
  return ""
else
  return text returned of dialogResult
end if
EOF
)

if [[ -z "$repo_info" && -z "$default_remote_url" ]]; then
  msg="未配置 origin 且未指定 GitHub 仓库（用户名/仓库名），无法继续。"
  log "错误：$msg"
  alert "$msg"
  exit 1
fi

if [[ -n "$repo_info" ]]; then
  remote_url="https://github.com/${repo_info}.git"
  git remote remove "$remote_name" 2>/dev/null || true
  git remote add "$remote_name" "$remote_url"
  log "已将 origin 设置为：$remote_url"
else
  remote_url="$default_remote_url"
  log "使用已有 origin：$remote_url"
fi

######################################
# 4. 可选：获取 GitHub Personal Access Token
######################################
token="${GITHUB_TOKEN:-}"

if [[ -z "$token" ]]; then
  token=$(/usr/bin/osascript <<EOF
set promptText to "如需使用 Personal Access Token 进行推送验证，请在下方输入。\n\n如果留空，将使用系统已有的 Git 凭证（例如钥匙串记住的账号密码）。"
set dialogResult to display dialog promptText default answer "" with title "GitHub Token（可选）" buttons {"确定", "取消"} default button "确定" with hidden answer
if button returned of dialogResult is "取消" then
  return ""
else
  return text returned of dialogResult
end if
EOF
)
fi

if [[ -n "$token" ]]; then
  log "已获取 Token，将在本次推送中使用。"
else
  log "未提供 Token，将使用 Git 默认凭证。"
fi

######################################
# 5. 检查变更并提交
######################################
if git diff --quiet && git diff --cached --quiet; then
  msg="没有检测到新的变更（工作区和暂存区都是干净的），无需提交。"
  log "$msg"
  alert "$msg"
else
  log "执行：git add ."
  git add .

  if git commit -m "$commit_msg"; then
    msg="提交完成：$commit_msg"
    log "$msg"
  else
    msg="可能没有文件变更需要提交，或提交失败。"
    log "$msg"
    alert "$msg"
  fi
fi

######################################
# 6. 推送到 main 分支
######################################
branch="main"

push_target="$remote_name"
if [[ -n "$token" ]]; then
  if [[ "$remote_url" =~ ^https:// ]]; then
    push_target=$(echo "$remote_url" | sed -E "s#https://([^/]+)#https://$token@\1#")
  else
    msg="远程地址不是 HTTPS 格式，无法在 URL 中使用 Token。\n当前远程：$remote_url"
    log "错误：$msg"
    alert "$msg"
    exit 1
  fi
fi

log "开始推送到 $remote_name ($remote_url) 的分支：$branch"

if ! git push "$push_target" "$branch"; then
  msg="推送失败，请检查：\n- Token 是否有 repo 权限且未过期\n- 仓库地址是否正确：$remote_url\n- 分支名是否为 main\n- 本地分支是否已与远程 main 建立跟踪关系"
  log "错误：$msg"
  alert "$msg"
  exit 1
fi

msg="推送成功！\n仓库：$remote_url\n分支：$branch"
log "$msg"
alert "$msg"



