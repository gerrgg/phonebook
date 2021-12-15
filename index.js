var morgan = require("morgan");
const express = require("express");
const cors = require("cors");

const app = express();

morgan.token("object", function (req, res) {
  return JSON.stringify(req.body);
});

app.use(cors());
app.use(express.json());

app.use(
  morgan(
    ":method :url :status :res[content-length] - :response-time ms :object"
  )
);

const requestLogger = (request, response, next) => {};

let people = [
  {
    id: 1,
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: 2,
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: 3,
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: 4,
    name: "Mary Poppendieck",
    number: "39-23-6423122",
  },
];

const generateID = () => {
  const id = people.length > 0 ? Math.max(...people.map((n) => n.id)) : 0;
  return id + 1;
};

app.get("/info", (request, response) => {
  const date = new Date();
  response.send(
    `Phonebook has info for ${people.length} people <br><br> ${date.toString()}`
  );
});

app.get("/api/people", (request, response) => {
  response.json(people);
});

app.get("/api/people/:id", (request, response) => {
  const id = Number(request.params.id);
  const person = people.find((person) => person.id === id);

  return person ? response.json(person) : response.status(204).end();
});

app.delete("/api/people/:id", (request, response) => {
  const id = Number(request.params.id);
  people = people.filter((person) => person.id !== id);

  response.status(204).end();
});

app.post("/api/people", (request, response) => {
  const body = request.body;

  const match = people.filter(
    (p) => p.name.toLocaleLowerCase() === body.name.toLocaleLowerCase()
  );

  if (!body.name || !body.number) {
    response.status(400).json({
      error: "name and number is required",
    });
    return;
  }

  if (match.length) {
    response.status(400).json({
      error: "name must be unique",
    });
    return;
  }

  const person = {
    id: generateID(),
    name: body.name,
    number: body.number,
  };

  people = people.concat(person);
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
