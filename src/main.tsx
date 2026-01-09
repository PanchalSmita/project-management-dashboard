import React from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { BrowserRouter } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { store, persistor } from "./redux/store";
import App from "./App";
import "./index.css";
import "./styles/global.css";
import { NotificationProvider } from "./components/common/NotificationContainer";
import { oauthConfig } from "./config/oauth";

console.log("main.tsx loaded");

const root = createRoot(document.getElementById("root")!);

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <PersistGate loading={<div>Loading...</div>} persistor={persistor}>
        <BrowserRouter>
          <GoogleOAuthProvider clientId={oauthConfig.google.clientId || 'dummy-client-id'}>
            <NotificationProvider>
              <App />
            </NotificationProvider>
          </GoogleOAuthProvider>
        </BrowserRouter>
      </PersistGate>
    </Provider>
  </React.StrictMode>
);

