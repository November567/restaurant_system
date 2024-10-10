document.querySelector('.nav-button').addEventListener('click', function() {
    document.querySelector('.nav-dropdown').classList.toggle('show');
});

document.addEventListener('DOMContentLoaded', function() {
    const addProductBtn = document.querySelector('.add-product-btn');
    const searchInput = document.querySelector('.search-bar input');
    const categorySelect = document.querySelector('.category-select');
    const menuItemsList = document.querySelector('.menu-items-list');

    // Sample data (replace with actual data from your backend)
    const menuItems = [
        { id: 1, name: 'Papaya Salad', category: 'Food', price: '60 Baht', status: true },
        { id: 1, name: 'Papaya Salad hoo', category: 'Food', price: '600 Baht', status: false },
        { id: 2, name: 'Mango Sticky Rice', category: 'Desserts', price: '80 Baht', status: false },
        { id: 3, name: 'Thai Iced Tea', category: 'Drinks', price: '45 Baht', status: true },
    ];

    // Render initial menu items
    renderMenuItems(menuItems);

    // Add product functionality
    addProductBtn.addEventListener('click', function() {
        // This would typically open a modal or navigate to a new page for adding a product
        console.log('Add product clicked');
    });

    // Search functionality
    searchInput.addEventListener('input', filterItems);

    // Category filter functionality
    categorySelect.addEventListener('change', filterItems);

    function filterItems() {
        const searchTerm = searchInput.value.toLowerCase();
        const selectedCategory = categorySelect.value.toLowerCase();

        const filteredItems = menuItems.filter(item => {
            const matchesSearch = item.name.toLowerCase().includes(searchTerm);
            const matchesCategory = selectedCategory === '' || item.category.toLowerCase() === selectedCategory;
            return matchesSearch && matchesCategory;
        });

        renderMenuItems(filteredItems);
    }

    function renderMenuItems(items) {
        menuItemsList.innerHTML = '';
        items.forEach(item => {
            const itemElement = createMenuItemElement(item);
            menuItemsList.appendChild(itemElement);
        });
    }

    function createMenuItemElement(item) {
        const itemElement = document.createElement('div');
        itemElement.classList.add('menu-item');
        itemElement.innerHTML = `
            <div class="menu-item-header">
                <h3 class="menu-item-name">${item.name}</h3>
                <span class="menu-item-price">${item.price}</span>
            </div>
            <div class="menu-item-details">
                <span class="menu-item-category">${item.category}</span>
                <div class="menu-item-actions">
                    <label class="status-toggle">
                        <input type="checkbox" ${item.status ? 'checked' : ''}>
                        <span class="slider"></span>
                    </label>
                    <button class="edit-btn"><i class="fas fa-edit"></i></button>
                    <button class="delete-btn"><i class="fas fa-trash"></i></button>
                </div>
            </div>
        `;

        // Status toggle functionality
        const statusToggle = itemElement.querySelector('.status-toggle input');
        statusToggle.addEventListener('change', function() {
            updateItemStatus(item.id, this.checked);
        });

        // Edit and delete functionality
        const editBtn = itemElement.querySelector('.edit-btn');
        const deleteBtn = itemElement.querySelector('.delete-btn');

        editBtn.addEventListener('click', () => editItem(item.id));
        deleteBtn.addEventListener('click', () => deleteItem(item.id));

        return itemElement;
    }

    function updateItemStatus(itemId, status) {
        // This function would typically send an update to the server
        console.log(`Item ${itemId} status updated to ${status}`);
        // Update the local data
        const item = menuItems.find(item => item.id === itemId);
        if (item) {
            item.status = status;
        }
    }

    function editItem(itemId) {
        // Navigate to the edit product page with the item ID as a query parameter
        window.location.href = `edit_product.html?id=${itemId}`;
    }

    function deleteItem(itemId) {
        if (confirm(`Are you sure you want to delete this item?`)) {
            // This would typically send a delete request to the server
            console.log(`Delete item ${itemId}`);
            // Remove the item from the local data and re-render
            const index = menuItems.findIndex(item => item.id === itemId);
            if (index !== -1) {
                menuItems.splice(index, 1);
                renderMenuItems(menuItems);
            }
        }
    }
});