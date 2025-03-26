import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// ProjectProvider is now in App.tsx to ensure proper context nesting
createRoot(document.getElementById("root")!).render(
  <App />
);
