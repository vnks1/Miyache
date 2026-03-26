import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import AnimeDetailPage from './pages/AnimeDetailPage';
import EpisodeDetailPage from './pages/EpisodeDetailPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ExplorePage from './pages/ExplorePage';
import ProfilePage from './pages/ProfilePage';
import { AdminRouter } from './admin/routes/AdminRouter';

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/explorar" element={<ExplorePage />} />
        <Route path="/anime/:id" element={<AnimeDetailPage />} />
        <Route path="/episode/:id" element={<EpisodeDetailPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/admin/*" element={<AdminRouter />} />
      </Routes>
    </div>
  );
}

export default App;
