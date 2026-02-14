import { memo, useEffect, useState } from 'react';
import { geoNaturalEarth1, geoPath } from 'd3-geo';
import { useD3 } from './useD3';
import { shieldColors, riskColors } from '../../lib/colors';
import type { Topology, Objects } from 'topojson-specification';

interface MapPoint {
  lat: number;
  lon: number;
  label?: string;
  risk?: string;
  value?: number;
}

interface GeoMapProps {
  points: MapPoint[];
  width?: number;
  height?: number;
}

export const GeoMap = memo(function GeoMap({ points, width = 800, height = 400 }: GeoMapProps) {
  const [worldData, setWorldData] = useState<GeoJSON.FeatureCollection | null>(null);

  useEffect(() => {
    // Dynamic import to keep topojson-client + world-atlas out of the main bundle
    Promise.all([import('topojson-client'), import('world-atlas/countries-110m.json')])
      .then(([topojsonModule, topoData]) => {
        const topo = topoData.default as unknown as Topology<Objects<GeoJSON.GeoJsonProperties>>;
        const geo = topojsonModule.feature(
          topo,
          topo.objects.countries,
        ) as unknown as GeoJSON.FeatureCollection;
        setWorldData(geo);
      })
      .catch(() => {});
  }, []);

  const ref = useD3(
    (svg) => {
      svg.attr('width', width).attr('height', height);

      if (!worldData) return;

      const projection = geoNaturalEarth1().fitSize([width, height], worldData);

      const path = geoPath(projection);

      // Countries
      svg
        .append('g')
        .selectAll('path')
        .data(worldData.features)
        .join('path')
        .attr('d', path)
        .attr('fill', shieldColors.surface)
        .attr('stroke', shieldColors.border)
        .attr('stroke-width', 0.5);

      // Points
      svg
        .append('g')
        .selectAll('circle')
        .data(points.filter((p) => p.lat && p.lon))
        .join('circle')
        .attr('cx', (d) => projection([d.lon, d.lat])?.[0] || 0)
        .attr('cy', (d) => projection([d.lon, d.lat])?.[1] || 0)
        .attr('r', (d) => Math.max(3, Math.min(8, (d.value || 1) * 2)))
        .attr('fill', (d) => riskColors[d.risk || 'medium'] || shieldColors.cyan)
        .attr('opacity', 0.7)
        .attr('stroke', (d) => riskColors[d.risk || 'medium'] || shieldColors.cyan)
        .attr('stroke-width', 1)
        .attr('stroke-opacity', 0.3);

      // Pulse animation on points
      svg
        .selectAll('circle')
        .append('animate')
        .attr('attributeName', 'r')
        .attr('values', '3;6;3')
        .attr('dur', '2s')
        .attr('repeatCount', 'indefinite');
    },
    [worldData, points, width, height],
  );

  if (!worldData) {
    return (
      <div className="flex items-center justify-center" style={{ width, height }}>
        <span className="text-slate-500 text-sm">Loading map...</span>
      </div>
    );
  }

  return <svg ref={ref} />;
});
