export interface MockRadarMapPoint {
  id: string;
  x: number;
  y: number;
}

export interface MockRadarMapScene {
  points: readonly MockRadarMapPoint[];
}

const mockRadarMapScene: MockRadarMapScene = {
  points: [
    { id: 'sample-point-1', x: 18, y: 34 },
    { id: 'sample-point-2', x: 39, y: 62 },
    { id: 'sample-point-3', x: 64, y: 28 },
    { id: 'sample-point-4', x: 81, y: 56 },
    { id: 'sample-point-5', x: 53, y: 78 },
  ],
};

export function getMockRadarMapScene(): MockRadarMapScene {
  return mockRadarMapScene;
}
