自从我最初接触高级 TypeScript 以来，我就爱上了一个特别的模式。它构成了我最早的 TypeScript 技巧之一的基础，从那以后一直对我极其有用。

我称它为 **IIMT**（与 'limped' 押韵）:**Immediately Indexed Mapped Type**（立即索引映射类型）。

它是这个样子的：

```typescript
type SomeObject = {
  a: string;
  b: number;
};

/**
 * | {
 *   key: 'a';
 * }
 * | {
 *   key: 'b';
 * }
 */
export type Example = {
  [K in keyof SomeObject]: {
    key: K;
  };
}[keyof SomeObject];
```

在讨论发生了什么之前，我们先看看结构。我们首先创建一个映射类型：

```typescript
/**
 * {
 *   a: {
 *     key: 'a';
 *   },
 *   b: {
 *     key: 'b';
 *   }
 * }
 */
export type Example = {
  [K in keyof SomeObject]: {
    key: K;
  };
};
```

这个映射类型遍历 `SomeObject` 的键，并为每个键创建一个新的对象类型。在这个例子中，我们创建的新对象类型只有一个属性 `key`，它的值就是对象的键。

然后我们立即用 `keyof SomeObject`（即 `a | b`）对这个映射类型进行索引。这意味着最终类型是映射类型所有*值*的联合。

```typescript
/**
 * | {
 *   key: 'a';
 * }
 * | {
 *   key: 'b';
 * }
 */
export type Example = {
  [K in keyof SomeObject]: {
    key: K;
  };
}[keyof SomeObject];
```

就是这样——我们先创建映射类型，然后立即对它索引：这就是一个 IIMT。

## 遍历联合类型

IIMT 为我们提供了一个非常清晰的模型，用来遍历联合类型的成员，同时*还*保留整个联合类型的上下文。假设我们想基于一个字符串联合类型创建一个可辨识联合（discriminated union):

```typescript
type Fruit = 'apple' | 'banana' | 'orange';

/**
 * | {
 *   thisFruit: 'apple';
 *   allFruit: 'apple' | 'banana' | 'orange';
 * }
 * | {
 *   thisFruit: 'banana';
 *   allFruit: 'apple' | 'banana' | 'orange';
 * }
 * | {
 *   thisFruit: 'orange';
 *   allFruit: 'apple' | 'banana' | 'orange';
 * }
 */
export type FruitInfo = {
  [F in Fruit]: {
    thisFruit: F;
    allFruit: Fruit;
  };
}[Fruit];
```

可以看到，最终类型是三个对象的联合，每个对象都有一个 `thisFruit` 属性和一个 `allFruit` 属性。`thisFruit` 属性是联合中的*特定*成员，而 `allFruit` 属性是*整个*联合。

这让我们能在 `F` 定义的作用域内做非常聪明的事情。如果我们想捕获*其他*水果呢？

```typescript
/**
 * | {
 *   thisFruit: 'apple';
 *   allFruit: 'banana' | 'orange';
 * }
 * | {
 *   thisFruit: 'banana';
 *   allFruit: 'apple' | 'orange';
 * }
 * | {
 *   thisFruit: 'orange';
 *   allFruit: 'apple' | 'banana';
 * }
 */
export type FruitInfo = {
  [F in Fruit]: {
    thisFruit: F;
    allFruit: Exclude<Fruit, F>;
  };
}[Fruit];
```

因为 `F` 和 `Fruit` 在同一个闭包中都可用，我们可以用 `Exclude` 把当前水果从联合中移除。非常漂亮——而且一旦你习惯了 IIMT 的结构，读起来也很清晰。

## 转换对象联合类型

IIMT 也适用于转换对象联合类型。假设我们有一个对象联合，想给每个对象修改一个属性：

```typescript
type Event =
  | {
      type: 'click';
      x: number;
      y: number;
    }
  | {
      type: 'hover';
      element: HTMLElement;
    };
```

这看起来似乎不符合我们的 IIMT 模型。如果我们试着用 `Event` 创建一个映射类型，会得到一个错误：

```typescript
type Example = {
  // 类型 'Event' 不能赋值给
  // 类型 'string | number | symbol'。
  [E in Event]: {};
};
```

这是因为我们无法从一个不是键的东西创建映射类型。但幸运的是，我们可以在映射类型内部使用 `as` 来让它工作：

```typescript
/**
 * PrefixType 接收一个带有 'type' 属性的对象,
 * 并给 type 加上 'PREFIX_' 前缀。
 */
type PrefixType<E extends { type: string }> = {
  type: `PREFIX_${E['type']}`;
} & Omit<E, 'type'>;

/**
 * | {
 *   type: 'PREFIX_click';
 *   x: number;
 *   y: number;
 * }
 * | {
 *   type: 'PREFIX_hover';
 *   element: HTMLElement;
 * }
 */
type Example = {
  [E in Event as E['type']]: PrefixType<E>;
}[Event['type']];
```

这里，我们插入 `as E['type']` 来把键重映射到我们想要的类型。然后用 `PrefixType` 给每个对象的 `type` 属性加上前缀。

最后，我们用 `Event['type']`（即 `click | hover`）立即对映射类型索引——于是我们最终得到一个加前缀后的对象联合。

## 示例

让我们看几个例子来收尾：

### CSS 单位对象

```typescript
type CSSUnits = 'px' | 'em' | 'rem' | 'vw' | 'vh';

/**
 * | {
 *   length: number;
 *   unit: 'px';
 * }
 * | {
 *   length: number;
 *   unit: 'em';
 * }
 * | {
 *   length: number;
 *   unit: 'rem';
 * }
 * | {
 *   length: number;
 *   unit: 'vw';
 * }
 * | {
 *   length: number;
 *   unit: 'vh';
 * }
 */
export type CSSLength = {
  [U in CSSUnits]: {
    length: number;
    unit: U;
  };
}[CSSUnits];
```

### HTTP 响应码

```typescript
type SuccessResponseCode = 200;

type ErrorResponseCode = 400 | 500;

type ResponseCode = SuccessResponseCode | ErrorResponseCode;

/**
 * | {
 *   code: 200;
 *   body: {
 *     success: true;
 *   };
 * }
 * | {
 *   code: 400;
 *   body: {
 *     success: false;
 *     error: string;
 *   };
 * }
 * | {
 *   code: 500;
 *   body: {
 *     success: false;
 *     error: string;
 *   };
 * }
 */
type ResponseShape = {
  [C in ResponseCode]: {
    code: C;
    body: C extends SuccessResponseCode
      ? { success: true }
      : { success: false; error: string };
  };
}[ResponseCode];
```
