# Deploying App to Internet

Now lets connect our backend to the front. Let's change the attribute baseUrl in the src/services/notes.js like so:

```
import axios from 'axios'
const baseUrl = 'http://localhost:3001/api/notes'
const getAll = () => {
  const request = axios.get(baseUrl)
  return request.then(response => response.data)
}

// ...

export default { getAll, create, update }
```

We will also need to change the url specified in the effect in App.js:

```
  useEffect(() => {
    axios
      .get('http://localhost:3001/api/notes')
      .then(res => {
        setNotes(res.data)
      })
  }, [])
```

Now frontend's GET request to http://localhost:3001/api/notes does not work for some reason...

## Same origin policy and CORS

The issue lies with a thing called CORS, or Cross-Origin Resource Sharing.

In our context the problem is that, by default, the JavaScript code of an application that runs in a browser can only communicate with a server in the same origin. Because our server is in localhost port 3001, and our frontend in localhost port 3000, they do not have the same origin.

We can allow requests from other origins by using Node's cors middleware.

In your backend repo, install cors

```
npm install cors
```

take the middleware to use and allow for requests from all origins:

```
const cors = require('cors')

app.use(cors())
```

The react app that runs in browser fetches now the data from node/express-server that runs in localhost:3001.

## Application to the Internet

Now that the whole stack is ready, let's move our application to the internet. We'll use good old Heroku for this.

Add a file called Procfile to the backend project's root to tell Heroku how to start the application.

```
web: npm start
```

Change the definition of the port our application uses at the bottom of the index.js file like so:

```
const PORT = process.env.PORT || 3001app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
```

_Create a Git repository in the project directory, and add .gitignore with the following contents_

```
node_modules
```

Create a Heroku application with the command heroku create, commit your code to the repository and move it to Heroku with command git push heroku main.

Yay, your backend is live (hopefully)!

## Frontend production build

When the application is deployed, we must create a production build or a version of the application which is optimized for production.

```
npm run build
```

This creates a directory called build (which contains the only HTML file of our application, index.html ) which contains the directory static. Minified version of our application's JavaScript code will be generated to the static directory. Even though the application code is in multiple files, all of the JavaScript will be minified into one file. Actually all of the code from all of the application's dependencies will also be minified into this single file.

### Serving static files from the backend

One option for deploying the frontend is to copy the production build (the build directory) to the root of the backend repository and configure the backend to show the frontend's main page (the file build/index.html) as its main page.

```
cp -r build ../notes-backend
```

To make express show static content, the page index.html and the JavaScript, etc., it fetches, we need a built-in middleware from express called static.

```
app.use(express.static('build'))
```

Because of our situation, both the frontend and the backend are at the same address, we can declare baseUrl as a relative URL. This means we can leave out the part declaring the server.

![alt text](https://fullstackopen.com/static/6f33425b60b49278d57df7e62f81a32c/db910/101.png)

Unlike when running the app in a development environment, everything is now in the same node/express-backend that runs in localhost:3001. When the browser goes to the page, the file index.html is rendered. That causes the browser to fetch the product version of the React app. Once it starts to run, it fetches the json-data from the address localhost:3001/api/notes.

## Streamlining deploying of the frontend

To create a new production build of the frontend without extra manual work, let's add some npm-scripts to the package.json of the backend repository:

```
{
  "scripts": {
    //...
    "build:ui": "rm -rf build && cd ../part2-notes/ && npm run build && cp -r build ../notes-backend",
    "deploy": "git push heroku main",
    "deploy:full": "npm run build:ui && git add . && git commit -m uibuild && git push && npm run deploy",
    "logs:prod": "heroku logs --tail"
  }
}
```

The script npm run build:ui builds the frontend and copies the production version under the backend repository. npm run deploy releases the current backend to heroku.

npm run deploy:full combines these two and contains the necessary git commands to update the backend repository.

There is also a script npm run logs:prod to show the heroku logs.

## Proxy

Changes on the frontend have caused it to no longer work in development mode (when started with command npm start), as the connection to the backend does not work.

This is due to changing the backend address to a relative URL:

```
const baseUrl = '/api/notes'
```

Because in development mode the frontend is at the address localhost:3000, the requests to the backend go to the wrong address localhost:3000/api/notes. The backend is at localhost:3001.

If the project was created with create-react-app, this problem is easy to solve. It is enough to add the following declaration to the package.json file of the frontend repository.

```
{
  "dependencies": {
    // ...
  },
  "scripts": {
    // ...
  },
  "proxy": "http://localhost:3001"
}
```
