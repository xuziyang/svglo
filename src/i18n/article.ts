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
      'SVGLO is a free online SVG converter that turns PNG, JPG, JPEG, and WebP files into clean, scalable vector graphics. Drop an image, fine-tune the trace, and download a production-ready file in seconds — no watermark and no account. It is built for logos, icons, sketches, and flat artwork when you need editable paths instead of pixels.',
    stepsTitle: 'How to convert an image to SVG',
    steps: [
      {
        title: 'Add your image',
        body: 'Drop a file onto the panel above, click to browse, or paste with Ctrl+V. Supported formats include PNG, JPG, JPEG, WebP, GIF, and BMP, so you can start from almost any common raster source.',
      },
      {
        title: 'Tune the trace',
        body: 'Pick a preset or adjust color precision, speckle filtering, and curve fitting until the vector preview matches your eye. The live preview updates as you drag each slider.',
      },
      {
        title: 'Export the SVG',
        body: 'Download the file or copy the markup to your clipboard and paste it straight into your project. The output is clean, well-structured code you can edit in Figma, Illustrator, Inkscape, or a plain text editor.',
      },
    ],
    featuresTitle: 'Why choose this SVG converter',
    featuresLead:
      'Whether you need a logo that scales on every breakpoint, a cut-file for a craft machine, or a cleaned-up scan of a sketch, this SVG converter is built for real design and development workflows — free of watermarks, daily caps, and forced signups.',
    sections: [
      {
        id: 'features',
        title: 'Fast and precise',
        paragraphs: [
          'The tracing engine (visioncortex VTracer) generates clean vector paths in moments, so results appear almost instantly as you fine-tune the settings. You get desktop-grade accuracy from a browser SVG converter without installing bulky software or sending files to a remote server.',
          'You keep full control over the output. Adjust color precision to balance fidelity against file size, filter out tiny speckles to remove noise, and choose between spline, polygon, or pixel curve-fitting to match the look you want. The result is a compact, well-structured file that is easy to restyle with CSS or open in any vector tool.',
          'Everything runs locally in your browser through WebAssembly. Your artwork never leaves the device, downloads are generated on the spot, and there is no account to create before you can start. That combination of speed, privacy, and tunable quality makes the tool practical for everyday work rather than a one-off experiment.',
        ],
      },
      {
        id: 'howto',
        title: 'How to convert PNG to SVG',
        paragraphs: [
          'Start with the highest-resolution source you have — crisp edges trace more cleanly than blurry ones. Drop the PNG onto the workspace, then try the presets: “Default” suits most icons and illustrations, while “Poster” keeps full color for flat artwork. Source quality usually matters more than any single slider when you convert PNG to SVG.',
          'If the result has too many tiny shapes, raise the speckle filter to discard small clusters. If edges look jagged, increase color precision or switch curve fitting to spline. When the preview looks right, download the file. The same workflow handles JPG and JPEG sources; because those formats soften edges, a clear high-contrast original (or a quick contrast boost beforehand) often improves the outline noticeably.',
          'For screenshots and flat graphics saved as JPEG, the “B&W Line Art” or “Poster” preset usually gives the sharpest output. Spend a minute comparing presets before you chase individual parameters — most logos and icons land on a good result within a couple of tries.',
        ],
      },
      {
        id: 'more-formats',
        title: 'Photos, documents, and other sources',
        paragraphs: [
          'Need vectors from a PDF page or slide deck? Export or screenshot the page as a PNG or JPG first, then run that raster through this image to SVG converter. It is a simple two-step stand-in for a dedicated document converter and still delivers editable paths you can open in any vector editor.',
          'Continuous-tone photos work best with the “Photo” preset, which merges similar color layers so gradients stay smooth while file size stays down. It will not replace a hand-drawn illustration, but for stylized or posterized artwork it is a fast way to get usable vectors without opening a desktop suite.',
        ],
      },
      {
        id: 'usecases',
        title: 'Common use cases',
        paragraphs: [
          'Logos and icons are the most popular reason people open an SVG converter: vectors scale to any size without losing sharpness, which is essential for responsive web design and print. Crafters also prepare cut files for Cricut and Silhouette machines, and designers vectorize scanned sketches so they can refine them digitally.',
          'Because the format is text-based, converted files are easy to style with CSS, animate, or edit by hand. That makes the tool practical for developers who need lightweight, resolution-independent graphics for websites and apps, and for marketers who want a crisp brand mark at every breakpoint.',
        ],
      },
      {
        id: 'privacy',
        title: 'Private by design',
        paragraphs: [
          'Unlike upload-based services, this page never sends your image to a server. Conversion happens entirely in the browser, so drafts, unreleased logos, and client work stay on your machine. There is no image storage, no processing queue, and no account history to manage afterward.',
          'That local-first design also keeps things snappy: once the WebAssembly engine is loaded, each new file starts tracing immediately. You can iterate on presets and sliders without waiting on network round-trips or worrying about third-party retention policies.',
        ],
      },
      {
        id: 'tips',
        title: 'Tips for cleaner vector traces',
        paragraphs: [
          'Source quality drives the result more than any setting. Use the sharpest, highest-resolution original you can — a crisp logo or line drawing traces into far fewer, cleaner paths than a blurry photo. If you are working from a screenshot, capture it at 2× or higher.',
          'Start from a preset that matches your artwork, then refine from there. “Default” handles most icons and illustrations; “B&W Line Art” is ideal for scans and sketches; “Poster” keeps flat colors vibrant; “Photo” merges similar tones for smoother gradients. Small moves on color precision and speckle filtering usually fix whatever is left.',
          'When file size matters, lower path precision slightly and raise the speckle filter so tiny noise shapes disappear. When editability matters more, prefer stacked hierarchy and spline fitting so individual shapes stay smooth and easy to select later.',
        ],
      },
    ],
    faqTitle: 'Frequently asked questions',
    faq: [
      {
        q: 'Is this SVG converter really free?',
        a: 'Yes. SVGLO is completely free, with no watermark, no signup, and no daily conversion limit. Use it for personal or commercial projects whenever you need a quick vector trace.',
      },
      {
        q: 'How do I convert JPG or JPEG to SVG?',
        a: 'Drop the JPG or JPEG onto the workspace, pick a preset, and download the result. For the cleanest edges, start with a sharp, high-contrast image and nudge the color precision slider up if the outline looks rough.',
      },
      {
        q: 'How do I convert PDF to SVG?',
        a: 'Export or screenshot the PDF page as a PNG or JPG first, then convert that image here. It is a quick workaround that covers most document-to-vector needs without extra software.',
      },
      {
        q: 'What is the difference between PNG and SVG?',
        a: 'PNG is a raster format made of pixels, so it loses quality when enlarged. SVG is a vector format made of paths, so it scales to any size and stays crisp — which is exactly why teams replace bitmap logos with vector versions for web and print.',
      },
      {
        q: 'Can I turn the SVG back into PNG or JPG?',
        a: 'This tool outputs SVG. To get a PNG or JPG from that file, open it in any vector editor — Figma, Illustrator, Inkscape — and export, or use your editor’s built-in raster export. Because the markup is clean and structured, exporting a crisp bitmap at any size is straightforward.',
      },
      {
        q: 'Do my images leave my computer?',
        a: 'No. There is no upload endpoint. Pixels are read from a local canvas, traced with WebAssembly in your browser, and the download is generated on your device. Closing the tab discards the working copy.',
      },
    ],
  },
  zh: {
    intro:
      'SVGLO 是一款免费在线 SVG 转换器，可把 PNG、JPG、JPEG、WebP 等图片转换为干净、可无限放大的矢量图。把图片拖入页面、微调描边参数，几秒内即可导出可用于生产的文件——无需注册、无水印。适合 Logo、图标、线稿与扁平插画等需要可编辑路径的场景。',
    stepsTitle: '如何把图片转换为 SVG',
    steps: [
      {
        title: '添加图片',
        body: '把文件拖到上方区域、点击选择，或用 Ctrl+V 粘贴。支持 PNG、JPG、JPEG、WebP、GIF、BMP 等常见位图格式。',
      },
      {
        title: '调整参数',
        body: '选择预设，或微调颜色精度、噪点过滤和曲线拟合，直到矢量预览符合预期。拖动滑块时，预览会实时更新。',
      },
      {
        title: '导出 SVG',
        body: '下载文件，或把源码复制到剪贴板，直接粘贴进项目。输出结构清晰，可在 Figma、Illustrator、Inkscape 或文本编辑器中继续修改。',
      },
    ],
    featuresTitle: '为什么选择这个 SVG 转换器',
    featuresLead:
      '无论你想把 Logo 做成任意缩放的矢量、为切割机制作文件，还是清理扫描手稿，这款 SVG 转换器都面向真实设计与开发流程——无水印、无次数上限、无需强制注册。',
    sections: [
      {
        id: 'features',
        title: '快速、精准',
        paragraphs: [
          '内置矢量化引擎（visioncortex VTracer）几乎即时生成干净的矢量路径，边调参数边看结果。作为浏览器端 SVG 转换器，你能获得接近桌面软件的精度，却不必安装臃肿应用，也不必把文件传到远程服务器。',
          '你可以完全掌控输出：调整颜色精度在保真度和文件体积之间取舍；提高斑点过滤去除噪点；在样条、多边形、像素三种拟合模式间切换，得到想要的效果。最终文件结构清晰、体积紧凑，便于用 CSS 改样式，也便于在任意矢量软件中继续编辑。',
          '全部转换都在浏览器本地通过 WebAssembly 完成。素材不会离开你的设备，下载文件同样在本地生成，开始使用前也无需创建账号。速度、隐私与可调质量结合在一起，让它适合日常工作，而不是一次性尝鲜。',
        ],
      },
      {
        id: 'howto',
        title: 'PNG 转 SVG 的方法',
        paragraphs: [
          '请尽量使用分辨率更高的原图——边缘越清晰，矢量化效果越好。把 PNG 拖进工作区后，可先试预设：“通用”适合大多数图标和插画，“海报”则为扁平插画保留完整颜色。做 PNG 转 SVG 时，原图质量往往比单个滑块更关键。',
          '如果结果里碎形太多，就提高斑点过滤，丢弃过小的色块；如果边缘锯齿明显，可增加颜色精度或改用样条拟合。预览满意后即可下载。同样的步骤也适用于 JPG / JPEG：由于有损压缩会软化边缘，使用清晰、对比度高的原图（或先稍稍提高对比度）通常能明显改善轮廓。',
          '截图和保存为 JPEG 的扁平图形，一般用“黑白线稿”或“海报”预设最锐利。先花一分钟对比预设，再细调参数——大多数 Logo 和图标只需两三次就能得到不错的结果。',
        ],
      },
      {
        id: 'more-formats',
        title: '照片、文档与其他来源',
        paragraphs: [
          '需要从 PDF 页面或幻灯片得到矢量？请先把页面导出或截图为 PNG / JPG，再交给这款图片转 SVG 转换器。这是替代专用文档转换器的两步做法，同样能得到可在任意矢量软件中打开的路径。',
          '连续色调照片更适合“照片”预设：它会合并相近色层，让渐变保持平滑，同时控制文件体积。它不会取代手绘插画，但对于风格化或海报化的效果，能在不打开桌面套件的情况下快速得到可用矢量。',
        ],
      },
      {
        id: 'usecases',
        title: '常见用途',
        paragraphs: [
          '人们打开 SVG 转换器，最常见是为了处理 Logo 与图标：矢量可任意缩放而不失真，对响应式网页和印刷都至关重要。手工爱好者也用它为 Cricut、Silhouette 等切割机准备文件，设计师则把手绘扫描稿矢量化后继续细化。',
          '由于格式本质是文本，转换后的文件很容易用 CSS 控制样式、制作动画，或直接手动编辑。因此对需要轻量、分辨率无关图形的开发者，以及对希望品牌标识在每个断点都清晰的运营同学来说，它都很实用。',
        ],
      },
      {
        id: 'privacy',
        title: '天生注重隐私',
        paragraphs: [
          '与先上传再处理的服务不同，本页不会把图片发到服务器。转换完全在浏览器中完成，草稿、未发布 Logo 和客户素材都留在你的设备上。没有图片存储，没有处理队列，用完也不必管理账号历史。',
          '这种本地优先的设计也让体验更跟手：WebAssembly 引擎加载后，每张新图都能立刻开始描边。你可以反复切换预设和滑块，不必等待网络往返，也不必担心第三方留存策略。',
        ],
      },
      {
        id: 'tips',
        title: '让矢量图更干净的小技巧',
        paragraphs: [
          '原图质量比任何参数都重要。请尽量使用最清晰、分辨率最高的素材——边缘锐利的 Logo 或线条稿，矢量化后路径更少、更干净；模糊照片则容易产生杂乱轮廓。若来自截图，建议按 2 倍或更高倍率截取。',
          '先从贴合素材的预设入手，再做微调。“通用”适合大多数图标与插画；“黑白线稿”适合扫描件与手绘；“海报”保留扁平色彩的鲜活；“照片”会合并相近色调，让渐变更平滑。多数情况下，微调颜色精度与斑点过滤即可解决剩余问题。',
          '若更在意文件体积，可略微降低路径精度并提高斑点过滤，去掉细碎噪点；若更在意后续可编辑性，可优先选择堆叠层次与样条拟合，让单个形状更平滑、更好选中。',
        ],
      },
    ],
    faqTitle: '常见问题',
    faq: [
      {
        q: '这个 SVG 转换器真的免费吗？',
        a: '是的。SVGLO 完全免费，无水印、无需注册，也不限制转换次数。个人或商业项目都可以随时使用。',
      },
      {
        q: '怎样把 JPG 或 JPEG 转成 SVG？',
        a: '把 JPG / JPEG 拖到工作区，选择预设后下载结果即可。想要更干净的边缘，请尽量使用清晰、对比度高的原图；若轮廓偏糙，可适当提高颜色精度。',
      },
      {
        q: '怎样把 PDF 转成 SVG？',
        a: '请先把 PDF 页面导出或截图为 PNG / JPG，再在这里转换。这是覆盖大多数“文档转矢量”需求的快捷做法，无需额外软件。',
      },
      {
        q: 'PNG 和 SVG 有什么区别？',
        a: 'PNG 是由像素组成的位图，放大会失真；SVG 是由路径构成的矢量图，可任意缩放且始终清晰。这也是团队常把位图 Logo 换成矢量版本用于网页和印刷的原因。',
      },
      {
        q: '可以把生成的 SVG 再转回 PNG 或 JPG 吗？',
        a: '本工具输出 SVG。若要由该文件得到 PNG 或 JPG，可在任意矢量软件（Figma、Illustrator、Inkscape）中打开并导出，或使用编辑器自带的位图导出功能。由于生成的标记结构清晰，导出任意尺寸的清晰位图都很方便。',
      },
      {
        q: '我的图片会离开这台电脑吗？',
        a: '不会。站点没有上传接口。像素从本地画布读取，由浏览器中的 WebAssembly 完成描边，下载文件也在你的设备上生成。关闭标签页后，工作副本即被丢弃。',
      },
    ],
  },
};
