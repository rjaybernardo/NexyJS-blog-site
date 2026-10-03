"use client";

import { Bar, BarChart, CartesianGrid, Legend, Tooltip, XAxis, YAxis } from "recharts";

type ActivityChartProps = {
  data: { month: string; posts: number; comments: number }[];
};

export default function ActivityChart({ data }: ActivityChartProps) {
  return (
    <div className="h-72 w-full">
      <BarChart data={data} responsive className="h-full w-full" barGap={4}>
        <CartesianGrid vertical={false} className="stroke-border" strokeDasharray="3 3" />
        <XAxis dataKey="month" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} width={32} />
        <Tooltip
          cursor={{ className: "fill-muted" }}
          contentStyle={{
            background: "var(--popover)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            color: "var(--popover-foreground)",
            fontSize: 12,
          }}
        />
        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
        <Bar dataKey="posts" name="Posts published" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
        <Bar dataKey="comments" name="Comments" fill="var(--chart-2)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </div>
  );
}
