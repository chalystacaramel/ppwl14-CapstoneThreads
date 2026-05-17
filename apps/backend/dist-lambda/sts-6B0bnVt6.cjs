const require_chunk = require("./chunk-9hOWP6kD.cjs");
const require_dist_cjs$29 = require("./dist-cjs-D8Xvoqzr.cjs");
const require_dist_cjs$30 = require("./dist-cjs-493h0nIF.cjs");
const require_dist_cjs$31 = require("./dist-cjs-Cv7lwqFB.cjs");
const require_dist_cjs$32 = require("./dist-cjs-BPUMJe9H.cjs");
const require_dist_cjs$33 = require("./dist-cjs-CthQcEjW.cjs");
const require_client = require("./client-l-N-KiY4.cjs");
const require_dist_cjs$34 = require("./dist-cjs-sJyDAqtz.cjs");
const require_package = require("./package-Ede9egTp.cjs");
//#region ../../node_modules/.bun/@aws-sdk+middleware-sdk-s3@3.972.37/node_modules/@aws-sdk/middleware-sdk-s3/dist-cjs/toStream.js
var require_toStream = /* @__PURE__ */ require_chunk.__commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.toStream = toStream;
	const node_stream_1 = require("node:stream");
	function toStream(bytes) {
		return node_stream_1.Readable.from(Buffer.from(bytes));
	}
}));
//#endregion
//#region ../../node_modules/.bun/@aws-sdk+util-arn-parser@3.972.3/node_modules/@aws-sdk/util-arn-parser/dist-cjs/index.js
var require_dist_cjs$2 = /* @__PURE__ */ require_chunk.__commonJSMin(((exports) => {
	const validate = (str) => typeof str === "string" && str.indexOf("arn:") === 0 && str.split(":").length >= 6;
	const parse = (arn) => {
		const segments = arn.split(":");
		if (segments.length < 6 || segments[0] !== "arn") throw new Error("Malformed ARN");
		const [, partition, service, region, accountId, ...resource] = segments;
		return {
			partition,
			service,
			region,
			accountId,
			resource: resource.join(":")
		};
	};
	const build = (arnObject) => {
		const { partition = "aws", service, region, accountId, resource } = arnObject;
		if ([
			service,
			region,
			accountId,
			resource
		].some((segment) => typeof segment !== "string")) throw new Error("Input ARN object is invalid");
		return `arn:${partition}:${service}:${region}:${accountId}:${resource}`;
	};
	exports.build = build;
	exports.parse = parse;
	exports.validate = validate;
}));
//#endregion
//#region ../../node_modules/.bun/@aws-sdk+middleware-sdk-s3@3.972.37/node_modules/@aws-sdk/middleware-sdk-s3/dist-cjs/index.js
var require_dist_cjs$1 = /* @__PURE__ */ require_chunk.__commonJSMin(((exports) => {
	var protocolHttp = require_dist_cjs$29.require_dist_cjs();
	var smithyClient = require_dist_cjs$31.require_dist_cjs();
	var toStream = require_toStream();
	var utilArnParser = require_dist_cjs$2();
	var protocols = (require_dist_cjs$30.init_protocols(), require_chunk.__toCommonJS(require_dist_cjs$30.protocols_exports));
	var schema = (require_dist_cjs$31.init_schema(), require_chunk.__toCommonJS(require_dist_cjs$31.schema_exports));
	var signatureV4 = require_dist_cjs$30.require_dist_cjs$5();
	var utilConfigProvider = require_dist_cjs$30.require_dist_cjs$10();
	var client = (require_client.init_client(), require_chunk.__toCommonJS(require_client.client_exports));
	var core = (require_dist_cjs$30.init_dist_es(), require_chunk.__toCommonJS(require_dist_cjs$30.dist_es_exports));
	var utilMiddleware = require_dist_cjs$31.require_dist_cjs$7();
	const CONTENT_LENGTH_HEADER = "content-length";
	const DECODED_CONTENT_LENGTH_HEADER = "x-amz-decoded-content-length";
	function checkContentLengthHeader() {
		return (next, context) => async (args) => {
			const { request } = args;
			if (protocolHttp.HttpRequest.isInstance(request)) {
				if (!(CONTENT_LENGTH_HEADER in request.headers) && !(DECODED_CONTENT_LENGTH_HEADER in request.headers)) {
					const message = `Are you using a Stream of unknown length as the Body of a PutObject request? Consider using Upload instead from @aws-sdk/lib-storage.`;
					if (typeof context?.logger?.warn === "function" && !(context.logger instanceof smithyClient.NoOpLogger)) context.logger.warn(message);
					else console.warn(message);
				}
			}
			return next({ ...args });
		};
	}
	const checkContentLengthHeaderMiddlewareOptions = {
		step: "finalizeRequest",
		tags: ["CHECK_CONTENT_LENGTH_HEADER"],
		name: "getCheckContentLengthHeaderPlugin",
		override: true
	};
	const getCheckContentLengthHeaderPlugin = (unused) => ({ applyToStack: (clientStack) => {
		clientStack.add(checkContentLengthHeader(), checkContentLengthHeaderMiddlewareOptions);
	} });
	const regionRedirectEndpointMiddleware = (config) => {
		return (next, context) => async (args) => {
			const originalRegion = await config.region();
			const regionProviderRef = config.region;
			let unlock = () => {};
			if (context.__s3RegionRedirect) {
				Object.defineProperty(config, "region", {
					writable: false,
					value: async () => {
						return context.__s3RegionRedirect;
					}
				});
				unlock = () => Object.defineProperty(config, "region", {
					writable: true,
					value: regionProviderRef
				});
			}
			try {
				const result = await next(args);
				if (context.__s3RegionRedirect) {
					unlock();
					if (originalRegion !== await config.region()) throw new Error("Region was not restored following S3 region redirect.");
				}
				return result;
			} catch (e) {
				unlock();
				throw e;
			}
		};
	};
	const regionRedirectEndpointMiddlewareOptions = {
		tags: ["REGION_REDIRECT", "S3"],
		name: "regionRedirectEndpointMiddleware",
		override: true,
		relation: "before",
		toMiddleware: "endpointV2Middleware"
	};
	function regionRedirectMiddleware(clientConfig) {
		return (next, context) => async (args) => {
			try {
				return await next(args);
			} catch (err) {
				if (clientConfig.followRegionRedirects) {
					const statusCode = err?.$metadata?.httpStatusCode;
					const isHeadBucket = context.commandName === "HeadBucketCommand";
					const bucketRegionHeader = err?.$response?.headers?.["x-amz-bucket-region"];
					if (bucketRegionHeader) {
						if (statusCode === 301 || statusCode === 400 && (err?.name === "IllegalLocationConstraintException" || isHeadBucket)) {
							try {
								const actualRegion = bucketRegionHeader;
								context.logger?.debug(`Redirecting from ${await clientConfig.region()} to ${actualRegion}`);
								context.__s3RegionRedirect = actualRegion;
							} catch (e) {
								throw new Error("Region redirect failed: " + e);
							}
							return next(args);
						}
					}
				}
				throw err;
			}
		};
	}
	const regionRedirectMiddlewareOptions = {
		step: "initialize",
		tags: ["REGION_REDIRECT", "S3"],
		name: "regionRedirectMiddleware",
		override: true
	};
	const getRegionRedirectMiddlewarePlugin = (clientConfig) => ({ applyToStack: (clientStack) => {
		clientStack.add(regionRedirectMiddleware(clientConfig), regionRedirectMiddlewareOptions);
		clientStack.addRelativeTo(regionRedirectEndpointMiddleware(clientConfig), regionRedirectEndpointMiddlewareOptions);
	} });
	const s3ExpiresMiddleware = (config) => {
		return (next, context) => async (args) => {
			const result = await next(args);
			const { response } = result;
			if (protocolHttp.HttpResponse.isInstance(response)) {
				if (response.headers.expires) {
					response.headers.expiresstring = response.headers.expires;
					try {
						smithyClient.parseRfc7231DateTime(response.headers.expires);
					} catch (e) {
						context.logger?.warn(`AWS SDK Warning for ${context.clientName}::${context.commandName} response parsing (${response.headers.expires}): ${e}`);
						delete response.headers.expires;
					}
				}
			}
			return result;
		};
	};
	const s3ExpiresMiddlewareOptions = {
		tags: ["S3"],
		name: "s3ExpiresMiddleware",
		override: true,
		relation: "after",
		toMiddleware: "deserializerMiddleware"
	};
	const getS3ExpiresMiddlewarePlugin = (clientConfig) => ({ applyToStack: (clientStack) => {
		clientStack.addRelativeTo(s3ExpiresMiddleware(), s3ExpiresMiddlewareOptions);
	} });
	var S3ExpressIdentityCache = class S3ExpressIdentityCache {
		data;
		lastPurgeTime = Date.now();
		static EXPIRED_CREDENTIAL_PURGE_INTERVAL_MS = 3e4;
		constructor(data = {}) {
			this.data = data;
		}
		get(key) {
			const entry = this.data[key];
			if (!entry) return;
			return entry;
		}
		set(key, entry) {
			this.data[key] = entry;
			return entry;
		}
		delete(key) {
			delete this.data[key];
		}
		async purgeExpired() {
			const now = Date.now();
			if (this.lastPurgeTime + S3ExpressIdentityCache.EXPIRED_CREDENTIAL_PURGE_INTERVAL_MS > now) return;
			for (const key in this.data) {
				const entry = this.data[key];
				if (!entry.isRefreshing) {
					const credential = await entry.identity;
					if (credential.expiration) {
						if (credential.expiration.getTime() < now) delete this.data[key];
					}
				}
			}
		}
	};
	var S3ExpressIdentityCacheEntry = class {
		_identity;
		isRefreshing;
		accessed;
		constructor(_identity, isRefreshing = false, accessed = Date.now()) {
			this._identity = _identity;
			this.isRefreshing = isRefreshing;
			this.accessed = accessed;
		}
		get identity() {
			this.accessed = Date.now();
			return this._identity;
		}
	};
	var S3ExpressIdentityProviderImpl = class S3ExpressIdentityProviderImpl {
		createSessionFn;
		cache;
		static REFRESH_WINDOW_MS = 6e4;
		constructor(createSessionFn, cache = new S3ExpressIdentityCache()) {
			this.createSessionFn = createSessionFn;
			this.cache = cache;
		}
		async getS3ExpressIdentity(awsIdentity, identityProperties) {
			const key = identityProperties.Bucket;
			const { cache } = this;
			const entry = cache.get(key);
			if (entry) return entry.identity.then((identity) => {
				if ((identity.expiration?.getTime() ?? 0) < Date.now()) return cache.set(key, new S3ExpressIdentityCacheEntry(this.getIdentity(key))).identity;
				if ((identity.expiration?.getTime() ?? 0) < Date.now() + S3ExpressIdentityProviderImpl.REFRESH_WINDOW_MS && !entry.isRefreshing) {
					entry.isRefreshing = true;
					this.getIdentity(key).then((id) => {
						cache.set(key, new S3ExpressIdentityCacheEntry(Promise.resolve(id)));
					});
				}
				return identity;
			});
			return cache.set(key, new S3ExpressIdentityCacheEntry(this.getIdentity(key))).identity;
		}
		async getIdentity(key) {
			await this.cache.purgeExpired().catch((error) => {
				console.warn("Error while clearing expired entries in S3ExpressIdentityCache: \n" + error);
			});
			const session = await this.createSessionFn(key);
			if (!session.Credentials?.AccessKeyId || !session.Credentials?.SecretAccessKey) throw new Error("s3#createSession response credential missing AccessKeyId or SecretAccessKey.");
			return {
				accessKeyId: session.Credentials.AccessKeyId,
				secretAccessKey: session.Credentials.SecretAccessKey,
				sessionToken: session.Credentials.SessionToken,
				expiration: session.Credentials.Expiration ? new Date(session.Credentials.Expiration) : void 0
			};
		}
	};
	const S3_EXPRESS_BUCKET_TYPE = "Directory";
	const S3_EXPRESS_BACKEND = "S3Express";
	const S3_EXPRESS_AUTH_SCHEME = "sigv4-s3express";
	const SESSION_TOKEN_QUERY_PARAM = "X-Amz-S3session-Token";
	const SESSION_TOKEN_HEADER = SESSION_TOKEN_QUERY_PARAM.toLowerCase();
	const NODE_DISABLE_S3_EXPRESS_SESSION_AUTH_ENV_NAME = "AWS_S3_DISABLE_EXPRESS_SESSION_AUTH";
	const NODE_DISABLE_S3_EXPRESS_SESSION_AUTH_INI_NAME = "s3_disable_express_session_auth";
	const NODE_DISABLE_S3_EXPRESS_SESSION_AUTH_OPTIONS = {
		environmentVariableSelector: (env) => utilConfigProvider.booleanSelector(env, NODE_DISABLE_S3_EXPRESS_SESSION_AUTH_ENV_NAME, utilConfigProvider.SelectorType.ENV),
		configFileSelector: (profile) => utilConfigProvider.booleanSelector(profile, NODE_DISABLE_S3_EXPRESS_SESSION_AUTH_INI_NAME, utilConfigProvider.SelectorType.CONFIG),
		default: false
	};
	var SignatureV4S3Express = class extends signatureV4.SignatureV4 {
		async signWithCredentials(requestToSign, credentials, options) {
			const credentialsWithoutSessionToken = getCredentialsWithoutSessionToken(credentials);
			requestToSign.headers[SESSION_TOKEN_HEADER] = credentials.sessionToken;
			const privateAccess = this;
			setSingleOverride(privateAccess, credentialsWithoutSessionToken);
			return privateAccess.signRequest(requestToSign, options ?? {});
		}
		async presignWithCredentials(requestToSign, credentials, options) {
			const credentialsWithoutSessionToken = getCredentialsWithoutSessionToken(credentials);
			delete requestToSign.headers[SESSION_TOKEN_HEADER];
			requestToSign.headers[SESSION_TOKEN_QUERY_PARAM] = credentials.sessionToken;
			requestToSign.query = requestToSign.query ?? {};
			requestToSign.query[SESSION_TOKEN_QUERY_PARAM] = credentials.sessionToken;
			setSingleOverride(this, credentialsWithoutSessionToken);
			return this.presign(requestToSign, options);
		}
	};
	function getCredentialsWithoutSessionToken(credentials) {
		return {
			accessKeyId: credentials.accessKeyId,
			secretAccessKey: credentials.secretAccessKey,
			expiration: credentials.expiration
		};
	}
	function setSingleOverride(privateAccess, credentialsWithoutSessionToken) {
		const id = setTimeout(() => {
			throw new Error("SignatureV4S3Express credential override was created but not called.");
		}, 10);
		const currentCredentialProvider = privateAccess.credentialProvider;
		const overrideCredentialsProviderOnce = () => {
			clearTimeout(id);
			privateAccess.credentialProvider = currentCredentialProvider;
			return Promise.resolve(credentialsWithoutSessionToken);
		};
		privateAccess.credentialProvider = overrideCredentialsProviderOnce;
	}
	const s3ExpressMiddleware = (options) => {
		return (next, context) => async (args) => {
			if (context.endpointV2) {
				const endpoint = context.endpointV2;
				const isS3ExpressAuth = endpoint.properties?.authSchemes?.[0]?.name === S3_EXPRESS_AUTH_SCHEME;
				if (endpoint.properties?.backend === S3_EXPRESS_BACKEND || endpoint.properties?.bucketType === S3_EXPRESS_BUCKET_TYPE) {
					client.setFeature(context, "S3_EXPRESS_BUCKET", "J");
					context.isS3ExpressBucket = true;
				}
				if (isS3ExpressAuth) {
					const requestBucket = args.input.Bucket;
					if (requestBucket) {
						const s3ExpressIdentity = await options.s3ExpressIdentityProvider.getS3ExpressIdentity(await options.credentials(), { Bucket: requestBucket });
						context.s3ExpressIdentity = s3ExpressIdentity;
						if (protocolHttp.HttpRequest.isInstance(args.request) && s3ExpressIdentity.sessionToken) args.request.headers[SESSION_TOKEN_HEADER] = s3ExpressIdentity.sessionToken;
					}
				}
			}
			return next(args);
		};
	};
	const s3ExpressMiddlewareOptions = {
		name: "s3ExpressMiddleware",
		step: "build",
		tags: ["S3", "S3_EXPRESS"],
		override: true
	};
	const getS3ExpressPlugin = (options) => ({ applyToStack: (clientStack) => {
		clientStack.add(s3ExpressMiddleware(options), s3ExpressMiddlewareOptions);
	} });
	const signS3Express = async (s3ExpressIdentity, signingOptions, request, sigV4MultiRegionSigner) => {
		const signedRequest = await sigV4MultiRegionSigner.signWithCredentials(request, s3ExpressIdentity, {});
		if (signedRequest.headers["X-Amz-Security-Token"] || signedRequest.headers["x-amz-security-token"]) throw new Error("X-Amz-Security-Token must not be set for s3-express requests.");
		return signedRequest;
	};
	const defaultErrorHandler = (signingProperties) => (error) => {
		throw error;
	};
	const defaultSuccessHandler = (httpResponse, signingProperties) => {};
	const s3ExpressHttpSigningMiddlewareOptions = core.httpSigningMiddlewareOptions;
	const s3ExpressHttpSigningMiddleware = (config) => (next, context) => async (args) => {
		if (!protocolHttp.HttpRequest.isInstance(args.request)) return next(args);
		const scheme = utilMiddleware.getSmithyContext(context).selectedHttpAuthScheme;
		if (!scheme) throw new Error(`No HttpAuthScheme was selected: unable to sign request`);
		const { httpAuthOption: { signingProperties = {} }, identity, signer } = scheme;
		let request;
		if (context.s3ExpressIdentity) request = await signS3Express(context.s3ExpressIdentity, signingProperties, args.request, await config.signer());
		else request = await signer.sign(args.request, identity, signingProperties);
		const output = await next({
			...args,
			request
		}).catch((signer.errorHandler || defaultErrorHandler)(signingProperties));
		(signer.successHandler || defaultSuccessHandler)(output.response, signingProperties);
		return output;
	};
	const getS3ExpressHttpSigningPlugin = (config) => ({ applyToStack: (clientStack) => {
		clientStack.addRelativeTo(s3ExpressHttpSigningMiddleware(config), core.httpSigningMiddlewareOptions);
	} });
	const resolveS3Config = (input, { session }) => {
		const [s3ClientProvider, CreateSessionCommandCtor] = session;
		const { forcePathStyle, useAccelerateEndpoint, disableMultiregionAccessPoints, followRegionRedirects, s3ExpressIdentityProvider, bucketEndpoint, expectContinueHeader } = input;
		return Object.assign(input, {
			forcePathStyle: forcePathStyle ?? false,
			useAccelerateEndpoint: useAccelerateEndpoint ?? false,
			disableMultiregionAccessPoints: disableMultiregionAccessPoints ?? false,
			followRegionRedirects: followRegionRedirects ?? false,
			s3ExpressIdentityProvider: s3ExpressIdentityProvider ?? new S3ExpressIdentityProviderImpl(async (key) => s3ClientProvider().send(new CreateSessionCommandCtor({ Bucket: key }))),
			bucketEndpoint: bucketEndpoint ?? false,
			expectContinueHeader: expectContinueHeader ?? 2097152
		});
	};
	const THROW_IF_EMPTY_BODY = {
		CopyObjectCommand: true,
		UploadPartCopyCommand: true,
		CompleteMultipartUploadCommand: true
	};
	const throw200ExceptionsMiddleware = (config) => (next, context) => async (args) => {
		const result = await next(args);
		const { response } = result;
		if (!protocolHttp.HttpResponse.isInstance(response)) return result;
		const { statusCode, body } = response;
		if (statusCode < 200 || statusCode >= 300) return result;
		const bodyBytes = await collectBody(body, config);
		response.body = toStream.toStream(bodyBytes);
		if (bodyBytes.length === 0 && THROW_IF_EMPTY_BODY[context.commandName]) {
			const err = /* @__PURE__ */ new Error("S3 aborted request");
			err.$metadata = { httpStatusCode: 503 };
			err.name = "InternalError";
			throw err;
		}
		const bodyStringTail = config.utf8Encoder(bodyBytes.subarray(bodyBytes.length - 16));
		if (bodyStringTail && bodyStringTail.endsWith("</Error>")) response.statusCode = 503;
		return result;
	};
	const collectBody = (streamBody = new Uint8Array(), context) => {
		if (streamBody instanceof Uint8Array) return Promise.resolve(streamBody);
		return context.streamCollector(streamBody) || Promise.resolve(new Uint8Array());
	};
	const throw200ExceptionsMiddlewareOptions = {
		relation: "after",
		toMiddleware: "deserializerMiddleware",
		tags: ["THROW_200_EXCEPTIONS", "S3"],
		name: "throw200ExceptionsMiddleware",
		override: true
	};
	const getThrow200ExceptionsPlugin = (config) => ({ applyToStack: (clientStack) => {
		clientStack.addRelativeTo(throw200ExceptionsMiddleware(config), throw200ExceptionsMiddlewareOptions);
	} });
	function bucketEndpointMiddleware(options) {
		return (next, context) => async (args) => {
			if (options.bucketEndpoint) {
				const endpoint = context.endpointV2;
				if (endpoint) {
					const bucket = args.input.Bucket;
					if (typeof bucket === "string") try {
						const bucketEndpointUrl = new URL(bucket);
						context.endpointV2 = {
							...endpoint,
							url: bucketEndpointUrl
						};
					} catch (e) {
						const warning = `@aws-sdk/middleware-sdk-s3: bucketEndpoint=true was set but Bucket=${bucket} could not be parsed as URL.`;
						if (context.logger?.constructor?.name === "NoOpLogger") console.warn(warning);
						else context.logger?.warn?.(warning);
						throw e;
					}
				}
			}
			return next(args);
		};
	}
	const bucketEndpointMiddlewareOptions = {
		name: "bucketEndpointMiddleware",
		override: true,
		relation: "after",
		toMiddleware: "endpointV2Middleware"
	};
	function validateBucketNameMiddleware({ bucketEndpoint }) {
		return (next) => async (args) => {
			const { input: { Bucket } } = args;
			if (!bucketEndpoint && typeof Bucket === "string" && !utilArnParser.validate(Bucket) && Bucket.indexOf("/") >= 0) {
				const err = /* @__PURE__ */ new Error(`Bucket name shouldn't contain '/', received '${Bucket}'`);
				err.name = "InvalidBucketName";
				throw err;
			}
			return next({ ...args });
		};
	}
	const validateBucketNameMiddlewareOptions = {
		step: "initialize",
		tags: ["VALIDATE_BUCKET_NAME"],
		name: "validateBucketNameMiddleware",
		override: true
	};
	const getValidateBucketNamePlugin = (options) => ({ applyToStack: (clientStack) => {
		clientStack.add(validateBucketNameMiddleware(options), validateBucketNameMiddlewareOptions);
		clientStack.addRelativeTo(bucketEndpointMiddleware(options), bucketEndpointMiddlewareOptions);
	} });
	var S3RestXmlProtocol = class extends protocols.AwsRestXmlProtocol {
		async serializeRequest(operationSchema, input, context) {
			const request = await super.serializeRequest(operationSchema, input, context);
			const ns = schema.NormalizedSchema.of(operationSchema.input);
			const staticStructureSchema = ns.getSchema();
			let bucketMemberIndex = 0;
			const requiredMemberCount = staticStructureSchema[6] ?? 0;
			if (input && typeof input === "object") for (const [memberName, memberNs] of ns.structIterator()) {
				if (++bucketMemberIndex > requiredMemberCount) break;
				if (memberName === "Bucket") {
					if (!input.Bucket && memberNs.getMergedTraits().httpLabel) throw new Error(`No value provided for input HTTP label: Bucket.`);
					break;
				}
			}
			return request;
		}
	};
	exports.NODE_DISABLE_S3_EXPRESS_SESSION_AUTH_OPTIONS = NODE_DISABLE_S3_EXPRESS_SESSION_AUTH_OPTIONS;
	exports.S3ExpressIdentityCache = S3ExpressIdentityCache;
	exports.S3ExpressIdentityCacheEntry = S3ExpressIdentityCacheEntry;
	exports.S3ExpressIdentityProviderImpl = S3ExpressIdentityProviderImpl;
	exports.S3RestXmlProtocol = S3RestXmlProtocol;
	exports.SignatureV4S3Express = SignatureV4S3Express;
	exports.checkContentLengthHeader = checkContentLengthHeader;
	exports.checkContentLengthHeaderMiddlewareOptions = checkContentLengthHeaderMiddlewareOptions;
	exports.getCheckContentLengthHeaderPlugin = getCheckContentLengthHeaderPlugin;
	exports.getRegionRedirectMiddlewarePlugin = getRegionRedirectMiddlewarePlugin;
	exports.getS3ExpiresMiddlewarePlugin = getS3ExpiresMiddlewarePlugin;
	exports.getS3ExpressHttpSigningPlugin = getS3ExpressHttpSigningPlugin;
	exports.getS3ExpressPlugin = getS3ExpressPlugin;
	exports.getThrow200ExceptionsPlugin = getThrow200ExceptionsPlugin;
	exports.getValidateBucketNamePlugin = getValidateBucketNamePlugin;
	exports.regionRedirectEndpointMiddleware = regionRedirectEndpointMiddleware;
	exports.regionRedirectEndpointMiddlewareOptions = regionRedirectEndpointMiddlewareOptions;
	exports.regionRedirectMiddleware = regionRedirectMiddleware;
	exports.regionRedirectMiddlewareOptions = regionRedirectMiddlewareOptions;
	exports.resolveS3Config = resolveS3Config;
	exports.s3ExpiresMiddleware = s3ExpiresMiddleware;
	exports.s3ExpiresMiddlewareOptions = s3ExpiresMiddlewareOptions;
	exports.s3ExpressHttpSigningMiddleware = s3ExpressHttpSigningMiddleware;
	exports.s3ExpressHttpSigningMiddlewareOptions = s3ExpressHttpSigningMiddlewareOptions;
	exports.s3ExpressMiddleware = s3ExpressMiddleware;
	exports.s3ExpressMiddlewareOptions = s3ExpressMiddlewareOptions;
	exports.throw200ExceptionsMiddleware = throw200ExceptionsMiddleware;
	exports.throw200ExceptionsMiddlewareOptions = throw200ExceptionsMiddlewareOptions;
	exports.validateBucketNameMiddleware = validateBucketNameMiddleware;
	exports.validateBucketNameMiddlewareOptions = validateBucketNameMiddlewareOptions;
}));
//#endregion
//#region ../../node_modules/.bun/@aws-sdk+signature-v4-multi-region@3.996.25/node_modules/@aws-sdk/signature-v4-multi-region/dist-cjs/index.js
var require_dist_cjs = /* @__PURE__ */ require_chunk.__commonJSMin(((exports) => {
	var middlewareSdkS3 = require_dist_cjs$1();
	var signatureV4 = require_dist_cjs$30.require_dist_cjs$5();
	const signatureV4CrtContainer = { CrtSignerV4: null };
	var SignatureV4MultiRegion = class {
		sigv4aSigner;
		sigv4Signer;
		signerOptions;
		static sigv4aDependency() {
			if (typeof signatureV4CrtContainer.CrtSignerV4 === "function") return "crt";
			else if (typeof signatureV4.signatureV4aContainer.SignatureV4a === "function") return "js";
			return "none";
		}
		constructor(options) {
			this.sigv4Signer = new middlewareSdkS3.SignatureV4S3Express(options);
			this.signerOptions = options;
		}
		async sign(requestToSign, options = {}) {
			if (options.signingRegion === "*") return this.getSigv4aSigner().sign(requestToSign, options);
			return this.sigv4Signer.sign(requestToSign, options);
		}
		async signWithCredentials(requestToSign, credentials, options = {}) {
			if (options.signingRegion === "*") {
				const signer = this.getSigv4aSigner();
				const CrtSignerV4 = signatureV4CrtContainer.CrtSignerV4;
				if (CrtSignerV4 && signer instanceof CrtSignerV4) return signer.signWithCredentials(requestToSign, credentials, options);
				else throw new Error("signWithCredentials with signingRegion '*' is only supported when using the CRT dependency @aws-sdk/signature-v4-crt. Please check whether you have installed the \"@aws-sdk/signature-v4-crt\" package explicitly. You must also register the package by calling [require(\"@aws-sdk/signature-v4-crt\");] or an ESM equivalent such as [import \"@aws-sdk/signature-v4-crt\";]. For more information please go to https://github.com/aws/aws-sdk-js-v3#functionality-requiring-aws-common-runtime-crt");
			}
			return this.sigv4Signer.signWithCredentials(requestToSign, credentials, options);
		}
		async presign(originalRequest, options = {}) {
			if (options.signingRegion === "*") {
				const signer = this.getSigv4aSigner();
				const CrtSignerV4 = signatureV4CrtContainer.CrtSignerV4;
				if (CrtSignerV4 && signer instanceof CrtSignerV4) return signer.presign(originalRequest, options);
				else throw new Error("presign with signingRegion '*' is only supported when using the CRT dependency @aws-sdk/signature-v4-crt. Please check whether you have installed the \"@aws-sdk/signature-v4-crt\" package explicitly. You must also register the package by calling [require(\"@aws-sdk/signature-v4-crt\");] or an ESM equivalent such as [import \"@aws-sdk/signature-v4-crt\";]. For more information please go to https://github.com/aws/aws-sdk-js-v3#functionality-requiring-aws-common-runtime-crt");
			}
			return this.sigv4Signer.presign(originalRequest, options);
		}
		async presignWithCredentials(originalRequest, credentials, options = {}) {
			if (options.signingRegion === "*") throw new Error("Method presignWithCredentials is not supported for [signingRegion=*].");
			return this.sigv4Signer.presignWithCredentials(originalRequest, credentials, options);
		}
		getSigv4aSigner() {
			if (!this.sigv4aSigner) {
				const CrtSignerV4 = signatureV4CrtContainer.CrtSignerV4;
				const JsSigV4aSigner = signatureV4.signatureV4aContainer.SignatureV4a;
				if (this.signerOptions.runtime === "node") {
					if (!CrtSignerV4 && !JsSigV4aSigner) throw new Error("Neither CRT nor JS SigV4a implementation is available. Please load either @aws-sdk/signature-v4-crt or @aws-sdk/signature-v4a. For more information please go to https://github.com/aws/aws-sdk-js-v3#functionality-requiring-aws-common-runtime-crt");
					if (CrtSignerV4 && typeof CrtSignerV4 === "function") this.sigv4aSigner = new CrtSignerV4({
						...this.signerOptions,
						signingAlgorithm: 1
					});
					else if (JsSigV4aSigner && typeof JsSigV4aSigner === "function") this.sigv4aSigner = new JsSigV4aSigner({ ...this.signerOptions });
					else throw new Error("Available SigV4a implementation is not a valid constructor. Please ensure you've properly imported @aws-sdk/signature-v4-crt or @aws-sdk/signature-v4a.For more information please go to https://github.com/aws/aws-sdk-js-v3#functionality-requiring-aws-common-runtime-crt");
				} else {
					if (!JsSigV4aSigner || typeof JsSigV4aSigner !== "function") throw new Error("JS SigV4a implementation is not available or not a valid constructor. Please check whether you have installed the @aws-sdk/signature-v4a package explicitly. The CRT implementation is not available for browsers. You must also register the package by calling [require('@aws-sdk/signature-v4a');] or an ESM equivalent such as [import '@aws-sdk/signature-v4a';]. For more information please go to https://github.com/aws/aws-sdk-js-v3#using-javascript-non-crt-implementation-of-sigv4a");
					this.sigv4aSigner = new JsSigV4aSigner({ ...this.signerOptions });
				}
			}
			return this.sigv4aSigner;
		}
	};
	exports.SignatureV4MultiRegion = SignatureV4MultiRegion;
}));
//#endregion
//#region ../../node_modules/.bun/@aws-sdk+nested-clients@3.997.6/node_modules/@aws-sdk/nested-clients/dist-es/submodules/sts/endpoint/bdd.js
var import_dist_cjs$39, q, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, _data, root, r, nodes, bdd;
var init_bdd = require_chunk.__esmMin((() => {
	import_dist_cjs$39 = require_dist_cjs$30.require_dist_cjs$13();
	q = "ref";
	a = -1, b = true, c = "isSet", d = "PartitionResult", e = "booleanEquals", f = "stringEquals", g = "getAttr", h = "us-east-1", i = "sigv4", j = "sts", k = "https://sts.{Region}.{PartitionResult#dnsSuffix}", l = { [q]: "Endpoint" }, m = { [q]: "Region" }, n = { [q]: d }, o = {}, p = [m];
	_data = {
		conditions: [
			[c, [l]],
			[c, p],
			[
				"aws.partition",
				p,
				d
			],
			[e, [{ [q]: "UseFIPS" }, b]],
			[e, [{ [q]: "UseDualStack" }, b]],
			[f, [m, "aws-global"]],
			[e, [{ [q]: "UseGlobalEndpoint" }, b]],
			[f, [m, "eu-central-1"]],
			[e, [{
				fn: g,
				argv: [n, "supportsDualStack"]
			}, b]],
			[e, [{
				fn: g,
				argv: [n, "supportsFIPS"]
			}, b]],
			[f, [m, "ap-south-1"]],
			[f, [m, "eu-north-1"]],
			[f, [m, "eu-west-1"]],
			[f, [m, "eu-west-2"]],
			[f, [m, "eu-west-3"]],
			[f, [m, "sa-east-1"]],
			[f, [m, h]],
			[f, [m, "us-east-2"]],
			[f, [m, "us-west-2"]],
			[f, [m, "us-west-1"]],
			[f, [m, "ca-central-1"]],
			[f, [m, "ap-southeast-1"]],
			[f, [m, "ap-northeast-1"]],
			[f, [m, "ap-southeast-2"]],
			[f, [{
				fn: g,
				argv: [n, "name"]
			}, "aws-us-gov"]]
		],
		results: [
			[a],
			["https://sts.amazonaws.com", { authSchemes: [{
				name: i,
				signingName: j,
				signingRegion: h
			}] }],
			[k, { authSchemes: [{
				name: i,
				signingName: j,
				signingRegion: "{Region}"
			}] }],
			[a, "Invalid Configuration: FIPS and custom endpoint are not supported"],
			[a, "Invalid Configuration: Dualstack and custom endpoint are not supported"],
			[l, o],
			["https://sts-fips.{Region}.{PartitionResult#dualStackDnsSuffix}", o],
			[a, "FIPS and DualStack are enabled, but this partition does not support one or both"],
			["https://sts.{Region}.amazonaws.com", o],
			["https://sts-fips.{Region}.{PartitionResult#dnsSuffix}", o],
			[a, "FIPS is enabled but this partition does not support FIPS"],
			["https://sts.{Region}.{PartitionResult#dualStackDnsSuffix}", o],
			[a, "DualStack is enabled but this partition does not support DualStack"],
			[k, o],
			[a, "Invalid Configuration: Missing Region"]
		]
	};
	root = 2;
	r = 1e8;
	nodes = new Int32Array([
		-1,
		1,
		-1,
		0,
		30,
		3,
		1,
		4,
		r + 14,
		2,
		5,
		r + 14,
		3,
		25,
		6,
		4,
		24,
		7,
		5,
		r + 1,
		8,
		6,
		9,
		r + 13,
		7,
		r + 1,
		10,
		10,
		r + 1,
		11,
		11,
		r + 1,
		12,
		12,
		r + 1,
		13,
		13,
		r + 1,
		14,
		14,
		r + 1,
		15,
		15,
		r + 1,
		16,
		16,
		r + 1,
		17,
		17,
		r + 1,
		18,
		18,
		r + 1,
		19,
		19,
		r + 1,
		20,
		20,
		r + 1,
		21,
		21,
		r + 1,
		22,
		22,
		r + 1,
		23,
		23,
		r + 1,
		r + 2,
		8,
		r + 11,
		r + 12,
		4,
		28,
		26,
		9,
		27,
		r + 10,
		24,
		r + 8,
		r + 9,
		8,
		29,
		r + 7,
		9,
		r + 6,
		r + 7,
		3,
		r + 3,
		31,
		4,
		r + 4,
		r + 5
	]);
	bdd = import_dist_cjs$39.BinaryDecisionDiagram.from(nodes, root, _data.conditions, _data.results);
}));
//#endregion
//#region ../../node_modules/.bun/@aws-sdk+nested-clients@3.997.6/node_modules/@aws-sdk/nested-clients/dist-es/submodules/sts/endpoint/endpointResolver.js
var import_dist_cjs$37, import_dist_cjs$38, cache, defaultEndpointResolver;
var init_endpointResolver = require_chunk.__esmMin((() => {
	import_dist_cjs$37 = require_dist_cjs$30.require_dist_cjs$12();
	import_dist_cjs$38 = require_dist_cjs$30.require_dist_cjs$13();
	init_bdd();
	cache = new import_dist_cjs$38.EndpointCache({
		size: 50,
		params: [
			"Endpoint",
			"Region",
			"UseDualStack",
			"UseFIPS",
			"UseGlobalEndpoint"
		]
	});
	defaultEndpointResolver = (endpointParams, context = {}) => {
		return cache.get(endpointParams, () => (0, import_dist_cjs$38.decideEndpoint)(bdd, {
			endpointParams,
			logger: context.logger
		}));
	};
	import_dist_cjs$38.customEndpointFunctions.aws = import_dist_cjs$37.awsEndpointFunctions;
}));
//#endregion
//#region ../../node_modules/.bun/@aws-sdk+nested-clients@3.997.6/node_modules/@aws-sdk/nested-clients/dist-es/submodules/sts/auth/httpAuthSchemeProvider.js
function createAwsAuthSigv4HttpAuthOption(authParameters) {
	return {
		schemeId: "aws.auth#sigv4",
		signingProperties: {
			name: "sts",
			region: authParameters.region
		},
		propertiesExtractor: (config, context) => ({ signingProperties: {
			config,
			context
		} })
	};
}
function createAwsAuthSigv4aHttpAuthOption(authParameters) {
	return {
		schemeId: "aws.auth#sigv4a",
		signingProperties: {
			name: "sts",
			region: authParameters.region
		},
		propertiesExtractor: (config, context) => ({ signingProperties: {
			config,
			context
		} })
	};
}
function createSmithyApiNoAuthHttpAuthOption(authParameters) {
	return { schemeId: "smithy.api#noAuth" };
}
var import_dist_cjs$34, import_dist_cjs$35, import_dist_cjs$36, createEndpointRuleSetHttpAuthSchemeParametersProvider, _defaultSTSHttpAuthSchemeParametersProvider, defaultSTSHttpAuthSchemeParametersProvider, createEndpointRuleSetHttpAuthSchemeProvider, _defaultSTSHttpAuthSchemeProvider, defaultSTSHttpAuthSchemeProvider, resolveStsAuthConfig, resolveHttpAuthSchemeConfig;
var init_httpAuthSchemeProvider = require_chunk.__esmMin((() => {
	require_dist_cjs$30.init_httpAuthSchemes();
	import_dist_cjs$34 = require_dist_cjs();
	import_dist_cjs$35 = require_dist_cjs$30.require_dist_cjs$7();
	import_dist_cjs$36 = require_dist_cjs$31.require_dist_cjs$7();
	init_endpointResolver();
	init_STSClient();
	createEndpointRuleSetHttpAuthSchemeParametersProvider = (defaultHttpAuthSchemeParametersProvider) => async (config, context, input) => {
		if (!input) throw new Error("Could not find `input` for `defaultEndpointRuleSetHttpAuthSchemeParametersProvider`");
		const defaultParameters = await defaultHttpAuthSchemeParametersProvider(config, context, input);
		const instructionsFn = (0, import_dist_cjs$36.getSmithyContext)(context)?.commandInstance?.constructor?.getEndpointParameterInstructions;
		if (!instructionsFn) throw new Error(`getEndpointParameterInstructions() is not defined on '${context.commandName}'`);
		const endpointParameters = await (0, import_dist_cjs$35.resolveParams)(input, { getEndpointParameterInstructions: instructionsFn }, config);
		return Object.assign(defaultParameters, endpointParameters);
	};
	_defaultSTSHttpAuthSchemeParametersProvider = async (config, context, input) => {
		return {
			operation: (0, import_dist_cjs$36.getSmithyContext)(context).operation,
			region: await (0, import_dist_cjs$36.normalizeProvider)(config.region)() || (() => {
				throw new Error("expected `region` to be configured for `aws.auth#sigv4`");
			})()
		};
	};
	defaultSTSHttpAuthSchemeParametersProvider = createEndpointRuleSetHttpAuthSchemeParametersProvider(_defaultSTSHttpAuthSchemeParametersProvider);
	createEndpointRuleSetHttpAuthSchemeProvider = (defaultEndpointResolver, defaultHttpAuthSchemeResolver, createHttpAuthOptionFunctions) => {
		const endpointRuleSetHttpAuthSchemeProvider = (authParameters) => {
			const authSchemes = defaultEndpointResolver(authParameters).properties?.authSchemes;
			if (!authSchemes) return defaultHttpAuthSchemeResolver(authParameters);
			const options = [];
			for (const scheme of authSchemes) {
				const { name: resolvedName, properties = {}, ...rest } = scheme;
				const name = resolvedName.toLowerCase();
				if (resolvedName !== name) console.warn(`HttpAuthScheme has been normalized with lowercasing: '${resolvedName}' to '${name}'`);
				let schemeId;
				if (name === "sigv4a") {
					schemeId = "aws.auth#sigv4a";
					const sigv4Present = authSchemes.find((s) => {
						const name = s.name.toLowerCase();
						return name !== "sigv4a" && name.startsWith("sigv4");
					});
					if (import_dist_cjs$34.SignatureV4MultiRegion.sigv4aDependency() === "none" && sigv4Present) continue;
				} else if (name.startsWith("sigv4")) schemeId = "aws.auth#sigv4";
				else throw new Error(`Unknown HttpAuthScheme found in '@smithy.rules#endpointRuleSet': '${name}'`);
				const createOption = createHttpAuthOptionFunctions[schemeId];
				if (!createOption) throw new Error(`Could not find HttpAuthOption create function for '${schemeId}'`);
				const option = createOption(authParameters);
				option.schemeId = schemeId;
				option.signingProperties = {
					...option.signingProperties || {},
					...rest,
					...properties
				};
				options.push(option);
			}
			return options;
		};
		return endpointRuleSetHttpAuthSchemeProvider;
	};
	_defaultSTSHttpAuthSchemeProvider = (authParameters) => {
		const options = [];
		switch (authParameters.operation) {
			case "AssumeRoleWithWebIdentity":
				options.push(createSmithyApiNoAuthHttpAuthOption(authParameters));
				options.push(createAwsAuthSigv4aHttpAuthOption(authParameters));
				break;
			default:
				options.push(createAwsAuthSigv4HttpAuthOption(authParameters));
				options.push(createAwsAuthSigv4aHttpAuthOption(authParameters));
		}
		return options;
	};
	defaultSTSHttpAuthSchemeProvider = createEndpointRuleSetHttpAuthSchemeProvider(defaultEndpointResolver, _defaultSTSHttpAuthSchemeProvider, {
		"aws.auth#sigv4": createAwsAuthSigv4HttpAuthOption,
		"aws.auth#sigv4a": createAwsAuthSigv4aHttpAuthOption,
		"smithy.api#noAuth": createSmithyApiNoAuthHttpAuthOption
	});
	resolveStsAuthConfig = (input) => Object.assign(input, { stsClientCtor: STSClient });
	resolveHttpAuthSchemeConfig = (config) => {
		const config_2 = require_dist_cjs$30.resolveAwsSdkSigV4AConfig(require_dist_cjs$30.resolveAwsSdkSigV4Config(resolveStsAuthConfig(config)));
		return Object.assign(config_2, { authSchemePreference: (0, import_dist_cjs$36.normalizeProvider)(config.authSchemePreference ?? []) });
	};
}));
//#endregion
//#region ../../node_modules/.bun/@aws-sdk+nested-clients@3.997.6/node_modules/@aws-sdk/nested-clients/dist-es/submodules/sts/endpoint/EndpointParameters.js
var resolveClientEndpointParameters, commonParams;
var init_EndpointParameters = require_chunk.__esmMin((() => {
	resolveClientEndpointParameters = (options) => {
		return Object.assign(options, {
			useDualstackEndpoint: options.useDualstackEndpoint ?? false,
			useFipsEndpoint: options.useFipsEndpoint ?? false,
			useGlobalEndpoint: options.useGlobalEndpoint ?? false,
			defaultSigningName: "sts"
		});
	};
	commonParams = {
		UseGlobalEndpoint: {
			type: "builtInParams",
			name: "useGlobalEndpoint"
		},
		UseFIPS: {
			type: "builtInParams",
			name: "useFipsEndpoint"
		},
		Endpoint: {
			type: "builtInParams",
			name: "endpoint"
		},
		Region: {
			type: "builtInParams",
			name: "region"
		},
		UseDualStack: {
			type: "builtInParams",
			name: "useDualstackEndpoint"
		}
	};
}));
//#endregion
//#region ../../node_modules/.bun/@aws-sdk+nested-clients@3.997.6/node_modules/@aws-sdk/nested-clients/dist-es/submodules/sts/models/STSServiceException.js
var import_dist_cjs$33, STSServiceException;
var init_STSServiceException = require_chunk.__esmMin((() => {
	import_dist_cjs$33 = require_dist_cjs$31.require_dist_cjs();
	STSServiceException = class STSServiceException extends import_dist_cjs$33.ServiceException {
		constructor(options) {
			super(options);
			Object.setPrototypeOf(this, STSServiceException.prototype);
		}
	};
}));
//#endregion
//#region ../../node_modules/.bun/@aws-sdk+nested-clients@3.997.6/node_modules/@aws-sdk/nested-clients/dist-es/submodules/sts/models/errors.js
var ExpiredTokenException, MalformedPolicyDocumentException, PackedPolicyTooLargeException, RegionDisabledException, IDPRejectedClaimException, InvalidIdentityTokenException, IDPCommunicationErrorException;
var init_errors = require_chunk.__esmMin((() => {
	init_STSServiceException();
	ExpiredTokenException = class ExpiredTokenException extends STSServiceException {
		name = "ExpiredTokenException";
		$fault = "client";
		constructor(opts) {
			super({
				name: "ExpiredTokenException",
				$fault: "client",
				...opts
			});
			Object.setPrototypeOf(this, ExpiredTokenException.prototype);
		}
	};
	MalformedPolicyDocumentException = class MalformedPolicyDocumentException extends STSServiceException {
		name = "MalformedPolicyDocumentException";
		$fault = "client";
		constructor(opts) {
			super({
				name: "MalformedPolicyDocumentException",
				$fault: "client",
				...opts
			});
			Object.setPrototypeOf(this, MalformedPolicyDocumentException.prototype);
		}
	};
	PackedPolicyTooLargeException = class PackedPolicyTooLargeException extends STSServiceException {
		name = "PackedPolicyTooLargeException";
		$fault = "client";
		constructor(opts) {
			super({
				name: "PackedPolicyTooLargeException",
				$fault: "client",
				...opts
			});
			Object.setPrototypeOf(this, PackedPolicyTooLargeException.prototype);
		}
	};
	RegionDisabledException = class RegionDisabledException extends STSServiceException {
		name = "RegionDisabledException";
		$fault = "client";
		constructor(opts) {
			super({
				name: "RegionDisabledException",
				$fault: "client",
				...opts
			});
			Object.setPrototypeOf(this, RegionDisabledException.prototype);
		}
	};
	IDPRejectedClaimException = class IDPRejectedClaimException extends STSServiceException {
		name = "IDPRejectedClaimException";
		$fault = "client";
		constructor(opts) {
			super({
				name: "IDPRejectedClaimException",
				$fault: "client",
				...opts
			});
			Object.setPrototypeOf(this, IDPRejectedClaimException.prototype);
		}
	};
	InvalidIdentityTokenException = class InvalidIdentityTokenException extends STSServiceException {
		name = "InvalidIdentityTokenException";
		$fault = "client";
		constructor(opts) {
			super({
				name: "InvalidIdentityTokenException",
				$fault: "client",
				...opts
			});
			Object.setPrototypeOf(this, InvalidIdentityTokenException.prototype);
		}
	};
	IDPCommunicationErrorException = class IDPCommunicationErrorException extends STSServiceException {
		name = "IDPCommunicationErrorException";
		$fault = "client";
		$retryable = {};
		constructor(opts) {
			super({
				name: "IDPCommunicationErrorException",
				$fault: "client",
				...opts
			});
			Object.setPrototypeOf(this, IDPCommunicationErrorException.prototype);
		}
	};
}));
//#endregion
//#region ../../node_modules/.bun/@aws-sdk+nested-clients@3.997.6/node_modules/@aws-sdk/nested-clients/dist-es/submodules/sts/schemas/schemas_0.js
var _A, _AKI, _AR, _ARI, _ARR, _ARRs, _ARU, _ARWWI, _ARWWIR, _ARWWIRs, _Au, _C, _CA, _DS, _E, _EI, _ETE, _IDPCEE, _IDPRCE, _IITE, _K, _MPDE, _P, _PA, _PAr, _PC, _PCLT, _PCr, _PDT, _PI, _PPS, _PPTLE, _Pr, _RA, _RDE, _RSN, _SAK, _SFWIT, _SI, _SN, _ST, _T, _TC, _TTK, _Ta, _V, _WIT, _a, _aKST, _aQE, _c, _cTT, _e, _hE, _m, _pDLT, _s, _tLT, n0, _s_registry, STSServiceException$, n0_registry, ExpiredTokenException$, IDPCommunicationErrorException$, IDPRejectedClaimException$, InvalidIdentityTokenException$, MalformedPolicyDocumentException$, PackedPolicyTooLargeException$, RegionDisabledException$, errorTypeRegistries, accessKeySecretType, clientTokenType, AssumedRoleUser$, AssumeRoleRequest$, AssumeRoleResponse$, AssumeRoleWithWebIdentityRequest$, AssumeRoleWithWebIdentityResponse$, Credentials$, PolicyDescriptorType$, ProvidedContext$, Tag$, policyDescriptorListType, ProvidedContextsListType, tagListType, AssumeRole$, AssumeRoleWithWebIdentity$;
var init_schemas_0 = require_chunk.__esmMin((() => {
	require_dist_cjs$31.init_schema();
	init_errors();
	init_STSServiceException();
	_A = "Arn";
	_AKI = "AccessKeyId";
	_AR = "AssumeRole";
	_ARI = "AssumedRoleId";
	_ARR = "AssumeRoleRequest";
	_ARRs = "AssumeRoleResponse";
	_ARU = "AssumedRoleUser";
	_ARWWI = "AssumeRoleWithWebIdentity";
	_ARWWIR = "AssumeRoleWithWebIdentityRequest";
	_ARWWIRs = "AssumeRoleWithWebIdentityResponse";
	_Au = "Audience";
	_C = "Credentials";
	_CA = "ContextAssertion";
	_DS = "DurationSeconds";
	_E = "Expiration";
	_EI = "ExternalId";
	_ETE = "ExpiredTokenException";
	_IDPCEE = "IDPCommunicationErrorException";
	_IDPRCE = "IDPRejectedClaimException";
	_IITE = "InvalidIdentityTokenException";
	_K = "Key";
	_MPDE = "MalformedPolicyDocumentException";
	_P = "Policy";
	_PA = "PolicyArns";
	_PAr = "ProviderArn";
	_PC = "ProvidedContexts";
	_PCLT = "ProvidedContextsListType";
	_PCr = "ProvidedContext";
	_PDT = "PolicyDescriptorType";
	_PI = "ProviderId";
	_PPS = "PackedPolicySize";
	_PPTLE = "PackedPolicyTooLargeException";
	_Pr = "Provider";
	_RA = "RoleArn";
	_RDE = "RegionDisabledException";
	_RSN = "RoleSessionName";
	_SAK = "SecretAccessKey";
	_SFWIT = "SubjectFromWebIdentityToken";
	_SI = "SourceIdentity";
	_SN = "SerialNumber";
	_ST = "SessionToken";
	_T = "Tags";
	_TC = "TokenCode";
	_TTK = "TransitiveTagKeys";
	_Ta = "Tag";
	_V = "Value";
	_WIT = "WebIdentityToken";
	_a = "arn";
	_aKST = "accessKeySecretType";
	_aQE = "awsQueryError";
	_c = "client";
	_cTT = "clientTokenType";
	_e = "error";
	_hE = "httpError";
	_m = "message";
	_pDLT = "policyDescriptorListType";
	_s = "smithy.ts.sdk.synthetic.com.amazonaws.sts";
	_tLT = "tagListType";
	n0 = "com.amazonaws.sts";
	_s_registry = require_dist_cjs$31.TypeRegistry.for(_s);
	STSServiceException$ = [
		-3,
		_s,
		"STSServiceException",
		0,
		[],
		[]
	];
	_s_registry.registerError(STSServiceException$, STSServiceException);
	n0_registry = require_dist_cjs$31.TypeRegistry.for(n0);
	ExpiredTokenException$ = [
		-3,
		n0,
		_ETE,
		{
			[_aQE]: [`ExpiredTokenException`, 400],
			[_e]: _c,
			[_hE]: 400
		},
		[_m],
		[0]
	];
	n0_registry.registerError(ExpiredTokenException$, ExpiredTokenException);
	IDPCommunicationErrorException$ = [
		-3,
		n0,
		_IDPCEE,
		{
			[_aQE]: [`IDPCommunicationError`, 400],
			[_e]: _c,
			[_hE]: 400
		},
		[_m],
		[0]
	];
	n0_registry.registerError(IDPCommunicationErrorException$, IDPCommunicationErrorException);
	IDPRejectedClaimException$ = [
		-3,
		n0,
		_IDPRCE,
		{
			[_aQE]: [`IDPRejectedClaim`, 403],
			[_e]: _c,
			[_hE]: 403
		},
		[_m],
		[0]
	];
	n0_registry.registerError(IDPRejectedClaimException$, IDPRejectedClaimException);
	InvalidIdentityTokenException$ = [
		-3,
		n0,
		_IITE,
		{
			[_aQE]: [`InvalidIdentityToken`, 400],
			[_e]: _c,
			[_hE]: 400
		},
		[_m],
		[0]
	];
	n0_registry.registerError(InvalidIdentityTokenException$, InvalidIdentityTokenException);
	MalformedPolicyDocumentException$ = [
		-3,
		n0,
		_MPDE,
		{
			[_aQE]: [`MalformedPolicyDocument`, 400],
			[_e]: _c,
			[_hE]: 400
		},
		[_m],
		[0]
	];
	n0_registry.registerError(MalformedPolicyDocumentException$, MalformedPolicyDocumentException);
	PackedPolicyTooLargeException$ = [
		-3,
		n0,
		_PPTLE,
		{
			[_aQE]: [`PackedPolicyTooLarge`, 400],
			[_e]: _c,
			[_hE]: 400
		},
		[_m],
		[0]
	];
	n0_registry.registerError(PackedPolicyTooLargeException$, PackedPolicyTooLargeException);
	RegionDisabledException$ = [
		-3,
		n0,
		_RDE,
		{
			[_aQE]: [`RegionDisabledException`, 403],
			[_e]: _c,
			[_hE]: 403
		},
		[_m],
		[0]
	];
	n0_registry.registerError(RegionDisabledException$, RegionDisabledException);
	errorTypeRegistries = [_s_registry, n0_registry];
	accessKeySecretType = [
		0,
		n0,
		_aKST,
		8,
		0
	];
	clientTokenType = [
		0,
		n0,
		_cTT,
		8,
		0
	];
	AssumedRoleUser$ = [
		3,
		n0,
		_ARU,
		0,
		[_ARI, _A],
		[0, 0],
		2
	];
	AssumeRoleRequest$ = [
		3,
		n0,
		_ARR,
		0,
		[
			_RA,
			_RSN,
			_PA,
			_P,
			_DS,
			_T,
			_TTK,
			_EI,
			_SN,
			_TC,
			_SI,
			_PC
		],
		[
			0,
			0,
			() => policyDescriptorListType,
			0,
			1,
			() => tagListType,
			64,
			0,
			0,
			0,
			0,
			() => ProvidedContextsListType
		],
		2
	];
	AssumeRoleResponse$ = [
		3,
		n0,
		_ARRs,
		0,
		[
			_C,
			_ARU,
			_PPS,
			_SI
		],
		[
			[() => Credentials$, 0],
			() => AssumedRoleUser$,
			1,
			0
		]
	];
	AssumeRoleWithWebIdentityRequest$ = [
		3,
		n0,
		_ARWWIR,
		0,
		[
			_RA,
			_RSN,
			_WIT,
			_PI,
			_PA,
			_P,
			_DS
		],
		[
			0,
			0,
			[() => clientTokenType, 0],
			0,
			() => policyDescriptorListType,
			0,
			1
		],
		3
	];
	AssumeRoleWithWebIdentityResponse$ = [
		3,
		n0,
		_ARWWIRs,
		0,
		[
			_C,
			_SFWIT,
			_ARU,
			_PPS,
			_Pr,
			_Au,
			_SI
		],
		[
			[() => Credentials$, 0],
			0,
			() => AssumedRoleUser$,
			1,
			0,
			0,
			0
		]
	];
	Credentials$ = [
		3,
		n0,
		_C,
		0,
		[
			_AKI,
			_SAK,
			_ST,
			_E
		],
		[
			0,
			[() => accessKeySecretType, 0],
			0,
			4
		],
		4
	];
	PolicyDescriptorType$ = [
		3,
		n0,
		_PDT,
		0,
		[_a],
		[0]
	];
	ProvidedContext$ = [
		3,
		n0,
		_PCr,
		0,
		[_PAr, _CA],
		[0, 0]
	];
	Tag$ = [
		3,
		n0,
		_Ta,
		0,
		[_K, _V],
		[0, 0],
		2
	];
	policyDescriptorListType = [
		1,
		n0,
		_pDLT,
		0,
		() => PolicyDescriptorType$
	];
	ProvidedContextsListType = [
		1,
		n0,
		_PCLT,
		0,
		() => ProvidedContext$
	];
	tagListType = [
		1,
		n0,
		_tLT,
		0,
		() => Tag$
	];
	AssumeRole$ = [
		9,
		n0,
		_AR,
		0,
		() => AssumeRoleRequest$,
		() => AssumeRoleResponse$
	];
	AssumeRoleWithWebIdentity$ = [
		9,
		n0,
		_ARWWI,
		0,
		() => AssumeRoleWithWebIdentityRequest$,
		() => AssumeRoleWithWebIdentityResponse$
	];
}));
//#endregion
//#region ../../node_modules/.bun/@aws-sdk+nested-clients@3.997.6/node_modules/@aws-sdk/nested-clients/dist-es/submodules/sts/runtimeConfig.shared.js
var import_dist_cjs$28, import_dist_cjs$29, import_dist_cjs$30, import_dist_cjs$31, import_dist_cjs$32, getRuntimeConfig$1;
var init_runtimeConfig_shared = require_chunk.__esmMin((() => {
	require_dist_cjs$30.init_httpAuthSchemes();
	require_dist_cjs$30.init_protocols();
	import_dist_cjs$28 = require_dist_cjs();
	require_dist_cjs$30.init_dist_es();
	import_dist_cjs$29 = require_dist_cjs$31.require_dist_cjs();
	import_dist_cjs$30 = require_dist_cjs$33.require_dist_cjs();
	import_dist_cjs$31 = require_dist_cjs$31.require_dist_cjs$6();
	import_dist_cjs$32 = require_dist_cjs$32.require_dist_cjs();
	init_httpAuthSchemeProvider();
	init_endpointResolver();
	init_schemas_0();
	getRuntimeConfig$1 = (config) => {
		return {
			apiVersion: "2011-06-15",
			base64Decoder: config?.base64Decoder ?? import_dist_cjs$31.fromBase64,
			base64Encoder: config?.base64Encoder ?? import_dist_cjs$31.toBase64,
			disableHostPrefix: config?.disableHostPrefix ?? false,
			endpointProvider: config?.endpointProvider ?? defaultEndpointResolver,
			extensions: config?.extensions ?? [],
			httpAuthSchemeProvider: config?.httpAuthSchemeProvider ?? defaultSTSHttpAuthSchemeProvider,
			httpAuthSchemes: config?.httpAuthSchemes ?? [
				{
					schemeId: "aws.auth#sigv4",
					identityProvider: (ipc) => ipc.getIdentityProvider("aws.auth#sigv4"),
					signer: new require_dist_cjs$30.AwsSdkSigV4Signer()
				},
				{
					schemeId: "aws.auth#sigv4a",
					identityProvider: (ipc) => ipc.getIdentityProvider("aws.auth#sigv4a"),
					signer: new require_dist_cjs$30.AwsSdkSigV4ASigner()
				},
				{
					schemeId: "smithy.api#noAuth",
					identityProvider: (ipc) => ipc.getIdentityProvider("smithy.api#noAuth") || (async () => ({})),
					signer: new require_dist_cjs$30.NoAuthSigner()
				}
			],
			logger: config?.logger ?? new import_dist_cjs$29.NoOpLogger(),
			protocol: config?.protocol ?? require_dist_cjs$30.AwsQueryProtocol,
			protocolSettings: config?.protocolSettings ?? {
				defaultNamespace: "com.amazonaws.sts",
				errorTypeRegistries,
				xmlNamespace: "https://sts.amazonaws.com/doc/2011-06-15/",
				version: "2011-06-15",
				serviceTarget: "AWSSecurityTokenServiceV20110615"
			},
			serviceId: config?.serviceId ?? "STS",
			signerConstructor: config?.signerConstructor ?? import_dist_cjs$28.SignatureV4MultiRegion,
			urlParser: config?.urlParser ?? import_dist_cjs$30.parseUrl,
			utf8Decoder: config?.utf8Decoder ?? import_dist_cjs$32.fromUtf8,
			utf8Encoder: config?.utf8Encoder ?? import_dist_cjs$32.toUtf8
		};
	};
}));
//#endregion
//#region ../../node_modules/.bun/@aws-sdk+nested-clients@3.997.6/node_modules/@aws-sdk/nested-clients/dist-es/submodules/sts/runtimeConfig.js
var import_dist_cjs$18, import_dist_cjs$19, import_dist_cjs$20, import_dist_cjs$21, import_dist_cjs$22, import_dist_cjs$23, import_dist_cjs$24, import_dist_cjs$25, import_dist_cjs$26, import_dist_cjs$27, getRuntimeConfig;
var init_runtimeConfig = require_chunk.__esmMin((() => {
	require_client.init_client();
	require_dist_cjs$30.init_httpAuthSchemes();
	import_dist_cjs$18 = require_dist_cjs$30.require_dist_cjs$4();
	import_dist_cjs$19 = require_dist_cjs$30.require_dist_cjs$9();
	require_dist_cjs$30.init_dist_es();
	import_dist_cjs$20 = require_dist_cjs$30.require_dist_cjs$3();
	import_dist_cjs$21 = require_dist_cjs$30.require_dist_cjs$6();
	import_dist_cjs$22 = require_dist_cjs$34.require_dist_cjs();
	import_dist_cjs$23 = require_dist_cjs$31.require_dist_cjs$4();
	import_dist_cjs$24 = require_dist_cjs$31.require_dist_cjs();
	import_dist_cjs$25 = require_dist_cjs$30.require_dist_cjs$2();
	import_dist_cjs$26 = require_dist_cjs$30.require_dist_cjs$1();
	import_dist_cjs$27 = require_client.require_dist_cjs();
	init_runtimeConfig_shared();
	getRuntimeConfig = (config) => {
		(0, import_dist_cjs$24.emitWarningIfUnsupportedVersion)(process.version);
		const defaultsMode = (0, import_dist_cjs$26.resolveDefaultsModeConfig)(config);
		const defaultConfigProvider = () => defaultsMode().then(import_dist_cjs$24.loadConfigsForDefaultMode);
		const clientSharedValues = getRuntimeConfig$1(config);
		require_client.emitWarningIfUnsupportedVersion(process.version);
		const loaderConfig = {
			profile: config?.profile,
			logger: clientSharedValues.logger
		};
		return {
			...clientSharedValues,
			...config,
			runtime: "node",
			defaultsMode,
			authSchemePreference: config?.authSchemePreference ?? (0, import_dist_cjs$22.loadConfig)(require_dist_cjs$30.NODE_AUTH_SCHEME_PREFERENCE_OPTIONS, loaderConfig),
			bodyLengthChecker: config?.bodyLengthChecker ?? import_dist_cjs$25.calculateBodyLength,
			defaultUserAgentProvider: config?.defaultUserAgentProvider ?? (0, import_dist_cjs$18.createDefaultUserAgentProvider)({
				serviceId: clientSharedValues.serviceId,
				clientVersion: require_package.version
			}),
			httpAuthSchemes: config?.httpAuthSchemes ?? [
				{
					schemeId: "aws.auth#sigv4",
					identityProvider: (ipc) => ipc.getIdentityProvider("aws.auth#sigv4") || (async (idProps) => await config.credentialDefaultProvider(idProps?.__config || {})()),
					signer: new require_dist_cjs$30.AwsSdkSigV4Signer()
				},
				{
					schemeId: "aws.auth#sigv4a",
					identityProvider: (ipc) => ipc.getIdentityProvider("aws.auth#sigv4a"),
					signer: new require_dist_cjs$30.AwsSdkSigV4ASigner()
				},
				{
					schemeId: "smithy.api#noAuth",
					identityProvider: (ipc) => ipc.getIdentityProvider("smithy.api#noAuth") || (async () => ({})),
					signer: new require_dist_cjs$30.NoAuthSigner()
				}
			],
			maxAttempts: config?.maxAttempts ?? (0, import_dist_cjs$22.loadConfig)(import_dist_cjs$21.NODE_MAX_ATTEMPT_CONFIG_OPTIONS, config),
			region: config?.region ?? (0, import_dist_cjs$22.loadConfig)(import_dist_cjs$19.NODE_REGION_CONFIG_OPTIONS, {
				...import_dist_cjs$19.NODE_REGION_CONFIG_FILE_OPTIONS,
				...loaderConfig
			}),
			requestHandler: import_dist_cjs$23.NodeHttpHandler.create(config?.requestHandler ?? defaultConfigProvider),
			retryMode: config?.retryMode ?? (0, import_dist_cjs$22.loadConfig)({
				...import_dist_cjs$21.NODE_RETRY_MODE_CONFIG_OPTIONS,
				default: async () => (await defaultConfigProvider()).retryMode || import_dist_cjs$27.DEFAULT_RETRY_MODE
			}, config),
			sha256: config?.sha256 ?? import_dist_cjs$20.Hash.bind(null, "sha256"),
			sigv4aSigningRegionSet: config?.sigv4aSigningRegionSet ?? (0, import_dist_cjs$22.loadConfig)(require_dist_cjs$30.NODE_SIGV4A_CONFIG_OPTIONS, loaderConfig),
			streamCollector: config?.streamCollector ?? import_dist_cjs$23.streamCollector,
			useDualstackEndpoint: config?.useDualstackEndpoint ?? (0, import_dist_cjs$22.loadConfig)(import_dist_cjs$19.NODE_USE_DUALSTACK_ENDPOINT_CONFIG_OPTIONS, loaderConfig),
			useFipsEndpoint: config?.useFipsEndpoint ?? (0, import_dist_cjs$22.loadConfig)(import_dist_cjs$19.NODE_USE_FIPS_ENDPOINT_CONFIG_OPTIONS, loaderConfig),
			userAgentAppId: config?.userAgentAppId ?? (0, import_dist_cjs$22.loadConfig)(import_dist_cjs$18.NODE_APP_ID_CONFIG_OPTIONS, loaderConfig)
		};
	};
}));
//#endregion
//#region ../../node_modules/.bun/@aws-sdk+nested-clients@3.997.6/node_modules/@aws-sdk/nested-clients/dist-es/submodules/sts/auth/httpAuthExtensionConfiguration.js
var getHttpAuthExtensionConfiguration, resolveHttpAuthRuntimeConfig;
var init_httpAuthExtensionConfiguration = require_chunk.__esmMin((() => {
	getHttpAuthExtensionConfiguration = (runtimeConfig) => {
		const _httpAuthSchemes = runtimeConfig.httpAuthSchemes;
		let _httpAuthSchemeProvider = runtimeConfig.httpAuthSchemeProvider;
		let _credentials = runtimeConfig.credentials;
		return {
			setHttpAuthScheme(httpAuthScheme) {
				const index = _httpAuthSchemes.findIndex((scheme) => scheme.schemeId === httpAuthScheme.schemeId);
				if (index === -1) _httpAuthSchemes.push(httpAuthScheme);
				else _httpAuthSchemes.splice(index, 1, httpAuthScheme);
			},
			httpAuthSchemes() {
				return _httpAuthSchemes;
			},
			setHttpAuthSchemeProvider(httpAuthSchemeProvider) {
				_httpAuthSchemeProvider = httpAuthSchemeProvider;
			},
			httpAuthSchemeProvider() {
				return _httpAuthSchemeProvider;
			},
			setCredentials(credentials) {
				_credentials = credentials;
			},
			credentials() {
				return _credentials;
			}
		};
	};
	resolveHttpAuthRuntimeConfig = (config) => {
		return {
			httpAuthSchemes: config.httpAuthSchemes(),
			httpAuthSchemeProvider: config.httpAuthSchemeProvider(),
			credentials: config.credentials()
		};
	};
}));
//#endregion
//#region ../../node_modules/.bun/@aws-sdk+nested-clients@3.997.6/node_modules/@aws-sdk/nested-clients/dist-es/submodules/sts/runtimeExtensions.js
var import_dist_cjs$15, import_dist_cjs$16, import_dist_cjs$17, resolveRuntimeExtensions;
var init_runtimeExtensions = require_chunk.__esmMin((() => {
	import_dist_cjs$15 = require_dist_cjs$30.require_dist_cjs();
	import_dist_cjs$16 = require_dist_cjs$29.require_dist_cjs();
	import_dist_cjs$17 = require_dist_cjs$31.require_dist_cjs();
	init_httpAuthExtensionConfiguration();
	resolveRuntimeExtensions = (runtimeConfig, extensions) => {
		const extensionConfiguration = Object.assign((0, import_dist_cjs$15.getAwsRegionExtensionConfiguration)(runtimeConfig), (0, import_dist_cjs$17.getDefaultExtensionConfiguration)(runtimeConfig), (0, import_dist_cjs$16.getHttpHandlerExtensionConfiguration)(runtimeConfig), getHttpAuthExtensionConfiguration(runtimeConfig));
		extensions.forEach((extension) => extension.configure(extensionConfiguration));
		return Object.assign(runtimeConfig, (0, import_dist_cjs$15.resolveAwsRegionExtensionConfiguration)(extensionConfiguration), (0, import_dist_cjs$17.resolveDefaultRuntimeConfig)(extensionConfiguration), (0, import_dist_cjs$16.resolveHttpHandlerRuntimeConfig)(extensionConfiguration), resolveHttpAuthRuntimeConfig(extensionConfiguration));
	};
}));
//#endregion
//#region ../../node_modules/.bun/@aws-sdk+nested-clients@3.997.6/node_modules/@aws-sdk/nested-clients/dist-es/submodules/sts/STSClient.js
var import_dist_cjs$6, import_dist_cjs$7, import_dist_cjs$8, import_dist_cjs$9, import_dist_cjs$10, import_dist_cjs$11, import_dist_cjs$12, import_dist_cjs$13, import_dist_cjs$14, STSClient;
var init_STSClient = require_chunk.__esmMin((() => {
	import_dist_cjs$6 = require_dist_cjs$30.require_dist_cjs$16();
	import_dist_cjs$7 = require_dist_cjs$30.require_dist_cjs$15();
	import_dist_cjs$8 = require_dist_cjs$30.require_dist_cjs$14();
	import_dist_cjs$9 = require_dist_cjs$30.require_dist_cjs$11();
	import_dist_cjs$10 = require_dist_cjs$30.require_dist_cjs$9();
	require_dist_cjs$30.init_dist_es();
	require_dist_cjs$31.init_schema();
	import_dist_cjs$11 = require_dist_cjs$30.require_dist_cjs$8();
	import_dist_cjs$12 = require_dist_cjs$30.require_dist_cjs$7();
	import_dist_cjs$13 = require_dist_cjs$30.require_dist_cjs$6();
	import_dist_cjs$14 = require_dist_cjs$31.require_dist_cjs();
	init_httpAuthSchemeProvider();
	init_EndpointParameters();
	init_runtimeConfig();
	init_runtimeExtensions();
	STSClient = class extends import_dist_cjs$14.Client {
		config;
		constructor(...[configuration]) {
			const _config_0 = getRuntimeConfig(configuration || {});
			super(_config_0);
			this.initConfig = _config_0;
			this.config = resolveRuntimeExtensions(resolveHttpAuthSchemeConfig((0, import_dist_cjs$12.resolveEndpointConfig)((0, import_dist_cjs$6.resolveHostHeaderConfig)((0, import_dist_cjs$10.resolveRegionConfig)((0, import_dist_cjs$13.resolveRetryConfig)((0, import_dist_cjs$9.resolveUserAgentConfig)(resolveClientEndpointParameters(_config_0))))))), configuration?.extensions || []);
			this.middlewareStack.use(require_dist_cjs$31.getSchemaSerdePlugin(this.config));
			this.middlewareStack.use((0, import_dist_cjs$9.getUserAgentPlugin)(this.config));
			this.middlewareStack.use((0, import_dist_cjs$13.getRetryPlugin)(this.config));
			this.middlewareStack.use((0, import_dist_cjs$11.getContentLengthPlugin)(this.config));
			this.middlewareStack.use((0, import_dist_cjs$6.getHostHeaderPlugin)(this.config));
			this.middlewareStack.use((0, import_dist_cjs$7.getLoggerPlugin)(this.config));
			this.middlewareStack.use((0, import_dist_cjs$8.getRecursionDetectionPlugin)(this.config));
			this.middlewareStack.use(require_dist_cjs$30.getHttpAuthSchemeEndpointRuleSetPlugin(this.config, {
				httpAuthSchemeParametersProvider: defaultSTSHttpAuthSchemeParametersProvider,
				identityProviderConfigProvider: async (config) => new require_dist_cjs$30.DefaultIdentityProviderConfig({
					"aws.auth#sigv4": config.credentials,
					"aws.auth#sigv4a": config.credentials
				})
			}));
			this.middlewareStack.use(require_dist_cjs$30.getHttpSigningPlugin(this.config));
		}
		destroy() {
			super.destroy();
		}
	};
}));
//#endregion
//#region ../../node_modules/.bun/@aws-sdk+nested-clients@3.997.6/node_modules/@aws-sdk/nested-clients/dist-es/submodules/sts/commands/AssumeRoleCommand.js
var import_dist_cjs$4, import_dist_cjs$5, AssumeRoleCommand;
var init_AssumeRoleCommand = require_chunk.__esmMin((() => {
	import_dist_cjs$4 = require_dist_cjs$30.require_dist_cjs$7();
	import_dist_cjs$5 = require_dist_cjs$31.require_dist_cjs();
	init_EndpointParameters();
	init_schemas_0();
	AssumeRoleCommand = class extends import_dist_cjs$5.Command.classBuilder().ep(commonParams).m(function(Command, cs, config, o) {
		return [(0, import_dist_cjs$4.getEndpointPlugin)(config, Command.getEndpointParameterInstructions())];
	}).s("AWSSecurityTokenServiceV20110615", "AssumeRole", {}).n("STSClient", "AssumeRoleCommand").sc(AssumeRole$).build() {};
}));
//#endregion
//#region ../../node_modules/.bun/@aws-sdk+nested-clients@3.997.6/node_modules/@aws-sdk/nested-clients/dist-es/submodules/sts/commands/AssumeRoleWithWebIdentityCommand.js
var import_dist_cjs$2, import_dist_cjs$3, AssumeRoleWithWebIdentityCommand;
var init_AssumeRoleWithWebIdentityCommand = require_chunk.__esmMin((() => {
	import_dist_cjs$2 = require_dist_cjs$30.require_dist_cjs$7();
	import_dist_cjs$3 = require_dist_cjs$31.require_dist_cjs();
	init_EndpointParameters();
	init_schemas_0();
	AssumeRoleWithWebIdentityCommand = class extends import_dist_cjs$3.Command.classBuilder().ep(commonParams).m(function(Command, cs, config, o) {
		return [(0, import_dist_cjs$2.getEndpointPlugin)(config, Command.getEndpointParameterInstructions())];
	}).s("AWSSecurityTokenServiceV20110615", "AssumeRoleWithWebIdentity", {}).n("STSClient", "AssumeRoleWithWebIdentityCommand").sc(AssumeRoleWithWebIdentity$).build() {};
}));
//#endregion
//#region ../../node_modules/.bun/@aws-sdk+nested-clients@3.997.6/node_modules/@aws-sdk/nested-clients/dist-es/submodules/sts/STS.js
var import_dist_cjs$1, commands, STS;
var init_STS = require_chunk.__esmMin((() => {
	import_dist_cjs$1 = require_dist_cjs$31.require_dist_cjs();
	init_AssumeRoleCommand();
	init_AssumeRoleWithWebIdentityCommand();
	init_STSClient();
	commands = {
		AssumeRoleCommand,
		AssumeRoleWithWebIdentityCommand
	};
	STS = class extends STSClient {};
	(0, import_dist_cjs$1.createAggregatedClient)(commands, STS);
}));
//#endregion
//#region ../../node_modules/.bun/@aws-sdk+nested-clients@3.997.6/node_modules/@aws-sdk/nested-clients/dist-es/submodules/sts/commands/index.js
var init_commands = require_chunk.__esmMin((() => {
	init_AssumeRoleCommand();
	init_AssumeRoleWithWebIdentityCommand();
}));
//#endregion
//#region ../../node_modules/.bun/@aws-sdk+nested-clients@3.997.6/node_modules/@aws-sdk/nested-clients/dist-es/submodules/sts/models/models_0.js
var init_models_0 = require_chunk.__esmMin((() => {}));
//#endregion
//#region ../../node_modules/.bun/@aws-sdk+nested-clients@3.997.6/node_modules/@aws-sdk/nested-clients/dist-es/submodules/sts/defaultStsRoleAssumers.js
var import_dist_cjs, getAccountIdFromAssumedRoleUser, resolveRegion, getDefaultRoleAssumer$1, getDefaultRoleAssumerWithWebIdentity$1, isH2;
var init_defaultStsRoleAssumers = require_chunk.__esmMin((() => {
	require_client.init_client();
	import_dist_cjs = require_dist_cjs$30.require_dist_cjs();
	init_AssumeRoleCommand();
	init_AssumeRoleWithWebIdentityCommand();
	getAccountIdFromAssumedRoleUser = (assumedRoleUser) => {
		if (typeof assumedRoleUser?.Arn === "string") {
			const arnComponents = assumedRoleUser.Arn.split(":");
			if (arnComponents.length > 4 && arnComponents[4] !== "") return arnComponents[4];
		}
	};
	resolveRegion = async (_region, _parentRegion, credentialProviderLogger, loaderConfig = {}) => {
		const region = typeof _region === "function" ? await _region() : _region;
		const parentRegion = typeof _parentRegion === "function" ? await _parentRegion() : _parentRegion;
		let stsDefaultRegion = "";
		const resolvedRegion = region ?? parentRegion ?? (stsDefaultRegion = await (0, import_dist_cjs.stsRegionDefaultResolver)(loaderConfig)());
		credentialProviderLogger?.debug?.("@aws-sdk/client-sts::resolveRegion", "accepting first of:", `${region} (credential provider clientConfig)`, `${parentRegion} (contextual client)`, `${stsDefaultRegion} (STS default: AWS_REGION, profile region, or us-east-1)`);
		return resolvedRegion;
	};
	getDefaultRoleAssumer$1 = (stsOptions, STSClient) => {
		let stsClient;
		let closureSourceCreds;
		return async (sourceCreds, params) => {
			closureSourceCreds = sourceCreds;
			if (!stsClient) {
				const { logger = stsOptions?.parentClientConfig?.logger, profile = stsOptions?.parentClientConfig?.profile, region, requestHandler = stsOptions?.parentClientConfig?.requestHandler, credentialProviderLogger, userAgentAppId = stsOptions?.parentClientConfig?.userAgentAppId } = stsOptions;
				const resolvedRegion = await resolveRegion(region, stsOptions?.parentClientConfig?.region, credentialProviderLogger, {
					logger,
					profile
				});
				const isCompatibleRequestHandler = !isH2(requestHandler);
				stsClient = new STSClient({
					...stsOptions,
					userAgentAppId,
					profile,
					credentialDefaultProvider: () => async () => closureSourceCreds,
					region: resolvedRegion,
					requestHandler: isCompatibleRequestHandler ? requestHandler : void 0,
					logger
				});
			}
			const { Credentials, AssumedRoleUser } = await stsClient.send(new AssumeRoleCommand(params));
			if (!Credentials || !Credentials.AccessKeyId || !Credentials.SecretAccessKey) throw new Error(`Invalid response from STS.assumeRole call with role ${params.RoleArn}`);
			const accountId = getAccountIdFromAssumedRoleUser(AssumedRoleUser);
			const credentials = {
				accessKeyId: Credentials.AccessKeyId,
				secretAccessKey: Credentials.SecretAccessKey,
				sessionToken: Credentials.SessionToken,
				expiration: Credentials.Expiration,
				...Credentials.CredentialScope && { credentialScope: Credentials.CredentialScope },
				...accountId && { accountId }
			};
			require_client.setCredentialFeature(credentials, "CREDENTIALS_STS_ASSUME_ROLE", "i");
			return credentials;
		};
	};
	getDefaultRoleAssumerWithWebIdentity$1 = (stsOptions, STSClient) => {
		let stsClient;
		return async (params) => {
			if (!stsClient) {
				const { logger = stsOptions?.parentClientConfig?.logger, profile = stsOptions?.parentClientConfig?.profile, region, requestHandler = stsOptions?.parentClientConfig?.requestHandler, credentialProviderLogger, userAgentAppId = stsOptions?.parentClientConfig?.userAgentAppId } = stsOptions;
				const resolvedRegion = await resolveRegion(region, stsOptions?.parentClientConfig?.region, credentialProviderLogger, {
					logger,
					profile
				});
				const isCompatibleRequestHandler = !isH2(requestHandler);
				stsClient = new STSClient({
					...stsOptions,
					userAgentAppId,
					profile,
					region: resolvedRegion,
					requestHandler: isCompatibleRequestHandler ? requestHandler : void 0,
					logger
				});
			}
			const { Credentials, AssumedRoleUser } = await stsClient.send(new AssumeRoleWithWebIdentityCommand(params));
			if (!Credentials || !Credentials.AccessKeyId || !Credentials.SecretAccessKey) throw new Error(`Invalid response from STS.assumeRoleWithWebIdentity call with role ${params.RoleArn}`);
			const accountId = getAccountIdFromAssumedRoleUser(AssumedRoleUser);
			const credentials = {
				accessKeyId: Credentials.AccessKeyId,
				secretAccessKey: Credentials.SecretAccessKey,
				sessionToken: Credentials.SessionToken,
				expiration: Credentials.Expiration,
				...Credentials.CredentialScope && { credentialScope: Credentials.CredentialScope },
				...accountId && { accountId }
			};
			if (accountId) require_client.setCredentialFeature(credentials, "RESOLVED_ACCOUNT_ID", "T");
			require_client.setCredentialFeature(credentials, "CREDENTIALS_STS_ASSUME_ROLE_WEB_ID", "k");
			return credentials;
		};
	};
	isH2 = (requestHandler) => {
		return requestHandler?.metadata?.handlerProtocol === "h2";
	};
}));
//#endregion
//#region ../../node_modules/.bun/@aws-sdk+nested-clients@3.997.6/node_modules/@aws-sdk/nested-clients/dist-es/submodules/sts/defaultRoleAssumers.js
var getCustomizableStsClientCtor, getDefaultRoleAssumer, getDefaultRoleAssumerWithWebIdentity, decorateDefaultCredentialProvider;
var init_defaultRoleAssumers = require_chunk.__esmMin((() => {
	init_defaultStsRoleAssumers();
	init_STSClient();
	getCustomizableStsClientCtor = (baseCtor, customizations) => {
		if (!customizations) return baseCtor;
		else return class CustomizableSTSClient extends baseCtor {
			constructor(config) {
				super(config);
				for (const customization of customizations) this.middlewareStack.use(customization);
			}
		};
	};
	getDefaultRoleAssumer = (stsOptions = {}, stsPlugins) => getDefaultRoleAssumer$1(stsOptions, getCustomizableStsClientCtor(STSClient, stsPlugins));
	getDefaultRoleAssumerWithWebIdentity = (stsOptions = {}, stsPlugins) => getDefaultRoleAssumerWithWebIdentity$1(stsOptions, getCustomizableStsClientCtor(STSClient, stsPlugins));
	decorateDefaultCredentialProvider = (provider) => (input) => provider({
		roleAssumer: getDefaultRoleAssumer(input),
		roleAssumerWithWebIdentity: getDefaultRoleAssumerWithWebIdentity(input),
		...input
	});
}));
//#endregion
//#region ../../node_modules/.bun/@aws-sdk+nested-clients@3.997.6/node_modules/@aws-sdk/nested-clients/dist-es/submodules/sts/index.js
var sts_exports = /* @__PURE__ */ require_chunk.__exportAll({
	AssumeRole$: () => AssumeRole$,
	AssumeRoleCommand: () => AssumeRoleCommand,
	AssumeRoleRequest$: () => AssumeRoleRequest$,
	AssumeRoleResponse$: () => AssumeRoleResponse$,
	AssumeRoleWithWebIdentity$: () => AssumeRoleWithWebIdentity$,
	AssumeRoleWithWebIdentityCommand: () => AssumeRoleWithWebIdentityCommand,
	AssumeRoleWithWebIdentityRequest$: () => AssumeRoleWithWebIdentityRequest$,
	AssumeRoleWithWebIdentityResponse$: () => AssumeRoleWithWebIdentityResponse$,
	AssumedRoleUser$: () => AssumedRoleUser$,
	Credentials$: () => Credentials$,
	ExpiredTokenException: () => ExpiredTokenException,
	ExpiredTokenException$: () => ExpiredTokenException$,
	IDPCommunicationErrorException: () => IDPCommunicationErrorException,
	IDPCommunicationErrorException$: () => IDPCommunicationErrorException$,
	IDPRejectedClaimException: () => IDPRejectedClaimException,
	IDPRejectedClaimException$: () => IDPRejectedClaimException$,
	InvalidIdentityTokenException: () => InvalidIdentityTokenException,
	InvalidIdentityTokenException$: () => InvalidIdentityTokenException$,
	MalformedPolicyDocumentException: () => MalformedPolicyDocumentException,
	MalformedPolicyDocumentException$: () => MalformedPolicyDocumentException$,
	PackedPolicyTooLargeException: () => PackedPolicyTooLargeException,
	PackedPolicyTooLargeException$: () => PackedPolicyTooLargeException$,
	PolicyDescriptorType$: () => PolicyDescriptorType$,
	ProvidedContext$: () => ProvidedContext$,
	RegionDisabledException: () => RegionDisabledException,
	RegionDisabledException$: () => RegionDisabledException$,
	STS: () => STS,
	STSClient: () => STSClient,
	STSServiceException: () => STSServiceException,
	STSServiceException$: () => STSServiceException$,
	Tag$: () => Tag$,
	__Client: () => import_dist_cjs$14.Client,
	decorateDefaultCredentialProvider: () => decorateDefaultCredentialProvider,
	errorTypeRegistries: () => errorTypeRegistries,
	getDefaultRoleAssumer: () => getDefaultRoleAssumer,
	getDefaultRoleAssumerWithWebIdentity: () => getDefaultRoleAssumerWithWebIdentity
});
var init_sts = require_chunk.__esmMin((() => {
	init_STSClient();
	init_STS();
	init_commands();
	init_schemas_0();
	init_errors();
	init_models_0();
	init_defaultRoleAssumers();
	init_STSServiceException();
}));
//#endregion
Object.defineProperty(exports, "AssumeRole$", {
	enumerable: true,
	get: function() {
		return AssumeRole$;
	}
});
Object.defineProperty(exports, "AssumeRoleCommand", {
	enumerable: true,
	get: function() {
		return AssumeRoleCommand;
	}
});
Object.defineProperty(exports, "AssumeRoleRequest$", {
	enumerable: true,
	get: function() {
		return AssumeRoleRequest$;
	}
});
Object.defineProperty(exports, "AssumeRoleResponse$", {
	enumerable: true,
	get: function() {
		return AssumeRoleResponse$;
	}
});
Object.defineProperty(exports, "AssumeRoleWithWebIdentity$", {
	enumerable: true,
	get: function() {
		return AssumeRoleWithWebIdentity$;
	}
});
Object.defineProperty(exports, "AssumeRoleWithWebIdentityCommand", {
	enumerable: true,
	get: function() {
		return AssumeRoleWithWebIdentityCommand;
	}
});
Object.defineProperty(exports, "AssumeRoleWithWebIdentityRequest$", {
	enumerable: true,
	get: function() {
		return AssumeRoleWithWebIdentityRequest$;
	}
});
Object.defineProperty(exports, "AssumeRoleWithWebIdentityResponse$", {
	enumerable: true,
	get: function() {
		return AssumeRoleWithWebIdentityResponse$;
	}
});
Object.defineProperty(exports, "AssumedRoleUser$", {
	enumerable: true,
	get: function() {
		return AssumedRoleUser$;
	}
});
Object.defineProperty(exports, "Credentials$", {
	enumerable: true,
	get: function() {
		return Credentials$;
	}
});
Object.defineProperty(exports, "ExpiredTokenException", {
	enumerable: true,
	get: function() {
		return ExpiredTokenException;
	}
});
Object.defineProperty(exports, "ExpiredTokenException$", {
	enumerable: true,
	get: function() {
		return ExpiredTokenException$;
	}
});
Object.defineProperty(exports, "IDPCommunicationErrorException", {
	enumerable: true,
	get: function() {
		return IDPCommunicationErrorException;
	}
});
Object.defineProperty(exports, "IDPCommunicationErrorException$", {
	enumerable: true,
	get: function() {
		return IDPCommunicationErrorException$;
	}
});
Object.defineProperty(exports, "IDPRejectedClaimException", {
	enumerable: true,
	get: function() {
		return IDPRejectedClaimException;
	}
});
Object.defineProperty(exports, "IDPRejectedClaimException$", {
	enumerable: true,
	get: function() {
		return IDPRejectedClaimException$;
	}
});
Object.defineProperty(exports, "InvalidIdentityTokenException", {
	enumerable: true,
	get: function() {
		return InvalidIdentityTokenException;
	}
});
Object.defineProperty(exports, "InvalidIdentityTokenException$", {
	enumerable: true,
	get: function() {
		return InvalidIdentityTokenException$;
	}
});
Object.defineProperty(exports, "MalformedPolicyDocumentException", {
	enumerable: true,
	get: function() {
		return MalformedPolicyDocumentException;
	}
});
Object.defineProperty(exports, "MalformedPolicyDocumentException$", {
	enumerable: true,
	get: function() {
		return MalformedPolicyDocumentException$;
	}
});
Object.defineProperty(exports, "PackedPolicyTooLargeException", {
	enumerable: true,
	get: function() {
		return PackedPolicyTooLargeException;
	}
});
Object.defineProperty(exports, "PackedPolicyTooLargeException$", {
	enumerable: true,
	get: function() {
		return PackedPolicyTooLargeException$;
	}
});
Object.defineProperty(exports, "PolicyDescriptorType$", {
	enumerable: true,
	get: function() {
		return PolicyDescriptorType$;
	}
});
Object.defineProperty(exports, "ProvidedContext$", {
	enumerable: true,
	get: function() {
		return ProvidedContext$;
	}
});
Object.defineProperty(exports, "RegionDisabledException", {
	enumerable: true,
	get: function() {
		return RegionDisabledException;
	}
});
Object.defineProperty(exports, "RegionDisabledException$", {
	enumerable: true,
	get: function() {
		return RegionDisabledException$;
	}
});
Object.defineProperty(exports, "STS", {
	enumerable: true,
	get: function() {
		return STS;
	}
});
Object.defineProperty(exports, "STSClient", {
	enumerable: true,
	get: function() {
		return STSClient;
	}
});
Object.defineProperty(exports, "STSServiceException", {
	enumerable: true,
	get: function() {
		return STSServiceException;
	}
});
Object.defineProperty(exports, "STSServiceException$", {
	enumerable: true,
	get: function() {
		return STSServiceException$;
	}
});
Object.defineProperty(exports, "Tag$", {
	enumerable: true,
	get: function() {
		return Tag$;
	}
});
Object.defineProperty(exports, "decorateDefaultCredentialProvider", {
	enumerable: true,
	get: function() {
		return decorateDefaultCredentialProvider;
	}
});
Object.defineProperty(exports, "errorTypeRegistries", {
	enumerable: true,
	get: function() {
		return errorTypeRegistries;
	}
});
Object.defineProperty(exports, "getDefaultRoleAssumer", {
	enumerable: true,
	get: function() {
		return getDefaultRoleAssumer;
	}
});
Object.defineProperty(exports, "getDefaultRoleAssumerWithWebIdentity", {
	enumerable: true,
	get: function() {
		return getDefaultRoleAssumerWithWebIdentity;
	}
});
Object.defineProperty(exports, "import_dist_cjs", {
	enumerable: true,
	get: function() {
		return import_dist_cjs$5;
	}
});
Object.defineProperty(exports, "import_dist_cjs$1", {
	enumerable: true,
	get: function() {
		return import_dist_cjs$14;
	}
});
Object.defineProperty(exports, "init_sts", {
	enumerable: true,
	get: function() {
		return init_sts;
	}
});
Object.defineProperty(exports, "sts_exports", {
	enumerable: true,
	get: function() {
		return sts_exports;
	}
});
