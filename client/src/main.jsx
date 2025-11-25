import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";
import { DraftsProvider } from "./context/DraftsContext"; // ✅ for unsaved blogs
import "./index.css"; // Tailwind base styles

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter basename="/">
      <ThemeProvider>
        <AuthProvider>
          <DraftsProvider>
            <App />
          </DraftsProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);
