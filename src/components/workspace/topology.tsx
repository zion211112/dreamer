export function Topology({ module }: { module: string }) {
  return <div className="topology-canvas" role="img" aria-label={`${module} topology: kernel connected to identity, protocols, network, builds, and research. All systems operational.`}>
    <svg className="topology-svg" viewBox="0 0 760 300" fill="none">
      <defs>
        <pattern id="topology-grid" width="24" height="24" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="0.7" className="graph-dot" /></pattern>
        <marker id="arrow" markerWidth="6" markerHeight="6" refX="4" refY="3" orient="auto"><path d="M0 0L5 3L0 6" className="graph-arrow" /></marker>
      </defs>
      <rect width="760" height="300" fill="url(#topology-grid)" />
      <circle cx="380" cy="148" r="112" className="graph-orbit" /><circle cx="380" cy="148" r="72" className="graph-orbit inner" />
      <path d="M380 128V66H191M345 148H170M415 148H591M380 169V239H193M380 169V239H573M380 128V66H573" className="graph-edge" />
      <path d="M380 128V66H191M415 148H591M380 169V239H573" className="graph-edge signal" />
      <circle cx="270" cy="66" r="3" className="graph-pulse" /><circle cx="493" cy="148" r="3" className="graph-pulse" /><circle cx="472" cy="239" r="3" className="graph-pulse" />
      <g transform="translate(313 123)"><rect width="134" height="50" rx="5" className="graph-core" /><path d="M19 15l9-5 9 5v11l-9 5-9-5zM19 15l9 6 9-6M28 21v10" className="graph-glyph" /><text x="48" y="22" className="graph-core-text">{module.toUpperCase()}</text><text x="48" y="36" className="graph-small">v0.4.2 · active</text></g>
      {[{x:96,y:45,name:'IDENTITY',sub:'DID authenticated',n:'01'}, {x:574,y:45,name:'PROTOCOLS',sub:'6 registered',n:'02'}, {x:73,y:126,name:'NETWORK',sub:'12 peers online',n:'03'}, {x:591,y:126,name:'BUILDS',sub:'8 artifacts',n:'04'}, {x:98,y:218,name:'OPERATIONS',sub:'All systems nominal',n:'05'}, {x:574,y:218,name:'RESEARCH',sub:'3 active threads',n:'06'}].map(node => <g key={node.name} transform={`translate(${node.x} ${node.y})`}><rect width="133" height="43" rx="4" className="graph-node"/><circle cx="13" cy="15" r="3" className="graph-pulse"/><text x="24" y="19" className="graph-label">{node.name}</text><text x="13" y="33" className="graph-small">{node.sub}</text></g>)}
      <text x="20" y="282" className="graph-small">APT://KERNEL/TOPOLOGY</text><text x="653" y="282" className="graph-small">6 / 6 ONLINE</text>
    </svg>
  </div>;
}