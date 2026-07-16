import { createReleaseConfig } from "@dnbhq/release-config";
import type { Config } from "release-it";

const config: Config = createReleaseConfig({
  githubTokenRef: "GITHUB_TOKEN_CONTENT_PRIVATE",
});

export default config;
