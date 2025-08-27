// Database service for Experience Ledger
// This is a headless component for juris.js

// Database configuration
const DB_NAME = 'experience-ledger';
const DB_VERSION = 1;
const LEDGER_STORE = 'ledgers';
const ENTRY_STORE = 'entries';

// DBService - a headless component to handle all IndexedDB operations
function DBService() {
  return {
    expose: {
      // Initialize or open the database
      openDB: () => {
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
      },
      
      // Ledger operations
      getLedgers: function() {
        return this.openDB().then(db => {
          return new Promise((resolve, reject) => {
            const tx = db.transaction(LEDGER_STORE, 'readonly');
            const store = tx.objectStore(LEDGER_STORE);
            const req = store.getAll();
            req.onsuccess = () => resolve(req.result);
            req.onerror = e => reject(e.target.error);
          });
        });
      },
      
      addLedger: function(ledger) {
        return this.openDB().then(db => {
          return new Promise((resolve, reject) => {
            const tx = db.transaction(LEDGER_STORE, 'readwrite');
            const store = tx.objectStore(LEDGER_STORE);
            const req = store.add(ledger);
            req.onsuccess = () => resolve(req.result);
            req.onerror = e => reject(e.target.error);
          });
        });
      },
      
      deleteLedger: function(character_name) {
        return this.openDB().then(db => {
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
      getEntries: function(character) {
        return this.openDB().then(db => {
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
      
      addEntry: function(entry) {
        return this.openDB().then(db => {
          return new Promise((resolve, reject) => {
            const tx = db.transaction(ENTRY_STORE, 'readwrite');
            const store = tx.objectStore(ENTRY_STORE);
            const req = store.add(entry);
            req.onsuccess = () => resolve(req.result);
            req.onerror = e => reject(e.target.error);
          });
        });
      }
    }
  };
}

export default DBService;
