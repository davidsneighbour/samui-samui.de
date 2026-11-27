import { describe, expect, it } from 'vitest';
import { checkCommitType } from '../scripts/lint-commit-type';

const post = 'src/content/posts/2026/11/example/index.md';

describe('checkCommitType', () => {
  it('rejects a bare content commit that adds a post', () => {
    expect(checkCommitType('content: add post', [post])).toContain(
      'content(new)',
    );
  });

  it('rejects another content scope that adds a post', () => {
    expect(checkCommitType('content(fix): add post', [post])).not.toBeNull();
  });

  it('accepts content(new) for a new post', () => {
    expect(checkCommitType('content(new): add post', [post])).toBeNull();
  });

  it('ignores commits without a new post', () => {
    expect(checkCommitType('content: fix typo', [])).toBeNull();
  });

  it('ignores other types and non-post files', () => {
    expect(checkCommitType('feat: add page', [post])).toBeNull();
    expect(
      checkCommitType('content: x', ['src/content/themen/a/_index.md']),
    ).toBeNull();
  });
});
