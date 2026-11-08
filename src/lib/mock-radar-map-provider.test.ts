import { describe, expect, it } from 'vitest';
import { getMockRadarMapScene } from './mock-radar-map-provider';

describe('getMockRadarMapScene', () => {
  it('returns deterministic synthetic points within the schematic viewport', () => {
    const first = getMockRadarMapScene();
    const second = getMockRadarMapScene();

    expect(first).toBe(second);
    expect(first.points.length).toBeGreaterThan(0);
    expect(first.points.every(point =>
      point.x >= 0 && point.x <= 100 && point.y >= 0 && point.y <= 100,
    )).toBe(true);
  });

  it('provides no signal identifiers or record data to map points', () => {
    for (const point of getMockRadarMapScene().points) {
      expect(Object.keys(point).sort()).toEqual(['id', 'x', 'y']);
      expect(point.id).toMatch(/^sample-point-\d+$/);
    }
  });
});
