// src/components/DraftsPanel.jsx
import React from "react";
import { useDrafts } from "../context/DraftsContext";

const DraftsPanel = () => {
  const { drafts, deleteDraft } = useDrafts();

  return (
    <div className="p-4 border dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900">
      <h2 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-100">
        Drafts
      </h2>

      {drafts.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          No drafts available
        </p>
      ) : (
        drafts.map((draft) => (
          <div
            key={draft.id}
            className="p-3 mb-3 border dark:border-gray-700 rounded-lg"
          >
            <p className="font-medium text-gray-900 dark:text-gray-100">
              {draft.username}
            </p>
            <p className="text-sm text-gray-500">
              Last edited {draft.lastEdited}
            </p>
            <button
              onClick={() => deleteDraft(draft.id)}
              className="text-red-500 text-xs mt-2 hover:underline"
            >
              Delete
            </button>
          </div>
        ))
      )}
    </div>
  );
};

export default DraftsPanel;
