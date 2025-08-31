export default function LedgerComponent(props, ctx) {
  const { getState, setState, headless, components } = ctx
  const db = headless.DBService

  console.log('app getCharacters', getState('characters', []))

  const currentCharacterName = () => getState('selectedCharacterName')

  const expEntriesStateKeyFn = () => `experienceEntries:${currentCharacterName}`
  const expEntriesStateKey = expEntriesStateKeyFn()

  // const experienceEntries = getState(expEntriesStateKey)


  // // State
  // const ledgers = () => getState('ledgers', []);
  // const newName = () => getState('newCharacterName', '');
  // const error = () => getState('ledgerError', '');
  // const selected = () => getState('selectedLedger', null);

  // // Always reload ledgers from IndexedDB when not viewing a selected ledger
  // const dbReady = getState('dbReady', false);
  // if (!dbReady) {
  //   db.openDB().then(() => {
  //     setState('dbReady', true);
  //     db.getLedgers().then(dbLedgers => {
  //       setState('ledgers', dbLedgers);
  //     });
  //   });
  // } else if (!selected) {
  //   db.getLedgers().then(dbLedgers => {
  //     // Only update if changed to avoid infinite rerender
  //     const prev = getState('ledgers', []);
  //     if (JSON.stringify(prev) !== JSON.stringify(dbLedgers)) {
  //       setState('ledgers', dbLedgers);
  //     }
  //   });
  // }

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
                        selectedCharacterName: () => getState('selectedCharacterName')
                      }
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
  //  if (!selected) {
  //   return {
  //   render: () => ( {
  //     div: {
  //       class: 'mt-6',
  //       children: [
  //         {
  //           div: {
  //             class: 'mb-4',
  //             children: [
  //               { div: { class: 'font-semibold mb-2', text: 'Select Character Ledger' } },
  //               {
  //                 select: {
  //                   class: 'w-full mb-2 p-2 border rounded',
  //                   onchange: e => setState('selectedLedger', e.target.value),
  //                   children: [
  //                     {
  //                       option: {
  //                         value: '',
  //                         disabled: true,
  //                         selected: true,
  //                         text: 'Choose a character...'
  //                       }
  //                     },
  //                     ...ledgers.map(l => (
  //                       {
  //                         option: { 
  //                           value: l.character_name,
  //                           text: l.character_name
  //                         }
  //                       }
  //                     ))
  //                   ]
  //                 }
  //               }
  //             ]
  //           }
  //         }
  //       ]
  //     }
  //   })
  //  }
  // }
}