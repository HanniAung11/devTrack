import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4">
      <h1 className="text-4xl font-bold text-zinc-900">404</h1>
      <p className="text-zinc-600">This page could not be found.</p>
      <Link className="text-indigo-600 hover:underline" href="/">
        Back home
      </Link>
    </div>
  );
}
