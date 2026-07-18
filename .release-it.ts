import { createReleaseConfig } from '@dnbhq/release-config';
import type { Config } from 'release-it';

interface ConventionalCommit {
  type?: string;
  scope?: string;
  notes?: unknown[];
}

const config: Config = createReleaseConfig({
  githubTokenRef: 'GITHUB_TOKEN_CONTENT_PRIVATE',
  scopes: {
    minorExclusionSubscopes: {
      feat: ['fix'],
      instructions: ['fix'],
      prompt: ['fix'],
      skill: ['fix'],
    },
    // "content" is listed first so its changelog section renders before Feat/Fix.
    minorTypes: ['content', 'feat', 'prompt', 'instructions', 'skill'],
  },
});

// @dnbhq/release-config's `scopes` option only controls changelog section
// grouping/order; the actual version-bump decision (@release-it/conventional-changelog's
// loaded preset) hardcodes `feat` as the only type that bumps minor, everything
// else bumps patch. Override it so `content(new)` also bumps minor, while any
// other content(...) subscope (e.g. content(fix)) stays patch-level.
const conventionalChangelogPlugin =
  config.plugins?.['@release-it/conventional-changelog'];
if (conventionalChangelogPlugin) {
  conventionalChangelogPlugin.whatBump = (commits: ConventionalCommit[]) => {
    let level = 2;
    let breakings = 0;
    let features = 0;

    for (const commit of commits) {
      if (commit.notes && commit.notes.length > 0) {
        breakings += commit.notes.length;
        level = 0;
      } else if (commit.type === 'feat' || commit.type === 'feature') {
        features += 1;
        if (level === 2) level = 1;
      } else if (commit.type === 'content' && commit.scope === 'new') {
        features += 1;
        if (level === 2) level = 1;
      }
    }

    return {
      level,
      reason:
        breakings === 1
          ? `There is ${breakings} BREAKING CHANGE and ${features} features`
          : `There are ${breakings} BREAKING CHANGES and ${features} features`,
    };
  };
}

export default config;
