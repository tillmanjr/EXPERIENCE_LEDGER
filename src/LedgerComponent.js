export default function LedgerComponent(props, ctx) {
  const { getState, setState, headless, components } = ctx
  const db = headless.DBService


  console.log('app getCharacters', getState('characters', []))

  const currentCharacterName = () => getState('selectedCharacterName')

  const expEntriesStateKeyFn = () => `experienceEntries:${currentCharacterName}`
  const expEntriesStateKey = expEntriesStateKeyFn()


  




// Function to open the dialog
function openConfirmationDialog(
    onConfirmationFn,
    onConfirmationArg
) {
  const onConfirmationFunction = onConfirmationFn
  const onConfirmationParam = onConfirmationArg

  const dialog = document.getElementById('confirmationDialog');
  dialog.showModal();
  const cancelButton = document.getElementById('cancelButton');
  cancelButton.addEventListener('click', closeConfirmationDialog);

  const confirmButton = document.getElementById('confirmButton');
  confirmButton.addEventListener('click', () => {
    // Perform the confirmed action here
    if (onConfirmationFunction) {
      onConfirmationFunction(onConfirmationParam)
    }
    console.log('Action confirmed!');
    closeConfirmationDialog();
});

  const backdrop = document.getElementById('backdrop');
  backdrop.classList.remove('hidden');
}

// Function to close the dialog
function closeConfirmationDialog() {
  const dialog = document.getElementById('confirmationDialog');
  dialog.close();
  const cancelButton = document.getElementById('cancelButton');
  cancelButton.removeEventListener('click', closeConfirmationDialog);

  const confirmButton = document.getElementById('confirmButton');
  confirmButton.removeEventListener('click', () => {
    // Perform the confirmed action here
    console.log('Action confirmed!');
    closeConfirmationDialog();
  });
  const backdrop = document.getElementById('backdrop');
  backdrop.classList.add('hidden');
}

/* ========================================================
  begin scrollable table stuff
*/

const generateRows = (history) => {
    return history.map( item => {
        return {
            tr: {
                className: 'h-[20px]',
                children: [
                    {
                        td: {
                            className: 'w-[100px] text-left align-top pr-1 pl-[14px]',         
                            text: () => item.effective_date
                        }
                    },
                    {
                        td: {
                            className: 'w-[50px] text-left align-top pl-3', 
                            text: () => item.experience.toString()
                        }
                    },
                    {
                        td: {
                            className: 'w-[192px] text-left align-top pl-2', 
                            text: () => item.category
                        }
                    },
                    {
                        td: {
                            className: 'w-[550px] text-left align-top pl-4', 
                            text: () => item.description
                        }
                    },
                    {
                        td: {
                            className: 'hidden',
                            text: () => item.id.toString()
                        }
                    }
                ]
            }
        } 
    }) 
}

/* ======================================================== */
  return {
    render: () => (
      {
        div: {
          class: 'mt-2 min-w-250 max-w-250 m-x-2',
          children: () => {
            return [
              {
                div: {
                  class: 'mb-4 min-w-177',
                  children: [
                    { LedgerHeader: {} }
                  ]
                }
              },
            
              {

                 div: {
                        className: 'ml-4 w-[1000px] h-[600px] tableParent table_height',
                        children: [
                            {
                                table: {
                                    className: 'scrollable scrollableTable w-[980px] max-h-[556px]  border-1 border-spacing-[2px] border-gray-500 border-solid border-collapse-separate',
                                    children: [
                                        {
                                            thead: {
                                                className: 'border-collapse border-spacing-0 border-1 border-[#b3b3b3] border-solid rounded-tl-md rounded-tr-md w-[412px]',
                                                children: [
                                                    {
                                                        th: {
                                                            class: 'w-[100px] text-left',
                                                            id: 'first-col',
                                                            text: 'Effective Date'
                                                        }
                                                    },
                                                    {
                                                        th: {
                                                            class: 'w-[50px] text-left pl-2',
                                                            id: 'second-col',
                                                            text: 'Exp.'
                                                        }
                                                    },
                                                    {
                                                        th: {
                                                            class: 'w-[192px] text-left pl-2',
                                                            id: 'third-col',
                                                            text: 'Category'
                                                        }
                                                    },,
                                                    {
                                                        th: {
                                                            class: 'w-[550px] text-left pl-5',
                                                            id: 'third-col',
                                                            text: 'Description'
                                                        }
                                                    },
                                                    {
                                                        th: {
                                                            class: 'w-[20px]',
                                                            id: 'hidden-col'
                                                        }
                                                    }
                                                ]
                                            }
                                        },
                                        {
                                            tbody: {
                                                id:'mtbody',
                                                className: 'overflow-y-scroll overflow-x-hidden w-[410px] pt-1 border-spacing-0 border-1 border-[#b3b3b3] border-t-0 border-solid rounded-bl-md rounded-br-md',
                                                 
                                                // setState('selectedCharacterName', value)
                                                children: () => generateRows(getState('selectedCharacterExperienceEntries'))
                                            }
                                        }
                                    ]
                                }
                            }
                        ]
                    }

                // div: {
                //   class: 'mb-4 min-w-177 max-w-177',
                //   children: [
                //     { ExperienceLedgerEntries: { 
                //         selectedCharacterName: () => getState('selectedCharacterName'),
                //         openConfirmationDialog: openConfirmationDialog
                //       }
                //     },
                //     {
                      
                //     }
                //   ]
                // }
              }
              
              ]
            }
        }
      }
    )
  }
}