import { test } from "node:test";
import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import { constants } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const origin = "https://mini-tools.net";
const publicPages = new Map([
  ["index.html", origin + "/"],
  ["chars.html", origin + "/chars.html"],
  ["wareki.html", origin + "/wareki.html"],
  ["pii.html", origin + "/pii.html"],
  ["about.html", origin + "/about.html"],
  ["contact.html", origin + "/contact.html"],
  ["privacy.html", origin + "/privacy.html"],
]);
const heldTools = [
  "prompt", "birth-year", "tax", "age", "case", "text", "zenhan",
  "diff", "regex", "json", "slug", "size", "recipe", "timestamp",
  "timezone",
];

async function exists(path) {
  try {
    await access(resolve(repoRoot, path), constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

function localTargets(html) {
  const targets = [];
  const attrs = /(?:href|src)=["']([^"']+)["']/g;
  const imports = /\bfrom\s+["']([^"']+)["']/g;
  for (const re of [attrs, imports]) {
    for (const match of html.matchAll(re)) {
      const value = match[1];
      if (value.startsWith("./") || value.startsWith("../") || value === "/") {
        targets.push(value);
      }
    }
  }
  return targets;
}

function targetPath(page, target) {
  const pageUrl = new URL(page === "index.html" ? "/" : "/" + page, origin);
  const url = new URL(target, pageUrl);
  if (url.pathname === "/" || url.pathname.endsWith("/")) return "index.html";
  return decodeURIComponent(url.pathname.slice(1));
}

test("公開ページのcanonical、title、description、h1が揃う", async () => {
  for (const [page, canonical] of publicPages) {
    const html = await readFile(resolve(repoRoot, page), "utf8");
    assert.ok(html.includes('<link rel="canonical" href="' + canonical + '">'), page);
    assert.match(html, /<title>[^<]+<\/title>/, page);
    assert.match(html, /<meta name="description" content="[^"]+">/, page);
    assert.equal((html.match(/<h1(?:\s[^>]*)?>/g) ?? []).length, 1, page);
  }
});

test("公開ページのローカルリンク・読込ファイルに欠落がない", async () => {
  for (const page of [...publicPages.keys(), "sns.html"]) {
    const html = await readFile(resolve(repoRoot, page), "utf8");
    for (const target of localTargets(html)) {
      const path = targetPath(page, target);
      assert.equal(await exists(path), true, page + " -> " + target + " (" + path + ")");
    }
  }
});

test("トップ、サイトマップ、URL台帳の公開候補が一致する", async () => {
  const [index, sitemap, links] = await Promise.all([
    readFile(resolve(repoRoot, "index.html"), "utf8"),
    readFile(resolve(repoRoot, "sitemap.xml"), "utf8"),
    readFile(resolve(repoRoot, "LINKS.md"), "utf8"),
  ]);
  const sitemapUrls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  assert.deepEqual(new Set(sitemapUrls), new Set(publicPages.values()));

  for (const page of ["chars.html", "wareki.html", "pii.html"]) {
    assert.ok(index.includes('href="./' + page + '"'), page);
    assert.ok(links.includes(origin + "/" + page), page);
  }
  assert.equal((index.match(/<li>\s*<a href="\.\/[^"]+\.html">/g) ?? []).length, 3);
  assert.match(links, /## 公開候補のツール（3本）/);
});

test("保留ツールと旧URLを検索対象へ戻さない", async () => {
  const [index, sitemap, sns] = await Promise.all([
    readFile(resolve(repoRoot, "index.html"), "utf8"),
    readFile(resolve(repoRoot, "sitemap.xml"), "utf8"),
    readFile(resolve(repoRoot, "sns.html"), "utf8"),
  ]);
  for (const slug of heldTools) {
    assert.ok(!index.includes('href="./' + slug + '.html"'), slug);
    assert.ok(!sitemap.includes("/" + slug + ".html"), slug);
    assert.equal(await exists(slug + ".html"), false, slug + ".html");
  }
  assert.match(sns, /<meta name="robots" content="noindex,follow">/);
  assert.match(sns, /<link rel="canonical" href="https:\/\/mini-tools\.net\/chars\.html">/);
  assert.doesNotMatch(sitemap, /\/sns\.html/);
});

test("robots、sitemap、ads.txtの公開設定が一致する", async () => {
  const [robots, ads] = await Promise.all([
    readFile(resolve(repoRoot, "robots.txt"), "utf8"),
    readFile(resolve(repoRoot, "ads.txt"), "utf8"),
  ]);
  assert.match(robots, /^User-agent: \*$/m);
  assert.match(robots, /^Allow: \/$/m);
  assert.match(robots, /^Sitemap: https:\/\/mini-tools\.net\/sitemap\.xml$/m);
  assert.match(ads, /^google\.com, pub-\d+, DIRECT, f08c47fec0942fa0$/m);
});
