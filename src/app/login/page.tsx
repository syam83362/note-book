import Link from "next/link";
import { GoogleSignIn } from "@/components/auth/google-sign-in";

export default function LoginPage() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 items-center px-5 py-14 sm:px-8 sm:py-20 lg:px-12">
      <section className="mx-auto w-full max-w-md rounded-xl border border-amber-300 bg-white p-6 sm:p-8">
        <Link
          className="text-sm font-medium text-stone-500 hover:text-stone-900"
          href="/"
        >
          ← Back to home
        </Link>
        <p className="mt-8 text-xs font-semibold uppercase tracking-[0.14em] text-stone-500">
          Welcome to DevLearn
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-stone-950">
          Sign in to your learning space
        </h1>
        <p className="mt-3 text-sm leading-6 text-stone-600">
          Use your Google account to continue to your group&apos;s shared
          learning workspace.
        </p>
        <div className="mt-7">
          <GoogleSignIn />
        </div>
      </section>
    </main>
  );
}
