"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface Row {
  batch_name: string;
  attendance_rate: number;
  submission_rate: number;
}

export function BatchPerformanceChart({ data }: { data: Row[] }) {
  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 8, right: 16, left: 16, bottom: 8 }}
      >
        <CartesianGrid strokeDasharray="3 3" className="stroke-zinc-200" />
        <XAxis type="number" domain={[0, 100]} />
        <YAxis
          type="category"
          dataKey="batch_name"
          width={120}
          tick={{ fontSize: 11 }}
        />
        <Tooltip contentStyle={{ borderRadius: 8 }} />
        <Legend />
        <Bar dataKey="attendance_rate" name="Attendance %" fill="#6366f1" />
        <Bar dataKey="submission_rate" name="Submission %" fill="#22c55e" />
      </BarChart>
    </ResponsiveContainer>
  );
}
