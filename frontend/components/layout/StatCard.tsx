import type { LucideIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const colorMap: Record<string, string> = {
  blue: "from-blue-500/10 to-blue-600/5 border-blue-100",
  green: "from-emerald-500/10 to-emerald-600/5 border-emerald-100",
  orange: "from-orange-500/10 to-orange-600/5 border-orange-100",
  purple: "from-purple-500/10 to-purple-600/5 border-purple-100",
  indigo: "from-indigo-500/10 to-indigo-600/5 border-indigo-100",
};

export function StatCard({
  title,
  value,
  icon: Icon,
  color = "indigo",
  trend,
}: {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color?: keyof typeof colorMap;
  trend?: string;
}) {
  return (
    <Card
      className={cn(
        "overflow-hidden border bg-gradient-to-br",
        colorMap[color] ?? colorMap.indigo
      )}
    >
      <CardContent className="flex items-center justify-between p-6">
        <div>
          <p className="text-sm font-medium text-zinc-600">{title}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-zinc-900">
            {value}
          </p>
          {trend ? (
            <p className="mt-1 text-xs text-zinc-500">{trend}</p>
          ) : null}
        </div>
        <div className="rounded-full bg-white/80 p-3 shadow-inner">
          <Icon className="h-6 w-6 text-indigo-600" />
        </div>
      </CardContent>
    </Card>
  );
}
