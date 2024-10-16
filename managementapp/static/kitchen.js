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
                        // Update the order card
                        orderCard.classList.remove(currentStatus);
                        orderCard.classList.add('completed');
                        orderCard.dataset.status = 'completed';

                        // Remove the complete button
                        event.target.remove();

                        // Move the order card to the completed section
                        completedSection.appendChild(orderCard);

                        // Optionally, you can add some visual feedback
                        orderCard.style.animation = 'fadeOut 0.5s';
                        setTimeout(() => {
                            orderCard.style.animation = '';
                        }, 500);
                    } else {
                        console.error('Failed to update order status');
                    }
                } catch (error) {
                    console.error('Error:', error);
                }
            }
        }
    });

    // Navigation functionality
    const navButtons = document.querySelectorAll('.kds-nav .nav-btn');
    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            navButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            const status = button.classList.contains('completed') ? 'completed' : 'in-progress';

            // Redirect to the appropriate path when the button is clicked
            if (status === 'completed') {
                window.location.href = '/kitchen/completed';
            } else if (status === 'in-progress') {
                window.location.href = '/kitchen/in_progress';
            }
        });
    });

    // Initial setup: Move orders to their respective sections
    document.querySelectorAll('.order-card').forEach(card => {
        const status = card.dataset.status;
        if (status === 'in-progress') {
            inProgressSection.appendChild(card);
        } else if (status === 'completed') {
            completedSection.appendChild(card);
        }
    });
});