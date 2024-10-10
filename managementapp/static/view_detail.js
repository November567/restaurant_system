document.addEventListener('DOMContentLoaded', function() {
    const orderId = getOrderIdFromUrl();
    loadOrderDetails(orderId);

    document.querySelector('.nav-button').addEventListener('click', function(event) {
        event.stopPropagation();
        this.classList.toggle('active');
        document.querySelector('.nav-dropdown').classList.toggle('show');
    });

    // Close the dropdown when clicking outside
    document.addEventListener('click', function(event) {
        const navButton = document.querySelector('.nav-button');
        const navDropdown = document.querySelector('.nav-dropdown');
        if (!navButton.contains(event.target) && !navDropdown.contains(event.target)) {
            navButton.classList.remove('active');
            navDropdown.classList.remove('show');
        }
    });

    document.getElementById('completeOrderBtn').addEventListener('click', function() {
        completeOrder(orderId);
    });

    document.getElementById('cancelOrderBtn').addEventListener('click', function() {
        cancelOrder(orderId);
    });
});

function getOrderIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
}

function loadOrderDetails(orderId) {
    // In a real application, this would be an API call
    // For this example, we'll use mock data
    const orderDetails = {
        id: orderId,
        status: 'In Progress',
        time: '14:30',
        items: [
            { 
                name: 'Papaya Salad', 
                quantity: 2, 
                price: 120, 
                size: 'M', 
                note: 'Extra spicy'
            },
            { 
                name: 'Pad Thai', 
                quantity: 1, 
                price: 100, 
                size: 'L', 
                note: 'No peanuts'
            },
            { 
                name: 'Thai Iced Tea', 
                quantity: 3, 
                price: 135, 
                size: 'S', 
                note: 'Less sugar'
            }
        ],
        total: 355
    };

    document.getElementById('orderId').textContent = orderDetails.id;
    document.getElementById('orderStatus').textContent = orderDetails.status;
    document.getElementById('orderTime').textContent = orderDetails.time;

    const itemsList = document.getElementById('itemsList');
    itemsList.innerHTML = '';
    orderDetails.items.forEach(item => {
        const li = document.createElement('li');
        li.innerHTML = `
            <div class="item-details">
                <div class="item-main">
                    <span class="item-name">${item.name} (${item.size}) x${item.quantity}</span>
                    <span class="item-price">฿${item.price}</span>
                </div>
                <div class="item-description">${item.note}</div>
            </div>
        `;
        itemsList.appendChild(li);
    });

    document.getElementById('orderTotal').textContent = orderDetails.total;
}

function completeOrder(orderId) {
    // In a real application, this would be an API call
    console.log(`Completing order ${orderId}`);
    alert(`Order ${orderId} has been completed.`);
    // After completing the order, you might want to redirect back to the kitchen display
    // window.location.href = 'kitchen.html';
}

function cancelOrder(orderId) {
    // In a real application, this would be an API call
    console.log(`Cancelling order ${orderId}`);
    if (confirm(`Are you sure you want to cancel order ${orderId}?`)) {
        alert(`Order ${orderId} has been cancelled.`);
        // After cancelling the order, you might want to redirect back to the kitchen display
        // window.location.href = 'kitchen.html';
    }
}