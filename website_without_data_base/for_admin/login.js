document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');

    // Form submission
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const rememberMe = document.getElementById('rememberMe').checked;

        // Here you would typically send the data to your server for authentication
        // For this example, we'll just log it to the console
        console.log('Login Data:', { username, password, rememberMe });

        // Simulate login (replace this with actual authentication logic)
        if (username && password) {
            // Successful login
            alert('Login successful!');
            
            // Redirect to dashboard or home page (update this URL as needed)
            window.location.href = 'menu_management.html';
        } else {
            // Failed login
            alert('Invalid username or password. Please try again.');
        }
    });
});
