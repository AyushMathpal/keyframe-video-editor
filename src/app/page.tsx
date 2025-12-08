"use client";

import { useAtomValue } from "jotai";
import { isLoggedInAtom } from "~/store/user";
import { AuthForm } from "~/components/auth";
import { Dashboard } from "~/components/Dashboard";
import { Zap } from "lucide-react";

export default function Home() {
  const isLoggedIn = useAtomValue(isLoggedInAtom);

  if (isLoggedIn) {
    return <Dashboard />;
  }

  return (
    <main className="bg-background flex min-h-screen flex-col items-center justify-center p-6">
      {/* Background Pattern */}
      <div className="fixed inset-0 -z-10 opacity-30">
        <div className="from-primary/5 absolute inset-0 bg-gradient-to-b via-transparent to-transparent" />
        <div className="from-primary/10 absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] via-transparent to-transparent" />
      </div>

      {/* Logo */}
      <div className="mb-8 flex items-center gap-2">
        <div className="bg-primary flex h-8 w-8 items-center justify-center rounded-lg">
          <Zap className="text-primary-foreground h-4 w-4" />
        </div>
        <span className="text-title font-semibold">Keyframe</span>
      </div>

      {/* Auth Form */}
      <AuthForm />

      {/* Footer */}
      <p className="text-caption text-muted-foreground mt-8">
        AI-powered video editing
      </p>
    </main>
  );
}
