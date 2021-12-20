# Saving data to MongoDB

## MongoDB

In order to store our saved notes indefinitely, we need a database.

Document databases differ from relational databases in how they organize data as well as the query languages they support. Document databases are usually categorized under the NoSQL umbrella term.

Naturally, you can install and run MongoDB on your own computer. However, the internet is also full of Mongo database services that you can use. Our preferred MongoDB provider in this course will be MongoDB Atlas.

## Setup

Create and login to your account.

Create a cluster.

Add user access with username and password

Allow anyone to connect

Connect to database and choose "Connect your application"

The view displays the MongoDB URI, which is the address of the database that we will supply to the MongoDB client library we will add to our application.

The address looks like this:

```
mongodb+srv://fullstack:<PASSWORD>@cluster0-ostce.mongodb.net/test?retryWrites=true
```

## Mongoose

We could use the database directly from our JavaScript code with the official MongoDb Node.js driver library, but it is quite cumbersome to use. We will instead use the Mongoose library that offers a higher level API.

Mongoose could be described as an object document mapper (ODM), and saving JavaScript objects as Mongo documents is straightforward with this library.

Let's install Mongoose:

```
npm install mongoose
```

Let's not add any code dealing with Mongo to our backend just yet. Instead, let's make a practice application by creating a new file, mongo.js:

```
const mongoose = require('mongoose')

if (process.argv.length < 3) {
  console.log('Please provide the password as an argument: node mongo.js <password>')
  process.exit(1)
}

const password = process.argv[2]

const url =
  `mongodb+srv://fullstack:${password}@cluster0-ostce.mongodb.net/test?retryWrites=true`

mongoose.connect(url)

const noteSchema = new mongoose.Schema({
  content: String,
  date: Date,
  important: Boolean,
})

const Note = mongoose.model('Note', noteSchema)

const note = new Note({
  content: 'HTML is Easy',
  date: new Date(),
  important: true,
})

note.save().then(result => {
  console.log('note saved!')
  mongoose.connection.close()
})
```

When the code is run with the command node mongo.js password, Mongo will add a new document to the database.

We should give a better name to the database. Like the documentation says, we can change the name of the database from the URI:

Let's destroy the test database. Let's now change the name of database referenced in our connection string to note-app instead, by modifying the URI:

```
mongodb+srv://fullstack:<PASSWORD>@cluster0-ostce.mongodb.net/note-app?retryWrites=true
```

## Schema

After establishing the connection to the database, we define the schema for a note and the matching model:

```
const noteSchema = new mongoose.Schema({
  content: String,
  date: Date,
  important: Boolean,
})

const Note = mongoose.model('Note', noteSchema)
```

In the Note model definition, the first "Note" parameter is the singular name of the model. The name of the collection will be the lowercased plural notes, because the Mongoose convention is to automatically name collections as the plural (e.g. notes) when the schema refers to them in the singular (e.g. Note).

Document databases like Mongo are schemaless, meaning that the database itself does not care about the structure of the data that is stored in the database. It is possible to store documents with completely different fields in the same collection.

## Creating and saving objects

Next, the application creates a new note object with the help of the Note model:

```
const note = new Note({
  content: 'HTML is Easy',
  date: new Date(),
  important: false,
})
```

Models are so-called constructor functions that create new JavaScript objects based on the provided parameters. Since the objects are created with the model's constructor function, they have all the properties of the model, which include methods for saving the object to the database.

Saving the object to the database happens with the appropriately named save method, that can be provided with an event handler with the then method:

```
note.save().then(result => {
  console.log('note saved!')
  mongoose.connection.close()
})
```

## Fetching objects from the database

Let's comment out the code for generating new notes and replace it with the following:

```
Note.find({}).then(result => {
  result.forEach(note => {
    console.log(note)
  })
  mongoose.connection.close()
})
```

When the code is executed, the program prints all the notes stored in the database:

The objects are retrieved from the database with the find method of the Note model. The parameter of the method is an object expressing search conditions. Since the parameter is an empty object{}, we get all of the notes stored in the notes collection.

The search conditions adhere to the Mongo search query syntax.

We could restrict our search to only include important notes like this:

```
Note.find({ important: true }).then(result => {
  // ...
})
```

## Backend connected to a database

Now we have enough knowledge to start using Mongo in our application.

Let's get a quick start by copy pasting the Mongoose definitions to the index.js file:

```
const mongoose = require('mongoose')

// DO NOT SAVE YOUR PASSWORD TO GITHUB!!
const url =
  'mongodb+srv://fullstack:sekred@cluster0-ostce.mongodb.net/note-app?retryWrites=true'

mongoose.connect(url)

const noteSchema = new mongoose.Schema({
  content: String,
  date: Date,
  important: Boolean,
})

const Note = mongoose.model('Note', noteSchema)

```

Let's change the handler for fetching all notes to the following form:

```
app.get('/api/notes', (request, response) => {
  Note.find({}).then(notes => {
    response.json(notes)
  })
})
```

One way to format the objects returned by Mongoose is to modify the toJSON method of the schema, which is used on all instances of the models produced with that schema. Modifying the method works like this:

```
noteSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})
```

## Database configuration into its own module

Before we refactor the rest of the backend to use the database, let's extract the Mongoose specific code into its own module.

Let's create a new directory for the module called models, and add a file called note.js:

```
const mongoose = require('mongoose')

const url = process.env.MONGODB_URI
console.log('connecting to', url)
mongoose.connect(url)
  .then(result => {    console.log('connected to MongoDB')  })  .catch((error) => {    console.log('error connecting to MongoDB:', error.message)  })
const noteSchema = new mongoose.Schema({
  content: String,
  date: Date,
  important: Boolean,
})

noteSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('Note', noteSchema)
```

The public interface of the module is defined by setting a value to the module.exports variable. We will set the value to be the Note model. The other things defined inside of the module, like the variables mongoose and url will not be accessible or visible to users of the module.

Importing the module happens by adding the following line to index.js:

```
const Note = require('./models/note')
```

This way the Note variable will be assigned to the same object that the module defines.

The way that the connection is made has changed slightly:

```
const url = process.env.MONGODB_URI

console.log('connecting to', url)

mongoose.connect(url)
  .then(result => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connecting to MongoDB:', error.message)
  })
```

It's not a good idea to hardcode the address of the database into the code, so instead the address of the database is passed to the application via the MONGODB_URI environment variable.

There are many ways to define the value of an environment variable. One way would be to define it when the application is started:

```
MONGODB_URI=address_here npm run dev
```

A more sophisticated way is to use the [dotenv library](https://github.com/motdotla/dotenv#readme).

You can install the library with the command:

```
npm install dotenv
```

To use the library, we create a .env file at the root of the project. The environment variables are defined inside of the file, and it can look like this:

```
MONGODB_URI='mongodb+srv://fullstack:sekred@cluster0-ostce.mongodb.net/note-app?retryWrites=true'
PORT=3001
```

**The .env file should be gitignored right away, since we do not want to publish any confidential information publicly online!**

Let's change the index.js file in the following way:

```
require('dotenv').config()const express = require('express')
const app = express()
const Note = require('./models/note')
// ..

const PORT = process.env.PORTapp.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
```

## Using database in route handlers

Next, let's change the rest of the backend functionality to use the database.

### Create Note

Creating a new note is accomplished like this:

```
app.post('/api/notes', (request, response) => {
  const body = request.body

  if (body.content === undefined) {
    return response.status(400).json({ error: 'content missing' })
  }

  const note = new Note({
    content: body.content,
    important: body.important || false,
    date: new Date(),
  })

  note.save().then(savedNote => {
    response.json(savedNote)
  })
})
```

### Get Note

Using Mongoose's findById method, fetching an individual note gets changed into the following:

```
app.get('/api/notes/:id', (request, response) => {
  Note.findById(request.params.id).then(note => {
    response.json(note)
  })
})
```

## Verifying frontend and backend integration

When the backend gets expanded, it's a good idea to test the backend first with the browser, Postman or the VS Code REST client. Next, let's try creating a new note after taking the database into use:

Only once everything has been verified to work in the backend, is it a good idea to test that the frontend works with the backend. It is highly inefficient to test things exclusively through the frontend.

It's probably a good idea to integrate the frontend and backend one functionality at a time. First, we could implement fetching all of the notes from the database and test it through the backend endpoint in the browser. After this, we could verify that the frontend works with the new backend. Once everything seems to work, we would move onto the next feature.

Once we introduce a database into the mix, it is useful to inspect the state persisted in the database, e.g. from the control panel in MongoDB Atlas. Quite often little Node helper programs like the mongo.js program we wrote earlier can be very helpful during development.Once we introduce a database into the mix, it is useful to inspect the state persisted in the database, e.g. from the control panel in MongoDB Atlas. Quite often little Node helper programs like the mongo.js program we wrote earlier can be very helpful during development.

## Error Handling

If we try to visit the URL of a note with an id that does not actually exist e.g. http://localhost:3001/api/notes/5c41c90e84d891c15dfa3431 where 5c41c90e84d891c15dfa3431 is not an id stored in the database, then the response will be null.

Let's change this behavior so that if note with the given id doesn't exist, the server will respond to the request with the HTTP status code 404 not found. In addition let's implement a simple catch block to handle cases where the promise returned by the findById method is rejected:

```
app.get('/api/notes/:id', (request, response) => {
  Note.findById(request.params.id)
    .then(note => {
      if (note) {
        response.json(note)
      } else {
        response.status(404).end()
      }
    })
    .catch(error => {
      console.log(error)
      response.status(400).send({ error: 'malformatted id' }) })
})
```

When dealing with Promises, it's almost always a good idea to add error and exception handling, because otherwise you will find yourself dealing with strange bugs.

It's never a bad idea to print the object that caused the exception to the console in the error handler:

```
.catch(error => {
  console.log(error)
  response.status(400).send({ error: 'malformatted id' })
})
```

## Moving error handling into middleware

Let's change the handler for the /api/notes/:id route, so that it passes the error forward with the next function. The next function is passed to the handler as the third parameter:

```
app.get('/api/notes/:id', (request, response, next) => {  Note.findById(request.params.id)
    .then(note => {
      if (note) {
        response.json(note)
      } else {
        response.status(404).end()
      }
    })
    .catch(error => next(error))
  })
```

### Express Error Handler

Express error handlers are middleware that are defined with a function that accepts four parameters. Our error handler looks like this:

```
const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  }

  next(error)
}

// this has to be the last loaded middleware.
app.use(errorHandler)
```

The error handler checks if the error is a CastError exception, in which case we know that the error was caused by an invalid object id for Mongo. In this situation the error handler will send a response to the browser with the response object passed as a parameter. In all other error situations, the middleware passes the error forward to the default Express error handler.

Note that the error handling middleware has to be the last loaded middleware!

## The order of middleware loading

The execution order of middleware is the same as the order that they are loaded into express with the app.use function. For this reason it is important to be careful when defining middleware.

The correct order is the following:

```
app.use(express.static('build'))
app.use(express.json())
app.use(requestLogger)

app.post('/api/notes', (request, response) => {
  const body = request.body
  // ...
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

// handler of requests with unknown endpoint
app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  // ...
}

// handler of requests with result to errors
app.use(errorHandler)
```

It's also important that the middleware for handling unsupported routes is next to the last middleware that is loaded into Express, just before the error handler.

## Update and delete

The easiest way to delete a note from the database is with the findByIdAndRemove method:

### findByIdAndRemove

```
app.delete('/api/notes/:id', (request, response, next) => {
  Note.findByIdAndRemove(request.params.id)
    .then(result => {
      response.status(204).end()
    })
    .catch(error => next(error))
})
```

In both of the "successful" cases of deleting a resource, the backend responds with the status code 204 no content. The two different cases are deleting a note that exists, and deleting a note that does not exist in the database. The result callback parameter could be used for checking if a resource actually was deleted, and we could use that information for returning different status codes for the two cases if we deemed it necessary. Any exception that occurs is passed onto the error handler.

The toggling of the importance of a note can be easily accomplished with the findByIdAndUpdate method.

### findByIdAndUpdate

```
app.put('/api/notes/:id', (request, response, next) => {
  const body = request.body

  const note = {
    content: body.content,
    important: body.important,
  }

  Note.findByIdAndUpdate(request.params.id, note, { new: true })
    .then(updatedNote => {
      response.json(updatedNote)
    })
    .catch(error => next(error))
})
```

In the code above, we also allow the content of the note to be edited. However, we will not support changing the creation date for obvious reasons.

There is one important detail regarding the use of the findByIdAndUpdate method. By default, the updatedNote parameter of the event handler receives the original document without the modifications. We added the optional { new: true } parameter, which will cause our event handler to be called with the new modified document instead of the original.

## Question everything

Debugging Full Stack applications may seem tricky at first. Soon our application will also have a database in addition to the frontend and backend, and there will be many potential areas for bugs in the application.

When the application "does not work", we have to first figure out where the problem actually occurs. It's very common for the problem to exist in a place where you didn't expect it to, and it can take minutes, hours, or even days before you find the source of the problem.

The key is to be systematic. Since the problem can exist anywhere, you must question everything, and eliminate all possibilities one by one. Logging to the console, Postman, debuggers, and experience will help.

When bugs occur, the worst of all possible strategies is to continue writing code. It will guarantee that your code will soon have even more bugs, and debugging them will be even more difficult. The stop and fix principle from Toyota Production Systems is very effective in this situation as well.
