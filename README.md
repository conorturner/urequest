# urequest

[![npm](https://img.shields.io/npm/dt/urequest.svg?style=for-the-badge)](https://www.npmjs.com/package/urequest)
[![Travis](https://img.shields.io/travis/conorturner/urequest.svg?style=for-the-badge)](https://travis-ci.org/conorturner/urequest)
[![Coveralls github](https://img.shields.io/coveralls/github/conorturner/urequest.svg?style=for-the-badge)](https://coveralls.io/github/conorturner/urest)
![license](https://img.shields.io/github/license/conorturner/urequest.svg?style=for-the-badge)

## Install

```bash
$ npm install urequest
```



## Basic Usage

```javascript
const { URequest } = require("urequest");
const u = new URequest();

u.request("https://www.google.com")
   .then(result => {
      console.log(result);
   })
   .catch(error => {
      console.error(error.statusCode);
      console.error(error.body);
   });
```


## Options

| Property |              Description              | Example                  | Default |
| -------- | :-----------------------------------: | ------------------------ | ------- |
| method   |              HTTP Method              | POST                     | GET     |
| port     |      Destination port on Server       | 8080                     | 80      |
| headers  |             HTTP Headers              | {"a-header": "value"}    | {}      |
| qs       |        Query string parameters        | ?a=b&b=1,2,3             | {}      |
| uri      |             Standard URI              | https://www.a.com:8080   |         |
| body     |               HTTP Body               | Buffer, string or object |         |
| path     | Path will be appended to the uri path | /path/to/data            |         |



## Examples

#### Catch Errors

```javascript
const options = { uri: "http://localhost:8123/error", json: true };

u.request(options)
   .then(done)
   .catch(({ body, statusCode }) => {
      expect(statusCode).to.be.a("number");
      expect(body).to.be.an("object");
   })
```

#### Post JSON

```javascript
const body = {
   message: "hi"
};

const options = {
   method: "POST",
   uri: "http://my-api/echo",
   body,
   json: true
};

u.request(options)
   .then(result => ...
```

#### Overwriting URI Components

```javascript
const options = {
   uri: "http://my-api:8080/echo",
   port: 80,
   path: "/echo",
   qs: {
      utms: "abc123",
      arr: [1,2,3]
   }
   json: true
};

// Will resolve http://my-api:80/echo/echo?utms=abc123&arr=1,2,3
```



## Neutron

Neutron is a compression wrapper library built around node zlib and streams API's. It provides a set of simple interface methods supporting both gzip and deflate.

#### Compress and Decompress

```js
const { Neutron } = require("urequest");
const inputString = "compress me!"
const buffer = Buffer.from(inputString);
const encoding = "gzip";

const compressedStream = Neutron.compress(buffer, encoding);
const decompressedStream = Neutron.decompress(compressedStream, encoding);

Neutron.flattenStream(decompressedStream)
   .then(output => {
      expect(output.toString()).to.equal(inputString);
      done();
   })
```

#### URest Middleware and Interceptors

```javascript
// server

const { Rest, JsonBodyParser } = require("urest");
const { Neutron } = require("urequest");
const app = new Rest();

app.pre(Neutron.middleware());
app.pre(JsonBodyParser.middleware());
app.post("/echo", (req, res) => res.send(req.body));
app.native().listen(1234);


// client

const { URequest } = require("urequest");
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
```

