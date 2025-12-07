/**
 * User types for Keyframe
 */

export interface User {
  id?: string;
  email: string;
  name: string;
  avatarUrl?: string;
  createdAt?: Date;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupData {
  email: string;
  name: string;
  password: string;
}

export type AuthMode = "login" | "signup";

