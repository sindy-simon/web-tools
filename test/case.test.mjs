import { test } from "node:test";
import assert from "node:assert/strict";
import { convertCase } from "../js/lib/case.mjs";

test("snake_case 入力から全形式", () => {
  const r = convertCase("hello_world");
  assert.equal(r.camel, "helloWorld");
  assert.equal(r.pascal, "HelloWorld");
  assert.equal(r.snake, "hello_world");
  assert.equal(r.constant, "HELLO_WORLD");
  assert.equal(r.kebab, "hello-world");
  assert.equal(r.dot, "hello.world");
});

test("camelCase 入力", () => {
  const r = convertCase("helloWorld");
  assert.equal(r.snake, "hello_world");
  assert.equal(r.pascal, "HelloWorld");
});

test("PascalCase 入力", () => {
  const r = convertCase("HelloWorld");
  assert.equal(r.camel, "helloWorld");
  assert.equal(r.kebab, "hello-world");
});

test("kebab-case 入力", () => {
  const r = convertCase("hello-world");
  assert.equal(r.camel, "helloWorld");
  assert.equal(r.constant, "HELLO_WORLD");
});

test("スペース区切り入力", () => {
  const r = convertCase("hello world foo");
  assert.equal(r.camel, "helloWorldFoo");
  assert.equal(r.snake, "hello_world_foo");
});

test("CONSTANT_CASE 入力", () => {
  const r = convertCase("HELLO_WORLD");
  assert.equal(r.camel, "helloWorld");
  assert.equal(r.kebab, "hello-world");
});

test("dot.case 入力", () => {
  const r = convertCase("hello.world");
  assert.equal(r.pascal, "HelloWorld");
});

test("単語1つ", () => {
  const r = convertCase("foo");
  assert.equal(r.camel, "foo");
  assert.equal(r.pascal, "Foo");
  assert.equal(r.constant, "FOO");
});

test("空文字は TypeError", () => {
  assert.throws(() => convertCase(""), TypeError);
});

test("数字混在: user2Name", () => {
  const r = convertCase("user2Name");
  assert.equal(r.snake, "user2_name");
});
