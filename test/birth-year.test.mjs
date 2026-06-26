import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  YEAR_MIN, YEAR_MAX, LATEST_YEAR, NOTABLE,
  getYearData, getLatestData, getAllYears, getChartSeries,
  formatBirths, formatPop, formatTfr, formatLife, formatUniv,
  formatSalary, formatTemp, formatPrecip,
  formatDiff, formatDiffPop, formatDiffBirths, formatDiffSalary,
} from "../js/lib/birth-year.mjs";

describe("定数", () => {
  it("YEAR_MIN=1950, YEAR_MAX=2024, LATEST_YEAR=2023", () => {
    assert.equal(YEAR_MIN, 1950);
    assert.equal(YEAR_MAX, 2024);
    assert.equal(LATEST_YEAR, 2023);
  });

  it("NOTABLEに1966・1973・1989・2005・2023が含まれる", () => {
    assert.ok(NOTABLE[1966]);
    assert.ok(NOTABLE[1973]);
    assert.ok(NOTABLE[1989]);
    assert.ok(NOTABLE[2005]);
    assert.ok(NOTABLE[2023]);
  });
});

describe("getYearData", () => {
  it("1966年 TFR=1.58（丙午）", () => {
    assert.equal(getYearData(1966).tfr, 1.58);
  });

  it("1966年 出生数 < 1965年（丙午の急減）", () => {
    assert.ok(getYearData(1966).births < getYearData(1965).births);
  });

  it("1989年 TFR=1.57（1.57ショック）", () => {
    assert.equal(getYearData(1989).tfr, 1.57);
  });

  it("2005年 TFR=1.26（当時最低）", () => {
    assert.equal(getYearData(2005).tfr, 1.26);
  });

  it("2023年 TFR=1.20（最低更新）", () => {
    assert.equal(getYearData(2023).tfr, 1.20);
  });

  it("1966年 首相=佐藤栄作", () => {
    assert.equal(getYearData(1966).pm, "佐藤栄作");
  });

  it("1950年 salary=null（データなし）", () => {
    assert.equal(getYearData(1950).salary, null);
  });

  it("1950年 univ=null（データなし）", () => {
    assert.equal(getYearData(1950).univ, null);
  });

  it("1976年 salaryが存在する（初年度）", () => {
    assert.ok(getYearData(1976).salary != null);
    assert.ok(getYearData(1976).salary > 0);
  });

  it("数値文字列でも動作する", () => {
    const d = getYearData("1990");
    assert.equal(d.tfr, 1.54);
  });

  it("YEAR_MIN未満でRangeError", () => {
    assert.throws(() => getYearData(1949), RangeError);
  });

  it("YEAR_MAX超過でRangeError", () => {
    assert.throws(() => getYearData(2025), RangeError);
  });

  it("非整数でRangeError", () => {
    assert.throws(() => getYearData(1990.5), RangeError);
  });

  it("非数値でRangeError", () => {
    assert.throws(() => getYearData("foo"), RangeError);
  });
});

describe("getAllYears", () => {
  it("75年分のデータが存在する（1950〜2024）", () => {
    const years = getAllYears();
    assert.equal(years.length, 75);
    assert.equal(years[0], 1950);
    assert.equal(years[74], 2024);
  });

  it("昇順にソートされている", () => {
    const years = getAllYears();
    for (let i = 1; i < years.length; i++) {
      assert.ok(years[i] > years[i - 1]);
    }
  });
});

describe("getLatestData", () => {
  it("LATEST_YEAR=2023のデータを返す", () => {
    const d = getLatestData();
    assert.equal(d.tfr, 1.20);
    assert.equal(d.pm, "岸田文雄");
  });
});

describe("getChartSeries", () => {
  it("tfrシリーズが75点", () => {
    const series = getChartSeries("tfr");
    assert.equal(series.length, 75);
  });

  it("各点が {x, y} 形式", () => {
    const series = getChartSeries("pop");
    assert.ok("x" in series[0]);
    assert.ok("y" in series[0]);
    assert.equal(series[0].x, 1950);
  });
});

describe("formatters", () => {
  it("formatBirths: 数値 → '2,337,507 人'", () => {
    assert.equal(formatBirths(2337507), "2,337,507 人");
  });

  it("formatBirths: null → '—'", () => {
    assert.equal(formatBirths(null), "—");
  });

  it("formatPop: 8411 → '8,411 万人'", () => {
    assert.equal(formatPop(8411), "8,411 万人");
  });

  it("formatTfr: 1.58 → '1.58'", () => {
    assert.equal(formatTfr(1.58), "1.58");
  });

  it("formatTfr: null → '—'", () => {
    assert.equal(formatTfr(null), "—");
  });

  it("formatLife: 75.9 → '75.9 歳'", () => {
    assert.equal(formatLife(75.9), "75.9 歳");
  });

  it("formatUniv: null → '—'", () => {
    assert.equal(formatUniv(null), "—");
  });

  it("formatUniv: 57.7 → '57.7 %'", () => {
    assert.equal(formatUniv(57.7), "57.7 %");
  });

  it("formatSalary: null → '—（データなし）'", () => {
    assert.equal(formatSalary(null), "—（データなし）");
  });

  it("formatSalary: 230000 → '230,000 円'", () => {
    assert.equal(formatSalary(230000), "230,000 円");
  });

  it("formatTemp: 15.4 → '15.4 ℃'", () => {
    assert.equal(formatTemp(15.4), "15.4 ℃");
  });

  it("formatPrecip: 1520 → '1,520 mm'", () => {
    assert.equal(formatPrecip(1520), "1,520 mm");
  });
});

describe("formatDiff", () => {
  it("正: '今より X 多い'", () => {
    assert.equal(formatDiff(100, 80, ""), "今より 20 多い");
  });

  it("負: '今より X 少ない'", () => {
    assert.equal(formatDiff(80, 100, ""), "今より 20 少ない");
  });

  it("ゼロ: '今と同じ'", () => {
    assert.equal(formatDiff(100, 100, ""), "今と同じ");
  });

  it("null値: ''（空文字）", () => {
    assert.equal(formatDiff(null, 100, ""), "");
  });

  it("invertPositive=true: 正が '今より X 高い'", () => {
    assert.equal(formatDiff(17.0, 15.0, "℃", true), "今より 2℃ 高い");
  });

  it("invertPositive=true: 負が '今より X 低い'", () => {
    assert.equal(formatDiff(14.0, 15.0, "℃", true), "今より 1℃ 低い");
  });

  it("% 単位は1桁小数", () => {
    assert.equal(formatDiff(40.0, 57.7, "%"), "今より 17.7% 少ない");
  });
});

describe("formatDiffBirths", () => {
  it("正の差を正しく表示", () => {
    const result = formatDiffBirths(2337507, 727277);
    assert.ok(result.includes("多い"));
    assert.ok(result.includes("今より"));
  });

  it("負の差を正しく表示", () => {
    const result = formatDiffBirths(727277, 2337507);
    assert.ok(result.includes("少ない"));
  });

  it("null値: ''", () => {
    assert.equal(formatDiffBirths(null, 727277), "");
  });
});

describe("formatDiffSalary", () => {
  it("高い場合: '今より X 円 高い'", () => {
    const result = formatDiffSalary(300000, 230000);
    assert.ok(result.includes("高い"));
  });

  it("低い場合: '今より X 円 低い'", () => {
    const result = formatDiffSalary(150000, 230000);
    assert.ok(result.includes("低い"));
  });
});

describe("全年データの完全性", () => {
  it("1950〜2024の全年でpop・births・tfrが存在する", () => {
    for (let y = 1950; y <= 2024; y++) {
      const d = getYearData(y);
      assert.ok(d.pop != null, `${y}年 pop missing`);
      assert.ok(d.births != null, `${y}年 births missing`);
      assert.ok(d.tfr != null, `${y}年 tfr missing`);
      assert.ok(d.pm != null, `${y}年 pm missing`);
    }
  });

  it("1954〜2024の全年でunivが存在する", () => {
    for (let y = 1954; y <= 2024; y++) {
      const d = getYearData(y);
      assert.ok(d.univ != null, `${y}年 univ missing`);
    }
  });

  it("1976〜2024の全年でsalaryが存在する", () => {
    for (let y = 1976; y <= 2024; y++) {
      const d = getYearData(y);
      assert.ok(d.salary != null, `${y}年 salary missing`);
    }
  });

  it("TFRは0〜5の範囲内", () => {
    for (let y = 1950; y <= 2024; y++) {
      const { tfr } = getYearData(y);
      assert.ok(tfr >= 0 && tfr <= 5, `${y}年 TFR=${tfr} 範囲外`);
    }
  });

  it("出生数は10万〜400万の範囲内", () => {
    for (let y = 1950; y <= 2024; y++) {
      const { births } = getYearData(y);
      assert.ok(births >= 100000 && births <= 4000000, `${y}年 births=${births} 範囲外`);
    }
  });
});
