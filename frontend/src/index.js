import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import { SettingsProvider } from "./context/SettingsContext";
import { Toaster } from 'react-hot-toast';

// الطريقة الصحيحة لاستيراد CSS في react-hot-toast (بدون مسار)
// لا تحتاج إلى استيراد CSS منفصل، Toaster سيعمل تلقائياً

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <AuthProvider>
    <SettingsProvider>
      <App />
      <Toaster 
        position="top-center"
        reverseOrder={false}
        toastOptions={{
          duration: 5000,
          style: {
            direction: 'rtl',
            fontFamily: 'inherit',
          },
        }}
      />
    </SettingsProvider>
  </AuthProvider>
);