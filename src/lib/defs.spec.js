import { sumBet, calculateProfit, checkBet } from "./defs";

test("sumBet", () => {
  sumBet({
    r: [1, 5, 50],
    b: [10, 20, 100]
  });
  expect(
    sumBet({
      r: [1, 5, 50],
      b: [10, 20, 100]
    })
  ).toEqual(1 + 5 + 50 + 10 + 20 + 100);

  expect(
    sumBet({
      r: 600,
      x3: 300
    })
  ).toEqual(600 + 300);
});

test("calculateProfit", () => {
  expect(calculateProfit(21, { r: 300, b: 900, x3: 100 })).toEqual({
    r: 600,
    x3: 300
  });
  expect(calculateProfit(12, { e: 10, z1: 10, b: 20 })).toEqual({
    e: 20,
    z1: 30
  });
  expect(
    calculateProfit(19, {
      n19: 10,
      b: 100,
      x3: 100,
      x2: 100,
      s: 100,
      z1: 10,
      z3: 10,
      o: 20,
      sq20: 5,
      ve18: 20,
      ho30: 40,
      sq18: 10
    })
  ).toEqual({
    n19: 360,
    o: 40,
    ve18: 360,
    ho30: 40 * 18,
    sq18: 90
  });
});

test("calculateProfit negative", () => {
  expect(calculateProfit(7, { r: 5000, b: 5000, n99: -5000 })).toEqual({
    r: 10000
  });
});

test("check bet", () => {
  expect(checkBet({ r: 100, b: 100 }));
  expect(checkBet({ r: 100, b: 1 }));

  // not a number
  expect(() => checkBet({ r: 100, b: "sdsd" })).toThrow();

  // negative
  expect(() => checkBet({ r: 100, b: -1 })).toThrow();
  // non existing key
  expect(() => checkBet({ r: 100, xxx: -1 })).toThrow();

  // zero also throw
  expect(() => checkBet({ r: 100, b: 0 })).toThrow();
});

test("calculate profit", () => {
  expect(
    calculateProfit(12, {
      s: 100
    })
  ).toEqual({
    s: 200
  });
  expect(
    calculateProfit(12, {
      sq9: 100
    })
  ).toEqual({});
});
