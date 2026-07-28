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
  openError: '无法打开此 SVG 文件。',
  canvasError: '当前浏览器无法使用画布功能。',
  renderError: '此 SVG 包含当前浏览器无法渲染的内容，请尝试简化文件。',
  dropTitle: '将 SVG 拖到这里',
  dropHint: '或点击选择文件 · 最大 10 MB',
  replace: '更换',
  outputSize: '输出尺寸',
  aspectLocked: '已锁定宽高比',
  outputHeight: '输出高度',
  sizeHint: (maximum: number) => `已锁定宽高比 · 每边最大 ${maximum}px`,
  invalidSize: (maximum: number) => `宽度和高度必须在 1 到 ${maximum}px 之间。`,
  renderingPreview: '正在生成预览…',
  rendering: '正在渲染…',
  calculating: '计算中…',
  steps: [
    { title: '选择 SVG', body: '添加徽标、图标、插画或从设计工具导出的 SVG 文件。' },
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
    metaDescription: '使用 SVGlo 免费在线将 SVG 转换为 JPG 或 JPEG。可设置精确尺寸、图片质量和背景颜色，无需注册。',
    heading: 'SVG 转 JPG 转换器',
    headingAccent: '生成清晰、方便分享的图片。',
    lead: '在线将 SVG 转换为 JPG 或 JPEG，自定义尺寸、背景颜色和压缩质量。',
    createError: '无法生成 JPG，请尝试减小输出尺寸。',
    sample: '试用示例图片',
    quality: {
      compact: '较小文件',
      balanced: '均衡',
      best: '最佳质量',
    },
    imageQuality: '图片质量',
    backgroundColor: '背景颜色',
    backgroundHex: '背景颜色十六进制值',
    useBackground: (color: string) => `使用 ${color} 背景`,
    download: '下载 JPG',
    preview: 'JPG 预览',
    renderedPreview: '渲染后的 JPG 预览',
    transparentAreas: '透明区域将填充为',
    steps: [
      ...chineseCommon.steps,
      { title: '转换为 JPG', body: '设置像素尺寸、图片质量，并为透明区域选择纯色背景。' },
      { title: '下载 JPG', body: '保存适合演示文稿、商品页面和社交媒体使用的 JPEG 图片。' },
    ],
    faqTitle: 'SVG 转 JPG 常见问题',
  },
  png: {
    ...chineseCommon,
    metaTitle: 'SVG 转 PNG 转换器 - 免费在线转换 | SVGlo',
    metaDescription: '使用 SVGlo 免费在线将 SVG 转换为 PNG。保留透明背景，设置精确尺寸并下载无损 PNG，无需注册。',
    heading: 'SVG 转 PNG 转换器',
    headingAccent: '完整保留透明背景。',
    lead: '按照所需尺寸在线将 SVG 转换为 PNG，导出清晰的无损像素图片。',
    createError: '无法生成 PNG，请尝试减小输出尺寸。',
    sample: '试用透明背景示例',
    background: '背景',
    backgrounds: {
      transparent: '透明',
      white: '白色',
      dark: '深色',
      custom: '自定义',
    },
    customBackground: '自定义 PNG 背景',
    losslessPng: '无损 PNG',
    noQualitySetting: '无需设置压缩质量',
    download: '下载 PNG',
    preview: 'PNG 预览',
    renderedPreview: '渲染后的 PNG 预览',
    backgroundCaption: '背景',
    transparencyPreserved: '已保留透明背景',
    lossless: '无损',
    steps: [
      ...chineseCommon.steps,
      { title: '转换为 PNG', body: '设置精确尺寸，保留透明背景或添加所需背景颜色。' },
      { title: '下载 PNG', body: '保存适合网站、应用和文档使用的无损 PNG 图片。' },
    ],
    faqTitle: 'SVG 转 PNG 常见问题',
  },
};
