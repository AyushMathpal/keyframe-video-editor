"use client";

import { useAtom, useSetAtom } from "jotai";
import { useState } from "react";
import { Button } from "~/components/ui/Button";
import { Input } from "~/components/ui/Input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/Card";
import {
  userAtom,
  authModeAtom,
  isAuthLoadingAtom,
  authErrorAtom,
} from "~/store/user";
import type { AuthMode } from "~/types/user";

export function AuthForm() {
  const [authMode, setAuthMode] = useAtom(authModeAtom);
  const [isLoading, setIsLoading] = useAtom(isAuthLoadingAtom);
  const [error, setError] = useAtom(authErrorAtom);
  const setUser = useSetAtom(userAtom);

  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Form validation
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Invalid email format";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (authMode === "signup") {
      if (!name) {
        newErrors.name = "Name is required";
      }
      if (password !== confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      // Simulate API call - replace with actual backend call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Create user object to send to backend
      const userData = {
        email,
        name: authMode === "signup" ? name : (email.split("@")[0] ?? "User"),
      };

      // Set user in store
      setUser(userData);

      // Clear form
      setEmail("");
      setPassword("");
      setName("");
      setConfirmPassword("");
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAuthMode = () => {
    setAuthMode((prev: AuthMode) => (prev === "login" ? "signup" : "login"));
    setErrors({});
    setError(null);
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle>
          {authMode === "login" ? "Welcome back" : "Create account"}
        </CardTitle>
        <CardDescription>
          {authMode === "login"
            ? "Sign in to continue to Keyframe"
            : "Sign up to start editing with AI"}
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <div className="bg-destructive/10 border-destructive/20 rounded-md border p-3">
              <p className="text-body-sm text-destructive">{error}</p>
            </div>
          )}

          {authMode === "signup" && (
            <Input
              label="Name"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={errors.name}
              disabled={isLoading}
            />
          )}

          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
            disabled={isLoading}
          />

          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
            disabled={isLoading}
          />

          {authMode === "signup" && (
            <Input
              label="Confirm Password"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              error={errors.confirmPassword}
              disabled={isLoading}
            />
          )}
        </CardContent>

        <CardFooter className="flex-col gap-4">
          <Button
            type="submit"
            className="w-full"
            size="lg"
            isLoading={isLoading}
          >
            {authMode === "login" ? "Sign in" : "Create account"}
          </Button>

          <p className="text-body-sm text-muted-foreground">
            {authMode === "login"
              ? "Don't have an account? "
              : "Already have an account? "}
            <button
              type="button"
              onClick={toggleAuthMode}
              className="text-primary font-medium hover:underline"
            >
              {authMode === "login" ? "Sign up" : "Sign in"}
            </button>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
