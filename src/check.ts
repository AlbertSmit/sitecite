import type { Context } from "@actions/github/lib/context";
import type { GitHub } from "@actions/github/lib/utils";

export async function createCheck(
  github: InstanceType<typeof GitHub>,
  context: Context
) {
  const check = await github.checks.create({
    ...context.repo,
    name: "Verifying Citations",
    head_sha: context.payload.pull_request?.head.sha,
    status: "in_progress",
  });

  return async (details: Object) => {
    await github.checks.update({
      ...context.repo,
      check_run_id: check.data.id,
      completed_at: new Date().toISOString(),
      status: "completed",
      ...details,
    });
  };
}
