import type { Context } from "@actions/github/lib/context";
import type { GitHub } from "@actions/github/lib/utils";
/**
 * Create a check and return a function that updates (completes) it
 * @see https://github.com/FirebaseExtended/action-hosting-deploy/blob/main/src/createCheck.ts
 */
export declare function createCheck(github: InstanceType<typeof GitHub>, context: Context): Promise<(details: Object) => Promise<void>>;
