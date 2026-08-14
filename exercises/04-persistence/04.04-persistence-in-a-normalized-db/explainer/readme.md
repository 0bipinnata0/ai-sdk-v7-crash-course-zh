到目前为止，我们一直在用一种相当朴素的方式持久化数据——把它保存到 JSON 文件再读回来。这不是真实应用处理数据持久化的方式。让我们探索一种更接近生产环境的做法。

## 作为 JSON blob 的 `parts`

在我们的 `main.ts` 文件中，有一个类型为 `MyUIMessage` 的消息。它代表应用的一个切片，可能包含工具调用和自定义数据部件。每条消息都有一个 `id`、一个 `role` 和一个 `parts` 数组。

虽然 `id` 和 `role` 在数据库中很容易表示，但 `parts` 数组更复杂，因为它包含具有不同属性的不同类型元素。

```typescript
const message: MyUIMessage = {
  id: '123',
  role: 'user',
  parts: [
    {
      type: 'text',
      text: '你好!',
    },
    {
      type: 'reasoning',
      text: '我正在思考...',
    },
    {
      type: 'tool-getWeatherInformation',
      state: 'output-available',
      toolCallId: '123',
      input: {
        city: 'London',
      },
      output: {
        city: 'London',
        weather: 'sunny',
      },
    },
  ],
};
```

你可能会想把这些 parts 作为 JSON blob 存进 Postgres 数据库。然而，这种做法有明显的缺点：

1. JSON blob 不受 Postgres 管理——它只是字面数据
2. 结构随时间推移没有保证，迁移会很困难
3. 过滤或只显示特定部件时效率低下

## 作为规范化表的 `parts`

作为替代，我们将为 parts 使用一张单独的表。在 `schema.ts` 中，有一个用 [Drizzle ORM](https://orm.drizzle.team/) 编写的示例 schema，它能帮助设计和查询数据库表。

```typescript
export const chats = pgTable('chats', {
  id: varchar()
    .primaryKey()
    .$defaultFn(() => generateId()),
});

export const messages = pgTable(
  'messages',
  {
    id: varchar()
      .primaryKey()
      .$defaultFn(() => generateId()),
    chatId: varchar()
      .references(() => chats.id, { onDelete: 'cascade' })
      .notNull(),
    createdAt: timestamp().defaultNow().notNull(),
    role: varchar().$type<MyUIMessage['role']>().notNull(),
  },
  // 为简洁起见省略了索引
);
```

对于 parts，我们创建了一张专门的表，为每种类型的部件准备了字段。这张表使用 SQL 约束来确保每种部件类型都有正确的字段：

```typescript
export const parts = pgTable(
  'parts',
  {
    id: varchar()
      .primaryKey()
      .$defaultFn(() => generateId()),
    messageId: varchar()
      .references(() => messages.id, { onDelete: 'cascade' })
      .notNull(),
    type: varchar().$type<MyUIMessagePart['type']>().notNull(),
    createdAt: timestamp().defaultNow().notNull(),
    order: integer().notNull().default(0),

    // 文本字段
    text_text: text(),

    // 推理字段
    reasoning_text: text(),

    // 更多不同部件类型的字段...
  },
  (t) => [
    // 每种部件类型的检查约束
    check(
      'text_text_required_if_type_is_text',
      sql`CASE WHEN ${t.type} = 'text' THEN ${t.text_text} IS NOT NULL ELSE TRUE END`,
    ),
    // 更多约束...
  ],
);
```

这些约束确保了，比如，当一个部件的类型是 `text` 时，`text_text` 字段必须存在。每种部件类型都有自己的约束来强制数据完整性。

## UI 表示与数据库表示之间的映射

当我们用原始消息运行映射函数时，我们得到一个与 UI 部件看起来很不一样的数据库部件数组：

```typescript
const dbMessageParts = mapUIMessagePartsToDBParts(
  message.parts,
  message.id,
);

console.dir(dbMessageParts, { depth: null });
```

例如，一个 `type: 'text'` 且 `text: 'Hello!'` 的 UI 部件，会变成 `type: 'text'` 且 `text_text: 'Hello!'` 的数据库部件。其他部件类型会有自己的字段。

这种方式需要映射函数来在 UI 表示和数据库表示之间转换。`mapUIMessagePartsToDBParts` 函数使用 switch case 来处理每种类型：

```typescript
export const mapUIMessagePartsToDBParts = (
  messageParts: MyUIMessagePart[],
  messageId: string,
): MyDBUIMessagePart[] => {
  return messageParts.map((part, index) => {
    switch (part.type) {
      case 'text':
        return {
          messageId,
          order: index,
          type: part.type,
          text_text: part.text,
        };
      // 其他部件类型的 case...
    }
  });
};
```

类似地，`mapDBPartToUIMessagePart` 函数把数据库部件转换回 UI 部件。

这种结构化的方式让我们有信心确保消息部件保持正确的结构。虽然对于复杂的嵌套数据（比如工具的输入/输出）仍然存在一些 JSON 字段，但整体 schema 要健壮得多，也更容易理解。

试着在 message 对象中试验不同的部件，看看它们在数据库中是如何表示的。你可以查看 `schema.ts` 文件，并使用 AI 来帮助回答关于实现的问题。

展示的代码基于 [Vercel AI SDK 文档](https://github.com/vercel-labs/ai-sdk-persistence-db)中的一个参考示例，它提供了这种方式的完整可用实现。

## 完成步骤

- [ ] 检查 [`main.ts`](./main.ts) 中 `message` 对象的结构，理解消息的 UI 表示
  - 查看不同的部件类型及其属性
  - 注意每种部件类型如何有自己特定的结构

- [ ] 研究 [`schema.ts`](./schema.ts) 中的数据库 schema，看看消息和部件是如何表示的
  - 注意 chats、messages 和 parts 之间的表关系
  - 留意为每种部件类型强制数据完整性的约束

- [ ] 查看 [`mapping.ts`](./mapping.ts) 中在 UI 和 DB 表示之间转换的映射函数
  - 理解 `mapUIMessagePartsToDBParts` 如何把 UI 部件转换为 DB 部件
  - 看看 `mapDBPartToUIMessagePart` 如何把 DB 部件转换回 UI 部件

- [ ] 通过修改 [`main.ts`](./main.ts) 中的 `message` 对象来做实验
  - 添加或修改不同类型的部件
  - 用 `pnpm run exercise` 运行代码，看看它们在数据库中如何表示

- [ ] 思考这种方式与把部件存为 JSON blob 的权衡
  - 想想数据完整性、查询效率和迁移复杂度
  - 反思每种方式在什么场景下更合适
