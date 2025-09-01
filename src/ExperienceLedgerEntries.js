// LedgerEntries component for managing entries for a character
export default function ExperienceLedgerEntries(props, ctx) {
  const {
    getState,
    setState,
    DBService,
    components
  } = ctx

  const db = DBService;
  const openConfirmationDialog = props.openConfirmationDialog
  
  // if (!name) {
  //   return ''
  // }
  





  // State
  // const character = () => getState('selectedCharacterName')
  const showExperienceEntryForm = getState('experienceEntryForm.showForm', false);
  const addExperienceEntryError = getState('addExperienceEntryError', '');
  const editExperienceEntryForm = getState('editExperienceEntryForm', {
      id: 0,
      character: '',
      experience: '',
      category: '',
      description: '',
      effective_date: ''
  })
  const form = getState('addExperienceEntryForm', {
    experience: '',
    category: '',
    description: '',
    effective_date: new Date().toISOString().slice(0, 10)
  });

  function handleAddExperience(e) {
    e.preventDefault();
    setState('addExperienceEntryError', '');
    const form = getState('addExperienceEntryForm')
    const exp = parseInt(form.experience, 10);
    if (isNaN(exp)) return setState('addExperienceEntryError', 'Experience must be a number.');
    if (!form.category.trim()) return setState('addExperienceEntryError', 'Category required.');
    if (!form.description.trim()) return setState('addExperienceEntryError', 'Description required.');
    const character = getState('selectedCharacterName')
    const entry = {
      character,
      experience: exp,
      category: form.category.trim(),
      description: form.description.trim(),
      effective_date: form.effective_date
    };
    db.addExperienceEntry(entry).then(id => {
      setState(`experienceEntriesLoaded:${character}`, false); // force reload
      setState('experienceEntryForm.showForm', false);
      setState('addExperienceEntryForm', {
        experience: '',
        category: null,
        description: null,
        effective_date: new Date().toISOString().slice(0, 10)
      });
      db.getExperienceEntries(character)
        .then( data => setState('selectedCharacterExperienceEntries', data))
    }).catch(err => setState('addExperienceEntryError', 'Failed to save experience entry.'));
  }

  function deleteExperienceEntry(id) {
    db.deleteExperienceEntry(id)
      .then( _ => {
        const character = getState('selectedCharacterName')
        db.getExperienceEntries(character)
          .then(data => setState('selectedCharacterExperienceEntries', data))
      })
  }

  function handleUpdateExperienceEntry(formData) {
    const id = formData.id
    db.updateExperienceEntry(id, formData)
      .then(result => {
         const character = getState('selectedCharacterName')
          db.getExperienceEntries(character)
            .then(data => {
              setState('currentEditId', -1)
              setState('experienceEntryForm.showForm', false)
              setState('selectedCharacterExperienceEntries', data)
            })
      })
  }

  function editExpEntry(event, id) {
    console.log('edit request for :  ', id)
    console.log('edit request target.parentElement.parentElement.parentElement :  ', event.target.parentElement.parentElement.parentElement)
    
    const editDivElement = event.target.parentElement.parentElement.parentElement
    const editDivElementParent = editDivElement.parentElement

    console.log('parent walking')
    console.dir(editDivElement)
    console.dir(editDivElementParent)

    DBService.getExperienceEntry(id) 
      .then(dbResults => {
        if (dbResults.length >= 1) {
          const dbData = dbResults[0]
          const formData =  {
            id, id,
            character: dbData.character,
            experience: dbData.experience,
            category: dbData.category,
            description: dbData.description,
            effective_date: dbData.effective_date
          }
          setState('currentEditId', id)
          setState('editExperienceEntryForm', {...formData})
          const dlgProps = {
            showForm: true,
            editNew: false
          }
          setState('experienceEntryForm', dlgProps)
          console.dir(getState('experienceEntryForm'))
          console.log("next entry: getState('editExperienceEntryForm')")
          console.dir(getState('editExperienceEntryForm'))
        }
      })
    
  }

  return {
    
    render: () => ({
    div: {
      class: 'min-w-178',
      children: () => {
        if (!getState('selectedCharacterName')) {
          return [
          ]
        }


        const experienceEntriesResult = () => getState('selectedCharacterExperienceEntries')
        const experienceEntries = typeof(experienceEntriesResult) === 'function'
          ? experienceEntriesResult()
          : experienceEntriesResult
        console.log('experienceEntries', JSON.stringify(experienceEntries))
        const currentEditId = getState('currentEditId')

        let result = [
        ]

        if (experienceEntries.length === 0) {
          result = result.concat([{ div: { class: 'text-gray-400', text: 'No entries yet.' } }])
        }

        if (experienceEntries.length !== 0) {
          result = result.concat([
            {
              table: {
                className: 'mb-1',
                children: experienceEntries.map(e => (
                  {
                    tr: {
                      className: () => currentEditId === e.id ? 'pl-5 bg-gray-50 border rounded h-[102px] bg-yellow-50' :'pl-5 bg-gray-50 border rounded h-[102px]',
                      id: `experience_row_${e.id}`,
                      children: [
                        {
                          td: {
                            className: 'w-[1280px] mb-2 pl-4',
                            children: [
                               {
                                  div: {
                                      className: 'block rounded w-164 mr-2 h-[32px]',
                                      children: [
                                        {
                                          div: {
                                            className: 'inline-block w-[128px] mr-2',
                                            text: `${e.effective_date}`
                                          }
                                        },
                                        {
                                          div: {
                                            className: 'inline-block w-16 mr-2',
                                            text: `${e.experience}`
                                          }
                                        },
                                        {
                                          div: {
                                          className: 'inline-block w-48 mr-2',
                                            text: `${e.category}`
                                          }
                                        },
                                        {
                                          div: {
                                            className: 'inline-block w-60 mr-1',
                                            children: [
                                              {
                                                button: {
                                                  class: 'bg-white-600 border border-gray-700 text-gray-700  px-2 py-1 rounded mr-2 ml-30',
                                                  text: 'Edit',
                                                  onclick: (event) => editExpEntry(event, e.id)
                                                }
                                              },
                                              {
                                                button: {
                                                  class: 'bg-white-600 border border-red-700 text-red-700 px-2 py-1 rounded',
                                                  text: 'Delete',
                                                  onclick: (event) => {
                                                    openConfirmationDialog(
                                                      deleteExperienceEntry,
                                                      e.id
                                                    )
                                                  }
                                                }
                                              },
                                            ]
                                          }
                                        }
                                      ]
                                  },
                               },
                               
                              {
                                div: {
                                  className: 'block rounded w-167 mr-2',
                                  text: `${e.description}`
                                }
                              }
                            ]
                          }
                        }
                      ]
                    }
                  }
                ))
              }
            }
          ])
        }
        if (getState('experienceEntryForm.showForm', false) != true) {
          const propData = {
            showForm: true,
            editNew: true
          }
          result = result.concat(
            [
              {
                button: {
                  class: 'bg-green-600 text-white px-3 py-1 rounded',
                  // onclick: () => setState('experienceEntryForm.showForm', true),
                   onclick: () => setState('experienceEntryForm', propData),
                  text: 'Add Experience'
                }
              }
            ]
          )
        } 
        if (getState('experienceEntryForm.showForm', false) != false) {
          const isNew = getState('experienceEntryForm.editNew', false) != false
          console.log('isNew :: ', isNew)
          result = result.concat([
            {
              form: {
                class: isNew ? 'bg-gray-50 border rounded p-3 mb-2': 'bg-yellow-50 border rounded p-3 mb-2',
                onsubmit: handleAddExperience,
                children: () => {
                  if (isNew) {
                    return [
                      {div: {
                        className: 'mb-2',
                        children: [
                      {
                        input: {
                          class: 'border p-1 rounded w-32 mr-2',
                          type: 'date',
                          id: "effectiveDateInput",
                          //tabIndex: 0,
                          oninput: e => setState('addExperienceEntryForm', { ...(getState("addExperienceEntryForm")), effective_date: e.target.value })
                        }
                      },
                      {
                        input: {
                          className: 'border p-1 rounded w-16 mr-2',
                          type: 'number',
                          placeholder: 'XP',
                          id: "experienceInput",
                          min: "-10000",
                          max: "10000",
                          //tabIndex: 1,
                          oninput: e => setState('addExperienceEntryForm', { ...(getState("addExperienceEntryForm")), experience: e.target.value })
                        }
                      },
                      {
                        input: {
                          className: 'border p-1 rounded w-48 mr-2',
                          type: 'text',
                          placeholder: 'Category  (16 char max)',
                          id: "categoryInput",
                          maxLength: "16",
                          //tabIndex: 2,
                          oninput: e => setState('addExperienceEntryForm', { ...(getState("addExperienceEntryForm")), category: e.target.value })
                        }
                      },
                         {
                        button: {
                          class: 'bg-blue-600 text-white px-3 py-1 rounded ml-36',
                          type: 'submit',
                          text: 'Save',
                          //tabIndex: 4
                        }
                      },
                      {
                        button: {
                          class: 'ml-2 text-gray-600 underline',
                          type: 'button',
                          onclick: () => setState('experienceEntryForm.showForm', false),
                          text: 'Cancel',
                          //tabIndex: 5
                        }
                      },

                      ]
                      }},

                      {
                        input: {
                          class: 'border p-1 rounded w-167 mr-2',
                          type: 'text',
                          placeholder: 'Description (128 char max)',
                          id: "descriptionInput",
                          maxLength: "128",
                          //tabIndex: 3,
                          oninput: e => setState('addExperienceEntryForm', { ...(getState("addExperienceEntryForm")), description: e.target.value })
                        }
                      },
                      
                     
                      addExperienceEntryError && { div: { class: 'text-red-600 mt-2', text: addExperienceEntryError } }
                    ]
                  } else {
                    const editFormFn = () => getState('editExperienceEntryForm')
                    const editForm = editFormFn()
                    return [ {div: {
                        className: 'mb-2',
                        children: [
                      
                          {
                            input: {
                              class: 'border p-1 rounded w-32 mr-2 bg-white',
                              type: 'date',
                              id: "effectiveDateInput",
                              value: editForm.effective_date,
                              //tabIndex: 0,
                              oninput: e => editForm.effective_date =e.target.value
                              // oninput: e => setState('editExperienceEntryForm', { ...(getState("editExperienceEntryForm")), effective_date: e.target.value })
                            }
                          },
                          {
                            input: {
                            className: 'border p-1 rounded w-16 mr-2 bg-white',
                              type: 'number',
                              min: "-10000",
                              max: "10000",
                              placeholder: 'XP',
                              id: "experienceInput",
                              value: editForm.experience,
                              //tabIndex: 1,
                              
                              oninput: e => editForm.experience =e.target.value
                              //oninput: e => setState('editExperienceEntryForm', { ...(getState("editExperienceEntryForm")), experience: e.target.value })
                            }
                          },
                          {
                            input: {
                              className: 'border p-1 rounded w-48 mr-2 bg-white',
                              type: 'text',
                              placeholder: 'Category  (16 char max)',
                              id: "categoryInput",
                              value: editForm.category,
                              maxLength: "16",
                              //tabIndex: 2,
                              oninput: e => editForm.category =e.target.value
                              //oninput: e => setState('editExperienceEntryForm', { ...(getState("editExperienceEntryForm")), category: e.target.value })
                            }
                          },
                          ,
                         {
                        button: {
                          class: 'bg-blue-600 text-white px-3 py-1 rounded ml-36',
                          // type: 'submit',
                          text: 'Save',
                          //tabIndex: 4,
                          onclick: () => {
                           const stateEditForm =getState("editExperienceEntryForm") 
                            
                            Object.assign(stateEditForm, editForm)
                            handleUpdateExperienceEntry(getState("editExperienceEntryForm"))
                          }
                        }
                      },
                      {
                        button: {
                          class: 'ml-2 text-gray-600 underline',
                          type: 'button',
                          onclick: () => {
                            setState('currentEditId', -1)
                            setState('experienceEntryForm.showForm', false)
                          },
                          text: 'Cancel',
                          //tabIndex: 5
                        }
                      },

                      ]
                      }},

                      {
                        input: {
                          class: 'border p-1 rounded w-167 mr-2 bg-white',
                          type: 'text',
                          placeholder: 'Description (128 char max)',
                          id: "descriptionInput",
                          value: editForm.description,
                          maxLength: "128",
                          //tabIndex: 3,
                          oninput: e => editForm.description =e.target.value
                          // oninput: e => setState('editExperienceEntryForm', { ...(getState("editExperienceEntryForm")), description: e.target.value })
                        }
                      },
                      addExperienceEntryError && { div: { class: 'text-red-600 mt-2', text: addExperienceEntryError } }
                    ]
                  }
                }
              }
            }
          ]
        )

        

      return result
        }

        return result
      }
    }
  })
  }
}