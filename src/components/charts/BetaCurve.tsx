import { memo } from 'react';
import { scaleLinear, scaleOrdinal } from 'd3-scale';
import { max } from 'd3-array';
import { line, curveMonotoneX } from 'd3-shape';
import { axisBottom, axisLeft } from 'd3-axis';
import { useD3 } from './useD3';
import { shieldColors, chartColorScale } from '../../lib/colors';

interface BetaCurveProps {
  curves: { name: string; alpha: number; beta: number }[];
  width?: number;
  height?: number;
}

// Beta distribution PDF using the log-gamma approach
function betaPDF(x: number, a: number, b: number): number {
  if (a <= 0 || b <= 0) return 0;
  if (x <= 0 || x >= 1) return 0;
  const logB = lgamma(a) + lgamma(b) - lgamma(a + b);
  return Math.exp((a - 1) * Math.log(x) + (b - 1) * Math.log(1 - x) - logB);
}

function lgamma(x: number): number {
  // Stirling approximation for log-gamma
  /* eslint-disable no-loss-of-precision -- Lanczos coefficients require full precision */
  const cof = [
    76.18009172947146, -86.50532032941677, 24.01409824083091, -1.231739572450155,
    1.208650973866179e-3, -5.395239384953e-6,
  ];
  let y = x;
  let tmp = x + 5.5;
  tmp -= (x + 0.5) * Math.log(tmp);
  let ser = 1.000000000190015;
  for (let j = 0; j < 6; j++) {
    ser += cof[j] / ++y;
  }
  return -tmp + Math.log((2.5066282746310005 * ser) / x);
  /* eslint-enable no-loss-of-precision */
}

export const BetaCurve = memo(function BetaCurve({
  curves,
  width = 500,
  height = 250,
}: BetaCurveProps) {
  const margin = { top: 10, right: 120, bottom: 30, left: 40 };
  const innerW = width - margin.left - margin.right;
  const innerH = height - margin.top - margin.bottom;

  const ref = useD3(
    (svg) => {
      svg.attr('width', width).attr('height', height);
      const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

      const xScale = scaleLinear().domain([0, 1]).range([0, innerW]);

      // Compute all points
      const allPoints: { name: string; points: [number, number][] }[] = curves.map((c) => {
        const pts: [number, number][] = [];
        for (let i = 1; i < 100; i++) {
          const x = i / 100;
          pts.push([x, betaPDF(x, c.alpha, c.beta)]);
        }
        return { name: c.name, points: pts };
      });

      const maxY = max(allPoints.flatMap((p) => p.points.map((pt) => pt[1]))) || 1;
      const yScale = scaleLinear().domain([0, maxY]).nice().range([innerH, 0]);

      const lineGen = line<[number, number]>()
        .x((d) => xScale(d[0]))
        .y((d) => yScale(d[1]))
        .curve(curveMonotoneX);

      const color = scaleOrdinal<string>().range(chartColorScale);

      allPoints.forEach((curve, i) => {
        g.append('path')
          .datum(curve.points)
          .attr('d', lineGen)
          .attr('fill', 'none')
          .attr('stroke', color(String(i)))
          .attr('stroke-width', 2)
          .attr('opacity', 0.8);
      });

      // Axes
      g.append('g')
        .attr('transform', `translate(0,${innerH})`)
        .call(axisBottom(xScale).ticks(5))
        .selectAll('text')
        .style('fill', shieldColors.textMuted)
        .style('font-size', '10px');
      g.append('g')
        .call(axisLeft(yScale).ticks(4))
        .selectAll('text')
        .style('fill', shieldColors.textMuted)
        .style('font-size', '10px');
      g.selectAll('.domain, .tick line').attr('stroke', shieldColors.border);

      // Legend
      const legend = svg
        .append('g')
        .attr('transform', `translate(${width - margin.right + 10},${margin.top})`);
      allPoints.forEach((curve, i) => {
        const row = legend.append('g').attr('transform', `translate(0,${i * 18})`);
        row
          .append('line')
          .attr('x1', 0)
          .attr('x2', 14)
          .attr('y1', 6)
          .attr('y2', 6)
          .attr('stroke', color(String(i)))
          .attr('stroke-width', 2);
        row
          .append('text')
          .attr('x', 18)
          .attr('y', 10)
          .style('fill', shieldColors.textMuted)
          .style('font-size', '10px')
          .text(curve.name.length > 12 ? curve.name.slice(0, 12) + '..' : curve.name);
      });
    },
    [curves, width, height],
  );

  return <svg ref={ref} />;
});
