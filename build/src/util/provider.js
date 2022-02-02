"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var PROVIDERS = JSON.stringify([
    "https://bsc-dataseed1.ninicoin.io"
]);
var EDGE_CACHE_TTL = 60;
var BROWSER_CACHE_TTL = 0;
var PROVIDER_TIMEOUT = 5000;
var RequestError = /** @class */ (function (_super) {
    __extends(RequestError, _super);
    function RequestError(message, code, data) {
        var _this = _super.call(this) || this;
        // @ts-ignore
        _this.code = code;
        // @ts-ignore
        _this.data = data;
        _this.name = _this.constructor.name;
        _this.message = message;
        return _this;
    }
    return RequestError;
}(Error));
/**
 * sha256 encodes a given string message
 * @param {string} message
 * Borrowed from
 * https://developers.cloudflare.com/workers/examples/cache-api
 */
function sha256(message) {
    return __awaiter(this, void 0, void 0, function () {
        var msgBuffer, hashBuffer, hashArray, hashHex;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    msgBuffer = new TextEncoder().encode(message);
                    return [4 /*yield*/, crypto.subtle.digest("SHA-256", msgBuffer)
                        // convert ArrayBuffer to Array
                    ];
                case 1:
                    hashBuffer = _d.sent();
                    hashArray = Array.from(new Uint8Array(hashBuffer));
                    hashHex = hashArray.map(function (b) { return ("00" + b.toString(16)).slice(-2); }).join("");
                    return [2 /*return*/, hashHex];
            }
        });
    });
}
/**
 * Wrapper around fetch with an optional timeout
 * @param {Url} url
 * @param {Request} request
 * @param {number} timeout
 */
function fetchWithTimeout(url, request, timeout) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_d) {
            return [2 /*return*/, Promise.race([
                    fetch(url, request),
                    new Promise(function (_, reject) {
                        return setTimeout(function () { return reject(new Error('Timeout')); }, timeout);
                    })
                ])];
        });
    });
}
var Provider = /** @class */ (function () {
    function Provider(url) {
        var _this = this;
        EDGE_CACHE_TTL = EDGE_CACHE_TTL || 60;
        BROWSER_CACHE_TTL = BROWSER_CACHE_TTL || 0;
        PROVIDER_TIMEOUT = PROVIDER_TIMEOUT || 5000;
        var providers = JSON.parse(PROVIDERS);
        url = new URL(providers[Math.floor(Math.random() * providers.length)]);
        // @ts-ignore
        this.isMetaMask = false;
        // @ts-ignore
        this.send = function (request, callback) {
            // console.log('sendAsync', request);
            // @ts-ignore
            _this.request(request)
                .then(function (result) { return callback(null, { jsonrpc: '2.0', id: request.id, result: result }); })
                .catch(function (error) { return callback(error, null); });
        };
        // @ts-ignore
        this.sendAsync = function (request, callback) {
            // console.log('sendAsync', request);
            // @ts-ignore
            _this.request(request)
                .then(function (result) { return callback(null, { jsonrpc: '2.0', id: request.id, result: result }); })
                .catch(function (error) { return callback(error, null); });
        };
        // @ts-ignore
        this.request = function (request) { return __awaiter(_this, void 0, void 0, function () {
            var _a, _b, _c, headers, cache, url, body, response, hash, cacheUrl, cacheKey, fullBody_1, cacheHeaders_1, parsed_1, fullBody, cacheHeaders;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        // if (typeof method !== 'string') {
                        //   params = method.params;
                        //   method = method.method;
                        // }
                        request.jsonrpc = "2.0";
                        request.id = 56;
                        headers = {
                            'Content-Type': 'application/json'
                        };
                        cache = {};
                        url = this.url;
                        body = JSON.stringify(request);
                        return [4 /*yield*/, sha256(body)];
                    case 1:
                        hash = _d.sent();
                        cacheUrl = new URL(url);
                        cacheUrl.pathname = "/posts" + cacheUrl.pathname + hash;
                        cacheKey = new Request(cacheUrl.toString(), {
                            headers: headers,
                            method: 'GET',
                        });
                        return [4 /*yield*/, cache.match(cacheKey)];
                    case 2:
                        response = _d.sent();
                        if (!!response) return [3 /*break*/, 7];
                        return [4 /*yield*/, fetch(url, {
                                method: 'POST',
                                headers: headers,
                                body: JSON.stringify(request)
                            })];
                    case 3:
                        response = _d.sent();
                        if (!!response.ok) return [3 /*break*/, 7];
                        if (!(response.status === 403)) return [3 /*break*/, 6];
                        fullBody_1 = JSON.stringify({});
                        cacheHeaders_1 = { 'Cache-Control': "public, max-age=".concat(EDGE_CACHE_TTL) };
                        return [4 /*yield*/, cache.put(cacheKey, new Response(fullBody_1, __assign(__assign({}, response), { headers: cacheHeaders_1 })))];
                    case 4:
                        _d.sent();
                        url = new URL(providers[Math.floor(Math.random() * providers.length)]);
                        // @ts-ignore
                        this.url = url;
                        parsed_1 = new URL(url);
                        // @ts-ignore
                        this.host = parsed_1.host;
                        // @ts-ignore
                        this.path = parsed_1.pathname;
                        return [4 /*yield*/, this.request(request)];
                    case 5: 
                    // @ts-ignore
                    return [2 /*return*/, _d.sent()];
                    case 6: 
                    // @ts-ignore
                    throw new RequestError("".concat(response.status, ": ").concat(response.statusText), -32000);
                    case 7: return [4 /*yield*/, response.text()];
                    case 8:
                        // if(response.headers['content-encoding'] == 'gzip'){
                        //   await new Promise(resolve => {
                        //   zlib.gunzip(body, function(err, dezipped) {
                        //     resolve(dezipped.toString());
                        //   });
                        //   })
                        // } else {
                        //   callback(body);
                        // }
                        body = _d.sent();
                        try {
                            body = JSON.parse(body);
                        }
                        catch (e) {
                            // @ts-ignore
                            body = {};
                        }
                        fullBody = JSON.stringify(body);
                        cacheHeaders = { 'Cache-Control': "public, max-age=".concat(EDGE_CACHE_TTL) };
                        return [4 /*yield*/, cache.put(cacheKey, new Response(fullBody, __assign(__assign({}, response), { headers: cacheHeaders })))
                            // @ts-ignore
                        ];
                    case 9:
                        _d.sent();
                        // @ts-ignore
                        if ('error' in body) {
                            // @ts-ignore
                            throw new RequestError((_a = body === null || body === void 0 ? void 0 : body.error) === null || _a === void 0 ? void 0 : _a.message, (_b = body === null || body === void 0 ? void 0 : body.error) === null || _b === void 0 ? void 0 : _b.code, (_c = body === null || body === void 0 ? void 0 : body.error) === null || _c === void 0 ? void 0 : _c.data);
                        }
                        else {
                            // @ts-ignore
                            return [2 /*return*/, body.result];
                        }
                        return [2 /*return*/];
                }
            });
        }); };
        // this.chainId = chainId;
        // @ts-ignore
        this.url = url;
        var parsed = new URL(url);
        // @ts-ignore
        this.host = parsed.host;
        // @ts-ignore
        this.path = parsed.pathname;
    }
    return Provider;
}());
exports.default = Provider;
