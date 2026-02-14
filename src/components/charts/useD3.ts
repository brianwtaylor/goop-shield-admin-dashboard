import { useRef, useEffect } from 'react';
import { select, type Selection } from 'd3-selection';

export function useD3(
  renderFn: (svg: Selection<SVGSVGElement, unknown, null, undefined>) => void,
  deps: unknown[]
) {
  const ref = useRef<SVGSVGElement>(null);
  useEffect(() => {
    if (ref.current) {
      const svg = select(ref.current);
      svg.selectAll('*').remove();
      renderFn(svg);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return ref;
}
