document.addEventListener('DOMContentLoaded', function() {
    const registerForm = document.getElementById('registerForm');

    // Form submission
    registerForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const username = document.getElementById('username').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        // Basic form validation
        if (password !== confirmPassword) {
            alert("Passwords don't match!");
            return;
        }

        // Here you would typically send the data to your server
        // For this example, we'll just log it to the console
        console.log('Registration Data:', { username, email, password });

        // Clear the form
        registerForm.reset();

        // Show success message (you might want to replace this with a more user-friendly notification)
        alert('Registration successful!');

        // Redirect to login page (uncomment this when you have a login page)
        // window.location.href = 'login.html';
    });
});