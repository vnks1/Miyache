import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import AnimeDetailPage from './pages/AnimeDetailPage';
import './App.css';

function App() {
  return (
    <div className="app">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/anime/:id" element={<AnimeDetailPage />} />
      </Routes>
    </div>
  );
}

export default App;
