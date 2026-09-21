export type AppId = "web" | "admin";

export interface AppIdentity {
  id: AppId;
  name: string;
  description: string;
}
