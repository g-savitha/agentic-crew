const { slugify } = require('./utils');

/**
 * Parse --custom-role "Name|Description" (repeatable).
 * @param {string | string[]} raw
 * @returns {object[]}
 */
function parseCustomRoles(raw) {
  if (!raw || (Array.isArray(raw) && raw.length === 0)) return [];
  const entries = Array.isArray(raw) ? raw : [raw];
  return entries.map((entry, index) => {
    const parts = String(entry).split('|');
    const name = (parts[0] || '').trim();
    const description = parts.slice(1).join('|').trim();
    if (!name) {
      throw new Error(`--custom-role[${index}] requires a name before | (e.g. "Data Engineer|ETL pipelines")`);
    }
    if (!description) {
      throw new Error(`--custom-role "${name}" requires a description after |`);
    }
    const file = slugify(name);
    if (!file) {
      throw new Error(`--custom-role "${name}" could not be slugified to a command file name`);
    }
    return {
      name,
      description,
      file,
      character: name,
      trait: 'Custom',
      command: slugify(name.split(/\s+/)[0]),
    };
  });
}

module.exports = { parseCustomRoles };
