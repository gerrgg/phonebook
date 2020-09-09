import React from "react";

const Filter = ({ newFilter, handleNewFilter }) => {
  return (
    <p>
      Filter: <input value={newFilter} onChange={handleNewFilter} />
    </p>
  );
};

export default Filter;
