"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface Point {
  date: string;
  present: number;
  absent: number;
}

export function AttendanceTrendChart({ data }: { data: Point[] }) {
  return (
    <ResponsiveContainer width="100%" height={320}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-zinc-200" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11 }}
          minTickGap={24}
          className="text-zinc-600"
        />
        <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
        <Tooltip
          contentStyle={{ borderRadius: 8, border: "1px solid #e4e4e7" }}
        />
        <Legend />
        <Line
          type="monotone"
          dataKey="present"
          name="Present"
          stroke="#22c55e"
          strokeWidth={2}
          dot={false}
        />
        <Line
          type="monotone"
          dataKey="absent"
          name="Absent"
          stroke="#ef4444"
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
