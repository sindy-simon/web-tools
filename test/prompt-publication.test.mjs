import { test } from "node:test";
import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import { constants } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

test("検証未完了のpromptツールを公開導線とサイトマップから外す", async () => {
  const [index, sitemap] = await Promise.all([
    readFile(resolve(repoRoot, "index.html"), "utf8"),
    readFile(resolve(repoRoot, "sitemap.xml"), "utf8"),
  ]);

  assert.doesNotMatch(index, /href=["']\.\/prompt\.html["']/);
  assert.doesNotMatch(sitemap, /https:\/\/mini-tools\.net\/prompt\.html/);
});

test("promptツールを公開ページとして残さず、台帳では保留として記録する", async () => {
  await assert.rejects(
    access(resolve(repoRoot, "prompt.html"), constants.F_OK),
  );

  const [readme, links] = await Promise.all([
    readFile(resolve(repoRoot, "README.md"), "utf8"),
    readFile(resolve(repoRoot, "LINKS.md"), "utf8"),
  ]);

  assert.match(readme, /## 保留中（15本）[\s\S]*`prompt`/);
  assert.match(links, /## 保留中（15本）[\s\S]*`prompt`/);
});
