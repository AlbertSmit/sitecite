import type { Context } from "@actions/github/lib/context";
import type { GitHub } from "@actions/github/lib/utils";
export declare function createCheck(github: InstanceType<typeof GitHub>, context: Context): Promise<(details: Object) => Promise<void>>;
