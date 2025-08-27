// Import our database service
import {DBService} from './indexedDB.js';

// LedgerRoot component stub
function LedgerRoot(props, ctx) {
  const { getState, setState, DBService, components } = ctx
  // Access the DB service through components
  const db = DBService;

  // State
  const ledgers = getState('ledgers', []);
  const newName = getState('newCharacterName', '');
  const error = getState('ledgerError', '');
  const selected = getState('selectedLedger', null);

  // Always reload ledgers from IndexedDB when not viewing a selected ledger
  const dbReady = getState('dbReady', false);
  if (!dbReady) {
    db.openDB().then(() => {
      setState('dbReady', true);
      db.getLedgers().then(dbLedgers => {
        setState('ledgers', dbLedgers);
      });
    });
  } else if (!selected) {
    db.getLedgers().then(dbLedgers => {
      // Only update if changed to avoid infinite rerender
      const prev = getState('ledgers', []);
      if (JSON.stringify(prev) !== JSON.stringify(dbLedgers)) {
        setState('ledgers', dbLedgers);
      }
    });
  }

  if (!selected) {
    return {
      div: {
        class: 'mt-6',
        children: [
          {
            div: {
              class: 'mb-4',
              children: [
                { div: { class: 'font-semibold mb-2', text: 'Select Character Ledger' } },
                {
                  select: {
                    class: 'w-full mb-2 p-2 border rounded',
                    onchange: e => setState('selectedLedger', e.target.value),
                    children: [
                      { option: { value: '', disabled: true, selected: true, text: 'Choose a character...' } },
                      ...ledgers.map(l => ({ option: { value: l.character_name, text: l.character_name } }))
                    ]
                  }
                }
              ]
            }
          },
          {
            form: {
              class: 'flex gap-2',
              onsubmit: e => {
                e.preventDefault();
                setState('ledgerError', '');
                const name =  getState('newCharacterName', '').trim() //  // newName.trim();
                if (!name) return setState('ledgerError', 'Character name required.');
                if (name.length > 50) return setState('ledgerError', 'Max 50 chars.');
                if (ledgers.some(l => l.character_name.toLowerCase() === name.toLowerCase())) return setState('ledgerError', 'Name must be unique.');
                const now = new Date().toISOString();
                const ledger = { character_name: name, created_at: now, modified_at: now, total_experience: 0 };
                //db.openDB().then(() => {
                  db.addLedger(ledger).then(() => {
                    db.getLedgers().then(dbLedgers => {
                      setState('ledgers', dbLedgers);
                      setState('newCharacterName', '');
                      setState('selectedLedger', name);
                    }).catch(err => {
                      setState('ledgerError', 'Failed to reload ledgers: ' + (err && err.message));
                      console.error('Reload ledgers error', err);
                    });
                  }).catch(err => {
                    setState('ledgerError', 'Failed to save character: ' + (err && err.message));
                    console.error('Add ledger error', err);
                  });
                // }).catch(err => {
                //   setState('ledgerError', 'Failed to open DB: ' + (err && err.message));
                //   console.error('Open DB error', err);
                // });
              },
              children: [
                {
                  input: {
                    name: 'createCharacterBtn',
                    class: 'flex-1 border p-2 rounded',
                    type: 'text',
                    placeholder: 'New character name',
                    value: newName,
                    oninput: e => setState('newCharacterName', e.target.value),
                    maxlength: 50
                  }
                },
                {
                  button: {
                    class: 'bg-blue-600 text-white px-4 py-2 rounded',
                    type: 'submit',
                    text: 'Create'
                  }
                }
              ]
            }
          },
          ledgers.length > 0 && {
            ul: {
              class: 'mb-2',
              children: ledgers.map(l => ({
                li: {
                  class: 'flex items-center gap-2 mb-1',
                  children: [
                    { span: { class: 'flex-1', text: l.character_name } },
                    {
                      button: {
                        class: 'text-blue-600 underline',
                        onclick: () => {
                          setState('selectedLedger', l.character_name);
                          setState(`entries:${l.character_name}`, []); // clear stale entries state
                        },
                        text: 'Open'
                      }
                    },
                    {
                      button: {
                        class: 'text-red-600 underline',
                        onclick: () => {
                          db.deleteLedger(l.character_name).then(() => {
                            setState('ledgers', ledgers.filter(x => x.character_name !== l.character_name));
                            setState(`entries:${l.character_name}`, []);
                            if (selected === l.character_name) setState('selectedLedger', null);
                          });
                        },
                        text: 'Delete'
                      }
                    }
                  ]
                }
              }))
            }
          },
          error && { div: { class: 'text-red-600 mt-2', text: error } }
        ]
      }
    };
  }

  // Show ledger entries for the selected character
  return {
    div: {
      class: 'mt-6',
      children: [
        {
          button: {
            class: 'mb-2 text-blue-600 underline',
            onclick: () => {
              setState('selectedLedger', null);
              // Do not clear ledgers state here; let reload logic above handle it
            },
            text: 'Back to Character Select'
          }
        },
        { div: { class: 'font-bold', children: ['Selected: ', selected] } },
        { LedgerEntries: { character: selected } }
      ]
    }
  };
}

// LedgerEntries component for managing entries for a character
function LedgerEntries(props, { getState, setState, components }) {
  const { character } = props;
  // Access the DB service through components
  const db = components.DBService;

  // State
  const entries = getState(`entries:${character}`, []);
  const showAdd = getState('showAddEntry', false);
  const addError = getState('addEntryError', '');
  const form = getState('addEntryForm', {
    experience: '',
    category: '',
    description: '',
    effective_date: new Date().toISOString().slice(0, 10)
  });

  // Always reload entries from IndexedDB when character changes or after add/delete
  const lastLoaded = getState(`entriesLoaded:${character}`, false);
  if (!lastLoaded) {
    db.getEntries(character).then(dbEntries => {
      setState(`entries:${character}`, dbEntries);
      setState(`entriesLoaded:${character}`, true);
    });
  }

  function handleAdd(e) {
    e.preventDefault();
    setState('addEntryError', '');
    const exp = parseInt(form.experience, 10);
    if (isNaN(exp) || exp <= 0) return setState('addEntryError', 'Experience must be a positive number.');
    if (!form.category.trim()) return setState('addEntryError', 'Category required.');
    if (!form.description.trim()) return setState('addEntryError', 'Description required.');
    const entry = {
      character,
      experience: exp,
      category: form.category.trim(),
      description: form.description.trim(),
      effective_date: form.effective_date
    };
    db.addEntry(entry).then(id => {
      setState(`entriesLoaded:${character}`, false); // force reload
      setState('showAddEntry', false);
      setState('addEntryForm', {
        experience: '',
        category: '',
        description: '',
        effective_date: new Date().toISOString().slice(0, 10)
      });
    }).catch(err => setState('addEntryError', 'Failed to save entry.'));
  }

  return {
    div: {
      class: 'mt-4',
      children: [
        { div: { class: 'font-semibold mb-2', text: `Entries for ${character}` } },
        entries.length === 0
          ? { div: { class: 'text-gray-400', text: 'No entries yet.' } }
          : {
              ul: {
                class: 'mb-2',
                children: entries.map(e => ({
                  li: { class: 'mb-1', text: `${e.effective_date}: ${e.experience} XP (${e.category}) - ${e.description}` }
                }))
              }
            },
        showAdd
          ? {
              form: {
                class: 'bg-gray-50 border rounded p-3 mb-2',
                onsubmit: handleAdd,
                children: [
                  {
                    input: {
                      class: 'border p-1 rounded w-24 mr-2',
                      type: 'number',
                      min: 1,
                      placeholder: 'XP',
                      value: form.experience,
                      oninput: e => setState('addEntryForm', { ...form, experience: e.target.value })
                    }
                  },
                  {
                    input: {
                      class: 'border p-1 rounded w-32 mr-2',
                      type: 'text',
                      placeholder: 'Category',
                      value: form.category,
                      oninput: e => setState('addEntryForm', { ...form, category: e.target.value })
                    }
                  },
                  {
                    input: {
                      class: 'border p-1 rounded w-40 mr-2',
                      type: 'text',
                      placeholder: 'Description',
                      value: form.description,
                      oninput: e => setState('addEntryForm', { ...form, description: e.target.value })
                    }
                  },
                  {
                    input: {
                      class: 'border p-1 rounded w-32 mr-2',
                      type: 'date',
                      value: form.effective_date,
                      oninput: e => setState('addEntryForm', { ...form, effective_date: e.target.value })
                    }
                  },
                  {
                    button: {
                      class: 'bg-blue-600 text-white px-3 py-1 rounded',
                      type: 'submit',
                      text: 'Save'
                    }
                  },
                  {
                    button: {
                      class: 'ml-2 text-gray-600 underline',
                      type: 'button',
                      onclick: () => setState('showAddEntry', false),
                      text: 'Cancel'
                    }
                  },
                  addError && { div: { class: 'text-red-600 mt-2', text: addError } }
                ]
              }
            }
          : {
              button: {
                class: 'bg-green-600 text-white px-3 py-1 rounded',
                onclick: () => setState('showAddEntry', true),
                text: 'Add Entry'
              }
            }
      ]
    }
  };
}




// Minimal juris.js app using imported module, explicit state, component registration, and layout


// Main App component
function App() {
  return {
        div: {
            class: 'max-w-lg w-full mx-auto p-6 bg-white rounded shadow',
            children: [
                {
                    h1: {
                        class: 'text-2xl font-bold mb-4 text-gray-800' ,
                        text: 'Experience Ledger'
                    },
                },
                { 
                  LedgerRoot: {}
               }
            ]
        }
    }
}




// Ensure Juris is available on window (assumes juris.js is loaded globally in index.html)
const Juris = window.Juris;
if (!Juris) {
  throw new Error('Juris.js library not found on window. Make sure it is loaded in index.html');
}
const juris = new Juris({
  components: { App, LedgerRoot, LedgerEntries, DBService },
  headlessComponents: {
    DBService: {fn: DBService, options: { autoInit: true }}
  },
  layout: {
    div: {
      class: 'w-full h-full flex items-center justify-center bg-gray-50 min-h-screen',
      children: [
      { App: {} },
      { DBService: {} } // Add DBService to the layout as a headless component
      ]
    }
  },
  states:  {
    entries: [],
    showAddEntries: false,
    addEntryForm: {},
    addEntryError: {},
    selectedLedger: '',
    newCharacterName: ''
  }
});

window.juris = juris;

// juris.registerHeadlessComponent('DBService', DBService, {
//     autoInit: true,
//     customOption: 'value'
//   });

// Render the app into #app
juris.render('#app');
