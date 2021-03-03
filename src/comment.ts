import { endGroup, startGroup } from "@actions/core";
import { Context } from "@actions/github/lib/context";
import { GitHub } from "@actions/github/lib/utils";
import { nay, script, wave, yay } from "./emoji";

export type CiteResult = {
  source: string;
  found: boolean;
  cite: string;
};

const template = `## ${script} Sitecite results**

Hey! ${wave}  

I'm a bot to check if all your cited (external) sources are still up.
Here's an overview of your requested review:
    
| Found | Cited text | Source |
| ----- | ---------- | ------ |`;

const createBotCommentIdentifier = (signature: string) => {
  return function isCommentByBot(comment): boolean {
    return comment.user.type === "Bot" && comment.body.includes(signature);
  };
};

export async function postComment(
  github: InstanceType<typeof GitHub>,
  context: Context,
  results: CiteResult[]
) {
  startGroup(`Commenting on PR`);
  const isCommentByBot = createBotCommentIdentifier("SITECITEBOT");

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

  const body = `${template}
${results
  .map((r) => `| ${r.found ? yay : nay} | ${r.cite} | [source](${r.source}) |`)
  .join("\r\n")}
`;

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
}
