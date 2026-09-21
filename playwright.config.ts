import { defineConfig } from "@playwright/test";

const isCI = Boolean(process.env.CI);

export default defineConfig({
  testDir: "./tests/e2e",
  snapshotPathTemplate: "{testDir}/{testFilePath}-snapshots/{arg}-{projectName}{ext}",
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  reporter: isCI ? "github" : "list",
  use: {
    trace: "on-first-retry"
  },
  projects: [
    {
      name: "web",
      testMatch: /(?:web\.smoke|campaign|motion)\.spec\.ts/,
      testIgnore: /visual\//,
      use: { baseURL: "http://127.0.0.1:3000" }
    },
    {
      name: "admin",
      testMatch: /admin\.smoke\.spec\.ts/,
      use: { baseURL: "http://127.0.0.1:3101" }
    },
    {
      name: "visual",
      testMatch: /visual\/.*\.spec\.ts/,
      use: {
        baseURL: "http://127.0.0.1:3000",
        reducedMotion: "reduce",
        deviceScaleFactor: 1
      }
    }
  ],
  webServer: [
    {
      command: "pnpm --filter @studionomade/web dev --hostname 127.0.0.1 --port 3000",
      url: "http://127.0.0.1:3000",
      reuseExistingServer: !isCI
    },
    {
      command: "pnpm --filter @studionomade/admin dev --hostname 127.0.0.1 --port 3101",
      url: "http://127.0.0.1:3101",
      reuseExistingServer: !isCI
    }
  ]
});
