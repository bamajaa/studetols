import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import KasirLoginPage from './pages/kasir/KasirLoginPage';
import KasirApp from './pages/kasir/KasirApp';
import KalkulatorNilaiPage from './pages/KalkulatorNilaiPage';
import TaskTrackerPage from './pages/TaskTrackerPage';
import StatistikPage from './pages/StatistikPage';
import FlashcardPage from './pages/FlashcardPage';
import PomodoroPage from './pages/PomodoroPage';
import CornellNotesPage from './pages/CornellNotesPage';
import BookmarkPage from './pages/BookmarkPage';
import SchedulePage from './pages/SchedulePage';
import FinancePage from './pages/FinancePage';
import CitationPage from './pages/CitationPage';
import UnitConverterPage from './pages/UnitConverterPage';
import ProfilePage from './pages/ProfilePage';
import FriendsPage from './pages/FriendsPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
      <Route path="/friends" element={<ProtectedRoute><FriendsPage /></ProtectedRoute>} />
      <Route path="/kasir" element={<ProtectedRoute><KasirLoginPage /></ProtectedRoute>} />
      <Route path="/kasir/app" element={<ProtectedRoute><KasirApp /></ProtectedRoute>} />
      <Route path="/kalkulator" element={<ProtectedRoute><KalkulatorNilaiPage /></ProtectedRoute>} />
      <Route path="/tasks" element={<ProtectedRoute><TaskTrackerPage /></ProtectedRoute>} />
      <Route path="/statistik" element={<ProtectedRoute><StatistikPage /></ProtectedRoute>} />
      <Route path="/flashcards" element={<ProtectedRoute><FlashcardPage /></ProtectedRoute>} />
      <Route path="/pomodoro" element={<ProtectedRoute><PomodoroPage /></ProtectedRoute>} />
      <Route path="/cornell" element={<ProtectedRoute><CornellNotesPage /></ProtectedRoute>} />
      <Route path="/bookmarks" element={<ProtectedRoute><BookmarkPage /></ProtectedRoute>} />
      <Route path="/schedule" element={<ProtectedRoute><SchedulePage /></ProtectedRoute>} />
      <Route path="/finance" element={<ProtectedRoute><FinancePage /></ProtectedRoute>} />
      <Route path="/citation" element={<ProtectedRoute><CitationPage /></ProtectedRoute>} />
      <Route path="/converter" element={<ProtectedRoute><UnitConverterPage /></ProtectedRoute>} />
    </Routes>
  );
}
