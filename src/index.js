const core = require("@actions/core");
const fetch = require("isomorphic-fetch");
const { promises: fs } = require("fs");
const github = require("@actions/github");

/**
 * Emoji
 */
const yay = ":white_check_mark:";
const nay = ":no_entry_sign:";
const script = ":scroll:";

/**
 * Inputs
 */
const token = core.getInput("token");
const path = core.getInput("path");
const textfield = core.getInput("textfield");
const urlfield = core.getInput("urlfield");

/**
 * Context / token
 */
const context = github.context;
const octokit = github.getOctokit(token);

const createBotCommentIdentifier = (signature) => {
  return function isCommentByBot(comment) {
    return comment.user.type === "Bot" && comment.body.includes(signature);
  };
};

const matchText = async (entry) => {
  const response = await fetch(new URL(entry[urlfield]));
  const text = await response.text();
  core.info("matchText found:", text.match(new RegExp(entry[textfield], "g")));

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
  try {
    /**
     * Get all entries.
     */
    core.startGroup("Reading json from path");
    const content = await fs.readFile(path, "utf-8");
    const json = JSON.parse(content);
    core.endGroup();

    core.startGroup("Checking the citations");
    const results = await getResults(json.quotes);
    core.endGroup();

    /**
     * Comment on given PR.
     */
    core.startGroup(`Commenting on PR`);
    const isCommentByBot = createBotCommentIdentifier("SITECITEBOT");

    const commentInfo = {
      ...context.repo,
      issue_number: context.issue.number,
    };

    let commentId;
    try {
      const comments = (await octokit.issues.listComments(commentInfo)).data;
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

    const body = `**${script} Sitecite results**
    One of your citations appear to be offline.
    
    | Found | ${nay} Quote | Source |
    | ----- | ------------ | ------ |
    ${results.map(
      (r) => `| ${r.found ? yay : nay} | ${r.cite} | [source](${r.source}) | \n`
    )}
    `;

    if (commentId) {
      try {
        await octokit.issues.updateComment({
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
        await octokit.issues.createComment({ ...commentInfo, body });
      } catch (e) {
        console.log(`Error creating comment: ${e.message}`);
      }
    }
    core.endGroup();
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
