"use client";

import { useAtomValue } from "jotai";
import { isLoggedInAtom } from "~/store/user";
import { AuthForm } from "./AuthForm";
import { UserInfo } from "./UserInfo";

export function Auth() {
  const isLoggedIn = useAtomValue(isLoggedInAtom);

  return isLoggedIn ? <UserInfo /> : <AuthForm />;
}

export { AuthForm } from "./AuthForm";
export { UserInfo } from "./UserInfo";
