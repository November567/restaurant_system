document.addEventListener('DOMContentLoaded', function () {
    const totalAmount = document.querySelector('.total-amount');
    const placeOrderBtn = document.querySelector('.place-order-btn');
    const paymentOptions = document.querySelectorAll('.payment-option input[type="radio"]');

    let total = 0;
    document.querySelectorAll('.order-item').forEach(item => {
        const price = parseInt(item.querySelector('.item-price').textContent);
        total += price;
    });
    totalAmount.textContent = `${total} ฿`;
    

    // Payment method selection
    paymentOptions.forEach(option => {
        option.addEventListener('change', function () {
            paymentOptions.forEach(opt => opt.parentElement.classList.remove('selected'));
            this.parentElement.classList.add('selected');
        });
    });

    // Place order
    placeOrderBtn.addEventListener('click', function () {
        const selectedPayment = document.querySelector('.payment-option input[type="radio"]:checked');
        if (!selectedPayment) {
            alert('Please select a payment method');
            return;
        }

        const orderItems = Array.from(document.querySelectorAll('.order-item')).map(item => ({
            name: item.querySelector('h2').textContent,
            quantity: item.querySelector('.quantity').textContent,
            price: item.querySelector('.item-price').textContent
        }));

        const orderDetails = {
            items: orderItems,
            total: totalAmount.textContent,
            paymentMethod: selectedPayment.parentElement.querySelector('label').textContent.trim()
        };

        // You would typically send this to a server to process the order
        console.log('Order placed:', orderDetails);

        // Simulating order placement
        this.textContent = 'Processing...';
        this.disabled = true;
        setTimeout(() => {
            alert('Order placed successfully!');
            this.textContent = 'Place Order';
            this.disabled = false;
            // Here you would typically redirect to an order confirmation page
        }, 2000);
    });

    const editLinks = document.querySelectorAll('.edit-link');
    editLinks.forEach(link => {
        link.addEventListener('click', function (event) {
            event.preventDefault();  // Prevent the default link behavior

            const orderId = this.getAttribute('data-order-id');
            const itemId = this.getAttribute('data-item-id');
            const tableId = this.getAttribute('data-table-id'); 
            const orderItemId = this.getAttribute('data-order-item-id'); 

            sessionStorage.setItem('fromPayment', 'true');

            if (orderId && itemId && tableId && orderItemId) {
                const url = `/table/${tableId}/menu_item/${itemId}/order/${orderId}/order_id/${orderItemId}/`;
                window.location.href = url; 
            } else {
                console.error("Missing required data attributes (order_id, item_id, table_id, order_item_id).");
            }
        });
    });
});