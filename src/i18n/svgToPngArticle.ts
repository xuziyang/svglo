export interface SvgToPngSection {
  id: string;
  title: string;
  paragraphs: string[];
}

export interface SvgToPngFaq {
  q: string;
  a: string;
}

export const svgToPngArticle = {
  intro:
    'SVGlo provides a free SVG to PNG converter for turning scalable vector artwork into lossless pixel images. It works directly in your browser, so you can convert SVG to PNG without uploading artwork to an application server. Choose exact output dimensions, preserve the transparent background or replace it with a solid color, preview the rendered pixels, and download a standard PNG file for websites, apps, documents, marketplaces, and design handoffs.',
  sections: [
    {
      id: 'how-to-convert',
      title: 'How to convert SVG to PNG online',
      paragraphs: [
        'Drop an .svg file into the converter or choose one from your device. SVGlo reads the vector markup locally and detects the width, height, and viewBox used by the artwork. The preview is rendered with browser Canvas technology at the selected output dimensions. Because the aspect ratio stays locked, entering a new width automatically calculates the matching height and prevents the vector from being stretched or squeezed.',
        'Choose whether the PNG should keep transparent areas or place the artwork on white, dark, or custom color. Transparency is selected by default because it is one of the main advantages of PNG. After the preview finishes, SVGlo calculates the approximate download size. Select Download PNG to save the result. The original SVG remains untouched, so you can create additional PNG sizes or backgrounds from the same source whenever needed.',
      ],
    },
    {
      id: 'svg-into-png',
      title: 'What happens when you turn SVG into PNG?',
      paragraphs: [
        'An SVG stores visual instructions such as paths, shapes, strokes, gradients, masks, and text. A PNG stores a fixed grid of colored pixels. When you turn SVG into PNG, the browser draws those vector instructions onto a canvas at a specific width and height, then encodes the pixels with lossless PNG compression. The resulting file no longer scales infinitely, but it is supported by many systems that do not accept vector markup.',
        'The chosen pixel dimensions therefore matter. A 400 × 400 PNG contains fewer pixels than a 1600 × 1600 version, even when both come from the same SVG. The larger export can look sharper on high-density screens or in larger placements, but it usually creates a bigger file. Export close to the size required by the destination, and keep the SVG as the editable master for future sizes.',
      ],
    },
    {
      id: 'transparency',
      title: 'Convert SVG to PNG with a transparent background',
      paragraphs: [
        'PNG supports an alpha channel, which means every pixel can be fully opaque, partially transparent, or completely invisible. This makes the format well suited to logos, icons, stickers, product cutouts, interface elements, and overlays that must sit on different page colors. SVGlo preserves transparent SVG areas by default. The checkerboard around the preview helps distinguish transparent pixels from white pixels before you download.',
        'A solid background is still useful when the destination does not handle transparency well or when pale artwork needs deliberate contrast. Selecting white, dark, or a custom color fills only the transparent area behind the vector; it does not recolor existing shapes. Review soft shadows, opacity, masks, and antialiased edges against the intended background because partially transparent pixels can appear different on light and dark surfaces.',
      ],
    },
    {
      id: 'lossless-quality',
      title: 'Why PNG export does not need a quality setting',
      paragraphs: [
        'PNG uses lossless compression. Saving the same rendered pixels does not introduce the block artifacts or detail loss associated with JPEG quality levels. For that reason, this SVG to PNG converter does not show an artificial quality slider. The meaningful controls are output dimensions and background treatment. If you need a smaller file, reducing unnecessary pixel dimensions generally has more impact than pretending to lower visual quality.',
        'Lossless does not mean that a PNG is always small. Complex gradients, noise, photographic textures, and very large canvases can produce substantial files because more pixel information must be preserved. Flat artwork with repeated colors often compresses efficiently. The estimated size shown by SVGlo is generated from the current canvas, letting you adjust dimensions before downloading while keeping the rendered image visually unchanged.',
      ],
    },
    {
      id: 'use-cases',
      title: 'When should you convert SVG to PNG?',
      paragraphs: [
        'PNG is a practical choice when an upload form, presentation tool, document editor, social platform, or content management system does not accept SVG. Developers commonly use PNG for app icons, Open Graph artwork, email graphics, canvas textures, and raster fallbacks. Designers use it to hand off transparent logos or interface assets to people who do not have vector software. It is also useful when a service sanitizes or blocks SVG markup for security reasons.',
        'For photographs and graphics with no transparency, JPG or WebP may create smaller files. For animation, consider GIF, animated WebP, or video. Keep SVG when the destination supports vectors and the artwork must scale or remain editable. Choose PNG when sharp pixel rendering, transparency, and broad compatibility matter more than the smallest possible download. Matching the format to the destination avoids unnecessary conversions later.',
      ],
    },
    {
      id: 'prepare-source',
      title: 'Prepare an SVG for a clean PNG result',
      paragraphs: [
        'Open the source SVG in a browser or vector editor before conversion and confirm that its artboard, viewBox, fonts, and effects appear correctly. Remove unused objects and excessive empty artboard space if you want the exported PNG to fit closely around the design. Text that depends on a locally installed font may use a substitute on another device, so converting important lettering to vector outlines can make the result more predictable.',
        'Inspect thin strokes, small labels, shadows, and filters at the final pixel dimensions. Vector details can be perfectly defined yet become too small to read after rasterization. Increasing the output size preserves more pixels, while simplifying tiny details can improve clarity in icons and thumbnails. Embedded bitmap images do not gain real detail when enlarged, even though surrounding vector paths remain sharp.',
      ],
    },
    {
      id: 'private-conversion',
      title: 'A private browser-based SVG to PNG converter',
      paragraphs: [
        'SVGlo performs the SVG into PNG conversion on your device. It has no image upload endpoint and does not store your source artwork or downloaded result. Browser-generated object URLs and Canvas APIs handle the working file locally. This makes the converter useful for unpublished designs, internal diagrams, client assets, and other images that should not be transferred to a third-party conversion service.',
        'Before rendering, SVGlo removes scripts, foreign objects, event handlers, and remote HTTP references from the SVG. Standard paths, shapes, fills, strokes, gradients, masks, and embedded data images remain available. Very complex filters or browser-specific SVG features can render differently, so the live preview is the final check. No account, payment, installation, email address, or watermark is required.',
      ],
    },
  ] satisfies SvgToPngSection[],
  faq: [
    {
      q: 'How do I convert SVG to PNG for free?',
      a: 'Drop the SVG into SVGlo, choose an output size and background option, then select Download PNG. The conversion runs locally in your browser and does not require an account, installation, payment, or watermark.',
    },
    {
      q: 'Can I turn SVG into PNG without losing transparency?',
      a: 'Yes. Keep Transparent selected under Background. SVGlo preserves fully and partially transparent areas in the exported PNG, making the result suitable for logos, icons, overlays, stickers, and interface assets.',
    },
    {
      q: 'Does converting SVG into PNG reduce quality?',
      a: 'PNG compression is lossless, but the result has fixed pixel dimensions. Choose enough width and height for the final placement to keep edges and small details clear. The original scalable SVG is not modified.',
    },
    {
      q: 'What PNG dimensions should I use?',
      a: 'Export close to the largest size at which the image will be displayed. Small thumbnails need fewer pixels, while large placements and high-density screens benefit from larger dimensions. The aspect ratio is locked automatically.',
    },
    {
      q: 'Why can the PNG file be larger than the SVG?',
      a: 'SVG stores compact vector instructions, while PNG records every rendered pixel using lossless compression. Large dimensions, gradients, noise, shadows, and many colors can increase the PNG size even when the source vector is small.',
    },
    {
      q: 'Are SVG files uploaded when I convert them?',
      a: 'No. SVGlo reads the source, renders the preview, estimates the PNG size, and creates the download inside your browser. Your artwork and converted image are not uploaded to or stored by SVGlo.',
    },
  ] satisfies SvgToPngFaq[],
};
