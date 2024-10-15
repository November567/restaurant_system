document.addEventListener('DOMContentLoaded', function() {
    const allOrdersBtn = document.querySelector('.nav-btn.all-orders');
    const inProgressBtn = document.querySelector('.nav-btn.in-progress');
    const completedBtn = document.querySelector('.nav-btn.completed');
    const orderGrid = document.querySelector('.order-grid');

    allOrdersBtn.addEventListener('click', () => filterOrders('all'));
    inProgressBtn.addEventListener('click', () => filterOrders('in-progress'));
    completedBtn.addEventListener('click', () => filterOrders('completed'));

    function filterOrders(status) {
        const orderCards = orderGrid.querySelectorAll('.order-card');
        orderCards.forEach(card => {
            if (status === 'all' || card.classList.contains(status)) {
                card.style.display = 'flex';
            } else {
                card.style.display = 'none';
            }
        });

        document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`.nav-btn.${status}`).classList.add('active');
    }

    function completeOrder(orderCard) {
        const orderId = orderCard.dataset.id;
        const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;
    
        fetch('/kitchen_display/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'X-CSRFToken': csrfToken
            },
            body: `order_id=${orderId}&action=complete`
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const contentType = response.headers.get("content-type");
            if (contentType && contentType.indexOf("application/json") !== -1) {
                return response.json();
            } else {
                throw new Error("Received non-JSON response from server");
            }
        })
        .then(data => {
            if (data.success) {
                orderCard.classList.remove('in-progress');
                orderCard.classList.add('completed');
                
                const completeBtn = orderCard.querySelector('.btn-primary');
                completeBtn.textContent = 'Completed';
                completeBtn.disabled = true;
                completeBtn.style.backgroundColor = '#6c757d';
    
                // Move the order card to the completed section
                const completedSection = document.querySelector('.completed-orders');
                if (completedSection) {
                    completedSection.appendChild(orderCard);
                }
            } else {
                console.error('Failed to complete order:', data.error);
                alert(`Failed to complete order: ${data.error}`);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert(`An error occurred: ${error.message}. Please check the console for more details.`);
        });
    }

    function viewOrderDetails(orderCard) {
        const orderId = orderCard.dataset.id;
        console.log('Viewing details for order:', orderId);
    }

    orderGrid.addEventListener('click', function(e) {
        const orderCard = e.target.closest('.order-card');
        if (!orderCard) return;

        if (e.target.classList.contains('btn-primary')) {
            completeOrder(orderCard);
        } else if (e.target.classList.contains('btn-secondary')) {
            viewOrderDetails(orderCard);
        }
    });

    function fetchNewOrders() {
        console.log('Fetching new orders...');
    }

    setInterval(fetchNewOrders, 30000);

    filterOrders('all');
});