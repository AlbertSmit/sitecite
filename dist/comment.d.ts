import { Context } from "@actions/github/lib/context";
import { GitHub } from "@actions/github/lib/utils";
import { CiteResult } from "./types";
export declare function postComment(github: InstanceType<typeof GitHub>, context: Context, results: CiteResult[]): Promise<void>;
