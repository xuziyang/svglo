# GA4 与流量分析：待办清单

> 这份文档写给不熟悉 Google Analytics 4（简称 GA4）的人。
> 每一项都按「做什么 → 有什么用 → 为什么 → 怎么做 → 怎么验证」的顺序写清楚。
> 完成一项就在前面的方框里打勾。

**最后更新：2026-10-20**

---

## 当前状况（已完成的部分）

| 项目 | 状态 |
|---|---|
| GA4 数据流 | ✅ `svglo.com`，测量 ID `G-4ZEZRGHH7R`，数据正常流入 |
| 增强衡量（页面浏览、滚动、出站点击等） | ✅ 已开启 |
| Cookie 同意模式（Consent Mode v2） | ✅ 默认拒绝，用户点"接受"后才写 Cookie |
| GA4 ↔ Search Console 关联 | ✅ 2026-10-20 完成（见下方「已完成：任务 0」） |
| **业务事件埋点** | ❌ 还没做（本文重点） |
| **关键事件（Key events）** | ❌ 0 个 |
| **数据保留期** | ⚠️ 事件数据只有 2 个月（默认值，太短） |
| **内部流量过滤** | ⚠️ 过滤器建了，但状态是"测试中"，等于没生效 |

---

# 已完成的任务

下面这些已经做完了，保留记录是为了以后换账号、重做配置、或者排查问题时能照着复现。

## ✅ 任务 0：关联 GA4 与 Google Search Console

**完成日期：2026-10-20**

### 做什么

把 GA4 属性 `svglo.com` 和 Search Console 属性 `svglo.com` 连起来，让 Google 搜索的数据流进 GA4。

### 有什么用

关联之后，GA4 左侧导航会多出一个 **Search Console** 分组，里面有三份报告：

- **Queries**：用户具体搜了什么词找到你的
- **Google organic search traffic**：按落地页、国家、设备看搜索表现
- **各关键词的展示次数、点击率、平均排名**

没有这个关联的话，GA4 里只能看到 `google / organic` 这个笼统的来源，不知道具体是哪些词带来的。

### 为什么

GA4 和 Search Console 是两个独立产品：

- **GA4** 知道用户到站之后做了什么（看了哪些页面、有没有下载），但**不知道他们搜了什么词**
- **Search Console** 知道用户在 Google 搜了什么词、你的排名多少，但**不知道用户到站后的行为**

两边数据各有一半。关联之后，GA4 的报告里就能同时看到「搜什么词进来」+「进来后做了什么」，这是判断内容质量的关键。

### 前置条件

两个条件缺一不可，这是 GA4 官方的硬性要求：

1. 在 Search Console 里是该属性的**验证所有者（Owner）**，不能只是"受限用户"
2. 在 GA4 里对该属性有**编辑权限**（Editor 或 Administrator）

> 你当时的状态：GSC 里 `sc-domain:svglo.com` 是 Owner 且已验证；GA4 里是管理员。两条都满足。

### 具体步骤（实际操作的路径）

1. GA4 → 左下角 **Admin（管理）**
2. 右侧 **Product links（产品关联）** 区块 → 点 **Search Console links**
3. 点 **Link** 按钮，弹出「Create a link with Search Console」
4. **第 1 步 Choose Search Console property**：
   - 点 **Choose accounts**
   - 弹窗里列出你是所有者的所有 GSC 属性。你当时有三个：
     - `svglo.com` — **Domain** ← 选这个
     - `zombie-couple-video.xyz` — Domain
     - `concretecalculator.run` — Domain
   - ⚠️ 账号下有多个属性时容易点错，认准域名
   - 勾选 `svglo.com` → **Confirm** → **Next**
5. **第 2 步 Select Web Stream**：
   - 点 **Select**，弹出「Choose a data stream」
   - 只有一条：`svglo.com` / `https://svglo.com`，点它选中
   - → **Next**
6. **第 3 步 Review and submit**：
   - 核对：GSC 属性 `svglo.com`（Domain）+ Web Stream `svglo.com`
   - → **Submit**
7. 弹窗显示 **LINK CREATED**，关闭即可

### 完成后的验证结果

**GA4 侧**（Admin → Product links → Search Console links）：列表出现一行

| Search Console property | Type | Web stream | Date linked |
|---|---|---|---|
| `svglo.com` | Domain | `svglo.com` | Oct 20, 2026 |

**GA4 报告侧**：左侧导航出现 `Search Console` 分组，`Queries` 报告已经有数据了：

```
Organic Google Search query   clicks   impressions   CTR      avg position
svglo                            34         48      70.83%       1.02
```

**GSC 侧**（Settings → Associations）：`Associated services` 里显示
`Google Analytics / GA4 → svglo.com / Data Stream: svglo.com`，没有待处理的请求。

### 数据生效时间

- 链接状态：**立即**生效
- 报告数据：通常 24–48 小时，但 GSC 会**回填链接建立前最多 16 个月**的数据。你当时几乎是立刻就能看到数据了。

### 已知局限（重要）

**Search Console 只覆盖 Google 搜索。** 你的实际流量结构（近 28 天）：

| 来源 | 用户数 | 这个关联能看到吗 |
|---|---|---|
| `cn.bing.com / referral` | 427 | ❌ |
| `(direct)` | 251 | ❌（本来就没有来源） |
| `bing / organic` | 78 | ❌ |
| `doubao.com / referral` | 25 | ❌ |
| `google / organic` | **14** | ✅ |
| `baidu / organic` | 14 | ❌ |

也就是说，Bing 系贡献了约 500 个用户，是 Google 的 **35 倍**，但这次关联对它们完全无效。要拿到 Bing 的搜索词，需要单独做 **任务 7（Bing Webmaster Tools）**。

另外，`Queries` 报告里目前只有一个词 `svglo`（品牌词），平均排名 1.02——排名好得不正常，主要是因为样本量太小（48 次展示）。等 Google 流量起来后，非品牌词才会出现。

### 常见失败原因

| 现象 | 原因 |
|---|---|
| `Link` 按钮灰色 | GA4 权限不足，需要 Editor 以上 |
| 列表里看不到目标属性 | 你在 GSC 里只是"受限用户"，不是 Owner |
| 提交时报 already linked | 该 GSC 属性已绑到另一个 GA4 属性，需先去那边删除 |
| 选了 URL 前缀属性但未验证 | 只能用已验证的属性（你只有 Domain 属性，不会遇到） |

### 如何解除关联（如果以后需要）

GA4 → Admin → Product links → Search Console links → 该行右侧的 `⋮` → **Unlink**。解除后 GSC 数据不再流入 GA4，但 GA4 自己的数据不受影响。

---

# 待办任务

## 任务 1：把数据保留期从 2 个月改成 14 个月

### 做什么

在 GA4 后台把「事件数据保留」从 2 个月改成 14 个月。

### 有什么用

让你能回看更久以前的数据，比如「三个月前改版之后，转化率有没有变化」。

### 为什么

GA4 免费版的默认值只有 2 个月，而且**这个设置只对修改之后产生的数据生效**——之前的数据不会补回来。也就是说，你每拖一天，就永久损失一天的历史数据。14 个月是免费版的上限，没有理由不设满。

### 怎么做

1. 打开 GA4，左下角点 **Admin（管理）**
2. 在右侧找到 **Data collection and modification（数据收集和修改）** 区块
3. 点 **Data retention（数据保留）**
4. 把 **Event data（事件数据）** 下拉框从 `2 months` 改成 `14 months`
5. 点 **Save** 保存

> 注意：用户数据（User data）那一项本来就是 14 个月，不用动。

### 怎么验证

改完页面顶部会提示已保存。设置会在 **24 小时内**生效，不需要反复检查。

---

## 任务 2：埋业务事件（最重要的一项）

### 做什么

在代码里加一个小的统计工具，然后在几个关键操作发生时「记一笔」。要记的动作有：

| 事件名 | 什么时候记 | 记录的信息 |
|---|---|---|
| `image_uploaded` | 用户选中/拖入/粘贴了一张图 | 用的什么方式（拖拽/粘贴/选择文件/示例图） |
| `conversion_completed` | 转换完成 | 生成了多少条路径、用了哪个预设、耗时多久 |
| `svg_downloaded` | 点了「下载 SVG」 | 文件大小 |
| `svg_copied` | 点了「复制 SVG」 | — |
| `preset_selected` | 切换了预设（推荐/B&W/海报/照片/像素） | 哪个预设 |
| `raster_tool_downloaded` | 在「SVG 转 JPG/PNG」页面下载 | 是 jpg 还是 png |

### 有什么用

现在的 GA4 只知道「有人来了、页面滚动了、走了」，**完全不知道有没有人真正完成转换**。补上事件之后你能回答这些问题：

- 每天有多少人真的成功转换出了 SVG？
- 哪个预设最受欢迎？（如果大家都用「照片」预设，说明你的用户拿来做照片矢量化）
- 从「打开页面」到「下载文件」的转化率是多少？改了界面之后是升了还是降了？
- 用户平均要调几次参数才满意？

### 为什么

这是目前最大的盲区。没有这一步，GA4 里所有关于「效果」的判断都是猜的——你只能看浏览量，看不出产品好不好用。

顺便说一句：你的隐私政策里已经写了会收集 "interactions such as clicking a preset or downloading a file"，但代码里**目前并没有这些事件**。补完之后，这句话才和实际行为对得上。

### 怎么做

#### 第 1 步：新建统计工具文件

新建 `src/lib/analytics.ts`：

```ts
/**
 * 业务事件上报。只有访客同意分析后才发送，和 Cookie 同意模式保持一致。
 */

interface GtagWindow extends Window {
  gtag?: (...args: unknown[]) => void;
}

/** 从 localStorage 读同意状态（与 analyticsConsent.ts 使用同一个 key）。 */
function analyticsAllowed(): boolean {
  try {
    return window.localStorage.getItem('svglo-analytics-consent') === 'granted';
  } catch {
    return false;
  }
}

/**
 * 记录一个事件。
 * @param name 事件名，用下划线小写，例如 svg_downloaded
 * @param params 附加信息，值只能是字符串、数字或布尔值
 */
export function trackEvent(name: string, params: Record<string, string | number | boolean> = {}): void {
  if (!analyticsAllowed()) return;
  const gtag = (window as GtagWindow).gtag;
  if (!gtag) return;
  gtag('event', name, params);
}
```

> 为什么先判断同意状态？因为网站的承诺是「不接受就不分析」。虽然 GA4 在拒绝状态下也会发不带 Cookie 的匿名信号，但自己写的事件最好严格一点。

#### 第 2 步：在 App.tsx 里挂上事件

打开 `src/App.tsx`，按下面的位置插入调用（记得在文件顶部加 `import { trackEvent } from './lib/analytics';`）。

**a) 图片上传** —— 在 `handleImage` 开头加：

```ts
const handleImage = useCallback(
  (file: File, source: 'picker' | 'drop' | 'paste' | 'example' | 'replace' = 'picker') => {
    trackEvent('image_uploaded', {
      source,
      file_type: file.type || 'unknown',
      file_kb: Math.round(file.size / 1024),
    });
    // ...原有代码不变
```

> 这一步需要把「来源」传进来。`Dropzone` 组件目前只调用 `onImage(file)`，如果想区分拖拽和选择文件，需要给它加一个参数；不想改的话，全部记为 `picker` 也能用，只是少一点细节。

**b) 示例图片** —— 在 `handleExample` 里调用 `handleImage` 的地方改成：

```ts
handleImage(new File([blob], 'svglo-example.png', { type: 'image/png' }), 'example');
```

**c) 预设切换** —— 在 `handlePreset` 里加：

```ts
const handlePreset = useCallback((preset: Preset) => {
  trackEvent('preset_selected', { preset: preset.id });
  setSelectedPresetId(preset.id);
  setConfig(preset.config);
}, []);
```

**d) 下载 SVG** —— 在 `handleDownload` 里，`a.click()` 之后加：

```ts
trackEvent('svg_downloaded', {
  file_kb: Math.round(new Blob([svgString]).size / 1024),
  preset: selectedPresetId,
});
```

> 注意 `handleDownload` 的依赖数组要加上 `selectedPresetId`。

**e) 复制 SVG** —— 在 `handleCopy` 里，`setCopied(true)` 之前加：

```ts
trackEvent('svg_copied', { preset: selectedPresetId });
```

#### 第 3 步：转换完成事件

`conversion_completed` 在 `src/hooks/useVTracer.ts` 里，转换成功的那一刻。最简单的方式是给 `convert` 加一个完成回调。

在 `useVTracer.ts` 的 `convert` 函数签名后面加一个可选参数 `onDone`：

```ts
convert: (
  canvas: HTMLCanvasElement,
  svg: SVGSVGElement,
  config: VTracerConfig,
  onDone?: (info: { pathCount: number; durationMs: number }) => void,
) => void;
```

然后在 `.then((result) => { ... })` 里，`setStatus('done')` 之后加：

```ts
onDone?.({ pathCount: countPaths(result), durationMs: Date.now() - startedAt });
```

其中 `startedAt` 在 `convert` 开头用 `const startedAt = Date.now();` 记录。

最后在 `App.tsx` 调用 `convert(...)` 的地方传回调：

```ts
convert(canvas, svg, config, ({ pathCount, durationMs }) => {
  trackEvent('conversion_completed', {
    path_count: pathCount,
    duration_ms: durationMs,
    preset: selectedPresetId,
  });
});
```

> 这一步改动最麻烦，因为它要穿过 hook 的边界。如果嫌复杂，可以先用一个笨办法：在 `App.tsx` 里监听 `status`，当它变成 `'done'` 且之前不是 `'done'` 时记一次。缺点是会多记几次（比如改参数导致的重复转换），但能用。

#### 第 4 步：JPG / PNG 工具页

在 `src/components/SvgToJpgPage.tsx` 和 `SvgToPngPage.tsx` 的 `download` 函数里，`anchor.click()` 之后加：

```ts
trackEvent('raster_tool_downloaded', { format: 'jpg' }); // png 页面写 'png'
```

### 怎么验证

1. 本地跑 `npm run dev`
2. 打开浏览器开发者工具 → Console，输入 `window.dataLayer`，应该能看到你的事件对象
3. 部署上线后，在 GA4 里打开 **Reports → Realtime（实时）**，自己操作一遍，看 `Event count by Event name` 里是否出现新事件
4. 更直接的方式：GA4 → **Admin → DebugView**，配合浏览器插件「Google Analytics Debugger」可以实时看到每个事件的参数

---

## 任务 3：把重要事件标记为「关键事件」

### 做什么

在 GA4 后台把 `conversion_completed` 和 `svg_downloaded` 打上星标，变成 Key events。

### 有什么用

GA4 首页的「Key events」卡片、各种报告里的「转化」列，都只统计被标记过的关键事件。不标记的话，你刚埋的事件只是躺在列表里，不会出现在核心指标上。

### 为什么

这是 GA4 理解「什么算成功」的方式。对 SVGlo 来说，「成功转换」和「下载文件」就是成功，其他都是过程。

### 怎么做

1. 前提：**任务 2 已经上线并且产生了数据**（否则列表里看不到这些事件）
2. GA4 → **Admin → Data display → Events（事件）**
3. 切到 **Recent events（最近的事件）** 标签页
4. 找到 `conversion_completed`，点它左边的星标 ⭐
5. 对 `svg_downloaded` 重复一次

### 怎么验证

回到 GA4 首页，看 **Key events** 卡片的数字是否从 0 变成非零（新数据需要等几小时）。

---

## 任务 4：注册自定义维度

### 做什么

把事件里的附加信息（预设、路径数、来源方式等）注册成 GA4 里可以查看的「维度」。

### 有什么用

不注册的话，你在报告里只能看到「`svg_downloaded` 发生了 100 次」，看不到「其中 60 次用的是照片预设」。注册之后就能按预设、按来源分组查看。

### 为什么

GA4 只允许你把事件参数当维度用，前提是先在后台登记。这是 Google 的隐私设计，不是 bug。

### 怎么做

1. GA4 → **Admin → Data display → Custom definitions（自定义定义）**
2. 点 **Create custom dimension（创建自定义维度）**
3. 依次创建下面几个，作用域（Scope）全部选 **Event（事件）**：

| Dimension name | Event parameter |
|---|---|
| Preset | `preset` |
| Upload source | `source` |
| Path count | `path_count` |
| Raster format | `format` |

> 注意：`path_count` 是数字，如果要在报告里做数值计算（比如平均路径数），应该建 **Custom metric（自定义指标）** 而不是维度。

### 怎么验证

注册后不能立刻用，要等新数据进来。24 小时后在 **Explore（探索）** 里就能把这些维度拖到行或列上。

---

## 任务 5：让内部流量过滤器真正生效

### 做什么

配置你自己的 IP，并把过滤器从「测试中」切换到「生效」。

### 有什么用

让你自己、你的同事、你的测试设备的访问**不算进真实数据**。

### 为什么

你每天都会打开网站测试，还会点示例图片、下载文件。这些行为会被当成真实用户，**一旦任务 2 上线，你自己就会变成最活跃的"转化用户"**，直接污染判断。现在流量还小（每天几十人），你一个人的测试就能占到 5%，影响非常明显。

### 怎么做

1. 先查自己的公网 IP：搜索「我的 IP」，记下来（形如 `1.2.3.4`）
2. GA4 → **Admin → Data collection and modification → Data streams**
3. 点开 `svglo.com` 数据流 → 右下角 **Configure tag settings（配置代码设置）**
4. 找到 **Define internal traffic（定义内部流量）** → **Create**
5. 填规则名称（比如 `My home`），匹配类型选 **IP address equals**，填入你的 IP
6. 保存后回到 **Admin → Data filters（数据过滤器）**
7. 找到 **Internal Traffic** 这一行，点进去
8. 把 **Filter state（过滤器状态）** 从 `Testing` 改成 **`Active`**
9. 保存

> 如果你经常换网络（家里、公司、手机热点），把每个 IP 都加一遍，或者用「IP address contains」填网段。

### 怎么验证

改完 24 小时后，在 **Admin → Data filters** 里能看到状态是 Active。用你的设备访问网站，第二天在报告里应该看不到自己所在城市的流量。

---

## 任务 6：建立核心受众（Audiences）

### 做什么

在 GA4 里定义几类用户群体。

### 有什么用

- 直接看「下载过文件的人有多少」「只看不下载的人有多少」
- 以后如果投 Google Ads 或做 AdSense 再营销，可以直接用这些人群

### 为什么

GA4 默认只有「All Users」和「Purchasers」两个受众，后者对你毫无意义（SVGlo 没有购买行为）。自己定义才有用。

### 怎么做

GA4 → **Admin → Data display → Audiences（受众群体）** → **New audience**，依次建：

| 受众名称 | 条件 |
|---|---|
| Converted users | 触发过 `conversion_completed` |
| Downloaded users | 触发过 `svg_downloaded` |
| Tool page visitors | 页面路径包含 `svg-to-jpg` 或 `svg-to-png` |

每个受众的「成员有效期」建议设 **30 天**。

> 前提：任务 2 已经完成，否则这些事件不存在，受众会一直是 0 人。

### 怎么验证

建完之后，**Audiences** 列表里会显示每个受众的人数。人数要在 24 小时后才准确。

---

## 任务 7：注册 Bing Webmaster Tools

### 做什么

去 [Bing Webmaster Tools](https://www.bing.com/webmasters) 注册 `svglo.com`，并把它的搜索数据接进来。

### 有什么用

能看到用户在 Bing 上**具体搜了什么词**进来的。

### 为什么

这是你目前最大的流量来源盲区。近 28 天的数据：

| 来源 | 用户数 |
|---|---|
| `cn.bing.com / referral` | 427 |
| `(direct)` | 251 |
| `bing / organic` | 78 |
| `doubao.com / referral` | 25 |
| `google / organic` | 14 |

也就是说，**Bing 系贡献了约 500 个用户，是 Google 的 35 倍**。但你刚关联的 Search Console 只覆盖 Google，对 Bing 完全看不到。Bing Webmaster Tools 是唯一能拿到这批搜索词的官方渠道。

### 怎么做

1. 打开 https://www.bing.com/webmasters ，用 Google 账号登录
2. 选 **Add a site** → 输入 `svglo.com`
3. 验证方式选 **Import from Google Search Console**（最省事，你已经验证过 GSC 了）
4. 验证成功后，在左侧 **Search Performance** 里就能看到搜索词、展示次数、点击率、排名

### 怎么验证

导入完成后，Search Performance 页面应该会显示历史数据（Bing 会回填一段时间）。

---

## 任务 8：同步更新隐私政策

### 做什么

任务 2 上线后，检查 `src/i18n/legal.ts` 里的隐私政策描述，确保和实际收集的数据一致。

### 有什么用

避免「政策里写了但实际没做」或「实际做了但政策没写」的情况。

### 为什么

这是合规问题。目前政策里已经写了 "interactions such as clicking a preset or downloading a file"，但代码里还没有这些事件——**现在是"多写了"**。补完埋点后就对得上了。

### 怎么做

1. 打开 `src/i18n/legal.ts`
2. 找到 `analytics` 相关的段落（中英文各一处）
3. 核对里面列举的收集内容，是否覆盖了任务 2 新增的所有事件
4. 如果新增了事件但政策没提，补上一句；如果政策提到了但没做，删掉或补做

### 怎么验证

中英文两版都要看，不要只改一边。

---

## 附：完成后的检查清单

代码改动（任务 2）完成后，按项目规范跑一遍：

```sh
npm run typecheck   # 类型检查
npm run build       # 生产构建
git diff --check    # 检查空白字符问题
node e2e-test.mjs   # 端到端冒烟测试（需要装 Chrome）
```

确认：

- [ ] 构建产物 `dist/` 正常生成
- [ ] 端到端测试通过
- [ ] 没有改动与本次任务无关的文件
- [ ] 本地用 `npm run dev` 手动点一遍，`window.dataLayer` 里能看到事件

---

## 优先级建议

| 顺序 | 任务 | 预计耗时 | 价值 |
|---|---|---|---|
| — | ~~任务 0（关联 GSC）~~ | ~~5 分钟~~ | ✅ 已完成 2026-10-20 |
| 1 | 任务 1（数据保留期） | 2 分钟 | 高，且越早越好 |
| 2 | 任务 2（业务事件） | 1–2 小时 | **最高** |
| 3 | 任务 3（关键事件） | 5 分钟 | 高，依赖任务 2 |
| 4 | 任务 5（内部流量） | 10 分钟 | 高，依赖任务 2 |
| 5 | 任务 7（Bing 站长工具） | 15 分钟 | 高，独立于其他任务 |
| 6 | 任务 4（自定义维度） | 10 分钟 | 中 |
| 7 | 任务 6（受众） | 10 分钟 | 中，依赖任务 2 |
| 8 | 任务 8（隐私政策） | 10 分钟 | 合规必需 |

---

## 附：为什么任务 0 单独放在「已完成」

关联 GSC 是一次性操作，做完之后不需要再维护。但记录下来的原因有三个：

1. **换账号或重建属性时**要照着复现——尤其是"账号下有多个 GSC 属性时容易选错"这个坑
2. **排查数据异常时**要知道这个关联是什么时候建立的、回填了多久的数据
3. **理解后续任务的优先级**——知道 GSC 只覆盖 Google，才能理解为什么任务 7（Bing）的优先级那么高
