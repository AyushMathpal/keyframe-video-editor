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
import { userAtom, authModeAtom, authErrorAtom } from "~/store/user";
import type { AuthMode } from "~/types/user";
import { useRegisterUser } from "~/api";

export function AuthForm() {
  const [authMode, setAuthMode] = useAtom(authModeAtom);
  const [error, setError] = useAtom(authErrorAtom);
  const setUser = useSetAtom(userAtom);

  // Form state (MVP: no password auth)
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");

  // Form validation errors
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // API mutation for registration
  const registerMutation = useRegisterUser();

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Invalid email format";
    }

    if (authMode === "signup") {
      if (!name) {
        newErrors.name = "Name is required";
      }
    }

    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) return;

    registerMutation.mutate(
      {
        email,
        name: authMode === "signup" ? name : (email.split("@")[0] ?? "User"),
      },
      {
        onSuccess: (data) => {
          setUser({
            id: data.id,
            email: data.email,
            name: data.name,
          });
          // Clear form
          setEmail("");
          setName("");
        },
        onError: (err) => {
          setError(
            err.response?.data?.detail ??
              "An error occurred. Please try again.",
          );
        },
      },
    );
  };

  const toggleAuthMode = () => {
    setAuthMode((prev: AuthMode) => (prev === "login" ? "signup" : "login"));
    setFormErrors({});
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
              error={formErrors.name}
              disabled={registerMutation.isPending}
            />
          )}

          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={formErrors.email}
            disabled={registerMutation.isPending}
          />
        </CardContent>

        <CardFooter className="flex-col gap-4">
          <Button
            type="submit"
            className="w-full"
            size="lg"
            isLoading={registerMutation.isPending}
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
