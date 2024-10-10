// menu-script.js
document.addEventListener('DOMContentLoaded', function() {
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
});