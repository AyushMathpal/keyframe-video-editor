import { Auth } from "~/components/auth";
import { Zap } from "lucide-react";

export default function Home() {
  return (
    <main className="bg-background flex min-h-screen flex-col items-center justify-center p-6">
      {/* Logo */}
      <div className="mb-8 flex items-center gap-2">
        <div className="bg-primary flex h-8 w-8 items-center justify-center rounded-lg">
          <Zap className="text-primary-foreground h-4 w-4" />
        </div>
        <span className="text-title font-semibold">Keyframe</span>
      </div>

      {/* Auth Form */}
      <Auth />

      {/* Footer */}
      <p className="text-caption text-muted-foreground mt-8">
        AI-powered video editing
      </p>
    </main>
  );
}
