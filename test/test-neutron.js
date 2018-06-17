const { expect } = require("chai");
const Stream = require("stream");
const { Rest, JsonBodyParser } = require("urest");
const { URequest } = require("../");

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
		runCompressDecompressTest("deflate", inputString);
	});

	it("middleware", (done) => {

		const app = new Rest();
		app.pre(Neutron.middleware());
		app.pre(JsonBodyParser.middleware());
		app.post("/echo", (req, res) => res.send(req.body));
		const server = app.native().listen(1234);

		const u = new URequest();

		const body = {
			message: "hi"
		};

		const options = {
			method: "POST",
			uri: "http://localhost:1234/echo",
			body,
			json: true,
			gzip: true
		};

		u.request(options)
			.then(result => {
				expect(result).to.deep.equal(body);
			})
			.catch(console.error)
			.then(() => {
				server.close();
				done();
			});

	});

});