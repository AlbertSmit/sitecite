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
     * Get page source.
     */
    (async () => {
      const response = await fetch("https://example.com");
      const text = await response.text();
      core.info(text.match(/(?<=<h1>).*(?=<\/h1>)/));
    })();

    (async () => {
      const response = await fetch("https://example.com");
      const text = await response.text();
      const dom = await new JSDOM(text);
      core.info(dom.window.document.querySelector("h1").textContent);
    })();

    core.setOutput("time", new Date().toTimeString());
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
