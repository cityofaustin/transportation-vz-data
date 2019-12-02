import React from "react";
import "./App.css";
import Dashboard from "./views/dashboard/dashboard";
import { useRoutes } from "hookrouter";

const routes = {
  "/dashboard": <Dashboard />,
  "/map": <Map />
};

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Vision Zero Viewer</h1>
      </header>
      <Dashboard />
    </div>
  );
}

export default App;
