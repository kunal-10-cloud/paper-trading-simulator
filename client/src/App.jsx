import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Trade from './pages/Trade';
import StockDetail from './pages/StockDetail';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/trade" element={<Trade />} />
        <Route path="/stock/:symbol" element={<StockDetail />} />
      </Routes>
    </Router>
  );
}

export default App;
