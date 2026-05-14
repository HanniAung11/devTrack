import type { ButtonHTMLAttributes } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement>;

export default function Button({ children, ...props }: Props) {
  return (
    <button
      className="rounded-md bg-zinc-900 px-4 py-2 text-white disabled:cursor-not-allowed disabled:opacity-60"
      {...props}
    >
      {children}
    </button>
  );
}
