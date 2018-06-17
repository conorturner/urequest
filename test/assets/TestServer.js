const { Rest, UErrors, JsonBodyParser } = require("urest");
const { UInternalServerError } = UErrors;
const pageArray = (arr, page, pageSize = 10) => arr.slice(page * pageSize, (page + 1) * pageSize);

const app = new Rest();
app.pre(JsonBodyParser.middleware());

app.get("/", (req, res) => res.send(200));
app.get("/posts", (req, res) => res.send(pageArray(require("./json/posts"), req.query.page)));
app.get("/comments", (req, res) => res.send(pageArray(require("./json/comments"), req.query.page)));

app.get("/error", (req, res, next) => next(new UInternalServerError(":(")));
app.get("/error-status", (req, res, next) => res.send(500));
app.post("/echo", (req, res) => res.send(req.body));

module.exports = app;