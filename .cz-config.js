'use strict';

// @see https://github.com/leonardoanalista/cz-customizable

module.exports = {

  types: [{
      value: 'content',
      name: 'content: A new post or other content'
    },
    {
      value: 'feat',
      name: 'feat: A new feature'
    },
    {
      value: 'fix',
      name: 'fix: A bug fix'
    },
    {
      value: 'layout',
      name: 'layout: changes to layout and theme files'
    },
    {
      value: 'codestyle',
      name: 'style: Changes that do not affect the meaning of the code'
    },
    {
      value: 'perf',
      name: 'perf: A code change that improves performance'
    },
    {
      value: 'chore',
      name: 'chore: Changes to the build process, tools, documentation'
    }
  ],

  scopes: [],
  scopeOverrides: {
    content: [{
        name: 'new'
      },
      {
        name: 'correction'
      },
      {
        name: 'chore'
      }
    ]
  },

  // override the messages, defaults are as follows
  messages: {
    type: 'Select the type of change that you\'re committing:',
    scope: '\nDenote the SCOPE of this change (optional):',
    customScope: 'Denote the SCOPE of this change:',
    subject: 'Write a SHORT, IMPERATIVE tense description of the change:\n',
    body: 'Provide a LONGER description of the change (optional). Use "|" to break new line:\n',
    breaking: 'List any BREAKING CHANGES (optional):\n',
    footer: 'List any ISSUES CLOSED by this change (optional). E.g.: #31, #34:\n',
    confirmCommit: 'Are you sure you want to proceed with the commit above?'
  },

  allowCustomScopes: true,
  allowBreakingChanges: ['feat', 'fix']

};
