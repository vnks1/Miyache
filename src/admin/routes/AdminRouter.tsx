import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';
import { SeriesListPage } from '../pages/SeriesListPage';
import { SeriesCreatePage } from '../pages/SeriesCreatePage';
import { SeriesEditPage } from '../pages/SeriesEditPage';

export function AdminRouter() {
  return (
    <Routes>
      <Route path="login" element={<LoginPage />} />
      <Route
        path=""
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="series"
        element={
          <ProtectedRoute>
            <SeriesListPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="series/new"
        element={
          <ProtectedRoute>
            <SeriesCreatePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="series/:id"
        element={
          <ProtectedRoute>
            <SeriesEditPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  );
}
