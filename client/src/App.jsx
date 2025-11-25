import React, { useState } from "react";
import AppRoutes from "./routes/AppRoutes";
import { useAuth } from "./context/AuthContext";

const App = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const { loading } = useAuth(); // optional if you want to handle loading

  return (
    <div className="min-h-screen bg-white dark:bg-[#0f0f0f] text-black dark:text-white transition-colors duration-300">
      <AppRoutes searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
    </div>
  );
};

export default App;
