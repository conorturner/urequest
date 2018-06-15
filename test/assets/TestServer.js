const { Rest, UErrors, JsonBodyParser } = require("urest");
const { UInternalServerError } = UErrors;
const pageArray = (arr, page, pageSize = 10) => arr.slice(page * pageSize, (page + 1) * pageSize);

const app = new Rest();
app.pre(JsonBodyParser.middleware());

app.get("/posts", (req, res) => {
	const { query: { page } } = req;
	const posts = require("./json/posts");
	res.send(pageArray(posts, page));
});
app.get("/comments", (req, res) => {
	const { query: { page } } = req;
	const posts = require("./json/comments");
	res.send(pageArray(posts, page));
});

app.get("/error", (req, res, next) => next(new UInternalServerError(":(")));
app.post("/echo", (req, res) => res.send(req.body));

module.exports = app;