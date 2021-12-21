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

## Lint

**Generically, lint or a linter is any tool that detects and flags errors in programming languages, including stylistic errors. The term lint-like behavior is sometimes applied to the process of flagging suspicious language usage. Lint-like tools generally perform static analysis of source code.**

In the JavaScript universe, the current leading tool for static analysis aka. "linting" is ESlint.

Let's install ESlint as a development dependency to the backend project with the command:

```
npm install eslint --save-dev
```

After this we can initialize a default ESlint configuration with the command:

```
npx eslint --init
```

<img src="https://fullstackopen.com/static/ba1423527692484103dcb2b7374eeb01/5a190/52be.png" />

The configuration will be saved in the .eslintrc.js file:

```
module.exports = {
    'env': {
        'commonjs': true,
        'es2021': true,
        'node': true
    },
    'extends': 'eslint:recommended',
    'parserOptions': {
        'ecmaVersion': 12
    },
    'rules': {
        'indent': [
            'error',
            4
        ],
        'linebreak-style': [
            'error',
            'unix'
        ],
        'quotes': [
            'error',
            'single'
        ],
        'semi': [
            'error',
            'never'
        ],
        'eqeqeq': 'error',
            'no-trailing-spaces': 'error',
    'object-curly-spacing': [
        'error', 'always'
    ],
    'arrow-spacing': [
        'error', { 'before': true, 'after': true }
    ]
    }
}
```

Let's immediately change the rule concerning indentation, so that the indentation level is two spaces.

```
"indent": [
    "error",
    2
],
```

It is recommended to create a separate npm script for linting:

```
{
  // ...
  "scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js",
    // ...
    "lint": "eslint ."
  },
  // ...
}
```

Also the files in the build directory get checked when the command is run. We do not want this to happen, and we can accomplish this by creating an .eslintignore file in the project's root with the following contents:

```
build
```

A better alternative to executing the linter from the command line is to configure a eslint-plugin to the editor, that runs the linter continuously. By using the plugin you will see errors in your code immediately. You can find more information about the Visual Studio ESLint plugin here.

https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint

This makes errors easy to spot and fix right away.

ESlint has a vast array of rules that are easy to take into use by editing the .eslintrc.js file.

Let's add the eqeqeq rule that warns us, if equality is checked with anything but the triple equals operator. The rule is added under the rules field in the configuration file.

```
{
  // ...
  'rules': {
    // ...
   'eqeqeq': 'error',
  },
}
```

Let's prevent unnecessary trailing spaces at the ends of lines, let's require that there is always a space before and after curly braces, and let's also demand a consistent use of whitespaces in the function parameters of arrow functions.

```
{
  // ...
  'rules': {
    // ...
    'eqeqeq': 'error',
    'no-trailing-spaces': 'error',
    'object-curly-spacing': [
        'error', 'always'
    ],
    'arrow-spacing': [
        'error', { 'before': true, 'after': true }
    ],
    'no-console': 0
    },
}
```

NB when you make changes to the .eslintrc.js file, it is recommended to run the linter from the command line. This will verify that the configuration file is correctly formatted:

If there is something wrong in your configuration file, the lint plugin can behave quite erratically.
