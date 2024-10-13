document.addEventListener('DOMContentLoaded', function () {

    const basketBtn = document.querySelector('.basket-button');

    basketBtn.addEventListener('click', function () {
        const orderId = this.getAttribute('data-order-id');  // Retrieve the orderId from data attribute
        navigateToBasket(orderId);  // Call the function with the orderId
    });
    
    function navigateToBasket(orderId) {
        window.location.href = `/payment/order/${orderId}/`;  // Redirect to the payment page
    }

    // Smooth scrolling for navigation links
    document.querySelectorAll('nav a').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            const headerOffset = 170;
            const elementPosition = targetElement.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        });
    });

    // Search functionality
    const searchBar = document.querySelector('.search-bar input');
    const menuItemsList = document.querySelectorAll('.menu-item');

    searchBar.addEventListener('input', function () {
        const searchTerm = this.value.toLowerCase();
        menuItemsList.forEach(item => {
            const itemName = item.querySelector('.menu-item-name').textContent.toLowerCase();
            const itemDescription = item.querySelector('.menu-item-description').textContent.toLowerCase();
            if (itemName.includes(searchTerm) || itemDescription.includes(searchTerm)) {
                item.style.display = '';
            } else {
                item.style.display = 'none';
            }
        });
    });



    // Lazy load images after menu items are added
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const image = entry.target;
                    image.src = image.dataset.src;
                    image.classList.remove('lazy');
                    observer.unobserve(image);
                }
            });
        });

        document.querySelectorAll('img.lazy').forEach(img => {
            imageObserver.observe(img);
        });
    } else {
        // Fallback for browsers that don't support IntersectionObserver
        document.querySelectorAll('img.lazy').forEach(img => {
            img.src = img.dataset.src;
            img.classList.remove('lazy');
        });
    }

    const addButtons = document.querySelectorAll('.add-button');
    addButtons.forEach(button => {
        button.addEventListener('click', function (event) {
            const menuItem = event.target.closest('.menu-item');  // Use 'event' to get the target
            const itemId = menuItem.dataset.itemId;  // Retrieve the item ID from data attribute
            const tableId = menuItem.dataset.tableId;  // Retrieve the table from data attribute
            const itemName = menuItem.querySelector('.menu-item-name').textContent;
            const itemPrice = menuItem.querySelector('.menu-item-price').textContent;

            console.log('Item ID:', itemId);
            console.log('Table ID:', tableId);
            console.log('Item Name:', itemName);
            console.log('Item Price:', itemPrice);

            console.log(`Added to cart: ${itemName} - ${itemPrice}`);

            // Navigate to the add-to-cart route including the table information
            window.location.href = `/order/add/${itemId}/table/${tableId}/`;  // Include table in the URL

            // Visual feedback
            event.target.textContent = '✓';
            event.target.style.backgroundColor = '#4CAF50';
            setTimeout(() => {
                event.target.textContent = '+';
                event.target.style.backgroundColor = '#ff6347';
            }, 1000);
        });
    });



});



