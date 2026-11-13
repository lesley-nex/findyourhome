import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center px-6 py-24 text-center">
      <p className="text-sm font-semibold text-brand">404</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">This home has moved out</h1>
      <p className="mt-2 text-muted">The listing may have been rented, or the link is incorrect.</p>
      <Link href="/" className="mt-6 rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark">
        Search all homes
      </Link>
    </main>
  );
}
