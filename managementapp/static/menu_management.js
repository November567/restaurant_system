document.addEventListener('DOMContentLoaded', function () {
    const addProductBtn = document.querySelector('.add-product-btn');
    const searchInput = document.querySelector('.search-bar input');
    const categorySelect = document.querySelector('.category-select');
    const menuItemsList = document.querySelector('#menu-list');
    const loadingIndicator = document.querySelector('.loading-indicator'); // Add a loading indicator in your HTML

    let cachedMenuItems = [];
    const socket = new WebSocket('ws://' + window.location.host + '/ws/menu_items/');

    if (!menuItemsList) {
        console.error("Element with ID 'menu-list' not found in the DOM.");
        return;
    }

    // Show loading state
    function showLoading(isLoading) {
        if (loadingIndicator) {
            loadingIndicator.style.display = isLoading ? 'block' : 'none';
        }
    }

    // Show loading before fetching
    showLoading(true);

    fetch('/api/menu_items/')
        .then(response => response.json())
        .then(data => {
            cachedMenuItems = data;
            renderMenuItems(cachedMenuItems);
            showLoading(false);  // Hide loading once data is rendered
        })
        .catch(error => {
            console.error('Error fetching menu items:', error);
            showLoading(false);  // Hide loading even if there is an error
        });

    // WebSocket event handlers
    socket.onopen = function () {
        console.log("WebSocket connection established");
    };

    socket.onmessage = function (event) {
        const menuItems = JSON.parse(event.data);
        cachedMenuItems = menuItems;
        renderMenuItems(cachedMenuItems);
    };

    socket.onclose = function () {
        console.log("WebSocket connection closed");
    };

    socket.onerror = function (error) {
        console.error("WebSocket error: ", error);
    };

    // Add product button functionality
    if (addProductBtn) {
        addProductBtn.addEventListener('click', function (e) {
            e.preventDefault();
            window.location.href = '/add_product';
        });
    }

    // Search and category filter functionality
    if (searchInput) {
        searchInput.addEventListener('input', filterItems);
    }

    if (categorySelect) {
        categorySelect.addEventListener('change', filterItems);
    }

    function filterItems() {
        const searchTerm = searchInput.value.toLowerCase();
        const selectedCategory = categorySelect.value.toLowerCase();

        const filteredItems = cachedMenuItems.filter(item => {
            const matchesSearch = item.name.toLowerCase().includes(searchTerm);
            const matchesCategory = selectedCategory === '' || item.category.toLowerCase() === selectedCategory;
            return matchesSearch && matchesCategory;
        });

        renderMenuItems(filteredItems);
    }

    // Render menu items in the UI
    function renderMenuItems(items) {
        menuItemsList.innerHTML = '';  // Clear the current list

        items.forEach(item => {
            const itemElement = createMenuItemElement(item);
            menuItemsList.appendChild(itemElement);
        });
    }

    // Create an individual menu item element
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
                        <input type="checkbox" ${item.available ? 'checked' : ''}>
                        <span class="slider"></span>
                    </label>
                    <button class="edit-btn"><i class="fas fa-edit"></i></button>
                    <button class="delete-btn"><i class="fas fa-trash"></i></button>
                </div>
            </div>
        `;

        // Status toggle functionality
        const statusToggle = itemElement.querySelector('.status-toggle input');
        statusToggle.addEventListener('change', function () {
            updateItemStatus(item.id, this.checked);
        });

        // Edit and delete buttons
        const editBtn = itemElement.querySelector('.edit-btn');
        const deleteBtn = itemElement.querySelector('.delete-btn');

        editBtn.addEventListener('click', () => editItem(item.id));
        deleteBtn.addEventListener('click', () => deleteItem(item.id));

        return itemElement;
    }

    // Edit item functionality
    function editItem(itemId) {
        window.location.href = `/edit_menu_item/${itemId}/`;
    }

    // Delete item functionality
    function deleteItem(itemId) {
        if (confirm('Are you sure you want to delete this item?')) {
            fetch(`/api/menu_items/${itemId}/delete/`, {
                method: 'DELETE',
                headers: {
                    'X-CSRFToken': getCookie('csrftoken'),
                },
            })
            .then(response => {
                if (response.ok) {
                    console.log(`Item ${itemId} deleted successfully.`);
                    cachedMenuItems = cachedMenuItems.filter(item => item.id !== itemId);
                    renderMenuItems(cachedMenuItems);
                } else {
                    console.error(`Failed to delete item ${itemId}`);
                }
            })
            .catch(error => {
                console.error('Error deleting item:', error);
            });
        }
    }

    // Get CSRF token from cookies
    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }

    // Update the item status (availability)
    function updateItemStatus(itemId, available) {
        fetch(`/api/menu_items/${itemId}/update/`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken'),
            },
            body: JSON.stringify({ available: available }),
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                console.log(`Item ${itemId} availability updated to ${available}`);
                const itemIndex = cachedMenuItems.findIndex(item => item.id === itemId);
                if (itemIndex !== -1) {
                    cachedMenuItems[itemIndex].available = available;
                    renderMenuItems(cachedMenuItems);
                }
            } else {
                console.error(`Failed to update item ${itemId}: ${data.error}`);
            }
        })
        .catch(error => {
            console.error('Error updating item:', error);
        });
    }

});

document.querySelector('.nav-button').addEventListener('click', function() {
    document.querySelector('.nav-dropdown').classList.toggle('show');
}); // when click dropdown menu button