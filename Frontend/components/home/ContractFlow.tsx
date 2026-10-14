import { GlassBlob } from "../site/LiquidGlass";

const nodes = [
  { label: "Relayer", role: "submits the tx", warm: true },
  { label: "Paymaster", role: "refunds the gas", warm: true },
  { label: "Forwarder", role: "checks your signature", warm: false },
  { label: "WhisperChain", role: "stores and settles", warm: false },
];
const xs = [150, 400, 650, 900];
const Y = 118;

function Tube({ x1, x2, begin }: { x1: number; x2: number; begin: number }) {
  const d = `M${x1} ${Y} L${x2} ${Y}`;
  return (
    <g>
      <path d={d} stroke="url(#lgChrome)" strokeWidth="14" strokeLinecap="round" fill="none" />
      <path d={d} stroke="url(#lgRim)" strokeWidth="14" strokeLinecap="round" fill="none" opacity="0.3" />
      <path d={d} stroke="#ffffff" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.5" transform="translate(0 -3.5)" />
      <ellipse rx="10" ry="4.5" fill="url(#lgSpec)" opacity="0.85">
        <animateMotion dur="7s" begin={`${begin}s`} repeatCount="indefinite" path={d} />
        <animate attributeName="opacity" values="0;0.9;0" dur="7s" begin={`${begin}s`} repeatCount="indefinite" />
      </ellipse>
    </g>
  );
}

/** A signed message flowing through the relay path: the warm blocks only carry it, the cool ones act on it. */
export function ContractFlow() {
  return (
    <div className="overflow-x-auto pb-2">
      <svg
        viewBox="0 0 1050 240"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="min-w-[640px] md:w-full md:min-w-0"
        role="img"
        aria-label="A signed message flows through the relayer, the paymaster, the forwarder and the WhisperChain contract."
      >
        {xs.slice(0, -1).map((x, i) => (
          <Tube key={`tube-${i}`} x1={x + 46} x2={xs[i + 1] - 46} begin={i * 1.6} />
        ))}
        <Tube x1={64} x2={xs[0] - 46} begin={0} />
        <Tube x1={xs[3] + 46} x2={986} begin={2.4} />

        {nodes.map((node, i) => (
          <GlassBlob key={node.label} cx={xs[i]} cy={Y} rx={46} ry={46} warm={node.warm} />
        ))}

        <text x="44" y={122} fill="var(--mute)" fontSize="11" letterSpacing="0.14em">
          signed
        </text>
        <text x="1006" y={122} fill="var(--mute)" fontSize="11" letterSpacing="0.14em" textAnchor="end">
          inbox
        </text>

        {nodes.map((node, i) => (
          <g key={`label-${node.label}`}>
            <text
              x={xs[i]}
              y={194}
              fill="currentColor"
              fontSize="12.5"
              fontWeight="500"
              textAnchor="middle"
              letterSpacing="0.12em"
              style={{ textTransform: "uppercase" }}
            >
              {node.label}
            </text>
            <text x={xs[i]} y={212} fill="var(--mute)" fontSize="10.5" textAnchor="middle" letterSpacing="0.08em">
              {node.role}
            </text>
            {node.warm ? (
              <text x={xs[i]} y={229} fill="var(--warm)" fontSize="9.5" textAnchor="middle" letterSpacing="0.18em" style={{ textTransform: "uppercase" }}>
                can&apos;t edit it
              </text>
            ) : null}
          </g>
        ))}
      </svg>
    </div>
  );
}
