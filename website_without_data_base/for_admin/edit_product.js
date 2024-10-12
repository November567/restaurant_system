document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('add-product-form');

    form.addEventListener('submit', function(event) {
        event.preventDefault();
        
        // Get form values
        const name = document.getElementById('product-name').value;
        const price = document.getElementById('product-price').value;
        const category = document.getElementById('product-category').value;
        const description = document.getElementById('product-description').value;
        const image = document.getElementById('product-image').files[0];

        // Here you would typically send this data to your server
        // For now, we'll just log it to the console
        console.log('Product added:', { name, price, category, description, image });

        // Clear the form
        form.reset();

        // Show a success message (you can replace this with a more user-friendly notification)
        alert('Product added successfully!');
    });
});
