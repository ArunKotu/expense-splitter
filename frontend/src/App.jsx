import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Home from "./pages/Home";
import AddExpense from "./pages/AddExpense";
import ViewExpenses from "./pages/ViewExpenses";

// This component defines which page (element) loads for which URL path.
import ViewMembers from "./pages/ViewMembers";
import Charts from "./pages/Charts";
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/add-expense" element={<AddExpense />} />
        <Route path="/view-expenses" element={<ViewExpenses />} />
        <Route path="/members" element={<ViewMembers />} />
        <Route path="/charts" element={<Charts />} />

      </Routes>
    </BrowserRouter>
  );
}