# SVGlo

基于 [visioncortex VTracer](https://github.com/visioncortex/vtracer) 引擎的纯前端图片转 SVG 工具站。所有转换在浏览器本地完成（WebAssembly），图片不上传服务器。

## 架构

```
浏览器 ──> 静态 wasm + React + CSS（无后端）
         └─ 上传图片 → wasm 在浏览器内矢量化 → 输出 SVG → 下载/复制
```

- **核心引擎**：`vtracer/webapp` Rust crate 编译为 wasm（MIT / Apache-2.0）
- **前端**：React 18 + Vite 5 + TypeScript
- **无后端**：纯静态托管，零服务器算力，天然可扩展，隐私友好

wasm 的 `ColorImageConverter` / `BinaryImageConverter` 以 `tick()` 分片运行并上报进度，UI 主线程不阻塞。

## 前置条件

1. [Rust](https://www.rust-lang.org/tools/install) + `wasm-pack`
2. Node.js 18+

## 首次准备：构建 wasm 包

wasm 包来自同仓库的 `vtracer/webapp`，需先编译：

```sh
cd ../vtracer/webapp
wasm-pack build --target web --release
# 产出 ../vtracer/webapp/pkg/
```

本工程的 `package.json` 通过 `file:../vtracer/webapp/pkg` 引用它。

## 开发与构建

```sh
npm install
npm run dev       # 开发服务器 http://localhost:5173
npm run build     # 生产构建到 dist/
npm run preview   # 预览生产构建
npm run typecheck # 类型检查
```

## 部署

`npm run build` 产出的 `dist/` 是纯静态站点，可直接部署到任意静态托管：

- Cloudflare Pages / Vercel / Netlify：连接仓库，构建命令 `npm run build`，输出目录 `dist`
- 注意：构建前需确保 `../vtracer/webapp/pkg` 已生成（CI 中加一步 `wasm-pack build`）

## 关键集成点

- `src/lib/vtracer.ts`：wasm 初始化 + 参数变换 + tick 循环。复刻了原 webapp 的参数转换（`filter_speckle` 平方、`color_precision` 取反、角度转弧度）。
- `src/hooks/useVTracer.ts`：状态管理，用序号机制让后发请求覆盖在途请求（快速调参不竞态）。
- `src/components/PreviewPane.tsx`：工作 `<canvas>`（wasm 读像素）与 `<svg>`（wasm 写 path）始终挂载，React 不管理 svg 的子节点。

## 参数说明

各参数含义与使用场景见上游 [参数文档](../vtracer/README.md)。预设：通用 / 黑白线稿 / 海报 / 照片 / 像素画。

> 提示：VTracer 最适合图标、插画、线稿。照片（连续色调）默认配置下产出的 SVG 较大，建议用「照片」预设。

## 许可证

- 核心引擎 `vtracer`：MIT / Apache-2.0
- 本前端工程：可自定（默认 MIT）
