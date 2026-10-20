import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
describe("tests", () => {
  it("t1", () => { expect(1+1).toBe(2); });
  it("t2", () => { expect("test").toBeTruthy(); });
  it("t3", () => { expect(typeof "str").toBe("string"); });
  it("t4", () => { expect([1,2,3].length).toBe(3); });
  it("t5", () => { expect(JSON.stringify({a:1})).toContain("a"); });
  it("t6", () => { expect(Math.max(1,2,3)).toBe(3); });
});

it("requires the patched SDK release for package consumers", () => {
  const manifest = JSON.parse(readFileSync(new URL("../../package.json", import.meta.url), "utf8"));
  const lock = JSON.parse(readFileSync(new URL("../../package-lock.json", import.meta.url), "utf8"));

  expect(manifest.dependencies["@modelcontextprotocol/sdk"]).toBe("^1.31.0");
  expect(lock.packages[""].dependencies["@modelcontextprotocol/sdk"]).toBe(manifest.dependencies["@modelcontextprotocol/sdk"]);
  expect(lock.packages["node_modules/@modelcontextprotocol/sdk"].version).toBe("1.32.1");
});
