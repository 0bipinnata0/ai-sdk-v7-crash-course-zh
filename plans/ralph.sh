set -e

if [ -z "$1" ]; then
  echo "Usage: $0 <iterations>"
  exit 1
fi

for ((i=1; i<=$1; i++)); do
  echo "Iteration $i"
  echo "--------------------------------"
  result=$(claude --permission-mode acceptEdits -p "@plans/prd.json @progress.txt \
1. 找到优先级最高的特性,只处理那个特性。\
应该是由你决定优先级最高的那个——不一定是列表中的第一个。\
3. 用完成的工作更新 PRD。\
4. 将你的进度追加到 progress.txt 文件中。\
用这个给下一个在代码库中工作的人留个便条。\
5. 为该特性创建一个 git 提交。\
一次只处理一个特性。\
如果在实现特性时,你注意到 PRD 已完成,输出 <promise>COMPLETE</promise>。\
")

  echo "$result"

  if [[ "$result" == *"<promise>COMPLETE</promise>"* ]]; then
    echo "PRD complete, exiting."
    tt notify "CVM PRD complete after $i iterations"
    exit 0
  fi
done
