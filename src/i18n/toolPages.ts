export interface ToolStep {
  title: string;
  body: string;
}

export interface CommonToolCopy {
  metaTitle: string;
  metaDescription: string;
  heading: string;
  headingAccent: string;
  lead: string;
  openError: string;
  canvasError: string;
  renderError: string;
  createError: string;
  dropTitle: string;
  dropHint: string;
  sample: string;
  replace: string;
  outputSize: string;
  aspectLocked: string;
  outputHeight: string;
  sizeHint: (maximum: number) => string;
  invalidSize: (maximum: number) => string;
  renderingPreview: string;
  rendering: string;
  preview: string;
  renderedPreview: string;
  calculating: string;
  steps: ToolStep[];
  faqTitle: string;
}

export interface JpgToolCopy extends CommonToolCopy {
  quality: {
    compact: string;
    balanced: string;
    best: string;
  };
  imageQuality: string;
  backgroundColor: string;
  backgroundHex: string;
  useBackground: (color: string) => string;
  download: string;
  transparentAreas: string;
}

export interface PngToolCopy extends CommonToolCopy {
  background: string;
  backgrounds: {
    transparent: string;
    white: string;
    dark: string;
    custom: string;
  };
  customBackground: string;
  losslessPng: string;
  noQualitySetting: string;
  download: string;
  backgroundCaption: string;
  transparencyPreserved: string;
  lossless: string;
}

export interface ToolPageCopy {
  jpg: JpgToolCopy;
  png: PngToolCopy;
}

const englishCommon = {
  openError: 'This SVG could not be opened.',
  canvasError: 'Canvas is unavailable in this browser.',
  renderError: 'This SVG uses features the browser cannot render. Try simplifying the file.',
  dropTitle: 'Drop your SVG here',
  dropHint: 'or click to choose a file · up to 10 MB',
  replace: 'Replace',
  outputSize: 'Output size',
  aspectLocked: 'Aspect ratio locked',
  outputHeight: 'Output height',
  sizeHint: (maximum: number) => `Aspect ratio locked · maximum ${maximum}px per side`,
  invalidSize: (maximum: number) => `Keep both dimensions between 1 and ${maximum}px.`,
  renderingPreview: 'Rendering preview…',
  rendering: 'Rendering…',
  calculating: 'Calculating…',
  steps: [
    { title: 'Choose an SVG', body: 'Drop in a logo, icon, illustration, or exported vector file.' },
  ],
};

const chineseCommon = {
  openError: '无法打开此 SVG 文件，请检查文件是否损坏。',
  canvasError: '当前浏览器不支持 Canvas 画布功能。',
  renderError: '此 SVG 包含当前浏览器无法解析的高级特性，请尝试简化文件内容。',
  dropTitle: '将 SVG 文件拖放至此处',
  dropHint: '或点击浏览文件 · 单文件最大 10 MB',
  replace: '更换文件',
  outputSize: '输出像素尺寸',
  aspectLocked: '已锁定宽高比',
  outputHeight: '输出高度',
  sizeHint: (maximum: number) => `已锁定宽高比 · 边长上限为 ${maximum}px`,
  invalidSize: (maximum: number) => `宽度和高度必须介于 1 至 ${maximum}px 之间。`,
  renderingPreview: '正在生成预览…',
  rendering: '正在渲染…',
  calculating: '正在计算…',
  steps: [
    { title: '选择 SVG 文件', body: '上传徽标 Logo、界面图标、插画或从矢量工具导出的 SVG 文件。' },
  ],
};

export const enToolPages: ToolPageCopy = {
  jpg: {
    ...englishCommon,
    metaTitle: 'SVG to JPG Converter – Convert SVG to JPEG | SVGlo',
    metaDescription:
      "Use SVGlo's free SVG to JPG converter to set image size, quality, and background color. Convert SVG to JPEG without uploading the source file.",
    heading: 'SVG to JPG Converter',
    headingAccent: 'for clear, ready-to-share images.',
    lead: 'Convert SVG to JPG or JPEG online. Set the exact size, background, and compression.',
    createError: 'The JPG could not be created. Try a smaller output size.',
    sample: 'Try the sample artwork',
    quality: {
      compact: 'Small file',
      balanced: 'Balanced',
      best: 'Best quality',
    },
    imageQuality: 'Image quality',
    backgroundColor: 'Background color',
    backgroundHex: 'Background hex color',
    useBackground: (color: string) => `Use ${color} background`,
    download: 'Download JPG',
    preview: 'JPG preview',
    renderedPreview: 'Rendered JPG preview',
    transparentAreas: 'Transparent areas become',
    steps: [
      ...englishCommon.steps,
      { title: 'Convert SVG to JPG', body: 'Pick a pixel size, quality level, and solid background for transparent areas.' },
      { title: 'Download the JPG', body: 'Save a JPEG ready for slides, stores, and social posts.' },
    ],
    faqTitle: 'SVG to JPG converter FAQ',
  },
  png: {
    ...englishCommon,
    metaTitle: 'SVG to PNG Converter – Convert SVG to PNG Online | SVGlo',
    metaDescription:
      'Convert SVG to PNG online for free with SVGlo. Preserve transparency, set exact dimensions, preview the result, and download a lossless PNG.',
    heading: 'SVG to PNG Converter',
    headingAccent: 'with transparency kept intact.',
    lead: 'Convert SVG to PNG online at the exact size you need. Export clean, lossless pixels.',
    createError: 'The PNG could not be created. Try a smaller output size.',
    sample: 'Try the transparent sample',
    background: 'Background',
    backgrounds: {
      transparent: 'Transparent',
      white: 'White',
      dark: 'Dark',
      custom: 'Custom',
    },
    customBackground: 'Custom PNG background',
    losslessPng: 'Lossless PNG',
    noQualitySetting: 'No quality setting needed',
    download: 'Download PNG',
    preview: 'PNG preview',
    renderedPreview: 'Rendered PNG preview',
    backgroundCaption: 'Background',
    transparencyPreserved: 'Transparency preserved',
    lossless: 'Lossless',
    steps: [
      ...englishCommon.steps,
      { title: 'Convert SVG to PNG', body: 'Choose exact dimensions and keep transparency or add a background.' },
      { title: 'Download the PNG', body: 'Save a lossless pixel image ready for websites, apps, and documents.' },
    ],
    faqTitle: 'SVG to PNG converter FAQ',
  },
};

export const zhCNToolPages: ToolPageCopy = {
  jpg: {
    ...chineseCommon,
    metaTitle: 'SVG 转 JPG 转换器 - 在线转换 JPEG | SVGlo',
    metaDescription: '使用 SVGlo 免费在线将 SVG 转换为 JPG 或 JPEG。可自定义输出尺寸、画质与背景底色，无需注册。',
    heading: 'SVG 转 JPG 转换器',
    headingAccent: '导出清晰纯净、利于分享的 JPG 图像。',
    lead: '在线将 SVG 转换为 JPG 或 JPEG，支持自定义分辨率、背景底色与压缩画质。',
    createError: '生成 JPG 失败，建议尝试减小输出像素尺寸。',
    sample: '体验示例图片',
    quality: {
      compact: '小体积',
      balanced: '均衡',
      best: '高画质',
    },
    imageQuality: '图片画质',
    backgroundColor: '背景底色',
    backgroundHex: '背景 HEX 色值',
    useBackground: (color: string) => `选用 ${color} 背景`,
    download: '下载 JPG',
    preview: 'JPG 预览',
    renderedPreview: '渲染后的 JPG 效果预览',
    transparentAreas: '透明通道将填充为',
    steps: [
      ...chineseCommon.steps,
      { title: '设定尺寸与画质', body: '设置目标像素尺寸、压缩画质等级，并为透明通道指定纯色背景。' },
      { title: '下载 JPG 图片', body: '一键导出标准 JPG 文件，轻松嵌入 PPT、商品详情页或社交平台。' },
    ],
    faqTitle: 'SVG 转 JPG 常见问题',
  },
  png: {
    ...chineseCommon,
    metaTitle: 'SVG 转 PNG 转换器 - 免费在线转换 | SVGlo',
    metaDescription: '使用 SVGlo 免费在线将 SVG 转换为 PNG。完美保留透明背景，自由设置尺寸并导出无损 PNG。',
    heading: 'SVG 转 PNG 转换器',
    headingAccent: '完美保留透明背景与无损画质。',
    lead: '按照所需尺寸在线将 SVG 转换为 PNG，导出清晰细腻的无损光栅位图。',
    createError: '生成 PNG 失败，建议尝试减小输出像素尺寸。',
    sample: '体验透明背景示例',
    background: '背景模式',
    backgrounds: {
      transparent: '透明',
      white: '白色',
      dark: '深色',
      custom: '自定义',
    },
    customBackground: '自定义 PNG 背景色',
    losslessPng: '无损 PNG 编码',
    noQualitySetting: '无损格式，无需调节画质',
    download: '下载 PNG',
    preview: 'PNG 预览',
    renderedPreview: '渲染后的 PNG 效果预览',
    backgroundCaption: '背景设置',
    transparencyPreserved: '已保留 Alpha 透明通道',
    lossless: '无损压缩',
    steps: [
      ...chineseCommon.steps,
      { title: '设定尺寸与背景', body: '输入所需像素尺寸，选择保留 Alpha 透明通道或填充特定背景色。' },
      { title: '下载 PNG 图片', body: '保存清晰的无损 PNG 图像，无缝应用于网站开发、UI 设计与文档插图。' },
    ],
    faqTitle: 'SVG 转 PNG 常见问题',
  },
};
