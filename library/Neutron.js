const zlib = require("zlib");
const Stream = require("stream");

class Neutron {

	static toStream(data) {
		let stream;
		if (typeof data === "string") {
			stream = new Stream.PassThrough();
			stream.end(Buffer.from(data));
		}
		else if (Buffer.isBuffer(data)) {
			stream = new Stream.PassThrough();
			stream.end(data);
		}
		else if (data && data.pipe) stream = data;
		else throw new Error("data must be string, stream or buffer");

		return stream;
	}

	static compress(data, encoding) {
		const stream = Neutron.toStream(data);

		if (encoding.match(/\bdeflate\b/)) return stream.pipe(zlib.createDeflate());
		else if (encoding.match(/\bgzip\b/)) return stream.pipe(zlib.createGzip());
		else return stream;
	}

	static decompress(data, encoding) {
		const stream = Neutron.toStream(data);

		if (encoding === "gzip" || encoding === "deflate") return stream.pipe(zlib.createUnzip());
		return stream;
	}

	static flattenStream(stream) {
		return new Promise((resolve, reject) => {
			try {
				let buffer = Buffer.from([]);
				stream.on("data", (chunk) => buffer = Buffer.concat([buffer, chunk]));
				stream.on("error", reject);
				stream.on("end", () => resolve(buffer.toString()));
			}
			catch (e) {
				reject(e);
			}
		});
	}

	static middleware({} = {}) {
		return (req, res, next) => {
			const { headers } = req;

			if (headers["content-encoding"] === "gzip") {
				const stream = Neutron.decompress(req, "gzip");

				Neutron.flattenStream(stream)
					.then(string => {
						req.body = string;
						next();
					})
					.catch(err => next(err));
			}
			else next();
		};
	}
}

module.exports = Neutron;