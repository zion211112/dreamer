// Seven guardian seals + the Hall 8 doorway. Static SVG, 720×405,
// copper and emerald on void. Forged once — never randomized.
const C = "#c8763c";
const E = "#1a7a5c";
const A = "#e0a040";

function Frame({ children, line }: { children: React.ReactNode; line: string }) {
  return (
    <svg viewBox="0 0 720 405" className="h-auto w-full" role="img" aria-label={line}>
      <rect x="0" y="0" width="720" height="405" fill="#06060f" />
      <rect x="14" y="14" width="692" height="377" fill="none" stroke={C} strokeWidth="1.5" opacity="0.7" />
      <rect x="24" y="24" width="672" height="357" fill="none" stroke={E} strokeWidth="1" opacity="0.6" />
      {children}
      <text x="360" y="368" textAnchor="middle" fill={A} fontSize="15" letterSpacing="3" style={{ fontFamily: "JetBrains Mono, monospace", textTransform: "uppercase" }}>
        {line}
      </text>
    </svg>
  );
}

function Seal1() {
  // Sphinx: golden-ratio rectangles, one eye open, one closed.
  const rects = [
    [250, 90, 220, 136],
    [250, 226, 136, 84],
    [386, 226, 84, 84]
  ] as const;
  return (
    <Frame line="The riddle is the answer.">
      {rects.map(([x, y, w, h], i) => (
        <rect key={i} x={x} y={y} width={w} height={h} fill="none" stroke={i === 0 ? C : E} strokeWidth="1.5" />
      ))}
      <circle cx={315} cy={150} r={16} fill={A} />
      <circle cx={405} cy={150} r={16} fill="none" stroke={A} strokeWidth="2" />
      <circle cx={405} cy={150} r={5} fill={A} />
      <line x1={250} y1={310} x2={470} y2={310} stroke={C} strokeWidth="1" />
    </Frame>
  );
}

function Seal2() {
  // Anubis: the scale — feather against heart.
  return (
    <Frame line="What is light is heavy.">
      <line x1={360} y1={70} x2={360} y2={120} stroke={C} strokeWidth="2" />
      <line x1={250} y1={120} x2={470} y2={120} stroke={C} strokeWidth="2" />
      <line x1={250} y1={120} x2={225} y2={190} stroke={E} strokeWidth="1.5" />
      <line x1={250} y1={120} x2={275} y2={190} stroke={E} strokeWidth="1.5" />
      <path d="M200 190 A25 25 0 0 0 250 190 A25 25 0 0 0 300 190" fill="none" stroke={E} strokeWidth="1.5" />
      <ellipse cx={250} cy={165} rx={7} ry={16} fill="none" stroke={A} strokeWidth="1.5" />
      <line x1={470} y1={120} x2={445} y2={190} stroke={E} strokeWidth="1.5" />
      <line x1={470} y1={120} x2={495} y2={190} stroke={E} strokeWidth="1.5" />
      <path d="M420 190 A25 25 0 0 0 470 190 A25 25 0 0 0 520 190" fill="none" stroke={E} strokeWidth="1.5" />
      <circle cx={470} cy={168} r={10} fill={C} opacity="0.85" />
      <rect x={345} y={200} width={30} height={110} fill="none" stroke={C} strokeWidth="2" />
      <line x1={300} y1={310} x2={420} y2={310} stroke={C} strokeWidth="1" />
    </Frame>
  );
}

function Seal3() {
  // Seshat: seven-pointed star, eye at center, book below.
  const star = Array.from({ length: 14 })
    .map((_, i) => {
      const r = i % 2 === 0 ? 95 : 42;
      const a = (Math.PI / 7) * i - Math.PI / 2;
      return `${(360 + r * Math.cos(a)).toFixed(1)},${(185 + r * Math.sin(a)).toFixed(1)}`;
    })
    .join(" ");
  return (
    <Frame line="What is written survives.">
      <polygon points={star} fill="none" stroke={C} strokeWidth="1.5" />
      <ellipse cx={360} cy={185} rx={22} ry={13} fill="none" stroke={A} strokeWidth="2" />
      <circle cx={360} cy={185} r={5} fill={A} />
      <rect x={320} y={280} width={80} height={26} fill="none" stroke={E} strokeWidth="1.5" />
      <line x1={360} y1={280} x2={360} y2={306} stroke={E} strokeWidth="1.5" />
    </Frame>
  );
}

function Seal4() {
  // Thoth: writing table, scroll unfurling.
  return (
    <Frame line="The word precedes the world.">
      <line x1={180} y1={290} x2={540} y2={290} stroke={C} strokeWidth="2" />
      <line x1={220} y1={290} x2={220} y2={330} stroke={C} strokeWidth="1.5" />
      <line x1={500} y1={290} x2={500} y2={330} stroke={C} strokeWidth="1.5" />
      <path d="M240 200 C 320 160, 380 240, 460 190 S 520 150, 540 170" fill="none" stroke={E} strokeWidth="2" />
      <path d="M240 200 C 320 240, 380 160, 460 210" fill="none" stroke={E} strokeWidth="1" opacity="0.7" />
      {[0, 1, 2, 3].map((i) => (
        <line key={i} x1={300 + i * 40} y1={120} x2={300 + i * 40} y2={150} stroke={A} strokeWidth="1.5" />
      ))}
      <circle cx={360} cy={100} r={4} fill={A} />
    </Frame>
  );
}

function Seal5() {
  // Maat: feather against a still scale, cosmic backdrop.
  return (
    <Frame line="The balance is not equal. It is just.">
      {[
        [140, 90], [220, 60], [500, 80], [580, 150], [170, 260], [550, 260]
      ].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={2.5} fill={A} opacity="0.8" />
      ))}
      <line x1={360} y1={90} x2={360} y2={290} stroke={C} strokeWidth="2" />
      <line x1={270} y1={130} x2={450} y2={130} stroke={C} strokeWidth="2" />
      <line x1={270} y1={130} x2={270} y2={210} stroke={E} strokeWidth="1" />
      <line x1={450} y1={130} x2={450} y2={210} stroke={E} strokeWidth="1" />
      <ellipse cx={270} cy={190} rx={9} ry={26} fill="none" stroke={A} strokeWidth="2" />
      <line x1={270} y1={164} x2={270} y2={216} stroke={A} strokeWidth="1" />
      <circle cx={450} cy={195} r={16} fill="none" stroke={E} strokeWidth="2" />
      <line x1={300} y1={290} x2={420} y2={290} stroke={C} strokeWidth="1.5" />
    </Frame>
  );
}

function Seal6() {
  // Ptah: hands on the wheel, vessel forming.
  return (
    <Frame line="What is spoken becomes.">
      <ellipse cx={360} cy={270} rx={130} ry={22} fill="none" stroke={C} strokeWidth="2" />
      <ellipse cx={360} cy={270} rx={70} ry={12} fill="none" stroke={E} strokeWidth="1.5" />
      <path d="M330 270 C 330 220, 345 200, 360 190 C 375 200, 390 220, 390 270 Z" fill="none" stroke={A} strokeWidth="2" />
      <path d="M285 140 C 300 170, 320 185, 335 195 M435 140 C 420 170, 400 185, 385 195" fill="none" stroke={E} strokeWidth="2" strokeLinecap="round" />
      <circle cx={285} cy={135} r={7} fill="none" stroke={E} strokeWidth="1.5" />
      <circle cx={435} cy={135} r={7} fill="none" stroke={E} strokeWidth="1.5" />
    </Frame>
  );
}

function Seal7() {
  // Khnum: two vessels pouring into one.
  return (
    <Frame line="The clay remembers.">
      <path d="M270 120 L300 120 L295 180 L275 180 Z" fill="none" stroke={E} strokeWidth="2" />
      <path d="M450 120 L420 120 L425 180 L445 180 Z" fill="none" stroke={E} strokeWidth="2" />
      {[0, 1, 2].map((i) => (
        <g key={i} stroke={A} strokeWidth="1.5" opacity={0.9 - i * 0.25}>
          <line x1={287 - i * 3} y1={185} x2={340 - i * 8} y2={250} />
          <line x1={433 + i * 3} y1={185} x2={380 + i * 8} y2={250} />
        </g>
      ))}
      <path d="M320 250 L400 250 L390 310 L330 310 Z" fill="none" stroke={C} strokeWidth="2" />
      <ellipse cx={360} cy={250} rx={40} ry={8} fill="none" stroke={C} strokeWidth="1.5" />
    </Frame>
  );
}

const SEALS = [Seal1, Seal2, Seal3, Seal4, Seal5, Seal6, Seal7];

export default function HallBanner({ hall }: { hall: number }) {
  const Seal = SEALS[Math.min(Math.max(hall - 1, 0), 6)];
  return <Seal />;
}
