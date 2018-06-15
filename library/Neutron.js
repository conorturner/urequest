const zlib = require("zlib");
const Stream = require("stream");

const parseInput = Symbol();

class Neutron {

	static [parseInput](data){
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

	static compress(data, acceptEncoding) {
		const stream = this[parseInput](data);

		if (acceptEncoding.match(/\bdeflate\b/)) return stream.pipe(zlib.createDeflate());
		else if (acceptEncoding.match(/\bgzip\b/)) return stream.pipe(zlib.createGzip());
		else return stream;
	}

	static decompress(stream, contentEncoding) {
		if (contentEncoding === "gzip" || contentEncoding === "deflate") return stream.pipe(zlib.createUnzip());
		return stream;
	}
}

module.exports = Neutron;