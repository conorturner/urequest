const http = require("http");
const https = require("https");
const { URL, URLSearchParams } = require("url");
const Neutron = require("./Neutron");

const execute = Symbol();
const parseOptions = Symbol();
const parseRequestBody = Symbol();
const parseResponse = Symbol();
const parseGzip = Symbol();
const getHttpClient = Symbol();
const getContentHeaders = Symbol();

class URequest {

	constructor({ cacheStrategy } = {}) {
		this.cacheStrategy = cacheStrategy;
	}

	request(options) {
		return this[execute](options);
	}

	[getHttpClient](protocol) {
		return protocol === "http:" ? http : https;
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
		const { uri, port, path, method = "GET", headers = {}, body, qs } = options;
		const url = new URL(uri);
		if (qs) url.search = new URLSearchParams(qs);

		const httpOptions = {
			protocol: url.protocol,
			host: url.host,
			origin: url.origin,
			hostname: url.hostname,
			method: method.toUpperCase(),
			port: port || url.port,
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
				const isError = statusCode > 399;
				const hasBody = string.length > 0;
				const callback = isError ? reject : resolve;

				const body = hasBody ? (json ? JSON.parse(string) : string) : undefined;

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