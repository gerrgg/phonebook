import React from "react";

const Person = ({ person, handleDelete }) => {
  return (
    <p className="person">
      {person.name} - {person.number} -{" "}
      {<button onClick={() => handleDelete(person.id)}>Delete</button>}
    </p>
  );
};

const Phonebook = ({ peopleToShow, handleDelete }) =>
  peopleToShow.length > 0 ? (
    peopleToShow.map((person, i) => (
      <Person key={i} person={person} handleDelete={handleDelete} />
    ))
  ) : (
    <p>No match</p>
  );

export default Phonebook;
