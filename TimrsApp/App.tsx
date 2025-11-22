import React, {useEffect} from 'react';
import {HomeScreen} from './src/screens/HomeScreen';
import {SyncService} from './src/services/SyncService';
import {ErrorBoundary} from './src/components/ErrorBoundary';

function App(): React.JSX.Element {
  // אתחול Sync Service בהתחלה
  useEffect(() => {
    console.log('[App] Initializing SyncService...');
    SyncService.initialize()
      .then(() => {
        console.log('[App] SyncService initialized successfully');
      })
      .catch(error => {
        console.error('[App] Failed to initialize SyncService:', error);
      });
  }, []);

  return (
    <ErrorBoundary>
      <HomeScreen />
    </ErrorBoundary>
  );
}

export default App;
