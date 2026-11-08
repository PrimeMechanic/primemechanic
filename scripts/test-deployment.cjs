const { spawn } = require("node:child_process");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const http = require("node:http");
(async () => {
  const probe = http.createServer();
  await new Promise((r) => probe.listen(0, "127.0.0.1", r));
  const port = probe.address().port;
  await new Promise((r) => probe.close(r));
  const child = spawn(process.execPath, ["server_dist/index.mjs"], {
    env: {
      ...process.env,
      NODE_ENV: "production",
      PORT: String(port),
      DATABASE_URL: "postgres://unused:unused@127.0.0.1:1/unused",
      PUBLIC_APP_URL: "https://mechanic.example",
      STRIPE_WEBHOOK_SECRET: "whsec_local_placeholder",
    },
    stdio: ["ignore", "pipe", "pipe"],
  });
  let log = "";
  child.stdout.on("data", (d) => {
    log += d;
  });
  child.stderr.on("data", (d) => {
    log += d;
  });
  const base = `http://127.0.0.1:${port}`;
  try {
    let ready = false;
    for (let n = 0; n < 600; n++) {
      try {
        if ((await fetch(base)).ok) {
          ready = true;
          break;
        }
      } catch {}
      await new Promise((r) => setTimeout(r, 100));
    }
    assert.ok(ready, log);
    for (const platform of ["ios", "android"]) {
      const response = await fetch(`${base}/mobile-manifest/${platform}`);
      assert.equal(response.status, 200);
      const manifest = await response.json();
      const local = JSON.parse(
        fs.readFileSync(`static-build/${platform}/manifest.json`),
      );
      assert.equal(manifest.launchAsset.url, local.launchAsset.url);
      const bundle = await fetch(
        base + new URL(manifest.launchAsset.url).pathname,
      );
      assert.equal(bundle.status, 200);
      assert.ok(Number(bundle.headers.get("content-length")) > 1000);
      const root = await fetch(base, {
        headers: { "expo-platform": platform },
      });
      assert.equal(root.status, 200);
      assert.equal(
        (await root.json()).launchAsset.url,
        manifest.launchAsset.url,
      );
      console.log(
        `PASS ${platform}: manifest, generated bundle, and platform routing served with Metro stopped`,
      );
    }
    assert.equal((await fetch(base + "/api/auth/me")).status, 401);
    console.log("PASS private API remains authenticated in production bundle");
  } finally {
    child.kill();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
