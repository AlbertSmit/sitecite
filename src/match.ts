import { getInput } from "@actions/core";
import fetch from "node-fetch";

/**
 * Inputs
 */
const textfield: string = getInput("textfield") || "quote";
const urlfield: string = getInput("urlfield") || "link";

type MatchedResult = {
  found: boolean;
  source: string;
  cite: string;
};

/**
 * Find text on
 * given page.
 */
export const matchText = async (entry): Promise<MatchedResult> => {
  const response = await fetch(entry[urlfield]);
  const text = await response.text();

  return {
    found: Boolean(text.match(new RegExp(entry[textfield], "g"))),
    source: entry[urlfield],
    cite: entry[textfield],
  };
};

/**
 * Run async query
 * for each entry.
 */
export const getResults = async (
  quotes: { [key: string]: string }[]
): Promise<MatchedResult[]> => {
  return Promise.all(Object.values(quotes).map((entry) => matchText(entry)));
};
