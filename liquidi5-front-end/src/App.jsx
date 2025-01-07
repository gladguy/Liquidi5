import { initJuno } from "@junobuild/core";
import { useEffect } from "react";
import { BrowserRouter as Router } from "react-router-dom";
import "./App.css";
import MainLayout from "./layout/mainlayout";

const App = () => {
  useEffect(() => {
    (async () =>
      await initJuno({
        satelliteId: "aqerx-6aaaa-aaaal-ajdoq-cai",
      }))();
  }, []);

  return (
    <Router>
      <MainLayout />
    </Router>
  );
};

export default App;
