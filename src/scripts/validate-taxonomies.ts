#!/usr/bin/env -S node

import process from 'node:process';
import {
  formatTaxonomyValidationIssues,
  validateTaxonomyIntegrity,
} from '../utils/taxonomies/validation.ts';

const issues = validateTaxonomyIntegrity();
const message = formatTaxonomyValidationIssues(issues);

if (issues.length > 0) {
  console.error(message);
  process.exitCode = 1;
} else {
  console.log(message);
}
