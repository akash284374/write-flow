// src/context/DraftsContext.jsx
import { createContext, useContext, useState } from "react";

const DraftsContext = createContext();

export const DraftsProvider = ({ children }) => {
  const [drafts, setDrafts] = useState([]);

  const addDraft = (title, username) => {
    const newDraft = {
      id: Date.now(),
      username,
      title: title || "Untitled",
      lastEdited: "Just now",
    };
    setDrafts((prev) => [newDraft, ...prev]);
  };

  const deleteDraft = (id) => {
    setDrafts((prev) => prev.filter((draft) => draft.id !== id));
  };

  return (
    <DraftsContext.Provider value={{ drafts, addDraft, deleteDraft }}>
      {children}
    </DraftsContext.Provider>
  );
};

export const useDrafts = () => useContext(DraftsContext);
