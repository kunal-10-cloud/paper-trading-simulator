import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Markets from './pages/Markets';
import Holdings from './pages/Holdings';
import Screeners from './pages/Screeners';
import NewsPage from './pages/NewsPage';
import Trade from './pages/Trade';
import StockDetail from './pages/StockDetail';
import AuthSuccess from './pages/AuthSuccess';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  console.log("App rendering");
  return (
    <Router>
      <ThemeProvider>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/markets" element={<ProtectedRoute><Markets /></ProtectedRoute>} />
          <Route path="/holdings" element={<ProtectedRoute><Holdings /></ProtectedRoute>} />
          <Route path="/screeners" element={<Screeners />} />
          <Route path="/news" element={<NewsPage />} />
          <Route path="/trade" element={<Trade />} />
          <Route path="/stock/:symbol" element={<StockDetail />} />
          <Route path="/auth/success" element={<AuthSuccess />} />
        </Routes>
      </ThemeProvider>
    </Router>
  );
}

export default App;
