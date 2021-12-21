# Validation and ESLint

One smarter way of validating the format of the data before it is stored in the database, is to use the validation functionality available in Mongoose.

We can define specific validation rules for each field in the schema:

```
const noteSchema = new mongoose.Schema({
  content: {
    type: String,
    minLength: 5,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  important: Boolean
})
```

The content field is now required to be at least five characters long. The date field is set as required, meaning that it can not be missing. The same constraint is also applied to the content field, since the minimum length constraint allows the field to be missing. We have not added any constraints to the important field, so its definition in the schema has not changed.

If we try to store an object in the database that breaks one of the constraints, the operation will throw an exception. Let's change our handler for creating a new note so that it passes any potential exceptions to the error handler middleware:

```
app.post('/api/notes', (request, response, next) => {
  const body = request.body

  const note = new Note({
    content: body.content,
    important: body.important || false,
    date: new Date(),
  })

  note.save()
    .then(savedNote => {
      response.json(savedNote.toJSON())
    })
    .catch(error => next(error))})
```

Let's expand the error handler to deal with these validation errors:

```
const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}
```

When validating an object fails, we return the following default error message from Mongoose:

<img src="https://fullstackopen.com/static/6beb35ed56d2e06e0eda3e36dea9f426/5a190/50.png" />

## Promise Chaining

Many of the route handlers changed the response data into the right format by implicitly calling the toJSON method from response.json. For the sake of an example, we can also perform this operation explicitly by calling the toJSON method on the object passed as a parameter to then:

```
app.post('/api/notes', (request, response, next) => {
  // ...

  note.save()
    .then(savedNote => {
      response.json(savedNote.toJSON())
    })
    .catch(error => next(error))
})
```

We can accomplish the same functionality in a much cleaner way with promise chaining:

```
app.post('/api/notes', (request, response, next) => {
  // ...

  note
    .save()
    .then(savedNote => savedNote.toJSON())
    .then(savedAndFormattedNote => {
      response.json(savedAndFormattedNote)
    })
    .catch(error => next(error))
})
```

## Deploying the database backend to production

The environment variables defined in dotenv will only be used when the backend is not in production mode, i.e. Heroku.

We defined the environment variables for development in file .env, but the environment variable that defines the database URL in production should be set to Heroku with the heroku config:set command.

```
heroku config:set MONGODB_URI=mongodb+srv://fullstack:secretpasswordhere@cluster0-ostce.mongodb.net/note-app?retryWrites=true
```
