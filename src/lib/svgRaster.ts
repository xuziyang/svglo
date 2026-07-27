export const MAX_SVG_BYTES = 10 * 1024 * 1024;
export const MAX_OUTPUT_EDGE = 8192;

export interface SvgDocument {
  name: string;
  markup: string;
  width: number;
  height: number;
}

function dimension(value: string | null): number | null {
  if (!value) return null;
  const match = value.trim().match(/^(\d+(?:\.\d+)?)(?:px)?$/i);
  if (!match) return null;
  const parsed = Number(match[1]);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

export function parseSvg(markup: string, name: string): SvgDocument {
  const parser = new DOMParser();
  const document = parser.parseFromString(markup, 'image/svg+xml');
  if (document.querySelector('parsererror') || document.documentElement.localName !== 'svg') {
    throw new Error('This file is not valid SVG. Check the markup and try again.');
  }

  const root = document.documentElement;
  root.querySelectorAll('script, foreignObject').forEach((element) => element.remove());
  root.querySelectorAll('*').forEach((element) => {
    for (const attribute of [...element.attributes]) {
      const value = attribute.value.trim();
      if (attribute.name.toLowerCase().startsWith('on')) element.removeAttribute(attribute.name);
      if (
        (attribute.localName === 'href' || attribute.name === 'src')
        && /^(?:https?:)?\/\//i.test(value)
      ) {
        element.removeAttribute(attribute.name);
      }
    }
  });

  const viewBox = root.getAttribute('viewBox')?.trim().split(/[\s,]+/).map(Number);
  const viewBoxWidth = viewBox?.length === 4 && viewBox.every(Number.isFinite) ? Math.abs(viewBox[2]) : null;
  const viewBoxHeight = viewBox?.length === 4 && viewBox.every(Number.isFinite) ? Math.abs(viewBox[3]) : null;
  const width = dimension(root.getAttribute('width')) ?? viewBoxWidth ?? 1200;
  const height = dimension(root.getAttribute('height')) ?? viewBoxHeight ?? 800;

  if (!root.getAttribute('xmlns')) root.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  return {
    name: name.replace(/\.svg$/i, '') || 'svglo-export',
    markup: new XMLSerializer().serializeToString(root),
    width,
    height,
  };
}

export async function readSvg(file: File): Promise<SvgDocument> {
  if (file.size > MAX_SVG_BYTES) throw new Error('SVG files must be 10 MB or smaller.');
  if (!/\.svg$/i.test(file.name) && file.type !== 'image/svg+xml') {
    throw new Error('Choose an SVG file to continue.');
  }
  return parseSvg(await file.text(), file.name);
}

export function formatFileSize(bytes: number | undefined): string {
  if (bytes === undefined) return 'Calculating…';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
