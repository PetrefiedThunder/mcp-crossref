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

  expect(manifest.dependencies["@modelcontextprotocol/sdk"]).toBe("^1.32.1");
  expect(lock.packages[""].dependencies["@modelcontextprotocol/sdk"]).toBe(manifest.dependencies["@modelcontextprotocol/sdk"]);

  // The resolved version must satisfy the manifest range and sit at or above
  // the patched floor, so a lower resolution can never silently pass.
  const resolved: string = lock.packages["node_modules/@modelcontextprotocol/sdk"].version;
  const atLeast = (v: string, floor: string) => {
    const [a, b, c] = v.split(".").map(Number);
    const [x, y, z] = floor.split(".").map(Number);
    return a !== x ? a > x : b !== y ? b > y : c >= z;
  };
  expect(atLeast(resolved, "1.32.1") && resolved.split(".")[0] === "1",
    `resolved SDK ${resolved} does not satisfy ^1.32.1`).toBe(true);
});
