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

const getPullRequestNumber = (ref) => {
  return parseInt(ref.replace(/refs\/pull\/(\d+)\/merge/, "$1"), 10);
};

const matchText = async (entry) => {
  const response = await fetch(new URL(entry[urlfield]));
  return Boolean(
    await response.text().match(new RegExp(entry[textfield], "g"))
  );
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
     * Comment on given PR.
     */
    if (results.includes(false)) {
      const context = github.context;
      const octokit = github.getOctokit(myToken);
      octokit.issues.createComment({
        ...context.repo,
        issue_number:
          github.context.issue.number || getPullRequestNumber(context.ref),
        body: `
          One of your citations appear to be offline.

          | Quote         | 
          | ------------- | 
          ${results.map((r) => `| ${r} |\n`)}
        `,
      });
    }

    core.setOutput("report", "Nothing yet. Just testing.");
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
