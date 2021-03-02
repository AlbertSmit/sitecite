const core = require("@actions/core");
const fetch = require("isomorphic-fetch");
const { promises: fs } = require("fs");
const github = require("@actions/github");

/**
 * Emoji
 */
const yay = ":white_check_mark:";
const nay = ":no_entry_sign:";

/**
 * Inputs
 */
const myToken = core.getInput("token");
const path = core.getInput("path");
const textfield = core.getInput("textfield");
const urlfield = core.getInput("urlfield");
const postOnSuccess = core.getInput("postOnSuccess");

const getPullRequestNumber = (ref) => {
  return parseInt(ref.replace(/refs\/pull\/(\d+)\/merge/, "$1"), 10);
};

const matchText = async (entry) => {
  const response = await fetch(new URL(entry[urlfield]));
  const text = await response.text();
  return {
    found: Boolean(text.match(new RegExp(entry[textfield], "g"))),
    cite: entry[textfield],
  };
};

const getResults = async (quotes) => {
  return Promise.all(Object.values(quotes).map((entry) => matchText(entry)));
};

async function run() {
  try {
    if (!myToken || !path || !textfield || !urlfield) {
      throw new Error("Insufficient config provided.");
    }

    /**
     * Get all entries.
     */
    const content = await fs.readFile(path, "utf-8");
    const json = JSON.parse(content);

    const results = await getResults(json.quotes);

    /**
     * Set up comment context.
     */
    const context = github.context;
    const octokit = github.getOctokit(myToken);

    /**
     * Comment on given PR.
     */
    const runHasFailures = results.map((r) => r.found).includes(false);
    if (runHasFailures) {
      const body = `**${nay} Warning!**
One of your citations appear to be offline.

| Found | ${nay} Quote |
| ----- | ------------ | 
${results.map((r) => `| ${r.found ? yay : nay} | ${r.cite} |\n`)}
      `;
      octokit.issues.createComment({
        ...context.repo,
        issue_number:
          github.context.issue.number || getPullRequestNumber(context.ref),
        body,
      });
    }

    if (postOnSuccess && !runHasFailures) {
      const body = `**${yay} Good news!**
All of your citations appear to be online.

| ${yay} Quote | 
| ------------ | 
${results.map((r) => `| ${r.cite} |\n`)}
      `;

      octokit.issues.createComment({
        ...context.repo,
        issue_number:
          github.context.issue.number || getPullRequestNumber(context.ref),
        body,
      });
    }

    core.setOutput("report", "Nothing yet. Just testing.");
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
