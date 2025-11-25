// src/pages/AllFlowsPage.jsx
import { useState, useEffect } from "react";
import FlowCard from "../components/FlowCard";
import { useAuth } from "../context/AuthContext";

export default function AllFlowsPage() {
  const { user } = useAuth();
  const [flows, setFlows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFlows = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`http://localhost:5000/api/posts`, {
          credentials: "include",
        });

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const data = await res.json();
        setFlows(data.posts || []); // ✅ MongoDB backend returns posts array
      } catch (err) {
        console.error("Error fetching flows:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchFlows();
  }, [user]);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-black p-6">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
        All Flows
      </h1>

      {/* Loading */}
      {loading && (
        <p className="text-center text-gray-600 dark:text-gray-400">
          Loading flows...
        </p>
      )}

      {/* Error */}
      {error && (
        <p className="text-center text-red-500 dark:text-red-400 mt-4">
          {error}
        </p>
      )}

      {/* Flows List */}
      {!loading && !error && flows.length > 0 && (
        <div className="grid gap-4">
          {flows.map((flow) => (
            <FlowCard key={flow._id} flow={flow} />
          ))}
        </div>
      )}

      {/* No Flows */}
      {!loading && !error && flows.length === 0 && (
        <p className="text-center text-gray-600 dark:text-gray-400 mt-6">
          No flows available.
        </p>
      )}
    </div>
  );
}
