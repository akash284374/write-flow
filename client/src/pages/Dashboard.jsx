// src/pages/Dashboard.jsx
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { user } = useAuth();
  const [flows, setFlows] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal Controls
  const [editFlow, setEditFlow] = useState(null);
  const [editField, setEditField] = useState("");
  const [editValue, setEditValue] = useState("");

  // Fetch My Flows
  const fetchUserFlows = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/flows/user", {
        method: "GET",
        credentials: "include", // cookie auth
      });

      const data = await res.json();
      setFlows(data.posts || []);
    } catch (err) {
      console.error("Error fetching user flows:", err);
    } finally {
      setLoading(false);
    }
  };

  // Load on mount (no token check!)
  useEffect(() => {
    fetchUserFlows();
  }, []);

  // Delete flow
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this flow permanently?")) return;

    await fetch(`http://localhost:5000/api/flows/${id}`, {
      method: "DELETE",
      credentials: "include",
    });

    setFlows(prev => prev.filter(f => f._id !== id));
  };

  // Open edit modal
  const openEdit = (flow, field) => {
    setEditFlow(flow);
    setEditField(field);
    setEditValue(flow[field] || "");
  };

  // Save edit
  const saveEdit = async () => {
    const endpoint = editField;

    await fetch(
      `http://localhost:5000/api/flows/${editFlow._id}/${endpoint}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ [editField]: editValue }),
      }
    );

    setFlows(prev =>
      prev.map(f =>
        f._id === editFlow._id ? { ...f, [editField]: editValue } : f
      )
    );

    setEditFlow(null);
    setEditField("");
    setEditValue("");
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-black text-black dark:text-white p-6">
      <h1 className="text-2xl font-bold mb-4">Manage Your Blogs</h1>

      {loading ? (
        <p>Loading...</p>
      ) : flows.length === 0 ? (
        <p>No flows found.</p>
      ) : (
        <div className="space-y-4">
          {flows.map((flow) => (
            <div
              key={flow._id}
              className="border bg-white dark:bg-gray-900 dark:border-gray-700 rounded-xl p-4 shadow"
            >
              <h2 className="text-xl font-bold">{flow.title}</h2>
              <p>{flow.description}</p>

              <div className="flex gap-3 mt-4">
                <button onClick={() => openEdit(flow, "title")} className="px-3 py-1 bg-yellow-500 text-white rounded">
                  Edit Title
                </button>

                <button onClick={() => openEdit(flow, "description")} className="px-3 py-1 bg-blue-500 text-white rounded">
                  Edit Description
                </button>

                <button onClick={() => openEdit(flow, "content")} className="px-3 py-1 bg-purple-600 text-white rounded">
                  Edit Content
                </button>

                <button onClick={() => handleDelete(flow._id)} className="px-3 py-1 bg-red-600 text-white rounded">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editFlow && (
        <div className="fixed top-0 left-0 w-full h-full bg-black/40 flex justify-center items-center">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-[90%] max-w-lg">
            <h2 className="text-xl font-bold mb-3">
              Edit {editField.toUpperCase()}
            </h2>

            <textarea
              className="w-full p-3 border rounded bg-gray-50 dark:bg-gray-700"
              rows="6"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
            />

            <div className="flex justify-end gap-3 mt-4">
              <button className="px-4 py-2 bg-gray-500 text-white rounded" onClick={() => setEditFlow(null)}>
                Cancel
              </button>

              <button className="px-4 py-2 bg-green-600 text-white rounded" onClick={saveEdit}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
