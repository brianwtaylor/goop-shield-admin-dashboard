import { memo } from 'react';
import { scaleBand, scaleSequential } from 'd3-scale';
import { max } from 'd3-array';
import { interpolateRgbBasis } from 'd3-interpolate';
import { axisBottom, axisLeft } from 'd3-axis';
import { useD3 } from './useD3';
import { shieldColors } from '../../lib/colors';

interface HeatmapProps {
  data: { row: string; col: string; value: number }[];
  rows: string[];
  cols: string[];
  width?: number;
  height?: number;
}

export const Heatmap = memo(function Heatmap({
  data,
  rows,
  cols,
  width = 600,
  height = 400,
}: HeatmapProps) {
  const margin = { top: 30, right: 20, bottom: 80, left: 120 };
  const innerW = width - margin.left - margin.right;
  const innerH = height - margin.top - margin.bottom;

  const ref = useD3(
    (svg) => {
      svg.attr('width', width).attr('height', height);
      if (data.length === 0 || rows.length === 0) return;
      const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

      const x = scaleBand().domain(cols).range([0, innerW]).padding(0.05);
      const y = scaleBand().domain(rows).range([0, innerH]).padding(0.05);

      const maxVal = max(data, (d) => d.value) || 1;
      const color = scaleSequential(
        interpolateRgbBasis([shieldColors.bg, shieldColors.cyan, shieldColors.red]),
      ).domain([0, maxVal]);

      g.selectAll('rect')
        .data(data)
        .join('rect')
        .attr('x', (d) => x(d.col) || 0)
        .attr('y', (d) => y(d.row) || 0)
        .attr('width', x.bandwidth())
        .attr('height', y.bandwidth())
        .attr('fill', (d) => color(d.value))
        .attr('rx', 2);

      g.append('g')
        .call(axisBottom(x))
        .attr('transform', `translate(0,${innerH})`)
        .selectAll('text')
        .attr('transform', 'rotate(-45)')
        .style('text-anchor', 'end')
        .style('fill', shieldColors.textMuted)
        .style('font-size', '10px');

      g.append('g')
        .call(axisLeft(y))
        .selectAll('text')
        .style('fill', shieldColors.textMuted)
        .style('font-size', '10px');

      g.selectAll('.domain, .tick line').attr('stroke', shieldColors.border);
    },
    [data, rows, cols, width, height],
  );

  return <svg ref={ref} />;
});
