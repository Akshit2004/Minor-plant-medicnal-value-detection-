/**
 * Plant Medicine Detection Login System
 * Handles login/signup toggle functionality and form validation
 */

document.addEventListener('DOMContentLoaded', function() {
    // ===== DOM ELEMENTS =====
    const sign_in_btn = document.querySelector("#sign-in-btn");
    const sign_up_btn = document.querySelector("#sign-up-btn");
    const container = document.querySelector(".container");
    const signInForm = document.querySelector(".sign-in-form");
    const signUpForm = document.querySelector(".sign-up-form");
    const loadingOverlay = document.querySelector(".loading-overlay");
    
    // Handle page loading sequence - immediately start showing content
    // Show content immediately when DOM is loaded
    document.body.classList.add('page-loaded');
    
    // Hide loading overlay as soon as window is loaded
    window.addEventListener('load', function() {
        loadingOverlay.classList.add('hidden');
    });
    
    // If the page takes too long to load, still hide the spinner after 1.5s
    setTimeout(function() {
        document.body.classList.add('page-loaded');
        loadingOverlay.classList.add('hidden');
    }, 1500);

    // ===== TOGGLE FUNCTIONALITY =====
    /**
     * Switch between sign-in and sign-up modes
     */
    sign_up_btn.addEventListener("click", () => {
        container.classList.add("sign-up-mode");
    });

    sign_in_btn.addEventListener("click", () => {
        container.classList.remove("sign-up-mode");
    });

    // ===== FORM VALIDATION =====
    /**
     * Validate form inputs before submission
     * @param {HTMLFormElement} form - The form to validate
     * @returns {boolean} - Whether the form is valid
     */
    function validateForm(form) {
        let isValid = true;
        const inputs = form.querySelectorAll('input[required]');
        
        inputs.forEach(input => {
            if (!input.value.trim()) {
                isValid = false;
                showError(input, 'This field is required');
            } else {
                clearError(input);
                
                // Email validation for signup form
                if (input.type === 'email' && !validateEmail(input.value)) {
                    isValid = false;
                    showError(input, 'Please enter a valid email');
                }
                
                // Password validation (at least 6 characters)
                if (input.type === 'password' && input.value.length < 6) {
                    isValid = false;
                    showError(input, 'Password must be at least 6 characters');
                }
            }
        });
        
        return isValid;
    }
    
    /**
     * Validate email format using regex
     * @param {string} email - Email to validate
     * @returns {boolean} - Whether email is valid
     */
    function validateEmail(email) {
        const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    }
    
    /**
     * Show error message for an input field
     * @param {HTMLElement} input - The input with error
     * @param {string} message - Error message to display
     */
    function showError(input, message) {
        const parent = input.parentElement;
        const errorDiv = document.createElement('div');
        
        // Remove existing error message if any
        const existingError = parent.querySelector('.error-message');
        if (existingError) {
            parent.removeChild(existingError);
        }
        
        // Add error class to input field
        parent.classList.add('error');
        
        // Create and append error message
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        errorDiv.style.color = 'red';
        errorDiv.style.fontSize = '12px';
        errorDiv.style.marginTop = '5px';
        parent.appendChild(errorDiv);
    }
    
    /**
     * Clear error message from an input field
     * @param {HTMLElement} input - The input to clear errors from
     */
    function clearError(input) {
        const parent = input.parentElement;
        const existingError = parent.querySelector('.error-message');
        
        if (existingError) {
            parent.removeChild(existingError);
        }
        
        parent.classList.remove('error');
    }

    // ===== FORM SUBMISSION HANDLERS =====
    /**
     * Handle sign in form submission
     */
    signInForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (validateForm(this)) {
            // Here you would typically send the data to a server
            console.log('Sign in form submitted successfully');
            
            // You can redirect the user or show a success message
            alert('Sign in successful!');
        }
    });
    
    /**
     * Handle sign up form submission
     */
    signUpForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (validateForm(this)) {
            // Here you would typically send the data to a server
            console.log('Sign up form submitted successfully');
            
            // You can redirect the user or show a success message
            alert('Sign up successful!');
        }
    });
});
