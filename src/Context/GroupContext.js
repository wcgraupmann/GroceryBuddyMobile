// GroupContext.js
import React, { createContext, useState } from "react";

export const GroupContext = createContext();

export const GroupProvider = ({ children }) => {
  const [groupIds, setGroupIds] = useState([]);
  return (
    <GroupContext.Provider value={{ groupIds, setGroupIds }}>
      {children}
    </GroupContext.Provider>
  );
};
