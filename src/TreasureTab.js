export const TreasureTableCell = (props, context) => {
  const { getState } = context;

}

export const TreasureTableHeaderCell = (props, context) => {
  const { getState } = context;
  const onClickHandler = props.doOnClick;

  return {
    div: {
      class: 'header-cell',
      style: () => ({
        width: `${getState(`ui.treasureTable.columnWidths.${props.columnName}`, 100)}px`,
        minWidth: `${getState(`ui.treasureTable.columnWidths.${props.columnName}`, 100)}px`,
        maxWidth: `${getState(`ui.treasureTable
                          .columnWidths.${props.columnName}`, 100)}px`,
        height: '48px',
        position: 'relative',
        color:  `${getState(`ui.treasureTable.columnColors.${props.columnName}`, '#000000')}`
      }),
      children: () => {
        if (props.hidden) {
          return [
            { ColumnResizer: { columnName: props.columnName } }
          ]
        } else {
          return [
            {
              span: {
                text: props.label
              }
            },
            { ColumnResizer: { columnName: props.columnName } }
          ]
          // if (isDefined(onClickHandler)) {
          //   return [
          //     {
          //       span: {
          //         class: 'cursor-pointer',
          //         text: props.label,
          //         onclick: onClickHandler
          //       }
          //     },
          //     { ColumnResizer: { columnName: props.columnName } }
          //   ]
          // } else {
          //   return [
          //     {
          //       span: {
          //         text: props.label
          //       }
          //     },
          //     { ColumnResizer: { columnName: props.columnName } }
          //   ]
          // }

        }
      }
    }
  }
}

export default function TreasureTab(props, ctx) {
  const { getState, setState, DBService, components } = ctx

  const db = DBService

    const ROW_HEIGHT = 48;
  const BUFFER_SIZE = 5;
  const CONTAINER_HEIGHT = 556;

  const calculateVisibleRange = () => {
    const scrollTop = getState('ui.expLedgerTable.scrollTop', 0);
    const data = getState('selectedCharacterExperienceEntries', [], false); // Don't track for range calculation
    const start = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - BUFFER_SIZE);
    const end = Math.min(
      data.length,
      Math.ceil((scrollTop + CONTAINER_HEIGHT) / ROW_HEIGHT) + BUFFER_SIZE
    );
    return { start, end };
  };

  const toggleSortByDateOrder = () => {
    setState('sortExperienceByDateDesc', !getState('sortExperienceByDateDesc'))
    const setDesc = getState('sortExperienceByDateDesc')

    setState('selectedCharacterExperienceEntries',
      getState('selectedCharacterExperienceEntries').toSorted((a, b) => setDesc
        ? new Date(b.effective_date) - new Date(a.effective_date)
        : new Date(a.effective_date) - new Date(b.effective_date)
      ))
  }

 return {
    render: () => ({
      div: {
        class: 'mt-2 min-w-250 max-w-250 m-x-2',
        children: () => {
          return [
            {

              div: {
                className: 'ml-4 w-[1000px] h-[600px] tableParent table_height ledger-tab-component-content',
                children: [
                  {
                    div: {
                      class: 'table-container modal-table-container',
                      children: [
                        // Stats Panel - Only selection count is reactive
                        {
                          div: {
                            class: 'block',
                          }
                        },
                        // Table Header - Static, no reactivity needed
                        {
                          div: {
                            class: 'table-header',
                            children: [
                              {
                                div: {
                                  class: 'header-row',
                                  children: [
                                    { TreasureTableHeaderCell: { label: 'ID', columnName: 'id', hidden: true, 'doOnClick': null } },
                                    //                        { ExperienceTableHeaderCell: { label: 'Character', columnName: 'character', hidden: false, 'doOnClick': null } },
                                    { TreasureTableHeaderCell: { label: 'Pt', columnName: 'platinum', hidden: false, 'doOnClick': null } },
                                    { TreasureTableHeaderCell: { label: 'Au', columnName: 'gold', hidden: false, 'doOnClick': null } },
                                    { TreasureTableHeaderCell: { label: 'Ag', columnName: 'silver', hidden: false, 'doOnClick': null } },
                                    { TreasureTableHeaderCell: { label: 'Cu', columnName: 'copper', hidden: false, 'doOnClick': null } },
                                    { TreasureTableHeaderCell: { label: 'Effective Date', columnName: 'effective_date', hidden: false, 'doOnClick': null } },// 'doOnClick': toggleSortByDateOrder } },
                                    { TreasureTableHeaderCell: { label: 'Category', columnName: 'category', hidden: false, 'doOnClick': null } },
                                    { TreasureTableHeaderCell: { label: 'Description', columnName: 'description', hidden: false, 'doOnClick': null } }
                                  ]
                                }
                              }
                            ]
                          },
                        },
                        {
                          div: {
                            class: 'table-scroll-container',
                            onscroll: (e) => {
                              setState('ui.expLedgerTable.scrollTop', e.target.scrollTop);
                            },
                            children: [
                              // Virtual Spacer - Only reactive to data length changes
                              {
                                div: {
                                  class: 'virtual-spacer',
                                  style: () => ({
                                    height: `${getState('selectedCharacterExperienceEntries', []).length * ROW_HEIGHT}px`
                                  })
                                }
                              },

                              // Virtual Content - Only re-renders on scroll, not selection
                              // {
                              //   div: {
                              //     class: 'virtual-content',
                              //     children: () => {
                              //       const range = calculateVisibleRange();

                              //       const data = getState('selectedCharacterExperienceEntries', []);

                              //       const visibleData = [];

                              //       // Create individual row components that handle their own selection state
                              //       for (let i = range.start; i < range.end; i++) {
                              //         const row = data[i];
                              //         if (!row) continue;

                              //         let className = 'table-row';
                              //         visibleData.push({
                              //           div: {
                              //             class: className,
                              //             'data-id': row.id,
                              //             'data-character': row.character,
                              //             'data-effective_data': row.effective_date,
                              //             'data-experience': row.experience,
                              //             'data-category': row.category,
                              //             'data-description': row.description,
                              //             key: `row-${i}`,
                              //             style: {
                              //               top: `${i * ROW_HEIGHT}px`,
                              //               height: `${ROW_HEIGHT}px`,
                              //               userSelect: 'none'
                              //             },

                              //             children: [
                              //               { ExperienceTableCell: { columnName: 'id', value: row.id, hidden: true } },
                              //               //                                { ExperienceTableCell: { columnName: 'character', value: row.character, hidden: false } },
                              //               { ExperienceTableCell: { columnName: 'effective_date', value: row.effective_date, hidden: false } },
                              //               { ExperienceTableCell: { columnName: 'experience', value: row.experience, hidden: false } },
                              //               { ExperienceTableCell: { columnName: 'category', value: row.category, hidden: false } },
                              //               { ExperienceTableCell: { columnName: 'description', value: row.description, hidden: false } }
                              //             ]
                              //           }
                              //         })
                              //       }

                              //       return visibleData;
                              //     }
                              //   }
                              // }

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
    })
  }
}
