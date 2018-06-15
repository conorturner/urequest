const { expect } = require("chai");
const Stream = require("stream");
const { Neutron } = require("../");

describe("Neutron", () => {

	describe("compress and decompress", () => {
		const runCompressDecompressTest = (encoding, inputString) => {
			describe(encoding, () => {

				it("stream", (done) => {

					const stream = new Stream.PassThrough();
					stream.end(Buffer.from(inputString));

					const compressedStream = Neutron.compress(stream, encoding);
					const decompressedStream = Neutron.decompress(compressedStream, encoding);

					Neutron.flattenStream(decompressedStream)
						.then(output => {
							expect(output).to.equal(inputString);
							done();
						})
						.catch(done);

				});

				it("string", (done) => {

					const compressedStream = Neutron.compress(inputString, encoding);
					const decompressedStream = Neutron.decompress(compressedStream, encoding);

					Neutron.flattenStream(decompressedStream)
						.then(output => {
							expect(output).to.equal(inputString);
							done();
						})
						.catch(done);

				});

				it("buffer", (done) => {

					const buffer = Buffer.from(inputString);

					const compressedStream = Neutron.compress(buffer, encoding);
					const decompressedStream = Neutron.decompress(compressedStream, encoding);

					Neutron.flattenStream(decompressedStream)
						.then(output => {
							expect(output).to.equal(inputString);
							done();
						})
						.catch(done);

				});

			});
		};
		const inputString = JSON.stringify(require("./assets/json/comments"));

		runCompressDecompressTest("gzip", inputString);
		runCompressDecompressTest("inflate", inputString);
	});

});