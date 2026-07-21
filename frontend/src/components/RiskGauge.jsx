import { RadialBar, RadialBarChart } from "recharts";

/**
 * Semicircular gauge used everywhere a disease prediction is displayed.
 * `isPositive` drives the color: coral for a positive (at-risk) result,
 * teal for negative - this pairing is reserved for this one signal
 * throughout the whole UI, so it always reads as meaningful.
 */
export default function RiskGauge({ label, percentage, isPositive, size = 150 }) {
  const color = isPositive ? "var(--vitalis-coral)" : "var(--vitalis-teal)";
  const data = [{ value: Math.max(0, Math.min(100, percentage)), fill: color }];
  const height = Math.round(size * 0.62);

  return (
    <div className="risk-gauge" style={{ maxWidth: size, height }}>
      <RadialBarChart
        width={size}
        height={height}
        cx="50%"
        cy="100%"
        innerRadius="72%"
        outerRadius="100%"
        barSize={12}
        data={data}
        startAngle={180}
        endAngle={0}
      >
        <RadialBar
          background={{ fill: "rgba(18, 60, 105, 0.08)" }}
          dataKey="value"
          cornerRadius={8}
          isAnimationActive={false}
        />
      </RadialBarChart>
      <div className="risk-gauge-value">
        <span className="risk-gauge-pct" style={{ color }}>
          {percentage.toFixed(0)}%
        </span>
        <span className="risk-gauge-label">{label}</span>
      </div>
    </div>
  );
}
