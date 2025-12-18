import React, { useEffect, useState } from 'react';
import AttendanceDashboard from './components/AttendanceDashboard';
import { migrateAllData } from './lib/migrateData';

function App() {
  const [migrationStatus, setMigrationStatus] = useState<'pending' | 'migrating' | 'completed' | 'error'>('pending');

  useEffect(() => {
    const runMigration = async () => {
      const migrated = localStorage.getItem('data_migrated');

      if (migrated !== 'true') {
        setMigrationStatus('migrating');
        try {
          const result = await migrateAllData();
          if (result.success) {
            localStorage.setItem('data_migrated', 'true');
            setMigrationStatus('completed');
            console.log('Migration successful:', result);
          } else {
            setMigrationStatus('error');
            console.error('Migration failed:', result);
          }
        } catch (error) {
          setMigrationStatus('error');
          console.error('Migration error:', error);
        }
      } else {
        setMigrationStatus('completed');
      }
    };

    runMigration();
  }, []);

  if (migrationStatus === 'migrating') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Initializing Database</h2>
          <p className="text-gray-600">Migrating data to Supabase...</p>
        </div>
      </div>
    );
  }

  if (migrationStatus === 'error') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-800 mb-2">Migration Error</h2>
          <p className="text-red-600">Failed to initialize database. Check console for details.</p>
          <button
            onClick={() => {
              localStorage.removeItem('data_migrated');
              window.location.reload();
            }}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <AttendanceDashboard />
  );
}

export default App;