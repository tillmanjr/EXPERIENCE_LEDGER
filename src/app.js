// Import our database service
import { DBService } from './indexedDB.js';
import LedgerComponent from './LedgerComponent.js'
import LedgerHeader from './LedgerHeader.js'
import ExperienceLedgerEntries from './ExperienceLedgerEntries.js'


function AppControl(props, ctx) {
  const { getState, setState, headless, components } = ctx
  return {
    div: {
      children: (() => {
          if (getState('collapseToButton', false)) {
          return [{AppButton: {}}]
          } else {
          return [{App: {}}]
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
          onclick: (e) => {setState('collapseToButton', false)}
        }
      })
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

  // const collapseToButton = () => getState('collapseToButton', false)

 
  // if (collapseToButton() == true ) {
  //   return {
  //     render: () => ({
  //       div: {
  //         className: 'max-w-16 max-h-16 mx-auto bg-gray-100 rounded shadow',
          
  //           text: () => 'help'
          
  //       }
  //     })
  //   }
  // } else {
    return {
      render: () => ({
        div: {
          className: 'min-w-175 mx-auto p-6 bg-white rounded shadow',
          children: [
            {
              button: {
                className: 'max-w-16 max-h-16 mx-0 my-0 bg-gray-100 rounded shadow p-2',
                text: 'hide',
                onclick: (e) => handleHide(e)
              }
            },
            {
              div: {
                className: "text-center",
                children: [
                  {
                    h1: {
                      className: 'text-2xl font-bold mb-4 text-gray-800',
                      text: 'Character experience and treasure'
                    },
                  },
                  { 
                    div: {
                      children: () => {
                        if (currentCharacterName().length > 0) {
                          return [
                            {
                              h1: {
                                className: 'text-2xl font-bold mb-4 text-gray-800',
                                text: () => currentCharacterName() + ' : ' + currentCharacterExp()// `${getState('selectedCharacterName', 'unknownSelectedCharacterName')}`
                              },
                            }
                          ]
                        } else {
                          return [
                            {
                              h1: {
                                className: 'text-2xl font-bold mb-4 text-gray-800',
                                text: () => 'Character not selected'
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
              LedgerComponent: {
              }
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
    LedgerComponent,
    LedgerHeader,
    ExperienceLedgerEntries
  },
  layout: {
    div: {
      class: 'w-full h-full flex items-center justify-center bg-gray-50 min-h-screen',
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

    newCharacterName: '',
    createCharacterError: '',

    selectedCharacterExperienceStateKey: '',
    selectedCharacterExperienceEntries: [],
    selectedCharacterExperienceTotal: 0,
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
    experienceTotals: null,
    selectedCharacterTreasureEntries: [],
    dbReady: false
  }
});

window.juris = juris;
juris.render('#app');
