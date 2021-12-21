const mongoose = require("mongoose");
var uniqueValidator = require("mongoose-unique-validator");

// eslint-disable-next-line no-undef
const url = process.env.MONGODB_URI;

console.log("connecting to", url);
mongoose
  .connect(url)
  .then(() => {
    console.log("connected to MongoDB");
  })
  .catch((error) => {
    console.log("error connecting to MongoDB:", error.message);
  });

const personSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, minLength: 3 },
  number: { type: String, required: true, maxLength: 10 },
  date: Date,
});

personSchema.plugin(uniqueValidator);

personSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.date;
    delete returnedObject.__v;
  },
});

module.exports = mongoose.model("Person", personSchema);
