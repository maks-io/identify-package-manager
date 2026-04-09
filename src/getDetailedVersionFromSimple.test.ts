import { getDetailedVersionFromSimple } from "./getDetailedVersionFromSimple";

describe("getDetailedVersionFromSimple", () => {
  it("parses a complete semantic version", () => {
    expect(getDetailedVersionFromSimple("4.6.1")).toEqual({
      major: 4,
      minor: 6,
      patch: 1,
    });
  });

  it("treats x placeholders as undefined numeric parts", () => {
    expect(getDetailedVersionFromSimple("1.x.x")).toEqual({
      major: 1,
      minor: undefined,
      patch: undefined,
    });
  });
});
