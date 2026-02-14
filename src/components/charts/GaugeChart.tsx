import { memo } from 'react';
import { arc as d3arc } from 'd3-shape';
import { useD3 } from './useD3';
import { shieldColors } from '../../lib/colors';

interface GaugeChartProps {
  value: number; // 0-1
  size?: number;
  color?: string;
  label?: string;
}

export const GaugeChart = memo(function GaugeChart({
  value,
  size = 120,
  color = shieldColors.cyan,
  label,
}: GaugeChartProps) {
  const ref = useD3(
    (svg) => {
      const radius = size / 2;
      const clamped = Math.max(0, Math.min(value, 1));
      svg.attr('width', size).attr('height', size * 0.65);
      const g = svg.append('g').attr('transform', `translate(${radius},${radius * 0.9})`);

      const startAngle = -Math.PI / 2;
      const endAngle = Math.PI / 2;

      const bgArc = d3arc<unknown>()
        .innerRadius(radius * 0.65)
        .outerRadius(radius * 0.85)
        .startAngle(startAngle)
        .endAngle(endAngle);

      const valArc = d3arc<unknown>()
        .innerRadius(radius * 0.65)
        .outerRadius(radius * 0.85)
        .startAngle(startAngle)
        .endAngle(startAngle + (endAngle - startAngle) * clamped);

      g.append('path')
        .attr('d', bgArc({}) as string)
        .attr('fill', shieldColors.border);
      g.append('path')
        .attr('d', valArc({}) as string)
        .attr('fill', color);

      g.append('text')
        .attr('text-anchor', 'middle')
        .attr('dy', '-0.1em')
        .style('fill', '#e2e8f0')
        .style('font-size', '16px')
        .style('font-weight', 'bold')
        .text(`${(clamped * 100).toFixed(0)}%`);

      if (label) {
        g.append('text')
          .attr('text-anchor', 'middle')
          .attr('dy', '1.2em')
          .style('fill', shieldColors.textMuted)
          .style('font-size', '9px')
          .text(label);
      }
    },
    [value, size, color, label],
  );

  return <svg ref={ref} />;
});
