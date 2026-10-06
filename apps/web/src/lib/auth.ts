export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "MODERATOR";
};

export type UserStatus = "ACTIVE" | "INACTIVE";
