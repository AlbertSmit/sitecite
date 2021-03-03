import * as crypto from "crypto";
import { CiteResult } from "./comment";

export function createDeploySignature(result: CiteResult[]) {
  const sites = result.map((result) => result.cite.replace(" ", "")).sort();
  const hash = crypto.createHash("sha1");
  sites.forEach((site) => {
    hash.update(site);
  });

  return hash.digest("hex");
}
