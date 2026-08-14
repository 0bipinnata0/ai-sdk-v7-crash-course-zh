<thinking>
为了让初学者理解这段代码，最合适的讲解顺序是：

1. 先解释 `EventMap` 是什么：一个“事件名到事件参数对象”的映射表。
2. 再解释 `keyof EventMap`：得到所有事件名组成的联合类型。
3. 解释映射类型 `[K in keyof EventMap]`：遍历每个事件名并生成新对象。
4. 解释交叉类型 `&`：把 `{ type: K }` 和对应事件参数合并。
5. 解释 `Prettify<T>`：让合并后的类型显示得更清晰。
6. 解释最后的索引 `[keyof EventMap]`：把对象类型的所有 value 取出来，形成联合类型。
7. 最后说明这段代码最终生成的是一个“可辨识联合类型”，适合用 `type` 字段区分不同事件。
</thinking>

# 这段 TypeScript 代码在做什么？

这段代码的目标是：

> 根据一个事件映射表 `EventMap`，自动生成一个事件对象的联合类型。

最终生成的类型大概长这样：

```ts
type EventAsDiscriminatedUnion =
  | {
      type: "login";
      username: string;
      password: string;
    }
  | {
      type: "logout";
    }
  | {
      type: "updateUsername";
      newUsername: string;
    };
```

也就是说，它把这种结构：

```ts
type EventMap = {
  login: {
    username: string;
    password: string;
  };
  logout: {};
  updateUsername: {
    newUsername: string;
  };
};
```

转换成了一个可辨识联合类型。

---

# 先看 `EventMap`

```ts
type EventMap = {
  login: {
    username: string;
    password: string;
  };
  logout: {};
  updateUsername: {
    newUsername: string;
  };
};
```

可以把 `EventMap` 理解成一个配置表。

它描述了不同事件需要携带哪些数据：

| 事件名 | 事件数据 |
|---|---|
| `login` | `{ username: string; password: string }` |
| `logout` | `{}` |
| `updateUsername` | `{ newUsername: string }` |

所以：

```ts
EventMap["login"]
```

得到的是：

```ts
{
  username: string;
  password: string;
}
```

而：

```ts
EventMap["updateUsername"]
```

得到的是：

```ts
{
  newUsername: string;
}
```

---

# `keyof EventMap` 是什么？

```ts
keyof EventMap
```

会拿到 `EventMap` 的所有 key。

所以这里：

```ts
keyof EventMap
```

等价于：

```ts
"login" | "logout" | "updateUsername"
```

这是一个字符串字面量联合类型。

也就是说，`keyof EventMap` 表示：

> `EventMap` 里所有事件名的集合。

---

# `Prettify<T>` 是干什么的？

代码里有这样一个工具类型：

```ts
type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};
```

它的作用主要是让类型显示得更好看。

比如有时候 TypeScript 会显示这种类型：

```ts
{
  type: "login";
} & {
  username: string;
  password: string;
}
```

这其实表示两个对象类型合并。

但阅读起来不够直观。

用了 `Prettify` 之后，TypeScript 通常会把它展开显示成：

```ts
{
  type: "login";
  username: string;
  password: string;
}
```

所以 `Prettify<T>` 不主要改变类型本身的含义，它更多是为了改善编辑器里的显示效果。

---

# 核心代码拆解

核心代码是这一段：

```ts
export type EventAsDiscriminatedUnion = {
  [K in keyof EventMap]: Prettify<
    {
      type: K;
    } & EventMap[K]
  >;
}[keyof EventMap];
```

我们可以分成两步理解：

1. 先生成一个新的对象类型。
2. 再从这个对象类型中取出所有 value，组成联合类型。

---

# 第一步：映射类型

先忽略最后这一段：

```ts
[keyof EventMap]
```

只看前面：

```ts
{
  [K in keyof EventMap]: Prettify<
    {
      type: K;
    } & EventMap[K]
  >;
}
```

这里的：

```ts
[K in keyof EventMap]
```

表示：

> 遍历 `EventMap` 的每一个 key。

也就是依次遍历：

```ts
"login"
"logout"
"updateUsername"
```

所以 `K` 会分别代表这三个字符串字面量类型。

---

# 当 `K` 是 `"login"` 时

这一段：

```ts
Prettify<
  {
    type: K;
  } & EventMap[K]
>
```

就会变成：

```ts
Prettify<
  {
    type: "login";
  } & EventMap["login"]
>
```

而：

```ts
EventMap["login"]
```

是：

```ts
{
  username: string;
  password: string;
}
```

所以合起来就是：

```ts
Prettify<
  {
    type: "login";
  } & {
    username: string;
    password: string;
  }
>
```

经过 `Prettify` 展开后，大概就是：

```ts
{
  type: "login";
  username: string;
  password: string;
}
```

---

# 当 `K` 是 `"logout"` 时

同理：

```ts
Prettify<
  {
    type: "logout";
  } & EventMap["logout"]
>
```

而：

```ts
EventMap["logout"]
```

是：

```ts
{}
```

所以结果是：

```ts
{
  type: "logout";
}
```

---

# 当 `K` 是 `"updateUsername"` 时

这一轮会得到：

```ts
Prettify<
  {
    type: "updateUsername";
  } & EventMap["updateUsername"]
>
```

也就是：

```ts
Prettify<
  {
    type: "updateUsername";
  } & {
    newUsername: string;
  }
>
```

展开后是：

```ts
{
  type: "updateUsername";
  newUsername: string;
}
```

---

# 中间结果是什么？

所以这段映射类型：

```ts
{
  [K in keyof EventMap]: Prettify<
    {
      type: K;
    } & EventMap[K]
  >;
}
```

会生成一个新的对象类型：

```ts
{
  login: {
    type: "login";
    username: string;
    password: string;
  };

  logout: {
    type: "logout";
  };

  updateUsername: {
    type: "updateUsername";
    newUsername: string;
  };
}
```

注意，到这一步为止，它还不是联合类型。

它只是一个对象类型。

---

# 第二步：立即索引

最后代码后面有这一段：

```ts
[keyof EventMap]
```

完整形式是：

```ts
{
  [K in keyof EventMap]: Prettify<
    {
      type: K;
    } & EventMap[K]
  >;
}[keyof EventMap]
```

这一步的意思是：

> 从刚才生成的对象类型中，取出所有 key 对应的 value。

因为：

```ts
keyof EventMap
```

等于：

```ts
"login" | "logout" | "updateUsername"
```

所以这相当于：

```ts
{
  login: {
    type: "login";
    username: string;
    password: string;
  };

  logout: {
    type: "logout";
  };

  updateUsername: {
    type: "updateUsername";
    newUsername: string;
  };
}["login" | "logout" | "updateUsername"]
```

在 TypeScript 中，如果你用联合类型去索引对象类型，会得到所有对应属性值的联合类型。

也就是：

```ts
{
  type: "login";
  username: string;
  password: string;
}
|
{
  type: "logout";
}
|
{
  type: "updateUsername";
  newUsername: string;
}
```

所以最终：

```ts
export type EventAsDiscriminatedUnion =
  | {
      type: "login";
      username: string;
      password: string;
    }
  | {
      type: "logout";
    }
  | {
      type: "updateUsername";
      newUsername: string;
    };
```

---

# 为什么叫“可辨识联合类型”？

这个最终类型有一个共同字段：

```ts
type
```

而且每一种事件的 `type` 值都不一样：

```ts
"type": "login"
"type": "logout"
"type": "updateUsername"
```

所以 TypeScript 可以根据 `type` 字段判断当前对象是哪一种事件。

例如：

```ts
function handleEvent(event: EventAsDiscriminatedUnion) {
  if (event.type === "login") {
    event.username;
    event.password;
  }

  if (event.type === "logout") {
    // logout 没有额外字段
  }

  if (event.type === "updateUsername") {
    event.newUsername;
  }
}
```

当你写：

```ts
if (event.type === "login")
```

TypeScript 就知道 `event` 一定是：

```ts
{
  type: "login";
  username: string;
  password: string;
}
```

所以你可以安全访问：

```ts
event.username
event.password
```

而在 `logout` 分支里，TypeScript 不会允许你访问：

```ts
event.username
```

因为 `logout` 事件没有这个字段。

---

# 这个写法的好处

这种写法最大的好处是：

> 你只需要维护 `EventMap`，联合类型会自动生成。

比如你新增一个事件：

```ts
type EventMap = {
  login: {
    username: string;
    password: string;
  };
  logout: {};
  updateUsername: {
    newUsername: string;
  };
  deleteAccount: {
    reason: string;
  };
};
```

那么 `EventAsDiscriminatedUnion` 会自动多出一种情况：

```ts
{
  type: "deleteAccount";
  reason: string;
}
```

不需要你手动去改联合类型。

---

# 简化版理解

这段代码：

```ts
export type EventAsDiscriminatedUnion = {
  [K in keyof EventMap]: Prettify<
    {
      type: K;
    } & EventMap[K]
  >;
}[keyof EventMap];
```

可以读成：

> 对 `EventMap` 的每个事件名 `K`，创建一个对象类型。  
> 这个对象类型包含 `type: K`，并且合并该事件对应的参数类型。  
> 最后把所有这些对象类型取出来，组成一个联合类型。

---

# 最终结果

最终的 `EventAsDiscriminatedUnion` 等价于：

```ts
export type EventAsDiscriminatedUnion =
  | {
      type: "login";
      username: string;
      password: string;
    }
  | {
      type: "logout";
    }
  | {
      type: "updateUsername";
      newUsername: string;
    };
```

它非常适合用于事件处理、消息处理、状态机、Redux action、WebSocket 消息等场景。