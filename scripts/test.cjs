const { spawnSync } = require("node:child_process");
const result = spawnSync(
  process.execPath,
  [
    "--import",
    "tsx",
    "--test",
    "--test-timeout=60000",
    "tests/security.test.ts",
  ],
  { stdio: "inherit", env: { ...process.env, NODE_ENV: "test" } },
);
process.exit(result.status ?? 1);
