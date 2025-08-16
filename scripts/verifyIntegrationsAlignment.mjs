import fs from 'node:fs/promises';
import path from 'node:path';

/**
 * Reads a file as UTF-8.
 */
async function read(filePath) {
  return fs.readFile(filePath, 'utf8');
}

function toSet(iterable) {
  return new Set(iterable);
}

function sortArray(arr) {
  return [...arr].sort((a, b) => a.localeCompare(b));
}

/**
 * Parse enum Integrations from TS file and return string values of the enum.
 */
function parseEnumIntegrations(tsContent) {
  const enumMatch = tsContent.match(/export\s+enum\s+Integrations\s*\{([\s\S]*?)\}/m);
  if (!enumMatch) {
    throw new Error('Failed to locate "export enum Integrations { ... }" in connection.enum.ts');
  }
  const enumBody = enumMatch[1];
  const values = [];
  const re = /\b([a-zA-Z0-9_]+)\s*=\s*['"]([^'"\n]+)['"]/g;
  let m;
  while ((m = re.exec(enumBody)) !== null) {
    values.push(m[2]);
  }
  return toSet(values);
}

/**
 * Parse Go integrations list from integrations.go by scanning integration("name", ...)
 */
function parseGoIntegrations(goContent) {
  const names = new Set();
  const re = /\bintegration\(\s*"([a-zA-Z0-9_\-]+)"\s*,/g;
  let m;
  while ((m = re.exec(goContent)) !== null) {
    names.add(m[1]);
  }
  return names;
}

/**
 * Extract oauth config keys from configs.go: o.oauthConfigs = map[string]oauthConfig{ "key": { ... }, ... }
 */
function parseOAuthConfigKeys(goContent) {
  const anchor = 'o.oauthConfigs = map[string]oauthConfig{';
  const start = goContent.indexOf(anchor);
  if (start === -1) return new Set();
  let i = start + anchor.length;
  let depth = 1; // we've just passed the opening '{'
  // Find the matching closing '}' for the map literal
  while (i < goContent.length && depth > 0) {
    const ch = goContent[i++];
    if (ch === '{') depth++;
    else if (ch === '}') depth--;
  }
  const mapLiteral = goContent.slice(start + anchor.length, i - 1);

  const keys = new Set();
  const keyRe = /\n\s*"([a-zA-Z0-9_\-]+)"\s*:\s*\{/g;
  let m;
  while ((m = keyRe.exec(mapLiteral)) !== null) {
    keys.add(m[1]);
  }
  return keys;
}

/**
 * Normalize names from configs.go to align with UI enum, where we intentionally use
 * shorter names for Google integrations.
 */
function normalizeConfigName(name) {
  const googleMap = {
    googlecalendar: 'calendar',
    googledrive: 'drive',
    googleforms: 'forms',
    googlesheets: 'sheets',
    googleyoutube: 'youtube',
  };
  if (name in googleMap) return googleMap[name];
  // Map backend integration id to UI enum value
  if (name === 'gemini') return 'googlegemini';
  // Skip generic umbrella entries which are not user-selectable connections
  if (name === 'google') return null;
  return name;
}

function applyNormalizationToSet(names) {
  const out = new Set();
  for (const n of names) {
    const norm = normalizeConfigName(n);
    if (norm) out.add(norm);
  }
  return out;
}

function normalizeGoName(name) {
  if (name === 'gemini') return 'googlegemini';
  if (name === 'google') return null; // umbrella
  return name;
}

function applyGoNormalization(names) {
  const out = new Set();
  for (const n of names) {
    const norm = normalizeGoName(n);
    if (norm) out.add(norm);
  }
  return out;
}

async function main() {
  const repoRoot = process.cwd();

  const enumPath = path.join(repoRoot, 'src', 'enums', 'components', 'connection.enum.ts');
  const integrationsGoPath = path.join(repoRoot, 'src', 'autokitteh', 'internal', 'backend', 'svc', 'integrations.go');
  const configsGoPath = path.join(repoRoot, 'src', 'autokitteh', 'integrations', 'oauth', 'configs.go');

  const [enumContent, integGoContent, cfgGoContent] = await Promise.all([
    read(enumPath),
    read(integrationsGoPath),
    read(configsGoPath),
  ]);

  const enumValues = parseEnumIntegrations(enumContent);
  const goIntegrations = applyGoNormalization(parseGoIntegrations(integGoContent));
  const oauthKeysRaw = parseOAuthConfigKeys(cfgGoContent);
  const oauthKeys = applyNormalizationToSet(oauthKeysRaw);

  // Allow ignoring certain integrations via env var: INTEGRATION_CHECK_IGNORE=grpc,example
  const ignores = new Set(
    (process.env.INTEGRATION_CHECK_IGNORE || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
  );

  const allFromCode = new Set([...goIntegrations, ...oauthKeys]);
  for (const ig of ignores) {
    allFromCode.delete(ig);
  }

  const missingInEnum = [...allFromCode].filter((n) => !enumValues.has(n));

  if (missingInEnum.length > 0) {
    const lines = [
      'Integration alignment check failed:',
      '',
      'The following integrations exist in code (integrations.go / oauth configs) but are missing in src/enums/components/connection.enum.ts:',
      ...sortArray(missingInEnum).map((n) => ` - ${n}`),
      '',
      'Add them to the Integrations enum (or set INTEGRATION_CHECK_IGNORE to ignore), then re-run.',
    ];
    console.error(lines.join('\n'));
    // Use non-zero exit to stop build/dev commands.
    process.exit(1);
  }

  // Optional: report extras in enum not present in code (does not fail)
  const extrasInEnum = [...enumValues].filter((n) => !allFromCode.has(n));
  if (extrasInEnum.length > 0) {
    console.log('[warn] Integrations present in enum but not found in code:', sortArray(extrasInEnum).join(', '));
  }

  console.log('Integration alignment check passed.');
}

main().catch((err) => {
  console.error('Integration alignment check errored:', err?.stack || err?.message || String(err));
  process.exit(1);
});


