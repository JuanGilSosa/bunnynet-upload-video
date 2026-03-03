import { useState, useEffect } from 'react'
import VideoUploader from './components/VideoUploader'
import CollectionsManager from './components/CollectionsManager'
import Login from './components/Login'
import { getCollections } from './services/bunnynet'
import { isAuthenticated, logout } from './services/auth'
import type { BunnyNetCollection } from './types'
import './App.css'

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(isAuthenticated());
  const [collections, setCollections] = useState<BunnyNetCollection[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'upload' | 'collections'>('upload');

  const fetchCollections = async () => {
    try {
      setLoading(true);
      const data = await getCollections();
      setCollections(data || []);
    } catch (err) {
      console.error('Error fetching collections:', err);
      // Opcional: Si el error es 401, setIsLoggedIn(false)
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchCollections();
    }
  }, [isLoggedIn]);

  const handleLogout = () => {
    logout();
    setIsLoggedIn(false);
  };

  if (!isLoggedIn) {
    return <Login onLoginSuccess={() => setIsLoggedIn(true)} />;
  }

  return (
    <div className="App">
      <nav className="main-nav">
        <div className="nav-container">
          <button
            className={`nav-item ${activeTab === 'upload' ? 'active' : ''}`}
            onClick={() => setActiveTab('upload')}
          >
            <span className="nav-icon">⬆️</span>
            Subir Video
          </button>
          <button
            className={`nav-item ${activeTab === 'collections' ? 'active' : ''}`}
            onClick={() => setActiveTab('collections')}
          >
            <span className="nav-icon">📁</span>
            Colecciones
          </button>
          <button
            className="nav-item logout-item"
            onClick={handleLogout}
          >
            <span className="nav-icon">🚪</span>
            Salir
          </button>
        </div>
      </nav>

      <main className="main-content">
        <div className={`tab-panel ${activeTab === 'upload' ? 'active' : ''}`}>
          <VideoUploader
            collections={collections}
            onRefreshCollections={fetchCollections}
          />
        </div>
        <div className={`tab-panel ${activeTab === 'collections' ? 'active' : ''}`}>
          <CollectionsManager
            collections={collections}
            onRefreshCollections={fetchCollections}
            loading={loading}
          />
        </div>
      </main>
    </div>
  )
}

export default App
