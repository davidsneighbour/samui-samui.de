# Posthaste

Posthaste configuration for Samui? Samui! lives in the repository-root `.posthaste.toml`. The default publishing targets are Mastodon and Bluesky. Account creation and authentication are separate setup steps; this configuration does not create accounts or enable scheduled publishing.

## Local files

Run Posthaste from the repository root so configuration discovery and relative paths resolve to this project.

* `.posthaste.toml` contains tracked, non-secret project defaults.
* `.posthaste/.env` is the configured credential file. Git ignores it. Create it only during explicitly authorised credential setup, and never store credential values in TOML or tracked files.
* `.posthaste/posted.jsonl` is the publishing history, created by Posthaste when needed. It remains eligible for version control so published-post records can stay with the project.
* Store future draft text and media under `.posthaste/` so project publishing assets remain in this repository.

No credential file, publishing history, or social account is created by the initial configuration change. Use the consuming skills' default environment variable names unless a future account setup requires an explicit override.

## Configuration and publishing

Consuming skill defaults are overridden by global `~/.config/posthaste/config.toml`, then project `.posthaste.toml`, and finally explicit request values. Runtime helpers also support documented environment and command-line overrides. Other global settings may still be inherited; the project configuration overrides default networks and storage paths.

Use `/posthaste-config info` to inspect effective settings and provenance, or `/posthaste-config check` to validate configuration. Use `/posthaste-prepare-link` with a site URL to prepare a post. Publishing, credential writes, automated login, and final publish controls require explicit user confirmation under the Posthaste skill rules.
