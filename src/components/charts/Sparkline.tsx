import { memo } from 'react';
import { scaleLinear } from 'd3-scale';
import { min, max } from 'd3-array';
import { line, curveMonotoneX } from 'd3-shape';
import { useD3 } from './useD3';
import { shieldColors } from '../../lib/colors';

interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
}

export const Sparkline = memo(function Sparkline({
  data,
  width = 80,
  height = 24,
  color = shieldColors.cyan,
}: SparklineProps) {
  const ref = useD3(
    (svg) => {
      svg.attr('width', width).attr('height', height);

      if (data.length < 2) return;

      const x = scaleLinear()
        .domain([0, data.length - 1])
        .range([2, width - 2]);
      const y = scaleLinear()
        .domain([min(data) || 0, max(data) || 1])
        .range([height - 2, 2]);

      const lineGen = line<number>()
        .x((_, i) => x(i))
        .y((d) => y(d))
        .curve(curveMonotoneX);

      svg
        .append('path')
        .datum(data)
        .attr('d', lineGen)
        .attr('fill', 'none')
        .attr('stroke', color)
        .attr('stroke-width', 1.5);
    },
    [data, width, height, color],
  );

  return <svg ref={ref} />;
});
