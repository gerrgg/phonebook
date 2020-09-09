import React, { useState } from "react";
import Form from "./Form";
import Phonebook from "./Phonebook";
import Filter from "./Filter";

const randomGender = () => (Math.random() < 0.5 ? "M" : "F");

const App = () => {
  const [persons, setPersons] = useState([
    { name: "Arto Hellas", gender: randomGender(), number: "313-330-6066" },
    { name: "Danny Hellas", gender: randomGender(), number: "456-555-3332" },
    { name: "Jim Page", gender: randomGender(), number: "133-999-6066" },
    { name: "Donny Summers", gender: randomGender(), number: "745-330-6066" },
  ]);

  const [newFilter, setNewFilter] = useState("");
  const handleNewFilter = (e) => setNewFilter(e.target.value);

  // if theres a flter get the filtered list - otherwise show all
  const peopleToShow = newFilter
    ? persons.filter((person) =>
        // lowercase the name and the filter to make search case insensitive
        person.name.toLowerCase().includes(newFilter.toLowerCase())
      )
    : persons;

  return (
    <div>
      <h2>Phonebook</h2>
      <Filter newFilter={newFilter} handleNewFilter={handleNewFilter} />
      <h3>Add a new person</h3>
      <Form persons={persons} setPersons={setPersons} />
      <h3>Numbers</h3>
      <Phonebook peopleToShow={peopleToShow} />
    </div>
  );
};

export default App;
