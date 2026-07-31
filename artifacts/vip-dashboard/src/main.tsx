import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Switch, Route } from "wouter";
import App from "./App";
import DesignSystemPage from "./pages/DesignSystemPage";
import "./index.css";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <Switch>
      <Route path="/design-system" component={DesignSystemPage} />
      <Route component={App} />
    </Switch>
  </QueryClientProvider>
);
