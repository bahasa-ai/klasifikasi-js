# Klasifikasi for Node.js

Official [Klasifikasi](https://klasifikasi.com/) API Client Library

## Installation

`npm install klasifikasi-js`

## Quick start

You will need valid `clientId` & `clientSecret` of your model. You can get those
from credential section at your model page, which is both unique per model.

```typescript
import Klasifikasi from "klasifikasi-js";

await Klasifikasi.build({
  creds: [
    {
      clientId: "client-id",
      clientSecret: "client-secret",
    },
  ],
});
```

You can pass multiple `clientId` & `clientSecret` too

```typescript
import Klasifikasi from "klasifikasi-js";

await Klasifikasi.build({
  creds: [
    {
      clientId: "client-id-1",
      clientSecret: "client-secret-1",
    },
    {
      clientId: "client-id-2",
      clientSecret: "client-secret-2",
    },
  ],
});
```

It will throw an error if the authentication process is failed.

## Classify

You will need your model `publicId` to start classify with you model. You can
get your model `publicId` from you model page, or you can get it from
`Klasifikasi.getModels()`

```typescript
const result = await Klasifikasi.classify("publicId", "query");
console.log(result);
```

It will throw an error if something bad happen

## Logs

You can get your classify logs based on your model `publicId`

```typescript
const logs = Klasifikasi.logs("publicId", {
  startedAt: new Date("1 December 2020"),
  endedAt: new Date("2 December 2020"),
  take: 100,
  skip: 0,
});
console.log(logs);
```

`endedAt` & `startedAt` parameter is mandatory, the rest is optional. It will
throw an error too if something bad happen.
