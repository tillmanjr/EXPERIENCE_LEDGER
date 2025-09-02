        // Container component for the scrollable table
        const ExperienceTableComponent = (props, context) => {
            const { getState, setState } = context;
            
            const handleConfirmInsert = () => {
                const selectedRouteRows = getState('ui.routeModal.selectedRows', []);
                const routeData = getState('routeData', []);
                const mainSelectedRows = getState('ui.routTable.selectedRows', []);
                const mainData = getState('tableData', []);
                
                if (selectedRouteRows.length === 0 || mainSelectedRows.length === 0) {
                    alert('Please select rows in both tables');
                    return;
                }
                
                // Convert selected route data to main table format
                const routesToInsert = selectedRouteRows.map(index => {
                    const routeRow = routeData[index];
                    return {
                        id: 0, // Will be reassigned
                        character: routeRow.character,
                        effective_date: routeRow.effective_date,
                        experience: routeRow.experience,
                        category: routeRow.category,
                        description: routeRow.description,
                        isNew: false,
                        insertedFromRoute: true, // NEW: Mark as inserted from route
                        markedForDelete: false
                    };
                });
                
                // Insert after the last selected row in main table
                const insertPosition = Math.max(...mainSelectedRows) + 1;
                const newData = [...mainData];
                newData.splice(insertPosition, 0, ...routesToInsert);
                
                // Reassign IDs
                for (let i = 0; i < newData.length; i++) {
                    newData[i].id = i + 1;
                }
                
                setState('tableData', newData);
                
                // Select the newly inserted rows
                const newSelectedRows = [];
                for (let i = insertPosition; i < insertPosition + routesToInsert.length; i++) {
                    newSelectedRows.push(i);
                }
                setState('ui.routTable.selectedRows', newSelectedRows);
                setState('ui.routTable.lastSelectedRow', insertPosition + routesToInsert.length - 1);
                
                // Close modal and reset state
                setState('ui.modal.isOpen', false);
                setState('ui.modal.type', null);
                setState('ui.routeModal.selectedRows', []);
                setState('ui.routeModal.lastSelectedRow', null);
                setState('ui.routeModal.isCtrlPressed', false);
                setState('ui.routeModal.hoveredRow', null);
                setState('ui.routeModal.keyListenersSetup', false);
            };
            
            const handleCancelInsert = () => {
                setState('ui.modal.isOpen', false);
                setState('ui.modal.type', null);
                setState('ui.routeModal.selectedRows', []);
                setState('ui.routeModal.lastSelectedRow', null);
                setState('ui.routeModal.isCtrlPressed', false);
                setState('ui.routeModal.hoveredRow', null);
                setState('ui.routeModal.keyListenersSetup', false);
            };
            
            return {
                div: {
                    children: [
                        { RouteTable: {} },
                        () => {
                            const isModalOpen = getState('ui.modal.isOpen', false);
                            const modalType = getState('ui.modal.type', null);
                            
                            if (isModalOpen && modalType === 'routeSelection') {
                                return {
                                    Modal: {
                                        title: 'Select Experience from Haf Rargetesk',
                                        children: [
                                            { RouteSelectionTable: {} }
                                        ],
                                        footer: [
                                            {
                                                div: {
                                                    class: 'modal-selection-info',
                                                    text: () => {
                                                        const count = getState('ui.routeModal.selectedRows', []).length;
                                                        return count > 0 ? `${count} experiences ${count > 1 ? 's' : ''} selected` : 'No experience selected';
                                                    }
                                                }
                                            },
                                            {
                                                div: {
                                                    class: 'modal-actions',
                                                    children: [
                                                        {
                                                            button: {
                                                                class: 'modal-btn cancel',
                                                                text: 'Cancel',
                                                                onclick: handleCancelInsert
                                                            }
                                                        },
                                                        {
                                                            button: {
                                                                class: () => {
                                                                    const count = getState('ui.routeModal.selectedRows', []).length;
                                                                    return count > 0 ? 'modal-btn confirm' : 'modal-btn confirm';
                                                                },
                                                                disabled: () => getState('ui.routeModal.selectedRows', []).length === 0,
                                                                text: () => {
                                                                    const count = getState('ui.routeModal.selectedRows', []).length;
                                                                    return count > 0 ? `Insert ${count} Operation${count > 1 ? 's' : ''}` : 'Insert Operations';
                                                                },
                                                                onclick: handleConfirmInsert
                                                            }
                                                        }
                                                    ]
                                                }
                                            }
                                        ]
                                    }
                                };
                            }
                            return null;
                        }
                    ]
                }
            };
        };
