const anchors = { minViewport: 390, maxViewport: 1440 };
const sizes = {
  "--fs-display-1": [40, 72],
  "--fs-display-2": [34, 56],
  "--fs-display-3": [28, 44],
  "--fs-campaign-1": [44, 88],
  "--fs-campaign-2": [34, 60],
  "--fs-campaign-3": [26, 40],
  "--fs-stat": [44, 68],
  "--fs-h1": [27, 36],
  "--fs-h2": [24, 30],
  "--fs-h3": [21, 24],
  "--fs-h4": [18, 20],
  "--fs-h5": [16, 17],
  "--fs-lead": [17, 20],
  "--fs-eyebrow": [11, 12],
  // Escalera grande del sitio vivo. Aditiva: convive con --fs-display-* y
  // --fs-campaign-*, que cubren los roles medios.
  "--fs-xxxl": [96, 212],
  "--fs-xxl": [54, 126],
  "--fs-xl": [46, 102],
  // Rediseño del sitio público (titulares Inter).
  "--fs-heading-1": [40, 76],
  "--fs-heading-2": [32, 52],
  "--fs-heading-3": [27, 32],
  "--fs-heading-4": [18, 22],
  "--fs-heading-5": [16, 18],
  "--fs-heading-6": [14, 16],
  // Retícula y ritmo del rediseño (spacing.css / layout.css).
  "--site-margin": [20, 112],
  "--site-gutter": [20, 62],
  "--site-section-y": [54, 127],
  "--button-pad-y": [16, 18],
  "--button-pad-x": [30, 42],
  "--footer-logo-w": [140, 258]
};

function compact(value) {
  return Number(value.toFixed(6)).toString().replace(/^0\./, ".").replace(/^-0\./, "-.");
}

for (const [token, [min, max]] of Object.entries(sizes)) {
  const slope = ((max - min) / (anchors.maxViewport - anchors.minViewport)) * 100;
  const intercept = min - (slope * anchors.minViewport) / 100;
  console.log(
    `${token}:clamp(${min}px,calc(${compact(intercept)}px + ${compact(slope)}vw),${max}px);`
  );
}
