import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();
const skillsRoot = path.join(root, 'ai/skills');
const configPath = path.join(root, 'ai/config.toml');

function readText(filePath: string): string {
  return fs.readFileSync(filePath, 'utf8');
}

function listRepoLocalSkills(): string[] {
  return fs
    .readdirSync(skillsRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && entry.name.startsWith('ss-'))
    .filter((entry) =>
      fs.existsSync(path.join(skillsRoot, entry.name, 'SKILL.md')),
    )
    .map((entry) => entry.name)
    .sort();
}

describe('repo-local assistant skills', () => {
  it('autoregisters ss-* skill folders from ai/skills', () => {
    const config = readText(configPath);
    const skills = listRepoLocalSkills();

    expect(skills).toEqual(
      expect.arrayContaining(['ss-refactor', 'ss-research-news', 'ss-review']),
    );
    expect(config).toContain('available = ["ai/skills/ss-*"]');
    expect(config).toContain('autoregister = true');
    expect(config).toContain('entrypoint = "SKILL.md"');

    for (const skill of skills) {
      expect(config).not.toContain(`"ai/skills/${skill}"`);
    }
  });

  it('keeps ss-* skill ids aligned with folder and prompt names', () => {
    for (const skill of listRepoLocalSkills()) {
      const skillDir = path.join(skillsRoot, skill);
      const skillFile = readText(path.join(skillDir, 'SKILL.md'));

      expect(skillFile).toMatch(new RegExp(`^name: ${skill}$`, 'm'));

      const promptFiles = fs
        .readdirSync(skillDir, { withFileTypes: true })
        .filter((entry) => entry.isFile() && entry.name.endsWith('.prompt.md'))
        .map((entry) => path.join(skillDir, entry.name));

      for (const promptFile of promptFiles) {
        expect(readText(promptFile)).toContain(`Use the \`${skill}\` skill.`);
      }
    }
  });
});
