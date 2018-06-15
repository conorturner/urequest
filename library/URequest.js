const http = require("http");
const { URL, URLSearchParams } = require("url");

const execute = Symbol();
const parseOptions = Symbol();

class URequest {

	constructor({ cacheStrategy } = {}) {
		this.cacheStrategy = cacheStrategy;
	}

	request(options) {
		return this[execute](options);
	}

	[execute](options) {
		const { json, httpOptions, body } = this[parseOptions](options);

		return new Promise((resolve, reject) => {
			const req = http.request(httpOptions, res => {
				// const { headers, statusCode } = res;

				let buffer = Buffer.from([]);
				res.on("data", (chunk) => buffer = Buffer.concat([buffer, Buffer.from(chunk)]));
				res.on("end", () => resolve(json ? JSON.parse(buffer.toString()) : buffer.toString()));
			});

			req.on("error", reject);

			if (body) req.end(body);
			else req.end();
		});
	}

	[parseOptions](options) {
		const { uri, port, path, method = "GET", headers, body, json, qs } = options;
		const url = new URL(uri);
		if (qs) url.search = new URLSearchParams(qs);

		const httpOptions = {
			protocol: url.protocol,
			host: url.host,
			origin: url.origin,
			hostname: url.hostname,
			method,
			port: port || url.port,
			path: url.pathname + url.search || path + url.search,
			headers
		};

		let postData;
		if (body) {
			postData = Buffer.from(JSON.stringify(body));
			Object.assign(httpOptions.headers || {}, {
				"Content-Type": "application/json",
				"Content-Length": Buffer.byteLength(postData)
			});
		}

		return { httpOptions, json, body: postData };
	}
}

module.exports = URequest;