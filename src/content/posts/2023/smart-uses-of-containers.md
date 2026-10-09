---
title: 容器的妙用
permalink: "/posts/smart-uses-of-containers/index.html"
date: 2023-05-29
description: 透過容器來解釋 Functor、Monad，以及它能發揮什麼作用
tags:
  - Typescript
  - Functional-Programming
  - fp-ts
heroImage: https://images.unsplash.com/photo-1607437817193-3b3b029b5b75?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2670&q=80
---
![hero image](https://images.unsplash.com/photo-1607437817193-3b3b029b5b75?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2670&q=80)

學習 Functional Programming 時，你是否總是對 **Functor**、**Monad** 這兩個詞產生困惑，你不是第一個也不會是最後一個，這確實是大部分人學習 FP 的一道檻，但是如果從數學角度切入對我們一般人而言實在是太痛苦了，所以本篇從最簡單的容器帶你走過整個演變過程，並且去識別開發中最讓人頭痛的部份，以及一個特殊容器如何解決這些問題。

## 容器

在識別一個 Functor / Monad 之前，首先我們來談一個最單純的容器型別，這裡我們叫他 `Container`

```ts
type Container<T> = { value: T }
```

### of

這個容器包裹著一個值，這個值是什麼取決於用的人，但既然是容器我們肯定還需要有一個把他**放進去**的動作，不然其實沒什麼用，所以我們會有一個 `of` 方法：

```ts
function of<T>(value: T): Container<T> {
  return {
    value: value
  }
}
```

### map

一切看起來很美好，但我們會遇到一個問題，如果我有一個 function 只**接受一個純值也回傳一個純值**，我遇到 `Container<T>` 我該怎麼辦 ?

```ts
const containerX: Container<number> = of(1);

const increase = (x: number) => x + 1

increase(containerX) // 被包裹住無法計算 
```

我必須得把值從容器內拿出來做計算，並且因為他原本就在容器內所以我們還要把他放回去

```ts
const containerX: Container<number> = of(1);

const increase = (x: number) => x + 1;

const value = containerX.value; // 拿出來

const result = increase(value); // 執行函式

const containerY = of(result); // 裝回去
```

或者修改你的 function

```ts
const containerX: Container<number> = of(1);

// 被迫更改為容器版本
const increase = (containerX: Container<number>): Container<number> => {
  return of(containerX.value + 1);
}

const result = increase(containerX)
```

好了我們解決了因為在容器內無法計算的問題，但你會發現你一直在做這重複又無聊的動作，甚至他把你原本純淨無暇的 code 搞的髒髒的，這當然不能忍！程式必須維持優雅！

我們剛剛說這是一個 **拿出來 → 計算 → 放回去** 的重複的動作，那我們就可以把他做成一個通用的 function 叫做 `map`

```ts
function map<T, U>(container: Container<T>, fn: (a: T) => U): Container<U> {
    return of(fn(container.value));
}
```

現在你可以把他寫成這樣

```ts
const containerX: Container<number> = of(1);

const increase = (x: number) => x + 1;

const result = map(containerX, increase);
```

好，到目前為止我們有了三樣東西，`Container`, `of`, `map` ，這三樣東西的組成我們可以將他粗略的視為 **Functor**。

為什麼說是粗略呢？因為還有一些的條件要達成

* Identity : `map(fa, a ⇒ a) = fa`

  ```ts
  const fa: Container<number> = of(1);
  
  const id = (v) => v; 
  
  // 兩個動作的結果皆相等
  map(fa, id) // Container<1>
  id(fa) // Container<1>
  ```

* Composition：`map(fa, (a) ⇒ g(h(a))) = map(map(fa, h), g)`

  ```ts
  const fa: Container<number> = of(1);
  
  // h
  const double = (v) => v * 2;
  
  // g
  const square = (v) => v * v; 
  
  // 兩個動作的結果皆相等
  map(fa, (a) => square(double(a))) // Container<4>
  map(map(fa, double), square) // Container<4>
  ```

相關連結

* [Functor - HaskellWiki](https://wiki.haskell.org/Functor)

* [Functor.ts | fp-ts (](https://gcanti.github.io/fp-ts/modules/Functor.ts.html)[gcanti.github.io](https://gcanti.github.io)[)](https://gcanti.github.io/fp-ts/modules/Functor.ts.html)

* [Functor (functional programming) - Wikipedia](https://en.wikipedia.org/wiki/Functor\_\\(functional_programming\\))

### flatMap

現在 map 處理了一般 function 無法對容器做計算的問題，但另一個問題來了，如果我的function 是接收一個值返回一個容器呢？

```ts
const double = (x: number): Container<number> => of(x * 2) 
```

我們嘗試用 map 執行看看，你會發現你會得到一個多疊一層容器的結果 `Container<Container<number>>`

```ts
const containerX = of(1)

// Container<Container<number>>
const result = map(containerX, double)
```

如果你又想做第二次 `double`，你不僅要多套一層 `map` 上去，而且結果變成三層的容器！如果想做更多次就會越套愈多，最後就是無止盡的套層。

```ts
const containerX = of(1)

// Container<Container<number>>
const result = map(containerX, double)

// Container<Container<Container<number>>>
const result2 = map(result1, (c) => map(c, double));
```

現在我們的程式又被這套層弄的亂糟糟的，那我們要優雅的繼續 `map` 下去我們該怎麼做？

那就是在 map 結束後把他解開永遠維持一層，所以我們製作一個叫 `flatten` 的 function 幫我們做這件事

```ts
function flatten<T>(container: Container<Container<T>>): Container<T> {
  return container.value;
}
```

現在你可以

```ts
const containerX = of(1)

// Container<Container<number>>
const result = map(containerX, double)

// Container<number>
const result2 = flatten(result)

// Container<Container<number>>
const result3 = map(result2, double);

// Container<number>
const result4 = flatten(result3)
```

似乎乾淨許多，但好像還不夠，每次都要自己解開實在是太繁瑣了，不如我們把 `flatten` 跟 `map` 組合在一起叫做 `flatMap`

```ts
function flatMap<T, U>(container: Container<T>, fn: (a: T) => Container<U>): Container<U> {
  return flatten(map(container, fn));
}
```

現在你只要遇到 function 是**傳入一個值返回一個容器**，你就可以使用 `flatMap` 操作。

我們除了 `Container`, `of`, `map`，現在又多了一個函式叫 `flatMap`

所以我們可以將 `Container`, `of`, `flatMap` 三樣東西的組合粗略的視為 **Monad**

等等，為什麼是三個？ map 去哪了？為什麼又是粗略呢？

#### map 去哪了？

因為 `flatMap` 由 `map` 構成，其實可以不用特別寫出來，因為由於有 `map` 關係，所以今天一個 Monad 會同時擁有 Functor 特性

#### 為什麼又是粗略呢？

除了 Functor 嚴格上還有一些條件要達成，Monad 也有，你可以 follow Haskell 的 Monad laws

* Left identity：`flatMap(of(a), f) = f(a)`

  ```ts
  const fn = (x: number) => of(x * 2);
  
  // 兩個動作的結果皆相等
  flatMap(of(1), fn) // Container<2>
  fn(1) // Container<2>
  ```

* Right identity：`flatMap(fa, of) = fa`

  ```ts
  const fa: Container<number> = of(1);
  
  // 兩個動作的結果皆相等
  flatMap(fa, of) // Container<1>
  fa // Container<1>
  ```

* Associativity：`flatMap(flatMap(fa, g), h) = flatMap(fa, (a) ⇒ flatMap(g(a), h))`

  ```ts
  // g
  const double = (x: number) => of(x * 2)
  
  // h
  const square = (x: number) => of(x * x)
  
  const fa = of(1);
  
  // 兩個動作的結果皆相等
  flatMap(flatMap(fa, double), square)
  flatMap(fa, (a) => flatMap(double(a), square))
  ```

相關連結

* <https://wiki.haskell.org/Monad_laws>

* <https://en.wikipedia.org/wiki/Monad_(functional_programming)>

* <https://gcanti.github.io/fp-ts/modules/Monad.ts.html>

---

## 是什麼真正讓你的程式變髒

在 FP 的理想中，我們希望所有事情都是正確無負擔跑完所有流程，那當一個程式是完全 pure 的時候就能達成這個理想，並且你的程式也會乾乾淨淨的（除非連 pure function 都的寫亂七八糟 🤡），但是一個完全 pure 的程式其實沒什麼作用，你必須跟外界溝通，跟外界溝通就會有**溝通不良**的問題（現實也是如此）。

溝通不良會有什麼問題，不是**沒值**就是**錯誤**這兩種，這時你就必須將這些狀況寫在你潔淨無暇的程式裡，這裡判斷一下空值，那裡處理一下錯誤，不知不覺你的程式變得越來越糟糕，你也越來越看不懂你的程式。

### 容器？

回到一開始提到的容器，它有用嘛？我很直接的告訴你它沒什麼用，但是今天我們製作一種特殊用途的容器它就會變得有意義，所有容器都會固定有個 **拿出來 → 計算 → 放回去** 的動作，所以一個容器的可以在 **拿出來 → 計算 → 放回去** 的過程中根據它的用途做不同的特殊操作。

## 空值處裡

回想一下我們在 function 中處理空值都怎麼處理，要嘛判斷完再丟進來，要嘛直接改寫function 讓它判斷空值：

判斷完再丟進去

```ts
const value: number | undefined = undefined;

const double = (x: number) => x * 2;

if(value !== undefined){
  const result = double(value);

  // ...
}

//...

```

直接改寫 function

```ts
const value: number | undefined = undefined;

const double = (x: number | undefined) => {
  return x !== undefined ? x * 2 : undefined
};

const result = double(value)

// ...
```

你發現不管哪一種都避免不了這不是很優雅的判斷式，某種程度上也造成了閱讀上的困難（你可能也是？），那有沒有什麼招能讓這東西變得好看一點 ?

### Option / Maybe

Option 跟 Maybe 在表示一個**可能有可能無**的容器，通常我們都是有值的時候 function 才有執行的意義，沒值會維持原樣提早離開，而 **Option / Maybe** 就是在 **拿出來 → 計算 → 放回去** 的途中做這些判別

以下是一個簡易 Option 實做

```ts
type Some<T> = { _tag: 'some'; value: T };
type None<T> = { _tag: 'none' };
type Option<T> = Some<T> | None<T>;

function none<T>(): None<T> {
  return {
    _tag: 'none',
  };
}

function of<T>(value: T): Option<T> {
  return {
    _tag: 'some',
    value,
  };
}

function map<T, U>(option: Option<T>, fn: (v: T) => U): Option<U> {
  if (option._tag === 'some') {
    return of(fn(option.value));
  }

  return option;
}

function flatten<T>(option: Option<Option<T>>): Option<T> {
  if (option._tag === 'some') {
    return option.value;
  }
  return option;
}

function flatMap<T, U>(option: Option<T>, fn: (v: T) => Option<U>): Option<U> {
  if (option._tag === 'some') {
    return flatten(map(option, fn));
  }

  return option;
}
```

 你可比較優雅的做完你要的操作

```ts
const value: Option<number> = of(2);

const double = (x: number) => x * 2;

const result = map(value, double);

// ...
```

甚至串接多個操作也不必理會容器裡有沒有值

```ts
const value: Option<number> = of(2);

const double = (x: number) => x * 2;

const square = (x: number) => x * x;

const evenNumber = (x: number) => x % 2 === 0 ? of(x) : none() 

const result = map(value, double);

const result2 = map(result, square);

const result3 = flatMap(result2, evenNumber);

// ...
```

## 錯誤處理

除了空值我們還有錯誤處裡，我們平常都會用 `try catch` 來處理錯誤

```ts
const divide = (a: number, b: number) => {
  if (b === 0) {
    throw new Error('Cannot divide by zero');
  }
  return a / b;
};

function fn(){

  try {
    const result = divide(10, 0);
    // ... 
  } catch(e) {
    console.log(e);
    // ...
  }
}

```

那這方法有什麼問題嘛？

沒問題，他是對的，但他有兩個缺點

* 你怎麼知道什麼時候要 `try catch` 什麼時候不用，今天我們用 `try catch` 是建立在我們知道我所使用的 function 會丟出錯誤，那每個人都必須到每個 function 原始碼看看到底有沒有機會丟出錯誤，並且 typescript 也不會在你使用的時候告訴你這件事。

* 這種方法也使我們的 code 變得髒亂，造成閱讀上的困難，typescript 也不會告訴你錯誤的形式到底是什麼，你只能一個一個對照。

### Either

Either 用於表示**可能對也可能錯**的一種容器，對就是 Right 錯就是 Left，但他的運作方式跟Option / Maybe 相似，只是多了個用於表示錯誤的型別，但在型別處理上要複雜許多。

以下是簡易 Either 實作

```ts
type Right<T> = { _tag: 'right'; value: T };
type Left<T> = { _tag: 'left'; error: T };
type Either<E, T> = Right<T> | Left<E>;

function left<T>(error: T): Left<T> {
  return {
    _tag: 'left',
    error,
  };
}

function of<T>(value: T): Right<T> {
  return {
    _tag: 'right',
    value,
  };
}

function map<E, T, U>(either: Either<E, T>, fn: (a: T) => U): Either<E, U> {
  if (either._tag === 'right') {
    return of(fn(either.value));
  }
  return either;
}

function flatten<E, E2, T>(either: Either<E, Either<E2, T>>): Either<E | E2, T> {
  if (either._tag === 'right') {
    return either.value;
  }
  return either;
}

function flatMap<E, T, E2, U>(
  either: Either<E, T>,
  fn: (a: T) => Either<E2, U>
): Either<E | E2, U> {
  if (either._tag === 'right') {
    return flatten(map(either, fn));
  }

  return either;
}
```

那 Either 如何解決了上述問題？

* 明確表明了這是一個有可能會出錯的結果，迫使開發者去處裡。

* 不會過度破壞主流程，使閱讀上更容易，並且明確表示錯誤型別是什麼

```ts
const divide = (a: number, b: number): Either<string, number> => {
  if (b === 0) {
    return left('Cannot divide by zero');
  }
  return of(a / b);
};

function fn(){

  // 可以從 result 中得知這是個可能錯誤的結果，並且明確表明錯誤型別
  const result: Either<string, number> = divide(10, 0);

  // 減少對主流程的破壞，使閱讀更加容易
  const result2 = map(result, (x: number) => x * 2)
}
```

---

經過上述解說我們可以得知幾件事

* 單純的容器本身沒什麼用處，但透過設計一個特殊容器能解決平時開發上繁瑣但你沒察覺的事。

* 一個特定用途的容器可以促使開發者意識到該結果可能發生的狀況，並且在適當的時機處理它。

* `map` 用於解決容器無法直接使用一般函式的問題。

* `flatMap` 解決了當 `map` 應用一個**接收值返回容器函式**結果所造成的容器疊層問題。

* 透過 `map` 跟 `flatMap`，可以降低因各種繁複的判斷式而影響程式主流程的複雜度。

### 更多不同種類的容器

除了 Option / Maybe、Either，還有許多不同用途的容器

* **Array / List**

  用於儲存一個有序列表

* **IO / Task**\
  處理與外界溝通的副作用（在 fp-ts IO 是指同步，Task 是指非同步）

* **Reader**\
  用於共享資訊讀取值的一個容器

* **Writer**\
  紀錄計算過程的細節

* **State**\
  管理共用資源

## 結論

透過容器的抽象化，我們將特定的共通問題與程式的主要流程進行隔離。這種方式不僅讓你能夠最大程度地維持原始的商業邏輯，避免被不相關的問題對程式邏輯造成干擾。我們只需在最適合的時機來處理這些問題即可。

Functional Programming 的核心精神在問題的**分解**和**組合**上。開發者需要學習如何有效地拆解問題，同時，FP 提供了讓問題組合更為靈巧的方法。這兩者是開發過程中不可或缺的元素。
