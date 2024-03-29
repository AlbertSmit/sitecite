import {
  endGroup,
  getInput,
  setFailed,
  startGroup,
  setOutput,
} from "@actions/core";
import { context, getOctokit } from "@actions/github";
import { postComment } from "./comment";
import { createCheck } from "./check";
import { promises as fs } from "fs";
import { getResults } from "./match";

/**
 * Inputs
 */
const token: string = getInput("token");
const path: string = getInput("path");
const failOnNotFound: string = getInput("failOnNotFound");

/**
 * Context / token
 */
const octokit = getOctokit(token);

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

    const failures = results.filter((r) => !r.found).length;
    const hasFailures = failures !== 0;
    setOutput("failures", hasFailures);
    setOutput("results", results);

    if (failOnNotFound && hasFailures) {
      await finish({
        conclusion: "failure",
        output: {
          title: `Verifying Citations failed`,
          summary: `There is ${failures} broken citations. Check PR comment for overview.`,
        },
      });
    }

    if (!failOnNotFound || (failOnNotFound && !hasFailures)) {
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
