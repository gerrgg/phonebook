import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import Form from "./Form";
import Phonebook from "./Phonebook";
import Filter from "./Filter";
import Notifications from "./Notifications";
import personService from "./services/persons";
import "./index.css";

const App = () => {
  const [persons, setPersons] = useState([]);
  const [notificationMessage, setNotification] = useState(null);

  useEffect(() => {
    personService.getAll().then((initialPersons) => setPersons(initialPersons));
  }, []);

  const [newFilter, setNewFilter] = useState("");
  const handleNewFilter = (e) => setNewFilter(e.target.value);

  const handleDelete = (id) => {
    window.confirm(`Delete person ${id}?`)
      ? personService.remove(id).then((response) => {
          setPersons(
            persons.filter((person) =>
              person.id !== id ? person : response.data
            )
          );
          setNotification(`Person #${id} was deleted`);
        })
      : setNotification(`Deleteing #${id} failed `);
  };

  // if theres a flter get the filtered list - otherwise show all
  const peopleToShow = newFilter
    ? persons.filter((person) =>
        // lowercase the name and the filter to make search case insensitive
        person.name.toLowerCase().includes(newFilter.toLowerCase())
      )
    : persons;

  return (
    <div>
      <Notifications message={notificationMessage} />
      <h2>Phonebook</h2>
      <Filter newFilter={newFilter} handleNewFilter={handleNewFilter} />
      <h3>Add a new person</h3>
      <Form
        persons={persons}
        setPersons={setPersons}
        setNotification={setNotification}
      />
      <h3>Numbers</h3>
      <Phonebook peopleToShow={peopleToShow} handleDelete={handleDelete} />
    </div>
  );
};

export default App;

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById("root")
);
