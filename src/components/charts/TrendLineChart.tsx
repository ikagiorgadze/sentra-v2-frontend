import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";

interface TrendLineChartProps {
  data: { day: string; value: number }[];
  color: string;
  domain?: [number, number];
  formatter?: (value: number) => string;
}

export const TrendLineChart = ({ data, color, domain, formatter }: TrendLineChartProps) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
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
        <Line
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={2}
          dot={{ fill: color, r: 3 }}
          activeDot={{ r: 5 }}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};
