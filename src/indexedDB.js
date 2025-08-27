// Database configuration
const DB_NAME = 'experience-ledger';
const DB_VERSION = 1;
const LEDGER_STORE = 'ledgers';
const ENTRY_STORE = 'entries';

export const DBService = (props, context) => {
  const { getState, setState, subscribe } = context;

  const openDB = () => {
        return new Promise((resolve, reject) => {
          const req = indexedDB.open(DB_NAME, DB_VERSION);
          req.onupgradeneeded = e => {
            const db = e.target.result;
            if (!db.objectStoreNames.contains(LEDGER_STORE)) {
              db.createObjectStore(LEDGER_STORE, { keyPath: 'character_name' });
            }
            if (!db.objectStoreNames.contains(ENTRY_STORE)) {
              db.createObjectStore(ENTRY_STORE, { keyPath: 'id', autoIncrement: true });
            }
          };
          req.onsuccess = e => resolve(e.target.result);
          req.onerror = e => reject(e.target.error);
        });
      }
  
  return {
    // Lifecycle hooks for headless components
    hooks: {
      onRegister: () => {
        console.log('📦 DataManager registered');
        // Initialize subscriptions, start services, setup data
        initializeDataSources();
      },
      
      onUnregister: () => {
        console.log('🧹 DataManager cleanup');
        // Cleanup subscriptions, stop services, clear timers
        cleanup();
      }
    },
    
    // Public API for other components to use
    api: {
      openDB: async () => {
        return openDB()
      },
      // Ledger operations
      getLedgers: async () => {
        return openDB().then(db => {
          return new Promise((resolve, reject) => {
            const tx = db.transaction(LEDGER_STORE, 'readonly');
            const store = tx.objectStore(LEDGER_STORE);
            const req = store.getAll();
            req.onsuccess = () => resolve(req.result);
            req.onerror = e => reject(e.target.error);
          });
        });
      },
      
      addLedger: async (ledger) => {
        return openDB().then(db => {
          return new Promise((resolve, reject) => {
            const tx = db.transaction(LEDGER_STORE, 'readwrite');
            const store = tx.objectStore(LEDGER_STORE);
            const req = store.add(ledger);
            req.onsuccess = () => resolve(req.result);
            req.onerror = e => reject(e.target.error);
          });
        });
      },
      
      deleteLedger: async (character_name) => {
        return openDB().then(db => {
          return new Promise((resolve, reject) => {
            const tx = db.transaction(LEDGER_STORE, 'readwrite');
            const store = tx.objectStore(LEDGER_STORE);
            const req = store.delete(character_name);
            req.onsuccess = () => {
              // Also delete all entries for this character
              const tx2 = db.transaction(ENTRY_STORE, 'readwrite');
              const store2 = tx2.objectStore(ENTRY_STORE);
              const getAll = store2.getAll();
              getAll.onsuccess = () => {
                getAll.result.forEach(e => {
                  if (e.character === character_name) {
                    store2.delete(e.id);
                  }
                });
                resolve();
              };
              getAll.onerror = e => reject(e.target.error);
            };
            req.onerror = e => reject(e.target.error);
          });
        });
      },
      
      // Entry operations
      getEntries: async (character) => {
        return openDB().then(db => {
          return new Promise((resolve, reject) => {
            const tx = db.transaction(ENTRY_STORE, 'readonly');
            const store = tx.objectStore(ENTRY_STORE);
            const req = store.getAll();
            req.onsuccess = () => {
              resolve(req.result.filter(e => e.character === character));
            };
            req.onerror = e => reject(e.target.error);
          });
        });
      },
      
      addEntry: async (entry) => {
        return openDB().then(db => {
          return new Promise((resolve, reject) => {
            const tx = db.transaction(ENTRY_STORE, 'readwrite');
            const store = tx.objectStore(ENTRY_STORE);
            const req = store.add(entry);
            req.onsuccess = () => resolve(req.result);
            req.onerror = e => reject(e.target.error);
          });
        });
      },
      
      refreshData: () => {
        // Refresh all data sources
        // loadInitialData();
      }
    }
    
    // No render method - headless components don't render UI
  };

  function initializeDataSources() {
    // Setup initial data loading
  }
  
  function cleanup() {
    // Cleanup any resources
  }
};
