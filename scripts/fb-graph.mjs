#!/usr/bin/env node
/**
 * Direct Meta Graph API v21.0 CLI toolkit for the PreExam Facebook Page.
 * Zero external dependencies (requires Node.js 20+ native fetch/FormData/Blob).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const ENV_FILE = path.join(ROOT_DIR, '.env.facebook');

const DEFAULTS = {
  FB_GRAPH_VERSION: 'v21.0',
  FB_APP_ID: '665542379915928',
  FB_PAGE_ID: '531327006721248',
};

const MIME_BY_EXT = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.mp4': 'video/mp4',
  '.mov': 'video/quicktime',
};

class GraphApiError extends Error {
  constructor(message, { status = 0, code = null, subcode = null, type = null, hint = null } = {}) {
    super(message);
    this.name = 'GraphApiError';
    this.status = status;
    this.code = code;
    this.subcode = subcode;
    this.type = type;
    this.hint = hint;
  }
}

/** Mask tokens and secrets so raw credentials are never printed to stdout/stderr. */
function maskSecret(value) {
  if (!value || typeof value !== 'string') return '(unset)';
  if (value.length <= 10) return `${value.slice(0, 2)}***`;
  return `${value.slice(0, 6)}...${value.slice(-4)} (len=${value.length})`;
}

/** Load key=value pairs from .env.facebook without overriding existing process.env vars. */
function loadFacebookEnv() {
  const parsed = {};
  if (!fs.existsSync(ENV_FILE)) return parsed;
  const raw = fs.readFileSync(ENV_FILE, 'utf8');
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx <= 0) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    let val = trimmed.slice(eqIdx + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    parsed[key] = val;
    if (!(key in process.env)) {
      process.env[key] = val;
    }
  }
  return parsed;
}

/** Persist non-empty configuration values to .env.facebook using clean KEY=VALUE format. */
function saveFacebookEnv(updates) {
  const existing = loadFacebookEnv();
  const merged = {
    FB_GRAPH_VERSION: process.env.FB_GRAPH_VERSION || existing.FB_GRAPH_VERSION || DEFAULTS.FB_GRAPH_VERSION,
    FB_APP_ID: process.env.FB_APP_ID || existing.FB_APP_ID || DEFAULTS.FB_APP_ID,
    FB_PAGE_ID: process.env.FB_PAGE_ID || existing.FB_PAGE_ID || DEFAULTS.FB_PAGE_ID,
    ...existing,
    ...updates,
  };

  const orderedKeys = ['FB_GRAPH_VERSION', 'FB_APP_ID', 'FB_PAGE_ID', 'FB_PAGE_ACCESS_TOKEN', 'FB_APP_SECRET'];
  const lines = [
    '# PreExam Facebook Page Graph API credentials (gitignored via .env*)',
    ...orderedKeys
      .filter((k) => merged[k])
      .map((k) => `${k}=${merged[k]}`),
  ];

  fs.writeFileSync(ENV_FILE, `${lines.join('\n')}\n`, 'utf8');
}

function getConfig(flags = {}) {
  loadFacebookEnv();
  return {
    version: flags['graph-version'] || process.env.FB_GRAPH_VERSION || DEFAULTS.FB_GRAPH_VERSION,
    appId: flags['app-id'] || process.env.FB_APP_ID || DEFAULTS.FB_APP_ID,
    appSecret: flags['app-secret'] || process.env.FB_APP_SECRET || '',
    pageId: flags['page-id'] || process.env.FB_PAGE_ID || DEFAULTS.FB_PAGE_ID,
    pageToken: flags['page-token'] || process.env.FB_PAGE_ACCESS_TOKEN || '',
    userToken: flags['user-token'] || process.env.FB_USER_TOKEN || '',
  };
}

function requirePageToken(cfg) {
  if (!cfg.pageToken) {
    throw new GraphApiError(
      'Missing FB_PAGE_ACCESS_TOKEN. Configure .env.facebook first or run `exchange-token` / `save-token`.',
      {
        hint: `Run "node scripts/fb-graph.mjs help" or open https://developers.facebook.com/tools/explorer/?app_id=${cfg.appId}`,
      },
    );
  }
  return cfg.pageToken;
}

/** Parse CLI positional command and --flag / --flag=value options cleanly. */
function parseArgs(argv) {
  const [command = 'help', ...rest] = argv;
  const flags = {};
  for (let i = 0; i < rest.length; i++) {
    const token = rest[i];
    if (!token.startsWith('--')) continue;
    const body = token.slice(2);
    const eqIdx = body.indexOf('=');
    if (eqIdx !== -1) {
      flags[body.slice(0, eqIdx)] = body.slice(eqIdx + 1);
      continue;
    }
    const next = rest[i + 1];
    if (next !== undefined && !next.startsWith('--')) {
      flags[body] = next;
      i++;
    } else {
      flags[body] = true;
    }
  }
  return { command, flags };
}

function resolveTextOption(flags, directKey, fileKey) {
  if (flags[fileKey]) {
    const abs = path.resolve(flags[fileKey]);
    if (!fs.existsSync(abs)) {
      throw new Error(`Text file not found: ${abs}`);
    }
    return fs.readFileSync(abs, 'utf8').trim();
  }
  return typeof flags[directKey] === 'string' ? flags[directKey] : undefined;
}

function isRemoteUrl(input) {
  return typeof input === 'string' && /^https?:\/\//i.test(input.trim());
}

/** Build FormData with either a local Blob upload or a remote URL field. */
function appendMediaSource(form, input, urlField = 'url') {
  if (!input || typeof input !== 'string') {
    throw new Error('Media path or URL is required.');
  }
  if (isRemoteUrl(input)) {
    form.append(urlField, input.trim());
    return { mode: 'url', target: input.trim() };
  }
  const abs = path.resolve(input);
  if (!fs.existsSync(abs)) {
    throw new Error(`Local media file not found: ${abs}`);
  }
  const ext = path.extname(abs).toLowerCase();
  const mime = MIME_BY_EXT[ext] || 'application/octet-stream';
  const buf = fs.readFileSync(abs);
  form.append('source', new Blob([buf], { type: mime }), path.basename(abs));
  return { mode: 'file', target: abs, bytes: buf.byteLength, mime };
}

function buildGraphHint(errObj) {
  if (!errObj) return null;
  if (errObj.code === 190) {
    return 'Access token expired or invalid. Generate a fresh token and run `exchange-token` or `save-token`.';
  }
  if (errObj.code === 200 || /pages_manage_metadata/i.test(errObj.message || '')) {
    return 'Ensure the token has `pages_manage_posts`, `pages_manage_metadata`, `pages_read_engagement`, and full Page MANAGE control.';
  }
  return null;
}

async function graphRequest(version, endpoint, { method = 'GET', query = {}, body = undefined, headers = {} } = {}) {
  const url = endpoint.startsWith('http')
    ? new URL(endpoint)
    : new URL(`https://graph.facebook.com/${version}/${endpoint.replace(/^\/+/, '')}`);

  for (const [k, v] of Object.entries(query)) {
    if (v !== undefined && v !== null && v !== '') {
      url.searchParams.set(k, String(v));
    }
  }

  const res = await fetch(url, { method, body, headers });
  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { raw: text };
  }

  if (!res.ok || data?.error) {
    const errObj = data?.error || {};
    throw new GraphApiError(errObj.message || `HTTP ${res.status} from Meta Graph API`, {
      status: res.status,
      code: errObj.code ?? null,
      subcode: errObj.error_subcode ?? null,
      type: errObj.type ?? null,
      hint: buildGraphHint(errObj),
    });
  }
  return data;
}

/** Fetch matching managed Page and its Page Access Token from /me/accounts. */
async function fetchTargetPageToken(cfg, userToken) {
  const accounts = await graphRequest(cfg.version, 'me/accounts', {
    query: {
      fields: 'id,name,access_token,category,tasks',
      access_token: userToken,
    },
  });

  const pages = Array.isArray(accounts.data) ? accounts.data : [];
  const targetPage = pages.find((p) => String(p.id) === String(cfg.pageId));
  if (!targetPage || !targetPage.access_token) {
    const available = pages.map((p) => ({ id: p.id, name: p.name, category: p.category }));
    throw new Error(`Page ${cfg.pageId} not found in /me/accounts. Available pages: ${JSON.stringify(available)}`);
  }
  return targetPage;
}

/** Derive and persist a never-expiring Page Access Token from an already long-lived User Token. */
async function cmdDerivePageToken(cfg) {
  if (!cfg.userToken) {
    throw new Error('Missing user token. Pass --user-token <token> or set FB_USER_TOKEN in .env.facebook.');
  }

  let resolvedAppId = cfg.appId;
  try {
    const appInfo = await graphRequest(cfg.version, 'app', {
      query: { fields: 'id,name', access_token: cfg.userToken },
    });
    if (appInfo?.id) resolvedAppId = String(appInfo.id);
  } catch {
    // Non-fatal: continue with configured appId if /app lookup is unavailable.
  }

  const targetPage = await fetchTargetPageToken(cfg, cfg.userToken);
  saveFacebookEnv({
    FB_GRAPH_VERSION: cfg.version,
    FB_APP_ID: resolvedAppId,
    FB_PAGE_ID: targetPage.id,
    FB_PAGE_ACCESS_TOKEN: targetPage.access_token,
  });

  console.log(JSON.stringify({
    savedTo: ENV_FILE,
    appId: resolvedAppId,
    page: { id: targetPage.id, name: targetPage.name, category: targetPage.category, tasks: targetPage.tasks },
    pageToken: maskSecret(targetPage.access_token),
  }, null, 2));
}

async function cmdExchangeToken(cfg) {
  if (!cfg.userToken) {
    throw new Error('Missing user token. Pass --user-token <token> or set FB_USER_TOKEN in .env.facebook.');
  }
  if (!cfg.appSecret) {
    throw new Error('Missing app secret. Pass --app-secret <secret> or set FB_APP_SECRET in .env.facebook.');
  }

  const longUser = await graphRequest(cfg.version, 'oauth/access_token', {
    query: {
      grant_type: 'fb_exchange_token',
      client_id: cfg.appId,
      client_secret: cfg.appSecret,
      fb_exchange_token: cfg.userToken,
    },
  });

  if (!longUser.access_token) {
    throw new Error('Failed to exchange user token for a long-lived token.');
  }

  const targetPage = await fetchTargetPageToken(cfg, longUser.access_token);
  const debug = await graphRequest(cfg.version, 'debug_token', {
    query: {
      input_token: targetPage.access_token,
      access_token: `${cfg.appId}|${cfg.appSecret}`,
    },
  });

  saveFacebookEnv({
    FB_GRAPH_VERSION: cfg.version,
    FB_APP_ID: cfg.appId,
    FB_PAGE_ID: targetPage.id,
    FB_PAGE_ACCESS_TOKEN: targetPage.access_token,
    FB_APP_SECRET: cfg.appSecret,
  });

  const d = debug.data || {};
  console.log(JSON.stringify({
    savedTo: ENV_FILE,
    page: { id: targetPage.id, name: targetPage.name, category: targetPage.category, tasks: targetPage.tasks },
    pageToken: maskSecret(targetPage.access_token),
    isValid: Boolean(d.is_valid),
    neverExpires: d.expires_at === 0,
    expiresAt: d.expires_at ?? null,
    scopes: d.scopes || [],
  }, null, 2));
}

async function cmdSaveToken(cfg, flags) {
  const token = flags['page-token'] || cfg.pageToken;
  if (!token) {
    throw new Error('Pass --page-token <token> to validate and save it to .env.facebook.');
  }
  const pageInfo = await graphRequest(cfg.version, cfg.pageId, {
    query: {
      fields: 'id,name,about,category,followers_count',
      access_token: token,
    },
  });

  saveFacebookEnv({
    FB_GRAPH_VERSION: cfg.version,
    FB_APP_ID: cfg.appId,
    FB_PAGE_ID: pageInfo.id || cfg.pageId,
    FB_PAGE_ACCESS_TOKEN: token,
  });

  console.log(JSON.stringify({
    savedTo: ENV_FILE,
    page: pageInfo,
    pageToken: maskSecret(token),
  }, null, 2));
}

async function cmdMe(cfg) {
  const accessToken = requirePageToken(cfg);
  const data = await graphRequest(cfg.version, cfg.pageId, {
    query: {
      fields: 'id,name,about,bio,category,website,followers_count,fan_count,link',
      access_token: accessToken,
    },
  });
  console.log(JSON.stringify(data, null, 2));
}

async function cmdRecentPosts(cfg, flags) {
  const accessToken = requirePageToken(cfg);
  const limit = Number(flags.limit || 10);
  const data = await graphRequest(cfg.version, `${cfg.pageId}/posts`, {
    query: {
      fields: 'id,message,created_time,permalink_url',
      limit: Number.isFinite(limit) && limit > 0 ? limit : 10,
      access_token: accessToken,
    },
  });
  console.log(JSON.stringify(data, null, 2));
}

async function cmdPostPhoto(cfg, flags) {
  const accessToken = requirePageToken(cfg);
  const message = resolveTextOption(flags, 'message', 'message-file');
  const form = new FormData();
  form.append('access_token', accessToken);
  appendMediaSource(form, flags.image, 'url');
  if (message) form.append('message', message);
  if (flags.draft === true || flags.draft === 'true') {
    form.append('published', 'false');
    form.append('unpublished_content_type', 'DRAFT');
  }

  const data = await graphRequest(cfg.version, `${cfg.pageId}/photos`, {
    method: 'POST',
    body: form,
  });
  console.log(JSON.stringify(data, null, 2));
}

async function cmdPostReel(cfg, flags) {
  const accessToken = requirePageToken(cfg);
  const videoInput = flags.video;
  if (!videoInput || typeof videoInput !== 'string') {
    throw new Error('Missing required flag --video <path_or_url>.');
  }
  const description = resolveTextOption(flags, 'description', 'description-file');
  const videoState = (flags.draft === true || flags.draft === 'true') ? 'DRAFT' : 'PUBLISHED';

  const startRes = await graphRequest(cfg.version, `${cfg.pageId}/video_reels`, {
    method: 'POST',
    body: new URLSearchParams({
      upload_phase: 'start',
      access_token: accessToken,
    }),
  });

  if (!startRes.video_id || !startRes.upload_url) {
    throw new Error(`Unexpected start response: ${JSON.stringify(startRes)}`);
  }

  const uploadHeaders = { Authorization: `OAuth ${accessToken}` };
  let uploadBody;

  if (isRemoteUrl(videoInput)) {
    uploadHeaders.file_url = videoInput.trim();
  } else {
    const abs = path.resolve(videoInput);
    if (!fs.existsSync(abs)) {
      throw new Error(`Local video file not found: ${abs}`);
    }
    uploadBody = fs.readFileSync(abs);
    uploadHeaders.offset = '0';
    uploadHeaders.file_size = String(uploadBody.byteLength);
  }

  const uploadRes = await graphRequest(cfg.version, startRes.upload_url, {
    method: 'POST',
    headers: uploadHeaders,
    body: uploadBody,
  });

  const finishParams = new URLSearchParams({
    upload_phase: 'finish',
    video_id: startRes.video_id,
    video_state: videoState,
    access_token: accessToken,
  });
  if (description) {
    finishParams.set('description', description);
  }

  const finishRes = await graphRequest(cfg.version, `${cfg.pageId}/video_reels`, {
    method: 'POST',
    body: finishParams,
  });

  console.log(JSON.stringify({
    video_id: startRes.video_id,
    upload: uploadRes,
    finish: finishRes,
  }, null, 2));
}

async function cmdSetCover(cfg, flags) {
  const accessToken = requirePageToken(cfg);
  const uploadForm = new FormData();
  uploadForm.append('access_token', accessToken);
  uploadForm.append('published', 'false');
  appendMediaSource(uploadForm, flags.image, 'url');

  const uploaded = await graphRequest(cfg.version, `${cfg.pageId}/photos`, {
    method: 'POST',
    body: uploadForm,
  });

  const params = new URLSearchParams({
    cover: uploaded.id,
    offset_y: String(flags['offset-y'] ?? '0'),
    access_token: accessToken,
  });

  const updated = await graphRequest(cfg.version, cfg.pageId, {
    method: 'POST',
    body: params,
  });

  console.log(JSON.stringify({ photo_id: uploaded.id, result: updated }, null, 2));
}

async function cmdSetProfile(cfg, flags) {
  const accessToken = requirePageToken(cfg);
  const form = new FormData();
  form.append('access_token', accessToken);
  appendMediaSource(form, flags.image, 'picture');

  const updated = await graphRequest(cfg.version, `${cfg.pageId}/picture`, {
    method: 'POST',
    body: form,
  });
  console.log(JSON.stringify(updated, null, 2));
}

async function cmdUpdateInfo(cfg, flags) {
  const accessToken = requirePageToken(cfg);
  const about = resolveTextOption(flags, 'about', 'about-file');
  const bio = resolveTextOption(flags, 'bio', 'bio-file');
  const website = typeof flags.website === 'string' ? flags.website : undefined;

  const params = new URLSearchParams({ access_token: accessToken });
  let count = 0;
  if (about !== undefined) { params.set('about', about); count++; }
  if (bio !== undefined) { params.set('bio', bio); count++; }
  if (website !== undefined) { params.set('website', website); count++; }

  if (count === 0) {
    throw new Error('Provide at least one field to update: --about, --bio, or --website.');
  }

  const updated = await graphRequest(cfg.version, cfg.pageId, {
    method: 'POST',
    body: params,
  });
  console.log(JSON.stringify(updated, null, 2));
}

function printHelp() {
  console.log(`
PreExam Direct Meta Graph API CLI (${DEFAULTS.FB_GRAPH_VERSION})
Env file: ${ENV_FILE} (gitignored via .env*)

Commands:
  help
  derive-page-token [--user-token <t>] [--page-id <pid>]
  exchange-token [--user-token <t>] [--app-id <id>] [--app-secret <s>] [--page-id <pid>]
  save-token     --page-token <token> [--page-id <pid>]
  me
  recent-posts   [--limit 10]
  post-photo     --image <path_or_url> [--message <text> | --message-file <path>] [--draft]
  post-reel      --video <path_or_url> [--description <text> | --description-file <path>] [--draft]
  set-cover      --image <path_or_url> [--offset-y 0]
  set-profile    --image <path_or_url>
  update-info    [--about <text> | --about-file <path>] [--bio <text> | --bio-file <path>] [--website <url>]

Expected .env.facebook keys:
  FB_GRAPH_VERSION=${DEFAULTS.FB_GRAPH_VERSION}
  FB_APP_ID=${DEFAULTS.FB_APP_ID}
  FB_PAGE_ID=${DEFAULTS.FB_PAGE_ID}
  FB_PAGE_ACCESS_TOKEN=<never-expiring page token>
  FB_APP_SECRET=<app secret for exchange-token>
`.trim());
}

const HANDLERS = {
  help: async () => printHelp(),
  'derive-page-token': cmdDerivePageToken,
  'exchange-token': cmdExchangeToken,
  'save-token': cmdSaveToken,
  me: cmdMe,
  'recent-posts': cmdRecentPosts,
  'post-photo': cmdPostPhoto,
  'post-reel': cmdPostReel,
  'set-cover': cmdSetCover,
  'set-profile': cmdSetProfile,
  'update-info': cmdUpdateInfo,
};

async function main() {
  const { command, flags } = parseArgs(process.argv.slice(2));
  const handler = HANDLERS[command];
  if (!handler) {
    console.error(`Unknown command: ${command}`);
    printHelp();
    process.exit(1);
  }
  const cfg = getConfig(flags);
  await handler(cfg, flags);
}

main().catch((err) => {
  if (err instanceof GraphApiError) {
    console.error(JSON.stringify({
      error: err.message,
      status: err.status,
      code: err.code,
      subcode: err.subcode,
      type: err.type,
      hint: err.hint,
    }, null, 2));
  } else {
    console.error(JSON.stringify({ error: err.message || String(err) }, null, 2));
  }
  process.exit(1);
});
