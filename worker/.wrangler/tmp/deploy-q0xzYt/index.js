var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// (disabled):crypto
var require_crypto = __commonJS({
  "(disabled):crypto"() {
  }
});

// ../node_modules/stripe/esm/Types.js
var DEFAULT_BASE_ADDRESSES = {
  api: "api.stripe.com",
  files: "files.stripe.com",
  connect: "connect.stripe.com",
  meter_events: "meter-events.stripe.com"
};

// ../node_modules/stripe/esm/utils.js
function queryStringifyRequestData(data) {
  return stringifyRequestData(data);
}
__name(queryStringifyRequestData, "queryStringifyRequestData");
function encodeQueryValue(value) {
  return encodeURIComponent(value).replace(/!/g, "%21").replace(/\*/g, "%2A").replace(/\(/g, "%28").replace(/\)/g, "%29").replace(/'/g, "%27").replace(/%5B/g, "[").replace(/%5D/g, "]");
}
__name(encodeQueryValue, "encodeQueryValue");
function valueToString(value) {
  if (value instanceof Date) {
    return Math.floor(value.getTime() / 1e3).toString();
  }
  if (value === null) {
    return "";
  }
  return String(value);
}
__name(valueToString, "valueToString");
function stringifyRequestData(data) {
  const pairs = [];
  function encode(key, value) {
    if (value === void 0) {
      return;
    }
    if (value === null || typeof value !== "object" || value instanceof Date) {
      pairs.push(encodeQueryValue(key) + "=" + encodeQueryValue(valueToString(value)));
      return;
    }
    if (Array.isArray(value)) {
      for (let i = 0; i < value.length; i++) {
        if (value[i] !== void 0) {
          encode(key + "[" + i + "]", value[i]);
        }
      }
      return;
    }
    for (const k of Object.keys(value)) {
      encode(key + "[" + k + "]", value[k]);
    }
  }
  __name(encode, "encode");
  if (typeof data === "object" && data !== null) {
    for (const key of Object.keys(data)) {
      encode(key, data[key]);
    }
  }
  return pairs.join("&");
}
__name(stringifyRequestData, "stringifyRequestData");
var makeURLInterpolator = /* @__PURE__ */ (() => {
  const rc = {
    "\n": "\\n",
    '"': '\\"',
    "\u2028": "\\u2028",
    "\u2029": "\\u2029"
  };
  return (str) => {
    const cleanString = str.replace(/["\n\r\u2028\u2029]/g, ($0) => rc[$0]);
    return (outputs) => {
      return cleanString.replace(/\{([\s\S]+?)\}/g, ($0, $1) => {
        const output = outputs[$1];
        if (isValidEncodeUriComponentType(output))
          return encodeURIComponent(output);
        return "";
      });
    };
  };
})();
function isValidEncodeUriComponentType(value) {
  return ["number", "string", "boolean"].includes(typeof value);
}
__name(isValidEncodeUriComponentType, "isValidEncodeUriComponentType");
function processOptions(options) {
  const result = {
    authenticator: null,
    headers: {},
    settings: {},
    streaming: false,
    apiBase: null
  };
  if (!options) {
    return result;
  }
  if (options.apiKey) {
    result.authenticator = createApiKeyAuthenticator(options.apiKey);
  }
  if (options.idempotencyKey) {
    result.headers["Idempotency-Key"] = options.idempotencyKey;
  }
  if (options.stripeAccount) {
    result.headers["Stripe-Account"] = options.stripeAccount;
  }
  if (options.stripeContext) {
    if (result.headers["Stripe-Account"]) {
      throw new Error("Can't specify both stripeAccount and stripeContext.");
    }
    result.headers["Stripe-Context"] = options.stripeContext;
  }
  if (options.apiVersion) {
    result.headers["Stripe-Version"] = options.apiVersion;
  }
  if (Number.isInteger(options.maxNetworkRetries)) {
    result.settings.maxNetworkRetries = options.maxNetworkRetries;
  }
  if (Number.isInteger(options.timeout)) {
    result.settings.timeout = options.timeout;
  }
  if (options.authenticator) {
    if (options.apiKey) {
      throw new Error("Can't specify both apiKey and authenticator.");
    }
    if (typeof options.authenticator !== "function") {
      throw new Error("The authenticator must be a function receiving a request as the first parameter.");
    }
    result.authenticator = options.authenticator;
  }
  if (options.headers) {
    Object.assign(result.headers, options.headers);
  }
  if (options.streaming) {
    result.streaming = true;
  }
  return result;
}
__name(processOptions, "processOptions");
function removeNullish(obj) {
  if (typeof obj !== "object") {
    throw new Error("Argument must be an object");
  }
  return Object.keys(obj).reduce((result, key) => {
    if (obj[key] != null) {
      result[key] = obj[key];
    }
    return result;
  }, {});
}
__name(removeNullish, "removeNullish");
function normalizeHeaders(obj) {
  if (!(obj && typeof obj === "object")) {
    return obj;
  }
  return Object.keys(obj).reduce((result, header) => {
    result[normalizeHeader(header)] = obj[header];
    return result;
  }, {});
}
__name(normalizeHeaders, "normalizeHeaders");
function normalizeHeader(header) {
  return header.split("-").map((text) => text.charAt(0).toUpperCase() + text.substr(1).toLowerCase()).join("-");
}
__name(normalizeHeader, "normalizeHeader");
function pascalToCamelCase(name) {
  if (name === "OAuth") {
    return "oauth";
  } else {
    return name[0].toLowerCase() + name.substring(1);
  }
}
__name(pascalToCamelCase, "pascalToCamelCase");
function emitWarning(warning) {
  if (typeof process.emitWarning !== "function") {
    return console.warn(`Stripe: ${warning}`);
  }
  return process.emitWarning(warning, "Stripe");
}
__name(emitWarning, "emitWarning");
function isObject(obj) {
  const type = typeof obj;
  return (type === "function" || type === "object") && !!obj;
}
__name(isObject, "isObject");
function flattenAndStringify(data) {
  const result = {};
  const step = /* @__PURE__ */ __name((obj, prevKey) => {
    Object.entries(obj).forEach(([key, value]) => {
      const newKey = prevKey ? `${prevKey}[${key}]` : key;
      if (isObject(value)) {
        if (!(value instanceof Uint8Array) && !Object.prototype.hasOwnProperty.call(value, "data")) {
          return step(value, newKey);
        } else {
          result[newKey] = value;
        }
      } else {
        result[newKey] = String(value);
      }
    });
  }, "step");
  step(data, null);
  return result;
}
__name(flattenAndStringify, "flattenAndStringify");
function validateInteger(name, n, defaultVal) {
  if (!Number.isInteger(n)) {
    if (defaultVal !== void 0) {
      return defaultVal;
    } else {
      throw new Error(`${name} must be an integer`);
    }
  }
  return n;
}
__name(validateInteger, "validateInteger");
function determineProcessUserAgentProperties() {
  return typeof process === "undefined" ? {} : {
    lang_version: process.version
  };
}
__name(determineProcessUserAgentProperties, "determineProcessUserAgentProperties");
var AI_AGENTS = [
  // The beginning of the section generated from our OpenAPI spec
  ["ANTIGRAVITY_CLI_ALIAS", "antigravity"],
  ["CLAUDECODE", "claude_code"],
  ["CLINE_ACTIVE", "cline"],
  ["CODEX_SANDBOX", "codex_cli"],
  ["CODEX_THREAD_ID", "codex_cli"],
  ["CODEX_SANDBOX_NETWORK_DISABLED", "codex_cli"],
  ["CODEX_CI", "codex_cli"],
  ["CURSOR_AGENT", "cursor"],
  ["GEMINI_CLI", "gemini_cli"],
  ["OPENCLAW_SHELL", "openclaw"],
  ["OPENCODE", "open_code"]
  // The end of the section generated from our OpenAPI spec
];
function detectAIAgent(env) {
  for (const [envVar, agentName] of AI_AGENTS) {
    if (env[envVar]) {
      return agentName;
    }
  }
  return "";
}
__name(detectAIAgent, "detectAIAgent");
function createApiKeyAuthenticator(apiKey) {
  const authenticator = /* @__PURE__ */ __name((request) => {
    request.headers.Authorization = "Bearer " + apiKey;
    return Promise.resolve();
  }, "authenticator");
  authenticator._apiKey = apiKey;
  return authenticator;
}
__name(createApiKeyAuthenticator, "createApiKeyAuthenticator");
function dateTimeReplacer(key, value) {
  if (this[key] instanceof Date) {
    return Math.floor(this[key].getTime() / 1e3).toString();
  }
  return value;
}
__name(dateTimeReplacer, "dateTimeReplacer");
function jsonStringifyRequestData(data) {
  return JSON.stringify(data, dateTimeReplacer);
}
__name(jsonStringifyRequestData, "jsonStringifyRequestData");
function getAPIMode(path) {
  if (!path) {
    return "v1";
  }
  return path.startsWith("/v2") ? "v2" : "v1";
}
__name(getAPIMode, "getAPIMode");
function parseHttpHeaderAsString(header) {
  if (Array.isArray(header)) {
    return header.join(", ");
  }
  return String(header);
}
__name(parseHttpHeaderAsString, "parseHttpHeaderAsString");
function parseHttpHeaderAsNumber(header) {
  const number = Array.isArray(header) ? header[0] : header;
  return Number(number);
}
__name(parseHttpHeaderAsNumber, "parseHttpHeaderAsNumber");
function parseHeadersForFetch(headers) {
  return Object.entries(headers).map(([key, value]) => {
    return [key, parseHttpHeaderAsString(value)];
  });
}
__name(parseHeadersForFetch, "parseHeadersForFetch");
var CALL_SITE_MARKER = "\nOriginating from:";
function attachCallSiteToError(err, callSiteStack) {
  if (!err || !err.stack || !callSiteStack) {
    return;
  }
  const callerFrames = callSiteStack.substring(callSiteStack.indexOf("\n") + 1);
  const existingMarkerIdx = err.stack.indexOf(CALL_SITE_MARKER);
  const baseStack = existingMarkerIdx >= 0 ? err.stack.substring(0, existingMarkerIdx) : err.stack;
  err.stack = `${baseStack}${CALL_SITE_MARKER}
${callerFrames}`;
}
__name(attachCallSiteToError, "attachCallSiteToError");

// ../node_modules/stripe/esm/net/HttpClient.js
var HttpClient = class _HttpClient {
  static {
    __name(this, "HttpClient");
  }
  /** The client name used for diagnostics. */
  getClientName() {
    throw new Error("getClientName not implemented.");
  }
  makeRequest(host, port, path, method, headers, requestData, protocol, timeout) {
    throw new Error("makeRequest not implemented.");
  }
  /** Helper to make a consistent timeout error across implementations. */
  static makeTimeoutError() {
    const timeoutErr = new TypeError(_HttpClient.TIMEOUT_ERROR_CODE);
    timeoutErr.code = _HttpClient.TIMEOUT_ERROR_CODE;
    return timeoutErr;
  }
};
HttpClient.CONNECTION_CLOSED_ERROR_CODES = ["ECONNRESET", "EPIPE"];
HttpClient.TIMEOUT_ERROR_CODE = "ETIMEDOUT";
var HttpClientResponse = class {
  static {
    __name(this, "HttpClientResponse");
  }
  constructor(statusCode, headers) {
    this._statusCode = statusCode;
    this._headers = headers;
  }
  getStatusCode() {
    return this._statusCode;
  }
  getHeaders() {
    return this._headers;
  }
  getRawResponse() {
    throw new Error("getRawResponse not implemented.");
  }
  toStream(streamCompleteCallback) {
    throw new Error("toStream not implemented.");
  }
  toJSON() {
    throw new Error("toJSON not implemented.");
  }
};

// ../node_modules/stripe/esm/net/FetchHttpClient.js
var FetchHttpClient = class _FetchHttpClient extends HttpClient {
  static {
    __name(this, "FetchHttpClient");
  }
  constructor(fetchFn) {
    super();
    if (!fetchFn) {
      if (!globalThis.fetch) {
        throw new Error("fetch() function not provided and is not defined in the global scope. You must provide a fetch implementation.");
      }
      fetchFn = globalThis.fetch;
    }
    if (globalThis.AbortController) {
      this._fetchFn = _FetchHttpClient.makeFetchWithAbortTimeout(fetchFn);
    } else {
      this._fetchFn = _FetchHttpClient.makeFetchWithRaceTimeout(fetchFn);
    }
  }
  static makeFetchWithRaceTimeout(fetchFn) {
    return (url, init, timeout) => {
      let pendingTimeoutId;
      const timeoutPromise = new Promise((_, reject) => {
        pendingTimeoutId = setTimeout(() => {
          pendingTimeoutId = null;
          reject(HttpClient.makeTimeoutError());
        }, timeout);
      });
      const fetchPromise = fetchFn(url, init);
      return Promise.race([fetchPromise, timeoutPromise]).finally(() => {
        if (pendingTimeoutId) {
          clearTimeout(pendingTimeoutId);
        }
      });
    };
  }
  static makeFetchWithAbortTimeout(fetchFn) {
    return async (url, init, timeout) => {
      const abort = new AbortController();
      let timeoutId = setTimeout(() => {
        timeoutId = null;
        abort.abort(HttpClient.makeTimeoutError());
      }, timeout);
      try {
        return await fetchFn(url, {
          ...init,
          signal: abort.signal
        });
      } catch (err) {
        if (err.name === "AbortError") {
          throw HttpClient.makeTimeoutError();
        } else {
          throw err;
        }
      } finally {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
      }
    };
  }
  /** @override. */
  getClientName() {
    return "fetch";
  }
  async makeRequest(host, port, path, method, headers, requestData, protocol, timeout) {
    const isInsecureConnection = protocol === "http";
    if (!path.startsWith("/")) {
      throw new Error(`Only relative paths are supported, got: "${path}"`);
    }
    const url = new URL(`${isInsecureConnection ? "http" : "https"}://${host}${path}`);
    url.port = port;
    const methodHasPayload = method == "POST" || method == "PUT" || method == "PATCH";
    const body = requestData || (methodHasPayload ? "" : void 0);
    const res = await this._fetchFn(url.toString(), {
      method,
      headers: parseHeadersForFetch(headers),
      body
    }, timeout);
    return new FetchHttpClientResponse(res);
  }
};
var FetchHttpClientResponse = class _FetchHttpClientResponse extends HttpClientResponse {
  static {
    __name(this, "FetchHttpClientResponse");
  }
  constructor(res) {
    super(res.status, _FetchHttpClientResponse._transformHeadersToObject(res.headers));
    this._res = res;
  }
  getRawResponse() {
    return this._res;
  }
  toStream(streamCompleteCallback) {
    streamCompleteCallback();
    return this._res.body;
  }
  toJSON() {
    return this._res.text().then((text) => {
      try {
        return JSON.parse(text);
      } catch (e) {
        if (e instanceof Error) {
          e.rawBody = text;
        }
        throw e;
      }
    });
  }
  static _transformHeadersToObject(headers) {
    const headersObj = {};
    for (const entry of headers) {
      if (!Array.isArray(entry) || entry.length != 2) {
        throw new Error("Response objects produced by the fetch function given to FetchHttpClient do not have an iterable headers map. Response#headers should be an iterable object.");
      }
      headersObj[entry[0]] = entry[1];
    }
    return headersObj;
  }
};

// ../node_modules/stripe/esm/crypto/CryptoProvider.js
var CryptoProvider = class {
  static {
    __name(this, "CryptoProvider");
  }
  /**
   * Computes a SHA-256 HMAC given a secret and a payload (encoded in UTF-8).
   * The output HMAC should be encoded in hexadecimal.
   *
   * Sample values for implementations:
   * - computeHMACSignature('', 'test_secret') => 'f7f9bd47fb987337b5796fdc1fdb9ba221d0d5396814bfcaf9521f43fd8927fd'
   * - computeHMACSignature('\ud83d\ude00', 'test_secret') => '837da296d05c4fe31f61d5d7ead035099d9585a5bcde87de952012a78f0b0c43
   */
  computeHMACSignature(payload, secret) {
    throw new Error("computeHMACSignature not implemented.");
  }
  /**
   * Asynchronous version of `computeHMACSignature`. Some implementations may
   * only allow support async signature computation.
   *
   * Computes a SHA-256 HMAC given a secret and a payload (encoded in UTF-8).
   * The output HMAC should be encoded in hexadecimal.
   *
   * Sample values for implementations:
   * - computeHMACSignature('', 'test_secret') => 'f7f9bd47fb987337b5796fdc1fdb9ba221d0d5396814bfcaf9521f43fd8927fd'
   * - computeHMACSignature('\ud83d\ude00', 'test_secret') => '837da296d05c4fe31f61d5d7ead035099d9585a5bcde87de952012a78f0b0c43
   */
  computeHMACSignatureAsync(payload, secret) {
    throw new Error("computeHMACSignatureAsync not implemented.");
  }
  /**
   * Computes a SHA-256 hash of the data.
   */
  computeSHA256Async(data) {
    throw new Error("computeSHA256 not implemented.");
  }
};
var CryptoProviderOnlySupportsAsyncError = class extends Error {
  static {
    __name(this, "CryptoProviderOnlySupportsAsyncError");
  }
};

// ../node_modules/stripe/esm/crypto/SubtleCryptoProvider.js
var SubtleCryptoProvider = class extends CryptoProvider {
  static {
    __name(this, "SubtleCryptoProvider");
  }
  constructor(subtleCrypto) {
    super();
    this.subtleCrypto = subtleCrypto || crypto.subtle;
  }
  /** @override */
  computeHMACSignature(payload, secret) {
    throw new CryptoProviderOnlySupportsAsyncError("SubtleCryptoProvider cannot be used in a synchronous context.");
  }
  /** @override */
  async computeHMACSignatureAsync(payload, secret) {
    const encoder = new TextEncoder();
    const key = await this.subtleCrypto.importKey("raw", encoder.encode(secret), {
      name: "HMAC",
      hash: { name: "SHA-256" }
    }, false, ["sign"]);
    const signatureBuffer = await this.subtleCrypto.sign("hmac", key, encoder.encode(payload));
    const signatureBytes = new Uint8Array(signatureBuffer);
    const signatureHexCodes = new Array(signatureBytes.length);
    for (let i = 0; i < signatureBytes.length; i++) {
      signatureHexCodes[i] = byteHexMapping[signatureBytes[i]];
    }
    return signatureHexCodes.join("");
  }
  /** @override */
  async computeSHA256Async(data) {
    return new Uint8Array(await this.subtleCrypto.digest("SHA-256", data));
  }
};
var byteHexMapping = new Array(256);
for (let i = 0; i < byteHexMapping.length; i++) {
  byteHexMapping[i] = i.toString(16).padStart(2, "0");
}

// ../node_modules/stripe/esm/platform/PlatformFunctions.js
var PlatformFunctions = class {
  static {
    __name(this, "PlatformFunctions");
  }
  constructor() {
    this._fetchFn = null;
    this._agent = null;
  }
  /**
   * Returns platform info string for telemetry, or null if unavailable.
   */
  getPlatformInfo() {
    return null;
  }
  /**
   * Generates a v4 UUID. See https://stackoverflow.com/a/2117523
   */
  uuid4() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0;
      const v = c === "x" ? r : r & 3 | 8;
      return v.toString(16);
    });
  }
  /**
   * Compares strings in constant time.
   */
  secureCompare(a, b) {
    if (a.length !== b.length) {
      return false;
    }
    const len = a.length;
    let result = 0;
    for (let i = 0; i < len; ++i) {
      result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }
    return result === 0;
  }
  /**
   * Creates an event emitter.
   */
  createEmitter() {
    throw new Error("createEmitter not implemented.");
  }
  /**
   * Checks if the request data is a stream. If so, read the entire stream
   * to a buffer and return the buffer.
   */
  tryBufferData(data) {
    throw new Error("tryBufferData not implemented.");
  }
  /**
   * Creates an HTTP client which uses the Node `http` and `https` packages
   * to issue requests.
   */
  createNodeHttpClient(agent) {
    throw new Error("createNodeHttpClient not implemented.");
  }
  /**
   * Creates an HTTP client for issuing Stripe API requests which uses the Web
   * Fetch API.
   *
   * A fetch function can optionally be passed in as a parameter. If none is
   * passed, will default to the default `fetch` function in the global scope.
   */
  createFetchHttpClient(fetchFn) {
    return new FetchHttpClient(fetchFn);
  }
  /**
   * Creates an HTTP client using runtime-specific APIs.
   */
  createDefaultHttpClient() {
    throw new Error("createDefaultHttpClient not implemented.");
  }
  /**
   * Creates a CryptoProvider which uses the Node `crypto` package for its computations.
   */
  createNodeCryptoProvider() {
    throw new Error("createNodeCryptoProvider not implemented.");
  }
  /**
   * Creates a CryptoProvider which uses the SubtleCrypto interface of the Web Crypto API.
   */
  createSubtleCryptoProvider(subtleCrypto) {
    return new SubtleCryptoProvider(subtleCrypto);
  }
  createDefaultCryptoProvider() {
    throw new Error("createDefaultCryptoProvider not implemented.");
  }
};

// ../node_modules/stripe/esm/StripeEmitter.js
var _StripeEvent = class extends Event {
  static {
    __name(this, "_StripeEvent");
  }
  constructor(eventName, data) {
    super(eventName);
    this.data = data;
  }
};
var StripeEmitter = class {
  static {
    __name(this, "StripeEmitter");
  }
  constructor() {
    this.eventTarget = new EventTarget();
    this.listenerMapping = /* @__PURE__ */ new Map();
  }
  on(eventName, listener) {
    const listenerWrapper = /* @__PURE__ */ __name((event) => {
      listener(event.data);
    }, "listenerWrapper");
    this.listenerMapping.set(listener, listenerWrapper);
    return this.eventTarget.addEventListener(eventName, listenerWrapper);
  }
  removeListener(eventName, listener) {
    const listenerWrapper = this.listenerMapping.get(listener);
    this.listenerMapping.delete(listener);
    return this.eventTarget.removeEventListener(eventName, listenerWrapper);
  }
  once(eventName, listener) {
    const listenerWrapper = /* @__PURE__ */ __name((event) => {
      listener(event.data);
    }, "listenerWrapper");
    this.listenerMapping.set(listener, listenerWrapper);
    return this.eventTarget.addEventListener(eventName, listenerWrapper, {
      once: true
    });
  }
  emit(eventName, data) {
    return this.eventTarget.dispatchEvent(new _StripeEvent(eventName, data));
  }
};

// ../node_modules/stripe/esm/platform/WebPlatformFunctions.js
var WebPlatformFunctions = class extends PlatformFunctions {
  static {
    __name(this, "WebPlatformFunctions");
  }
  /** @override */
  createEmitter() {
    return new StripeEmitter();
  }
  /** @override */
  tryBufferData(data) {
    if (data.file.data instanceof ReadableStream) {
      throw new Error("Uploading a file as a stream is not supported in non-Node environments. Please open or upvote an issue at github.com/stripe/stripe-node if you use this, detailing your use-case.");
    }
    return Promise.resolve(data);
  }
  /** @override */
  createNodeHttpClient() {
    throw new Error("Stripe: `createNodeHttpClient()` is not available in non-Node environments. Please use `createFetchHttpClient()` instead.");
  }
  /** @override */
  createDefaultHttpClient() {
    return super.createFetchHttpClient();
  }
  /** @override */
  createNodeCryptoProvider() {
    throw new Error("Stripe: `createNodeCryptoProvider()` is not available in non-Node environments. Please use `createSubtleCryptoProvider()` instead.");
  }
  /** @override */
  createDefaultCryptoProvider() {
    return this.createSubtleCryptoProvider();
  }
};

// ../node_modules/stripe/esm/Decimal.js
var ROUNDING_PRESETS = {
  "ubb-usage-count": { mode: "significant-figures", value: 15 },
  "v1-api": { mode: "decimal-places", value: 12 }
};
var PLAIN_NOTATION_DIGIT_LIMIT = 30;
var MAX_EXPONENT = 1e6;
var DecimalImpl = class _DecimalImpl {
  static {
    __name(this, "DecimalImpl");
  }
  /**
   * Construct and normalise a decimal value.
   *
   * @param coefficient - The unscaled integer value.
   * @param exponent - The power-of-ten scale factor.
   *
   * @internal
   */
  constructor(coefficient, exponent) {
    const [normalizedCoef, normalizedExp] = _DecimalImpl.normalize(coefficient, exponent);
    this._coefficient = normalizedCoef;
    this._exponent = normalizedExp;
    Object.freeze(this);
  }
  /**
   * Strip trailing zeros from `coefficient`, incrementing `exponent`
   * for each zero removed. Zero always normalises to `(0n, 0)`.
   *
   * @param coefficient - Raw coefficient before normalisation.
   * @param exponent - Raw exponent before normalisation.
   * @returns A `[coefficient, exponent]` tuple with trailing zeros removed.
   *
   * @internal
   */
  static normalize(coefficient, exponent) {
    if (coefficient === 0n) {
      return [0n, 0];
    }
    let coef = coefficient;
    let exp = exponent;
    while (coef !== 0n && coef % 10n === 0n) {
      coef /= 10n;
      exp += 1;
    }
    return [coef, exp];
  }
  /**
   * Apply rounding to the result of an integer division.
   *
   * @remarks
   * BigInt division truncates toward zero. This helper inspects the
   * `remainder` to decide whether to adjust the truncated `quotient`
   * by ±1 according to the chosen {@link RoundDirection}.
   *
   * The rounding direction is derived from the signs of `remainder`
   * and `divisor`: when they agree the exact fractional part is
   * positive (the truncation point is below the true value, so +1
   * rounds to nearest); when they disagree the fractional part is
   * negative (−1 rounds to nearest).
   *
   * @param quotient - Truncated integer quotient (`dividend / divisor`).
   * @param remainder - Division remainder (`dividend % divisor`).
   * @param divisor - The divisor used in the division.
   * @param direction - The rounding strategy to apply.
   * @returns The rounded quotient.
   *
   * @internal
   */
  static roundDivision(quotient, remainder, divisor, direction) {
    if (remainder === 0n) {
      return quotient;
    }
    if (direction === "round-down") {
      return quotient;
    }
    const roundDir = remainder > 0n === divisor > 0n ? 1n : -1n;
    if (direction === "round-up") {
      return quotient + roundDir;
    }
    if (direction === "ceil") {
      return roundDir === 1n ? quotient + 1n : quotient;
    }
    if (direction === "floor") {
      return roundDir === -1n ? quotient - 1n : quotient;
    }
    const absRemainder = remainder < 0n ? -remainder : remainder;
    const absDivisor = divisor < 0n ? -divisor : divisor;
    const doubled = absRemainder * 2n;
    let cmp;
    if (doubled === absDivisor) {
      cmp = 0;
    } else if (doubled < absDivisor) {
      cmp = -1;
    } else {
      cmp = 1;
    }
    if (cmp < 0) {
      return quotient;
    }
    if (cmp > 0) {
      return quotient + roundDir;
    }
    if (direction === "half-up") {
      return quotient + roundDir;
    }
    if (direction === "half-down") {
      return quotient;
    }
    if (quotient % 2n === 0n) {
      return quotient;
    } else {
      return quotient + roundDir;
    }
  }
  // -------------------------------------------------------------------
  // Arithmetic
  // -------------------------------------------------------------------
  /**
   * Return the sum of this value and `other`.
   *
   * @param other - The addend.
   * @returns A new {@link Decimal} equal to `this + other`.
   *
   * @public
   */
  add(other) {
    const otherImpl = other;
    if (this._exponent === otherImpl._exponent) {
      return new _DecimalImpl(this._coefficient + otherImpl._coefficient, this._exponent);
    }
    if (this._exponent < otherImpl._exponent) {
      const scale = 10n ** BigInt(otherImpl._exponent - this._exponent);
      return new _DecimalImpl(this._coefficient + otherImpl._coefficient * scale, this._exponent);
    } else {
      const scale = 10n ** BigInt(this._exponent - otherImpl._exponent);
      return new _DecimalImpl(this._coefficient * scale + otherImpl._coefficient, otherImpl._exponent);
    }
  }
  /**
   * Return the difference of this value and `other`.
   *
   * @param other - The subtrahend.
   * @returns A new {@link Decimal} equal to `this - other`.
   *
   * @public
   */
  sub(other) {
    const otherImpl = other;
    if (this._exponent === otherImpl._exponent) {
      return new _DecimalImpl(this._coefficient - otherImpl._coefficient, this._exponent);
    }
    if (this._exponent < otherImpl._exponent) {
      const scale = 10n ** BigInt(otherImpl._exponent - this._exponent);
      return new _DecimalImpl(this._coefficient - otherImpl._coefficient * scale, this._exponent);
    } else {
      const scale = 10n ** BigInt(this._exponent - otherImpl._exponent);
      return new _DecimalImpl(this._coefficient * scale - otherImpl._coefficient, otherImpl._exponent);
    }
  }
  /**
   * Return the product of this value and `other`.
   *
   * @param other - The multiplicand.
   * @returns A new {@link Decimal} equal to `this × other`.
   *
   * @public
   */
  mul(other) {
    const otherImpl = other;
    return new _DecimalImpl(this._coefficient * otherImpl._coefficient, this._exponent + otherImpl._exponent);
  }
  /**
   * Return the quotient of this value divided by `other`.
   *
   * @remarks
   * Division scales the dividend to produce `precision` decimal digits
   * in the result, then applies integer division and rounds the
   * remainder according to `direction`.
   *
   * Division requires explicit rounding control — no invisible defaults
   * in financial code. For full precision use {@link DEFAULT_DIV_PRECISION}
   * (34, matching the IEEE 754 decimal128 coefficient size).
   *
   * @example
   * ```ts
   * Decimal.from('1').div(Decimal.from('3'), 5, 'half-up');   // "0.33333"
   * Decimal.from('5').div(Decimal.from('2'), 0, 'half-up');   // "3"
   * Decimal.from('5').div(Decimal.from('2'), 0, 'half-even'); // "2"
   * ```
   *
   * @param other - The divisor. Must not be zero.
   * @param precision - Maximum number of decimal digits in the result.
   * @param direction - How to round when the exact quotient cannot
   *   be represented at the requested precision.
   * @returns A new {@link Decimal} equal to `this ÷ other`, rounded to
   *   `precision` decimal places.
   * @throws {@link Error} if `other` is zero.
   * @throws {@link Error} if `precision` is negative or non-integer.
   *
   * @public
   */
  div(other, precision, direction) {
    if (precision < 0 || !Number.isInteger(precision)) {
      throw new Error("precision must be a non-negative integer");
    }
    const otherImpl = other;
    if (otherImpl._coefficient === 0n) {
      throw new Error("Division by zero");
    }
    const scale = this._exponent - otherImpl._exponent + precision;
    let quotient;
    let remainder;
    let roundingDivisor;
    if (scale >= 0) {
      const scaledDividend = this._coefficient * 10n ** BigInt(scale);
      quotient = scaledDividend / otherImpl._coefficient;
      remainder = scaledDividend % otherImpl._coefficient;
      roundingDivisor = otherImpl._coefficient;
    } else {
      const scaledDivisor = otherImpl._coefficient * 10n ** BigInt(-scale);
      quotient = this._coefficient / scaledDivisor;
      remainder = this._coefficient % scaledDivisor;
      roundingDivisor = scaledDivisor;
    }
    const roundedQuotient = _DecimalImpl.roundDivision(quotient, remainder, roundingDivisor, direction);
    return new _DecimalImpl(roundedQuotient, -precision);
  }
  // -------------------------------------------------------------------
  // Comparison
  // -------------------------------------------------------------------
  /**
   * Three-way comparison of this value with `other`.
   *
   * @example
   * ```ts
   * const a = Decimal.from('1.5');
   * const b = Decimal.from('2');
   * a.cmp(b); // -1
   * b.cmp(a); //  1
   * a.cmp(a); //  0
   * ```
   *
   * @param other - The value to compare against.
   * @returns `-1` if `this \< other`, `0` if equal, `1` if `this \> other`.
   *
   * @public
   */
  cmp(other) {
    const otherImpl = other;
    if (this._exponent === otherImpl._exponent) {
      if (this._coefficient < otherImpl._coefficient)
        return -1;
      if (this._coefficient > otherImpl._coefficient)
        return 1;
      return 0;
    }
    if (this._exponent < otherImpl._exponent) {
      const scale = 10n ** BigInt(otherImpl._exponent - this._exponent);
      const scaledOther = otherImpl._coefficient * scale;
      if (this._coefficient < scaledOther)
        return -1;
      if (this._coefficient > scaledOther)
        return 1;
      return 0;
    } else {
      const scale = 10n ** BigInt(this._exponent - otherImpl._exponent);
      const scaledThis = this._coefficient * scale;
      if (scaledThis < otherImpl._coefficient)
        return -1;
      if (scaledThis > otherImpl._coefficient)
        return 1;
      return 0;
    }
  }
  /**
   * Return `true` if this value is numerically equal to `other`.
   *
   * @param other - The value to compare against.
   * @returns `true` if `this === other` in value, `false` otherwise.
   *
   * @public
   */
  eq(other) {
    return this.cmp(other) === 0;
  }
  /**
   * Return `true` if this value is strictly less than `other`.
   *
   * @param other - The value to compare against.
   * @returns `true` if `this \< other`, `false` otherwise.
   *
   * @public
   */
  lt(other) {
    return this.cmp(other) === -1;
  }
  /**
   * Return `true` if this value is less than or equal to `other`.
   *
   * @param other - The value to compare against.
   * @returns `true` if `this ≤ other`, `false` otherwise.
   *
   * @public
   */
  lte(other) {
    return this.cmp(other) <= 0;
  }
  /**
   * Return `true` if this value is strictly greater than `other`.
   *
   * @param other - The value to compare against.
   * @returns `true` if `this \> other`, `false` otherwise.
   *
   * @public
   */
  gt(other) {
    return this.cmp(other) === 1;
  }
  /**
   * Return `true` if this value is greater than or equal to `other`.
   *
   * @param other - The value to compare against.
   * @returns `true` if `this ≥ other`, `false` otherwise.
   *
   * @public
   */
  gte(other) {
    return this.cmp(other) >= 0;
  }
  // -------------------------------------------------------------------
  // Predicates
  // -------------------------------------------------------------------
  /**
   * Return `true` if this value is exactly zero.
   *
   * @returns `true` if the value is zero, `false` otherwise.
   *
   * @public
   */
  isZero() {
    return this._coefficient === 0n;
  }
  /**
   * Return `true` if this value is strictly less than zero.
   *
   * @returns `true` if negative, `false` if zero or positive.
   *
   * @public
   */
  isNegative() {
    return this._coefficient < 0n;
  }
  /**
   * Return `true` if this value is strictly greater than zero.
   *
   * @returns `true` if positive, `false` if zero or negative.
   *
   * @public
   */
  isPositive() {
    return this._coefficient > 0n;
  }
  // -------------------------------------------------------------------
  // Unary operations
  // -------------------------------------------------------------------
  /**
   * Return the additive inverse of this value.
   *
   * @returns A new {@link Decimal} equal to `-this`.
   *
   * @public
   */
  neg() {
    return new _DecimalImpl(-this._coefficient, this._exponent);
  }
  /**
   * Return the absolute value.
   *
   * @returns A new {@link Decimal} equal to `|this|`. If this value is
   *   already non-negative, returns `this` (no allocation).
   *
   * @public
   */
  abs() {
    if (this._coefficient < 0n) {
      return new _DecimalImpl(-this._coefficient, this._exponent);
    }
    return this;
  }
  // -------------------------------------------------------------------
  // Rounding
  // -------------------------------------------------------------------
  /**
   * Round this value to a specified precision.
   *
   * @remarks
   * **Rounding directions** (IEEE 754-2019 §4.3):
   *
   * | Direction      | Behavior                                       |
   * | -------------- | ---------------------------------------------- |
   * | `'ceil'`       |  1.1→2, -1.1→-1, 1.0→1 (toward +∞)             |
   * | `'floor'`      |  1.9→1, -1.1→-2, 1.0→1 (toward -∞)             |
   * | `'round-down'` |  1.9→1, -1.9→-1 (toward zero / truncate)       |
   * | `'round-up'`   |  1.1→2, -1.1→-2 (away from zero)               |
   * | `'half-up'`    |  0.5→1, 1.5→2, -0.5→-1 (ties away from zero)   |
   * | `'half-down'`  |  0.5→0, 1.5→1, -0.5→0 (ties toward zero)       |
   * | `'half-even'`  |  0.5→0, 1.5→2, 2.5→2, 3.5→4 (ties to even)     |
   *
   * **Precision** is specified as a {@link DecimalRoundingOptions} object
   * or a preset name from {@link DecimalRoundingPresets}:
   *
   * @example
   * ```ts
   * // Using a preset
   * amount.round('half-even', 'v1-api');
   *
   * // Using explicit options
   * amount.round('half-even', { mode: 'decimal-places', value: 2 });
   * amount.round('half-up', { mode: 'significant-figures', value: 4 });
   * ```
   *
   * @param direction - How to round.
   * @param options - A {@link DecimalRoundingOptions} object or key of {@link DecimalRoundingPresets}.
   * @returns A new {@link Decimal} rounded to the specified precision.
   * @throws {@link Error} if `options.value` is negative or non-integer.
   * @throws {@link Error} if the preset name is not recognized.
   *
   * @public
   */
  round(direction, options) {
    const resolved = typeof options === "string" ? (
      // Declaration merging allows consumers to add keys at compile time, but
      // ROUNDING_PRESETS only knows about built-in keys at runtime.  The double
      // cast through `unknown` is intentional: we want an undefined-safe lookup
      // so the runtime guard below can produce a clear error for unrecognised
      // (e.g. declaration-merged) preset names that were not also added to
      // ROUNDING_PRESETS.
      ROUNDING_PRESETS[options]
    ) : options;
    if (resolved === void 0) {
      throw new Error(`Unknown rounding preset: "${options}"`);
    }
    if (resolved.value < 0 || !Number.isInteger(resolved.value)) {
      throw new Error("DecimalRoundingOptions.value must be a non-negative integer");
    }
    if (resolved.mode === "decimal-places") {
      const fixed = this.toFixed(resolved.value, direction);
      return Decimal.from(fixed);
    }
    if (this._coefficient === 0n) {
      return this;
    }
    const coeffStr = this._coefficient < 0n ? (-this._coefficient).toString() : this._coefficient.toString();
    const currentSigFigs = coeffStr.length;
    if (resolved.value === 0) {
      return Decimal.zero;
    }
    if (currentSigFigs <= resolved.value) {
      return this;
    }
    const digitsToTrim = currentSigFigs - resolved.value;
    const divisor = 10n ** BigInt(digitsToTrim);
    const quotient = this._coefficient / divisor;
    const remainder = this._coefficient % divisor;
    const rounded = _DecimalImpl.roundDivision(quotient, remainder, divisor, direction);
    return new _DecimalImpl(rounded, this._exponent + digitsToTrim);
  }
  // -------------------------------------------------------------------
  // Conversion / serialisation
  // -------------------------------------------------------------------
  /**
   * Return a human-readable string representation.
   *
   * @remarks
   * Plain notation for values whose digit count is at most 30, and
   * scientific notation (`1.23E+40`) for larger values. Trailing zeros
   * are never present because the internal representation is normalised.
   *
   * @public
   */
  toString() {
    if (this._coefficient === 0n) {
      return "0";
    }
    const coeffStr = this._coefficient.toString();
    const isNeg = coeffStr.startsWith("-");
    const absCoeffStr = isNeg ? coeffStr.slice(1) : coeffStr;
    if (this._exponent < 0) {
      const decimalPlaces = -this._exponent;
      const leadingZeroCount = decimalPlaces >= absCoeffStr.length ? decimalPlaces - absCoeffStr.length : 0;
      if (leadingZeroCount > PLAIN_NOTATION_DIGIT_LIMIT) {
        if (absCoeffStr.length === 1) {
          return `${coeffStr}E${String(this._exponent)}`;
        }
        const intPart = absCoeffStr[0] ?? "";
        const fracPart = absCoeffStr.slice(1);
        const adjustedExp = this._exponent + absCoeffStr.length - 1;
        return `${isNeg ? "-" : ""}${intPart}.${fracPart}E${String(adjustedExp)}`;
      }
      if (decimalPlaces >= absCoeffStr.length) {
        const leadingZeros = "0".repeat(decimalPlaces - absCoeffStr.length);
        return `${isNeg ? "-" : ""}0.${leadingZeros}${absCoeffStr}`;
      } else {
        const integerPart = absCoeffStr.slice(0, absCoeffStr.length - decimalPlaces);
        const fractionalPart = absCoeffStr.slice(absCoeffStr.length - decimalPlaces);
        return `${isNeg ? "-" : ""}${integerPart}.${fractionalPart}`;
      }
    }
    const plainLength = absCoeffStr.length + this._exponent;
    if (plainLength <= PLAIN_NOTATION_DIGIT_LIMIT) {
      if (this._exponent === 0) {
        return coeffStr;
      }
      const trailingZeros = "0".repeat(this._exponent);
      return `${isNeg ? "-" : ""}${absCoeffStr}${trailingZeros}`;
    } else {
      if (absCoeffStr.length === 1) {
        return `${coeffStr}E+${String(this._exponent)}`;
      }
      const integerPart = absCoeffStr[0] ?? "";
      const fractionalPart = absCoeffStr.slice(1);
      const adjustedExponent = this._exponent + absCoeffStr.length - 1;
      return `${isNeg ? "-" : ""}${integerPart}.${fractionalPart}E+${String(adjustedExponent)}`;
    }
  }
  /**
   * Return the JSON-serialisable representation.
   *
   * @remarks
   * Returns a plain string matching the Stripe API convention where
   * decimal values are serialised as strings in JSON. Called
   * automatically by `JSON.stringify`.
   *
   * @public
   */
  toJSON() {
    return this.toString();
  }
  /**
   * Convert to a JavaScript `number`.
   *
   * @remarks
   * This is an explicit, intentionally lossy conversion. Use it only
   * when you need a numeric value for display or interop with APIs
   * that require `number`. Prefer {@link Decimal.toString | toString}
   * or {@link Decimal.toFixed | toFixed} for lossless output.
   *
   * @public
   */
  toNumber() {
    return Number(this.toString());
  }
  /**
   * Format this value as a fixed-point string with exactly
   * `decimalPlaces` digits after the decimal point.
   *
   * @remarks
   * Values are rounded according to `direction` when the internal
   * precision exceeds the requested number of decimal places.
   * The rounding direction is always required — no invisible defaults
   * in financial code.
   *
   * @example
   * ```ts
   * Decimal.from('1.235').toFixed(2, 'half-up');   // "1.24"
   * Decimal.from('1.225').toFixed(2, 'half-even'); // "1.22"
   * Decimal.from('42').toFixed(3, 'half-up');      // "42.000"
   * ```
   *
   * @param decimalPlaces - Number of digits after the decimal point.
   *   Must be a non-negative integer.
   * @param direction - How to round when truncating excess digits.
   * @returns A string with exactly `decimalPlaces` fractional digits.
   * @throws {@link Error} if `decimalPlaces` is negative or non-integer.
   *
   * @public
   */
  toFixed(decimalPlaces, direction) {
    if (decimalPlaces < 0 || !Number.isInteger(decimalPlaces)) {
      throw new Error("decimalPlaces must be a non-negative integer");
    }
    const formatFixed = /* @__PURE__ */ __name((coef) => {
      const coeffStr = coef.toString();
      const isNeg = coeffStr.startsWith("-");
      const absCoeffStr = isNeg ? coeffStr.slice(1) : coeffStr;
      if (decimalPlaces === 0) {
        return coeffStr;
      }
      if (decimalPlaces >= absCoeffStr.length) {
        const leadingZeros = "0".repeat(decimalPlaces - absCoeffStr.length);
        return `${isNeg ? "-" : ""}0.${leadingZeros}${absCoeffStr}`;
      } else {
        const integerPart = absCoeffStr.slice(0, absCoeffStr.length - decimalPlaces);
        const fractionalPart = absCoeffStr.slice(absCoeffStr.length - decimalPlaces);
        return `${isNeg ? "-" : ""}${integerPart}.${fractionalPart}`;
      }
    }, "formatFixed");
    const targetExponent = -decimalPlaces;
    if (this._exponent === targetExponent) {
      return formatFixed(this._coefficient);
    }
    if (this._exponent < targetExponent) {
      const scaleDiff = targetExponent - this._exponent;
      const divisor = 10n ** BigInt(scaleDiff);
      const quotient = this._coefficient / divisor;
      const remainder = this._coefficient % divisor;
      const rounded = _DecimalImpl.roundDivision(quotient, remainder, divisor, direction);
      return formatFixed(rounded);
    } else {
      const scaleDiff = this._exponent - targetExponent;
      const scaled = this._coefficient * 10n ** BigInt(scaleDiff);
      return formatFixed(scaled);
    }
  }
  /**
   * Return a string primitive when the runtime coerces the value.
   *
   * @remarks
   * Deliberately returns a `string` (not a `number`) to discourage
   * silent precision loss through implicit arithmetic coercion.
   * When used in a numeric context (for example, `+myDecimal`), the
   * JavaScript runtime will first call this method and then coerce
   * the resulting string to a `number`, which may lose precision.
   * Callers should prefer the explicit
   * {@link Decimal.toNumber | toNumber} method when an IEEE 754
   * `number` is required.
   *
   * @public
   */
  valueOf() {
    return this.toString();
  }
};
var Decimal = {
  /**
   * Create a {@link Decimal} from a string, number, or bigint.
   *
   * @remarks
   * - **string**: Parsed as a decimal literal. Accepts an optional sign,
   *   integer digits, an optional fractional part, and an optional `e`/`E`
   *   exponent. Leading/trailing whitespace is trimmed.
   * - **number**: Must be finite. Converted via `Number.prototype.toString()`
   *   then parsed, so `Decimal.from(0.1)` produces `"0.1"` (not the
   *   53-bit binary approximation).
   * - **bigint**: Treated as an integer with exponent 0.
   *
   * @example
   * ```ts
   * Decimal.from('1.23');   // string
   * Decimal.from(42);       // number
   * Decimal.from(100n);     // bigint
   * Decimal.from('1.5e3');  // scientific notation → 1500
   * ```
   *
   * @param value - The value to convert.
   * @returns A new frozen {@link Decimal} instance.
   * @throws {@link Error} if `value` is a non-finite number, an empty
   *   string, or a string that does not match the decimal literal grammar.
   *
   * @public
   */
  from(value) {
    if (typeof value === "bigint") {
      return new DecimalImpl(value, 0);
    }
    if (typeof value === "number") {
      if (!Number.isFinite(value)) {
        throw new Error("Number must be finite");
      }
      return Decimal.from(value.toString());
    }
    const trimmed = value.trim();
    if (trimmed === "") {
      throw new Error("Cannot parse empty string as Decimal");
    }
    const match = /^([+-]?)(\d+)(?:\.(\d+))?(?:[eE]([+-]?\d+))?$/.exec(trimmed);
    if (!match) {
      throw new Error(`Invalid decimal string: ${value}`);
    }
    const sign = match[1] === "-" ? -1n : 1n;
    const integerPart = match[2] ?? "";
    const fractionalPart = match[3] ?? "";
    const exponentPart = match[4] ? Number(match[4]) : 0;
    if (!Number.isSafeInteger(exponentPart) || exponentPart > MAX_EXPONENT || exponentPart < -MAX_EXPONENT) {
      throw new Error(`Exponent out of range: ${String(match[4])} exceeds safe integer bounds`);
    }
    const coefficientStr = integerPart + fractionalPart;
    const coefficient = sign * BigInt(coefficientStr);
    const exponent = exponentPart - fractionalPart.length;
    if (!Number.isSafeInteger(exponent) || exponent > MAX_EXPONENT || exponent < -MAX_EXPONENT) {
      throw new Error(`Computed exponent out of range: ${String(exponent)} exceeds safe integer bounds`);
    }
    return new DecimalImpl(coefficient, exponent);
  },
  /**
   * The {@link Decimal} value representing zero.
   *
   * @remarks
   * Pre-allocated singleton — prefer `Decimal.zero` over
   * `Decimal.from(0)` to avoid an unnecessary allocation.
   *
   * @public
   */
  zero: new DecimalImpl(0n, 0)
};

// ../node_modules/stripe/esm/Error.js
var Error_exports = {};
__export(Error_exports, {
  RateLimitError: () => RateLimitError,
  StripeAPIError: () => StripeAPIError,
  StripeAuthenticationError: () => StripeAuthenticationError,
  StripeCardError: () => StripeCardError,
  StripeConnectionError: () => StripeConnectionError,
  StripeError: () => StripeError,
  StripeIdempotencyError: () => StripeIdempotencyError,
  StripeInvalidClientError: () => StripeInvalidClientError,
  StripeInvalidGrantError: () => StripeInvalidGrantError,
  StripeInvalidRequestError: () => StripeInvalidRequestError,
  StripeInvalidScopeError: () => StripeInvalidScopeError,
  StripeOAuthError: () => StripeOAuthError,
  StripeOAuthInvalidRequestError: () => StripeOAuthInvalidRequestError,
  StripePermissionError: () => StripePermissionError,
  StripeRateLimitError: () => StripeRateLimitError,
  StripeSignatureVerificationError: () => StripeSignatureVerificationError,
  StripeUnsupportedGrantTypeError: () => StripeUnsupportedGrantTypeError,
  StripeUnsupportedResponseTypeError: () => StripeUnsupportedResponseTypeError,
  TemporarySessionExpiredError: () => TemporarySessionExpiredError,
  generateOAuthError: () => generateOAuthError,
  generateV1Error: () => generateV1Error,
  generateV2Error: () => generateV2Error
});
var generateV1Error = /* @__PURE__ */ __name((rawStripeError) => {
  const statusCode = rawStripeError.statusCode;
  if (statusCode === 429 || statusCode === 400 && rawStripeError.code === "rate_limit") {
    return new StripeRateLimitError(rawStripeError);
  }
  if (statusCode === 400 || statusCode === 404) {
    if (rawStripeError.type === "idempotency_error") {
      return new StripeIdempotencyError(rawStripeError);
    }
    return new StripeInvalidRequestError(rawStripeError);
  }
  if (statusCode === 401) {
    return new StripeAuthenticationError(rawStripeError);
  }
  if (statusCode === 402) {
    return new StripeCardError(rawStripeError);
  }
  if (statusCode === 403) {
    return new StripePermissionError(rawStripeError);
  }
  return new StripeAPIError(rawStripeError);
}, "generateV1Error");
var generateOAuthError = /* @__PURE__ */ __name((rawStripeError) => {
  const oauthType = rawStripeError.type;
  switch (oauthType) {
    case "invalid_grant":
      return new StripeInvalidGrantError(rawStripeError);
    case "invalid_client":
      return new StripeInvalidClientError(rawStripeError);
    case "invalid_request":
      return new StripeOAuthInvalidRequestError(rawStripeError);
    case "invalid_scope":
      return new StripeInvalidScopeError(rawStripeError);
    case "unsupported_grant_type":
      return new StripeUnsupportedGrantTypeError(rawStripeError);
    case "unsupported_response_type":
      return new StripeUnsupportedResponseTypeError(rawStripeError);
    default:
      return new StripeOAuthError(rawStripeError);
  }
}, "generateOAuthError");
var generateV2Error = /* @__PURE__ */ __name((rawStripeError) => {
  switch (rawStripeError.type) {
    case "idempotency_error":
      return new StripeIdempotencyError(rawStripeError);
    // switchCases: The beginning of the section generated from our OpenAPI spec
    case "rate_limit":
      return new RateLimitError(rawStripeError);
    case "temporary_session_expired":
      return new TemporarySessionExpiredError(rawStripeError);
  }
  switch (rawStripeError.code) {
    case "invalid_fields":
      return new StripeInvalidRequestError(rawStripeError);
  }
  return generateV1Error(rawStripeError);
}, "generateV2Error");
var StripeError = class extends Error {
  static {
    __name(this, "StripeError");
  }
  constructor(raw = {}, type = null) {
    super(raw.message);
    this.type = type || this.constructor.name;
    this.raw = raw;
    this.rawType = raw.type;
    this.code = raw.code;
    this.doc_url = raw.doc_url;
    this.param = raw.param;
    this.detail = raw.detail;
    this.headers = raw.headers;
    this.requestId = raw.requestId;
    this.statusCode = raw.statusCode;
    this.message = raw.message ?? "";
    this.userMessage = raw.user_message;
    this.charge = raw.charge;
    this.decline_code = raw.decline_code;
    this.payment_intent = raw.payment_intent;
    this.payment_method = raw.payment_method;
    this.payment_method_type = raw.payment_method_type;
    this.setup_intent = raw.setup_intent;
    this.source = raw.source;
  }
};
StripeError.generate = generateV1Error;
var StripeCardError = class extends StripeError {
  static {
    __name(this, "StripeCardError");
  }
  constructor(raw = {}) {
    super(raw, "StripeCardError");
    this.decline_code = raw.decline_code ?? "";
  }
};
var StripeInvalidRequestError = class extends StripeError {
  static {
    __name(this, "StripeInvalidRequestError");
  }
  constructor(raw = {}) {
    super(raw, "StripeInvalidRequestError");
  }
};
var StripeAPIError = class extends StripeError {
  static {
    __name(this, "StripeAPIError");
  }
  constructor(raw = {}) {
    super(raw, "StripeAPIError");
  }
};
var StripeAuthenticationError = class extends StripeError {
  static {
    __name(this, "StripeAuthenticationError");
  }
  constructor(raw = {}) {
    super(raw, "StripeAuthenticationError");
  }
};
var StripePermissionError = class extends StripeError {
  static {
    __name(this, "StripePermissionError");
  }
  constructor(raw = {}) {
    super(raw, "StripePermissionError");
  }
};
var StripeRateLimitError = class extends StripeError {
  static {
    __name(this, "StripeRateLimitError");
  }
  constructor(raw = {}) {
    super(raw, "StripeRateLimitError");
  }
};
var StripeConnectionError = class extends StripeError {
  static {
    __name(this, "StripeConnectionError");
  }
  constructor(raw = {}) {
    super(raw, "StripeConnectionError");
  }
};
var StripeSignatureVerificationError = class extends StripeError {
  static {
    __name(this, "StripeSignatureVerificationError");
  }
  constructor(header, payload, raw = {}) {
    super(raw, "StripeSignatureVerificationError");
    this.header = header;
    this.payload = payload;
  }
};
var StripeIdempotencyError = class extends StripeError {
  static {
    __name(this, "StripeIdempotencyError");
  }
  constructor(raw = {}) {
    super(raw, "StripeIdempotencyError");
  }
};
var StripeOAuthError = class extends StripeError {
  static {
    __name(this, "StripeOAuthError");
  }
  constructor(raw = {}, type = "StripeOAuthError") {
    super(raw, type);
  }
};
var StripeInvalidGrantError = class extends StripeOAuthError {
  static {
    __name(this, "StripeInvalidGrantError");
  }
  constructor(raw = {}) {
    super(raw, "StripeInvalidGrantError");
  }
};
var StripeInvalidClientError = class extends StripeOAuthError {
  static {
    __name(this, "StripeInvalidClientError");
  }
  constructor(raw = {}) {
    super(raw, "StripeInvalidClientError");
  }
};
var StripeOAuthInvalidRequestError = class extends StripeOAuthError {
  static {
    __name(this, "StripeOAuthInvalidRequestError");
  }
  constructor(raw = {}) {
    super(raw, "StripeOAuthInvalidRequestError");
  }
};
var StripeInvalidScopeError = class extends StripeOAuthError {
  static {
    __name(this, "StripeInvalidScopeError");
  }
  constructor(raw = {}) {
    super(raw, "StripeInvalidScopeError");
  }
};
var StripeUnsupportedGrantTypeError = class extends StripeOAuthError {
  static {
    __name(this, "StripeUnsupportedGrantTypeError");
  }
  constructor(raw = {}) {
    super(raw, "StripeUnsupportedGrantTypeError");
  }
};
var StripeUnsupportedResponseTypeError = class extends StripeOAuthError {
  static {
    __name(this, "StripeUnsupportedResponseTypeError");
  }
  constructor(raw = {}) {
    super(raw, "StripeUnsupportedResponseTypeError");
  }
};
var RateLimitError = class extends StripeError {
  static {
    __name(this, "RateLimitError");
  }
  constructor(rawStripeError = {}) {
    super(rawStripeError, "RateLimitError");
  }
};
var TemporarySessionExpiredError = class extends StripeError {
  static {
    __name(this, "TemporarySessionExpiredError");
  }
  constructor(rawStripeError = {}) {
    super(rawStripeError, "TemporarySessionExpiredError");
  }
};

// ../node_modules/stripe/esm/RequestSender.js
var MAX_RETRY_AFTER_WAIT = 60;
var RequestSender = class _RequestSender {
  static {
    __name(this, "RequestSender");
  }
  constructor(stripe, maxBufferedRequestMetric) {
    this._stripe = stripe;
    this._maxBufferedRequestMetric = maxBufferedRequestMetric;
  }
  _normalizeStripeContext(optsContext, clientContext) {
    if (optsContext) {
      return optsContext.toString() || null;
    }
    return clientContext?.toString() || null;
  }
  _addHeadersDirectlyToObject(obj, headers) {
    obj.requestId = headers["request-id"];
    obj.stripeAccount = obj.stripeAccount || headers["stripe-account"];
    obj.apiVersion = obj.apiVersion || headers["stripe-version"];
    obj.idempotencyKey = obj.idempotencyKey || headers["idempotency-key"];
  }
  _makeResponseEvent(requestEvent, statusCode, headers) {
    const requestEndTime = Date.now();
    const requestDurationMs = requestEndTime - requestEvent.request_start_time;
    return removeNullish({
      api_version: headers["stripe-version"],
      account: headers["stripe-account"],
      idempotency_key: headers["idempotency-key"],
      method: requestEvent.method,
      path: requestEvent.path,
      status: statusCode,
      request_id: this._getRequestId(headers),
      elapsed: requestDurationMs,
      request_start_time: requestEvent.request_start_time,
      request_end_time: requestEndTime
    });
  }
  _getRequestId(headers) {
    return headers["request-id"];
  }
  /**
   * Used by methods with spec.streaming === true. For these methods, we do not
   * buffer successful responses into memory or do parse them into stripe
   * objects, we delegate that all of that to the user and pass back the raw
   * http.Response object to the callback.
   *
   * (Unsuccessful responses shouldn't make it here, they should
   * still be buffered/parsed and handled by _jsonResponseHandler -- see
   * makeRequest)
   */
  _streamingResponseHandler(requestEvent, usage, callback) {
    return (res) => {
      const headers = res.getHeaders();
      const streamCompleteCallback = /* @__PURE__ */ __name(() => {
        const responseEvent = this._makeResponseEvent(requestEvent, res.getStatusCode(), headers);
        this._stripe._emitter.emit("response", responseEvent);
        this._recordRequestMetrics(this._getRequestId(headers), responseEvent.elapsed, usage);
      }, "streamCompleteCallback");
      const stream = res.toStream(streamCompleteCallback);
      this._addHeadersDirectlyToObject(stream, headers);
      return callback(null, stream);
    };
  }
  /**
   * Default handler for Stripe responses. Buffers the response into memory,
   * parses the JSON and returns it (i.e. passes it to the callback) if there
   * is no "error" field. Otherwise constructs/passes an appropriate Error.
   */
  _jsonResponseHandler(requestEvent, apiMode, usage, callback) {
    return (res) => {
      const headers = res.getHeaders();
      const requestId = this._getRequestId(headers);
      const statusCode = res.getStatusCode();
      const responseEvent = this._makeResponseEvent(requestEvent, statusCode, headers);
      res.toJSON().then((jsonResponse) => {
        if (this._stripe.getEmitEventBodiesEnabled()) {
          responseEvent.body = jsonResponse;
        }
        if (jsonResponse.error) {
          const isOAuth = typeof jsonResponse.error === "string";
          if (isOAuth) {
            jsonResponse.error = {
              type: jsonResponse.error,
              message: jsonResponse.error_description
            };
          }
          jsonResponse.error.headers = headers;
          jsonResponse.error.statusCode = statusCode;
          jsonResponse.error.requestId = requestId;
          let err;
          if (isOAuth) {
            err = generateOAuthError(jsonResponse.error);
          } else if (apiMode === "v2") {
            err = generateV2Error(jsonResponse.error);
          } else {
            err = generateV1Error(jsonResponse.error);
          }
          throw err;
        }
        return jsonResponse;
      }, (e) => {
        if (this._stripe.getEmitEventBodiesEnabled() && e.rawBody) {
          responseEvent.body = e.rawBody;
        }
        throw new StripeAPIError({
          message: "Invalid JSON received from the Stripe API",
          exception: e,
          requestId: headers["request-id"]
        });
      }).then((jsonResponse) => {
        this._stripe._emitter.emit("response", responseEvent);
        this._recordRequestMetrics(requestId, responseEvent.elapsed, usage);
        const rawResponse = res.getRawResponse();
        this._addHeadersDirectlyToObject(rawResponse, headers);
        Object.defineProperty(jsonResponse, "lastResponse", {
          enumerable: false,
          writable: false,
          value: rawResponse
        });
        callback(null, jsonResponse);
      }, (e) => {
        this._stripe._emitter.emit("response", responseEvent);
        callback(e, null);
      });
    };
  }
  static _generateConnectionErrorMessage(requestRetries) {
    return `An error occurred with our connection to Stripe.${requestRetries > 0 ? ` Request was retried ${requestRetries} times.` : ""}`;
  }
  // For more on when and how to retry API requests, see https://stripe.com/docs/error-handling#safely-retrying-requests-with-idempotency
  static _shouldRetry(res, numRetries, maxRetries, error) {
    if (error && numRetries === 0 && HttpClient.CONNECTION_CLOSED_ERROR_CODES.includes(error.code)) {
      return true;
    }
    if (numRetries >= maxRetries) {
      return false;
    }
    if (!res) {
      return true;
    }
    if (res.getHeaders()["stripe-should-retry"] === "false") {
      return false;
    }
    if (res.getHeaders()["stripe-should-retry"] === "true") {
      return true;
    }
    if (res.getStatusCode() === 409) {
      return true;
    }
    if (res.getStatusCode() >= 500) {
      return true;
    }
    return false;
  }
  _getSleepTimeInMS(numRetries, retryAfter = null) {
    const initialNetworkRetryDelay = this._stripe.getInitialNetworkRetryDelay();
    const maxNetworkRetryDelay = this._stripe.getMaxNetworkRetryDelay();
    let sleepSeconds = Math.min(initialNetworkRetryDelay * Math.pow(2, numRetries - 1), maxNetworkRetryDelay);
    sleepSeconds *= 0.5 * (1 + Math.random());
    sleepSeconds = Math.max(initialNetworkRetryDelay, sleepSeconds);
    if (Number.isInteger(retryAfter) && retryAfter <= MAX_RETRY_AFTER_WAIT) {
      sleepSeconds = Math.max(sleepSeconds, retryAfter);
    }
    return sleepSeconds * 1e3;
  }
  // Max retries can be set on a per request basis. Favor those over the global setting
  _getMaxNetworkRetries(settings = {}) {
    return settings.maxNetworkRetries !== void 0 && Number.isInteger(settings.maxNetworkRetries) ? settings.maxNetworkRetries : this._stripe.getMaxNetworkRetries();
  }
  _defaultIdempotencyKey(method, settings, apiMode) {
    const maxRetries = this._getMaxNetworkRetries(settings);
    const genKey = /* @__PURE__ */ __name(() => `stripe-node-retry-${this._stripe._platformFunctions.uuid4()}`, "genKey");
    if (apiMode === "v2") {
      if (method === "POST" || method === "DELETE") {
        return genKey();
      }
    } else if (apiMode === "v1") {
      if (method === "POST" && maxRetries > 0) {
        return genKey();
      }
    }
    return null;
  }
  _makeHeaders({ contentType, contentLength, apiVersion, clientUserAgent, method, userSuppliedHeaders, userSuppliedSettings, stripeAccount, stripeContext, apiMode }) {
    const defaultHeaders = {
      Accept: "application/json",
      "Content-Type": contentType,
      "User-Agent": this._getUserAgentString(apiMode),
      "X-Stripe-Client-User-Agent": clientUserAgent,
      "X-Stripe-Client-Telemetry": this._getTelemetryHeader(),
      "Stripe-Version": apiVersion,
      "Stripe-Account": stripeAccount,
      "Stripe-Context": stripeContext,
      "Idempotency-Key": this._defaultIdempotencyKey(method, userSuppliedSettings, apiMode)
    };
    const methodHasPayload = method == "POST" || method == "PUT" || method == "PATCH";
    if (methodHasPayload || contentLength) {
      if (!methodHasPayload) {
        emitWarning(`${method} method had non-zero contentLength but no payload is expected for this verb`);
      }
      defaultHeaders["Content-Length"] = contentLength;
    }
    return Object.assign(
      removeNullish(defaultHeaders),
      // If the user supplied, say 'idempotency-key', override instead of appending by ensuring caps are the same.
      normalizeHeaders(userSuppliedHeaders)
    );
  }
  _getUserAgentString(apiMode) {
    const packageVersion = this._stripe.getConstant("PACKAGE_VERSION");
    const appInfo = this._stripe._appInfo ? this._stripe.getAppInfoAsString() : "";
    const aiAgent = this._stripe.getConstant("AI_AGENT");
    let uaString = `Stripe/${apiMode} NodeBindings/${packageVersion}`;
    if (appInfo) {
      uaString += ` ${appInfo}`;
    }
    if (aiAgent) {
      uaString += ` AIAgent/${aiAgent}`;
    }
    return uaString;
  }
  _getTelemetryHeader() {
    if (this._stripe.getTelemetryEnabled() && this._stripe._prevRequestMetrics.length > 0) {
      const metrics = this._stripe._prevRequestMetrics.shift();
      return JSON.stringify({
        last_request_metrics: metrics
      });
    }
  }
  _recordRequestMetrics(requestId, requestDurationMs, usage) {
    if (this._stripe.getTelemetryEnabled() && requestId) {
      if (this._stripe._prevRequestMetrics.length > this._maxBufferedRequestMetric) {
        emitWarning("Request metrics buffer is full, dropping telemetry message.");
      } else {
        const m = {
          request_id: requestId,
          request_duration_ms: requestDurationMs
        };
        if (usage && usage.length > 0) {
          m.usage = usage;
        }
        this._stripe._prevRequestMetrics.push(m);
      }
    }
  }
  _rawRequest(method, path, params, options, usage) {
    return new Promise((resolve, reject) => {
      try {
        const requestMethod = method.toUpperCase();
        if (requestMethod !== "POST" && params && Object.keys(params).length !== 0) {
          throw new Error("rawRequest only supports params on POST requests. Please pass null and add your parameters to path.");
        }
        const data = requestMethod === "POST" ? Object.assign({}, params) : null;
        const processed = processOptions(options);
        if (options?.additionalHeaders) {
          Object.assign(processed.headers, options.additionalHeaders);
        }
        const apiBase = processed.apiBase || (options?.apiBase ?? null);
        const host = apiBase ? this._stripe.resolveBaseAddress(apiBase) : null;
        this._request(requestMethod, host, path, data, processed.authenticator, {
          headers: processed.headers,
          settings: processed.settings,
          streaming: processed.streaming
        }, usage || ["raw_request"], (err, response) => {
          if (err) {
            reject(err);
          } else {
            resolve(response);
          }
        });
      } catch (err) {
        reject(err);
      }
    });
  }
  _getContentLength(data) {
    return typeof data === "string" ? new TextEncoder().encode(data).length : data.length;
  }
  /**
   * This is the main HTTP method that all resources eventually call
   */
  _request(method, host, path, data, authenticator, options, usage = [], callback, requestDataProcessor = null) {
    let requestData;
    authenticator = authenticator ?? this._stripe._authenticator;
    const apiMode = getAPIMode(path);
    const retryRequest = /* @__PURE__ */ __name((requestFn, apiVersion, headers, requestRetries, retryAfter) => {
      return setTimeout(requestFn, this._getSleepTimeInMS(requestRetries, retryAfter), apiVersion, headers, requestRetries + 1);
    }, "retryRequest");
    const makeRequest = /* @__PURE__ */ __name((apiVersion, headers, numRetries) => {
      const timeout = options.settings && options.settings.timeout && Number.isInteger(options.settings.timeout) && options.settings.timeout >= 0 ? options.settings.timeout : this._stripe.getApiField("timeout");
      const request = {
        host: host || this._stripe.getApiField("host"),
        port: this._stripe.getApiField("port"),
        path,
        method,
        headers: Object.assign({}, headers),
        body: requestData,
        protocol: this._stripe.getApiField("protocol")
      };
      if (!authenticator) {
        throw Error("Authenticator was't initialized. Please pass an API Key or an Authenticator when initializing StripeClient.");
      }
      authenticator(request).then(() => {
        const req = this._stripe.getApiField("httpClient").makeRequest(request.host, request.port, request.path, request.method, request.headers, request.body, request.protocol, timeout);
        const requestStartTime = Date.now();
        const requestEvent = removeNullish({
          api_version: apiVersion,
          account: parseHttpHeaderAsString(headers["Stripe-Account"]),
          idempotency_key: parseHttpHeaderAsString(headers["Idempotency-Key"]),
          method,
          path,
          body: this._stripe.getEmitEventBodiesEnabled() ? data ?? void 0 : void 0,
          request_start_time: requestStartTime
        });
        const requestRetries = numRetries || 0;
        const maxRetries = this._getMaxNetworkRetries(options.settings || {});
        this._stripe._emitter.emit("request", requestEvent);
        req.then((res) => {
          if (_RequestSender._shouldRetry(res, requestRetries, maxRetries)) {
            return retryRequest(makeRequest, apiVersion, headers, requestRetries, parseHttpHeaderAsNumber(res.getHeaders()["retry-after"]));
          } else if (options.streaming && res.getStatusCode() < 400) {
            return this._streamingResponseHandler(requestEvent, usage, callback)(res);
          } else {
            return this._jsonResponseHandler(requestEvent, apiMode, usage, callback)(res);
          }
        }).catch((error) => {
          if (_RequestSender._shouldRetry(null, requestRetries, maxRetries, error)) {
            return retryRequest(makeRequest, apiVersion, headers, requestRetries, null);
          } else {
            const isTimeoutError = error.code && error.code === HttpClient.TIMEOUT_ERROR_CODE;
            return callback(new StripeConnectionError({
              message: isTimeoutError ? `Request aborted due to timeout being reached (${timeout}ms)` : _RequestSender._generateConnectionErrorMessage(requestRetries),
              detail: error
            }));
          }
        });
      }).catch((e) => {
        throw new StripeError({
          message: "Unable to authenticate the request",
          exception: e
        });
      });
    }, "makeRequest");
    const prepareAndMakeRequest = /* @__PURE__ */ __name((error, data2) => {
      if (error) {
        return callback(error);
      }
      requestData = data2;
      this._stripe.getClientUserAgent((clientUserAgent) => {
        const apiVersion = this._stripe.getApiField("version");
        const headers = this._makeHeaders({
          contentType: apiMode == "v2" ? "application/json" : "application/x-www-form-urlencoded",
          contentLength: this._getContentLength(data2),
          apiVersion,
          clientUserAgent,
          method,
          // other callers expect null, but .headers being optional means it's undefined if not supplied. So we normalize to null.
          userSuppliedHeaders: options.headers ?? null,
          userSuppliedSettings: options.settings ?? {},
          stripeAccount: options.stripeAccount ?? this._stripe.getApiField("stripeAccount"),
          stripeContext: this._normalizeStripeContext(options.stripeContext, this._stripe.getApiField("stripeContext")),
          apiMode
        });
        makeRequest(apiVersion, headers, 0);
      });
    }, "prepareAndMakeRequest");
    if (requestDataProcessor) {
      requestDataProcessor(method, data, options.headers, prepareAndMakeRequest);
    } else {
      let stringifiedData;
      if (apiMode == "v2") {
        stringifiedData = data ? jsonStringifyRequestData(data) : "";
      } else {
        stringifiedData = queryStringifyRequestData(data || {});
      }
      prepareAndMakeRequest(null, stringifiedData);
    }
  }
};

// ../node_modules/stripe/esm/V2Coercion.js
var coerceV2RequestData = /* @__PURE__ */ __name((data, schema) => {
  if (data == null) {
    return data;
  }
  switch (schema.kind) {
    case "int64_string":
      return typeof data === "bigint" || typeof data === "number" ? String(data) : data;
    case "decimal_string":
      return typeof data.toFixed === "function" && typeof data.isZero === "function" ? data.toString() : data;
    case "object": {
      if (typeof data !== "object" || Array.isArray(data)) {
        return data;
      }
      const obj = data;
      const result = {};
      for (const key of Object.keys(obj)) {
        const fieldSchema = schema.fields[key];
        result[key] = fieldSchema ? coerceV2RequestData(obj[key], fieldSchema) : obj[key];
      }
      return result;
    }
    case "array": {
      if (!Array.isArray(data)) {
        return data;
      }
      return data.map((element) => coerceV2RequestData(element, schema.element));
    }
    case "nullable":
      return coerceV2RequestData(data, schema.inner);
  }
}, "coerceV2RequestData");
var coerceV2ResponseData = /* @__PURE__ */ __name((data, schema) => {
  if (data == null) {
    return data;
  }
  switch (schema.kind) {
    case "int64_string":
      if (typeof data === "string") {
        try {
          return BigInt(data);
        } catch {
          throw new Error(`Failed to coerce int64_string value: expected an integer string, got '${data}'`);
        }
      }
      return data;
    case "decimal_string":
      if (typeof data === "string") {
        try {
          return Decimal.from(data);
        } catch {
          throw new Error(`Failed to coerce decimal_string value: expected a decimal string, got '${data}'`);
        }
      }
      return data;
    case "object": {
      if (typeof data !== "object" || Array.isArray(data)) {
        return data;
      }
      const obj = data;
      for (const key of Object.keys(schema.fields)) {
        if (key in obj) {
          obj[key] = coerceV2ResponseData(obj[key], schema.fields[key]);
        }
      }
      return obj;
    }
    case "array": {
      if (!Array.isArray(data)) {
        return data;
      }
      for (let i = 0; i < data.length; i++) {
        data[i] = coerceV2ResponseData(data[i], schema.element);
      }
      return data;
    }
    case "nullable":
      return coerceV2ResponseData(data, schema.inner);
  }
}, "coerceV2ResponseData");

// ../node_modules/stripe/esm/autoPagination.js
var V1Iterator = class {
  static {
    __name(this, "V1Iterator");
  }
  constructor(firstPagePromise, params, options, method, path, spec, stripeResource) {
    this.index = 0;
    this.pagePromise = firstPagePromise;
    this.promiseCache = { currentPromise: null };
    this.params = params;
    this.options = options;
    this.method = method;
    this.path = path;
    this.spec = spec;
    this.stripeResource = stripeResource;
  }
  async iterate(pageResult) {
    if (!(pageResult && pageResult.data && typeof pageResult.data.length === "number")) {
      throw Error("Unexpected: Stripe API response does not have a well-formed `data` array.");
    }
    const reverseIteration = !!this.params.ending_before;
    if (this.index < pageResult.data.length) {
      const idx = reverseIteration ? pageResult.data.length - 1 - this.index : this.index;
      const value = pageResult.data[idx];
      this.index += 1;
      return { value, done: false };
    } else if (pageResult.has_more) {
      this.index = 0;
      this.pagePromise = this.getNextPage(pageResult);
      const nextPageResult = await this.pagePromise;
      return this.iterate(nextPageResult);
    }
    return { done: true, value: void 0 };
  }
  /** @abstract */
  getNextPage(_pageResult) {
    throw new Error("Unimplemented");
  }
  async _next() {
    return this.iterate(await this.pagePromise);
  }
  next() {
    if (this.promiseCache.currentPromise) {
      return this.promiseCache.currentPromise;
    }
    const nextPromise = (async () => {
      const ret = await this._next();
      this.promiseCache.currentPromise = null;
      return ret;
    })();
    this.promiseCache.currentPromise = nextPromise;
    return nextPromise;
  }
};
var V1ListIterator = class extends V1Iterator {
  static {
    __name(this, "V1ListIterator");
  }
  getNextPage(pageResult) {
    const reverseIteration = !!this.params.ending_before;
    const lastId = getLastId(pageResult, reverseIteration);
    const nextParams = {
      ...this.params,
      [reverseIteration ? "ending_before" : "starting_after"]: lastId
    };
    return this.stripeResource._makeRequest(this.method, this.path, nextParams, this.options, this.spec);
  }
};
var V1SearchIterator = class extends V1Iterator {
  static {
    __name(this, "V1SearchIterator");
  }
  getNextPage(pageResult) {
    if (!pageResult.next_page) {
      throw Error("Unexpected: Stripe API response does not have a well-formed `next_page` field, but `has_more` was true.");
    }
    const nextParams = {
      ...this.params,
      page: pageResult.next_page
    };
    return this.stripeResource._makeRequest(this.method, this.path, nextParams, this.options, this.spec);
  }
};
var V2ListIterator = class {
  static {
    __name(this, "V2ListIterator");
  }
  constructor(firstPagePromise, options, spec, stripeResource) {
    this.firstPagePromise = firstPagePromise;
    this.currentPageIterator = null;
    this.nextPageUrl = null;
    this.options = options;
    this.spec = spec;
    this.stripeResource = stripeResource;
  }
  async initFirstPage() {
    if (this.firstPagePromise) {
      const page = await this.firstPagePromise;
      this.firstPagePromise = null;
      this.currentPageIterator = page.data[Symbol.iterator]();
      this.nextPageUrl = page.next_page_url || null;
    }
  }
  async turnPage() {
    if (!this.nextPageUrl)
      return null;
    const page = await this.stripeResource._makeRequest("GET", this.nextPageUrl, void 0, this.options, this.spec);
    this.nextPageUrl = page.next_page_url || null;
    this.currentPageIterator = page.data[Symbol.iterator]();
    return this.currentPageIterator;
  }
  async next() {
    await this.initFirstPage();
    if (this.currentPageIterator) {
      const result2 = this.currentPageIterator.next();
      if (!result2.done)
        return { done: false, value: result2.value };
    }
    const nextPageIterator = await this.turnPage();
    if (!nextPageIterator) {
      return { done: true, value: void 0 };
    }
    const result = nextPageIterator.next();
    if (!result.done)
      return { done: false, value: result.value };
    return { done: true, value: void 0 };
  }
};
var makeAutoPaginationMethods = /* @__PURE__ */ __name((stripeResource, params, options, method, path, spec, firstPagePromise) => {
  const apiMode = getAPIMode(path);
  const methodType = spec?.methodType;
  if (apiMode !== "v2" && methodType === "search") {
    return makeAutoPaginationMethodsFromIterator(new V1SearchIterator(firstPagePromise, params, options, method, path, spec, stripeResource));
  }
  if (apiMode !== "v2" && methodType === "list") {
    return makeAutoPaginationMethodsFromIterator(new V1ListIterator(firstPagePromise, params, options, method, path, spec, stripeResource));
  }
  if (apiMode === "v2" && methodType === "list") {
    return makeAutoPaginationMethodsFromIterator(new V2ListIterator(firstPagePromise, options, spec, stripeResource));
  }
  return null;
}, "makeAutoPaginationMethods");
var makeAutoPaginationMethodsFromIterator = /* @__PURE__ */ __name((iterator) => {
  const autoPagingEach = makeAutoPagingEach((...args) => iterator.next(...args));
  const autoPagingToArray = makeAutoPagingToArray(autoPagingEach);
  const autoPaginationMethods = {
    autoPagingEach,
    autoPagingToArray,
    // Async iterator functions:
    next: /* @__PURE__ */ __name(() => iterator.next(), "next"),
    return: /* @__PURE__ */ __name(() => {
      return {};
    }, "return"),
    [getAsyncIteratorSymbol()]: () => {
      return autoPaginationMethods;
    }
  };
  return autoPaginationMethods;
}, "makeAutoPaginationMethodsFromIterator");
function getAsyncIteratorSymbol() {
  if (typeof Symbol !== "undefined" && Symbol.asyncIterator) {
    return Symbol.asyncIterator;
  }
  return "@@asyncIterator";
}
__name(getAsyncIteratorSymbol, "getAsyncIteratorSymbol");
function getDoneCallback(args) {
  if (args.length < 2) {
    return null;
  }
  const onDone = args[1];
  if (typeof onDone !== "function") {
    throw Error(`The second argument to autoPagingEach, if present, must be a callback function; received ${typeof onDone}`);
  }
  return onDone;
}
__name(getDoneCallback, "getDoneCallback");
function getItemCallback(args) {
  if (args.length === 0) {
    return void 0;
  }
  const onItem = args[0];
  if (typeof onItem !== "function") {
    throw Error(`The first argument to autoPagingEach, if present, must be a callback function; received ${typeof onItem}`);
  }
  if (onItem.length === 2) {
    return onItem;
  }
  if (onItem.length > 2) {
    throw Error(`The \`onItem\` callback function passed to autoPagingEach must accept at most two arguments; got ${onItem}`);
  }
  return /* @__PURE__ */ __name(function _onItem(item, next) {
    const shouldContinue = onItem(item);
    next(shouldContinue);
  }, "_onItem");
}
__name(getItemCallback, "getItemCallback");
function getLastId(listResult, reverseIteration) {
  const lastIdx = reverseIteration ? 0 : listResult.data.length - 1;
  const lastItem = listResult.data[lastIdx];
  const lastId = lastItem && lastItem.id;
  if (!lastId) {
    throw Error("Unexpected: No `id` found on the last item while auto-paging a list.");
  }
  return lastId;
}
__name(getLastId, "getLastId");
function makeAutoPagingEach(asyncIteratorNext) {
  return /* @__PURE__ */ __name(function autoPagingEach() {
    const callSiteStack = new Error().stack;
    const args = [].slice.call(arguments);
    const onItem = getItemCallback(args);
    const onDone = getDoneCallback(args);
    if (args.length > 2) {
      throw Error(`autoPagingEach takes up to two arguments; received ${args}`);
    }
    const autoPagePromise = wrapAsyncIteratorWithCallback(
      asyncIteratorNext,
      // @ts-ignore we might need a null check
      onItem
    ).catch((err) => {
      attachCallSiteToError(err, callSiteStack);
      throw err;
    });
    if (onDone) {
      autoPagePromise.then(() => onDone(), (err) => onDone(err));
    }
    return autoPagePromise;
  }, "autoPagingEach");
}
__name(makeAutoPagingEach, "makeAutoPagingEach");
function makeAutoPagingToArray(autoPagingEach) {
  return /* @__PURE__ */ __name(function autoPagingToArray(opts, onDone) {
    const callSiteStack = new Error().stack;
    const limit = opts && opts.limit;
    if (!limit) {
      throw Error("You must pass a `limit` option to autoPagingToArray, e.g., `autoPagingToArray({limit: 1000});`.");
    }
    if (limit > 1e4) {
      throw Error("You cannot specify a limit of more than 10,000 items to fetch in `autoPagingToArray`; use `autoPagingEach` to iterate through longer lists.");
    }
    const promise = new Promise((resolve, reject) => {
      const items = [];
      autoPagingEach((item) => {
        items.push(item);
        if (items.length >= limit) {
          return false;
        }
      }).then(() => {
        resolve(items);
      }).catch((err) => {
        attachCallSiteToError(err, callSiteStack);
        reject(err);
      });
    });
    if (onDone) {
      promise.then((items) => onDone(null, items), (err) => onDone(err));
    }
    return promise;
  }, "autoPagingToArray");
}
__name(makeAutoPagingToArray, "makeAutoPagingToArray");
function wrapAsyncIteratorWithCallback(asyncIteratorNext, onItem) {
  return new Promise((resolve, reject) => {
    function handleIteration(iterResult) {
      if (iterResult.done) {
        resolve();
        return;
      }
      const item = iterResult.value;
      return new Promise((next) => {
        onItem(item, next);
      }).then((shouldContinue) => {
        if (shouldContinue === false) {
          return handleIteration({ done: true, value: void 0 });
        } else {
          return asyncIteratorNext().then(handleIteration);
        }
      });
    }
    __name(handleIteration, "handleIteration");
    asyncIteratorNext().then(handleIteration).catch(reject);
  });
}
__name(wrapAsyncIteratorWithCallback, "wrapAsyncIteratorWithCallback");

// ../node_modules/stripe/esm/StripeResource.js
var StripeResource = class {
  static {
    __name(this, "StripeResource");
  }
  constructor(stripe, deprecatedUrlData) {
    this.resourcePath = "";
    this.requestDataProcessor = null;
    this._stripe = stripe;
    if (deprecatedUrlData) {
      throw new Error("Support for curried url params was dropped in stripe-node v7.0.0. Instead, pass two ids.");
    }
    this.basePath = makeURLInterpolator(
      // @ts-expect-error changing type of basePath
      this.basePath || stripe.getApiField("basePath")
    );
    const rawPath = this.path || "";
    this.resourcePath = rawPath;
    this.path = makeURLInterpolator(rawPath);
    this.initialize(stripe, deprecatedUrlData);
  }
  initialize(_stripe, _deprecatedUrlData) {
  }
  _makeRequest(method, path, params, options, spec) {
    const requestMethod = method.toUpperCase();
    const encode = spec?.encode || ((data2) => data2);
    const data = encode(params ? { ...params } : {});
    const processed = processOptions(options);
    const apiBase = processed.apiBase || spec?.apiBase || null;
    const host = apiBase ? this._stripe.resolveBaseAddress(apiBase) : null;
    const streaming = processed.streaming || !!spec?.streaming;
    const headers = Object.assign(processed.headers, spec?.headers);
    const usage = spec?.usage || [];
    const dataInQuery = requestMethod === "GET" || requestMethod === "DELETE";
    let bodyData = dataInQuery ? null : data;
    const queryData = dataInQuery ? data : {};
    try {
      if (spec?.validator) {
        spec.validator(data, { headers });
      }
      if (spec?.requestSchema && bodyData) {
        bodyData = coerceV2RequestData(bodyData, spec.requestSchema);
      }
    } catch (err) {
      return Promise.reject(err);
    }
    const callSiteStack = new Error().stack;
    const innerPromise = new Promise((resolve, reject) => {
      function requestCallback(err, response) {
        if (err) {
          attachCallSiteToError(err, callSiteStack);
          reject(err);
        } else {
          try {
            if (spec?.responseSchema) {
              coerceV2ResponseData(response, spec.responseSchema);
            }
            resolve(spec?.transformResponseData ? spec.transformResponseData(response) : response);
          } catch (e) {
            reject(e);
          }
        }
      }
      __name(requestCallback, "requestCallback");
      const emptyQuery = Object.keys(queryData).length === 0;
      const fullPath = [
        path,
        emptyQuery ? "" : "?",
        queryStringifyRequestData(queryData)
      ].join("");
      this._stripe._requestSender._request(requestMethod, host, fullPath, bodyData, processed.authenticator, {
        headers,
        settings: processed.settings,
        streaming
      }, usage, requestCallback, this.requestDataProcessor?.bind(this));
    });
    if (spec?.methodType) {
      Object.assign(innerPromise, makeAutoPaginationMethods(this, params ? { ...params } : {}, options, requestMethod, path, spec, innerPromise));
    }
    return innerPromise;
  }
};
StripeResource.MAX_BUFFERED_REQUEST_METRICS = 100;

// ../node_modules/stripe/esm/StripeContext.js
var StripeContext = class _StripeContext {
  static {
    __name(this, "StripeContext");
  }
  /**
   * Creates a new StripeContext with the given segments.
   */
  constructor(segments = []) {
    this._segments = [...segments];
  }
  /**
   * Gets a copy of the segments of this Context.
   */
  get segments() {
    return [...this._segments];
  }
  /**
   * Creates a new StripeContext with an additional segment appended.
   */
  push(segment) {
    if (!segment) {
      throw new Error("Segment cannot be null or undefined");
    }
    return new _StripeContext([...this._segments, segment]);
  }
  /**
   * Creates a new StripeContext with the last segment removed.
   * If there are no segments, throws an error.
   */
  pop() {
    if (this._segments.length === 0) {
      throw new Error("Cannot pop from an empty context");
    }
    return new _StripeContext(this._segments.slice(0, -1));
  }
  /**
   * Converts this context to its string representation.
   */
  toString() {
    return this._segments.join("/");
  }
  /**
   * Parses a context string into a StripeContext instance.
   */
  static parse(contextStr) {
    if (!contextStr) {
      return new _StripeContext([]);
    }
    return new _StripeContext(contextStr.split("/"));
  }
};

// ../node_modules/stripe/esm/Webhooks.js
function createWebhooks(platformFunctions) {
  const Webhook = {
    DEFAULT_TOLERANCE: 300,
    signature: null,
    constructEvent(payload, header, secret, tolerance, cryptoProvider, receivedAt) {
      try {
        if (!this.signature) {
          throw new Error("ERR: missing signature helper, unable to verify");
        }
        cryptoProvider = cryptoProvider || getCryptoProvider();
        this.signature.verifyHeader(payload, header, secret, tolerance || Webhook.DEFAULT_TOLERANCE, cryptoProvider, receivedAt);
      } catch (e) {
        if (e instanceof CryptoProviderOnlySupportsAsyncError) {
          e.message += "\nUse `await constructEventAsync(...)` instead of `constructEvent(...)`";
        }
        throw e;
      }
      const jsonPayload = payload instanceof Uint8Array ? JSON.parse(new TextDecoder("utf8").decode(payload)) : JSON.parse(payload);
      if (jsonPayload && jsonPayload.object === "v2.core.event") {
        throw new Error("You passed an event notification to stripe.webhooks.constructEvent, which expects a webhook payload. Use stripe.parseEventNotification instead.");
      }
      return jsonPayload;
    },
    async constructEventAsync(payload, header, secret, tolerance, cryptoProvider, receivedAt) {
      if (!this.signature) {
        throw new Error("ERR: missing signature helper, unable to verify");
      }
      cryptoProvider = cryptoProvider || getCryptoProvider();
      await this.signature.verifyHeaderAsync(payload, header, secret, tolerance || Webhook.DEFAULT_TOLERANCE, cryptoProvider, receivedAt);
      const jsonPayload = payload instanceof Uint8Array ? JSON.parse(new TextDecoder("utf8").decode(payload)) : JSON.parse(payload);
      if (jsonPayload && jsonPayload.object === "v2.core.event") {
        throw new Error("You passed an event notification to stripe.webhooks.constructEvent, which expects a webhook payload. Use stripe.parseEventNotificationAsync instead.");
      }
      return jsonPayload;
    },
    /**
     * Generates a header to be used for webhook mocking
     *
     * @typedef {object} opts
     * @property {number} timestamp - Timestamp of the header. Defaults to Date.now()
     * @property {string} payload - JSON stringified payload object, containing the 'id' and 'object' parameters
     * @property {string} secret - Stripe webhook secret 'whsec_...'
     * @property {string} scheme - Version of API to hit. Defaults to 'v1'.
     * @property {string} signature - Computed webhook signature
     * @property {CryptoProvider} cryptoProvider - Crypto provider to use for computing the signature if none was provided. Defaults to NodeCryptoProvider.
     */
    generateTestHeaderString: /* @__PURE__ */ __name(function(opts) {
      const preparedOpts = prepareOptions(opts);
      const signature2 = preparedOpts.signature || preparedOpts.cryptoProvider.computeHMACSignature(preparedOpts.payloadString, preparedOpts.secret);
      return preparedOpts.generateHeaderString(signature2);
    }, "generateTestHeaderString"),
    generateTestHeaderStringAsync: /* @__PURE__ */ __name(async function(opts) {
      const preparedOpts = prepareOptions(opts);
      const signature2 = preparedOpts.signature || await preparedOpts.cryptoProvider.computeHMACSignatureAsync(preparedOpts.payloadString, preparedOpts.secret);
      return preparedOpts.generateHeaderString(signature2);
    }, "generateTestHeaderStringAsync")
  };
  const signature = {
    EXPECTED_SCHEME: "v1",
    verifyHeader(encodedPayload, encodedHeader, secret, tolerance, cryptoProvider, receivedAt) {
      const { decodedHeader: header, decodedPayload: payload, details, suspectPayloadType } = parseEventDetails(encodedPayload, encodedHeader, this.EXPECTED_SCHEME);
      const secretContainsWhitespace = /\s/.test(secret);
      cryptoProvider = cryptoProvider || getCryptoProvider();
      const expectedSignature = cryptoProvider.computeHMACSignature(makeHMACContent(payload, details), secret);
      validateComputedSignature(payload, header, details, expectedSignature, tolerance || 0, suspectPayloadType, secretContainsWhitespace, receivedAt);
      return true;
    },
    async verifyHeaderAsync(encodedPayload, encodedHeader, secret, tolerance, cryptoProvider, receivedAt) {
      const { decodedHeader: header, decodedPayload: payload, details, suspectPayloadType } = parseEventDetails(encodedPayload, encodedHeader, this.EXPECTED_SCHEME);
      const secretContainsWhitespace = /\s/.test(secret);
      cryptoProvider = cryptoProvider || getCryptoProvider();
      const expectedSignature = await cryptoProvider.computeHMACSignatureAsync(makeHMACContent(payload, details), secret);
      return validateComputedSignature(payload, header, details, expectedSignature, tolerance || 0, suspectPayloadType, secretContainsWhitespace, receivedAt);
    }
  };
  function makeHMACContent(payload, details) {
    return `${details.timestamp}.${payload}`;
  }
  __name(makeHMACContent, "makeHMACContent");
  function parseEventDetails(encodedPayload, encodedHeader, expectedScheme) {
    if (Array.isArray(encodedHeader)) {
      throw new Error("Unexpected: An array was passed as a header, which should not be possible for the stripe-signature header.");
    }
    if (!encodedPayload) {
      throw new StripeSignatureVerificationError(encodedHeader, encodedPayload, {
        message: "No webhook payload was provided."
      });
    }
    const suspectPayloadType = typeof encodedPayload != "string" && !(encodedPayload instanceof Uint8Array);
    const textDecoder = new TextDecoder("utf8");
    const decodedPayload = encodedPayload instanceof Uint8Array ? textDecoder.decode(encodedPayload) : encodedPayload;
    if (encodedHeader == null || encodedHeader == "") {
      throw new StripeSignatureVerificationError(encodedHeader, encodedPayload, {
        message: "No stripe-signature header value was provided."
      });
    }
    const decodedHeader = encodedHeader instanceof Uint8Array ? textDecoder.decode(encodedHeader) : encodedHeader;
    const details = parseHeader(decodedHeader, expectedScheme);
    if (!details || details.timestamp === -1) {
      throw new StripeSignatureVerificationError(decodedHeader, decodedPayload, {
        message: "Unable to extract timestamp and signatures from header"
      });
    }
    if (!details.signatures.length) {
      throw new StripeSignatureVerificationError(decodedHeader, decodedPayload, {
        message: "No signatures found with expected scheme"
      });
    }
    return {
      decodedPayload,
      decodedHeader,
      details,
      suspectPayloadType
    };
  }
  __name(parseEventDetails, "parseEventDetails");
  function validateComputedSignature(payload, header, details, expectedSignature, tolerance, suspectPayloadType, secretContainsWhitespace, receivedAt) {
    const signatureFound = !!details.signatures.filter(platformFunctions.secureCompare.bind(platformFunctions, expectedSignature)).length;
    const docsLocation = "\nLearn more about webhook signing and explore webhook integration examples for various frameworks at https://docs.stripe.com/webhooks/signature";
    const whitespaceMessage = secretContainsWhitespace ? "\n\nNote: The provided signing secret contains whitespace. This often indicates an extra newline or space is in the value" : "";
    if (!signatureFound) {
      if (suspectPayloadType) {
        throw new StripeSignatureVerificationError(header, payload, {
          message: "Webhook payload must be provided as a string or a Buffer (https://nodejs.org/api/buffer.html) instance representing the _raw_ request body.Payload was provided as a parsed JavaScript object instead. \nSignature verification is impossible without access to the original signed material. \n" + docsLocation + "\n" + whitespaceMessage
        });
      }
      throw new StripeSignatureVerificationError(header, payload, {
        message: "No signatures found matching the expected signature for payload. Are you passing the raw request body you received from Stripe? \n If a webhook request is being forwarded by a third-party tool, ensure that the exact request body, including JSON formatting and new line style, is preserved.\n" + docsLocation + "\n" + whitespaceMessage
      });
    }
    const timestampAge = Math.floor((typeof receivedAt === "number" ? receivedAt : Date.now()) / 1e3) - details.timestamp;
    if (tolerance > 0 && timestampAge > tolerance) {
      throw new StripeSignatureVerificationError(header, payload, {
        message: "Timestamp outside the tolerance zone"
      });
    }
    return true;
  }
  __name(validateComputedSignature, "validateComputedSignature");
  function parseHeader(header, scheme) {
    if (typeof header !== "string") {
      return null;
    }
    scheme = scheme || signature.EXPECTED_SCHEME;
    return header.split(",").reduce((accum, item) => {
      const kv = item.split("=");
      if (kv[0] === "t") {
        accum.timestamp = parseInt(kv[1], 10);
      }
      if (kv[0] === scheme) {
        accum.signatures.push(kv[1]);
      }
      return accum;
    }, {
      timestamp: -1,
      signatures: []
    });
  }
  __name(parseHeader, "parseHeader");
  let webhooksCryptoProviderInstance = null;
  function getCryptoProvider() {
    if (!webhooksCryptoProviderInstance) {
      webhooksCryptoProviderInstance = platformFunctions.createDefaultCryptoProvider();
    }
    return webhooksCryptoProviderInstance;
  }
  __name(getCryptoProvider, "getCryptoProvider");
  function prepareOptions(opts) {
    if (!opts) {
      throw new StripeError({
        message: "Options are required"
      });
    }
    const timestamp = opts.timestamp && Math.floor(opts.timestamp) || Math.floor(Date.now() / 1e3);
    const scheme = opts.scheme || signature.EXPECTED_SCHEME;
    const cryptoProvider = opts.cryptoProvider || getCryptoProvider();
    const payloadString = `${timestamp}.${opts.payload}`;
    const generateHeaderString = /* @__PURE__ */ __name((signature2) => {
      return `t=${timestamp},${scheme}=${signature2}`;
    }, "generateHeaderString");
    return {
      ...opts,
      timestamp,
      scheme,
      cryptoProvider,
      payloadString,
      generateHeaderString
    };
  }
  __name(prepareOptions, "prepareOptions");
  Webhook.signature = signature;
  return Webhook;
}
__name(createWebhooks, "createWebhooks");

// ../node_modules/stripe/esm/apiVersion.js
var ApiVersion = "2026-04-22.dahlia";

// ../node_modules/stripe/esm/resources.js
var resources_exports = {};
__export(resources_exports, {
  Account: () => AccountResource3,
  AccountLinks: () => AccountLinkResource2,
  AccountSessions: () => AccountSessionResource,
  Accounts: () => AccountResource3,
  ApplePayDomains: () => ApplePayDomainResource,
  ApplicationFees: () => ApplicationFeeResource,
  Apps: () => Apps,
  Balance: () => BalanceResource,
  BalanceSettings: () => BalanceSettingResource,
  BalanceTransactions: () => BalanceTransactionResource,
  Balances: () => BalanceResource,
  Billing: () => Billing,
  BillingPortal: () => BillingPortal,
  Charges: () => ChargeResource,
  Checkout: () => Checkout,
  Climate: () => Climate,
  ConfirmationTokens: () => ConfirmationTokenResource2,
  CountrySpecs: () => CountrySpecResource,
  Coupons: () => CouponResource,
  CreditNotes: () => CreditNoteResource,
  CustomerSessions: () => CustomerSessionResource,
  Customers: () => CustomerResource2,
  Disputes: () => DisputeResource2,
  Entitlements: () => Entitlements,
  EphemeralKeys: () => EphemeralKeyResource,
  Events: () => EventResource2,
  ExchangeRates: () => ExchangeRateResource,
  FileLinks: () => FileLinkResource,
  Files: () => FileResource,
  FinancialConnections: () => FinancialConnections,
  Forwarding: () => Forwarding,
  Identity: () => Identity,
  InvoiceItems: () => InvoiceItemResource,
  InvoicePayments: () => InvoicePaymentResource,
  InvoiceRenderingTemplates: () => InvoiceRenderingTemplateResource,
  Invoices: () => InvoiceResource,
  Issuing: () => Issuing,
  Mandates: () => MandateResource,
  OAuthResource: () => OAuthResource,
  PaymentAttemptRecords: () => PaymentAttemptRecordResource,
  PaymentIntents: () => PaymentIntentResource,
  PaymentLinks: () => PaymentLinkResource,
  PaymentMethodConfigurations: () => PaymentMethodConfigurationResource,
  PaymentMethodDomains: () => PaymentMethodDomainResource,
  PaymentMethods: () => PaymentMethodResource,
  PaymentRecords: () => PaymentRecordResource,
  Payouts: () => PayoutResource,
  Plans: () => PlanResource,
  Prices: () => PriceResource,
  Products: () => ProductResource2,
  PromotionCodes: () => PromotionCodeResource,
  Quotes: () => QuoteResource,
  Radar: () => Radar,
  Refunds: () => RefundResource2,
  Reporting: () => Reporting,
  Reviews: () => ReviewResource,
  SetupAttempts: () => SetupAttemptResource,
  SetupIntents: () => SetupIntentResource,
  ShippingRates: () => ShippingRateResource,
  Sigma: () => Sigma,
  Sources: () => SourceResource,
  SubscriptionItems: () => SubscriptionItemResource,
  SubscriptionSchedules: () => SubscriptionScheduleResource,
  Subscriptions: () => SubscriptionResource,
  Tax: () => Tax,
  TaxCodes: () => TaxCodeResource,
  TaxIds: () => TaxIdResource,
  TaxRates: () => TaxRateResource,
  Terminal: () => Terminal,
  TestHelpers: () => TestHelpers,
  Tokens: () => TokenResource2,
  Topups: () => TopupResource,
  Transfers: () => TransferResource,
  Treasury: () => Treasury,
  V2: () => V2,
  WebhookEndpoints: () => WebhookEndpointResource
});

// ../node_modules/stripe/esm/ResourceNamespace.js
function ResourceNamespace(stripe, resources) {
  for (const name in resources) {
    if (!Object.prototype.hasOwnProperty.call(resources, name)) {
      continue;
    }
    const camelCaseName = name[0].toLowerCase() + name.substring(1);
    const resource = new resources[name](stripe);
    this[camelCaseName] = resource;
  }
}
__name(ResourceNamespace, "ResourceNamespace");
function resourceNamespace(namespace, resources) {
  return function(stripe) {
    return new ResourceNamespace(stripe, resources);
  };
}
__name(resourceNamespace, "resourceNamespace");

// ../node_modules/stripe/esm/resources/V2/Core/AccountLinks.js
var AccountLinkResource = class extends StripeResource {
  static {
    __name(this, "AccountLinkResource");
  }
  /**
   * Creates an AccountLink object that includes a single-use URL that an account can use to access a Stripe-hosted flow for collecting or updating required information.
   * @throws Stripe.RateLimitError
   */
  create(params, options) {
    return this._makeRequest("POST", "/v2/core/account_links", params, options);
  }
};

// ../node_modules/stripe/esm/resources/V2/Core/AccountTokens.js
var AccountTokenResource = class extends StripeResource {
  static {
    __name(this, "AccountTokenResource");
  }
  /**
   * Creates an Account Token.
   * @throws Stripe.RateLimitError
   */
  create(params, options) {
    return this._makeRequest("POST", "/v2/core/account_tokens", params, options, {
      requestSchema: {
        kind: "object",
        fields: {
          identity: {
            kind: "object",
            fields: {
              individual: {
                kind: "object",
                fields: {
                  relationship: {
                    kind: "object",
                    fields: { percent_ownership: { kind: "decimal_string" } }
                  }
                }
              }
            }
          }
        }
      }
    });
  }
  /**
   * Retrieves an Account Token.
   * @throws Stripe.RateLimitError
   */
  retrieve(id, params, options) {
    return this._makeRequest("GET", `/v2/core/account_tokens/${id}`, params, options);
  }
};

// ../node_modules/stripe/esm/resources/FinancialConnections/Accounts.js
var AccountResource = class extends StripeResource {
  static {
    __name(this, "AccountResource");
  }
  /**
   * Returns a list of Financial Connections Account objects.
   */
  list(params, options) {
    return this._makeRequest("GET", "/v1/financial_connections/accounts", params, options, {
      methodType: "list"
    });
  }
  /**
   * Retrieves the details of an Financial Connections Account.
   */
  retrieve(id, params, options) {
    return this._makeRequest("GET", `/v1/financial_connections/accounts/${id}`, params, options);
  }
  /**
   * Disables your access to a Financial Connections Account. You will no longer be able to access data associated with the account (e.g. balances, transactions).
   */
  disconnect(id, params, options) {
    return this._makeRequest("POST", `/v1/financial_connections/accounts/${id}/disconnect`, params, options);
  }
  /**
   * Refreshes the data associated with a Financial Connections Account.
   */
  refresh(id, params, options) {
    return this._makeRequest("POST", `/v1/financial_connections/accounts/${id}/refresh`, params, options);
  }
  /**
   * Subscribes to periodic refreshes of data associated with a Financial Connections Account. When the account status is active, data is typically refreshed once a day.
   */
  subscribe(id, params, options) {
    return this._makeRequest("POST", `/v1/financial_connections/accounts/${id}/subscribe`, params, options);
  }
  /**
   * Unsubscribes from periodic refreshes of data associated with a Financial Connections Account.
   */
  unsubscribe(id, params, options) {
    return this._makeRequest("POST", `/v1/financial_connections/accounts/${id}/unsubscribe`, params, options);
  }
  /**
   * Lists all owners for a given Account
   */
  listOwners(id, params, options) {
    return this._makeRequest("GET", `/v1/financial_connections/accounts/${id}/owners`, params, options, {
      methodType: "list"
    });
  }
};

// ../node_modules/stripe/esm/resources/V2/Core/Accounts/Persons.js
var PersonResource = class extends StripeResource {
  static {
    __name(this, "PersonResource");
  }
  /**
   * Returns a paginated list of Persons associated with an Account.
   * @throws Stripe.RateLimitError
   */
  list(id, params, options) {
    return this._makeRequest("GET", `/v2/core/accounts/${id}/persons`, params, options, {
      methodType: "list",
      responseSchema: {
        kind: "object",
        fields: {
          data: {
            kind: "array",
            element: {
              kind: "object",
              fields: {
                relationship: {
                  kind: "object",
                  fields: { percent_ownership: { kind: "decimal_string" } }
                }
              }
            }
          }
        }
      }
    });
  }
  /**
   * Create a Person. Adds an individual to an Account's identity. You can set relationship attributes and identity information at creation.
   * @throws Stripe.RateLimitError
   */
  create(id, params, options) {
    return this._makeRequest("POST", `/v2/core/accounts/${id}/persons`, params, options, {
      requestSchema: {
        kind: "object",
        fields: {
          relationship: {
            kind: "object",
            fields: { percent_ownership: { kind: "decimal_string" } }
          }
        }
      },
      responseSchema: {
        kind: "object",
        fields: {
          relationship: {
            kind: "object",
            fields: { percent_ownership: { kind: "decimal_string" } }
          }
        }
      }
    });
  }
  /**
   * Delete a Person associated with an Account.
   * @throws Stripe.RateLimitError
   */
  del(accountId, id, params, options) {
    return this._makeRequest("DELETE", `/v2/core/accounts/${accountId}/persons/${id}`, params, options);
  }
  /**
   * Retrieves a Person associated with an Account.
   * @throws Stripe.RateLimitError
   */
  retrieve(accountId, id, params, options) {
    return this._makeRequest("GET", `/v2/core/accounts/${accountId}/persons/${id}`, params, options, {
      responseSchema: {
        kind: "object",
        fields: {
          relationship: {
            kind: "object",
            fields: { percent_ownership: { kind: "decimal_string" } }
          }
        }
      }
    });
  }
  /**
   * Updates a Person associated with an Account.
   * @throws Stripe.RateLimitError
   */
  update(accountId, id, params, options) {
    return this._makeRequest("POST", `/v2/core/accounts/${accountId}/persons/${id}`, params, options, {
      requestSchema: {
        kind: "object",
        fields: {
          relationship: {
            kind: "object",
            fields: { percent_ownership: { kind: "decimal_string" } }
          }
        }
      },
      responseSchema: {
        kind: "object",
        fields: {
          relationship: {
            kind: "object",
            fields: { percent_ownership: { kind: "decimal_string" } }
          }
        }
      }
    });
  }
};

// ../node_modules/stripe/esm/resources/V2/Core/Accounts/PersonTokens.js
var PersonTokenResource = class extends StripeResource {
  static {
    __name(this, "PersonTokenResource");
  }
  /**
   * Creates a Person Token associated with an Account.
   * @throws Stripe.RateLimitError
   */
  create(id, params, options) {
    return this._makeRequest("POST", `/v2/core/accounts/${id}/person_tokens`, params, options, {
      requestSchema: {
        kind: "object",
        fields: {
          relationship: {
            kind: "object",
            fields: { percent_ownership: { kind: "decimal_string" } }
          }
        }
      }
    });
  }
  /**
   * Retrieves a Person Token associated with an Account.
   * @throws Stripe.RateLimitError
   */
  retrieve(accountId, id, params, options) {
    return this._makeRequest("GET", `/v2/core/accounts/${accountId}/person_tokens/${id}`, params, options);
  }
};

// ../node_modules/stripe/esm/resources/V2/Core/Accounts.js
var AccountResource2 = class extends StripeResource {
  static {
    __name(this, "AccountResource");
  }
  constructor(stripe) {
    super(stripe);
    this.stripe = stripe;
    this.persons = new PersonResource(stripe);
    this.personTokens = new PersonTokenResource(stripe);
  }
  /**
   * Returns a list of Accounts.
   * @throws Stripe.RateLimitError
   */
  list(params, options) {
    return this._makeRequest("GET", "/v2/core/accounts", params, options, {
      methodType: "list",
      responseSchema: {
        kind: "object",
        fields: {
          data: {
            kind: "array",
            element: {
              kind: "object",
              fields: {
                identity: {
                  kind: "object",
                  fields: {
                    individual: {
                      kind: "object",
                      fields: {
                        relationship: {
                          kind: "object",
                          fields: { percent_ownership: { kind: "decimal_string" } }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });
  }
  /**
   * An Account is a representation of a company, individual or other entity that a user interacts with. Accounts contain identifying information about the entity, and configurations that store the features an account has access to. An account can be configured as any or all of the following configurations: Customer, Merchant and/or Recipient.
   * @throws Stripe.RateLimitError
   */
  create(params, options) {
    return this._makeRequest("POST", "/v2/core/accounts", params, options, {
      requestSchema: {
        kind: "object",
        fields: {
          identity: {
            kind: "object",
            fields: {
              individual: {
                kind: "object",
                fields: {
                  relationship: {
                    kind: "object",
                    fields: { percent_ownership: { kind: "decimal_string" } }
                  }
                }
              }
            }
          }
        }
      },
      responseSchema: {
        kind: "object",
        fields: {
          identity: {
            kind: "object",
            fields: {
              individual: {
                kind: "object",
                fields: {
                  relationship: {
                    kind: "object",
                    fields: { percent_ownership: { kind: "decimal_string" } }
                  }
                }
              }
            }
          }
        }
      }
    });
  }
  /**
   * Retrieves the details of an Account.
   * @throws Stripe.RateLimitError
   */
  retrieve(id, params, options) {
    return this._makeRequest("GET", `/v2/core/accounts/${id}`, params, options, {
      responseSchema: {
        kind: "object",
        fields: {
          identity: {
            kind: "object",
            fields: {
              individual: {
                kind: "object",
                fields: {
                  relationship: {
                    kind: "object",
                    fields: { percent_ownership: { kind: "decimal_string" } }
                  }
                }
              }
            }
          }
        }
      }
    });
  }
  /**
   * Updates the details of an Account.
   * @throws Stripe.RateLimitError
   */
  update(id, params, options) {
    return this._makeRequest("POST", `/v2/core/accounts/${id}`, params, options, {
      requestSchema: {
        kind: "object",
        fields: {
          identity: {
            kind: "object",
            fields: {
              individual: {
                kind: "object",
                fields: {
                  relationship: {
                    kind: "object",
                    fields: { percent_ownership: { kind: "decimal_string" } }
                  }
                }
              }
            }
          }
        }
      },
      responseSchema: {
        kind: "object",
        fields: {
          identity: {
            kind: "object",
            fields: {
              individual: {
                kind: "object",
                fields: {
                  relationship: {
                    kind: "object",
                    fields: { percent_ownership: { kind: "decimal_string" } }
                  }
                }
              }
            }
          }
        }
      }
    });
  }
  /**
   * Removes access to the Account and its associated resources. Closed Accounts can no longer be operated on, but limited information can still be retrieved through the API in order to be able to track their history.
   * @throws Stripe.RateLimitError
   */
  close(id, params, options) {
    return this._makeRequest("POST", `/v2/core/accounts/${id}/close`, params, options, {
      responseSchema: {
        kind: "object",
        fields: {
          identity: {
            kind: "object",
            fields: {
              individual: {
                kind: "object",
                fields: {
                  relationship: {
                    kind: "object",
                    fields: { percent_ownership: { kind: "decimal_string" } }
                  }
                }
              }
            }
          }
        }
      }
    });
  }
};

// ../node_modules/stripe/esm/resources/Entitlements/ActiveEntitlements.js
var ActiveEntitlementResource = class extends StripeResource {
  static {
    __name(this, "ActiveEntitlementResource");
  }
  /**
   * Retrieve a list of active entitlements for a customer
   */
  list(params, options) {
    return this._makeRequest("GET", "/v1/entitlements/active_entitlements", params, options, {
      methodType: "list"
    });
  }
  /**
   * Retrieve an active entitlement
   */
  retrieve(id, params, options) {
    return this._makeRequest("GET", `/v1/entitlements/active_entitlements/${id}`, params, options);
  }
};

// ../node_modules/stripe/esm/resources/Billing/Alerts.js
var AlertResource = class extends StripeResource {
  static {
    __name(this, "AlertResource");
  }
  /**
   * Lists billing active and inactive alerts
   */
  list(params, options) {
    return this._makeRequest("GET", "/v1/billing/alerts", params, options, {
      methodType: "list"
    });
  }
  /**
   * Creates a billing alert
   */
  create(params, options) {
    return this._makeRequest("POST", "/v1/billing/alerts", params, options);
  }
  /**
   * Retrieves a billing alert given an ID
   */
  retrieve(id, params, options) {
    return this._makeRequest("GET", `/v1/billing/alerts/${id}`, params, options);
  }
  /**
   * Reactivates this alert, allowing it to trigger again.
   */
  activate(id, params, options) {
    return this._makeRequest("POST", `/v1/billing/alerts/${id}/activate`, params, options);
  }
  /**
   * Archives this alert, removing it from the list view and APIs. This is non-reversible.
   */
  archive(id, params, options) {
    return this._makeRequest("POST", `/v1/billing/alerts/${id}/archive`, params, options);
  }
  /**
   * Deactivates this alert, preventing it from triggering.
   */
  deactivate(id, params, options) {
    return this._makeRequest("POST", `/v1/billing/alerts/${id}/deactivate`, params, options);
  }
};

// ../node_modules/stripe/esm/resources/Tax/Associations.js
var AssociationResource = class extends StripeResource {
  static {
    __name(this, "AssociationResource");
  }
  /**
   * Finds a tax association object by PaymentIntent id.
   */
  find(params, options) {
    return this._makeRequest("GET", "/v1/tax/associations/find", params, options);
  }
};

// ../node_modules/stripe/esm/resources/Issuing/Authorizations.js
var AuthorizationResource = class extends StripeResource {
  static {
    __name(this, "AuthorizationResource");
  }
  /**
   * Returns a list of Issuing Authorization objects. The objects are sorted in descending order by creation date, with the most recently created object appearing first.
   */
  list(params, options) {
    return this._makeRequest("GET", "/v1/issuing/authorizations", params, options, {
      methodType: "list",
      responseSchema: {
        kind: "object",
        fields: {
          data: {
            kind: "array",
            element: {
              kind: "object",
              fields: {
                fleet: {
                  kind: "nullable",
                  inner: {
                    kind: "object",
                    fields: {
                      reported_breakdown: {
                        kind: "nullable",
                        inner: {
                          kind: "object",
                          fields: {
                            fuel: {
                              kind: "nullable",
                              inner: {
                                kind: "object",
                                fields: {
                                  gross_amount_decimal: {
                                    kind: "nullable",
                                    inner: { kind: "decimal_string" }
                                  }
                                }
                              }
                            },
                            non_fuel: {
                              kind: "nullable",
                              inner: {
                                kind: "object",
                                fields: {
                                  gross_amount_decimal: {
                                    kind: "nullable",
                                    inner: { kind: "decimal_string" }
                                  }
                                }
                              }
                            },
                            tax: {
                              kind: "nullable",
                              inner: {
                                kind: "object",
                                fields: {
                                  local_amount_decimal: {
                                    kind: "nullable",
                                    inner: { kind: "decimal_string" }
                                  },
                                  national_amount_decimal: {
                                    kind: "nullable",
                                    inner: { kind: "decimal_string" }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                },
                fuel: {
                  kind: "nullable",
                  inner: {
                    kind: "object",
                    fields: {
                      quantity_decimal: {
                        kind: "nullable",
                        inner: { kind: "decimal_string" }
                      },
                      unit_cost_decimal: {
                        kind: "nullable",
                        inner: { kind: "decimal_string" }
                      }
                    }
                  }
                },
                transactions: {
                  kind: "array",
                  element: {
                    kind: "object",
                    fields: {
                      purchase_details: {
                        kind: "nullable",
                        inner: {
                          kind: "object",
                          fields: {
                            fleet: {
                              kind: "nullable",
                              inner: {
                                kind: "object",
                                fields: {
                                  reported_breakdown: {
                                    kind: "nullable",
                                    inner: {
                                      kind: "object",
                                      fields: {
                                        fuel: {
                                          kind: "nullable",
                                          inner: {
                                            kind: "object",
                                            fields: {
                                              gross_amount_decimal: {
                                                kind: "nullable",
                                                inner: {
                                                  kind: "decimal_string"
                                                }
                                              }
                                            }
                                          }
                                        },
                                        non_fuel: {
                                          kind: "nullable",
                                          inner: {
                                            kind: "object",
                                            fields: {
                                              gross_amount_decimal: {
                                                kind: "nullable",
                                                inner: {
                                                  kind: "decimal_string"
                                                }
                                              }
                                            }
                                          }
                                        },
                                        tax: {
                                          kind: "nullable",
                                          inner: {
                                            kind: "object",
                                            fields: {
                                              local_amount_decimal: {
                                                kind: "nullable",
                                                inner: {
                                                  kind: "decimal_string"
                                                }
                                              },
                                              national_amount_decimal: {
                                                kind: "nullable",
                                                inner: {
                                                  kind: "decimal_string"
                                                }
                                              }
                                            }
                                          }
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            },
                            fuel: {
                              kind: "nullable",
                              inner: {
                                kind: "object",
                                fields: {
                                  quantity_decimal: {
                                    kind: "nullable",
                                    inner: { kind: "decimal_string" }
                                  },
                                  unit_cost_decimal: { kind: "decimal_string" }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });
  }
  /**
   * Retrieves an Issuing Authorization object.
   */
  retrieve(id, params, options) {
    return this._makeRequest("GET", `/v1/issuing/authorizations/${id}`, params, options, {
      responseSchema: {
        kind: "object",
        fields: {
          fleet: {
            kind: "nullable",
            inner: {
              kind: "object",
              fields: {
                reported_breakdown: {
                  kind: "nullable",
                  inner: {
                    kind: "object",
                    fields: {
                      fuel: {
                        kind: "nullable",
                        inner: {
                          kind: "object",
                          fields: {
                            gross_amount_decimal: {
                              kind: "nullable",
                              inner: { kind: "decimal_string" }
                            }
                          }
                        }
                      },
                      non_fuel: {
                        kind: "nullable",
                        inner: {
                          kind: "object",
                          fields: {
                            gross_amount_decimal: {
                              kind: "nullable",
                              inner: { kind: "decimal_string" }
                            }
                          }
                        }
                      },
                      tax: {
                        kind: "nullable",
                        inner: {
                          kind: "object",
                          fields: {
                            local_amount_decimal: {
                              kind: "nullable",
                              inner: { kind: "decimal_string" }
                            },
                            national_amount_decimal: {
                              kind: "nullable",
                              inner: { kind: "decimal_string" }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          fuel: {
            kind: "nullable",
            inner: {
              kind: "object",
              fields: {
                quantity_decimal: {
                  kind: "nullable",
                  inner: { kind: "decimal_string" }
                },
                unit_cost_decimal: {
                  kind: "nullable",
                  inner: { kind: "decimal_string" }
                }
              }
            }
          },
          transactions: {
            kind: "array",
            element: {
              kind: "object",
              fields: {
                purchase_details: {
                  kind: "nullable",
                  inner: {
                    kind: "object",
                    fields: {
                      fleet: {
                        kind: "nullable",
                        inner: {
                          kind: "object",
                          fields: {
                            reported_breakdown: {
                              kind: "nullable",
                              inner: {
                                kind: "object",
                                fields: {
                                  fuel: {
                                    kind: "nullable",
                                    inner: {
                                      kind: "object",
                                      fields: {
                                        gross_amount_decimal: {
                                          kind: "nullable",
                                          inner: { kind: "decimal_string" }
                                        }
                                      }
                                    }
                                  },
                                  non_fuel: {
                                    kind: "nullable",
                                    inner: {
                                      kind: "object",
                                      fields: {
                                        gross_amount_decimal: {
                                          kind: "nullable",
                                          inner: { kind: "decimal_string" }
                                        }
                                      }
                                    }
                                  },
                                  tax: {
                                    kind: "nullable",
                                    inner: {
                                      kind: "object",
                                      fields: {
                                        local_amount_decimal: {
                                          kind: "nullable",
                                          inner: { kind: "decimal_string" }
                                        },
                                        national_amount_decimal: {
                                          kind: "nullable",
                                          inner: { kind: "decimal_string" }
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      },
                      fuel: {
                        kind: "nullable",
                        inner: {
                          kind: "object",
                          fields: {
                            quantity_decimal: {
                              kind: "nullable",
                              inner: { kind: "decimal_string" }
                            },
                            unit_cost_decimal: { kind: "decimal_string" }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });
  }
  /**
   * Updates the specified Issuing Authorization object by setting the values of the parameters passed. Any parameters not provided will be left unchanged.
   */
  update(id, params, options) {
    return this._makeRequest("POST", `/v1/issuing/authorizations/${id}`, params, options, {
      responseSchema: {
        kind: "object",
        fields: {
          fleet: {
            kind: "nullable",
            inner: {
              kind: "object",
              fields: {
                reported_breakdown: {
                  kind: "nullable",
                  inner: {
                    kind: "object",
                    fields: {
                      fuel: {
                        kind: "nullable",
                        inner: {
                          kind: "object",
                          fields: {
                            gross_amount_decimal: {
                              kind: "nullable",
                              inner: { kind: "decimal_string" }
                            }
                          }
                        }
                      },
                      non_fuel: {
                        kind: "nullable",
                        inner: {
                          kind: "object",
                          fields: {
                            gross_amount_decimal: {
                              kind: "nullable",
                              inner: { kind: "decimal_string" }
                            }
                          }
                        }
                      },
                      tax: {
                        kind: "nullable",
                        inner: {
                          kind: "object",
                          fields: {
                            local_amount_decimal: {
                              kind: "nullable",
                              inner: { kind: "decimal_string" }
                            },
                            national_amount_decimal: {
                              kind: "nullable",
                              inner: { kind: "decimal_string" }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          fuel: {
            kind: "nullable",
            inner: {
              kind: "object",
              fields: {
                quantity_decimal: {
                  kind: "nullable",
                  inner: { kind: "decimal_string" }
                },
                unit_cost_decimal: {
                  kind: "nullable",
                  inner: { kind: "decimal_string" }
                }
              }
            }
          },
          transactions: {
            kind: "array",
            element: {
              kind: "object",
              fields: {
                purchase_details: {
                  kind: "nullable",
                  inner: {
                    kind: "object",
                    fields: {
                      fleet: {
                        kind: "nullable",
                        inner: {
                          kind: "object",
                          fields: {
                            reported_breakdown: {
                              kind: "nullable",
                              inner: {
                                kind: "object",
                                fields: {
                                  fuel: {
                                    kind: "nullable",
                                    inner: {
                                      kind: "object",
                                      fields: {
                                        gross_amount_decimal: {
                                          kind: "nullable",
                                          inner: { kind: "decimal_string" }
                                        }
                                      }
                                    }
                                  },
                                  non_fuel: {
                                    kind: "nullable",
                                    inner: {
                                      kind: "object",
                                      fields: {
                                        gross_amount_decimal: {
                                          kind: "nullable",
                                          inner: { kind: "decimal_string" }
                                        }
                                      }
                                    }
                                  },
                                  tax: {
                                    kind: "nullable",
                                    inner: {
                                      kind: "object",
                                      fields: {
                                        local_amount_decimal: {
                                          kind: "nullable",
                                          inner: { kind: "decimal_string" }
                                        },
                                        national_amount_decimal: {
                                          kind: "nullable",
                                          inner: { kind: "decimal_string" }
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      },
                      fuel: {
                        kind: "nullable",
                        inner: {
                          kind: "object",
                          fields: {
                            quantity_decimal: {
                              kind: "nullable",
                              inner: { kind: "decimal_string" }
                            },
                            unit_cost_decimal: { kind: "decimal_string" }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });
  }
  /**
   * [Deprecated] Approves a pending Issuing Authorization object. This request should be made within the timeout window of the [real-time authorization](https://docs.stripe.com/docs/issuing/controls/real-time-authorizations) flow.
   * This method is deprecated. Instead, [respond directly to the webhook request to approve an authorization](https://docs.stripe.com/docs/issuing/controls/real-time-authorizations#authorization-handling).
   * @deprecated
   */
  approve(id, params, options) {
    return this._makeRequest("POST", `/v1/issuing/authorizations/${id}/approve`, params, options, {
      responseSchema: {
        kind: "object",
        fields: {
          fleet: {
            kind: "nullable",
            inner: {
              kind: "object",
              fields: {
                reported_breakdown: {
                  kind: "nullable",
                  inner: {
                    kind: "object",
                    fields: {
                      fuel: {
                        kind: "nullable",
                        inner: {
                          kind: "object",
                          fields: {
                            gross_amount_decimal: {
                              kind: "nullable",
                              inner: { kind: "decimal_string" }
                            }
                          }
                        }
                      },
                      non_fuel: {
                        kind: "nullable",
                        inner: {
                          kind: "object",
                          fields: {
                            gross_amount_decimal: {
                              kind: "nullable",
                              inner: { kind: "decimal_string" }
                            }
                          }
                        }
                      },
                      tax: {
                        kind: "nullable",
                        inner: {
                          kind: "object",
                          fields: {
                            local_amount_decimal: {
                              kind: "nullable",
                              inner: { kind: "decimal_string" }
                            },
                            national_amount_decimal: {
                              kind: "nullable",
                              inner: { kind: "decimal_string" }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          fuel: {
            kind: "nullable",
            inner: {
              kind: "object",
              fields: {
                quantity_decimal: {
                  kind: "nullable",
                  inner: { kind: "decimal_string" }
                },
                unit_cost_decimal: {
                  kind: "nullable",
                  inner: { kind: "decimal_string" }
                }
              }
            }
          },
          transactions: {
            kind: "array",
            element: {
              kind: "object",
              fields: {
                purchase_details: {
                  kind: "nullable",
                  inner: {
                    kind: "object",
                    fields: {
                      fleet: {
                        kind: "nullable",
                        inner: {
                          kind: "object",
                          fields: {
                            reported_breakdown: {
                              kind: "nullable",
                              inner: {
                                kind: "object",
                                fields: {
                                  fuel: {
                                    kind: "nullable",
                                    inner: {
                                      kind: "object",
                                      fields: {
                                        gross_amount_decimal: {
                                          kind: "nullable",
                                          inner: { kind: "decimal_string" }
                                        }
                                      }
                                    }
                                  },
                                  non_fuel: {
                                    kind: "nullable",
                                    inner: {
                                      kind: "object",
                                      fields: {
                                        gross_amount_decimal: {
                                          kind: "nullable",
                                          inner: { kind: "decimal_string" }
                                        }
                                      }
                                    }
                                  },
                                  tax: {
                                    kind: "nullable",
                                    inner: {
                                      kind: "object",
                                      fields: {
                                        local_amount_decimal: {
                                          kind: "nullable",
                                          inner: { kind: "decimal_string" }
                                        },
                                        national_amount_decimal: {
                                          kind: "nullable",
                                          inner: { kind: "decimal_string" }
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      },
                      fuel: {
                        kind: "nullable",
                        inner: {
                          kind: "object",
                          fields: {
                            quantity_decimal: {
                              kind: "nullable",
                              inner: { kind: "decimal_string" }
                            },
                            unit_cost_decimal: { kind: "decimal_string" }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });
  }
  /**
   * [Deprecated] Declines a pending Issuing Authorization object. This request should be made within the timeout window of the [real time authorization](https://docs.stripe.com/docs/issuing/controls/real-time-authorizations) flow.
   * This method is deprecated. Instead, [respond directly to the webhook request to decline an authorization](https://docs.stripe.com/docs/issuing/controls/real-time-authorizations#authorization-handling).
   * @deprecated
   */
  decline(id, params, options) {
    return this._makeRequest("POST", `/v1/issuing/authorizations/${id}/decline`, params, options, {
      responseSchema: {
        kind: "object",
        fields: {
          fleet: {
            kind: "nullable",
            inner: {
              kind: "object",
              fields: {
                reported_breakdown: {
                  kind: "nullable",
                  inner: {
                    kind: "object",
                    fields: {
                      fuel: {
                        kind: "nullable",
                        inner: {
                          kind: "object",
                          fields: {
                            gross_amount_decimal: {
                              kind: "nullable",
                              inner: { kind: "decimal_string" }
                            }
                          }
                        }
                      },
                      non_fuel: {
                        kind: "nullable",
                        inner: {
                          kind: "object",
                          fields: {
                            gross_amount_decimal: {
                              kind: "nullable",
                              inner: { kind: "decimal_string" }
                            }
                          }
                        }
                      },
                      tax: {
                        kind: "nullable",
                        inner: {
                          kind: "object",
                          fields: {
                            local_amount_decimal: {
                              kind: "nullable",
                              inner: { kind: "decimal_string" }
                            },
                            national_amount_decimal: {
                              kind: "nullable",
                              inner: { kind: "decimal_string" }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          fuel: {
            kind: "nullable",
            inner: {
              kind: "object",
              fields: {
                quantity_decimal: {
                  kind: "nullable",
                  inner: { kind: "decimal_string" }
                },
                unit_cost_decimal: {
                  kind: "nullable",
                  inner: { kind: "decimal_string" }
                }
              }
            }
          },
          transactions: {
            kind: "array",
            element: {
              kind: "object",
              fields: {
                purchase_details: {
                  kind: "nullable",
                  inner: {
                    kind: "object",
                    fields: {
                      fleet: {
                        kind: "nullable",
                        inner: {
                          kind: "object",
                          fields: {
                            reported_breakdown: {
                              kind: "nullable",
                              inner: {
                                kind: "object",
                                fields: {
                                  fuel: {
                                    kind: "nullable",
                                    inner: {
                                      kind: "object",
                                      fields: {
                                        gross_amount_decimal: {
                                          kind: "nullable",
                                          inner: { kind: "decimal_string" }
                                        }
                                      }
                                    }
                                  },
                                  non_fuel: {
                                    kind: "nullable",
                                    inner: {
                                      kind: "object",
                                      fields: {
                                        gross_amount_decimal: {
                                          kind: "nullable",
                                          inner: { kind: "decimal_string" }
                                        }
                                      }
                                    }
                                  },
                                  tax: {
                                    kind: "nullable",
                                    inner: {
                                      kind: "object",
                                      fields: {
                                        local_amount_decimal: {
                                          kind: "nullable",
                                          inner: { kind: "decimal_string" }
                                        },
                                        national_amount_decimal: {
                                          kind: "nullable",
                                          inner: { kind: "decimal_string" }
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      },
                      fuel: {
                        kind: "nullable",
                        inner: {
                          kind: "object",
                          fields: {
                            quantity_decimal: {
                              kind: "nullable",
                              inner: { kind: "decimal_string" }
                            },
                            unit_cost_decimal: { kind: "decimal_string" }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });
  }
};

// ../node_modules/stripe/esm/resources/TestHelpers/Issuing/Authorizations.js
var AuthorizationResource2 = class extends StripeResource {
  static {
    __name(this, "AuthorizationResource");
  }
  /**
   * Create a test-mode authorization.
   */
  create(params, options) {
    return this._makeRequest("POST", "/v1/test_helpers/issuing/authorizations", params, options, {
      requestSchema: {
        kind: "object",
        fields: {
          fleet: {
            kind: "object",
            fields: {
              reported_breakdown: {
                kind: "object",
                fields: {
                  fuel: {
                    kind: "object",
                    fields: { gross_amount_decimal: { kind: "decimal_string" } }
                  },
                  non_fuel: {
                    kind: "object",
                    fields: { gross_amount_decimal: { kind: "decimal_string" } }
                  },
                  tax: {
                    kind: "object",
                    fields: {
                      local_amount_decimal: { kind: "decimal_string" },
                      national_amount_decimal: { kind: "decimal_string" }
                    }
                  }
                }
              }
            }
          },
          fuel: {
            kind: "object",
            fields: {
              quantity_decimal: { kind: "decimal_string" },
              unit_cost_decimal: { kind: "decimal_string" }
            }
          }
        }
      },
      responseSchema: {
        kind: "object",
        fields: {
          fleet: {
            kind: "nullable",
            inner: {
              kind: "object",
              fields: {
                reported_breakdown: {
                  kind: "nullable",
                  inner: {
                    kind: "object",
                    fields: {
                      fuel: {
                        kind: "nullable",
                        inner: {
                          kind: "object",
                          fields: {
                            gross_amount_decimal: {
                              kind: "nullable",
                              inner: { kind: "decimal_string" }
                            }
                          }
                        }
                      },
                      non_fuel: {
                        kind: "nullable",
                        inner: {
                          kind: "object",
                          fields: {
                            gross_amount_decimal: {
                              kind: "nullable",
                              inner: { kind: "decimal_string" }
                            }
                          }
                        }
                      },
                      tax: {
                        kind: "nullable",
                        inner: {
                          kind: "object",
                          fields: {
                            local_amount_decimal: {
                              kind: "nullable",
                              inner: { kind: "decimal_string" }
                            },
                            national_amount_decimal: {
                              kind: "nullable",
                              inner: { kind: "decimal_string" }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          fuel: {
            kind: "nullable",
            inner: {
              kind: "object",
              fields: {
                quantity_decimal: {
                  kind: "nullable",
                  inner: { kind: "decimal_string" }
                },
                unit_cost_decimal: {
                  kind: "nullable",
                  inner: { kind: "decimal_string" }
                }
              }
            }
          },
          transactions: {
            kind: "array",
            element: {
              kind: "object",
              fields: {
                purchase_details: {
                  kind: "nullable",
                  inner: {
                    kind: "object",
                    fields: {
                      fleet: {
                        kind: "nullable",
                        inner: {
                          kind: "object",
                          fields: {
                            reported_breakdown: {
                              kind: "nullable",
                              inner: {
                                kind: "object",
                                fields: {
                                  fuel: {
                                    kind: "nullable",
                                    inner: {
                                      kind: "object",
                                      fields: {
                                        gross_amount_decimal: {
                                          kind: "nullable",
                                          inner: { kind: "decimal_string" }
                                        }
                                      }
                                    }
                                  },
                                  non_fuel: {
                                    kind: "nullable",
                                    inner: {
                                      kind: "object",
                                      fields: {
                                        gross_amount_decimal: {
                                          kind: "nullable",
                                          inner: { kind: "decimal_string" }
                                        }
                                      }
                                    }
                                  },
                                  tax: {
                                    kind: "nullable",
                                    inner: {
                                      kind: "object",
                                      fields: {
                                        local_amount_decimal: {
                                          kind: "nullable",
                                          inner: { kind: "decimal_string" }
                                        },
                                        national_amount_decimal: {
                                          kind: "nullable",
                                          inner: { kind: "decimal_string" }
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      },
                      fuel: {
                        kind: "nullable",
                        inner: {
                          kind: "object",
                          fields: {
                            quantity_decimal: {
                              kind: "nullable",
                              inner: { kind: "decimal_string" }
                            },
                            unit_cost_decimal: { kind: "decimal_string" }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });
  }
  /**
   * Capture a test-mode authorization.
   */
  capture(id, params, options) {
    return this._makeRequest("POST", `/v1/test_helpers/issuing/authorizations/${id}/capture`, params, options, {
      requestSchema: {
        kind: "object",
        fields: {
          purchase_details: {
            kind: "object",
            fields: {
              fleet: {
                kind: "object",
                fields: {
                  reported_breakdown: {
                    kind: "object",
                    fields: {
                      fuel: {
                        kind: "object",
                        fields: {
                          gross_amount_decimal: { kind: "decimal_string" }
                        }
                      },
                      non_fuel: {
                        kind: "object",
                        fields: {
                          gross_amount_decimal: { kind: "decimal_string" }
                        }
                      },
                      tax: {
                        kind: "object",
                        fields: {
                          local_amount_decimal: { kind: "decimal_string" },
                          national_amount_decimal: { kind: "decimal_string" }
                        }
                      }
                    }
                  }
                }
              },
              fuel: {
                kind: "object",
                fields: {
                  quantity_decimal: { kind: "decimal_string" },
                  unit_cost_decimal: { kind: "decimal_string" }
                }
              },
              receipt: {
                kind: "array",
                element: {
                  kind: "object",
                  fields: { quantity: { kind: "decimal_string" } }
                }
              }
            }
          }
        }
      },
      responseSchema: {
        kind: "object",
        fields: {
          fleet: {
            kind: "nullable",
            inner: {
              kind: "object",
              fields: {
                reported_breakdown: {
                  kind: "nullable",
                  inner: {
                    kind: "object",
                    fields: {
                      fuel: {
                        kind: "nullable",
                        inner: {
                          kind: "object",
                          fields: {
                            gross_amount_decimal: {
                              kind: "nullable",
                              inner: { kind: "decimal_string" }
                            }
                          }
                        }
                      },
                      non_fuel: {
                        kind: "nullable",
                        inner: {
                          kind: "object",
                          fields: {
                            gross_amount_decimal: {
                              kind: "nullable",
                              inner: { kind: "decimal_string" }
                            }
                          }
                        }
                      },
                      tax: {
                        kind: "nullable",
                        inner: {
                          kind: "object",
                          fields: {
                            local_amount_decimal: {
                              kind: "nullable",
                              inner: { kind: "decimal_string" }
                            },
                            national_amount_decimal: {
                              kind: "nullable",
                              inner: { kind: "decimal_string" }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          fuel: {
            kind: "nullable",
            inner: {
              kind: "object",
              fields: {
                quantity_decimal: {
                  kind: "nullable",
                  inner: { kind: "decimal_string" }
                },
                unit_cost_decimal: {
                  kind: "nullable",
                  inner: { kind: "decimal_string" }
                }
              }
            }
          },
          transactions: {
            kind: "array",
            element: {
              kind: "object",
              fields: {
                purchase_details: {
                  kind: "nullable",
                  inner: {
                    kind: "object",
                    fields: {
                      fleet: {
                        kind: "nullable",
                        inner: {
                          kind: "object",
                          fields: {
                            reported_breakdown: {
                              kind: "nullable",
                              inner: {
                                kind: "object",
                                fields: {
                                  fuel: {
                                    kind: "nullable",
                                    inner: {
                                      kind: "object",
                                      fields: {
                                        gross_amount_decimal: {
                                          kind: "nullable",
                                          inner: { kind: "decimal_string" }
                                        }
                                      }
                                    }
                                  },
                                  non_fuel: {
                                    kind: "nullable",
                                    inner: {
                                      kind: "object",
                                      fields: {
                                        gross_amount_decimal: {
                                          kind: "nullable",
                                          inner: { kind: "decimal_string" }
                                        }
                                      }
                                    }
                                  },
                                  tax: {
                                    kind: "nullable",
                                    inner: {
                                      kind: "object",
                                      fields: {
                                        local_amount_decimal: {
                                          kind: "nullable",
                                          inner: { kind: "decimal_string" }
                                        },
                                        national_amount_decimal: {
                                          kind: "nullable",
                                          inner: { kind: "decimal_string" }
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      },
                      fuel: {
                        kind: "nullable",
                        inner: {
                          kind: "object",
                          fields: {
                            quantity_decimal: {
                              kind: "nullable",
                              inner: { kind: "decimal_string" }
                            },
                            unit_cost_decimal: { kind: "decimal_string" }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });
  }
  /**
   * Expire a test-mode Authorization.
   */
  expire(id, params, options) {
    return this._makeRequest("POST", `/v1/test_helpers/issuing/authorizations/${id}/expire`, params, options, {
      responseSchema: {
        kind: "object",
        fields: {
          fleet: {
            kind: "nullable",
            inner: {
              kind: "object",
              fields: {
                reported_breakdown: {
                  kind: "nullable",
                  inner: {
                    kind: "object",
                    fields: {
                      fuel: {
                        kind: "nullable",
                        inner: {
                          kind: "object",
                          fields: {
                            gross_amount_decimal: {
                              kind: "nullable",
                              inner: { kind: "decimal_string" }
                            }
                          }
                        }
                      },
                      non_fuel: {
                        kind: "nullable",
                        inner: {
                          kind: "object",
                          fields: {
                            gross_amount_decimal: {
                              kind: "nullable",
                              inner: { kind: "decimal_string" }
                            }
                          }
                        }
                      },
                      tax: {
                        kind: "nullable",
                        inner: {
                          kind: "object",
                          fields: {
                            local_amount_decimal: {
                              kind: "nullable",
                              inner: { kind: "decimal_string" }
                            },
                            national_amount_decimal: {
                              kind: "nullable",
                              inner: { kind: "decimal_string" }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          fuel: {
            kind: "nullable",
            inner: {
              kind: "object",
              fields: {
                quantity_decimal: {
                  kind: "nullable",
                  inner: { kind: "decimal_string" }
                },
                unit_cost_decimal: {
                  kind: "nullable",
                  inner: { kind: "decimal_string" }
                }
              }
            }
          },
          transactions: {
            kind: "array",
            element: {
              kind: "object",
              fields: {
                purchase_details: {
                  kind: "nullable",
                  inner: {
                    kind: "object",
                    fields: {
                      fleet: {
                        kind: "nullable",
                        inner: {
                          kind: "object",
                          fields: {
                            reported_breakdown: {
                              kind: "nullable",
                              inner: {
                                kind: "object",
                                fields: {
                                  fuel: {
                                    kind: "nullable",
                                    inner: {
                                      kind: "object",
                                      fields: {
                                        gross_amount_decimal: {
                                          kind: "nullable",
                                          inner: { kind: "decimal_string" }
                                        }
                                      }
                                    }
                                  },
                                  non_fuel: {
                                    kind: "nullable",
                                    inner: {
                                      kind: "object",
                                      fields: {
                                        gross_amount_decimal: {
                                          kind: "nullable",
                                          inner: { kind: "decimal_string" }
                                        }
                                      }
                                    }
                                  },
                                  tax: {
                                    kind: "nullable",
                                    inner: {
                                      kind: "object",
                                      fields: {
                                        local_amount_decimal: {
                                          kind: "nullable",
                                          inner: { kind: "decimal_string" }
                                        },
                                        national_amount_decimal: {
                                          kind: "nullable",
                                          inner: { kind: "decimal_string" }
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      },
                      fuel: {
                        kind: "nullable",
                        inner: {
                          kind: "object",
                          fields: {
                            quantity_decimal: {
                              kind: "nullable",
                              inner: { kind: "decimal_string" }
                            },
                            unit_cost_decimal: { kind: "decimal_string" }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });
  }
  /**
   * Finalize the amount on an Authorization prior to capture, when the initial authorization was for an estimated amount.
   */
  finalizeAmount(id, params, options) {
    return this._makeRequest("POST", `/v1/test_helpers/issuing/authorizations/${id}/finalize_amount`, params, options, {
      requestSchema: {
        kind: "object",
        fields: {
          fleet: {
            kind: "object",
            fields: {
              reported_breakdown: {
                kind: "object",
                fields: {
                  fuel: {
                    kind: "object",
                    fields: { gross_amount_decimal: { kind: "decimal_string" } }
                  },
                  non_fuel: {
                    kind: "object",
                    fields: { gross_amount_decimal: { kind: "decimal_string" } }
                  },
                  tax: {
                    kind: "object",
                    fields: {
                      local_amount_decimal: { kind: "decimal_string" },
                      national_amount_decimal: { kind: "decimal_string" }
                    }
                  }
                }
              }
            }
          },
          fuel: {
            kind: "object",
            fields: {
              quantity_decimal: { kind: "decimal_string" },
              unit_cost_decimal: { kind: "decimal_string" }
            }
          }
        }
      },
      responseSchema: {
        kind: "object",
        fields: {
          fleet: {
            kind: "nullable",
            inner: {
              kind: "object",
              fields: {
                reported_breakdown: {
                  kind: "nullable",
                  inner: {
                    kind: "object",
                    fields: {
                      fuel: {
                        kind: "nullable",
                        inner: {
                          kind: "object",
                          fields: {
                            gross_amount_decimal: {
                              kind: "nullable",
                              inner: { kind: "decimal_string" }
                            }
                          }
                        }
                      },
                      non_fuel: {
                        kind: "nullable",
                        inner: {
                          kind: "object",
                          fields: {
                            gross_amount_decimal: {
                              kind: "nullable",
                              inner: { kind: "decimal_string" }
                            }
                          }
                        }
                      },
                      tax: {
                        kind: "nullable",
                        inner: {
                          kind: "object",
                          fields: {
                            local_amount_decimal: {
                              kind: "nullable",
                              inner: { kind: "decimal_string" }
                            },
                            national_amount_decimal: {
                              kind: "nullable",
                              inner: { kind: "decimal_string" }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          fuel: {
            kind: "nullable",
            inner: {
              kind: "object",
              fields: {
                quantity_decimal: {
                  kind: "nullable",
                  inner: { kind: "decimal_string" }
                },
                unit_cost_decimal: {
                  kind: "nullable",
                  inner: { kind: "decimal_string" }
                }
              }
            }
          },
          transactions: {
            kind: "array",
            element: {
              kind: "object",
              fields: {
                purchase_details: {
                  kind: "nullable",
                  inner: {
                    kind: "object",
                    fields: {
                      fleet: {
                        kind: "nullable",
                        inner: {
                          kind: "object",
                          fields: {
                            reported_breakdown: {
                              kind: "nullable",
                              inner: {
                                kind: "object",
                                fields: {
                                  fuel: {
                                    kind: "nullable",
                                    inner: {
                                      kind: "object",
                                      fields: {
                                        gross_amount_decimal: {
                                          kind: "nullable",
                                          inner: { kind: "decimal_string" }
                                        }
                                      }
                                    }
                                  },
                                  non_fuel: {
                                    kind: "nullable",
                                    inner: {
                                      kind: "object",
                                      fields: {
                                        gross_amount_decimal: {
                                          kind: "nullable",
                                          inner: { kind: "decimal_string" }
                                        }
                                      }
                                    }
                                  },
                                  tax: {
                                    kind: "nullable",
                                    inner: {
                                      kind: "object",
                                      fields: {
                                        local_amount_decimal: {
                                          kind: "nullable",
                                          inner: { kind: "decimal_string" }
                                        },
                                        national_amount_decimal: {
                                          kind: "nullable",
                                          inner: { kind: "decimal_string" }
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      },
                      fuel: {
                        kind: "nullable",
                        inner: {
                          kind: "object",
                          fields: {
                            quantity_decimal: {
                              kind: "nullable",
                              inner: { kind: "decimal_string" }
                            },
                            unit_cost_decimal: { kind: "decimal_string" }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });
  }
  /**
   * Respond to a fraud challenge on a testmode Issuing authorization, simulating either a confirmation of fraud or a correction of legitimacy.
   */
  respond(id, params, options) {
    return this._makeRequest("POST", `/v1/test_helpers/issuing/authorizations/${id}/fraud_challenges/respond`, params, options, {
      responseSchema: {
        kind: "object",
        fields: {
          fleet: {
            kind: "nullable",
            inner: {
              kind: "object",
              fields: {
                reported_breakdown: {
                  kind: "nullable",
                  inner: {
                    kind: "object",
                    fields: {
                      fuel: {
                        kind: "nullable",
                        inner: {
                          kind: "object",
                          fields: {
                            gross_amount_decimal: {
                              kind: "nullable",
                              inner: { kind: "decimal_string" }
                            }
                          }
                        }
                      },
                      non_fuel: {
                        kind: "nullable",
                        inner: {
                          kind: "object",
                          fields: {
                            gross_amount_decimal: {
                              kind: "nullable",
                              inner: { kind: "decimal_string" }
                            }
                          }
                        }
                      },
                      tax: {
                        kind: "nullable",
                        inner: {
                          kind: "object",
                          fields: {
                            local_amount_decimal: {
                              kind: "nullable",
                              inner: { kind: "decimal_string" }
                            },
                            national_amount_decimal: {
                              kind: "nullable",
                              inner: { kind: "decimal_string" }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          fuel: {
            kind: "nullable",
            inner: {
              kind: "object",
              fields: {
                quantity_decimal: {
                  kind: "nullable",
                  inner: { kind: "decimal_string" }
                },
                unit_cost_decimal: {
                  kind: "nullable",
                  inner: { kind: "decimal_string" }
                }
              }
            }
          },
          transactions: {
            kind: "array",
            element: {
              kind: "object",
              fields: {
                purchase_details: {
                  kind: "nullable",
                  inner: {
                    kind: "object",
                    fields: {
                      fleet: {
                        kind: "nullable",
                        inner: {
                          kind: "object",
                          fields: {
                            reported_breakdown: {
                              kind: "nullable",
                              inner: {
                                kind: "object",
                                fields: {
                                  fuel: {
                                    kind: "nullable",
                                    inner: {
                                      kind: "object",
                                      fields: {
                                        gross_amount_decimal: {
                                          kind: "nullable",
                                          inner: { kind: "decimal_string" }
                                        }
                                      }
                                    }
                                  },
                                  non_fuel: {
                                    kind: "nullable",
                                    inner: {
                                      kind: "object",
                                      fields: {
                                        gross_amount_decimal: {
                                          kind: "nullable",
                                          inner: { kind: "decimal_string" }
                                        }
                                      }
                                    }
                                  },
                                  tax: {
                                    kind: "nullable",
                                    inner: {
                                      kind: "object",
                                      fields: {
                                        local_amount_decimal: {
                                          kind: "nullable",
                                          inner: { kind: "decimal_string" }
                                        },
                                        national_amount_decimal: {
                                          kind: "nullable",
                                          inner: { kind: "decimal_string" }
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      },
                      fuel: {
                        kind: "nullable",
                        inner: {
                          kind: "object",
                          fields: {
                            quantity_decimal: {
                              kind: "nullable",
                              inner: { kind: "decimal_string" }
                            },
                            unit_cost_decimal: { kind: "decimal_string" }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });
  }
  /**
   * Increment a test-mode Authorization.
   */
  increment(id, params, options) {
    return this._makeRequest("POST", `/v1/test_helpers/issuing/authorizations/${id}/increment`, params, options, {
      responseSchema: {
        kind: "object",
        fields: {
          fleet: {
            kind: "nullable",
            inner: {
              kind: "object",
              fields: {
                reported_breakdown: {
                  kind: "nullable",
                  inner: {
                    kind: "object",
                    fields: {
                      fuel: {
                        kind: "nullable",
                        inner: {
                          kind: "object",
                          fields: {
                            gross_amount_decimal: {
                              kind: "nullable",
                              inner: { kind: "decimal_string" }
                            }
                          }
                        }
                      },
                      non_fuel: {
                        kind: "nullable",
                        inner: {
                          kind: "object",
                          fields: {
                            gross_amount_decimal: {
                              kind: "nullable",
                              inner: { kind: "decimal_string" }
                            }
                          }
                        }
                      },
                      tax: {
                        kind: "nullable",
                        inner: {
                          kind: "object",
                          fields: {
                            local_amount_decimal: {
                              kind: "nullable",
                              inner: { kind: "decimal_string" }
                            },
                            national_amount_decimal: {
                              kind: "nullable",
                              inner: { kind: "decimal_string" }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          fuel: {
            kind: "nullable",
            inner: {
              kind: "object",
              fields: {
                quantity_decimal: {
                  kind: "nullable",
                  inner: { kind: "decimal_string" }
                },
                unit_cost_decimal: {
                  kind: "nullable",
                  inner: { kind: "decimal_string" }
                }
              }
            }
          },
          transactions: {
            kind: "array",
            element: {
              kind: "object",
              fields: {
                purchase_details: {
                  kind: "nullable",
                  inner: {
                    kind: "object",
                    fields: {
                      fleet: {
                        kind: "nullable",
                        inner: {
                          kind: "object",
                          fields: {
                            reported_breakdown: {
                              kind: "nullable",
                              inner: {
                                kind: "object",
                                fields: {
                                  fuel: {
                                    kind: "nullable",
                                    inner: {
                                      kind: "object",
                                      fields: {
                                        gross_amount_decimal: {
                                          kind: "nullable",
                                          inner: { kind: "decimal_string" }
                                        }
                                      }
                                    }
                                  },
                                  non_fuel: {
                                    kind: "nullable",
                                    inner: {
                                      kind: "object",
                                      fields: {
                                        gross_amount_decimal: {
                                          kind: "nullable",
                                          inner: { kind: "decimal_string" }
                                        }
                                      }
                                    }
                                  },
                                  tax: {
                                    kind: "nullable",
                                    inner: {
                                      kind: "object",
                                      fields: {
                                        local_amount_decimal: {
                                          kind: "nullable",
                                          inner: { kind: "decimal_string" }
                                        },
                                        national_amount_decimal: {
                                          kind: "nullable",
                                          inner: { kind: "decimal_string" }
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      },
                      fuel: {
                        kind: "nullable",
                        inner: {
                          kind: "object",
                          fields: {
                            quantity_decimal: {
                              kind: "nullable",
                              inner: { kind: "decimal_string" }
                            },
                            unit_cost_decimal: { kind: "decimal_string" }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });
  }
  /**
   * Reverse a test-mode Authorization.
   */
  reverse(id, params, options) {
    return this._makeRequest("POST", `/v1/test_helpers/issuing/authorizations/${id}/reverse`, params, options, {
      responseSchema: {
        kind: "object",
        fields: {
          fleet: {
            kind: "nullable",
            inner: {
              kind: "object",
              fields: {
                reported_breakdown: {
                  kind: "nullable",
                  inner: {
                    kind: "object",
                    fields: {
                      fuel: {
                        kind: "nullable",
                        inner: {
                          kind: "object",
                          fields: {
                            gross_amount_decimal: {
                              kind: "nullable",
                              inner: { kind: "decimal_string" }
                            }
                          }
                        }
                      },
                      non_fuel: {
                        kind: "nullable",
                        inner: {
                          kind: "object",
                          fields: {
                            gross_amount_decimal: {
                              kind: "nullable",
                              inner: { kind: "decimal_string" }
                            }
                          }
                        }
                      },
                      tax: {
                        kind: "nullable",
                        inner: {
                          kind: "object",
                          fields: {
                            local_amount_decimal: {
                              kind: "nullable",
                              inner: { kind: "decimal_string" }
                            },
                            national_amount_decimal: {
                              kind: "nullable",
                              inner: { kind: "decimal_string" }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          fuel: {
            kind: "nullable",
            inner: {
              kind: "object",
              fields: {
                quantity_decimal: {
                  kind: "nullable",
                  inner: { kind: "decimal_string" }
                },
                unit_cost_decimal: {
                  kind: "nullable",
                  inner: { kind: "decimal_string" }
                }
              }
            }
          },
          transactions: {
            kind: "array",
            element: {
              kind: "object",
              fields: {
                purchase_details: {
                  kind: "nullable",
                  inner: {
                    kind: "object",
                    fields: {
                      fleet: {
                        kind: "nullable",
                        inner: {
                          kind: "object",
                          fields: {
                            reported_breakdown: {
                              kind: "nullable",
                              inner: {
                                kind: "object",
                                fields: {
                                  fuel: {
                                    kind: "nullable",
                                    inner: {
                                      kind: "object",
                                      fields: {
                                        gross_amount_decimal: {
                                          kind: "nullable",
                                          inner: { kind: "decimal_string" }
                                        }
                                      }
                                    }
                                  },
                                  non_fuel: {
                                    kind: "nullable",
                                    inner: {
                                      kind: "object",
                                      fields: {
                                        gross_amount_decimal: {
                                          kind: "nullable",
                                          inner: { kind: "decimal_string" }
                                        }
                                      }
                                    }
                                  },
                                  tax: {
                                    kind: "nullable",
                                    inner: {
                                      kind: "object",
                                      fields: {
                                        local_amount_decimal: {
                                          kind: "nullable",
                                          inner: { kind: "decimal_string" }
                                        },
                                        national_amount_decimal: {
                                          kind: "nullable",
                                          inner: { kind: "decimal_string" }
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      },
                      fuel: {
                        kind: "nullable",
                        inner: {
                          kind: "object",
                          fields: {
                            quantity_decimal: {
                              kind: "nullable",
                              inner: { kind: "decimal_string" }
                            },
                            unit_cost_decimal: { kind: "decimal_string" }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });
  }
};

// ../node_modules/stripe/esm/resources/Tax/Calculations.js
var CalculationResource = class extends StripeResource {
  static {
    __name(this, "CalculationResource");
  }
  /**
   * Retrieves a Tax Calculation object, if the calculation hasn't expired.
   */
  retrieve(id, params, options) {
    return this._makeRequest("GET", `/v1/tax/calculations/${id}`, params, options);
  }
  /**
   * Calculates tax based on the input and returns a Tax Calculation object.
   */
  create(params, options) {
    return this._makeRequest("POST", "/v1/tax/calculations", params, options);
  }
  /**
   * Retrieves the line items of a tax calculation as a collection, if the calculation hasn't expired.
   */
  listLineItems(id, params, options) {
    return this._makeRequest("GET", `/v1/tax/calculations/${id}/line_items`, params, options, {
      methodType: "list"
    });
  }
};

// ../node_modules/stripe/esm/resources/Issuing/Cardholders.js
var CardholderResource = class extends StripeResource {
  static {
    __name(this, "CardholderResource");
  }
  /**
   * Returns a list of Issuing Cardholder objects. The objects are sorted in descending order by creation date, with the most recently created object appearing first.
   */
  list(params, options) {
    return this._makeRequest("GET", "/v1/issuing/cardholders", params, options, {
      methodType: "list"
    });
  }
  /**
   * Creates a new Issuing Cardholder object that can be issued cards.
   */
  create(params, options) {
    return this._makeRequest("POST", "/v1/issuing/cardholders", params, options);
  }
  /**
   * Retrieves an Issuing Cardholder object.
   */
  retrieve(id, params, options) {
    return this._makeRequest("GET", `/v1/issuing/cardholders/${id}`, params, options);
  }
  /**
   * Updates the specified Issuing Cardholder object by setting the values of the parameters passed. Any parameters not provided will be left unchanged.
   */
  update(id, params, options) {
    return this._makeRequest("POST", `/v1/issuing/cardholders/${id}`, params, options);
  }
};

// ../node_modules/stripe/esm/resources/Issuing/Cards.js
var CardResource = class extends StripeResource {
  static {
    __name(this, "CardResource");
  }
  /**
   * Returns a list of Issuing Card objects. The objects are sorted in descending order by creation date, with the most recently created object appearing first.
   */
  list(params, options) {
    return this._makeRequest("GET", "/v1/issuing/cards", params, options, {
      methodType: "list"
    });
  }
  /**
   * Creates an Issuing Card object.
   */
  create(params, options) {
    return this._makeRequest("POST", "/v1/issuing/cards", params, options);
  }
  /**
   * Retrieves an Issuing Card object.
   */
  retrieve(id, params, options) {
    return this._makeRequest("GET", `/v1/issuing/cards/${id}`, params, options);
  }
  /**
   * Updates the specified Issuing Card object by setting the values of the parameters passed. Any parameters not provided will be left unchanged.
   */
  update(id, params, options) {
    return this._makeRequest("POST", `/v1/issuing/cards/${id}`, params, options);
  }
};

// ../node_modules/stripe/esm/resources/TestHelpers/Issuing/Cards.js
var CardResource2 = class extends StripeResource {
  static {
    __name(this, "CardResource");
  }
  /**
   * Updates the shipping status of the specified Issuing Card object to delivered.
   */
  deliverCard(id, params, options) {
    return this._makeRequest("POST", `/v1/test_helpers/issuing/cards/${id}/shipping/deliver`, params, options);
  }
  /**
   * Updates the shipping status of the specified Issuing Card object to failure.
   */
  failCard(id, params, options) {
    return this._makeRequest("POST", `/v1/test_helpers/issuing/cards/${id}/shipping/fail`, params, options);
  }
  /**
   * Updates the shipping status of the specified Issuing Card object to returned.
   */
  returnCard(id, params, options) {
    return this._makeRequest("POST", `/v1/test_helpers/issuing/cards/${id}/shipping/return`, params, options);
  }
  /**
   * Updates the shipping status of the specified Issuing Card object to shipped.
   */
  shipCard(id, params, options) {
    return this._makeRequest("POST", `/v1/test_helpers/issuing/cards/${id}/shipping/ship`, params, options);
  }
  /**
   * Updates the shipping status of the specified Issuing Card object to submitted. This method requires Stripe Version ‘2024-09-30.acacia' or later.
   */
  submitCard(id, params, options) {
    return this._makeRequest("POST", `/v1/test_helpers/issuing/cards/${id}/shipping/submit`, params, options);
  }
};

// ../node_modules/stripe/esm/resources/BillingPortal/Configurations.js
var ConfigurationResource = class extends StripeResource {
  static {
    __name(this, "ConfigurationResource");
  }
  /**
   * Returns a list of configurations that describe the functionality of the customer portal.
   */
  list(params, options) {
    return this._makeRequest("GET", "/v1/billing_portal/configurations", params, options, {
      methodType: "list"
    });
  }
  /**
   * Creates a configuration that describes the functionality and behavior of a PortalSession
   */
  create(params, options) {
    return this._makeRequest("POST", "/v1/billing_portal/configurations", params, options);
  }
  /**
   * Retrieves a configuration that describes the functionality of the customer portal.
   */
  retrieve(id, params, options) {
    return this._makeRequest("GET", `/v1/billing_portal/configurations/${id}`, params, options);
  }
  /**
   * Updates a configuration that describes the functionality of the customer portal.
   */
  update(id, params, options) {
    return this._makeRequest("POST", `/v1/billing_portal/configurations/${id}`, params, options);
  }
};

// ../node_modules/stripe/esm/resources/Terminal/Configurations.js
var ConfigurationResource2 = class extends StripeResource {
  static {
    __name(this, "ConfigurationResource");
  }
  /**
   * Deletes a Configuration object.
   */
  del(id, params, options) {
    return this._makeRequest("DELETE", `/v1/terminal/configurations/${id}`, params, options);
  }
  /**
   * Retrieves a Configuration object.
   */
  retrieve(id, params, options) {
    return this._makeRequest("GET", `/v1/terminal/configurations/${id}`, params, options);
  }
  /**
   * Updates a new Configuration object.
   */
  update(id, params, options) {
    return this._makeRequest("POST", `/v1/terminal/configurations/${id}`, params, options);
  }
  /**
   * Returns a list of Configuration objects.
   */
  list(params, options) {
    return this._makeRequest("GET", "/v1/terminal/configurations", params, options, {
      methodType: "list"
    });
  }
  /**
   * Creates a new Configuration object.
   */
  create(params, options) {
    return this._makeRequest("POST", "/v1/terminal/configurations", params, options);
  }
};

// ../node_modules/stripe/esm/resources/TestHelpers/ConfirmationTokens.js
var ConfirmationTokenResource = class extends StripeResource {
  static {
    __name(this, "ConfirmationTokenResource");
  }
  /**
   * Creates a test mode Confirmation Token server side for your integration tests.
   */
  create(params, options) {
    return this._makeRequest("POST", "/v1/test_helpers/confirmation_tokens", params, options);
  }
};

// ../node_modules/stripe/esm/resources/Terminal/ConnectionTokens.js
var ConnectionTokenResource = class extends StripeResource {
  static {
    __name(this, "ConnectionTokenResource");
  }
  /**
   * To connect to a reader the Stripe Terminal SDK needs to retrieve a short-lived connection token from Stripe, proxied through your server. On your backend, add an endpoint that creates and returns a connection token.
   */
  create(params, options) {
    return this._makeRequest("POST", "/v1/terminal/connection_tokens", params, options);
  }
};

// ../node_modules/stripe/esm/resources/Billing/CreditBalanceSummary.js
var CreditBalanceSummaryResource = class extends StripeResource {
  static {
    __name(this, "CreditBalanceSummaryResource");
  }
  /**
   * Retrieves the credit balance summary for a customer.
   */
  retrieve(params, options) {
    return this._makeRequest("GET", "/v1/billing/credit_balance_summary", params, options);
  }
};

// ../node_modules/stripe/esm/resources/Billing/CreditBalanceTransactions.js
var CreditBalanceTransactionResource = class extends StripeResource {
  static {
    __name(this, "CreditBalanceTransactionResource");
  }
  /**
   * Retrieve a list of credit balance transactions.
   */
  list(params, options) {
    return this._makeRequest("GET", "/v1/billing/credit_balance_transactions", params, options, {
      methodType: "list"
    });
  }
  /**
   * Retrieves a credit balance transaction.
   */
  retrieve(id, params, options) {
    return this._makeRequest("GET", `/v1/billing/credit_balance_transactions/${id}`, params, options);
  }
};

// ../node_modules/stripe/esm/resources/Billing/CreditGrants.js
var CreditGrantResource = class extends StripeResource {
  static {
    __name(this, "CreditGrantResource");
  }
  /**
   * Retrieve a list of credit grants.
   */
  list(params, options) {
    return this._makeRequest("GET", "/v1/billing/credit_grants", params, options, {
      methodType: "list"
    });
  }
  /**
   * Creates a credit grant.
   */
  create(params, options) {
    return this._makeRequest("POST", "/v1/billing/credit_grants", params, options);
  }
  /**
   * Retrieves a credit grant.
   */
  retrieve(id, params, options) {
    return this._makeRequest("GET", `/v1/billing/credit_grants/${id}`, params, options);
  }
  /**
   * Updates a credit grant.
   */
  update(id, params, options) {
    return this._makeRequest("POST", `/v1/billing/credit_grants/${id}`, params, options);
  }
  /**
   * Expires a credit grant.
   */
  expire(id, params, options) {
    return this._makeRequest("POST", `/v1/billing/credit_grants/${id}/expire`, params, options);
  }
  /**
   * Voids a credit grant.
   */
  voidGrant(id, params, options) {
    return this._makeRequest("POST", `/v1/billing/credit_grants/${id}/void`, params, options);
  }
};

// ../node_modules/stripe/esm/resources/Treasury/CreditReversals.js
var CreditReversalResource = class extends StripeResource {
  static {
    __name(this, "CreditReversalResource");
  }
  /**
   * Returns a list of CreditReversals.
   */
  list(params, options) {
    return this._makeRequest("GET", "/v1/treasury/credit_reversals", params, options, {
      methodType: "list"
    });
  }
  /**
   * Reverses a ReceivedCredit and creates a CreditReversal object.
   */
  create(params, options) {
    return this._makeRequest("POST", "/v1/treasury/credit_reversals", params, options);
  }
  /**
   * Retrieves the details of an existing CreditReversal by passing the unique CreditReversal ID from either the CreditReversal creation request or CreditReversal list
   */
  retrieve(id, params, options) {
    return this._makeRequest("GET", `/v1/treasury/credit_reversals/${id}`, params, options);
  }
};

// ../node_modules/stripe/esm/resources/TestHelpers/Customers.js
var CustomerResource = class extends StripeResource {
  static {
    __name(this, "CustomerResource");
  }
  /**
   * Create an incoming testmode bank transfer
   */
  fundCashBalance(id, params, options) {
    return this._makeRequest("POST", `/v1/test_helpers/customers/${id}/fund_cash_balance`, params, options);
  }
};

// ../node_modules/stripe/esm/resources/Treasury/DebitReversals.js
var DebitReversalResource = class extends StripeResource {
  static {
    __name(this, "DebitReversalResource");
  }
  /**
   * Returns a list of DebitReversals.
   */
  list(params, options) {
    return this._makeRequest("GET", "/v1/treasury/debit_reversals", params, options, {
      methodType: "list"
    });
  }
  /**
   * Reverses a ReceivedDebit and creates a DebitReversal object.
   */
  create(params, options) {
    return this._makeRequest("POST", "/v1/treasury/debit_reversals", params, options);
  }
  /**
   * Retrieves a DebitReversal object.
   */
  retrieve(id, params, options) {
    return this._makeRequest("GET", `/v1/treasury/debit_reversals/${id}`, params, options);
  }
};

// ../node_modules/stripe/esm/resources/Issuing/Disputes.js
var DisputeResource = class extends StripeResource {
  static {
    __name(this, "DisputeResource");
  }
  /**
   * Returns a list of Issuing Dispute objects. The objects are sorted in descending order by creation date, with the most recently created object appearing first.
   */
  list(params, options) {
    return this._makeRequest("GET", "/v1/issuing/disputes", params, options, {
      methodType: "list"
    });
  }
  /**
   * Creates an Issuing Dispute object. Individual pieces of evidence within the evidence object are optional at this point. Stripe only validates that required evidence is present during submission. Refer to [Dispute reasons and evidence](https://docs.stripe.com/docs/issuing/purchases/disputes#dispute-reasons-and-evidence) for more details about evidence requirements.
   */
  create(params, options) {
    return this._makeRequest("POST", "/v1/issuing/disputes", params, options);
  }
  /**
   * Retrieves an Issuing Dispute object.
   */
  retrieve(id, params, options) {
    return this._makeRequest("GET", `/v1/issuing/disputes/${id}`, params, options);
  }
  /**
   * Updates the specified Issuing Dispute object by setting the values of the parameters passed. Any parameters not provided will be left unchanged. Properties on the evidence object can be unset by passing in an empty string.
   */
  update(id, params, options) {
    return this._makeRequest("POST", `/v1/issuing/disputes/${id}`, params, options);
  }
  /**
   * Submits an Issuing Dispute to the card network. Stripe validates that all evidence fields required for the dispute's reason are present. For more details, see [Dispute reasons and evidence](https://docs.stripe.com/docs/issuing/purchases/disputes#dispute-reasons-and-evidence).
   */
  submit(id, params, options) {
    return this._makeRequest("POST", `/v1/issuing/disputes/${id}/submit`, params, options);
  }
};

// ../node_modules/stripe/esm/resources/Radar/EarlyFraudWarnings.js
var EarlyFraudWarningResource = class extends StripeResource {
  static {
    __name(this, "EarlyFraudWarningResource");
  }
  /**
   * Returns a list of early fraud warnings.
   */
  list(params, options) {
    return this._makeRequest("GET", "/v1/radar/early_fraud_warnings", params, options, {
      methodType: "list"
    });
  }
  /**
   * Retrieves the details of an early fraud warning that has previously been created.
   *
   * Please refer to the [early fraud warning](https://docs.stripe.com/api#early_fraud_warning_object) object reference for more details.
   */
  retrieve(id, params, options) {
    return this._makeRequest("GET", `/v1/radar/early_fraud_warnings/${id}`, params, options);
  }
};

// ../node_modules/stripe/esm/resources/V2/Core/EventDestinations.js
var EventDestinationResource = class extends StripeResource {
  static {
    __name(this, "EventDestinationResource");
  }
  /**
   * Lists all event destinations.
   */
  list(params, options) {
    return this._makeRequest("GET", "/v2/core/event_destinations", params, options, {
      methodType: "list"
    });
  }
  /**
   * Create a new event destination.
   */
  create(params, options) {
    return this._makeRequest("POST", "/v2/core/event_destinations", params, options);
  }
  /**
   * Delete an event destination.
   */
  del(id, params, options) {
    return this._makeRequest("DELETE", `/v2/core/event_destinations/${id}`, params, options);
  }
  /**
   * Retrieves the details of an event destination.
   */
  retrieve(id, params, options) {
    return this._makeRequest("GET", `/v2/core/event_destinations/${id}`, params, options);
  }
  /**
   * Update the details of an event destination.
   */
  update(id, params, options) {
    return this._makeRequest("POST", `/v2/core/event_destinations/${id}`, params, options);
  }
  /**
   * Disable an event destination.
   */
  disable(id, params, options) {
    return this._makeRequest("POST", `/v2/core/event_destinations/${id}/disable`, params, options);
  }
  /**
   * Enable an event destination.
   */
  enable(id, params, options) {
    return this._makeRequest("POST", `/v2/core/event_destinations/${id}/enable`, params, options);
  }
  /**
   * Send a `ping` event to an event destination.
   */
  ping(id, params, options) {
    return this._makeRequest("POST", `/v2/core/event_destinations/${id}/ping`, params, options);
  }
};

// ../node_modules/stripe/esm/resources/V2/Core/Events.js
var EventResource = class extends StripeResource {
  static {
    __name(this, "EventResource");
  }
  /**
   * List events, going back up to 30 days.
   */
  list(params, options) {
    const transformResponseData = /* @__PURE__ */ __name((response) => {
      return {
        ...response,
        data: response.data.map(this.addFetchRelatedObjectIfNeeded.bind(this))
      };
    }, "transformResponseData");
    return this._makeRequest("GET", "/v2/core/events", params, options, {
      methodType: "list",
      transformResponseData
    });
  }
  /**
   * Retrieves the details of an event.
   */
  retrieve(id, params, options) {
    const transformResponseData = /* @__PURE__ */ __name((response) => {
      return this.addFetchRelatedObjectIfNeeded(response);
    }, "transformResponseData");
    return this._makeRequest("GET", `/v2/core/events/${id}`, params, options, {
      transformResponseData
    });
  }
  /**
   * @private
   *
   * For internal use in stripe-node.
   *
   * @param pulledEvent The retrieved event object
   * @returns The retrieved event object with a fetchRelatedObject method,
   * if pulledEvent.related_object is valid (non-null and has a url)
   */
  addFetchRelatedObjectIfNeeded(pulledEvent) {
    if (!pulledEvent.related_object || !pulledEvent.related_object.url) {
      return pulledEvent;
    }
    return {
      ...pulledEvent,
      fetchRelatedObject: /* @__PURE__ */ __name(() => this._makeRequest("GET", pulledEvent.related_object.url, void 0, {
        stripeContext: pulledEvent.context,
        headers: {
          "Stripe-Request-Trigger": `event=${pulledEvent.id}`
        }
      }), "fetchRelatedObject")
    };
  }
};

// ../node_modules/stripe/esm/resources/Entitlements/Features.js
var FeatureResource = class extends StripeResource {
  static {
    __name(this, "FeatureResource");
  }
  /**
   * Retrieve a list of features
   */
  list(params, options) {
    return this._makeRequest("GET", "/v1/entitlements/features", params, options, {
      methodType: "list"
    });
  }
  /**
   * Creates a feature
   */
  create(params, options) {
    return this._makeRequest("POST", "/v1/entitlements/features", params, options);
  }
  /**
   * Retrieves a feature
   */
  retrieve(id, params, options) {
    return this._makeRequest("GET", `/v1/entitlements/features/${id}`, params, options);
  }
  /**
   * Update a feature's metadata or permanently deactivate it.
   */
  update(id, params, options) {
    return this._makeRequest("POST", `/v1/entitlements/features/${id}`, params, options);
  }
};

// ../node_modules/stripe/esm/resources/Treasury/FinancialAccounts.js
var FinancialAccountResource = class extends StripeResource {
  static {
    __name(this, "FinancialAccountResource");
  }
  /**
   * Returns a list of FinancialAccounts.
   */
  list(params, options) {
    return this._makeRequest("GET", "/v1/treasury/financial_accounts", params, options, {
      methodType: "list"
    });
  }
  /**
   * Creates a new FinancialAccount. Each connected account can have up to three FinancialAccounts by default.
   */
  create(params, options) {
    return this._makeRequest("POST", "/v1/treasury/financial_accounts", params, options);
  }
  /**
   * Retrieves the details of a FinancialAccount.
   */
  retrieve(id, params, options) {
    return this._makeRequest("GET", `/v1/treasury/financial_accounts/${id}`, params, options);
  }
  /**
   * Updates the details of a FinancialAccount.
   */
  update(id, params, options) {
    return this._makeRequest("POST", `/v1/treasury/financial_accounts/${id}`, params, options);
  }
  /**
   * Closes a FinancialAccount. A FinancialAccount can only be closed if it has a zero balance, has no pending InboundTransfers, and has canceled all attached Issuing cards.
   */
  close(id, params, options) {
    return this._makeRequest("POST", `/v1/treasury/financial_accounts/${id}/close`, params, options);
  }
  /**
   * Updates the Features associated with a FinancialAccount.
   */
  updateFeatures(id, params, options) {
    return this._makeRequest("POST", `/v1/treasury/financial_accounts/${id}/features`, params, options);
  }
  /**
   * Retrieves Features information associated with the FinancialAccount.
   */
  retrieveFeatures(id, params, options) {
    return this._makeRequest("GET", `/v1/treasury/financial_accounts/${id}/features`, params, options);
  }
};

// ../node_modules/stripe/esm/resources/TestHelpers/Treasury/InboundTransfers.js
var InboundTransferResource = class extends StripeResource {
  static {
    __name(this, "InboundTransferResource");
  }
  /**
   * Transitions a test mode created InboundTransfer to the failed status. The InboundTransfer must already be in the processing state.
   */
  fail(id, params, options) {
    return this._makeRequest("POST", `/v1/test_helpers/treasury/inbound_transfers/${id}/fail`, params, options);
  }
  /**
   * Marks the test mode InboundTransfer object as returned and links the InboundTransfer to a ReceivedDebit. The InboundTransfer must already be in the succeeded state.
   */
  returnInboundTransfer(id, params, options) {
    return this._makeRequest("POST", `/v1/test_helpers/treasury/inbound_transfers/${id}/return`, params, options);
  }
  /**
   * Transitions a test mode created InboundTransfer to the succeeded status. The InboundTransfer must already be in the processing state.
   */
  succeed(id, params, options) {
    return this._makeRequest("POST", `/v1/test_helpers/treasury/inbound_transfers/${id}/succeed`, params, options);
  }
};

// ../node_modules/stripe/esm/resources/Treasury/InboundTransfers.js
var InboundTransferResource2 = class extends StripeResource {
  static {
    __name(this, "InboundTransferResource");
  }
  /**
   * Returns a list of InboundTransfers sent from the specified FinancialAccount.
   */
  list(params, options) {
    return this._makeRequest("GET", "/v1/treasury/inbound_transfers", params, options, {
      methodType: "list"
    });
  }
  /**
   * Creates an InboundTransfer.
   */
  create(params, options) {
    return this._makeRequest("POST", "/v1/treasury/inbound_transfers", params, options);
  }
  /**
   * Retrieves the details of an existing InboundTransfer.
   */
  retrieve(id, params, options) {
    return this._makeRequest("GET", `/v1/treasury/inbound_transfers/${id}`, params, options);
  }
  /**
   * Cancels an InboundTransfer.
   */
  cancel(id, params, options) {
    return this._makeRequest("POST", `/v1/treasury/inbound_transfers/${id}/cancel`, params, options);
  }
};

// ../node_modules/stripe/esm/resources/Terminal/Locations.js
var LocationResource = class extends StripeResource {
  static {
    __name(this, "LocationResource");
  }
  /**
   * Deletes a Location object.
   */
  del(id, params, options) {
    return this._makeRequest("DELETE", `/v1/terminal/locations/${id}`, params, options);
  }
  /**
   * Retrieves a Location object.
   */
  retrieve(id, params, options) {
    return this._makeRequest("GET", `/v1/terminal/locations/${id}`, params, options);
  }
  /**
   * Updates a Location object by setting the values of the parameters passed. Any parameters not provided will be left unchanged.
   */
  update(id, params, options) {
    return this._makeRequest("POST", `/v1/terminal/locations/${id}`, params, options);
  }
  /**
   * Returns a list of Location objects.
   */
  list(params, options) {
    return this._makeRequest("GET", "/v1/terminal/locations", params, options, {
      methodType: "list"
    });
  }
  /**
   * Creates a new Location object.
   * For further details, including which address fields are required in each country, see the [Manage locations](https://docs.stripe.com/docs/terminal/fleet/locations) guide.
   */
  create(params, options) {
    return this._makeRequest("POST", "/v1/terminal/locations", params, options);
  }
};

// ../node_modules/stripe/esm/resources/Billing/MeterEventAdjustments.js
var MeterEventAdjustmentResource = class extends StripeResource {
  static {
    __name(this, "MeterEventAdjustmentResource");
  }
  /**
   * Creates a billing meter event adjustment.
   */
  create(params, options) {
    return this._makeRequest("POST", "/v1/billing/meter_event_adjustments", params, options);
  }
};

// ../node_modules/stripe/esm/resources/V2/Billing/MeterEventAdjustments.js
var MeterEventAdjustmentResource2 = class extends StripeResource {
  static {
    __name(this, "MeterEventAdjustmentResource");
  }
  /**
   * Creates a meter event adjustment to cancel a previously sent meter event.
   */
  create(params, options) {
    return this._makeRequest("POST", "/v2/billing/meter_event_adjustments", params, options);
  }
};

// ../node_modules/stripe/esm/resources/V2/Billing/MeterEventSession.js
var MeterEventSessionResource = class extends StripeResource {
  static {
    __name(this, "MeterEventSessionResource");
  }
  /**
   * Creates a meter event session to send usage on the high-throughput meter event stream. Authentication tokens are only valid for 15 minutes, so you will need to create a new meter event session when your token expires.
   */
  create(params, options) {
    return this._makeRequest("POST", "/v2/billing/meter_event_session", params, options);
  }
};

// ../node_modules/stripe/esm/resources/V2/Billing/MeterEventStream.js
var MeterEventStreamResource = class extends StripeResource {
  static {
    __name(this, "MeterEventStreamResource");
  }
  /**
   * Creates meter events. Events are processed asynchronously, including validation. Requires a meter event session for authentication. Supports up to 10,000 requests per second in livemode. For even higher rate-limits, contact sales.
   * @throws Stripe.TemporarySessionExpiredError
   */
  create(params, options) {
    return this._makeRequest("POST", "/v2/billing/meter_event_stream", params, options, {
      apiBase: "meter_events"
    });
  }
};

// ../node_modules/stripe/esm/resources/Billing/MeterEvents.js
var MeterEventResource = class extends StripeResource {
  static {
    __name(this, "MeterEventResource");
  }
  /**
   * Creates a billing meter event.
   */
  create(params, options) {
    return this._makeRequest("POST", "/v1/billing/meter_events", params, options);
  }
};

// ../node_modules/stripe/esm/resources/V2/Billing/MeterEvents.js
var MeterEventResource2 = class extends StripeResource {
  static {
    __name(this, "MeterEventResource");
  }
  /**
   * Creates a meter event. Events are validated synchronously, but are processed asynchronously. Supports up to 1,000 events per second in livemode. For higher rate-limits, please use meter event streams instead.
   */
  create(params, options) {
    return this._makeRequest("POST", "/v2/billing/meter_events", params, options);
  }
};

// ../node_modules/stripe/esm/resources/Billing/Meters.js
var MeterResource = class extends StripeResource {
  static {
    __name(this, "MeterResource");
  }
  /**
   * Retrieve a list of billing meters.
   */
  list(params, options) {
    return this._makeRequest("GET", "/v1/billing/meters", params, options, {
      methodType: "list"
    });
  }
  /**
   * Creates a billing meter.
   */
  create(params, options) {
    return this._makeRequest("POST", "/v1/billing/meters", params, options);
  }
  /**
   * Retrieves a billing meter given an ID.
   */
  retrieve(id, params, options) {
    return this._makeRequest("GET", `/v1/billing/meters/${id}`, params, options);
  }
  /**
   * Updates a billing meter.
   */
  update(id, params, options) {
    return this._makeRequest("POST", `/v1/billing/meters/${id}`, params, options);
  }
  /**
   * When a meter is deactivated, no more meter events will be accepted for this meter. You can't attach a deactivated meter to a price.
   */
  deactivate(id, params, options) {
    return this._makeRequest("POST", `/v1/billing/meters/${id}/deactivate`, params, options);
  }
  /**
   * When a meter is reactivated, events for this meter can be accepted and you can attach the meter to a price.
   */
  reactivate(id, params, options) {
    return this._makeRequest("POST", `/v1/billing/meters/${id}/reactivate`, params, options);
  }
  /**
   * Retrieve a list of billing meter event summaries.
   */
  listEventSummaries(id, params, options) {
    return this._makeRequest("GET", `/v1/billing/meters/${id}/event_summaries`, params, options, {
      methodType: "list"
    });
  }
};

// ../node_modules/stripe/esm/resources/Terminal/OnboardingLinks.js
var OnboardingLinkResource = class extends StripeResource {
  static {
    __name(this, "OnboardingLinkResource");
  }
  /**
   * Creates a new OnboardingLink object that contains a redirect_url used for onboarding onto Tap to Pay on iPhone.
   */
  create(params, options) {
    return this._makeRequest("POST", "/v1/terminal/onboarding_links", params, options);
  }
};

// ../node_modules/stripe/esm/resources/Climate/Orders.js
var OrderResource = class extends StripeResource {
  static {
    __name(this, "OrderResource");
  }
  /**
   * Lists all Climate order objects. The orders are returned sorted by creation date, with the
   * most recently created orders appearing first.
   */
  list(params, options) {
    return this._makeRequest("GET", "/v1/climate/orders", params, options, {
      methodType: "list",
      responseSchema: {
        kind: "object",
        fields: {
          data: {
            kind: "array",
            element: {
              kind: "object",
              fields: { metric_tons: { kind: "decimal_string" } }
            }
          }
        }
      }
    });
  }
  /**
   * Creates a Climate order object for a given Climate product. The order will be processed immediately
   * after creation and payment will be deducted your Stripe balance.
   */
  create(params, options) {
    return this._makeRequest("POST", "/v1/climate/orders", params, options, {
      requestSchema: {
        kind: "object",
        fields: { metric_tons: { kind: "decimal_string" } }
      },
      responseSchema: {
        kind: "object",
        fields: { metric_tons: { kind: "decimal_string" } }
      }
    });
  }
  /**
   * Retrieves the details of a Climate order object with the given ID.
   */
  retrieve(id, params, options) {
    return this._makeRequest("GET", `/v1/climate/orders/${id}`, params, options, {
      responseSchema: {
        kind: "object",
        fields: { metric_tons: { kind: "decimal_string" } }
      }
    });
  }
  /**
   * Updates the specified order by setting the values of the parameters passed.
   */
  update(id, params, options) {
    return this._makeRequest("POST", `/v1/climate/orders/${id}`, params, options, {
      responseSchema: {
        kind: "object",
        fields: { metric_tons: { kind: "decimal_string" } }
      }
    });
  }
  /**
   * Cancels a Climate order. You can cancel an order within 24 hours of creation. Stripe refunds the
   * reservation amount_subtotal, but not the amount_fees for user-triggered cancellations. Frontier
   * might cancel reservations if suppliers fail to deliver. If Frontier cancels the reservation, Stripe
   * provides 90 days advance notice and refunds the amount_total.
   */
  cancel(id, params, options) {
    return this._makeRequest("POST", `/v1/climate/orders/${id}/cancel`, params, options, {
      responseSchema: {
        kind: "object",
        fields: { metric_tons: { kind: "decimal_string" } }
      }
    });
  }
};

// ../node_modules/stripe/esm/resources/TestHelpers/Treasury/OutboundPayments.js
var OutboundPaymentResource = class extends StripeResource {
  static {
    __name(this, "OutboundPaymentResource");
  }
  /**
   * Updates a test mode created OutboundPayment with tracking details. The OutboundPayment must not be cancelable, and cannot be in the canceled or failed states.
   */
  update(id, params, options) {
    return this._makeRequest("POST", `/v1/test_helpers/treasury/outbound_payments/${id}`, params, options);
  }
  /**
   * Transitions a test mode created OutboundPayment to the failed status. The OutboundPayment must already be in the processing state.
   */
  fail(id, params, options) {
    return this._makeRequest("POST", `/v1/test_helpers/treasury/outbound_payments/${id}/fail`, params, options);
  }
  /**
   * Transitions a test mode created OutboundPayment to the posted status. The OutboundPayment must already be in the processing state.
   */
  post(id, params, options) {
    return this._makeRequest("POST", `/v1/test_helpers/treasury/outbound_payments/${id}/post`, params, options);
  }
  /**
   * Transitions a test mode created OutboundPayment to the returned status. The OutboundPayment must already be in the processing state.
   */
  returnOutboundPayment(id, params, options) {
    return this._makeRequest("POST", `/v1/test_helpers/treasury/outbound_payments/${id}/return`, params, options);
  }
};

// ../node_modules/stripe/esm/resources/Treasury/OutboundPayments.js
var OutboundPaymentResource2 = class extends StripeResource {
  static {
    __name(this, "OutboundPaymentResource");
  }
  /**
   * Returns a list of OutboundPayments sent from the specified FinancialAccount.
   */
  list(params, options) {
    return this._makeRequest("GET", "/v1/treasury/outbound_payments", params, options, {
      methodType: "list"
    });
  }
  /**
   * Creates an OutboundPayment.
   */
  create(params, options) {
    return this._makeRequest("POST", "/v1/treasury/outbound_payments", params, options);
  }
  /**
   * Retrieves the details of an existing OutboundPayment by passing the unique OutboundPayment ID from either the OutboundPayment creation request or OutboundPayment list.
   */
  retrieve(id, params, options) {
    return this._makeRequest("GET", `/v1/treasury/outbound_payments/${id}`, params, options);
  }
  /**
   * Cancel an OutboundPayment.
   */
  cancel(id, params, options) {
    return this._makeRequest("POST", `/v1/treasury/outbound_payments/${id}/cancel`, params, options);
  }
};

// ../node_modules/stripe/esm/resources/TestHelpers/Treasury/OutboundTransfers.js
var OutboundTransferResource = class extends StripeResource {
  static {
    __name(this, "OutboundTransferResource");
  }
  /**
   * Updates a test mode created OutboundTransfer with tracking details. The OutboundTransfer must not be cancelable, and cannot be in the canceled or failed states.
   */
  update(id, params, options) {
    return this._makeRequest("POST", `/v1/test_helpers/treasury/outbound_transfers/${id}`, params, options);
  }
  /**
   * Transitions a test mode created OutboundTransfer to the failed status. The OutboundTransfer must already be in the processing state.
   */
  fail(id, params, options) {
    return this._makeRequest("POST", `/v1/test_helpers/treasury/outbound_transfers/${id}/fail`, params, options);
  }
  /**
   * Transitions a test mode created OutboundTransfer to the posted status. The OutboundTransfer must already be in the processing state.
   */
  post(id, params, options) {
    return this._makeRequest("POST", `/v1/test_helpers/treasury/outbound_transfers/${id}/post`, params, options);
  }
  /**
   * Transitions a test mode created OutboundTransfer to the returned status. The OutboundTransfer must already be in the processing state.
   */
  returnOutboundTransfer(id, params, options) {
    return this._makeRequest("POST", `/v1/test_helpers/treasury/outbound_transfers/${id}/return`, params, options);
  }
};

// ../node_modules/stripe/esm/resources/Treasury/OutboundTransfers.js
var OutboundTransferResource2 = class extends StripeResource {
  static {
    __name(this, "OutboundTransferResource");
  }
  /**
   * Returns a list of OutboundTransfers sent from the specified FinancialAccount.
   */
  list(params, options) {
    return this._makeRequest("GET", "/v1/treasury/outbound_transfers", params, options, {
      methodType: "list"
    });
  }
  /**
   * Creates an OutboundTransfer.
   */
  create(params, options) {
    return this._makeRequest("POST", "/v1/treasury/outbound_transfers", params, options);
  }
  /**
   * Retrieves the details of an existing OutboundTransfer by passing the unique OutboundTransfer ID from either the OutboundTransfer creation request or OutboundTransfer list.
   */
  retrieve(id, params, options) {
    return this._makeRequest("GET", `/v1/treasury/outbound_transfers/${id}`, params, options);
  }
  /**
   * An OutboundTransfer can be canceled if the funds have not yet been paid out.
   */
  cancel(id, params, options) {
    return this._makeRequest("POST", `/v1/treasury/outbound_transfers/${id}/cancel`, params, options);
  }
};

// ../node_modules/stripe/esm/resources/Radar/PaymentEvaluations.js
var PaymentEvaluationResource = class extends StripeResource {
  static {
    __name(this, "PaymentEvaluationResource");
  }
  /**
   * Request a Radar API fraud risk score from Stripe for a payment before sending it for external processor authorization.
   */
  create(params, options) {
    return this._makeRequest("POST", "/v1/radar/payment_evaluations", params, options);
  }
};

// ../node_modules/stripe/esm/resources/Issuing/PersonalizationDesigns.js
var PersonalizationDesignResource = class extends StripeResource {
  static {
    __name(this, "PersonalizationDesignResource");
  }
  /**
   * Returns a list of personalization design objects. The objects are sorted in descending order by creation date, with the most recently created object appearing first.
   */
  list(params, options) {
    return this._makeRequest("GET", "/v1/issuing/personalization_designs", params, options, {
      methodType: "list"
    });
  }
  /**
   * Creates a personalization design object.
   */
  create(params, options) {
    return this._makeRequest("POST", "/v1/issuing/personalization_designs", params, options);
  }
  /**
   * Retrieves a personalization design object.
   */
  retrieve(id, params, options) {
    return this._makeRequest("GET", `/v1/issuing/personalization_designs/${id}`, params, options);
  }
  /**
   * Updates a card personalization object.
   */
  update(id, params, options) {
    return this._makeRequest("POST", `/v1/issuing/personalization_designs/${id}`, params, options);
  }
};

// ../node_modules/stripe/esm/resources/TestHelpers/Issuing/PersonalizationDesigns.js
var PersonalizationDesignResource2 = class extends StripeResource {
  static {
    __name(this, "PersonalizationDesignResource");
  }
  /**
   * Updates the status of the specified testmode personalization design object to active.
   */
  activate(id, params, options) {
    return this._makeRequest("POST", `/v1/test_helpers/issuing/personalization_designs/${id}/activate`, params, options);
  }
  /**
   * Updates the status of the specified testmode personalization design object to inactive.
   */
  deactivate(id, params, options) {
    return this._makeRequest("POST", `/v1/test_helpers/issuing/personalization_designs/${id}/deactivate`, params, options);
  }
  /**
   * Updates the status of the specified testmode personalization design object to rejected.
   */
  reject(id, params, options) {
    return this._makeRequest("POST", `/v1/test_helpers/issuing/personalization_designs/${id}/reject`, params, options);
  }
};

// ../node_modules/stripe/esm/resources/Issuing/PhysicalBundles.js
var PhysicalBundleResource = class extends StripeResource {
  static {
    __name(this, "PhysicalBundleResource");
  }
  /**
   * Returns a list of physical bundle objects. The objects are sorted in descending order by creation date, with the most recently created object appearing first.
   */
  list(params, options) {
    return this._makeRequest("GET", "/v1/issuing/physical_bundles", params, options, {
      methodType: "list"
    });
  }
  /**
   * Retrieves a physical bundle object.
   */
  retrieve(id, params, options) {
    return this._makeRequest("GET", `/v1/issuing/physical_bundles/${id}`, params, options);
  }
};

// ../node_modules/stripe/esm/resources/Climate/Products.js
var ProductResource = class extends StripeResource {
  static {
    __name(this, "ProductResource");
  }
  /**
   * Lists all available Climate product objects.
   */
  list(params, options) {
    return this._makeRequest("GET", "/v1/climate/products", params, options, {
      methodType: "list",
      responseSchema: {
        kind: "object",
        fields: {
          data: {
            kind: "array",
            element: {
              kind: "object",
              fields: { metric_tons_available: { kind: "decimal_string" } }
            }
          }
        }
      }
    });
  }
  /**
   * Retrieves the details of a Climate product with the given ID.
   */
  retrieve(id, params, options) {
    return this._makeRequest("GET", `/v1/climate/products/${id}`, params, options, {
      responseSchema: {
        kind: "object",
        fields: { metric_tons_available: { kind: "decimal_string" } }
      }
    });
  }
};

// ../node_modules/stripe/esm/resources/Terminal/Readers.js
var ReaderResource = class extends StripeResource {
  static {
    __name(this, "ReaderResource");
  }
  /**
   * Deletes a Reader object.
   */
  del(id, params, options) {
    return this._makeRequest("DELETE", `/v1/terminal/readers/${id}`, params, options);
  }
  /**
   * Retrieves a Reader object.
   */
  retrieve(id, params, options) {
    return this._makeRequest("GET", `/v1/terminal/readers/${id}`, params, options);
  }
  /**
   * Updates a Reader object by setting the values of the parameters passed. Any parameters not provided will be left unchanged.
   */
  update(id, params, options) {
    return this._makeRequest("POST", `/v1/terminal/readers/${id}`, params, options);
  }
  /**
   * Returns a list of Reader objects.
   */
  list(params, options) {
    return this._makeRequest("GET", "/v1/terminal/readers", params, options, {
      methodType: "list"
    });
  }
  /**
   * Creates a new Reader object.
   */
  create(params, options) {
    return this._makeRequest("POST", "/v1/terminal/readers", params, options);
  }
  /**
   * Cancels the current reader action. See [Programmatic Cancellation](https://docs.stripe.com/docs/terminal/payments/collect-card-payment?terminal-sdk-platform=server-driven#programmatic-cancellation) for more details.
   */
  cancelAction(id, params, options) {
    return this._makeRequest("POST", `/v1/terminal/readers/${id}/cancel_action`, params, options);
  }
  /**
   * Initiates an [input collection flow](https://docs.stripe.com/docs/terminal/features/collect-inputs) on a Reader to display input forms and collect information from your customers.
   */
  collectInputs(id, params, options) {
    return this._makeRequest("POST", `/v1/terminal/readers/${id}/collect_inputs`, params, options);
  }
  /**
   * Initiates a payment flow on a Reader and updates the PaymentIntent with card details before manual confirmation. See [Collecting a Payment method](https://docs.stripe.com/docs/terminal/payments/collect-card-payment?terminal-sdk-platform=server-driven&process=inspect#collect-a-paymentmethod) for more details.
   */
  collectPaymentMethod(id, params, options) {
    return this._makeRequest("POST", `/v1/terminal/readers/${id}/collect_payment_method`, params, options);
  }
  /**
   * Finalizes a payment on a Reader. See [Confirming a Payment](https://docs.stripe.com/docs/terminal/payments/collect-card-payment?terminal-sdk-platform=server-driven&process=inspect#confirm-the-paymentintent) for more details.
   */
  confirmPaymentIntent(id, params, options) {
    return this._makeRequest("POST", `/v1/terminal/readers/${id}/confirm_payment_intent`, params, options);
  }
  /**
   * Initiates a payment flow on a Reader. See [process the payment](https://docs.stripe.com/docs/terminal/payments/collect-card-payment?terminal-sdk-platform=server-driven&process=immediately#process-payment) for more details.
   */
  processPaymentIntent(id, params, options) {
    return this._makeRequest("POST", `/v1/terminal/readers/${id}/process_payment_intent`, params, options);
  }
  /**
   * Initiates a SetupIntent flow on a Reader. See [Save directly without charging](https://docs.stripe.com/docs/terminal/features/saving-payment-details/save-directly) for more details.
   */
  processSetupIntent(id, params, options) {
    return this._makeRequest("POST", `/v1/terminal/readers/${id}/process_setup_intent`, params, options);
  }
  /**
   * Initiates an in-person refund on a Reader. See [Refund an Interac Payment](https://docs.stripe.com/docs/terminal/payments/regional?integration-country=CA#refund-an-interac-payment) for more details.
   */
  refundPayment(id, params, options) {
    return this._makeRequest("POST", `/v1/terminal/readers/${id}/refund_payment`, params, options);
  }
  /**
   * Sets the reader display to show [cart details](https://docs.stripe.com/docs/terminal/features/display).
   */
  setReaderDisplay(id, params, options) {
    return this._makeRequest("POST", `/v1/terminal/readers/${id}/set_reader_display`, params, options);
  }
};

// ../node_modules/stripe/esm/resources/TestHelpers/Terminal/Readers.js
var ReaderResource2 = class extends StripeResource {
  static {
    __name(this, "ReaderResource");
  }
  /**
   * Presents a payment method on a simulated reader. Can be used to simulate accepting a payment, saving a card or refunding a transaction.
   */
  presentPaymentMethod(id, params, options) {
    return this._makeRequest("POST", `/v1/test_helpers/terminal/readers/${id}/present_payment_method`, params, options);
  }
  /**
   * Use this endpoint to trigger a successful input collection on a simulated reader.
   */
  succeedInputCollection(id, params, options) {
    return this._makeRequest("POST", `/v1/test_helpers/terminal/readers/${id}/succeed_input_collection`, params, options);
  }
  /**
   * Use this endpoint to complete an input collection with a timeout error on a simulated reader.
   */
  timeoutInputCollection(id, params, options) {
    return this._makeRequest("POST", `/v1/test_helpers/terminal/readers/${id}/timeout_input_collection`, params, options);
  }
};

// ../node_modules/stripe/esm/resources/TestHelpers/Treasury/ReceivedCredits.js
var ReceivedCreditResource = class extends StripeResource {
  static {
    __name(this, "ReceivedCreditResource");
  }
  /**
   * Use this endpoint to simulate a test mode ReceivedCredit initiated by a third party. In live mode, you can't directly create ReceivedCredits initiated by third parties.
   */
  create(params, options) {
    return this._makeRequest("POST", "/v1/test_helpers/treasury/received_credits", params, options);
  }
};

// ../node_modules/stripe/esm/resources/Treasury/ReceivedCredits.js
var ReceivedCreditResource2 = class extends StripeResource {
  static {
    __name(this, "ReceivedCreditResource");
  }
  /**
   * Returns a list of ReceivedCredits.
   */
  list(params, options) {
    return this._makeRequest("GET", "/v1/treasury/received_credits", params, options, {
      methodType: "list"
    });
  }
  /**
   * Retrieves the details of an existing ReceivedCredit by passing the unique ReceivedCredit ID from the ReceivedCredit list.
   */
  retrieve(id, params, options) {
    return this._makeRequest("GET", `/v1/treasury/received_credits/${id}`, params, options);
  }
};

// ../node_modules/stripe/esm/resources/TestHelpers/Treasury/ReceivedDebits.js
var ReceivedDebitResource = class extends StripeResource {
  static {
    __name(this, "ReceivedDebitResource");
  }
  /**
   * Use this endpoint to simulate a test mode ReceivedDebit initiated by a third party. In live mode, you can't directly create ReceivedDebits initiated by third parties.
   */
  create(params, options) {
    return this._makeRequest("POST", "/v1/test_helpers/treasury/received_debits", params, options);
  }
};

// ../node_modules/stripe/esm/resources/Treasury/ReceivedDebits.js
var ReceivedDebitResource2 = class extends StripeResource {
  static {
    __name(this, "ReceivedDebitResource");
  }
  /**
   * Returns a list of ReceivedDebits.
   */
  list(params, options) {
    return this._makeRequest("GET", "/v1/treasury/received_debits", params, options, {
      methodType: "list"
    });
  }
  /**
   * Retrieves the details of an existing ReceivedDebit by passing the unique ReceivedDebit ID from the ReceivedDebit list
   */
  retrieve(id, params, options) {
    return this._makeRequest("GET", `/v1/treasury/received_debits/${id}`, params, options);
  }
};

// ../node_modules/stripe/esm/resources/TestHelpers/Refunds.js
var RefundResource = class extends StripeResource {
  static {
    __name(this, "RefundResource");
  }
  /**
   * Expire a refund with a status of requires_action.
   */
  expire(id, params, options) {
    return this._makeRequest("POST", `/v1/test_helpers/refunds/${id}/expire`, params, options);
  }
};

// ../node_modules/stripe/esm/resources/Tax/Registrations.js
var RegistrationResource = class extends StripeResource {
  static {
    __name(this, "RegistrationResource");
  }
  /**
   * Returns a list of Tax Registration objects.
   */
  list(params, options) {
    return this._makeRequest("GET", "/v1/tax/registrations", params, options, {
      methodType: "list"
    });
  }
  /**
   * Creates a new Tax Registration object.
   */
  create(params, options) {
    return this._makeRequest("POST", "/v1/tax/registrations", params, options);
  }
  /**
   * Returns a Tax Registration object.
   */
  retrieve(id, params, options) {
    return this._makeRequest("GET", `/v1/tax/registrations/${id}`, params, options);
  }
  /**
   * Updates an existing Tax Registration object.
   *
   * A registration cannot be deleted after it has been created. If you wish to end a registration you may do so by setting expires_at.
   */
  update(id, params, options) {
    return this._makeRequest("POST", `/v1/tax/registrations/${id}`, params, options);
  }
};

// ../node_modules/stripe/esm/resources/Reporting/ReportRuns.js
var ReportRunResource = class extends StripeResource {
  static {
    __name(this, "ReportRunResource");
  }
  /**
   * Returns a list of Report Runs, with the most recent appearing first.
   */
  list(params, options) {
    return this._makeRequest("GET", "/v1/reporting/report_runs", params, options, {
      methodType: "list"
    });
  }
  /**
   * Creates a new object and begin running the report. (Certain report types require a [live-mode API key](https://stripe.com/docs/keys#test-live-modes).)
   */
  create(params, options) {
    return this._makeRequest("POST", "/v1/reporting/report_runs", params, options);
  }
  /**
   * Retrieves the details of an existing Report Run.
   */
  retrieve(id, params, options) {
    return this._makeRequest("GET", `/v1/reporting/report_runs/${id}`, params, options);
  }
};

// ../node_modules/stripe/esm/resources/Reporting/ReportTypes.js
var ReportTypeResource = class extends StripeResource {
  static {
    __name(this, "ReportTypeResource");
  }
  /**
   * Returns a full list of Report Types.
   */
  list(params, options) {
    return this._makeRequest("GET", "/v1/reporting/report_types", params, options, {
      methodType: "list"
    });
  }
  /**
   * Retrieves the details of a Report Type. (Certain report types require a [live-mode API key](https://stripe.com/docs/keys#test-live-modes).)
   */
  retrieve(id, params, options) {
    return this._makeRequest("GET", `/v1/reporting/report_types/${id}`, params, options);
  }
};

// ../node_modules/stripe/esm/resources/Forwarding/Requests.js
var RequestResource = class extends StripeResource {
  static {
    __name(this, "RequestResource");
  }
  /**
   * Lists all ForwardingRequest objects.
   */
  list(params, options) {
    return this._makeRequest("GET", "/v1/forwarding/requests", params, options, {
      methodType: "list"
    });
  }
  /**
   * Creates a ForwardingRequest object.
   */
  create(params, options) {
    return this._makeRequest("POST", "/v1/forwarding/requests", params, options);
  }
  /**
   * Retrieves a ForwardingRequest object.
   */
  retrieve(id, params, options) {
    return this._makeRequest("GET", `/v1/forwarding/requests/${id}`, params, options);
  }
};

// ../node_modules/stripe/esm/resources/Sigma/ScheduledQueryRuns.js
var ScheduledQueryRunResource = class extends StripeResource {
  static {
    __name(this, "ScheduledQueryRunResource");
  }
  /**
   * Returns a list of scheduled query runs.
   */
  list(params, options) {
    return this._makeRequest("GET", "/v1/sigma/scheduled_query_runs", params, options, {
      methodType: "list"
    });
  }
  /**
   * Retrieves the details of an scheduled query run.
   */
  retrieve(id, params, options) {
    return this._makeRequest("GET", `/v1/sigma/scheduled_query_runs/${id}`, params, options);
  }
};

// ../node_modules/stripe/esm/resources/Apps/Secrets.js
var SecretResource = class extends StripeResource {
  static {
    __name(this, "SecretResource");
  }
  /**
   * List all secrets stored on the given scope.
   */
  list(params, options) {
    return this._makeRequest("GET", "/v1/apps/secrets", params, options, {
      methodType: "list"
    });
  }
  /**
   * Create or replace a secret in the secret store.
   */
  create(params, options) {
    return this._makeRequest("POST", "/v1/apps/secrets", params, options);
  }
  /**
   * Finds a secret in the secret store by name and scope.
   */
  find(params, options) {
    return this._makeRequest("GET", "/v1/apps/secrets/find", params, options);
  }
  /**
   * Deletes a secret from the secret store by name and scope.
   */
  deleteWhere(params, options) {
    return this._makeRequest("POST", "/v1/apps/secrets/delete", params, options);
  }
};

// ../node_modules/stripe/esm/resources/BillingPortal/Sessions.js
var SessionResource = class extends StripeResource {
  static {
    __name(this, "SessionResource");
  }
  /**
   * Creates a session of the customer portal.
   */
  create(params, options) {
    return this._makeRequest("POST", "/v1/billing_portal/sessions", params, options);
  }
};

// ../node_modules/stripe/esm/resources/Checkout/Sessions.js
var SessionResource2 = class extends StripeResource {
  static {
    __name(this, "SessionResource");
  }
  /**
   * Returns a list of Checkout Sessions.
   */
  list(params, options) {
    return this._makeRequest("GET", "/v1/checkout/sessions", params, options, {
      methodType: "list",
      responseSchema: {
        kind: "object",
        fields: {
          data: {
            kind: "array",
            element: {
              kind: "object",
              fields: {
                currency_conversion: {
                  kind: "nullable",
                  inner: {
                    kind: "object",
                    fields: { fx_rate: { kind: "decimal_string" } }
                  }
                },
                line_items: {
                  kind: "object",
                  fields: {
                    data: {
                      kind: "array",
                      element: {
                        kind: "object",
                        fields: {
                          price: {
                            kind: "nullable",
                            inner: {
                              kind: "object",
                              fields: {
                                currency_options: {
                                  kind: "array",
                                  element: {
                                    kind: "object",
                                    fields: {
                                      tiers: {
                                        kind: "array",
                                        element: {
                                          kind: "object",
                                          fields: {
                                            flat_amount_decimal: {
                                              kind: "nullable",
                                              inner: { kind: "decimal_string" }
                                            },
                                            unit_amount_decimal: {
                                              kind: "nullable",
                                              inner: { kind: "decimal_string" }
                                            }
                                          }
                                        }
                                      },
                                      unit_amount_decimal: {
                                        kind: "nullable",
                                        inner: { kind: "decimal_string" }
                                      }
                                    }
                                  }
                                },
                                tiers: {
                                  kind: "array",
                                  element: {
                                    kind: "object",
                                    fields: {
                                      flat_amount_decimal: {
                                        kind: "nullable",
                                        inner: { kind: "decimal_string" }
                                      },
                                      unit_amount_decimal: {
                                        kind: "nullable",
                                        inner: { kind: "decimal_string" }
                                      }
                                    }
                                  }
                                },
                                unit_amount_decimal: {
                                  kind: "nullable",
                                  inner: { kind: "decimal_string" }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });
  }
  /**
   * Creates a Checkout Session object.
   */
  create(params, options) {
    return this._makeRequest("POST", "/v1/checkout/sessions", params, options, {
      requestSchema: {
        kind: "object",
        fields: {
          line_items: {
            kind: "array",
            element: {
              kind: "object",
              fields: {
                price_data: {
                  kind: "object",
                  fields: { unit_amount_decimal: { kind: "decimal_string" } }
                }
              }
            }
          }
        }
      },
      responseSchema: {
        kind: "object",
        fields: {
          currency_conversion: {
            kind: "nullable",
            inner: {
              kind: "object",
              fields: { fx_rate: { kind: "decimal_string" } }
            }
          },
          line_items: {
            kind: "object",
            fields: {
              data: {
                kind: "array",
                element: {
                  kind: "object",
                  fields: {
                    price: {
                      kind: "nullable",
                      inner: {
                        kind: "object",
                        fields: {
                          currency_options: {
                            kind: "array",
                            element: {
                              kind: "object",
                              fields: {
                                tiers: {
                                  kind: "array",
                                  element: {
                                    kind: "object",
                                    fields: {
                                      flat_amount_decimal: {
                                        kind: "nullable",
                                        inner: { kind: "decimal_string" }
                                      },
                                      unit_amount_decimal: {
                                        kind: "nullable",
                                        inner: { kind: "decimal_string" }
                                      }
                                    }
                                  }
                                },
                                unit_amount_decimal: {
                                  kind: "nullable",
                                  inner: { kind: "decimal_string" }
                                }
                              }
                            }
                          },
                          tiers: {
                            kind: "array",
                            element: {
                              kind: "object",
                              fields: {
                                flat_amount_decimal: {
                                  kind: "nullable",
                                  inner: { kind: "decimal_string" }
                                },
                                unit_amount_decimal: {
                                  kind: "nullable",
                                  inner: { kind: "decimal_string" }
                                }
                              }
                            }
                          },
                          unit_amount_decimal: {
                            kind: "nullable",
                            inner: { kind: "decimal_string" }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });
  }
  /**
   * Retrieves a Checkout Session object.
   */
  retrieve(id, params, options) {
    return this._makeRequest("GET", `/v1/checkout/sessions/${id}`, params, options, {
      responseSchema: {
        kind: "object",
        fields: {
          currency_conversion: {
            kind: "nullable",
            inner: {
              kind: "object",
              fields: { fx_rate: { kind: "decimal_string" } }
            }
          },
          line_items: {
            kind: "object",
            fields: {
              data: {
                kind: "array",
                element: {
                  kind: "object",
                  fields: {
                    price: {
                      kind: "nullable",
                      inner: {
                        kind: "object",
                        fields: {
                          currency_options: {
                            kind: "array",
                            element: {
                              kind: "object",
                              fields: {
                                tiers: {
                                  kind: "array",
                                  element: {
                                    kind: "object",
                                    fields: {
                                      flat_amount_decimal: {
                                        kind: "nullable",
                                        inner: { kind: "decimal_string" }
                                      },
                                      unit_amount_decimal: {
                                        kind: "nullable",
                                        inner: { kind: "decimal_string" }
                                      }
                                    }
                                  }
                                },
                                unit_amount_decimal: {
                                  kind: "nullable",
                                  inner: { kind: "decimal_string" }
                                }
                              }
                            }
                          },
                          tiers: {
                            kind: "array",
                            element: {
                              kind: "object",
                              fields: {
                                flat_amount_decimal: {
                                  kind: "nullable",
                                  inner: { kind: "decimal_string" }
                                },
                                unit_amount_decimal: {
                                  kind: "nullable",
                                  inner: { kind: "decimal_string" }
                                }
                              }
                            }
                          },
                          unit_amount_decimal: {
                            kind: "nullable",
                            inner: { kind: "decimal_string" }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });
  }
  /**
   * Updates a Checkout Session object.
   *
   * Related guide: [Dynamically update a Checkout Session](https://docs.stripe.com/payments/advanced/dynamic-updates)
   */
  update(id, params, options) {
    return this._makeRequest("POST", `/v1/checkout/sessions/${id}`, params, options, {
      requestSchema: {
        kind: "object",
        fields: {
          line_items: {
            kind: "array",
            element: {
              kind: "object",
              fields: {
                price_data: {
                  kind: "object",
                  fields: { unit_amount_decimal: { kind: "decimal_string" } }
                }
              }
            }
          }
        }
      },
      responseSchema: {
        kind: "object",
        fields: {
          currency_conversion: {
            kind: "nullable",
            inner: {
              kind: "object",
              fields: { fx_rate: { kind: "decimal_string" } }
            }
          },
          line_items: {
            kind: "object",
            fields: {
              data: {
                kind: "array",
                element: {
                  kind: "object",
                  fields: {
                    price: {
                      kind: "nullable",
                      inner: {
                        kind: "object",
                        fields: {
                          currency_options: {
                            kind: "array",
                            element: {
                              kind: "object",
                              fields: {
                                tiers: {
                                  kind: "array",
                                  element: {
                                    kind: "object",
                                    fields: {
                                      flat_amount_decimal: {
                                        kind: "nullable",
                                        inner: { kind: "decimal_string" }
                                      },
                                      unit_amount_decimal: {
                                        kind: "nullable",
                                        inner: { kind: "decimal_string" }
                                      }
                                    }
                                  }
                                },
                                unit_amount_decimal: {
                                  kind: "nullable",
                                  inner: { kind: "decimal_string" }
                                }
                              }
                            }
                          },
                          tiers: {
                            kind: "array",
                            element: {
                              kind: "object",
                              fields: {
                                flat_amount_decimal: {
                                  kind: "nullable",
                                  inner: { kind: "decimal_string" }
                                },
                                unit_amount_decimal: {
                                  kind: "nullable",
                                  inner: { kind: "decimal_string" }
                                }
                              }
                            }
                          },
                          unit_amount_decimal: {
                            kind: "nullable",
                            inner: { kind: "decimal_string" }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });
  }
  /**
   * A Checkout Session can be expired when it is in one of these statuses: open
   *
   * After it expires, a customer can't complete a Checkout Session and customers loading the Checkout Session see a message saying the Checkout Session is expired.
   */
  expire(id, params, options) {
    return this._makeRequest("POST", `/v1/checkout/sessions/${id}/expire`, params, options, {
      responseSchema: {
        kind: "object",
        fields: {
          currency_conversion: {
            kind: "nullable",
            inner: {
              kind: "object",
              fields: { fx_rate: { kind: "decimal_string" } }
            }
          },
          line_items: {
            kind: "object",
            fields: {
              data: {
                kind: "array",
                element: {
                  kind: "object",
                  fields: {
                    price: {
                      kind: "nullable",
                      inner: {
                        kind: "object",
                        fields: {
                          currency_options: {
                            kind: "array",
                            element: {
                              kind: "object",
                              fields: {
                                tiers: {
                                  kind: "array",
                                  element: {
                                    kind: "object",
                                    fields: {
                                      flat_amount_decimal: {
                                        kind: "nullable",
                                        inner: { kind: "decimal_string" }
                                      },
                                      unit_amount_decimal: {
                                        kind: "nullable",
                                        inner: { kind: "decimal_string" }
                                      }
                                    }
                                  }
                                },
                                unit_amount_decimal: {
                                  kind: "nullable",
                                  inner: { kind: "decimal_string" }
                                }
                              }
                            }
                          },
                          tiers: {
                            kind: "array",
                            element: {
                              kind: "object",
                              fields: {
                                flat_amount_decimal: {
                                  kind: "nullable",
                                  inner: { kind: "decimal_string" }
                                },
                                unit_amount_decimal: {
                                  kind: "nullable",
                                  inner: { kind: "decimal_string" }
                                }
                              }
                            }
                          },
                          unit_amount_decimal: {
                            kind: "nullable",
                            inner: { kind: "decimal_string" }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });
  }
  /**
   * When retrieving a Checkout Session, there is an includable line_items property containing the first handful of those items. There is also a URL where you can retrieve the full (paginated) list of line items.
   */
  listLineItems(id, params, options) {
    return this._makeRequest("GET", `/v1/checkout/sessions/${id}/line_items`, params, options, {
      methodType: "list",
      responseSchema: {
        kind: "object",
        fields: {
          data: {
            kind: "array",
            element: {
              kind: "object",
              fields: {
                price: {
                  kind: "nullable",
                  inner: {
                    kind: "object",
                    fields: {
                      currency_options: {
                        kind: "array",
                        element: {
                          kind: "object",
                          fields: {
                            tiers: {
                              kind: "array",
                              element: {
                                kind: "object",
                                fields: {
                                  flat_amount_decimal: {
                                    kind: "nullable",
                                    inner: { kind: "decimal_string" }
                                  },
                                  unit_amount_decimal: {
                                    kind: "nullable",
                                    inner: { kind: "decimal_string" }
                                  }
                                }
                              }
                            },
                            unit_amount_decimal: {
                              kind: "nullable",
                              inner: { kind: "decimal_string" }
                            }
                          }
                        }
                      },
                      tiers: {
                        kind: "array",
                        element: {
                          kind: "object",
                          fields: {
                            flat_amount_decimal: {
                              kind: "nullable",
                              inner: { kind: "decimal_string" }
                            },
                            unit_amount_decimal: {
                              kind: "nullable",
                              inner: { kind: "decimal_string" }
                            }
                          }
                        }
                      },
                      unit_amount_decimal: {
                        kind: "nullable",
                        inner: { kind: "decimal_string" }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });
  }
};

// ../node_modules/stripe/esm/resources/FinancialConnections/Sessions.js
var SessionResource3 = class extends StripeResource {
  static {
    __name(this, "SessionResource");
  }
  /**
   * Retrieves the details of a Financial Connections Session
   */
  retrieve(id, params, options) {
    return this._makeRequest("GET", `/v1/financial_connections/sessions/${id}`, params, options);
  }
  /**
   * To launch the Financial Connections authorization flow, create a Session. The session's client_secret can be used to launch the flow using Stripe.js.
   */
  create(params, options) {
    return this._makeRequest("POST", "/v1/financial_connections/sessions", params, options);
  }
};

// ../node_modules/stripe/esm/resources/Tax/Settings.js
var SettingResource = class extends StripeResource {
  static {
    __name(this, "SettingResource");
  }
  /**
   * Retrieves Tax Settings for a merchant.
   */
  retrieve(params, options) {
    return this._makeRequest("GET", "/v1/tax/settings", params, options);
  }
  /**
   * Updates Tax Settings parameters used in tax calculations. All parameters are editable but none can be removed once set.
   */
  update(params, options) {
    return this._makeRequest("POST", "/v1/tax/settings", params, options);
  }
};

// ../node_modules/stripe/esm/resources/Climate/Suppliers.js
var SupplierResource = class extends StripeResource {
  static {
    __name(this, "SupplierResource");
  }
  /**
   * Lists all available Climate supplier objects.
   */
  list(params, options) {
    return this._makeRequest("GET", "/v1/climate/suppliers", params, options, {
      methodType: "list"
    });
  }
  /**
   * Retrieves a Climate supplier object.
   */
  retrieve(id, params, options) {
    return this._makeRequest("GET", `/v1/climate/suppliers/${id}`, params, options);
  }
};

// ../node_modules/stripe/esm/resources/TestHelpers/TestClocks.js
var TestClockResource = class extends StripeResource {
  static {
    __name(this, "TestClockResource");
  }
  /**
   * Deletes a test clock.
   */
  del(id, params, options) {
    return this._makeRequest("DELETE", `/v1/test_helpers/test_clocks/${id}`, params, options);
  }
  /**
   * Retrieves a test clock.
   */
  retrieve(id, params, options) {
    return this._makeRequest("GET", `/v1/test_helpers/test_clocks/${id}`, params, options);
  }
  /**
   * Returns a list of your test clocks.
   */
  list(params, options) {
    return this._makeRequest("GET", "/v1/test_helpers/test_clocks", params, options, {
      methodType: "list"
    });
  }
  /**
   * Creates a new test clock that can be attached to new customers and quotes.
   */
  create(params, options) {
    return this._makeRequest("POST", "/v1/test_helpers/test_clocks", params, options);
  }
  /**
   * Starts advancing a test clock to a specified time in the future. Advancement is done when status changes to Ready.
   */
  advance(id, params, options) {
    return this._makeRequest("POST", `/v1/test_helpers/test_clocks/${id}/advance`, params, options);
  }
};

// ../node_modules/stripe/esm/resources/Issuing/Tokens.js
var TokenResource = class extends StripeResource {
  static {
    __name(this, "TokenResource");
  }
  /**
   * Lists all Issuing Token objects for a given card.
   */
  list(params, options) {
    return this._makeRequest("GET", "/v1/issuing/tokens", params, options, {
      methodType: "list"
    });
  }
  /**
   * Retrieves an Issuing Token object.
   */
  retrieve(id, params, options) {
    return this._makeRequest("GET", `/v1/issuing/tokens/${id}`, params, options);
  }
  /**
   * Attempts to update the specified Issuing Token object to the status specified.
   */
  update(id, params, options) {
    return this._makeRequest("POST", `/v1/issuing/tokens/${id}`, params, options);
  }
};

// ../node_modules/stripe/esm/resources/Treasury/TransactionEntries.js
var TransactionEntryResource = class extends StripeResource {
  static {
    __name(this, "TransactionEntryResource");
  }
  /**
   * Retrieves a list of TransactionEntry objects.
   */
  list(params, options) {
    return this._makeRequest("GET", "/v1/treasury/transaction_entries", params, options, {
      methodType: "list",
      responseSchema: {
        kind: "object",
        fields: {
          data: {
            kind: "array",
            element: {
              kind: "object",
              fields: {
                flow_details: {
                  kind: "nullable",
                  inner: {
                    kind: "object",
                    fields: {
                      issuing_authorization: {
                        kind: "object",
                        fields: {
                          fleet: {
                            kind: "nullable",
                            inner: {
                              kind: "object",
                              fields: {
                                reported_breakdown: {
                                  kind: "nullable",
                                  inner: {
                                    kind: "object",
                                    fields: {
                                      fuel: {
                                        kind: "nullable",
                                        inner: {
                                          kind: "object",
                                          fields: {
                                            gross_amount_decimal: {
                                              kind: "nullable",
                                              inner: { kind: "decimal_string" }
                                            }
                                          }
                                        }
                                      },
                                      non_fuel: {
                                        kind: "nullable",
                                        inner: {
                                          kind: "object",
                                          fields: {
                                            gross_amount_decimal: {
                                              kind: "nullable",
                                              inner: { kind: "decimal_string" }
                                            }
                                          }
                                        }
                                      },
                                      tax: {
                                        kind: "nullable",
                                        inner: {
                                          kind: "object",
                                          fields: {
                                            local_amount_decimal: {
                                              kind: "nullable",
                                              inner: { kind: "decimal_string" }
                                            },
                                            national_amount_decimal: {
                                              kind: "nullable",
                                              inner: { kind: "decimal_string" }
                                            }
                                          }
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          },
                          fuel: {
                            kind: "nullable",
                            inner: {
                              kind: "object",
                              fields: {
                                quantity_decimal: {
                                  kind: "nullable",
                                  inner: { kind: "decimal_string" }
                                },
                                unit_cost_decimal: {
                                  kind: "nullable",
                                  inner: { kind: "decimal_string" }
                                }
                              }
                            }
                          },
                          transactions: {
                            kind: "array",
                            element: {
                              kind: "object",
                              fields: {
                                purchase_details: {
                                  kind: "nullable",
                                  inner: {
                                    kind: "object",
                                    fields: {
                                      fleet: {
                                        kind: "nullable",
                                        inner: {
                                          kind: "object",
                                          fields: {
                                            reported_breakdown: {
                                              kind: "nullable",
                                              inner: {
                                                kind: "object",
                                                fields: {
                                                  fuel: {
                                                    kind: "nullable",
                                                    inner: {
                                                      kind: "object",
                                                      fields: {
                                                        gross_amount_decimal: {
                                                          kind: "nullable",
                                                          inner: {
                                                            kind: "decimal_string"
                                                          }
                                                        }
                                                      }
                                                    }
                                                  },
                                                  non_fuel: {
                                                    kind: "nullable",
                                                    inner: {
                                                      kind: "object",
                                                      fields: {
                                                        gross_amount_decimal: {
                                                          kind: "nullable",
                                                          inner: {
                                                            kind: "decimal_string"
                                                          }
                                                        }
                                                      }
                                                    }
                                                  },
                                                  tax: {
                                                    kind: "nullable",
                                                    inner: {
                                                      kind: "object",
                                                      fields: {
                                                        local_amount_decimal: {
                                                          kind: "nullable",
                                                          inner: {
                                                            kind: "decimal_string"
                                                          }
                                                        },
                                                        national_amount_decimal: {
                                                          kind: "nullable",
                                                          inner: {
                                                            kind: "decimal_string"
                                                          }
                                                        }
                                                      }
                                                    }
                                                  }
                                                }
                                              }
                                            }
                                          }
                                        }
                                      },
                                      fuel: {
                                        kind: "nullable",
                                        inner: {
                                          kind: "object",
                                          fields: {
                                            quantity_decimal: {
                                              kind: "nullable",
                                              inner: { kind: "decimal_string" }
                                            },
                                            unit_cost_decimal: {
                                              kind: "decimal_string"
                                            }
                                          }
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });
  }
  /**
   * Retrieves a TransactionEntry object.
   */
  retrieve(id, params, options) {
    return this._makeRequest("GET", `/v1/treasury/transaction_entries/${id}`, params, options, {
      responseSchema: {
        kind: "object",
        fields: {
          flow_details: {
            kind: "nullable",
            inner: {
              kind: "object",
              fields: {
                issuing_authorization: {
                  kind: "object",
                  fields: {
                    fleet: {
                      kind: "nullable",
                      inner: {
                        kind: "object",
                        fields: {
                          reported_breakdown: {
                            kind: "nullable",
                            inner: {
                              kind: "object",
                              fields: {
                                fuel: {
                                  kind: "nullable",
                                  inner: {
                                    kind: "object",
                                    fields: {
                                      gross_amount_decimal: {
                                        kind: "nullable",
                                        inner: { kind: "decimal_string" }
                                      }
                                    }
                                  }
                                },
                                non_fuel: {
                                  kind: "nullable",
                                  inner: {
                                    kind: "object",
                                    fields: {
                                      gross_amount_decimal: {
                                        kind: "nullable",
                                        inner: { kind: "decimal_string" }
                                      }
                                    }
                                  }
                                },
                                tax: {
                                  kind: "nullable",
                                  inner: {
                                    kind: "object",
                                    fields: {
                                      local_amount_decimal: {
                                        kind: "nullable",
                                        inner: { kind: "decimal_string" }
                                      },
                                      national_amount_decimal: {
                                        kind: "nullable",
                                        inner: { kind: "decimal_string" }
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    },
                    fuel: {
                      kind: "nullable",
                      inner: {
                        kind: "object",
                        fields: {
                          quantity_decimal: {
                            kind: "nullable",
                            inner: { kind: "decimal_string" }
                          },
                          unit_cost_decimal: {
                            kind: "nullable",
                            inner: { kind: "decimal_string" }
                          }
                        }
                      }
                    },
                    transactions: {
                      kind: "array",
                      element: {
                        kind: "object",
                        fields: {
                          purchase_details: {
                            kind: "nullable",
                            inner: {
                              kind: "object",
                              fields: {
                                fleet: {
                                  kind: "nullable",
                                  inner: {
                                    kind: "object",
                                    fields: {
                                      reported_breakdown: {
                                        kind: "nullable",
                                        inner: {
                                          kind: "object",
                                          fields: {
                                            fuel: {
                                              kind: "nullable",
                                              inner: {
                                                kind: "object",
                                                fields: {
                                                  gross_amount_decimal: {
                                                    kind: "nullable",
                                                    inner: {
                                                      kind: "decimal_string"
                                                    }
                                                  }
                                                }
                                              }
                                            },
                                            non_fuel: {
                                              kind: "nullable",
                                              inner: {
                                                kind: "object",
                                                fields: {
                                                  gross_amount_decimal: {
                                                    kind: "nullable",
                                                    inner: {
                                                      kind: "decimal_string"
                                                    }
                                                  }
                                                }
                                              }
                                            },
                                            tax: {
                                              kind: "nullable",
                                              inner: {
                                                kind: "object",
                                                fields: {
                                                  local_amount_decimal: {
                                                    kind: "nullable",
                                                    inner: {
                                                      kind: "decimal_string"
                                                    }
                                                  },
                                                  national_amount_decimal: {
                                                    kind: "nullable",
                                                    inner: {
                                                      kind: "decimal_string"
                                                    }
                                                  }
                                                }
                                              }
                                            }
                                          }
                                        }
                                      }
                                    }
                                  }
                                },
                                fuel: {
                                  kind: "nullable",
                                  inner: {
                                    kind: "object",
                                    fields: {
                                      quantity_decimal: {
                                        kind: "nullable",
                                        inner: { kind: "decimal_string" }
                                      },
                                      unit_cost_decimal: {
                                        kind: "decimal_string"
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });
  }
};

// ../node_modules/stripe/esm/resources/FinancialConnections/Transactions.js
var TransactionResource = class extends StripeResource {
  static {
    __name(this, "TransactionResource");
  }
  /**
   * Returns a list of Financial Connections Transaction objects.
   */
  list(params, options) {
    return this._makeRequest("GET", "/v1/financial_connections/transactions", params, options, {
      methodType: "list"
    });
  }
  /**
   * Retrieves the details of a Financial Connections Transaction
   */
  retrieve(id, params, options) {
    return this._makeRequest("GET", `/v1/financial_connections/transactions/${id}`, params, options);
  }
};

// ../node_modules/stripe/esm/resources/Issuing/Transactions.js
var TransactionResource2 = class extends StripeResource {
  static {
    __name(this, "TransactionResource");
  }
  /**
   * Returns a list of Issuing Transaction objects. The objects are sorted in descending order by creation date, with the most recently created object appearing first.
   */
  list(params, options) {
    return this._makeRequest("GET", "/v1/issuing/transactions", params, options, {
      methodType: "list",
      responseSchema: {
        kind: "object",
        fields: {
          data: {
            kind: "array",
            element: {
              kind: "object",
              fields: {
                purchase_details: {
                  kind: "nullable",
                  inner: {
                    kind: "object",
                    fields: {
                      fleet: {
                        kind: "nullable",
                        inner: {
                          kind: "object",
                          fields: {
                            reported_breakdown: {
                              kind: "nullable",
                              inner: {
                                kind: "object",
                                fields: {
                                  fuel: {
                                    kind: "nullable",
                                    inner: {
                                      kind: "object",
                                      fields: {
                                        gross_amount_decimal: {
                                          kind: "nullable",
                                          inner: { kind: "decimal_string" }
                                        }
                                      }
                                    }
                                  },
                                  non_fuel: {
                                    kind: "nullable",
                                    inner: {
                                      kind: "object",
                                      fields: {
                                        gross_amount_decimal: {
                                          kind: "nullable",
                                          inner: { kind: "decimal_string" }
                                        }
                                      }
                                    }
                                  },
                                  tax: {
                                    kind: "nullable",
                                    inner: {
                                      kind: "object",
                                      fields: {
                                        local_amount_decimal: {
                                          kind: "nullable",
                                          inner: { kind: "decimal_string" }
                                        },
                                        national_amount_decimal: {
                                          kind: "nullable",
                                          inner: { kind: "decimal_string" }
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      },
                      fuel: {
                        kind: "nullable",
                        inner: {
                          kind: "object",
                          fields: {
                            quantity_decimal: {
                              kind: "nullable",
                              inner: { kind: "decimal_string" }
                            },
                            unit_cost_decimal: { kind: "decimal_string" }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });
  }
  /**
   * Retrieves an Issuing Transaction object.
   */
  retrieve(id, params, options) {
    return this._makeRequest("GET", `/v1/issuing/transactions/${id}`, params, options, {
      responseSchema: {
        kind: "object",
        fields: {
          purchase_details: {
            kind: "nullable",
            inner: {
              kind: "object",
              fields: {
                fleet: {
                  kind: "nullable",
                  inner: {
                    kind: "object",
                    fields: {
                      reported_breakdown: {
                        kind: "nullable",
                        inner: {
                          kind: "object",
                          fields: {
                            fuel: {
                              kind: "nullable",
                              inner: {
                                kind: "object",
                                fields: {
                                  gross_amount_decimal: {
                                    kind: "nullable",
                                    inner: { kind: "decimal_string" }
                                  }
                                }
                              }
                            },
                            non_fuel: {
                              kind: "nullable",
                              inner: {
                                kind: "object",
                                fields: {
                                  gross_amount_decimal: {
                                    kind: "nullable",
                                    inner: { kind: "decimal_string" }
                                  }
                                }
                              }
                            },
                            tax: {
                              kind: "nullable",
                              inner: {
                                kind: "object",
                                fields: {
                                  local_amount_decimal: {
                                    kind: "nullable",
                                    inner: { kind: "decimal_string" }
                                  },
                                  national_amount_decimal: {
                                    kind: "nullable",
                                    inner: { kind: "decimal_string" }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                },
                fuel: {
                  kind: "nullable",
                  inner: {
                    kind: "object",
                    fields: {
                      quantity_decimal: {
                        kind: "nullable",
                        inner: { kind: "decimal_string" }
                      },
                      unit_cost_decimal: { kind: "decimal_string" }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });
  }
  /**
   * Updates the specified Issuing Transaction object by setting the values of the parameters passed. Any parameters not provided will be left unchanged.
   */
  update(id, params, options) {
    return this._makeRequest("POST", `/v1/issuing/transactions/${id}`, params, options, {
      responseSchema: {
        kind: "object",
        fields: {
          purchase_details: {
            kind: "nullable",
            inner: {
              kind: "object",
              fields: {
                fleet: {
                  kind: "nullable",
                  inner: {
                    kind: "object",
                    fields: {
                      reported_breakdown: {
                        kind: "nullable",
                        inner: {
                          kind: "object",
                          fields: {
                            fuel: {
                              kind: "nullable",
                              inner: {
                                kind: "object",
                                fields: {
                                  gross_amount_decimal: {
                                    kind: "nullable",
                                    inner: { kind: "decimal_string" }
                                  }
                                }
                              }
                            },
                            non_fuel: {
                              kind: "nullable",
                              inner: {
                                kind: "object",
                                fields: {
                                  gross_amount_decimal: {
                                    kind: "nullable",
                                    inner: { kind: "decimal_string" }
                                  }
                                }
                              }
                            },
                            tax: {
                              kind: "nullable",
                              inner: {
                                kind: "object",
                                fields: {
                                  local_amount_decimal: {
                                    kind: "nullable",
                                    inner: { kind: "decimal_string" }
                                  },
                                  national_amount_decimal: {
                                    kind: "nullable",
                                    inner: { kind: "decimal_string" }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                },
                fuel: {
                  kind: "nullable",
                  inner: {
                    kind: "object",
                    fields: {
                      quantity_decimal: {
                        kind: "nullable",
                        inner: { kind: "decimal_string" }
                      },
                      unit_cost_decimal: { kind: "decimal_string" }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });
  }
};

// ../node_modules/stripe/esm/resources/Tax/Transactions.js
var TransactionResource3 = class extends StripeResource {
  static {
    __name(this, "TransactionResource");
  }
  /**
   * Retrieves a Tax Transaction object.
   */
  retrieve(id, params, options) {
    return this._makeRequest("GET", `/v1/tax/transactions/${id}`, params, options);
  }
  /**
   * Creates a Tax Transaction from a calculation, if that calculation hasn't expired. Calculations expire after 90 days.
   */
  createFromCalculation(params, options) {
    return this._makeRequest("POST", "/v1/tax/transactions/create_from_calculation", params, options);
  }
  /**
   * Partially or fully reverses a previously created Transaction.
   */
  createReversal(params, options) {
    return this._makeRequest("POST", "/v1/tax/transactions/create_reversal", params, options);
  }
  /**
   * Retrieves the line items of a committed standalone transaction as a collection.
   */
  listLineItems(id, params, options) {
    return this._makeRequest("GET", `/v1/tax/transactions/${id}/line_items`, params, options, {
      methodType: "list"
    });
  }
};

// ../node_modules/stripe/esm/resources/TestHelpers/Issuing/Transactions.js
var TransactionResource4 = class extends StripeResource {
  static {
    __name(this, "TransactionResource");
  }
  /**
   * Refund a test-mode Transaction.
   */
  refund(id, params, options) {
    return this._makeRequest("POST", `/v1/test_helpers/issuing/transactions/${id}/refund`, params, options, {
      responseSchema: {
        kind: "object",
        fields: {
          purchase_details: {
            kind: "nullable",
            inner: {
              kind: "object",
              fields: {
                fleet: {
                  kind: "nullable",
                  inner: {
                    kind: "object",
                    fields: {
                      reported_breakdown: {
                        kind: "nullable",
                        inner: {
                          kind: "object",
                          fields: {
                            fuel: {
                              kind: "nullable",
                              inner: {
                                kind: "object",
                                fields: {
                                  gross_amount_decimal: {
                                    kind: "nullable",
                                    inner: { kind: "decimal_string" }
                                  }
                                }
                              }
                            },
                            non_fuel: {
                              kind: "nullable",
                              inner: {
                                kind: "object",
                                fields: {
                                  gross_amount_decimal: {
                                    kind: "nullable",
                                    inner: { kind: "decimal_string" }
                                  }
                                }
                              }
                            },
                            tax: {
                              kind: "nullable",
                              inner: {
                                kind: "object",
                                fields: {
                                  local_amount_decimal: {
                                    kind: "nullable",
                                    inner: { kind: "decimal_string" }
                                  },
                                  national_amount_decimal: {
                                    kind: "nullable",
                                    inner: { kind: "decimal_string" }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                },
                fuel: {
                  kind: "nullable",
                  inner: {
                    kind: "object",
                    fields: {
                      quantity_decimal: {
                        kind: "nullable",
                        inner: { kind: "decimal_string" }
                      },
                      unit_cost_decimal: { kind: "decimal_string" }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });
  }
  /**
   * Allows the user to capture an arbitrary amount, also known as a forced capture.
   */
  createForceCapture(params, options) {
    return this._makeRequest("POST", "/v1/test_helpers/issuing/transactions/create_force_capture", params, options, {
      requestSchema: {
        kind: "object",
        fields: {
          purchase_details: {
            kind: "object",
            fields: {
              fleet: {
                kind: "object",
                fields: {
                  reported_breakdown: {
                    kind: "object",
                    fields: {
                      fuel: {
                        kind: "object",
                        fields: {
                          gross_amount_decimal: { kind: "decimal_string" }
                        }
                      },
                      non_fuel: {
                        kind: "object",
                        fields: {
                          gross_amount_decimal: { kind: "decimal_string" }
                        }
                      },
                      tax: {
                        kind: "object",
                        fields: {
                          local_amount_decimal: { kind: "decimal_string" },
                          national_amount_decimal: { kind: "decimal_string" }
                        }
                      }
                    }
                  }
                }
              },
              fuel: {
                kind: "object",
                fields: {
                  quantity_decimal: { kind: "decimal_string" },
                  unit_cost_decimal: { kind: "decimal_string" }
                }
              },
              receipt: {
                kind: "array",
                element: {
                  kind: "object",
                  fields: { quantity: { kind: "decimal_string" } }
                }
              }
            }
          }
        }
      },
      responseSchema: {
        kind: "object",
        fields: {
          purchase_details: {
            kind: "nullable",
            inner: {
              kind: "object",
              fields: {
                fleet: {
                  kind: "nullable",
                  inner: {
                    kind: "object",
                    fields: {
                      reported_breakdown: {
                        kind: "nullable",
                        inner: {
                          kind: "object",
                          fields: {
                            fuel: {
                              kind: "nullable",
                              inner: {
                                kind: "object",
                                fields: {
                                  gross_amount_decimal: {
                                    kind: "nullable",
                                    inner: { kind: "decimal_string" }
                                  }
                                }
                              }
                            },
                            non_fuel: {
                              kind: "nullable",
                              inner: {
                                kind: "object",
                                fields: {
                                  gross_amount_decimal: {
                                    kind: "nullable",
                                    inner: { kind: "decimal_string" }
                                  }
                                }
                              }
                            },
                            tax: {
                              kind: "nullable",
                              inner: {
                                kind: "object",
                                fields: {
                                  local_amount_decimal: {
                                    kind: "nullable",
                                    inner: { kind: "decimal_string" }
                                  },
                                  national_amount_decimal: {
                                    kind: "nullable",
                                    inner: { kind: "decimal_string" }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                },
                fuel: {
                  kind: "nullable",
                  inner: {
                    kind: "object",
                    fields: {
                      quantity_decimal: {
                        kind: "nullable",
                        inner: { kind: "decimal_string" }
                      },
                      unit_cost_decimal: { kind: "decimal_string" }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });
  }
  /**
   * Allows the user to refund an arbitrary amount, also known as a unlinked refund.
   */
  createUnlinkedRefund(params, options) {
    return this._makeRequest("POST", "/v1/test_helpers/issuing/transactions/create_unlinked_refund", params, options, {
      requestSchema: {
        kind: "object",
        fields: {
          purchase_details: {
            kind: "object",
            fields: {
              fleet: {
                kind: "object",
                fields: {
                  reported_breakdown: {
                    kind: "object",
                    fields: {
                      fuel: {
                        kind: "object",
                        fields: {
                          gross_amount_decimal: { kind: "decimal_string" }
                        }
                      },
                      non_fuel: {
                        kind: "object",
                        fields: {
                          gross_amount_decimal: { kind: "decimal_string" }
                        }
                      },
                      tax: {
                        kind: "object",
                        fields: {
                          local_amount_decimal: { kind: "decimal_string" },
                          national_amount_decimal: { kind: "decimal_string" }
                        }
                      }
                    }
                  }
                }
              },
              fuel: {
                kind: "object",
                fields: {
                  quantity_decimal: { kind: "decimal_string" },
                  unit_cost_decimal: { kind: "decimal_string" }
                }
              },
              receipt: {
                kind: "array",
                element: {
                  kind: "object",
                  fields: { quantity: { kind: "decimal_string" } }
                }
              }
            }
          }
        }
      },
      responseSchema: {
        kind: "object",
        fields: {
          purchase_details: {
            kind: "nullable",
            inner: {
              kind: "object",
              fields: {
                fleet: {
                  kind: "nullable",
                  inner: {
                    kind: "object",
                    fields: {
                      reported_breakdown: {
                        kind: "nullable",
                        inner: {
                          kind: "object",
                          fields: {
                            fuel: {
                              kind: "nullable",
                              inner: {
                                kind: "object",
                                fields: {
                                  gross_amount_decimal: {
                                    kind: "nullable",
                                    inner: { kind: "decimal_string" }
                                  }
                                }
                              }
                            },
                            non_fuel: {
                              kind: "nullable",
                              inner: {
                                kind: "object",
                                fields: {
                                  gross_amount_decimal: {
                                    kind: "nullable",
                                    inner: { kind: "decimal_string" }
                                  }
                                }
                              }
                            },
                            tax: {
                              kind: "nullable",
                              inner: {
                                kind: "object",
                                fields: {
                                  local_amount_decimal: {
                                    kind: "nullable",
                                    inner: { kind: "decimal_string" }
                                  },
                                  national_amount_decimal: {
                                    kind: "nullable",
                                    inner: { kind: "decimal_string" }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                },
                fuel: {
                  kind: "nullable",
                  inner: {
                    kind: "object",
                    fields: {
                      quantity_decimal: {
                        kind: "nullable",
                        inner: { kind: "decimal_string" }
                      },
                      unit_cost_decimal: { kind: "decimal_string" }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });
  }
};

// ../node_modules/stripe/esm/resources/Treasury/Transactions.js
var TransactionResource5 = class extends StripeResource {
  static {
    __name(this, "TransactionResource");
  }
  /**
   * Retrieves a list of Transaction objects.
   */
  list(params, options) {
    return this._makeRequest("GET", "/v1/treasury/transactions", params, options, {
      methodType: "list",
      responseSchema: {
        kind: "object",
        fields: {
          data: {
            kind: "array",
            element: {
              kind: "object",
              fields: {
                entries: {
                  kind: "nullable",
                  inner: {
                    kind: "object",
                    fields: {
                      data: {
                        kind: "array",
                        element: {
                          kind: "object",
                          fields: {
                            flow_details: {
                              kind: "nullable",
                              inner: {
                                kind: "object",
                                fields: {
                                  issuing_authorization: {
                                    kind: "object",
                                    fields: {
                                      fleet: {
                                        kind: "nullable",
                                        inner: {
                                          kind: "object",
                                          fields: {
                                            reported_breakdown: {
                                              kind: "nullable",
                                              inner: {
                                                kind: "object",
                                                fields: {
                                                  fuel: {
                                                    kind: "nullable",
                                                    inner: {
                                                      kind: "object",
                                                      fields: {
                                                        gross_amount_decimal: {
                                                          kind: "nullable",
                                                          inner: {
                                                            kind: "decimal_string"
                                                          }
                                                        }
                                                      }
                                                    }
                                                  },
                                                  non_fuel: {
                                                    kind: "nullable",
                                                    inner: {
                                                      kind: "object",
                                                      fields: {
                                                        gross_amount_decimal: {
                                                          kind: "nullable",
                                                          inner: {
                                                            kind: "decimal_string"
                                                          }
                                                        }
                                                      }
                                                    }
                                                  },
                                                  tax: {
                                                    kind: "nullable",
                                                    inner: {
                                                      kind: "object",
                                                      fields: {
                                                        local_amount_decimal: {
                                                          kind: "nullable",
                                                          inner: {
                                                            kind: "decimal_string"
                                                          }
                                                        },
                                                        national_amount_decimal: {
                                                          kind: "nullable",
                                                          inner: {
                                                            kind: "decimal_string"
                                                          }
                                                        }
                                                      }
                                                    }
                                                  }
                                                }
                                              }
                                            }
                                          }
                                        }
                                      },
                                      fuel: {
                                        kind: "nullable",
                                        inner: {
                                          kind: "object",
                                          fields: {
                                            quantity_decimal: {
                                              kind: "nullable",
                                              inner: { kind: "decimal_string" }
                                            },
                                            unit_cost_decimal: {
                                              kind: "nullable",
                                              inner: { kind: "decimal_string" }
                                            }
                                          }
                                        }
                                      },
                                      transactions: {
                                        kind: "array",
                                        element: {
                                          kind: "object",
                                          fields: {
                                            purchase_details: {
                                              kind: "nullable",
                                              inner: {
                                                kind: "object",
                                                fields: {
                                                  fleet: {
                                                    kind: "nullable",
                                                    inner: {
                                                      kind: "object",
                                                      fields: {
                                                        reported_breakdown: {
                                                          kind: "nullable",
                                                          inner: {
                                                            kind: "object",
                                                            fields: {
                                                              fuel: {
                                                                kind: "nullable",
                                                                inner: {
                                                                  kind: "object",
                                                                  fields: {
                                                                    gross_amount_decimal: {
                                                                      kind: "nullable",
                                                                      inner: {
                                                                        kind: "decimal_string"
                                                                      }
                                                                    }
                                                                  }
                                                                }
                                                              },
                                                              non_fuel: {
                                                                kind: "nullable",
                                                                inner: {
                                                                  kind: "object",
                                                                  fields: {
                                                                    gross_amount_decimal: {
                                                                      kind: "nullable",
                                                                      inner: {
                                                                        kind: "decimal_string"
                                                                      }
                                                                    }
                                                                  }
                                                                }
                                                              },
                                                              tax: {
                                                                kind: "nullable",
                                                                inner: {
                                                                  kind: "object",
                                                                  fields: {
                                                                    local_amount_decimal: {
                                                                      kind: "nullable",
                                                                      inner: {
                                                                        kind: "decimal_string"
                                                                      }
                                                                    },
                                                                    national_amount_decimal: {
                                                                      kind: "nullable",
                                                                      inner: {
                                                                        kind: "decimal_string"
                                                                      }
                                                                    }
                                                                  }
                                                                }
                                                              }
                                                            }
                                                          }
                                                        }
                                                      }
                                                    }
                                                  },
                                                  fuel: {
                                                    kind: "nullable",
                                                    inner: {
                                                      kind: "object",
                                                      fields: {
                                                        quantity_decimal: {
                                                          kind: "nullable",
                                                          inner: {
                                                            kind: "decimal_string"
                                                          }
                                                        },
                                                        unit_cost_decimal: {
                                                          kind: "decimal_string"
                                                        }
                                                      }
                                                    }
                                                  }
                                                }
                                              }
                                            }
                                          }
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });
  }
  /**
   * Retrieves the details of an existing Transaction.
   */
  retrieve(id, params, options) {
    return this._makeRequest("GET", `/v1/treasury/transactions/${id}`, params, options, {
      responseSchema: {
        kind: "object",
        fields: {
          entries: {
            kind: "nullable",
            inner: {
              kind: "object",
              fields: {
                data: {
                  kind: "array",
                  element: {
                    kind: "object",
                    fields: {
                      flow_details: {
                        kind: "nullable",
                        inner: {
                          kind: "object",
                          fields: {
                            issuing_authorization: {
                              kind: "object",
                              fields: {
                                fleet: {
                                  kind: "nullable",
                                  inner: {
                                    kind: "object",
                                    fields: {
                                      reported_breakdown: {
                                        kind: "nullable",
                                        inner: {
                                          kind: "object",
                                          fields: {
                                            fuel: {
                                              kind: "nullable",
                                              inner: {
                                                kind: "object",
                                                fields: {
                                                  gross_amount_decimal: {
                                                    kind: "nullable",
                                                    inner: {
                                                      kind: "decimal_string"
                                                    }
                                                  }
                                                }
                                              }
                                            },
                                            non_fuel: {
                                              kind: "nullable",
                                              inner: {
                                                kind: "object",
                                                fields: {
                                                  gross_amount_decimal: {
                                                    kind: "nullable",
                                                    inner: {
                                                      kind: "decimal_string"
                                                    }
                                                  }
                                                }
                                              }
                                            },
                                            tax: {
                                              kind: "nullable",
                                              inner: {
                                                kind: "object",
                                                fields: {
                                                  local_amount_decimal: {
                                                    kind: "nullable",
                                                    inner: {
                                                      kind: "decimal_string"
                                                    }
                                                  },
                                                  national_amount_decimal: {
                                                    kind: "nullable",
                                                    inner: {
                                                      kind: "decimal_string"
                                                    }
                                                  }
                                                }
                                              }
                                            }
                                          }
                                        }
                                      }
                                    }
                                  }
                                },
                                fuel: {
                                  kind: "nullable",
                                  inner: {
                                    kind: "object",
                                    fields: {
                                      quantity_decimal: {
                                        kind: "nullable",
                                        inner: { kind: "decimal_string" }
                                      },
                                      unit_cost_decimal: {
                                        kind: "nullable",
                                        inner: { kind: "decimal_string" }
                                      }
                                    }
                                  }
                                },
                                transactions: {
                                  kind: "array",
                                  element: {
                                    kind: "object",
                                    fields: {
                                      purchase_details: {
                                        kind: "nullable",
                                        inner: {
                                          kind: "object",
                                          fields: {
                                            fleet: {
                                              kind: "nullable",
                                              inner: {
                                                kind: "object",
                                                fields: {
                                                  reported_breakdown: {
                                                    kind: "nullable",
                                                    inner: {
                                                      kind: "object",
                                                      fields: {
                                                        fuel: {
                                                          kind: "nullable",
                                                          inner: {
                                                            kind: "object",
                                                            fields: {
                                                              gross_amount_decimal: {
                                                                kind: "nullable",
                                                                inner: {
                                                                  kind: "decimal_string"
                                                                }
                                                              }
                                                            }
                                                          }
                                                        },
                                                        non_fuel: {
                                                          kind: "nullable",
                                                          inner: {
                                                            kind: "object",
                                                            fields: {
                                                              gross_amount_decimal: {
                                                                kind: "nullable",
                                                                inner: {
                                                                  kind: "decimal_string"
                                                                }
                                                              }
                                                            }
                                                          }
                                                        },
                                                        tax: {
                                                          kind: "nullable",
                                                          inner: {
                                                            kind: "object",
                                                            fields: {
                                                              local_amount_decimal: {
                                                                kind: "nullable",
                                                                inner: {
                                                                  kind: "decimal_string"
                                                                }
                                                              },
                                                              national_amount_decimal: {
                                                                kind: "nullable",
                                                                inner: {
                                                                  kind: "decimal_string"
                                                                }
                                                              }
                                                            }
                                                          }
                                                        }
                                                      }
                                                    }
                                                  }
                                                }
                                              }
                                            },
                                            fuel: {
                                              kind: "nullable",
                                              inner: {
                                                kind: "object",
                                                fields: {
                                                  quantity_decimal: {
                                                    kind: "nullable",
                                                    inner: {
                                                      kind: "decimal_string"
                                                    }
                                                  },
                                                  unit_cost_decimal: {
                                                    kind: "decimal_string"
                                                  }
                                                }
                                              }
                                            }
                                          }
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });
  }
};

// ../node_modules/stripe/esm/resources/Radar/ValueListItems.js
var ValueListItemResource = class extends StripeResource {
  static {
    __name(this, "ValueListItemResource");
  }
  /**
   * Deletes a ValueListItem object, removing it from its parent value list.
   */
  del(id, params, options) {
    return this._makeRequest("DELETE", `/v1/radar/value_list_items/${id}`, params, options);
  }
  /**
   * Retrieves a ValueListItem object.
   */
  retrieve(id, params, options) {
    return this._makeRequest("GET", `/v1/radar/value_list_items/${id}`, params, options);
  }
  /**
   * Returns a list of ValueListItem objects. The objects are sorted in descending order by creation date, with the most recently created object appearing first.
   */
  list(params, options) {
    return this._makeRequest("GET", "/v1/radar/value_list_items", params, options, {
      methodType: "list"
    });
  }
  /**
   * Creates a new ValueListItem object, which is added to the specified parent value list.
   */
  create(params, options) {
    return this._makeRequest("POST", "/v1/radar/value_list_items", params, options);
  }
};

// ../node_modules/stripe/esm/resources/Radar/ValueLists.js
var ValueListResource = class extends StripeResource {
  static {
    __name(this, "ValueListResource");
  }
  /**
   * Deletes a ValueList object, also deleting any items contained within the value list. To be deleted, a value list must not be referenced in any rules.
   */
  del(id, params, options) {
    return this._makeRequest("DELETE", `/v1/radar/value_lists/${id}`, params, options);
  }
  /**
   * Retrieves a ValueList object.
   */
  retrieve(id, params, options) {
    return this._makeRequest("GET", `/v1/radar/value_lists/${id}`, params, options);
  }
  /**
   * Updates a ValueList object by setting the values of the parameters passed. Any parameters not provided will be left unchanged. Note that item_type is immutable.
   */
  update(id, params, options) {
    return this._makeRequest("POST", `/v1/radar/value_lists/${id}`, params, options);
  }
  /**
   * Returns a list of ValueList objects. The objects are sorted in descending order by creation date, with the most recently created object appearing first.
   */
  list(params, options) {
    return this._makeRequest("GET", "/v1/radar/value_lists", params, options, {
      methodType: "list"
    });
  }
  /**
   * Creates a new ValueList object, which can then be referenced in rules.
   */
  create(params, options) {
    return this._makeRequest("POST", "/v1/radar/value_lists", params, options);
  }
};

// ../node_modules/stripe/esm/resources/Identity/VerificationReports.js
var VerificationReportResource = class extends StripeResource {
  static {
    __name(this, "VerificationReportResource");
  }
  /**
   * List all verification reports.
   */
  list(params, options) {
    return this._makeRequest("GET", "/v1/identity/verification_reports", params, options, {
      methodType: "list"
    });
  }
  /**
   * Retrieves an existing VerificationReport
   */
  retrieve(id, params, options) {
    return this._makeRequest("GET", `/v1/identity/verification_reports/${id}`, params, options);
  }
};

// ../node_modules/stripe/esm/resources/Identity/VerificationSessions.js
var VerificationSessionResource = class extends StripeResource {
  static {
    __name(this, "VerificationSessionResource");
  }
  /**
   * Returns a list of VerificationSessions
   */
  list(params, options) {
    return this._makeRequest("GET", "/v1/identity/verification_sessions", params, options, {
      methodType: "list"
    });
  }
  /**
   * Creates a VerificationSession object.
   *
   * After the VerificationSession is created, display a verification modal using the session client_secret or send your users to the session's url.
   *
   * If your API key is in test mode, verification checks won't actually process, though everything else will occur as if in live mode.
   *
   * Related guide: [Verify your users' identity documents](https://docs.stripe.com/docs/identity/verify-identity-documents)
   */
  create(params, options) {
    return this._makeRequest("POST", "/v1/identity/verification_sessions", params, options);
  }
  /**
   * Retrieves the details of a VerificationSession that was previously created.
   *
   * When the session status is requires_input, you can use this method to retrieve a valid
   * client_secret or url to allow re-submission.
   */
  retrieve(id, params, options) {
    return this._makeRequest("GET", `/v1/identity/verification_sessions/${id}`, params, options);
  }
  /**
   * Updates a VerificationSession object.
   *
   * When the session status is requires_input, you can use this method to update the
   * verification check and options.
   */
  update(id, params, options) {
    return this._makeRequest("POST", `/v1/identity/verification_sessions/${id}`, params, options);
  }
  /**
   * A VerificationSession object can be canceled when it is in requires_input [status](https://docs.stripe.com/docs/identity/how-sessions-work).
   *
   * Once canceled, future submission attempts are disabled. This cannot be undone. [Learn more](https://docs.stripe.com/docs/identity/verification-sessions#cancel).
   */
  cancel(id, params, options) {
    return this._makeRequest("POST", `/v1/identity/verification_sessions/${id}/cancel`, params, options);
  }
  /**
   * Redact a VerificationSession to remove all collected information from Stripe. This will redact
   * the VerificationSession and all objects related to it, including VerificationReports, Events,
   * request logs, etc.
   *
   * A VerificationSession object can be redacted when it is in requires_input or verified
   * [status](https://docs.stripe.com/docs/identity/how-sessions-work). Redacting a VerificationSession in requires_action
   * state will automatically cancel it.
   *
   * The redaction process may take up to four days. When the redaction process is in progress, the
   * VerificationSession's redaction.status field will be set to processing; when the process is
   * finished, it will change to redacted and an identity.verification_session.redacted event
   * will be emitted.
   *
   * Redaction is irreversible. Redacted objects are still accessible in the Stripe API, but all the
   * fields that contain personal data will be replaced by the string [redacted] or a similar
   * placeholder. The metadata field will also be erased. Redacted objects cannot be updated or
   * used for any purpose.
   *
   * [Learn more](https://docs.stripe.com/docs/identity/verification-sessions#redact).
   */
  redact(id, params, options) {
    return this._makeRequest("POST", `/v1/identity/verification_sessions/${id}/redact`, params, options);
  }
};

// ../node_modules/stripe/esm/resources/Accounts.js
var AccountResource3 = class extends StripeResource {
  static {
    __name(this, "AccountResource");
  }
  /**
   * With [Connect](https://docs.stripe.com/connect), you can delete accounts you manage.
   *
   * Test-mode accounts can be deleted at any time.
   *
   * Live-mode accounts that have access to the standard dashboard and Stripe is responsible for negative account balances cannot be deleted, which includes Standard accounts. All other Live-mode accounts, can be deleted when all [balances](https://docs.stripe.com/api/balance/balance_object) are zero.
   *
   * If you want to delete your own account, use the [account information tab in your account settings](https://dashboard.stripe.com/settings/account) instead.
   */
  del(id, params, options) {
    return this._makeRequest("DELETE", `/v1/accounts/${id}`, params, options);
  }
  /**
   * Retrieves the details of an account. Pass `null` as the account id to retrieve details about your own account.
   */
  retrieve(id, params, options) {
    if (typeof id === "string") {
      return this._makeRequest("GET", `/v1/accounts/${id}`, params, options);
    } else {
      return this._makeRequest("GET", "/v1/account", params, options);
    }
  }
  /**
   * Updates a [connected account](https://docs.stripe.com/connect/accounts) by setting the values of the parameters passed. Any parameters not provided are
   * left unchanged.
   *
   * For accounts where [controller.requirement_collection](https://docs.stripe.com/api/accounts/object#account_object-controller-requirement_collection)
   * is application, which includes Custom accounts, you can update any information on the account.
   *
   * For accounts where [controller.requirement_collection](https://docs.stripe.com/api/accounts/object#account_object-controller-requirement_collection)
   * is stripe, which includes Standard and Express accounts, you can update all information until you create
   * an [Account Link or <a href="/api/account_sessions">Account Session](https://docs.stripe.com/api/account_links) to start Connect onboarding,
   * after which some properties can no longer be updated.
   *
   * To update your own account, use the [Dashboard](https://dashboard.stripe.com/settings/account). Refer to our
   * [Connect](https://docs.stripe.com/docs/connect/updating-accounts) documentation to learn more about updating accounts.
   */
  update(id, params, options) {
    return this._makeRequest("POST", `/v1/accounts/${id}`, params, options);
  }
  /**
   * Retrieves the details of an account.
   */
  retrieveCurrent(params, options) {
    return this._makeRequest("GET", "/v1/account", params, options);
  }
  /**
   * Returns a list of accounts connected to your platform via [Connect](https://docs.stripe.com/docs/connect). If you're not a platform, the list is empty.
   */
  list(params, options) {
    return this._makeRequest("GET", "/v1/accounts", params, options, {
      methodType: "list"
    });
  }
  /**
   * With [Connect](https://docs.stripe.com/docs/connect), you can create Stripe accounts for your users.
   * To do this, you'll first need to [register your platform](https://dashboard.stripe.com/account/applications/settings).
   *
   * If you've already collected information for your connected accounts, you [can prefill that information](https://docs.stripe.com/docs/connect/best-practices#onboarding) when
   * creating the account. Connect Onboarding won't ask for the prefilled information during account onboarding.
   * You can prefill any information on the account.
   */
  create(params, options) {
    return this._makeRequest("POST", "/v1/accounts", params, options);
  }
  /**
   * With [Connect](https://docs.stripe.com/connect), you can reject accounts that you have flagged as suspicious.
   *
   * Only accounts where your platform is liable for negative account balances, which includes Custom and Express accounts, can be rejected. Test-mode accounts can be rejected at any time. Live-mode accounts can only be rejected after all balances are zero.
   */
  reject(id, params, options) {
    return this._makeRequest("POST", `/v1/accounts/${id}/reject`, params, options);
  }
  /**
   * Returns a list of capabilities associated with the account. The capabilities are returned sorted by creation date, with the most recent capability appearing first.
   */
  listCapabilities(id, params, options) {
    return this._makeRequest("GET", `/v1/accounts/${id}/capabilities`, params, options, {
      methodType: "list"
    });
  }
  /**
   * Retrieves information about the specified Account Capability.
   */
  retrieveCapability(accountId, id, params, options) {
    return this._makeRequest("GET", `/v1/accounts/${accountId}/capabilities/${id}`, params, options);
  }
  /**
   * Updates an existing Account Capability. Request or remove a capability by updating its requested parameter.
   */
  updateCapability(accountId, id, params, options) {
    return this._makeRequest("POST", `/v1/accounts/${accountId}/capabilities/${id}`, params, options);
  }
  /**
   * Delete a specified external account for a given account.
   */
  deleteExternalAccount(accountId, id, params, options) {
    return this._makeRequest("DELETE", `/v1/accounts/${accountId}/external_accounts/${id}`, params, options);
  }
  /**
   * Retrieve a specified external account for a given account.
   */
  retrieveExternalAccount(accountId, id, params, options) {
    return this._makeRequest("GET", `/v1/accounts/${accountId}/external_accounts/${id}`, params, options);
  }
  /**
   * Updates the metadata, account holder name, account holder type of a bank account belonging to
   * a connected account and optionally sets it as the default for its currency. Other bank account
   * details are not editable by design.
   *
   * You can only update bank accounts when [account.controller.requirement_collection is application, which includes <a href="/connect/custom-accounts">Custom accounts](https://docs.stripe.com/api/accounts/object#account_object-controller-requirement_collection).
   *
   * You can re-enable a disabled bank account by performing an update call without providing any
   * arguments or changes.
   */
  updateExternalAccount(accountId, id, params, options) {
    return this._makeRequest("POST", `/v1/accounts/${accountId}/external_accounts/${id}`, params, options);
  }
  /**
   * List external accounts for an account.
   */
  listExternalAccounts(id, params, options) {
    return this._makeRequest("GET", `/v1/accounts/${id}/external_accounts`, params, options, {
      methodType: "list"
    });
  }
  /**
   * Create an external account for a given account.
   */
  createExternalAccount(id, params, options) {
    return this._makeRequest("POST", `/v1/accounts/${id}/external_accounts`, params, options);
  }
  /**
   * Creates a login link for a connected account to access the Express Dashboard.
   *
   * You can only create login links for accounts that use the [Express Dashboard](https://docs.stripe.com/connect/express-dashboard) and are connected to your platform.
   */
  createLoginLink(id, params, options) {
    return this._makeRequest("POST", `/v1/accounts/${id}/login_links`, params, options);
  }
  /**
   * Deletes an existing person's relationship to the account's legal entity. Any person with a relationship for an account can be deleted through the API, except if the person is the account_opener. If your integration is using the executive parameter, you cannot delete the only verified executive on file.
   */
  deletePerson(accountId, id, params, options) {
    return this._makeRequest("DELETE", `/v1/accounts/${accountId}/persons/${id}`, params, options);
  }
  /**
   * Retrieves an existing person.
   */
  retrievePerson(accountId, id, params, options) {
    return this._makeRequest("GET", `/v1/accounts/${accountId}/persons/${id}`, params, options);
  }
  /**
   * Updates an existing person.
   */
  updatePerson(accountId, id, params, options) {
    return this._makeRequest("POST", `/v1/accounts/${accountId}/persons/${id}`, params, options);
  }
  /**
   * Returns a list of people associated with the account's legal entity. The people are returned sorted by creation date, with the most recent people appearing first.
   */
  listPersons(id, params, options) {
    return this._makeRequest("GET", `/v1/accounts/${id}/persons`, params, options, {
      methodType: "list"
    });
  }
  /**
   * Creates a new person.
   */
  createPerson(id, params, options) {
    return this._makeRequest("POST", `/v1/accounts/${id}/persons`, params, options);
  }
};

// ../node_modules/stripe/esm/resources/AccountLinks.js
var AccountLinkResource2 = class extends StripeResource {
  static {
    __name(this, "AccountLinkResource");
  }
  /**
   * Creates an AccountLink object that includes a single-use Stripe URL that the platform can redirect their user to in order to take them through the Connect Onboarding flow.
   */
  create(params, options) {
    return this._makeRequest("POST", "/v1/account_links", params, options);
  }
};

// ../node_modules/stripe/esm/resources/AccountSessions.js
var AccountSessionResource = class extends StripeResource {
  static {
    __name(this, "AccountSessionResource");
  }
  /**
   * Creates a AccountSession object that includes a single-use token that the platform can use on their front-end to grant client-side API access.
   */
  create(params, options) {
    return this._makeRequest("POST", "/v1/account_sessions", params, options);
  }
};

// ../node_modules/stripe/esm/resources/ApplePayDomains.js
var ApplePayDomainResource = class extends StripeResource {
  static {
    __name(this, "ApplePayDomainResource");
  }
  /**
   * Delete an apple pay domain.
   */
  del(id, params, options) {
    return this._makeRequest("DELETE", `/v1/apple_pay/domains/${id}`, params, options);
  }
  /**
   * Retrieve an apple pay domain.
   */
  retrieve(id, params, options) {
    return this._makeRequest("GET", `/v1/apple_pay/domains/${id}`, params, options);
  }
  /**
   * List apple pay domains.
   */
  list(params, options) {
    return this._makeRequest("GET", "/v1/apple_pay/domains", params, options, {
      methodType: "list"
    });
  }
  /**
   * Create an apple pay domain.
   */
  create(params, options) {
    return this._makeRequest("POST", "/v1/apple_pay/domains", params, options);
  }
};

// ../node_modules/stripe/esm/resources/ApplicationFees.js
var ApplicationFeeResource = class extends StripeResource {
  static {
    __name(this, "ApplicationFeeResource");
  }
  /**
   * Returns a list of application fees you've previously collected. The application fees are returned in sorted order, with the most recent fees appearing first.
   */
  list(params, options) {
    return this._makeRequest("GET", "/v1/application_fees", params, options, {
      methodType: "list"
    });
  }
  /**
   * Retrieves the details of an application fee that your account has collected. The same information is returned when refunding the application fee.
   */
  retrieve(id, params, options) {
    return this._makeRequest("GET", `/v1/application_fees/${id}`, params, options);
  }
  /**
   * By default, you can see the 10 most recent refunds stored directly on the application fee object, but you can also retrieve details about a specific refund stored on the application fee.
   */
  retrieveRefund(feeId, id, params, options) {
    return this._makeRequest("GET", `/v1/application_fees/${feeId}/refunds/${id}`, params, options);
  }
  /**
   * Updates the specified application fee refund by setting the values of the parameters passed. Any parameters not provided will be left unchanged.
   *
   * This request only accepts metadata as an argument.
   */
  updateRefund(feeId, id, params, options) {
    return this._makeRequest("POST", `/v1/application_fees/${feeId}/refunds/${id}`, params, options);
  }
  /**
   * You can see a list of the refunds belonging to a specific application fee. Note that the 10 most recent refunds are always available by default on the application fee object. If you need more than those 10, you can use this API method and the limit and starting_after parameters to page through additional refunds.
   */
  listRefunds(id, params, options) {
    return this._makeRequest("GET", `/v1/application_fees/${id}/refunds`, params, options, {
      methodType: "list"
    });
  }
  /**
   * Refunds an application fee that has previously been collected but not yet refunded.
   * Funds will be refunded to the Stripe account from which the fee was originally collected.
   *
   * You can optionally refund only part of an application fee.
   * You can do so multiple times, until the entire fee has been refunded.
   *
   * Once entirely refunded, an application fee can't be refunded again.
   * This method will raise an error when called on an already-refunded application fee,
   * or when trying to refund more money than is left on an application fee.
   */
  createRefund(id, params, options) {
    return this._makeRequest("POST", `/v1/application_fees/${id}/refunds`, params, options);
  }
};

// ../node_modules/stripe/esm/resources/Balance.js
var BalanceResource = class extends StripeResource {
  static {
    __name(this, "BalanceResource");
  }
  /**
   * Retrieves the current account balance, based on the authentication that was used to make the request.
   *  For a sample request, see [Accounting for negative balances](https://docs.stripe.com/docs/connect/account-balances#accounting-for-negative-balances).
   */
  retrieve(params, options) {
    return this._makeRequest("GET", "/v1/balance", params, options);
  }
};

// ../node_modules/stripe/esm/resources/BalanceSettings.js
var BalanceSettingResource = class extends StripeResource {
  static {
    __name(this, "BalanceSettingResource");
  }
  /**
   * Retrieves balance settings for a given connected account.
   *  Related guide: [Making API calls for connected accounts](https://docs.stripe.com/connect/authentication)
   */
  retrieve(params, options) {
    return this._makeRequest("GET", "/v1/balance_settings", params, options);
  }
  /**
   * Updates balance settings for a given connected account.
   *  Related guide: [Making API calls for connected accounts](https://docs.stripe.com/connect/authentication)
   */
  update(params, options) {
    return this._makeRequest("POST", "/v1/balance_settings", params, options);
  }
};

// ../node_modules/stripe/esm/resources/BalanceTransactions.js
var BalanceTransactionResource = class extends StripeResource {
  static {
    __name(this, "BalanceTransactionResource");
  }
  /**
   * Returns a list of transactions that have contributed to the Stripe account balance (e.g., charges, transfers, and so forth). The transactions are returned in sorted order, with the most recent transactions appearing first.
   *
   * Note that this endpoint was previously called “Balance history” and used the path /v1/balance/history.
   */
  list(params, options) {
    return this._makeRequest("GET", "/v1/balance_transactions", params, options, {
      methodType: "list"
    });
  }
  /**
   * Retrieves the balance transaction with the given ID.
   *
   * Note that this endpoint previously used the path /v1/balance/history/:id.
   */
  retrieve(id, params, options) {
    return this._makeRequest("GET", `/v1/balance_transactions/${id}`, params, options);
  }
};

// ../node_modules/stripe/esm/resources/Charges.js
var ChargeResource = class extends StripeResource {
  static {
    __name(this, "ChargeResource");
  }
  /**
   * Returns a list of charges you've previously created. The charges are returned in sorted order, with the most recent charges appearing first.
   */
  list(params, options) {
    return this._makeRequest("GET", "/v1/charges", params, options, {
      methodType: "list"
    });
  }
  /**
   * This method is no longer recommended—use the [Payment Intents API](https://docs.stripe.com/docs/api/payment_intents)
   * to initiate a new payment instead. Confirmation of the PaymentIntent creates the Charge
   * object used to request payment.
   */
  create(params, options) {
    return this._makeRequest("POST", "/v1/charges", params, options);
  }
  /**
   * Retrieves the details of a charge that has previously been created. Supply the unique charge ID that was returned from your previous request, and Stripe will return the corresponding charge information. The same information is returned when creating or refunding the charge.
   */
  retrieve(id, params, options) {
    return this._makeRequest("GET", `/v1/charges/${id}`, params, options);
  }
  /**
   * Updates the specified charge by setting the values of the parameters passed. Any parameters not provided will be left unchanged.
   */
  update(id, params, options) {
    return this._makeRequest("POST", `/v1/charges/${id}`, params, options);
  }
  /**
   * Search for charges you've previously created using Stripe's [Search Query Language](https://docs.stripe.com/docs/search#search-query-language).
   * Don't use search in read-after-write flows where strict consistency is necessary. Under normal operating
   * conditions, data is searchable in less than a minute. Occasionally, propagation of new or updated data can be up
   * to an hour behind during outages. Search functionality is not available to merchants in India.
   */
  search(params, options) {
    return this._makeRequest("GET", "/v1/charges/search", params, options, {
      methodType: "search"
    });
  }
  /**
   * Capture the payment of an existing, uncaptured charge that was created with the capture option set to false.
   *
   * Uncaptured payments expire a set number of days after they are created ([7 by default](https://docs.stripe.com/docs/charges/placing-a-hold)), after which they are marked as refunded and capture attempts will fail.
   *
   * Don't use this method to capture a PaymentIntent-initiated charge. Use [Capture a PaymentIntent](https://docs.stripe.com/docs/api/payment_intents/capture).
   */
  capture(id, params, options) {
    return this._makeRequest("POST", `/v1/charges/${id}/capture`, params, options);
  }
};

// ../node_modules/stripe/esm/resources/ConfirmationTokens.js
var ConfirmationTokenResource2 = class extends StripeResource {
  static {
    __name(this, "ConfirmationTokenResource");
  }
  /**
   * Retrieves an existing ConfirmationToken object
   */
  retrieve(id, params, options) {
    return this._makeRequest("GET", `/v1/confirmation_tokens/${id}`, params, options);
  }
};

// ../node_modules/stripe/esm/resources/CountrySpecs.js
var CountrySpecResource = class extends StripeResource {
  static {
    __name(this, "CountrySpecResource");
  }
  /**
   * Lists all Country Spec objects available in the API.
   */
  list(params, options) {
    return this._makeRequest("GET", "/v1/country_specs", params, options, {
      methodType: "list"
    });
  }
  /**
   * Returns a Country Spec for a given Country code.
   */
  retrieve(id, params, options) {
    return this._makeRequest("GET", `/v1/country_specs/${id}`, params, options);
  }
};

// ../node_modules/stripe/esm/resources/Coupons.js
var CouponResource = class extends StripeResource {
  static {
    __name(this, "CouponResource");
  }
  /**
   * You can delete coupons via the [coupon management](https://dashboard.stripe.com/coupons) page of the Stripe dashboard. However, deleting a coupon does not affect any customers who have already applied the coupon; it means that new customers can't redeem the coupon. You can also delete coupons via the API.
   */
  del(id, params, options) {
    return this._makeRequest("DELETE", `/v1/coupons/${id}`, params, options);
  }
  /**
   * Retrieves the coupon with the given ID.
   */
  retrieve(id, params, options) {
    return this._makeRequest("GET", `/v1/coupons/${id}`, params, options);
  }
  /**
   * Updates the metadata of a coupon. Other coupon details (currency, duration, amount_off) are, by design, not editable.
   */
  update(id, params, options) {
    return this._makeRequest("POST", `/v1/coupons/${id}`, params, options);
  }
  /**
   * Returns a list of your coupons.
   */
  list(params, options) {
    return this._makeRequest("GET", "/v1/coupons", params, options, {
      methodType: "list"
    });
  }
  /**
   * You can create coupons easily via the [coupon management](https://dashboard.stripe.com/coupons) page of the Stripe dashboard. Coupon creation is also accessible via the API if you need to create coupons on the fly.
   *
   * A coupon has either a percent_off or an amount_off and currency. If you set an amount_off, that amount will be subtracted from any invoice's subtotal. For example, an invoice with a subtotal of 100 will have a final total of 0 if a coupon with an amount_off of 200 is applied to it and an invoice with a subtotal of 300 will have a final total of 100 if a coupon with an amount_off of 200 is applied to it.
   */
  create(params, options) {
    return this._makeRequest("POST", "/v1/coupons", params, options);
  }
};

// ../node_modules/stripe/esm/resources/CreditNotes.js
var CreditNoteResource = class extends StripeResource {
  static {
    __name(this, "CreditNoteResource");
  }
  /**
   * Returns a list of credit notes.
   */
  list(params, options) {
    return this._makeRequest("GET", "/v1/credit_notes", params, options, {
      methodType: "list",
      responseSchema: {
        kind: "object",
        fields: {
          data: {
            kind: "array",
            element: {
              kind: "object",
              fields: {
                lines: {
                  kind: "object",
                  fields: {
                    data: {
                      kind: "array",
                      element: {
                        kind: "object",
                        fields: {
                          unit_amount_decimal: {
                            kind: "nullable",
                            inner: { kind: "decimal_string" }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });
  }
  /**
   * Issue a credit note to adjust the amount of a finalized invoice. A credit note will first reduce the invoice's amount_remaining (and amount_due), but not below zero.
   * This amount is indicated by the credit note's pre_payment_amount. The excess amount is indicated by post_payment_amount, and it can result in any combination of the following:
   *
   *
   * Refunds: create a new refund (using refund_amount) or link existing refunds (using refunds).
   * Customer balance credit: credit the customer's balance (using credit_amount) which will be automatically applied to their next invoice when it's finalized.
   * Outside of Stripe credit: record the amount that is or will be credited outside of Stripe (using out_of_band_amount).
   *
   *
   * The sum of refunds, customer balance credits, and outside of Stripe credits must equal the post_payment_amount.
   *
   * You may issue multiple credit notes for an invoice. Each credit note may increment the invoice's pre_payment_credit_notes_amount,
   * post_payment_credit_notes_amount, or both, depending on the invoice's amount_remaining at the time of credit note creation.
   */
  create(params, options) {
    return this._makeRequest("POST", "/v1/credit_notes", params, options, {
      requestSchema: {
        kind: "object",
        fields: {
          lines: {
            kind: "array",
            element: {
              kind: "object",
              fields: { unit_amount_decimal: { kind: "decimal_string" } }
            }
          }
        }
      },
      responseSchema: {
        kind: "object",
        fields: {
          lines: {
            kind: "object",
            fields: {
              data: {
                kind: "array",
                element: {
                  kind: "object",
                  fields: {
                    unit_amount_decimal: {
                      kind: "nullable",
                      inner: { kind: "decimal_string" }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });
  }
  /**
   * Retrieves the credit note object with the given identifier.
   */
  retrieve(id, params, options) {
    return this._makeRequest("GET", `/v1/credit_notes/${id}`, params, options, {
      responseSchema: {
        kind: "object",
        fields: {
          lines: {
            kind: "object",
            fields: {
              data: {
                kind: "array",
                element: {
                  kind: "object",
                  fields: {
                    unit_amount_decimal: {
                      kind: "nullable",
                      inner: { kind: "decimal_string" }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });
  }
  /**
   * Updates an existing credit note.
   */
  update(id, params, options) {
    return this._makeRequest("POST", `/v1/credit_notes/${id}`, params, options, {
      responseSchema: {
        kind: "object",
        fields: {
          lines: {
            kind: "object",
            fields: {
              data: {
                kind: "array",
                element: {
                  kind: "object",
                  fields: {
                    unit_amount_decimal: {
                      kind: "nullable",
                      inner: { kind: "decimal_string" }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });
  }
  /**
   * Get a preview of a credit note without creating it.
   */
  preview(params, options) {
    return this._makeRequest("GET", "/v1/credit_notes/preview", params, options, {
      requestSchema: {
        kind: "object",
        fields: {
          lines: {
            kind: "array",
            element: {
              kind: "object",
              fields: { unit_amount_decimal: { kind: "decimal_string" } }
            }
          }
        }
      },
      responseSchema: {
        kind: "object",
        fields: {
          lines: {
            kind: "object",
            fields: {
              data: {
                kind: "array",
                element: {
                  kind: "object",
                  fields: {
                    unit_amount_decimal: {
                      kind: "nullable",
                      inner: { kind: "decimal_string" }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });
  }
  /**
   * Marks a credit note as void. Learn more about [voiding credit notes](https://docs.stripe.com/docs/billing/invoices/credit-notes#voiding).
   */
  voidCreditNote(id, params, options) {
    return this._makeRequest("POST", `/v1/credit_notes/${id}/void`, params, options, {
      responseSchema: {
        kind: "object",
        fields: {
          lines: {
            kind: "object",
            fields: {
              data: {
                kind: "array",
                element: {
                  kind: "object",
                  fields: {
                    unit_amount_decimal: {
                      kind: "nullable",
                      inner: { kind: "decimal_string" }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });
  }
  /**
   * When retrieving a credit note preview, you'll get a lines property containing the first handful of those items. This URL you can retrieve the full (paginated) list of line items.
   */
  listPreviewLineItems(params, options) {
    return this._makeRequest("GET", "/v1/credit_notes/preview/lines", params, options, {
      methodType: "list",
      requestSchema: {
        kind: "object",
        fields: {
          lines: {
            kind: "array",
            element: {
              kind: "object",
              fields: { unit_amount_decimal: { kind: "decimal_string" } }
            }
          }
        }
      },
      responseSchema: {
        kind: "object",
        fields: {
          data: {
            kind: "array",
            element: {
              kind: "object",
              fields: {
                unit_amount_decimal: {
                  kind: "nullable",
                  inner: { kind: "decimal_string" }
                }
              }
            }
          }
        }
      }
    });
  }
  /**
   * When retrieving a credit note, you'll get a lines property containing the first handful of those items. There is also a URL where you can retrieve the full (paginated) list of line items.
   */
  listLineItems(id, params, options) {
    return this._makeRequest("GET", `/v1/credit_notes/${id}/lines`, params, options, {
      methodType: "list",
      responseSchema: {
        kind: "object",
        fields: {
          data: {
            kind: "array",
            element: {
              kind: "object",
              fields: {
                unit_amount_decimal: {
                  kind: "nullable",
                  inner: { kind: "decimal_string" }
                }
              }
            }
          }
        }
      }
    });
  }
};

// ../node_modules/stripe/esm/resources/Customers.js
var CustomerResource2 = class extends StripeResource {
  static {
    __name(this, "CustomerResource");
  }
  /**
   * Permanently deletes a customer. It cannot be undone. Also immediately cancels any active subscriptions on the customer.
   */
  del(id, params, options) {
    return this._makeRequest("DELETE", `/v1/customers/${id}`, params, options);
  }
  /**
   * Retrieves a Customer object.
   */
  retrieve(id, params, options) {
    return this._makeRequest("GET", `/v1/customers/${id}`, params, options);
  }
  /**
   * Updates the specified customer by setting the values of the parameters passed. Any parameters not provided are left unchanged. For example, if you pass the source parameter, that becomes the customer's active source (such as a card) to be used for all charges in the future. When you update a customer to a new valid card source by passing the source parameter: for each of the customer's current subscriptions, if the subscription bills automatically and is in the past_due state, then the latest open invoice for the subscription with automatic collection enabled is retried. This retry doesn't count as an automatic retry, and doesn't affect the next regularly scheduled payment for the invoice. Changing the default_source for a customer doesn't trigger this behavior.
   *
   * This request accepts mostly the same arguments as the customer creation call.
   */
  update(id, params, options) {
    return this._makeRequest("POST", `/v1/customers/${id}`, params, options, {
      responseSchema: {
        kind: "object",
        fields: {
          subscriptions: {
            kind: "object",
            fields: {
              data: {
                kind: "array",
                element: {
                  kind: "object",
                  fields: {
                    items: {
                      kind: "object",
                      fields: {
                        data: {
                          kind: "array",
                          element: {
                            kind: "object",
                            fields: {
                              plan: {
                                kind: "object",
                                fields: {
                                  amount_decimal: {
                                    kind: "nullable",
                                    inner: { kind: "decimal_string" }
                                  },
                                  tiers: {
                                    kind: "array",
                                    element: {
                                      kind: "object",
                                      fields: {
                                        flat_amount_decimal: {
                                          kind: "nullable",
                                          inner: { kind: "decimal_string" }
                                        },
                                        unit_amount_decimal: {
                                          kind: "nullable",
                                          inner: { kind: "decimal_string" }
                                        }
                                      }
                                    }
                                  }
                                }
                              },
                              price: {
                                kind: "object",
                                fields: {
                                  currency_options: {
                                    kind: "array",
                                    element: {
                                      kind: "object",
                                      fields: {
                                        tiers: {
                                          kind: "array",
                                          element: {
                                            kind: "object",
                                            fields: {
                                              flat_amount_decimal: {
                                                kind: "nullable",
                                                inner: { kind: "decimal_string" }
                                              },
                                              unit_amount_decimal: {
                                                kind: "nullable",
                                                inner: { kind: "decimal_string" }
                                              }
                                            }
                                          }
                                        },
                                        unit_amount_decimal: {
                                          kind: "nullable",
                                          inner: { kind: "decimal_string" }
                                        }
                                      }
                                    }
                                  },
                                  tiers: {
                                    kind: "array",
                                    element: {
                                      kind: "object",
                                      fields: {
                                        flat_amount_decimal: {
                                          kind: "nullable",
                                          inner: { kind: "decimal_string" }
                                        },
                                        unit_amount_decimal: {
                                          kind: "nullable",
                                          inner: { kind: "decimal_string" }
                                        }
                                      }
                                    }
                                  },
                                  unit_amount_decimal: {
                                    kind: "nullable",
                                    inner: { kind: "decimal_string" }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });
  }
  /**
   * Removes the currently applied discount on a customer.
   */
  deleteDiscount(id, params, options) {
    return this._makeRequest("DELETE", `/v1/customers/${id}/discount`, params, options);
  }
  /**
   * Returns a list of your customers. The customers are returned sorted by creation date, with the most recent customers appearing first.
   */
  list(params, options) {
    return this._makeRequest("GET", "/v1/customers", params, options, {
      methodType: "list",
      responseSchema: {
        kind: "object",
        fields: {
          data: {
            kind: "array",
            element: {
              kind: "object",
              fields: {
                subscriptions: {
                  kind: "object",
                  fields: {
                    data: {
                      kind: "array",
                      element: {
                        kind: "object",
                        fields: {
                          items: {
                            kind: "object",
                            fields: {
                              data: {
                                kind: "array",
                                element: {
                                  kind: "object",
                                  fields: {
                                    plan: {
                                      kind: "object",
                                      fields: {
                                        amount_decimal: {
                                          kind: "nullable",
                                          inner: { kind: "decimal_string" }
                                        },
                                        tiers: {
                                          kind: "array",
                                          element: {
                                            kind: "object",
                                            fields: {
                                              flat_amount_decimal: {
                                                kind: "nullable",
                                                inner: { kind: "decimal_string" }
                                              },
                                              unit_amount_decimal: {
                                                kind: "nullable",
                                                inner: { kind: "decimal_string" }
                                              }
                                            }
                                          }
                                        }
                                      }
                                    },
                                    price: {
                                      kind: "object",
                                      fields: {
                                        currency_options: {
                                          kind: "array",
                                          element: {
                                            kind: "object",
                                            fields: {
                                              tiers: {
                                                kind: "array",
                                                element: {
                                                  kind: "object",
                                                  fields: {
                                                    flat_amount_decimal: {
                                                      kind: "nullable",
                                                      inner: {
                                                        kind: "decimal_string"
                                                      }
                                                    },
                                                    unit_amount_decimal: {
                                                      kind: "nullable",
                                                      inner: {
                                                        kind: "decimal_string"
                                                      }
                                                    }
                                                  }
                                                }
                                              },
                                              unit_amount_decimal: {
                                                kind: "nullable",
                                                inner: { kind: "decimal_string" }
                                              }
                                            }
                                          }
                                        },
                                        tiers: {
                                          kind: "array",
                                          element: {
                                            kind: "object",
                                            fields: {
                                              flat_amount_decimal: {
                                                kind: "nullable",
                                                inner: { kind: "decimal_string" }
                                              },
                                              unit_amount_decimal: {
                                                kind: "nullable",
                                                inner: { kind: "decimal_string" }
                                              }
                                            }
                                          }
                                        },
                                        unit_amount_decimal: {
                                          kind: "nullable",
                                          inner: { kind: "decimal_string" }
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });
  }
  /**
   * Creates a new customer object.
   */
  create(params, options) {
    return this._makeRequest("POST", "/v1/customers", params, options, {
      responseSchema: {
        kind: "object",
        fields: {
          subscriptions: {
            kind: "object",
            fields: {
              data: {
                kind: "array",
                element: {
                  kind: "object",
                  fields: {
                    items: {
                      kind: "object",
                      fields: {
                        data: {
                          kind: "array",
                          element: {
                            kind: "object",
                            fields: {
                              plan: {
                                kind: "object",
                                fields: {
                                  amount_decimal: {
                                    kind: "nullable",
                                    inner: { kind: "decimal_string" }
                                  },
                                  tiers: {
                                    kind: "array",
                                    element: {
                                      kind: "object",
                                      fields: {
                                        flat_amount_decimal: {
                                          kind: "nullable",
                                          inner: { kind: "decimal_string" }
                                        },
                                        unit_amount_decimal: {
                                          kind: "nullable",
                                          inner: { kind: "decimal_string" }
                                        }
                                      }
                                    }
                                  }
                                }
                              },
                              price: {
                                kind: "object",
                                fields: {
                                  currency_options: {
                                    kind: "array",
                                    element: {
                                      kind: "object",
                                      fields: {
                                        tiers: {
                                          kind: "array",
                                          element: {
                                            kind: "object",
                                            fields: {
                                              flat_amount_decimal: {
                                                kind: "nullable",
                                                inner: { kind: "decimal_string" }
                                              },
                                              unit_amount_decimal: {
                                                kind: "nullable",
                                                inner: { kind: "decimal_string" }
                                              }
                                            }
                                          }
                                        },
                                        unit_amount_decimal: {
                                          kind: "nullable",
                                          inner: { kind: "decimal_string" }
                                        }
                                      }
                                    }
                                  },
                                  tiers: {
                                    kind: "array",
                                    element: {
                                      kind: "object",
                                      fields: {
                                        flat_amount_decimal: {
                                          kind: "nullable",
                                          inner: { kind: "decimal_string" }
                                        },
                                        unit_amount_decimal: {
                                          kind: "nullable",
                                          inner: { kind: "decimal_string" }
                                        }
                                      }
                                    }
                                  },
                                  unit_amount_decimal: {
                                    kind: "nullable",
                                    inner: { kind: "decimal_string" }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });
  }
  /**
   * Search for customers you've previously created using Stripe's [Search Query Language](https://docs.stripe.com/docs/search#search-query-language).
   * Don't use search in read-after-write flows where strict consistency is necessary. Under normal operating
   * conditions, data is searchable in less than a minute. Occasionally, propagation of new or updated data can be up
   * to an hour behind during outages. Search functionality is not available to merchants in India.
   */
  search(params, options) {
    return this._makeRequest("GET", "/v1/customers/search", params, options, {
      methodType: "search",
      responseSchema: {
        kind: "object",
        fields: {
          data: {
            kind: "array",
            element: {
              kind: "object",
              fields: {
                subscriptions: {
                  kind: "object",
                  fields: {
                    data: {
                      kind: "array",
                      element: {
                        kind: "object",
                        fields: {
                          items: {
                            kind: "object",
                            fields: {
                              data: {
                                kind: "array",
                                element: {
                                  kind: "object",
                                  fields: {
                                    plan: {
                                      kind: "object",
                                      fields: {
                                        amount_decimal: {
                                          kind: "nullable",
                                          inner: { kind: "decimal_string" }
                                        },
                                        tiers: {
                                          kind: "array",
                                          element: {
                                            kind: "object",
                                            fields: {
                                              flat_amount_decimal: {
                                                kind: "nullable",
                                                inner: { kind: "decimal_string" }
                                              },
                                              unit_amount_decimal: {
                                                kind: "nullable",
                                                inner: { kind: "decimal_string" }
                                              }
                                            }
                                          }
                                        }
                                      }
                                    },
                                    price: {
                                      kind: "object",
                                      fields: {
                                        currency_options: {
                                          kind: "array",
                                          element: {
                                            kind: "object",
                                            fields: {
                                              tiers: {
                                                kind: "array",
                                                element: {
                                                  kind: "object",
                                                  fields: {
                                                    flat_amount_decimal: {
                                                      kind: "nullable",
                                                      inner: {
                                                        kind: "decimal_string"
                                                      }
                                                    },
                                                    unit_amount_decimal: {
                                                      kind: "nullable",
                                                      inner: {
                                                        kind: "decimal_string"
                                                      }
                                                    }
                                                  }
                                                }
                                              },
                                              unit_amount_decimal: {
                                                kind: "nullable",
                                                inner: { kind: "decimal_string" }
                                              }
                                            }
                                          }
                                        },
                                        tiers: {
                                          kind: "array",
                                          element: {
                                            kind: "object",
                                            fields: {
                                              flat_amount_decimal: {
                                                kind: "nullable",
                                                inner: { kind: "decimal_string" }
                                              },
                                              unit_amount_decimal: {
                                                kind: "nullable",
                                                inner: { kind: "decimal_string" }
                                              }
                                            }
                                          }
                                        },
                                        unit_amount_decimal: {
                                          kind: "nullable",
                                          inner: { kind: "decimal_string" }
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });
  }
  /**
   * Returns a list of transactions that updated the customer's [balances](https://docs.stripe.com/docs/billing/customer/balance).
   */
  listBalanceTransactions(id, params, options) {
    return this._makeRequest("GET", `/v1/customers/${id}/balance_transactions`, params, options, {
      methodType: "list"
    });
  }
  /**
   * Creates an immutable transaction that updates the customer's credit [balance](https://docs.stripe.com/docs/billing/customer/balance).
   */
  createBalanceTransaction(id, params, options) {
    return this._makeRequest("POST", `/v1/customers/${id}/balance_transactions`, params, options);
  }
  /**
   * Retrieves a specific customer balance transaction that updated the customer's [balances](https://docs.stripe.com/docs/billing/customer/balance).
   */
  retrieveBalanceTransaction(customerId, id, params, options) {
    return this._makeRequest("GET", `/v1/customers/${customerId}/balance_transactions/${id}`, params, options);
  }
  /**
   * Most credit balance transaction fields are immutable, but you may update its description and metadata.
   */
  updateBalanceTransaction(customerId, id, params, options) {
    return this._makeRequest("POST", `/v1/customers/${customerId}/balance_transactions/${id}`, params, options);
  }
  /**
   * Retrieves a customer's cash balance.
   */
  retrieveCashBalance(id, params, options) {
    return this._makeRequest("GET", `/v1/customers/${id}/cash_balance`, params, options);
  }
  /**
   * Changes the settings on a customer's cash balance.
   */
  updateCashBalance(id, params, options) {
    return this._makeRequest("POST", `/v1/customers/${id}/cash_balance`, params, options);
  }
  /**
   * Returns a list of transactions that modified the customer's [cash balance](https://docs.stripe.com/docs/payments/customer-balance).
   */
  listCashBalanceTransactions(id, params, options) {
    return this._makeRequest("GET", `/v1/customers/${id}/cash_balance_transactions`, params, options, {
      methodType: "list"
    });
  }
  /**
   * Retrieves a specific cash balance transaction, which updated the customer's [cash balance](https://docs.stripe.com/docs/payments/customer-balance).
   */
  retrieveCashBalanceTransaction(customerId, id, params, options) {
    return this._makeRequest("GET", `/v1/customers/${customerId}/cash_balance_transactions/${id}`, params, options);
  }
  /**
   * Retrieve funding instructions for a customer cash balance. If funding instructions do not yet exist for the customer, new
   * funding instructions will be created. If funding instructions have already been created for a given customer, the same
   * funding instructions will be retrieved. In other words, we will return the same funding instructions each time.
   */
  createFundingInstructions(id, params, options) {
    return this._makeRequest("POST", `/v1/customers/${id}/funding_instructions`, params, options);
  }
  /**
   * Returns a list of PaymentMethods for a given Customer
   */
  listPaymentMethods(id, params, options) {
    return this._makeRequest("GET", `/v1/customers/${id}/payment_methods`, params, options, {
      methodType: "list"
    });
  }
  /**
   * Retrieves a PaymentMethod object for a given Customer.
   */
  retrievePaymentMethod(customerId, id, params, options) {
    return this._makeRequest("GET", `/v1/customers/${customerId}/payment_methods/${id}`, params, options);
  }
  /**
   * List sources for a specified customer.
   */
  listSources(id, params, options) {
    return this._makeRequest("GET", `/v1/customers/${id}/sources`, params, options, {
      methodType: "list"
    });
  }
  /**
   * When you create a new credit card, you must specify a customer or recipient on which to create it.
   *
   * If the card's owner has no default card, then the new card will become the default.
   * However, if the owner already has a default, then it will not change.
   * To change the default, you should [update the customer](https://docs.stripe.com/api/customers/update) to have a new default_source.
   */
  createSource(id, params, options) {
    return this._makeRequest("POST", `/v1/customers/${id}/sources`, params, options);
  }
  /**
   * Retrieve a specified source for a given customer.
   */
  retrieveSource(customerId, id, params, options) {
    return this._makeRequest("GET", `/v1/customers/${customerId}/sources/${id}`, params, options);
  }
  /**
   * Update a specified source for a given customer.
   */
  updateSource(customerId, id, params, options) {
    return this._makeRequest("POST", `/v1/customers/${customerId}/sources/${id}`, params, options);
  }
  /**
   * Delete a specified source for a given customer.
   */
  deleteSource(customerId, id, params, options) {
    return this._makeRequest("DELETE", `/v1/customers/${customerId}/sources/${id}`, params, options);
  }
  /**
   * Verify a specified bank account for a given customer.
   */
  verifySource(customerId, id, params, options) {
    return this._makeRequest("POST", `/v1/customers/${customerId}/sources/${id}/verify`, params, options);
  }
  /**
   * Deletes an existing tax_id object.
   */
  deleteTaxId(customerId, id, params, options) {
    return this._makeRequest("DELETE", `/v1/customers/${customerId}/tax_ids/${id}`, params, options);
  }
  /**
   * Retrieves the tax_id object with the given identifier.
   */
  retrieveTaxId(customerId, id, params, options) {
    return this._makeRequest("GET", `/v1/customers/${customerId}/tax_ids/${id}`, params, options);
  }
  /**
   * Returns a list of tax IDs for a customer.
   */
  listTaxIds(id, params, options) {
    return this._makeRequest("GET", `/v1/customers/${id}/tax_ids`, params, options, {
      methodType: "list"
    });
  }
  /**
   * Creates a new tax_id object for a customer.
   */
  createTaxId(id, params, options) {
    return this._makeRequest("POST", `/v1/customers/${id}/tax_ids`, params, options);
  }
};

// ../node_modules/stripe/esm/resources/CustomerSessions.js
var CustomerSessionResource = class extends StripeResource {
  static {
    __name(this, "CustomerSessionResource");
  }
  /**
   * Creates a Customer Session object that includes a single-use client secret that you can use on your front-end to grant client-side API access for certain customer resources.
   */
  create(params, options) {
    return this._makeRequest("POST", "/v1/customer_sessions", params, options);
  }
};

// ../node_modules/stripe/esm/resources/Disputes.js
var DisputeResource2 = class extends StripeResource {
  static {
    __name(this, "DisputeResource");
  }
  /**
   * Returns a list of your disputes.
   */
  list(params, options) {
    return this._makeRequest("GET", "/v1/disputes", params, options, {
      methodType: "list"
    });
  }
  /**
   * Retrieves the dispute with the given ID.
   */
  retrieve(id, params, options) {
    return this._makeRequest("GET", `/v1/disputes/${id}`, params, options);
  }
  /**
   * When you get a dispute, contacting your customer is always the best first step. If that doesn't work, you can submit evidence to help us resolve the dispute in your favor. You can do this in your [dashboard](https://dashboard.stripe.com/disputes), but if you prefer, you can use the API to submit evidence programmatically.
   *
   * Depending on your dispute type, different evidence fields will give you a better chance of winning your dispute. To figure out which evidence fields to provide, see our [guide to dispute types](https://docs.stripe.com/docs/disputes/categories).
   */
  update(id, params, options) {
    return this._makeRequest("POST", `/v1/disputes/${id}`, params, options);
  }
  /**
   * Closing the dispute for a charge indicates that you do not have any evidence to submit and are essentially dismissing the dispute, acknowledging it as lost.
   *
   * The status of the dispute will change from needs_response to lost. Closing a dispute is irreversible.
   */
  close(id, params, options) {
    return this._makeRequest("POST", `/v1/disputes/${id}/close`, params, options);
  }
};

// ../node_modules/stripe/esm/resources/EphemeralKeys.js
var EphemeralKeyResource = class extends StripeResource {
  static {
    __name(this, "EphemeralKeyResource");
  }
  /**
   * Invalidates a short-lived API key for a given resource.
   */
  del(id, params, options) {
    return this._makeRequest("DELETE", `/v1/ephemeral_keys/${id}`, params, options);
  }
  create(params, options) {
    return this._makeRequest("POST", "/v1/ephemeral_keys", params, options, {
      validator: /* @__PURE__ */ __name((data, options2) => {
        if (!options2.headers || !options2.headers["Stripe-Version"]) {
          throw new Error("Passing apiVersion in a separate options hash is required to create an ephemeral key. See https://stripe.com/docs/api/versioning?lang=node");
        }
      }, "validator")
    });
  }
};

// ../node_modules/stripe/esm/resources/Events.js
var EventResource2 = class extends StripeResource {
  static {
    __name(this, "EventResource");
  }
  /**
   * List events, going back up to 30 days. Each event data is rendered according to Stripe API version at its creation time, specified in [event object](https://docs.stripe.com/api/events/object) api_version attribute (not according to your current Stripe API version or Stripe-Version header).
   */
  list(params, options) {
    return this._makeRequest("GET", "/v1/events", params, options, {
      methodType: "list"
    });
  }
  /**
   * Retrieves the details of an event if it was created in the last 30 days. Supply the unique identifier of the event, which you might have received in a webhook.
   */
  retrieve(id, params, options) {
    return this._makeRequest("GET", `/v1/events/${id}`, params, options);
  }
};

// ../node_modules/stripe/esm/resources/ExchangeRates.js
var ExchangeRateResource = class extends StripeResource {
  static {
    __name(this, "ExchangeRateResource");
  }
  /**
   * [Deprecated] The ExchangeRate APIs are deprecated. Please use the [FX Quotes API](https://docs.stripe.com/payments/currencies/localize-prices/fx-quotes-api) instead.
   *
   * Returns a list of objects that contain the rates at which foreign currencies are converted to one another. Only shows the currencies for which Stripe supports.
   * @deprecated
   */
  list(params, options) {
    return this._makeRequest("GET", "/v1/exchange_rates", params, options, {
      methodType: "list"
    });
  }
  /**
   * [Deprecated] The ExchangeRate APIs are deprecated. Please use the [FX Quotes API](https://docs.stripe.com/payments/currencies/localize-prices/fx-quotes-api) instead.
   *
   * Retrieves the exchange rates from the given currency to every supported currency.
   * @deprecated
   */
  retrieve(id, params, options) {
    return this._makeRequest("GET", `/v1/exchange_rates/${id}`, params, options);
  }
};

// ../node_modules/stripe/esm/multipart.js
var multipartDataGenerator = /* @__PURE__ */ __name((method, data, headers) => {
  const segno = (Math.round(Math.random() * 1e16) + Math.round(Math.random() * 1e16)).toString();
  headers["Content-Type"] = `multipart/form-data; boundary=${segno}`;
  const textEncoder = new TextEncoder();
  let buffer = new Uint8Array(0);
  const endBuffer = textEncoder.encode("\r\n");
  function push(l) {
    const prevBuffer = buffer;
    const newBuffer = l instanceof Uint8Array ? l : new Uint8Array(textEncoder.encode(l));
    buffer = new Uint8Array(prevBuffer.length + newBuffer.length + 2);
    buffer.set(prevBuffer);
    buffer.set(newBuffer, prevBuffer.length);
    buffer.set(endBuffer, buffer.length - 2);
  }
  __name(push, "push");
  function q(s) {
    return `"${s.replace(/"|"/g, "%22").replace(/\r\n|\r|\n/g, " ")}"`;
  }
  __name(q, "q");
  const flattenedData = flattenAndStringify(data);
  for (const k in flattenedData) {
    if (!Object.prototype.hasOwnProperty.call(flattenedData, k)) {
      continue;
    }
    const v = flattenedData[k];
    push(`--${segno}`);
    if (Object.prototype.hasOwnProperty.call(v, "data")) {
      const typedEntry = v;
      push(`Content-Disposition: form-data; name=${q(k)}; filename=${q(typedEntry.name || "blob")}`);
      push(`Content-Type: ${typedEntry.type || "application/octet-stream"}`);
      push("");
      push(typedEntry.data);
    } else {
      push(`Content-Disposition: form-data; name=${q(k)}`);
      push("");
      push(v);
    }
  }
  push(`--${segno}--`);
  return buffer;
}, "multipartDataGenerator");
function multipartRequestDataProcessor(method, data, headers, callback) {
  data = data || {};
  if (method !== "POST") {
    return callback(null, queryStringifyRequestData(data));
  }
  this._stripe._platformFunctions.tryBufferData(data).then((bufferedData) => {
    const buffer = multipartDataGenerator(method, bufferedData, headers);
    return callback(null, buffer);
  }).catch((err) => callback(err, null));
}
__name(multipartRequestDataProcessor, "multipartRequestDataProcessor");

// ../node_modules/stripe/esm/resources/Files.js
var FileResource = class extends StripeResource {
  static {
    __name(this, "FileResource");
  }
  constructor() {
    super(...arguments);
    this.requestDataProcessor = multipartRequestDataProcessor;
  }
  /**
   * Returns a list of the files that your account has access to. Stripe sorts and returns the files by their creation dates, placing the most recently created files at the top.
   */
  list(params, options) {
    return this._makeRequest("GET", "/v1/files", params, options, {
      methodType: "list"
    });
  }
  /**
   * To upload a file to Stripe, you need to send a request of type multipart/form-data. Include the file you want to upload in the request, and the parameters for creating a file.
   *
   * All of Stripe's officially supported Client libraries support sending multipart/form-data.
   */
  create(params, options) {
    return this._makeRequest("POST", "/v1/files", params, options, {
      headers: {
        "Content-Type": "multipart/form-data"
      },
      apiBase: "files"
    });
  }
  /**
   * Retrieves the details of an existing file object. After you supply a unique file ID, Stripe returns the corresponding file object. Learn how to [access file contents](https://docs.stripe.com/docs/file-upload#download-file-contents).
   */
  retrieve(id, params, options) {
    return this._makeRequest("GET", `/v1/files/${id}`, params, options);
  }
};

// ../node_modules/stripe/esm/resources/FileLinks.js
var FileLinkResource = class extends StripeResource {
  static {
    __name(this, "FileLinkResource");
  }
  /**
   * Returns a list of file links.
   */
  list(params, options) {
    return this._makeRequest("GET", "/v1/file_links", params, options, {
      methodType: "list"
    });
  }
  /**
   * Creates a new file link object.
   */
  create(params, options) {
    return this._makeRequest("POST", "/v1/file_links", params, options);
  }
  /**
   * Retrieves the file link with the given ID.
   */
  retrieve(id, params, options) {
    return this._makeRequest("GET", `/v1/file_links/${id}`, params, options);
  }
  /**
   * Updates an existing file link object. Expired links can no longer be updated.
   */
  update(id, params, options) {
    return this._makeRequest("POST", `/v1/file_links/${id}`, params, options);
  }
};

// ../node_modules/stripe/esm/resources/Invoices.js
var InvoiceResource = class extends StripeResource {
  static {
    __name(this, "InvoiceResource");
  }
  /**
   * Permanently deletes a one-off invoice draft. This cannot be undone. Attempts to delete invoices that are no longer in a draft state will fail; once an invoice has been finalized or if an invoice is for a subscription, it must be [voided](https://docs.stripe.com/api/invoices/void).
   */
  del(id, params, options) {
    return this._makeRequest("DELETE", `/v1/invoices/${id}`, params, options);
  }
  /**
   * Retrieves the invoice with the given ID.
   */
  retrieve(id, params, options) {
    return this._makeRequest("GET", `/v1/invoices/${id}`, params, options, {
      responseSchema: {
        kind: "object",
        fields: {
          lines: {
            kind: "object",
            fields: {
              data: {
                kind: "array",
                element: {
                  kind: "object",
                  fields: {
                    pricing: {
                      kind: "nullable",
                      inner: {
                        kind: "object",
                        fields: {
                          unit_amount_decimal: {
                            kind: "nullable",
                            inner: { kind: "decimal_string" }
                          }
                        }
                      }
                    },
                    quantity_decimal: {
                      kind: "nullable",
                      inner: { kind: "decimal_string" }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });
  }
  /**
   * Draft invoices are fully editable. Once an invoice is [finalized](https://docs.stripe.com/docs/billing/invoices/workflow#finalized),
   * monetary values, as well as collection_method, become uneditable.
   *
   * If you would like to stop the Stripe Billing engine from automatically finalizing, reattempting payments on,
   * sending reminders for, or [automatically reconciling](https://docs.stripe.com/docs/billing/invoices/reconciliation) invoices, pass
   * auto_advance=false.
   */
  update(id, params, options) {
    return this._makeRequest("POST", `/v1/invoices/${id}`, params, options, {
      responseSchema: {
        kind: "object",
        fields: {
          lines: {
            kind: "object",
            fields: {
              data: {
                kind: "array",
                element: {
                  kind: "object",
                  fields: {
                    pricing: {
                      kind: "nullable",
                      inner: {
                        kind: "object",
                        fields: {
                          unit_amount_decimal: {
                            kind: "nullable",
                            inner: { kind: "decimal_string" }
                          }
                        }
                      }
                    },
                    quantity_decimal: {
                      kind: "nullable",
                      inner: { kind: "decimal_string" }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });
  }
  /**
   * You can list all invoices, or list the invoices for a specific customer. The invoices are returned sorted by creation date, with the most recently created invoices appearing first.
   */
  list(params, options) {
    return this._makeRequest("GET", "/v1/invoices", params, options, {
      methodType: "list",
      responseSchema: {
        kind: "object",
        fields: {
          data: {
            kind: "array",
            element: {
              kind: "object",
              fields: {
                lines: {
                  kind: "object",
                  fields: {
                    data: {
                      kind: "array",
                      element: {
                        kind: "object",
                        fields: {
                          pricing: {
                            kind: "nullable",
                            inner: {
                              kind: "object",
                              fields: {
                                unit_amount_decimal: {
                                  kind: "nullable",
                                  inner: { kind: "decimal_string" }
                                }
                              }
                            }
                          },
                          quantity_decimal: {
                            kind: "nullable",
                            inner: { kind: "decimal_string" }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });
  }
  /**
   * This endpoint creates a draft invoice for a given customer. The invoice remains a draft until you [finalize the invoice, which allows you to [pay](/api/invoices/pay) or <a href="/api/invoices/send">send](https://docs.stripe.com/api/invoices/finalize) the invoice to your customers.
   */
  create(params, options) {
    return this._makeRequest("POST", "/v1/invoices", params, options, {
      responseSchema: {
        kind: "object",
        fields: {
          lines: {
            kind: "object",
            fields: {
              data: {
                kind: "array",
                element: {
                  kind: "object",
                  fields: {
                    pricing: {
                      kind: "nullable",
                      inner: {
                        kind: "object",
                        fields: {
                          unit_amount_decimal: {
                            kind: "nullable",
                            inner: { kind: "decimal_string" }
                          }
                        }
                      }
                    },
                    quantity_decimal: {
                      kind: "nullable",
                      inner: { kind: "decimal_string" }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });
  }
  /**
   * Search for invoices you've previously created using Stripe's [Search Query Language](https://docs.stripe.com/docs/search#search-query-language).
   * Don't use search in read-after-write flows where strict consistency is necessary. Under normal operating
   * conditions, data is searchable in less than a minute. Occasionally, propagation of new or updated data can be up
   * to an hour behind during outages. Search functionality is not available to merchants in India.
   */
  search(params, options) {
    return this._makeRequest("GET", "/v1/invoices/search", params, options, {
      methodType: "search",
      responseSchema: {
        kind: "object",
        fields: {
          data: {
            kind: "array",
            element: {
              kind: "object",
              fields: {
                lines: {
                  kind: "object",
                  fields: {
                    data: {
                      kind: "array",
                      element: {
                        kind: "object",
                        fields: {
                          pricing: {
                            kind: "nullable",
                            inner: {
                              kind: "object",
                              fields: {
                                unit_amount_decimal: {
                                  kind: "nullable",
                                  inner: { kind: "decimal_string" }
                                }
                              }
                            }
                          },
                          quantity_decimal: {
                            kind: "nullable",
                            inner: { kind: "decimal_string" }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });
  }
  /**
   * Adds multiple line items to an invoice. This is only possible when an invoice is still a draft.
   */
  addLines(id, params, options) {
    return this._makeRequest("POST", `/v1/invoices/${id}/add_lines`, params, options, {
      requestSchema: {
        kind: "object",
        fields: {
          lines: {
            kind: "array",
            element: {
              kind: "object",
              fields: {
                price_data: {
                  kind: "object",
                  fields: { unit_amount_decimal: { kind: "decimal_string" } }
                },
                quantity_decimal: { kind: "decimal_string" }
              }
            }
          }
        }
      },
      responseSchema: {
        kind: "object",
        fields: {
          lines: {
            kind: "object",
            fields: {
              data: {
                kind: "array",
                element: {
                  kind: "object",
                  fields: {
                    pricing: {
                      kind: "nullable",
                      inner: {
                        kind: "object",
                        fields: {
                          unit_amount_decimal: {
                            kind: "nullable",
                            inner: { kind: "decimal_string" }
                          }
                        }
                      }
                    },
                    quantity_decimal: {
                      kind: "nullable",
                      inner: { kind: "decimal_string" }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });
  }
  /**
   * Attaches a PaymentIntent or an Out of Band Payment to the invoice, adding it to the list of payments.
   *
   * For the PaymentIntent, when the PaymentIntent's status changes to succeeded, the payment is credited
   * to the invoice, increasing its amount_paid. When the invoice is fully paid, the
   * invoice's status becomes paid.
   *
   * If the PaymentIntent's status is already succeeded when it's attached, it's
   * credited to the invoice immediately.
   *
   * See: [Partial payments](https://docs.stripe.com/docs/invoicing/partial-payments) to learn more.
   */
  attachPayment(id, params, options) {
    return this._makeRequest("POST", `/v1/invoices/${id}/attach_payment`, params, options, {
      responseSchema: {
        kind: "object",
        fields: {
          lines: {
            kind: "object",
            fields: {
              data: {
                kind: "array",
                element: {
                  kind: "object",
                  fields: {
                    pricing: {
                      kind: "nullable",
                      inner: {
                        kind: "object",
                        fields: {
                          unit_amount_decimal: {
                            kind: "nullable",
                            inner: { kind: "decimal_string" }
                          }
                        }
                      }
                    },
                    quantity_decimal: {
                      kind: "nullable",
                      inner: { kind: "decimal_string" }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });
  }
  /**
   * Stripe automatically finalizes drafts before sending and attempting payment on invoices. However, if you'd like to finalize a draft invoice manually, you can do so using this method.
   */
  finalizeInvoice(id, params, options) {
    return this._makeRequest("POST", `/v1/invoices/${id}/finalize`, params, options, {
      responseSchema: {
        kind: "object",
        fields: {
          lines: {
            kind: "object",
            fields: {
              data: {
                kind: "array",
                element: {
                  kind: "object",
                  fields: {
                    pricing: {
                      kind: "nullable",
                      inner: {
                        kind: "object",
                        fields: {
                          unit_amount_decimal: {
                            kind: "nullable",
                            inner: { kind: "decimal_string" }
                          }
                        }
                      }
                    },
                    quantity_decimal: {
                      kind: "nullable",
                      inner: { kind: "decimal_string" }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });
  }
  /**
   * Marking an invoice as uncollectible is useful for keeping track of bad debts that can be written off for accounting purposes.
   */
  markUncollectible(id, params, options) {
    return this._makeRequest("POST", `/v1/invoices/${id}/mark_uncollectible`, params, options, {
      responseSchema: {
        kind: "object",
        fields: {
          lines: {
            kind: "object",
            fields: {
              data: {
                kind: "array",
                element: {
                  kind: "object",
                  fields: {
                    pricing: {
                      kind: "nullable",
                      inner: {
                        kind: "object",
                        fields: {
                          unit_amount_decimal: {
                            kind: "nullable",
                            inner: { kind: "decimal_string" }
                          }
                        }
                      }
                    },
                    quantity_decimal: {
                      kind: "nullable",
                      inner: { kind: "decimal_string" }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });
  }
  /**
   * Stripe automatically creates and then attempts to collect payment on invoices for customers on subscriptions according to your [subscriptions settings](https://dashboard.stripe.com/account/billing/automatic). However, if you'd like to attempt payment on an invoice out of the normal collection schedule or for some other reason, you can do so.
   */
  pay(id, params, options) {
    return this._makeRequest("POST", `/v1/invoices/${id}/pay`, params, options, {
      responseSchema: {
        kind: "object",
        fields: {
          lines: {
            kind: "object",
            fields: {
              data: {
                kind: "array",
                element: {
                  kind: "object",
                  fields: {
                    pricing: {
                      kind: "nullable",
                      inner: {
                        kind: "object",
                        fields: {
                          unit_amount_decimal: {
                            kind: "nullable",
                            inner: { kind: "decimal_string" }
                          }
                        }
                      }
                    },
                    quantity_decimal: {
                      kind: "nullable",
                      inner: { kind: "decimal_string" }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });
  }
  /**
   * Removes multiple line items from an invoice. This is only possible when an invoice is still a draft.
   */
  removeLines(id, params, options) {
    return this._makeRequest("POST", `/v1/invoices/${id}/remove_lines`, params, options, {
      responseSchema: {
        kind: "object",
        fields: {
          lines: {
            kind: "object",
            fields: {
              data: {
                kind: "array",
                element: {
                  kind: "object",
                  fields: {
                    pricing: {
                      kind: "nullable",
                      inner: {
                        kind: "object",
                        fields: {
                          unit_amount_decimal: {
                            kind: "nullable",
                            inner: { kind: "decimal_string" }
                          }
                        }
                      }
                    },
                    quantity_decimal: {
                      kind: "nullable",
                      inner: { kind: "decimal_string" }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });
  }
  /**
   * Stripe will automatically send invoices to customers according to your [subscriptions settings](https://dashboard.stripe.com/account/billing/automatic). However, if you'd like to manually send an invoice to your customer out of the normal schedule, you can do so. When sending invoices that have already been paid, there will be no reference to the payment in the email.
   *
   * Requests made in test-mode result in no emails being sent, despite sending an invoice.sent event.
   */
  sendInvoice(id, params, options) {
    return this._makeRequest("POST", `/v1/invoices/${id}/send`, params, options, {
      responseSchema: {
        kind: "object",
        fields: {
          lines: {
            kind: "object",
            fields: {
              data: {
                kind: "array",
                element: {
                  kind: "object",
                  fields: {
                    pricing: {
                      kind: "nullable",
                      inner: {
                        kind: "object",
                        fields: {
                          unit_amount_decimal: {
                            kind: "nullable",
                            inner: { kind: "decimal_string" }
                          }
                        }
                      }
                    },
                    quantity_decimal: {
                      kind: "nullable",
                      inner: { kind: "decimal_string" }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });
  }
  /**
   * Updates multiple line items on an invoice. This is only possible when an invoice is still a draft.
   */
  updateLines(id, params, options) {
    return this._makeRequest("POST", `/v1/invoices/${id}/update_lines`, params, options, {
      requestSchema: {
        kind: "object",
        fields: {
          lines: {
            kind: "array",
            element: {
              kind: "object",
              fields: {
                price_data: {
                  kind: "object",
                  fields: { unit_amount_decimal: { kind: "decimal_string" } }
                },
                quantity_decimal: { kind: "decimal_string" }
              }
            }
          }
        }
      },
      responseSchema: {
        kind: "object",
        fields: {
          lines: {
            kind: "object",
            fields: {
              data: {
                kind: "array",
                element: {
                  kind: "object",
                  fields: {
                    pricing: {
                      kind: "nullable",
                      inner: {
                        kind: "object",
                        fields: {
                          unit_amount_decimal: {
                            kind: "nullable",
                            inner: { kind: "decimal_string" }
                          }
                        }
                      }
                    },
                    quantity_decimal: {
                      kind: "nullable",
                      inner: { kind: "decimal_string" }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });
  }
  /**
   * Mark a finalized invoice as void. This cannot be undone. Voiding an invoice is similar to [deletion](https://docs.stripe.com/api/invoices/delete), however it only applies to finalized invoices and maintains a papertrail where the invoice can still be found.
   *
   * Consult with local regulations to determine whether and how an invoice might be amended, canceled, or voided in the jurisdiction you're doing business in. You might need to [issue another invoice or <a href="/api/credit_notes/create">credit note](https://docs.stripe.com/api/invoices/create) instead. Stripe recommends that you consult with your legal counsel for advice specific to your business.
   */
  voidInvoice(id, params, options) {
    return this._makeRequest("POST", `/v1/invoices/${id}/void`, params, options, {
      responseSchema: {
        kind: "object",
        fields: {
          lines: {
            kind: "object",
            fields: {
              data: {
                kind: "array",
                element: {
                  kind: "object",
                  fields: {
                    pricing: {
                      kind: "nullable",
                      inner: {
                        kind: "object",
                        fields: {
                          unit_amount_decimal: {
                            kind: "nullable",
                            inner: { kind: "decimal_string" }
                          }
                        }
                      }
                    },
                    quantity_decimal: {
                      kind: "nullable",
                      inner: { kind: "decimal_string" }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });
  }
  /**
   * At any time, you can preview the upcoming invoice for a subscription or subscription schedule. This will show you all the charges that are pending, including subscription renewal charges, invoice item charges, etc. It will also show you any discounts that are applicable to the invoice.
   *
   * You can also preview the effects of creating or updating a subscription or subscription schedule, including a preview of any prorations that will take place. To ensure that the actual proration is calculated exactly the same as the previewed proration, you should pass the subscription_details.proration_date parameter when doing the actual subscription update.
   *
   * The recommended way to get only the prorations being previewed on the invoice is to consider line items where parent.subscription_item_details.proration is true.
   *
   * Note that when you are viewing an upcoming invoice, you are simply viewing a preview – the invoice has not yet been created. As such, the upcoming invoice will not show up in invoice listing calls, and you cannot use the API to pay or edit the invoice. If you want to change the amount that your customer will be billed, you can add, remove, or update pending invoice items, or update the customer's discount.
   *
   * Note: Currency conversion calculations use the latest exchange rates. Exchange rates may vary between the time of the preview and the time of the actual invoice creation. [Learn more](https://docs.stripe.com/currencies/conversions)
   */
  createPreview(params, options) {
    return this._makeRequest("POST", "/v1/invoices/create_preview", params, options, {
      requestSchema: {
        kind: "object",
        fields: {
          invoice_items: {
            kind: "array",
            element: {
              kind: "object",
              fields: {
                price_data: {
                  kind: "object",
                  fields: { unit_amount_decimal: { kind: "decimal_string" } }
                },
                quantity_decimal: { kind: "decimal_string" },
                unit_amount_decimal: { kind: "decimal_string" }
              }
            }
          },
          schedule_details: {
            kind: "object",
            fields: {
              phases: {
                kind: "array",
                element: {
                  kind: "object",
                  fields: {
                    add_invoice_items: {
                      kind: "array",
                      element: {
                        kind: "object",
                        fields: {
                          price_data: {
                            kind: "object",
                            fields: {
                              unit_amount_decimal: { kind: "decimal_string" }
                            }
                          }
                        }
                      }
                    },
                    items: {
                      kind: "array",
                      element: {
                        kind: "object",
                        fields: {
                          price_data: {
                            kind: "object",
                            fields: {
                              unit_amount_decimal: { kind: "decimal_string" }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          subscription_details: {
            kind: "object",
            fields: {
              items: {
                kind: "array",
                element: {
                  kind: "object",
                  fields: {
                    price_data: {
                      kind: "object",
                      fields: { unit_amount_decimal: { kind: "decimal_string" } }
                    }
                  }
                }
              }
            }
          }
        }
      },
      responseSchema: {
        kind: "object",
        fields: {
          lines: {
            kind: "object",
            fields: {
              data: {
                kind: "array",
                element: {
                  kind: "object",
                  fields: {
                    pricing: {
                      kind: "nullable",
                      inner: {
                        kind: "object",
                        fields: {
                          unit_amount_decimal: {
                            kind: "nullable",
                            inner: { kind: "decimal_string" }
                          }
                        }
                      }
                    },
                    quantity_decimal: {
                      kind: "nullable",
                      inner: { kind: "decimal_string" }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });
  }
  /**
   * When retrieving an invoice, you'll get a lines property containing the total count of line items and the first handful of those items. There is also a URL where you can retrieve the full (paginated) list of line items.
   */
  listLineItems(id, params, options) {
    return this._makeRequest("GET", `/v1/invoices/${id}/lines`, params, options, {
      methodType: "list",
      responseSchema: {
        kind: "object",
        fields: {
          data: {
            kind: "array",
            element: {
              kind: "object",
              fields: {
                pricing: {
                  kind: "nullable",
                  inner: {
                    kind: "object",
                    fields: {
                      unit_amount_decimal: {
                        kind: "nullable",
                        inner: { kind: "decimal_string" }
                      }
                    }
                  }
                },
                quantity_decimal: {
                  kind: "nullable",
                  inner: { kind: "decimal_string" }
                }
              }
            }
          }
        }
      }
    });
  }
  /**
   * Updates an invoice's line item. Some fields, such as tax_amounts, only live on the invoice line item,
   * so they can only be updated through this endpoint. Other fields, such as amount, live on both the invoice
   * item and the invoice line item, so updates on this endpoint will propagate to the invoice item as well.
   * Updating an invoice's line item is only possible before the invoice is finalized.
   */
  updateLineItem(invoiceId, id, params, options) {
    return this._makeRequest("POST", `/v1/invoices/${invoiceId}/lines/${id}`, params, options, {
      requestSchema: {
        kind: "object",
        fields: {
          price_data: {
            kind: "object",
            fields: { unit_amount_decimal: { kind: "decimal_string" } }
          },
          quantity_decimal: { kind: "decimal_string" }
        }
      },
      responseSchema: {
        kind: "object",
        fields: {
          pricing: {
            kind: "nullable",
            inner: {
              kind: "object",
              fields: {
                unit_amount_decimal: {
                  kind: "nullable",
                  inner: { kind: "decimal_string" }
                }
              }
            }
          },
          quantity_decimal: {
            kind: "nullable",
            inner: { kind: "decimal_string" }
          }
        }
      }
    });
  }
};

// ../node_modules/stripe/esm/resources/InvoiceItems.js
var InvoiceItemResource = class extends StripeResource {
  static {
    __name(this, "InvoiceItemResource");
  }
  /**
   * Deletes an invoice item, removing it from an invoice. Deleting invoice items is only possible when they're not attached to invoices, or if it's attached to a draft invoice.
   */
  del(id, params, options) {
    return this._makeRequest("DELETE", `/v1/invoiceitems/${id}`, params, options);
  }
  /**
   * Retrieves the invoice item with the given ID.
   */
  retrieve(id, params, options) {
    return this._makeRequest("GET", `/v1/invoiceitems/${id}`, params, options, {
      responseSchema: {
        kind: "object",
        fields: {
          pricing: {
            kind: "nullable",
            inner: {
              kind: "object",
              fields: {
                unit_amount_decimal: {
                  kind: "nullable",
                  inner: { kind: "decimal_string" }
                }
              }
            }
          },
          quantity_decimal: { kind: "decimal_string" }
        }
      }
    });
  }
  /**
   * Updates the amount or description of an invoice item on an upcoming invoice. Updating an invoice item is only possible before the invoice it's attached to is closed.
   */
  update(id, params, options) {
    return this._makeRequest("POST", `/v1/invoiceitems/${id}`, params, options, {
      requestSchema: {
        kind: "object",
        fields: {
          price_data: {
            kind: "object",
            fields: { unit_amount_decimal: { kind: "decimal_string" } }
          },
          quantity_decimal: { kind: "decimal_string" },
          unit_amount_decimal: { kind: "decimal_string" }
        }
      },
      responseSchema: {
        kind: "object",
        fields: {
          pricing: {
            kind: "nullable",
            inner: {
              kind: "object",
              fields: {
                unit_amount_decimal: {
                  kind: "nullable",
                  inner: { kind: "decimal_string" }
                }
              }
            }
          },
          quantity_decimal: { kind: "decimal_string" }
        }
      }
    });
  }
  /**
   * Returns a list of your invoice items. Invoice items are returned sorted by creation date, with the most recently created invoice items appearing first.
   */
  list(params, options) {
    return this._makeRequest("GET", "/v1/invoiceitems", params, options, {
      methodType: "list",
      responseSchema: {
        kind: "object",
        fields: {
          data: {
            kind: "array",
            element: {
              kind: "object",
              fields: {
                pricing: {
                  kind: "nullable",
                  inner: {
                    kind: "object",
                    fields: {
                      unit_amount_decimal: {
                        kind: "nullable",
                        inner: { kind: "decimal_string" }
                      }
                    }
                  }
                },
                quantity_decimal: { kind: "decimal_string" }
              }
            }
          }
        }
      }
    });
  }
  /**
   * Creates an item to be added to a draft invoice (up to 250 items per invoice). If no invoice is specified, the item will be on the next invoice created for the customer specified.
   */
  create(params, options) {
    return this._makeRequest("POST", "/v1/invoiceitems", params, options, {
      requestSchema: {
        kind: "object",
        fields: {
          price_data: {
            kind: "object",
            fields: { unit_amount_decimal: { kind: "decimal_string" } }
          },
          quantity_decimal: { kind: "decimal_string" },
          unit_amount_decimal: { kind: "decimal_string" }
        }
      },
      responseSchema: {
        kind: "object",
        fields: {
          pricing: {
            kind: "nullable",
            inner: {
              kind: "object",
              fields: {
                unit_amount_decimal: {
                  kind: "nullable",
                  inner: { kind: "decimal_string" }
                }
              }
            }
          },
          quantity_decimal: { kind: "decimal_string" }
        }
      }
    });
  }
};

// ../node_modules/stripe/esm/resources/InvoicePayments.js
var InvoicePaymentResource = class extends StripeResource {
  static {
    __name(this, "InvoicePaymentResource");
  }
  /**
   * When retrieving an invoice, there is an includable payments property containing the first handful of those items. There is also a URL where you can retrieve the full (paginated) list of payments.
   */
  list(params, options) {
    return this._makeRequest("GET", "/v1/invoice_payments", params, options, {
      methodType: "list"
    });
  }
  /**
   * Retrieves the invoice payment with the given ID.
   */
  retrieve(id, params, options) {
    return this._makeRequest("GET", `/v1/invoice_payments/${id}`, params, options);
  }
};

// ../node_modules/stripe/esm/resources/InvoiceRenderingTemplates.js
var InvoiceRenderingTemplateResource = class extends StripeResource {
  static {
    __name(this, "InvoiceRenderingTemplateResource");
  }
  /**
   * List all templates, ordered by creation date, with the most recently created template appearing first.
   */
  list(params, options) {
    return this._makeRequest("GET", "/v1/invoice_rendering_templates", params, options, {
      methodType: "list"
    });
  }
  /**
   * Retrieves an invoice rendering template with the given ID. It by default returns the latest version of the template. Optionally, specify a version to see previous versions.
   */
  retrieve(id, params, options) {
    return this._makeRequest("GET", `/v1/invoice_rendering_templates/${id}`, params, options);
  }
  /**
   * Updates the status of an invoice rendering template to ‘archived' so no new Stripe objects (customers, invoices, etc.) can reference it. The template can also no longer be updated. However, if the template is already set on a Stripe object, it will continue to be applied on invoices generated by it.
   */
  archive(id, params, options) {
    return this._makeRequest("POST", `/v1/invoice_rendering_templates/${id}/archive`, params, options);
  }
  /**
   * Unarchive an invoice rendering template so it can be used on new Stripe objects again.
   */
  unarchive(id, params, options) {
    return this._makeRequest("POST", `/v1/invoice_rendering_templates/${id}/unarchive`, params, options);
  }
};

// ../node_modules/stripe/esm/resources/Mandates.js
var MandateResource = class extends StripeResource {
  static {
    __name(this, "MandateResource");
  }
  /**
   * Retrieves a Mandate object.
   */
  retrieve(id, params, options) {
    return this._makeRequest("GET", `/v1/mandates/${id}`, params, options);
  }
};

// ../node_modules/stripe/esm/resources/OAuth.js
var OAuthResource = class extends StripeResource {
  static {
    __name(this, "OAuthResource");
  }
  constructor() {
    super(...arguments);
    this.basePath = makeURLInterpolator("/");
  }
  authorizeUrl(params, options) {
    params = params || {};
    options = options || {};
    let path = "oauth/authorize";
    if (options.express) {
      path = `express/${path}`;
    }
    if (!params.response_type) {
      params.response_type = "code";
    }
    if (!params.client_id) {
      params.client_id = this._stripe.getClientId();
    }
    if (!params.scope) {
      params.scope = "read_write";
    }
    const connectHost = this._stripe.resolveBaseAddress("connect");
    return `https://${connectHost}/${path}?${queryStringifyRequestData(params)}`;
  }
  token(params, options) {
    return this._makeRequest("POST", "/oauth/token", params, options, {
      apiBase: "connect"
    });
  }
  deauthorize(params, options) {
    if (!params.client_id) {
      params.client_id = this._stripe.getClientId();
    }
    return this._makeRequest("POST", "/oauth/deauthorize", params, options, {
      apiBase: "connect"
    });
  }
};

// ../node_modules/stripe/esm/resources/PaymentAttemptRecords.js
var PaymentAttemptRecordResource = class extends StripeResource {
  static {
    __name(this, "PaymentAttemptRecordResource");
  }
  /**
   * List all the Payment Attempt Records attached to the specified Payment Record.
   */
  list(params, options) {
    return this._makeRequest("GET", "/v1/payment_attempt_records", params, options, {
      methodType: "list"
    });
  }
  /**
   * Retrieves a Payment Attempt Record with the given ID
   */
  retrieve(id, params, options) {
    return this._makeRequest("GET", `/v1/payment_attempt_records/${id}`, params, options);
  }
};

// ../node_modules/stripe/esm/resources/PaymentIntents.js
var PaymentIntentResource = class extends StripeResource {
  static {
    __name(this, "PaymentIntentResource");
  }
  /**
   * Returns a list of PaymentIntents.
   */
  list(params, options) {
    return this._makeRequest("GET", "/v1/payment_intents", params, options, {
      methodType: "list"
    });
  }
  /**
   * Creates a PaymentIntent object.
   *
   * After the PaymentIntent is created, attach a payment method and [confirm](https://docs.stripe.com/docs/api/payment_intents/confirm)
   * to continue the payment. Learn more about <a href="/docs/payments/payment-intents">the available payment flows
   * with the Payment Intents API.
   *
   * When you use confirm=true during creation, it's equivalent to creating
   * and confirming the PaymentIntent in the same call. You can use any parameters
   * available in the [confirm API](https://docs.stripe.com/docs/api/payment_intents/confirm) when you supply
   * confirm=true.
   */
  create(params, options) {
    return this._makeRequest("POST", "/v1/payment_intents", params, options);
  }
  /**
   * Retrieves the details of a PaymentIntent that has previously been created.
   *
   * You can retrieve a PaymentIntent client-side using a publishable key when the client_secret is in the query string.
   *
   * If you retrieve a PaymentIntent with a publishable key, it only returns a subset of properties. Refer to the [payment intent](https://docs.stripe.com/api#payment_intent_object) object reference for more details.
   */
  retrieve(id, params, options) {
    return this._makeRequest("GET", `/v1/payment_intents/${id}`, params, options);
  }
  /**
   * Updates properties on a PaymentIntent object without confirming.
   *
   * Depending on which properties you update, you might need to confirm the
   * PaymentIntent again. For example, updating the payment_method
   * always requires you to confirm the PaymentIntent again. If you prefer to
   * update and confirm at the same time, we recommend updating properties through
   * the [confirm API](https://docs.stripe.com/docs/api/payment_intents/confirm) instead.
   */
  update(id, params, options) {
    return this._makeRequest("POST", `/v1/payment_intents/${id}`, params, options);
  }
  /**
   * Search for PaymentIntents you've previously created using Stripe's [Search Query Language](https://docs.stripe.com/docs/search#search-query-language).
   * Don't use search in read-after-write flows where strict consistency is necessary. Under normal operating
   * conditions, data is searchable in less than a minute. Occasionally, propagation of new or updated data can be up
   * to an hour behind during outages. Search functionality is not available to merchants in India.
   */
  search(params, options) {
    return this._makeRequest("GET", "/v1/payment_intents/search", params, options, {
      methodType: "search"
    });
  }
  /**
   * Manually reconcile the remaining amount for a customer_balance PaymentIntent.
   */
  applyCustomerBalance(id, params, options) {
    return this._makeRequest("POST", `/v1/payment_intents/${id}/apply_customer_balance`, params, options);
  }
  /**
   * You can cancel a PaymentIntent object when it's in one of these statuses: requires_payment_method, requires_capture, requires_confirmation, requires_action or, [in rare cases](https://docs.stripe.com/docs/payments/intents), processing.
   *
   * After it's canceled, no additional charges are made by the PaymentIntent and any operations on the PaymentIntent fail with an error. For PaymentIntents with a status of requires_capture, the remaining amount_capturable is automatically refunded.
   *
   * You can directly cancel the PaymentIntent for a Checkout Session only when the PaymentIntent has a status of requires_capture. Otherwise, you must [expire the Checkout Session](https://docs.stripe.com/docs/api/checkout/sessions/expire).
   */
  cancel(id, params, options) {
    return this._makeRequest("POST", `/v1/payment_intents/${id}/cancel`, params, options);
  }
  /**
   * Capture the funds of an existing uncaptured PaymentIntent when its status is requires_capture.
   *
   * Uncaptured PaymentIntents are cancelled a set number of days (7 by default) after their creation.
   *
   * Learn more about [separate authorization and capture](https://docs.stripe.com/docs/payments/capture-later).
   */
  capture(id, params, options) {
    return this._makeRequest("POST", `/v1/payment_intents/${id}/capture`, params, options);
  }
  /**
   * Confirm that your customer intends to pay with current or provided
   * payment method. Upon confirmation, the PaymentIntent will attempt to initiate
   * a payment.
   *
   * If the selected payment method requires additional authentication steps, the
   * PaymentIntent will transition to the requires_action status and
   * suggest additional actions via next_action. If payment fails,
   * the PaymentIntent transitions to the requires_payment_method status or the
   * canceled status if the confirmation limit is reached. If
   * payment succeeds, the PaymentIntent will transition to the succeeded
   * status (or requires_capture, if capture_method is set to manual).
   *
   * If the confirmation_method is automatic, payment may be attempted
   * using our [client SDKs](https://docs.stripe.com/docs/stripe-js/reference#stripe-handle-card-payment)
   * and the PaymentIntent's [client_secret](https://docs.stripe.com/api#payment_intent_object-client_secret).
   * After next_actions are handled by the client, no additional
   * confirmation is required to complete the payment.
   *
   * If the confirmation_method is manual, all payment attempts must be
   * initiated using a secret key.
   *
   * If any actions are required for the payment, the PaymentIntent will
   * return to the requires_confirmation state
   * after those actions are completed. Your server needs to then
   * explicitly re-confirm the PaymentIntent to initiate the next payment
   * attempt.
   *
   * There is a variable upper limit on how many times a PaymentIntent can be confirmed.
   * After this limit is reached, any further calls to this endpoint will
   * transition the PaymentIntent to the canceled state.
   */
  confirm(id, params, options) {
    return this._makeRequest("POST", `/v1/payment_intents/${id}/confirm`, params, options);
  }
  /**
   * Perform an incremental authorization on an eligible
   * [PaymentIntent](https://docs.stripe.com/docs/api/payment_intents/object). To be eligible, the
   * PaymentIntent's status must be requires_capture and
   * [incremental_authorization_supported](https://docs.stripe.com/docs/api/charges/object#charge_object-payment_method_details-card_present-incremental_authorization_supported)
   * must be true.
   *
   * Incremental authorizations attempt to increase the authorized amount on
   * your customer's card to the new, higher amount provided. Similar to the
   * initial authorization, incremental authorizations can be declined. A
   * single PaymentIntent can call this endpoint multiple times to further
   * increase the authorized amount.
   *
   * If the incremental authorization succeeds, the PaymentIntent object
   * returns with the updated
   * [amount](https://docs.stripe.com/docs/api/payment_intents/object#payment_intent_object-amount).
   * If the incremental authorization fails, a
   * [card_declined](https://docs.stripe.com/docs/error-codes#card-declined) error returns, and no other
   * fields on the PaymentIntent or Charge update. The PaymentIntent
   * object remains capturable for the previously authorized amount.
   *
   * Each PaymentIntent can have a maximum of 10 incremental authorization attempts, including declines.
   * After it's captured, a PaymentIntent can no longer be incremented.
   *
   * Learn more about [incremental authorizations](https://docs.stripe.com/docs/terminal/features/incremental-authorizations).
   */
  incrementAuthorization(id, params, options) {
    return this._makeRequest("POST", `/v1/payment_intents/${id}/increment_authorization`, params, options);
  }
  /**
   * Verifies microdeposits on a PaymentIntent object.
   */
  verifyMicrodeposits(id, params, options) {
    return this._makeRequest("POST", `/v1/payment_intents/${id}/verify_microdeposits`, params, options);
  }
  /**
   * Lists all LineItems of a given PaymentIntent.
   */
  listAmountDetailsLineItems(id, params, options) {
    return this._makeRequest("GET", `/v1/payment_intents/${id}/amount_details_line_items`, params, options, {
      methodType: "list"
    });
  }
};

// ../node_modules/stripe/esm/resources/PaymentLinks.js
var PaymentLinkResource = class extends StripeResource {
  static {
    __name(this, "PaymentLinkResource");
  }
  /**
   * Returns a list of your payment links.
   */
  list(params, options) {
    return this._makeRequest("GET", "/v1/payment_links", params, options, {
      methodType: "list",
      responseSchema: {
        kind: "object",
        fields: {
          data: {
            kind: "array",
            element: {
              kind: "object",
              fields: {
                line_items: {
                  kind: "object",
                  fields: {
                    data: {
                      kind: "array",
                      element: {
                        kind: "object",
                        fields: {
                          price: {
                            kind: "nullable",
                            inner: {
                              kind: "object",
                              fields: {
                                currency_options: {
                                  kind: "array",
                                  element: {
                                    kind: "object",
                                    fields: {
                                      tiers: {
                                        kind: "array",
                                        element: {
                                          kind: "object",
                                          fields: {
                                            flat_amount_decimal: {
                                              kind: "nullable",
                                              inner: { kind: "decimal_string" }
                                            },
                                            unit_amount_decimal: {
                                              kind: "nullable",
                                              inner: { kind: "decimal_string" }
                                            }
                                          }
                                        }
                                      },
                                      unit_amount_decimal: {
                                        kind: "nullable",
                                        inner: { kind: "decimal_string" }
                                      }
                                    }
                                  }
                                },
                                tiers: {
                                  kind: "array",
                                  element: {
                                    kind: "object",
                                    fields: {
                                      flat_amount_decimal: {
                                        kind: "nullable",
                                        inner: { kind: "decimal_string" }
                                      },
                                      unit_amount_decimal: {
                                        kind: "nullable",
                                        inner: { kind: "decimal_string" }
                                      }
                                    }
                                  }
                                },
                                unit_amount_decimal: {
                                  kind: "nullable",
                                  inner: { kind: "decimal_string" }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });
  }
  /**
   * Creates a payment link.
   */
  create(params, options) {
    return this._makeRequest("POST", "/v1/payment_links", params, options, {
      requestSchema: {
        kind: "object",
        fields: {
          line_items: {
            kind: "array",
            element: {
              kind: "object",
              fields: {
                price_data: {
                  kind: "object",
                  fields: { unit_amount_decimal: { kind: "decimal_string" } }
                }
              }
            }
          }
        }
      },
      responseSchema: {
        kind: "object",
        fields: {
          line_items: {
            kind: "object",
            fields: {
              data: {
                kind: "array",
                element: {
                  kind: "object",
                  fields: {
                    price: {
                      kind: "nullable",
                      inner: {
                        kind: "object",
                        fields: {
                          currency_options: {
                            kind: "array",
                            element: {
                              kind: "object",
                              fields: {
                                tiers: {
                                  kind: "array",
                                  element: {
                                    kind: "object",
                                    fields: {
                                      flat_amount_decimal: {
                                        kind: "nullable",
                                        inner: { kind: "decimal_string" }
                                      },
                                      unit_amount_decimal: {
                                        kind: "nullable",
                                        inner: { kind: "decimal_string" }
                                      }
                                    }
                                  }
                                },
                                unit_amount_decimal: {
                                  kind: "nullable",
                                  inner: { kind: "decimal_string" }
                                }
                              }
                            }
                          },
                          tiers: {
                            kind: "array",
                            element: {
                              kind: "object",
                              fields: {
                                flat_amount_decimal: {
                                  kind: "nullable",
                                  inner: { kind: "decimal_string" }
                                },
                                unit_amount_decimal: {
                                  kind: "nullable",
                                  inner: { kind: "decimal_string" }
                                }
                              }
                            }
                          },
                          unit_amount_decimal: {
                            kind: "nullable",
                            inner: { kind: "decimal_string" }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });
  }
  /**
   * Retrieve a payment link.
   */
  retrieve(id, params, options) {
    return this._makeRequest("GET", `/v1/payment_links/${id}`, params, options, {
      responseSchema: {
        kind: "object",
        fields: {
          line_items: {
            kind: "object",
            fields: {
              data: {
                kind: "array",
                element: {
                  kind: "object",
                  fields: {
                    price: {
                      kind: "nullable",
                      inner: {
                        kind: "object",
                        fields: {
                          currency_options: {
                            kind: "array",
                            element: {
                              kind: "object",
                              fields: {
                                tiers: {
                                  kind: "array",
                                  element: {
                                    kind: "object",
                                    fields: {
                                      flat_amount_decimal: {
                                        kind: "nullable",
                                        inner: { kind: "decimal_string" }
                                      },
                                      unit_amount_decimal: {
                                        kind: "nullable",
                                        inner: { kind: "decimal_string" }
                                      }
                                    }
                                  }
                                },
                                unit_amount_decimal: {
                                  kind: "nullable",
                                  inner: { kind: "decimal_string" }
                                }
                              }
                            }
                          },
                          tiers: {
                            kind: "array",
                            element: {
                              kind: "object",
                              fields: {
                                flat_amount_decimal: {
                                  kind: "nullable",
                                  inner: { kind: "decimal_string" }
                                },
                                unit_amount_decimal: {
                                  kind: "nullable",
                                  inner: { kind: "decimal_string" }
                                }
                              }
                            }
                          },
                          unit_amount_decimal: {
                            kind: "nullable",
                            inner: { kind: "decimal_string" }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });
  }
  /**
   * Updates a payment link.
   */
  update(id, params, options) {
    return this._makeRequest("POST", `/v1/payment_links/${id}`, params, options, {
      responseSchema: {
        kind: "object",
        fields: {
          line_items: {
            kind: "object",
            fields: {
              data: {
                kind: "array",
                element: {
                  kind: "object",
                  fields: {
                    price: {
                      kind: "nullable",
                      inner: {
                        kind: "object",
                        fields: {
                          currency_options: {
                            kind: "array",
                            element: {
                              kind: "object",
                              fields: {
                                tiers: {
                                  kind: "array",
                                  element: {
                                    kind: "object",
                                    fields: {
                                      flat_amount_decimal: {
                                        kind: "nullable",
                                        inner: { kind: "decimal_string" }
                                      },
                                      unit_amount_decimal: {
                                        kind: "nullable",
                                        inner: { kind: "decimal_string" }
                                      }
                                    }
                                  }
                                },
                                unit_amount_decimal: {
                                  kind: "nullable",
                                  inner: { kind: "decimal_string" }
                                }
                              }
                            }
                          },
                          tiers: {
                            kind: "array",
                            element: {
                              kind: "object",
                              fields: {
                                flat_amount_decimal: {
                                  kind: "nullable",
                                  inner: { kind: "decimal_string" }
                                },
                                unit_amount_decimal: {
                                  kind: "nullable",
                                  inner: { kind: "decimal_string" }
                                }
                              }
                            }
                          },
                          unit_amount_decimal: {
                            kind: "nullable",
                            inner: { kind: "decimal_string" }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });
  }
  /**
   * When retrieving a payment link, there is an includable line_items property containing the first handful of those items. There is also a URL where you can retrieve the full (paginated) list of line items.
   */
  listLineItems(id, params, options) {
    return this._makeRequest("GET", `/v1/payment_links/${id}/line_items`, params, options, {
      methodType: "list",
      responseSchema: {
        kind: "object",
        fields: {
          data: {
            kind: "array",
            element: {
              kind: "object",
              fields: {
                price: {
                  kind: "nullable",
                  inner: {
                    kind: "object",
                    fields: {
                      currency_options: {
                        kind: "array",
                        element: {
                          kind: "object",
                          fields: {
                            tiers: {
                              kind: "array",
                              element: {
                                kind: "object",
                                fields: {
                                  flat_amount_decimal: {
                                    kind: "nullable",
                                    inner: { kind: "decimal_string" }
                                  },
                                  unit_amount_decimal: {
                                    kind: "nullable",
                                    inner: { kind: "decimal_string" }
                                  }
                                }
                              }
                            },
                            unit_amount_decimal: {
                              kind: "nullable",
                              inner: { kind: "decimal_string" }
                            }
                          }
                        }
                      },
                      tiers: {
                        kind: "array",
                        element: {
                          kind: "object",
                          fields: {
                            flat_amount_decimal: {
                              kind: "nullable",
                              inner: { kind: "decimal_string" }
                            },
                            unit_amount_decimal: {
                              kind: "nullable",
                              inner: { kind: "decimal_string" }
                            }
                          }
                        }
                      },
                      unit_amount_decimal: {
                        kind: "nullable",
                        inner: { kind: "decimal_string" }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });
  }
};

// ../node_modules/stripe/esm/resources/PaymentMethods.js
var PaymentMethodResource = class extends StripeResource {
  static {
    __name(this, "PaymentMethodResource");
  }
  /**
   * Returns a list of all PaymentMethods.
   */
  list(params, options) {
    return this._makeRequest("GET", "/v1/payment_methods", params, options, {
      methodType: "list"
    });
  }
  /**
   * Creates a PaymentMethod object. Read the [Stripe.js reference](https://docs.stripe.com/docs/stripe-js/reference#stripe-create-payment-method) to learn how to create PaymentMethods via Stripe.js.
   *
   * Instead of creating a PaymentMethod directly, we recommend using the [PaymentIntents API to accept a payment immediately or the <a href="/docs/payments/save-and-reuse">SetupIntent](https://docs.stripe.com/docs/payments/accept-a-payment) API to collect payment method details ahead of a future payment.
   */
  create(params, options) {
    return this._makeRequest("POST", "/v1/payment_methods", params, options);
  }
  /**
   * Retrieves a PaymentMethod object attached to the StripeAccount. To retrieve a payment method attached to a Customer, you should use [Retrieve a Customer's PaymentMethods](https://docs.stripe.com/docs/api/payment_methods/customer)
   */
  retrieve(id, params, options) {
    return this._makeRequest("GET", `/v1/payment_methods/${id}`, params, options);
  }
  /**
   * Updates a PaymentMethod object. A PaymentMethod must be attached to a customer to be updated.
   */
  update(id, params, options) {
    return this._makeRequest("POST", `/v1/payment_methods/${id}`, params, options);
  }
  /**
   * Attaches a PaymentMethod object to a Customer.
   *
   * To attach a new PaymentMethod to a customer for future payments, we recommend you use a [SetupIntent](https://docs.stripe.com/docs/api/setup_intents)
   * or a PaymentIntent with [setup_future_usage](https://docs.stripe.com/docs/api/payment_intents/create#create_payment_intent-setup_future_usage).
   * These approaches will perform any necessary steps to set up the PaymentMethod for future payments. Using the /v1/payment_methods/:id/attach
   * endpoint without first using a SetupIntent or PaymentIntent with setup_future_usage does not optimize the PaymentMethod for
   * future use, which makes later declines and payment friction more likely.
   * See [Optimizing cards for future payments](https://docs.stripe.com/docs/payments/payment-intents#future-usage) for more information about setting up
   * future payments.
   *
   * To use this PaymentMethod as the default for invoice or subscription payments,
   * set [invoice_settings.default_payment_method](https://docs.stripe.com/docs/api/customers/update#update_customer-invoice_settings-default_payment_method),
   * on the Customer to the PaymentMethod's ID.
   */
  attach(id, params, options) {
    return this._makeRequest("POST", `/v1/payment_methods/${id}/attach`, params, options);
  }
  /**
   * Detaches a PaymentMethod object from a Customer. After a PaymentMethod is detached, it can no longer be used for a payment or re-attached to a Customer.
   */
  detach(id, params, options) {
    return this._makeRequest("POST", `/v1/payment_methods/${id}/detach`, params, options);
  }
};

// ../node_modules/stripe/esm/resources/PaymentMethodConfigurations.js
var PaymentMethodConfigurationResource = class extends StripeResource {
  static {
    __name(this, "PaymentMethodConfigurationResource");
  }
  /**
   * List payment method configurations
   */
  list(params, options) {
    return this._makeRequest("GET", "/v1/payment_method_configurations", params, options, {
      methodType: "list"
    });
  }
  /**
   * Creates a payment method configuration
   */
  create(params, options) {
    return this._makeRequest("POST", "/v1/payment_method_configurations", params, options);
  }
  /**
   * Retrieve payment method configuration
   */
  retrieve(id, params, options) {
    return this._makeRequest("GET", `/v1/payment_method_configurations/${id}`, params, options);
  }
  /**
   * Update payment method configuration
   */
  update(id, params, options) {
    return this._makeRequest("POST", `/v1/payment_method_configurations/${id}`, params, options);
  }
};

// ../node_modules/stripe/esm/resources/PaymentMethodDomains.js
var PaymentMethodDomainResource = class extends StripeResource {
  static {
    __name(this, "PaymentMethodDomainResource");
  }
  /**
   * Lists the details of existing payment method domains.
   */
  list(params, options) {
    return this._makeRequest("GET", "/v1/payment_method_domains", params, options, {
      methodType: "list"
    });
  }
  /**
   * Creates a payment method domain.
   */
  create(params, options) {
    return this._makeRequest("POST", "/v1/payment_method_domains", params, options);
  }
  /**
   * Retrieves the details of an existing payment method domain.
   */
  retrieve(id, params, options) {
    return this._makeRequest("GET", `/v1/payment_method_domains/${id}`, params, options);
  }
  /**
   * Updates an existing payment method domain.
   */
  update(id, params, options) {
    return this._makeRequest("POST", `/v1/payment_method_domains/${id}`, params, options);
  }
  /**
   * Some payment methods might require additional steps to register a domain. If the requirements weren't satisfied when the domain was created, the payment method will be inactive on the domain.
   * The payment method doesn't appear in Elements or Embedded Checkout for this domain until it is active.
   *
   * To activate a payment method on an existing payment method domain, complete the required registration steps specific to the payment method, and then validate the payment method domain with this endpoint.
   *
   * Related guides: [Payment method domains](https://docs.stripe.com/docs/payments/payment-methods/pmd-registration).
   */
  validate(id, params, options) {
    return this._makeRequest("POST", `/v1/payment_method_domains/${id}/validate`, params, options);
  }
};

// ../node_modules/stripe/esm/resources/PaymentRecords.js
var PaymentRecordResource = class extends StripeResource {
  static {
    __name(this, "PaymentRecordResource");
  }
  /**
   * Retrieves a Payment Record with the given ID
   */
  retrieve(id, params, options) {
    return this._makeRequest("GET", `/v1/payment_records/${id}`, params, options);
  }
  /**
   * Report a new payment attempt on the specified Payment Record. A new payment
   *  attempt can only be specified if all other payment attempts are canceled or failed.
   */
  reportPaymentAttempt(id, params, options) {
    return this._makeRequest("POST", `/v1/payment_records/${id}/report_payment_attempt`, params, options);
  }
  /**
   * Report that the most recent payment attempt on the specified Payment Record
   *  was canceled.
   */
  reportPaymentAttemptCanceled(id, params, options) {
    return this._makeRequest("POST", `/v1/payment_records/${id}/report_payment_attempt_canceled`, params, options);
  }
  /**
   * Report that the most recent payment attempt on the specified Payment Record
   *  failed or errored.
   */
  reportPaymentAttemptFailed(id, params, options) {
    return this._makeRequest("POST", `/v1/payment_records/${id}/report_payment_attempt_failed`, params, options);
  }
  /**
   * Report that the most recent payment attempt on the specified Payment Record
   *  was guaranteed.
   */
  reportPaymentAttemptGuaranteed(id, params, options) {
    return this._makeRequest("POST", `/v1/payment_records/${id}/report_payment_attempt_guaranteed`, params, options);
  }
  /**
   * Report informational updates on the specified Payment Record.
   */
  reportPaymentAttemptInformational(id, params, options) {
    return this._makeRequest("POST", `/v1/payment_records/${id}/report_payment_attempt_informational`, params, options);
  }
  /**
   * Report that the most recent payment attempt on the specified Payment Record
   *  was refunded.
   */
  reportRefund(id, params, options) {
    return this._makeRequest("POST", `/v1/payment_records/${id}/report_refund`, params, options);
  }
  /**
   * Report a new Payment Record. You may report a Payment Record as it is
   *  initialized and later report updates through the other report_* methods, or report Payment
   *  Records in a terminal state directly, through this method.
   */
  reportPayment(params, options) {
    return this._makeRequest("POST", "/v1/payment_records/report_payment", params, options);
  }
};

// ../node_modules/stripe/esm/resources/Payouts.js
var PayoutResource = class extends StripeResource {
  static {
    __name(this, "PayoutResource");
  }
  /**
   * Returns a list of existing payouts sent to third-party bank accounts or payouts that Stripe sent to you. The payouts return in sorted order, with the most recently created payouts appearing first.
   */
  list(params, options) {
    return this._makeRequest("GET", "/v1/payouts", params, options, {
      methodType: "list"
    });
  }
  /**
   * To send funds to your own bank account, create a new payout object. Your [Stripe balance](https://docs.stripe.com/api#balance) must cover the payout amount. If it doesn't, you receive an “Insufficient Funds” error.
   *
   * If your API key is in test mode, money won't actually be sent, though every other action occurs as if you're in live mode.
   *
   * If you create a manual payout on a Stripe account that uses multiple payment source types, you need to specify the source type balance that the payout draws from. The [balance object](https://docs.stripe.com/api/balances/object) details available and pending amounts by source type.
   */
  create(params, options) {
    return this._makeRequest("POST", "/v1/payouts", params, options);
  }
  /**
   * Retrieves the details of an existing payout. Supply the unique payout ID from either a payout creation request or the payout list. Stripe returns the corresponding payout information.
   */
  retrieve(id, params, options) {
    return this._makeRequest("GET", `/v1/payouts/${id}`, params, options);
  }
  /**
   * Updates the specified payout by setting the values of the parameters you pass. We don't change parameters that you don't provide. This request only accepts the metadata as arguments.
   */
  update(id, params, options) {
    return this._makeRequest("POST", `/v1/payouts/${id}`, params, options);
  }
  /**
   * You can cancel a previously created payout if its status is pending. Stripe refunds the funds to your available balance. You can't cancel automatic Stripe payouts.
   */
  cancel(id, params, options) {
    return this._makeRequest("POST", `/v1/payouts/${id}/cancel`, params, options);
  }
  /**
   * Reverses a payout by debiting the destination bank account. At this time, you can only reverse payouts for connected accounts to US and Canadian bank accounts. If the payout is manual and in the pending status, use /v1/payouts/:id/cancel instead.
   *
   * By requesting a reversal through /v1/payouts/:id/reverse, you confirm that the authorized signatory of the selected bank account authorizes the debit on the bank account and that no other authorization is required.
   */
  reverse(id, params, options) {
    return this._makeRequest("POST", `/v1/payouts/${id}/reverse`, params, options);
  }
};

// ../node_modules/stripe/esm/resources/Plans.js
var PlanResource = class extends StripeResource {
  static {
    __name(this, "PlanResource");
  }
  /**
   * Deleting plans means new subscribers can't be added. Existing subscribers aren't affected.
   */
  del(id, params, options) {
    return this._makeRequest("DELETE", `/v1/plans/${id}`, params, options);
  }
  /**
   * Retrieves the plan with the given ID.
   */
  retrieve(id, params, options) {
    return this._makeRequest("GET", `/v1/plans/${id}`, params, options, {
      responseSchema: {
        kind: "object",
        fields: {
          amount_decimal: { kind: "nullable", inner: { kind: "decimal_string" } },
          tiers: {
            kind: "array",
            element: {
              kind: "object",
              fields: {
                flat_amount_decimal: {
                  kind: "nullable",
                  inner: { kind: "decimal_string" }
                },
                unit_amount_decimal: {
                  kind: "nullable",
                  inner: { kind: "decimal_string" }
                }
              }
            }
          }
        }
      }
    });
  }
  /**
   * Updates the specified plan by setting the values of the parameters passed. Any parameters not provided are left unchanged. By design, you cannot change a plan's ID, amount, currency, or billing cycle.
   */
  update(id, params, options) {
    return this._makeRequest("POST", `/v1/plans/${id}`, params, options, {
      responseSchema: {
        kind: "object",
        fields: {
          amount_decimal: { kind: "nullable", inner: { kind: "decimal_string" } },
          tiers: {
            kind: "array",
            element: {
              kind: "object",
              fields: {
                flat_amount_decimal: {
                  kind: "nullable",
                  inner: { kind: "decimal_string" }
                },
                unit_amount_decimal: {
                  kind: "nullable",
                  inner: { kind: "decimal_string" }
                }
              }
            }
          }
        }
      }
    });
  }
  /**
   * Returns a list of your plans.
   */
  list(params, options) {
    return this._makeRequest("GET", "/v1/plans", params, options, {
      methodType: "list",
      responseSchema: {
        kind: "object",
        fields: {
          data: {
            kind: "array",
            element: {
              kind: "object",
              fields: {
                amount_decimal: {
                  kind: "nullable",
                  inner: { kind: "decimal_string" }
                },
                tiers: {
                  kind: "array",
                  element: {
                    kind: "object",
                    fields: {
                      flat_amount_decimal: {
                        kind: "nullable",
                        inner: { kind: "decimal_string" }
                      },
                      unit_amount_decimal: {
                        kind: "nullable",
                        inner: { kind: "decimal_string" }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });
  }
  /**
   * You can now model subscriptions more flexibly using the [Prices API](https://docs.stripe.com/api#prices). It replaces the Plans API and is backwards compatible to simplify your migration.
   */
  create(params, options) {
    return this._makeRequest("POST", "/v1/plans", params, options, {
      requestSchema: {
        kind: "object",
        fields: {
          amount_decimal: { kind: "decimal_string" },
          tiers: {
            kind: "array",
            element: {
              kind: "object",
              fields: {
                flat_amount_decimal: { kind: "decimal_string" },
                unit_amount_decimal: { kind: "decimal_string" }
              }
            }
          }
        }
      },
      responseSchema: {
        kind: "object",
        fields: {
          amount_decimal: { kind: "nullable", inner: { kind: "decimal_string" } },
          tiers: {
            kind: "array",
            element: {
              kind: "object",
              fields: {
                flat_amount_decimal: {
                  kind: "nullable",
                  inner: { kind: "decimal_string" }
                },
                unit_amount_decimal: {
                  kind: "nullable",
                  inner: { kind: "decimal_string" }
                }
              }
            }
          }
        }
      }
    });
  }
};

// ../node_modules/stripe/esm/resources/Prices.js
var PriceResource = class extends StripeResource {
  static {
    __name(this, "PriceResource");
  }
  /**
   * Returns a list of your active prices, excluding [inline prices](https://docs.stripe.com/docs/products-prices/pricing-models#inline-pricing). For the list of inactive prices, set active to false.
   */
  list(params, options) {
    return this._makeRequest("GET", "/v1/prices", params, options, {
      methodType: "list",
      responseSchema: {
        kind: "object",
        fields: {
          data: {
            kind: "array",
            element: {
              kind: "object",
              fields: {
                currency_options: {
                  kind: "array",
                  element: {
                    kind: "object",
                    fields: {
                      tiers: {
                        kind: "array",
                        element: {
                          kind: "object",
                          fields: {
                            flat_amount_decimal: {
                              kind: "nullable",
                              inner: { kind: "decimal_string" }
                            },
                            unit_amount_decimal: {
                              kind: "nullable",
                              inner: { kind: "decimal_string" }
                            }
                          }
                        }
                      },
                      unit_amount_decimal: {
                        kind: "nullable",
                        inner: { kind: "decimal_string" }
                      }
                    }
                  }
                },
                tiers: {
                  kind: "array",
                  element: {
                    kind: "object",
                    fields: {
                      flat_amount_decimal: {
                        kind: "nullable",
                        inner: { kind: "decimal_string" }
                      },
                      unit_amount_decimal: {
                        kind: "nullable",
                        inner: { kind: "decimal_string" }
                      }
                    }
                  }
                },
                unit_amount_decimal: {
                  kind: "nullable",
                  inner: { kind: "decimal_string" }
                }
              }
            }
          }
        }
      }
    });
  }
  /**
   * Creates a new [Price for an existing <a href="https://docs.stripe.com/api/products">Product](https://docs.stripe.com/api/prices). The Price can be recurring or one-time.
   */
  create(params, options) {
    return this._makeRequest("POST", "/v1/prices", params, options, {
      requestSchema: {
        kind: "object",
        fields: {
          currency_options: {
            kind: "array",
            element: {
              kind: "object",
              fields: {
                tiers: {
                  kind: "array",
                  element: {
                    kind: "object",
                    fields: {
                      flat_amount_decimal: { kind: "decimal_string" },
                      unit_amount_decimal: { kind: "decimal_string" }
                    }
                  }
                },
                unit_amount_decimal: { kind: "decimal_string" }
              }
            }
          },
          tiers: {
            kind: "array",
            element: {
              kind: "object",
              fields: {
                flat_amount_decimal: { kind: "decimal_string" },
                unit_amount_decimal: { kind: "decimal_string" }
              }
            }
          },
          unit_amount_decimal: { kind: "decimal_string" }
        }
      },
      responseSchema: {
        kind: "object",
        fields: {
          currency_options: {
            kind: "array",
            element: {
              kind: "object",
              fields: {
                tiers: {
                  kind: "array",
                  element: {
                    kind: "object",
                    fields: {
                      flat_amount_decimal: {
                        kind: "nullable",
                        inner: { kind: "decimal_string" }
                      },
                      unit_amount_decimal: {
                        kind: "nullable",
                        inner: { kind: "decimal_string" }
                      }
                    }
                  }
                },
                unit_amount_decimal: {
                  kind: "nullable",
                  inner: { kind: "decimal_string" }
                }
              }
            }
          },
          tiers: {
            kind: "array",
            element: {
              kind: "object",
              fields: {
                flat_amount_decimal: {
                  kind: "nullable",
                  inner: { kind: "decimal_string" }
                },
                unit_amount_decimal: {
                  kind: "nullable",
                  inner: { kind: "decimal_string" }
                }
              }
            }
          },
          unit_amount_decimal: {
            kind: "nullable",
            inner: { kind: "decimal_string" }
          }
        }
      }
    });
  }
  /**
   * Retrieves the price with the given ID.
   */
  retrieve(id, params, options) {
    return this._makeRequest("GET", `/v1/prices/${id}`, params, options, {
      responseSchema: {
        kind: "object",
        fields: {
          currency_options: {
            kind: "array",
            element: {
              kind: "object",
              fields: {
                tiers: {
                  kind: "array",
                  element: {
                    kind: "object",
                    fields: {
                      flat_amount_decimal: {
                        kind: "nullable",
                        inner: { kind: "decimal_string" }
                      },
                      unit_amount_decimal: {
                        kind: "nullable",
                        inner: { kind: "decimal_string" }
                      }
                    }
                  }
                },
                unit_amount_decimal: {
                  kind: "nullable",
                  inner: { kind: "decimal_string" }
                }
              }
            }
          },
          tiers: {
            kind: "array",
            element: {
              kind: "object",
              fields: {
                flat_amount_decimal: {
                  kind: "nullable",
                  inner: { kind: "decimal_string" }
                },
                unit_amount_decimal: {
                  kind: "nullable",
                  inner: { kind: "decimal_string" }
                }
              }
            }
          },
          unit_amount_decimal: {
            kind: "nullable",
            inner: { kind: "decimal_string" }
          }
        }
      }
    });
  }
  /**
   * Updates the specified price by setting the values of the parameters passed. Any parameters not provided are left unchanged.
   */
  update(id, params, options) {
    return this._makeRequest("POST", `/v1/prices/${id}`, params, options, {
      responseSchema: {
        kind: "object",
        fields: {
          currency_options: {
            kind: "array",
            element: {
              kind: "object",
              fields: {
                tiers: {
                  kind: "array",
                  element: {
                    kind: "object",
                    fields: {
                      flat_amount_decimal: {
                        kind: "nullable",
                        inner: { kind: "decimal_string" }
                      },
                      unit_amount_decimal: {
                        kind: "nullable",
                        inner: { kind: "decimal_string" }
                      }
                    }
                  }
                },
                unit_amount_decimal: {
                  kind: "nullable",
                  inner: { kind: "decimal_string" }
                }
              }
            }
          },
          tiers: {
            kind: "array",
            element: {
              kind: "object",
              fields: {
                flat_amount_decimal: {
                  kind: "nullable",
                  inner: { kind: "decimal_string" }
                },
                unit_amount_decimal: {
                  kind: "nullable",
                  inner: { kind: "decimal_string" }
                }
              }
            }
          },
          unit_amount_decimal: {
            kind: "nullable",
            inner: { kind: "decimal_string" }
          }
        }
      }
    });
  }
  /**
   * Search for prices you've previously created using Stripe's [Search Query Language](https://docs.stripe.com/docs/search#search-query-language).
   * Don't use search in read-after-write flows where strict consistency is necessary. Under normal operating
   * conditions, data is searchable in less than a minute. Occasionally, propagation of new or updated data can be up
   * to an hour behind during outages. Search functionality is not available to merchants in India.
   */
  search(params, options) {
    return this._makeRequest("GET", "/v1/prices/search", params, options, {
      methodType: "search",
      responseSchema: {
        kind: "object",
        fields: {
          data: {
            kind: "array",
            element: {
              kind: "object",
              fields: {
                currency_options: {
                  kind: "array",
                  element: {
                    kind: "object",
                    fields: {
                      tiers: {
                        kind: "array",
                        element: {
                          kind: "object",
                          fields: {
                            flat_amount_decimal: {
                              kind: "nullable",
                              inner: { kind: "decimal_string" }
                            },
                            unit_amount_decimal: {
                              kind: "nullable",
                              inner: { kind: "decimal_string" }
                            }
                          }
                        }
                      },
                      unit_amount_decimal: {
                        kind: "nullable",
                        inner: { kind: "decimal_string" }
                      }
                    }
                  }
                },
                tiers: {
                  kind: "array",
                  element: {
                    kind: "object",
                    fields: {
                      flat_amount_decimal: {
                        kind: "nullable",
                        inner: { kind: "decimal_string" }
                      },
                      unit_amount_decimal: {
                        kind: "nullable",
                        inner: { kind: "decimal_string" }
                      }
                    }
                  }
                },
                unit_amount_decimal: {
                  kind: "nullable",
                  inner: { kind: "decimal_string" }
                }
              }
            }
          }
        }
      }
    });
  }
};

// ../node_modules/stripe/esm/resources/Products.js
var ProductResource2 = class extends StripeResource {
  static {
    __name(this, "ProductResource");
  }
  /**
   * Delete a product. Deleting a product is only possible if it has no prices associated with it. Additionally, deleting a product with type=good is only possible if it has no SKUs associated with it.
   */
  del(id, params, options) {
    return this._makeRequest("DELETE", `/v1/products/${id}`, params, options);
  }
  /**
   * Retrieves the details of an existing product. Supply the unique product ID from either a product creation request or the product list, and Stripe will return the corresponding product information.
   */
  retrieve(id, params, options) {
    return this._makeRequest("GET", `/v1/products/${id}`, params, options);
  }
  /**
   * Updates the specific product by setting the values of the parameters passed. Any parameters not provided will be left unchanged.
   */
  update(id, params, options) {
    return this._makeRequest("POST", `/v1/products/${id}`, params, options);
  }
  /**
   * Returns a list of your products. The products are returned sorted by creation date, with the most recently created products appearing first.
   */
  list(params, options) {
    return this._makeRequest("GET", "/v1/products", params, options, {
      methodType: "list"
    });
  }
  /**
   * Creates a new product object.
   */
  create(params, options) {
    return this._makeRequest("POST", "/v1/products", params, options, {
      requestSchema: {
        kind: "object",
        fields: {
          default_price_data: {
            kind: "object",
            fields: {
              currency_options: {
                kind: "array",
                element: {
                  kind: "object",
                  fields: {
                    tiers: {
                      kind: "array",
                      element: {
                        kind: "object",
                        fields: {
                          flat_amount_decimal: { kind: "decimal_string" },
                          unit_amount_decimal: { kind: "decimal_string" }
                        }
                      }
                    },
                    unit_amount_decimal: { kind: "decimal_string" }
                  }
                }
              },
              unit_amount_decimal: { kind: "decimal_string" }
            }
          }
        }
      }
    });
  }
  /**
   * Search for products you've previously created using Stripe's [Search Query Language](https://docs.stripe.com/docs/search#search-query-language).
   * Don't use search in read-after-write flows where strict consistency is necessary. Under normal operating
   * conditions, data is searchable in less than a minute. Occasionally, propagation of new or updated data can be up
   * to an hour behind during outages. Search functionality is not available to merchants in India.
   */
  search(params, options) {
    return this._makeRequest("GET", "/v1/products/search", params, options, {
      methodType: "search"
    });
  }
  /**
   * Deletes the feature attachment to a product
   */
  deleteFeature(productId, id, params, options) {
    return this._makeRequest("DELETE", `/v1/products/${productId}/features/${id}`, params, options);
  }
  /**
   * Retrieves a product_feature, which represents a feature attachment to a product
   */
  retrieveFeature(productId, id, params, options) {
    return this._makeRequest("GET", `/v1/products/${productId}/features/${id}`, params, options);
  }
  /**
   * Retrieve a list of features for a product
   */
  listFeatures(id, params, options) {
    return this._makeRequest("GET", `/v1/products/${id}/features`, params, options, {
      methodType: "list"
    });
  }
  /**
   * Creates a product_feature, which represents a feature attachment to a product
   */
  createFeature(id, params, options) {
    return this._makeRequest("POST", `/v1/products/${id}/features`, params, options);
  }
};

// ../node_modules/stripe/esm/resources/PromotionCodes.js
var PromotionCodeResource = class extends StripeResource {
  static {
    __name(this, "PromotionCodeResource");
  }
  /**
   * Returns a list of your promotion codes.
   */
  list(params, options) {
    return this._makeRequest("GET", "/v1/promotion_codes", params, options, {
      methodType: "list"
    });
  }
  /**
   * A promotion code points to an underlying promotion. You can optionally restrict the code to a specific customer, redemption limit, and expiration date.
   */
  create(params, options) {
    return this._makeRequest("POST", "/v1/promotion_codes", params, options);
  }
  /**
   * Retrieves the promotion code with the given ID. In order to retrieve a promotion code by the customer-facing code use [list](https://docs.stripe.com/docs/api/promotion_codes/list) with the desired code.
   */
  retrieve(id, params, options) {
    return this._makeRequest("GET", `/v1/promotion_codes/${id}`, params, options);
  }
  /**
   * Updates the specified promotion code by setting the values of the parameters passed. Most fields are, by design, not editable.
   */
  update(id, params, options) {
    return this._makeRequest("POST", `/v1/promotion_codes/${id}`, params, options);
  }
};

// ../node_modules/stripe/esm/resources/Quotes.js
var QuoteResource = class extends StripeResource {
  static {
    __name(this, "QuoteResource");
  }
  /**
   * Returns a list of your quotes.
   */
  list(params, options) {
    return this._makeRequest("GET", "/v1/quotes", params, options, {
      methodType: "list",
      responseSchema: {
        kind: "object",
        fields: {
          data: {
            kind: "array",
            element: {
              kind: "object",
              fields: {
                computed: {
                  kind: "object",
                  fields: {
                    upfront: {
                      kind: "object",
                      fields: {
                        line_items: {
                          kind: "object",
                          fields: {
                            data: {
                              kind: "array",
                              element: {
                                kind: "object",
                                fields: {
                                  price: {
                                    kind: "nullable",
                                    inner: {
                                      kind: "object",
                                      fields: {
                                        currency_options: {
                                          kind: "array",
                                          element: {
                                            kind: "object",
                                            fields: {
                                              tiers: {
                                                kind: "array",
                                                element: {
                                                  kind: "object",
                                                  fields: {
                                                    flat_amount_decimal: {
                                                      kind: "nullable",
                                                      inner: {
                                                        kind: "decimal_string"
                                                      }
                                                    },
                                                    unit_amount_decimal: {
                                                      kind: "nullable",
                                                      inner: {
                                                        kind: "decimal_string"
                                                      }
                                                    }
                                                  }
                                                }
                                              },
                                              unit_amount_decimal: {
                                                kind: "nullable",
                                                inner: { kind: "decimal_string" }
                                              }
                                            }
                                          }
                                        },
                                        tiers: {
                                          kind: "array",
                                          element: {
                                            kind: "object",
                                            fields: {
                                              flat_amount_decimal: {
                                                kind: "nullable",
                                                inner: { kind: "decimal_string" }
                                              },
                                              unit_amount_decimal: {
                                                kind: "nullable",
                                                inner: { kind: "decimal_string" }
                                              }
                                            }
                                          }
                                        },
                                        unit_amount_decimal: {
                                          kind: "nullable",
                                          inner: { kind: "decimal_string" }
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });
  }
  /**
   * A quote models prices and services for a customer. Default options for header, description, footer, and expires_at can be set in the dashboard via the [quote template](https://dashboard.stripe.com/settings/billing/quote).
   */
  create(params, options) {
    return this._makeRequest("POST", "/v1/quotes", params, options, {
      requestSchema: {
        kind: "object",
        fields: {
          line_items: {
            kind: "array",
            element: {
              kind: "object",
              fields: {
                price_data: {
                  kind: "object",
                  fields: { unit_amount_decimal: { kind: "decimal_string" } }
                }
              }
            }
          }
        }
      },
      responseSchema: {
        kind: "object",
        fields: {
          computed: {
            kind: "object",
            fields: {
              upfront: {
                kind: "object",
                fields: {
                  line_items: {
                    kind: "object",
                    fields: {
                      data: {
                        kind: "array",
                        element: {
                          kind: "object",
                          fields: {
                            price: {
                              kind: "nullable",
                              inner: {
                                kind: "object",
                                fields: {
                                  currency_options: {
                                    kind: "array",
                                    element: {
                                      kind: "object",
                                      fields: {
                                        tiers: {
                                          kind: "array",
                                          element: {
                                            kind: "object",
                                            fields: {
                                              flat_amount_decimal: {
                                                kind: "nullable",
                                                inner: { kind: "decimal_string" }
                                              },
                                              unit_amount_decimal: {
                                                kind: "nullable",
                                                inner: { kind: "decimal_string" }
                                              }
                                            }
                                          }
                                        },
                                        unit_amount_decimal: {
                                          kind: "nullable",
                                          inner: { kind: "decimal_string" }
                                        }
                                      }
                                    }
                                  },
                                  tiers: {
                                    kind: "array",
                                    element: {
                                      kind: "object",
                                      fields: {
                                        flat_amount_decimal: {
                                          kind: "nullable",
                                          inner: { kind: "decimal_string" }
                                        },
                                        unit_amount_decimal: {
                                          kind: "nullable",
                                          inner: { kind: "decimal_string" }
                                        }
                                      }
                                    }
                                  },
                                  unit_amount_decimal: {
                                    kind: "nullable",
                                    inner: { kind: "decimal_string" }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });
  }
  /**
   * Retrieves the quote with the given ID.
   */
  retrieve(id, params, options) {
    return this._makeRequest("GET", `/v1/quotes/${id}`, params, options, {
      responseSchema: {
        kind: "object",
        fields: {
          computed: {
            kind: "object",
            fields: {
              upfront: {
                kind: "object",
                fields: {
                  line_items: {
                    kind: "object",
                    fields: {
                      data: {
                        kind: "array",
                        element: {
                          kind: "object",
                          fields: {
                            price: {
                              kind: "nullable",
                              inner: {
                                kind: "object",
                                fields: {
                                  currency_options: {
                                    kind: "array",
                                    element: {
                                      kind: "object",
                                      fields: {
                                        tiers: {
                                          kind: "array",
                                          element: {
                                            kind: "object",
                                            fields: {
                                              flat_amount_decimal: {
                                                kind: "nullable",
                                                inner: { kind: "decimal_string" }
                                              },
                                              unit_amount_decimal: {
                                                kind: "nullable",
                                                inner: { kind: "decimal_string" }
                                              }
                                            }
                                          }
                                        },
                                        unit_amount_decimal: {
                                          kind: "nullable",
                                          inner: { kind: "decimal_string" }
                                        }
                                      }
                                    }
                                  },
                                  tiers: {
                                    kind: "array",
                                    element: {
                                      kind: "object",
                                      fields: {
                                        flat_amount_decimal: {
                                          kind: "nullable",
                                          inner: { kind: "decimal_string" }
                                        },
                                        unit_amount_decimal: {
                                          kind: "nullable",
                                          inner: { kind: "decimal_string" }
                                        }
                                      }
                                    }
                                  },
                                  unit_amount_decimal: {
                                    kind: "nullable",
                                    inner: { kind: "decimal_string" }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });
  }
  /**
   * A quote models prices and services for a customer.
   */
  update(id, params, options) {
    return this._makeRequest("POST", `/v1/quotes/${id}`, params, options, {
      requestSchema: {
        kind: "object",
        fields: {
          line_items: {
            kind: "array",
            element: {
              kind: "object",
              fields: {
                price_data: {
                  kind: "object",
                  fields: { unit_amount_decimal: { kind: "decimal_string" } }
                }
              }
            }
          }
        }
      },
      responseSchema: {
        kind: "object",
        fields: {
          computed: {
            kind: "object",
            fields: {
              upfront: {
                kind: "object",
                fields: {
                  line_items: {
                    kind: "object",
                    fields: {
                      data: {
                        kind: "array",
                        element: {
                          kind: "object",
                          fields: {
                            price: {
                              kind: "nullable",
                              inner: {
                                kind: "object",
                                fields: {
                                  currency_options: {
                                    kind: "array",
                                    element: {
                                      kind: "object",
                                      fields: {
                                        tiers: {
                                          kind: "array",
                                          element: {
                                            kind: "object",
                                            fields: {
                                              flat_amount_decimal: {
                                                kind: "nullable",
                                                inner: { kind: "decimal_string" }
                                              },
                                              unit_amount_decimal: {
                                                kind: "nullable",
                                                inner: { kind: "decimal_string" }
                                              }
                                            }
                                          }
                                        },
                                        unit_amount_decimal: {
                                          kind: "nullable",
                                          inner: { kind: "decimal_string" }
                                        }
                                      }
                                    }
                                  },
                                  tiers: {
                                    kind: "array",
                                    element: {
                                      kind: "object",
                                      fields: {
                                        flat_amount_decimal: {
                                          kind: "nullable",
                                          inner: { kind: "decimal_string" }
                                        },
                                        unit_amount_decimal: {
                                          kind: "nullable",
                                          inner: { kind: "decimal_string" }
                                        }
                                      }
                                    }
                                  },
                                  unit_amount_decimal: {
                                    kind: "nullable",
                                    inner: { kind: "decimal_string" }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });
  }
  /**
   * Accepts the specified quote.
   */
  accept(id, params, options) {
    return this._makeRequest("POST", `/v1/quotes/${id}/accept`, params, options, {
      responseSchema: {
        kind: "object",
        fields: {
          computed: {
            kind: "object",
            fields: {
              upfront: {
                kind: "object",
                fields: {
                  line_items: {
                    kind: "object",
                    fields: {
                      data: {
                        kind: "array",
                        element: {
                          kind: "object",
                          fields: {
                            price: {
                              kind: "nullable",
                              inner: {
                                kind: "object",
                                fields: {
                                  currency_options: {
                                    kind: "array",
                                    element: {
                                      kind: "object",
                                      fields: {
                                        tiers: {
                                          kind: "array",
                                          element: {
                                            kind: "object",
                                            fields: {
                                              flat_amount_decimal: {
                                                kind: "nullable",
                                                inner: {
                                                  kind: "decimal_string"
                                                }
                                              },
                                              unit_amount_decimal: {
                                                kind: "nullable",
                                                inner: {
                                                  kind: "decimal_string"
                                                }
                                              }
                                            }
                                          }
                                        },
                                        unit_amount_decimal: {
                                          kind: "nullable",
                                          inner: { kind: "decimal_string" }
                                        }
                                      }
                                    }
                                  },
                                  tiers: {
                                    kind: "array",
                                    element: {
                                      kind: "object",
                                      fields: {
                                        flat_amount_decimal: {
                                          kind: "nullable",
                                          inner: { kind: "decimal_string" }
                                        },
                                        unit_amount_decimal: {
                                          kind: "nullable",
                                          inner: { kind: "decimal_string" }
                                        }
                                      }
                                    }
                                  },
                                  unit_amount_decimal: {
                                    kind: "nullable",
                                    inner: { kind: "decimal_string" }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });
  }
  /**
   * Cancels the quote.
   */
  cancel(id, params, options) {
    return this._makeRequest("POST", `/v1/quotes/${id}/cancel`, params, options, {
      responseSchema: {
        kind: "object",
        fields: {
          computed: {
            kind: "object",
            fields: {
              upfront: {
                kind: "object",
                fields: {
                  line_items: {
                    kind: "object",
                    fields: {
                      data: {
                        kind: "array",
                        element: {
                          kind: "object",
                          fields: {
                            price: {
                              kind: "nullable",
                              inner: {
                                kind: "object",
                                fields: {
                                  currency_options: {
                                    kind: "array",
                                    element: {
                                      kind: "object",
                                      fields: {
                                        tiers: {
                                          kind: "array",
                                          element: {
                                            kind: "object",
                                            fields: {
                                              flat_amount_decimal: {
                                                kind: "nullable",
                                                inner: {
                                                  kind: "decimal_string"
                                                }
                                              },
                                              unit_amount_decimal: {
                                                kind: "nullable",
                                                inner: {
                                                  kind: "decimal_string"
                                                }
                                              }
                                            }
                                          }
                                        },
                                        unit_amount_decimal: {
                                          kind: "nullable",
                                          inner: { kind: "decimal_string" }
                                        }
                                      }
                                    }
                                  },
                                  tiers: {
                                    kind: "array",
                                    element: {
                                      kind: "object",
                                      fields: {
                                        flat_amount_decimal: {
                                          kind: "nullable",
                                          inner: { kind: "decimal_string" }
                                        },
                                        unit_amount_decimal: {
                                          kind: "nullable",
                                          inner: { kind: "decimal_string" }
                                        }
                                      }
                                    }
                                  },
                                  unit_amount_decimal: {
                                    kind: "nullable",
                                    inner: { kind: "decimal_string" }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });
  }
  /**
   * Finalizes the quote.
   */
  finalizeQuote(id, params, options) {
    return this._makeRequest("POST", `/v1/quotes/${id}/finalize`, params, options, {
      responseSchema: {
        kind: "object",
        fields: {
          computed: {
            kind: "object",
            fields: {
              upfront: {
                kind: "object",
                fields: {
                  line_items: {
                    kind: "object",
                    fields: {
                      data: {
                        kind: "array",
                        element: {
                          kind: "object",
                          fields: {
                            price: {
                              kind: "nullable",
                              inner: {
                                kind: "object",
                                fields: {
                                  currency_options: {
                                    kind: "array",
                                    element: {
                                      kind: "object",
                                      fields: {
                                        tiers: {
                                          kind: "array",
                                          element: {
                                            kind: "object",
                                            fields: {
                                              flat_amount_decimal: {
                                                kind: "nullable",
                                                inner: {
                                                  kind: "decimal_string"
                                                }
                                              },
                                              unit_amount_decimal: {
                                                kind: "nullable",
                                                inner: {
                                                  kind: "decimal_string"
                                                }
                                              }
                                            }
                                          }
                                        },
                                        unit_amount_decimal: {
                                          kind: "nullable",
                                          inner: { kind: "decimal_string" }
                                        }
                                      }
                                    }
                                  },
                                  tiers: {
                                    kind: "array",
                                    element: {
                                      kind: "object",
                                      fields: {
                                        flat_amount_decimal: {
                                          kind: "nullable",
                                          inner: { kind: "decimal_string" }
                                        },
                                        unit_amount_decimal: {
                                          kind: "nullable",
                                          inner: { kind: "decimal_string" }
                                        }
                                      }
                                    }
                                  },
                                  unit_amount_decimal: {
                                    kind: "nullable",
                                    inner: { kind: "decimal_string" }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });
  }
  /**
   * Download the PDF for a finalized quote. Explanation for special handling can be found [here](https://docs.stripe.com/quotes/overview#quote_pdf)
   */
  pdf(id, params, options) {
    return this._makeRequest("GET", `/v1/quotes/${id}/pdf`, params, options, {
      apiBase: "files",
      streaming: true
    });
  }
  /**
   * When retrieving a quote, there is an includable [computed.upfront.line_items](https://stripe.com/docs/api/quotes/object#quote_object-computed-upfront-line_items) property containing the first handful of those items. There is also a URL where you can retrieve the full (paginated) list of upfront line items.
   */
  listComputedUpfrontLineItems(id, params, options) {
    return this._makeRequest("GET", `/v1/quotes/${id}/computed_upfront_line_items`, params, options, {
      methodType: "list",
      responseSchema: {
        kind: "object",
        fields: {
          data: {
            kind: "array",
            element: {
              kind: "object",
              fields: {
                price: {
                  kind: "nullable",
                  inner: {
                    kind: "object",
                    fields: {
                      currency_options: {
                        kind: "array",
                        element: {
                          kind: "object",
                          fields: {
                            tiers: {
                              kind: "array",
                              element: {
                                kind: "object",
                                fields: {
                                  flat_amount_decimal: {
                                    kind: "nullable",
                                    inner: { kind: "decimal_string" }
                                  },
                                  unit_amount_decimal: {
                                    kind: "nullable",
                                    inner: { kind: "decimal_string" }
                                  }
                                }
                              }
                            },
                            unit_amount_decimal: {
                              kind: "nullable",
                              inner: { kind: "decimal_string" }
                            }
                          }
                        }
                      },
                      tiers: {
                        kind: "array",
                        element: {
                          kind: "object",
                          fields: {
                            flat_amount_decimal: {
                              kind: "nullable",
                              inner: { kind: "decimal_string" }
                            },
                            unit_amount_decimal: {
                              kind: "nullable",
                              inner: { kind: "decimal_string" }
                            }
                          }
                        }
                      },
                      unit_amount_decimal: {
                        kind: "nullable",
                        inner: { kind: "decimal_string" }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });
  }
  /**
   * When retrieving a quote, there is an includable line_items property containing the first handful of those items. There is also a URL where you can retrieve the full (paginated) list of line items.
   */
  listLineItems(id, params, options) {
    return this._makeRequest("GET", `/v1/quotes/${id}/line_items`, params, options, {
      methodType: "list",
      responseSchema: {
        kind: "object",
        fields: {
          data: {
            kind: "array",
            element: {
              kind: "object",
              fields: {
                price: {
                  kind: "nullable",
                  inner: {
                    kind: "object",
                    fields: {
                      currency_options: {
                        kind: "array",
                        element: {
                          kind: "object",
                          fields: {
                            tiers: {
                              kind: "array",
                              element: {
                                kind: "object",
                                fields: {
                                  flat_amount_decimal: {
                                    kind: "nullable",
                                    inner: { kind: "decimal_string" }
                                  },
                                  unit_amount_decimal: {
                                    kind: "nullable",
                                    inner: { kind: "decimal_string" }
                                  }
                                }
                              }
                            },
                            unit_amount_decimal: {
                              kind: "nullable",
                              inner: { kind: "decimal_string" }
                            }
                          }
                        }
                      },
                      tiers: {
                        kind: "array",
                        element: {
                          kind: "object",
                          fields: {
                            flat_amount_decimal: {
                              kind: "nullable",
                              inner: { kind: "decimal_string" }
                            },
                            unit_amount_decimal: {
                              kind: "nullable",
                              inner: { kind: "decimal_string" }
                            }
                          }
                        }
                      },
                      unit_amount_decimal: {
                        kind: "nullable",
                        inner: { kind: "decimal_string" }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });
  }
};

// ../node_modules/stripe/esm/resources/Refunds.js
var RefundResource2 = class extends StripeResource {
  static {
    __name(this, "RefundResource");
  }
  /**
   * Returns a list of all refunds you created. We return the refunds in sorted order, with the most recent refunds appearing first. The 10 most recent refunds are always available by default on the Charge object.
   */
  list(params, options) {
    return this._makeRequest("GET", "/v1/refunds", params, options, {
      methodType: "list"
    });
  }
  /**
   * When you create a new refund, you must specify a Charge or a PaymentIntent object on which to create it.
   *
   * Creating a new refund will refund a charge that has previously been created but not yet refunded.
   * Funds will be refunded to the credit or debit card that was originally charged.
   *
   * You can optionally refund only part of a charge.
   * You can do so multiple times, until the entire charge has been refunded.
   *
   * Once entirely refunded, a charge can't be refunded again.
   * This method will raise an error when called on an already-refunded charge,
   * or when trying to refund more money than is left on a charge.
   */
  create(params, options) {
    return this._makeRequest("POST", "/v1/refunds", params, options);
  }
  /**
   * Retrieves the details of an existing refund.
   */
  retrieve(id, params, options) {
    return this._makeRequest("GET", `/v1/refunds/${id}`, params, options);
  }
  /**
   * Updates the refund that you specify by setting the values of the passed parameters. Any parameters that you don't provide remain unchanged.
   *
   * This request only accepts metadata as an argument.
   */
  update(id, params, options) {
    return this._makeRequest("POST", `/v1/refunds/${id}`, params, options);
  }
  /**
   * Cancels a refund with a status of requires_action.
   *
   * You can't cancel refunds in other states. Only refunds for payment methods that require customer action can enter the requires_action state.
   */
  cancel(id, params, options) {
    return this._makeRequest("POST", `/v1/refunds/${id}/cancel`, params, options);
  }
};

// ../node_modules/stripe/esm/resources/Reviews.js
var ReviewResource = class extends StripeResource {
  static {
    __name(this, "ReviewResource");
  }
  /**
   * Returns a list of Review objects that have open set to true. The objects are sorted in descending order by creation date, with the most recently created object appearing first.
   */
  list(params, options) {
    return this._makeRequest("GET", "/v1/reviews", params, options, {
      methodType: "list"
    });
  }
  /**
   * Retrieves a Review object.
   */
  retrieve(id, params, options) {
    return this._makeRequest("GET", `/v1/reviews/${id}`, params, options);
  }
  /**
   * Approves a Review object, closing it and removing it from the list of reviews.
   */
  approve(id, params, options) {
    return this._makeRequest("POST", `/v1/reviews/${id}/approve`, params, options);
  }
};

// ../node_modules/stripe/esm/resources/SetupAttempts.js
var SetupAttemptResource = class extends StripeResource {
  static {
    __name(this, "SetupAttemptResource");
  }
  /**
   * Returns a list of SetupAttempts that associate with a provided SetupIntent.
   */
  list(params, options) {
    return this._makeRequest("GET", "/v1/setup_attempts", params, options, {
      methodType: "list"
    });
  }
};

// ../node_modules/stripe/esm/resources/SetupIntents.js
var SetupIntentResource = class extends StripeResource {
  static {
    __name(this, "SetupIntentResource");
  }
  /**
   * Returns a list of SetupIntents.
   */
  list(params, options) {
    return this._makeRequest("GET", "/v1/setup_intents", params, options, {
      methodType: "list"
    });
  }
  /**
   * Creates a SetupIntent object.
   *
   * After you create the SetupIntent, attach a payment method and [confirm](https://docs.stripe.com/docs/api/setup_intents/confirm)
   * it to collect any required permissions to charge the payment method later.
   */
  create(params, options) {
    return this._makeRequest("POST", "/v1/setup_intents", params, options);
  }
  /**
   * Retrieves the details of a SetupIntent that has previously been created.
   *
   * Client-side retrieval using a publishable key is allowed when the client_secret is provided in the query string.
   *
   * When retrieved with a publishable key, only a subset of properties will be returned. Please refer to the [SetupIntent](https://docs.stripe.com/api#setup_intent_object) object reference for more details.
   */
  retrieve(id, params, options) {
    return this._makeRequest("GET", `/v1/setup_intents/${id}`, params, options);
  }
  /**
   * Updates a SetupIntent object.
   */
  update(id, params, options) {
    return this._makeRequest("POST", `/v1/setup_intents/${id}`, params, options);
  }
  /**
   * You can cancel a SetupIntent object when it's in one of these statuses: requires_payment_method, requires_confirmation, or requires_action.
   *
   * After you cancel it, setup is abandoned and any operations on the SetupIntent fail with an error. You can't cancel the SetupIntent for a Checkout Session. [Expire the Checkout Session](https://docs.stripe.com/docs/api/checkout/sessions/expire) instead.
   */
  cancel(id, params, options) {
    return this._makeRequest("POST", `/v1/setup_intents/${id}/cancel`, params, options);
  }
  /**
   * Confirm that your customer intends to set up the current or
   * provided payment method. For example, you would confirm a SetupIntent
   * when a customer hits the “Save” button on a payment method management
   * page on your website.
   *
   * If the selected payment method does not require any additional
   * steps from the customer, the SetupIntent will transition to the
   * succeeded status.
   *
   * Otherwise, it will transition to the requires_action status and
   * suggest additional actions via next_action. If setup fails,
   * the SetupIntent will transition to the
   * requires_payment_method status or the canceled status if the
   * confirmation limit is reached.
   */
  confirm(id, params, options) {
    return this._makeRequest("POST", `/v1/setup_intents/${id}/confirm`, params, options);
  }
  /**
   * Verifies microdeposits on a SetupIntent object.
   */
  verifyMicrodeposits(id, params, options) {
    return this._makeRequest("POST", `/v1/setup_intents/${id}/verify_microdeposits`, params, options);
  }
};

// ../node_modules/stripe/esm/resources/ShippingRates.js
var ShippingRateResource = class extends StripeResource {
  static {
    __name(this, "ShippingRateResource");
  }
  /**
   * Returns a list of your shipping rates.
   */
  list(params, options) {
    return this._makeRequest("GET", "/v1/shipping_rates", params, options, {
      methodType: "list"
    });
  }
  /**
   * Creates a new shipping rate object.
   */
  create(params, options) {
    return this._makeRequest("POST", "/v1/shipping_rates", params, options);
  }
  /**
   * Returns the shipping rate object with the given ID.
   */
  retrieve(id, params, options) {
    return this._makeRequest("GET", `/v1/shipping_rates/${id}`, params, options);
  }
  /**
   * Updates an existing shipping rate object.
   */
  update(id, params, options) {
    return this._makeRequest("POST", `/v1/shipping_rates/${id}`, params, options);
  }
};

// ../node_modules/stripe/esm/resources/Sources.js
var SourceResource = class extends StripeResource {
  static {
    __name(this, "SourceResource");
  }
  /**
   * Retrieves an existing source object. Supply the unique source ID from a source creation request and Stripe will return the corresponding up-to-date source object information.
   */
  retrieve(id, params, options) {
    return this._makeRequest("GET", `/v1/sources/${id}`, params, options);
  }
  /**
   * Updates the specified source by setting the values of the parameters passed. Any parameters not provided will be left unchanged.
   *
   * This request accepts the metadata and owner as arguments. It is also possible to update type specific information for selected payment methods. Please refer to our [payment method guides](https://docs.stripe.com/docs/sources) for more detail.
   */
  update(id, params, options) {
    return this._makeRequest("POST", `/v1/sources/${id}`, params, options);
  }
  /**
   * Creates a new source object.
   */
  create(params, options) {
    return this._makeRequest("POST", "/v1/sources", params, options);
  }
  /**
   * Verify a given source.
   */
  verify(id, params, options) {
    return this._makeRequest("POST", `/v1/sources/${id}/verify`, params, options);
  }
  /**
   * List source transactions for a given source.
   */
  listSourceTransactions(id, params, options) {
    return this._makeRequest("GET", `/v1/sources/${id}/source_transactions`, params, options, {
      methodType: "list"
    });
  }
};

// ../node_modules/stripe/esm/resources/Subscriptions.js
var SubscriptionResource = class extends StripeResource {
  static {
    __name(this, "SubscriptionResource");
  }
  /**
   * Cancels a customer's subscription immediately. The customer won't be charged again for the subscription. After it's canceled, you can no longer update the subscription or its [metadata](https://docs.stripe.com/metadata).
   *
   * Any pending invoice items that you've created are still charged at the end of the period, unless manually [deleted](https://docs.stripe.com/api/invoiceitems/delete). If you've set the subscription to cancel at the end of the period, any pending prorations are also left in place and collected at the end of the period. But if the subscription is set to cancel immediately, pending prorations are removed if invoice_now and prorate are both set to true.
   *
   * By default, upon subscription cancellation, Stripe stops automatic collection of all finalized invoices for the customer. This is intended to prevent unexpected payment attempts after the customer has canceled a subscription. However, you can resume automatic collection of the invoices manually after subscription cancellation to have us proceed. Or, you could check for unpaid invoices before allowing the customer to cancel the subscription at all.
   */
  cancel(id, params, options) {
    return this._makeRequest("DELETE", `/v1/subscriptions/${id}`, params, options, {
      responseSchema: {
        kind: "object",
        fields: {
          items: {
            kind: "object",
            fields: {
              data: {
                kind: "array",
                element: {
                  kind: "object",
                  fields: {
                    plan: {
                      kind: "object",
                      fields: {
                        amount_decimal: {
                          kind: "nullable",
                          inner: { kind: "decimal_string" }
                        },
                        tiers: {
                          kind: "array",
                          element: {
                            kind: "object",
                            fields: {
                              flat_amount_decimal: {
                                kind: "nullable",
                                inner: { kind: "decimal_string" }
                              },
                              unit_amount_decimal: {
                                kind: "nullable",
                                inner: { kind: "decimal_string" }
                              }
                            }
                          }
                        }
                      }
                    },
                    price: {
                      kind: "object",
                      fields: {
                        currency_options: {
                          kind: "array",
                          element: {
                            kind: "object",
                            fields: {
                              tiers: {
                                kind: "array",
                                element: {
                                  kind: "object",
                                  fields: {
                                    flat_amount_decimal: {
                                      kind: "nullable",
                                      inner: { kind: "decimal_string" }
                                    },
                                    unit_amount_decimal: {
                                      kind: "nullable",
                                      inner: { kind: "decimal_string" }
                                    }
                                  }
                                }
                              },
                              unit_amount_decimal: {
                                kind: "nullable",
                                inner: { kind: "decimal_string" }
                              }
                            }
                          }
                        },
                        tiers: {
                          kind: "array",
                          element: {
                            kind: "object",
                            fields: {
                              flat_amount_decimal: {
                                kind: "nullable",
                                inner: { kind: "decimal_string" }
                              },
                              unit_amount_decimal: {
                                kind: "nullable",
                                inner: { kind: "decimal_string" }
                              }
                            }
                          }
                        },
                        unit_amount_decimal: {
                          kind: "nullable",
                          inner: { kind: "decimal_string" }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });
  }
  /**
   * Retrieves the subscription with the given ID.
   */
  retrieve(id, params, options) {
    return this._makeRequest("GET", `/v1/subscriptions/${id}`, params, options, {
      responseSchema: {
        kind: "object",
        fields: {
          items: {
            kind: "object",
            fields: {
              data: {
                kind: "array",
                element: {
                  kind: "object",
                  fields: {
                    plan: {
                      kind: "object",
                      fields: {
                        amount_decimal: {
                          kind: "nullable",
                          inner: { kind: "decimal_string" }
                        },
                        tiers: {
                          kind: "array",
                          element: {
                            kind: "object",
                            fields: {
                              flat_amount_decimal: {
                                kind: "nullable",
                                inner: { kind: "decimal_string" }
                              },
                              unit_amount_decimal: {
                                kind: "nullable",
                                inner: { kind: "decimal_string" }
                              }
                            }
                          }
                        }
                      }
                    },
                    price: {
                      kind: "object",
                      fields: {
                        currency_options: {
                          kind: "array",
                          element: {
                            kind: "object",
                            fields: {
                              tiers: {
                                kind: "array",
                                element: {
                                  kind: "object",
                                  fields: {
                                    flat_amount_decimal: {
                                      kind: "nullable",
                                      inner: { kind: "decimal_string" }
                                    },
                                    unit_amount_decimal: {
                                      kind: "nullable",
                                      inner: { kind: "decimal_string" }
                                    }
                                  }
                                }
                              },
                              unit_amount_decimal: {
                                kind: "nullable",
                                inner: { kind: "decimal_string" }
                              }
                            }
                          }
                        },
                        tiers: {
                          kind: "array",
                          element: {
                            kind: "object",
                            fields: {
                              flat_amount_decimal: {
                                kind: "nullable",
                                inner: { kind: "decimal_string" }
                              },
                              unit_amount_decimal: {
                                kind: "nullable",
                                inner: { kind: "decimal_string" }
                              }
                            }
                          }
                        },
                        unit_amount_decimal: {
                          kind: "nullable",
                          inner: { kind: "decimal_string" }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });
  }
  /**
   * Updates an existing subscription to match the specified parameters.
   * When changing prices or quantities, we optionally prorate the price we charge next month to make up for any price changes.
   * To preview how the proration is calculated, use the [create preview](https://docs.stripe.com/docs/api/invoices/create_preview) endpoint.
   *
   * By default, we prorate subscription changes. For example, if a customer signs up on May 1 for a 100 price, they'll be billed 100 immediately. If on May 15 they switch to a 200 price, then on June 1 they'll be billed 250 (200 for a renewal of her subscription, plus a 50 prorating adjustment for half of the previous month's 100 difference). Similarly, a downgrade generates a credit that is applied to the next invoice. We also prorate when you make quantity changes.
   *
   * Switching prices does not normally change the billing date or generate an immediate charge unless:
   *
   *
   * The billing interval is changed (for example, from monthly to yearly).
   * The subscription moves from free to paid.
   * A trial starts or ends.
   *
   *
   * In these cases, we apply a credit for the unused time on the previous price, immediately charge the customer using the new price, and reset the billing date. Learn about how [Stripe immediately attempts payment for subscription changes](https://docs.stripe.com/docs/billing/subscriptions/upgrade-downgrade#immediate-payment).
   *
   * If you want to charge for an upgrade immediately, pass proration_behavior as always_invoice to create prorations, automatically invoice the customer for those proration adjustments, and attempt to collect payment. If you pass create_prorations, the prorations are created but not automatically invoiced. If you want to bill the customer for the prorations before the subscription's renewal date, you need to manually [invoice the customer](https://docs.stripe.com/docs/api/invoices/create).
   *
   * If you don't want to prorate, set the proration_behavior option to none. With this option, the customer is billed 100 on May 1 and 200 on June 1. Similarly, if you set proration_behavior to none when switching between different billing intervals (for example, from monthly to yearly), we don't generate any credits for the old subscription's unused time. We still reset the billing date and bill immediately for the new subscription.
   *
   * Updating the quantity on a subscription many times in an hour may result in [rate limiting. If you need to bill for a frequently changing quantity, consider integrating <a href="/docs/billing/subscriptions/usage-based">usage-based billing](https://docs.stripe.com/docs/rate-limits) instead.
   */
  update(id, params, options) {
    return this._makeRequest("POST", `/v1/subscriptions/${id}`, params, options, {
      requestSchema: {
        kind: "object",
        fields: {
          add_invoice_items: {
            kind: "array",
            element: {
              kind: "object",
              fields: {
                price_data: {
                  kind: "object",
                  fields: { unit_amount_decimal: { kind: "decimal_string" } }
                }
              }
            }
          },
          items: {
            kind: "array",
            element: {
              kind: "object",
              fields: {
                price_data: {
                  kind: "object",
                  fields: { unit_amount_decimal: { kind: "decimal_string" } }
                }
              }
            }
          }
        }
      },
      responseSchema: {
        kind: "object",
        fields: {
          items: {
            kind: "object",
            fields: {
              data: {
                kind: "array",
                element: {
                  kind: "object",
                  fields: {
                    plan: {
                      kind: "object",
                      fields: {
                        amount_decimal: {
                          kind: "nullable",
                          inner: { kind: "decimal_string" }
                        },
                        tiers: {
                          kind: "array",
                          element: {
                            kind: "object",
                            fields: {
                              flat_amount_decimal: {
                                kind: "nullable",
                                inner: { kind: "decimal_string" }
                              },
                              unit_amount_decimal: {
                                kind: "nullable",
                                inner: { kind: "decimal_string" }
                              }
                            }
                          }
                        }
                      }
                    },
                    price: {
                      kind: "object",
                      fields: {
                        currency_options: {
                          kind: "array",
                          element: {
                            kind: "object",
                            fields: {
                              tiers: {
                                kind: "array",
                                element: {
                                  kind: "object",
                                  fields: {
                                    flat_amount_decimal: {
                                      kind: "nullable",
                                      inner: { kind: "decimal_string" }
                                    },
                                    unit_amount_decimal: {
                                      kind: "nullable",
                                      inner: { kind: "decimal_string" }
                                    }
                                  }
                                }
                              },
                              unit_amount_decimal: {
                                kind: "nullable",
                                inner: { kind: "decimal_string" }
                              }
                            }
                          }
                        },
                        tiers: {
                          kind: "array",
                          element: {
                            kind: "object",
                            fields: {
                              flat_amount_decimal: {
                                kind: "nullable",
                                inner: { kind: "decimal_string" }
                              },
                              unit_amount_decimal: {
                                kind: "nullable",
                                inner: { kind: "decimal_string" }
                              }
                            }
                          }
                        },
                        unit_amount_decimal: {
                          kind: "nullable",
                          inner: { kind: "decimal_string" }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });
  }
  /**
   * Removes the currently applied discount on a subscription.
   */
  deleteDiscount(id, params, options) {
    return this._makeRequest("DELETE", `/v1/subscriptions/${id}/discount`, params, options);
  }
  /**
   * By default, returns a list of subscriptions that have not been canceled. In order to list canceled subscriptions, specify status=canceled.
   */
  list(params, options) {
    return this._makeRequest("GET", "/v1/subscriptions", params, options, {
      methodType: "list",
      responseSchema: {
        kind: "object",
        fields: {
          data: {
            kind: "array",
            element: {
              kind: "object",
              fields: {
                items: {
                  kind: "object",
                  fields: {
                    data: {
                      kind: "array",
                      element: {
                        kind: "object",
                        fields: {
                          plan: {
                            kind: "object",
                            fields: {
                              amount_decimal: {
                                kind: "nullable",
                                inner: { kind: "decimal_string" }
                              },
                              tiers: {
                                kind: "array",
                                element: {
                                  kind: "object",
                                  fields: {
                                    flat_amount_decimal: {
                                      kind: "nullable",
                                      inner: { kind: "decimal_string" }
                                    },
                                    unit_amount_decimal: {
                                      kind: "nullable",
                                      inner: { kind: "decimal_string" }
                                    }
                                  }
                                }
                              }
                            }
                          },
                          price: {
                            kind: "object",
                            fields: {
                              currency_options: {
                                kind: "array",
                                element: {
                                  kind: "object",
                                  fields: {
                                    tiers: {
                                      kind: "array",
                                      element: {
                                        kind: "object",
                                        fields: {
                                          flat_amount_decimal: {
                                            kind: "nullable",
                                            inner: { kind: "decimal_string" }
                                          },
                                          unit_amount_decimal: {
                                            kind: "nullable",
                                            inner: { kind: "decimal_string" }
                                          }
                                        }
                                      }
                                    },
                                    unit_amount_decimal: {
                                      kind: "nullable",
                                      inner: { kind: "decimal_string" }
                                    }
                                  }
                                }
                              },
                              tiers: {
                                kind: "array",
                                element: {
                                  kind: "object",
                                  fields: {
                                    flat_amount_decimal: {
                                      kind: "nullable",
                                      inner: { kind: "decimal_string" }
                                    },
                                    unit_amount_decimal: {
                                      kind: "nullable",
                                      inner: { kind: "decimal_string" }
                                    }
                                  }
                                }
                              },
                              unit_amount_decimal: {
                                kind: "nullable",
                                inner: { kind: "decimal_string" }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });
  }
  /**
   * Creates a new subscription on an existing customer. Each customer can have up to 500 active or scheduled subscriptions.
   *
   * When you create a subscription with collection_method=charge_automatically, the first invoice is finalized as part of the request.
   * The payment_behavior parameter determines the exact behavior of the initial payment.
   *
   * To start subscriptions where the first invoice always begins in a draft status, use [subscription schedules](https://docs.stripe.com/docs/billing/subscriptions/subscription-schedules#managing) instead.
   * Schedules provide the flexibility to model more complex billing configurations that change over time.
   */
  create(params, options) {
    return this._makeRequest("POST", "/v1/subscriptions", params, options, {
      requestSchema: {
        kind: "object",
        fields: {
          add_invoice_items: {
            kind: "array",
            element: {
              kind: "object",
              fields: {
                price_data: {
                  kind: "object",
                  fields: { unit_amount_decimal: { kind: "decimal_string" } }
                }
              }
            }
          },
          items: {
            kind: "array",
            element: {
              kind: "object",
              fields: {
                price_data: {
                  kind: "object",
                  fields: { unit_amount_decimal: { kind: "decimal_string" } }
                }
              }
            }
          }
        }
      },
      responseSchema: {
        kind: "object",
        fields: {
          items: {
            kind: "object",
            fields: {
              data: {
                kind: "array",
                element: {
                  kind: "object",
                  fields: {
                    plan: {
                      kind: "object",
                      fields: {
                        amount_decimal: {
                          kind: "nullable",
                          inner: { kind: "decimal_string" }
                        },
                        tiers: {
                          kind: "array",
                          element: {
                            kind: "object",
                            fields: {
                              flat_amount_decimal: {
                                kind: "nullable",
                                inner: { kind: "decimal_string" }
                              },
                              unit_amount_decimal: {
                                kind: "nullable",
                                inner: { kind: "decimal_string" }
                              }
                            }
                          }
                        }
                      }
                    },
                    price: {
                      kind: "object",
                      fields: {
                        currency_options: {
                          kind: "array",
                          element: {
                            kind: "object",
                            fields: {
                              tiers: {
                                kind: "array",
                                element: {
                                  kind: "object",
                                  fields: {
                                    flat_amount_decimal: {
                                      kind: "nullable",
                                      inner: { kind: "decimal_string" }
                                    },
                                    unit_amount_decimal: {
                                      kind: "nullable",
                                      inner: { kind: "decimal_string" }
                                    }
                                  }
                                }
                              },
                              unit_amount_decimal: {
                                kind: "nullable",
                                inner: { kind: "decimal_string" }
                              }
                            }
                          }
                        },
                        tiers: {
                          kind: "array",
                          element: {
                            kind: "object",
                            fields: {
                              flat_amount_decimal: {
                                kind: "nullable",
                                inner: { kind: "decimal_string" }
                              },
                              unit_amount_decimal: {
                                kind: "nullable",
                                inner: { kind: "decimal_string" }
                              }
                            }
                          }
                        },
                        unit_amount_decimal: {
                          kind: "nullable",
                          inner: { kind: "decimal_string" }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });
  }
  /**
   * Search for subscriptions you've previously created using Stripe's [Search Query Language](https://docs.stripe.com/docs/search#search-query-language).
   * Don't use search in read-after-write flows where strict consistency is necessary. Under normal operating
   * conditions, data is searchable in less than a minute. Occasionally, propagation of new or updated data can be up
   * to an hour behind during outages. Search functionality is not available to merchants in India.
   */
  search(params, options) {
    return this._makeRequest("GET", "/v1/subscriptions/search", params, options, {
      methodType: "search",
      responseSchema: {
        kind: "object",
        fields: {
          data: {
            kind: "array",
            element: {
              kind: "object",
              fields: {
                items: {
                  kind: "object",
                  fields: {
                    data: {
                      kind: "array",
                      element: {
                        kind: "object",
                        fields: {
                          plan: {
                            kind: "object",
                            fields: {
                              amount_decimal: {
                                kind: "nullable",
                                inner: { kind: "decimal_string" }
                              },
                              tiers: {
                                kind: "array",
                                element: {
                                  kind: "object",
                                  fields: {
                                    flat_amount_decimal: {
                                      kind: "nullable",
                                      inner: { kind: "decimal_string" }
                                    },
                                    unit_amount_decimal: {
                                      kind: "nullable",
                                      inner: { kind: "decimal_string" }
                                    }
                                  }
                                }
                              }
                            }
                          },
                          price: {
                            kind: "object",
                            fields: {
                              currency_options: {
                                kind: "array",
                                element: {
                                  kind: "object",
                                  fields: {
                                    tiers: {
                                      kind: "array",
                                      element: {
                                        kind: "object",
                                        fields: {
                                          flat_amount_decimal: {
                                            kind: "nullable",
                                            inner: { kind: "decimal_string" }
                                          },
                                          unit_amount_decimal: {
                                            kind: "nullable",
                                            inner: { kind: "decimal_string" }
                                          }
                                        }
                                      }
                                    },
                                    unit_amount_decimal: {
                                      kind: "nullable",
                                      inner: { kind: "decimal_string" }
                                    }
                                  }
                                }
                              },
                              tiers: {
                                kind: "array",
                                element: {
                                  kind: "object",
                                  fields: {
                                    flat_amount_decimal: {
                                      kind: "nullable",
                                      inner: { kind: "decimal_string" }
                                    },
                                    unit_amount_decimal: {
                                      kind: "nullable",
                                      inner: { kind: "decimal_string" }
                                    }
                                  }
                                }
                              },
                              unit_amount_decimal: {
                                kind: "nullable",
                                inner: { kind: "decimal_string" }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });
  }
  /**
   * Upgrade the billing_mode of an existing subscription.
   */
  migrate(id, params, options) {
    return this._makeRequest("POST", `/v1/subscriptions/${id}/migrate`, params, options, {
      responseSchema: {
        kind: "object",
        fields: {
          items: {
            kind: "object",
            fields: {
              data: {
                kind: "array",
                element: {
                  kind: "object",
                  fields: {
                    plan: {
                      kind: "object",
                      fields: {
                        amount_decimal: {
                          kind: "nullable",
                          inner: { kind: "decimal_string" }
                        },
                        tiers: {
                          kind: "array",
                          element: {
                            kind: "object",
                            fields: {
                              flat_amount_decimal: {
                                kind: "nullable",
                                inner: { kind: "decimal_string" }
                              },
                              unit_amount_decimal: {
                                kind: "nullable",
                                inner: { kind: "decimal_string" }
                              }
                            }
                          }
                        }
                      }
                    },
                    price: {
                      kind: "object",
                      fields: {
                        currency_options: {
                          kind: "array",
                          element: {
                            kind: "object",
                            fields: {
                              tiers: {
                                kind: "array",
                                element: {
                                  kind: "object",
                                  fields: {
                                    flat_amount_decimal: {
                                      kind: "nullable",
                                      inner: { kind: "decimal_string" }
                                    },
                                    unit_amount_decimal: {
                                      kind: "nullable",
                                      inner: { kind: "decimal_string" }
                                    }
                                  }
                                }
                              },
                              unit_amount_decimal: {
                                kind: "nullable",
                                inner: { kind: "decimal_string" }
                              }
                            }
                          }
                        },
                        tiers: {
                          kind: "array",
                          element: {
                            kind: "object",
                            fields: {
                              flat_amount_decimal: {
                                kind: "nullable",
                                inner: { kind: "decimal_string" }
                              },
                              unit_amount_decimal: {
                                kind: "nullable",
                                inner: { kind: "decimal_string" }
                              }
                            }
                          }
                        },
                        unit_amount_decimal: {
                          kind: "nullable",
                          inner: { kind: "decimal_string" }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });
  }
  /**
   * Initiates resumption of a paused subscription, optionally resetting the billing cycle anchor and creating prorations. If no resumption invoice is generated, the subscription becomes active immediately. If a resumption invoice is generated, the subscription remains paused until the invoice is paid or marked uncollectible. If the invoice isn't paid by the expiration date, it is voided and the subscription remains paused. You can only resume subscriptions with collection_method set to charge_automatically. send_invoice subscriptions are not supported.
   */
  resume(id, params, options) {
    return this._makeRequest("POST", `/v1/subscriptions/${id}/resume`, params, options, {
      responseSchema: {
        kind: "object",
        fields: {
          items: {
            kind: "object",
            fields: {
              data: {
                kind: "array",
                element: {
                  kind: "object",
                  fields: {
                    plan: {
                      kind: "object",
                      fields: {
                        amount_decimal: {
                          kind: "nullable",
                          inner: { kind: "decimal_string" }
                        },
                        tiers: {
                          kind: "array",
                          element: {
                            kind: "object",
                            fields: {
                              flat_amount_decimal: {
                                kind: "nullable",
                                inner: { kind: "decimal_string" }
                              },
                              unit_amount_decimal: {
                                kind: "nullable",
                                inner: { kind: "decimal_string" }
                              }
                            }
                          }
                        }
                      }
                    },
                    price: {
                      kind: "object",
                      fields: {
                        currency_options: {
                          kind: "array",
                          element: {
                            kind: "object",
                            fields: {
                              tiers: {
                                kind: "array",
                                element: {
                                  kind: "object",
                                  fields: {
                                    flat_amount_decimal: {
                                      kind: "nullable",
                                      inner: { kind: "decimal_string" }
                                    },
                                    unit_amount_decimal: {
                                      kind: "nullable",
                                      inner: { kind: "decimal_string" }
                                    }
                                  }
                                }
                              },
                              unit_amount_decimal: {
                                kind: "nullable",
                                inner: { kind: "decimal_string" }
                              }
                            }
                          }
                        },
                        tiers: {
                          kind: "array",
                          element: {
                            kind: "object",
                            fields: {
                              flat_amount_decimal: {
                                kind: "nullable",
                                inner: { kind: "decimal_string" }
                              },
                              unit_amount_decimal: {
                                kind: "nullable",
                                inner: { kind: "decimal_string" }
                              }
                            }
                          }
                        },
                        unit_amount_decimal: {
                          kind: "nullable",
                          inner: { kind: "decimal_string" }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });
  }
};

// ../node_modules/stripe/esm/resources/SubscriptionItems.js
var SubscriptionItemResource = class extends StripeResource {
  static {
    __name(this, "SubscriptionItemResource");
  }
  /**
   * Deletes an item from the subscription. Removing a subscription item from a subscription will not cancel the subscription.
   */
  del(id, params, options) {
    return this._makeRequest("DELETE", `/v1/subscription_items/${id}`, params, options);
  }
  /**
   * Retrieves the subscription item with the given ID.
   */
  retrieve(id, params, options) {
    return this._makeRequest("GET", `/v1/subscription_items/${id}`, params, options, {
      responseSchema: {
        kind: "object",
        fields: {
          plan: {
            kind: "object",
            fields: {
              amount_decimal: {
                kind: "nullable",
                inner: { kind: "decimal_string" }
              },
              tiers: {
                kind: "array",
                element: {
                  kind: "object",
                  fields: {
                    flat_amount_decimal: {
                      kind: "nullable",
                      inner: { kind: "decimal_string" }
                    },
                    unit_amount_decimal: {
                      kind: "nullable",
                      inner: { kind: "decimal_string" }
                    }
                  }
                }
              }
            }
          },
          price: {
            kind: "object",
            fields: {
              currency_options: {
                kind: "array",
                element: {
                  kind: "object",
                  fields: {
                    tiers: {
                      kind: "array",
                      element: {
                        kind: "object",
                        fields: {
                          flat_amount_decimal: {
                            kind: "nullable",
                            inner: { kind: "decimal_string" }
                          },
                          unit_amount_decimal: {
                            kind: "nullable",
                            inner: { kind: "decimal_string" }
                          }
                        }
                      }
                    },
                    unit_amount_decimal: {
                      kind: "nullable",
                      inner: { kind: "decimal_string" }
                    }
                  }
                }
              },
              tiers: {
                kind: "array",
                element: {
                  kind: "object",
                  fields: {
                    flat_amount_decimal: {
                      kind: "nullable",
                      inner: { kind: "decimal_string" }
                    },
                    unit_amount_decimal: {
                      kind: "nullable",
                      inner: { kind: "decimal_string" }
                    }
                  }
                }
              },
              unit_amount_decimal: {
                kind: "nullable",
                inner: { kind: "decimal_string" }
              }
            }
          }
        }
      }
    });
  }
  /**
   * Updates the plan or quantity of an item on a current subscription.
   */
  update(id, params, options) {
    return this._makeRequest("POST", `/v1/subscription_items/${id}`, params, options, {
      requestSchema: {
        kind: "object",
        fields: {
          price_data: {
            kind: "object",
            fields: { unit_amount_decimal: { kind: "decimal_string" } }
          }
        }
      },
      responseSchema: {
        kind: "object",
        fields: {
          plan: {
            kind: "object",
            fields: {
              amount_decimal: {
                kind: "nullable",
                inner: { kind: "decimal_string" }
              },
              tiers: {
                kind: "array",
                element: {
                  kind: "object",
                  fields: {
                    flat_amount_decimal: {
                      kind: "nullable",
                      inner: { kind: "decimal_string" }
                    },
                    unit_amount_decimal: {
                      kind: "nullable",
                      inner: { kind: "decimal_string" }
                    }
                  }
                }
              }
            }
          },
          price: {
            kind: "object",
            fields: {
              currency_options: {
                kind: "array",
                element: {
                  kind: "object",
                  fields: {
                    tiers: {
                      kind: "array",
                      element: {
                        kind: "object",
                        fields: {
                          flat_amount_decimal: {
                            kind: "nullable",
                            inner: { kind: "decimal_string" }
                          },
                          unit_amount_decimal: {
                            kind: "nullable",
                            inner: { kind: "decimal_string" }
                          }
                        }
                      }
                    },
                    unit_amount_decimal: {
                      kind: "nullable",
                      inner: { kind: "decimal_string" }
                    }
                  }
                }
              },
              tiers: {
                kind: "array",
                element: {
                  kind: "object",
                  fields: {
                    flat_amount_decimal: {
                      kind: "nullable",
                      inner: { kind: "decimal_string" }
                    },
                    unit_amount_decimal: {
                      kind: "nullable",
                      inner: { kind: "decimal_string" }
                    }
                  }
                }
              },
              unit_amount_decimal: {
                kind: "nullable",
                inner: { kind: "decimal_string" }
              }
            }
          }
        }
      }
    });
  }
  /**
   * Returns a list of your subscription items for a given subscription.
   */
  list(params, options) {
    return this._makeRequest("GET", "/v1/subscription_items", params, options, {
      methodType: "list",
      responseSchema: {
        kind: "object",
        fields: {
          data: {
            kind: "array",
            element: {
              kind: "object",
              fields: {
                plan: {
                  kind: "object",
                  fields: {
                    amount_decimal: {
                      kind: "nullable",
                      inner: { kind: "decimal_string" }
                    },
                    tiers: {
                      kind: "array",
                      element: {
                        kind: "object",
                        fields: {
                          flat_amount_decimal: {
                            kind: "nullable",
                            inner: { kind: "decimal_string" }
                          },
                          unit_amount_decimal: {
                            kind: "nullable",
                            inner: { kind: "decimal_string" }
                          }
                        }
                      }
                    }
                  }
                },
                price: {
                  kind: "object",
                  fields: {
                    currency_options: {
                      kind: "array",
                      element: {
                        kind: "object",
                        fields: {
                          tiers: {
                            kind: "array",
                            element: {
                              kind: "object",
                              fields: {
                                flat_amount_decimal: {
                                  kind: "nullable",
                                  inner: { kind: "decimal_string" }
                                },
                                unit_amount_decimal: {
                                  kind: "nullable",
                                  inner: { kind: "decimal_string" }
                                }
                              }
                            }
                          },
                          unit_amount_decimal: {
                            kind: "nullable",
                            inner: { kind: "decimal_string" }
                          }
                        }
                      }
                    },
                    tiers: {
                      kind: "array",
                      element: {
                        kind: "object",
                        fields: {
                          flat_amount_decimal: {
                            kind: "nullable",
                            inner: { kind: "decimal_string" }
                          },
                          unit_amount_decimal: {
                            kind: "nullable",
                            inner: { kind: "decimal_string" }
                          }
                        }
                      }
                    },
                    unit_amount_decimal: {
                      kind: "nullable",
                      inner: { kind: "decimal_string" }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });
  }
  /**
   * Adds a new item to an existing subscription. No existing items will be changed or replaced.
   */
  create(params, options) {
    return this._makeRequest("POST", "/v1/subscription_items", params, options, {
      requestSchema: {
        kind: "object",
        fields: {
          price_data: {
            kind: "object",
            fields: { unit_amount_decimal: { kind: "decimal_string" } }
          }
        }
      },
      responseSchema: {
        kind: "object",
        fields: {
          plan: {
            kind: "object",
            fields: {
              amount_decimal: {
                kind: "nullable",
                inner: { kind: "decimal_string" }
              },
              tiers: {
                kind: "array",
                element: {
                  kind: "object",
                  fields: {
                    flat_amount_decimal: {
                      kind: "nullable",
                      inner: { kind: "decimal_string" }
                    },
                    unit_amount_decimal: {
                      kind: "nullable",
                      inner: { kind: "decimal_string" }
                    }
                  }
                }
              }
            }
          },
          price: {
            kind: "object",
            fields: {
              currency_options: {
                kind: "array",
                element: {
                  kind: "object",
                  fields: {
                    tiers: {
                      kind: "array",
                      element: {
                        kind: "object",
                        fields: {
                          flat_amount_decimal: {
                            kind: "nullable",
                            inner: { kind: "decimal_string" }
                          },
                          unit_amount_decimal: {
                            kind: "nullable",
                            inner: { kind: "decimal_string" }
                          }
                        }
                      }
                    },
                    unit_amount_decimal: {
                      kind: "nullable",
                      inner: { kind: "decimal_string" }
                    }
                  }
                }
              },
              tiers: {
                kind: "array",
                element: {
                  kind: "object",
                  fields: {
                    flat_amount_decimal: {
                      kind: "nullable",
                      inner: { kind: "decimal_string" }
                    },
                    unit_amount_decimal: {
                      kind: "nullable",
                      inner: { kind: "decimal_string" }
                    }
                  }
                }
              },
              unit_amount_decimal: {
                kind: "nullable",
                inner: { kind: "decimal_string" }
              }
            }
          }
        }
      }
    });
  }
};

// ../node_modules/stripe/esm/resources/SubscriptionSchedules.js
var SubscriptionScheduleResource = class extends StripeResource {
  static {
    __name(this, "SubscriptionScheduleResource");
  }
  /**
   * Retrieves the list of your subscription schedules.
   */
  list(params, options) {
    return this._makeRequest("GET", "/v1/subscription_schedules", params, options, {
      methodType: "list"
    });
  }
  /**
   * Creates a new subscription schedule object. Each customer can have up to 500 active or scheduled subscriptions.
   */
  create(params, options) {
    return this._makeRequest("POST", "/v1/subscription_schedules", params, options, {
      requestSchema: {
        kind: "object",
        fields: {
          phases: {
            kind: "array",
            element: {
              kind: "object",
              fields: {
                add_invoice_items: {
                  kind: "array",
                  element: {
                    kind: "object",
                    fields: {
                      price_data: {
                        kind: "object",
                        fields: {
                          unit_amount_decimal: { kind: "decimal_string" }
                        }
                      }
                    }
                  }
                },
                items: {
                  kind: "array",
                  element: {
                    kind: "object",
                    fields: {
                      price_data: {
                        kind: "object",
                        fields: {
                          unit_amount_decimal: { kind: "decimal_string" }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });
  }
  /**
   * Retrieves the details of an existing subscription schedule. You only need to supply the unique subscription schedule identifier that was returned upon subscription schedule creation.
   */
  retrieve(id, params, options) {
    return this._makeRequest("GET", `/v1/subscription_schedules/${id}`, params, options);
  }
  /**
   * Updates an existing subscription schedule.
   */
  update(id, params, options) {
    return this._makeRequest("POST", `/v1/subscription_schedules/${id}`, params, options, {
      requestSchema: {
        kind: "object",
        fields: {
          phases: {
            kind: "array",
            element: {
              kind: "object",
              fields: {
                add_invoice_items: {
                  kind: "array",
                  element: {
                    kind: "object",
                    fields: {
                      price_data: {
                        kind: "object",
                        fields: {
                          unit_amount_decimal: { kind: "decimal_string" }
                        }
                      }
                    }
                  }
                },
                items: {
                  kind: "array",
                  element: {
                    kind: "object",
                    fields: {
                      price_data: {
                        kind: "object",
                        fields: {
                          unit_amount_decimal: { kind: "decimal_string" }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });
  }
  /**
   * Cancels a subscription schedule and its associated subscription immediately (if the subscription schedule has an active subscription). A subscription schedule can only be canceled if its status is not_started or active.
   */
  cancel(id, params, options) {
    return this._makeRequest("POST", `/v1/subscription_schedules/${id}/cancel`, params, options);
  }
  /**
   * Releases the subscription schedule immediately, which will stop scheduling of its phases, but leave any existing subscription in place. A schedule can only be released if its status is not_started or active. If the subscription schedule is currently associated with a subscription, releasing it will remove its subscription property and set the subscription's ID to the released_subscription property.
   */
  release(id, params, options) {
    return this._makeRequest("POST", `/v1/subscription_schedules/${id}/release`, params, options);
  }
};

// ../node_modules/stripe/esm/resources/TaxCodes.js
var TaxCodeResource = class extends StripeResource {
  static {
    __name(this, "TaxCodeResource");
  }
  /**
   * A list of [all tax codes available](https://stripe.com/docs/tax/tax-categories) to add to Products in order to allow specific tax calculations.
   */
  list(params, options) {
    return this._makeRequest("GET", "/v1/tax_codes", params, options, {
      methodType: "list"
    });
  }
  /**
   * Retrieves the details of an existing tax code. Supply the unique tax code ID and Stripe will return the corresponding tax code information.
   */
  retrieve(id, params, options) {
    return this._makeRequest("GET", `/v1/tax_codes/${id}`, params, options);
  }
};

// ../node_modules/stripe/esm/resources/TaxIds.js
var TaxIdResource = class extends StripeResource {
  static {
    __name(this, "TaxIdResource");
  }
  /**
   * Deletes an existing account or customer tax_id object.
   */
  del(id, params, options) {
    return this._makeRequest("DELETE", `/v1/tax_ids/${id}`, params, options);
  }
  /**
   * Retrieves an account or customer tax_id object.
   */
  retrieve(id, params, options) {
    return this._makeRequest("GET", `/v1/tax_ids/${id}`, params, options);
  }
  /**
   * Returns a list of tax IDs.
   */
  list(params, options) {
    return this._makeRequest("GET", "/v1/tax_ids", params, options, {
      methodType: "list"
    });
  }
  /**
   * Creates a new account or customer tax_id object.
   */
  create(params, options) {
    return this._makeRequest("POST", "/v1/tax_ids", params, options);
  }
};

// ../node_modules/stripe/esm/resources/TaxRates.js
var TaxRateResource = class extends StripeResource {
  static {
    __name(this, "TaxRateResource");
  }
  /**
   * Returns a list of your tax rates. Tax rates are returned sorted by creation date, with the most recently created tax rates appearing first.
   */
  list(params, options) {
    return this._makeRequest("GET", "/v1/tax_rates", params, options, {
      methodType: "list"
    });
  }
  /**
   * Creates a new tax rate.
   */
  create(params, options) {
    return this._makeRequest("POST", "/v1/tax_rates", params, options);
  }
  /**
   * Retrieves a tax rate with the given ID
   */
  retrieve(id, params, options) {
    return this._makeRequest("GET", `/v1/tax_rates/${id}`, params, options);
  }
  /**
   * Updates an existing tax rate.
   */
  update(id, params, options) {
    return this._makeRequest("POST", `/v1/tax_rates/${id}`, params, options);
  }
};

// ../node_modules/stripe/esm/resources/Tokens.js
var TokenResource2 = class extends StripeResource {
  static {
    __name(this, "TokenResource");
  }
  /**
   * Retrieves the token with the given ID.
   */
  retrieve(id, params, options) {
    return this._makeRequest("GET", `/v1/tokens/${id}`, params, options);
  }
  /**
   * Creates a single-use token that represents a bank account's details.
   * You can use this token with any v1 API method in place of a bank account dictionary. You can only use this token once. To do so, attach it to a [connected account](https://docs.stripe.com/api#accounts) where [controller.requirement_collection](https://docs.stripe.com/api/accounts/object#account_object-controller-requirement_collection) is application, which includes Custom accounts.
   */
  create(params, options) {
    return this._makeRequest("POST", "/v1/tokens", params, options);
  }
};

// ../node_modules/stripe/esm/resources/Topups.js
var TopupResource = class extends StripeResource {
  static {
    __name(this, "TopupResource");
  }
  /**
   * Returns a list of top-ups.
   */
  list(params, options) {
    return this._makeRequest("GET", "/v1/topups", params, options, {
      methodType: "list"
    });
  }
  /**
   * Top up the balance of an account
   */
  create(params, options) {
    return this._makeRequest("POST", "/v1/topups", params, options);
  }
  /**
   * Retrieves the details of a top-up that has previously been created. Supply the unique top-up ID that was returned from your previous request, and Stripe will return the corresponding top-up information.
   */
  retrieve(id, params, options) {
    return this._makeRequest("GET", `/v1/topups/${id}`, params, options);
  }
  /**
   * Updates the metadata of a top-up. Other top-up details are not editable by design.
   */
  update(id, params, options) {
    return this._makeRequest("POST", `/v1/topups/${id}`, params, options);
  }
  /**
   * Cancels a top-up. Only pending top-ups can be canceled.
   */
  cancel(id, params, options) {
    return this._makeRequest("POST", `/v1/topups/${id}/cancel`, params, options);
  }
};

// ../node_modules/stripe/esm/resources/Transfers.js
var TransferResource = class extends StripeResource {
  static {
    __name(this, "TransferResource");
  }
  /**
   * Returns a list of existing transfers sent to connected accounts. The transfers are returned in sorted order, with the most recently created transfers appearing first.
   */
  list(params, options) {
    return this._makeRequest("GET", "/v1/transfers", params, options, {
      methodType: "list"
    });
  }
  /**
   * To send funds from your Stripe account to a connected account, you create a new transfer object. Your [Stripe balance](https://docs.stripe.com/api#balance) must be able to cover the transfer amount, or you'll receive an “Insufficient Funds” error.
   */
  create(params, options) {
    return this._makeRequest("POST", "/v1/transfers", params, options);
  }
  /**
   * Retrieves the details of an existing transfer. Supply the unique transfer ID from either a transfer creation request or the transfer list, and Stripe will return the corresponding transfer information.
   */
  retrieve(id, params, options) {
    return this._makeRequest("GET", `/v1/transfers/${id}`, params, options);
  }
  /**
   * Updates the specified transfer by setting the values of the parameters passed. Any parameters not provided will be left unchanged.
   *
   * This request accepts only metadata as an argument.
   */
  update(id, params, options) {
    return this._makeRequest("POST", `/v1/transfers/${id}`, params, options);
  }
  /**
   * You can see a list of the reversals belonging to a specific transfer. Note that the 10 most recent reversals are always available by default on the transfer object. If you need more than those 10, you can use this API method and the limit and starting_after parameters to page through additional reversals.
   */
  listReversals(id, params, options) {
    return this._makeRequest("GET", `/v1/transfers/${id}/reversals`, params, options, {
      methodType: "list"
    });
  }
  /**
   * When you create a new reversal, you must specify a transfer to create it on.
   *
   * When reversing transfers, you can optionally reverse part of the transfer. You can do so as many times as you wish until the entire transfer has been reversed.
   *
   * Once entirely reversed, a transfer can't be reversed again. This method will return an error when called on an already-reversed transfer, or when trying to reverse more money than is left on a transfer.
   */
  createReversal(id, params, options) {
    return this._makeRequest("POST", `/v1/transfers/${id}/reversals`, params, options);
  }
  /**
   * By default, you can see the 10 most recent reversals stored directly on the transfer object, but you can also retrieve details about a specific reversal stored on the transfer.
   */
  retrieveReversal(transferId, id, params, options) {
    return this._makeRequest("GET", `/v1/transfers/${transferId}/reversals/${id}`, params, options);
  }
  /**
   * Updates the specified reversal by setting the values of the parameters passed. Any parameters not provided will be left unchanged.
   *
   * This request only accepts metadata and description as arguments.
   */
  updateReversal(transferId, id, params, options) {
    return this._makeRequest("POST", `/v1/transfers/${transferId}/reversals/${id}`, params, options);
  }
};

// ../node_modules/stripe/esm/resources/WebhookEndpoints.js
var WebhookEndpointResource = class extends StripeResource {
  static {
    __name(this, "WebhookEndpointResource");
  }
  /**
   * You can also delete webhook endpoints via the [webhook endpoint management](https://dashboard.stripe.com/account/webhooks) page of the Stripe dashboard.
   */
  del(id, params, options) {
    return this._makeRequest("DELETE", `/v1/webhook_endpoints/${id}`, params, options);
  }
  /**
   * Retrieves the webhook endpoint with the given ID.
   */
  retrieve(id, params, options) {
    return this._makeRequest("GET", `/v1/webhook_endpoints/${id}`, params, options);
  }
  /**
   * Updates the webhook endpoint. You may edit the url, the list of enabled_events, and the status of your endpoint.
   */
  update(id, params, options) {
    return this._makeRequest("POST", `/v1/webhook_endpoints/${id}`, params, options);
  }
  /**
   * Returns a list of your webhook endpoints.
   */
  list(params, options) {
    return this._makeRequest("GET", "/v1/webhook_endpoints", params, options, {
      methodType: "list"
    });
  }
  /**
   * A webhook endpoint must have a url and a list of enabled_events. You may optionally specify the Boolean connect parameter. If set to true, then a Connect webhook endpoint that notifies the specified url about events from all connected accounts is created; otherwise an account webhook endpoint that notifies the specified url only about events from your account is created. You can also create webhook endpoints in the [webhooks settings](https://dashboard.stripe.com/account/webhooks) section of the Dashboard.
   */
  create(params, options) {
    return this._makeRequest("POST", "/v1/webhook_endpoints", params, options);
  }
};

// ../node_modules/stripe/esm/resources.js
var Apps = resourceNamespace("apps", { Secrets: SecretResource });
var Billing = resourceNamespace("billing", {
  Alerts: AlertResource,
  CreditBalanceSummary: CreditBalanceSummaryResource,
  CreditBalanceTransactions: CreditBalanceTransactionResource,
  CreditGrants: CreditGrantResource,
  MeterEventAdjustments: MeterEventAdjustmentResource,
  MeterEvents: MeterEventResource,
  Meters: MeterResource
});
var BillingPortal = resourceNamespace("billingPortal", {
  Configurations: ConfigurationResource,
  Sessions: SessionResource
});
var Checkout = resourceNamespace("checkout", {
  Sessions: SessionResource2
});
var Climate = resourceNamespace("climate", {
  Orders: OrderResource,
  Products: ProductResource,
  Suppliers: SupplierResource
});
var Entitlements = resourceNamespace("entitlements", {
  ActiveEntitlements: ActiveEntitlementResource,
  Features: FeatureResource
});
var FinancialConnections = resourceNamespace("financialConnections", {
  Accounts: AccountResource,
  Sessions: SessionResource3,
  Transactions: TransactionResource
});
var Forwarding = resourceNamespace("forwarding", {
  Requests: RequestResource
});
var Identity = resourceNamespace("identity", {
  VerificationReports: VerificationReportResource,
  VerificationSessions: VerificationSessionResource
});
var Issuing = resourceNamespace("issuing", {
  Authorizations: AuthorizationResource,
  Cardholders: CardholderResource,
  Cards: CardResource,
  Disputes: DisputeResource,
  PersonalizationDesigns: PersonalizationDesignResource,
  PhysicalBundles: PhysicalBundleResource,
  Tokens: TokenResource,
  Transactions: TransactionResource2
});
var Radar = resourceNamespace("radar", {
  EarlyFraudWarnings: EarlyFraudWarningResource,
  PaymentEvaluations: PaymentEvaluationResource,
  ValueListItems: ValueListItemResource,
  ValueLists: ValueListResource
});
var Reporting = resourceNamespace("reporting", {
  ReportRuns: ReportRunResource,
  ReportTypes: ReportTypeResource
});
var Sigma = resourceNamespace("sigma", {
  ScheduledQueryRuns: ScheduledQueryRunResource
});
var Tax = resourceNamespace("tax", {
  Associations: AssociationResource,
  Calculations: CalculationResource,
  Registrations: RegistrationResource,
  Settings: SettingResource,
  Transactions: TransactionResource3
});
var Terminal = resourceNamespace("terminal", {
  Configurations: ConfigurationResource2,
  ConnectionTokens: ConnectionTokenResource,
  Locations: LocationResource,
  OnboardingLinks: OnboardingLinkResource,
  Readers: ReaderResource
});
var TestHelpers = resourceNamespace("testHelpers", {
  ConfirmationTokens: ConfirmationTokenResource,
  Customers: CustomerResource,
  Refunds: RefundResource,
  TestClocks: TestClockResource,
  Issuing: resourceNamespace("issuing", {
    Authorizations: AuthorizationResource2,
    Cards: CardResource2,
    PersonalizationDesigns: PersonalizationDesignResource2,
    Transactions: TransactionResource4
  }),
  Terminal: resourceNamespace("terminal", {
    Readers: ReaderResource2
  }),
  Treasury: resourceNamespace("treasury", {
    InboundTransfers: InboundTransferResource,
    OutboundPayments: OutboundPaymentResource,
    OutboundTransfers: OutboundTransferResource,
    ReceivedCredits: ReceivedCreditResource,
    ReceivedDebits: ReceivedDebitResource
  })
});
var Treasury = resourceNamespace("treasury", {
  CreditReversals: CreditReversalResource,
  DebitReversals: DebitReversalResource,
  FinancialAccounts: FinancialAccountResource,
  InboundTransfers: InboundTransferResource2,
  OutboundPayments: OutboundPaymentResource2,
  OutboundTransfers: OutboundTransferResource2,
  ReceivedCredits: ReceivedCreditResource2,
  ReceivedDebits: ReceivedDebitResource2,
  TransactionEntries: TransactionEntryResource,
  Transactions: TransactionResource5
});
var V2 = resourceNamespace("v2", {
  Billing: resourceNamespace("billing", {
    MeterEventAdjustments: MeterEventAdjustmentResource2,
    MeterEventSession: MeterEventSessionResource,
    MeterEventStream: MeterEventStreamResource,
    MeterEvents: MeterEventResource2
  }),
  Core: resourceNamespace("core", {
    AccountLinks: AccountLinkResource,
    AccountTokens: AccountTokenResource,
    Accounts: AccountResource2,
    EventDestinations: EventDestinationResource,
    Events: EventResource
  })
});

// ../node_modules/stripe/esm/resources/Apps/index.js
var Apps2 = class {
  static {
    __name(this, "Apps");
  }
  constructor(stripe) {
    this.stripe = stripe;
    this.secrets = new SecretResource(stripe);
  }
};

// ../node_modules/stripe/esm/resources/Billing/index.js
var Billing2 = class {
  static {
    __name(this, "Billing");
  }
  constructor(stripe) {
    this.stripe = stripe;
    this.alerts = new AlertResource(stripe);
    this.creditBalanceSummaries = new CreditBalanceSummaryResource(stripe);
    this.creditBalanceTransactions = new CreditBalanceTransactionResource(stripe);
    this.creditGrants = new CreditGrantResource(stripe);
    this.meters = new MeterResource(stripe);
    this.meterEvents = new MeterEventResource(stripe);
    this.meterEventAdjustments = new MeterEventAdjustmentResource(stripe);
  }
};

// ../node_modules/stripe/esm/resources/BillingPortal/index.js
var BillingPortal2 = class {
  static {
    __name(this, "BillingPortal");
  }
  constructor(stripe) {
    this.stripe = stripe;
    this.configurations = new ConfigurationResource(stripe);
    this.sessions = new SessionResource(stripe);
  }
};

// ../node_modules/stripe/esm/resources/Checkout/index.js
var Checkout2 = class {
  static {
    __name(this, "Checkout");
  }
  constructor(stripe) {
    this.stripe = stripe;
    this.sessions = new SessionResource2(stripe);
  }
};

// ../node_modules/stripe/esm/resources/Climate/index.js
var Climate2 = class {
  static {
    __name(this, "Climate");
  }
  constructor(stripe) {
    this.stripe = stripe;
    this.orders = new OrderResource(stripe);
    this.products = new ProductResource(stripe);
    this.suppliers = new SupplierResource(stripe);
  }
};

// ../node_modules/stripe/esm/resources/Entitlements/index.js
var Entitlements2 = class {
  static {
    __name(this, "Entitlements");
  }
  constructor(stripe) {
    this.stripe = stripe;
    this.activeEntitlements = new ActiveEntitlementResource(stripe);
    this.features = new FeatureResource(stripe);
  }
};

// ../node_modules/stripe/esm/resources/FinancialConnections/index.js
var FinancialConnections2 = class {
  static {
    __name(this, "FinancialConnections");
  }
  constructor(stripe) {
    this.stripe = stripe;
    this.accounts = new AccountResource(stripe);
    this.sessions = new SessionResource3(stripe);
    this.transactions = new TransactionResource(stripe);
  }
};

// ../node_modules/stripe/esm/resources/Forwarding/index.js
var Forwarding2 = class {
  static {
    __name(this, "Forwarding");
  }
  constructor(stripe) {
    this.stripe = stripe;
    this.requests = new RequestResource(stripe);
  }
};

// ../node_modules/stripe/esm/resources/Identity/index.js
var Identity2 = class {
  static {
    __name(this, "Identity");
  }
  constructor(stripe) {
    this.stripe = stripe;
    this.verificationReports = new VerificationReportResource(stripe);
    this.verificationSessions = new VerificationSessionResource(stripe);
  }
};

// ../node_modules/stripe/esm/resources/Issuing/index.js
var Issuing2 = class {
  static {
    __name(this, "Issuing");
  }
  constructor(stripe) {
    this.stripe = stripe;
    this.authorizations = new AuthorizationResource(stripe);
    this.cards = new CardResource(stripe);
    this.cardholders = new CardholderResource(stripe);
    this.disputes = new DisputeResource(stripe);
    this.personalizationDesigns = new PersonalizationDesignResource(stripe);
    this.physicalBundles = new PhysicalBundleResource(stripe);
    this.tokens = new TokenResource(stripe);
    this.transactions = new TransactionResource2(stripe);
  }
};

// ../node_modules/stripe/esm/resources/Radar/index.js
var Radar2 = class {
  static {
    __name(this, "Radar");
  }
  constructor(stripe) {
    this.stripe = stripe;
    this.earlyFraudWarnings = new EarlyFraudWarningResource(stripe);
    this.paymentEvaluations = new PaymentEvaluationResource(stripe);
    this.valueLists = new ValueListResource(stripe);
    this.valueListItems = new ValueListItemResource(stripe);
  }
};

// ../node_modules/stripe/esm/resources/Reporting/index.js
var Reporting2 = class {
  static {
    __name(this, "Reporting");
  }
  constructor(stripe) {
    this.stripe = stripe;
    this.reportRuns = new ReportRunResource(stripe);
    this.reportTypes = new ReportTypeResource(stripe);
  }
};

// ../node_modules/stripe/esm/resources/Sigma/index.js
var Sigma2 = class {
  static {
    __name(this, "Sigma");
  }
  constructor(stripe) {
    this.stripe = stripe;
    this.scheduledQueryRuns = new ScheduledQueryRunResource(stripe);
  }
};

// ../node_modules/stripe/esm/resources/Tax/index.js
var Tax2 = class {
  static {
    __name(this, "Tax");
  }
  constructor(stripe) {
    this.stripe = stripe;
    this.associations = new AssociationResource(stripe);
    this.calculations = new CalculationResource(stripe);
    this.registrations = new RegistrationResource(stripe);
    this.settings = new SettingResource(stripe);
    this.transactions = new TransactionResource3(stripe);
  }
};

// ../node_modules/stripe/esm/resources/Terminal/index.js
var Terminal2 = class {
  static {
    __name(this, "Terminal");
  }
  constructor(stripe) {
    this.stripe = stripe;
    this.configurations = new ConfigurationResource2(stripe);
    this.connectionTokens = new ConnectionTokenResource(stripe);
    this.locations = new LocationResource(stripe);
    this.onboardingLinks = new OnboardingLinkResource(stripe);
    this.readers = new ReaderResource(stripe);
  }
};

// ../node_modules/stripe/esm/resources/TestHelpers/Issuing/index.js
var Issuing3 = class {
  static {
    __name(this, "Issuing");
  }
  constructor(stripe) {
    this.stripe = stripe;
    this.authorizations = new AuthorizationResource2(stripe);
    this.cards = new CardResource2(stripe);
    this.personalizationDesigns = new PersonalizationDesignResource2(stripe);
    this.transactions = new TransactionResource4(stripe);
  }
};

// ../node_modules/stripe/esm/resources/TestHelpers/Terminal/index.js
var Terminal3 = class {
  static {
    __name(this, "Terminal");
  }
  constructor(stripe) {
    this.stripe = stripe;
    this.readers = new ReaderResource2(stripe);
  }
};

// ../node_modules/stripe/esm/resources/TestHelpers/Treasury/index.js
var Treasury2 = class {
  static {
    __name(this, "Treasury");
  }
  constructor(stripe) {
    this.stripe = stripe;
    this.inboundTransfers = new InboundTransferResource(stripe);
    this.outboundPayments = new OutboundPaymentResource(stripe);
    this.outboundTransfers = new OutboundTransferResource(stripe);
    this.receivedCredits = new ReceivedCreditResource(stripe);
    this.receivedDebits = new ReceivedDebitResource(stripe);
  }
};

// ../node_modules/stripe/esm/resources/TestHelpers/index.js
var TestHelpers2 = class {
  static {
    __name(this, "TestHelpers");
  }
  constructor(stripe) {
    this.stripe = stripe;
    this.confirmationTokens = new ConfirmationTokenResource(stripe);
    this.customers = new CustomerResource(stripe);
    this.refunds = new RefundResource(stripe);
    this.testClocks = new TestClockResource(stripe);
    this.issuing = new Issuing3(stripe);
    this.terminal = new Terminal3(stripe);
    this.treasury = new Treasury2(stripe);
  }
};

// ../node_modules/stripe/esm/resources/Treasury/index.js
var Treasury3 = class {
  static {
    __name(this, "Treasury");
  }
  constructor(stripe) {
    this.stripe = stripe;
    this.creditReversals = new CreditReversalResource(stripe);
    this.debitReversals = new DebitReversalResource(stripe);
    this.financialAccounts = new FinancialAccountResource(stripe);
    this.inboundTransfers = new InboundTransferResource2(stripe);
    this.outboundPayments = new OutboundPaymentResource2(stripe);
    this.outboundTransfers = new OutboundTransferResource2(stripe);
    this.receivedCredits = new ReceivedCreditResource2(stripe);
    this.receivedDebits = new ReceivedDebitResource2(stripe);
    this.transactions = new TransactionResource5(stripe);
    this.transactionEntries = new TransactionEntryResource(stripe);
  }
};

// ../node_modules/stripe/esm/resources/V2/Billing/index.js
var Billing3 = class {
  static {
    __name(this, "Billing");
  }
  constructor(stripe) {
    this.stripe = stripe;
    this.meterEvents = new MeterEventResource2(stripe);
    this.meterEventAdjustments = new MeterEventAdjustmentResource2(stripe);
    this.meterEventSession = new MeterEventSessionResource(stripe);
    this.meterEventStream = new MeterEventStreamResource(stripe);
  }
};

// ../node_modules/stripe/esm/resources/V2/Core/index.js
var Core = class {
  static {
    __name(this, "Core");
  }
  constructor(stripe) {
    this.stripe = stripe;
    this.accounts = new AccountResource2(stripe);
    this.accountLinks = new AccountLinkResource(stripe);
    this.accountTokens = new AccountTokenResource(stripe);
    this.events = new EventResource(stripe);
    this.eventDestinations = new EventDestinationResource(stripe);
  }
};

// ../node_modules/stripe/esm/resources/V2/index.js
var V22 = class {
  static {
    __name(this, "V2");
  }
  constructor(stripe) {
    this.stripe = stripe;
    this.billing = new Billing3(stripe);
    this.core = new Core(stripe);
  }
};

// ../node_modules/stripe/esm/stripe.core.js
var DEFAULT_HOST = "api.stripe.com";
var DEFAULT_PORT = "443";
var DEFAULT_BASE_PATH = "/v1/";
var DEFAULT_API_VERSION = ApiVersion;
var DEFAULT_TIMEOUT = 8e4;
var MAX_NETWORK_RETRY_DELAY_SEC = 5;
var INITIAL_NETWORK_RETRY_DELAY_SEC = 0.5;
var APP_INFO_PROPERTIES = [
  "name",
  "version",
  "url",
  "partner_id"
];
var ALLOWED_CONFIG_PROPERTIES = [
  "authenticator",
  "apiVersion",
  "typescript",
  "maxNetworkRetries",
  "httpAgent",
  "httpClient",
  "timeout",
  "host",
  "port",
  "protocol",
  "telemetry",
  "emitEventBodies",
  "appInfo",
  "stripeAccount",
  "stripeContext"
];
var defaultRequestSenderFactory = /* @__PURE__ */ __name((stripe) => new RequestSender(stripe, StripeResource.MAX_BUFFERED_REQUEST_METRICS), "defaultRequestSenderFactory");
var Stripe = class _Stripe {
  static {
    __name(this, "Stripe");
  }
  static initialize(platformFunctions, requestSenderFactory = defaultRequestSenderFactory) {
    _Stripe._platformFunctions = platformFunctions;
    _Stripe._requestSenderFactory = requestSenderFactory;
    _Stripe.webhooks = createWebhooks(platformFunctions);
    _Stripe.createNodeHttpClient = platformFunctions.createNodeHttpClient;
    _Stripe.createFetchHttpClient = platformFunctions.createFetchHttpClient;
    _Stripe.createNodeCryptoProvider = platformFunctions.createNodeCryptoProvider;
    _Stripe.createSubtleCryptoProvider = platformFunctions.createSubtleCryptoProvider;
  }
  constructor(key, config = {}) {
    this._authenticator = null;
    const props = this._getPropsFromConfig(config);
    this._platformFunctions = _Stripe._platformFunctions;
    Object.defineProperty(this, "_emitter", {
      value: this._platformFunctions.createEmitter(),
      enumerable: false,
      configurable: false,
      writable: false
    });
    this.VERSION = _Stripe.PACKAGE_VERSION;
    this.on = this._emitter.on.bind(this._emitter);
    this.once = this._emitter.once.bind(this._emitter);
    this.off = this._emitter.removeListener.bind(this._emitter);
    const agent = props.httpAgent || null;
    this._api = {
      host: props.host || DEFAULT_HOST,
      port: props.port || DEFAULT_PORT,
      protocol: props.protocol || "https",
      basePath: DEFAULT_BASE_PATH,
      version: props.apiVersion || DEFAULT_API_VERSION,
      timeout: validateInteger("timeout", props.timeout, DEFAULT_TIMEOUT),
      maxNetworkRetries: validateInteger("maxNetworkRetries", props.maxNetworkRetries, 2),
      agent,
      httpClient: props.httpClient || (agent ? this._platformFunctions.createNodeHttpClient(agent) : this._platformFunctions.createDefaultHttpClient()),
      dev: false,
      stripeAccount: props.stripeAccount || null,
      stripeContext: props.stripeContext || null
    };
    const typescript = props.typescript || false;
    if (typescript !== _Stripe.USER_AGENT.typescript) {
      _Stripe.USER_AGENT.typescript = typescript;
    }
    if (props.appInfo) {
      this._setAppInfo(props.appInfo);
    }
    this._setAuthenticator(key, props.authenticator || null);
    this.errors = Error_exports;
    this.Decimal = Decimal;
    this.webhooks = _Stripe.webhooks;
    this._prevRequestMetrics = [];
    this._enableTelemetry = props.telemetry !== false;
    this._emitEventBodies = props.emitEventBodies === true;
    this._requestSender = _Stripe._requestSenderFactory(this);
    this.accountLinks = new AccountLinkResource2(this);
    this.accountSessions = new AccountSessionResource(this);
    this.accounts = new AccountResource3(this);
    this.applePayDomains = new ApplePayDomainResource(this);
    this.applicationFees = new ApplicationFeeResource(this);
    this.balance = new BalanceResource(this);
    this.balanceSettings = new BalanceSettingResource(this);
    this.balanceTransactions = new BalanceTransactionResource(this);
    this.charges = new ChargeResource(this);
    this.confirmationTokens = new ConfirmationTokenResource2(this);
    this.countrySpecs = new CountrySpecResource(this);
    this.coupons = new CouponResource(this);
    this.creditNotes = new CreditNoteResource(this);
    this.customerSessions = new CustomerSessionResource(this);
    this.customers = new CustomerResource2(this);
    this.disputes = new DisputeResource2(this);
    this.ephemeralKeys = new EphemeralKeyResource(this);
    this.events = new EventResource2(this);
    this.exchangeRates = new ExchangeRateResource(this);
    this.fileLinks = new FileLinkResource(this);
    this.files = new FileResource(this);
    this.invoiceItems = new InvoiceItemResource(this);
    this.invoicePayments = new InvoicePaymentResource(this);
    this.invoiceRenderingTemplates = new InvoiceRenderingTemplateResource(this);
    this.invoices = new InvoiceResource(this);
    this.mandates = new MandateResource(this);
    this.paymentAttemptRecords = new PaymentAttemptRecordResource(this);
    this.paymentIntents = new PaymentIntentResource(this);
    this.paymentLinks = new PaymentLinkResource(this);
    this.paymentMethodConfigurations = new PaymentMethodConfigurationResource(this);
    this.paymentMethodDomains = new PaymentMethodDomainResource(this);
    this.paymentMethods = new PaymentMethodResource(this);
    this.paymentRecords = new PaymentRecordResource(this);
    this.payouts = new PayoutResource(this);
    this.plans = new PlanResource(this);
    this.prices = new PriceResource(this);
    this.products = new ProductResource2(this);
    this.promotionCodes = new PromotionCodeResource(this);
    this.quotes = new QuoteResource(this);
    this.refunds = new RefundResource2(this);
    this.reviews = new ReviewResource(this);
    this.setupAttempts = new SetupAttemptResource(this);
    this.setupIntents = new SetupIntentResource(this);
    this.shippingRates = new ShippingRateResource(this);
    this.sources = new SourceResource(this);
    this.subscriptionItems = new SubscriptionItemResource(this);
    this.subscriptionSchedules = new SubscriptionScheduleResource(this);
    this.subscriptions = new SubscriptionResource(this);
    this.taxCodes = new TaxCodeResource(this);
    this.taxIds = new TaxIdResource(this);
    this.taxRates = new TaxRateResource(this);
    this.tokens = new TokenResource2(this);
    this.topups = new TopupResource(this);
    this.transfers = new TransferResource(this);
    this.webhookEndpoints = new WebhookEndpointResource(this);
    this.apps = new Apps2(this);
    this.billing = new Billing2(this);
    this.billingPortal = new BillingPortal2(this);
    this.checkout = new Checkout2(this);
    this.climate = new Climate2(this);
    this.entitlements = new Entitlements2(this);
    this.financialConnections = new FinancialConnections2(this);
    this.forwarding = new Forwarding2(this);
    this.identity = new Identity2(this);
    this.issuing = new Issuing2(this);
    this.radar = new Radar2(this);
    this.reporting = new Reporting2(this);
    this.sigma = new Sigma2(this);
    this.tax = new Tax2(this);
    this.terminal = new Terminal2(this);
    this.testHelpers = new TestHelpers2(this);
    this.treasury = new Treasury3(this);
    this.v2 = new V22(this);
    this.account = this.accounts;
    this.oauth = new OAuthResource(this);
  }
  /**
   * Allows for sending "raw" requests to the Stripe API, which can be used for
   * testing new API endpoints or performing requests that the library does
   * not support yet.
   *
   * @param method - HTTP request method, 'GET', 'POST', or 'DELETE'
   * @param path - The path of the request, e.g. '/v1/beta_endpoint'
   * @param params - The parameters to include in the request body.
   * @param options - Additional request options.
   */
  rawRequest(method, path, params, options) {
    return this._requestSender._rawRequest(method, path, params, options);
  }
  /**
   * @private
   */
  _setAuthenticator(key, authenticator) {
    if (key && authenticator) {
      throw new Error("Can't specify both apiKey and authenticator");
    }
    if (!key && !authenticator) {
      throw new Error("Neither apiKey nor config.authenticator provided");
    }
    this._authenticator = key ? createApiKeyAuthenticator(key) : authenticator;
  }
  /**
   * @private
   * This may be removed in the future.
   */
  _setAppInfo(info) {
    if (info && typeof info !== "object") {
      throw new Error("AppInfo must be an object.");
    }
    if (info && !info.name) {
      throw new Error("AppInfo.name is required");
    }
    info = info || {};
    this._appInfo = APP_INFO_PROPERTIES.reduce((accum, prop) => {
      if (typeof info[prop] == "string") {
        accum = accum || {};
        accum[prop] = info[prop];
      }
      return accum;
    }, {});
  }
  setClientId(clientId) {
    this._clientId = clientId;
  }
  getClientId() {
    return this._clientId;
  }
  /**
   * @private
   * Please open or upvote an issue at github.com/stripe/stripe-node
   * if you use this, detailing your use-case.
   *
   * It may be deprecated and removed in the future.
   */
  getConstant(c) {
    switch (c) {
      case "DEFAULT_HOST":
        return DEFAULT_HOST;
      case "DEFAULT_PORT":
        return DEFAULT_PORT;
      case "DEFAULT_BASE_PATH":
        return DEFAULT_BASE_PATH;
      case "DEFAULT_API_VERSION":
        return DEFAULT_API_VERSION;
      case "DEFAULT_TIMEOUT":
        return DEFAULT_TIMEOUT;
      case "MAX_NETWORK_RETRY_DELAY_SEC":
        return MAX_NETWORK_RETRY_DELAY_SEC;
      case "INITIAL_NETWORK_RETRY_DELAY_SEC":
        return INITIAL_NETWORK_RETRY_DELAY_SEC;
    }
    return _Stripe[c];
  }
  resolveBaseAddress(apiBase) {
    const instanceHost = this.getApiField("host");
    if (instanceHost !== DEFAULT_HOST) {
      return instanceHost;
    }
    return DEFAULT_BASE_ADDRESSES[apiBase];
  }
  getMaxNetworkRetries() {
    return this.getApiField("maxNetworkRetries");
  }
  /**
   * @private
   * This may be removed in the future.
   */
  _setApiNumberField(prop, n, defaultVal) {
    const val = validateInteger(prop, n, defaultVal);
    this._setApiField(prop, val);
  }
  getMaxNetworkRetryDelay() {
    return MAX_NETWORK_RETRY_DELAY_SEC;
  }
  getInitialNetworkRetryDelay() {
    return INITIAL_NETWORK_RETRY_DELAY_SEC;
  }
  /**
   * @private
   * Please open or upvote an issue at github.com/stripe/stripe-node
   * if you use this, detailing your use-case.
   *
   * It may be deprecated and removed in the future.
   *
   * Gets a JSON version of a User-Agent and uses a cached version for a slight
   * speed advantage.
   */
  getClientUserAgent(cb) {
    return this.getClientUserAgentSeeded(_Stripe.USER_AGENT, cb);
  }
  /**
   * @private
   * Please open or upvote an issue at github.com/stripe/stripe-node
   * if you use this, detailing your use-case.
   *
   * It may be deprecated and removed in the future.
   *
   * Gets a JSON version of a User-Agent by encoding a seeded object and
   * fetching a uname from the system.
   */
  getClientUserAgentSeeded(seed, cb) {
    const userAgent = {};
    for (const field in seed) {
      if (!Object.prototype.hasOwnProperty.call(seed, field)) {
        continue;
      }
      userAgent[field] = encodeURIComponent(seed[field] ?? "null");
    }
    const platformInfo = this._platformFunctions.getPlatformInfo();
    if (platformInfo && this.getTelemetryEnabled()) {
      userAgent.platform = encodeURIComponent(platformInfo);
    } else {
      delete userAgent.platform;
    }
    const client = this.getApiField("httpClient");
    if (client) {
      userAgent.httplib = encodeURIComponent(client.getClientName());
    }
    if (this._appInfo) {
      userAgent.application = this._appInfo;
    }
    cb(JSON.stringify(userAgent));
  }
  /**
   * @private
   * Please open or upvote an issue at github.com/stripe/stripe-node
   * if you use this, detailing your use-case.
   *
   * It may be deprecated and removed in the future.
   */
  getAppInfoAsString() {
    if (!this._appInfo) {
      return "";
    }
    let formatted = this._appInfo.name;
    if (this._appInfo.version) {
      formatted += `/${this._appInfo.version}`;
    }
    if (this._appInfo.url) {
      formatted += ` (${this._appInfo.url})`;
    }
    return formatted;
  }
  getTelemetryEnabled() {
    return this._enableTelemetry;
  }
  getEmitEventBodiesEnabled() {
    return this._emitEventBodies;
  }
  /**
   * @private
   * This may be removed in the future.
   */
  _prepResources() {
    for (const name in resources_exports) {
      if (!Object.prototype.hasOwnProperty.call(resources_exports, name)) {
        continue;
      }
      this[pascalToCamelCase(name.replace("Resource", ""))] = new resources_exports[name](this);
    }
  }
  /**
   * @private
   * This may be removed in the future.
   */
  _getPropsFromConfig(config) {
    if (!config) {
      return {};
    }
    const isString = typeof config === "string";
    const isObject2 = config === Object(config) && !Array.isArray(config);
    if (!isObject2 && !isString) {
      throw new Error("Config must either be an object or a string");
    }
    if (isString) {
      return {
        apiVersion: config
      };
    }
    const values = Object.keys(config).filter((value) => !ALLOWED_CONFIG_PROPERTIES.includes(value));
    if (values.length > 0) {
      throw new Error(`Config object may only contain the following: ${ALLOWED_CONFIG_PROPERTIES.join(", ")}`);
    }
    return config;
  }
  /**
   * @private
   * This may be removed in the future.
   */
  _setApiField(key, value) {
    this._api[key] = value;
  }
  /**
   * @private
   * Please open or upvote an issue at github.com/stripe/stripe-node
   * if you use this, detailing your use-case.
   *
   * It may be deprecated and removed in the future.
   */
  getApiField(key) {
    return this._api[key];
  }
  parseEventNotification(payload, header, secret, tolerance, cryptoProvider, receivedAt) {
    if (!this.webhooks.signature) {
      throw new Error("ERR: missing signature helper, unable to verify");
    }
    this.webhooks.signature.verifyHeader(payload, header, secret, tolerance || this.webhooks.DEFAULT_TOLERANCE, cryptoProvider || this._platformFunctions.createDefaultCryptoProvider(), receivedAt);
    const eventNotification = payload instanceof Uint8Array ? JSON.parse(new TextDecoder("utf8").decode(payload)) : JSON.parse(payload);
    if (eventNotification && eventNotification.object === "event") {
      throw new Error("You passed a webhook payload to stripe.parseEventNotification, which expects an event notification. Use stripe.webhooks.constructEvent instead.");
    }
    if (eventNotification.context) {
      eventNotification.context = StripeContext.parse(eventNotification.context);
    }
    eventNotification.fetchEvent = () => {
      return this._requestSender._rawRequest("GET", `/v2/core/events/${eventNotification.id}`, void 0, {
        stripeContext: eventNotification.context,
        headers: {
          "Stripe-Request-Trigger": `event=${eventNotification.id}`
        }
      }, ["fetch_event"]);
    };
    eventNotification.fetchRelatedObject = () => {
      if (!eventNotification.related_object) {
        return Promise.resolve(null);
      }
      return this._requestSender._rawRequest("GET", eventNotification.related_object.url, void 0, {
        stripeContext: eventNotification.context,
        headers: {
          "Stripe-Request-Trigger": `event=${eventNotification.id}`
        }
      }, ["fetch_related_object"]);
    };
    return eventNotification;
  }
  async parseEventNotificationAsync(payload, header, secret, tolerance, cryptoProvider, receivedAt) {
    if (!this.webhooks.signature) {
      throw new Error("ERR: missing signature helper, unable to verify");
    }
    await this.webhooks.signature.verifyHeaderAsync(payload, header, secret, tolerance || this.webhooks.DEFAULT_TOLERANCE, cryptoProvider || this._platformFunctions.createDefaultCryptoProvider(), receivedAt);
    const eventNotification = payload instanceof Uint8Array ? JSON.parse(new TextDecoder("utf8").decode(payload)) : JSON.parse(payload);
    if (eventNotification && eventNotification.object === "event") {
      throw new Error("You passed a webhook payload to stripe.parseEventNotificationAsync, which expects an event notification. Use stripe.webhooks.constructEventAsync instead.");
    }
    if (eventNotification.context) {
      eventNotification.context = StripeContext.parse(eventNotification.context);
    }
    eventNotification.fetchEvent = () => {
      return this._requestSender._rawRequest("GET", `/v2/core/events/${eventNotification.id}`, void 0, {
        stripeContext: eventNotification.context,
        headers: {
          "Stripe-Request-Trigger": `event=${eventNotification.id}`
        }
      }, ["fetch_event"]);
    };
    eventNotification.fetchRelatedObject = () => {
      if (!eventNotification.related_object) {
        return Promise.resolve(null);
      }
      return this._requestSender._rawRequest("GET", eventNotification.related_object.url, void 0, {
        stripeContext: eventNotification.context,
        headers: {
          "Stripe-Request-Trigger": `event=${eventNotification.id}`
        }
      }, ["fetch_related_object"]);
    };
    return eventNotification;
  }
};
Stripe.PACKAGE_VERSION = "22.1.1";
Stripe.API_VERSION = ApiVersion;
Stripe.aiAgent = typeof process !== "undefined" && process.env ? detectAIAgent(process.env) : "";
Stripe.AI_AGENT = Stripe.aiAgent;
Stripe.USER_AGENT = {
  bindings_version: Stripe.PACKAGE_VERSION,
  lang: "node",
  typescript: false,
  ...determineProcessUserAgentProperties(),
  ...Stripe.aiAgent ? { ai_agent: Stripe.aiAgent } : {}
};
Stripe.StripeResource = StripeResource;
Stripe.resources = resources_exports;
Stripe.HttpClient = HttpClient;
Stripe.HttpClientResponse = HttpClientResponse;
Stripe.CryptoProvider = CryptoProvider;
Stripe.StripeContext = StripeContext;
Stripe.errors = Error_exports;
Stripe.Decimal = Decimal;
Stripe._requestSenderFactory = defaultRequestSenderFactory;

// ../node_modules/stripe/esm/stripe.esm.worker.js
Stripe.initialize(new WebPlatformFunctions());
var stripe_esm_worker_default = Stripe;

// src/d1.ts
var USER_COLUMNS = [
  "id",
  "email",
  "password_hash",
  "display_name",
  "avatar",
  "role",
  "plan_type",
  "status",
  "xp",
  "level",
  "last_active_at",
  "created_at",
  "updated_at",
  "public_id",
  "google_id",
  "facebook_id",
  "guest_device_id",
  "phone_number",
  "bio",
  "city",
  "region",
  "country",
  "target_exam",
  "target_exam_date",
  "theme_preference",
  "font_size_preference",
  "wallet_balance",
  "wallet_address",
  "premium_expiry",
  "premium_start_date",
  "streak_count",
  "last_claim_date",
  "rank_level",
  "settings_friends_online",
  "settings_streak_reminder",
  "settings_new_message",
  "notify_friend_request",
  "notify_study_group",
  "notify_news_update",
  "allow_friend_request",
  "is_public_stats",
  "is_online_visible",
  "admin_permissions",
  "business_name",
  "business_info",
  "ip_address",
  "mistake_history",
  "reset_password_token",
  "reset_password_expires",
  "last_announcement_at",
  "tax_id",
  "xp_points",
  "extra_json"
];
var NEWS_BASE_COLUMNS = [
  "id",
  "title",
  "content",
  "category",
  "agency",
  "author",
  "external_link",
  "status",
  "application_start",
  "application_end",
  "metadata",
  "created_at",
  "updated_at"
];
var USER_UPDATE_COLUMNS = USER_COLUMNS.filter((col) => col !== "id");
var NEWS_UPDATE_COLUMNS = NEWS_BASE_COLUMNS.filter((col) => col !== "id" && col !== "created_at");
var nowIso = /* @__PURE__ */ __name(() => (/* @__PURE__ */ new Date()).toISOString(), "nowIso");
var generateTextId = /* @__PURE__ */ __name(() => crypto.randomUUID().replace(/-/g, ""), "generateTextId");
var safeJsonParse = /* @__PURE__ */ __name((value, fallback) => {
  if (typeof value !== "string" || !value.trim()) return fallback;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}, "safeJsonParse");
var pickExisting = /* @__PURE__ */ __name((source, keys) => {
  const picked = {};
  for (const key of keys) {
    if (source[key] !== void 0) picked[key] = source[key];
  }
  return picked;
}, "pickExisting");
var parseNewsRow = /* @__PURE__ */ __name((row) => {
  if (!row) return null;
  const metadata = safeJsonParse(row.metadata, {});
  return {
    ...row,
    metadata,
    summary: metadata.summary ?? null,
    is_featured: Boolean(metadata.is_featured),
    published_date: metadata.published_date ?? null,
    recruitment_type: metadata.recruitment_type ?? null,
    views: metadata.views ?? 0
  };
}, "parseNewsRow");
var parseUserRow = /* @__PURE__ */ __name((row) => {
  if (!row) return null;
  const xp = Number(row.xp ?? row.xp_points ?? 0) || 0;
  return {
    ...row,
    xp,
    xp_points: Number(row.xp_points ?? xp) || 0,
    level: Number(row.level ?? 1) || 1,
    wallet_balance: Number(row.wallet_balance ?? 0) || 0,
    streak_count: Number(row.streak_count ?? 0) || 0,
    settings_friends_online: row.settings_friends_online === null || row.settings_friends_online === void 0 ? null : Boolean(Number(row.settings_friends_online)),
    settings_streak_reminder: row.settings_streak_reminder === null || row.settings_streak_reminder === void 0 ? null : Boolean(Number(row.settings_streak_reminder)),
    settings_new_message: row.settings_new_message === null || row.settings_new_message === void 0 ? null : Boolean(Number(row.settings_new_message)),
    notify_friend_request: row.notify_friend_request === null || row.notify_friend_request === void 0 ? null : Boolean(Number(row.notify_friend_request)),
    notify_study_group: row.notify_study_group === null || row.notify_study_group === void 0 ? null : Boolean(Number(row.notify_study_group)),
    notify_news_update: row.notify_news_update === null || row.notify_news_update === void 0 ? null : Boolean(Number(row.notify_news_update)),
    allow_friend_request: row.allow_friend_request === null || row.allow_friend_request === void 0 ? null : Boolean(Number(row.allow_friend_request)),
    is_public_stats: row.is_public_stats === null || row.is_public_stats === void 0 ? null : Boolean(Number(row.is_public_stats)),
    is_online_visible: row.is_online_visible === null || row.is_online_visible === void 0 ? null : Boolean(Number(row.is_online_visible)),
    admin_permissions: parseStructuredValue(row.admin_permissions, []),
    business_info: parseStructuredValue(row.business_info, null),
    mistake_history: parseStructuredValue(row.mistake_history, null),
    extra_json: parseStructuredValue(row.extra_json, null)
  };
}, "parseUserRow");
var mergeNewsMetadata = /* @__PURE__ */ __name((body, existingMetadata = {}) => {
  const metadata = {
    ...existingMetadata,
    ...body.metadata && typeof body.metadata === "object" && !Array.isArray(body.metadata) ? body.metadata : {}
  };
  for (const [key, value] of Object.entries(body)) {
    if (NEWS_BASE_COLUMNS.includes(key) || key === "metadata" || key === "created_at" || key === "updated_at") {
      continue;
    }
    metadata[key] = value;
  }
  for (const [key, value] of Object.entries(metadata)) {
    if (value === void 0) delete metadata[key];
  }
  return metadata;
}, "mergeNewsMetadata");
async function getUserById(db, id) {
  return parseUserRow(await db.prepare("SELECT * FROM users WHERE id = ? LIMIT 1").bind(String(id)).first());
}
__name(getUserById, "getUserById");
async function getUserByEmail(db, email) {
  return parseUserRow(await db.prepare("SELECT * FROM users WHERE lower(email) = lower(?) LIMIT 1").bind(String(email)).first());
}
__name(getUserByEmail, "getUserByEmail");
async function listUsers(db, limit = 100) {
  const { results } = await db.prepare("SELECT * FROM users ORDER BY datetime(created_at) DESC LIMIT ?").bind(limit).all();
  return (results || []).map(parseUserRow);
}
__name(listUsers, "listUsers");
async function createUser(db, data) {
  const timestamp = data.created_at || nowIso();
  const row = {
    id: data.id || generateTextId(),
    email: data.email ? String(data.email).trim().toLowerCase() : null,
    password_hash: data.password_hash ?? null,
    display_name: data.display_name ?? null,
    avatar: data.avatar ?? null,
    role: data.role ?? "user",
    plan_type: data.plan_type ?? "free",
    status: data.status ?? "active",
    xp: Number.isFinite(Number(data.xp)) ? Number(data.xp) : 0,
    level: Number.isFinite(Number(data.level)) ? Number(data.level) : 1,
    last_active_at: data.last_active_at ?? null,
    created_at: timestamp,
    updated_at: data.updated_at ?? timestamp,
    public_id: data.public_id ?? null,
    google_id: data.google_id ?? null,
    facebook_id: data.facebook_id ?? null,
    guest_device_id: data.guest_device_id ?? null,
    phone_number: data.phone_number ?? null,
    bio: data.bio ?? null,
    city: data.city ?? null,
    region: data.region ?? null,
    country: data.country ?? null,
    target_exam: data.target_exam ?? null,
    target_exam_date: data.target_exam_date ?? null,
    theme_preference: data.theme_preference ?? "system",
    font_size_preference: data.font_size_preference ?? "medium",
    wallet_balance: Number.isFinite(Number(data.wallet_balance)) ? Number(data.wallet_balance) : 0,
    wallet_address: data.wallet_address ?? null,
    premium_expiry: data.premium_expiry ?? null,
    premium_start_date: data.premium_start_date ?? null,
    streak_count: Number.isFinite(Number(data.streak_count)) ? Number(data.streak_count) : 0,
    last_claim_date: data.last_claim_date ?? null,
    rank_level: data.rank_level ?? "Newbie",
    settings_friends_online: data.settings_friends_online === void 0 ? null : Number(Boolean(data.settings_friends_online)),
    settings_streak_reminder: data.settings_streak_reminder === void 0 ? null : Number(Boolean(data.settings_streak_reminder)),
    settings_new_message: data.settings_new_message === void 0 ? null : Number(Boolean(data.settings_new_message)),
    notify_friend_request: data.notify_friend_request === void 0 ? 1 : Number(Boolean(data.notify_friend_request)),
    notify_study_group: data.notify_study_group === void 0 ? 1 : Number(Boolean(data.notify_study_group)),
    notify_news_update: data.notify_news_update === void 0 ? 1 : Number(Boolean(data.notify_news_update)),
    allow_friend_request: data.allow_friend_request === void 0 ? 1 : Number(Boolean(data.allow_friend_request)),
    is_public_stats: data.is_public_stats === void 0 ? 1 : Number(Boolean(data.is_public_stats)),
    is_online_visible: data.is_online_visible === void 0 ? 1 : Number(Boolean(data.is_online_visible)),
    admin_permissions: maybeJsonStringify(data.admin_permissions ?? []),
    business_name: data.business_name ?? null,
    business_info: maybeJsonStringify(data.business_info),
    ip_address: data.ip_address ?? null,
    mistake_history: maybeJsonStringify(data.mistake_history),
    reset_password_token: data.reset_password_token ?? null,
    reset_password_expires: data.reset_password_expires ?? null,
    last_announcement_at: data.last_announcement_at ?? null,
    tax_id: data.tax_id ?? null,
    xp_points: Number.isFinite(Number(data.xp_points)) ? Number(data.xp_points) : Number.isFinite(Number(data.xp)) ? Number(data.xp) : 0,
    extra_json: maybeJsonStringify(data.extra_json)
  };
  await db.prepare(
    `INSERT INTO users (${USER_COLUMNS.join(", ")}) VALUES (${USER_COLUMNS.map(() => "?").join(", ")})`
  ).bind(...USER_COLUMNS.map((column) => row[column])).run();
  return getUserById(db, row.id);
}
__name(createUser, "createUser");
async function updateUser(db, id, updates) {
  const normalized = {
    ...updates,
    updated_at: updates.updated_at ?? nowIso(),
    admin_permissions: updates.admin_permissions !== void 0 ? maybeJsonStringify(updates.admin_permissions) : void 0,
    business_info: updates.business_info !== void 0 ? maybeJsonStringify(updates.business_info) : void 0,
    mistake_history: updates.mistake_history !== void 0 ? maybeJsonStringify(updates.mistake_history) : void 0,
    extra_json: updates.extra_json !== void 0 ? maybeJsonStringify(updates.extra_json) : void 0,
    settings_friends_online: updates.settings_friends_online !== void 0 ? Number(Boolean(updates.settings_friends_online)) : void 0,
    settings_streak_reminder: updates.settings_streak_reminder !== void 0 ? Number(Boolean(updates.settings_streak_reminder)) : void 0,
    settings_new_message: updates.settings_new_message !== void 0 ? Number(Boolean(updates.settings_new_message)) : void 0,
    notify_friend_request: updates.notify_friend_request !== void 0 ? Number(Boolean(updates.notify_friend_request)) : void 0,
    notify_study_group: updates.notify_study_group !== void 0 ? Number(Boolean(updates.notify_study_group)) : void 0,
    notify_news_update: updates.notify_news_update !== void 0 ? Number(Boolean(updates.notify_news_update)) : void 0,
    allow_friend_request: updates.allow_friend_request !== void 0 ? Number(Boolean(updates.allow_friend_request)) : void 0,
    is_public_stats: updates.is_public_stats !== void 0 ? Number(Boolean(updates.is_public_stats)) : void 0,
    is_online_visible: updates.is_online_visible !== void 0 ? Number(Boolean(updates.is_online_visible)) : void 0
  };
  const data = pickExisting(normalized, USER_UPDATE_COLUMNS);
  const entries = Object.entries(data);
  if (entries.length === 0) return getUserById(db, id);
  const sql = `UPDATE users SET ${entries.map(([key]) => `${key} = ?`).join(", ")} WHERE id = ?`;
  await db.prepare(sql).bind(...entries.map(([, value]) => value), String(id)).run();
  return getUserById(db, id);
}
__name(updateUser, "updateUser");
async function deleteUser(db, id) {
  await db.prepare("DELETE FROM users WHERE id = ?").bind(String(id)).run();
}
__name(deleteUser, "deleteUser");
async function touchUserLastActive(db, id, at = nowIso()) {
  await db.prepare("UPDATE users SET last_active_at = ?, updated_at = ? WHERE id = ?").bind(at, at, String(id)).run();
}
__name(touchUserLastActive, "touchUserLastActive");
async function createSystemLog(db, payload) {
  const id = generateTextId();
  const createdAt = payload.created_at || nowIso();
  const details = payload.details === void 0 ? null : typeof payload.details === "string" ? payload.details : JSON.stringify(payload.details);
  await db.prepare("INSERT INTO system_logs (id, action, user_id, details, created_at) VALUES (?, ?, ?, ?, ?)").bind(id, payload.action, payload.user_id ?? null, details, createdAt).run();
  return { id, action: payload.action, user_id: payload.user_id ?? null, details, created_at: createdAt };
}
__name(createSystemLog, "createSystemLog");
async function getNewsById(db, id) {
  const row = await db.prepare("SELECT * FROM news WHERE id = ? LIMIT 1").bind(String(id)).first();
  return parseNewsRow(row);
}
__name(getNewsById, "getNewsById");
async function createNews(db, body) {
  const createdAt = body.created_at || nowIso();
  const updatedAt = body.updated_at || createdAt;
  const metadata = mergeNewsMetadata(body);
  const row = {
    id: body.id || generateTextId(),
    title: body.title || "",
    content: body.content || "",
    category: body.category || "",
    agency: body.agency || "",
    author: body.author || "",
    external_link: body.external_link || "",
    status: body.status || "active",
    application_start: body.application_start || "",
    application_end: body.application_end || "",
    metadata: Object.keys(metadata).length > 0 ? JSON.stringify(metadata) : null,
    created_at: createdAt,
    updated_at: updatedAt
  };
  await db.prepare(
    `INSERT INTO news (${NEWS_BASE_COLUMNS.join(", ")}) VALUES (${NEWS_BASE_COLUMNS.map(() => "?").join(", ")})`
  ).bind(...NEWS_BASE_COLUMNS.map((column) => row[column])).run();
  return getNewsById(db, row.id);
}
__name(createNews, "createNews");
async function updateNews(db, id, body) {
  const existing = await getNewsById(db, id);
  if (!existing) return null;
  const metadata = mergeNewsMetadata(body, existing.metadata || {});
  const data = pickExisting(
    {
      ...body,
      metadata: Object.keys(metadata).length > 0 ? JSON.stringify(metadata) : null,
      updated_at: body.updated_at || nowIso()
    },
    NEWS_UPDATE_COLUMNS
  );
  const entries = Object.entries(data);
  if (entries.length === 0) return existing;
  const sql = `UPDATE news SET ${entries.map(([key]) => `${key} = ?`).join(", ")} WHERE id = ?`;
  await db.prepare(sql).bind(...entries.map(([, value]) => value), String(id)).run();
  return getNewsById(db, id);
}
__name(updateNews, "updateNews");
async function deleteNews(db, id) {
  await db.prepare("DELETE FROM news WHERE id = ?").bind(String(id)).run();
}
__name(deleteNews, "deleteNews");
async function toggleNewsFeatured(db, id) {
  const existing = await getNewsById(db, id);
  if (!existing) return null;
  const metadata = {
    ...existing.metadata || {},
    is_featured: !Boolean(existing.metadata?.is_featured)
  };
  await db.prepare("UPDATE news SET metadata = ?, updated_at = ? WHERE id = ?").bind(JSON.stringify(metadata), nowIso(), String(id)).run();
  return getNewsById(db, id);
}
__name(toggleNewsFeatured, "toggleNewsFeatured");
var EXAM_ROOM_COLUMNS = [
  "id",
  "title",
  "host_id",
  "type",
  "config",
  "status",
  "season_id",
  "is_private",
  "password",
  "created_at",
  "updated_at",
  "code",
  "name",
  "mode",
  "tutor_submode",
  "host_user_id",
  "subject",
  "category",
  "max_participants",
  "question_count",
  "settings",
  "question_ids",
  "custom_questions",
  "theme",
  "theme_color",
  "background_url"
];
var EXAM_ROOM_PARTICIPANT_COLUMNS = [
  "id",
  "room_id",
  "user_id",
  "score",
  "time_taken",
  "joined_at",
  "completed_at",
  "status",
  "current_question_index",
  "nickname",
  "answers",
  "updated_at"
];
var EXAM_RESULT_COLUMNS = [
  "id",
  "user_id",
  "classroom_id",
  "score",
  "total_score",
  "mode",
  "subject_scores",
  "skill_scores",
  "questions",
  "time_taken",
  "taken_at",
  "rating",
  "feedback_comment",
  "created_at",
  "updated_at"
];
var EXAM_ROOM_UPDATE_COLUMNS = EXAM_ROOM_COLUMNS.filter((col) => col !== "id");
var EXAM_ROOM_PARTICIPANT_UPDATE_COLUMNS = EXAM_ROOM_PARTICIPANT_COLUMNS.filter((col) => col !== "id");
var EXAM_RESULT_UPDATE_COLUMNS = EXAM_RESULT_COLUMNS.filter((col) => col !== "id");
var parseStructuredValue = /* @__PURE__ */ __name((value, fallback) => {
  if (value === null || value === void 0) return fallback;
  if (typeof value === "string") return safeJsonParse(value, fallback);
  if (typeof value === "object") return value;
  return fallback;
}, "parseStructuredValue");
var maybeJsonStringify = /* @__PURE__ */ __name((value) => {
  if (value === void 0 || value === null) return null;
  if (typeof value === "string") return value;
  return JSON.stringify(value);
}, "maybeJsonStringify");
var parseQuestionRow = /* @__PURE__ */ __name((row) => {
  if (!row) return null;
  const choices = parseStructuredValue(row.choices, { A: "", B: "", C: "", D: "" });
  return {
    ...row,
    choices,
    choice_a: row.choice_a ?? choices.A ?? "",
    choice_b: row.choice_b ?? choices.B ?? "",
    choice_c: row.choice_c ?? choices.C ?? "",
    choice_d: row.choice_d ?? choices.D ?? ""
  };
}, "parseQuestionRow");
var parseExamRoomRow = /* @__PURE__ */ __name((row) => {
  if (!row) return null;
  const config = parseStructuredValue(row.config, {});
  const settings = parseStructuredValue(row.settings ?? config.settings, {});
  const questionIds = parseStructuredValue(row.question_ids ?? config.question_ids, []);
  const customQuestions = parseStructuredValue(row.custom_questions ?? config.custom_questions, null);
  const theme = parseStructuredValue(row.theme ?? config.theme, null);
  return {
    ...config,
    ...row,
    id: String(row.id),
    code: row.code ?? config.code ?? null,
    name: row.name ?? row.title ?? config.name ?? null,
    mode: row.mode ?? row.type ?? config.mode ?? null,
    tutor_submode: row.tutor_submode ?? config.tutor_submode ?? "step",
    host_user_id: String(row.host_user_id ?? row.host_id ?? config.host_user_id ?? ""),
    subject: row.subject ?? config.subject ?? null,
    category: row.category ?? config.category ?? null,
    max_participants: Number(row.max_participants ?? config.max_participants ?? 20),
    question_count: Number(row.question_count ?? config.question_count ?? 0),
    settings,
    question_ids: questionIds,
    custom_questions: customQuestions,
    theme,
    status: row.status ?? config.status ?? "waiting",
    password: row.password ?? config.password ?? null,
    created_at: row.created_at ?? config.created_at ?? null,
    updated_at: row.updated_at ?? config.updated_at ?? null,
    title: row.title ?? config.title ?? row.name ?? config.name ?? null,
    host_id: row.host_id ?? config.host_id ?? row.host_user_id ?? config.host_user_id ?? null,
    type: row.type ?? config.type ?? row.mode ?? config.mode ?? null,
    config
  };
}, "parseExamRoomRow");
var buildExamRoomRow = /* @__PURE__ */ __name((data) => {
  const timestamp = data.created_at || nowIso();
  const config = {
    code: data.code ?? null,
    name: data.name ?? data.title ?? null,
    mode: data.mode ?? data.type ?? null,
    tutor_submode: data.tutor_submode ?? "step",
    host_user_id: data.host_user_id ?? data.host_id ?? null,
    subject: data.subject ?? null,
    category: data.category ?? null,
    attachment_url: data.attachment_url ?? null,
    max_participants: Number(data.max_participants ?? 20),
    question_count: Number(data.question_count ?? 0),
    settings: parseStructuredValue(data.settings, {}),
    question_ids: parseStructuredValue(data.question_ids, []),
    custom_questions: parseStructuredValue(data.custom_questions, null),
    theme: parseStructuredValue(data.theme, null),
    theme_color: data.theme_color ?? null,
    background_url: data.background_url ?? null
  };
  return {
    id: String(data.id || generateTextId()),
    title: data.title ?? config.name ?? "",
    host_id: String(data.host_id ?? config.host_user_id ?? ""),
    type: data.type ?? config.mode ?? "",
    config: JSON.stringify(config),
    status: data.status ?? "waiting",
    season_id: data.season_id ?? null,
    is_private: data.is_private ?? (data.password ? 1 : 0),
    password: data.password ?? null,
    created_at: timestamp,
    updated_at: data.updated_at ?? timestamp,
    code: config.code,
    name: config.name,
    mode: config.mode,
    tutor_submode: config.tutor_submode,
    host_user_id: config.host_user_id ? String(config.host_user_id) : null,
    subject: config.subject,
    category: config.category,
    max_participants: config.max_participants,
    question_count: config.question_count,
    settings: maybeJsonStringify(config.settings),
    question_ids: maybeJsonStringify(config.question_ids),
    custom_questions: maybeJsonStringify(config.custom_questions),
    theme: maybeJsonStringify(config.theme),
    theme_color: config.theme_color,
    background_url: config.background_url
  };
}, "buildExamRoomRow");
var parseExamRoomParticipantRow = /* @__PURE__ */ __name((row) => {
  if (!row) return null;
  return {
    ...row,
    id: String(row.id),
    room_id: String(row.room_id),
    user_id: String(row.user_id),
    score: Number(row.score ?? 0),
    time_taken: Number(row.time_taken ?? 0),
    status: row.status ?? "joined",
    current_question_index: Number(row.current_question_index ?? 0),
    answers: parseStructuredValue(row.answers, row.answers ?? null),
    nickname: row.nickname ?? null,
    joined_at: row.joined_at ?? null,
    completed_at: row.completed_at ?? null,
    updated_at: row.updated_at ?? null
  };
}, "parseExamRoomParticipantRow");
var buildExamRoomParticipantRow = /* @__PURE__ */ __name((roomId, userId, data, existingId) => {
  const timestamp = data.updated_at || nowIso();
  return {
    id: String(existingId || data.id || `${roomId}:${userId}`),
    room_id: String(roomId),
    user_id: String(userId),
    score: Number(data.score ?? 0),
    time_taken: Number(data.time_taken ?? 0),
    joined_at: data.joined_at ?? data.created_at ?? timestamp,
    completed_at: data.completed_at ?? null,
    status: data.status ?? "joined",
    current_question_index: Number(data.current_question_index ?? 0),
    nickname: data.nickname ?? null,
    answers: maybeJsonStringify(data.answers),
    updated_at: timestamp
  };
}, "buildExamRoomParticipantRow");
var parseExamResultRow = /* @__PURE__ */ __name((row) => {
  if (!row) return null;
  return {
    ...row,
    id: String(row.id),
    user_id: row.user_id !== null && row.user_id !== void 0 ? String(row.user_id) : null,
    classroom_id: row.classroom_id !== null && row.classroom_id !== void 0 ? String(row.classroom_id) : null,
    score: Number(row.score ?? 0),
    total_score: Number(row.total_score ?? 0),
    time_taken: Number(row.time_taken ?? 0),
    subject_scores: parseStructuredValue(row.subject_scores, null),
    skill_scores: parseStructuredValue(row.skill_scores, null),
    questions: parseStructuredValue(row.questions, null)
  };
}, "parseExamResultRow");
var buildExamResultRow = /* @__PURE__ */ __name((data) => {
  const timestamp = data.created_at || data.taken_at || nowIso();
  return {
    id: String(data.id || generateTextId()),
    user_id: data.user_id !== void 0 && data.user_id !== null ? String(data.user_id) : null,
    classroom_id: data.classroom_id !== void 0 && data.classroom_id !== null ? String(data.classroom_id) : null,
    score: Number(data.score ?? 0),
    total_score: Number(data.total_score ?? 0),
    mode: data.mode ?? "practice",
    subject_scores: maybeJsonStringify(data.subject_scores),
    skill_scores: maybeJsonStringify(data.skill_scores),
    questions: maybeJsonStringify(data.questions),
    time_taken: Number(data.time_taken ?? 0),
    taken_at: data.taken_at ?? timestamp,
    rating: data.rating ?? null,
    feedback_comment: data.feedback_comment ?? null,
    created_at: timestamp,
    updated_at: data.updated_at ?? timestamp
  };
}, "buildExamResultRow");
async function getQuestionsByIds(db, ids) {
  if (!ids.length) return [];
  const normalizedIds = Array.from(new Set(ids.map((id) => String(id))));
  const officialIds = normalizedIds.filter((id) => !id.startsWith("uq_"));
  const userIds = normalizedIds.filter((id) => id.startsWith("uq_"));
  const allResults = [];
  if (officialIds.length > 0) {
    const placeholders = officialIds.map(() => "?").join(", ");
    const { results } = await db.prepare(`SELECT * FROM questions WHERE id IN (${placeholders})`).bind(...officialIds).all();
    allResults.push(...(results || []).map(parseQuestionRow));
  }
  if (userIds.length > 0) {
    const placeholders = userIds.map(() => "?").join(", ");
    const { results } = await db.prepare(`SELECT * FROM user_questions WHERE id IN (${placeholders})`).bind(...userIds).all();
    allResults.push(...(results || []).map(parseQuestionRow));
  }
  return allResults;
}
__name(getQuestionsByIds, "getQuestionsByIds");
async function getExamRoomById(db, id) {
  const row = await db.prepare("SELECT * FROM exam_rooms WHERE id = ? LIMIT 1").bind(String(id)).first();
  return parseExamRoomRow(row);
}
__name(getExamRoomById, "getExamRoomById");
async function findExamRoomByCode(db, code) {
  const row = await db.prepare("SELECT * FROM exam_rooms WHERE code = ? LIMIT 1").bind(String(code)).first();
  return parseExamRoomRow(row);
}
__name(findExamRoomByCode, "findExamRoomByCode");
async function listExamRooms(db, limit = 100) {
  const { results } = await db.prepare("SELECT * FROM exam_rooms ORDER BY datetime(created_at) DESC LIMIT ?").bind(limit).all();
  return (results || []).map(parseExamRoomRow);
}
__name(listExamRooms, "listExamRooms");
async function createExamRoom(db, data) {
  const row = buildExamRoomRow(data);
  await db.prepare(`INSERT INTO exam_rooms (${EXAM_ROOM_COLUMNS.join(", ")}) VALUES (${EXAM_ROOM_COLUMNS.map(() => "?").join(", ")})`).bind(...EXAM_ROOM_COLUMNS.map((column) => row[column])).run();
  return getExamRoomById(db, row.id);
}
__name(createExamRoom, "createExamRoom");
async function updateExamRoom(db, id, updates) {
  const existing = await getExamRoomById(db, id);
  if (!existing) return null;
  const merged = buildExamRoomRow({ ...existing, ...updates, id: String(id), created_at: existing.created_at });
  const data = pickExisting(merged, EXAM_ROOM_UPDATE_COLUMNS);
  const entries = Object.entries(data);
  if (entries.length === 0) return existing;
  const sql = `UPDATE exam_rooms SET ${entries.map(([key]) => `${key} = ?`).join(", ")} WHERE id = ?`;
  await db.prepare(sql).bind(...entries.map(([, value]) => value), String(id)).run();
  return getExamRoomById(db, id);
}
__name(updateExamRoom, "updateExamRoom");
async function deleteExamRoom(db, id) {
  await db.prepare("DELETE FROM exam_room_participants WHERE room_id = ?").bind(String(id)).run();
  await db.prepare("DELETE FROM exam_rooms WHERE id = ?").bind(String(id)).run();
}
__name(deleteExamRoom, "deleteExamRoom");
async function listExamRoomParticipants(db, roomId) {
  const { results } = await db.prepare("SELECT * FROM exam_room_participants WHERE room_id = ? ORDER BY datetime(joined_at) ASC").bind(String(roomId)).all();
  return (results || []).map(parseExamRoomParticipantRow);
}
__name(listExamRoomParticipants, "listExamRoomParticipants");
async function getExamRoomParticipant(db, roomId, userId) {
  const row = await db.prepare("SELECT * FROM exam_room_participants WHERE room_id = ? AND user_id = ? LIMIT 1").bind(String(roomId), String(userId)).first();
  return parseExamRoomParticipantRow(row);
}
__name(getExamRoomParticipant, "getExamRoomParticipant");
async function upsertExamRoomParticipant(db, roomId, userId, updates) {
  const existing = await getExamRoomParticipant(db, roomId, userId);
  const row = buildExamRoomParticipantRow(roomId, userId, { ...existing, ...updates }, existing?.id);
  if (existing) {
    const data = pickExisting(row, EXAM_ROOM_PARTICIPANT_UPDATE_COLUMNS);
    const entries = Object.entries(data);
    const sql = `UPDATE exam_room_participants SET ${entries.map(([key]) => `${key} = ?`).join(", ")} WHERE id = ?`;
    await db.prepare(sql).bind(...entries.map(([, value]) => value), existing.id).run();
  } else {
    await db.prepare(
      `INSERT INTO exam_room_participants (${EXAM_ROOM_PARTICIPANT_COLUMNS.join(", ")}) VALUES (${EXAM_ROOM_PARTICIPANT_COLUMNS.map(() => "?").join(", ")})`
    ).bind(...EXAM_ROOM_PARTICIPANT_COLUMNS.map((column) => row[column])).run();
  }
  return getExamRoomParticipant(db, roomId, userId);
}
__name(upsertExamRoomParticipant, "upsertExamRoomParticipant");
async function resetExamRoomParticipants(db, roomId) {
  const timestamp = nowIso();
  await db.prepare(
    "UPDATE exam_room_participants SET score = 0, time_taken = 0, status = 'joined', current_question_index = 0, answers = NULL, completed_at = NULL, updated_at = ? WHERE room_id = ?"
  ).bind(timestamp, String(roomId)).run();
}
__name(resetExamRoomParticipants, "resetExamRoomParticipants");
async function createExamResult(db, data) {
  const row = buildExamResultRow(data);
  await db.prepare(
    `INSERT INTO exam_results (${EXAM_RESULT_COLUMNS.join(", ")}) VALUES (${EXAM_RESULT_COLUMNS.map(() => "?").join(", ")})`
  ).bind(...EXAM_RESULT_COLUMNS.map((column) => row[column])).run();
  return getExamResultById(db, row.id);
}
__name(createExamResult, "createExamResult");
async function getExamResultById(db, id) {
  const row = await db.prepare("SELECT * FROM exam_results WHERE id = ? LIMIT 1").bind(String(id)).first();
  return parseExamResultRow(row);
}
__name(getExamResultById, "getExamResultById");
async function listExamResultsByUser(db, userId, limit) {
  const sql = limit ? "SELECT * FROM exam_results WHERE user_id = ? ORDER BY datetime(taken_at) DESC LIMIT ?" : "SELECT * FROM exam_results WHERE user_id = ? ORDER BY datetime(taken_at) DESC";
  const stmt = db.prepare(sql);
  const result = limit ? await stmt.bind(String(userId), limit).all() : await stmt.bind(String(userId)).all();
  return (result.results || []).map(parseExamResultRow);
}
__name(listExamResultsByUser, "listExamResultsByUser");
async function listSeasons(db) {
  const { results } = await db.prepare("SELECT * FROM seasons ORDER BY datetime(start_date) DESC, datetime(created_at) DESC").all();
  return results || [];
}
__name(listSeasons, "listSeasons");
async function getSeasonById(db, id) {
  return await db.prepare("SELECT * FROM seasons WHERE id = ? LIMIT 1").bind(String(id)).first();
}
__name(getSeasonById, "getSeasonById");
async function getActiveSeason(db) {
  return await db.prepare("SELECT * FROM seasons WHERE status = 'active' ORDER BY datetime(start_date) DESC, datetime(created_at) DESC LIMIT 1").first();
}
__name(getActiveSeason, "getActiveSeason");
async function createSeason(db, data) {
  const now = nowIso();
  const row = {
    id: String(data.id || (/* @__PURE__ */ new Date()).getFullYear()),
    name: data.name || `Season ${data.id || (/* @__PURE__ */ new Date()).getFullYear()}`,
    start_date: data.start_date || now,
    end_date: data.end_date || null,
    status: data.status || "active",
    responsible_admin_id: data.responsible_admin_id || null,
    created_at: data.created_at || now,
    updated_at: data.updated_at || now
  };
  await db.prepare(
    "INSERT OR REPLACE INTO seasons (id, name, start_date, end_date, status, responsible_admin_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
  ).bind(
    row.id,
    row.name,
    row.start_date,
    row.end_date,
    row.status,
    row.responsible_admin_id,
    row.created_at,
    row.updated_at
  ).run();
  return getSeasonById(db, row.id);
}
__name(createSeason, "createSeason");
async function updateSeason(db, id, updates) {
  const existing = await getSeasonById(db, id);
  if (!existing) return null;
  const row = {
    ...existing,
    ...updates,
    id: String(id),
    updated_at: updates.updated_at || nowIso()
  };
  const allowed = ["name", "start_date", "end_date", "status", "responsible_admin_id", "updated_at"];
  const data = pickExisting(row, allowed);
  const entries = Object.entries(data);
  const sql = `UPDATE seasons SET ${entries.map(([key]) => `${key} = ?`).join(", ")} WHERE id = ?`;
  await db.prepare(sql).bind(...entries.map(([, value]) => value), String(id)).run();
  return getSeasonById(db, id);
}
__name(updateSeason, "updateSeason");
async function completeActiveSeasons(db, endedAt = nowIso()) {
  await db.prepare("UPDATE seasons SET status = 'completed', end_date = ?, updated_at = ? WHERE status = 'active'").bind(endedAt, endedAt).run();
}
__name(completeActiveSeasons, "completeActiveSeasons");
async function getRankingById(db, id) {
  return await db.prepare("SELECT * FROM rankings WHERE id = ? LIMIT 1").bind(String(id)).first();
}
__name(getRankingById, "getRankingById");
async function listRankingsBySeason(db, seasonId, limit = 50) {
  const { results } = await db.prepare("SELECT * FROM rankings WHERE season_id = ? ORDER BY total_score DESC, exams_taken DESC, datetime(updated_at) ASC LIMIT ?").bind(String(seasonId), limit).all();
  return results || [];
}
__name(listRankingsBySeason, "listRankingsBySeason");
async function upsertRankingScore(db, seasonId, userId, scoreToAdd) {
  const id = `${seasonId}_${userId}`;
  const existing = await getRankingById(db, id);
  const updatedAt = nowIso();
  if (existing) {
    const totalScore = (Number(existing.total_score) || 0) + Number(scoreToAdd || 0);
    const examsTaken = (Number(existing.exams_taken) || 0) + 1;
    await db.prepare("UPDATE rankings SET total_score = ?, exams_taken = ?, updated_at = ? WHERE id = ?").bind(totalScore, examsTaken, updatedAt, id).run();
  } else {
    await db.prepare("INSERT INTO rankings (id, season_id, user_id, total_score, exams_taken, updated_at) VALUES (?, ?, ?, ?, ?, ?)").bind(id, String(seasonId), String(userId), Number(scoreToAdd || 0), 1, updatedAt).run();
  }
  return getRankingById(db, id);
}
__name(upsertRankingScore, "upsertRankingScore");
var parseMaybeJson = /* @__PURE__ */ __name((value) => typeof value === "string" ? safeJsonParse(value, value) : value, "parseMaybeJson");
var parseQuestionFullRow = /* @__PURE__ */ __name((row) => {
  const q = parseQuestionRow(row);
  if (!q) return null;
  return {
    ...q,
    catalogs: parseStructuredValue(q.catalogs, []),
    exam_year: q.exam_year ?? null,
    exam_set: q.exam_set ?? null,
    skill: q.skill ?? null
  };
}, "parseQuestionFullRow");
async function listAllQuestions(db) {
  const { results } = await db.prepare("SELECT * FROM questions").all();
  return (results || []).map(parseQuestionFullRow);
}
__name(listAllQuestions, "listAllQuestions");
async function getQuestionById(db, id) {
  const row = await db.prepare("SELECT * FROM questions WHERE id = ? LIMIT 1").bind(String(id)).first();
  return parseQuestionFullRow(row);
}
__name(getQuestionById, "getQuestionById");
async function createQuestion(db, data) {
  const row = {
    id: String(data.id || generateTextId()),
    question_text: data.question_text ?? "",
    choices: maybeJsonStringify(data.choices ?? { A: "", B: "", C: "", D: "" }),
    correct_answer: data.correct_answer ?? "",
    explanation: data.explanation ?? "",
    category: data.category ?? "",
    subject: data.subject ?? "",
    difficulty: Number(data.difficulty ?? 0),
    is_custom: Number(Boolean(data.is_custom)),
    host_user_id: data.host_user_id ?? null,
    created_at: data.created_at ?? nowIso(),
    updated_at: data.updated_at ?? data.created_at ?? nowIso(),
    catalogs: maybeJsonStringify(data.catalogs ?? []),
    skill: data.skill ?? null,
    exam_year: data.exam_year ?? null,
    exam_set: data.exam_set ?? null
  };
  await db.prepare(
    "INSERT INTO questions (id, question_text, choices, correct_answer, explanation, category, subject, difficulty, is_custom, host_user_id, created_at, updated_at, catalogs, skill, exam_year, exam_set) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
  ).bind(
    row.id,
    row.question_text,
    row.choices,
    row.correct_answer,
    row.explanation,
    row.category,
    row.subject,
    row.difficulty,
    row.is_custom,
    row.host_user_id,
    row.created_at,
    row.updated_at,
    row.catalogs,
    row.skill,
    row.exam_year,
    row.exam_set
  ).run();
  return getQuestionById(db, row.id);
}
__name(createQuestion, "createQuestion");
async function updateQuestion(db, id, data) {
  const normalized = {
    ...data,
    choices: data.choices !== void 0 ? maybeJsonStringify(data.choices) : void 0,
    catalogs: data.catalogs !== void 0 ? maybeJsonStringify(data.catalogs) : void 0,
    updated_at: data.updated_at ?? nowIso()
  };
  const allowed = [
    "question_text",
    "choices",
    "correct_answer",
    "explanation",
    "category",
    "subject",
    "difficulty",
    "is_custom",
    "host_user_id",
    "updated_at",
    "catalogs",
    "skill",
    "exam_year",
    "exam_set"
  ];
  const entries = Object.entries(pickExisting(normalized, allowed));
  if (!entries.length) return getQuestionById(db, id);
  const sql = `UPDATE questions SET ${entries.map(([key]) => `${key} = ?`).join(", ")} WHERE id = ?`;
  await db.prepare(sql).bind(...entries.map(([, value]) => value), String(id)).run();
  return getQuestionById(db, id);
}
__name(updateQuestion, "updateQuestion");
async function deleteQuestion(db, id) {
  await db.prepare("DELETE FROM questions WHERE id = ?").bind(String(id)).run();
}
__name(deleteQuestion, "deleteQuestion");
async function listUserQuestions(db, userId) {
  const { results } = await db.prepare("SELECT * FROM user_questions WHERE user_id = ? ORDER BY datetime(created_at) DESC").bind(String(userId)).all();
  return (results || []).map(parseQuestionFullRow);
}
__name(listUserQuestions, "listUserQuestions");
async function getUserQuestionById(db, id, userId) {
  const row = await db.prepare("SELECT * FROM user_questions WHERE id = ? AND user_id = ? LIMIT 1").bind(String(id), String(userId)).first();
  return parseQuestionFullRow(row);
}
__name(getUserQuestionById, "getUserQuestionById");
async function createUserQuestion(db, data) {
  const row = {
    id: String(data.id || `uq_${generateTextId()}`),
    user_id: String(data.user_id),
    question_text: data.question_text ?? "",
    choices: maybeJsonStringify(data.choices ?? { A: "", B: "", C: "", D: "" }),
    correct_answer: data.correct_answer ?? "",
    explanation: data.explanation ?? "",
    category: data.category ?? "",
    subject: data.subject ?? "",
    difficulty: Number(data.difficulty ?? 0),
    created_at: data.created_at ?? nowIso(),
    updated_at: data.updated_at ?? data.created_at ?? nowIso(),
    catalogs: maybeJsonStringify(data.catalogs ?? []),
    skill: data.skill ?? null,
    exam_year: data.exam_year ?? null,
    exam_set: data.exam_set ?? null
  };
  await db.prepare(
    "INSERT INTO user_questions (id, user_id, question_text, choices, correct_answer, explanation, category, subject, difficulty, created_at, updated_at, catalogs, skill, exam_year, exam_set) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
  ).bind(
    row.id,
    row.user_id,
    row.question_text,
    row.choices,
    row.correct_answer,
    row.explanation,
    row.category,
    row.subject,
    row.difficulty,
    row.created_at,
    row.updated_at,
    row.catalogs,
    row.skill,
    row.exam_year,
    row.exam_set
  ).run();
  return getUserQuestionById(db, row.id, row.user_id);
}
__name(createUserQuestion, "createUserQuestion");
async function updateUserQuestion(db, id, userId, data) {
  const normalized = {
    ...data,
    choices: data.choices !== void 0 ? maybeJsonStringify(data.choices) : void 0,
    catalogs: data.catalogs !== void 0 ? maybeJsonStringify(data.catalogs) : void 0,
    updated_at: data.updated_at ?? nowIso()
  };
  const allowed = [
    "question_text",
    "choices",
    "correct_answer",
    "explanation",
    "category",
    "subject",
    "difficulty",
    "updated_at",
    "catalogs",
    "skill",
    "exam_year",
    "exam_set"
  ];
  const entries = Object.entries(pickExisting(normalized, allowed));
  if (!entries.length) return getUserQuestionById(db, id, userId);
  const sql = `UPDATE user_questions SET ${entries.map(([key]) => `${key} = ?`).join(", ")} WHERE id = ? AND user_id = ?`;
  await db.prepare(sql).bind(...entries.map(([, value]) => value), String(id), String(userId)).run();
  return getUserQuestionById(db, id, userId);
}
__name(updateUserQuestion, "updateUserQuestion");
async function deleteUserQuestion(db, id, userId) {
  await db.prepare("DELETE FROM user_questions WHERE id = ? AND user_id = ?").bind(String(id), String(userId)).run();
}
__name(deleteUserQuestion, "deleteUserQuestion");
async function adminListUserQuestions(db, limit = 500) {
  const sql = `
    SELECT uq.*, u.display_name as user_display_name, u.email as user_email
    FROM user_questions uq
    LEFT JOIN users u ON uq.user_id = u.id
    ORDER BY datetime(uq.created_at) DESC
    LIMIT ?
  `;
  const { results } = await db.prepare(sql).bind(limit).all();
  return (results || []).map((row) => {
    const q = parseQuestionFullRow(row);
    if (q) {
      q.user_display_name = row.user_display_name;
      q.user_email = row.user_email;
    }
    return q;
  });
}
__name(adminListUserQuestions, "adminListUserQuestions");
async function adminUpdateUserQuestion(db, id, data) {
  const normalized = {
    ...data,
    choices: data.choices !== void 0 ? maybeJsonStringify(data.choices) : void 0,
    catalogs: data.catalogs !== void 0 ? maybeJsonStringify(data.catalogs) : void 0,
    updated_at: data.updated_at ?? nowIso()
  };
  const allowed = [
    "question_text",
    "choices",
    "correct_answer",
    "explanation",
    "category",
    "subject",
    "difficulty",
    "updated_at",
    "catalogs",
    "skill",
    "exam_year",
    "exam_set"
  ];
  const entries = Object.entries(pickExisting(normalized, allowed));
  if (!entries.length) {
    const row2 = await db.prepare("SELECT * FROM user_questions WHERE id = ?").bind(String(id)).first();
    return parseQuestionFullRow(row2);
  }
  const sql = `UPDATE user_questions SET ${entries.map(([key]) => `${key} = ?`).join(", ")} WHERE id = ?`;
  await db.prepare(sql).bind(...entries.map(([, value]) => value), String(id)).run();
  const row = await db.prepare("SELECT * FROM user_questions WHERE id = ?").bind(String(id)).first();
  return parseQuestionFullRow(row);
}
__name(adminUpdateUserQuestion, "adminUpdateUserQuestion");
async function adminDeleteUserQuestion(db, id) {
  await db.prepare("DELETE FROM user_questions WHERE id = ?").bind(String(id)).run();
}
__name(adminDeleteUserQuestion, "adminDeleteUserQuestion");
async function listBookmarksByUser(db, userId) {
  const { results } = await db.prepare("SELECT * FROM bookmarks WHERE user_id = ? ORDER BY datetime(created_at) DESC").bind(String(userId)).all();
  return results || [];
}
__name(listBookmarksByUser, "listBookmarksByUser");
async function createBookmark(db, data) {
  const row = {
    id: String(data.id || generateTextId()),
    user_id: String(data.user_id),
    question_id: data.question_id ?? data.target_id ?? null,
    note: data.note ?? data.title ?? null,
    created_at: data.created_at ?? nowIso(),
    target_type: data.target_type ?? null,
    target_id: data.target_id ?? null,
    title: data.title ?? null
  };
  await db.prepare("INSERT INTO bookmarks (id, user_id, question_id, note, created_at, target_type, target_id, title) VALUES (?, ?, ?, ?, ?, ?, ?, ?)").bind(row.id, row.user_id, row.question_id, row.note, row.created_at, row.target_type, row.target_id, row.title).run();
  return row;
}
__name(createBookmark, "createBookmark");
async function getBookmarkById(db, id) {
  return await db.prepare("SELECT * FROM bookmarks WHERE id = ? LIMIT 1").bind(String(id)).first();
}
__name(getBookmarkById, "getBookmarkById");
async function deleteBookmark(db, id) {
  await db.prepare("DELETE FROM bookmarks WHERE id = ?").bind(String(id)).run();
}
__name(deleteBookmark, "deleteBookmark");
var parseMessageRow = /* @__PURE__ */ __name((row) => row ? { ...row, is_read: Boolean(Number(row.is_read ?? 0)) } : null, "parseMessageRow");
async function listDirectMessagesForUser(db, userId) {
  const { results } = await db.prepare("SELECT * FROM messages WHERE sender_id = ? OR receiver_id = ? ORDER BY datetime(created_at) ASC").bind(String(userId), String(userId)).all();
  return (results || []).map(parseMessageRow);
}
__name(listDirectMessagesForUser, "listDirectMessagesForUser");
async function listReceivedMessages(db, userId) {
  const { results } = await db.prepare("SELECT * FROM messages WHERE receiver_id = ? ORDER BY datetime(created_at) DESC").bind(String(userId)).all();
  return (results || []).map(parseMessageRow);
}
__name(listReceivedMessages, "listReceivedMessages");
async function createDirectMessage(db, data) {
  const row = {
    id: String(data.id || generateTextId()),
    room_id: data.room_id ?? null,
    sender_id: String(data.sender_id),
    text: data.text ?? data.content ?? null,
    created_at: data.created_at ?? nowIso(),
    receiver_id: String(data.receiver_id),
    content: data.content ?? data.text ?? "",
    is_read: Number(Boolean(data.is_read))
  };
  await db.prepare("INSERT INTO messages (id, room_id, sender_id, text, created_at, receiver_id, content, is_read) VALUES (?, ?, ?, ?, ?, ?, ?, ?)").bind(row.id, row.room_id, row.sender_id, row.text, row.created_at, row.receiver_id, row.content, row.is_read).run();
  return parseMessageRow(row);
}
__name(createDirectMessage, "createDirectMessage");
async function markMessagesRead(db, receiverId, senderId) {
  if (senderId) {
    await db.prepare("UPDATE messages SET is_read = 1 WHERE receiver_id = ? AND sender_id = ? AND COALESCE(is_read,0) = 0").bind(String(receiverId), String(senderId)).run();
  } else {
    await db.prepare("UPDATE messages SET is_read = 1 WHERE receiver_id = ?").bind(String(receiverId)).run();
  }
}
__name(markMessagesRead, "markMessagesRead");
async function listFriendsByUser(db, userId) {
  const { results } = await db.prepare("SELECT * FROM friends WHERE requester_id = ? OR target_id = ? OR user_id1 = ? OR user_id2 = ?").bind(String(userId), String(userId), String(userId), String(userId)).all();
  return results || [];
}
__name(listFriendsByUser, "listFriendsByUser");
async function createFriendRequest(db, requesterId, targetId) {
  const row = {
    id: generateTextId(),
    user_id1: requesterId,
    user_id2: targetId,
    status: "pending",
    created_at: nowIso(),
    updated_at: nowIso(),
    requester_id: requesterId,
    target_id: targetId
  };
  await db.prepare("INSERT INTO friends (id, user_id1, user_id2, status, created_at, updated_at, requester_id, target_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)").bind(row.id, row.user_id1, row.user_id2, row.status, row.created_at, row.updated_at, row.requester_id, row.target_id).run();
  return row;
}
__name(createFriendRequest, "createFriendRequest");
async function updateFriend(db, id, updates) {
  const normalized = { ...updates, updated_at: updates.updated_at ?? nowIso() };
  const allowed = ["status", "updated_at"];
  const entries = Object.entries(pickExisting(normalized, allowed));
  const sql = `UPDATE friends SET ${entries.map(([key]) => `${key} = ?`).join(", ")} WHERE id = ?`;
  await db.prepare(sql).bind(...entries.map(([, value]) => value), String(id)).run();
}
__name(updateFriend, "updateFriend");
async function deleteFriend(db, id) {
  await db.prepare("DELETE FROM friends WHERE id = ?").bind(String(id)).run();
}
__name(deleteFriend, "deleteFriend");
var parseNotificationRow = /* @__PURE__ */ __name((row) => row ? { ...row, is_read: Boolean(Number(row.is_read ?? 0)), data: parseMaybeJson(row.data) } : null, "parseNotificationRow");
async function listNotificationsByUser(db, userId, limit = 50) {
  const { results } = await db.prepare("SELECT * FROM notifications WHERE user_id = ? ORDER BY datetime(created_at) DESC LIMIT ?").bind(String(userId), limit).all();
  return (results || []).map(parseNotificationRow);
}
__name(listNotificationsByUser, "listNotificationsByUser");
async function markNotificationRead(db, id) {
  await db.prepare("UPDATE notifications SET is_read = 1 WHERE id = ?").bind(String(id)).run();
}
__name(markNotificationRead, "markNotificationRead");
async function markAllNotificationsRead(db, userId) {
  await db.prepare("UPDATE notifications SET is_read = 1 WHERE user_id = ?").bind(String(userId)).run();
}
__name(markAllNotificationsRead, "markAllNotificationsRead");
var parseThreadRow = /* @__PURE__ */ __name((row) => row ? {
  ...row,
  user_id: row.user_id ?? row.author_id,
  author_id: row.author_id ?? row.user_id,
  tags: parseStructuredValue(row.tags, []),
  stats: parseStructuredValue(row.stats, row.stats ?? null)
} : null, "parseThreadRow");
async function listThreads(db, limit = 100) {
  const { results } = await db.prepare("SELECT * FROM threads ORDER BY datetime(created_at) DESC LIMIT ?").bind(limit).all();
  return (results || []).map(parseThreadRow);
}
__name(listThreads, "listThreads");
async function listThreadsByUser(db, userId) {
  const { results } = await db.prepare("SELECT * FROM threads WHERE COALESCE(user_id, author_id) = ? ORDER BY datetime(created_at) DESC").bind(String(userId)).all();
  return (results || []).map(parseThreadRow);
}
__name(listThreadsByUser, "listThreadsByUser");
async function getThreadById(db, id) {
  const row = await db.prepare("SELECT * FROM threads WHERE id = ? LIMIT 1").bind(String(id)).first();
  return parseThreadRow(row);
}
__name(getThreadById, "getThreadById");
async function createThread(db, data) {
  const row = {
    id: String(data.id || generateTextId()),
    author_id: String(data.author_id ?? data.user_id),
    title: data.title ?? "",
    content: data.content ?? "",
    category: data.category ?? "",
    likes: Number(data.likes ?? 0),
    created_at: data.created_at ?? nowIso(),
    updated_at: data.updated_at ?? data.created_at ?? nowIso(),
    user_id: String(data.user_id ?? data.author_id),
    tags: maybeJsonStringify(data.tags ?? []),
    background_style: data.background_style ?? null,
    image_url: data.image_url ?? null,
    views: Number(data.views ?? 0),
    stats: maybeJsonStringify(data.stats ?? null),
    deleted_at: data.deleted_at ?? null
  };
  await db.prepare("INSERT INTO threads (id, author_id, title, content, category, likes, created_at, updated_at, user_id, tags, background_style, image_url, views, stats, deleted_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").bind(row.id, row.author_id, row.title, row.content, row.category, row.likes, row.created_at, row.updated_at, row.user_id, row.tags, row.background_style, row.image_url, row.views, row.stats, row.deleted_at).run();
  return getThreadById(db, row.id);
}
__name(createThread, "createThread");
async function deleteThread(db, id) {
  await db.prepare("DELETE FROM threads WHERE id = ?").bind(String(id)).run();
}
__name(deleteThread, "deleteThread");
var parseCommentRow = /* @__PURE__ */ __name((row) => row ? { ...row, user_id: row.user_id ?? row.author_id, author_id: row.author_id ?? row.user_id } : null, "parseCommentRow");
async function listCommentsByThread(db, threadId) {
  const { results } = await db.prepare("SELECT * FROM comments WHERE thread_id = ? ORDER BY datetime(created_at) ASC").bind(String(threadId)).all();
  return (results || []).map(parseCommentRow);
}
__name(listCommentsByThread, "listCommentsByThread");
async function createComment(db, data) {
  const row = {
    id: String(data.id || generateTextId()),
    thread_id: String(data.thread_id),
    author_id: String(data.author_id ?? data.user_id),
    content: data.content ?? "",
    likes: Number(data.likes ?? 0),
    created_at: data.created_at ?? nowIso(),
    updated_at: data.updated_at ?? data.created_at ?? nowIso(),
    user_id: String(data.user_id ?? data.author_id),
    parent_id: data.parent_id ?? null
  };
  await db.prepare("INSERT INTO comments (id, thread_id, author_id, content, likes, created_at, updated_at, user_id, parent_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)").bind(row.id, row.thread_id, row.author_id, row.content, row.likes, row.created_at, row.updated_at, row.user_id, row.parent_id).run();
  return parseCommentRow(row);
}
__name(createComment, "createComment");
async function getCommentById(db, id) {
  const row = await db.prepare("SELECT * FROM comments WHERE id = ? LIMIT 1").bind(String(id)).first();
  return parseCommentRow(row);
}
__name(getCommentById, "getCommentById");
async function updateComment(db, id, updates) {
  const normalized = { ...updates, updated_at: updates.updated_at ?? nowIso() };
  const allowed = ["content", "likes", "updated_at"];
  const entries = Object.entries(pickExisting(normalized, allowed));
  const sql = `UPDATE comments SET ${entries.map(([key]) => `${key} = ?`).join(", ")} WHERE id = ?`;
  await db.prepare(sql).bind(...entries.map(([, value]) => value), String(id)).run();
  return getCommentById(db, id);
}
__name(updateComment, "updateComment");
async function listPaymentPlans(db) {
  const { results } = await db.prepare("SELECT * FROM payment_plans ORDER BY COALESCE(display_order,0) ASC, price ASC").all();
  return (results || []).map((row) => ({ ...row, features: parseStructuredValue(row.features, row.features ?? []) }));
}
__name(listPaymentPlans, "listPaymentPlans");
async function getPaymentPlanById(db, id) {
  const row = await db.prepare("SELECT * FROM payment_plans WHERE id = ? LIMIT 1").bind(String(id)).first();
  return row ? { ...row, features: parseStructuredValue(row.features, row.features ?? []) } : null;
}
__name(getPaymentPlanById, "getPaymentPlanById");
async function createPaymentPlan(db, data) {
  const row = {
    id: String(data.id || generateTextId()),
    name: data.name ?? "",
    price: Number(data.price ?? 0),
    duration_days: Number(data.duration_days ?? 0),
    features: maybeJsonStringify(data.features ?? []),
    created_at: data.created_at ?? nowIso(),
    updated_at: data.updated_at ?? data.created_at ?? nowIso(),
    description: data.description ?? null,
    is_active: data.is_active === void 0 ? 1 : Number(Boolean(data.is_active)),
    display_order: Number(data.display_order ?? 0)
  };
  await db.prepare("INSERT INTO payment_plans (id, name, price, duration_days, features, created_at, updated_at, description, is_active, display_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").bind(row.id, row.name, row.price, row.duration_days, row.features, row.created_at, row.updated_at, row.description, row.is_active, row.display_order).run();
  return getPaymentPlanById(db, row.id);
}
__name(createPaymentPlan, "createPaymentPlan");
async function updatePaymentPlan(db, id, updates) {
  const normalized = {
    ...updates,
    features: updates.features !== void 0 ? maybeJsonStringify(updates.features) : void 0,
    is_active: updates.is_active !== void 0 ? Number(Boolean(updates.is_active)) : void 0,
    updated_at: updates.updated_at ?? nowIso()
  };
  const allowed = ["name", "price", "duration_days", "features", "updated_at", "description", "is_active", "display_order"];
  const entries = Object.entries(pickExisting(normalized, allowed));
  const sql = `UPDATE payment_plans SET ${entries.map(([key]) => `${key} = ?`).join(", ")} WHERE id = ?`;
  await db.prepare(sql).bind(...entries.map(([, value]) => value), String(id)).run();
}
__name(updatePaymentPlan, "updatePaymentPlan");
async function deletePaymentPlan(db, id) {
  await db.prepare("DELETE FROM payment_plans WHERE id = ?").bind(String(id)).run();
}
__name(deletePaymentPlan, "deletePaymentPlan");
async function createTransaction(db, data) {
  const row = {
    id: String(data.id || generateTextId()),
    user_id: data.user_id ?? null,
    plan_id: data.plan_id ?? null,
    amount: Number(data.amount ?? 0),
    status: data.status ?? "pending",
    session_id: data.session_id ?? null,
    created_at: data.created_at ?? nowIso(),
    updated_at: data.updated_at ?? data.created_at ?? nowIso(),
    payment_method: data.payment_method ?? null,
    type: data.type ?? null
  };
  await db.prepare("INSERT INTO transactions (id, user_id, plan_id, amount, status, session_id, created_at, updated_at, payment_method, type) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").bind(row.id, row.user_id, row.plan_id, row.amount, row.status, row.session_id, row.created_at, row.updated_at, row.payment_method, row.type).run();
  return row;
}
__name(createTransaction, "createTransaction");
async function listAssets(db) {
  const { results } = await db.prepare("SELECT * FROM assets ORDER BY datetime(created_at) DESC").all();
  return results || [];
}
__name(listAssets, "listAssets");
async function createAsset(db, data) {
  const row = {
    id: String(data.id || generateTextId()),
    name: data.name ?? "",
    type: data.type ?? "",
    url: data.url ?? "",
    is_premium: Number(Boolean(data.is_premium)),
    created_at: data.created_at ?? nowIso(),
    updated_at: data.updated_at ?? data.created_at ?? nowIso()
  };
  await db.prepare("INSERT INTO assets (id, name, type, url, is_premium, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)").bind(row.id, row.name, row.type, row.url, row.is_premium, row.created_at, row.updated_at).run();
  return row;
}
__name(createAsset, "createAsset");
async function deleteAsset(db, id) {
  await db.prepare("DELETE FROM assets WHERE id = ?").bind(String(id)).run();
}
__name(deleteAsset, "deleteAsset");
async function getSystemConfig(db, id) {
  const row = await db.prepare("SELECT value FROM system_config WHERE id = ? LIMIT 1").bind(String(id)).first();
  return row?.value ? parseStructuredValue(row.value, {}) : null;
}
__name(getSystemConfig, "getSystemConfig");
async function upsertSystemConfig(db, id, value) {
  await db.prepare("INSERT OR REPLACE INTO system_config (id, value) VALUES (?, ?)").bind(String(id), JSON.stringify(value ?? {})).run();
}
__name(upsertSystemConfig, "upsertSystemConfig");
var parseBusinessRow = /* @__PURE__ */ __name((row) => row ? { ...row, stats: parseStructuredValue(row.stats, row.stats ?? null) } : null, "parseBusinessRow");
async function listBusinesses(db, limit = 100) {
  const { results } = await db.prepare("SELECT * FROM businesses ORDER BY datetime(created_at) DESC LIMIT ?").bind(limit).all();
  return (results || []).map(parseBusinessRow);
}
__name(listBusinesses, "listBusinesses");
async function getBusinessById(db, id) {
  const row = await db.prepare("SELECT * FROM businesses WHERE id = ? LIMIT 1").bind(String(id)).first();
  return parseBusinessRow(row);
}
__name(getBusinessById, "getBusinessById");
async function getBusinessByOwner(db, ownerUid) {
  const row = await db.prepare("SELECT * FROM businesses WHERE owner_uid = ? LIMIT 1").bind(String(ownerUid)).first();
  return parseBusinessRow(row);
}
__name(getBusinessByOwner, "getBusinessByOwner");
async function createBusiness(db, data) {
  const row = {
    id: String(data.id || generateTextId()),
    owner_uid: String(data.owner_uid),
    name: data.name ?? "",
    tagline: data.tagline ?? null,
    about: data.about ?? null,
    category: data.category ?? null,
    contact_link: data.contact_link ?? null,
    contact_line_id: data.contact_line_id ?? null,
    contact_facebook_url: data.contact_facebook_url ?? null,
    status: data.status ?? "approved",
    logo_image: data.logo_image ?? null,
    stats: maybeJsonStringify(data.stats ?? null),
    created_at: data.created_at ?? nowIso(),
    updated_at: data.updated_at ?? data.created_at ?? nowIso()
  };
  await db.prepare("INSERT INTO businesses (id, owner_uid, name, tagline, about, category, contact_link, contact_line_id, contact_facebook_url, status, logo_image, stats, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").bind(row.id, row.owner_uid, row.name, row.tagline, row.about, row.category, row.contact_link, row.contact_line_id, row.contact_facebook_url, row.status, row.logo_image, row.stats, row.created_at, row.updated_at).run();
  return getBusinessById(db, row.id);
}
__name(createBusiness, "createBusiness");
async function updateBusiness(db, id, updates) {
  const normalized = { ...updates, stats: updates.stats !== void 0 ? maybeJsonStringify(updates.stats) : void 0, updated_at: updates.updated_at ?? nowIso() };
  const allowed = ["name", "tagline", "about", "category", "contact_link", "contact_line_id", "contact_facebook_url", "status", "logo_image", "stats", "updated_at"];
  const entries = Object.entries(pickExisting(normalized, allowed));
  const sql = `UPDATE businesses SET ${entries.map(([key]) => `${key} = ?`).join(", ")} WHERE id = ?`;
  await db.prepare(sql).bind(...entries.map(([, value]) => value), String(id)).run();
  return getBusinessById(db, id);
}
__name(updateBusiness, "updateBusiness");
async function deleteBusiness(db, id) {
  await db.prepare("DELETE FROM businesses WHERE id = ?").bind(String(id)).run();
}
__name(deleteBusiness, "deleteBusiness");
async function listBusinessPosts(db, businessId, limit = 50) {
  if (businessId) {
    const { results: results2 } = await db.prepare("SELECT * FROM business_posts WHERE business_id = ? ORDER BY datetime(created_at) DESC LIMIT ?").bind(String(businessId), limit).all();
    return results2 || [];
  }
  const { results } = await db.prepare("SELECT * FROM business_posts ORDER BY datetime(created_at) DESC LIMIT ?").bind(limit).all();
  return results || [];
}
__name(listBusinessPosts, "listBusinessPosts");
async function listTickets(db, userId) {
  const result = userId ? await db.prepare("SELECT * FROM tickets WHERE user_id = ? ORDER BY datetime(created_at) DESC").bind(String(userId)).all() : await db.prepare("SELECT * FROM tickets ORDER BY datetime(created_at) DESC").all();
  return result.results || [];
}
__name(listTickets, "listTickets");
async function getTicketById(db, id) {
  return await db.prepare("SELECT * FROM tickets WHERE id = ? LIMIT 1").bind(String(id)).first();
}
__name(getTicketById, "getTicketById");
async function createTicket(db, data) {
  const row = {
    id: String(data.id || generateTextId()),
    user_id: data.user_id ?? null,
    subject: data.subject ?? "",
    status: data.status ?? "open",
    created_at: data.created_at ?? nowIso(),
    updated_at: data.updated_at ?? data.created_at ?? nowIso(),
    ticket_id: data.ticket_id ?? data.id ?? null,
    description: data.description ?? null,
    category: data.category ?? null
  };
  await db.prepare("INSERT INTO tickets (id, user_id, subject, status, created_at, updated_at, ticket_id, description, category, attachment_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").bind(row.id, row.user_id, row.subject, row.status, row.created_at, row.updated_at, row.ticket_id, row.description, row.category, row.attachment_url).run();
  return row;
}
__name(createTicket, "createTicket");
async function updateTicket(db, id, updates) {
  const normalized = { ...updates, updated_at: updates.updated_at ?? nowIso() };
  const allowed = ["subject", "status", "updated_at", "description", "category"];
  const entries = Object.entries(pickExisting(normalized, allowed));
  const sql = `UPDATE tickets SET ${entries.map(([key]) => `${key} = ?`).join(", ")} WHERE id = ?`;
  await db.prepare(sql).bind(...entries.map(([, value]) => value), String(id)).run();
}
__name(updateTicket, "updateTicket");
async function listTicketMessages(db, ticketId) {
  const { results } = await db.prepare("SELECT * FROM ticket_messages WHERE ticket_id = ? ORDER BY datetime(created_at) ASC").bind(String(ticketId)).all();
  return results || [];
}
__name(listTicketMessages, "listTicketMessages");
async function createTicketMessage(db, ticketId, data) {
  const row = {
    id: String(data.id || generateTextId()),
    ticket_id: String(ticketId),
    sender_id: String(data.sender_id ?? data.user_id ?? "anonymous"),
    message: data.message ?? "",
    is_admin: Number(Boolean(data.is_admin || data.is_internal_note)),
    created_at: data.created_at ?? nowIso()
  };
  await db.prepare("INSERT INTO ticket_messages (id, ticket_id, sender_id, message, is_admin, created_at) VALUES (?, ?, ?, ?, ?, ?)").bind(row.id, row.ticket_id, row.sender_id, row.message, row.is_admin, row.created_at).run();
  return row;
}
__name(createTicketMessage, "createTicketMessage");
async function listPayments(db, userId, limit = 200) {
  const result = userId ? await db.prepare("SELECT * FROM transactions WHERE user_id = ? ORDER BY datetime(created_at) DESC LIMIT ?").bind(String(userId), limit).all() : await db.prepare("SELECT * FROM transactions ORDER BY datetime(created_at) DESC LIMIT ?").bind(limit).all();
  return (result.results || []).map((row) => ({ ...row, metadata: parseMaybeJson(row.session_id) }));
}
__name(listPayments, "listPayments");

// src/realtime.ts
var toRoomKey = /* @__PURE__ */ __name((raw) => {
  if (typeof raw === "string" && raw.trim()) return raw.trim();
  return null;
}, "toRoomKey");
var parseJson = /* @__PURE__ */ __name(async (req) => {
  const contentType = req.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) return null;
  try {
    return await req.json();
  } catch {
    return null;
  }
}, "parseJson");
var RealtimeDO = class {
  constructor(state, env) {
    this.state = state;
    this.env = env;
  }
  static {
    __name(this, "RealtimeDO");
  }
  attachments = /* @__PURE__ */ new WeakMap();
  getAttachment(ws) {
    const nativeAttachment = ws.deserializeAttachment?.();
    if (nativeAttachment && typeof nativeAttachment === "object") {
      return nativeAttachment;
    }
    return this.attachments.get(ws);
  }
  setAttachment(ws, attachment) {
    this.attachments.set(ws, attachment);
    ws.serializeAttachment?.(attachment);
  }
  async getRoomInfo(roomId) {
    const room = await getExamRoomById(this.env.DB, roomId);
    if (!room) return null;
    return {
      id: room.id,
      hostUserId: String(room.host_user_id),
      questionCount: Number(room.question_count || 0),
      subject: room.subject ? String(room.subject) : null,
      status: room.status ? String(room.status) : null
    };
  }
  async upsertParticipant(roomId, userId, fields) {
    const score = Number.isFinite(fields.score) ? fields.score : 0;
    const status = fields.status || "joined";
    await upsertExamRoomParticipant(this.env.DB, roomId, userId, {
      score,
      status,
      updated_at: (/* @__PURE__ */ new Date()).toISOString()
    });
  }
  async fetch(request) {
    const url = new URL(request.url);
    if ((url.pathname.endsWith("/ws") || url.pathname.endsWith("/ws/")) && request.headers.get("upgrade")?.toLowerCase() === "websocket") {
      const pair = new WebSocketPair();
      const client = pair[0];
      const server = pair[1];
      this.state.acceptWebSocket(server);
      const token = url.searchParams.get("token") || void 0;
      const userId = url.searchParams.get("userId") || void 0;
      const attachment = {
        userId,
        rooms: []
      };
      this.setAttachment(server, { ...attachment, token });
      const sid = Math.random().toString(36).substring(2, 15);
      server.send(`0{"sid":"${sid}","upgrades":[],"pingInterval":25000,"pingTimeout":20000}`);
      server.send(`40{"sid":"${sid}"}`);
      return new Response(null, { status: 101, webSocket: client });
    }
    if (url.pathname.endsWith("/broadcast") && request.method === "POST") {
      const auth = request.headers.get("authorization") || "";
      const key = auth.toLowerCase().startsWith("bearer ") ? auth.slice(7) : "";
      if (!key || key !== this.env.INTERNAL_API_KEY) {
        return Response.json({ error: "unauthorized" }, { status: 401 });
      }
      const body = await parseJson(request);
      if (!body || typeof body !== "object") {
        return Response.json({ error: "invalid_body" }, { status: 400 });
      }
      const event = body.event;
      const data = body.data;
      const room = toRoomKey(body.room);
      if (typeof event !== "string" || !event) {
        return Response.json({ error: "invalid_event" }, { status: 400 });
      }
      this.broadcast({ event, data }, room);
      return Response.json({ ok: true });
    }
    return Response.json({ error: "not_found" }, { status: 404 });
  }
  broadcast(msg, room) {
    const sockets = this.state.getWebSockets();
    const payload = `42${JSON.stringify([msg.event, msg.data])}`;
    for (const ws of sockets) {
      const attachment = this.getAttachment(ws);
      if (room) {
        const rooms = attachment?.rooms || [];
        if (!rooms.includes(room)) continue;
      }
      ws.send(payload);
    }
  }
  async webSocketMessage(ws, message) {
    if (typeof message !== "string") return;
    if (message === "2" || message === "2probe") {
      ws.send("3");
      return;
    }
    if (message.startsWith("40")) {
      ws.send(`40{"sid":"123456"}`);
      return;
    }
    let payload = null;
    if (message.startsWith("42")) {
      try {
        const parsed = JSON.parse(message.slice(2));
        if (Array.isArray(parsed) && parsed.length > 0) {
          payload = { event: parsed[0], data: parsed[1] };
        }
      } catch {
        payload = null;
      }
    } else {
      try {
        payload = JSON.parse(message);
      } catch {
        payload = null;
      }
    }
    if (!payload) return;
    if (payload.type === "ping") {
      ws.send(JSON.stringify({ type: "pong" }));
      return;
    }
    if (!("event" in payload) || typeof payload.event !== "string") return;
    const attachment = this.getAttachment(ws) || {
      rooms: []
    };
    const event = payload.event;
    const data = payload.data;
    if (event === "join_user") {
      const id = typeof data === "string" || typeof data === "number" ? String(data) : null;
      if (id) {
        attachment.userId = id;
        attachment.rooms = Array.from(/* @__PURE__ */ new Set([...attachment.rooms || [], `user:${id}`]));
        this.setAttachment(ws, attachment);
      }
      return;
    }
    if (event === "join_room") {
      const roomId = data?.roomId;
      const userId = data?.userId;
      const roomKey = toRoomKey(roomId);
      if (roomKey) {
        attachment.rooms = Array.from(/* @__PURE__ */ new Set([...attachment.rooms || [], `room:${roomKey}`]));
        if (userId !== void 0 && userId !== null) attachment.userId = String(userId);
        this.setAttachment(ws, attachment);
        this.broadcast({ event: "user_joined", data: { userId: attachment.userId } }, `room:${roomKey}`);
      }
      return;
    }
    if (event === "leave_room") {
      const roomId = data?.roomId;
      const userId = data?.userId;
      const roomKey = toRoomKey(roomId);
      if (roomKey) {
        attachment.rooms = (attachment.rooms || []).filter((r) => r !== `room:${roomKey}`);
        this.setAttachment(ws, attachment);
        this.broadcast({ event: "user_left", data: { userId } }, `room:${roomKey}`);
      }
      return;
    }
    if (event === "join_ticket") {
      const ticketId = toRoomKey(data);
      if (ticketId) {
        attachment.rooms = Array.from(/* @__PURE__ */ new Set([...attachment.rooms || [], `ticket:${ticketId}`]));
        this.setAttachment(ws, attachment);
      }
      return;
    }
    if (event === "leave_ticket") {
      const ticketId = toRoomKey(data);
      if (ticketId) {
        attachment.rooms = (attachment.rooms || []).filter((r) => r !== `ticket:${ticketId}`);
        this.setAttachment(ws, attachment);
      }
      return;
    }
    if (event === "join_group") {
      const groupKey = toRoomKey(data) || toRoomKey(data?.room) || toRoomKey(data?.group);
      if (groupKey) {
        attachment.rooms = Array.from(/* @__PURE__ */ new Set([...attachment.rooms || [], `group:${groupKey}`]));
        this.setAttachment(ws, attachment);
      }
      return;
    }
    if (event === "send_message") {
      const roomId = data?.roomId;
      const roomKey = toRoomKey(roomId);
      if (roomKey) this.broadcast({ event: "receive_message", data }, `room:${roomKey}`);
      return;
    }
    if (event === "start_exam") {
      const roomId = data?.roomId;
      const userId = data?.userId;
      const roomKey = toRoomKey(roomId);
      if (roomKey && userId !== void 0 && userId !== null) {
        try {
          const info = await this.getRoomInfo(roomKey);
          if (info && info.hostUserId === String(userId)) {
            await updateExamRoom(this.env.DB, roomKey, {
              status: "in_progress",
              updated_at: (/* @__PURE__ */ new Date()).toISOString()
            });
            this.broadcast({ event: "exam_started" }, `room:${roomKey}`);
          }
        } catch {
          return;
        }
      }
      return;
    }
    if (event === "submit_score") {
      const roomId = data?.roomId;
      const roomKey = toRoomKey(roomId);
      if (roomKey) {
        try {
          const userId = data?.userId;
          const score = Number(data?.score ?? 0);
          if (userId !== void 0 && userId !== null) {
            await this.upsertParticipant(roomKey, String(userId), { score, status: data?.status });
            this.broadcast({ event: "score_updated", data: { userId, score } }, `room:${roomKey}`);
          }
        } catch {
          return;
        }
      }
      return;
    }
    if (event === "tutor_navigate") {
      const roomId = data?.roomId;
      const roomKey = toRoomKey(roomId);
      if (roomKey) {
        const payload2 = { questionIndex: data?.questionIndex };
        this.broadcast({ event: "navigate_question", data: payload2 }, `room:${roomKey}`);
        this.broadcast({ event: "tutor_navigate", data: payload2 }, `room:${roomKey}`);
      }
      return;
    }
    if (event === "tutor_show_answer") {
      const roomId = data?.roomId;
      const roomKey = toRoomKey(roomId);
      if (roomKey) this.broadcast({ event: "tutor_show_answer", data: { questionIndex: data?.questionIndex } }, `room:${roomKey}`);
      return;
    }
    if (event === "tutor_player_answer") {
      const roomId = data?.roomId;
      const roomKey = toRoomKey(roomId);
      if (roomKey) this.broadcast({ event: "tutor_player_answered", data: { choice: data?.choice } }, `room:${roomKey}`);
      return;
    }
    if (event === "submit_progress") {
      const roomId = data?.roomId;
      const roomKey = toRoomKey(roomId);
      const userId = data?.userId;
      const questionIndex = data?.questionIndex;
      if (roomKey && userId !== void 0 && userId !== null) {
        try {
          await upsertExamRoomParticipant(this.env.DB, roomKey, String(userId), {
            current_question_index: questionIndex,
            updated_at: (/* @__PURE__ */ new Date()).toISOString()
          });
          this.broadcast({ event: "progress_updated", data: { userId, questionIndex } }, `room:${roomKey}`);
        } catch {
        }
      }
      return;
    }
    if (event === "set_nickname") {
      const roomId = data?.roomId;
      const roomKey = toRoomKey(roomId);
      const userId = data?.userId;
      const nickname = data?.nickname;
      if (roomKey && userId !== void 0 && userId !== null && nickname) {
        try {
          await upsertExamRoomParticipant(this.env.DB, roomKey, String(userId), {
            nickname: String(nickname),
            updated_at: (/* @__PURE__ */ new Date()).toISOString()
          });
          this.broadcast({ event: "nickname_updated", data: { userId, nickname } }, `room:${roomKey}`);
        } catch {
        }
      }
      return;
    }
    if (event === "finish_exam") {
      const roomId = data?.roomId;
      const roomKey = toRoomKey(roomId);
      if (roomKey) {
        try {
          const userId = data?.userId;
          const score = Number(data?.score ?? 0);
          const timeTaken = Number(data?.timeTaken ?? 0);
          if (userId === void 0 || userId === null) return;
          await upsertExamRoomParticipant(this.env.DB, roomKey, String(userId), {
            score,
            status: "finished",
            time_taken: timeTaken,
            completed_at: (/* @__PURE__ */ new Date()).toISOString(),
            updated_at: (/* @__PURE__ */ new Date()).toISOString()
          });
          const info = await this.getRoomInfo(roomKey);
          if (info) {
            const subjectScores = info.subject ? JSON.stringify({ [info.subject]: score }) : null;
            await createExamResult(this.env.DB, {
              user_id: String(userId),
              classroom_id: roomKey,
              score,
              total_score: info.questionCount,
              mode: "classroom",
              subject_scores: subjectScores,
              skill_scores: null,
              questions: null,
              time_taken: timeTaken,
              taken_at: (/* @__PURE__ */ new Date()).toISOString()
            });
            const parts = await listExamRoomParticipants(this.env.DB, roomKey);
            const total = parts.length;
            const finished = parts.filter((p) => p.status === "finished").length;
            if (total > 0 && total === finished) {
              await updateExamRoom(this.env.DB, roomKey, {
                status: "finished",
                updated_at: (/* @__PURE__ */ new Date()).toISOString()
              });
            }
          }
          this.broadcast({ event: "score_updated", data: { userId, score } }, `room:${roomKey}`);
        } catch {
          return;
        }
      }
      return;
    }
    if (event === "close_room") {
      const roomId = data?.roomId;
      const userId = data?.userId;
      const roomKey = toRoomKey(roomId);
      if (roomKey && userId !== void 0 && userId !== null) {
        try {
          const info = await this.getRoomInfo(roomKey);
          if (info && info.hostUserId === String(userId)) {
            await updateExamRoom(this.env.DB, roomKey, {
              status: "finished",
              updated_at: (/* @__PURE__ */ new Date()).toISOString()
            });
            this.broadcast({ event: "room_closed_by_host" }, `room:${roomKey}`);
          }
        } catch {
          return;
        }
      }
      return;
    }
    if (event === "reset_exam" || event === "exam_reset") {
      const roomId = data?.roomId;
      const roomKey = toRoomKey(roomId);
      if (roomKey) {
        try {
          await resetExamRoomParticipants(this.env.DB, roomKey);
          this.broadcast({ event: "exam_reset" }, `room:${roomKey}`);
        } catch {
          return;
        }
      }
      return;
    }
  }
};

// src/auth.ts
var base64UrlToBytes = /* @__PURE__ */ __name((input) => {
  const pad = "=".repeat((4 - input.length % 4) % 4);
  const b64 = (input + pad).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(b64);
  const bytes = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
  return bytes;
}, "base64UrlToBytes");
var bytesToBase64Url = /* @__PURE__ */ __name((bytes) => {
  const u8 = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let binary = "";
  for (let i = 0; i < u8.length; i++) binary += String.fromCharCode(u8[i]);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}, "bytesToBase64Url");
var decodeJson = /* @__PURE__ */ __name((input) => {
  const bytes = base64UrlToBytes(input);
  const text = new TextDecoder().decode(bytes);
  return JSON.parse(text);
}, "decodeJson");
var signJwtHs256 = /* @__PURE__ */ __name(async (payload, secret) => {
  const header = { alg: "HS256", typ: "JWT" };
  const encodedHeader = bytesToBase64Url(new TextEncoder().encode(JSON.stringify(header)));
  const encodedPayload = bytesToBase64Url(new TextEncoder().encode(JSON.stringify(payload)));
  const data = `${encodedHeader}.${encodedPayload}`;
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data));
  const encodedSig = bytesToBase64Url(sig);
  return `${data}.${encodedSig}`;
}, "signJwtHs256");
var verifyJwtHs256 = /* @__PURE__ */ __name(async (token, secret) => {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [h, p, s] = parts;
  let header;
  let payload;
  try {
    header = decodeJson(h);
    payload = decodeJson(p);
  } catch {
    return null;
  }
  if (!header || header.alg !== "HS256") return null;
  if (payload?.exp && typeof payload.exp === "number") {
    const now = Math.floor(Date.now() / 1e3);
    if (now >= payload.exp) return null;
  }
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"]
  );
  const ok = await crypto.subtle.verify(
    { name: "HMAC" },
    key,
    base64UrlToBytes(s),
    new TextEncoder().encode(`${h}.${p}`)
  );
  if (!ok) return null;
  return payload;
}, "verifyJwtHs256");
var requireUserId = /* @__PURE__ */ __name(async (req, jwtSecret) => {
  const auth = req.headers.get("authorization") || "";
  const token = auth.toLowerCase().startsWith("bearer ") ? auth.slice(7) : "";
  if (!token) return null;
  const payload = await verifyJwtHs256(token, jwtSecret);
  const id = payload?.id;
  if (id === void 0 || id === null) return null;
  return String(id);
}, "requireUserId");

// ../node_modules/bcryptjs/index.js
var import_crypto = __toESM(require_crypto(), 1);
var randomFallback = null;
function randomBytes(len) {
  try {
    return crypto.getRandomValues(new Uint8Array(len));
  } catch {
  }
  try {
    return import_crypto.default.randomBytes(len);
  } catch {
  }
  if (!randomFallback) {
    throw Error(
      "Neither WebCryptoAPI nor a crypto module is available. Use bcrypt.setRandomFallback to set an alternative"
    );
  }
  return randomFallback(len);
}
__name(randomBytes, "randomBytes");
function genSaltSync(rounds, seed_length) {
  rounds = rounds || GENSALT_DEFAULT_LOG2_ROUNDS;
  if (typeof rounds !== "number")
    throw Error(
      "Illegal arguments: " + typeof rounds + ", " + typeof seed_length
    );
  if (rounds < 4) rounds = 4;
  else if (rounds > 31) rounds = 31;
  var salt = [];
  salt.push("$2b$");
  if (rounds < 10) salt.push("0");
  salt.push(rounds.toString());
  salt.push("$");
  salt.push(base64_encode(randomBytes(BCRYPT_SALT_LEN), BCRYPT_SALT_LEN));
  return salt.join("");
}
__name(genSaltSync, "genSaltSync");
function hashSync(password, salt) {
  if (typeof salt === "undefined") salt = GENSALT_DEFAULT_LOG2_ROUNDS;
  if (typeof salt === "number") salt = genSaltSync(salt);
  if (typeof password !== "string" || typeof salt !== "string")
    throw Error("Illegal arguments: " + typeof password + ", " + typeof salt);
  return _hash(password, salt);
}
__name(hashSync, "hashSync");
function safeStringCompare(known, unknown) {
  var diff = known.length ^ unknown.length;
  for (var i = 0; i < known.length; ++i) {
    diff |= known.charCodeAt(i) ^ unknown.charCodeAt(i);
  }
  return diff === 0;
}
__name(safeStringCompare, "safeStringCompare");
function compareSync(password, hash) {
  if (typeof password !== "string" || typeof hash !== "string")
    throw Error("Illegal arguments: " + typeof password + ", " + typeof hash);
  if (hash.length !== 60) return false;
  return safeStringCompare(
    hashSync(password, hash.substring(0, hash.length - 31)),
    hash
  );
}
__name(compareSync, "compareSync");
var nextTick = typeof setImmediate === "function" ? setImmediate : typeof scheduler === "object" && typeof scheduler.postTask === "function" ? scheduler.postTask.bind(scheduler) : setTimeout;
function utf8Length(string) {
  var len = 0, c = 0;
  for (var i = 0; i < string.length; ++i) {
    c = string.charCodeAt(i);
    if (c < 128) len += 1;
    else if (c < 2048) len += 2;
    else if ((c & 64512) === 55296 && (string.charCodeAt(i + 1) & 64512) === 56320) {
      ++i;
      len += 4;
    } else len += 3;
  }
  return len;
}
__name(utf8Length, "utf8Length");
function utf8Array(string) {
  var offset = 0, c1, c2;
  var buffer = new Array(utf8Length(string));
  for (var i = 0, k = string.length; i < k; ++i) {
    c1 = string.charCodeAt(i);
    if (c1 < 128) {
      buffer[offset++] = c1;
    } else if (c1 < 2048) {
      buffer[offset++] = c1 >> 6 | 192;
      buffer[offset++] = c1 & 63 | 128;
    } else if ((c1 & 64512) === 55296 && ((c2 = string.charCodeAt(i + 1)) & 64512) === 56320) {
      c1 = 65536 + ((c1 & 1023) << 10) + (c2 & 1023);
      ++i;
      buffer[offset++] = c1 >> 18 | 240;
      buffer[offset++] = c1 >> 12 & 63 | 128;
      buffer[offset++] = c1 >> 6 & 63 | 128;
      buffer[offset++] = c1 & 63 | 128;
    } else {
      buffer[offset++] = c1 >> 12 | 224;
      buffer[offset++] = c1 >> 6 & 63 | 128;
      buffer[offset++] = c1 & 63 | 128;
    }
  }
  return buffer;
}
__name(utf8Array, "utf8Array");
var BASE64_CODE = "./ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789".split("");
var BASE64_INDEX = [
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  0,
  1,
  54,
  55,
  56,
  57,
  58,
  59,
  60,
  61,
  62,
  63,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  2,
  3,
  4,
  5,
  6,
  7,
  8,
  9,
  10,
  11,
  12,
  13,
  14,
  15,
  16,
  17,
  18,
  19,
  20,
  21,
  22,
  23,
  24,
  25,
  26,
  27,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  28,
  29,
  30,
  31,
  32,
  33,
  34,
  35,
  36,
  37,
  38,
  39,
  40,
  41,
  42,
  43,
  44,
  45,
  46,
  47,
  48,
  49,
  50,
  51,
  52,
  53,
  -1,
  -1,
  -1,
  -1,
  -1
];
function base64_encode(b, len) {
  var off = 0, rs = [], c1, c2;
  if (len <= 0 || len > b.length) throw Error("Illegal len: " + len);
  while (off < len) {
    c1 = b[off++] & 255;
    rs.push(BASE64_CODE[c1 >> 2 & 63]);
    c1 = (c1 & 3) << 4;
    if (off >= len) {
      rs.push(BASE64_CODE[c1 & 63]);
      break;
    }
    c2 = b[off++] & 255;
    c1 |= c2 >> 4 & 15;
    rs.push(BASE64_CODE[c1 & 63]);
    c1 = (c2 & 15) << 2;
    if (off >= len) {
      rs.push(BASE64_CODE[c1 & 63]);
      break;
    }
    c2 = b[off++] & 255;
    c1 |= c2 >> 6 & 3;
    rs.push(BASE64_CODE[c1 & 63]);
    rs.push(BASE64_CODE[c2 & 63]);
  }
  return rs.join("");
}
__name(base64_encode, "base64_encode");
function base64_decode(s, len) {
  var off = 0, slen = s.length, olen = 0, rs = [], c1, c2, c3, c4, o, code;
  if (len <= 0) throw Error("Illegal len: " + len);
  while (off < slen - 1 && olen < len) {
    code = s.charCodeAt(off++);
    c1 = code < BASE64_INDEX.length ? BASE64_INDEX[code] : -1;
    code = s.charCodeAt(off++);
    c2 = code < BASE64_INDEX.length ? BASE64_INDEX[code] : -1;
    if (c1 == -1 || c2 == -1) break;
    o = c1 << 2 >>> 0;
    o |= (c2 & 48) >> 4;
    rs.push(String.fromCharCode(o));
    if (++olen >= len || off >= slen) break;
    code = s.charCodeAt(off++);
    c3 = code < BASE64_INDEX.length ? BASE64_INDEX[code] : -1;
    if (c3 == -1) break;
    o = (c2 & 15) << 4 >>> 0;
    o |= (c3 & 60) >> 2;
    rs.push(String.fromCharCode(o));
    if (++olen >= len || off >= slen) break;
    code = s.charCodeAt(off++);
    c4 = code < BASE64_INDEX.length ? BASE64_INDEX[code] : -1;
    o = (c3 & 3) << 6 >>> 0;
    o |= c4;
    rs.push(String.fromCharCode(o));
    ++olen;
  }
  var res = [];
  for (off = 0; off < olen; off++) res.push(rs[off].charCodeAt(0));
  return res;
}
__name(base64_decode, "base64_decode");
var BCRYPT_SALT_LEN = 16;
var GENSALT_DEFAULT_LOG2_ROUNDS = 10;
var BLOWFISH_NUM_ROUNDS = 16;
var MAX_EXECUTION_TIME = 100;
var P_ORIG = [
  608135816,
  2242054355,
  320440878,
  57701188,
  2752067618,
  698298832,
  137296536,
  3964562569,
  1160258022,
  953160567,
  3193202383,
  887688300,
  3232508343,
  3380367581,
  1065670069,
  3041331479,
  2450970073,
  2306472731
];
var S_ORIG = [
  3509652390,
  2564797868,
  805139163,
  3491422135,
  3101798381,
  1780907670,
  3128725573,
  4046225305,
  614570311,
  3012652279,
  134345442,
  2240740374,
  1667834072,
  1901547113,
  2757295779,
  4103290238,
  227898511,
  1921955416,
  1904987480,
  2182433518,
  2069144605,
  3260701109,
  2620446009,
  720527379,
  3318853667,
  677414384,
  3393288472,
  3101374703,
  2390351024,
  1614419982,
  1822297739,
  2954791486,
  3608508353,
  3174124327,
  2024746970,
  1432378464,
  3864339955,
  2857741204,
  1464375394,
  1676153920,
  1439316330,
  715854006,
  3033291828,
  289532110,
  2706671279,
  2087905683,
  3018724369,
  1668267050,
  732546397,
  1947742710,
  3462151702,
  2609353502,
  2950085171,
  1814351708,
  2050118529,
  680887927,
  999245976,
  1800124847,
  3300911131,
  1713906067,
  1641548236,
  4213287313,
  1216130144,
  1575780402,
  4018429277,
  3917837745,
  3693486850,
  3949271944,
  596196993,
  3549867205,
  258830323,
  2213823033,
  772490370,
  2760122372,
  1774776394,
  2652871518,
  566650946,
  4142492826,
  1728879713,
  2882767088,
  1783734482,
  3629395816,
  2517608232,
  2874225571,
  1861159788,
  326777828,
  3124490320,
  2130389656,
  2716951837,
  967770486,
  1724537150,
  2185432712,
  2364442137,
  1164943284,
  2105845187,
  998989502,
  3765401048,
  2244026483,
  1075463327,
  1455516326,
  1322494562,
  910128902,
  469688178,
  1117454909,
  936433444,
  3490320968,
  3675253459,
  1240580251,
  122909385,
  2157517691,
  634681816,
  4142456567,
  3825094682,
  3061402683,
  2540495037,
  79693498,
  3249098678,
  1084186820,
  1583128258,
  426386531,
  1761308591,
  1047286709,
  322548459,
  995290223,
  1845252383,
  2603652396,
  3431023940,
  2942221577,
  3202600964,
  3727903485,
  1712269319,
  422464435,
  3234572375,
  1170764815,
  3523960633,
  3117677531,
  1434042557,
  442511882,
  3600875718,
  1076654713,
  1738483198,
  4213154764,
  2393238008,
  3677496056,
  1014306527,
  4251020053,
  793779912,
  2902807211,
  842905082,
  4246964064,
  1395751752,
  1040244610,
  2656851899,
  3396308128,
  445077038,
  3742853595,
  3577915638,
  679411651,
  2892444358,
  2354009459,
  1767581616,
  3150600392,
  3791627101,
  3102740896,
  284835224,
  4246832056,
  1258075500,
  768725851,
  2589189241,
  3069724005,
  3532540348,
  1274779536,
  3789419226,
  2764799539,
  1660621633,
  3471099624,
  4011903706,
  913787905,
  3497959166,
  737222580,
  2514213453,
  2928710040,
  3937242737,
  1804850592,
  3499020752,
  2949064160,
  2386320175,
  2390070455,
  2415321851,
  4061277028,
  2290661394,
  2416832540,
  1336762016,
  1754252060,
  3520065937,
  3014181293,
  791618072,
  3188594551,
  3933548030,
  2332172193,
  3852520463,
  3043980520,
  413987798,
  3465142937,
  3030929376,
  4245938359,
  2093235073,
  3534596313,
  375366246,
  2157278981,
  2479649556,
  555357303,
  3870105701,
  2008414854,
  3344188149,
  4221384143,
  3956125452,
  2067696032,
  3594591187,
  2921233993,
  2428461,
  544322398,
  577241275,
  1471733935,
  610547355,
  4027169054,
  1432588573,
  1507829418,
  2025931657,
  3646575487,
  545086370,
  48609733,
  2200306550,
  1653985193,
  298326376,
  1316178497,
  3007786442,
  2064951626,
  458293330,
  2589141269,
  3591329599,
  3164325604,
  727753846,
  2179363840,
  146436021,
  1461446943,
  4069977195,
  705550613,
  3059967265,
  3887724982,
  4281599278,
  3313849956,
  1404054877,
  2845806497,
  146425753,
  1854211946,
  1266315497,
  3048417604,
  3681880366,
  3289982499,
  290971e4,
  1235738493,
  2632868024,
  2414719590,
  3970600049,
  1771706367,
  1449415276,
  3266420449,
  422970021,
  1963543593,
  2690192192,
  3826793022,
  1062508698,
  1531092325,
  1804592342,
  2583117782,
  2714934279,
  4024971509,
  1294809318,
  4028980673,
  1289560198,
  2221992742,
  1669523910,
  35572830,
  157838143,
  1052438473,
  1016535060,
  1802137761,
  1753167236,
  1386275462,
  3080475397,
  2857371447,
  1040679964,
  2145300060,
  2390574316,
  1461121720,
  2956646967,
  4031777805,
  4028374788,
  33600511,
  2920084762,
  1018524850,
  629373528,
  3691585981,
  3515945977,
  2091462646,
  2486323059,
  586499841,
  988145025,
  935516892,
  3367335476,
  2599673255,
  2839830854,
  265290510,
  3972581182,
  2759138881,
  3795373465,
  1005194799,
  847297441,
  406762289,
  1314163512,
  1332590856,
  1866599683,
  4127851711,
  750260880,
  613907577,
  1450815602,
  3165620655,
  3734664991,
  3650291728,
  3012275730,
  3704569646,
  1427272223,
  778793252,
  1343938022,
  2676280711,
  2052605720,
  1946737175,
  3164576444,
  3914038668,
  3967478842,
  3682934266,
  1661551462,
  3294938066,
  4011595847,
  840292616,
  3712170807,
  616741398,
  312560963,
  711312465,
  1351876610,
  322626781,
  1910503582,
  271666773,
  2175563734,
  1594956187,
  70604529,
  3617834859,
  1007753275,
  1495573769,
  4069517037,
  2549218298,
  2663038764,
  504708206,
  2263041392,
  3941167025,
  2249088522,
  1514023603,
  1998579484,
  1312622330,
  694541497,
  2582060303,
  2151582166,
  1382467621,
  776784248,
  2618340202,
  3323268794,
  2497899128,
  2784771155,
  503983604,
  4076293799,
  907881277,
  423175695,
  432175456,
  1378068232,
  4145222326,
  3954048622,
  3938656102,
  3820766613,
  2793130115,
  2977904593,
  26017576,
  3274890735,
  3194772133,
  1700274565,
  1756076034,
  4006520079,
  3677328699,
  720338349,
  1533947780,
  354530856,
  688349552,
  3973924725,
  1637815568,
  332179504,
  3949051286,
  53804574,
  2852348879,
  3044236432,
  1282449977,
  3583942155,
  3416972820,
  4006381244,
  1617046695,
  2628476075,
  3002303598,
  1686838959,
  431878346,
  2686675385,
  1700445008,
  1080580658,
  1009431731,
  832498133,
  3223435511,
  2605976345,
  2271191193,
  2516031870,
  1648197032,
  4164389018,
  2548247927,
  300782431,
  375919233,
  238389289,
  3353747414,
  2531188641,
  2019080857,
  1475708069,
  455242339,
  2609103871,
  448939670,
  3451063019,
  1395535956,
  2413381860,
  1841049896,
  1491858159,
  885456874,
  4264095073,
  4001119347,
  1565136089,
  3898914787,
  1108368660,
  540939232,
  1173283510,
  2745871338,
  3681308437,
  4207628240,
  3343053890,
  4016749493,
  1699691293,
  1103962373,
  3625875870,
  2256883143,
  3830138730,
  1031889488,
  3479347698,
  1535977030,
  4236805024,
  3251091107,
  2132092099,
  1774941330,
  1199868427,
  1452454533,
  157007616,
  2904115357,
  342012276,
  595725824,
  1480756522,
  206960106,
  497939518,
  591360097,
  863170706,
  2375253569,
  3596610801,
  1814182875,
  2094937945,
  3421402208,
  1082520231,
  3463918190,
  2785509508,
  435703966,
  3908032597,
  1641649973,
  2842273706,
  3305899714,
  1510255612,
  2148256476,
  2655287854,
  3276092548,
  4258621189,
  236887753,
  3681803219,
  274041037,
  1734335097,
  3815195456,
  3317970021,
  1899903192,
  1026095262,
  4050517792,
  356393447,
  2410691914,
  3873677099,
  3682840055,
  3913112168,
  2491498743,
  4132185628,
  2489919796,
  1091903735,
  1979897079,
  3170134830,
  3567386728,
  3557303409,
  857797738,
  1136121015,
  1342202287,
  507115054,
  2535736646,
  337727348,
  3213592640,
  1301675037,
  2528481711,
  1895095763,
  1721773893,
  3216771564,
  62756741,
  2142006736,
  835421444,
  2531993523,
  1442658625,
  3659876326,
  2882144922,
  676362277,
  1392781812,
  170690266,
  3921047035,
  1759253602,
  3611846912,
  1745797284,
  664899054,
  1329594018,
  3901205900,
  3045908486,
  2062866102,
  2865634940,
  3543621612,
  3464012697,
  1080764994,
  553557557,
  3656615353,
  3996768171,
  991055499,
  499776247,
  1265440854,
  648242737,
  3940784050,
  980351604,
  3713745714,
  1749149687,
  3396870395,
  4211799374,
  3640570775,
  1161844396,
  3125318951,
  1431517754,
  545492359,
  4268468663,
  3499529547,
  1437099964,
  2702547544,
  3433638243,
  2581715763,
  2787789398,
  1060185593,
  1593081372,
  2418618748,
  4260947970,
  69676912,
  2159744348,
  86519011,
  2512459080,
  3838209314,
  1220612927,
  3339683548,
  133810670,
  1090789135,
  1078426020,
  1569222167,
  845107691,
  3583754449,
  4072456591,
  1091646820,
  628848692,
  1613405280,
  3757631651,
  526609435,
  236106946,
  48312990,
  2942717905,
  3402727701,
  1797494240,
  859738849,
  992217954,
  4005476642,
  2243076622,
  3870952857,
  3732016268,
  765654824,
  3490871365,
  2511836413,
  1685915746,
  3888969200,
  1414112111,
  2273134842,
  3281911079,
  4080962846,
  172450625,
  2569994100,
  980381355,
  4109958455,
  2819808352,
  2716589560,
  2568741196,
  3681446669,
  3329971472,
  1835478071,
  660984891,
  3704678404,
  4045999559,
  3422617507,
  3040415634,
  1762651403,
  1719377915,
  3470491036,
  2693910283,
  3642056355,
  3138596744,
  1364962596,
  2073328063,
  1983633131,
  926494387,
  3423689081,
  2150032023,
  4096667949,
  1749200295,
  3328846651,
  309677260,
  2016342300,
  1779581495,
  3079819751,
  111262694,
  1274766160,
  443224088,
  298511866,
  1025883608,
  3806446537,
  1145181785,
  168956806,
  3641502830,
  3584813610,
  1689216846,
  3666258015,
  3200248200,
  1692713982,
  2646376535,
  4042768518,
  1618508792,
  1610833997,
  3523052358,
  4130873264,
  2001055236,
  3610705100,
  2202168115,
  4028541809,
  2961195399,
  1006657119,
  2006996926,
  3186142756,
  1430667929,
  3210227297,
  1314452623,
  4074634658,
  4101304120,
  2273951170,
  1399257539,
  3367210612,
  3027628629,
  1190975929,
  2062231137,
  2333990788,
  2221543033,
  2438960610,
  1181637006,
  548689776,
  2362791313,
  3372408396,
  3104550113,
  3145860560,
  296247880,
  1970579870,
  3078560182,
  3769228297,
  1714227617,
  3291629107,
  3898220290,
  166772364,
  1251581989,
  493813264,
  448347421,
  195405023,
  2709975567,
  677966185,
  3703036547,
  1463355134,
  2715995803,
  1338867538,
  1343315457,
  2802222074,
  2684532164,
  233230375,
  2599980071,
  2000651841,
  3277868038,
  1638401717,
  4028070440,
  3237316320,
  6314154,
  819756386,
  300326615,
  590932579,
  1405279636,
  3267499572,
  3150704214,
  2428286686,
  3959192993,
  3461946742,
  1862657033,
  1266418056,
  963775037,
  2089974820,
  2263052895,
  1917689273,
  448879540,
  3550394620,
  3981727096,
  150775221,
  3627908307,
  1303187396,
  508620638,
  2975983352,
  2726630617,
  1817252668,
  1876281319,
  1457606340,
  908771278,
  3720792119,
  3617206836,
  2455994898,
  1729034894,
  1080033504,
  976866871,
  3556439503,
  2881648439,
  1522871579,
  1555064734,
  1336096578,
  3548522304,
  2579274686,
  3574697629,
  3205460757,
  3593280638,
  3338716283,
  3079412587,
  564236357,
  2993598910,
  1781952180,
  1464380207,
  3163844217,
  3332601554,
  1699332808,
  1393555694,
  1183702653,
  3581086237,
  1288719814,
  691649499,
  2847557200,
  2895455976,
  3193889540,
  2717570544,
  1781354906,
  1676643554,
  2592534050,
  3230253752,
  1126444790,
  2770207658,
  2633158820,
  2210423226,
  2615765581,
  2414155088,
  3127139286,
  673620729,
  2805611233,
  1269405062,
  4015350505,
  3341807571,
  4149409754,
  1057255273,
  2012875353,
  2162469141,
  2276492801,
  2601117357,
  993977747,
  3918593370,
  2654263191,
  753973209,
  36408145,
  2530585658,
  25011837,
  3520020182,
  2088578344,
  530523599,
  2918365339,
  1524020338,
  1518925132,
  3760827505,
  3759777254,
  1202760957,
  3985898139,
  3906192525,
  674977740,
  4174734889,
  2031300136,
  2019492241,
  3983892565,
  4153806404,
  3822280332,
  352677332,
  2297720250,
  60907813,
  90501309,
  3286998549,
  1016092578,
  2535922412,
  2839152426,
  457141659,
  509813237,
  4120667899,
  652014361,
  1966332200,
  2975202805,
  55981186,
  2327461051,
  676427537,
  3255491064,
  2882294119,
  3433927263,
  1307055953,
  942726286,
  933058658,
  2468411793,
  3933900994,
  4215176142,
  1361170020,
  2001714738,
  2830558078,
  3274259782,
  1222529897,
  1679025792,
  2729314320,
  3714953764,
  1770335741,
  151462246,
  3013232138,
  1682292957,
  1483529935,
  471910574,
  1539241949,
  458788160,
  3436315007,
  1807016891,
  3718408830,
  978976581,
  1043663428,
  3165965781,
  1927990952,
  4200891579,
  2372276910,
  3208408903,
  3533431907,
  1412390302,
  2931980059,
  4132332400,
  1947078029,
  3881505623,
  4168226417,
  2941484381,
  1077988104,
  1320477388,
  886195818,
  18198404,
  3786409e3,
  2509781533,
  112762804,
  3463356488,
  1866414978,
  891333506,
  18488651,
  661792760,
  1628790961,
  3885187036,
  3141171499,
  876946877,
  2693282273,
  1372485963,
  791857591,
  2686433993,
  3759982718,
  3167212022,
  3472953795,
  2716379847,
  445679433,
  3561995674,
  3504004811,
  3574258232,
  54117162,
  3331405415,
  2381918588,
  3769707343,
  4154350007,
  1140177722,
  4074052095,
  668550556,
  3214352940,
  367459370,
  261225585,
  2610173221,
  4209349473,
  3468074219,
  3265815641,
  314222801,
  3066103646,
  3808782860,
  282218597,
  3406013506,
  3773591054,
  379116347,
  1285071038,
  846784868,
  2669647154,
  3771962079,
  3550491691,
  2305946142,
  453669953,
  1268987020,
  3317592352,
  3279303384,
  3744833421,
  2610507566,
  3859509063,
  266596637,
  3847019092,
  517658769,
  3462560207,
  3443424879,
  370717030,
  4247526661,
  2224018117,
  4143653529,
  4112773975,
  2788324899,
  2477274417,
  1456262402,
  2901442914,
  1517677493,
  1846949527,
  2295493580,
  3734397586,
  2176403920,
  1280348187,
  1908823572,
  3871786941,
  846861322,
  1172426758,
  3287448474,
  3383383037,
  1655181056,
  3139813346,
  901632758,
  1897031941,
  2986607138,
  3066810236,
  3447102507,
  1393639104,
  373351379,
  950779232,
  625454576,
  3124240540,
  4148612726,
  2007998917,
  544563296,
  2244738638,
  2330496472,
  2058025392,
  1291430526,
  424198748,
  50039436,
  29584100,
  3605783033,
  2429876329,
  2791104160,
  1057563949,
  3255363231,
  3075367218,
  3463963227,
  1469046755,
  985887462
];
var C_ORIG = [
  1332899944,
  1700884034,
  1701343084,
  1684370003,
  1668446532,
  1869963892
];
function _encipher(lr, off, P, S) {
  var n, l = lr[off], r = lr[off + 1];
  l ^= P[0];
  n = S[l >>> 24];
  n += S[256 | l >> 16 & 255];
  n ^= S[512 | l >> 8 & 255];
  n += S[768 | l & 255];
  r ^= n ^ P[1];
  n = S[r >>> 24];
  n += S[256 | r >> 16 & 255];
  n ^= S[512 | r >> 8 & 255];
  n += S[768 | r & 255];
  l ^= n ^ P[2];
  n = S[l >>> 24];
  n += S[256 | l >> 16 & 255];
  n ^= S[512 | l >> 8 & 255];
  n += S[768 | l & 255];
  r ^= n ^ P[3];
  n = S[r >>> 24];
  n += S[256 | r >> 16 & 255];
  n ^= S[512 | r >> 8 & 255];
  n += S[768 | r & 255];
  l ^= n ^ P[4];
  n = S[l >>> 24];
  n += S[256 | l >> 16 & 255];
  n ^= S[512 | l >> 8 & 255];
  n += S[768 | l & 255];
  r ^= n ^ P[5];
  n = S[r >>> 24];
  n += S[256 | r >> 16 & 255];
  n ^= S[512 | r >> 8 & 255];
  n += S[768 | r & 255];
  l ^= n ^ P[6];
  n = S[l >>> 24];
  n += S[256 | l >> 16 & 255];
  n ^= S[512 | l >> 8 & 255];
  n += S[768 | l & 255];
  r ^= n ^ P[7];
  n = S[r >>> 24];
  n += S[256 | r >> 16 & 255];
  n ^= S[512 | r >> 8 & 255];
  n += S[768 | r & 255];
  l ^= n ^ P[8];
  n = S[l >>> 24];
  n += S[256 | l >> 16 & 255];
  n ^= S[512 | l >> 8 & 255];
  n += S[768 | l & 255];
  r ^= n ^ P[9];
  n = S[r >>> 24];
  n += S[256 | r >> 16 & 255];
  n ^= S[512 | r >> 8 & 255];
  n += S[768 | r & 255];
  l ^= n ^ P[10];
  n = S[l >>> 24];
  n += S[256 | l >> 16 & 255];
  n ^= S[512 | l >> 8 & 255];
  n += S[768 | l & 255];
  r ^= n ^ P[11];
  n = S[r >>> 24];
  n += S[256 | r >> 16 & 255];
  n ^= S[512 | r >> 8 & 255];
  n += S[768 | r & 255];
  l ^= n ^ P[12];
  n = S[l >>> 24];
  n += S[256 | l >> 16 & 255];
  n ^= S[512 | l >> 8 & 255];
  n += S[768 | l & 255];
  r ^= n ^ P[13];
  n = S[r >>> 24];
  n += S[256 | r >> 16 & 255];
  n ^= S[512 | r >> 8 & 255];
  n += S[768 | r & 255];
  l ^= n ^ P[14];
  n = S[l >>> 24];
  n += S[256 | l >> 16 & 255];
  n ^= S[512 | l >> 8 & 255];
  n += S[768 | l & 255];
  r ^= n ^ P[15];
  n = S[r >>> 24];
  n += S[256 | r >> 16 & 255];
  n ^= S[512 | r >> 8 & 255];
  n += S[768 | r & 255];
  l ^= n ^ P[16];
  lr[off] = r ^ P[BLOWFISH_NUM_ROUNDS + 1];
  lr[off + 1] = l;
  return lr;
}
__name(_encipher, "_encipher");
function _streamtoword(data, offp) {
  for (var i = 0, word = 0; i < 4; ++i)
    word = word << 8 | data[offp] & 255, offp = (offp + 1) % data.length;
  return { key: word, offp };
}
__name(_streamtoword, "_streamtoword");
function _key(key, P, S) {
  var offset = 0, lr = [0, 0], plen = P.length, slen = S.length, sw;
  for (var i = 0; i < plen; i++)
    sw = _streamtoword(key, offset), offset = sw.offp, P[i] = P[i] ^ sw.key;
  for (i = 0; i < plen; i += 2)
    lr = _encipher(lr, 0, P, S), P[i] = lr[0], P[i + 1] = lr[1];
  for (i = 0; i < slen; i += 2)
    lr = _encipher(lr, 0, P, S), S[i] = lr[0], S[i + 1] = lr[1];
}
__name(_key, "_key");
function _ekskey(data, key, P, S) {
  var offp = 0, lr = [0, 0], plen = P.length, slen = S.length, sw;
  for (var i = 0; i < plen; i++)
    sw = _streamtoword(key, offp), offp = sw.offp, P[i] = P[i] ^ sw.key;
  offp = 0;
  for (i = 0; i < plen; i += 2)
    sw = _streamtoword(data, offp), offp = sw.offp, lr[0] ^= sw.key, sw = _streamtoword(data, offp), offp = sw.offp, lr[1] ^= sw.key, lr = _encipher(lr, 0, P, S), P[i] = lr[0], P[i + 1] = lr[1];
  for (i = 0; i < slen; i += 2)
    sw = _streamtoword(data, offp), offp = sw.offp, lr[0] ^= sw.key, sw = _streamtoword(data, offp), offp = sw.offp, lr[1] ^= sw.key, lr = _encipher(lr, 0, P, S), S[i] = lr[0], S[i + 1] = lr[1];
}
__name(_ekskey, "_ekskey");
function _crypt(b, salt, rounds, callback, progressCallback) {
  var cdata = C_ORIG.slice(), clen = cdata.length, err;
  if (rounds < 4 || rounds > 31) {
    err = Error("Illegal number of rounds (4-31): " + rounds);
    if (callback) {
      nextTick(callback.bind(this, err));
      return;
    } else throw err;
  }
  if (salt.length !== BCRYPT_SALT_LEN) {
    err = Error(
      "Illegal salt length: " + salt.length + " != " + BCRYPT_SALT_LEN
    );
    if (callback) {
      nextTick(callback.bind(this, err));
      return;
    } else throw err;
  }
  rounds = 1 << rounds >>> 0;
  var P, S, i = 0, j;
  if (typeof Int32Array === "function") {
    P = new Int32Array(P_ORIG);
    S = new Int32Array(S_ORIG);
  } else {
    P = P_ORIG.slice();
    S = S_ORIG.slice();
  }
  _ekskey(salt, b, P, S);
  function next() {
    if (progressCallback) progressCallback(i / rounds);
    if (i < rounds) {
      var start = Date.now();
      for (; i < rounds; ) {
        i = i + 1;
        _key(b, P, S);
        _key(salt, P, S);
        if (Date.now() - start > MAX_EXECUTION_TIME) break;
      }
    } else {
      for (i = 0; i < 64; i++)
        for (j = 0; j < clen >> 1; j++) _encipher(cdata, j << 1, P, S);
      var ret = [];
      for (i = 0; i < clen; i++)
        ret.push((cdata[i] >> 24 & 255) >>> 0), ret.push((cdata[i] >> 16 & 255) >>> 0), ret.push((cdata[i] >> 8 & 255) >>> 0), ret.push((cdata[i] & 255) >>> 0);
      if (callback) {
        callback(null, ret);
        return;
      } else return ret;
    }
    if (callback) nextTick(next);
  }
  __name(next, "next");
  if (typeof callback !== "undefined") {
    next();
  } else {
    var res;
    while (true) if (typeof (res = next()) !== "undefined") return res || [];
  }
}
__name(_crypt, "_crypt");
function _hash(password, salt, callback, progressCallback) {
  var err;
  if (typeof password !== "string" || typeof salt !== "string") {
    err = Error("Invalid string / salt: Not a string");
    if (callback) {
      nextTick(callback.bind(this, err));
      return;
    } else throw err;
  }
  var minor, offset;
  if (salt.charAt(0) !== "$" || salt.charAt(1) !== "2") {
    err = Error("Invalid salt version: " + salt.substring(0, 2));
    if (callback) {
      nextTick(callback.bind(this, err));
      return;
    } else throw err;
  }
  if (salt.charAt(2) === "$") minor = String.fromCharCode(0), offset = 3;
  else {
    minor = salt.charAt(2);
    if (minor !== "a" && minor !== "b" && minor !== "y" || salt.charAt(3) !== "$") {
      err = Error("Invalid salt revision: " + salt.substring(2, 4));
      if (callback) {
        nextTick(callback.bind(this, err));
        return;
      } else throw err;
    }
    offset = 4;
  }
  if (salt.charAt(offset + 2) > "$") {
    err = Error("Missing salt rounds");
    if (callback) {
      nextTick(callback.bind(this, err));
      return;
    } else throw err;
  }
  var r1 = parseInt(salt.substring(offset, offset + 1), 10) * 10, r2 = parseInt(salt.substring(offset + 1, offset + 2), 10), rounds = r1 + r2, real_salt = salt.substring(offset + 3, offset + 25);
  password += minor >= "a" ? "\0" : "";
  var passwordb = utf8Array(password), saltb = base64_decode(real_salt, BCRYPT_SALT_LEN);
  function finish(bytes) {
    var res = [];
    res.push("$2");
    if (minor >= "a") res.push(minor);
    res.push("$");
    if (rounds < 10) res.push("0");
    res.push(rounds.toString());
    res.push("$");
    res.push(base64_encode(saltb, saltb.length));
    res.push(base64_encode(bytes, C_ORIG.length * 4 - 1));
    return res.join("");
  }
  __name(finish, "finish");
  if (typeof callback == "undefined")
    return finish(_crypt(passwordb, saltb, rounds));
  else {
    _crypt(
      passwordb,
      saltb,
      rounds,
      function(err2, bytes) {
        if (err2) callback(err2, null);
        else callback(null, finish(bytes));
      },
      progressCallback
    );
  }
}
__name(_hash, "_hash");

// src/password.ts
var b64UrlToBytes = /* @__PURE__ */ __name((input) => {
  const pad = "=".repeat((4 - input.length % 4) % 4);
  const b64 = (input + pad).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(b64);
  const bytes = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
  return bytes;
}, "b64UrlToBytes");
var bytesToB64Url = /* @__PURE__ */ __name((bytes) => {
  const u8 = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let binary = "";
  for (let i = 0; i < u8.length; i++) binary += String.fromCharCode(u8[i]);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}, "bytesToB64Url");
var timingSafeEqual = /* @__PURE__ */ __name((a, b) => {
  if (a.length !== b.length) return false;
  let out = 0;
  for (let i = 0; i < a.length; i++) out |= a[i] ^ b[i];
  return out === 0;
}, "timingSafeEqual");
var hashPassword = /* @__PURE__ */ __name(async (password) => {
  const iterations = 1e5;
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"]
  );
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt, iterations },
    keyMaterial,
    256
  );
  return `pbkdf2_sha256$${iterations}$${bytesToB64Url(salt)}$${bytesToB64Url(bits)}`;
}, "hashPassword");
var verifyPassword = /* @__PURE__ */ __name(async (password, stored) => {
  if (stored.startsWith("$2a$") || stored.startsWith("$2b$") || stored.startsWith("$2y$")) {
    try {
      return compareSync(password, stored);
    } catch {
      return false;
    }
  }
  const parts = stored.split("$");
  if (parts.length !== 4) return false;
  const algo = parts[0];
  const iterations = Number(parts[1]);
  const salt = parts[2];
  const digest = parts[3];
  if (algo !== "pbkdf2_sha256" || !Number.isFinite(iterations) || iterations <= 0) return false;
  const saltBytes = b64UrlToBytes(salt);
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"]
  );
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt: saltBytes, iterations },
    keyMaterial,
    256
  );
  const got = bytesToB64Url(bits);
  return timingSafeEqual(new TextEncoder().encode(got), new TextEncoder().encode(digest));
}, "verifyPassword");

// src/generator.ts
var aiGeneratorState = {
  isRunning: false,
  logs: []
};
var delay = /* @__PURE__ */ __name((ms) => new Promise((r) => setTimeout(r, ms)), "delay");
async function runAIGenerator(prompt, env) {
  async function updateStatus(isRunning, logMessage) {
    aiGeneratorState.isRunning = isRunning;
    if (logMessage) {
      aiGeneratorState.logs.push(logMessage);
      console.log(logMessage);
    }
    try {
      const data = {
        isRunning: aiGeneratorState.isRunning,
        logs: aiGeneratorState.logs,
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      await upsertSystemConfig(env.DB, "generator_status", data);
    } catch (e) {
    }
  }
  __name(updateStatus, "updateStatus");
  const providers = [
    { name: "Ollama (Primary)", url: env.OLLAMA_URL, model: env.OLLAMA_MODEL || "gpt-oss:120b", key: env.OLLAMA_API_KEY },
    { name: "Writer (Fallback 1)", url: env.WRITER_BASE_URL, model: env.WRITER_MODEL || "mistral-small-latest", key: env.WRITER_API_KEY },
    { name: "Advisor (Fallback 2)", url: env.ADVISOR_BASE_URL, model: env.ADVISOR_MODEL || "mistral-small-latest", key: env.ADVISOR_API_KEY },
    { name: "QA (Fallback 3)", url: env.QA_BASE_URL, model: env.QA_MODEL || "mistral-small-latest", key: env.QA_API_KEY }
  ].filter((p) => p.url && p.key);
  if (providers.length === 0) {
    await updateStatus(false, "[Error] No LLM providers are configured in the environment variables.");
    return;
  }
  aiGeneratorState.logs = [];
  await updateStatus(true, "[System] Initiating AI Generator job...");
  try {
    const systemInstruction = `You are an expert exam question generator for a Thai examination platform. 
The user will provide a topic or prompt. Generate a JSON array of objects representing exam questions.
Each object MUST exactly match this JSON schema and contain no other fields:
{
  "catalogs": "[\\"CategoryName\\"]",
  "category": "CategoryName",
  "choice_a": "Choice A text",
  "choice_b": "Choice B text",
  "choice_c": "Choice C text",
  "choice_d": "Choice D text",
  "correct_answer": "a", // strictly one of "a", "b", "c", "d" in lowercase
  "difficulty": 50, // integer between 1 and 100
  "exam_set": "Mock Exam",
  "exam_year": "",
  "explanation": "Detailed explanation of why the correct answer is correct (in Thai)",
  "question_image": null,
  "question_text": "The actual question text (in Thai)",
  "rating": 0,
  "ratingCount": 0,
  "skill": "Relevant skill or topic",
  "subject": "Main subject name"
}

Ensure the response is ONLY a valid JSON array, do not wrap it in markdown code blocks like \`\`\`json. Return pure JSON.`;
    let textResponse = null;
    let lastError = null;
    for (const provider of providers) {
      try {
        await updateStatus(true, `[AI] Connecting to LLM API via ${provider.name} (${provider.model})...`);
        let baseUrl = provider.url.replace(/\/$/, "");
        if (!baseUrl.endsWith("/v1") && !baseUrl.endsWith("/v1/chat/completions")) {
          baseUrl += "/v1";
        }
        const endpoint = baseUrl.endsWith("/chat/completions") ? baseUrl : `${baseUrl}/chat/completions`;
        const requestBody = {
          model: provider.model,
          messages: [
            { role: "system", content: systemInstruction },
            { role: "user", content: prompt }
          ],
          response_format: { type: "json_object" }
        };
        const res = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${provider.key}`
          },
          body: JSON.stringify(requestBody),
          signal: AbortSignal.timeout(3e4)
          // 30 second timeout
        });
        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(`HTTP ${res.status} ${errorText}`);
        }
        const data = await res.json();
        const content = data.choices?.[0]?.message?.content;
        if (!content) {
          throw new Error("No text response received from LLM.");
        }
        textResponse = content;
        break;
      } catch (err) {
        await updateStatus(true, `[Warning] Failed with ${provider.name}: ${err.message}. Trying next...`);
        lastError = err;
      }
    }
    if (!textResponse) {
      throw new Error(`All LLM providers failed. Last error: ${lastError?.message}`);
    }
    await updateStatus(true, "[System] Received response from LLM. Parsing JSON...");
    let cleanedText = textResponse.trim();
    if (cleanedText.startsWith("```json")) cleanedText = cleanedText.substring(7);
    if (cleanedText.startsWith("```")) cleanedText = cleanedText.substring(3);
    if (cleanedText.endsWith("```")) cleanedText = cleanedText.substring(0, cleanedText.length - 3);
    cleanedText = cleanedText.trim();
    const questions = JSON.parse(cleanedText);
    if (!Array.isArray(questions)) {
      throw new Error("LLM did not return a JSON array.");
    }
    await updateStatus(true, `[System] Parsed ${questions.length} questions. Saving to D1...`);
    let successCount = 0;
    for (const q of questions) {
      q.id = Math.floor(Math.random() * 1e9).toString();
      q.created_at = (/* @__PURE__ */ new Date()).toISOString();
      q.updated_at = q.created_at;
      q.catalogs = typeof q.catalogs === "string" ? (() => {
        try {
          return JSON.parse(q.catalogs);
        } catch {
          return [q.catalogs];
        }
      })() : q.catalogs || [];
      q.choices = {
        A: q.choice_a || "",
        B: q.choice_b || "",
        C: q.choice_c || "",
        D: q.choice_d || ""
      };
      await createQuestion(env.DB, q);
      successCount++;
      await updateStatus(true, `[Database] Inserted question ${successCount}/${questions.length}: "${q.question_text.substring(0, 30)}..."`);
      await delay(100);
    }
    await updateStatus(false, `[System] Generator job completed successfully. Added ${successCount} questions.`);
  } catch (err) {
    await updateStatus(false, `[Error] ${err.message}`);
  }
}
__name(runAIGenerator, "runAIGenerator");

// src/index.ts
var withCors = /* @__PURE__ */ __name((res) => {
  const headers = new Headers(res.headers);
  headers.set("access-control-allow-origin", "*");
  headers.set("access-control-allow-methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  headers.set("access-control-allow-headers", "content-type,authorization");
  return new Response(res.body, { status: res.status, statusText: res.statusText, headers });
}, "withCors");
var mockScraperRunning = false;
var mockScraperLogs = [];
var globalCache = {};
var CACHE_TTL = 60 * 60 * 1e3;
function getCache(key) {
  const item = globalCache[key];
  if (item && item.exp > Date.now()) return item.data;
  return null;
}
__name(getCache, "getCache");
function setCache(key, data, ttl = CACHE_TTL) {
  globalCache[key] = { data, exp: Date.now() + ttl };
}
__name(setCache, "setCache");
var json = /* @__PURE__ */ __name((body, init) => withCors(Response.json(body, init)), "json");
var readJson = /* @__PURE__ */ __name(async (req) => {
  const contentType = req.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) return null;
  try {
    return await req.json();
  } catch {
    return null;
  }
}, "readJson");
var notFound = /* @__PURE__ */ __name(() => json({ error: "not_found" }, { status: 404 }), "notFound");
var requireJwtSecret = /* @__PURE__ */ __name((env) => {
  const secret = env.JWT_SECRET;
  if (!secret) return null;
  return secret;
}, "requireJwtSecret");
var lastActiveUpdateCache = /* @__PURE__ */ new Map();
var requireAuthUserId = /* @__PURE__ */ __name(async (req, env) => {
  const secret = requireJwtSecret(env);
  if (!secret) return { error: json({ error: "missing_jwt_secret" }, { status: 500 }) };
  const userId = await requireUserId(req, secret);
  if (!userId) return { error: json({ error: "unauthorized" }, { status: 401 }) };
  const now = Date.now();
  const lastUpdated = lastActiveUpdateCache.get(userId) || 0;
  if (now - lastUpdated > 5 * 60 * 1e3) {
    lastActiveUpdateCache.set(userId, now);
    try {
      await touchUserLastActive(env.DB, userId, new Date(now).toISOString());
    } catch (e) {
      console.error("Failed to update last active:", e);
    }
  }
  return { userId };
}, "requireAuthUserId");
var requireAdmin = /* @__PURE__ */ __name(async (req, env) => {
  const auth = await requireAuthUserId(req, env);
  if ("error" in auth) return auth;
  const user = await getUserById(env.DB, auth.userId);
  if (!user || user.role !== "admin") return { error: json({ error: "forbidden" }, { status: 403 }) };
  return { userId: auth.userId };
}, "requireAdmin");
var oneDayAgoIso = /* @__PURE__ */ __name(() => new Date(Date.now() - 24 * 60 * 60 * 1e3).toISOString(), "oneDayAgoIso");
var sanitizeUser = /* @__PURE__ */ __name((row) => {
  if (!row) return null;
  return {
    id: row.id,
    email: row.email,
    display_name: row.display_name,
    avatar: row.avatar || null,
    role: row.role,
    plan_type: row.plan_type,
    status: row.status
  };
}, "sanitizeUser");
var normalizeQuestion = /* @__PURE__ */ __name((q) => {
  if (!q) return q;
  const parsedChoices = typeof q.choices === "string" ? (() => {
    try {
      return JSON.parse(q.choices);
    } catch {
      return null;
    }
  })() : q.choices && typeof q.choices === "object" ? q.choices : null;
  const normalized = {
    ...q,
    choice_a: q.choice_a ?? parsedChoices?.A ?? "",
    choice_b: q.choice_b ?? parsedChoices?.B ?? "",
    choice_c: q.choice_c ?? parsedChoices?.C ?? "",
    choice_d: q.choice_d ?? parsedChoices?.D ?? "",
    choices: parsedChoices ?? q.choices ?? { A: "", B: "", C: "", D: "" }
  };
  const ans = String(normalized.correct_answer || "").trim();
  const lowerAns = ans.toLowerCase();
  if (lowerAns === "a" || lowerAns === "b" || lowerAns === "c" || lowerAns === "d") {
    return { ...normalized, correct_answer: ans.toUpperCase() };
  }
  let mapped = ans;
  if (lowerAns === String(normalized.choice_a || "").trim().toLowerCase()) mapped = "A";
  else if (lowerAns === String(normalized.choice_b || "").trim().toLowerCase()) mapped = "B";
  else if (lowerAns === String(normalized.choice_c || "").trim().toLowerCase()) mapped = "C";
  else if (lowerAns === String(normalized.choice_d || "").trim().toLowerCase()) mapped = "D";
  return { ...normalized, correct_answer: mapped.toUpperCase() };
}, "normalizeQuestion");
var parseRoomSettings = /* @__PURE__ */ __name((room) => {
  const raw = room?.settings;
  if (raw && typeof raw === "object") return { ...raw };
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") return parsed;
    } catch {
    }
  }
  return {};
}, "parseRoomSettings");
var createEmptyAnswerCounts = /* @__PURE__ */ __name(() => ({ A: 0, B: 0, C: 0, D: 0 }), "createEmptyAnswerCounts");
var createTutorState = /* @__PURE__ */ __name((settings = {}) => ({
  current_question_index: Number(settings?.tutor_state?.current_question_index ?? 0),
  is_answer_revealed: Boolean(settings?.tutor_state?.is_answer_revealed ?? false),
  answer_counts: {
    ...createEmptyAnswerCounts(),
    ...settings?.tutor_state?.answer_counts || {}
  }
}), "createTutorState");
var index_default = {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.pathname === "/api/webhooks/stripe" && request.method === "POST") {
      if (!env.STRIPE_SECRET_KEY || !env.STRIPE_WEBHOOK_SECRET) {
        return new Response("Webhook error: Stripe secrets not configured", { status: 400 });
      }
      const stripe = new stripe_esm_worker_default(env.STRIPE_SECRET_KEY, {
        apiVersion: "2024-04-10"
      });
      const signature = request.headers.get("stripe-signature");
      if (!signature) {
        return new Response("Webhook error: No signature", { status: 400 });
      }
      let event;
      try {
        const bodyText = await request.text();
        event = stripe.webhooks.constructEvent(bodyText, signature, env.STRIPE_WEBHOOK_SECRET);
      } catch (err) {
        console.error(`Webhook signature verification failed: ${err.message}`);
        return new Response(`Webhook Error: ${err.message}`, { status: 400 });
      }
      if (event.type === "checkout.session.completed") {
        const session = event.data.object;
        const metadata = session.metadata;
        if (metadata && metadata.userId) {
          const { userId, type, durationDays } = metadata;
          const days = parseInt(durationDays || "30", 10);
          if (type === "subscription" || type === "PLAN_PURCHASE") {
            const expiryDate = /* @__PURE__ */ new Date();
            expiryDate.setDate(expiryDate.getDate() + days);
            await env.DB.prepare("UPDATE users SET plan_type = 'premium', premium_start_date = ?, premium_expiry = ? WHERE id = ?").bind((/* @__PURE__ */ new Date()).toISOString(), expiryDate.toISOString(), userId).run();
          }
          await env.DB.prepare("UPDATE transactions SET status = 'approved', updated_at = ? WHERE session_id = ?").bind((/* @__PURE__ */ new Date()).toISOString(), session.id).run();
        }
      }
      return new Response(JSON.stringify({ received: true }), { status: 200, headers: { "Content-Type": "application/json" } });
    }
    if (request.method === "OPTIONS") {
      return withCors(new Response(null, { status: 204 }));
    }
    if (url.pathname === "/api/health") {
      return json({
        ok: true,
        status: "healthy",
        services: {
          d1: "configured",
          jwt: env.JWT_SECRET ? "configured" : "missing_config"
        }
      });
    }
    if (url.pathname.startsWith("/api/ws") || url.pathname.startsWith("/api/realtime")) {
      const id = env.REALTIME.idFromName("global");
      const stub = env.REALTIME.get(id);
      return stub.fetch(request);
    }
    if (url.pathname === "/api/upload" && request.method === "POST") {
      const auth = await requireAuthUserId(request, env);
      if ("error" in auth) return auth.error;
      if (!env.BUCKET) return json({ error: "R2 bucket not configured" }, { status: 500 });
      try {
        const formData = await request.formData();
        const file = formData.get("file");
        if (!file || typeof file === "string") return json({ error: "No file provided" }, { status: 400 });
        const extension = file.name.split(".").pop() || "bin";
        const key = `uploads/${Date.now()}-${crypto.randomUUID()}.${extension}`;
        await env.BUCKET.put(key, await file.arrayBuffer(), {
          httpMetadata: { contentType: file.type }
        });
        return json({ success: true, url: `/api/media/${encodeURIComponent(key)}` }, { status: 201 });
      } catch (err) {
        return json({ error: "Upload failed", details: err.message }, { status: 500 });
      }
    }
    const mediaMatch = url.pathname.match(/^\/api\/media\/(.*)$/);
    if (mediaMatch && request.method === "GET") {
      if (!env.BUCKET) return new Response("R2 bucket not configured", { status: 500 });
      const key = decodeURIComponent(mediaMatch[1]);
      const object = await env.BUCKET.get(key);
      if (object === null) return new Response("Not Found", { status: 404 });
      const headers = new Headers();
      object.writeHttpMetadata(headers);
      headers.set("etag", object.httpEtag);
      headers.set("access-control-allow-origin", "*");
      return new Response(object.body, { headers });
    }
    if (url.pathname === "/api/auth/register" && request.method === "POST") {
      const secret = requireJwtSecret(env);
      if (!secret) return json({ error: "missing_jwt_secret" }, { status: 500 });
      const body = await readJson(request);
      if (!body) return json({ success: false, message: "invalid_body" }, { status: 400 });
      const email = String(body.email || "").trim().toLowerCase();
      const password = String(body.password || "");
      const displayName = String(body.display_name || body.displayName || "").trim();
      if (!email || !password || password.length < 6 || !displayName) {
        return json({ success: false, message: "invalid_params" }, { status: 400 });
      }
      const existingUser = await getUserByEmail(env.DB, email);
      if (existingUser) return json({ success: false, message: "Email already in use" }, { status: 409 });
      const passwordHash = await hashPassword(password);
      const user = await createUser(env.DB, {
        email,
        password_hash: passwordHash,
        display_name: displayName,
        role: "user",
        plan_type: "free",
        status: "active",
        created_at: (/* @__PURE__ */ new Date()).toISOString(),
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      });
      const exp = Math.floor(Date.now() / 1e3) + 60 * 60 * 24 * 30;
      const token = await signJwtHs256({ id: user.id, exp }, secret);
      return json({ success: true, token, user: sanitizeUser(user) });
    }
    if (url.pathname === "/api/auth/guest" && request.method === "POST") {
      const body = await readJson(request);
      if (!body || !body.deviceId) return json({ success: false, message: "invalid_body" }, { status: 400 });
      const deviceId = body.deviceId;
      const email = `guest_${deviceId}@preexam.com`;
      const existing = await getUserByEmail(env.DB, email);
      let user = existing;
      if (existing) {
        try {
          await touchUserLastActive(env.DB, user.id, (/* @__PURE__ */ new Date()).toISOString());
          user.last_active_at = (/* @__PURE__ */ new Date()).toISOString();
        } catch (e) {
        }
      } else {
        const shortId = deviceId.slice(-5) + Math.floor(100 + Math.random() * 900);
        user = await createUser(env.DB, {
          email,
          display_name: `Guest-${shortId}`,
          role: "user",
          plan_type: "free",
          status: "active",
          created_at: (/* @__PURE__ */ new Date()).toISOString(),
          updated_at: (/* @__PURE__ */ new Date()).toISOString(),
          last_active_at: (/* @__PURE__ */ new Date()).toISOString()
        });
      }
      const token = await signJwtHs256({ id: user.id, email: user.email, role: user.role }, env.JWT_SECRET || "default_secret");
      try {
        await createSystemLog(env.DB, {
          action: existing ? "SYS_GUEST_LOGIN" : "SYS_GUEST_CREATE",
          details: {
            type: "auto",
            ip_address: request.headers.get("cf-connecting-ip") || request.headers.get("x-forwarded-for") || "unknown",
            user_agent: request.headers.get("user-agent") || "unknown"
          },
          user_id: user.id,
          created_at: (/* @__PURE__ */ new Date()).toISOString()
        });
      } catch (e) {
      }
      return json({ success: true, token, user: sanitizeUser(user) });
    }
    if (url.pathname === "/api/auth/google" && request.method === "POST") {
      const body = await readJson(request);
      if (!body || !body.token) return json({ success: false, message: "invalid_body" }, { status: 400 });
      const tokenStr = body.token;
      const googleRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${tokenStr}`);
      if (!googleRes.ok) return json({ success: false, message: "Google login failed" }, { status: 400 });
      const ticket = await googleRes.json();
      const { email, name, sub: googleId, picture } = ticket;
      if (!email) return json({ success: false, message: "Email not provided by Google" }, { status: 400 });
      let user = await getUserByEmail(env.DB, email);
      if (user) {
        const updates = { last_active_at: (/* @__PURE__ */ new Date()).toISOString() };
        if (picture && user.avatar !== picture) {
          updates.avatar = picture;
        }
        try {
          user = await updateUser(env.DB, user.id, updates);
          user.last_active_at = updates.last_active_at;
        } catch (e) {
        }
      } else {
        user = await createUser(env.DB, {
          email,
          display_name: name,
          avatar: picture,
          role: "user",
          plan_type: "free",
          status: "active",
          last_active_at: (/* @__PURE__ */ new Date()).toISOString(),
          created_at: (/* @__PURE__ */ new Date()).toISOString(),
          updated_at: (/* @__PURE__ */ new Date()).toISOString()
        });
      }
      const token = await signJwtHs256({ id: user.id, email: user.email, role: user.role }, env.JWT_SECRET || "default_secret");
      try {
        await createSystemLog(env.DB, {
          action: "SYS_GOOGLE_LOGIN",
          details: {
            type: "auto",
            google_id: googleId,
            ip_address: request.headers.get("cf-connecting-ip") || request.headers.get("x-forwarded-for") || "unknown",
            user_agent: request.headers.get("user-agent") || "unknown"
          },
          user_id: user.id,
          created_at: (/* @__PURE__ */ new Date()).toISOString()
        });
      } catch (e) {
      }
      return json({ success: true, token, user: sanitizeUser(user) });
    }
    if (url.pathname === "/api/auth/login" && request.method === "POST") {
      const secret = requireJwtSecret(env);
      if (!secret) return json({ error: "missing_jwt_secret" }, { status: 500 });
      const body = await readJson(request);
      if (!body) return json({ success: false, message: "invalid_body" }, { status: 400 });
      const email = String(body.email || "").trim().toLowerCase();
      const password = String(body.password || "");
      if (!email || !password) return json({ success: false, message: "invalid_params" }, { status: 400 });
      const user = await getUserByEmail(env.DB, email);
      if (!user || !user.password_hash) return json({ success: false, message: "Invalid credentials" }, { status: 401 });
      const ok = await verifyPassword(password, String(user.password_hash));
      if (!ok) return json({ success: false, message: "Invalid credentials" }, { status: 401 });
      try {
        await touchUserLastActive(env.DB, user.id, (/* @__PURE__ */ new Date()).toISOString());
        user.last_active_at = (/* @__PURE__ */ new Date()).toISOString();
      } catch (e) {
      }
      const exp = Math.floor(Date.now() / 1e3) + 60 * 60 * 24 * 30;
      const token = await signJwtHs256({ id: user.id, exp }, secret);
      try {
        await createSystemLog(env.DB, {
          action: "SYS_EMAIL_LOGIN",
          details: {
            type: "auto",
            ip_address: request.headers.get("cf-connecting-ip") || request.headers.get("x-forwarded-for") || "unknown",
            user_agent: request.headers.get("user-agent") || "unknown"
          },
          user_id: user.id,
          created_at: (/* @__PURE__ */ new Date()).toISOString()
        });
      } catch (e) {
      }
      return json({ success: true, token, user: sanitizeUser(user) });
    }
    if (url.pathname === "/api/auth/guest" && request.method === "POST") {
      const secret = requireJwtSecret(env);
      if (!secret) return json({ error: "missing_jwt_secret" }, { status: 500 });
      const body = await readJson(request);
      if (!body) return json({ success: false, message: "invalid_body" }, { status: 400 });
      const deviceId = String(body.deviceId || "").trim();
      if (!deviceId) return json({ success: false, message: "invalid_params" }, { status: 400 });
      const email = `guest_${deviceId}@guest.local`;
      let user = await getUserByEmail(env.DB, email);
      if (!user) {
        const displayName = `Guest-${deviceId.slice(0, 6)}`;
        user = await createUser(env.DB, {
          email,
          password_hash: null,
          display_name: displayName,
          role: "user",
          plan_type: "free",
          status: "active",
          guest_device_id: deviceId,
          created_at: (/* @__PURE__ */ new Date()).toISOString(),
          updated_at: (/* @__PURE__ */ new Date()).toISOString()
        });
      }
      const exp = Math.floor(Date.now() / 1e3) + 60 * 60 * 24 * 30;
      const token = await signJwtHs256({ id: user.id, exp }, secret);
      return json({ success: true, token, user: sanitizeUser(user) });
    }
    if (url.pathname === "/api/auth/me" && request.method === "GET") {
      const secret = requireJwtSecret(env);
      if (!secret) return json({ error: "missing_jwt_secret" }, { status: 500 });
      const userId = await requireUserId(request, secret);
      if (!userId) return json({ success: false, message: "Unauthorized" }, { status: 401 });
      const user = await getUserById(env.DB, userId);
      if (!user) return json({ success: false, message: "Unauthorized" }, { status: 401 });
      return json({ success: true, user: sanitizeUser(user) });
    }
    if (url.pathname === "/api/rooms" && request.method === "GET") {
      const auth = await requireAuthUserId(request, env);
      if ("error" in auth) return auth.error;
      const page = Math.max(1, Number(url.searchParams.get("page") || 1));
      const limit = Math.max(1, Math.min(50, Number(url.searchParams.get("limit") || 20)));
      const recentRooms = await listExamRooms(env.DB, 100);
      const oneDayAgo = oneDayAgoIso();
      const filteredRooms = recentRooms.filter((r) => {
        if (!r.created_at || r.created_at < oneDayAgo) return false;
        return r.status === "waiting" || r.status === "in_progress" || r.status === "finished" && r.updated_at >= oneDayAgo;
      });
      const total = filteredRooms.length;
      const offset = (page - 1) * limit;
      const rooms = filteredRooms.slice(offset, offset + limit);
      if (rooms.length === 0) {
        return json({ success: true, data: [], pagination: { total, page, totalPages: Math.ceil(total / limit) } });
      }
      const roomIds = rooms.map((r) => r.id);
      const participantCounts = /* @__PURE__ */ new Map();
      for (const rId of roomIds) {
        const participants = await listExamRoomParticipants(env.DB, rId);
        participantCounts.set(rId, participants.length);
      }
      const hostIds = Array.from(new Set(rooms.map((r) => r.host_user_id).filter(Boolean)));
      const hosts = /* @__PURE__ */ new Map();
      for (const hid of hostIds) {
        const u = await getUserById(env.DB, hid);
        if (u) {
          hosts.set(hid, u.display_name || u.username || "Unknown");
        }
      }
      const data = rooms.map((r) => ({
        ...r,
        password: void 0,
        participant_count: participantCounts.get(r.id) || 0,
        host_name: r.host_name || hosts.get(r.host_user_id) || "Unknown",
        RoomParticipants: []
      }));
      return json({
        success: true,
        data,
        pagination: { total, page, totalPages: Math.ceil(total / limit) }
      });
    }
    if (url.pathname === "/api/rooms" && request.method === "POST") {
      const auth = await requireAuthUserId(request, env);
      if ("error" in auth) return auth.error;
      const body = await readJson(request);
      if (!body) return json({ success: false, message: "invalid_body" }, { status: 400 });
      const name = String(body.name || "").trim();
      const mode = String(body.mode || "").trim();
      if (!name || !["exam", "tutor", "event"].includes(mode)) {
        return json({ success: false, message: "invalid_params" }, { status: 400 });
      }
      const subject = body.subject ? String(body.subject) : null;
      const category = body.category ? String(body.category) : null;
      const maxParticipants = Math.min(20, Math.max(1, Number(body.max_participants || 20)));
      const questionCount = Math.max(1, Math.min(200, Number(body.question_count || 20)));
      const timeLimit = Math.max(5, Math.min(60, Number(body.time_limit || 60)));
      const password = body.password ? String(body.password) : null;
      const customQuestions = body.custom_questions;
      const code = Math.random().toString(36).substring(2, 8).toUpperCase();
      const settings = JSON.stringify({ time_limit: timeLimit });
      let selectedIds = [];
      let customQuestionsPayload = null;
      if (customQuestions && Array.isArray(customQuestions) && customQuestions.length > 0) {
        customQuestionsPayload = customQuestions.map((q) => ({
          question_text: q.question_text || "",
          choices: q.choices || { A: "", B: "", C: "", D: "" },
          correct_answer: q.correct_answer || "A",
          explanation: q.explanation || "",
          category: "custom",
          subject: "custom",
          is_custom: true
        }));
        selectedIds = [];
      } else {
        try {
          const whereParts = [];
          const params = [];
          if (subject) {
            whereParts.push("subject = ?");
            params.push(subject);
          }
          if (category) {
            whereParts.push("category = ?");
            params.push(category);
          }
          const whereClause = whereParts.length ? `WHERE ${whereParts.join(" AND ")}` : "";
          const { results } = await env.DB.prepare(`SELECT id FROM questions ${whereClause} ORDER BY RANDOM() LIMIT ?`).bind(...params, questionCount).all();
          selectedIds = (results || []).map((q) => String(q.id));
        } catch (e) {
        }
      }
      if (selectedIds.length === 0 && !customQuestionsPayload?.length) {
        return json({ success: false, message: "No questions found." }, { status: 400 });
      }
      const room = await createExamRoom(env.DB, {
        code,
        name,
        mode,
        tutor_submode: body.tutor_submode || "step",
        host_user_id: auth.userId,
        subject,
        category,
        max_participants: maxParticipants,
        question_count: customQuestionsPayload?.length ? customQuestionsPayload.length : selectedIds.length > 0 ? selectedIds.length : questionCount,
        status: "waiting",
        settings,
        password,
        question_ids: selectedIds,
        custom_questions: customQuestionsPayload,
        theme: body.theme || null,
        created_at: (/* @__PURE__ */ new Date()).toISOString(),
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      });
      await upsertExamRoomParticipant(env.DB, room.id, auth.userId, {
        user_id: auth.userId,
        score: 0,
        status: "joined",
        current_question_index: 0,
        joined_at: (/* @__PURE__ */ new Date()).toISOString(),
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      });
      return json({ success: true, data: room }, { status: 201 });
    }
    if (url.pathname === "/api/rooms/join" && request.method === "POST") {
      const auth = await requireAuthUserId(request, env);
      if ("error" in auth) return auth.error;
      const body = await readJson(request);
      if (!body) return json({ success: false, message: "invalid_body" }, { status: 400 });
      const code = String(body.code || "").trim().toUpperCase();
      const password = body.password ? String(body.password) : null;
      if (!code) return json({ success: false, message: "invalid_params" }, { status: 400 });
      const room = await findExamRoomByCode(env.DB, code);
      if (!room) return json({ success: false, message: "Room not found" }, { status: 404 });
      if (room.password) {
        if (!password) return json({ success: false, message: "Password required", requirePassword: true }, { status: 403 });
        if (password !== String(room.password)) return json({ success: false, message: "Invalid password" }, { status: 403 });
      }
      if (String(room.status) !== "waiting") {
        return json({ success: false, message: "Room is already in progress or finished" }, { status: 400 });
      }
      const existingPart = await getExamRoomParticipant(env.DB, room.id, auth.userId);
      if (!existingPart) {
        await upsertExamRoomParticipant(env.DB, room.id, auth.userId, {
          user_id: auth.userId,
          score: 0,
          status: "joined",
          current_question_index: 0,
          joined_at: (/* @__PURE__ */ new Date()).toISOString(),
          updated_at: (/* @__PURE__ */ new Date()).toISOString()
        });
      }
      return json({ success: true, data: { ...room, password: void 0 } });
    }
    const roomIdMatch = url.pathname.match(/^\/api\/rooms\/([a-zA-Z0-9_-]+)$/);
    if (roomIdMatch && request.method === "GET") {
      const auth = await requireAuthUserId(request, env);
      if ("error" in auth) return auth.error;
      const roomId = roomIdMatch[1];
      const room = await getExamRoomById(env.DB, roomId);
      if (!room) return json({ success: false, message: "Room not found" }, { status: 404 });
      const participants = await listExamRoomParticipants(env.DB, roomId);
      const userIds = participants.map((p) => p.user_id);
      const uniqueUserIds = Array.from(new Set(userIds));
      const usersMap = /* @__PURE__ */ new Map();
      const missingUserIds = [];
      for (const uid of uniqueUserIds) {
        const cachedU = getCache(`u_${uid}`);
        if (cachedU) usersMap.set(String(uid), cachedU);
        else missingUserIds.push(String(uid));
      }
      for (let i = 0; i < missingUserIds.length; i += 30) {
        const chunk = missingUserIds.slice(i, i + 30);
        const userPromises = chunk.map((id) => getUserById(env.DB, String(id)));
        const users = await Promise.all(userPromises);
        for (const u of users) {
          if (u && u.id) {
            usersMap.set(String(u.id), u);
            setCache(`u_${u.id}`, u, 5 * 60 * 1e3);
          }
        }
      }
      const populatedParticipants = participants.map((p) => ({
        ...p,
        User: usersMap.get(String(p.user_id)) ? sanitizeUser(usersMap.get(String(p.user_id))) : { display_name: "Unknown", avatar: null }
      }));
      const questionIds = Array.isArray(room.question_ids) ? room.question_ids : [];
      const questionsMap = /* @__PURE__ */ new Map();
      const missingQIds = [];
      for (const qid of questionIds) {
        const cachedQ = getCache(`q_${qid}`);
        if (cachedQ) questionsMap.set(String(qid), normalizeQuestion(cachedQ));
        else missingQIds.push(qid);
      }
      for (let i = 0; i < missingQIds.length; i += 30) {
        const chunk = missingQIds.slice(i, i + 30);
        const qs = await getQuestionsByIds(env.DB, chunk);
        for (const q of qs) {
          if (q && q.id) {
            questionsMap.set(String(q.id), normalizeQuestion(q));
            setCache(`q_${q.id}`, q, 24 * 60 * 60 * 1e3);
          }
        }
      }
      const questions = room.custom_questions?.length ? room.custom_questions.map((q, idx) => normalizeQuestion({ ...q, id: q.id || `custom_${idx}` })) : questionIds.map((id) => questionsMap.get(String(id))).filter(Boolean);
      return json({
        success: true,
        data: {
          ...room,
          password: void 0,
          Host: usersMap.get(String(room.host_user_id)) ? sanitizeUser(usersMap.get(String(room.host_user_id))) : { id: room.host_user_id, display_name: null },
          RoomParticipants: populatedParticipants,
          questions
        }
      });
    }
    const roomStartMatch = url.pathname.match(/^\/api\/rooms\/([a-zA-Z0-9_-]+)\/start$/);
    if (roomStartMatch && request.method === "POST") {
      const auth = await requireAuthUserId(request, env);
      if ("error" in auth) return auth.error;
      const roomId = roomStartMatch[1];
      const room = await getExamRoomById(env.DB, roomId);
      if (!room) return json({ success: false, message: "Room not found" }, { status: 404 });
      if (String(room.host_user_id) !== auth.userId) {
        return json({ success: false, message: "Not authorized to start this room" }, { status: 403 });
      }
      const settings = parseRoomSettings(room);
      const updated = await updateExamRoom(env.DB, roomId, {
        status: "in_progress",
        settings: {
          ...settings,
          tutor_state: {
            current_question_index: 0,
            is_answer_revealed: false,
            answer_counts: createEmptyAnswerCounts()
          }
        },
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      });
      return json({ success: true, data: updated });
    }
    const roomFinishMatch = url.pathname.match(/^\/api\/rooms\/([a-zA-Z0-9_-]+)\/finish$/);
    if (roomFinishMatch && request.method === "POST") {
      const auth = await requireAuthUserId(request, env);
      if ("error" in auth) return auth.error;
      const roomId = roomFinishMatch[1];
      const room = await getExamRoomById(env.DB, roomId);
      if (!room) return json({ success: false, message: "Room not found" }, { status: 404 });
      const body = await readJson(request);
      if (!body) return json({ success: false, message: "invalid_body" }, { status: 400 });
      const score = Number(body.score || 0);
      const timeTaken = Number(body.timeTaken || 0);
      const answers = body.answers && typeof body.answers === "object" ? body.answers : {};
      const totalScore = Array.isArray(room.question_ids) && room.question_ids.length ? room.question_ids.length : Array.isArray(room.custom_questions) ? room.custom_questions.length : Number(room.question_count || 0);
      await upsertExamRoomParticipant(env.DB, roomId, auth.userId, {
        user_id: auth.userId,
        score,
        time_taken: timeTaken,
        status: "finished",
        current_question_index: totalScore,
        answers,
        completed_at: (/* @__PURE__ */ new Date()).toISOString(),
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      });
      await createExamResult(env.DB, {
        user_id: auth.userId,
        classroom_id: roomId,
        score,
        total_score: totalScore,
        mode: room.mode || "exam",
        questions: answers,
        time_taken: timeTaken,
        taken_at: (/* @__PURE__ */ new Date()).toISOString(),
        created_at: (/* @__PURE__ */ new Date()).toISOString(),
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      });
      const participants = await listExamRoomParticipants(env.DB, roomId);
      const unfinished = participants.some((participant) => String(participant.status) !== "finished");
      const nextStatus = unfinished ? "in_progress" : "finished";
      const updated = await updateExamRoom(env.DB, roomId, {
        status: nextStatus,
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      });
      return json({ success: true, data: updated });
    }
    const roomScoreMatch = url.pathname.match(/^\/api\/rooms\/([a-zA-Z0-9_-]+)\/score$/);
    if (roomScoreMatch && request.method === "POST") {
      const auth = await requireAuthUserId(request, env);
      if ("error" in auth) return auth.error;
      const roomId = roomScoreMatch[1];
      const room = await getExamRoomById(env.DB, roomId);
      if (!room) return json({ success: false, message: "Room not found" }, { status: 404 });
      const body = await readJson(request);
      if (!body) return json({ success: false, message: "invalid_body" }, { status: 400 });
      await upsertExamRoomParticipant(env.DB, roomId, auth.userId, {
        user_id: auth.userId,
        score: Number(body.score || 0),
        status: body.status || void 0,
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      });
      return json({ success: true });
    }
    const roomProgressMatch = url.pathname.match(/^\/api\/rooms\/([a-zA-Z0-9_-]+)\/progress$/);
    if (roomProgressMatch && request.method === "POST") {
      const auth = await requireAuthUserId(request, env);
      if ("error" in auth) return auth.error;
      const roomId = roomProgressMatch[1];
      const room = await getExamRoomById(env.DB, roomId);
      if (!room) return json({ success: false, message: "Room not found" }, { status: 404 });
      const body = await readJson(request);
      if (!body) return json({ success: false, message: "invalid_body" }, { status: 400 });
      await upsertExamRoomParticipant(env.DB, roomId, auth.userId, {
        user_id: auth.userId,
        current_question_index: Number(body.questionIndex || 0),
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      });
      return json({ success: true });
    }
    const roomNicknameMatch = url.pathname.match(/^\/api\/rooms\/([a-zA-Z0-9_-]+)\/nickname$/);
    if (roomNicknameMatch && request.method === "POST") {
      const auth = await requireAuthUserId(request, env);
      if ("error" in auth) return auth.error;
      const roomId = roomNicknameMatch[1];
      const room = await getExamRoomById(env.DB, roomId);
      if (!room) return json({ success: false, message: "Room not found" }, { status: 404 });
      const body = await readJson(request);
      const nickname = String(body?.nickname || "").trim();
      if (!nickname) return json({ success: false, message: "invalid_nickname" }, { status: 400 });
      await upsertExamRoomParticipant(env.DB, roomId, auth.userId, {
        user_id: auth.userId,
        nickname,
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      });
      return json({ success: true });
    }
    const roomChatMatch = url.pathname.match(/^\/api\/rooms\/([a-zA-Z0-9_-]+)\/chat$/);
    if (roomChatMatch && request.method === "POST") {
      const auth = await requireAuthUserId(request, env);
      if ("error" in auth) return auth.error;
      const roomId = roomChatMatch[1];
      const room = await getExamRoomById(env.DB, roomId);
      if (!room) return json({ success: false, message: "Room not found" }, { status: 404 });
      const body = await readJson(request);
      const message = String(body?.message || "").trim();
      const displayName = String(body?.displayName || "").trim();
      if (!message) return json({ success: false, message: "invalid_message" }, { status: 400 });
      const settings = parseRoomSettings(room);
      const nextMessages = Array.isArray(settings.chat_messages) ? [...settings.chat_messages] : [];
      nextMessages.push({
        id: crypto.randomUUID(),
        userId: auth.userId,
        displayName: displayName || "\u0E1C\u0E39\u0E49\u0E43\u0E0A\u0E49",
        message,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      });
      await updateExamRoom(env.DB, roomId, {
        settings: {
          ...settings,
          chat_messages: nextMessages.slice(-50)
        },
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      });
      return json({ success: true });
    }
    const roomTutorNavigateMatch = url.pathname.match(/^\/api\/rooms\/([a-zA-Z0-9_-]+)\/tutor\/navigate$/);
    if (roomTutorNavigateMatch && request.method === "POST") {
      const auth = await requireAuthUserId(request, env);
      if ("error" in auth) return auth.error;
      const roomId = roomTutorNavigateMatch[1];
      const room = await getExamRoomById(env.DB, roomId);
      if (!room) return json({ success: false, message: "Room not found" }, { status: 404 });
      if (String(room.host_user_id) !== auth.userId) {
        return json({ success: false, message: "Not authorized" }, { status: 403 });
      }
      const body = await readJson(request);
      const settings = parseRoomSettings(room);
      const tutorState = createTutorState(settings);
      tutorState.current_question_index = Number(body?.questionIndex || 0);
      tutorState.is_answer_revealed = false;
      tutorState.answer_counts = createEmptyAnswerCounts();
      await updateExamRoom(env.DB, roomId, {
        settings: {
          ...settings,
          tutor_state: tutorState
        },
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      });
      return json({ success: true });
    }
    const roomTutorRevealMatch = url.pathname.match(/^\/api\/rooms\/([a-zA-Z0-9_-]+)\/tutor\/reveal$/);
    if (roomTutorRevealMatch && request.method === "POST") {
      const auth = await requireAuthUserId(request, env);
      if ("error" in auth) return auth.error;
      const roomId = roomTutorRevealMatch[1];
      const room = await getExamRoomById(env.DB, roomId);
      if (!room) return json({ success: false, message: "Room not found" }, { status: 404 });
      if (String(room.host_user_id) !== auth.userId) {
        return json({ success: false, message: "Not authorized" }, { status: 403 });
      }
      const settings = parseRoomSettings(room);
      const tutorState = createTutorState(settings);
      tutorState.is_answer_revealed = true;
      await updateExamRoom(env.DB, roomId, {
        settings: {
          ...settings,
          tutor_state: tutorState
        },
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      });
      return json({ success: true });
    }
    const roomTutorAnswerMatch = url.pathname.match(/^\/api\/rooms\/([a-zA-Z0-9_-]+)\/tutor\/answer$/);
    if (roomTutorAnswerMatch && request.method === "POST") {
      const auth = await requireAuthUserId(request, env);
      if ("error" in auth) return auth.error;
      const roomId = roomTutorAnswerMatch[1];
      const room = await getExamRoomById(env.DB, roomId);
      if (!room) return json({ success: false, message: "Room not found" }, { status: 404 });
      const body = await readJson(request);
      const choice = String(body?.choice || "").trim().toUpperCase();
      if (!["A", "B", "C", "D"].includes(choice)) {
        return json({ success: false, message: "invalid_choice" }, { status: 400 });
      }
      const settings = parseRoomSettings(room);
      const tutorState = createTutorState(settings);
      tutorState.answer_counts = {
        ...createEmptyAnswerCounts(),
        ...tutorState.answer_counts,
        [choice]: Number(tutorState.answer_counts?.[choice] || 0) + 1
      };
      await updateExamRoom(env.DB, roomId, {
        settings: {
          ...settings,
          tutor_state: tutorState
        },
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      });
      return json({ success: true });
    }
    const roomCloseMatch = url.pathname.match(/^\/api\/rooms\/([a-zA-Z0-9_-]+)\/close$/);
    if (roomCloseMatch && request.method === "POST") {
      const auth = await requireAuthUserId(request, env);
      if ("error" in auth) return auth.error;
      const roomId = roomCloseMatch[1];
      const room = await getExamRoomById(env.DB, roomId);
      if (!room) return json({ success: false, message: "Room not found" }, { status: 404 });
      if (String(room.host_user_id) !== auth.userId) {
        return json({ success: false, message: "Not authorized" }, { status: 403 });
      }
      const updated = await updateExamRoom(env.DB, roomId, {
        status: "finished",
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      });
      return json({ success: true, data: updated });
    }
    const roomResetMatch = url.pathname.match(/^\/api\/rooms\/([a-zA-Z0-9_-]+)\/reset$/);
    if (roomResetMatch && request.method === "POST") {
      const auth = await requireAuthUserId(request, env);
      if ("error" in auth) return auth.error;
      const roomId = roomResetMatch[1];
      const room = await getExamRoomById(env.DB, roomId);
      if (!room) return json({ success: false, message: "Room not found" }, { status: 404 });
      if (String(room.host_user_id) !== auth.userId) {
        return json({ success: false, message: "Not authorized" }, { status: 403 });
      }
      const settings = parseRoomSettings(room);
      await resetExamRoomParticipants(env.DB, roomId);
      const updated = await updateExamRoom(env.DB, roomId, {
        status: "waiting",
        settings: {
          ...settings,
          tutor_state: {
            current_question_index: 0,
            is_answer_revealed: false,
            answer_counts: createEmptyAnswerCounts()
          }
        },
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      });
      return json({ success: true, data: updated });
    }
    if (roomIdMatch && request.method === "DELETE") {
      const auth = await requireAuthUserId(request, env);
      if ("error" in auth) return auth.error;
      const roomId = roomIdMatch[1];
      const room = await getExamRoomById(env.DB, roomId);
      if (!room) return json({ success: true, message: "Room already deleted or not found" });
      if (String(room.host_user_id) !== auth.userId) {
        return json({ success: false, message: "Not authorized to delete this room" }, { status: 403 });
      }
      await deleteExamRoom(env.DB, roomId);
      return json({ success: true, message: "Room deleted successfully" });
    }
    if (url.pathname.startsWith("/api/")) {
      try {
        if (url.pathname.startsWith("/api/admin/")) {
          const admin = await requireAdmin(request, env);
          if ("error" in admin) return admin.error;
        }
        if (url.pathname === "/api/public/log" && request.method === "POST") {
          const body = await readJson(request);
          if (!body || !body.action) return json({ success: false, message: "Action required" }, { status: 400 });
          const action = String(body.action);
          const details = body.details || {};
          let userId = null;
          const authHeader = request.headers.get("authorization") || "";
          const secret = requireJwtSecret(env) || "default_secret";
          try {
            const id = await requireUserId(request, secret);
            if (id) userId = id;
          } catch (e) {
          }
          let created = null;
          try {
            created = await createSystemLog(env.DB, {
              action,
              details: {
                ...typeof details === "object" && details ? details : { value: details },
                ip_address: request.headers.get("cf-connecting-ip") || request.headers.get("x-forwarded-for") || "unknown",
                user_agent: request.headers.get("user-agent") || "unknown"
              },
              user_id: userId,
              created_at: (/* @__PURE__ */ new Date()).toISOString()
            });
          } catch (e) {
            const msg = e?.message ? String(e.message) : "firestore_write_failed";
            return json(
              {
                success: false,
                stored: false,
                error: msg.slice(0, 200),
                auth_present: Boolean(authHeader),
                user_id: userId
              },
              { status: 500 }
            );
          }
          return json({
            success: true,
            stored: true,
            doc_id: created?.id || null,
            auth_present: Boolean(authHeader),
            user_id: userId
          });
        }
        if (url.pathname === "/api/questions/subjects" && request.method === "GET") {
          const cacheKey = "qs_subjects";
          let cached = getCache(cacheKey);
          if (!cached) {
            const qs = await listAllQuestions(env.DB);
            const subjects = /* @__PURE__ */ new Set();
            for (const q of qs) if (q.subject) subjects.add(q.subject);
            cached = Array.from(subjects).sort();
            setCache(cacheKey, cached);
          }
          return json({ success: true, data: cached });
        }
        if (url.pathname === "/api/questions/years" && request.method === "GET") {
          const cacheKey = "qs_years";
          let cached = getCache(cacheKey);
          if (!cached) {
            const qs = await listAllQuestions(env.DB);
            const years = /* @__PURE__ */ new Set();
            for (const q of qs) if (q.exam_year) years.add(String(q.exam_year));
            cached = Array.from(years).sort((a, b) => b.localeCompare(a));
            setCache(cacheKey, cached);
          }
          return json({ success: true, data: cached });
        }
        if (url.pathname === "/api/questions/sets" && request.method === "GET") {
          const cacheKey = "qs_sets";
          let cached = getCache(cacheKey);
          if (!cached) {
            const qs = await listAllQuestions(env.DB);
            const sets = /* @__PURE__ */ new Set();
            for (const q of qs) if (q.exam_set) sets.add(q.exam_set);
            cached = Array.from(sets).sort();
            setCache(cacheKey, cached);
          }
          return json({ success: true, data: cached });
        }
        if (url.pathname === "/api/questions/categories" && request.method === "GET") {
          const subject = url.searchParams.get("subject");
          const cacheKey = `qs_cats_${subject || "all"}`;
          let cached = getCache(cacheKey);
          if (!cached) {
            let qs = await listAllQuestions(env.DB);
            if (subject && subject !== "undefined" && subject !== "null") qs = qs.filter((q) => q.subject === subject);
            const allTags = /* @__PURE__ */ new Set();
            for (const q of qs) {
              if (q.category) {
                q.category.split(",").forEach((tag) => {
                  const t = tag.trim();
                  if (t) allTags.add(t);
                });
              }
              if (q.catalogs && Array.isArray(q.catalogs)) {
                q.catalogs.forEach((tag) => {
                  if (tag) allTags.add(tag.trim());
                });
              }
            }
            cached = Array.from(allTags).sort();
            setCache(cacheKey, cached);
          }
          return json({ success: true, data: cached });
        }
        const qIdMatch = url.pathname.match(/^\/api\/questions\/([a-zA-Z0-9_-]+)$/);
        if (qIdMatch && request.method === "GET") {
          const q = await getQuestionById(env.DB, qIdMatch[1]);
          if (!q) return json({ success: false, message: "Question not found" }, { status: 404 });
          return json({ success: true, data: normalizeQuestion(q) });
        }
        if (url.pathname === "/api/questions" && request.method === "GET") {
          const category = url.searchParams.get("category");
          const subject = url.searchParams.get("subject");
          const exam_year = url.searchParams.get("exam_year");
          const exam_set = url.searchParams.get("exam_set");
          const limitStr = url.searchParams.get("limit") || "50";
          const pageStr = url.searchParams.get("page") || "1";
          const orderBy = url.searchParams.get("orderBy");
          const search = url.searchParams.get("search");
          const orderDir = url.searchParams.get("orderDir") || "desc";
          const limit = parseInt(limitStr, 10);
          const page = parseInt(pageStr, 10);
          const offset = (page - 1) * limit;
          const cacheKey = `qs_list_${JSON.stringify({ subject, exam_year, exam_set })}`;
          let allQs = getCache(cacheKey);
          if (!allQs) {
            allQs = await listAllQuestions(env.DB);
            if (subject && subject !== "undefined" && subject !== "null") allQs = allQs.filter((q) => q.subject === subject);
            if (exam_year && exam_year !== "undefined" && exam_year !== "null") allQs = allQs.filter((q) => String(q.exam_year) === String(exam_year));
            if (exam_set && exam_set !== "undefined" && exam_set !== "null") allQs = allQs.filter((q) => String(q.exam_set) === String(exam_set));
            setCache(cacheKey, allQs, 60 * 1e3);
          }
          let rows = [];
          for (const data of allQs) {
            let match = true;
            if (search) {
              const searchStr = search.toLowerCase();
              const qText = (data.question_text || "").toLowerCase();
              if (!qText.includes(searchStr)) match = false;
            }
            if (match && category && category !== "undefined" && category !== "null") {
              const catStr = category.toLowerCase();
              const qCat = (data.category || "").toLowerCase();
              const qCatalogs = Array.isArray(data.catalogs) ? data.catalogs.join(",").toLowerCase() : (data.catalogs || "").toLowerCase();
              if (!qCat.includes(catStr) && !qCatalogs.includes(catStr)) match = false;
            }
            if (match) rows.push(normalizeQuestion(data));
          }
          if (orderBy === "random") {
            rows.sort(() => Math.random() - 0.5);
          } else {
            rows.sort((a, b) => {
              const numA = Number(a.id);
              const numB = Number(b.id);
              const isNumA = !isNaN(numA);
              const isNumB = !isNaN(numB);
              if (isNumA && isNumB) {
                return orderDir === "desc" ? numB - numA : numA - numB;
              }
              if (isNumA && !isNumB) return orderDir === "desc" ? 1 : -1;
              if (!isNumA && isNumB) return orderDir === "desc" ? -1 : 1;
              const strCompare = String(a.id).localeCompare(String(b.id));
              return orderDir === "desc" ? -strCompare : strCompare;
            });
          }
          const count = rows.length;
          rows = rows.slice(offset, offset + limit);
          return json({
            success: true,
            data: {
              rows,
              total: count,
              page,
              totalPages: Math.ceil(count / limit) || 1
            }
          });
        }
        if (url.pathname === "/api/questions" && request.method === "POST") {
          const auth = await requireAuthUserId(request, env);
          if ("error" in auth) return auth.error;
          const userDoc = await getUserById(env.DB, auth.userId);
          if (!userDoc || userDoc.role !== "admin") return json({ success: false, message: "Forbidden: Admin access required" }, { status: 403 });
          const body = await readJson(request);
          if (!body) return json({ success: false, message: "invalid_body" }, { status: 400 });
          const { catalogs, category, skill, exam_year, exam_set, ...rest } = body;
          let finalCatalogs = catalogs || [];
          if (category && !finalCatalogs.includes(category)) {
            finalCatalogs.push(category);
          }
          if (typeof finalCatalogs === "string") {
            try {
              finalCatalogs = JSON.parse(finalCatalogs);
            } catch (e) {
              finalCatalogs = [finalCatalogs];
            }
          }
          let maxId = 0;
          try {
            const allDocs = await listAllQuestions(env.DB);
            for (const doc of allDocs) {
              const num = Number(doc.id);
              if (!isNaN(num) && num > maxId) {
                maxId = num;
              }
            }
          } catch (e) {
            console.error("Failed to fetch max ID", e);
          }
          const newDocRef = (maxId + 1).toString();
          const newQuestion = {
            id: newDocRef,
            ...rest,
            category: category || (finalCatalogs.length > 0 ? finalCatalogs[0] : "General"),
            catalogs: finalCatalogs,
            skill: skill || null,
            exam_year: exam_year || null,
            exam_set: exam_set || null,
            created_at: (/* @__PURE__ */ new Date()).toISOString(),
            updated_at: (/* @__PURE__ */ new Date()).toISOString()
          };
          const createdQuestion = await createQuestion(env.DB, newQuestion);
          return json({ success: true, data: createdQuestion }, { status: 201 });
        }
        if (qIdMatch && request.method === "PUT") {
          const auth = await requireAuthUserId(request, env);
          if ("error" in auth) return auth.error;
          const userDoc = await getUserById(env.DB, auth.userId);
          if (!userDoc || userDoc.role !== "admin") return json({ success: false, message: "Forbidden: Admin access required" }, { status: 403 });
          const body = await readJson(request);
          if (!body) return json({ success: false, message: "invalid_body" }, { status: 400 });
          const doc = await getQuestionById(env.DB, qIdMatch[1]);
          if (!doc) return json({ success: false, message: "Question not found" }, { status: 404 });
          const updateData = { ...body, updated_at: (/* @__PURE__ */ new Date()).toISOString() };
          const updated = await updateQuestion(env.DB, qIdMatch[1], updateData);
          return json({ success: true, data: normalizeQuestion(updated) });
        }
        if (qIdMatch && request.method === "DELETE") {
          const auth = await requireAuthUserId(request, env);
          if ("error" in auth) return auth.error;
          const userDoc = await getUserById(env.DB, auth.userId);
          if (!userDoc || userDoc.role !== "admin") return json({ success: false, message: "Forbidden: Admin access required" }, { status: 403 });
          const doc = await getQuestionById(env.DB, qIdMatch[1]);
          if (!doc) return json({ success: false, message: "Question not found" }, { status: 404 });
          await deleteQuestion(env.DB, qIdMatch[1]);
          return json({ success: true, message: "Question deleted" });
        }
        const adminUqIdMatch = url.pathname.match(/^\/api\/admin\/user-questions\/([^\/]+)$/);
        if (url.pathname === "/api/admin/user-questions" && request.method === "GET") {
          const auth = await requireAuthUserId(request, env);
          if ("error" in auth) return auth.error;
          const userDoc = await getUserById(env.DB, auth.userId);
          if (!userDoc || userDoc.role !== "admin") return json({ success: false, message: "Forbidden: Admin access required" }, { status: 403 });
          const userQs = await adminListUserQuestions(env.DB, 500);
          return json({ success: true, data: userQs });
        }
        if (adminUqIdMatch && request.method === "PUT") {
          const auth = await requireAuthUserId(request, env);
          if ("error" in auth) return auth.error;
          const userDoc = await getUserById(env.DB, auth.userId);
          if (!userDoc || userDoc.role !== "admin") return json({ success: false, message: "Forbidden: Admin access required" }, { status: 403 });
          const body = await readJson(request);
          if (!body) return json({ success: false, message: "invalid_body" }, { status: 400 });
          const updated = await adminUpdateUserQuestion(env.DB, adminUqIdMatch[1], body);
          return json({ success: true, data: updated });
        }
        if (adminUqIdMatch && request.method === "DELETE") {
          const auth = await requireAuthUserId(request, env);
          if ("error" in auth) return auth.error;
          const userDoc = await getUserById(env.DB, auth.userId);
          if (!userDoc || userDoc.role !== "admin") return json({ success: false, message: "Forbidden: Admin access required" }, { status: 403 });
          await adminDeleteUserQuestion(env.DB, adminUqIdMatch[1]);
          return json({ success: true, message: "Deleted" });
        }
        const uqIdMatch = url.pathname.match(/^\/api\/user\/questions\/([^\/]+)$/);
        if (url.pathname === "/api/user/questions" && request.method === "GET") {
          const auth = await requireAuthUserId(request, env);
          if ("error" in auth) return auth.error;
          const userQs = await listUserQuestions(env.DB, auth.userId);
          return json({ success: true, data: userQs.map(normalizeQuestion) });
        }
        if (url.pathname === "/api/user/questions/bulk" && request.method === "POST") {
          const auth = await requireAuthUserId(request, env);
          if ("error" in auth) return auth.error;
          const body = await readJson(request);
          if (!body || !Array.isArray(body.questions)) return json({ success: false, message: "Invalid payload" }, { status: 400 });
          const questions = body.questions;
          const created = [];
          for (const q of questions) {
            const newQ = await createUserQuestion(env.DB, { ...q, user_id: auth.userId, host_user_id: auth.userId, is_custom: 1 });
            created.push(normalizeQuestion(newQ));
          }
          return json({ success: true, data: created });
        }
        if (url.pathname === "/api/user/questions" && request.method === "POST") {
          const auth = await requireAuthUserId(request, env);
          if ("error" in auth) return auth.error;
          const body = await readJson(request);
          if (!body) return json({ success: false, message: "Invalid payload" }, { status: 400 });
          const newQ = await createUserQuestion(env.DB, { ...body, user_id: auth.userId, host_user_id: auth.userId, is_custom: 1 });
          return json({ success: true, data: normalizeQuestion(newQ) });
        }
        if (uqIdMatch && request.method === "GET") {
          const auth = await requireAuthUserId(request, env);
          if ("error" in auth) return auth.error;
          const doc = await getUserQuestionById(env.DB, uqIdMatch[1], auth.userId);
          if (!doc) return json({ success: false, message: "Not found" }, { status: 404 });
          return json({ success: true, data: normalizeQuestion(doc) });
        }
        if (uqIdMatch && request.method === "PUT") {
          const auth = await requireAuthUserId(request, env);
          if ("error" in auth) return auth.error;
          const body = await readJson(request);
          if (!body) return json({ success: false, message: "invalid_body" }, { status: 400 });
          const updated = await updateUserQuestion(env.DB, uqIdMatch[1], auth.userId, body);
          return json({ success: true, data: normalizeQuestion(updated) });
        }
        if (uqIdMatch && request.method === "DELETE") {
          const auth = await requireAuthUserId(request, env);
          if ("error" in auth) return auth.error;
          const doc = await getUserQuestionById(env.DB, uqIdMatch[1], auth.userId);
          if (!doc) return json({ success: false, message: "Not found" }, { status: 404 });
          await deleteUserQuestion(env.DB, uqIdMatch[1], auth.userId);
          return json({ success: true, message: "Deleted" });
        }
        if (url.pathname === "/api/exams/submit" && request.method === "POST") {
          const auth = await requireAuthUserId(request, env);
          if ("error" in auth) return auth.error;
          const body = await readJson(request);
          if (!body) return json({ success: false, message: "invalid_body" }, { status: 400 });
          const { answers, mode, classroom_id, total_time } = body;
          if (!answers || typeof answers !== "object") return json({ success: false, message: "invalid_params" }, { status: 400 });
          const questionIds = Object.keys(answers);
          if (questionIds.length === 0) return json({ success: false, message: "No answers provided" }, { status: 400 });
          const questionsMap = /* @__PURE__ */ new Map();
          const missingIds = [];
          for (const id of questionIds) {
            const cachedQ = getCache(`q_${id}`);
            if (cachedQ) questionsMap.set(String(id), cachedQ);
            else missingIds.push(String(id));
          }
          for (let i = 0; i < missingIds.length; i += 30) {
            const chunk = missingIds.slice(i, i + 30);
            const qs = await getQuestionsByIds(env.DB, chunk);
            for (const q of qs) {
              if (q && q.id) {
                questionsMap.set(String(q.id), q);
                setCache(`q_${q.id}`, q, 24 * 60 * 60 * 1e3);
              }
            }
          }
          let score = 0;
          let total_score = 0;
          const subject_scores = {};
          const skill_scores = {};
          const questionsDetail = [];
          for (const qId of questionIds) {
            const rawQ = questionsMap.get(String(qId));
            if (!rawQ) continue;
            const q = normalizeQuestion(rawQ);
            total_score++;
            const userAnswer = answers[qId];
            const correctNormalized = q.correct_answer ? String(q.correct_answer).trim().toLowerCase() : "";
            const userNormalized = userAnswer ? String(userAnswer).trim().toLowerCase() : "";
            const isCorrect = userNormalized === correctNormalized;
            if (isCorrect) score++;
            if (q.subject) {
              if (!subject_scores[q.subject]) subject_scores[q.subject] = { score: 0, total: 0 };
              subject_scores[q.subject].total++;
              if (isCorrect) subject_scores[q.subject].score++;
            }
            if (q.skill) {
              if (!skill_scores[q.skill]) skill_scores[q.skill] = { score: 0, total: 0 };
              skill_scores[q.skill].total++;
              if (isCorrect) skill_scores[q.skill].score++;
            }
            questionsDetail.push({
              question_id: q.id,
              question_text: q.question_text,
              user_answer: userAnswer,
              correct_answer: q.correct_answer,
              is_correct: isCorrect,
              explanation: q.explanation,
              choice_a: q.choice_a,
              choice_b: q.choice_b,
              choice_c: q.choice_c,
              choice_d: q.choice_d,
              category: q.category,
              subject: q.subject,
              skill: q.skill
            });
          }
          const examResult = await createExamResult(env.DB, {
            user_id: auth.userId,
            classroom_id: classroom_id || null,
            score,
            total_score,
            mode: mode || "solo",
            subject_scores,
            skill_scores,
            questions: questionsDetail,
            time_taken: total_time || 0,
            taken_at: (/* @__PURE__ */ new Date()).toISOString()
          });
          try {
            const activeSeason = await getActiveSeason(env.DB);
            if (activeSeason) {
              await upsertRankingScore(env.DB, activeSeason.id, auth.userId, score);
            }
          } catch (e) {
            console.error("Failed to update ranking:", e);
          }
          const xpGained = total_score * 10 + 50;
          try {
            const userDoc = await getUserById(env.DB, auth.userId);
            if (userDoc) {
              const currentXp = (Number(userDoc.xp) || 0) + xpGained;
              const currentLevel = userDoc.level || 1;
              const newLevel = Math.floor((1 + Math.sqrt(1 + 4 * (currentXp / 1e3))) / 2);
              const updates = { xp: currentXp };
              if (newLevel > currentLevel) {
                updates.level = newLevel;
              }
              await updateUser(env.DB, auth.userId, updates);
              examResult.xpGained = xpGained;
              examResult.newTotalXp = currentXp;
              examResult.levelUp = newLevel > currentLevel ? newLevel : null;
            }
          } catch (e) {
            console.error("Failed to update user XP:", e);
          }
          return json({ success: true, data: examResult }, { status: 201 });
        }
        if (url.pathname === "/api/rankings/me" && request.method === "GET") {
          const auth = await requireAuthUserId(request, env);
          if ("error" in auth) return auth.error;
          const activeSeason = await getActiveSeason(env.DB);
          if (!activeSeason) return json({ success: true, data: { total_score: 0, exams_taken: 0 } });
          const rankingId = `${activeSeason.id}_${auth.userId}`;
          const ranking = await getRankingById(env.DB, rankingId);
          return json({ success: true, data: ranking || { total_score: 0, exams_taken: 0 } });
        }
        if (url.pathname === "/api/rankings" && request.method === "GET") {
          const activeSeason = await getActiveSeason(env.DB);
          if (!activeSeason) return json({ success: true, data: [] });
          const activeSeasonId = activeSeason.id;
          const cacheKey = `rankings_${activeSeasonId}`;
          let rankings = getCache(cacheKey);
          if (!rankings) {
            rankings = await listRankingsBySeason(env.DB, activeSeasonId, 50);
            for (const r of rankings) {
              const u = await getUserById(env.DB, String(r.user_id));
              if (u) {
                r.user_name = u.display_name;
                r.user_avatar = u.avatar;
              }
            }
            setCache(cacheKey, rankings, 5 * 60 * 1e3);
          }
          return json({ success: true, data: rankings });
        }
        if (url.pathname === "/api/exams/history" && request.method === "GET") {
          const auth = await requireAuthUserId(request, env);
          if ("error" in auth) return auth.error;
          try {
            const results = await listExamResultsByUser(env.DB, auth.userId);
            return json({ success: true, data: results });
          } catch (e) {
            return json({ success: false, data: [] });
          }
        }
        if (url.pathname === "/api/reports" && request.method === "POST") {
          try {
            const body = await readJson(request);
            const auth = await requireAuthUserId(request, env);
            const userId = "error" in auth ? "anonymous" : auth.userId;
            const ticket_id = Math.floor(Math.random() * 1e6).toString().padStart(6, "0");
            const ticketData = {
              id: ticket_id,
              ticket_id,
              subject: `\u0E41\u0E08\u0E49\u0E07\u0E1B\u0E31\u0E0D\u0E2B\u0E32\u0E02\u0E49\u0E2D\u0E2A\u0E2D\u0E1A: ${body?.question_id}`,
              description: body?.reason || "No reason provided",
              category: "content",
              status: "open",
              user_id: userId,
              created_at: (/* @__PURE__ */ new Date()).toISOString(),
              updated_at: (/* @__PURE__ */ new Date()).toISOString()
            };
            await createTicket(env.DB, ticketData);
            return json({ success: true, message: "Report submitted successfully" });
          } catch (e) {
            return json({ success: false, message: "Failed to submit report" }, { status: 500 });
          }
        }
        const bookmarksMatch = url.pathname.match(/^\/api\/bookmarks(?:\/([a-zA-Z0-9_-]+))?$/);
        if (bookmarksMatch) {
          const auth = await requireAuthUserId(request, env);
          if ("error" in auth) return auth.error;
          if (request.method === "GET") {
            const bookmarks = await listBookmarksByUser(env.DB, auth.userId);
            return json({ success: true, data: bookmarks });
          }
          if (request.method === "POST") {
            try {
              const body = await request.json();
              const { target_type, target_id, title } = body;
              if (!target_type || !target_id) {
                return json({ success: false, message: "Missing required fields" }, { status: 400 });
              }
              const existing = await listBookmarksByUser(env.DB, auth.userId);
              if (existing && existing.some((b) => String(b.target_id) === String(target_id) && b.target_type === target_type)) {
                return json({ success: false, message: "Already bookmarked" }, { status: 400 });
              }
              const bookmark = await createBookmark(env.DB, {
                user_id: auth.userId,
                target_type,
                target_id: String(target_id),
                title: title ? String(title).substring(0, 200) : "Untitled",
                created_at: (/* @__PURE__ */ new Date()).toISOString()
              });
              return json({ success: true, data: bookmark });
            } catch (e) {
              return json({ success: false, message: e.message || "Internal Error", stack: e.stack }, { status: 500 });
            }
          }
          if (request.method === "DELETE" && bookmarksMatch[1]) {
            const bookmarkId = bookmarksMatch[1];
            const bookmark = await getBookmarkById(env.DB, bookmarkId);
            if (!bookmark) return notFound();
            if (bookmark.user_id !== auth.userId) {
              return json({ success: false, message: "Unauthorized" }, { status: 403 });
            }
            await deleteBookmark(env.DB, bookmarkId);
            return json({ success: true });
          }
        }
        if (url.pathname.startsWith("/api/chat")) {
          const auth = await requireAuthUserId(request, env);
          if ("error" in auth) return auth.error;
          const myId = auth.userId;
          if (url.pathname === "/api/chat/unread-count" && request.method === "GET") {
            const received = await listReceivedMessages(env.DB, myId);
            const unreadCount = received.filter((m) => !m.is_read).length;
            return json({ success: true, data: { unread: unreadCount } });
          }
          if (url.pathname === "/api/chat/inbox/conversations" && request.method === "GET") {
            const allMsgs = await listDirectMessagesForUser(env.DB, myId);
            const convsMap = /* @__PURE__ */ new Map();
            for (const m of allMsgs) {
              const friendId = m.sender_id === myId ? m.receiver_id : m.sender_id;
              const current = convsMap.get(friendId);
              const mDate = new Date(m.created_at).getTime();
              if (!current || mDate > new Date(current.created_at).getTime()) {
                convsMap.set(friendId, m);
              }
            }
            const conversations = await Promise.all(Array.from(convsMap.entries()).map(async ([friendId, lastMessage]) => {
              const friendDoc = await getUserById(env.DB, friendId);
              const isRead = lastMessage.sender_id === myId || lastMessage.is_read;
              return {
                friend: friendDoc ? { id: friendId, display_name: friendDoc.display_name, avatar: friendDoc.avatar } : { id: friendId, display_name: "Unknown User" },
                lastMessage,
                isRead
              };
            }));
            conversations.sort((a, b) => new Date(b.lastMessage.created_at).getTime() - new Date(a.lastMessage.created_at).getTime());
            return json({ success: true, data: conversations });
          }
          if (url.pathname === "/api/chat/send" && request.method === "POST") {
            const body = await readJson(request);
            if (!body.friendId || !body.message) return json({ success: false, message: "Missing fields" }, { status: 400 });
            const newMsg = await createDirectMessage(env.DB, {
              sender_id: myId,
              receiver_id: body.friendId,
              content: body.message,
              is_read: false,
              created_at: (/* @__PURE__ */ new Date()).toISOString()
            });
            return json({ success: true, data: newMsg });
          }
          if (url.pathname === "/api/chat/read" && request.method === "POST") {
            const body = await readJson(request);
            const friendId = body.friendId;
            await markMessagesRead(env.DB, myId, friendId);
            return json({ success: true });
          }
          const chatMatch = url.pathname.match(/^\/api\/chat\/([a-zA-Z0-9_-]+)$/);
          if (chatMatch && request.method === "GET") {
            const friendId = chatMatch[1];
            const allMsgs = await listDirectMessagesForUser(env.DB, myId);
            const chatHistory = allMsgs.filter((m) => m.sender_id === myId && m.receiver_id === friendId || m.sender_id === friendId && m.receiver_id === myId);
            chatHistory.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
            return json({ success: true, data: chatHistory });
          }
        }
        if (url.pathname.startsWith("/api/notifications")) {
          const auth = await requireAuthUserId(request, env);
          if ("error" in auth) return auth.error;
          const myId = auth.userId;
          if (url.pathname === "/api/notifications" && request.method === "GET") {
            const limitStr = url.searchParams.get("limit") || "50";
            const notifications = await listNotificationsByUser(env.DB, myId, parseInt(limitStr, 10));
            return json({ success: true, data: notifications });
          }
          if (url.pathname === "/api/notifications/unread-count" && request.method === "GET") {
            const notifications = await listNotificationsByUser(env.DB, myId, 1e3);
            const unreadCount = notifications.filter((n) => !n.is_read).length;
            return json({ success: true, data: { unread: unreadCount } });
          }
          if (url.pathname === "/api/notifications/read" && request.method === "POST") {
            const body = await readJson(request);
            if (body.id) {
              await markNotificationRead(env.DB, body.id);
            } else {
              await markAllNotificationsRead(env.DB, myId);
            }
            return json({ success: true });
          }
        }
        if (url.pathname === "/api/community/threads" && request.method === "GET") {
          const category = url.searchParams.get("category");
          const search = url.searchParams.get("search");
          const limitStr = url.searchParams.get("limit") || "10";
          const limit = parseInt(limitStr, 10);
          let query = {
            from: [{ collectionId: "threads" }],
            orderBy: [{ field: { fieldPath: "created_at" }, direction: "DESCENDING" }],
            limit: { value: limit }
            // FirestoreREST limit expects integer or object? The struct is usually { value: limit } for Protobuf Int32Value. 
            // Wait, firestore REST API `limit` is just an integer in the query object!
          };
          query.limit = limit;
          const filters = [];
          if (category && category !== "all" && category !== "undefined" && category !== "null") {
            filters.push({ fieldFilter: { field: { fieldPath: "category" }, op: "EQUAL", value: { stringValue: category } } });
          }
          if (filters.length === 1) {
            query.where = filters[0];
          } else if (filters.length > 1) {
            query.where = { compositeFilter: { op: "AND", filters } };
          }
          let allThreads = await listThreads(env.DB, 200);
          if (category && category !== "all" && category !== "undefined" && category !== "null") {
            allThreads = allThreads.filter((t) => t.category === category);
          }
          if (search && search !== "undefined") {
            const searchLower = search.toLowerCase();
            allThreads = allThreads.filter((t) => {
              if (t.title && t.title.toLowerCase().includes(searchLower)) return true;
              if (t.tags && Array.isArray(t.tags) && t.tags.some((tag) => tag.toLowerCase().includes(searchLower))) return true;
              return false;
            });
          }
          const userIds = [...new Set(allThreads.map((t) => t.user_id).filter(Boolean))];
          const usersMap = /* @__PURE__ */ new Map();
          for (let i = 0; i < userIds.length; i += 30) {
            const chunk = userIds.slice(i, i + 30);
            const users = await Promise.all(chunk.map((id) => getUserById(env.DB, String(id))));
            for (const u of users) {
              if (u && u.id) usersMap.set(String(u.id), u);
            }
          }
          allThreads = allThreads.map((t) => {
            const u = usersMap.get(String(t.user_id));
            if (u) {
              t.User = {
                id: u.id,
                display_name: u.display_name || "Unknown User",
                avatar: u.avatar || null,
                plan_type: u.plan_type || "free"
              };
            } else {
              t.User = { id: t.user_id, display_name: "Unknown User" };
            }
            if (!t.stats) {
              t.stats = { views: t.views || 0, likes: t.likes || 0, comments_count: 0 };
            }
            return t;
          });
          let nextCursor = null;
          if (allThreads.length > 0) {
            nextCursor = allThreads[allThreads.length - 1].id;
          }
          return json({ success: true, threads: allThreads, nextCursor });
        }
        if (url.pathname === "/api/community/threads" && request.method === "POST") {
          const auth = await requireAuthUserId(request, env);
          if ("error" in auth) return auth.error;
          const body = await readJson(request);
          if (!body || !body.title) {
            return json({ success: false, error: "Title is required" }, { status: 400 });
          }
          const threadData = {
            user_id: auth.userId,
            title: body.title,
            content: body.content || "",
            category: body.category || "general",
            background_style: body.background_style || null,
            tags: body.tags || [],
            image_url: body.image_url || body.image_base64 || null,
            likes: 0,
            created_at: (/* @__PURE__ */ new Date()).toISOString(),
            updated_at: (/* @__PURE__ */ new Date()).toISOString(),
            deleted_at: null
          };
          const created = await createThread(env.DB, threadData);
          return json({ success: true, data: created }, { status: 201 });
        }
        const examIdMatch = url.pathname.match(/^\/api\/exams\/([a-zA-Z0-9_-]+)$/);
        if (examIdMatch && request.method === "GET") {
          const auth = await requireAuthUserId(request, env);
          if ("error" in auth) return auth.error;
          const result = await getExamResultById(env.DB, examIdMatch[1]);
          if (!result) return json({ success: false, message: "Result not found" }, { status: 404 });
          return json({ success: true, data: result });
        }
        const threadIdMatch = url.pathname.match(/^\/api\/community\/threads\/([a-zA-Z0-9_-]+)$/);
        if (threadIdMatch && request.method === "GET") {
          const threadDoc = await getThreadById(env.DB, threadIdMatch[1]);
          if (!threadDoc) return notFound();
          if (!threadDoc.stats) threadDoc.stats = { views: threadDoc.views || 0, likes: threadDoc.likes || 0, comments_count: 0 };
          const u = await getUserById(env.DB, String(threadDoc.user_id));
          if (u) {
            threadDoc.User = { id: u.id, display_name: u.display_name || "Unknown User", avatar: u.avatar || null, plan_type: u.plan_type || "free" };
          }
          return json(threadDoc);
        }
        const userThreadsMatch = url.pathname.match(/^\/api\/community\/threads\/user\/([a-zA-Z0-9_-]+)$/);
        if (userThreadsMatch && request.method === "GET") {
          const userId = userThreadsMatch[1];
          const threads = await listThreadsByUser(env.DB, userId);
          threads.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
          return json({ success: true, data: threads });
        }
        if (threadIdMatch && request.method === "DELETE") {
          const auth = await requireAuthUserId(request, env);
          if ("error" in auth) return auth.error;
          const threadDoc = await getThreadById(env.DB, threadIdMatch[1]);
          if (!threadDoc) return notFound();
          if (threadDoc.user_id !== auth.userId) {
            return json({ success: false, message: "Unauthorized" }, { status: 403 });
          }
          await deleteThread(env.DB, threadIdMatch[1]);
          return json({ success: true });
        }
        const commentsMatch = url.pathname.match(/^\/api\/community\/comments\/([a-zA-Z0-9_-]+)$/);
        if (commentsMatch && request.method === "GET") {
          const threadId = commentsMatch[1];
          let comments = await listCommentsByThread(env.DB, threadId);
          const userIds = [...new Set(comments.map((c) => c.user_id).filter(Boolean))];
          const usersMap = /* @__PURE__ */ new Map();
          for (let i = 0; i < userIds.length; i += 30) {
            const chunk = userIds.slice(i, i + 30);
            const users = await Promise.all(chunk.map((id) => getUserById(env.DB, String(id))));
            for (const u of users) {
              if (u && u.id) usersMap.set(String(u.id), u);
            }
          }
          comments = comments.map((c) => {
            const u = usersMap.get(String(c.user_id));
            if (u) {
              c.User = { id: u.id, display_name: u.display_name || "Unknown User", avatar: u.avatar || null, plan_type: u.plan_type || "free" };
            } else {
              c.User = { id: c.user_id, display_name: "Unknown User" };
            }
            c.likes = c.likes || 0;
            return c;
          });
          return json(comments);
        }
        if (url.pathname === "/api/community/comments" && request.method === "POST") {
          const auth = await requireAuthUserId(request, env);
          if ("error" in auth) return auth.error;
          const body = await request.json();
          const commentData = {
            thread_id: body.thread_id,
            content: body.content,
            parent_id: body.parent_id || null,
            user_id: auth.userId,
            likes: 0,
            created_at: (/* @__PURE__ */ new Date()).toISOString(),
            updated_at: (/* @__PURE__ */ new Date()).toISOString()
          };
          const created = await createComment(env.DB, commentData);
          return json({ success: true, data: created });
        }
        const commentLikeMatch = url.pathname.match(/^\/api\/community\/comments\/([a-zA-Z0-9_-]+)\/like$/);
        if (commentLikeMatch && request.method === "POST") {
          const auth = await requireAuthUserId(request, env);
          if ("error" in auth) return auth.error;
          const commentId = commentLikeMatch[1];
          const comment = await getCommentById(env.DB, commentId);
          if (!comment) return notFound();
          const currentLikes = comment.likes || 0;
          await updateComment(env.DB, commentId, { likes: currentLikes + 1 });
          return json({ success: true, likes: currentLikes + 1 });
        }
        if (url.pathname === "/api/news" && request.method === "GET") {
          try {
            const agency = url.searchParams.get("agency");
            const search = url.searchParams.get("search");
            const { results } = await env.DB.prepare("SELECT * FROM news ORDER BY created_at DESC LIMIT 100").all();
            const news = results.map((r) => {
              const metadata = r.metadata ? JSON.parse(r.metadata) : {};
              return {
                ...r,
                metadata,
                summary: metadata?.summary || null,
                is_featured: !!metadata?.is_featured,
                recruitment_type: metadata?.recruitment_type || null,
                published_date: metadata?.published_date || null,
                views: metadata?.views || 0
              };
            });
            const category = url.searchParams.get("category");
            let filteredNews = news.filter((n) => n.status !== "expired");
            if (category && category !== "undefined") {
              if (category === "!\u0E07\u0E32\u0E19\u0E23\u0E32\u0E0A\u0E01\u0E32\u0E23") {
                filteredNews = filteredNews.filter((n) => n.category !== "\u0E07\u0E32\u0E19\u0E23\u0E32\u0E0A\u0E01\u0E32\u0E23");
              } else {
                filteredNews = filteredNews.filter((n) => n.category === category);
              }
            }
            const ministry = url.searchParams.get("ministry");
            if (ministry && ministry !== "undefined") {
              filteredNews = filteredNews.filter((n) => (n.metadata && n.metadata.ministry || "\u0E44\u0E21\u0E48\u0E23\u0E30\u0E1A\u0E38\u0E01\u0E23\u0E30\u0E17\u0E23\u0E27\u0E07") === ministry);
            }
            if (agency && agency !== "undefined") {
              filteredNews = filteredNews.filter((n) => (n.metadata && n.metadata.department || n.agency || "\u0E44\u0E21\u0E48\u0E23\u0E30\u0E1A\u0E38\u0E01\u0E23\u0E21") === agency);
            }
            if (search && search !== "undefined") {
              const sLower = search.toLowerCase();
              filteredNews = filteredNews.filter((n) => n.title?.toLowerCase().includes(sLower) || n.summary?.toLowerCase().includes(sLower));
            }
            filteredNews.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
            return json({ success: true, data: filteredNews });
          } catch (e) {
            return json({ success: true, data: [] });
          }
        }
        if (url.pathname === "/api/news" && request.method === "POST") {
          const auth = await requireAuthUserId(request, env);
          if ("error" in auth) return auth.error;
          const body = await readJson(request);
          if (!body) return json({ success: false, message: "invalid_body" }, { status: 400 });
          body.created_at = (/* @__PURE__ */ new Date()).toISOString();
          body.updated_at = (/* @__PURE__ */ new Date()).toISOString();
          body.views = 0;
          const created = await createNews(env.DB, body);
          return json({ success: true, data: created });
        }
        if (url.pathname === "/api/news/agency-stats" && request.method === "GET") {
          try {
            const typeFilter = url.searchParams.get("type");
            const { results } = await env.DB.prepare("SELECT * FROM news ORDER BY created_at DESC LIMIT 100").all();
            const news = results.map((r) => {
              const metadata = r.metadata ? JSON.parse(r.metadata) : {};
              return {
                ...r,
                metadata,
                recruitment_type: metadata?.recruitment_type || null,
                published_date: metadata?.published_date || null
              };
            });
            const govNews = news.filter((n) => n.category === "\u0E07\u0E32\u0E19\u0E23\u0E32\u0E0A\u0E01\u0E32\u0E23" && n.status !== "expired");
            const statsMap = {};
            let countCivil = 0;
            let countEmployee = 0;
            let countOther = 0;
            govNews.forEach((job) => {
              const ministry = job.metadata && job.metadata.ministry || "\u0E44\u0E21\u0E48\u0E23\u0E30\u0E1A\u0E38\u0E01\u0E23\u0E30\u0E17\u0E23\u0E27\u0E07";
              const department = job.metadata && job.metadata.department || job.agency || "\u0E44\u0E21\u0E48\u0E23\u0E30\u0E1A\u0E38\u0E01\u0E23\u0E21";
              let jobCount = job.metadata && job.metadata.vacancy_count ? parseInt(job.metadata.vacancy_count) : 1;
              if (isNaN(jobCount)) jobCount = 1;
              const pType = job.metadata && job.metadata.position_type || job.recruitment_type || "";
              const isCivil = pType.includes("\u0E02\u0E49\u0E32\u0E23\u0E32\u0E0A\u0E01\u0E32\u0E23");
              const isEmployee = pType.includes("\u0E1E\u0E19\u0E31\u0E01\u0E07\u0E32\u0E19\u0E23\u0E32\u0E0A\u0E01\u0E32\u0E23");
              const isOther = !isCivil && !isEmployee;
              if (isCivil) countCivil += jobCount;
              else if (isEmployee) countEmployee += jobCount;
              else countOther += jobCount;
              if (typeFilter === "civil" && !isCivil) return;
              if (typeFilter === "employee" && !isEmployee) return;
              if (typeFilter === "other" && !isOther) return;
              if (!statsMap[ministry]) {
                statsMap[ministry] = { ministry, departments: {} };
              }
              const jobDate = job.published_date || job.created_at || (/* @__PURE__ */ new Date()).toISOString();
              if (!statsMap[ministry].departments[department]) {
                statsMap[ministry].departments[department] = { department, count: 0, logo: job.metadata && job.metadata.agency_logo || null, lastUpdated: jobDate };
              } else {
                const currDate = statsMap[ministry].departments[department].lastUpdated;
                if (new Date(jobDate) > new Date(currDate)) {
                  statsMap[ministry].departments[department].lastUpdated = jobDate;
                }
              }
              statsMap[ministry].departments[department].count += jobCount;
            });
            const formattedStats = Object.values(statsMap).map((m) => {
              const depts = Object.values(m.departments);
              const latestDate = depts.reduce((latest, d) => {
                return !latest || new Date(d.lastUpdated) > new Date(latest) ? d.lastUpdated : latest;
              }, null);
              return {
                ministry: m.ministry,
                logo: depts.find((d) => d.logo)?.logo || null,
                totalCount: depts.reduce((sum, d) => sum + d.count, 0),
                lastUpdated: latestDate,
                departments: depts.sort((a, b) => b.count - a.count)
              };
            }).sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime());
            return json({
              success: true,
              data: formattedStats,
              jobTypes: { civil: countCivil, employee: countEmployee, other: countOther }
            });
          } catch (e) {
            return json({ success: false, data: [] });
          }
        }
        const ocscJobMatch = url.pathname.match(/^\/api\/news\/ocsc-job\/(\d+)$/);
        if (ocscJobMatch && request.method === "GET") {
          try {
            const id = ocscJobMatch[1];
            const response = await fetch(`https://jobapp.ocsc.go.th/jobapi/portal/jobs/${id}`);
            if (!response.ok) {
              return json({ success: false, message: "failed_to_fetch_ocsc" }, { status: response.status });
            }
            const data = await response.json();
            return json({ success: true, data });
          } catch (e) {
            return json({ success: false, message: "error" }, { status: 500 });
          }
        }
        const newsIdMatch = url.pathname.match(/^\/api\/news\/([a-zA-Z0-9_-]+)$/);
        if (newsIdMatch && request.method === "GET") {
          try {
            const id = newsIdMatch[1];
            const doc = await getNewsById(env.DB, id);
            if (!doc) return json({ success: false, message: "not_found" }, { status: 404 });
            return json({ success: true, data: doc });
          } catch (e) {
            return json({ success: false, message: "error" }, { status: 500 });
          }
        }
        if (newsIdMatch && request.method === "PUT") {
          const auth = await requireAuthUserId(request, env);
          if ("error" in auth) return auth.error;
          const id = newsIdMatch[1];
          const body = await readJson(request);
          body.updated_at = (/* @__PURE__ */ new Date()).toISOString();
          const updated = await updateNews(env.DB, id, body);
          if (!updated) return json({ success: false, message: "not_found" }, { status: 404 });
          return json({ success: true, data: updated });
        }
        if (newsIdMatch && request.method === "DELETE") {
          const auth = await requireAuthUserId(request, env);
          if ("error" in auth) return auth.error;
          const id = newsIdMatch[1];
          await deleteNews(env.DB, id);
          return json({ success: true, message: "Deleted" });
        }
        const newsFeatureMatch = url.pathname.match(/^\/api\/news\/([a-zA-Z0-9_-]+)\/feature$/);
        if (newsFeatureMatch && request.method === "PUT") {
          const auth = await requireAuthUserId(request, env);
          if ("error" in auth) return auth.error;
          const id = newsFeatureMatch[1];
          const updated = await toggleNewsFeatured(env.DB, id);
          if (!updated) return json({ success: false, message: "Not found" }, { status: 404 });
          return json({ success: true, data: updated });
        }
        if (url.pathname === "/api/news/scrape" && request.method === "POST") {
          const auth = await requireAuthUserId(request, env);
          if ("error" in auth) return auth.error;
          const body = await readJson(request);
          const targetUrl = body?.url || "";
          let scrapeData = {
            title: "\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E14\u0E36\u0E07\u0E2D\u0E31\u0E15\u0E42\u0E19\u0E21\u0E31\u0E15\u0E34",
            summary: "\u0E14\u0E36\u0E07\u0E40\u0E19\u0E37\u0E49\u0E2D\u0E2B\u0E32\u0E08\u0E32\u0E01 " + targetUrl,
            agency: "\u0E2D\u0E49\u0E32\u0E07\u0E2D\u0E34\u0E07\u0E08\u0E32\u0E01 URL",
            external_link: targetUrl,
            metadata: {
              announcement_url: targetUrl
            }
          };
          const ocscNewsMatch = targetUrl.match(/job\.ocsc\.go\.th\/portal\/news\/(\d+)/);
          if (ocscNewsMatch) {
            try {
              const id = ocscNewsMatch[1];
              const response = await fetch(`https://jobapp.ocsc.go.th/jobapi/portal/pressreleases/${id}`);
              if (response.ok) {
                const data = await response.json();
                if (data.headline) scrapeData.title = data.headline;
                if (data.text1 || data.text2) {
                  const rawHtml = (data.text1 || "") + "\n" + (data.text2 || "");
                  scrapeData.summary = rawHtml.replace(/<br\s*[\/]?>/gi, "\n").replace(/<\/p>/gi, "\n\n").replace(/<\/h[1-6]>/gi, "\n\n").replace(/<\/li>/gi, "\n").replace(/<li>/gi, "- ").replace(/<[^>]+>/g, "").replace(/\n\s*\n/g, "\n\n").trim();
                }
                scrapeData.agency = "\u0E2A\u0E33\u0E19\u0E31\u0E01\u0E07\u0E32\u0E19 \u0E01.\u0E1E.";
                if (data.image1) {
                  scrapeData.image_url = data.image1.startsWith("http") ? data.image1 : `https://job.ocsc.go.th/upload2/${data.image1}`;
                } else if (data.banner) {
                  scrapeData.image_url = data.banner.startsWith("http") ? data.banner : `https://job.ocsc.go.th/upload2/${data.banner}`;
                }
              }
            } catch (e) {
            }
          }
          return json({ success: true, data: scrapeData });
        }
        if (url.pathname === "/api/news/agency-stats" && request.method === "GET") {
          try {
            const { results } = await env.DB.prepare("SELECT * FROM news ORDER BY created_at DESC LIMIT 50").all();
            const news = results.map((r) => ({ ...r, metadata: r.metadata ? JSON.parse(r.metadata) : null }));
            const agencies = /* @__PURE__ */ new Map();
            news.forEach((item) => {
              const agency = item.agency || item.metadata && item.metadata.organization;
              if (agency) {
                agencies.set(agency, (agencies.get(agency) || 0) + 1);
              }
            });
            const stats = Array.from(agencies.entries()).map(([name, count]) => ({ name, job_count: count }));
            return json({ success: true, data: stats });
          } catch (e) {
            return json({ success: true, data: [] });
          }
        }
        if (url.pathname === "/api/news/popular-keywords" && request.method === "GET") {
          return json({ success: true, data: [] });
        }
        if (url.pathname === "/api/news/sources/all" && request.method === "GET") {
          try {
            const { results: sources } = await env.DB.prepare("SELECT * FROM news_sources ORDER BY name ASC").all();
            return json({ success: true, data: sources });
          } catch (e) {
            return json({ success: true, data: [] });
          }
        }
        if (url.pathname === "/api/news/sources" && request.method === "POST") {
          const auth = await requireAuthUserId(request, env);
          if ("error" in auth) return auth.error;
          const body = await readJson(request);
          if (!body || !body.name) return json({ success: false, message: "name is required" }, { status: 400 });
          const id = "src_" + Date.now() + Math.random().toString(36).substr(2, 5);
          const name = String(body.name).trim();
          const url_str = String(body.url || "").trim();
          const created_at = (/* @__PURE__ */ new Date()).toISOString();
          try {
            await env.DB.prepare(
              "INSERT INTO news_sources (id, name, url, is_active, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)"
            ).bind(id, name, url_str, 1, created_at, created_at).run();
            return json({ success: true, data: { id, name, url: url_str, is_active: 1, created_at, updated_at: created_at } });
          } catch (e) {
            return json({ success: false, message: "failed to create source" }, { status: 500 });
          }
        }
        const newsSourceIdMatch = url.pathname.match(/^\/api\/news\/sources\/([a-zA-Z0-9_-]+)$/);
        if (newsSourceIdMatch && request.method === "DELETE") {
          const auth = await requireAuthUserId(request, env);
          if ("error" in auth) return auth.error;
          const id = newsSourceIdMatch[1];
          try {
            await env.DB.prepare("DELETE FROM news_sources WHERE id = ?").bind(id).run();
            return json({ success: true, message: "Deleted" });
          } catch (e) {
            return json({ success: false, message: "failed to delete source" }, { status: 500 });
          }
        }
        if (url.pathname === "/api/scraper/jobs" && request.method === "POST") {
          const body = await readJson(request);
          if (!body) return json({ success: false, message: "invalid_body" }, { status: 400 });
          const apiKey = request.headers.get("x-api-key");
          if (apiKey !== "dev_scraper_key") {
            return json({ success: false, message: "Unauthorized" }, { status: 401 });
          }
          const jobData = body;
          jobData.created_at = (/* @__PURE__ */ new Date()).toISOString();
          jobData.published_at = (/* @__PURE__ */ new Date()).toISOString();
          const created = await createNews(env.DB, jobData);
          return json({ success: true, data: created });
        }
        const adsServeMatch = url.pathname.match(/^\/api\/ads\/serve/);
        if (adsServeMatch && request.method === "GET") {
          return json({ success: true, served: false });
        }
        if (url.pathname === "/api/ads/admin/config" && request.method === "GET") {
          return json({
            success: true,
            houseAdTitle: "\u0E40\u0E15\u0E23\u0E35\u0E22\u0E21\u0E2A\u0E2D\u0E1A \u0E01.\u0E1E. \u0E1C\u0E48\u0E32\u0E19\u0E09\u0E25\u0E38\u0E22",
            houseAdDescription: "\u0E40\u0E02\u0E49\u0E32\u0E01\u0E25\u0E38\u0E48\u0E21\u0E15\u0E34\u0E27\u0E1F\u0E23\u0E35 \u0E41\u0E08\u0E01\u0E02\u0E49\u0E2D\u0E2A\u0E2D\u0E1A\u0E41\u0E21\u0E48\u0E19\u0E46 \u0E15\u0E34\u0E27\u0E40\u0E15\u0E2D\u0E23\u0E4C\u0E2D\u0E31\u0E19\u0E14\u0E31\u0E1A 1",
            houseAdImage: "https://images.unsplash.com/photo-1557804506-669a67965ba0?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
            houseAdUrl: "/lobby"
          });
        }
        if (url.pathname === "/api/users/profile" && request.method === "GET") {
          const auth = await requireAuthUserId(request, env);
          if ("error" in auth) return auth.error;
          const user = await getUserById(env.DB, auth.userId);
          return json({ success: true, data: sanitizeUser(user) });
        }
        if (url.pathname === "/api/users/profile" && request.method === "PUT") {
          const auth = await requireAuthUserId(request, env);
          if ("error" in auth) return auth.error;
          const body = await readJson(request);
          if (!body || !body.username) return json({ success: false, message: "Username is required" }, { status: 400 });
          const updates = {
            display_name: String(body.username).trim(),
            updated_at: (/* @__PURE__ */ new Date()).toISOString()
          };
          await updateUser(env.DB, auth.userId, updates);
          const updatedUser = await getUserById(env.DB, auth.userId);
          return json({ success: true, data: sanitizeUser(updatedUser) });
        }
        if (url.pathname === "/api/users/profile" && request.method === "DELETE") {
          const auth = await requireAuthUserId(request, env);
          if ("error" in auth) return auth.error;
          await deleteUser(env.DB, auth.userId);
          return json({ success: true, message: "Account deleted successfully" });
        }
        if (url.pathname === "/api/users/settings" && request.method === "PUT") {
          const auth = await requireAuthUserId(request, env);
          if ("error" in auth) return auth.error;
          const body = await readJson(request);
          if (!body) return json({ success: false, message: "Invalid payload" }, { status: 400 });
          const updates = {
            settings_friends_online: !!body.friends_online,
            settings_streak_reminder: !!body.streak_reminder,
            settings_new_message: !!body.new_message,
            updated_at: (/* @__PURE__ */ new Date()).toISOString()
          };
          await updateUser(env.DB, auth.userId, updates);
          const updatedUser = await getUserById(env.DB, auth.userId);
          return json({ success: true, data: sanitizeUser(updatedUser) });
        }
        if (url.pathname === "/api/users/stats" && request.method === "GET") {
          const auth = await requireAuthUserId(request, env);
          if ("error" in auth) return auth.error;
          try {
            const results = await listExamResultsByUser(env.DB, auth.userId);
            const totalExams = results.length;
            const totalScore = results.reduce((acc, curr) => acc + (Number(curr.score) || 0), 0);
            const totalQuestions = results.reduce((acc, curr) => acc + (Number(curr.total_score) || 0), 0);
            const timeTaken = results.reduce((acc, curr) => acc + (Number(curr.time_taken) || 0), 0);
            const gamesWon = results.filter((r) => {
              const sc = Number(r.score) || 0;
              const ts = Number(r.total_score) || 10;
              return sc >= ts * 0.8;
            }).length;
            const accuracy = totalQuestions > 0 ? Math.round(totalScore / totalQuestions * 100) : 0;
            const avgAnswerTime = totalQuestions > 0 ? (timeTaken / totalQuestions).toFixed(1) : "0";
            const uniqueDays = new Set(results.map((r) => r.taken_at?.split("T")[0]).filter(Boolean)).size;
            return json({
              success: true,
              data: {
                totalExams,
                totalQuestions,
                totalScore,
                timeTaken,
                gamesWon,
                accuracy,
                avgAnswerTime,
                badgesEarned: 0,
                friendsCount: 0,
                daysActive: uniqueDays
              }
            });
          } catch (e) {
            return json({ success: false, message: "Server error" }, { status: 500 });
          }
        }
        if (url.pathname === "/api/users/stats/heatmap" && request.method === "GET") {
          const auth = await requireAuthUserId(request, env);
          if ("error" in auth) return auth.error;
          const urlObj = new URL(request.url);
          const periodStr = urlObj.searchParams.get("period");
          const period = periodStr === "all" ? 9999 : parseInt(periodStr || "7", 10);
          try {
            const results = await listExamResultsByUser(env.DB, auth.userId);
            const now = /* @__PURE__ */ new Date();
            const cutoff = new Date(now.getTime() - period * 24 * 60 * 60 * 1e3);
            const dateCounts = {};
            results.forEach((r) => {
              if (r.taken_at) {
                const dateObj = new Date(r.taken_at);
                if (dateObj >= cutoff) {
                  const dateStr = r.taken_at.split("T")[0];
                  dateCounts[dateStr] = (dateCounts[dateStr] || 0) + 1;
                }
              }
            });
            const heatmapData = [];
            const daysToGenerate = period === 9999 ? 365 : period;
            for (let i = daysToGenerate - 1; i >= 0; i--) {
              const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1e3);
              const dateStr = d.toISOString().split("T")[0];
              heatmapData.push({
                date: dateStr,
                value: dateCounts[dateStr] || 0
              });
            }
            return json({ success: true, data: heatmapData });
          } catch (e) {
            return json({ success: false, message: "Server error" }, { status: 500 });
          }
        }
        if (url.pathname === "/api/users/stats/radar" && request.method === "GET") {
          const auth = await requireAuthUserId(request, env);
          if ("error" in auth) return auth.error;
          try {
            const results = await listExamResultsByUser(env.DB, auth.userId);
            const subjectStats = {};
            results.forEach((r) => {
              try {
                if (r.subject_scores && typeof r.subject_scores === "object") {
                  Object.keys(r.subject_scores).forEach((subj) => {
                    if (!subjectStats[subj]) subjectStats[subj] = { score: 0, full: 0 };
                    subjectStats[subj].score += Number(r.subject_scores[subj]) || 0;
                  });
                }
                if (r.questions && Array.isArray(r.questions)) {
                  r.questions.forEach((q) => {
                    if (q && typeof q === "object" && q.subject) {
                      if (!subjectStats[q.subject]) subjectStats[q.subject] = { score: 0, full: 0 };
                      subjectStats[q.subject].full += 1;
                    }
                  });
                }
              } catch (innerError) {
                console.error("Radar aggregation error for result", r, innerError);
              }
            });
            const radarData = Object.keys(subjectStats).map((subj) => {
              const stat = subjectStats[subj];
              const fullMark = Math.max(stat.full, 1);
              const percentage = Math.round(stat.score / fullMark * 100);
              return {
                subject: subj,
                score: percentage,
                fullMark: 100
              };
            });
            return json({ success: true, data: radarData });
          } catch (e) {
            return json({ success: false, message: "Server error" }, { status: 500 });
          }
        }
        if (url.pathname.startsWith("/api/friends")) {
          const auth = await requireAuthUserId(request, env);
          if ("error" in auth) return auth.error;
          const myId = auth.userId;
          if (url.pathname === "/api/friends/request" && request.method === "POST") {
            const body = await readJson(request);
            const friendId = body.friendId;
            if (!friendId || friendId === myId) return json({ success: false, message: "Invalid friend ID" }, { status: 400 });
            const relations = await listFriendsByUser(env.DB, myId);
            const exists = relations.find((r) => r.requester_id === myId && r.target_id === friendId || r.target_id === myId && r.requester_id === friendId);
            if (exists) return json({ success: false, message: "Request already exists or already friends" }, { status: 400 });
            const newReq = await createFriendRequest(env.DB, myId, friendId);
            return json({ success: true, data: newReq });
          }
          if (url.pathname === "/api/friends/accept" && request.method === "POST") {
            const body = await readJson(request);
            const friendId = body.friendId;
            const tgts = await listFriendsByUser(env.DB, myId);
            const req = tgts.find((r) => r.requester_id === friendId && r.status === "pending");
            if (!req) return json({ success: false, message: "Request not found" }, { status: 404 });
            await updateFriend(env.DB, req.id, { status: "accepted" });
            return json({ success: true });
          }
          const removeMatch = url.pathname.match(/^\/api\/friends\/remove\/(.+)$/);
          if (removeMatch && request.method === "DELETE") {
            const friendId = removeMatch[1];
            const relations = await listFriendsByUser(env.DB, myId);
            const toDelete = [
              ...relations.filter((r) => r.target_id === friendId || r.requester_id === friendId)
            ];
            for (const doc of toDelete) {
              await deleteFriend(env.DB, doc.id);
            }
            return json({ success: true });
          }
          if (url.pathname === "/api/friends/list" && request.method === "GET") {
            const relations = await listFriendsByUser(env.DB, myId);
            const friendsList = [
              ...relations.filter((r) => r.status === "accepted")
            ];
            const friendIds = friendsList.map((f) => f.requester_id === myId ? f.target_id : f.requester_id);
            const friendProfiles = await Promise.all(friendIds.map(async (fid) => {
              const doc = await getUserById(env.DB, fid);
              if (!doc) return null;
              return { id: fid, display_name: doc.display_name, avatar: doc.avatar, level: doc.level };
            }));
            return json({ success: true, data: friendProfiles.filter(Boolean) });
          }
          if (url.pathname === "/api/friends/pending" && request.method === "GET") {
            const tgts = await listFriendsByUser(env.DB, myId);
            const pendingList = tgts.filter((r) => r.status === "pending");
            const pendingProfiles = await Promise.all(pendingList.map(async (f) => {
              const doc = await getUserById(env.DB, f.requester_id);
              if (!doc) return null;
              return { id: f.requester_id, display_name: doc.display_name, avatar: doc.avatar, level: doc.level, request_id: f.id };
            }));
            return json({ success: true, data: pendingProfiles.filter(Boolean) });
          }
          const checkMatch = url.pathname.match(/^\/api\/friends\/check\/(.+)$/);
          if (checkMatch && request.method === "GET") {
            const friendId = checkMatch[1];
            const relations = await listFriendsByUser(env.DB, myId);
            const r1 = relations.find((r) => r.requester_id === myId && r.target_id === friendId);
            const r2 = relations.find((r) => r.target_id === myId && r.requester_id === friendId);
            if (r1) {
              return json({ success: true, status: r1.status === "accepted" ? "friends" : "sent" });
            } else if (r2) {
              return json({ success: true, status: r2.status === "accepted" ? "friends" : "received" });
            } else {
              return json({ success: true, status: "none" });
            }
          }
          return json({ success: false, message: "Not found in friends API" }, { status: 404 });
        }
        if (url.pathname === "/api/users/claim-streak" && request.method === "POST") {
          const auth = await requireAuthUserId(request, env);
          if ("error" in auth) return auth.error;
          try {
            const userDoc = await getUserById(env.DB, auth.userId);
            if (!userDoc) return json({ success: false, message: "User not found" }, { status: 404 });
            const now = /* @__PURE__ */ new Date();
            const todayStr = now.toISOString().split("T")[0];
            const lastClaimDateStr = userDoc.last_claim_date;
            if (lastClaimDateStr === todayStr) {
              return json({ success: false, message: "Already claimed today", data: { xpGained: 0 } });
            }
            let newStreak = 1;
            if (lastClaimDateStr) {
              const yesterday = new Date(now);
              yesterday.setDate(yesterday.getDate() - 1);
              const yesterdayStr = yesterday.toISOString().split("T")[0];
              if (lastClaimDateStr === yesterdayStr) {
                newStreak = (Number(userDoc.streak_count) || 0) + 1;
              }
            }
            const xpGained = newStreak % 7 === 0 ? 100 : 10;
            const currentXp = (Number(userDoc.xp) || 0) + xpGained;
            const currentLevel = userDoc.level || 1;
            const newLevel = Math.floor((1 + Math.sqrt(1 + 4 * (currentXp / 1e3))) / 2);
            const updates = {
              streak_count: newStreak,
              last_claim_date: todayStr,
              xp: currentXp
            };
            if (newLevel > currentLevel) {
              updates.level = newLevel;
            }
            await updateUser(env.DB, auth.userId, updates);
            return json({
              success: true,
              data: {
                xpGained,
                newStreak,
                newTotalXp: currentXp,
                levelUp: newLevel > currentLevel ? newLevel : null
              }
            });
          } catch (e) {
            return json({ success: false, message: "Server error" }, { status: 500 });
          }
        }
        if (url.pathname === "/api/payments/plans" && request.method === "GET") {
          try {
            const results = await listPaymentPlans(env.DB);
            results.sort((a, b) => (a.price || 0) - (b.price || 0));
            return json({ success: true, plans: results });
          } catch (e) {
            return json({ success: false, plans: [] });
          }
        }
        if (url.pathname === "/api/payments/create-checkout-session" && request.method === "POST") {
          const auth = await requireAuthUserId(request, env);
          if ("error" in auth) return auth.error;
          if (!env.STRIPE_SECRET_KEY) {
            return json({ success: false, message: "Stripe not configured" }, { status: 500 });
          }
          try {
            const body = await request.json();
            const { planId, amount, type } = body;
            const planDoc = await getPaymentPlanById(env.DB, planId);
            if (!planDoc) {
              return json({ success: false, message: "Plan not found" }, { status: 404 });
            }
            const stripe = new stripe_esm_worker_default(env.STRIPE_SECRET_KEY, {
              apiVersion: "2024-04-10"
            });
            const durationDays = planDoc.duration_days || 30;
            const session = await stripe.checkout.sessions.create({
              payment_method_types: ["promptpay"],
              line_items: [
                {
                  price_data: {
                    currency: "thb",
                    product_data: {
                      name: planDoc.name,
                      description: `Subscription for ${durationDays} days`
                    },
                    unit_amount: Math.round(planDoc.price * 100)
                    // Stripe expects amount in smallest currency unit (satang)
                  },
                  quantity: 1
                }
              ],
              mode: "payment",
              success_url: `${url.origin}/pricing?success=true`,
              cancel_url: `${url.origin}/pricing?canceled=true`,
              metadata: {
                userId: auth.userId,
                planId,
                durationDays: String(durationDays),
                type: type || "subscription"
              }
            });
            const transactionData = {
              id: crypto.randomUUID(),
              user_id: auth.userId,
              plan_id: planId,
              amount: planDoc.price,
              payment_method: "promptpay",
              status: "pending",
              type: type || "subscription",
              session_id: session.id,
              created_at: (/* @__PURE__ */ new Date()).toISOString()
            };
            await createTransaction(env.DB, transactionData);
            return json({ url: session.url });
          } catch (e) {
            console.error("Stripe error:", e);
            return json({ success: false, message: e.message }, { status: 500 });
          }
        }
        if (url.pathname === "/api/payments/checkout" && request.method === "POST") {
          const auth = await requireAuthUserId(request, env);
          if ("error" in auth) return auth.error;
          try {
            const body = await request.json();
            const { plan_id, payment_method } = body;
            const planDoc = await getPaymentPlanById(env.DB, plan_id);
            if (!planDoc) {
              return json({ success: false, message: "Plan not found" }, { status: 404 });
            }
            const transactionData = {
              id: crypto.randomUUID(),
              user_id: auth.userId,
              plan_id,
              amount: planDoc.price,
              payment_method: payment_method || "transfer_slip",
              status: "pending",
              type: "subscription",
              created_at: (/* @__PURE__ */ new Date()).toISOString()
            };
            await createTransaction(env.DB, transactionData);
            return json({ success: true, transaction: transactionData });
          } catch (e) {
            return json({ success: false, message: e.message }, { status: 500 });
          }
        }
        const adminPlanMatch = url.pathname.match(/^\/api\/admin\/payments\/plans\/([^\/]+)$/);
        if (adminPlanMatch) {
          const auth = await requireAuthUserId(request, env);
          if ("error" in auth) return auth.error;
          const id = decodeURIComponent(adminPlanMatch[1]);
          if (request.method === "PUT") {
            const body = await request.json();
            await updatePaymentPlan(env.DB, id, { ...body, updated_at: (/* @__PURE__ */ new Date()).toISOString() });
            return json({ success: true });
          }
          if (request.method === "DELETE") {
            await deletePaymentPlan(env.DB, id);
            return json({ success: true });
          }
        } else if (url.pathname === "/api/admin/payments/plans") {
          const auth = await requireAuthUserId(request, env);
          if ("error" in auth) return auth.error;
          if (request.method === "GET") {
            try {
              const results = await listPaymentPlans(env.DB);
              return json({ success: true, plans: results });
            } catch (e) {
              return json({ success: true, plans: [] });
            }
          }
          if (request.method === "POST") {
            const body = await request.json();
            const planData = await createPaymentPlan(env.DB, { ...body, id: crypto.randomUUID(), created_at: (/* @__PURE__ */ new Date()).toISOString(), updated_at: (/* @__PURE__ */ new Date()).toISOString() });
            return json({ success: true, plan: planData });
          }
        }
        const assetMatch = url.pathname.match(/^\/api\/assets\/([^\/]+)$/);
        if (assetMatch) {
          const id = decodeURIComponent(assetMatch[1]);
          if (request.method === "DELETE") {
            const auth = await requireAuthUserId(request, env);
            if ("error" in auth) return auth.error;
            await deleteAsset(env.DB, id);
            return json({ success: true });
          }
        } else if (url.pathname === "/api/assets") {
          if (request.method === "GET") {
            try {
              const results = await listAssets(env.DB);
              return json({ success: true, data: results });
            } catch (e) {
              return json({ success: true, data: [] });
            }
          }
          if (request.method === "POST") {
            const auth = await requireAuthUserId(request, env);
            if ("error" in auth) return auth.error;
            const body = await request.json();
            const assetData = await createAsset(env.DB, { ...body, id: crypto.randomUUID(), created_at: (/* @__PURE__ */ new Date()).toISOString(), updated_at: (/* @__PURE__ */ new Date()).toISOString() });
            return json({ success: true, data: assetData });
          }
        }
        if (url.pathname === "/api/proxy") {
          if (request.method === "GET") {
            const targetUrl = url.searchParams.get("url");
            if (!targetUrl) return json({ error: "Missing URL" }, { status: 400 });
            try {
              const response = await fetch(targetUrl);
              const data = await response.text();
              return new Response(data, {
                headers: {
                  "Content-Type": response.headers.get("Content-Type") || "application/json",
                  "Access-Control-Allow-Origin": "*",
                  "Access-Control-Allow-Methods": "GET, OPTIONS",
                  "Access-Control-Allow-Headers": "*"
                }
              });
            } catch (e) {
              return json({ error: "Failed to fetch" }, { status: 500 });
            }
          }
        }
        if (url.pathname === "/api/admin/settings") {
          const auth = await requireAuthUserId(request, env);
          if ("error" in auth) return auth.error;
          if (request.method === "GET") {
            try {
              const settings = await getSystemConfig(env.DB, "general_settings");
              return json({ success: true, settings: settings || {} });
            } catch (e) {
              return json({ success: true, settings: {} });
            }
          }
          if (request.method === "PUT") {
            const body = await request.json();
            await upsertSystemConfig(env.DB, "general_settings", body);
            return json({ success: true, settings: body });
          }
        }
        if (url.pathname === "/api/public/settings") {
          if (request.method === "GET") {
            try {
              const settings = await getSystemConfig(env.DB, "general_settings");
              return json({ success: true, settings: settings || {} });
            } catch (e) {
              return json({ success: true, settings: {} });
            }
          }
        }
        if (url.pathname === "/api/legal/policy") {
          if (request.method === "GET") {
            try {
              const policy = await getSystemConfig(env.DB, "privacy_policy");
              return json({ success: true, content: policy?.content || "" });
            } catch (e) {
              return json({ success: false, error: e.message || String(e) }, { status: 500 });
            }
          }
          if (request.method === "PUT" || request.method === "POST") {
            try {
              const auth = await requireAuthUserId(request, env);
              if ("error" in auth) return auth.error;
              const body = await request.json();
              await upsertSystemConfig(env.DB, "privacy_policy", { content: body.content });
              return json({ success: true, message: "Policy updated" });
            } catch (e) {
              return json({ success: false, error: e.message || String(e) }, { status: 500 });
            }
          }
        }
        if (url.pathname === "/api/groups") return json({ success: true, groups: [] });
        if (url.pathname === "/api/community/tags/trending") return json([]);
        const cleanPathname = url.pathname.replace(/\/$/, "");
        if (cleanPathname === "/api/business" && request.method === "GET") {
          try {
            const search = url.searchParams.get("search");
            const category = url.searchParams.get("category");
            let businesses = await listBusinesses(env.DB, 50);
            if (category) {
              businesses = businesses.filter((b) => b.category === category);
            }
            if (search) {
              const searchLower = search.toLowerCase();
              businesses = businesses.filter(
                (b) => b.name && b.name.toLowerCase().includes(searchLower) || b.tagline && b.tagline.toLowerCase().includes(searchLower)
              );
            }
            return json({ success: true, businesses });
          } catch (err) {
            return json({ success: false, message: "Error fetching businesses.", error: String(err) }, { status: 500 });
          }
        }
        if (cleanPathname === "/api/business" && (request.method === "POST" || request.method === "PUT")) {
          const auth = await requireAuthUserId(request, env);
          if ("error" in auth) return auth.error;
          try {
            const body = await request.json();
            const business = await getBusinessByOwner(env.DB, auth.userId);
            if (request.method === "POST") {
              if (business) {
                return json({ success: false, message: "User already has a business page." }, { status: 400 });
              }
              const businessData = {
                owner_uid: auth.userId,
                name: body.name || "",
                tagline: body.tagline || null,
                category: body.category || null,
                contact_link: body.contact_link || null,
                contact_line_id: body.contact_line_id || null,
                contact_facebook_url: body.contact_facebook_url || null,
                status: "approved",
                stats: { followers: 0, views: 0, rating_avg: 0, rating_count: 0 },
                created_at: (/* @__PURE__ */ new Date()).toISOString(),
                updated_at: (/* @__PURE__ */ new Date()).toISOString()
              };
              const createdBusiness = await createBusiness(env.DB, businessData);
              return json({ success: true, business: createdBusiness }, { status: 201 });
            } else {
              if (!business) {
                return json({ success: false, message: "Business not found." }, { status: 404 });
              }
              const docId = business.id;
              const updateData = { updated_at: (/* @__PURE__ */ new Date()).toISOString() };
              if (body.name !== void 0) updateData.name = body.name;
              if (body.tagline !== void 0) updateData.tagline = body.tagline;
              if (body.about !== void 0) updateData.about = body.about;
              if (body.category !== void 0) updateData.category = body.category;
              if (body.contact_link !== void 0) updateData.contact_link = body.contact_link;
              if (body.contact_line_id !== void 0) updateData.contact_line_id = body.contact_line_id;
              if (body.contact_facebook_url !== void 0) updateData.contact_facebook_url = body.contact_facebook_url;
              if (body.logo_image !== void 0) updateData.logo_image = body.logo_image;
              if (body.cover_image !== void 0) updateData.cover_image = body.cover_image;
              const updated = await updateBusiness(env.DB, docId, updateData);
              return json({ success: true, message: "Business updated successfully", business: updated });
            }
          } catch (err) {
            return json({ success: false, message: "Error processing business.", error: String(err) }, { status: 500 });
          }
        }
        if (url.pathname === "/api/business/feed" && request.method === "GET") {
          try {
            const posts = await listBusinessPosts(env.DB, void 0, 50);
            const businessIds = Array.from(new Set(posts.map((p) => p.business_id).filter(Boolean)));
            const businessesMap = /* @__PURE__ */ new Map();
            for (const bid of businessIds) {
              const b = await getBusinessById(env.DB, String(bid));
              if (b) businessesMap.set(String(bid), b);
            }
            const feed = posts.map((p) => {
              const b = businessesMap.get(p.business_id);
              return {
                ...p,
                business_name: b ? b.name : "Unknown Business",
                business_logo: b ? b.logo_image : null
              };
            });
            return json({ success: true, feed });
          } catch (err) {
            return json({ success: true, feed: [] });
          }
        }
        if (url.pathname === "/api/business/my-business" && request.method === "GET") {
          const auth = await requireAuthUserId(request, env);
          if ("error" in auth) return auth.error;
          try {
            const business = await getBusinessByOwner(env.DB, auth.userId);
            if (!business) {
              return json({ success: false, message: "Business not found." }, { status: 404 });
            }
            return json({ success: true, business });
          } catch (err) {
            return json({ success: false, message: "Error fetching business.", error: String(err) }, { status: 500 });
          }
        }
        if (url.pathname === "/api/business/my-business" && request.method === "DELETE") {
          const auth = await requireAuthUserId(request, env);
          if ("error" in auth) return auth.error;
          try {
            const business = await getBusinessByOwner(env.DB, auth.userId);
            if (business) await deleteBusiness(env.DB, business.id);
            return json({ success: true, message: "Business page deleted" });
          } catch (err) {
            return json({ success: false, message: "Error deleting business", error: String(err) }, { status: 500 });
          }
        }
        if (url.pathname === "/api/ads/stats/daily-burn" && request.method === "GET") {
          return json([]);
        }
        if (url.pathname === "/api/ads/dashboard" && request.method === "GET") {
          return json({ activeAds: 0, totalViews: 0, totalClicks: 0, totalSpent: 0, dailyStats: [] });
        }
        if (url.pathname === "/api/ads/wallet" && request.method === "GET") {
          return json({ balance: 0, currency: "THB", businessName: "Business Name" });
        }
        if (url.pathname === "/api/business/inbox" && request.method === "GET") {
          return json({ success: true, conversations: [] });
        }
        if (url.pathname === "/api/ads/my-ads" && request.method === "GET") {
          return json([]);
        }
        if (url.pathname === "/api/ads/wallet/transactions" && request.method === "GET") {
          return json([]);
        }
        if (url.pathname === "/api/business/posts" && request.method === "GET") {
          try {
            const businessId = url.searchParams.get("business_id");
            if (!businessId) return json({ success: false, message: "business_id is required" }, { status: 400 });
            const posts = await listBusinessPosts(env.DB, businessId, 50);
            return json({ success: true, posts });
          } catch (err) {
            return json({ success: true, posts: [] });
          }
        }
        const businessMatch = url.pathname.match(/^\/api\/business\/([a-zA-Z0-9_:-]+)$/);
        if (businessMatch && request.method === "GET") {
          try {
            const id = businessMatch[1];
            const business = await getBusinessById(env.DB, id);
            if (!business) {
              return json({ success: false, message: "Business not found." }, { status: 404 });
            }
            return json({ success: true, business });
          } catch (err) {
            return json({ success: false, message: "Error fetching business.", error: String(err) }, { status: 500 });
          }
        }
        if (url.pathname === "/api/users/leaderboard") return json({ success: true, leaderboard: [] });
        if (url.pathname === "/api/ads/admin/stats" && request.method === "GET") {
          const auth = await requireAuthUserId(request, env);
          if ("error" in auth) return auth.error;
          try {
            const { results: revRes } = await env.DB.prepare("SELECT SUM(amount) as total FROM ad_transactions WHERE type='topup'").all();
            const totalRevenue = revRes[0]?.total || 0;
            const { results: sponsorRes } = await env.DB.prepare("SELECT COUNT(*) as count FROM businesses WHERE status='approved'").all();
            const activeSponsors = sponsorRes[0]?.count || 0;
            const { results: viewRes } = await env.DB.prepare("SELECT SUM(views) as total FROM ads").all();
            const totalViews = viewRes[0]?.total || 0;
            const revenueTrend = [
              { date: "Mon", revenue: 0 },
              { date: "Tue", revenue: 0 },
              { date: "Wed", revenue: 0 },
              { date: "Thu", revenue: 0 },
              { date: "Fri", revenue: 0 },
              { date: "Sat", revenue: 0 },
              { date: "Sun", revenue: totalRevenue }
            ];
            return json({ success: true, totalRevenue, activeSponsors, totalViews, revenueTrend });
          } catch (e) {
            return json({ success: false, error: String(e) }, { status: 500 });
          }
        }
        if (url.pathname === "/api/ads/admin/sponsors" && request.method === "GET") {
          const auth = await requireAuthUserId(request, env);
          if ("error" in auth) return auth.error;
          try {
            const { results } = await env.DB.prepare(`
                    SELECT b.id, b.name as businessName, b.contact_line_id as contact, b.balance, b.total_spent as totalSpent, b.status, b.created_at as joinDate,
                    (SELECT COUNT(*) FROM ads WHERE business_id = b.id AND status='active') as activeAds
                    FROM businesses b ORDER BY b.created_at DESC
                `).all();
            return json(results);
          } catch (e) {
            return json({ success: false, error: String(e) }, { status: 500 });
          }
        }
        if (url.pathname === "/api/ads/admin/pending" && request.method === "GET") {
          const auth = await requireAuthUserId(request, env);
          if ("error" in auth) return auth.error;
          try {
            const { results } = await env.DB.prepare(`
                    SELECT a.id, b.name as sponsorName, a.title, a.content, a.target_url as targetUrl, a.placement as type, a.budget, a.cpc, a.max_views as maxViews, a.created_at as submittedAt, a.status 
                    FROM ads a
                    LEFT JOIN businesses b ON a.business_id = b.id
                    WHERE a.status = 'pending'
                `).all();
            return json(results);
          } catch (e) {
            return json({ success: false, error: String(e) }, { status: 500 });
          }
        }
        if (url.pathname === "/api/ads/admin/config" && request.method === "GET") {
          try {
            const { results } = await env.DB.prepare("SELECT value FROM system_config WHERE key = 'ads_config'").all();
            if (results.length > 0 && results[0].value) {
              return json(JSON.parse(results[0].value));
            }
            return json({ communityViewCost: 0.1, communityClickCost: 5, newsViewCost: 0.15, newsClickCost: 6, resultViewCost: 0.2, resultClickCost: 8, inFeedFrequency: 10, adSenseBackupId: "", examResultSlotId: "", homeSlotId: "" });
          } catch (e) {
            return json({ success: false, error: String(e) }, { status: 500 });
          }
        }
        if (url.pathname === "/api/support/admin/tickets") {
          try {
            const results = await listTickets(env.DB);
            return json({ success: true, data: results });
          } catch (e) {
            return json({ success: false, data: [] });
          }
        }
        if (url.pathname === "/api/admin/backups") return json([]);
        if (url.pathname === "/api/admin/backups/logs") return json([]);
        if (url.pathname === "/api/support/tickets" && request.method === "POST") {
          try {
            const body = await readJson(request);
            const auth = await requireAuthUserId(request, env);
            const userId = "error" in auth ? "anonymous" : auth.userId;
            const ticket_id = Math.floor(Math.random() * 1e6).toString().padStart(6, "0");
            const ticketData = {
              id: ticket_id,
              ticket_id,
              subject: body?.subject || "\u0E41\u0E08\u0E49\u0E07\u0E1B\u0E31\u0E0D\u0E2B\u0E32",
              description: body?.description || "\u0E44\u0E21\u0E48\u0E21\u0E35\u0E23\u0E32\u0E22\u0E25\u0E30\u0E40\u0E2D\u0E35\u0E22\u0E14",
              category: body?.category || "general",
              attachment_url: body?.attachment_url || null,
              status: "open",
              user_id: userId,
              created_at: (/* @__PURE__ */ new Date()).toISOString(),
              updated_at: (/* @__PURE__ */ new Date()).toISOString()
            };
            const created = await createTicket(env.DB, ticketData);
            return json({ success: true, data: created });
          } catch (e) {
            return json({ success: false, message: "Failed to create ticket" }, { status: 500 });
          }
        }
        if (url.pathname === "/api/support/tickets/my" && request.method === "GET") {
          try {
            const auth = await requireAuthUserId(request, env);
            if ("error" in auth) return auth.error;
            const results = await listTickets(env.DB, auth.userId);
            results.sort((a, b) => {
              const tA = a.created_at ? new Date(a.created_at).getTime() : 0;
              const tB = b.created_at ? new Date(b.created_at).getTime() : 0;
              return tB - tA;
            });
            return json({ success: true, data: results });
          } catch (e) {
            return json({ success: false, data: [] });
          }
        }
        const ticketMatch = url.pathname.match(/^\/api\/support\/tickets\/([a-zA-Z0-9_-]+)$/);
        if (ticketMatch && request.method === "GET") {
          try {
            const ticketId = ticketMatch[1];
            const ticket = await getTicketById(env.DB, ticketId);
            if (!ticket) return json({ success: false, message: "Ticket not found" }, { status: 404 });
            const messages = await listTicketMessages(env.DB, ticketId);
            ticket.messages = messages || [];
            return json({ success: true, data: ticket });
          } catch (e) {
            return json({ success: false, message: "Server error" }, { status: 500 });
          }
        }
        const ticketStatusMatch = url.pathname.match(/^\/api\/support\/tickets\/([a-zA-Z0-9_-]+)\/status$/);
        if (ticketStatusMatch && request.method === "PATCH") {
          try {
            const auth = await requireAuthUserId(request, env);
            if ("error" in auth) return auth.error;
            const ticketId = ticketStatusMatch[1];
            const body = await readJson(request);
            await updateTicket(env.DB, ticketId, {
              status: body.status,
              updated_at: (/* @__PURE__ */ new Date()).toISOString()
            });
            return json({ success: true, message: "Status updated" });
          } catch (e) {
            return json({ success: false, message: "Failed to update status" }, { status: 500 });
          }
        }
        const ticketMessageMatch = url.pathname.match(/^\/api\/support\/tickets\/([a-zA-Z0-9_-]+)\/messages$/);
        if (ticketMessageMatch && request.method === "POST") {
          try {
            const auth = await requireAuthUserId(request, env);
            const userId = "error" in auth ? "anonymous" : auth.userId;
            const ticketId = ticketMessageMatch[1];
            const body = await readJson(request);
            const messageData = {
              message: body.message,
              user_id: userId,
              is_admin: body.is_admin || body.is_internal_note || false,
              is_internal_note: body.is_internal_note || false,
              created_at: (/* @__PURE__ */ new Date()).toISOString()
            };
            const created = await createTicketMessage(env.DB, ticketId, messageData);
            await updateTicket(env.DB, ticketId, {
              updated_at: (/* @__PURE__ */ new Date()).toISOString()
            });
            return json({ success: true, data: created });
          } catch (e) {
            console.error("Add message error:", e);
            return json({ success: false, message: "Failed to add message" }, { status: 500 });
          }
        }
        if (url.pathname === "/api/admin/payments") return json(await listPayments(env.DB, void 0, 100));
        if (url.pathname === "/api/admin/ads/pending") return json([]);
        if (url.pathname === "/api/news/sources/all") {
          const { results } = await env.DB.prepare("SELECT * FROM news_sources ORDER BY name ASC").all();
          return json({ success: true, data: results || [] });
        }
        if (url.pathname === "/api/assets") return json({ success: true, data: [] });
        if (url.pathname === "/api/admin/stats" && request.method === "GET") {
          const auth = await requireAuthUserId(request, env);
          if ("error" in auth) return auth.error;
          try {
            const now = /* @__PURE__ */ new Date();
            const startOfDay = new Date(now);
            startOfDay.setHours(0, 0, 0, 0);
            const totalUsersRes = await env.DB.prepare("SELECT COUNT(*) AS c FROM users").first();
            const premiumUsersRes = await env.DB.prepare("SELECT COUNT(*) AS c FROM users WHERE plan_type = 'premium'").first();
            const activeUsersRes = await env.DB.prepare("SELECT COUNT(*) AS c FROM users WHERE last_active_at >= ?").bind(startOfDay.toISOString()).first();
            const totalUsers = Number(totalUsersRes?.c || 0);
            const premiumUsers = Number(premiumUsersRes?.c || 0);
            const realActiveUsers = Number(activeUsersRes?.c || 0);
            const currentMonth = now.getMonth();
            const currentYear = now.getFullYear();
            const payments = await listPayments(env.DB, void 0, 200);
            const trendMap = {};
            for (let i = 5; i >= 0; i--) {
              const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
              const monthName = d.toLocaleString("default", { month: "short" });
              trendMap[`${d.getFullYear()}-${d.getMonth()}`] = { name: monthName, value: 0 };
            }
            payments.forEach((doc) => {
              const amount = Number(doc.amount) || 0;
              const status = (doc.status || "unknown").toLowerCase();
              let created_at = /* @__PURE__ */ new Date();
              if (doc.created_at) {
                if (typeof doc.created_at === "string") created_at = new Date(doc.created_at);
                else if (doc.created_at._seconds) created_at = new Date(doc.created_at._seconds * 1e3);
              }
              if (status === "approved" || status === "completed" || status === "success") {
                const key = `${created_at.getFullYear()}-${created_at.getMonth()}`;
                if (trendMap[key]) {
                  trendMap[key].value += amount;
                }
              }
            });
            const startOfYear = new Date(currentYear, 0, 1).toISOString();
            const startOfMonth = new Date(currentYear, currentMonth, 1).toISOString();
            const successStatuses = ["approved", "completed", "success"];
            const revenueQuery = /* @__PURE__ */ __name(async (statuses, dateStart) => {
              const placeholders = statuses.map(() => "?").join(", ");
              const sql = dateStart ? `SELECT COALESCE(SUM(amount), 0) AS total FROM payments WHERE lower(status) IN (${placeholders}) AND created_at >= ?` : `SELECT COALESCE(SUM(amount), 0) AS total FROM payments WHERE lower(status) IN (${placeholders})`;
              const stmt = env.DB.prepare(sql);
              const row = dateStart ? await stmt.bind(...statuses.map((s) => s.toLowerCase()), dateStart).first() : await stmt.bind(...statuses.map((s) => s.toLowerCase())).first();
              return Number(row?.total || 0);
            }, "revenueQuery");
            const [pendingRevenue, totalRevenue, yearlyRevenue, monthlyRevenue] = await Promise.all([
              revenueQuery(["pending"]),
              revenueQuery(successStatuses),
              revenueQuery(successStatuses, startOfYear),
              revenueQuery(successStatuses, startOfMonth)
            ]);
            const thirtyDaysAgo = new Date(now);
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            const mauRes = await env.DB.prepare("SELECT COUNT(*) AS c FROM users WHERE last_active_at >= ?").bind(thirtyDaysAgo.toISOString()).first();
            const mau = Number(mauRes?.c || 0);
            const oneDayAgo = new Date(now);
            oneDayAgo.setHours(oneDayAgo.getHours() - 24);
            const reportsRes = await env.DB.prepare("SELECT COUNT(*) AS c FROM tickets WHERE created_at >= ?").bind(oneDayAgo.toISOString()).first();
            const recentReports = Number(reportsRes?.c || 0);
            const engagement = totalUsers > 0 ? Math.round(mau / totalUsers * 100) : 0;
            const commercialViability = Object.values(trendMap).map((t) => ({
              name: t.name,
              value: Math.round((t.value > 0 ? 60 : 40) + Math.random() * 20)
            }));
            const painPointsRes = await env.DB.prepare(`
                    SELECT COALESCE(r.subject, r.title) as subject, AVG(er.score * 100.0 / NULLIF(er.total_score, 0)) as avg_score
                    FROM exam_results er
                    JOIN exam_rooms r ON er.classroom_id = r.id
                    WHERE er.total_score > 0
                    GROUP BY r.subject, r.title
                    ORDER BY avg_score ASC
                    LIMIT 3
                `).all();
            const painPoints = painPointsRes.results.length > 0 ? painPointsRes.results.map((r) => ({ subject: (r.subject || "Unknown").substring(0, 15), score: Math.round(Number(r.avg_score) || 0) })) : [{ subject: "Math", score: 45 }, { subject: "Physics", score: 55 }];
            return json({
              revenue: {
                total: totalRevenue,
                monthly: monthlyRevenue,
                yearly: yearlyRevenue,
                pending: pendingRevenue,
                trend: Object.values(trendMap)
              },
              conversionRate: totalUsers > 0 ? (premiumUsers / totalUsers * 100).toFixed(1) : 0,
              activeUsers: realActiveUsers,
              commercialViability,
              painPoints,
              communityHealth: {
                recentReports,
                mau,
                engagement,
                sentiment: engagement > 50 ? "Positive" : "Neutral"
              }
            });
          } catch (err) {
            console.error("Admin stats error:", err);
            return json({
              revenue: { total: 0, monthly: 0, yearly: 0, pending: 0, trend: [] },
              conversionRate: 0,
              activeUsers: 0,
              commercialViability: [],
              painPoints: [],
              communityHealth: { recentReports: 0, mau: 0, engagement: 0, sentiment: "Neutral" },
              error: "failed to fetch stats",
              details: err.message
            });
          }
        }
        const adminUserLogsMatch = url.pathname.match(/^\/api\/admin\/users\/([a-zA-Z0-9_-]+)\/logs$/);
        if (adminUserLogsMatch && request.method === "GET") {
          const auth = await requireAuthUserId(request, env);
          if ("error" in auth) return auth.error;
          const userId = adminUserLogsMatch[1];
          const fetchLogs = /* @__PURE__ */ __name(async (value) => {
            const rawUserId = value?.stringValue ?? value?.integerValue ?? value;
            const { results: results1 } = await env.DB.prepare("SELECT * FROM system_logs WHERE user_id = ? ORDER BY datetime(created_at) DESC LIMIT 10").bind(String(rawUserId)).all();
            const { results: results2 } = await env.DB.prepare("SELECT doc_id as id, json_extract(data, '$.action') as action, json_extract(data, '$.user_id') as user_id, json_extract(data, '$.details') as details, json_extract(data, '$.created_at') as created_at FROM firestore_documents WHERE collection_path = 'system_logs' AND json_extract(data, '$.user_id') = ? ORDER BY datetime(created_at) DESC LIMIT 10").bind(String(rawUserId)).all();
            const combined = [...results1 || [], ...results2 || []].sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()).slice(0, 10);
            return combined;
          }, "fetchLogs");
          const logsA = await fetchLogs({ stringValue: userId });
          const numericId = /^[0-9]+$/.test(userId) ? userId : null;
          const logsB = numericId ? await fetchLogs({ integerValue: numericId }) : [];
          const merged = /* @__PURE__ */ new Map();
          for (const l of [...logsA, ...logsB]) {
            const key = String(l.doc_id || l.id || "");
            if (!key) continue;
            merged.set(key, l);
          }
          const logs = Array.from(merged.values()).sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()).slice(0, 10);
          return json({ success: true, logs });
        }
        const adminUserHistoryMatch = url.pathname.match(/^\/api\/admin\/users\/([a-zA-Z0-9_-]+)\/history$/);
        if (adminUserHistoryMatch && request.method === "GET") {
          const auth = await requireAuthUserId(request, env);
          if ("error" in auth) return auth.error;
          const id = adminUserHistoryMatch[1];
          const userDoc = await getUserById(env.DB, id);
          if (!userDoc) return json({ message: "User not found" }, { status: 404 });
          const examHistory = await listExamResultsByUser(env.DB, id, 20);
          const paymentHistory = await listPayments(env.DB, id, 10);
          return json({ success: true, user: userDoc, examHistory, paymentHistory });
        }
        const adminUserStatusMatch = url.pathname.match(/^\/api\/admin\/users\/([a-zA-Z0-9_-]+)\/status$/);
        if (adminUserStatusMatch && request.method === "PUT") {
          const auth = await requireAuthUserId(request, env);
          if ("error" in auth) return auth.error;
          const body = await request.json();
          await updateUser(env.DB, adminUserStatusMatch[1], { status: body.status });
          return json({ success: true });
        }
        const adminUserPermMatch = url.pathname.match(/^\/api\/admin\/users\/([a-zA-Z0-9_-]+)\/permissions$/);
        if (adminUserPermMatch && request.method === "PUT") {
          const auth = await requireAuthUserId(request, env);
          if ("error" in auth) return auth.error;
          const body = await request.json();
          await updateUser(env.DB, adminUserPermMatch[1], { admin_permissions: body.permissions });
          return json({ success: true });
        }
        const adminUserUpdateMatch = url.pathname.match(/^\/api\/admin\/users\/([a-zA-Z0-9_-]+)$/);
        if (adminUserUpdateMatch && request.method === "PUT") {
          const auth = await requireAuthUserId(request, env);
          if ("error" in auth) return auth.error;
          const body = await request.json();
          await updateUser(env.DB, adminUserUpdateMatch[1], body);
          return json({ success: true });
        }
        if (url.pathname === "/api/admin/messages" && request.method === "GET") {
          const auth = await requireAuthUserId(request, env);
          if ("error" in auth) return auth.error;
          try {
            const { results: messages } = await env.DB.prepare("SELECT * FROM contact_messages ORDER BY datetime(created_at) DESC LIMIT 50").all();
            const formattedMessages = messages.map((doc) => ({
              id: doc.id,
              type: doc.type || (doc.user_id ? "User" : "Visitor"),
              subject: doc.subject || "No Subject",
              from: doc.email || doc.name || "Unknown",
              content: doc.message || doc.content || "",
              is_read: doc.is_read || false,
              created_at: doc.created_at
            }));
            return json(formattedMessages);
          } catch (e) {
            try {
              const { results: messages } = await env.DB.prepare("SELECT * FROM contact_messages LIMIT 50").all();
              const formattedMessages = messages.map((doc) => ({
                id: doc.id,
                type: doc.type || (doc.user_id ? "User" : "Visitor"),
                subject: doc.subject || "No Subject",
                from: doc.email || doc.name || "Unknown",
                content: doc.message || doc.content || "",
                is_read: doc.is_read || false,
                created_at: doc.created_at
              }));
              return json(formattedMessages.sort((a, b) => {
                const aSec = a.created_at?._seconds || 0;
                const bSec = b.created_at?._seconds || 0;
                return bSec - aSec;
              }));
            } catch (err) {
              return json({ error: "failed to fetch messages" }, { status: 500 });
            }
          }
        }
        if (url.pathname === "/api/admin/messages/broadcast" && request.method === "POST") {
          const auth = await requireAuthUserId(request, env);
          if ("error" in auth) return auth.error;
          return json({ success: true, message: "Broadcast sent" });
        }
        if (url.pathname === "/api/admin/users" && request.method === "GET") {
          const auth = await requireAuthUserId(request, env);
          if ("error" in auth) return auth.error;
          const users = await listUsers(env.DB, 1e4);
          return json(users);
        }
        if (url.pathname === "/api/admin/seasons" && request.method === "GET") {
          const auth = await requireAuthUserId(request, env);
          if ("error" in auth) return auth.error;
          try {
            const seasons = await listSeasons(env.DB);
            return json({ success: true, data: seasons });
          } catch (e) {
            return json({ success: true, data: [] });
          }
        }
        if (url.pathname === "/api/admin/seasons" && request.method === "POST") {
          const auth = await requireAuthUserId(request, env);
          if ("error" in auth) return auth.error;
          const body = await readJson(request);
          await completeActiveSeasons(env.DB, (/* @__PURE__ */ new Date()).toISOString());
          const id = body.id || String((/* @__PURE__ */ new Date()).getFullYear());
          const newSeason = await createSeason(env.DB, {
            id,
            name: body.name || `Season ${id}`,
            start_date: (/* @__PURE__ */ new Date()).toISOString(),
            status: "active",
            responsible_admin_id: body.responsible_admin_id || auth.userId,
            created_at: (/* @__PURE__ */ new Date()).toISOString(),
            updated_at: (/* @__PURE__ */ new Date()).toISOString()
          });
          return json({ success: true, data: newSeason });
        }
        const seasonMatch = url.pathname.match(/^\/api\/admin\/seasons\/([a-zA-Z0-9_-]+)$/);
        if (seasonMatch && request.method === "PUT") {
          const auth = await requireAuthUserId(request, env);
          if ("error" in auth) return auth.error;
          const id = seasonMatch[1];
          const body = await readJson(request);
          const season = await getSeasonById(env.DB, id);
          if (!season) return json({ success: false, message: "Season not found" }, { status: 404 });
          await updateSeason(env.DB, id, { ...body, updated_at: (/* @__PURE__ */ new Date()).toISOString() });
          return json({ success: true });
        }
        if (url.pathname === "/api/admin/businesses" && request.method === "GET") {
          const auth = await requireAuthUserId(request, env);
          if ("error" in auth) return auth.error;
          const businesses = await listBusinesses(env.DB, 100);
          businesses.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
          return json(businesses);
        }
        if (url.pathname === "/api/admin/payments" && request.method === "GET") {
          const auth = await requireAuthUserId(request, env);
          if ("error" in auth) return auth.error;
          const payments = await listPayments(env.DB, void 0, 100);
          return json(payments);
        }
        if (url.pathname === "/api/admin/threads" && request.method === "GET") {
          const auth = await requireAuthUserId(request, env);
          if ("error" in auth) return auth.error;
          const threads = await listThreads(env.DB, 100);
          return json({ threads, pagination: { page: 1, totalPages: 1, total: threads.length } });
        }
        if (url.pathname === "/api/admin/migrate-news" && request.method === "POST") {
          const auth = await requireAdmin(request, env);
          if ("error" in auth) return auth.error;
          return json({ success: true, message: "News already runs on D1." });
        }
        if (url.pathname === "/api/admin/scraper/start" && request.method === "POST") {
          mockScraperRunning = true;
          const addLog = /* @__PURE__ */ __name((msg) => {
            const now = (/* @__PURE__ */ new Date()).toLocaleString("en-GB", { timeZone: "Asia/Bangkok" });
            mockScraperLogs.push(`[${now}] ${msg}`);
          }, "addLog");
          mockScraperLogs = [];
          addLog("[System] Initiating Real OCSC Scraper job...");
          addLog("[System] Connecting to data source (job.ocsc.go.th)...");
          const runScraper = /* @__PURE__ */ __name(async () => {
            try {
              addLog("[Network] Fetching latest announcements from OCSC...");
              const targetUrl = "https://jobapp.ocsc.go.th/jobapi/portal/jobs";
              console.log("Fetching URL:", targetUrl);
              const res = await fetch(targetUrl, {
                headers: {
                  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
                }
              });
              if (!res.ok) {
                addLog(`[Error] OCSC API returned status ${res.status}.`);
                mockScraperRunning = false;
                return;
              }
              const jsonResponse = await res.json();
              addLog("[Data] Parsing JSON elements...");
              if (!Array.isArray(jsonResponse) || jsonResponse.length === 0) {
                console.log("Warning: No jobs found or API structure changed.");
                addLog("[Warning] No jobs found or API structure changed.");
                mockScraperRunning = false;
                return;
              }
              let parsedJobs = [];
              for (const item of jsonResponse) {
                parsedJobs.push({
                  id: item.id,
                  category: "\u0E07\u0E32\u0E19\u0E23\u0E32\u0E0A\u0E01\u0E32\u0E23",
                  // Force this category
                  position: item.position,
                  department: item.department,
                  ministry: item.ministry,
                  recruitment_type: item.jobCategoryId === 1 ? "\u0E02\u0E49\u0E32\u0E23\u0E32\u0E0A\u0E01\u0E32\u0E23\u0E1E\u0E25\u0E40\u0E23\u0E37\u0E2D\u0E19" : "\u0E1E\u0E19\u0E31\u0E01\u0E07\u0E32\u0E19\u0E23\u0E32\u0E0A\u0E01\u0E32\u0E23",
                  agency_logo: item.seal,
                  location: item.address,
                  vacancy_count: item.positionAmount,
                  start_date: item.applicationStartPrint,
                  end_date: item.applicationEndPrint,
                  vacancy: item.positionAmount ? `${item.positionAmount} \u0E2D\u0E31\u0E15\u0E23\u0E32` : "\u0E44\u0E21\u0E48\u0E23\u0E30\u0E1A\u0E38"
                });
              }
              addLog(`[Data] Extracted ${parsedJobs.length} jobs. Checking for duplicates in Database...`);
              let addedCount = 0;
              let skipCount = 0;
              const { results } = await env.DB.prepare("SELECT external_link FROM news WHERE author = '\u0E23\u0E30\u0E1A\u0E1A\u0E2D\u0E31\u0E15\u0E42\u0E19\u0E21\u0E31\u0E15\u0E34 (OCSC)'").all();
              const existingLinks = new Set(results.map((j) => j.external_link).filter(Boolean));
              const newDocs = [];
              for (const job of parsedJobs) {
                const externalLink = "https://job.ocsc.go.th/portal/jobs/" + job.id;
                if (existingLinks.has(externalLink)) {
                  skipCount++;
                  continue;
                }
                const newDoc = {
                  id: crypto.randomUUID(),
                  title: job.position,
                  content: `\u0E23\u0E31\u0E1A\u0E2A\u0E21\u0E31\u0E04\u0E23 ${job.vacancy}`,
                  category: job.category,
                  agency: job.department,
                  author: "\u0E23\u0E30\u0E1A\u0E1A\u0E2D\u0E31\u0E15\u0E42\u0E19\u0E21\u0E31\u0E15\u0E34 (OCSC)",
                  external_link: externalLink,
                  status: "published",
                  application_start: job.start_date,
                  application_end: job.end_date,
                  metadata: {
                    ministry: job.ministry,
                    department: job.department,
                    organization: job.department,
                    position_type: job.recruitment_type,
                    agency_logo: job.agency_logo,
                    location: job.location,
                    vacancy_count: job.vacancy_count
                  },
                  created_at: (/* @__PURE__ */ new Date()).toISOString(),
                  updated_at: (/* @__PURE__ */ new Date()).toISOString()
                };
                newDocs.push(newDoc);
                existingLinks.add(externalLink);
              }
              if (newDocs.length > 0) {
                addLog(`[System] Batch inserting ${newDocs.length} new jobs...`);
                const stmt = env.DB.prepare(`
                            INSERT INTO news (id, title, content, category, agency, author, external_link, status, application_start, application_end, metadata, created_at, updated_at)
                            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                        `);
                const batch = newDocs.map((doc) => stmt.bind(
                  doc.id,
                  doc.title,
                  doc.content,
                  doc.category,
                  doc.agency,
                  doc.author,
                  doc.external_link,
                  doc.status,
                  doc.application_start,
                  doc.application_end,
                  JSON.stringify(doc.metadata),
                  doc.created_at,
                  doc.updated_at
                ));
                await env.DB.batch(batch);
                addedCount = newDocs.length;
              }
              console.log(`Saved ${addedCount} new announcements. Skipped ${skipCount} duplicates.`);
              addLog(`[Data] Saved ${addedCount} new announcements. Skipped ${skipCount} duplicates.`);
              mockScraperRunning = false;
              addLog("[System] Scraper job completed successfully.");
            } catch (e) {
              console.error("Scraper Error Caught:", e);
              addLog("[Error] Failed to process scraper job: " + String(e));
              mockScraperRunning = false;
            }
          }, "runScraper");
          ctx.waitUntil(runScraper());
          return json({ success: true, message: "Scraper started" });
        }
        if (url.pathname === "/api/admin/scraper/status") {
          return json({ success: true, data: { isRunning: mockScraperRunning, logs: mockScraperLogs } });
        }
        if (url.pathname === "/api/admin/scraper/schedule" && request.method === "POST") {
          const body = await request.json();
          return json({ success: true, message: "Schedule updated to " + (body.frequency || "unknown") });
        }
        if (url.pathname === "/api/admin/generator/start" && request.method === "POST") {
          if (aiGeneratorState.isRunning) {
            return json({ success: false, message: "Generator is already running" }, { status: 400 });
          }
          const prompt = "\u0E2A\u0E23\u0E49\u0E32\u0E07\u0E02\u0E49\u0E2D\u0E2A\u0E2D\u0E1A\u0E41\u0E1A\u0E1A\u0E2A\u0E38\u0E48\u0E21 10 \u0E02\u0E49\u0E2D";
          ctx.waitUntil(runAIGenerator(prompt, env));
          return json({ success: true, message: "Generator started" });
        }
        if (url.pathname === "/api/admin/generator/status") {
          let statusDoc = { isRunning: aiGeneratorState.isRunning, logs: aiGeneratorState.logs };
          try {
            const doc = await getSystemConfig(env.DB, "generator_status");
            if (doc) statusDoc = doc;
          } catch (e) {
          }
          return json({ success: true, data: statusDoc });
        }
        if (url.pathname === "/api/terminal/status") return json({ status: "online" });
        if (url.pathname === "/api/terminal/command" && request.method === "POST") {
          const body = await request.json();
          const cmd = body.command?.trim() || "";
          if (cmd === "status") {
            return json({ message: ">>> Status: Ready (Active Provider: Google Gemini)" });
          }
          if (cmd.startsWith("gen ")) {
            if (aiGeneratorState.isRunning) {
              return json({ message: ">>> Error: Generator is already running. Please wait." });
            }
            const prompt = cmd.substring(4).trim();
            ctx.waitUntil(runAIGenerator(prompt, env));
            return json({ message: `>>> Initiating AI generation for prompt: "${prompt}"... Check the status panel for progress.` });
          }
          return json({ message: `>>> Unknown command: ${cmd}` });
        }
        if (url.pathname === "/api/admin/jobs/cleanup" && request.method === "POST") {
          const result = await cleanupExpiredJobs(env);
          return json({ success: true, count: result });
        }
      } catch (err) {
        return json({ success: false, message: err.message }, { status: 500 });
      }
    }
    return fetch(request);
  },
  async scheduled(event, env, ctx) {
    console.log("Running scheduled job cleanup at", (/* @__PURE__ */ new Date()).toISOString());
    await cleanupExpiredJobs(env);
    await cleanupExpiredRooms(env);
    await cleanupExpiredPremium(env);
  }
};
async function cleanupExpiredJobs(env) {
  const parseThaiDate = /* @__PURE__ */ __name((dateStr) => {
    if (!dateStr) return null;
    const parts = dateStr.split(" ");
    if (parts.length < 3) return null;
    const day = parseInt(parts[0], 10);
    const months = ["\u0E21.\u0E04.", "\u0E01.\u0E1E.", "\u0E21\u0E35.\u0E04.", "\u0E40\u0E21.\u0E22.", "\u0E1E.\u0E04.", "\u0E21\u0E34.\u0E22.", "\u0E01.\u0E04.", "\u0E2A.\u0E04.", "\u0E01.\u0E22.", "\u0E15.\u0E04.", "\u0E1E.\u0E22.", "\u0E18.\u0E04."];
    const monthIndex = months.findIndex((m) => parts[1].includes(m));
    if (monthIndex === -1) return null;
    let year = parseInt(parts[2], 10);
    if (year > 2500) year -= 543;
    const d = /* @__PURE__ */ new Date();
    d.setFullYear(year, monthIndex, day);
    d.setHours(23, 59, 59, 999);
    return d;
  }, "parseThaiDate");
  try {
    const { results: news } = await env.DB.prepare("SELECT id, category, status, application_end FROM news LIMIT 500").all();
    const now = /* @__PURE__ */ new Date();
    let expiredCount = 0;
    for (const job of news || []) {
      if (job.category === "\u0E07\u0E32\u0E19\u0E23\u0E32\u0E0A\u0E01\u0E32\u0E23" && job.status !== "expired" && job.application_end) {
        const endD = parseThaiDate(job.application_end);
        if (endD && endD < now) {
          await env.DB.prepare("UPDATE news SET status = ?, updated_at = ? WHERE id = ?").bind("expired", (/* @__PURE__ */ new Date()).toISOString(), job.id).run();
          expiredCount++;
        }
      }
    }
    console.log(`Job cleanup completed. Marked ${expiredCount} jobs as expired.`);
    return expiredCount;
  } catch (e) {
    console.error("Scheduled job cleanup failed", e);
    return 0;
  }
}
__name(cleanupExpiredJobs, "cleanupExpiredJobs");
async function cleanupExpiredRooms(env) {
  try {
    const rooms = await listExamRooms(env.DB, 1e3);
    const now = (/* @__PURE__ */ new Date()).getTime();
    let deletedCount = 0;
    const oneDayMs = 24 * 60 * 60 * 1e3;
    for (const room of rooms) {
      const createdAt = new Date(String(room.created_at || room.updated_at || Date.now())).getTime();
      if (now - createdAt > oneDayMs) {
        await deleteExamRoom(env.DB, room.id);
        deletedCount++;
      }
    }
    console.log(`Room cleanup completed. Deleted ${deletedCount} expired rooms.`);
    return deletedCount;
  } catch (e) {
    console.error("Scheduled room cleanup failed", e);
    return 0;
  }
}
__name(cleanupExpiredRooms, "cleanupExpiredRooms");
async function cleanupExpiredPremium(env) {
  const now = (/* @__PURE__ */ new Date()).toISOString();
  await env.DB.prepare("UPDATE users SET plan_type = 'free', premium_expiry = NULL, premium_start_date = NULL WHERE plan_type = 'premium' AND premium_expiry < ?").bind(now).run();
}
__name(cleanupExpiredPremium, "cleanupExpiredPremium");
export {
  RealtimeDO,
  index_default as default
};
//# sourceMappingURL=index.js.map
