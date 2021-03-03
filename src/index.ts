import { endGroup, getInput, setFailed, startGroup } from "@actions/core";
import { context, getOctokit } from "@actions/github";
import { postComment } from "./comment";
import { createCheck } from "./check";
import { promises as fs } from "fs";
import fetch from "node-fetch";

/**
 * Inputs
 */
const token: string = getInput("token");
const path: string = getInput("path");
const textfield: string = getInput("textfield");
const urlfield: string = getInput("urlfield");
const failOnNotFound: string = getInput("failOnNotFound");

/**
 * Context / token
 */
const octokit = getOctokit(token);

/**
 * Find text on
 * given page.
 */
const matchText = async (entry) => {
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
const getResults = async (quotes) => {
  return Promise.all(Object.values(quotes).map((entry) => matchText(entry)));
};

/**
 * Main function.
 */
async function run() {
  const isPullRequest = !!context.payload.pull_request;
  let finish = (details: Object) => console.log(details);
  if (token && isPullRequest) {
    finish = await createCheck(octokit, context);
  }

  try {
    /**
     * Get all entries.
     */
    startGroup("Reading json from path");
    const content = await fs.readFile(path, "utf-8");
    const json = JSON.parse(content);
    endGroup();

    startGroup("Checking the citations");
    const results = await getResults(json.quotes);
    endGroup();

    /**
     * Comment on given PR.
     */
    if (token && isPullRequest && !!octokit) {
      await postComment(octokit, context, results);
    }

    const hasFailures = results.filter((r) => !r.found).length;
    if (failOnNotFound && hasFailures) {
      await finish({
        conclusion: "failure",
        output: {
          title: `Verifying Citations failed`,
          summary: `There is ${hasFailures} broken citations. Check PR comment for overview.`,
        },
      });
    }

    if (!failOnNotFound || (failOnNotFound && hasFailures !== 0)) {
      await finish({
        conclusion: "success",
        output: {
          title: `Verifying Citations succeeded`,
          summary: "Check PR comments for overview",
        },
      });
    }
  } catch (error) {
    setFailed(error.message);

    await finish({
      conclusion: "failure",
      output: {
        title: "Verifying Citations failed",
        summary: `Error: ${error.message}`,
      },
    });
  }
}

run();
