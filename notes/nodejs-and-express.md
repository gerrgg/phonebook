# Node.js and Express

Let's navigate to an appropriate directory, and create a new template for our application with the npm init command. We will answer the questions presented by the utility, and the result will be an automatically generated package.json file at the root of the project that contains information about the project.

```
{
  "name": "backend",
  "version": "0.0.1",
  "description": "",
  "main": "index.js",
  "scripts": {
    "start": "node index.js",
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "author": "Matti Luukkainen",
  "license": "MIT"
}
```

Create index.js file

```
$ touch index.js
```

Run the application

```
$ npm start
```

## Simple web server

Let's change the application into a web server by editing the index.js files as follow:

```
const http = require('http')

const app = http.createServer((request, response) => {
  response.writeHead(200, { 'Content-Type': 'text/plain' })
  response.end('Hello World')
})

const PORT = 3001
app.listen(PORT)
console.log(`Server running on port ${PORT}`)
```

We can open our humble application in the browser by visiting the address http://localhost:3001:

## Express

Implementing our server code directly with Node's built-in http web server is possible. However, it is cumbersome, especially once the application grows in size.

```
$ npm install express
```

Update our web server to use express instead of http

```
const express = require('express')
const app = express()

let notes = [
  ...
]

app.get('/', (request, response) => {
  response.send('<h1>Hello World!</h1>')
})

app.get('/api/notes', (request, response) => {
  response.json(notes)
})

const PORT = 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
```

Right at the beginning of our code we're importing express, which this time is a function that is used to create an express application stored in the app variable:

Next, we define two routes to the application. The first one defines an event handler that is used to handle HTTP GET requests made to the application's / root:

```
app.get('/', (request, response) => {
  response.send('<h1>Hello World!</h1>')
})
```

The second route defines an event handler that handles HTTP GET requests made to the notes path of the application:

```
app.get('/api/notes', (request, response) => {
  response.json(notes)
})
```

### node-repl

Interactive JS console in commandline [node-repl](https://nodejs.org/docs/latest-v8.x/api/repl.html).

## nodemon

If we make changes to the application's code we have to restart the application in order to see the changes. We restart the application by first shutting it down by typing Ctrl+C and then restarting the application. Compared to the convenient workflow in React where the browser automatically reloaded after changes were made, this feels slightly cumbersome.

Let's install nodemon by defining it as a development dependency with the command:

npm install --save-dev nodemon

Setup command in package.json file to run nodemon

```
{
  // ..
  "scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js",    "test": "echo \"Error: no test specified\" && exit 1"
  },
  // ..
}

$npm run dev
```

## REST

### Fetching a single resource

Let's expand our application so that it offers a REST interface for operating on individual notes. First let's create a route for fetching a single resource.

The unique address we will use for an individual note is of the form notes/10, where the number at the end refers to the note's unique id number.

```
app.get('/api/notes/:id', (request, response) => {
  const id = request.params.id
  const note = notes.find(note => note.id === id)
  response.json(note)
})
```

### Deleting resources

Next let's implement a route for deleting resources. Deletion happens by making an HTTP DELETE request to the url of the resource:

```
app.delete('/api/notes/:id', (request, response) => {
  const id = Number(request.params.id)
  notes = notes.filter(note => note.id !== id)

  response.status(204).end()
})
```

If deleting the resource is successful, meaning that the note exists and it is removed, we respond to the request with the status code 204 no content and return no data with the response.

### Receiving data

Next, let's make it possible to add new notes to the server. Adding a note happens by making an HTTP POST request to the address http://localhost:3001/api/notes, and by sending all the information for the new note in the request body in the JSON format.

In order to access the data easily, we need the help of the express json-parser that is taken to use with command app.use(express.json()).

Let's activate the json-parser and implement an initial handler for dealing with the HTTP POST requests:

```
const express = require('express')
const app = express()

app.use(express.json())
//...

app.post("/api/people", (request, response) => {
  const body = request.body;

  if (!body.name || !body.number) {
    response.status(400).json({
      error: "name and number is required",
    });
  }

  const person = {
    id: generateID(),
    name: body.name,
    number: body.number,
  };

  people = people.concat(person);
});
```

### Rest Client

Assuming you are using VS Code, install the rest client for easy testing when developing the backend.

Hold CTRL+SHIFT+X and type rest-client, install the extension.

Create a new file called create_note.rest

```
GET http://localhost:3001/api/notes/

###
POST http://localhost:3001/api/notes/ HTTP/1.1
content-type: application/json

{
    "name": "sample",
    "time": "Wed, 21 Oct 2015 18:27:50 GMT"
}
```

## About HTTP request types

The HTTP standard talks about two properties related to request types, safety and idempotence.

The HTTP GET request should be safe - afety means that the executing request must not cause any side effects in the server. By side-effects we mean that the state of the database must not change as a result of the request, and the response must only return data that already exists on the server.

All HTTP requests except POST should be idempotent: this means that if a request has side-effects, then the result should be same regardless of how many times the request is sent.

If we make an HTTP PUT request to the url /api/notes/10 and with the request we send the data { content: "no side effects!", important: true }, the result is the same regardless of how many times the request is sent.

## Middleware

Middleware are functions that can be used for handling request and response objects.

The json-parser we used earlier takes the raw data from the requests that's stored in the request object, parses it into a JavaScript object and assigns it to the request object as a new property body.

In practice, you can use several middleware at the same time. When you have more than one, they're executed one by one in the order that they were taken into use in express.

Middleware is a function that receives three parameters:

```
const requestLogger = (request, response, next) => {
  console.log('Method:', request.method)
  console.log('Path:  ', request.path)
  console.log('Body:  ', request.body)
  console.log('---')
  next()
}
```

Middleware are taken into use like this:

```
app.use(requestLogger)
```

Middleware functions are called in the order that they're taken into use with the express server object's use method. Notice that json-parser is taken into use before the requestLogger middleware, because otherwise request.body will not be initialized when the logger is executed!

Middleware functions have to be taken into use before routes if we want them to be executed before the route event handlers are called. There are also situations where we want to define middleware functions after routes. In practice, this means that we are defining middleware functions that are only called if no route handles the HTTP request.

Let's add the following middleware after our routes, that is used for catching requests made to non-existent routes. For these requests, the middleware will return an error message in the JSON format.

```
const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)
```
