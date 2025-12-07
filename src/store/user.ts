/**
 * User state management with Jotai
 * @see https://jotai.org/docs
 */

import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import type { User, AuthMode } from "~/types/user";

// Persisted user atom - survives page refresh
export const userAtom = atomWithStorage<User | null>("keyframe-user", null);

// Auth UI state
export const authModeAtom = atom<AuthMode>("login");
export const isAuthLoadingAtom = atom(false);
export const authErrorAtom = atom<string | null>(null);

// Derived atom - check if user is logged in
export const isLoggedInAtom = atom((get) => get(userAtom) !== null);

// Form state atoms
export const loginFormAtom = atom({
  email: "",
  password: "",
});

export const signupFormAtom = atom({
  email: "",
  name: "",
  password: "",
  confirmPassword: "",
});

// Actions
export const clearAuthErrorAtom = atom(null, (_get, set) => {
  set(authErrorAtom, null);
});

export const logoutAtom = atom(null, (_get, set) => {
  set(userAtom, null);
  set(authErrorAtom, null);
});


