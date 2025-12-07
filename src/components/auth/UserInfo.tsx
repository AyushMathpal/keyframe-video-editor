"use client";

import { useAtom, useSetAtom } from "jotai";
import { userAtom, logoutAtom } from "~/store/user";
import { Button } from "~/components/ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/Card";

export function UserInfo() {
  const [user] = useAtom(userAtom);
  const logout = useSetAtom(logoutAtom);

  if (!user) return null;

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Welcome, {user.name}!</CardTitle>
        <CardDescription>You&apos;re signed in to Keyframe</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-body-sm text-muted-foreground">Email</span>
            <span className="text-body-sm font-medium">{user.email}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-body-sm text-muted-foreground">Name</span>
            <span className="text-body-sm font-medium">{user.name}</span>
          </div>
        </div>

        <div className="pt-2">
          <Button variant="outline" className="w-full" onClick={() => logout()}>
            Sign out
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
