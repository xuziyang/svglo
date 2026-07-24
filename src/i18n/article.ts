import type { Locale } from './types';

export interface FaqItem {
  q: string;
  a: string;
}

export interface ArticleStep {
  title: string;
  body: string;
}

export interface ArticleSection {
  id: string;
  title: string;
  paragraphs: string[];
}

export interface ArticleContent {
  intro: string;
  stepsTitle: string;
  steps: ArticleStep[];
  featuresTitle: string;
  featuresLead: string;
  sections: ArticleSection[];
  faqTitle: string;
  faq: FaqItem[];
}

export const articleContent: Record<Locale, ArticleContent> = {
  en: {
    intro:
      'SVGLO is a free SVG converter that turns PNG, JPG, JPEG, and WebP images into clean, scalable vector graphics right in your browser. Everything runs locally on your device — no upload, no signup, no watermark — so you can convert image to SVG privately and download a production-ready file in seconds. Whether you need a quick PNG to SVG converter for a logo or a reliable JPG to SVG converter for a scanned sketch, the whole process takes just a few clicks.',
    stepsTitle: 'How to convert an image to SVG',
    steps: [
      {
        title: 'Add your image',
        body: 'Drop a file onto the panel above, click to browse, or paste with Ctrl+V. This picture to SVG converter accepts PNG, JPG, JPEG, WebP, GIF, and BMP, so you can convert a picture to SVG from almost any source.',
      },
      {
        title: 'Tune the trace',
        body: 'Pick a preset or adjust color precision, speckle filtering, and curve fitting until the vector preview matches your eye. The live preview updates as you drag each slider.',
      },
      {
        title: 'Export the SVG',
        body: 'Download the file or copy the SVG source to your clipboard and paste it straight into your project. The output is clean, well-structured markup you can edit anywhere.',
      },
    ],
    featuresTitle: 'Why choose this SVG converter',
    featuresLead:
      'Whether you need to convert PNG to SVG for a logo, turn a JPG into a cut-file, or clean up a scanned sketch, this free SVG converter is built for real workflows — and because it is an SVG converter free of watermarks and signups, you can convert to SVG as often as you like.',
    sections: [
      {
        id: 'features',
        title: 'Fast, private, and precise',
        paragraphs: [
          'Unlike server-based tools, this free SVG converter never sends your image anywhere. The tracing engine (visioncortex VTracer) runs as WebAssembly in the browser, so results appear almost instantly and work even on spotty connections. Because the file stays on your device, it is safe for client work and confidential assets — a genuine SVG converter free of the privacy trade-offs that come with uploading.',
          'You keep full control over the output. Adjust color precision to balance fidelity against file size, filter out tiny speckles to remove noise, and choose between spline, polygon, or pixel curve-fitting to match the look you want. The result is a compact, well-structured SVG that is easy to edit in any vector tool, from Figma and Illustrator to a plain text editor.',
          'That combination — local processing, tunable quality, and no cost — is what makes this image to SVG converter a practical everyday tool rather than a one-off novelty. There are no daily caps, no queued jobs, and no account to create before you can start.',
        ],
      },
      {
        id: 'howto',
        title: 'How to convert PNG to SVG',
        paragraphs: [
          'To convert PNG to SVG, start with the highest-resolution source you have — crisp edges trace more cleanly than blurry ones. Drop the PNG onto the converter, then experiment with the presets: “Default” suits most icons and illustrations, while “Poster” keeps full color for flat artwork. Many people searching how to convert a PNG to SVG are surprised how much the source quality matters.',
          'If the result has too many tiny shapes, raise the speckle filter to discard small clusters. If edges look jagged, increase color precision or switch curve fitting to spline. When the preview looks right, download the SVG. Used this way, it works as a dependable PNG to SVG converter free of the artifacts that plague automated one-click tools.',
          'The same approach turns the tool into a capable JPG to SVG converter and JPEG to SVG converter. Because JPEGs compress edges, choose a clear, high-contrast image for the cleanest trace; a quick contrast boost before you convert JPG to SVG often improves the result noticeably. For screenshots and flat graphics saved as JPEG, the “B&W Line Art” or “Poster” preset usually gives the sharpest output.',
        ],
      },
      {
        id: 'more-formats',
        title: 'Convert PDF, photos, and more to SVG',
        paragraphs: [
          'Need to convert PDF to SVG? Export or screenshot the page as a PNG or JPG first, then convert that image to SVG here — a simple two-step stand-in for a dedicated PDF to SVG converter that still delivers editable vector paths. The same trick covers most document and slide formats.',
          'This photo to SVG converter also handles continuous-tone images. Switch to the “Photo” preset to merge similar color layers, which keeps gradients smooth while holding file size down. It will not replace a hand-drawn illustration, but for stylized, posterized vector artwork it is a fast way to convert image to SVG without opening a desktop editor.',
        ],
      },
      {
        id: 'usecases',
        title: 'Common use cases',
        paragraphs: [
          'Logos and icons are the most popular reason to convert image to SVG: vectors scale to any size without losing sharpness, which is essential for responsive web design and print. Crafters also use the tool to prepare cut files for Cricut and Silhouette machines, and designers vectorize scanned sketches to refine them digitally.',
          'Because SVG is text-based, converted files are easy to style with CSS, animate, or edit by hand. That makes this a practical picture to SVG converter for developers who need lightweight, resolution-independent graphics for websites and apps, and for marketers who want a crisp logo at every breakpoint.',
        ],
      },
    ],
    faqTitle: 'Frequently asked questions',
    faq: [
      {
        q: 'Is this SVG converter really free?',
        a: 'Yes. SVGLO is completely free, with no watermark, no signup, and no limits on how many images you convert. You can rely on it as your go-to PNG to SVG converter free of charge, forever.',
      },
      {
        q: 'How do I convert JPG or JPEG to SVG?',
        a: 'Drop the JPG or JPEG onto the converter, pick a preset, and download the result. For the cleanest edges, start with a sharp, high-contrast image and nudge the color precision slider up if the trace looks rough.',
      },
      {
        q: 'How do I convert PDF to SVG?',
        a: 'Export or screenshot the PDF page as a PNG or JPG first, then convert that image to SVG here. It is a quick workaround that covers most PDF to SVG converter needs without extra software.',
      },
      {
        q: 'Are my images uploaded to a server?',
        a: 'No. All processing happens locally in your browser via WebAssembly, so your images never leave your device — ideal for confidential or client work.',
      },
      {
        q: 'What is the difference between PNG and SVG?',
        a: 'PNG is a raster format made of pixels, so it loses quality when enlarged. SVG is a vector format made of paths, so it scales to any size and stays crisp — which is exactly why so many people convert PNG to SVG in the first place.',
      },
    ],
  },
  zh: {
    intro:
      'SVGLO 是一款免费的 SVG 转换器，可在浏览器中把 PNG、JPG、JPEG、WebP 等图片转换为干净、可无限放大的矢量图。所有处理都在本地完成，无需上传、无需注册、无水印，保护隐私的同时几秒内即可导出可用的 SVG 文件。',
    stepsTitle: '如何把图片转换为 SVG',
    steps: [
      {
        title: '添加图片',
        body: '把文件拖到上方区域、点击选择，或用 Ctrl+V 粘贴。支持 PNG、JPG、JPEG、WebP、GIF、BMP。',
      },
      {
        title: '调整参数',
        body: '选择预设，或微调颜色精度、噪点过滤和曲线拟合，直到矢量预览符合预期。',
      },
      {
        title: '导出 SVG',
        body: '下载文件，或把 SVG 源码复制到剪贴板，直接粘贴进你的项目。',
      },
    ],
    featuresTitle: '为什么选择这个 SVG 转换器',
    featuresLead:
      '无论你想把 PNG 转 SVG 做 Logo、把 JPG 变成切割文件，还是清理扫描手稿，这里的控制项都为真实工作流而设计。',
    sections: [
      {
        id: 'features',
        title: '快速、私密、精准',
        paragraphs: [
          '与依赖服务器的工具不同，这款免费 SVG 转换器不会把图片发送到任何地方。矢量化引擎（visioncortex VTracer）以 WebAssembly 在浏览器中运行，结果几乎即时呈现，网络不佳时也能正常使用。文件始终留在本地，处理客户或机密素材也更安心。',
          '你可以完全掌控输出：调整颜色精度在保真度和文件体积之间取舍；提高斑点过滤去除噪点；在样条、多边形、像素三种拟合模式间切换，得到想要的效果。最终生成结构清晰、体积紧凑、便于在任何矢量软件中继续编辑的 SVG。',
        ],
      },
      {
        id: 'howto',
        title: 'PNG 转 SVG 的方法',
        paragraphs: [
          '想把 PNG 转 SVG，请尽量使用分辨率更高的原图——边缘越清晰，矢量化效果越好。把 PNG 拖进转换器后，可先试预设：“通用”适合大多数图标和插画，“海报”则为扁平插画保留完整颜色。',
          '如果结果里碎形太多，就提高斑点过滤，丢弃过小的色块；如果边缘锯齿明显，可增加颜色精度或改用样条拟合。预览满意后即可下载 SVG。同样的步骤也适用于 JPG 转 SVG，只需使用清晰、对比度高的 JPEG，就能得到更干净的轮廓。',
        ],
      },
      {
        id: 'usecases',
        title: '常见用途',
        paragraphs: [
          '把图片转换为 SVG 最常见的场景是 Logo 和图标：矢量图可任意缩放而不失真，这对响应式网页和印刷都至关重要。手工爱好者也用它为 Cricut、Silhouette 等切割机准备文件，设计师则把手绘扫描稿矢量化后继续细化。',
          '由于 SVG 本质是文本，转换后的文件很容易用 CSS 控制样式、制作动画，或直接手动编辑。因此对需要轻量、分辨率无关图形的开发者来说，这也是一款实用的图片转 SVG 工具。',
        ],
      },
    ],
    faqTitle: '常见问题',
    faq: [
      {
        q: '这个 SVG 转换器真的免费吗？',
        a: '是的。SVGLO 完全免费，无水印、无需注册，也不限制转换次数。',
      },
      {
        q: '怎样把 PDF 转成 SVG？',
        a: '请先把 PDF 页面导出或截图为 PNG / JPG，再在这里转换为 SVG。目前暂不支持直接导入 PDF。',
      },
      {
        q: '图片会被上传到服务器吗？',
        a: '不会。所有处理都通过 WebAssembly 在你的浏览器本地完成，图片不会离开设备。',
      },
      {
        q: 'PNG 和 SVG 有什么区别？',
        a: 'PNG 是由像素组成的位图，放大会失真；SVG 是由路径构成的矢量图，可任意缩放且始终清晰。',
      },
    ],
  },
};
