import { Boxes, Network, Hammer, Activity, FlaskConical, PenTool } from 'lucide-react';

export const modules = [
  { name: 'Kernel', icon: Boxes, code: '01', pages: ['Overview', 'Identity', 'Protocols', 'Permissions'] },
  { name: 'Network', icon: Network, code: '02', pages: ['Topology', 'Nodes', 'Connections'] },
  { name: 'Builds', icon: Hammer, code: '03', pages: ['Registry', 'Artifacts', 'Pipelines'] },
  { name: 'Operations', icon: Activity, code: '04', pages: ['Activity', 'Transactions', 'Health'] },
  { name: 'Research', icon: FlaskConical, code: '05', pages: ['Library', 'Experiments', 'Notes'] },
  { name: 'Studio', icon: PenTool, code: '06', pages: ['Frames', 'Tokens', 'Handoff'] },
] as const;
export type ModuleName = typeof modules[number]['name'];
export const ledger = [
  { id: '0x8f2a…c491', title: 'Kernel identity initialized', kind: 'IDENTITY', actor: 'angri.mainyu', time: '2 min ago', status: 'Verified' },
  { id: '0x3d7e…a82f', title: 'Protocol v0.4.2 registered', kind: 'PROTOCOL', actor: 'system.kernel', time: '18 min ago', status: 'Verified' },
  { id: '0x91bc…7d03', title: 'Network peer connected', kind: 'NETWORK', actor: 'node.athena', time: '42 min ago', status: 'Verified' },
  { id: '0xa62d…e190', title: 'Research artifact committed', kind: 'ARTIFACT', actor: 'angri.mainyu', time: '1 hr ago', status: 'Verified' },
];