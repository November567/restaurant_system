document.addEventListener('DOMContentLoaded', function() {
    const quantityElements = document.querySelectorAll('.quantity');
    const minusBtns = document.querySelectorAll('.quantity-btn.minus');
    const plusBtns = document.querySelectorAll('.quantity-btn.plus');
    const totalAmount = document.querySelector('.total-amount');
    const placeOrderBtn = document.querySelector('.place-order-btn');
    const paymentOptions = document.querySelectorAll('.payment-option input[type="radio"]');
    
    // Quantity adjustment
    function updateQuantity(index, change) {
        let currentQuantity = parseInt(quantityElements[index].textContent);
        currentQuantity = Math.max(1, currentQuantity + change);
        quantityElements[index].textContent = currentQuantity;
        updateTotalPrice();
    }

    minusBtns.forEach((btn, index) => {
        btn.addEventListener('click', () => updateQuantity(index, -1));
    });

    plusBtns.forEach((btn, index) => {
        btn.addEventListener('click', () => updateQuantity(index, 1));
    });

    function updateTotalPrice() {
        let total = 0;
        document.querySelectorAll('.order-item').forEach(item => {
            const price = parseInt(item.querySelector('.item-price').textContent);
            const quantity = parseInt(item.querySelector('.quantity').textContent);
            total += price * quantity;
        });
        totalAmount.textContent = `${total} ฿`;
    }

    // Payment method selection
    paymentOptions.forEach(option => {
        option.addEventListener('change', function() {
            paymentOptions.forEach(opt => opt.parentElement.classList.remove('selected'));
            this.parentElement.classList.add('selected');
        });
    });

    // Place order
    placeOrderBtn.addEventListener('click', function() {
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

    // Initialize total price
    updateTotalPrice();
});