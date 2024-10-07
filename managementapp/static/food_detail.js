document.addEventListener('DOMContentLoaded', function() {
    const sizeOptions = document.querySelectorAll('.size-options input');
    const quantityValue = document.querySelector('.quantity');
    const minusBtn = document.querySelector('.quantity-btn.minus');
    const plusBtn = document.querySelector('.quantity-btn.plus');
    const addToCartBtn = document.querySelector('.add-to-cart');
    let basePrice = 60; // This should be dynamically set based on the item

    // Size selection
    sizeOptions.forEach(option => {
        option.addEventListener('change', function() {
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
    }

    // Add to cart
    addToCartBtn.addEventListener('click', function() {
        const size = document.querySelector('.size-options input:checked').value;
        const quantity = parseInt(quantityValue.textContent);
        const note = document.querySelector('textarea').value;
        
        // You would typically send this to a cart management function
        console.log(`Added to cart: Papaya salad - Size: ${size}, Quantity: ${quantity}, Note: ${note}`);
        
        // Provide visual feedback
        const originalText = this.textContent;
        this.textContent = 'Added to Cart!';
        this.disabled = true;
        setTimeout(() => {
            this.textContent = originalText;
            this.disabled = false;
        }, 2000);
    });

    // Initialize total price
    updateTotalPrice();
});