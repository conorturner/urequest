const TestServer = require("./assets/TestServer");
const { expect } = require("chai");
const { URequest } = require("../");

describe("URequest", () => {

	let httpServer;
	before(done => httpServer = TestServer.native().listen(8123, done));
	after(done => httpServer.close(done));

	it("constructor", (done) => {
		const u = new URequest();
		if (u) done();
		else done(new Error("Failed to instantiate"));
	});

	it("basic get", (done) => {
		const u = new URequest();
		const options = { uri: "http://localhost:8123" };

		u.request(options)
			.then(result => {
				expect(result).to.equal(undefined);
				done();
			})
			.catch(done);

	});

	it("basic get string only", (done) => {
		const u = new URequest();

		u.request("http://localhost:8123")
			.then(result => {
				expect(result).to.equal(undefined);
				done();
			})
			.catch(done);

	});

	it("get error", (done) => {
		const u = new URequest();
		const options = { uri: "http://localhost:8123/error", json: true };

		u.request(options)
			.then(done)
			.catch(({ body, statusCode }) => {
				expect(statusCode).to.equal(500);
				expect(body.code).to.equal("InternalServer");
				expect(body.eid).to.be.a("string");
				done();
			})
			.catch(done);

	});

	it("get error status only", (done) => {
		const u = new URequest();
		const options = { uri: "http://localhost:8123/error-status", json: true };

		u.request(options)
			.then(done)
			.catch(({ body, statusCode }) => {
				expect(statusCode).to.equal(500);
				done();
			})
			.catch(done);

	});

	it("get json", (done) => {
		const u = new URequest();
		const options = { uri: "http://localhost:8123/posts", json: true, qs: { page: 0 } };

		u.request(options)
			.then(result => {
				expect(result).to.deep.equal([
					{
						userId: 1,
						id: 1,
						title: "sunt aut facere repellat provident occaecati excepturi optio reprehenderit",
						body: "quia et suscipit\nsuscipit recusandae consequuntur expedita et cum\nreprehenderit molestiae ut ut quas totam\nnostrum rerum est autem sunt rem eveniet architecto"
					},
					{
						userId: 1,
						id: 2,
						title: "qui est esse",
						body: "est rerum tempore vitae\nsequi sint nihil reprehenderit dolor beatae ea dolores neque\nfugiat blanditiis voluptate porro vel nihil molestiae ut reiciendis\nqui aperiam non debitis possimus qui neque nisi nulla"
					},
					{
						userId: 1,
						id: 3,
						title: "ea molestias quasi exercitationem repellat qui ipsa sit aut",
						body: "et iusto sed quo iure\nvoluptatem occaecati omnis eligendi aut ad\nvoluptatem doloribus vel accusantium quis pariatur\nmolestiae porro eius odio et labore et velit aut"
					},
					{
						userId: 1,
						id: 4,
						title: "eum et est occaecati",
						body: "ullam et saepe reiciendis voluptatem adipisci\nsit amet autem assumenda provident rerum culpa\nquis hic commodi nesciunt rem tenetur doloremque ipsam iure\nquis sunt voluptatem rerum illo velit"
					},
					{
						userId: 1,
						id: 5,
						title: "nesciunt quas odio",
						body: "repudiandae veniam quaerat sunt sed\nalias aut fugiat sit autem sed est\nvoluptatem omnis possimus esse voluptatibus quis\nest aut tenetur dolor neque"
					},
					{
						userId: 1,
						id: 6,
						title: "dolorem eum magni eos aperiam quia",
						body: "ut aspernatur corporis harum nihil quis provident sequi\nmollitia nobis aliquid molestiae\nperspiciatis et ea nemo ab reprehenderit accusantium quas\nvoluptate dolores velit et doloremque molestiae"
					},
					{
						userId: 1,
						id: 7,
						title: "magnam facilis autem",
						body: "dolore placeat quibusdam ea quo vitae\nmagni quis enim qui quis quo nemo aut saepe\nquidem repellat excepturi ut quia\nsunt ut sequi eos ea sed quas"
					},
					{
						userId: 1,
						id: 8,
						title: "dolorem dolore est ipsam",
						body: "dignissimos aperiam dolorem qui eum\nfacilis quibusdam animi sint suscipit qui sint possimus cum\nquaerat magni maiores excepturi\nipsam ut commodi dolor voluptatum modi aut vitae"
					},
					{
						userId: 1,
						id: 9,
						title: "nesciunt iure omnis dolorem tempora et accusantium",
						body: "consectetur animi nesciunt iure dolore\nenim quia ad\nveniam autem ut quam aut nobis\net est aut quod aut provident voluptas autem voluptas"
					},
					{
						userId: 1,
						id: 10,
						title: "optio molestias id quia eum",
						body: "quo et expedita modi cum officia vel magni\ndoloribus qui repudiandae\nvero nisi sit\nquos veniam quod sed accusamus veritatis error"
					}
				]);
				done();
			})
			.catch(done);

	});

	it("get json https", (done) => {
		const u = new URequest();
		const options = { uri: "https://jsonplaceholder.typicode.com/posts", json: true };

		u.request(options)
			.then(result => {
				expect(result).to.be.an("array");
				done();
			})
			.catch(done);

	});

	it("post json", (done) => {
		const u = new URequest();

		const body = {
			message: "hi"
		};

		const options = {
			method: "POST",
			uri: "http://localhost:8123/echo",
			body,
			json: true
		};

		u.request(options)
			.then(result => {
				expect(result).to.deep.equal(body);
				done();
			})
			.catch(done);

	});

});