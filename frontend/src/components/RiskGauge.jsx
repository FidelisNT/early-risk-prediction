import { RadialBar, RadialBarChart, ResponsiveContainer } from "recharts";

/**
 * Semicircular gauge used everywhere a disease prediction is displayed.
 * `isPositive` drives the color: coral for a positive (at-risk) result,
 * teal for negative - this pairing is reserved for this one signal
 * throughout the whole UI, so it always reads as meaningful.
 *
 * Uses ResponsiveContainer (percentage-based width) rather than a fixed
 * pixel width, so it scales cleanly at any column/viewport size instead of
 * overflowing or looking cramped on narrow mobile layouts.
 */
export default function RiskGauge({ label, percentage, isPositive, height = 110 }) {
  const color = isPositive ? "var(--vitalis-coral)" : "var(--vitalis-teal)";
  const data = [{ value: Math.max(0, Math.min(100, percentage)), fill: color }];

  return (
    <div className="risk-gauge-card">
      <div className="risk-gauge" style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            cx="50%"
            cy="95%"
            innerRadius="70%"
            outerRadius="100%"
            barSize={14}
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
        </ResponsiveContainer>
        <div className="risk-gauge-value">
          <span className="risk-gauge-pct" style={{ color }}>
            {percentage.toFixed(0)}%
          </span>
        </div>
      </div>
      <div className="risk-gauge-label">{label}</div>
    </div>
  );
}
