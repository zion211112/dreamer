export type Hall = {
  n: string;
  name: string;
  discipline: string;
  admin: string;
  gate: string;
  funds: string;
};

// Canonical Atlantean-hybrid guardian identities. Egyptian names are
// banner masks only and stay claimable. These seven never are.
export const RESERVED_HANDLES: string[] = [
  "Thoth_Atlas",
  "Poseidon_Ptah",
  "Nereus_Imhotep",
  "Triton_Ra",
  "Oceanus_Sekhmet",
  "Proteus_Osiris",
  "Amphitrite_Thoth"
];

export const HALLS: Hall[] = [
  { n: "I", name: "Hall of Analysts", discipline: "STEM / Logic", admin: "@Thoth_Atlas", gate: "An impossible math paradox. Bring a pencil.", funds: "Research micro-grants ride on cited proofs." },
  { n: "II", name: "Hall of Architects", discipline: "Systems / Design", admin: "@Poseidon_Ptah", gate: "A structural test across space and time.", funds: "Design retainers from subscribed schools." },
  { n: "III", name: "Hall of Builders", discipline: "Engineering / Field", admin: "@Nereus_Imhotep", gate: "Build it with nothing. That is the brief.", funds: "Build contracts + materials credit lines." },
  { n: "IV", name: "Hall of Intuitioners", discipline: "Philosophy / Spirit", admin: "@Triton_Ra", gate: "Prove it without words.", funds: "Fellowships for the unprovable-but-true." },
  { n: "V", name: "Hall of Healers", discipline: "Life / Biology", admin: "@Oceanus_Sekhmet", gate: "Triage under absolute constraints.", funds: "Clinic pilots + kit financing." },
  { n: "VI", name: "Hall of Growers", discipline: "Agro-Ecology", admin: "@Proteus_Osiris", gate: "Keep a closed system alive.", funds: "Agribusiness credit + tractor scheduling priority." },
  { n: "VII", name: "Hall of Traders", discipline: "Economics / Flow", admin: "@Amphitrite_Thoth", gate: "Create value with zero capital.", funds: "Chama + bank-facing dossiers travel with you." },
  { n: "VIII", name: "Hall of Storytellers", discipline: "Culture / Media", admin: "@Nereid_Maat", gate: "Compress a civilization into one story.", funds: "Commissions for the stories that move money." }
];
