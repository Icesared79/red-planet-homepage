// LAND-5.1 (2026-10-22): verify a homepage deploy with the Vercel CLI only. The stored REST token
// (%APPDATA%\com.vercel.cli\Data\auth.json) is rejected; the CLI's own login is not, and `vercel api`
// makes authenticated REST calls through it. Nothing here reads a token.
//
// This repo deploys ON PUSH to main (Vercel GitHub integration), so "deploy" is the push and this script is the
// evidence: the production deployment built from the pushed commit is READY, redplanetdata.com is in its alias table
// per `vercel inspect`, and each given path answers 200 on the live domain.
//
//   node scripts/verify_deploy.mjs [--sha <commit>] [--paths how-red-planet-works,how-atlasland-works] [--wait-minutes 10]
//
// "/" is always checked; --paths adds pages, written WITHOUT a leading slash (Git Bash rewrites "/x" into a Windows
// path before node sees it). --sha defaults to origin/main. Waits (foreground) for the deployment to appear and finish, up to --wait-minutes.
import { execSync } from "node:child_process";

const PROJECT_ID = "prj_rBSimqH84S23v8UwNjnl7tGvtI2e";
const SCOPE = "pauls-projects-cd2bc470";
const DOMAIN = "https://redplanetdata.com";

const arg = (name, dflt) => {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 ? process.argv[i + 1] : dflt;
};
const sha = arg("sha", execSync("git rev-parse origin/main", { encoding: "utf8" }).trim());
const paths = ["/", ...arg("paths", "").split(",").filter(Boolean).map((p) => "/" + p.replace(/^\/+/, ""))];
const waitMs = Number(arg("wait-minutes", "10")) * 60_000;

const vercel = (cmd) =>
  execSync(`vercel ${cmd} --scope ${SCOPE}`, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], shell: true });
const vercelAll = (cmd) =>
  execSync(`vercel ${cmd} --scope ${SCOPE} 2>&1`, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], shell: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let dep;
const started = Date.now();
for (;;) {
  const list = JSON.parse(vercel(`api "/v6/deployments?projectId=${PROJECT_ID}&target=production&limit=20"`));
  dep = list.deployments.find((d) => d.meta?.githubCommitSha === sha);
  const state = dep?.readyState ?? dep?.state;
  if (dep && ["READY", "ERROR", "CANCELED", "BLOCKED"].includes(state)) break;
  if (Date.now() - started > waitMs) {
    console.error(`FAIL: no finished production deployment for ${sha} after ${arg("wait-minutes", "10")} min` + (dep ? ` (last state ${state})` : " (none created)"));
    process.exit(1);
  }
  await sleep(15_000);
}
const created = new Date(dep.created).toLocaleString("en-US", { timeZone: "America/New_York" });
console.log(`deployment ${dep.uid}  ${dep.readyState}  created ${created} ET  commit ${sha.slice(0, 7)}  author ${dep.meta?.githubCommitAuthorLogin ?? "?"}`);
if (dep.readyState !== "READY") {
  console.error(`FAIL: deployment is ${dep.readyState}`);
  process.exit(1);
}

const inspect = vercelAll(`inspect ${dep.uid}`);
const aliasBlock = inspect.split(/\n\s*Aliases\s*\n/)[1]?.split(/\n\s*Builds\s*\n/)[0] ?? "";
const aliased = aliasBlock.split("\n").some((l) => l.trim().replace(/^\S+\s+/, "") === DOMAIN);
console.log(`vercel inspect: ${DOMAIN} ${aliased ? "IS" : "is NOT"} in the alias table`);

let ok = aliased;
for (const p of paths) {
  const res = await fetch(DOMAIN + p, { redirect: "manual", headers: { "cache-control": "no-cache" } });
  console.log(`GET ${p} -> ${res.status}`);
  ok &&= res.status === 200;
}
console.log(ok ? "PASS" : "FAIL");
process.exit(ok ? 0 : 1);
