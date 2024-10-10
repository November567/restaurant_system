document.querySelector('.nav-button').addEventListener('click', function() {
    document.querySelector('.nav-dropdown').classList.toggle('show');
});

document.addEventListener('DOMContentLoaded', function() {
    const navButtons = document.querySelectorAll('.nav-btn');
    const kdsMain = document.querySelector('.kds-main');

    kdsMain.addEventListener('click', function(e) {
        if (e.target.classList.contains('btn-secondary')) {
            const card = e.target.closest('.order-card');
            const orderId = card.querySelector('h2').textContent.replace('Order #', '');
            window.location.href = `view_detail.html?id=${orderId}`;
        }
    }); // link to detail page

    // Navigation functionality
    navButtons.forEach(button => {
        button.addEventListener('click', function() {
            navButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            const status = this.dataset.status;
            filterOrders(status);
        });
    });

    function filterOrders(status) {
        const orderCards = document.querySelectorAll('.order-card');
        orderCards.forEach(card => {
            if (status === 'all' || card.classList.contains(status)) {
                card.style.display = '';
            } else {
                card.style.display = 'none';
            }
        });
    }

    // Order status update
    kdsMain.addEventListener('click', function(e) {
        if (e.target.classList.contains('btn')) {
            const card = e.target.closest('.order-card');
            const orderId = card.querySelector('h2').textContent;
            const action = e.target.textContent.toLowerCase();

            if (action === 'complete') {
                card.classList.remove('in-progress');
                card.classList.add('completed');
                updateOrderStatus(orderId, 'completed');
                e.target.textContent = 'Serve';
                e.target.classList.remove('btn-primary');
                e.target.classList.add('btn-success');
            } else if (action === 'serve') {
                card.remove();
                updateOrderStatus(orderId, 'served');
            }
        }
    });

    function updateOrderStatus(orderId, status) {
        // This function would typically send an update to the server
        console.log(`Order ${orderId} status updated to ${status}`);
    }

    // Menu items for simulation
    const menuItems = [
        { name: "Pad Thai", category: "Main Course" },
        { name: "Green Curry", category: "Main Course" },
        { name: "Tom Yum Soup", category: "Soup" },
        { name: "Mango Sticky Rice", category: "Dessert" },
        { name: "Spring Rolls", category: "Appetizer" },
        { name: "Papaya Salad", category: "Salad" },
        { name: "Coconut Ice Cream", category: "Dessert" }
    ];

    // Simulating new orders
    function simulateOrder() {
        const newOrder = createNewOrder();
        kdsMain.insertAdjacentHTML('afterbegin', newOrder);
    }

    // Initial orders
    for (let i = 0; i < 3; i++) {
        simulateOrder();
    }

    // New order every 30 seconds
    setInterval(simulateOrder, 30000);

    function createNewOrder() {
        const orderId = Math.floor(1000 + Math.random() * 9000);
        const orderItems = generateOrderItems();
        const orderTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        let orderHTML = `
            <div class="order-card in-progress">
                <div class="order-header">
                    <h2>Order #${orderId}</h2>
                    <span class="order-time">${orderTime}</span>
                </div>
                <ul class="order-items">
        `;

        orderItems.forEach(item => {
            orderHTML += `
                <li>
                    <span class="item-name">${item.name}</span>
                    <span class="item-quantity">x${item.quantity}</span>
                </li>
            `;
        });

        orderHTML += `
                </ul>
                <div class="order-actions">
                    <button class="btn btn-primary"><i class="fas fa-check"></i>Complete</button>
                    <button class="btn btn-secondary"><i class="fas fa-eye"></i>View Details</button>
                </div>
            </div>
        `;

        return orderHTML;
    }

    function generateOrderItems() {
        const numberOfItems = Math.floor(Math.random() * 2) + 2; // 2 or 3 items
        const items = [];
        const usedIndexes = new Set();

        while (items.length < numberOfItems) {
            const index = Math.floor(Math.random() * menuItems.length);
            if (!usedIndexes.has(index)) {
                usedIndexes.add(index);
                items.push({
                    name: menuItems[index].name,
                    quantity: Math.floor(Math.random() * 2) + 1 // 1 or 2 quantity
                });
            }
        }

        // Ensure at least one dessert
        if (!items.some(item => menuItems.find(menuItem => menuItem.name === item.name).category === "Dessert")) {
            const desserts = menuItems.filter(item => item.category === "Dessert");
            const dessert = desserts[Math.floor(Math.random() * desserts.length)];
            items.push({
                name: dessert.name,
                quantity: 1
            });
        }

        return items;
    }
})