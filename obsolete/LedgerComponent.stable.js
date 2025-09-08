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

  return {
    render: () => (
      {
        div: {
          class: 'mt-2 min-w-178 max-w-178 m-x-2',
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
                  class: 'mb-4 min-w-177 max-w-177',
                  children: [
                    { ExperienceLedgerEntries: { 
                        selectedCharacterName: () => getState('selectedCharacterName'),
                        openConfirmationDialog: openConfirmationDialog
                      }
                    },
                    {
                      
                    }
                  ]
                }
              }
              
              ]
            }
        }
      }
    )
  }
}