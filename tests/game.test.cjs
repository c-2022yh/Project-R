const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const context = vm.createContext({ performance });
vm.runInContext(fs.readFileSync(path.join(__dirname, "../js/game.js"), "utf8") + "\nthis.logic = { NumberGame, createShuffledNumbers };", context);
const { NumberGame, createShuffledNumbers } = context.logic;

test("500개 숫자판에 1~25가 각각 한 번씩 존재한다", () => {
  const arrangements = new Set();
  for (let i = 0; i < 500; i++) {
    const numbers = Array.from(createShuffledNumbers());
    assert.deepEqual([...numbers].sort((a, b) => a - b), Array.from({ length: 25 }, (_, j) => j + 1));
    arrangements.add(numbers.join(","));
  }
  assert.ok(arrangements.size > 1);
});

test("시작 전 입력·오답·중복 입력은 진행시키지 않는다", () => {
  const game = new NumberGame(() => 100);
  assert.equal(game.select(1), "ignored");
  game.prepare();
  assert.equal(game.select(1), "ignored");
  game.start();
  assert.equal(game.select(2), "wrong");
  assert.equal(game.completedCount, 0);
  assert.equal(game.select(1), "correct");
  assert.equal(game.select(1), "wrong");
  assert.equal(game.nextNumber, 2);
});

test("카운트다운 시간은 제외되고, 25 선택 후 기록이 고정된다", () => {
  let now = 0;
  const game = new NumberGame(() => now);
  game.prepare();
  now = 3000;
  assert.equal(game.elapsedMs, 0);
  game.start();
  for (let n = 1; n <= 24; n++) game.select(n);
  now = 15345;
  assert.equal(game.status, "playing");
  assert.equal(game.select(25), "finished");
  assert.equal(game.elapsedMs, 12345);
  now = 50000;
  assert.equal(game.elapsedMs, 12345);
  assert.equal(game.select(25), "ignored");
  game.prepare();
  assert.equal(game.completedCount, 0);
  assert.equal(game.elapsedMs, 0);
  assert.equal(game.status, "countdown");
});

test("진행 중 start 중복 호출로 시작 시각이 변경되지 않는다", () => {
  let now = 0;
  const game = new NumberGame(() => now);
  game.prepare(); game.start();
  now = 4000; game.start();
  assert.equal(game.elapsedMs, 4000);
  game.reset();
  assert.equal(game.status, "idle");
  assert.equal(game.elapsedMs, 0);
});
