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