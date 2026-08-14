set -e


claude --permission-mode acceptEdits "@plans/prd.json @progress.txt \
1. 找到优先级最高的特性,只处理那个特性。\
应该是由你决定优先级最高的那个——不一定是列表中的第一个。\
2. 运行 pnpm ai-hero-cli internal lint 检查是否有 lint 错误。\
2a. 使用 npx tsc --noEmit 检查是否有类型错误。\
会有类型错误,但很多是故意留下的——作为标记让学习者去发现和修复。\
3. 用完成的工作更新 PRD。\
4. 将你的进度追加到 progress.txt 文件中。\
用这个给下一个在代码库中工作的人留个便条。\
5. 为该特性创建一个 git 提交。\
一次只处理一个特性。\
如果在实现特性时,你注意到 PRD 已完成,输出 <promise>COMPLETE</promise>。\
"
