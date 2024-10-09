// menu-script.js
document.addEventListener('DOMContentLoaded', function() {

    const socket = new WebSocket('ws://' + window.location.host + '/ws/menu_items/');

    // WebSocket event handlers
    socket.onopen = function() {
        console.log("WebSocket connection established");
    };

    socket.onmessage = function(event) {
        // When the server sends data, parse and update the menu items
        const menuItems = JSON.parse(event.data);
        console.log("Received menu items update: ", menuItems);
        updateMenuItems(menuItems);  // Call a function to render new menu items
    };

    socket.onclose = function() {
        console.log("WebSocket connection closed");
    };

    socket.onerror = function(error) {
        console.error("WebSocket error: ", error);
    };

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
    const menuItems = document.querySelectorAll('.menu-item');

    searchBar.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        menuItems.forEach(item => {
            const itemName = item.querySelector('h3').textContent.toLowerCase();
            const itemDescription = item.querySelector('p').textContent.toLowerCase();
            if (itemName.includes(searchTerm) || itemDescription.includes(searchTerm)) {
                item.style.display = '';
            } else {
                item.style.display = 'none';
            }
        });
    });

    // Add to cart functionality
    const addButtons = document.querySelectorAll('.add-button');
    addButtons.forEach(button => {
        button.addEventListener('click', function() {
            const menuItem = this.closest('.menu-item');
            const itemName = menuItem.querySelector('h3').textContent;
            const itemPrice = menuItem.querySelector('.menu-item-price').textContent;
            
            // You would typically send this to a cart management function
            console.log(`Added to cart: ${itemName} - ${itemPrice}`);
            
            // Provide visual feedback
            this.textContent = '✓';
            this.style.backgroundColor = '#4CAF50';
            setTimeout(() => {
                this.textContent = '+';
                this.style.backgroundColor = '#ff6347';
            }, 1000);
        });
    });

    // Lazy loading images
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
    // Function to update menu items dynamically
    function updateMenuItems(items) {
        const menuList = document.querySelector('#menu-list');
        menuList.innerHTML = ''; // Clear existing menu items

        items.forEach(item => {
            const menuItem = document.createElement('div');
            menuItem.classList.add('menu-item');

            menuItem.innerHTML = `
                <div class="menu-item-image">
                    <img src="${item.image}" alt="${item.name}" />
                </div>
                <div class="menu-item-details">
                    <div class="menu-item-name">${item.name}</div>
                    <div class="menu-item-description">${item.description}</div>
                    <div class="menu-item-price">${item.price} Baht</div>
                </div>
                <button class="add-button">+</button>
            `;

            // Add event listener for the "Add to Cart" button
            menuItem.querySelector('.add-button').addEventListener('click', function() {
                console.log(`Added to cart: ${item.name}`);
                this.textContent = '✓';
                this.style.backgroundColor = '#4CAF50';
                setTimeout(() => {
                    this.textContent = '+';
                    this.style.backgroundColor = '#ff6347';
                }, 1000);
            });

            menuList.appendChild(menuItem);
        });
    }
});