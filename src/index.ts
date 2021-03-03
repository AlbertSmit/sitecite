import { endGroup, getInput, setFailed, startGroup } from "@actions/core";
import { context, getOctokit } from "@actions/github";
import { postComment } from "./comment";
import { createCheck } from "./check";
import { promises as fs } from "fs";
import "isomorphic-fetch";

/**
 * Inputs
 */
const token: string = getInput("token");
const path: string = getInput("path");
const textfield: string = getInput("textfield");
const urlfield: string = getInput("urlfield");

/**
 * Context / token
 */
const octokit = getOctokit(token);

const matchText = async (entry) => {
  const response = await fetch(entry[urlfield]);
  const text = await response.text();

  return {
    found: Boolean(text.match(new RegExp(entry[textfield], "g"))),
    source: entry[urlfield],
    cite: entry[textfield],
  };
};

const getResults = async (quotes) => {
  return Promise.all(Object.values(quotes).map((entry) => matchText(entry)));
};

async function run() {
  const isPullRequest = !!context.payload.pull_request;
  if (token && isPullRequest) {
    await createCheck(octokit, context);
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
      const commitId = context.payload.pull_request?.head.sha.substring(0, 7);
      await postComment(octokit, context, results);
    }
  } catch (error) {
    setFailed(error.message);
  }
}

run();
