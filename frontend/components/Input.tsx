import type { InputHTMLAttributes } from "react";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
};

export default function Input({ label, ...props }: Props) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="font-medium text-zinc-700">{label}</span>
      <input
        className="rounded-md border border-zinc-300 px-3 py-2 outline-none focus:border-zinc-500"
        {...props}
      />
    </label>
  );
}
