require("dotenv").config();

const express = require("express");
const app = express();

var morgan = require("morgan");
morgan.token("object", function (req, res) {
  return JSON.stringify(req.body);
});

const cors = require("cors");

app.use(cors());
app.use(express.json());

app.use(
  morgan(
    ":method :url :status :res[content-length] - :response-time ms :object"
  )
);

app.use(express.static("build"));

const Person = require("./models/person");

app.get("/api/people", (request, response) => {
  Person.find({}).then((people) => {
    response.json(people);
  });
});

app.get("/api/people/:id", (request, response) => {
  Person.findById(request.params.id).then((person) => {
    response.json(person);
  });
});

app.delete("/api/people/:id", (request, response, next) => {
  response.status(204).end();

  Person.findByIdAndRemove(request.params.id)
    .then((result) => {
      response.status(204).end();
    })
    .catch((error) => next(error));
});

app.post("/api/people", async (request, response, next) => {
  const body = request.body;

  const match = await Person.findOne({
    name: body.name.toLowerCase(),
  }).exec();

  if (match !== null) {
    const person = {
      number: body.number,
    };

    Person.findByIdAndUpdate(match.id, person, {
      new: true,
      runValidators: true,
    })
      .then((updatedPerson) => {
        response.json(updatedPerson);
      })
      .catch((error) => next(error));
  } else {
    const person = new Person({
      name: body.name.toLowerCase(),
      number: body.number,
      date: new Date(),
    });

    person
      .save()
      .then((savedPerson) => savedPerson.toJSON())
      .then((savedAndFormattedPerson) => {
        response.json(savedAndFormattedPerson);
      })
      .catch((error) => next(error));
  }
});

app.put("/api/people/:id", (request, response, next) => {
  Person.findByIdAndUpdate(request.params.id, request.body, { new: true })
    .then((result) => {
      response.json(result);
    })
    .catch((error) => next(error));
});

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" });
};

app.use(unknownEndpoint);

const errorHandler = (error, request, response, next) => {
  console.error(error.message);

  if (error.name === "CastError") {
    return response.status(400).send({ error: "malformatted id" });
  } else if (error.name === "ValidationError") {
    return response.status(400).json({ error: error.message });
  }

  next(error);
};

// this has to be the last loaded middleware.
app.use(errorHandler);

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
