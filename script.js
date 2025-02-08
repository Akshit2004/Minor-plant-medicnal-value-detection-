document.addEventListener('DOMContentLoaded', function() {
    const signInForm = document.getElementById('signInForm');
    if (signInForm) {
        signInForm.addEventListener('submit', function(event) {
            event.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            console.log('Sign In:', { email, password });
            // Add your sign-in logic here
        });
    }

    const signUpForm = document.getElementById('signUpForm');
    if (signUpForm) {
        signUpForm.addEventListener('submit', function(event) {
            event.preventDefault();
            const username = document.getElementById('username').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            console.log('Sign Up:', { username, email, password });
            // Add your sign-up logic here
        });
    }
});

// Add to your existing JavaScript
function showLoading(button) {
    button.classList.add('loading');
}

function hideLoading(button) {
    button.classList.remove('loading');
}

function showError(input, message) {
    const errorElement = input.parentElement.querySelector('.error-message');
    errorElement.textContent = message;
    input.classList.add('error');
}

function clearError(input) {
    const errorElement = input.parentElement.querySelector('.error-message');
    errorElement.textContent = '';
    input.classList.remove('error');
}

document.querySelectorAll('input').forEach(input => {
    input.addEventListener('input', () => clearError(input));
});

// Add form validation to your existing submit handlers