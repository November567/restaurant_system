document.addEventListener('DOMContentLoaded', function () {
    const sizeOptions = document.querySelectorAll('.size-options input');
    const quantityValue = document.querySelector('.quantity');
    const minusBtn = document.querySelector('.quantity-btn.minus');
    const plusBtn = document.querySelector('.quantity-btn.plus');
    const addToCartBtn = document.querySelector('.add-to-cart');
    const basePriceText = document.querySelector('#total-price').innerText;
    const basePriceFloat = parseFloat(basePriceText.replace(/[^\d.-]/g, '')); // Handle strings like "200.00"
    const basePrice = Math.floor(basePriceFloat);
    const form = addToCartBtn.closest('form'); // Get the form element

    const backBtn = document.querySelector('.back-button');
    backBtn.addEventListener('click', function () {
        const tableId = this.getAttribute('data-table-id');
        const orderId = this.getAttribute('data-order-id');

        if (orderId) {
            backEditOrder(tableId, orderId);
        } else {
            backEdit(tableId);
        }
    });

    function backEdit(tableId) {
        window.location.href = `/table/${tableId}`;  // Redirect to menu list page
    }

    function backEditOrder(tableId, orderId) {
        window.location.href = `/table/${tableId}/order/${orderId}/`;  // Redirect to the menu list page with order ID
    }

    addToCartBtn.addEventListener('click', function () {
        const orderId = this.getAttribute('data-order-id');
        const tableId = this.getAttribute('data-table-id');
        const fromPayment = sessionStorage.getItem('fromPayment');
        console.log(orderId)

        if (fromPayment === 'true') {
            backEditInpayment(orderId);
            sessionStorage.removeItem('fromPayment');
        } else{
            backEdit(tableId);
        } 
    });

    // Size selection
    sizeOptions.forEach(option => {
        option.addEventListener('change', function () {
            const priceChange = parseInt(this.parentElement.querySelector('.price-change').textContent.replace('+', ''));
            updateTotalPrice(priceChange);
        });
    });

    // Quantity adjustment
    minusBtn.addEventListener('click', () => updateQuantity(-1));
    plusBtn.addEventListener('click', () => updateQuantity(1));

    function updateQuantity(change) {
        let currentQuantity = parseInt(quantityValue.textContent);
        currentQuantity = Math.max(1, currentQuantity + change);
        quantityValue.textContent = currentQuantity;
        updateTotalPrice();
    }


    function updateTotalPrice(sizePrice = 0) {
        const quantity = parseInt(quantityValue.textContent);
        const selectedSize = document.querySelector('.size-options input:checked');
        const sizePriceChange = parseInt(selectedSize.parentElement.querySelector('.price-change').textContent.replace('+', ''));
        const totalPrice = (basePrice + sizePriceChange) * quantity;
        addToCartBtn.textContent = `Add to Cart - ${totalPrice} Baht`;
        return totalPrice;
    }

    // Submit the form when the "Add to Cart" button is clicked
    form.addEventListener('submit', function (event) {
        event.preventDefault();

        const size = document.querySelector('.size-options input:checked').value;
        const quantity = parseInt(quantityValue.textContent);
        const note = document.querySelector('textarea').value;
        const fromPayment = sessionStorage.getItem('fromPayment') || 'false';

        console.log(`Submitting form: Size: ${size}, Quantity: ${quantity}, Note: ${note}`);

        addToCartBtn.disabled = true;

        const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;
        const formData = new FormData(form);
        const totalPrice = updateTotalPrice();
        formData.append('size', size);
        formData.append('quantity', quantity);
        formData.append('special_requests', note);
        formData.append('total_price', totalPrice);
        formData.append('from_payment', fromPayment);

        fetch(form.action, {
            method: 'POST',
            body: formData,
            headers: {
                'X-CSRFToken': csrftoken
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                console.log(2)
                window.location.href = data.redirect_url; // Redirect to normal route
            } else {
                console.error('Form submission failed:', data.error);
            }
        })
        .catch(error => {
            console.error('Error:', error);
        })
        .finally(() => {
            setTimeout(() => {
                addToCartBtn.disabled = false;
            }, 2000);
        });
    });

    // Initialize total price
    updateTotalPrice();


});
