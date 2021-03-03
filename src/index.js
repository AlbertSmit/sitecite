const { core, startGroup, endGroup } = require("@actions/core");
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
const token = process.env.GITHUB_TOKEN || core.getInput("token");
const path = core.getInput("path");
const textfield = core.getInput("textfield");
const urlfield = core.getInput("urlfield");
// const postOnSuccess = core.getInput("postOnSuccess");

/**
 * Context / token
 */
const context = github.context;
const octokit = github.getOctokit(token);

const getPullRequestNumber = (ref) => {
  return parseInt(ref.replace(/refs\/pull\/(\d+)\/merge/, "$1"), 10);
};

const createBotCommentIdentifier = (signature) => {
  return function isCommentByBot(comment) {
    return comment.user.type === "Bot" && comment.body.includes(signature);
  };
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
    startGroup(`Commenting on PR`);
    const isCommentByBot = createBotCommentIdentifier("SITECITEBOT");
    // const runHasFailures = results.map((r) => r.found).includes(false);

    const commentInfo = {
      ...context.repo,
      issue_number: context.issue.number,
    };

    let commentId;
    try {
      const comments = (await github.issues.listComments(commentInfo)).data;
      for (let i = comments.length; i--; ) {
        const c = comments[i];
        if (isCommentByBot(c)) {
          commentId = c.id;
          break;
        }
      }
    } catch (e) {
      console.log("Error checking for previous comments: " + e.message);
    }

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

    if (commentId) {
      try {
        await github.issues.updateComment({
          ...context.repo,
          comment_id: commentId,
          body,
        });
      } catch (e) {
        commentId = null;
      }
    }

    if (!commentId) {
      try {
        await github.issues.createComment({ ...commentInfo, body });
      } catch (e) {
        console.log(`Error creating comment: ${e.message}`);
      }
    }
    endGroup();
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
