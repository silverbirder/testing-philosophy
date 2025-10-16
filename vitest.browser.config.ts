import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    projects: [
      {
        test: {
          include: ["src/**/*.{test,spec}.ts"],
          name: "unit",
          environment: "node",
        },
      },
      {
        test: {
          include: ["src/**/*.{test,spec}.tsx"],
          browser: {
            enabled: true,
            headless: true,
            provider: "playwright",
            // https://vitest.dev/guide/browser/playwright
            instances: [{ browser: "chromium" }],
          },
        },
      },
    ],
  },
});
