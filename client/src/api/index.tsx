import axios, { AxiosInstance } from "axios"

const pistonBaseUrl = "https://emkc.org/api/v2/piston"

const instance: AxiosInstance = axios.create({
    baseURL: pistonBaseUrl,
    headers: {
        "Content-Type": "application/json",
    },
})

// What is Axios?
// Axios is a popular JavaScript library used for making HTTP requests from the browser or Node.js applications. It is built on top of the XMLHttpRequest and has a simple API that allows you to easily send requests to APIs and handle responses. Axios supports both promises and async/await syntax, making it a flexible choice for developers.


// What is a Promise in JavaScript?
// A Promise is a built-in JavaScript object that represents the eventual completion (or failure) of an asynchronous operation and its resulting value. It is a way to handle asynchronous operations in a more manageable way than using callbacks, which can lead to complex nested structures (often referred to as "callback hell").

// Key Characteristics of Promises
// States: A promise can be in one of three states:

// Pending: The initial state, neither fulfilled nor rejected.
// Fulfilled: The operation completed successfully, resulting in a resolved value.
// Rejected: The operation failed, resulting in a reason for the failure (an error).
// Chaining: Promises allow you to chain asynchronous operations together using the .then() and .catch() methods. This makes it easier to handle sequences of asynchronous tasks and their results.

export default instance
