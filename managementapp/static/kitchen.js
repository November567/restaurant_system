document.addEventListener('DOMContentLoaded', () => {
    const csrfToken = getCookie('csrftoken');
    const inProgressSection = document.querySelector('.in-progress-section');
    const completedSection = document.querySelector('.completed-section');

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

    // Auto-refresh page every 5 seconds
    

    // The rest of your code for handling buttons, navigation, etc.
    document.addEventListener('click', async (event) => {
        if (event.target.classList.contains('complete-order')) {
            const orderCard = event.target.closest('.order-card');
            const orderId = orderCard.dataset.id;
            const currentStatus = orderCard.dataset.status;

            if (currentStatus !== 'completed') {
                try {
                    const response = await fetch(`/api/orders/${orderId}/complete/`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-CSRFToken': csrfToken
                        }
                    });

                    if (response.ok) {
                        orderCard.classList.remove(currentStatus);
                        orderCard.classList.add('completed');
                        orderCard.dataset.status = 'completed';
                        event.target.remove();
                        completedSection.appendChild(orderCard);
                    } else {
                        console.error('Failed to update order status');
                    }
                } catch (error) {
                    console.error('Error:', error);
                }
            }
        }
    });

    document.addEventListener('click', (event) => {
        if (event.target.closest('.view-details')) {
            const button = event.target.closest('.view-details');
            const orderId = button.dataset.id;
            window.location.href = `/get-order-details/${orderId}/`;
        }
    });

    const navButtons = document.querySelectorAll('.kds-nav .nav-btn');
    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            navButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            const status = button.classList.contains('completed') ? 'completed' : 'in-progress';
            if (status === 'completed') {
                window.location.href = '/kitchen/completed';
            } else if (status === 'in-progress') {
                window.location.href = '/kitchen/in_progress';
            }
        });
    });
});

setInterval(() => {
    console.log("Refreshing...");
    window.location.reload();
}, 5000);