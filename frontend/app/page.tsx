import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-indigo-50 to-zinc-50 px-4">
      <div className="max-w-lg text-center">
        <h1 className="text-4xl font-bold tracking-tight text-zinc-900">
          DevTrack
        </h1>
        <p className="mt-3 text-lg text-zinc-600">
          Training batch management for bootcamps and mentorship programs.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/login"
            className="rounded-lg bg-indigo-600 px-6 py-3 font-medium text-white shadow hover:bg-indigo-700"
          >
            Sign in
          </Link>
          <Link
            href="/register"
            className="rounded-lg border border-zinc-300 bg-white px-6 py-3 font-medium text-zinc-900 hover:bg-zinc-50"
          >
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}
