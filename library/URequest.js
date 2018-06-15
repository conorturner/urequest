const http = require("http");
const https = require("https");
const { URL, URLSearchParams } = require("url");

const execute = Symbol();
const parseOptions = Symbol();
const parseRequestBody = Symbol();
const parseResponse = Symbol();
const getHttpClient = Symbol();

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
		const { httpOptions, parsedBody } = this[parseOptions](options);

		return new Promise((resolve, reject) =>
			(this[getHttpClient](httpOptions.protocol)).request(httpOptions, resolve).on("error", reject).end(parsedBody))
			.then(res => this[parseResponse]({ res, options }));
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

		const { parsedBody, contentHeaders } = this[parseRequestBody](body);
		Object.assign(httpOptions.headers, contentHeaders);

		return { httpOptions, parsedBody };
	}

	[parseRequestBody](body) {
		let parsedBody, contentHeaders = {};
		if (body) {
			parsedBody = Buffer.from(JSON.stringify(body));
			contentHeaders = {
				"Content-Type": "application/json",
				"Content-Length": Buffer.byteLength(parsedBody)
			};
		}

		return { parsedBody, contentHeaders };
	}

	[parseResponse]({ res, options }) {
		const { json } = options;
		// const { headers, statusCode } = res;

		let buffer = Buffer.from([]);
		res.on("data", (chunk) => buffer = Buffer.concat([buffer, Buffer.from(chunk)]));

		return new Promise(resolve =>
			res.on("end", () => {
				const string = buffer.toString();
				if (string.length === 0) resolve();
				else resolve(json ? JSON.parse(string) : string);
			}));
	}

}

module.exports = URequest;