# urequest

[![npm](https://img.shields.io/npm/dt/urequest.svg?style=for-the-badge)](https://www.npmjs.com/package/urequest)
[![Travis](https://img.shields.io/travis/conorturner/urequest.svg?style=for-the-badge)](https://travis-ci.org/conorturner/urequest)

## Install

```bash
$ npm install urequest
```

## Basic Usage

```javascript
const { URequest } = require("urequest");
const u = new URequest();
u.request(options)
	.then(result => {
		console.log(result);
	})
	.catch(error => {
		console.error(error.statusCode);
		console.error(error.body);
	});
```