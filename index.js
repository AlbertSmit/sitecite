const core = require("@actions/core");
const fetch = require("isomorphic-fetch");
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const { promises: fs } = require("fs");
const github = require("@actions/github");

const getPullRequestNumber = (ref) => {
  core.debug(`Parsing ref: ${ref}`);
  // This assumes that the ref is in the form of `refs/pull/:prNumber/merge`
  const prNumber = ref.replace(/refs\/pull\/(\d+)\/merge/, "$1");
  return parseInt(prNumber, 10);
};

async function run() {
  try {
    /**
     * Inputs
     */
    const myToken = core.getInput("token");
    const path = core.getInput("path");
    const textfield = core.getInput("textfield");
    const urlfield = core.getInput("urlfield");

    if (!myToken || !path || !textfield || !urlfield) {
      throw new Error("Insufficient config provided.");
    }

    /**
     * Load config file.
     */
    const content = await fs.readFile(path, "utf8");
    core.setOutput("content", content);

    /**
     * Get all entries.
     */
    const json = JSON.parse(content);
    Object.values(json.quotes).forEach((entry) => {
      (async () => {
        const response = await fetch(new URL(entry[urlfield]));
        const text = await response.text();
        core.info(text.match(entry[textfield]));
      })();
    });

    /**
     * Get page source.
     */
    // (async () => {
    //   const response = await fetch(urlfield);
    //   const text = await response.text();
    //   core.info(text.match(textfield));
    // })();

    // (async () => {
    //   const response = await fetch(urlfield);
    //   const text = await response.text();
    //   const dom = await new JSDOM(text);
    //   core.info(dom.window.document.querySelector("h1").textContent);
    // })();

    /**
     * Comment on given PR.
     */
    const context = github.context;
    const octokit = github.getOctokit(myToken);
    octokit.pulls.createReviewComment({
      ...context.repo,
      pull_number:
        github.context.issue.number || getPullRequestNumber(context.ref),
      body: "Test!",
    });

    core.setOutput("report", "Nothing yet. Just testing.");
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
