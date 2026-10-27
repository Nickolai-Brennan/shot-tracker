'use client';

import {useId} from 'react';

export type CaddyMapPoint = readonly [number, number];
export type CaddyMapPolygon = readonly (readonly CaddyMapPoint[])[];

type Props = {
  /** Closed rings already projected into the parent SVG's verified map frame. */
  polygons: readonly CaddyMapPolygon[];
  /** Caller supplies the real zone name/percentile and validation state. */
  label: string;
  preferredTarget?: CaddyMapPoint;
  labelPosition?: CaddyMapPoint;
};

function finitePoint(point: CaddyMapPoint) {
  return Array.isArray(point) && point.length === 2 && point.every(Number.isFinite);
}

export default function CaddyZoneLayer({polygons,label,preferredTarget,labelPosition}: Props) {
  const titleId = useId();
  // Reject the whole shape if any ring is malformed: dropping an interior ring
  // could accidentally paint an excluded hazard. Spatial validity is upstream.
  if (!polygons.length || !label.trim() || !polygons.every(polygon =>
    polygon.length > 0 && polygon.every(ring => ring.length >= 4 &&
      ring.every(finitePoint) && ring[0][0] === ring.at(-1)![0] &&
      ring[0][1] === ring.at(-1)![1]))) return null;
  const paths = polygons.map(polygon => polygon.map(ring =>
    `M ${ring.map(point => point.join(' ')).join(' L ')} Z`).join(' '));

  return <g className="caddy-zone-layer" role="img" aria-labelledby={titleId}>
    <title id={titleId}>{label}</title>
    {/* Paint all halos before all fills so adjacent regions stay consistent. */}
    {paths.map((d,index) => <path key={`halo-${index}`} className="caddy-zone-halo" d={d}/>)}
    {paths.map((d,index) => <path key={`area-${index}`} className="caddy-zone-area" d={d} fillRule="evenodd"/>)}
    {preferredTarget && finitePoint(preferredTarget) && <g>
      <circle className="caddy-zone-target-ring" cx={preferredTarget[0]} cy={preferredTarget[1]} r={11}/>
      <circle className="caddy-zone-target" cx={preferredTarget[0]} cy={preferredTarget[1]} r={5}/>
    </g>}
    {labelPosition && finitePoint(labelPosition) &&
      <text className="caddy-zone-label" x={labelPosition[0]} y={labelPosition[1]}>{label}</text>}
  </g>;
}
