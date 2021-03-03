import { Context } from "@actions/github/lib/context";
import { GitHub } from "@actions/github/lib/utils";
export declare type CiteResult = {
    source: string;
    found: boolean;
    cite: string;
};
export declare function postComment(github: InstanceType<typeof GitHub>, context: Context, results: CiteResult[]): Promise<void>;
