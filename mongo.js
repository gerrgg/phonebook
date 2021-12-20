const mongoose = require("mongoose");

if (process.argv.length < 3) {
  console.log(
    "Please provide the password as an argument: node mongo.js <password>"
  );
  process.exit(1);
}

const password = process.argv[2];
const name = process.argv[3];
const number = process.argv[4];

const url = `mongodb+srv://greg:${password}@cluster0.wjkto.mongodb.net/phonebook?retryWrites=true&w=majority`;

mongoose.connect(url);

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
  date: Date,
});

const Person = mongoose.model("Person", personSchema);

const person = new Person({
  name,
  number,
  date: new Date(),
});

if (!name || !number) {
  Person.find({}).then((result) => {
    console.log("phonebook:");

    result.forEach((person) => {
      console.log(`${person.name} ${person.number}`);
    });
    mongoose.connection.close();
  });
} else {
  person.save().then((result) => {
    console.log(`added ${result.name} number ${result.number} to phonebook`);
  });
  mongoose.connection.close();
}
