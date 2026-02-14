import { memo } from 'react';
import { scaleOrdinal } from 'd3-scale';
import { pie as d3pie, arc as d3arc, type PieArcDatum } from 'd3-shape';
import { sum } from 'd3-array';
import { useD3 } from './useD3';
import { chartColorScale } from '../../lib/colors';

interface DonutChartProps {
  data: { label: string; value: number }[];
  size?: number;
}

export const DonutChart = memo(function DonutChart({ data, size = 200 }: DonutChartProps) {
  const ref = useD3(
    (svg) => {
      const radius = size / 2;
      svg.attr('width', size).attr('height', size);
      const g = svg.append('g').attr('transform', `translate(${radius},${radius})`);

      const pie = d3pie<{ label: string; value: number }>()
        .value((d) => d.value)
        .sort(null);
      const arc = d3arc<PieArcDatum<{ label: string; value: number }>>()
        .innerRadius(radius * 0.55)
        .outerRadius(radius * 0.85);

      const color = scaleOrdinal<string>().range(chartColorScale);

      g.selectAll('path')
        .data(pie(data))
        .join('path')
        .attr('d', arc)
        .attr('fill', (_, i) => color(String(i)))
        .attr('stroke', '#0a0e17')
        .attr('stroke-width', 2);

      // Center text
      const total = sum(data, (d) => d.value);
      g.append('text')
        .attr('text-anchor', 'middle')
        .attr('dy', '-0.2em')
        .style('fill', '#e2e8f0')
        .style('font-size', '20px')
        .style('font-weight', 'bold')
        .text(total.toLocaleString());
      g.append('text')
        .attr('text-anchor', 'middle')
        .attr('dy', '1.2em')
        .style('fill', '#94a3b8')
        .style('font-size', '11px')
        .text('total');
    },
    [data, size],
  );

  return <svg ref={ref} />;
});
