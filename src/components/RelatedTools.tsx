interface RelatedToolsProps {
  current: 'svg-to-jpg' | 'svg-to-png';
}

export function RelatedTools({ current }: RelatedToolsProps) {
  const rasterTool = current === 'svg-to-jpg'
    ? {
        href: '/svg-to-png/',
        label: 'SVG to PNG Converter',
        description: 'Keep transparent areas and export a lossless PNG.',
        format: 'PNG',
      }
    : {
        href: '/svg-to-jpg/',
        label: 'SVG to JPG Converter',
        description: 'Create a compact JPG with your chosen background.',
        format: 'JPG',
      };

  return (
    <section className="related-tools" aria-labelledby={`${current}-related-title`}>
      <div className="related-tools-heading">
        <span>More from SVGlo</span>
        <h2 id={`${current}-related-title`}>Related image converters</h2>
      </div>
      <nav className="related-tools-grid" aria-label="Related image converters">
        <a href={rasterTool.href}>
          <span className="related-format">{rasterTool.format}</span>
          <span><strong>{rasterTool.label}</strong><small>{rasterTool.description}</small></span>
          <i aria-hidden>→</i>
        </a>
        <a href="/">
          <span className="related-format">SVG</span>
          <span><strong>Image to SVG Converter</strong><small>Turn PNG, JPG, and other images into editable vectors.</small></span>
          <i aria-hidden>→</i>
        </a>
      </nav>
    </section>
  );
}
