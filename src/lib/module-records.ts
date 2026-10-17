import type { ModuleName } from './workspace-data';

export type WorkspaceRecord = { id: string; name: string; type: string; status: string; detail: string; value: string; owner: string; };
const record = (id: string, name: string, type: string, status: string, detail: string, value: string, owner = 'angri.mainyu'): WorkspaceRecord => ({ id, name, type, status, detail, value, owner });
export const moduleInfo: Record<ModuleName, { description: string; namespace: string; metric: string; count: string; }> = {
  Kernel: { description: 'Core coordination layer for the APT ecosystem.', namespace: 'apt.kernel', metric: 'USEFUL WORK', count: '1,284' },
  Network: { description: 'Peer discovery, trusted connections, and shared state.', namespace: 'apt.network', metric: 'CONNECTED PEERS', count: '12' },
  Builds: { description: 'Reproducible artifacts. Verifiable contributions.', namespace: 'apt.builds', metric: 'ARTIFACTS MINTED', count: '08' },
  Operations: { description: 'Execution, transactions, and the pulse of the network.', namespace: 'apt.operations', metric: 'COMPLETED OPERATIONS', count: '142' },
  Studio: { description: 'Design frames to typed React components, in one minimal flow.', namespace: 'apt.studio', metric: 'FRAMES', count: '04' },
  Research: { description: 'Shared knowledge, open questions, and new possibilities.', namespace: 'apt.research', metric: 'ACTIVE THREADS', count: '03' },
};
export const moduleRecords: Record<ModuleName, Record<string, WorkspaceRecord[]>> = {
  Studio: {},
  Kernel: {
    Identity: [record('DID-001','angri.mainyu','OPERATOR','Verified','did:apt:angri.mainyu','Owner'),record('DID-002','system.kernel','SERVICE','Verified','did:apt:system.kernel','Service'),record('DID-003','node.athena','NODE','Verified','did:apt:node.athena','Peer')],
    Protocols: [record('PRT-001','Proof of useful work','CONSENSUS','Active','Contribution verification protocol','v0.4.2'),record('PRT-002','Identity resolution','IDENTITY','Active','Decentralized identity registry','v0.3.1'),record('PRT-003','Artifact attestation','ARTIFACT','Active','Signed build provenance','v0.2.0'),record('PRT-004','Peer discovery','NETWORK','Active','Trusted peer coordination','v0.4.0'),record('PRT-005','Ledger settlement','LEDGER','Active','Finalization and settlement','v0.3.2'),record('PRT-006','Research attribution','RESEARCH','Active','Source and contributor tracking','v0.1.4')],
    Permissions: [record('ACL-001','Workspace owner','ROLE','Active','Kernel, network, builds, operations, research','Full access'),record('ACL-002','Network operator','ROLE','Active','Node management and peer connections','Read / write'),record('ACL-003','Research contributor','ROLE','Active','Research library and experiments','Read / write'),record('ACL-004','Observer','ROLE','Active','All modules · public records only','Read only')],
  },
  Network: {
    Topology: [record('NET-001','kemet-mainnet-01','PRIMARY','Online','Primary coordination node','32 ms'),record('NET-002','node.athena','PEER','Online','Stockholm · eu-north','28 ms','node.athena'),record('NET-003','node.thoth','PEER','Online','Frankfurt · eu-central','41 ms','node.thoth')],
    Nodes: [record('NOD-001','kemet-mainnet-01','VALIDATOR','Online','Primary node · 1,284,092 blocks','32 ms'),record('NOD-002','node.athena','VALIDATOR','Online','Stockholm · 1,284,092 blocks','28 ms','node.athena'),record('NOD-003','node.thoth','RELAY','Online','Frankfurt · 1,284,092 blocks','41 ms','node.thoth'),record('NOD-004','node.horus','OBSERVER','Syncing','Helsinki · 1,284,084 blocks','54 ms','node.horus')],
    Connections: [record('CON-001','Kernel ↔ Athena','ENCRYPTED','Connected','Mutual identity verification complete','28 ms'),record('CON-002','Kernel ↔ Thoth','ENCRYPTED','Connected','Mutual identity verification complete','41 ms'),record('CON-003','Athena ↔ Horus','ENCRYPTED','Connected','Relay channel established','37 ms')],
  },
  Builds: {
    Registry: [record('BLD-008','kemet-kernel','MODULE','Verified','Core coordination runtime','v0.4.2'),record('BLD-007','identity-resolver','SERVICE','Verified','Decentralized identity lookup','v0.3.1'),record('BLD-006','ledger-indexer','SERVICE','Verified','Useful work ledger indexing','v0.2.8'),record('BLD-005','research-toolkit','TOOLKIT','Draft','Attribution and experiment utilities','v0.1.0')],
    Artifacts: [record('ART-008','kernel-runtime.wasm','WASM','Verified','Signed by angri.mainyu · 0x7a2e…f891','284 KB'),record('ART-007','identity.schema.json','SCHEMA','Verified','Signed by system.kernel · 0x3d7e…a82f','12 KB'),record('ART-006','research-toolkit.tar','ARCHIVE','Draft','Awaiting provenance attestation','1.2 MB')],
    Pipelines: [record('PIP-001','Kernel release','RELEASE','Complete','Compile → test → attest → mint','4m 32s'),record('PIP-002','Identity verification','VALIDATION','Complete','Schema → signatures → resolution','1m 08s'),record('PIP-003','Research toolkit','PREVIEW','Queued','Awaiting execution slot','Pending')],
  },
  Operations: {
    Activity: [record('OPS-142','Epoch settlement','SETTLEMENT','Complete','Epoch 042 · 1,284 APT useful work','2 min ago','system.kernel'),record('OPS-141','Network health check','HEALTH','Complete','12 peers checked · no faults detected','8 min ago','system.kernel'),record('OPS-140','Artifact verification','ATTESTATION','Complete','kernel-runtime.wasm · signatures valid','18 min ago')],
    Transactions: [record('TXN-042','Epoch 042 settlement','OUTPUT','Confirmed','0x8f2a…c491 · 24 participants','1,284 APT'),record('TXN-041','Artifact mint','MINT','Confirmed','0x3d7e…a82f · kernel-runtime.wasm','128 APT'),record('TXN-040','Research contribution','OUTPUT','Confirmed','0xa62d…e190 · protocol analysis','64 APT')],
    Health: [record('HLT-001','Kernel runtime','SERVICE','Healthy','All integrity checks passing','99.98%'),record('HLT-002','Peer discovery','SERVICE','Healthy','12 active peers · no dropped connections','99.95%'),record('HLT-003','Ledger indexing','SERVICE','Healthy','Block 1,284,092 · fully synchronized','100%'),record('HLT-004','Artifact storage','SERVICE','Healthy','8 artifacts · all checksums valid','100%')],
  },
  Research: {
    Library: [record('RES-001','Proof of useful work','PAPER','Published','An attribution-first model for coordination','12 references'),record('RES-002','Decentralized identity primitives','NOTE','Published','Identity resolution without central authority','8 references'),record('RES-003','Coordination at the edge','PAPER','In review','Resilient peer-to-peer operating systems','6 references')],
    Experiments: [record('EXP-003','Contribution scoring','EXPERIMENT','Running','Epoch-weighted useful work attribution','Round 03'),record('EXP-002','Peer trust propagation','EXPERIMENT','Running','Trust signal diffusion across 12 nodes','Round 08'),record('EXP-001','Artifact reproducibility','EXPERIMENT','Complete','Deterministic builds across peer runtimes','Round 12')],
    Notes: [record('NTE-003','Epoch 042 observations','FIELD NOTE','Draft','Coordination patterns and contribution quality','Today'),record('NTE-002','Kernel protocol decisions','DECISION','Published','Rationale for the v0.4.2 protocol update','Oct 13'),record('NTE-001','Open questions','RESEARCH','Draft','What makes useful work verifiable?','Oct 12')],
  },
};