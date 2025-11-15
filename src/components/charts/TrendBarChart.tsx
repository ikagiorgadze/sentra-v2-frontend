import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";

interface TrendBarChartProps {
  data: { day: string; value: number }[];
  color: string;
  domain?: [number, number];
  formatter?: (value: number) => string;
}

export const TrendBarChart = ({ data, color, domain, formatter }: TrendBarChartProps) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--graphite) / 0.1)" vertical={false} />
        <XAxis
          dataKey="day"
          tick={{ fill: "hsl(var(--graphite))", fontSize: 11, fontFamily: "IBM Plex Mono, monospace" }}
          axisLine={{ stroke: "hsl(var(--graphite) / 0.2)" }}
          tickLine={false}
        />
        <YAxis
          domain={domain}
          tick={{ fill: "hsl(var(--graphite))", fontSize: 11, fontFamily: "IBM Plex Mono, monospace" }}
          axisLine={{ stroke: "hsl(var(--graphite) / 0.2)" }}
          tickLine={false}
          tickFormatter={formatter}
        />
        <Bar
          dataKey="value"
          fill={color}
          radius={[2, 2, 0, 0]}
          isAnimationActive={false}
        />
      </BarChart>
    </ResponsiveContainer>
  );
};
