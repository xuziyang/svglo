export interface SvgToJpgSection {
  id: string;
  title: string;
  paragraphs: string[];
}

export interface SvgToJpgFaq {
  q: string;
  a: string;
}

export const svgToJpgArticle = {
  intro:
    'SVGlo is a free SVG to JPG converter for designers, developers, marketers, students, and anyone who needs a familiar raster image from vector artwork. It runs entirely in your browser, so you can convert SVG to JPG without sending the source file to a server. Choose an output size, select the background placed behind transparent areas, compare practical quality settings, and download a standard JPG file.',
  sections: [
    {
      id: 'how-to-convert',
      title: 'How to convert SVG to JPG online',
      paragraphs: [
        'Start by dropping an .svg file into the converter or selecting one from your device. SVGlo reads the vector markup locally and shows the artwork on a pixel canvas. The original aspect ratio is detected automatically. You can keep the natural dimensions or enter a different width when you need a larger presentation image, a smaller website asset, or a specific social media size. The height updates automatically, preventing accidental stretching.',
        'Next, choose the JPG background and image quality. Because JPEG files cannot store transparency, transparent parts of the SVG need a solid color. White works well for most documents, product listings, and websites, while a dark or custom background may suit light artwork. Each quality option includes an estimated file size, making it easier to balance clarity and download weight. When the preview looks right, select Download JPG to save the converted image.',
      ],
    },
    {
      id: 'svg-jpg-jpeg',
      title: 'SVG to JPG and SVG to JPEG explained',
      paragraphs: [
        'JPG and JPEG refer to the same image format. The shorter .jpg extension became common when older computer systems limited file extensions to three characters; .jpeg is the longer version of the same name. Both use JPEG compression, work in modern browsers and image editors, and are suitable for photographs or graphics that need a compact, widely supported raster file. A search for an SVG to JPEG converter therefore describes the same basic conversion as SVG to JPG.',
        'SVG is different because it describes shapes, paths, fills, gradients, and text as scalable instructions. It can remain sharp at many sizes, but some publishing systems, marketplaces, slide tools, email platforms, and upload forms do not accept SVG. Converting creates a fixed grid of pixels that those systems can display. Keep the original SVG as your editable master, then export a JPG at the dimensions required by the destination.',
      ],
    },
    {
      id: 'size-background-quality',
      title: 'Choose the right JPG size, background, and quality',
      paragraphs: [
        'Output dimensions have the greatest effect on how much detail the JPG can hold. Choose dimensions close to the size at which the image will actually appear. A small web thumbnail does not need thousands of pixels, while a slide, large product image, or high-density display may benefit from a larger export. Upscaling a simple vector is usually clean because the browser renders its paths at the requested resolution, although embedded raster images inside an SVG still retain their original pixel limits.',
        'The background option controls only areas that were transparent in the SVG. It does not replace colors already drawn in the artwork. White is the safest default for general use, but checking the preview is important when the source contains white logos, pale icons, or translucent effects. Quality controls JPEG compression rather than pixel dimensions. Small file favors faster delivery, Balanced suits most everyday exports, and Best quality retains more visual detail at a larger estimated file size.',
      ],
    },
    {
      id: 'when-to-use',
      title: 'When should you convert SVG to JPG?',
      paragraphs: [
        'A JPG is useful when a website, content management system, marketplace, or form rejects SVG uploads. It can also be convenient for email attachments, office documents, learning platforms, social posts, and preview images that need predictable support. Designers often convert a vector logo or illustration when sharing a quick proof with someone who does not use vector software. Developers may create raster fallbacks or screenshots for services that expect a conventional image MIME type.',
        'JPEG compression is especially effective when the rendered SVG contains gradients, textures, many colors, or photographic elements. For flat icons, line art, sharp interface screenshots, or graphics that still need transparency, PNG may produce cleaner edges and should be considered instead. The best format depends on the destination: use SVG for scalable editable vectors, PNG for lossless pixels and transparency, and JPG for broad compatibility with compact photographic or presentation-ready output.',
      ],
    },
    {
      id: 'private-browser-conversion',
      title: 'A private browser-based SVG to JPG converter',
      paragraphs: [
        'SVGlo processes the conversion on your device with browser image and Canvas features. The selected SVG is not uploaded to an application server, and the generated JPG is created as a local browser download. This approach makes the tool useful for internal diagrams, unpublished artwork, client assets, and other files you would rather not transfer to an unknown conversion service. No account, installation, watermark, or email address is required.',
        'For safer local rendering, the converter removes scripts, foreign objects, event handlers, and remote HTTP references from the SVG before drawing it. Most standard paths, shapes, text, fills, masks, gradients, and embedded data images continue to work. Very complex SVG filters or unusual font dependencies can render differently between browsers, so inspect the live preview before downloading. If exact typography matters, convert text to outlines in the source design application first.',
      ],
    },
    {
      id: 'prepare-svg',
      title: 'Prepare your SVG for a reliable JPG export',
      paragraphs: [
        'Before conversion, open the SVG in a browser or vector editor and confirm that every element appears correctly. A clear viewBox helps the converter identify the intended composition and aspect ratio. Remove unused layers, hidden objects, and oversized artboard space when you want the JPG to fit closely around the artwork. If the SVG relies on a locally installed font, outlining that text prevents a substitute typeface from changing line breaks or alignment on another device.',
        'Check thin strokes and small labels at the final output dimensions rather than judging only a large preview. Details that look crisp in a scalable vector may become too small after rasterization. Increasing the output width can preserve them, while simplifying very fine shapes can make a small JPG easier to read. After you convert SVG to JPG, open the downloaded file at its actual size and confirm that the background, edges, colors, and text match the intended destination.',
      ],
    },
  ] satisfies SvgToJpgSection[],
  faq: [
    {
      q: 'How do I convert SVG to JPG for free?',
      a: 'Drop your SVG into SVGlo, choose the output dimensions, background color, and image quality, then select Download JPG. The conversion runs locally in the browser and does not require an account, installation, payment, or watermark.',
    },
    {
      q: 'Can I convert SVG to JPEG instead of JPG?',
      a: 'Yes. JPG and JPEG are two file extensions for the same compressed image format. The downloaded file uses the widely supported .jpg extension, and applications that accept JPEG images can normally open it without any additional conversion.',
    },
    {
      q: 'Why does an SVG need a background color when exported as JPG?',
      a: 'SVG supports transparent areas, but the JPEG format does not include an alpha transparency channel. The converter fills those areas with your selected color. White is the default because it works for most pages, documents, product images, and presentations.',
    },
    {
      q: 'Will converting SVG to JPG reduce image quality?',
      a: 'The vector is first rendered at your chosen pixel dimensions, then encoded with JPEG compression. Selecting enough pixels for the intended display size and using Balanced or Best quality helps preserve clean results. The original SVG remains unchanged.',
    },
    {
      q: 'What output size should I choose?',
      a: 'Use dimensions close to the final placement. Smaller dimensions are better for thumbnails and fast-loading web content; larger dimensions suit slides and high-density displays. SVGlo locks the aspect ratio, so changing the width calculates the matching height.',
    },
    {
      q: 'Are my SVG files uploaded or stored?',
      a: 'No. SVGlo reads the file, renders the preview, estimates JPG sizes, and creates the download inside your browser. The application has no image upload endpoint and does not store your source artwork or converted result.',
    },
  ] satisfies SvgToJpgFaq[],
};
