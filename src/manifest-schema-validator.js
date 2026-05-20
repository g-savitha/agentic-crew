const path = require('path');
const fs = require('fs-extra');
const { PRESET_KEYS } = require('./presets');

/** Keep in sync with manifest.js SCHEMA_VERSION */
const SCHEMA_VERSION = 1;
const { IDE_TARGETS, COMMAND_TARGET_KEYS } = require('./targets');

const SCHEMA_PATH = path.join(__dirname, '..', 'schema', 'manifest.schema.json');

/** @type {object | null} */
let cachedSchema = null;

function loadManifestSchema() {
  if (!cachedSchema) {
    cachedSchema = fs.readJsonSync(SCHEMA_PATH);
  }
  return cachedSchema;
}

/**
 * @param {unknown} value
 * @param {string} expected
 * @returns {boolean}
 */
function isType(value, expected) {
  if (expected === 'integer') return Number.isInteger(value);
  if (expected === 'array') return Array.isArray(value);
  if (expected === 'object') return value !== null && typeof value === 'object' && !Array.isArray(value);
  return typeof value === expected;
}

/**
 * @param {unknown} value
 * @param {object} propSchema
 * @param {string} pathLabel
 * @returns {string[]}
 */
function validateProperty(value, propSchema, pathLabel) {
  const issues = [];
  if (value === undefined || value === null) return issues;

  if (propSchema.enum && !propSchema.enum.includes(value)) {
    issues.push(`${pathLabel} must be one of: ${propSchema.enum.join(', ')}`);
    return issues;
  }

  if (propSchema.oneOf) {
    const branchIssues = propSchema.oneOf.map((branch) => {
      if (branch.enum) {
        return branch.enum.includes(value) ? [] : null;
      }
      if (branch.type === 'array' && Array.isArray(value)) {
        const itemEnum = branch.items?.enum;
        if (!itemEnum) return [];
        const bad = value.filter((v) => !itemEnum.includes(v));
        return bad.length === 0 ? [] : null;
      }
      return null;
    });
    if (!branchIssues.some((r) => Array.isArray(r))) {
      issues.push(`${pathLabel} has invalid target(s). Use: ${IDE_TARGETS.join(', ')}`);
    }
    return issues;
  }

  const types = propSchema.type
    ? Array.isArray(propSchema.type)
      ? propSchema.type.filter((t) => t !== 'null')
      : [propSchema.type]
    : [];
  if (types.length > 0 && !types.some((t) => isType(value, t))) {
    issues.push(`${pathLabel} must be of type ${types.join(' or ')}`);
    return issues;
  }

  if (propSchema.type === 'array' && Array.isArray(value)) {
    if (propSchema.minItems != null && value.length < propSchema.minItems) {
      issues.push(`${pathLabel} must have at least ${propSchema.minItems} item(s)`);
    }
    if (propSchema.items?.enum) {
      for (const item of value) {
        if (!propSchema.items.enum.includes(item)) {
          issues.push(`${pathLabel} item "${item}" is invalid`);
        }
      }
    }
    if (propSchema.items?.type === 'string') {
      for (const item of value) {
        if (typeof item !== 'string') issues.push(`${pathLabel} items must be strings`);
      }
    }
    if (propSchema.items?.required || propSchema.items?.properties) {
      value.forEach((item, i) => {
        issues.push(...validateObject(item, propSchema.items, `${pathLabel}[${i}]`));
      });
    }
  }

  if (propSchema.type === 'object' && value && typeof value === 'object') {
    issues.push(...validateObject(value, propSchema, pathLabel));
  }

  if (propSchema.minimum != null && typeof value === 'number' && value < propSchema.minimum) {
    issues.push(`${pathLabel} must be >= ${propSchema.minimum}`);
  }

  return issues;
}

/**
 * @param {object} obj
 * @param {object} schema
 * @param {string} pathLabel
 * @returns {string[]}
 */
function validateObject(obj, schema, pathLabel) {
  const issues = [];
  if (!obj || typeof obj !== 'object') {
    issues.push(`${pathLabel} must be an object`);
    return issues;
  }
  for (const key of schema.required || []) {
    if (obj[key] === undefined || obj[key] === null) {
      issues.push(`${pathLabel} missing required field "${key}"`);
    }
  }
  for (const [key, val] of Object.entries(obj)) {
    const propSchema = schema.properties?.[key];
    if (!propSchema) continue;
    issues.push(...validateProperty(val, propSchema, `${pathLabel}.${key}`));
  }
  return issues;
}

/**
 * Validate manifest against schema/manifest.schema.json (no external JSON Schema runtime).
 * @param {object} manifest
 * @returns {string[]}
 */
function validateManifestSchema(manifest) {
  const schema = loadManifestSchema();
  const issues = [];

  if (!manifest || typeof manifest !== 'object') {
    return ['Manifest is not a valid object.'];
  }

  issues.push(...validateObject(manifest, schema, 'manifest'));

  if (manifest.schemaVersion != null && manifest.schemaVersion > SCHEMA_VERSION) {
    issues.push(
      `Manifest schemaVersion ${manifest.schemaVersion} is newer than CLI supports (${SCHEMA_VERSION}).`
    );
  }

  if (manifest.preset != null && !PRESET_KEYS.includes(manifest.preset)) {
    issues.push(`Manifest preset "${manifest.preset}" is invalid. Use: ${PRESET_KEYS.join(', ')}`);
  }

  const targets = manifest.targets;
  if (targets != null) {
    const tokens = Array.isArray(targets) ? targets : [targets];
    for (const t of tokens) {
      const lower = String(t).toLowerCase();
      if (!IDE_TARGETS.includes(lower) && !COMMAND_TARGET_KEYS.includes(lower)) {
        issues.push(`Manifest target "${t}" is invalid. Use: ${IDE_TARGETS.join(', ')}`);
      }
    }
  }

  return issues;
}

module.exports = { validateManifestSchema, loadManifestSchema, SCHEMA_PATH };
