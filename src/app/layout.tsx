import type { Metadata } from "next";
import Link from "next/link";
import { AuthNavigation } from "@/components/auth/auth-navigation";
import { AuthProvider } from "@/components/auth/auth-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "DevLearn — Learn together",
  description:
    "A private shared learning workspace for DevOps, DevSecOps, and AI.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-full flex-col">
        <AuthProvider>
          <header className="border-b border-stone-200 bg-white">
            <nav
              aria-label="Main navigation"
              className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-4 sm:px-8 lg:px-12"
            >
              <Link
                aria-label="DevLearn home"
                className="inline-flex items-center gap-3 rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-500"
                href="/"
              >
                <span
                  aria-hidden="true"
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-amber-400 bg-amber-50 text-sm font-bold text-stone-900"
                >
                  D
                </span>
                <span className="text-base font-semibold tracking-tight text-stone-950">
                  DevLearn
                </span>
              </Link>
              <AuthNavigation />
            </nav>
          </header>
          <div className="flex-1">{children}</div>
          <footer className="border-t border-stone-200">
            <div className="mx-auto flex w-full max-w-6xl flex-col gap-1 px-5 py-5 text-xs text-stone-500 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-12">
              <span>DevLearn</span>
              <span>A private space for curious minds.</span>
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
