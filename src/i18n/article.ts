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

export const articleContent: ArticleContent = {
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
};
