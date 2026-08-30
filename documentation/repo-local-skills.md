# Repo-local skills

Repo-local Samui assistant skills live under `ai/skills/`.

Every direct child folder whose name starts with `ss-` and contains `SKILL.md` is considered available to assistant conversations in this repository. The registration contract is intentionally pattern-based:

```toml
[skills]
roots = ["ai/skills"]
available = ["ai/skills/ss-*"]
autoregister = true
entrypoint = "SKILL.md"
```

Do not maintain a manual list of individual `ss-*` folders in `ai/config.toml`. Adding `ai/skills/ss-example/SKILL.md` should be enough for the skill to be found.

Each skill folder must keep its `SKILL.md` frontmatter `name` equal to the folder name. Prompt helpers inside the folder should invoke that same `ss-*` name so copied assistant prompts and the repository config agree.
