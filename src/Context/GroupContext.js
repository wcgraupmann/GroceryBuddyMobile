import React, { createContext, useState } from "react";

const GroupContext = createContext();

const GroupProvider = ({ children }) => {
  const [groupIds, setGroupIds] = useState([]);

  return (
    <GroupContext.Provider value={{ groupIds, setGroupIds }}>
      {children}
    </GroupContext.Provider>
  );
};

export { GroupContext, GroupProvider };
