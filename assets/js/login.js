// Split the code into two parts - module imports and DOM manipulation
import { auth, googleProvider, githubProvider } from './firebase-config.js';
import { signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-auth.js";

// DOM content loaded event
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM content loaded');
    
    // Slide functionality - simplified approach
    const slideButtons = document.querySelectorAll('.slide-button');
    const slidesContainer = document.querySelector('.slides');
    
    console.log('Slide buttons found:', slideButtons.length);
    
    // Add click event listeners to slide buttons
    slideButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            console.log('Button clicked');
            e.preventDefault(); // Prevent default behavior
            
            const targetSlide = button.getAttribute('data-target');
            console.log('Target slide:', targetSlide);
            
            // Toggle slide animation by adding/removing class
            if (targetSlide === 'signup') {
                slidesContainer.classList.add('signup-active');
            } else {
                slidesContainer.classList.remove('signup-active');
            }
            
            // Add animation for content elements
            const currentSlide = targetSlide === 'signin' ? 'signup' : 'signin';
            const enteringElements = document.querySelectorAll(`.slide-${targetSlide} .form-group, .slide-${targetSlide} h2, .slide-${targetSlide} .subtitle, .slide-${targetSlide} .btn`);
            
            // Create entrance animation for the new slide's elements
            enteringElements.forEach((el, index) => {
                el.style.opacity = '0';
                el.style.transform = 'translateY(20px)';
                
                setTimeout(() => {
                    el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                    el.style.opacity = '1';
                    el.style.transform = 'translateY(0)';
                }, 300 + (index * 100));
            });
            
            // Reset forms
            if (document.getElementById('signInForm')) {
                document.getElementById('signInForm').reset();
            }
            
            if (document.getElementById('signUpForm')) {
                document.getElementById('signUpForm').reset();
            }
            
            // Clear any error messages
            document.querySelectorAll('.error-message').forEach(el => {
                el.textContent = '';
            });
            
            // Remove error styling
            document.querySelectorAll('input').forEach(input => {
                input.classList.remove('error');
            });
        });
    });
    
    // Simple animation helper function
    function gsapSlideAnimation(targetSlide) {
        const container = document.querySelector(`.slide-${targetSlide} .container`);
        const formSection = container.querySelector('.form-section');
        const imageSection = container.querySelector('.image-section');
        const formElements = formSection.querySelectorAll('h2, .subtitle, .form-group, .btn');
        
        // Apply subtle animations
        fadeInElement(formSection, 0.3);
        
        formElements.forEach((el, index) => {
            fadeInElement(el, 0.3 + (index * 0.1));
        });
        
        fadeInElement(imageSection, 0.3);
    }
    
    // Simple fade-in animation
    function fadeInElement(element, delay) {
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            element.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }, delay * 1000);
    }
    
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

    // Helper functions
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
});