const core = require("@actions/core");
const fetch = require("isomorphic-fetch");
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const { promises: fs } = require("fs");

async function run() {
  try {
    /**
     * Load config file.
     */
    const path = core.getInput("path");
    const content = await fs.readFile(path, "utf8");
    core.setOutput("content", content);

    /**
     * Get all entries.
     */
    const json = JSON.parse(content);
    Object.entries(json).map(([key, value]) => core.info(key, value));

    /**
     * Exact text to query for,
     * and which page to look on/
     */
    const textfield = core.getInput("textfield");
    const urlfield = core.getInput("url");

    /**
     * Get page source.
     */
    (async () => {
      const response = await fetch(urlfield);
      const text = await response.text();
      core.info(text.match(textfield));
    })();

    (async () => {
      const response = await fetch(urlfield);
      const text = await response.text();
      const dom = await new JSDOM(text);
      core.info(dom.window.document.querySelector("h1").textContent);
    })();

    core.setOutput("report", "Nothing yet. Just testing.");
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
