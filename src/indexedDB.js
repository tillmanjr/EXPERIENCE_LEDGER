// Database configuration
const DB_NAME = 'experience-ledger';
const DB_VERSION = 1;
const CHARACTER_STORE = 'characters';

const EXPERIENCE_ENTRY_STORE = 'experience_entries';
const TREASURE_ENTRY_STORE = 'treasure_entries';

export const DBService = (props, context) => {
  const { getState, setState, subscribe } = context;

  const openDB = () => {
        return new Promise((resolve, reject) => {
          const req = indexedDB.open(DB_NAME, DB_VERSION);
          req.onupgradeneeded = e => {
            const db = e.target.result;
            if (!db.objectStoreNames.contains(CHARACTER_STORE)) {
              db.createObjectStore(CHARACTER_STORE, { keyPath: 'character_name' });
            }
            if (!db.objectStoreNames.contains(EXPERIENCE_ENTRY_STORE)) {
              db.createObjectStore(EXPERIENCE_ENTRY_STORE, { keyPath: 'id', autoIncrement: true });
            }     
            if (!db.objectStoreNames.contains(TREASURE_ENTRY_STORE)) {
              db.createObjectStore(TREASURE_ENTRY_STORE, { keyPath: 'id', autoIncrement: true });
            }
          };
          req.onsuccess = e => {
            console.log('openDB success')
            resolve(e.target.result)
          };
          req.onerror = e => {
            console.error(`openDB error: ${e.target.error}`)
            reject(e.target.error)
          };
        });
      }

  const deleteCharacterExperience = async(db, characterName) => {
    return new Promise( (resolve, reject) => {
      const tx = db.transaction(EXPERIENCE_ENTRY_STORE, 'readwrite');
      const store = tx.objectStore(EXPERIENCE_ENTRY_STORE);
      const getAll = store.getAll();
      getAll.onsuccess = () => {
          getAll.result.forEach(e => {
            if (e.character === characterName) {
              store.delete(e.id);
            }
          });
          resolve();
        };
        getAll.onerror = e => reject(e.target.error);
    })
  }

  const deleteCharacterTreasure = async(db, characterName) => {
    return new Promise( (resolve, reject) => {
      const tx = db.transaction(TREASURE_ENTRY_STORE, 'readwrite');
      const store = tx.objectStore(TREASURE_ENTRY_STORE);
      const getAll = store.getAll();
      getAll.onsuccess = () => {
          getAll.result.forEach(e => {
            if (e.character === characterName) {
              store.delete(e.id);
            }
          });
          resolve();
        };
        getAll.onerror = e => reject(e.target.error);
    })
  }

  const deleteCharacterLedgerEntries = async(db, characterName) => {
    return  Promise.allSettled(
      deleteCharacterExperience(db, characterName),
      deleteCharacterTreasure(db, characterName)
    )
  }
  
  return {
    // Lifecycle hooks for headless components
    hooks: {
      onRegister: async () => {
        console.log('📦 DBService registering');
        // Initialize subscriptions, start services, setup data
        const db = await openDB()// .then( (db)=> {
          setState('charactersLoading', true)
          setState('charactersLoaded', false)
          const tx = db.transaction(CHARACTER_STORE, 'readonly');
          const store = tx.objectStore(CHARACTER_STORE);
          const req = store.getAll();
          req.onsuccess = () => {
            setState('charactersLoading', false)
            setState('charactersLoaded', true)
            console.log('getCharacters success')
            setState('characters', req.result)
            return req.result
          };
        // })
        // loadCharacters();
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
      loadCharacters: async () => {
          try {
            setState('charactersLoading', true)
            return new Promise((resolve, reject) => { 
              openDB()
                .then(db => {
                  const tx = db.transaction(CHARACTER_STORE, 'readonly');
                  const store = tx.objectStore(CHARACTER_STORE);
                  const req = store.getAll();
                  req.onsuccess = () => {
                    setState('charactersLoading', false)
                    setState('charactersLoaded', true)
                    setState('characters', req.result)
                    console.log('getCharacters success')
                    resolve(req.result)
                  };
                  req.onerror = e => {
                    setState('charactersLoading', false)
                    setState('charactersLoaded', false)
                    setState('charactersLoadingError', e.target.error)
                    console.error(`getCharacters error: ${e.target.error}`)
                    reject(e.target.error)};
                  })
                })
            } catch (error) {
                setState('charactersLoading', false)
                setState('charactersLoaded', false)
                setState('charactersLoadingError', error)
            }
      },
      
      addCharacter: async (characterName) => {
        return openDB().then(db => {
          return new Promise((resolve, reject) => {
            const tx = db.transaction(CHARACTER_STORE, 'readwrite');
            const store = tx.objectStore(CHARACTER_STORE);
            const req = store.add(characterName);
            req.onsuccess = () => {
              resolve(req.result);
            }
            req.onerror = e => reject(e.target.error);
          });
        });
      },
      
      deleteCharacter: async (characterName) => {
        return openDB().then(db => {
          try {
            return deleteCharacterLedgerEntries(db, characterName)
          } catch (error) {
            return Promise.reject(e.target.error)
          }
        });
      },
      
      // Entry operations
      getExperienceEntries: async (characterName) => {
        return openDB().then(db => {
          return new Promise((resolve, reject) => {
            const tx = db.transaction(EXPERIENCE_ENTRY_STORE, 'readonly');
            const store = tx.objectStore(EXPERIENCE_ENTRY_STORE);
            const req = store.getAll();
            req.onsuccess = () => {
              console.log('getExperienceEntries successful')
              const data = req.result.filter(e => e.character === characterName) 
              // setState('selectedCharacterExperienceEntries', data);
              const total = data.reduce( (prev, curr) => {
                const currExp = curr.experience
                const expInt = typeof(currExp) === 'string'
                  ? parseInt(currExp)
                  : currExp
                return prev + currExp
              }, 0)
              
              setState('selectedCharacterExperienceTotal', total)
              const setDesc = () => getState("sortExperienceByDateDesc", false)
              const result = data.toSorted( (a,b) => setDesc
                ? new Date(b.effective_date) - new Date(a.effective_date)
                : new Date(a.effective_date) - new Date(b.effective_date)
              )
              resolve(result)
            };
            req.onerror = e => {
              console.error(`geExperiencetEntries error: ${e.target.error}`)
              reject(e.target.error)};
          });
        });
      },

      getExperienceEntry: async (id) => {
        return openDB().then(db => {
          return new Promise((resolve, reject) => {
            const tx = db.transaction(EXPERIENCE_ENTRY_STORE, 'readonly');
            const store = tx.objectStore(EXPERIENCE_ENTRY_STORE);
            const req = store.getAll();
            req.onsuccess = () => {
              console.log(`getExperienceEntry successful for id: ${id}`)
              const data = req.result.filter(e => e.id === id) 
              console.log(`getExperienceEntry found ${data.length} matches for id: ${id}`)
              resolve(data)
            };
            req.onerror = e => {
              console.error(`geExperiencetEntries error: ${e.target.error}`)
              reject(e.target.error)};
          });
        });
      },
      
      addExperienceEntry: async (experienceEntry) => {
        return openDB().then(db => {
          return new Promise((resolve, reject) => {
            const tx = db.transaction(EXPERIENCE_ENTRY_STORE, 'readwrite');
            const store = tx.objectStore(EXPERIENCE_ENTRY_STORE);
            const req = store.add(experienceEntry);
            req.onsuccess = () => resolve(req.result);
            req.onerror = e => reject(e.target.error);
          });
        });
      },

      updateExperienceEntry: async (id, experienceEntry) => {
        return openDB().then(db => {
          return new Promise((resolve, reject) => {
            const tx = db.transaction(EXPERIENCE_ENTRY_STORE, 'readwrite');
            const store = tx.objectStore(EXPERIENCE_ENTRY_STORE);

            const req = store.get(id);

            req.onsuccess = (event) => {
              const existingRecord = event.target.result;

              if (existingRecord) {

                if (typeof(experienceEntry.experience) === 'string') {
                  experienceEntry.experience = parseInt(experienceEntry.experience)
                }
              // Modify the existing record with new data
              Object.assign(existingRecord, experienceEntry);

              const putRequest = store.put(existingRecord);

              putRequest.onsuccess = () => {
                console.log(`Record with ID ${id} updated successfully.`);
                resolve(true)
              };

              putRequest.onerror = (event) => {
                console.error(`Error updating record with ID ${id}:`, event.target.error);
                reject(error)
              };
            } else {
              console.warn(`Record with ID ${id} not found.`);
              reject(`Record with ID ${id} not found.`)
            }
            
            
            }
            req.onerror = e => reject(e.target.error);
          });
        });
      },

      deleteExperienceEntry: async (id) => {
        return openDB().then(db => {
          return new Promise((resolve, reject) => {
            const tx = db.transaction(EXPERIENCE_ENTRY_STORE, 'readwrite');
            const store = tx.objectStore(EXPERIENCE_ENTRY_STORE);

            const req = store.delete(id);
            req.onsuccess = () => {
              console.log(`Experience entry deleted: ${id}`)
              resolve(true)
            };
            req.onerror = e => {
              console.error(`Error deleting experience entry: ${id}, ${e.target.error}`)
              reject(e.target.error)};
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
    try {
      loadCharacters();
    } catch (error) {
      console.error('initializeDataSources failed')
    }
    
  }
  
  function cleanup() {
    // Cleanup any resources
  }
};
