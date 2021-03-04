import { getResults, matchText } from "../src/match";
const data = require("./mock/quotes.json");

describe("getResults", () => {
  it("Succesfully check multiple citations", async () => {
    const result = await getResults(data.quotes);

    expect(result).toEqual([
      {
        found: false,
        source: "https://www.google.com",
        cite: "bruh",
      },
      {
        found: false,
        source: "https://www.bing.com",
        cite: "my dude!",
      },
    ]);
  });
});

describe("matchText", () => {
  it("Succesfully fetches a page", async () => {
    const quote = "A worldwide list of companies";
    const link = "https://www.apple.com/legal/warranty/";
    const result = await matchText({
      quote,
      link,
    });

    expect(result).toEqual({
      found: true,
      source: link,
      cite: quote,
    });
  });

  it("Succesfully fails when cite is faulty", async () => {
    const quote = "Android is a wonderful platform";
    const link = "https://www.apple.com/legal/warranty/";
    const result = await matchText({
      quote,
      link,
    });

    expect(result).toEqual({
      found: false,
      source: link,
      cite: quote,
    });
  });
});
