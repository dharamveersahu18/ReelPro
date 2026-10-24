import { routeModule } from "next/dist/build/templates/pages"
import { config } from "process"

// app => Pages / layout / Css /Api routeModule
// Lib/ utilites -> database connection / Authentication config



// why a Next.js application needs a special database 
// connection pattern when it runs across multiple server instances, and how TypeScript helps us implement that pattern safely.

// the Next.js server may process many requests

// Sir's solution is to create a reusable database utility that checks whether a connection already exists, whether a connection attempt is in progress, or whether a new connection is required.


// lib/db.ts as a shared helper. Instead of writing connection logic in every API route, each route imports the same function.



// An instance is one running copy of your server-side application.

// Next.js does not always run on the Edge runtime. It can run on a Node.js runtime or an Edge runtime, depending on the deployment and configuration. Mongoose-based MongoDB connections generally require the Node.js runtime.

// Mongoose because it provides a convenient way to work with MongoDB from JavaScript and TypeScript.



// Mongoose is an ODM (Object Document Mapper). It helps you define schemas, create models, validate data and perform database operations.



// // 8. Topic 6 — TypeScript's custom types: global, declare global and .d.ts
// // This is where the lecture becomes more difficult, so let's slow down.

// // First, understand the JavaScript problem
// // Sir wants to store a Mongoose connection cache on a global object.

// // In JavaScript, you can attach a property to a global object. But TypeScript needs to know that the property exists and what its structure is.

// // For example, the cache will contain two values:

// // {
// //   connection: null,
// //   promise: null
// // }

// // But these values won't always remain null. A connection may be established, and a promise may represent a connection attempt that is still running.

// // We need to describe these possibilities to TypeScript.

// // What is a .d.ts file?
// // A declaration file tells TypeScript about types and declarations. It doesn't normally contain the actual database connection logic.

// // Sir creates a file such as:

// // lib/
// // ├── db.ts
// // └── types.d.ts
// // The purpose of types.d.ts is to tell TypeScript what shape the global cache will have.

// // Understand the types first
// // Type

// // Meaning

// // mongoose.Connection

// // A Mongoose connection object

// // Promise<T>

// // An asynchronous operation that eventually produces a value of type T

// // null

// // No value is currently stored

// // Connection \| null

// // Either a connection object or no connection

// // Promise<Connection> \| null

// // Either a pending connection operation or no pending operation

// // The vertical bar | means either type is allowed.