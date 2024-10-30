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
const deleteButtons = document.querySelectorAll('.delete-btn');

deleteButtons.forEach(button => {
    button.addEventListener('click', function() {
        const itemId = button.getAttribute('data-id');
        deleteItem(itemId);
    });
});

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
                const itemRow = document.querySelector(`.menu-item[data-id="${itemId}"]`);
                if (itemRow) {
                    itemRow.remove();
                }
            } else {
                console.error(`Failed to delete item ${itemId}`);
            }
        })
        .catch(error => {
            console.error('Error deleting item:', error);
        });
    }
}

function filterItems() {
    const searchInput = document.getElementById('search-input').value.toLowerCase();
    const categorySelect = document.getElementById('category-select').value.toLowerCase();
    const items = document.querySelectorAll('.menu-item');

    items.forEach(item => {
        const itemName = item.cells[0].textContent.toLowerCase();
        const itemCategory = item.getAttribute('data-category').toLowerCase();

        const matchesSearch = itemName.includes(searchInput);
        const matchesCategory = categorySelect === '' || itemCategory === categorySelect;

        item.style.display = matchesSearch && matchesCategory ? '' : 'none';
    });
}

document.getElementById('search-input').addEventListener('input', filterItems);
document.getElementById('category-select').addEventListener('change', filterItems);

document.addEventListener('DOMContentLoaded', function() {
    const addProductBtn = document.querySelector('.add-product-btn');
    if (addProductBtn) {
        addProductBtn.addEventListener('click', function (e) {
            e.preventDefault();
            window.location.href = '/add_product';
        });
    }

    const editButtons = document.querySelectorAll('.edit-btn');
    editButtons.forEach(btn => {
        btn.addEventListener('click', function (e) {
            const itemId = btn.getAttribute('data-id');
            window.location.href = `/edit_product/${itemId}/`;
        });
    });
});