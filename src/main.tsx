import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import React from "react";
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "./components/ui/sonner";

const queryClient = new QueryClient()

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
        <App />
      <Toaster position="top-right"/>
      <ReactQueryDevtools />
    </BrowserRouter>
  </QueryClientProvider>,
);
