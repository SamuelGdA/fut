/** A curva do OVR, com o pico marcado. Usada no resumo (a imagem de 1200 × 630 do D118 não tem curva). */
export function OvrCurve({ points, peak, width, height }: { points: readonly number[]; peak: number; width: number; height: number }) {
  const min = Math.min(...points) - 3;
  const max = Math.max(...points) + 3;
  const pad = 24;
  const x = (index: number) => pad + (index * (width - pad * 2)) / Math.max(1, points.length - 1);
  const y = (value: number) => pad + (1 - (value - min) / Math.max(1, max - min)) * (height - pad * 2 - 10);
  const line = points.map((value, index) => `${index === 0 ? "M" : "L"}${x(index).toFixed(1)},${y(value).toFixed(1)}`).join(" ");
  const area = `${line} L${x(points.length - 1).toFixed(1)},${height} L${x(0).toFixed(1)},${height} Z`;
  const top = Math.max(peak, ...points);
  const peakIndex = points.indexOf(top);
  return (
    <svg className="ovr-curve" viewBox={`0 0 ${width} ${height}`} width="100%" aria-hidden="true">
      <path d={area} className="ovr-curve-area" />
      <path d={line} className="ovr-curve-line" vectorEffect="non-scaling-stroke" />
      {peakIndex >= 0 ? <circle cx={x(peakIndex)} cy={y(top)} r={7} className="ovr-curve-peak" /> : null}
      {peakIndex >= 0 ? <text x={x(peakIndex)} y={y(top) - 12} textAnchor={peakIndex === 0 ? "start" : peakIndex === points.length - 1 ? "end" : "middle"} className="ovr-curve-label">{top}</text> : null}
      <text x={x(0)} y={height - 3} textAnchor="start" className="ovr-curve-label">{points[0]}</text>
      <text x={x(points.length - 1)} y={height - 3} textAnchor="end" className="ovr-curve-label">{points[points.length - 1]}</text>
    </svg>
  );
}
