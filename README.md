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

## Classify
You will need your model `publicId` to start classifying with your model. You can get your model `publicId` from you model page, or you can get it from here :
```typescript
const models = Klasifikasi.getModels()
console.log(models)
/*
the output should be like this
  {
    [publicId: string]: {
      name: string,
      credential: {
        clientId: string,
        clientSecret: string,
        token: string,
        expiredAt: number
      },
      tags: {
        name: string,
        description: string | null,
        descriptionWeight: string | null
      }[]
    }
  }
*/
```
classifying example
```typescript
const result = await Klasifikasi.classify('publicId', 'query')
console.log(result)
/*
the output should be like this
  {
    result: {
      label: string,
      score: number
    }[]
  }
*/
```

## Logs
You can get your classifying logs based on your model `publicId`
```typescript
const logs = Klasifikasi.logs("publicId", {
  startedAt: new Date("1 December 2020"),
  endedAt: new Date("2 December 2020"),
  take: 100,
  skip: 0
})
console.log(logs)
/*
the output should be like this
 {
   histories: {
     createdAt: Date,
     updatedAt: Date,
     deletedAt: Date,
     id: number,
     model: string,
     modelResult: {
       label: string,
       score: number
     }[]
     modelCurrentName: string,
     ipInfo: {
       ip: string
     },
     userId: number,
     aiModelId: number,
   }[],
   length: number
 }
*/
```

`endedAt` & `startedAt` parameter is mandatory, the rest is optional.

## Error

All the function above will throw an error if something bad happen. The error
object will have the same structure.

```typescript
{
  status?: number // http status codes,
  body: {
    error: string
  }
}
```
