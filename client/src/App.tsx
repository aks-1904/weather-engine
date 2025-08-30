import { Route, Routes } from "react-router-dom";
import Auth from "./pages/Auth";
import CaptainDashboard from "./pages/CaptainDashboard";
import AnalystDashboard from "./pages/AnalystDashboard";

const App = () => {
  return (
    <Routes>
      <Route path="/auth" element={<Auth />} />
      <Route path="/dashboard/captain" element={<CaptainDashboard />} />
      <Route path="/dashboard/analyst" element={<AnalystDashboard />} />
    </Routes>
  );
};

export default App;
