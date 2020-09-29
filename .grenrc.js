module.exports = {
  'dataSource': 'commits',
  'ignore-commits-with': [
    'chore(deps)',
    'chore(deps-dev)'
  ],
  "groupBy": {
    "Theme:": ["theme"],
    "Enhancements:": ["feat"],
    "Bug Fixes:": ["fix"],
    "Chores:": ["refactor", "test", "tests", "chore", "wip"]
  }
};
