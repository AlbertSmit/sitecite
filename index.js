const core = require("@actions/core");
const fetch = require("isomorphic-fetch");
const { promises: fs } = require("fs");
const github = require("@actions/github");

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
  return Boolean(await text.match(new RegExp(entry[textfield], "g")));
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
    const runHasFailures = results.includes(false);
    if (runHasFailures) {
      const body = `**:no_entry_sign: Warning!**
One of your citations appear to be offline.

| no_entry_sign: Quote | 
| -------------------- | 
${results.map((r) => `| ${r} |\n`)}
      `;
      octokit.issues.createComment({
        ...context.repo,
        issue_number:
          github.context.issue.number || getPullRequestNumber(context.ref),
        body,
      });
    }

    if (postOnSuccess && !runHasFailures) {
      const body = `**:white_check_mark: Good news!**
All of your citations appear to be online.

| :white_check_mark: Quote | 
| ------------------------ | 
${results.map((r) => `| ${r} |\n`)}
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
