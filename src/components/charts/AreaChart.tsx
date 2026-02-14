import { memo } from 'react';
import { scaleTime, scaleLinear } from 'd3-scale';
import { extent, max } from 'd3-array';
import { area, line, curveMonotoneX } from 'd3-shape';
import { axisBottom, axisLeft } from 'd3-axis';
import { useD3 } from './useD3';
import { shieldColors } from '../../lib/colors';

interface AreaChartProps {
  data: { date: Date; value: number }[];
  width?: number;
  height?: number;
  color?: string;
}

export const AreaChart = memo(function AreaChart({
  data,
  width = 500,
  height = 200,
  color = shieldColors.cyan,
}: AreaChartProps) {
  const margin = { top: 10, right: 10, bottom: 30, left: 40 };
  const innerW = width - margin.left - margin.right;
  const innerH = height - margin.top - margin.bottom;

  const ref = useD3(
    (svg) => {
      svg.attr('width', width).attr('height', height);
      if (data.length < 2) return;
      const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

      const x = scaleTime()
        .domain(extent(data, (d) => d.date) as [Date, Date])
        .range([0, innerW]);

      const y = scaleLinear()
        .domain([0, max(data, (d) => d.value) || 1])
        .nice()
        .range([innerH, 0]);

      const areaGen = area<{ date: Date; value: number }>()
        .x((d) => x(d.date))
        .y0(innerH)
        .y1((d) => y(d.value))
        .curve(curveMonotoneX);

      const lineGen = line<{ date: Date; value: number }>()
        .x((d) => x(d.date))
        .y((d) => y(d.value))
        .curve(curveMonotoneX);

      // Gradient
      const gradId = 'area-gradient-' + Math.random().toString(36).slice(2);
      const defs = svg.append('defs');
      const gradient = defs
        .append('linearGradient')
        .attr('id', gradId)
        .attr('x1', '0')
        .attr('y1', '0')
        .attr('x2', '0')
        .attr('y2', '1');
      gradient
        .append('stop')
        .attr('offset', '0%')
        .attr('stop-color', color)
        .attr('stop-opacity', 0.3);
      gradient
        .append('stop')
        .attr('offset', '100%')
        .attr('stop-color', color)
        .attr('stop-opacity', 0.02);

      g.append('path').datum(data).attr('d', areaGen).attr('fill', `url(#${gradId})`);
      g.append('path')
        .datum(data)
        .attr('d', lineGen)
        .attr('fill', 'none')
        .attr('stroke', color)
        .attr('stroke-width', 2);

      g.append('g')
        .attr('transform', `translate(0,${innerH})`)
        .call(axisBottom(x).ticks(5))
        .selectAll('text')
        .style('fill', shieldColors.textMuted)
        .style('font-size', '10px');

      g.append('g')
        .call(axisLeft(y).ticks(4))
        .selectAll('text')
        .style('fill', shieldColors.textMuted)
        .style('font-size', '10px');

      g.selectAll('.domain, .tick line').attr('stroke', shieldColors.border);
    },
    [data, width, height, color],
  );

  return <svg ref={ref} />;
});
