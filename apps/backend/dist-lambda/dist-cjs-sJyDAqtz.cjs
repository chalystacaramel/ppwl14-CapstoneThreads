const require_chunk = require("./chunk-9hOWP6kD.cjs");
const require_dist_cjs$3 = require("./dist-cjs-B4Zh07ae.cjs");
const require_dist_cjs$4 = require("./dist-cjs-EhnLoTSm.cjs");
//#region ../../node_modules/.bun/@smithy+node-config-provider@4.3.14/node_modules/@smithy/node-config-provider/dist-cjs/index.js
var require_dist_cjs = /* @__PURE__ */ require_chunk.__commonJSMin(((exports) => {
	var propertyProvider = require_dist_cjs$3.require_dist_cjs();
	var sharedIniFileLoader = require_dist_cjs$4.require_dist_cjs();
	function getSelectorName(functionString) {
		try {
			const constants = new Set(Array.from(functionString.match(/([A-Z_]){3,}/g) ?? []));
			constants.delete("CONFIG");
			constants.delete("CONFIG_PREFIX_SEPARATOR");
			constants.delete("ENV");
			return [...constants].join(", ");
		} catch (e) {
			return functionString;
		}
	}
	const fromEnv = (envVarSelector, options) => async () => {
		try {
			const config = envVarSelector(process.env, options);
			if (config === void 0) throw new Error();
			return config;
		} catch (e) {
			throw new propertyProvider.CredentialsProviderError(e.message || `Not found in ENV: ${getSelectorName(envVarSelector.toString())}`, { logger: options?.logger });
		}
	};
	const fromSharedConfigFiles = (configSelector, { preferredFile = "config", ...init } = {}) => async () => {
		const profile = sharedIniFileLoader.getProfileName(init);
		const { configFile, credentialsFile } = await sharedIniFileLoader.loadSharedConfigFiles(init);
		const profileFromCredentials = credentialsFile[profile] || {};
		const profileFromConfig = configFile[profile] || {};
		const mergedProfile = preferredFile === "config" ? {
			...profileFromCredentials,
			...profileFromConfig
		} : {
			...profileFromConfig,
			...profileFromCredentials
		};
		try {
			const configValue = configSelector(mergedProfile, preferredFile === "config" ? configFile : credentialsFile);
			if (configValue === void 0) throw new Error();
			return configValue;
		} catch (e) {
			throw new propertyProvider.CredentialsProviderError(e.message || `Not found in config files w/ profile [${profile}]: ${getSelectorName(configSelector.toString())}`, { logger: init.logger });
		}
	};
	const isFunction = (func) => typeof func === "function";
	const fromStatic = (defaultValue) => isFunction(defaultValue) ? async () => await defaultValue() : propertyProvider.fromStatic(defaultValue);
	const loadConfig = ({ environmentVariableSelector, configFileSelector, default: defaultValue }, configuration = {}) => {
		const { signingName, logger } = configuration;
		const envOptions = {
			signingName,
			logger
		};
		return propertyProvider.memoize(propertyProvider.chain(fromEnv(environmentVariableSelector, envOptions), fromSharedConfigFiles(configFileSelector, configuration), fromStatic(defaultValue)));
	};
	exports.loadConfig = loadConfig;
}));
//#endregion
Object.defineProperty(exports, "require_dist_cjs", {
	enumerable: true,
	get: function() {
		return require_dist_cjs;
	}
});
