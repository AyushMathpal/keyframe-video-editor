"use client";

import { useApiMutation } from "./useApiQuery";

/**
 * User registration/login payload
 */
export interface RegisterPayload {
  email: string;
  name: string;
}

/**
 * User response from API
 */
export interface UserResponse {
  id: string;
  email: string;
  name: string;
}

/**
 * Project creation payload
 */
export interface ProjectPayload {
  user_id: string;
  name: string;
}

/**
 * Project response from API
 */
export interface ProjectResponse {
  id: string;
  user_id: string;
  name: string;
}

/**
 * Hook for user registration (or login for existing users)
 *
 * @example
 * ```typescript
 * function AuthForm() {
 *   const registerMutation = useRegisterUser();
 *
 *   const handleSubmit = () => {
 *     registerMutation.mutate(
 *       { email: "user@example.com", name: "User" },
 *       {
 *         onSuccess: (data) => {
 *           setUser(data);
 *         },
 *         onError: (error) => {
 *           setError(error.response?.data?.detail ?? "Registration failed");
 *         },
 *       }
 *     );
 *   };
 *
 *   return <button onClick={handleSubmit}>Register</button>;
 * }
 * ```
 */
export function useRegisterUser() {
  return useApiMutation<RegisterPayload, UserResponse>(
    "/api/v1/users/register",
  );
}

/**
 * Hook for creating a project
 *
 * @example
 * ```typescript
 * function CreateProject() {
 *   const createProject = useCreateProject();
 *
 *   const handleCreate = () => {
 *     createProject.mutateAsync(
 *       { user_id: "uuid", name: "My Project" }
 *     ).then((project) => {
 *       console.log("Created project:", project.id);
 *     });
 *   };
 * }
 * ```
 */
export function useCreateProject() {
  return useApiMutation<ProjectPayload, ProjectResponse>(
    "/api/v1/users/projects",
  );
}
