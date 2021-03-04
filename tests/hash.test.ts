import { singleCitation, multiCitations } from "./mock/output";
import { createDeploySignature } from "../src/hash";

describe("hash", () => {
  it("Returns stable signature for single citation", () => {
    const signSingle = createDeploySignature(singleCitation);
    expect(signSingle).toEqual("96d584b8c1e57858986958a720037893e967b5b9");
  });

  it("Returns stable signature for multi citations", () => {
    const signMulti1 = createDeploySignature(multiCitations);
    expect(signMulti1).toEqual("fd496d3f080d1e6c5f62568ca469b3edf3589ae9");
  });
});
