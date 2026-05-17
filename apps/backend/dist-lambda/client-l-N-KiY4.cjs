const require_chunk = require("./chunk-9hOWP6kD.cjs");
//#region ../../node_modules/.bun/@aws-sdk+core@3.974.8/node_modules/@aws-sdk/core/dist-es/submodules/client/emitWarningIfUnsupportedVersion.js
var state, emitWarningIfUnsupportedVersion;
var init_emitWarningIfUnsupportedVersion = require_chunk.__esmMin((() => {
	state = { warningEmitted: false };
	emitWarningIfUnsupportedVersion = (version) => {
		if (version && !state.warningEmitted) {
			if (process.env.AWS_SDK_JS_NODE_VERSION_SUPPORT_WARNING_DISABLED === "true") {
				state.warningEmitted = true;
				return;
			}
			const userMajorVersion = parseInt(version.substring(1, version.indexOf(".")));
			const vv = 22;
			if (userMajorVersion < vv) {
				state.warningEmitted = true;
				process.emitWarning(`NodeVersionSupportWarning: The AWS SDK for JavaScript (v3)
versions published after the first week of January 2027
will require node >=${vv}. You are running node ${version}.

To continue receiving updates to AWS services, bug fixes,
and security updates please upgrade to node >=${vv}.

More information can be found at: https://a.co/c895JFp`);
			}
		}
	};
}));
//#endregion
//#region ../../node_modules/.bun/@aws-sdk+core@3.974.8/node_modules/@aws-sdk/core/dist-es/submodules/client/longPollMiddleware.js
var longPollMiddleware, longPollMiddlewareOptions, getLongPollPlugin;
var init_longPollMiddleware = require_chunk.__esmMin((() => {
	longPollMiddleware = () => (next, context) => async (args) => {
		context.__retryLongPoll = true;
		return next(args);
	};
	longPollMiddlewareOptions = {
		name: "longPollMiddleware",
		tags: ["RETRY"],
		step: "initialize",
		override: true
	};
	getLongPollPlugin = (options) => ({ applyToStack: (clientStack) => {
		clientStack.add(longPollMiddleware(), longPollMiddlewareOptions);
	} });
}));
//#endregion
//#region ../../node_modules/.bun/@aws-sdk+core@3.974.8/node_modules/@aws-sdk/core/dist-es/submodules/client/setCredentialFeature.js
function setCredentialFeature(credentials, feature, value) {
	if (!credentials.$source) credentials.$source = {};
	credentials.$source[feature] = value;
	return credentials;
}
var init_setCredentialFeature = require_chunk.__esmMin((() => {}));
//#endregion
//#region ../../node_modules/.bun/@smithy+service-error-classification@4.3.1/node_modules/@smithy/service-error-classification/dist-cjs/index.js
var require_dist_cjs$1 = /* @__PURE__ */ require_chunk.__commonJSMin(((exports) => {
	const CLOCK_SKEW_ERROR_CODES = [
		"AuthFailure",
		"InvalidSignatureException",
		"RequestExpired",
		"RequestInTheFuture",
		"RequestTimeTooSkewed",
		"SignatureDoesNotMatch"
	];
	const THROTTLING_ERROR_CODES = [
		"BandwidthLimitExceeded",
		"EC2ThrottledException",
		"LimitExceededException",
		"PriorRequestNotComplete",
		"ProvisionedThroughputExceededException",
		"RequestLimitExceeded",
		"RequestThrottled",
		"RequestThrottledException",
		"SlowDown",
		"ThrottledException",
		"Throttling",
		"ThrottlingException",
		"TooManyRequestsException",
		"TransactionInProgressException"
	];
	const TRANSIENT_ERROR_CODES = [
		"TimeoutError",
		"RequestTimeout",
		"RequestTimeoutException"
	];
	const TRANSIENT_ERROR_STATUS_CODES = [
		500,
		502,
		503,
		504
	];
	const NODEJS_TIMEOUT_ERROR_CODES = [
		"ECONNRESET",
		"ECONNREFUSED",
		"EPIPE",
		"ETIMEDOUT"
	];
	const NODEJS_NETWORK_ERROR_CODES = [
		"EHOSTUNREACH",
		"ENETUNREACH",
		"ENOTFOUND"
	];
	const isRetryableByTrait = (error) => error?.$retryable !== void 0;
	const isClockSkewError = (error) => CLOCK_SKEW_ERROR_CODES.includes(error.name);
	const isClockSkewCorrectedError = (error) => error.$metadata?.clockSkewCorrected;
	const isBrowserNetworkError = (error) => {
		const errorMessages = new Set([
			"Failed to fetch",
			"NetworkError when attempting to fetch resource",
			"The Internet connection appears to be offline",
			"Load failed",
			"Network request failed"
		]);
		if (!(error && error instanceof TypeError)) return false;
		return errorMessages.has(error.message);
	};
	const isThrottlingError = (error) => error.$metadata?.httpStatusCode === 429 || THROTTLING_ERROR_CODES.includes(error.name) || error.$retryable?.throttling == true;
	const isTransientError = (error, depth = 0) => isRetryableByTrait(error) || isClockSkewCorrectedError(error) || error.name === "InvalidSignatureException" && error.message?.includes("Signature expired") || TRANSIENT_ERROR_CODES.includes(error.name) || NODEJS_TIMEOUT_ERROR_CODES.includes(error?.code || "") || NODEJS_NETWORK_ERROR_CODES.includes(error?.code || "") || TRANSIENT_ERROR_STATUS_CODES.includes(error.$metadata?.httpStatusCode || 0) || isBrowserNetworkError(error) || isNodeJsHttp2TransientError(error) || error.cause !== void 0 && depth <= 10 && isTransientError(error.cause, depth + 1);
	const isServerError = (error) => {
		if (error.$metadata?.httpStatusCode !== void 0) {
			const statusCode = error.$metadata.httpStatusCode;
			if (500 <= statusCode && statusCode <= 599 && !isTransientError(error)) return true;
			return false;
		}
		return false;
	};
	function isNodeJsHttp2TransientError(error) {
		return error.code === "ERR_HTTP2_STREAM_ERROR" && error.message.includes("NGHTTP2_REFUSED_STREAM");
	}
	exports.isBrowserNetworkError = isBrowserNetworkError;
	exports.isClockSkewCorrectedError = isClockSkewCorrectedError;
	exports.isClockSkewError = isClockSkewError;
	exports.isNodeJsHttp2TransientError = isNodeJsHttp2TransientError;
	exports.isRetryableByTrait = isRetryableByTrait;
	exports.isServerError = isServerError;
	exports.isThrottlingError = isThrottlingError;
	exports.isTransientError = isTransientError;
}));
//#endregion
//#region ../../node_modules/.bun/@smithy+util-retry@4.3.8/node_modules/@smithy/util-retry/dist-cjs/index.js
var require_dist_cjs = /* @__PURE__ */ require_chunk.__commonJSMin(((exports) => {
	var serviceErrorClassification = require_dist_cjs$1();
	exports.RETRY_MODES = void 0;
	(function(RETRY_MODES) {
		RETRY_MODES["STANDARD"] = "standard";
		RETRY_MODES["ADAPTIVE"] = "adaptive";
	})(exports.RETRY_MODES || (exports.RETRY_MODES = {}));
	const DEFAULT_MAX_ATTEMPTS = 3;
	const DEFAULT_RETRY_MODE = exports.RETRY_MODES.STANDARD;
	var DefaultRateLimiter = class DefaultRateLimiter {
		static setTimeoutFn = setTimeout;
		beta;
		minCapacity;
		minFillRate;
		scaleConstant;
		smooth;
		enabled = false;
		availableTokens = 0;
		lastMaxRate = 0;
		measuredTxRate = 0;
		requestCount = 0;
		fillRate;
		lastThrottleTime;
		lastTimestamp = 0;
		lastTxRateBucket;
		maxCapacity;
		timeWindow = 0;
		constructor(options) {
			this.beta = options?.beta ?? .7;
			this.minCapacity = options?.minCapacity ?? 1;
			this.minFillRate = options?.minFillRate ?? .5;
			this.scaleConstant = options?.scaleConstant ?? .4;
			this.smooth = options?.smooth ?? .8;
			this.lastThrottleTime = this.getCurrentTimeInSeconds();
			this.lastTxRateBucket = Math.floor(this.getCurrentTimeInSeconds());
			this.fillRate = this.minFillRate;
			this.maxCapacity = this.minCapacity;
		}
		async getSendToken() {
			return this.acquireTokenBucket(1);
		}
		updateClientSendingRate(response) {
			let calculatedRate;
			this.updateMeasuredRate();
			const retryErrorInfo = response;
			if (retryErrorInfo?.errorType === "THROTTLING" || serviceErrorClassification.isThrottlingError(retryErrorInfo?.error ?? response)) {
				const rateToUse = !this.enabled ? this.measuredTxRate : Math.min(this.measuredTxRate, this.fillRate);
				this.lastMaxRate = rateToUse;
				this.calculateTimeWindow();
				this.lastThrottleTime = this.getCurrentTimeInSeconds();
				calculatedRate = this.cubicThrottle(rateToUse);
				this.enableTokenBucket();
			} else {
				this.calculateTimeWindow();
				calculatedRate = this.cubicSuccess(this.getCurrentTimeInSeconds());
			}
			const newRate = Math.min(calculatedRate, 2 * this.measuredTxRate);
			this.updateTokenBucketRate(newRate);
		}
		getCurrentTimeInSeconds() {
			return Date.now() / 1e3;
		}
		async acquireTokenBucket(amount) {
			if (!this.enabled) return;
			this.refillTokenBucket();
			while (amount > this.availableTokens) {
				const delay = (amount - this.availableTokens) / this.fillRate * 1e3;
				await new Promise((resolve) => DefaultRateLimiter.setTimeoutFn(resolve, delay));
				this.refillTokenBucket();
			}
			this.availableTokens = this.availableTokens - amount;
		}
		refillTokenBucket() {
			const timestamp = this.getCurrentTimeInSeconds();
			if (!this.lastTimestamp) {
				this.lastTimestamp = timestamp;
				return;
			}
			const fillAmount = (timestamp - this.lastTimestamp) * this.fillRate;
			this.availableTokens = Math.min(this.maxCapacity, this.availableTokens + fillAmount);
			this.lastTimestamp = timestamp;
		}
		calculateTimeWindow() {
			this.timeWindow = this.getPrecise(Math.pow(this.lastMaxRate * (1 - this.beta) / this.scaleConstant, 1 / 3));
		}
		cubicThrottle(rateToUse) {
			return this.getPrecise(rateToUse * this.beta);
		}
		cubicSuccess(timestamp) {
			return this.getPrecise(this.scaleConstant * Math.pow(timestamp - this.lastThrottleTime - this.timeWindow, 3) + this.lastMaxRate);
		}
		enableTokenBucket() {
			this.enabled = true;
		}
		updateTokenBucketRate(newRate) {
			this.refillTokenBucket();
			this.fillRate = Math.max(newRate, this.minFillRate);
			this.maxCapacity = Math.max(newRate, this.minCapacity);
			this.availableTokens = Math.min(this.availableTokens, this.maxCapacity);
		}
		updateMeasuredRate() {
			const t = this.getCurrentTimeInSeconds();
			const timeBucket = Math.floor(t * 2) / 2;
			this.requestCount++;
			if (timeBucket > this.lastTxRateBucket) {
				const currentRate = this.requestCount / (timeBucket - this.lastTxRateBucket);
				this.measuredTxRate = this.getPrecise(currentRate * this.smooth + this.measuredTxRate * (1 - this.smooth));
				this.requestCount = 0;
				this.lastTxRateBucket = timeBucket;
			}
		}
		getPrecise(num) {
			return parseFloat(num.toFixed(8));
		}
	};
	const DEFAULT_RETRY_DELAY_BASE = 100;
	const MAXIMUM_RETRY_DELAY = 20 * 1e3;
	const THROTTLING_RETRY_DELAY_BASE = 500;
	const INITIAL_RETRY_TOKENS = 500;
	const RETRY_COST = 5;
	const TIMEOUT_RETRY_COST = 10;
	const NO_RETRY_INCREMENT = 1;
	const INVOCATION_ID_HEADER = "amz-sdk-invocation-id";
	const REQUEST_HEADER = "amz-sdk-request";
	var Retry = class Retry {
		static v2026 = typeof process !== "undefined" && process.env?.SMITHY_NEW_RETRIES_2026 === "true";
		static delay() {
			return Retry.v2026 ? 50 : 100;
		}
		static throttlingDelay() {
			return Retry.v2026 ? 1e3 : 500;
		}
		static cost() {
			return Retry.v2026 ? 14 : 5;
		}
		static throttlingCost() {
			return Retry.v2026 ? 5 : 10;
		}
		static modifiedCostType() {
			return Retry.v2026 ? "THROTTLING" : "TRANSIENT";
		}
	};
	var DefaultRetryBackoffStrategy = class {
		x = Retry.delay();
		computeNextBackoffDelay(i) {
			const t_i = Math.random() * Math.min(this.x * 2 ** i, MAXIMUM_RETRY_DELAY);
			return Math.floor(t_i);
		}
		setDelayBase(delay) {
			this.x = delay;
		}
	};
	var DefaultRetryToken = class {
		delay;
		count;
		cost;
		longPoll;
		constructor(delay, count, cost, longPoll) {
			this.delay = delay;
			this.count = count;
			this.cost = cost;
			this.longPoll = longPoll;
		}
		getRetryCount() {
			return this.count;
		}
		getRetryDelay() {
			return Math.min(MAXIMUM_RETRY_DELAY, this.delay);
		}
		getRetryCost() {
			return this.cost;
		}
		isLongPoll() {
			return this.longPoll;
		}
	};
	const refusal = {
		incompatible: 1,
		attempts: 2,
		capacity: 3
	};
	var StandardRetryStrategy = class {
		mode = exports.RETRY_MODES.STANDARD;
		capacity = INITIAL_RETRY_TOKENS;
		retryBackoffStrategy;
		maxAttemptsProvider;
		baseDelay;
		constructor(arg1) {
			if (typeof arg1 === "number") this.maxAttemptsProvider = async () => arg1;
			else if (typeof arg1 === "function") this.maxAttemptsProvider = arg1;
			else if (arg1 && typeof arg1 === "object") {
				this.maxAttemptsProvider = async () => arg1.maxAttempts;
				this.baseDelay = arg1.baseDelay;
				this.retryBackoffStrategy = arg1.backoff;
			}
			this.maxAttemptsProvider ??= async () => DEFAULT_MAX_ATTEMPTS;
			this.baseDelay ??= Retry.delay();
			this.retryBackoffStrategy ??= new DefaultRetryBackoffStrategy();
		}
		async acquireInitialRetryToken(retryTokenScope) {
			return new DefaultRetryToken(Retry.delay(), 0, void 0, Retry.v2026 && retryTokenScope.includes(":longpoll"));
		}
		async refreshRetryTokenForRetry(token, errorInfo) {
			const maxAttempts = await this.getMaxAttempts();
			const retryCode = this.retryCode(token, errorInfo, maxAttempts);
			const shouldRetry = retryCode === 0;
			const isLongPoll = token.isLongPoll?.();
			if (shouldRetry || isLongPoll) {
				const errorType = errorInfo.errorType;
				this.retryBackoffStrategy.setDelayBase(errorType === "THROTTLING" ? Retry.throttlingDelay() : this.baseDelay);
				const delayFromErrorType = this.retryBackoffStrategy.computeNextBackoffDelay(token.getRetryCount());
				let retryDelay = delayFromErrorType;
				if (errorInfo.retryAfterHint instanceof Date) retryDelay = Math.max(delayFromErrorType, Math.min(errorInfo.retryAfterHint.getTime() - Date.now(), delayFromErrorType + 5e3));
				if (!shouldRetry) throw Object.assign(/* @__PURE__ */ new Error("No retry token available"), { $backoff: Retry.v2026 && retryCode === refusal.capacity && isLongPoll ? retryDelay : 0 });
				else {
					const capacityCost = this.getCapacityCost(errorType);
					this.capacity -= capacityCost;
					return new DefaultRetryToken(retryDelay, token.getRetryCount() + 1, capacityCost, token.isLongPoll?.() ?? false);
				}
			}
			throw new Error("No retry token available");
		}
		recordSuccess(token) {
			this.capacity = Math.min(INITIAL_RETRY_TOKENS, this.capacity + (token.getRetryCost() ?? NO_RETRY_INCREMENT));
		}
		getCapacity() {
			return this.capacity;
		}
		async maxAttempts() {
			return this.maxAttemptsProvider();
		}
		async getMaxAttempts() {
			try {
				return await this.maxAttemptsProvider();
			} catch (error) {
				console.warn(`Max attempts provider could not resolve. Using default of ${DEFAULT_MAX_ATTEMPTS}`);
				return DEFAULT_MAX_ATTEMPTS;
			}
		}
		retryCode(tokenToRenew, errorInfo, maxAttempts) {
			const attempts = tokenToRenew.getRetryCount() + 1;
			const retryableStatus = this.isRetryableError(errorInfo.errorType) ? 0 : refusal.incompatible;
			const attemptStatus = attempts < maxAttempts ? 0 : refusal.attempts;
			const capacityStatus = this.capacity >= this.getCapacityCost(errorInfo.errorType) ? 0 : refusal.capacity;
			return retryableStatus || attemptStatus || capacityStatus;
		}
		getCapacityCost(errorType) {
			return errorType === Retry.modifiedCostType() ? Retry.throttlingCost() : Retry.cost();
		}
		isRetryableError(errorType) {
			return errorType === "THROTTLING" || errorType === "TRANSIENT";
		}
	};
	var AdaptiveRetryStrategy = class {
		mode = exports.RETRY_MODES.ADAPTIVE;
		rateLimiter;
		standardRetryStrategy;
		constructor(maxAttemptsProvider, options) {
			const { rateLimiter } = options ?? {};
			this.rateLimiter = rateLimiter ?? new DefaultRateLimiter();
			this.standardRetryStrategy = options ? new StandardRetryStrategy({
				maxAttempts: typeof maxAttemptsProvider === "number" ? maxAttemptsProvider : 3,
				...options
			}) : new StandardRetryStrategy(maxAttemptsProvider);
		}
		async acquireInitialRetryToken(retryTokenScope) {
			const token = await this.standardRetryStrategy.acquireInitialRetryToken(retryTokenScope);
			await this.rateLimiter.getSendToken();
			return token;
		}
		async refreshRetryTokenForRetry(tokenToRenew, errorInfo) {
			this.rateLimiter.updateClientSendingRate(errorInfo);
			const token = await this.standardRetryStrategy.refreshRetryTokenForRetry(tokenToRenew, errorInfo);
			await this.rateLimiter.getSendToken();
			return token;
		}
		recordSuccess(token) {
			this.rateLimiter.updateClientSendingRate({});
			this.standardRetryStrategy.recordSuccess(token);
		}
		async maxAttemptsProvider() {
			return this.standardRetryStrategy.maxAttempts();
		}
	};
	var ConfiguredRetryStrategy = class extends StandardRetryStrategy {
		computeNextBackoffDelay;
		constructor(maxAttempts, computeNextBackoffDelay = Retry.delay()) {
			super(typeof maxAttempts === "function" ? maxAttempts : async () => maxAttempts);
			if (typeof computeNextBackoffDelay === "number") this.computeNextBackoffDelay = () => computeNextBackoffDelay;
			else this.computeNextBackoffDelay = computeNextBackoffDelay;
		}
		async refreshRetryTokenForRetry(tokenToRenew, errorInfo) {
			const token = await super.refreshRetryTokenForRetry(tokenToRenew, errorInfo);
			token.getRetryDelay = () => this.computeNextBackoffDelay(token.getRetryCount());
			return token;
		}
	};
	exports.AdaptiveRetryStrategy = AdaptiveRetryStrategy;
	exports.ConfiguredRetryStrategy = ConfiguredRetryStrategy;
	exports.DEFAULT_MAX_ATTEMPTS = DEFAULT_MAX_ATTEMPTS;
	exports.DEFAULT_RETRY_DELAY_BASE = DEFAULT_RETRY_DELAY_BASE;
	exports.DEFAULT_RETRY_MODE = DEFAULT_RETRY_MODE;
	exports.DefaultRateLimiter = DefaultRateLimiter;
	exports.INITIAL_RETRY_TOKENS = INITIAL_RETRY_TOKENS;
	exports.INVOCATION_ID_HEADER = INVOCATION_ID_HEADER;
	exports.MAXIMUM_RETRY_DELAY = MAXIMUM_RETRY_DELAY;
	exports.NO_RETRY_INCREMENT = NO_RETRY_INCREMENT;
	exports.REQUEST_HEADER = REQUEST_HEADER;
	exports.RETRY_COST = RETRY_COST;
	exports.Retry = Retry;
	exports.StandardRetryStrategy = StandardRetryStrategy;
	exports.THROTTLING_RETRY_DELAY_BASE = THROTTLING_RETRY_DELAY_BASE;
	exports.TIMEOUT_RETRY_COST = TIMEOUT_RETRY_COST;
}));
//#endregion
//#region ../../node_modules/.bun/@aws-sdk+core@3.974.8/node_modules/@aws-sdk/core/dist-es/submodules/client/setFeature.js
function setFeature(context, feature, value) {
	if (!context.__aws_sdk_context) context.__aws_sdk_context = { features: {} };
	else if (!context.__aws_sdk_context.features) context.__aws_sdk_context.features = {};
	context.__aws_sdk_context.features[feature] = value;
}
var import_dist_cjs;
var init_setFeature = require_chunk.__esmMin((() => {
	import_dist_cjs = require_dist_cjs();
	import_dist_cjs.Retry.v2026 ||= typeof process === "object" && process.env?.AWS_NEW_RETRIES_2026 === "true";
}));
//#endregion
//#region ../../node_modules/.bun/@aws-sdk+core@3.974.8/node_modules/@aws-sdk/core/dist-es/submodules/client/setTokenFeature.js
function setTokenFeature(token, feature, value) {
	if (!token.$source) token.$source = {};
	token.$source[feature] = value;
	return token;
}
var init_setTokenFeature = require_chunk.__esmMin((() => {}));
//#endregion
//#region ../../node_modules/.bun/@aws-sdk+core@3.974.8/node_modules/@aws-sdk/core/dist-es/submodules/client/index.js
var client_exports = /* @__PURE__ */ require_chunk.__exportAll({
	emitWarningIfUnsupportedVersion: () => emitWarningIfUnsupportedVersion,
	getLongPollPlugin: () => getLongPollPlugin,
	setCredentialFeature: () => setCredentialFeature,
	setFeature: () => setFeature,
	setTokenFeature: () => setTokenFeature,
	state: () => state
});
var init_client = require_chunk.__esmMin((() => {
	init_emitWarningIfUnsupportedVersion();
	init_longPollMiddleware();
	init_setCredentialFeature();
	init_setFeature();
	init_setTokenFeature();
}));
//#endregion
Object.defineProperty(exports, "client_exports", {
	enumerable: true,
	get: function() {
		return client_exports;
	}
});
Object.defineProperty(exports, "emitWarningIfUnsupportedVersion", {
	enumerable: true,
	get: function() {
		return emitWarningIfUnsupportedVersion;
	}
});
Object.defineProperty(exports, "init_client", {
	enumerable: true,
	get: function() {
		return init_client;
	}
});
Object.defineProperty(exports, "require_dist_cjs", {
	enumerable: true,
	get: function() {
		return require_dist_cjs;
	}
});
Object.defineProperty(exports, "require_dist_cjs$1", {
	enumerable: true,
	get: function() {
		return require_dist_cjs$1;
	}
});
Object.defineProperty(exports, "setCredentialFeature", {
	enumerable: true,
	get: function() {
		return setCredentialFeature;
	}
});
