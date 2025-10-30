---
name: "Daigent"
description: "一个通用的 LLM Agent 桌面客户端"
author: "BHznJNs"
authorUrl: "https://github.com/BHznJNs"
tags: ["desktop", "LLM", "agent"]
---

## 技术栈

前端和后端的 Node.js Sidecar 统一使用 TypeScript 编写

### 前端部分

前端框架：React 19
样式：TailwindCSS
组件库：Shadcn-ui + Vercel AI Elements

### Node.js Sidecar

后端框架：fastify
数据库及 ORM：sqlite + drizzle
LLM API 请求：Vercel AI SDK

## 开发指南

### 上下文信息要求

- 在编码前至少分析 3 个现有实现或模式，识别可复用的接口与约束。
- 绘制依赖与集成点，确认输入输出协议、配置与环境需求。
- 弄清现有测试框架、命名约定和格式化规则，确保输出与代码库保持一致。

### 代码风格

#### 前后端 TypeScript 代码风格

- 字符串统一使用双引号

#### 前端代码风格

- **样式规范**: 使用 TailwindCSS 类名，禁止写 css 文件
- **页面路由**: 在 `frontend/src/pages/` 新增组件即自动成为路由
- **组件编写**: 统一使用 `function Component(props: Props) {}` 格式编写
  - **图标组件使用**: 统一使用 lucide-react 库提供的图标组件，且使用时需要带 `Icon` 后缀。（例如，使用 `Plus` 图标应该导入 `PlusIcon`）
- **错误处理**: 在出现错误时统一使用 toast 组件展示

#### UI 风格细节

- **按钮英文文本大小写**：使用“句子大小写”，如 "Add to cart", "Create new account"
- **设置界面设置项标题英文文本的大小写**：使用“句子大小写”
- **对话框 (dialog) 组件标题英文文本的大小写**：使用“句子大小写”
- **Label 组件英文文本的大小写**：使用“句子大小写”

### 注意事项

#### 前端部分

注：下面提到的依赖默认已经存在，不需要再去读文件验证是否存在。

写组件时优先查找 shadcn 中是否有现成组件，有的话直接导入使用。没有的话再自行封装组件。
编写样式时要合并 Tailwind CSS 类时使用 `cn()` 工具函数，已位于 `src/lib/utils.ts` 中。
要使用图标时从 `lucide-react` 库中，统一用 `import { IconName } from "lucide-react"` 进行导入。
使用 `zustand` 库进行状态管理，全局 store 放在 `frontend/src/stores/xxxStore.ts` 中。
使用 `@tanstack/react-router` 库进行路由管理，路由文件放 `src/routes/`，用文件路由约定。
在进行 API 请求时，需要在 `frontend/src/api` 目录下创建新的 API 文件，并使用 `@tanstack/react-query` 来管理请求状态。API 方法统一使用 `function` 关键字定义。

如果遇到 CSS 类顺序错误请直接忽略。用户会在开发完成后一并解决。
如果遇到 `components/ui` 中的组件报错，请忽略。

### Biome 代码规范

Avoid `accessKey` attr and distracting els
No `aria-hidden="true"` on focusable els
No ARIA roles, states, props on unsupported els
Use `scope` prop only on `<th>` els
No non-interactive ARIA roles on interactive els
Label els need text and associated input
No event handlers on non-interactive els
No interactive ARIA roles on non-interactive els
No `tabIndex` on non-interactive els
No positive integers on `tabIndex` prop
No `image`, `picture`, or `photo` in img alt props
No explicit role matching implicit role
Valid role attrs on static, visible els w/ click handlers
Use `title` el for `svg` els
Provide meaningful alt text for all els requiring it
Anchors need accessible content
Assign `tabIndex` to non-interactive els w/ `aria-activedescendant`
Include all required ARIA attrs for els w/ ARIA roles
Use valid ARIA props for the el's role
Use `type` attr on `button` els
Make els w/ interactive roles and handlers focusable
Heading els need accessible content
Add `lang` attr to `html` el
Use `title` attr on `iframe` els
Pair `onClick` w/ `onKeyUp`, `onKeyDown`, or `onKeyPress`
Pair `onMouseOver`/`onMouseOut` w/ `onFocus`/`onBlur`
Add caption tracks to audio and video els
Use semantic els vs role attrs
All anchors must be valid and navigable
Use valid, non-abstract ARIA props, roles, states, and values
Use valid values for `autocomplete` attr
Use correct ISO language codes in `lang` attr
Include generic font family in font families
No consecutive spaces in regex literals
Avoid `arguments`, comma op, and primitive type aliases
No empty type params in type aliases and interfaces
Keep fns under Cognitive Complexity limit
Limit nesting depth of `describe()` in tests
No unnecessary boolean casts or callbacks on `flatMap`
Use `for...of` vs `Array.forEach`
No classes w/ only static members
No `this` and `super` in static contexts
No unnecessary catch clauses, ctors, `continue`, escape sequences in regex literals, fragments, labels, or nested blocks
No empty exports
No renaming imports, exports, or destructured assignments to same name
No unnecessary string/template literal concatenation or useless cases in switch stmts, `this` aliasing, or `String.raw` without escape sequences
Use simpler alternatives to ternary ops if possible
No `any` or `unknown` as type constraints or initializing vars to `undefined`
Avoid `void` op
Use arrow fns vs function exprs
Use `Date.now()` for milliseconds since Unix Epoch
Use `.flatMap()` vs `map().flat()`
Use `indexOf`/`lastIndexOf` vs `findIndex`/`findLastIndex` for simple lookups
Use literal property access vs computed property access
Use binary, octal, or hex literals vs `parseInt()`
Use concise optional chains vs chained logical exprs
Use regex literals vs `RegExp` ctor
Use base 10 or underscore separators for number literal object member names
Remove redundant terms from logical exprs
Use `while` loops vs `for` loops if initializer and update aren't needed
No reassigning `const` vars or constant exprs in conditions
No `Math.min`/`Math.max` to clamp values where result is constant
No return values from ctors or setters
No empty character classes in regex literals or destructuring patterns
No `__dirname` and `__filename` in global scope
No calling global object props as fns or declaring fns and `var` accessible outside their block
Instantiate builtins correctly
Use `super()` correctly in classes
Use standard direction values for linear gradient fns
Use valid named grid areas in CSS Grid Layouts
Use `@import` at-rules in valid positions
No vars and params before their decl
Include `var` fn for CSS vars
No `\8` and `\9` escape sequences in strings
No literal numbers that lose precision, configured els, or assigning where both sides are same
Compare string case modifications w/ compliant values
No lexical decls in switch clauses or undeclared vars
No unknown CSS value fns, media feature names, props, pseudo-class/pseudo-element selectors, type selectors, or units
No unmatchable An+B selectors or unreachable code
Call `super()` exactly once before accessing `this` in ctors
No control flow stmts in `finally` blocks
No optional chaining where `undefined` is not allowed
No unused fn params, imports, labels, private class members, or vars
No return values from fns w/ return type `void`
Specify all dependencies correctly in React hooks and names for GraphQL operations
Call React hooks from top level of component fns
Use `isNaN()` when checking for NaN
Use `{ type: "json" }` for JSON module imports
Use radix arg w/ `parseInt()`
Start JSDoc comment lines w/ single asterisk
Move `for` loop counters in right direction
Compare `typeof` exprs to valid values
Include `yield` in generator fns
No importing deprecated exports, duplicate dependencies, or Promises where they're likely a mistake
No non-null assertions after optional chaining or shadowing vars from outer scope
No expr stmts that aren't fn calls or assignments or useless `undefined`
Add `href` attr to `<a>` els and `width`/`height` attrs to `<img>` els
Use consistent arrow fn bodies and either `interface` or `type` consistently
Specify deletion date w/ `@deprecated` directive
Make switch-case stmts exhaustive and limit number of fn params
Sort CSS utility classes
No spread syntax on accumulators, barrel files, `delete` op, dynamic namespace import access, namespace imports, or duplicate polyfills from Polyfill.io
Use `preconnect` attr w/ Google Fonts
Declare regex literals at top level
Add `rel="noopener"` when using `target="_blank"`
No dangerous JSX props
No both `children` and `dangerouslySetInnerHTML` props
No global `eval()`
No callbacks in async tests and hooks, TS enums, exporting imported vars, type annotations for vars initialized w/ literals, magic numbers without named constants, or TS namespaces
No negating `if` conditions when there's an `else` clause, nested ternary exprs, non-null assertions (`!`), reassigning fn params, parameter props in class ctors, specified global var names, importing specified modules, or specified user-defined types
No constants where value is upper-case version of name, template literals without interpolation or special chars, `else` blocks when `if` block breaks early, yoda exprs, or `Array` ctors
Use `String.slice()` vs `String.substr()` and `String.substring()`
Use `as const` vs literal type annotations and `at()` vs integer index access
Follow curly brace conventions
Use `else if` vs nested `if` in `else` clauses and single `if` vs nested `if` clauses
Use `T[]` vs `Array<T>`
Use `new` for all builtins except `String`, `Number`, and `Boolean`
Use consistent accessibility modifiers on class props and methods
Declare object literals consistently
Use `const` for vars only assigned once
Put default and optional fn params last
Include `default` clause in switch stmts
Specify reason arg w/ `@deprecated` directive
Explicitly initialize each enum member value
Use `**` op vs `Math.pow`
Use `export type` and `import type` for types
Use kebab-case, ASCII filenames
Use `for...of` vs `for` loops w/ array index access
Use `<>...</>` vs `<Fragment>...</Fragment>`
Capitalize all enum values
Place getters and setters for same prop adjacent
Use literal values for all enum members
Use `node:assert/strict` vs `node:assert`
Use `node:` protocol for Node.js builtin modules
Use `Number` props vs global ones
Use numeric separators in numeric literals
Use object spread vs `Object.assign()` for new objects
Mark members `readonly` if never modified outside ctor
No extra closing tags for comps without children
Use assignment op shorthand
Use fn types vs object types w/ call signatures
Add description param to `Symbol()`
Use template literals vs string concatenation
Use `new` when throwing an error
No throwing non-`Error` values
Use `String.trimStart()`/`String.trimEnd()` vs `String.trimLeft()`/`String.trimRight()`
No overload signatures that can be unified
No lower specificity selectors after higher specificity selectors
No `@value` rule in CSS modules
No `alert`, `confirm`, and `prompt`
Use standard constants vs approximated literals
No assigning in exprs
No async fns as Promise executors
No `!` pattern in first position of `files.includes`
No bitwise ops
No reassigning exceptions in catch clauses
No reassigning class members
No inserting comments as text nodes
No comparing against `-0`
No labeled stmts that aren't loops
No `void` type outside generic or return types
No `console`
No TS const enums
No exprs where op doesn't affect value
No control chars in regex literals
No `debugger`
No assigning directly to `document.cookie`
Use `===` and `!==`
No duplicate `@import` rules, case labels, class members, custom props, conditions in if-else-if chains, GraphQL fields, font family names, object keys, fn param names, decl block props, keyframe selectors, or describe hooks
No empty CSS blocks, block stmts, static blocks, or interfaces
No letting vars evolve into `any` type through reassignments
No `any` type
No `export` or `module.exports` in test files
No misusing non-null assertion op (`!`)
No fallthrough in switch clauses
No focused or disabled tests
No reassigning fn decls
No assigning to native objects and read-only global vars
Use `Number.isFinite` and `Number.isNaN` vs global `isFinite` and `isNaN`
No implicit `any` type on var decls
No assigning to imported bindings
No `!important` within keyframe decls
No irregular whitespace chars
No labels that share name w/ var
No chars made w/ multiple code points in char classes
Use `new` and `constructor` properly
Place assertion fns inside `it()` fn calls
No shorthand assign when var appears on both sides
No octal escape sequences in strings
No `Object.prototype` builtins directly
No `quickfix.biome` in editor settings
No redeclaring vars, fns, classes, and types in same scope
No redundant `use strict`
No comparing where both sides are same
No shadowing restricted names
No shorthand props that override related longhand props
No sparse arrays
No template literal placeholder syntax in regular strings
No `then` prop
No `@ts-ignore` directive
No `let` or `var` vars that are read but never assigned
No unknown at-rules
No merging interface and class decls unsafely
No unsafe negation (`!`)
No unnecessary escapes in strings or useless backreferences in regex literals
No `var`
No `with` stmts
No separating overload signatures
Use `await` in async fns
Use correct syntax for ignoring folders in config
Put default clauses in switch stmts last
Pass message value when creating built-in errors
Return value from get methods
Use recommended display strategy w/ Google Fonts
Include `if` stmt in for-in loops
Use `Array.isArray()` vs `instanceof Array`
Return consistent values in iterable callbacks
Use `namespace` keyword vs `module` keyword
Use digits arg w/ `Number#toFixed()`
Use static `Response` methods vs `new Response()`
Use `use strict` directive in script files
No passing children as props. Nest children between opening and closing tags
No defining comps inside other comps
No reassigning props in React comps
No using return value from `ReactDOM.render()`
No adding children to void els like `<img>` and `<br>`
Specify all dependencies correctly in React hooks
Call React hooks from top level of comp fns only
Add `key` prop to els in iterables
No legacy `React.forwardRef`. Use ref as prop instead (React 19+)
Use fn comps vs class comps
No array indices as keys
No duplicate props in JSX
No semicolons that change JSX el semantics
