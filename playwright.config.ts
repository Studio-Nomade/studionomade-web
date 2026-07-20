import { defineConfig } from "@playwright/test";

const isCI = Boolean(process.env.CI);

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  reporter: isCI ? "github" : "list",
  use: {
    trace: "on-first-retry"
  },
  projects: [
    { name: "web", use: { baseURL: "http://127.0.0.1:3000" } },
    { name: "admin", use: { baseURL: "http://127.0.0.1:3001" } }
  ],
  webServer: [
    {
      command: "pnpm --filter @studionomade/web dev --hostname 127.0.0.1 --port 3000",
      url: "http://127.0.0.1:3000",
      reuseExistingServer: !isCI
    },
    {
      command: "pnpm --filter @studionomade/admin dev --hostname 127.0.0.1 --port 3001",
      url: "http://127.0.0.1:3001",
      reuseExistingServer: !isCI
    }
  ]
});
