import QRCode from "qrcode";

const QUIET_ZONE_MODULES = 4;

/**
 * Renders a payload as a flat SVG QR code — square modules, no rounded
 * corners or gradients, matching the site's flat design language, rather
 * than accepting the library's own styled string output.
 */
export function renderQrSvgMarkup(
  payload: string,
  // Default to the theme's own CSS custom properties (CLAUDE.md: Design —
  // "never hardcode a hex in a component"), not literal palette values.
  // Callers may still pass explicit hex colors (e.g. in tests).
  options?: { moduleColor?: string; backgroundColor?: string },
): string {
  const {
    moduleColor = "var(--color-text-body)",
    backgroundColor = "var(--color-secondary-shade-2)",
  } = options ?? {};
  const qr = QRCode.create(payload, { errorCorrectionLevel: "M" });
  const size = qr.modules.size;
  const totalSize = size + QUIET_ZONE_MODULES * 2;

  let path = "";
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      if (qr.modules.get(row, col)) {
        path += `M${col + QUIET_ZONE_MODULES},${row + QUIET_ZONE_MODULES}h1v1h-1z`;
      }
    }
  }

  return (
    `<svg viewBox="0 0 ${totalSize} ${totalSize}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="GiroCode">` +
    `<rect width="${totalSize}" height="${totalSize}" style="fill:${backgroundColor}"/>` +
    `<path d="${path}" style="fill:${moduleColor}"/>` +
    `</svg>`
  );
}
