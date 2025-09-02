

        // Modal Component
        const Modal = (props, context) => {
            const { setState, getState } = context;
            
            const closeModal = () => {
                setState('ui.modal.isOpen', false);
                setState('ui.modal.type', null);
            };
            
            const handleOverlayClick = (e) => {
                if (e.target === e.currentTarget) {
                    closeModal();
                }
            };
            
            return {
                div: {
                    class: 'modal-overlay',
                    onclick: handleOverlayClick,
                    children: [
                        {
                            div: {
                                class: 'modal-content',
                                onclick: (e) => e.stopPropagation(),
                                children: [
                                    {
                                        div: {
                                            class: 'modal-header',
                                            children: [
                                                {
                                                    h2: {
                                                        class: 'modal-title',
                                                        text: props.title || 'Modal'
                                                    }
                                                },
                                                {
                                                    button: {
                                                        class: 'modal-close',
                                                        text: '×',
                                                        onclick: closeModal
                                                    }
                                                }
                                            ]
                                        }
                                    },
                                    {
                                        div: {
                                            class: 'modal-body',
                                            children: props.children || []
                                        }
                                    },
                                    () => {
                                        if (props.footer) {
                                            return {
                                                div: {
                                                    class: 'modal-footer',
                                                    children: props.footer
                                                }
                                            };
                                        }
                                        return null;
                                    }
                                ]
                            }
                        }
                    ]
                }
            };
        };

        // Route Selection Row Component - Individual row with fine-grained reactivity
        const RouteSelectionRow = (props, context) => {
            const { getState } = context;
            const { rowIndex, row, rowHeight, handleRowClick, handleRowHover } = props;
            
            return {
                div: {
                    class: () => {
                        const selectedRows = getState('ui.routeModal.selectedRows', []);
                        const lastSelectedRow = getState('ui.routeModal.lastSelectedRow', null);
                        const hoveredRow = getState('ui.routeModal.hoveredRow', null);
                        const isCtrlPressed = getState('ui.routeModal.isCtrlPressed', false);
                        
                        let className = 'table-row';
                        if (selectedRows.includes(rowIndex)) className += ' selected';
                        if (rowIndex === lastSelectedRow) className += ' last-selected';
                        if (isCtrlPressed && hoveredRow === rowIndex) className += ' ctrl-hover';
                        return className;
                    },
                    key: `route-row-${rowIndex}`,
                    style: {
                        top: `${rowIndex * rowHeight}px`,
                        height: `${rowHeight}px`,
                        userSelect: 'none'
                    },
                    onclick: (e) => handleRowClick(rowIndex, e),
                    onmouseenter: () => handleRowHover(rowIndex),
                    onmouseleave: () => handleRowHover(null),
                    children: [
                        { RouteTableCell: { columnName: 'id', value: row.id } },
                        { RouteTableCell: { columnName: 'character', value: row.character } },
                        { RouteTableCell: { columnName: 'effective_date', value: row.effective_date } },
                        { RouteTableCell: { columnName: 'experience', value: row.experience } },
                        { RouteTableCell: { columnName: 'category', value: row.category } },
                        { RouteTableCell: { columnName: 'description', value: row.description } }
                    ]
                }
            };
        };
        // // Route Selection Table Component
        const RouteSelectionTable = (props, context) => {
            const { getState, setState, juris } = context;
            
            const ROW_HEIGHT = 42;
            const BUFFER_SIZE = 5;
            const CONTAINER_HEIGHT = 400;
            
            // Set up global key event listeners for Ctrl/Cmd detection
            const setupKeyListeners = () => {
                const handleKeyDown = (e) => {
                    if ((e.ctrlKey || e.metaKey) && !getState('ui.routeModal.isCtrlPressed', false)) {
                        setState('ui.routeModal.isCtrlPressed', true);
                    }
                };
                
                const handleKeyUp = (e) => {
                    if (!e.ctrlKey && !e.metaKey && getState('ui.routeModal.isCtrlPressed', false)) {
                        setState('ui.routeModal.isCtrlPressed', false);
                        setState('ui.routeModal.hoveredRow', null);
                    }
                };
                
                document.addEventListener('keydown', handleKeyDown);
                document.addEventListener('keyup', handleKeyUp);
                
                // Cleanup function
                return () => {
                    document.removeEventListener('keydown', handleKeyDown);
                    document.removeEventListener('keyup', handleKeyUp);
                };
            };
            
            // Initialize key listeners on first render
            let cleanupKeyListeners = null;
            if (!getState('ui.routeModal.keyListenersSetup', false)) {
                cleanupKeyListeners = setupKeyListeners();
                setState('ui.routeModal.keyListenersSetup', true);
            }
            
            const calculateVisibleRange = () => {
                const scrollTop = getState('ui.routeModal.scrollTop', 0);
                const data = getState('routeData', [], false); // Don't track for range calculation
                const start = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - BUFFER_SIZE);
                const end = Math.min(
                    data.length,
                    Math.ceil((scrollTop + CONTAINER_HEIGHT) / ROW_HEIGHT) + BUFFER_SIZE
                );
                return { start, end };
            };
            
            const handleRowHover = (rowIndex) => {
                const isCtrlPressed = getState('ui.routeModal.isCtrlPressed', false);
                if (isCtrlPressed) {
                    setState('ui.routeModal.hoveredRow', rowIndex);
                }
            };
            
            const handleRowClick = (rowIndex, event) => {
                // Use batch execution to prevent multiple re-renders
                juris.executeBatch(() => {
                    const currentSelectedRows = getState('ui.routeModal.selectedRows', []);
                    const lastSelectedRow = getState('ui.routeModal.lastSelectedRow');
                    let newSelectedRows = [];
                    
                    if (event.ctrlKey || event.metaKey) {
                        if (currentSelectedRows.includes(rowIndex)) {
                            newSelectedRows = currentSelectedRows.filter(i => i !== rowIndex);
                        } else {
                            newSelectedRows = [...currentSelectedRows, rowIndex];
                        }
                        setState('ui.routeModal.lastSelectedRow', rowIndex);
                    } else if (event.shiftKey && lastSelectedRow !== null) {
                        const start = Math.min(lastSelectedRow, rowIndex);
                        const end = Math.max(lastSelectedRow, rowIndex);
                        const rangeSet = new Set(currentSelectedRows);
                        for (let i = start; i <= end; i++) {
                            rangeSet.add(i);
                        }
                        newSelectedRows = Array.from(rangeSet);
                    } else {
                        newSelectedRows = [rowIndex];
                        setState('ui.routeModal.lastSelectedRow', rowIndex);
                    }
                    
                    setState('ui.routeModal.selectedRows', newSelectedRows);
                    
                    // Clear hover state after click
                    setState('ui.routeModal.hoveredRow', null);
                });
            };
            
            const selectAll = () => {
                juris.executeBatch(() => {
                    const data = getState('routeData', []);
                    const allRows = [];
                    for (let i = 0; i < data.length; i++) {
                        allRows.push(i);
                    }
                    setState('ui.routeModal.selectedRows', allRows);
                    setState('ui.routeModal.lastSelectedRow', data.length - 1);
                });
            };
            
            const clearSelection = () => {
                juris.executeBatch(() => {
                    setState('ui.routeModal.selectedRows', []);
                    setState('ui.routeModal.lastSelectedRow', null);
                });
            };
            
            return {
                div: {
                    class: 'table-container modal-table-container',
                    children: [
                        // Stats Panel - Only selection count is reactive
                        {
                            div: {
                                class: 'stats-panel',
                                children: [
                                    {
                                        div: {
                                            class: 'stat-item',
                                            children: [
                                                { span: { class: 'stat-label', text: 'Total Entries:' } },
                                                { span: { class: 'stat-value', text: getState('routeData', []).length } }
                                            ]
                                        }
                                    },
                                    {
                                        div: {
                                            class: 'stat-item',
                                            children: [
                                                { span: { class: 'stat-label', text: 'Visible:' } },
                                                { span: { 
                                                    class: 'stat-value', 
                                                    text: () => {
                                                        const range = calculateVisibleRange();
                                                        return `${range.start + 1}-${range.end}`;
                                                    }
                                                }}
                                            ]
                                        }
                                    },
                                    {
                                        div: {
                                            class: 'stat-item selection-stats',
                                            children: [
                                                { span: { class: 'stat-label', text: 'Selected:' } },
                                                { span: { 
                                                    class: 'stat-value', 
                                                    text: () => getState('ui.routeModal.selectedRows', []).length
                                                }}
                                            ]
                                        }
                                    },
                                    {
                                        div: {
                                            class: 'selection-actions',
                                            children: [
                                                {
                                                    button: {
                                                        class: 'selection-btn',
                                                        text: 'Select All',
                                                        onclick: selectAll
                                                    }
                                                },
                                                () => {
                                                    const selectedCount = getState('ui.routeModal.selectedRows', []).length;
                                                    if (selectedCount > 0) {
                                                        return {
                                                            button: {
                                                                class: 'selection-btn clear',
                                                                text: 'Clear',
                                                                onclick: clearSelection
                                                            }
                                                        };
                                                    }
                                                    return null;
                                                }
                                            ]
                                        }
                                    }
                                ]
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
                                                { RouteTableHeaderCell: { label: 'ID', columnName: 'id' } },
                                                { RouteTableHeaderCell: { label: 'Character', columnName: 'character' } },
                                                { RouteTableHeaderCell: { label: 'Effective Date', columnName: 'effective_date' } },
                                                { RouteTableHeaderCell: { label: 'Experience', columnName: 'experience' } },
                                                { RouteTableHeaderCell: { label: 'Category', columnName: 'category' } },
                                                { RouteTableHeaderCell: { label: 'Description', columnName: 'description' } }
                                            ]
                                        }
                                    }
                                ]
                            }
                        },
                        
                        // Virtual Scroll Container
                        {
                            div: {
                                class: 'table-scroll-container',
                                onscroll: (e) => {
                                    setState('ui.routeModal.scrollTop', e.target.scrollTop);
                                },
                                children: [
                                    // Virtual Spacer - Only reactive to data length changes
                                    {
                                        div: {
                                            class: 'virtual-spacer',
                                            style: () => ({
                                                height: `${getState('routeData', []).length * ROW_HEIGHT}px`
                                            })
                                        }
                                    },
                                    
                                    // Virtual Content - Only re-renders on scroll, not selection
                                    {
                                        div: {
                                            class: 'virtual-content',
                                            children: () => {
                                                const range = calculateVisibleRange();
                                                const data = getState('routeData', []);
                                                const visibleData = [];
                                                
                                                // Create individual row components that handle their own selection state
                                                for (let i = range.start; i < range.end; i++) {
                                                    const row = data[i];
                                                    if (!row) continue;
                                                    
                                                    visibleData.push({
                                                        RouteSelectionRow: {
                                                            key: `route-row-${i}`,
                                                            rowIndex: i,
                                                            row: row,
                                                            rowHeight: ROW_HEIGHT,
                                                            handleRowClick: handleRowClick
                                                        }
                                                    });
                                                }
                                                
                                                return visibleData;
                                            }
                                        }
                                    }
                                ]
                            }
                        }
                    ]
                }
            };
        };


        // Column Resizer Component
        const ColumnResizer = (props, context) => {
            const { setState, getState } = context;
            
            return {
                div: {
                    class: 'column-resizer',
                    onmousedown: (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        
                        const startX = e.clientX;
                        const initialWidth = getState(`ui.routTable.columnWidths.${props.columnName}`, 100);
                        
                        setState('ui.routTable.adjusting', true);
                        setState('ui.routTable.adjustingColumn', props.columnName);
                        setState('ui.routTable.adjustingColumnInitial', initialWidth);
                        setState('ui.routTable.lastMouseX', startX);
                        
                        const resizeLine = document.querySelector('.resize-line');
                        if (resizeLine) {
                            resizeLine.classList.add('active');
                            resizeLine.style.left = `${e.clientX}px`;
                        }
                        
                        const handleMouseMove = (e) => {
                            const delta = e.clientX - startX;
                            const newWidth = Math.max(50, initialWidth + delta);
                            setState(`ui.routTable.columnWidths.${props.columnName}`, newWidth);
                            
                            if (resizeLine) {
                                resizeLine.style.left = `${e.clientX}px`;
                            }
                        };
                        
                        const handleMouseUp = () => {
                            setState('ui.routTable.adjusting', false);
                            
                            if (resizeLine) {
                                resizeLine.classList.remove('active');
                            }
                            
                            document.removeEventListener('mousemove', handleMouseMove);
                            document.removeEventListener('mouseup', handleMouseUp);
                        };
                        
                        document.addEventListener('mousemove', handleMouseMove);
                        document.addEventListener('mouseup', handleMouseUp);
                    }
                }
            };
        };

        // Table Cell Component
        const RouteTableCell = (props, context) => {
            const { getState, setState } = context;
            
            return {
                div: {
                    class: 'table-cell',
                    style: () => ({
                        width: `${getState(`ui.routTable.columnWidths.${props.columnName}`, 100)}px`,
                        minWidth: `${getState(`ui.routTable.columnWidths.${props.columnName}`, 100)}px`,
                        maxWidth: `${getState(`ui.routTable.columnWidths.${props.columnName}`, 100)}px`,
                        userSelect: getState('ui.routTable.userSelect', 'none')
                    }),
                    ondoubleclick: (e) => {
                        setState('ui.routTable.userSelect', 'auto');
                        const range = document.createRange();
                        range.selectNodeContents(e.target);
                        window.getSelection().removeAllRanges();
                        window.getSelection().addRange(range);
                    },
                    onclick: () => {
                        setState('ui.routTable.userSelect', 'none');
                    },
                    title: props.value,
                    text: props.value !== undefined && props.value !== null ? String(props.value) : ''
                }
            };
        };

        // Header Cell Component
        const RouteTableHeaderCell = (props, context) => {
            const { getState } = context;
            
            return {
                div: {
                    class: 'header-cell',
                    style: () => ({
                        width: `${getState(`ui.routTable.columnWidths.${props.columnName}`, 100)}px`,
                        minWidth: `${getState(`ui.routTable.columnWidths.${props.columnName}`, 100)}px`,
                        maxWidth: `${getState(`ui.routTable.columnWidths.${props.columnName}`, 100)}px`,
                        position: 'relative'
                    }),
                    children: [
                        { span: { text: props.label } },
                        { ColumnResizer: { columnName: props.columnName } }
                    ]
                }
            };
        };

        
        // Main RouteTable Component
        const RouteTable = (props, context) => {
            const { getState, setState } = context;
            
            const ROW_HEIGHT = 42;
            const BUFFER_SIZE = 5;
            const CONTAINER_HEIGHT = 600;
            
            const calculateVisibleRange = () => {
                const scrollTop = getState('ui.routTable.scrollTop', 0);
                const data = getState('tableData', []);
                const start = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - BUFFER_SIZE);
                const end = Math.min(
                    data.length,
                    Math.ceil((scrollTop + CONTAINER_HEIGHT) / ROW_HEIGHT) + BUFFER_SIZE
                );
                return { start, end };
            };
            
            const handleRowClick = (rowIndex, event) => {
                const currentSelectedRows = getState('ui.routTable.selectedRows', []);
                const lastSelectedRow = getState('ui.routTable.lastSelectedRow');
                let newSelectedRows = [];
                
                if (event.ctrlKey || event.metaKey) {
                    if (currentSelectedRows.includes(rowIndex)) {
                        newSelectedRows = currentSelectedRows.filter(i => i !== rowIndex);
                    } else {
                        newSelectedRows = [...currentSelectedRows, rowIndex];
                    }
                    setState('ui.routTable.lastSelectedRow', rowIndex);
                } else if (event.shiftKey && lastSelectedRow !== null) {
                    const start = Math.min(lastSelectedRow, rowIndex);
                    const end = Math.max(lastSelectedRow, rowIndex);
                    const rangeSet = new Set(currentSelectedRows);
                    for (let i = start; i <= end; i++) {
                        rangeSet.add(i);
                    }
                    newSelectedRows = Array.from(rangeSet);
                } else {
                    newSelectedRows = [rowIndex];
                    setState('ui.routTable.lastSelectedRow', rowIndex);
                }
                
                setState('ui.routTable.selectedRows', newSelectedRows);
            };
            
            const insertRows = () => {
                const selectedRows = getState('ui.routTable.selectedRows', []);
                if (selectedRows.length === 0) return;
                
                const data = getState('tableData', []);
                const newData = [...data];
                const numRowsToInsert = selectedRows.length;
                const insertPosition = Math.max(...selectedRows) + 1;
                
                const newRows = [];
                for (let i = 0; i < numRowsToInsert; i++) {
                    newRows.push(generateNewRow(newData.length + i + 1));
                }
                
                newData.splice(insertPosition, 0, ...newRows);
                
                for (let i = 0; i < newData.length; i++) {
                    newData[i].id = i + 1;
                }
                
                setState('tableData', newData);
                setState('ui.routTable.selectedRows', []);
                setState('ui.routTable.lastSelectedRow', null);
                
                const newSelectedRows = [];
                for (let i = insertPosition; i < insertPosition + numRowsToInsert; i++) {
                    newSelectedRows.push(i);
                }
                setState('ui.routTable.selectedRows', newSelectedRows);
            };
            
            const insertFromRoute = () => {
                setState('ui.modal.isOpen', true);
                setState('ui.modal.type', 'routeSelection');
                setState('ui.routeModal.selectedRows', []);
                setState('ui.routeModal.lastSelectedRow', null);
                setState('ui.routeModal.scrollTop', 0);
            };
            
            const markForDelete = () => {
                const selectedRows = getState('ui.routTable.selectedRows', []);
                if (selectedRows.length === 0) return;
                
                const data = getState('tableData', []);
                const newData = [...data];
                
                selectedRows.forEach(index => {
                    if (newData[index]) {
                        newData[index].markedForDelete = true;
                        newData[index].isNew = false;
                    }
                });
                
                setState('tableData', newData);
                setState('ui.routTable.selectedRows', []);
                setState('ui.routTable.lastSelectedRow', null);
            };
            
            const unmarkForDelete = () => {
                const selectedRows = getState('ui.routTable.selectedRows', []);
                if (selectedRows.length === 0) return;
                
                const data = getState('tableData', []);
                const newData = [...data];
                
                selectedRows.forEach(index => {
                    if (newData[index]) {
                        newData[index].markedForDelete = false;
                    }
                });
                
                setState('tableData', newData);
                setState('ui.routTable.selectedRows', []);
                setState('ui.routTable.lastSelectedRow', null);
            };
            
            const confirmDelete = () => {
                const data = getState('tableData', []);
                const markedCount = data.filter(row => row.markedForDelete).length;
                
                if (markedCount === 0) return;
                
                if (confirm(`Are you sure you want to permanently delete ${markedCount} rows?`)) {
                    const newData = data.filter(row => !row.markedForDelete);
                    
                    for (let i = 0; i < newData.length; i++) {
                        newData[i].id = i + 1;
                    }
                    
                    setState('tableData', newData);
                    setState('ui.routTable.selectedRows', []);
                    setState('ui.routTable.lastSelectedRow', null);
                }
            };
            
            const selectAll = () => {
                const data = getState('tableData', []);
                const allRows = [];
                for (let i = 0; i < data.length; i++) {
                    allRows.push(i);
                }
                setState('ui.routTable.selectedRows', allRows);
                setState('ui.routTable.lastSelectedRow', data.length - 1);
            };
            
            const clearSelection = () => {
                setState('ui.routTable.selectedRows', []);
                setState('ui.routTable.lastSelectedRow', null);
            };
            
            return {
                div: {
                    class: 'table-container',
                    children: [
                        // Stats Panel
                        {
                            div: {
                                class: 'stats-panel',
                                children: [
                                    {
                                        div: {
                                            class: 'stat-item',
                                            children: [
                                                { span: { class: 'stat-label', text: 'Total Rows:' } },
                                                { span: { class: 'stat-value', text: () => getState('tableData', []).length } }
                                            ]
                                        }
                                    },
                                    {
                                        div: {
                                            class: 'stat-item',
                                            children: [
                                                { span: { class: 'stat-label', text: 'Visible:' } },
                                                { span: { 
                                                    class: 'stat-value', 
                                                    text: () => {
                                                        const range = calculateVisibleRange();
                                                        return `${range.start + 1}-${range.end}`;
                                                    }
                                                }}
                                            ]
                                        }
                                    },
                                    {
                                        div: {
                                            class: 'stat-item selection-stats',
                                            children: [
                                                { span: { class: 'stat-label', text: 'Selected:' } },
                                                { span: { 
                                                    class: 'stat-value', 
                                                    text: () => getState('ui.routTable.selectedRows', []).length
                                                }}
                                            ]
                                        }
                                    },
                                    () => {
                                        const data = getState('tableData', []);
                                        const markedCount = data.filter(row => row.markedForDelete).length;
                                        if (markedCount > 0) {
                                            return {
                                                div: {
                                                    class: 'stat-item delete-stats',
                                                    children: [
                                                        { span: { class: 'stat-label', text: 'Marked:' } },
                                                        { span: { class: 'stat-value', text: markedCount } }
                                                    ]
                                                }
                                            };
                                        }
                                        return null;
                                    },
                                    {
                                        div: {
                                            class: 'selection-actions',
                                            children: () => {
                                                const selectedRows = getState('ui.routTable.selectedRows', []);
                                                const data = getState('tableData', []);
                                                const markedCount = data.filter(row => row.markedForDelete).length;
                                                const hasUnmarked = selectedRows.some(i => data[i] && !data[i].markedForDelete);
                                                const hasMarked = selectedRows.some(i => data[i] && data[i].markedForDelete);
                                                
                                                const buttons = [];
                                                
                                                // Insert button
                                                if (selectedRows.length > 0) {
                                                    buttons.push({
                                                        button: {
                                                            class: 'selection-btn insert',
                                                            text: `Insert ${selectedRows.length} Row${selectedRows.length > 1 ? 's' : ''}`,
                                                            onclick: insertRows
                                                        }
                                                    });
                                                }
                                                
                                                // Insert From Route button - NEW!
                                                if (selectedRows.length > 0) {
                                                    buttons.push({
                                                        button: {
                                                            class: 'selection-btn insert-from-route',
                                                            text: 'Insert Experience From Haf Rargetesk',
                                                            onclick: insertFromRoute
                                                        }
                                                    });
                                                }
                                                
                                                // Mark for Delete button
                                                if (selectedRows.length > 0 && hasUnmarked) {
                                                    buttons.push({
                                                        button: {
                                                            class: 'selection-btn delete',
                                                            text: `Mark ${selectedRows.length} for Delete`,
                                                            onclick: markForDelete
                                                        }
                                                    });
                                                }
                                                
                                                // Unmark button
                                                if (selectedRows.length > 0 && hasMarked) {
                                                    buttons.push({
                                                        button: {
                                                            class: 'selection-btn unmark',
                                                            text: `Unmark ${selectedRows.length}`,
                                                            onclick: unmarkForDelete
                                                        }
                                                    });
                                                }
                                                
                                                // Confirm Delete button - Always show if there are marked rows
                                                if (markedCount > 0) {
                                                    buttons.push({
                                                        button: {
                                                            class: 'selection-btn confirm-delete',
                                                            text: `Confirm Delete (${markedCount})`,
                                                            onclick: confirmDelete
                                                        }
                                                    });
                                                }
                                                
                                                // Select All button
                                                buttons.push({
                                                    button: {
                                                        class: 'selection-btn',
                                                        text: 'Select All',
                                                        onclick: selectAll
                                                    }
                                                });
                                                
                                                // Clear button
                                                if (selectedRows.length > 0) {
                                                    buttons.push({
                                                        button: {
                                                            class: 'selection-btn clear',
                                                            text: 'Clear',
                                                            onclick: clearSelection
                                                        }
                                                    });
                                                }
                                                
                                                return buttons;
                                            }
                                        }
                                    }
                                ]
                            }
                        },
                        
                        // Table Header
                        {
                            div: {
                                class: 'table-header',
                                children: [
                                    {
                                        div: {
                                            class: 'header-row',
                                            style: () => ({
                                                userSelect: getState('ui.routTable.userSelect', 'none')
                                            }),
                                            children: [
                                                { RouteTableHeaderCell: { label: 'ID', columnName: 'id' } },
                                                { RouteTableHeaderCell: { label: 'Character', columnName: 'character' } },
                                                { RouteTableHeaderCell: { label: 'Effective Date', columnName: 'effective_date' } },
                                                { RouteTableHeaderCell: { label: 'Experience', columnName: 'experience' } },
                                                { RouteTableHeaderCell: { label: 'Category', columnName: 'category' } },
                                                { RouteTableHeaderCell: { label: 'Description', columnName: 'description' } }
                                            ]
                                        }
                                    }
                                ]
                            }
                        },
                        
                        // Virtual Scroll Container
                        {
                            div: {
                                class: 'table-scroll-container',
                                onscroll: (e) => {
                                    setState('ui.routTable.scrollTop', e.target.scrollTop);
                                },
                                children: [
                                    // Virtual Spacer
                                    {
                                        div: {
                                            class: 'virtual-spacer',
                                            style: () => ({
                                                height: `${getState('tableData', []).length * ROW_HEIGHT}px`
                                            })
                                        }
                                    },
                                    
                                    // Virtual Content
                                    {
                                        div: {
                                            class: 'virtual-content',
                                            children: () => {
                                                const range = calculateVisibleRange();
                                                const visibleData = [];
                                                const selectedRows = getState('ui.routTable.selectedRows', []);
                                                const lastSelectedRow = getState('ui.routTable.lastSelectedRow');
                                                const data = getState('tableData', []);
                                                
                                                for (let i = range.start; i < range.end; i++) {
                                                    const row = data[i];
                                                    if (!row) continue;
                                                    
                                                    const isSelected = selectedRows.includes(i);
                                                    const isLastSelected = i === lastSelectedRow;
                                                    const isNewRow = row.isNew === true;
                                                    const isInsertedFromRoute = row.insertedFromRoute === true;
                                                    const isMarkedDelete = row.markedForDelete === true;
                                                    
                                                    let className = 'table-row';
                                                    if (isSelected) className += ' selected';
                                                    if (isLastSelected) className += ' last-selected';
                                                    if (isNewRow) className += ' new-row';
                                                    if (isInsertedFromRoute) className += ' inserted-from-route';
                                                    if (isMarkedDelete) className += ' marked-delete';
                                                    
                                                    visibleData.push({
                                                        div: {
                                                            class: className,
                                                            key: `row-${i}`,
                                                            style: {
                                                                top: `${i * ROW_HEIGHT}px`,
                                                                height: `${ROW_HEIGHT}px`,
                                                                userSelect: 'none'
                                                            },
                                                            onclick: (e) => handleRowClick(i, e),
                                                            children: [
                                                                { RouteTableCell: { columnName: 'id', value: row.id } },
                                                                { RouteTableCell: { columnName: 'character', value: row.character } },
                                                                { RouteTableCell: { columnName: 'effective_date', value: row.effective_date } },
                                                                { RouteTableCell: { columnName: 'experience', value: row.experience } },
                                                                { RouteTableCell: { columnName: 'category', value: row.category } },
                                                                { RouteTableCell: { columnName: 'description', value: row.description } }
                                                            ]
                                                        }
                                                    });
                                                }
                                                
                                                return visibleData;
                                            }
                                        }
                                    }
                                ]
                            }
                        },
                        
                        // Resize Line
                        { div: { class: 'resize-line' } }
                    ]
                }
            };
        };

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

export {
  Modal,
  RouteSelectionRow,
  RouteSelectionTable,
  ColumnResizer,
  RouteTableCell,
  RouteTableHeaderCell,
  RouteTable,
  handleConfirmInsert
}
        