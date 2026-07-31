const HEX = /^#[0-9a-fA-F]{6}$/;

/** Canal sRGB de 0-255 para luminância linear, conforme WCAG 2.x. */
function linearize(channel: number): number {
  const c = channel / 255;
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

function relativeLuminance(hex: string): number {
  if (!HEX.test(hex)) {
    throw new Error(`cor precisa ser hex de 6 dígitos, recebi ${JSON.stringify(hex)}`);
  }

  const r = linearize(Number.parseInt(hex.slice(1, 3), 16));
  const g = linearize(Number.parseInt(hex.slice(3, 5), 16));
  const b = linearize(Number.parseInt(hex.slice(5, 7), 16));

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Razão de contraste entre duas cores, de 1 (iguais) a 21 (preto e branco).
 *
 * WCAG 2.2 AA pede 4.5 para texto normal, 3 para texto grande e para
 * componentes de interface.
 */
export function contrastRatio(a: string, b: string): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  const lighter = Math.max(la, lb);
  const darker = Math.min(la, lb);

  return (lighter + 0.05) / (darker + 0.05);
}
