/**
 * Plant Medicine Detection Login System
 * Firebase Authentication Implementation
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

    // ===== FIREBASE AUTH STATE LISTENER =====
    firebase.auth().onAuthStateChanged(user => {
        if (user) {
            // User is signed in
            console.log('User is signed in:', user.email);
            // Redirect to main app page or update UI
            // window.location.href = 'dashboard.html'; // Uncomment when dashboard is ready
        } else {
            // User is signed out
            console.log('No user is signed in');
        }
    });

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
     * Handle sign in form submission using Firebase
     */
    signInForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (validateForm(this)) {
            const email = this.querySelector('input[type="text"]').value;
            const password = this.querySelector('input[type="password"]').value;
            
            // Show loading indicator
            loadingOverlay.classList.remove('hidden');
            
            // Sign in with Firebase
            firebase.auth().signInWithEmailAndPassword(email, password)
                .then((userCredential) => {
                    // Signed in
                    const user = userCredential.user;
                    console.log('User signed in:', user.email);
                    // Success message or redirect
                })
                .catch((error) => {
                    const errorCode = error.code;
                    const errorMessage = error.message;
                    console.error('Sign in error:', errorCode, errorMessage);
                    
                    // Show error based on Firebase error code
                    if (errorCode === 'auth/wrong-password' || errorCode === 'auth/user-not-found') {
                        alert('Invalid email or password');
                    } else {
                        alert(`Error: ${errorMessage}`);
                    }
                })
                .finally(() => {
                    // Hide loading indicator
                    loadingOverlay.classList.add('hidden');
                });
        }
    });
    
    /**
     * Handle sign up form submission using Firebase
     */
    signUpForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (validateForm(this)) {
            const username = this.querySelector('input[type="text"]').value;
            const email = this.querySelector('input[type="email"]').value;
            const password = this.querySelector('input[type="password"]').value;
            
            // Show loading indicator
            loadingOverlay.classList.remove('hidden');
            
            // Create user with Firebase
            firebase.auth().createUserWithEmailAndPassword(email, password)
                .then((userCredential) => {
                    // Signed up
                    const user = userCredential.user;
                    console.log('User created:', user.email);
                    
                    // Update profile with username
                    return user.updateProfile({
                        displayName: username
                    }).then(() => {
                        // Save additional user data to Firestore
                        return firebase.firestore().collection('users').doc(user.uid).set({
                            username: username,
                            email: email,
                            createdAt: new Date()
                        });
                    });
                })
                .then(() => {
                    alert('Account created successfully!');
                    // Redirect or update UI
                })
                .catch((error) => {
                    const errorCode = error.code;
                    const errorMessage = error.message;
                    console.error('Sign up error:', errorCode, errorMessage);
                    
                    // Show error based on Firebase error code
                    if (errorCode === 'auth/email-already-in-use') {
                        alert('This email is already in use');
                    } else {
                        alert(`Error: ${errorMessage}`);
                    }
                })
                .finally(() => {
                    // Hide loading indicator
                    loadingOverlay.classList.add('hidden');
                });
        }
    });
    
    // ===== SOCIAL SIGN IN =====
    /**
     * Sign in with Google using Firebase
     */
    document.getElementById('google-login').addEventListener('click', function(e) {
        e.preventDefault();
        signInWithProvider(new firebase.auth.GoogleAuthProvider());
    });

    document.getElementById('google-signup').addEventListener('click', function(e) {
        e.preventDefault();
        signInWithProvider(new firebase.auth.GoogleAuthProvider());
    });

    /**
     * Sign in with GitHub using Firebase
     */
    document.getElementById('github-login').addEventListener('click', function(e) {
        e.preventDefault();
        signInWithProvider(new firebase.auth.GithubAuthProvider());
    });

    document.getElementById('github-signup').addEventListener('click', function(e) {
        e.preventDefault();
        signInWithProvider(new firebase.auth.GithubAuthProvider());
    });

    /**
     * Generic function to handle provider sign in
     * @param {firebase.auth.AuthProvider} provider - The auth provider to use
     */
    function signInWithProvider(provider) {
        // Show loading indicator
        loadingOverlay.classList.remove('hidden');
        
        firebase.auth().signInWithPopup(provider)
            .then((result) => {
                console.log(`${provider.providerId} sign in successful`);
                const user = result.user;
                
                // Create or update user in Firestore
                return firebase.firestore().collection('users').doc(user.uid).set({
                    displayName: user.displayName,
                    email: user.email,
                    photoURL: user.photoURL,
                    lastLogin: new Date(),
                    provider: provider.providerId
                }, { merge: true });
            })
            .then(() => {
                // Redirect or update UI
            })
            .catch((error) => {
                console.error(`${provider.providerId} sign in error:`, error);
                alert(`${provider.providerId} sign in failed. ${error.message}`);
            })
            .finally(() => {
                // Hide loading indicator
                loadingOverlay.classList.add('hidden');
            });
    }
});
