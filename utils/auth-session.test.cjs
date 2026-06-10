const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const ts = require("typescript");

function loadAuthSessionModule() {
  const filePath = path.join(__dirname, "auth-session.ts");
  const source = fs.readFileSync(filePath, "utf8");
  const output = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      esModuleInterop: true,
    },
  }).outputText;

  const module = { exports: {} };
  const fn = new Function("module", "exports", "require", "__dirname", output);
  fn(module, module.exports, require, __dirname);
  return module.exports;
}

test("normalizeVerificationCode keeps only the first six digits", () => {
  const { normalizeVerificationCode } = loadAuthSessionModule();

  assert.equal(normalizeVerificationCode(" 01a2-34 567 "), "012345");
});

test("completeAuthSession finalizes completed future resources before navigating", async () => {
  const { completeAuthSession } = loadAuthSessionModule();
  const events = [];

  const result = await completeAuthSession({
    resource: {
      status: "complete",
      createdSessionId: "sess_future",
      finalize: async () => {
        events.push("finalize");
        return { error: null };
      },
    },
    setActive: async ({ session }) => {
      events.push(`setActive:${session}`);
    },
    onComplete: () => {
      events.push("navigate");
    },
  });

  assert.equal(result.completed, true);
  assert.deepEqual(events, ["finalize", "navigate"]);
});

test("completeAuthSession activates legacy sessions when finalize is unavailable", async () => {
  const { completeAuthSession } = loadAuthSessionModule();
  const events = [];

  const result = await completeAuthSession({
    resource: {
      status: "complete",
      createdSessionId: "sess_legacy",
    },
    setActive: async ({ session }) => {
      events.push(`setActive:${session}`);
    },
    onComplete: () => {
      events.push("navigate");
    },
  });

  assert.equal(result.completed, true);
  assert.deepEqual(events, ["setActive:sess_legacy", "navigate"]);
});

test("completeAuthSession reports incomplete resources without navigating", async () => {
  const { completeAuthSession } = loadAuthSessionModule();
  const events = [];

  const result = await completeAuthSession({
    resource: {
      status: "missing_requirements",
      missingFields: ["password"],
      unverifiedFields: ["email_address"],
    },
    setActive: async ({ session }) => {
      events.push(`setActive:${session}`);
    },
    onComplete: () => {
      events.push("navigate");
    },
  });

  assert.equal(result.completed, false);
  assert.match(result.message, /missing requirements/i);
  assert.deepEqual(events, []);
});
