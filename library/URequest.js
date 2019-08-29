const http = require("http");
const https = require("https");
const { URL, URLSearchParams } = require("url");
const Neutron = require("./Neutron");

const execute = Symbol("execute");
const parseOptions = Symbol("parseOptions");
const parseRequestBody = Symbol("parseRequestBody");
const parseResponse = Symbol("parseResponse");
const parseGzip = Symbol("parseGzip");
const getHttpClient = Symbol("getHttpClient");
const getContentHeaders = Symbol("getContentHeaders");
const getDefaultPort = Symbol("getContentHeaders");

class URequest {

	constructor({ cacheStrategy } = {}) {
		this.cacheStrategy = cacheStrategy;
	}

	request(options) {
		if (typeof options === "string") options = { uri: options };
		return this[execute](options);
	}

	[getHttpClient](protocol) {
		return protocol === "http:" ? http : https;
	}

	[getDefaultPort](protocol){
		return protocol === "http:" ? 80 : 443;
	}

	[execute](options) {
		const { httpOptions, stream } = this[parseOptions](options);

		const promise = new Promise((resolve, reject) => {
			const request = this[getHttpClient](httpOptions.protocol).request(httpOptions, resolve);
			request.on("error", reject);
			if (stream) stream.pipe(request);
			else request.end();
		});

		return promise.then(res => this[parseResponse]({ res, options }));
	}

	[parseOptions](options) {
		const { uri = "http://localhost", port, path, method = "GET", headers = {}, body, qs } = options;
		const url = new URL(uri);
		if (qs) url.search = new URLSearchParams(qs);

		const httpOptions = {
			protocol: url.protocol,
			host: url.host,
			origin: url.origin,
			hostname: url.hostname,
			method: method.toUpperCase(),
			port: port || url.port || (this[getDefaultPort](url.protocol)),
			path: url.pathname + url.search || path + url.search,
			headers
		};

		const stream = this[parseRequestBody](body, options);
		const contentHeaders = this[getContentHeaders](options);
		Object.assign(httpOptions.headers, contentHeaders);

		return { httpOptions, stream };
	}

	[getContentHeaders](options) {
		const { json, gzip } = options;

		let contentHeaders = {};
		if (json) contentHeaders = Object.assign(contentHeaders, { "Content-Type": "application/json" });
		if (gzip) contentHeaders = Object.assign(contentHeaders, {
			"Content-Encoding": "gzip",
			"Accept-Encoding": "gzip"
		});

		return contentHeaders;
	}

	[parseRequestBody](body, options) {
		if (!body) return;
		if (body.pipe) return body;

		const { json, gzip } = options;

		let stream;
		if (typeof body === "string") stream = Neutron.toStream(body);
		if (json) stream = Neutron.toStream(JSON.stringify(body));
		if (gzip) stream = Neutron.compress(stream, "gzip");

		return stream;
	}

	[parseResponse]({ res, options }) {
		const { json, resolveFull } = options;
		const { headers, statusCode } = res;

		let buffer = Buffer.from([]);
		// const stream = res;
		const stream = this[parseGzip](res);
		stream.on("data", (chunk) => buffer = Buffer.concat([buffer, chunk]));

		return new Promise((resolve, reject) =>
			stream.on("end", () => {
				const string = buffer.toString();
				const hasBody = string.length > 0;
				let isError = statusCode > 399;

				let body;
				try {
					body = hasBody ? (json ? JSON.parse(string) : string) : undefined;
				} catch (error) {
					isError = true;
				}

				const callback = isError ? reject : resolve;
				if (isError || resolveFull) callback({ headers, statusCode, body });
				else callback(body);
			}));
	}

	[parseGzip](res) {
		if (res.headers["content-encoding"] === "gzip") return Neutron.decompress(res, "gzip");
		else return res;
	}

}

module.exports = URequest;
