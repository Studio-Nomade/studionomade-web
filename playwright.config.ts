import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

import { defineConfig } from "@playwright/test";

/**
 * Los tests de captura de leads consultan Supabase directamente y necesitan
 * SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en el proceso de Playwright. Next
 * carga `apps/web/.env.local` por su cuenta, pero Playwright no, así que sin
 * esto el test falla con "Supabase local environment is required" aunque el
 * entorno esté perfectamente levantado.
 */
function loadLocalEnv() {
  const file = resolve("apps/web/.env.local");
  if (!existsSync(file)) return;
  for (const line of readFileSync(file, "utf8").split("\n")) {
    const match = /^\s*([A-Z0-9_]+)\s*=\s*(.*)$/.exec(line);
    if (!match) continue;
    const [, key, rawValue] = match;
    if (process.env[key]) continue;
    process.env[key] = rawValue.trim().replace(/^["']|["']$/g, "");
  }
}

loadLocalEnv();

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
