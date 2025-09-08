// Import our database service
import { DBService } from './indexedDB.js';
import CharacterTab from './CharacterTab.js'
import ExperienceTab, {
  ExperienceTableCell,
  ExperienceTableHeaderCell
} from './ExperienceTab.js'
import TreasureTab, {
  TreasureTableCell,
  TreasureTableHeaderCell
} from './TreasureTab.js'

const isValidStr = (value) => {
  return value !== null &&
    value !== undefined &&
    typeof (value) === 'string' &&
    value.length >= 1
}

function AppControl(props, ctx) {
  const { getState, setState, headless, components } = ctx
  return {
    div: {
      children: (() => {
        if (getState('collapseToButton', false)) {
          return [{ AppButton: {} }]
        } else {
          return [{ App: {} }]
        }
      })
    }
  }
}

function AppButton(props, ctx) {
  const { getState, setState, headless, components } = ctx

  return {
    render: () => ({
      div: {
        className: 'max-w-16 max-h-16 mx-0 my-0 bg-gray-100 rounded shadow absolute top-4 left-4 p-2',
        text: () => 'Show',
        onclick: (e) => { setState('collapseToButton', false) }
      }
    })
  }

}

const LedgerTab = (props, ctx) => {
  const { getState } = ctx
  const activeTab = () => getState('activeTab')
  const getTabClass = (idx) => {
    return idx === getState('activeTab')
      ? 'tab-button tab-button-selected'
      : 'tab-button'
  }
  return {

    div: {
      class: 'ledger-tab-component',
      children: [
        {
          div: {
            class: 'tabset',
            children: () => {
              if (isValidStr(getState('selectedCharacterName'))) {
                return [
                  { button: {
                    class: () => getTabClass(0),
                    text: 'Character',
                    onclick: () => { ctx.setState('activeTab', 0) } } },
                  { button: { class: () => getTabClass(1), text: 'Experience', onclick: () => { ctx.setState('activeTab', 1) } } },
                  { button: { class: () => getTabClass(2), text: 'Treasure', onclick: () => { ctx.setState('activeTab', 2) } } },
                ]
              } else {
                return [
                  { button: { class: 'tab-button tab-button-selected', text: 'Character', onclick: () => { ctx.setState('activeTab', 0) } } },
                  { button: { class: 'tab-button tab-button-disabled', text: 'Experience' } },
                  { button: { class: 'tab-button tab-button-disabled', text: 'Treasure', } },
                ]
              }

            }
          }
        },
        {
          div: {
            children: () => {
              const active = ctx.getState('activeTab')
              const contents = [
                { CharacterTab: {} },
                { ExperienceTab: {} },
                { TreasureTab: {} }
              ]
              return contents[active]
            }
          }
        }
      ]
    }
  }
}

// Main App component
function App(props, ctx) {
  const { getState, setState, headless, components } = ctx
  const db = headless.DBService

  console.log('app getCharacters', getState('characters', []))

  let toggleTimer

  const handleHide = (e) => {
    setState('collapseToButton', true)
    console.log("getState('collapseToButton', false)", getState('collapseToButton', false))
  }

  const currentCharacterName = () => getState('selectedCharacterName', 'unknownSelectedCharacterName')

  const currentCharacterExp = () => getState('selectedCharacterExperienceTotal', 0)

  return {
    render: () => ({
      div: {
        className: 'min-w-[1000px] min-h-[724px] mx-auto p-6 bg-gray-100 rounded shadow',
        children: [
          {
            button: {
              className: 'max-w-16 max-h-16 mx-0 my-0 bg-gray-100 rounded shadow p-2',
              text: 'hide',
              onclick: (e) => handleHide(e)
            }
          },

          {
            dialog: {
              id: "confirmationDialog",
              class: "p-6 bg-white rounded-lg shadow-lg",
              children: [
                {
                  h2: {
                    class: "text-xl font-semibold mb-4",
                    text: "Confirm Delete"
                  }
                },
                {
                  p: {
                    class: "mb-6",
                    text: 'Are you sure you want to proceed with this deletion?'
                  }
                },
                {
                  div: {
                    class: "flex justify-end space-x-4",
                    children: [
                      {
                        button: {
                          id: "cancelButton",
                          class: "px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300",
                          text: "Cancel"
                        }
                      },

                      {
                        button: {
                          id: "confirmButton",
                          class: "px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600",
                          text: "Confirm"
                        }

                      }
                    ]
                  }
                }
              ]
            }
          },
          {
            div: {
              id: "backdrop",
              class: "fixed inset-0 bg-black bg-opacity-50 hidden"
            }
          },
          {
            div: {
              children: [
                {
                  div: {
                    class: 'px40px',
                    children: () => {
                      if (currentCharacterName().length > 0) {
                        return [
                          {
                            div: {
                              class: 'header-div-name',
                              children: [
                                {
                                  h1: {
                                    // className: 'text-2xl font-bold mb-4 text-gray-800 -top-5 mx-14',
                                    className: 'text-left text-2xl font-bold px-14',
                                    text: () => currentCharacterName()// `${getState('selectedCharacterName', 'unknownSelectedCharacterName')}`
                                  },
                                },

                                {
                                  div: {
                                    class: 'header-div-name-exp',
                                    children: [
                                      {
                                        h2: {
                                          className: 'text-xl font-bold mb-4 text-gray-800',
                                          text: 'Experience : ' + currentCharacterExp()
                                        }
                                      },
                                      {
                                        div: {
                                          className: 'header-treasure-item header-treasure-item-total',
                                          children: [
                                            { span: { className: 'net-worth', text: 'Total' } },
                                            { span: { className: 'platinum', text: '  10' } },
                                            { span: { text: ', ' } },
                                            { span: { className: 'gold', text: '  36' } },
                                            { span: { text: ', ' } },
                                            { span: { className: 'silver', text: '  22' } },
                                            { span: { text: ', ' } },
                                            { span: { className: 'copper', text: '  6' } },
                                          ]
                                        }
                                      }
                                    ]
                                  },
                                }
                              ]
                            },
                          },
                          {
                            div: {
                              class: 'header-div-treasure',
                              children: [
                                
                                {
                                  div: {
                                    className: 'header-treasure-detail platinum',
                                    text: 'Platinum  10'
                                  }
                                },
                                {
                                  div: {
                                    className: 'header-treasure-detail gold',
                                    text: 'Gold  36'
                                  }
                                },
                                {
                                  div: {
                                    className: 'header-treasure-detail silver',
                                    text: 'Silver  22'
                                  }
                                },
                                {
                                  div: {
                                    className: 'header-treasure-detail copper',
                                    text: 'Copper  6'
                                  }
                                }
                              ]
                            }
                          }
                        ]
                      } else {
                        return [
                          {
                            h1: {
                              class: 'text-2xl font-bold mb-4 text-gray-800 -top-5 mx-14',
                              text: () => 'Select or Create a Character'
                            },
                          }
                        ]
                      }
                    }
                  }
                }
              ]
            }
          },
          {
            LedgerTab: {}
          }
        ]
      }
    })

  }
}

// Ensure Juris is available on window (assumes juris.js is loaded globally in index.html)
const Juris = window.Juris;
if (!Juris) {
  throw new Error('Juris.js library not found on window. Make sure it is loaded in index.html');
}
const juris = new Juris({

  headlessComponents: {
    DBService: { fn: DBService, options: { autoInit: true } }
  },
  components: {
    AppControl,
    AppButton,
    App,
    LedgerTab,
    CharacterTab,
    ExperienceTab,
    ExperienceTableCell,
    ExperienceTableHeaderCell,
    TreasureTab,
    TreasureTableHeaderCell,
    TreasureTableCell
  },
  layout: {
    div: {
      class: 'w-full h-full flex items-center justify-center bg-gray-50',
      children: [
        { AppControl: {} }
      ]
    }
  },
  /*
    character -       characters,          pk character_name
      - experience  - experience_ledgers,  pk character_name   fk character.character_name
      - treasure -    treasure_ledgers,    pk character_name   fk character.character_name
  
  */
  states: {
    collapseToButton: false,
    characters: [],
    charactersLoading: false,
    charactersLoaded: false,
    charactersLoadingError: '',
    selectedCharacterName: '',

    activeTab: 0,

    newCharacterName: '',
    createCharacterError: '',

    selectedCharacterExperienceStateKey: '',
    selectedCharacterExperienceEntries: [],
    selectedCharacterExperienceTotal: 0,
    sortExperienceByDateDesc: true,
    // showExperienceEntryForm: false,
    experienceEntryForm: {
      showForm: false,
      editNew: true
    },
    showIsNewExperienceEntry: true,
    addExperienceEntryError: '',
    addExperienceEntryForm: {
      experience: '',
      category: '',
      description: '',
      effective_date: new Date().toISOString().slice(0, 10)
    },
    editExperienceEntryForm: {
      id: 0,
      character: '',
      experience: '',
      category: '',
      description: '',
      effective_date: ''
    },
    currentEditId: -1,
    experienceTotals: null,
    selectedCharacterTreasureEntries: [],
    dbReady: false,

    ui: {
      expLedgerTable: {
        scrollTop: 0,
        adjusting: false,
        adjustingColumn: null,
        adjustingColumnInitial: 100,
        lastMouseX: 0,
        userSelect: 'none',
        showResizers: true,
        startRange: 0,
        selectedRows: [],
        lastSelectedRow: null,
        columnWidths: {
          id: 48,
          character: 156,
          effective_date: 128,
          experience: 64,
          category: 164,
          description: 668
        }
      },
      treasureTable: {
        scrollTop: 0,
        adjusting: false,
        adjustingColumn: null,
        adjustingColumnInitial: 100,
        lastMouseX: 0,
        userSelect: 'none',
        showResizers: true,
        startRange: 0,
        selectedRows: [],
        lastSelectedRow: null,
        columnWidths: {
          id: 48,
          effective_date: 128,
          platinum: 64,  // #D9D9D9
          gold: 64,  // #EFBF04
          silver: 64,  // #C4C4C4
          copper: 64,  //#C68346
          category: 164,
          description: 668
        },
        columnColors: {
          id: '#000000',
          effective_date: '#000000',
          platinum: '#D9D9D9',
          gold: '#EFBF04',
          silver: '#C4C4C4',
          copper: '#C68346',
          category: '#000000',
          description: '#000000'
        }
      },
      modal: {
        isOpen: false,
        type: null
      }
    }
  }
});

window.juris = juris;
juris.render('#app');
