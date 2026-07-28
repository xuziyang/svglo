import { locale, localizedPath } from '../i18n';

interface RelatedToolsProps {
  current: 'svg-to-jpg' | 'svg-to-png';
}

export function RelatedTools({ current }: RelatedToolsProps) {
  const isChinese = locale === 'zh-CN';
  const rasterTool = current === 'svg-to-jpg'
    ? {
        href: localizedPath('/svg-to-png/'),
        label: isChinese ? 'SVG 转 PNG 转换器' : 'SVG to PNG Converter',
        description: isChinese ? '保留透明区域并导出无损 PNG。' : 'Keep transparent areas and export a lossless PNG.',
        format: 'PNG',
      }
    : {
        href: localizedPath('/svg-to-jpg/'),
        label: isChinese ? 'SVG 转 JPG 转换器' : 'SVG to JPG Converter',
        description: isChinese ? '使用所选背景生成紧凑的 JPG。' : 'Create a compact JPG with your chosen background.',
        format: 'JPG',
      };

  return (
    <section className="related-tools" aria-labelledby={`${current}-related-title`}>
      <div className="related-tools-heading">
        <span>{isChinese ? '更多 SVGlo 工具' : 'More from SVGlo'}</span>
        <h2 id={`${current}-related-title`}>{isChinese ? '相关图片转换器' : 'Related image converters'}</h2>
      </div>
      <nav className="related-tools-grid" aria-label={isChinese ? '相关图片转换器' : 'Related image converters'}>
        <a href={rasterTool.href}>
          <span className="related-format">{rasterTool.format}</span>
          <span><strong>{rasterTool.label}</strong><small>{rasterTool.description}</small></span>
          <i aria-hidden>→</i>
        </a>
        <a href={localizedPath('/')}>
          <span className="related-format">SVG</span>
          <span>
            <strong>{isChinese ? '图片转 SVG 转换器' : 'Image to SVG Converter'}</strong>
            <small>{isChinese ? '将 PNG、JPG 等图片转换为可编辑矢量图。' : 'Turn PNG, JPG, and other images into editable vectors.'}</small>
          </span>
          <i aria-hidden>→</i>
        </a>
      </nav>
    </section>
  );
}
