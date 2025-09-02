export default function LedgerHeader(props, ctx) {
  const { getState, setState, DBService, components } = ctx

  const db = DBService
  const newName = () => getState('newCharacterName', '');
  // const characters = () => getState('characters')

  const setSelectedCharacterName = (value) => {
    const coll = document.getElementById('character-select-details')
    if (coll) {
      if (coll.hasAttribute('open')) {
        coll.removeAttribute('open')
      }
    }
    db.getExperienceEntries(value).then( data => {
      setState('selectedCharacterExperienceEntries', data);
      setState('selectedCharacterName', value)
      // setState(('tableData', data))
    })
  }

  return {
   render: () => ( {
      div: {
        class: 'mt-1 mb-3 bg-gray-100 px-4',
        children: [
          {
            div: {
              class: 'mb-4',
              children: [
                {
                  details: {
                    name: 'character-select-details',
                    id: 'character-select-details',
                    className: 'cursor-default',
                    children: [
                      {
                              summary: {
                                className: 'text-xl font-bold text-gray-800 cursor-pointer -ml-2',
                                text: 'Characters'
                              },    
                            },
                      { div: { class: 'font-semibold mb-2 ml-4 mt-3', text: 'Select an existing character' } },
                      {
                        select: {
                          class: 'w-164 mb-2  ml-4 p-2 border rounded cursor-pointer',
                          onchange: (e) => setSelectedCharacterName(e.target.value), // 
                          children: () => {
                            let characters = getState('characters', [])
                            let selectedName = getState('selectedCharacterName', '')
                            let setDefaultAsSelected = true
                            const result = characters.map(characterData => {
                              const isSelected = selectedName.toLowerCase() === characterData.character_name.toLowerCase()
                              if (isSelected) {
                                setDefaultAsSelected = false
                              }
                                return (
                                  {
                                    option: {
                                      value: characterData.character_name,
                                      disabled: false,
                                      selected: isSelected, // isSelected,
                                      text: characterData.character_name
                                    }
                                  }
                                )
                              })

                              return [
                                ...result,
                                {
                                  option: {
                                    value: '',
                                    disabled: true,
                                    selected: setDefaultAsSelected,
                                    text: 'Choose a character...'
                                  }
                                }
                              ]
                          }
                        }
                      },
                      {
                        form: {
                          className: 'flex-col gap-2 w-177  pb-3 ml-4',
                          onsubmit: (e) => {
                            e.preventDefault();
                            setState('createCharacterError', '');

                            const name = getState('newCharacterName', '').trim() //  // newName.trim();
                            
                            if (!name) {
                              return setState('createCharacterError', 'Character name required.');
                            }
                            
                            if (name.length > 50) {
                              return setState('createCharacterError', 'Max 50 chars.');
                            }
                            
                            const characters = getState('characters', null)
                            if (characters) {
                              if (characters.some(l => l.character_name.toLowerCase() === name.toLowerCase())) {
                                return setState('createCharacterError', 'Character name must be unique.')
                              }
                            }
                            
                            const now = new Date().toISOString();
                            
                            const character = { 
                              character_name: name,
                              created_at: now,
                              modified_at: now,
                              total_experience: 0
                            };
                            
                            setState('selectedCharacterName', name)
                            db.addCharacter(character).then(() => {
                              const updatedCharacters = db.loadCharacters()
                            })

                          },
                          children: [
                            { div: { class: 'font-semibold mb-2 flex-auto', text: 'Create a new character' } },

                            { 
                              div: {
                                children: [
                                  {
                                  input: {
                                    name: 'createCharacterBtn',
                                    className: 'flex-auto border p-2 rounded mr-4 w-90 cursor-text',
                                    type: 'text',
                                    placeholder: 'New character name',
                                    value: () => newName,
                                    oninput: e => setState('newCharacterName', e.target.value),
                                    maxlength: 50
                                  }
                                },
                                {
                                  button: {
                                    class: 'bg-blue-600 text-white px-4 py-2 rounded cursor-pointer',
                                    type: 'submit',
                                    text: 'Create'
                                  }
                                }
                              ]
                            }
                          }
                        ]
                        }
                      }
                    ]
                  }
                }
              ]
            }
          }
        ]
      }
    })
   }
  }