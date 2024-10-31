document.addEventListener('DOMContentLoaded', function () {

    const basketBtn = document.querySelector('.basket-button');
    if (basketBtn) {
        basketBtn.addEventListener('click', function () {
            const orderId = this.getAttribute('data-order-id');
            console.log('Order ID:', orderId);
            if (orderId) {
                navigateToBasket(orderId);
            } else {
                console.error('No order ID found');
            }
        });
    }

    function navigateToBasket(orderId) {
        window.location.href = `/payment/order/${orderId}/`;
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
            const menuItem = event.target.closest('.menu-item'); 
            const itemId = menuItem.dataset.itemId;  
            const tableId = menuItem.dataset.tableId;  

            const currentPath = window.location.pathname;
            let orderId = null;

            const match = currentPath.match(/\/order\/(\d+)\//);
            if (match) {
                orderId = match[1];  
            }

            let url;
            if (orderId) {
                url = `/table/${tableId}/menu_item/${itemId}/order/${orderId}/`;
            } else {
                url = `/table/${tableId}/menu_item/${itemId}/`;
            }

            window.location.href = url;
        });
    });



});


