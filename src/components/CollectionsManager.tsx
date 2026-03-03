import React, { useState } from 'react';
import { createCollection, deleteCollection } from '../services/bunnynet';
import type { BunnyNetCollection } from '../types';
import './CollectionsManager.css';

interface CollectionsManagerProps {
  collections: BunnyNetCollection[];
  onRefreshCollections: () => Promise<void>;
  loading: boolean;
}

const CollectionsManager: React.FC<CollectionsManagerProps> = ({ collections, onRefreshCollections, loading }) => {
  const [newCollectionName, setNewCollectionName] = useState('');
  const [error] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCreate = async () => {
    if (!newCollectionName.trim()) return;
    try {
      setIsProcessing(true);
      const result = await createCollection(newCollectionName);
      if (result.success) {
        setNewCollectionName('');
        await onRefreshCollections();
      } else {
        alert(result.message);
      }
    } catch (err) {
      alert('Error al crear colección');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async (guid: string) => {
    if (!confirm('¿Estás seguro de eliminar esta colección?')) return;
    try {
      setIsProcessing(true);
      const result = await deleteCollection(guid);
      if (result.success) {
        await onRefreshCollections();
      } else {
        alert(result.message);
      }
    } catch (err) {
      alert('Error al eliminar colección');
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading && collections.length === 0) return <div>Cargando colecciones...</div>;

  return (
    <div className="collections-manager">
      <div className="collections-header">
        <h3>Gestionar Colecciones</h3>
        <button
          className="refresh-btn"
          onClick={onRefreshCollections}
          disabled={loading || isProcessing}
          title="Refrescar colecciones"
        >
          {loading ? '...' : '🔄'}
        </button>
      </div>
      {error && <div className="error-message">{error}</div>}

      <div className="create-collection-box">
        <input
          type="text"
          value={newCollectionName}
          onChange={(e) => setNewCollectionName(e.target.value)}
          placeholder="Nombre de nueva colección"
          disabled={isProcessing}
        />
        <button onClick={handleCreate} disabled={isProcessing}>
          {isProcessing ? '...' : 'Crear'}
        </button>
      </div>

      <ul className="collections-list">
        {collections.map((col) => (
          <li key={col.guid} className="collection-item">
            <span>{col.name} ({col.videoCount} videos)</span>
            <button
              onClick={() => handleDelete(col.guid)}
              className="delete-btn"
              disabled={isProcessing}
            >
              {isProcessing ? '...' : 'Eliminar'}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CollectionsManager;
