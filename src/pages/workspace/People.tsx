import { useState, useMemo, useEffect, useRef } from 'preact/hooks';
import { WorkspaceLayout } from './WorkspaceLayout';

interface PersonNode {
  id: string;
  name: string;
  role: string;
  archetype: 'developer' | 'dropout' | 'graduate' | 'socializer' | 'builder' | 'researcher' | 'organizer';
  location: string;
  institution: string;
  skills: string[];
  projects: string[];
  avatar: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  fx?: number;
  fy?: number;
  bio: string;
  since: string;
}

const INSTITUTIONS = [
  'dev2027ke', 'MWEA Animation Studio', 'Cooperative Housing Trust',
  'Solar Commons Initiative', 'Open Design Library', 'Field Desk Labs',
  'Nairobi Tech Collective', 'Berlin Housing Coop', 'Oaxaca Energy Coop',
  'Kibera Makerspace', 'Lagos Creative Hub', 'Independent'
];

const ARCHETYPES = [
  { type: 'developer' as const, weight: 25, roles: ['Systems Designer', 'Infrastructure Engineer', 'Full-Stack Developer', 'Smart Contract Engineer', 'DevOps Engineer', 'Security Auditor', 'ML Engineer', 'Embedded Systems', 'Network Engineer', 'Site Reliability'] },
  { type: 'dropout' as const, weight: 15, roles: ['Self-taught Builder', 'Protocol Hacker', 'Hardware Tinkerer', 'Crypto Native', 'Open Source Maintainer', 'Freelance Auditor', 'Indie Game Dev', 'Zine Publisher'] },
  { type: 'graduate' as const, weight: 15, roles: ['Animation Director', 'Character Designer', 'Technical Artist', 'Storyboard Artist', 'Motion Designer', 'VFX Artist', 'Sound Designer', 'Creative Technologist'] },
  { type: 'socializer' as const, weight: 15, roles: ['Community Weaver', 'Event Curator', 'Network Connector', 'Knowledge Steward', 'Cultural Archivist', 'Ritual Designer', 'Gathering Host', 'Meme Lord'] },
  { type: 'builder' as const, weight: 12, roles: ['Co-op Founder', 'Commons Steward', 'Infrastructure Maintainer', 'Tool Builder', 'Local Organizer', 'Resource Coordinator', 'Supply Chain Hacker', 'Repair Cafe Lead'] },
  { type: 'researcher' as const, weight: 10, roles: ['Protocol Researcher', 'Cryptoeconomics', 'Governance Analyst', 'Mechanism Designer', 'Game Theorist', 'Distributed Systems', 'Formal Verification', 'Zero-Knowledge'] },
  { type: 'organizer' as const, weight: 8, roles: ['DAO Facilitator', 'Grant Coordinator', 'Community Manager', 'Operations Lead', 'Treasury Steward', 'Conflict Mediator', 'Onboarding Guide', 'Retreat Organizer'] },
];

const LOCATIONS = [
  'Nairobi', 'Lagos', 'Cape Town', 'Accra', 'Kigali', 'Addis Ababa',
  'Cairo', 'Tunis', 'Casablanca', 'Dakar', 'Abidjan', 'Ouagadougou',
  'Berlin', 'Lisbon', 'Kyoto', 'Oaxaca', 'São Paulo', 'Bogotá',
  'Mexico City', 'Buenos Aires', 'Santiago', 'Jakarta', 'Manila',
  'Ho Chi Minh City', 'Bangkok', 'Kuala Lumpur', 'Singapore', 'Seoul',
  'Tokyo', 'Taipei', 'Sydney', 'Melbourne', 'Auckland', 'Vancouver',
  'Toronto', 'New York', 'San Francisco', 'Austin', 'Miami', 'Chicago',
  'London', 'Paris', 'Amsterdam', 'Stockholm', 'Copenhagen', 'Zurich',
  'Kibera', 'Mathare', 'Korogocho', 'Makoko', 'Yaba', 'Ikeja',
  'Khayelitsha', 'Soweto', 'Alexandra', 'Chorkor', 'Nima', 'Jamestown'
];

const SKILLS_BY_ARCHETYPE: Record<string, string[]> = {
  developer: ['Rust', 'TypeScript', 'Go', 'Python', 'Solidity', 'Move', 'Cairo', 'React', 'Vue', 'Svelte', 'Next.js', 'PostgreSQL', 'Redis', 'Kubernetes', 'Docker', 'AWS', 'GCP', 'GraphQL', 'gRPC', 'tRPC', 'WebSockets', 'Zero-Knowledge', 'MPC', 'FHE', 'IPFS', 'Libp2p', 'eBPF', 'WASM', 'WebGPU', 'Cryptography', 'Consensus', 'MEV', 'DeFi', 'DAOs', 'Governance', 'Tokenomics'],
  dropout: ['Self-taught', 'Protocol Hacking', 'Hardware', 'Crypto', 'Open Source', 'Freelance', 'Indie Dev', 'Zines', 'Rust', 'Go', 'Solidity', 'Cairo', 'Foundry', 'Hardhat', 'Ethers.js', 'Viem', 'Wagmi', 'RainbowKit', 'IPFS', 'Ceramic', 'Lit Protocol', 'Privy', 'Dynamic', 'Wormhole', 'LayerZero', 'Hyperlane', 'Axelar'],
  graduate: ['Blender', 'Maya', 'Houdini', 'After Effects', 'Cinema 4D', 'Unity', 'Unreal', 'Godot', 'TouchDesigner', 'Processing', 'p5.js', 'Three.js', 'WebGL', 'GLSL', 'Shaders', 'Python', 'Technical Art', 'Rigging', 'Animation', 'VFX', 'Sound Design', 'Ableton', 'Max/MSP', 'Pure Data', 'SuperCollider', 'Creative Coding'],
  socializer: ['Community Building', 'Event Design', 'Facilitation', 'Conflict Resolution', 'Storytelling', 'Oral History', 'Archival', 'Ritual Design', 'Gathering Design', 'Meme Culture', 'Discord', 'Telegram', 'Matrix', 'Signal', 'Notion', 'Obsidian', 'Roam', 'Logseq', 'Tana', 'Heptabase'],
  builder: ['Carpentry', 'Electronics', '3D Printing', 'CNC', 'Laser Cutting', 'Welding', 'Plumbing', 'Electrical', 'Solar', 'Water Systems', 'Permaculture', 'Composting', 'Fermentation', 'Seed Saving', 'Tool Maintenance', 'Repair', 'Upcycling', 'Supply Chain', 'Logistics', 'Procurement'],
  researcher: ['Cryptography', 'Zero-Knowledge', 'MPC', 'FHE', 'TEE', 'Consensus', 'MEV', 'Game Theory', 'Mechanism Design', 'Auction Theory', 'Social Choice', 'Voting Systems', 'Governance', 'Tokenomics', 'Economics', 'Political Economy', 'Distributed Systems', 'Formal Verification', 'Coq', 'Lean', 'Agda', 'Rust', 'TypeScript'],
  organizer: ['DAO Operations', 'Grant Writing', 'Community Management', 'Treasury Management', 'Conflict Mediation', 'Onboarding', 'Event Planning', 'Retreat Design', 'Facilitation', 'Decision Making', 'Consensus Building', 'Proposal Writing', 'Reporting', 'Accountability', 'Transparency', 'Notion', 'Airtable', 'Gnosis Safe', 'Safe', 'Snapshot', 'Tally'],
};

const BIOS = {
  developer: [
    'Shipping code that coordinates humans. Currently wrestling with MEV protection on L2s.',
    'Building the coordination layer so builders can focus on building. Ex-infrastructure at scale.',
    'Smart contract security turned infrastructure philosophy. Every bug is a design question.',
    'From distributed systems to distributed trust. The stack is social all the way down.',
    'Making cryptography usable. If users need to understand ZKPs, we failed.',
  ],
  dropout: [
    'Left CS degree to build onchain. Best decision. Learning in public, shipping in private.',
    'No degree, all protocol. The blockchain doesn\'t check your transcript.',
    'Hardware hacker turned smart contract auditor. Physical security teaches digital humility.',
    'Maintaining the infra everyone uses but no one funds. Coffee donations accepted.',
    'Building the tools I wished existed when I started. Permissionless innovation means no gatekeepers.',
  ],
  graduate: [
    'MWEA Animation Studio alum. Bringing narrative craft to protocol design. Stories coordinate better than specs.',
    'Character design for synthetic actors. The best interfaces have personality.',
    'Technical artist bridging code and canvas. Shaders are just math with soul.',
    'Storyboarding user journeys like film sequences. Every transaction is a scene.',
    'Sound design for governance rituals. The beep when you vote matters more than you think.',
  ],
  socializer: [
    'Weaving connections across the network. The graph is sparse until someone bridges.',
    'Curating the conversations that become collaborations. Serendipity is a design pattern.',
    'Archiving the oral history of the commons. What isn\'t recorded gets lost.',
    'Designing rituals for digital tribes. Ceremony creates continuity across forks.',
    'Hosting the spaces where work becomes play. The best outputs emerge from unstructured time.',
  ],
  builder: [
    'Founded a housing co-op that runs onchain governance. Rent is a smart contract now.',
    'Maintaining the solar mesh that powers the makerspace. Energy is coordination.',
    'Building the tool library so no one buys what they can borrow. Access > ownership.',
    'Coordinating the supply chain for local food networks. Logistics is love made visible.',
    'Running the repair cafe every Saturday. Fixing things builds community better than building new.',
  ],
  researcher: [
    'Proving that incentive compatibility emerges from mechanism design, not hope.',
    'Formal verification of governance protocols. Math doesn\'t negotiate.',
    'Exploring the thermodynamic limits of consensus. Entropy always wins eventually.',
    'Designing auctions that allocate to value creators, not value extractors.',
    'Mapping the phase transitions in DAO governance. Criticality is where innovation lives.',
  ],
  organizer: [
    'Facilitating the DAO that funds public goods. Quadratic funding changed everything.',
    'Mediating the fork before it happens. Governance is conflict resolution at scale.',
    'Onboarding the next thousand contributors. The first PR is the hardest.',
    'Designing retreats where strategy emerges from walks, not whiteboards.',
    'Stewarding the treasury like a garden. Capital needs cultivation, not extraction.',
  ],
};

function generatePeople(): PersonNode[] {
  const people: PersonNode[] = [];
  const usedNames = new Set<string>();

  const firstNames = [
    'Aisha', 'Kenji', 'Mara', 'Kwame', 'Yara', 'Takeshi', 'Amara', 'Diego',
    'Zara', 'Hiroshi', 'Nia', 'Mateo', 'Leila', 'Jin', 'Sade', 'Carlos',
    'Maya', 'Arjun', 'Fatima', 'Ravi', 'Sofia', 'Omar', 'Priya', 'Lucas',
    'Yuki', 'Kofi', 'Elena', 'Wei', 'Chloe', 'Raj', 'Nina', 'Samir',
    'Aya', 'Dev', 'Lina', 'Tariq', 'Mei', 'Kiran', 'Sara', 'Hugo',
    'Tara', 'Omar', 'Zoe', 'Neil', 'Rina', 'Kai', 'Mina', 'Leo',
    'Amina', 'Joon', 'Sofia', 'Kwesi', 'Luna', 'Rashid', 'Ines', 'Tomas',
    'Fatou', 'Hwan', 'Greta', 'Boubacar', 'Soraya', 'Javier', 'Amelie', 'Kwaku',
  ];

  const lastNames = [
    'Santos', 'Tanaka', 'Okafor', 'Mensah', 'Hernandez', 'Sato', 'Njoroge', 'Silva',
    'Kim', 'García', 'Wanjiru', 'Yamamoto', 'Abdi', 'Rodriguez', 'Patel', 'Ngũgĩ',
    'Chen', 'Müller', 'Okonkwo', 'Singh', 'Rossi', 'Ali', 'Kowalski', 'Ahmed',
    'Nguyen', 'Dubois', 'Osei', 'Kumar', 'Costa', 'Ibrahim', 'Martinez', 'Wang',
    'Mwangi', 'Sharma', 'Ferreira', 'Hassan', 'Andersen', 'Johansson', 'Novak', 'Petrov',
    'Otieno', 'Adebayo', 'Mbeki', 'Diallo', 'Konaté', 'Traoré', 'Sow', 'Ndiaye',
    'Wambui', 'Kamau', 'Ochieng', 'Mutua', 'Kiprop', 'Cheruiyot', 'Korir', 'Kiplagat',
  ];

  const archetypePool: Array<{ type: PersonNode['archetype']; weight: number }> = [];
  ARCHETYPES.forEach(a => {
    for (let i = 0; i < a.weight; i++) {
      archetypePool.push({ type: a.type, weight: a.weight });
    }
  });

  for (let i = 0; i < 50; i++) {
    let name: string;
    do {
      name = `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
    } while (usedNames.has(name));
    usedNames.add(name);

    const archetypeChoice = archetypePool[Math.floor(Math.random() * archetypePool.length)];
    const archetype = archetypeChoice.type;
    const archetypeConfig = ARCHETYPES.find(a => a.type === archetype)!;
    const role = archetypeConfig.roles[Math.floor(Math.random() * archetypeConfig.roles.length)];
    const location = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)];

    let institution: string;
    if (archetype === 'developer') {
      institution = Math.random() < 0.4 ? 'dev2027ke' : INSTITUTIONS[Math.floor(Math.random() * INSTITUTIONS.length)];
    } else if (archetype === 'graduate') {
      institution = Math.random() < 0.6 ? 'MWEA Animation Studio' : INSTITUTIONS[Math.floor(Math.random() * INSTITUTIONS.length)];
    } else if (archetype === 'builder') {
      institution = ['Cooperative Housing Trust', 'Solar Commons Initiative', 'Kibera Makerspace', 'Lagos Creative Hub'][Math.floor(Math.random() * 4)];
    } else {
      institution = INSTITUTIONS[Math.floor(Math.random() * INSTITUTIONS.length)];
    }

    const skillsPool = SKILLS_BY_ARCHETYPE[archetype] || SKILLS_BY_ARCHETYPE.developer;
    const numSkills = 2 + Math.floor(Math.random() * 5);
    const shuffledSkills = [...skillsPool].sort(() => Math.random() - 0.5);
    const skills = shuffledSkills.slice(0, numSkills);

    const bio = BIOS[archetype][Math.floor(Math.random() * BIOS[archetype].length)];
    const since = `${2020 + Math.floor(Math.random() * 5)}`;

    people.push({
      id: `person-${i}`,
      name,
      role,
      archetype,
      location,
      institution,
      skills,
      projects: [],
      avatar: name.split(' ').map(n => n[0]).join(''),
      x: 100 + Math.random() * 800,
      y: 100 + Math.random() * 600,
      vx: 0,
      vy: 0,
      bio,
      since,
    });
  }
  return people;
}

const MOCK_PEOPLE = generatePeople();

const ARCHETYPE_COLORS: Record<string, string> = {
  developer: 'var(--terrain)',
  dropout: 'var(--oxide)',
  graduate: 'var(--water)',
  socializer: 'var(--brass)',
  builder: 'var(--amber)',
  researcher: 'var(--phosphor)',
  organizer: 'var(--terrain-bright)',
};

const ARCHETYPE_LABELS: Record<string, string> = {
  developer: 'DEV',
  dropout: 'DROP',
  graduate: 'GRAD',
  socializer: 'SOC',
  builder: 'BUILD',
  researcher: 'R&D',
  organizer: 'ORG',
};

const INSTITUTION_COLORS: Record<string, string> = {
  'dev2027ke': 'var(--terrain)',
  'MWEA Animation Studio': 'var(--water)',
  'Cooperative Housing Trust': 'var(--brass)',
  'Solar Commons Initiative': 'var(--amber)',
  'Open Design Library': 'var(--phosphor)',
  'Field Desk Labs': 'var(--terrain)',
  'Nairobi Tech Collective': 'var(--terrain-bright)',
  'Berlin Housing Coop': 'var(--brass-pale)',
  'Oaxaca Energy Coop': 'var(--amber-pale)',
  'Kibera Makerspace': 'var(--oxide)',
  'Lagos Creative Hub': 'var(--water-bright)',
  'Independent': 'var(--text-muted)',
};

function Node({ person, selected, onSelect, onDoubleClick }: {
  person: PersonNode;
  selected: boolean;
  onSelect: (p: PersonNode) => void;
  onDoubleClick: (p: PersonNode) => void;
}) {
  const color = ARCHETYPE_COLORS[person.archetype];
  const size = selected ? 14 : 10;
  const glowSize = selected ? 28 : 18;

  return (
    <g
      onClick={(e) => { e.stopPropagation(); onSelect(person); }}
      onDblClick={() => onDoubleClick(person)}
      style={{ cursor: 'pointer', transition: 'all 0.15s ease' }}
    >
      <circle
        cx={person.x}
        cy={person.y}
        r={glowSize}
        fill={color}
        opacity={selected ? 0.15 : 0}
        style={{ transition: 'opacity 0.15s ease' }}
      />
      <circle
        cx={person.x}
        cy={person.y}
        r={size}
        fill="var(--bg)"
        stroke={color}
        strokeWidth={selected ? 3 : 2}
        style={{ transition: 'all 0.15s ease' }}
      />
      <circle
        cx={person.x}
        cy={person.y}
        r={size * 0.5}
        fill={color}
        opacity={selected ? 1 : 0.6}
      />
      {selected && (
        <circle
          cx={person.x}
          cy={person.y}
          r={size + 4}
          fill="none"
          stroke={color}
          strokeWidth={1}
          strokeDasharray="4 4"
          style={{ animation: 'rotate 10s linear infinite' }}
        />
      )}
      <text
        x={person.x}
        y={person.y - size - 8}
        textAnchor="middle"
        fontFamily="var(--mono)"
        fontSize="7"
        fontWeight="600"
        fill={color}
        style={{ pointerEvents: 'none', userSelect: 'none' }}
      >
        {ARCHETYPE_LABELS[person.archetype]}
      </text>
    </g>
  );
}

function Link({ source, target, color, opacity }: {
  source: PersonNode;
  target: PersonNode;
  color: string;
  opacity: number;
}) {
  return (
    <line
      x1={source.x}
      y1={source.y}
      x2={target.x}
      y2={target.y}
      stroke={color}
      strokeWidth={0.5}
      opacity={opacity}
      style={{ pointerEvents: 'none' }}
    />
  );
}

function PersonDetailPanel({ person, onClose }: { person: PersonNode | null; onClose: () => void }) {
  if (!person) return null;
  const color = ARCHETYPE_COLORS[person.archetype];
  const instColor = INSTITUTION_COLORS[person.institution] || 'var(--terrain)';

  return (
    <div className="person-detail-panel" style={{
      position: 'fixed',
      top: '80px',
      right: '24px',
      bottom: '50px',
      width: '360px',
      maxWidth: 'calc(100vw - 48px)',
      background: 'var(--bg-elev)',
      border: `1px solid ${color}`,
      borderRadius: 'var(--radius-4)',
      boxShadow: 'var(--shadow-lg)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      zIndex: 100,
      animation: 'slideIn 0.2s ease',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 'var(--space-4)',
        borderBottom: '1px solid var(--border)',
        background: 'var(--bg-subtle)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            background: color,
            color: 'var(--bg)',
            display: 'grid',
            placeItems: 'center',
            font: '700 16px var(--mono)',
          }}>
            {person.avatar}
          </div>
          <div>
            <h3 style={{ margin: 0, font: '500 18px var(--serif)' }}>{person.name}</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginTop: '2px' }}>
              <span style={{ font: 'var(--step--1) var(--mono)', color: color }}>{person.role}</span>
              <span style={{
                padding: '1px 6px',
                background: `${color}20`,
                border: `1px solid ${color}`,
                borderRadius: 'var(--radius-1)',
                font: '500 8px var(--mono)',
                color: color,
                textTransform: 'uppercase',
              }}>
                {ARCHETYPE_LABELS[person.archetype]}
              </span>
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          style={{
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            border: '1px solid var(--border)',
            background: 'var(--bg)',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            display: 'grid',
            placeItems: 'center',
            fontSize: '18px',
            lineHeight: 1,
          }}
        >
          ✕
        </button>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: 'var(--space-4)' }}>
        <div style={{ marginBottom: 'var(--space-4)' }}>
          <h4 style={{ margin: '0 0 var(--space-2)', font: '500 var(--step-0) var(--sans)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Bio</h4>
          <p style={{ margin: 0, font: 'var(--step-0) var(--sans)', lineHeight: '1.6', color: 'var(--text)' }}>{person.bio}</p>
        </div>

        <div style={{ marginBottom: 'var(--space-4)' }}>
          <h4 style={{ margin: '0 0 var(--space-2)', font: '500 var(--step-0) var(--sans)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Location</h4>
          <p style={{ margin: 0, font: 'var(--step-0) var(--sans)' }}>{person.location}</p>
        </div>

        <div style={{ marginBottom: 'var(--space-4)' }}>
          <h4 style={{ margin: '0 0 var(--space-2)', font: '500 var(--step-0) var(--sans)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Institution</h4>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 'var(--space-1)',
            padding: '4px 10px',
            background: `${instColor}20`,
            border: `1px solid ${instColor}`,
            borderRadius: 'var(--radius-2)',
            font: '500 var(--step--1) var(--mono)',
            color: instColor,
          }}>
            {person.institution}
          </span>
          <span style={{ marginLeft: 'var(--space-2)', font: 'var(--step--2) var(--mono)', color: 'var(--text-faint)' }}>since {person.since}</span>
        </div>

        <div style={{ marginBottom: 'var(--space-4)' }}>
          <h4 style={{ margin: '0 0 var(--space-2)', font: '500 var(--step-0) var(--sans)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Skills</h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {person.skills.map((skill, i) => (
              <span key={i} style={{
                padding: '4px 10px',
                background: 'var(--bg-subtle)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-1)',
                font: 'var(--step--1) var(--mono)',
                color: 'var(--text)',
              }}>
                {skill}
              </span>
            ))}
          </div>
        </div>

        <div>
          <h4 style={{ margin: '0 0 var(--space-2)', font: '500 var(--step-0) var(--sans)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Active Projects</h4>
          <p style={{ margin: 0, font: 'var(--step-0) var(--sans)', color: 'var(--text-muted)' }}>
            {person.projects.length > 0 ? person.projects.join(', ') : '—'}
          </p>
        </div>
      </div>

      <div style={{
        padding: 'var(--space-3) var(--space-4)',
        borderTop: '1px solid var(--border)',
        background: 'var(--bg-subtle)',
        display: 'flex',
        gap: 'var(--space-2)',
      }}>
        <button style={{
          flex: 1,
          padding: 'var(--space-2) var(--space-3)',
          background: color,
          color: 'var(--bg)',
          border: 'none',
          borderRadius: 'var(--radius-2)',
          font: '500 var(--step--1) var(--sans)',
          cursor: 'pointer',
        }}>Connect</button>
        <button style={{
          flex: 1,
          padding: 'var(--space-2) var(--space-3)',
          background: 'transparent',
          color: 'var(--text)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-2)',
          font: '500 var(--step--1) var(--sans)',
          cursor: 'pointer',
        }}>Profile →</button>
      </div>
    </div>
  );
}

function Legend() {
  return (
    <div className="people-legend" style={{
      position: 'fixed',
      bottom: '80px',
      left: '24px',
      background: 'var(--bg-elev)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-3)',
      padding: 'var(--space-3) var(--space-4)',
      fontSize: 'var(--step--2)',
      fontFamily: 'var(--mono)',
      color: 'var(--text-muted)',
      zIndex: 50,
      maxWidth: '200px',
    }}>
      <div style={{
        marginBottom: 'var(--space-2)',
        fontWeight: 600,
        color: 'var(--text)',
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
      }}>Archetypes</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {Object.entries(ARCHETYPE_COLORS).map(([name, color]) => (
          <div key={name} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              background: color,
              border: '2px solid var(--bg)',
              boxShadow: '0 0 0 1px var(--border)',
            }} />
            <span style={{ fontSize: 'var(--step--2)', color: 'var(--text)' }}>
              {ARCHETYPE_LABELS[name]} — {name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatsBar({ people, selected }: { people: PersonNode[]; selected: PersonNode | null }) {
  const archetypeCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    people.forEach(p => { counts[p.archetype] = (counts[p.archetype] || 0) + 1; });
    return counts;
  }, [people]);

  return (
    <div className="people-stats-bar" style={{
      position: 'fixed',
      top: '80px',
      left: '24px',
      right: '24px',
      maxWidth: '1440px',
      margin: '0 auto',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 'var(--space-4)',
      padding: 'var(--space-2) var(--space-4)',
      background: 'var(--bg-elev)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-3)',
      zIndex: 50,
      fontFamily: 'var(--mono)',
      fontSize: 'var(--step--1)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
        <span style={{ color: 'var(--text-faint)' }}>NODES</span>
        <span style={{ fontWeight: 600, color: 'var(--ink)' }}>{people.length}</span>
        <span style={{ color: 'var(--border)' }}>|</span>
        <span style={{ color: 'var(--text-faint)' }}>SELECTED</span>
        <span style={{ fontWeight: 600, color: selected ? 'var(--terrain)' : 'var(--text-muted)' }}>
          {selected?.name || 'None'}
        </span>
      </div>
      <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
        {Object.entries(archetypeCounts)
          .sort((a, b) => b[1] - a[1])
          .map(([name, count]) => (
            <div key={name} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: ARCHETYPE_COLORS[name],
              }} />
              <span style={{ color: 'var(--text-muted)' }}>{ARCHETYPE_LABELS[name]} {count}</span>
            </div>
          ))}
      </div>
    </div>
  );
}

export function People() {
  const [people, setPeople] = useState<PersonNode[]>(MOCK_PEOPLE);
  const [selected, setSelected] = useState<PersonNode | null>(null);
  const [links, setLinks] = useState<Array<{source: PersonNode; target: PersonNode}>>([]);
  const [filter, setFilter] = useState<string>('');
  const [filterArchetype, setFilterArchetype] = useState<string>('all');
  const [filterInstitution, setFilterInstitution] = useState<string>('all');
  const [layoutRunning, setLayoutRunning] = useState(false);
  const canvasRef = useRef<SVGSVGElement>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    const newLinks: Array<{source: PersonNode; target: PersonNode}> = [];
    for (let i = 0; i < people.length; i++) {
      for (let j = i + 1; j < people.length; j++) {
        const a = people[i];
        const b = people[j];
        const sharedInst = a.institution === b.institution && a.institution !== 'Independent';
        const sharedSkills = a.skills.filter(s => b.skills.includes(s)).length;
        if (sharedInst || sharedSkills >= 2) {
          newLinks.push({ source: a, target: b });
        }
      }
    }
    setLinks(newLinks);
  }, [people]);

  useEffect(() => {
    if (!layoutRunning) return;

    let frame = 0;
    const simulate = () => {
      const nodes = people;
      const k = 30000;
      const springK = 0.005;
      const damping = 0.85;
      const minDist = 50;

      for (let i = 0; i < nodes.length; i++) {
        nodes[i].vx = 0;
        nodes[i].vy = 0;
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          if (dist < minDist) {
            const force = k / (dist * dist);
            const fx = (dx / dist) * force;
            const fy = (dy / dist) * force;
            nodes[i].vx += fx;
            nodes[i].vy += fy;
            nodes[j].vx -= fx;
            nodes[j].vy -= fy;
          }
        }
      }

      links.forEach(({ source, target }) => {
        const dx = target.x - source.x;
        const dy = target.y - source.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const force = springK * (dist - 100);
        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;
        if (!source.fx) { source.vx += fx; source.vy += fy; }
        if (!target.fx) { target.vx -= fx; target.vy -= fy; }
      });

      nodes.forEach(node => {
        if (node.fx !== undefined && node.fy !== undefined) return;
        node.vx *= damping;
        node.vy *= damping;
        node.x += node.vx;
        node.y += node.vy;
        const margin = 50;
        node.x = Math.max(margin, Math.min(950, node.x));
        node.y = Math.max(margin, Math.min(700, node.y));
      });

      frame++;
      if (frame < 200) {
        animationRef.current = requestAnimationFrame(simulate);
      } else {
        setLayoutRunning(false);
      }
    };
    animationRef.current = requestAnimationFrame(simulate);
    return () => { if (animationRef.current) cancelAnimationFrame(animationRef.current); };
  }, [layoutRunning, people, links]);

  const filteredPeople = useMemo(() => {
    let result = people;
    if (filter) {
      const f = filter.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(f) ||
        p.role.toLowerCase().includes(f) ||
        p.location.toLowerCase().includes(f) ||
        p.institution.toLowerCase().includes(f) ||
        p.skills.some(s => s.toLowerCase().includes(f)) ||
        p.archetype.toLowerCase().includes(f)
      );
    }
    if (filterArchetype !== 'all') {
      result = result.filter(p => p.archetype === filterArchetype);
    }
    if (filterInstitution !== 'all') {
      result = result.filter(p => p.institution === filterInstitution);
    }
    return result;
  }, [people, filter, filterArchetype, filterInstitution]);

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') setSelected(null);
    if (e.key === ' ' && e.target === document.body) {
      e.preventDefault();
      setLayoutRunning(true);
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const dev2027keCount = people.filter(p => p.institution === 'dev2027ke').length;
  const mweaCount = people.filter(p => p.institution === 'MWEA Animation Studio').length;
  const dropoutCount = people.filter(p => p.archetype === 'dropout').length;
  const socializerCount = people.filter(p => p.archetype === 'socializer').length;

  return (
    <WorkspaceLayout currentContext="people">
      <div style={{ position: 'relative', height: 'calc(100vh - 82px)' }}>
        <StatsBar people={filteredPeople} selected={selected} />

        <div style={{
          position: 'absolute',
          top: '130px',
          left: 0,
          right: 0,
          bottom: '50px',
          overflow: 'hidden',
        }}>
          <svg
            ref={canvasRef}
            style={{ width: '100%', height: '100%', cursor: 'crosshair' }}
            onClick={() => setSelected(null)}
          >
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--hairline)" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" style={{ opacity: 0.3 }} />

            <g style={{ pointerEvents: 'none' }}>
              {links.map((link, i) => {
                const sourceInView = filteredPeople.includes(link.source);
                const targetInView = filteredPeople.includes(link.target);
                if (!sourceInView || !targetInView) return null;
                const sameInst = link.source.institution === link.target.institution;
                const color = sameInst ? INSTITUTION_COLORS[link.source.institution] : 'var(--border)';
                const opacity = sameInst ? 0.15 : 0.05;
                return (
                  <Link
                    key={i}
                    source={link.source}
                    target={link.target}
                    color={color}
                    opacity={opacity}
                  />
                );
              })}
            </g>

            <g>
              {filteredPeople.map((person) => (
                <Node
                  key={person.id}
                  person={person}
                  selected={selected?.id === person.id}
                  onSelect={setSelected}
                  onDoubleClick={setSelected}
                />
              ))}
            </g>
          </svg>
        </div>

        <PersonDetailPanel person={selected} onClose={() => setSelected(null)} />
        <Legend />

        <div className="people-controls" style={{
          position: 'fixed',
          bottom: '16px',
          left: '24px',
          right: '24px',
          maxWidth: '1440px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 'var(--space-3)',
          zIndex: 50,
          flexWrap: 'wrap',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="Filter people…"
                value={filter}
                onChange={(e) => setFilter((e.target as HTMLInputElement).value)}
                style={{
                  padding: 'var(--space-2) var(--space-3) var(--space-2) 40px',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-3)',
                  background: 'var(--bg-elev)',
                  color: 'var(--text)',
                  font: 'var(--step-0) var(--sans)',
                  width: '260px',
                  outline: 'none',
                }}
              />
              <span style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-faint)',
                fontSize: '16px',
              }}>🔍</span>
            </div>
            <select
              value={filterArchetype}
              onChange={(e) => setFilterArchetype((e.target as HTMLSelectElement).value)}
              style={{
                padding: 'var(--space-2) var(--space-3)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-3)',
                background: 'var(--bg-elev)',
                color: 'var(--text)',
                font: 'var(--step-0) var(--sans)',
                outline: 'none',
              }}
            >
              <option value="all">All Archetypes</option>
              {Object.entries(ARCHETYPE_LABELS).map(([key, label]) => (
                <option key={key} value={key}>{label} — {key}</option>
              ))}
            </select>
            <select
              value={filterInstitution}
              onChange={(e) => setFilterInstitution((e.target as HTMLSelectElement).value)}
              style={{
                padding: 'var(--space-2) var(--space-3)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-3)',
                background: 'var(--bg-elev)',
                color: 'var(--text)',
                font: 'var(--step-0) var(--sans)',
                outline: 'none',
              }}
            >
              <option value="all">All Institutions</option>
              {Object.keys(INSTITUTION_COLORS).map(name => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
            <span style={{ color: 'var(--text-faint)', font: 'var(--step--1) var(--mono)' }}>
              {filteredPeople.length} / {people.length}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <button
              onClick={() => setLayoutRunning(true)}
              disabled={layoutRunning}
              style={{
                padding: 'var(--space-2) var(--space-4)',
                background: layoutRunning ? 'var(--terrain-pale)' : 'var(--bg-elev)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-2)',
                color: layoutRunning ? 'var(--terrain)' : 'var(--text)',
                font: '500 var(--step--1) var(--sans)',
                cursor: layoutRunning ? 'not-allowed' : 'pointer',
                transition: 'all var(--fast)',
              }}
            >
              {layoutRunning ? 'Relaxing…' : 'Relax Layout'}
            </button>
            <button
              onClick={() => {
                people.forEach(p => { p.x = 100 + Math.random() * 800; p.y = 100 + Math.random() * 600; });
                setPeople([...people]);
              }}
              style={{
                padding: 'var(--space-2) var(--space-4)',
                background: 'var(--bg-elev)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-2)',
                color: 'var(--text)',
                font: '500 var(--step--1) var(--sans)',
                cursor: 'pointer',
                transition: 'all var(--fast)',
              }}
            >
              Scatter
            </button>
          </div>
        </div>

        <div style={{
          position: 'fixed',
          bottom: '80px',
          right: '24px',
          background: 'var(--bg-elev)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-3)',
          padding: 'var(--space-2) var(--space-3)',
          fontSize: 'var(--step--2)',
          fontFamily: 'var(--mono)',
          color: 'var(--text-faint)',
          zIndex: 50,
          maxWidth: '280px',
          textAlign: 'right',
        }}>
          <div>SPACE — Relax layout</div>
          <div>CLICK — Select node</div>
          <div>DBL-CLICK — Pin detail</div>
          <div>ESC — Clear selection</div>
          <div style={{ marginTop: '4px', color: 'var(--terrain)', fontWeight: 500 }}>
            {dev2027keCount} dev2027ke · {mweaCount} MWEA · {dropoutCount} dropouts · {socializerCount} socializers
          </div>
        </div>
      </div>
    </WorkspaceLayout>
  );
}