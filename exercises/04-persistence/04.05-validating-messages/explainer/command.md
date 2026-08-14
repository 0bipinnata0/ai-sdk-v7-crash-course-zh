把下面的内容复制粘贴到你的终端中来测试 API!

## 无效消息

```bash
curl -X POST http://localhost:3000/api/chat   -H "Content-Type: application/json"   -d '{
  "messages": [
    {
      "id": "invalid-message",
      "role": "user"
    }
  ]
}'
```

## 有效消息

```bash
curl -X POST http://localhost:3000/api/chat   -H "Content-Type: application/json"   -d '{
  "messages": [
    {
      "id": "valid-message",
      "role": "user",
      "parts": [
        {
          "type": "text",
          "text": "法国的首都是哪里?"
        }
      ]
    }
  ]
}'
```
