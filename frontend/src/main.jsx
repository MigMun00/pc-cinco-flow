import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { ClerkProvider } from "@clerk/react";
import { dark } from "@clerk/ui/themes";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ClerkProvider
      appearance={{
        theme: dark,
        variables: {
          colorBackground: "var(--background)",
          colorText: "var(--text)",
        },
      }}
    >
      <App />
    </ClerkProvider>
  </StrictMode>,
);
