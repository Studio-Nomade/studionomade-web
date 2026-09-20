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
  "--fs-eyebrow": [11, 12]
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
