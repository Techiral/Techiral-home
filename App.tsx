import React from 'react';
import { useRouter } from './hooks/useRouter';
import { useAuth } from './hooks/useAuth';
import HomePage from './pages/HomePage';
import VideosPage from './pages/VideosPage';
import VideoDetailPage from './pages/VideoDetailPage';
import BlogsPage from './pages/BlogsPage';
import BlogDetailPage from './pages/BlogDetailPage';
import AdminPage from './pages/AdminPage';
import AdminLoginPage from './pages/AdminLoginPage';
import Header from './components/Header';
import Footer from './components/Footer';

const App: React.FC = () => {
  const { path, param } = useRouter();
  const { isAuthenticated } = useAuth();

  const renderPage = () => {
    switch (path) {
      case 'videos':
        return param ? <VideoDetailPage videoId={param} /> : <VideosPage />;
      case 'blogs':
        return param ? <BlogDetailPage blogId={param} /> : <BlogsPage />;
      case 'admin':
        // Protected route: show AdminPage if authenticated, otherwise show LoginPage
        return isAuthenticated ? <AdminPage /> : <AdminLoginPage />;
      default:
        return <HomePage />;
    }
  };

  // Do not render Header and Footer for the admin login page to provide a focused experience
  const showHeaderFooter = path !== 'admin' || isAuthenticated;

  return (
    <div className="bg-white font-roboto">
      {showHeaderFooter && <Header />}
      <main>
        {renderPage()}
      </main>
      {showHeaderFooter && <Footer />}
    </div>
  );
};

export default App;