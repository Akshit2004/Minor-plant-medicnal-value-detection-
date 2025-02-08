import { auth, googleProvider, githubProvider } from './firebase-config.js';
import { signInWithPopup } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-auth.js";

document.addEventListener('DOMContentLoaded', function() {
    // Form validation patterns
    const patterns = {
        email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        password: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/
    };

    // Common auth error messages
    const errorMessages = {
        'auth/email-already-in-use': 'This email is already registered',
        'auth/invalid-email': 'Please enter a valid email address',
        'auth/operation-not-allowed': 'Operation not allowed',
        'auth/weak-password': 'Password should be at least 8 characters',
        'auth/user-not-found': 'No account found with this email',
        'auth/wrong-password': 'Incorrect password'
    };

    function validateField(input, pattern) {
        return pattern.test(input.value);
    }

    function handleAuthError(error, input) {
        const message = errorMessages[error.code] || error.message;
        showError(input, message);
        hideLoading(input.closest('form').querySelector('.btn'));
    }

    const signInForm = document.getElementById('signInForm');
    if (signInForm) {
        signInForm.addEventListener('submit', async function(event) {
            event.preventDefault();
            const email = document.getElementById('email');
            const password = document.getElementById('password');
            const submitBtn = this.querySelector('.btn');
            
            clearError(email);
            clearError(password);

            if (!validateField(email, patterns.email)) {
                showError(email, 'Please enter a valid email');
                return;
            }

            showLoading(submitBtn);
            
            try {
                const userCredential = await signInWithEmailAndPassword(auth, email.value, password.value);
                console.log('Signed in:', userCredential.user);
                localStorage.setItem('user', JSON.stringify(userCredential.user));
                window.location.href = 'dashboard.html';
            } catch (error) {
                handleAuthError(error, email);
            }
        });
    }

    const signUpForm = document.getElementById('signUpForm');
    if (signUpForm) {
        signUpForm.addEventListener('submit', async function(event) {
            event.preventDefault();
            const username = document.getElementById('username');
            const email = document.getElementById('email');
            const password = document.getElementById('password');
            const submitBtn = this.querySelector('.btn');

            clearError(username);
            clearError(email);
            clearError(password);

            if (!username.value.trim()) {
                showError(username, 'Username is required');
                return;
            }

            if (!validateField(email, patterns.email)) {
                showError(email, 'Please enter a valid email');
                return;
            }

            if (!validateField(password, patterns.password)) {
                showError(password, 'Password must be at least 8 characters with letters and numbers');
                return;
            }

            showLoading(submitBtn);

            try {
                const userCredential = await createUserWithEmailAndPassword(auth, email.value, password.value);
                await userCredential.user.updateProfile({
                    displayName: username.value
                });
                console.log('Signed up:', userCredential.user);
                localStorage.setItem('user', JSON.stringify(userCredential.user));
                window.location.href = 'dashboard.html';
            } catch (error) {
                handleAuthError(error, email);
            }
        });

        // Social login handlers
        const socialBtns = document.querySelectorAll('.social-btn');
        socialBtns.forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.preventDefault();
                const provider = btn.classList.contains('google') ? googleProvider : githubProvider;
                
                try {
                    showLoading(btn);
                    const result = await signInWithPopup(auth, provider);
                    console.log('Social sign in successful:', result.user);
                    localStorage.setItem('user', JSON.stringify(result.user));
                    window.location.href = 'dashboard.html';
                } catch (error) {
                    console.error('Social sign in error:', error);
                    alert(errorMessages[error.code] || error.message);
                } finally {
                    hideLoading(btn);
                }
            });
        });
    }

    // Check for existing session
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && window.location.pathname.includes('index.html')) {
        window.location.href = 'dashboard.html';
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