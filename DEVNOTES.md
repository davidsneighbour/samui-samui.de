# Developer Notes

## Install pre-commit hooks

```bash
curl https://pre-commit.com/install-local.py | python -
source ~/.profile
pre-commit install
```

## Setup installation

```bash
npm install
```

## Setup and update Algolia search

- copy `.env.sample` to `.env`
- fill in the info from https://www.algolia.com/apps &gt; API keys
- run `npm run algolia` whenever there are updates to the content
