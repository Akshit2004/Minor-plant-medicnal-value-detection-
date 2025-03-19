document.addEventListener('DOMContentLoaded', function() {
    // Initialize Firebase
    const firebaseConfig = {
        // Your Firebase config here
        apiKey: "YOUR_API_KEY",
        authDomain: "YOUR_AUTH_DOMAIN",
        projectId: "YOUR_PROJECT_ID",
        storageBucket: "YOUR_STORAGE_BUCKET",
        messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
        appId: "YOUR_APP_ID"
    };
    
    // Initialize Firebase
    firebase.initializeApp(firebaseConfig);
    
    // Initialize Firestore
    const db = firebase.firestore();
    
    // Get current user
    const getCurrentUser = () => {
        return new Promise((resolve, reject) => {
            const unsubscribe = firebase.auth().onAuthStateChanged(user => {
                unsubscribe();
                resolve(user);
            }, reject);
        });
    };
    
    // Essential DOM Elements
    const uploadArea = document.getElementById('upload-area');
    const fileInput = document.getElementById('file-input');
    const previewImg = document.getElementById('preview-img');
    const uploadPreview = document.getElementById('upload-preview');
    const uploadPlaceholder = document.querySelector('.upload-placeholder');
    const analyzeBtn = document.getElementById('analyze-btn');
    const resetBtn = document.getElementById('reset-btn');
    const resultsContainer = document.getElementById('results-container');
    const loadingOverlay = document.getElementById('loading-overlay');
    
    // Section navigation
    const navLinks = document.querySelectorAll('[data-section]');
    const sections = document.querySelectorAll('.app-section');
    
    // Initialize core functionality
    initSections();
    initAppearanceSettings();
    initSettingsTabs();
    loadUserPreferences();
    fetchUserProfile(); // Fetch user profile data from Firestore
    
    // Add event listeners
    uploadArea.addEventListener('click', () => fileInput.click());
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('dragleave', handleDragLeave);
    uploadArea.addEventListener('drop', handleDrop);
    fileInput.addEventListener('change', handleFileSelect);
    analyzeBtn.addEventListener('click', analyzePlant);
    resetBtn.addEventListener('click', resetUpload);

    // Initialize sections and navigation with smooth transitions
    function initSections() {
        // Set up navigation links with smooth transitions
        navLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const targetSectionId = this.getAttribute('data-section');
                
                // Add a visual feedback for click
                this.classList.add('nav-click-effect');
                setTimeout(() => {
                    this.classList.remove('nav-click-effect');
                }, 300);
                
                // Smooth transition to the new section
                showSectionWithTransition(targetSectionId);
                
                // Update active state in navigation
                navLinks.forEach(link => link.parentElement.classList.remove('active'));
                this.parentElement.classList.add('active');
            });
        });
        
        // Set default active section
        showSection('detect-section');
        
        // Connect "Start Identifying Plants" button in history section
        const goToDetectBtn = document.getElementById('go-to-detect');
        if (goToDetectBtn) {
            goToDetectBtn.addEventListener('click', function() {
                showSectionWithTransition('detect-section');
                navLinks.forEach(link => link.parentElement.classList.remove('active'));
                document.querySelector('[data-section="detect-section"]').parentElement.classList.add('active');
            });
        }
    }
    
    // Initialize settings tabs
    function initSettingsTabs() {
        const settingsNavItems = document.querySelectorAll('.settings-nav-item');
        
        settingsNavItems.forEach(item => {
            item.addEventListener('click', function(e) {
                e.preventDefault();
                
                // Update active state
                settingsNavItems.forEach(i => i.classList.remove('active'));
                this.classList.add('active');
                
                // Get target panel
                const targetId = this.getAttribute('data-settings-target');
                const panels = document.querySelectorAll('.settings-panel');
                
                // Smooth transition between panels
                panels.forEach(panel => {
                    if (panel.id === targetId) {
                        panel.style.opacity = '0';
                        panel.classList.add('active');
                        setTimeout(() => {
                            panel.style.opacity = '1';
                        }, 50);
                    } else {
                        panel.style.opacity = '0';
                        setTimeout(() => {
                            panel.classList.remove('active');
                        }, 300);
                    }
                });
            });
        });
    }
    
    // Enhanced section transition
    function showSectionWithTransition(sectionId) {
        // First fade out all sections
        sections.forEach(section => {
            if (section.classList.contains('active')) {
                section.style.opacity = '0';
                section.style.transform = 'translateY(20px)';
            }
        });
        
        // Wait for fade out to complete
        setTimeout(() => {
            // Update active status
            sections.forEach(section => {
                if (section.id === sectionId) {
                    section.classList.add('active');
                    section.style.display = 'block';
                    
                    // Force reflow to ensure transition works
                    section.offsetHeight;
                    
                    // Fade in new section
                    setTimeout(() => {
                        section.style.opacity = '1';
                        section.style.transform = 'translateY(0)';
                    }, 50);
                } else {
                    section.classList.remove('active');
                    setTimeout(() => {
                        if (!section.classList.contains('active')) {
                            section.style.display = 'none';
                        }
                    }, 300);
                }
            });
        }, 300);
    }
    
    // Simple section change (no animation)
    function showSection(sectionId) {
        sections.forEach(section => {
            if (section.id === sectionId) {
                section.classList.add('active');
                section.style.opacity = '1';
                section.style.transform = 'translateY(0)';
                section.style.display = 'block';
            } else {
                section.classList.remove('active');
                section.style.display = 'none';
            }
        });
    }

    // Initialize appearance settings
    function initAppearanceSettings() {
        // Theme options
        const themeOptions = document.querySelectorAll('.theme-option');
        themeOptions.forEach(option => {
            option.addEventListener('click', function() {
                const themeClass = this.querySelector('.theme-preview').classList[1];
                themeOptions.forEach(o => o.classList.remove('active'));
                this.classList.add('active');
                
                applyTheme(themeClass);
                saveUserPreference('theme', themeClass);
            });
        });
        
        // Color accent options
        const colorOptions = document.querySelectorAll('.color-option');
        colorOptions.forEach(option => {
            option.addEventListener('click', function() {
                colorOptions.forEach(o => o.classList.remove('active'));
                this.classList.add('active');
                
                const accentColor = this.style.getPropertyValue('--accent-color');
                applyAccentColor(accentColor);
                saveUserPreference('accentColor', accentColor);
            });
        });
        
        // Font size
        const fontSizeRange = document.getElementById('font-size-range');
        if (fontSizeRange) {
            fontSizeRange.addEventListener('input', function() {
                const fontSize = this.value;
                applyFontSize(fontSize);
                saveUserPreference('fontSize', fontSize);
            });
        }
        
        // Setup form submission handlers
        const appearanceForm = document.getElementById('appearance-form');
        if (appearanceForm) {
            appearanceForm.addEventListener('submit', function(e) {
                e.preventDefault();
                showNotification('Appearance settings saved!', 'success');
            });
        }
        
        // Cancel buttons
        const cancelButtons = document.querySelectorAll('.settings-panel .btn-outline-secondary');
        cancelButtons.forEach(button => {
            button.addEventListener('click', function() {
                loadUserPreferences();
                showNotification('Changes discarded', 'info');
            });
        });
        
        // Add other form handlers
        const securityForm = document.getElementById('security-form');
        if (securityForm) {
            securityForm.addEventListener('submit', function(e) {
                e.preventDefault();
                showNotification('Security settings updated successfully!', 'success');
            });
        }
        
        const notificationForm = document.getElementById('notification-form');
        if (notificationForm) {
            notificationForm.addEventListener('submit', function(e) {
                e.preventDefault();
                showNotification('Notification preferences saved!', 'success');
            });
        }
        
        const supportForm = document.getElementById('support-form');
        if (supportForm) {
            supportForm.addEventListener('submit', function(e) {
                e.preventDefault();
                showNotification('Your support request has been submitted!', 'success');
                this.reset();
            });
        }
    }
    
    // Apply theme
    function applyTheme(theme) {
        const body = document.body;
        
        // Remove any existing theme classes
        body.classList.remove('theme-light', 'theme-dark', 'theme-system');
        
        // Handle system preference
        if (theme === 'system-theme') {
            if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                body.classList.add('theme-dark');
                document.documentElement.setAttribute('data-theme', 'dark');
            } else {
                body.classList.add('theme-light');
                document.documentElement.setAttribute('data-theme', 'light');
            }
        } else if (theme === 'dark-theme') {
            body.classList.add('theme-dark');
            document.documentElement.setAttribute('data-theme', 'dark');
        } else {
            body.classList.add('theme-light');
            document.documentElement.setAttribute('data-theme', 'light');
        }
    }
    
    // Apply accent color
    function applyAccentColor(color) {
        document.documentElement.style.setProperty('--primary-color', color);
        document.documentElement.style.setProperty('--primary-dark', adjustColor(color, -20));
        document.documentElement.style.setProperty('--primary-light', adjustColor(color, 40));
    }
    
    // Adjust color brightness
    function adjustColor(color, percent) {
        let R = parseInt(color.substring(1,3), 16);
        let G = parseInt(color.substring(3,5), 16);
        let B = parseInt(color.substring(5,7), 16);

        R = parseInt(R * (100 + percent) / 100);
        G = parseInt(G * (100 + percent) / 100);
        B = parseInt(B * (100 + percent) / 100);

        R = (R < 255) ? R : 255;  
        G = (G < 255) ? G : 255;  
        B = (B < 255) ? B : 255;  

        R = Math.round(R);
        G = Math.round(G);
        B = Math.round(B);

        const RR = ((R.toString(16).length === 1) ? "0" + R.toString(16) : R.toString(16));
        const GG = ((G.toString(16).length === 1) ? "0" + G.toString(16) : G.toString(16));
        const BB = ((B.toString(16).length === 1) ? "0" + B.toString(16) : B.toString(16));

        return "#" + RR + GG + BB;
    }
    
    // Apply font size
    function applyFontSize(size) {
        const root = document.documentElement;
        const baseFontSize = 16; // Base font size in pixels
        
        // Adjust font sizes based on the slider value (1-5)
        switch(parseInt(size)) {
            case 1: // Smallest
                root.style.fontSize = (baseFontSize * 0.875) + 'px';
                break;
            case 2: // Small
                root.style.fontSize = (baseFontSize * 0.9375) + 'px';
                break;
            case 3: // Default
                root.style.fontSize = baseFontSize + 'px';
                break;
            case 4: // Large
                root.style.fontSize = (baseFontSize * 1.0625) + 'px';
                break;
            case 5: // Largest
                root.style.fontSize = (baseFontSize * 1.125) + 'px';
                break;
        }
    }
    
    // Save user preferences to localStorage
    function saveUserPreference(key, value) {
        try {
            const preferences = JSON.parse(localStorage.getItem('userPreferences')) || {};
            preferences[key] = value;
            localStorage.setItem('userPreferences', JSON.stringify(preferences));
        } catch (e) {
            console.error('Error saving user preferences:', e);
        }
    }
    
    // Load user preferences from localStorage
    function loadUserPreferences() {
        try {
            const preferences = JSON.parse(localStorage.getItem('userPreferences'));
            if (preferences) {
                // Apply theme
                if (preferences.theme) {
                    applyTheme(preferences.theme);
                    document.querySelectorAll('.theme-option').forEach(option => {
                        const themeClass = option.querySelector('.theme-preview').classList[1];
                        option.classList.toggle('active', themeClass === preferences.theme);
                    });
                }
                
                // Apply accent color
                if (preferences.accentColor) {
                    applyAccentColor(preferences.accentColor);
                    document.querySelectorAll('.color-option').forEach(option => {
                        option.classList.toggle('active', option.style.getPropertyValue('--accent-color') === preferences.accentColor);
                    });
                }
                
                // Apply font size
                if (preferences.fontSize) {
                    applyFontSize(preferences.fontSize);
                    const fontSizeRange = document.getElementById('font-size-range');
                    if (fontSizeRange) {
                        fontSizeRange.value = preferences.fontSize;
                    }
                }
            }
        } catch (e) {
            console.error('Error loading user preferences:', e);
        }
    }
    
    // Show notification
    function showNotification(message, type) {
        const notif = document.createElement('div');
        notif.className = `notification notification-${type || 'info'}`;
        notif.innerHTML = `
            <div class="notification-icon">
                <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-info-circle'}"></i>
            </div>
            <div class="notification-message">${message}</div>
        `;
        
        document.body.appendChild(notif);
        
        // Animate notification
        setTimeout(() => {
            notif.classList.add('show');
        }, 10);
        
        // Remove notification after delay
        setTimeout(() => {
            notif.classList.remove('show');
            setTimeout(() => {
                notif.remove();
            }, 300);
        }, 3000);
    }

    // Handle drag over
    function handleDragOver(e) {
        e.preventDefault();
        e.stopPropagation();
        uploadArea.classList.add('drag-over');
    }

    // Handle drag leave
    function handleDragLeave(e) {
        e.preventDefault();
        e.stopPropagation();
        uploadArea.classList.remove('drag-over');
    }

    // Handle drop
    function handleDrop(e) {
        e.preventDefault();
        e.stopPropagation();
        uploadArea.classList.remove('drag-over');
        
        if (e.dataTransfer.files.length) {
            handleFiles(e.dataTransfer.files);
        }
    }

    // Handle file selection
    function handleFileSelect(e) {
        if (fileInput.files.length) {
            handleFiles(fileInput.files);
        }
    }

    // Process files
    function handleFiles(files) {
        const file = files[0];
        if (!file) return;

        // Check file type
        const validTypes = ['image/jpeg', 'image/png'];
        if (!validTypes.includes(file.type)) {
            showError('Please upload a JPG or PNG image.');
            return;
        }

        // Check file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
            showError('File size exceeds 5MB. Please upload a smaller image.');
            return;
        }

        // Show preview
        uploadPlaceholder.style.display = 'none';
        const reader = new FileReader();
        reader.onload = function(e) {
            previewImg.src = e.target.result;
            uploadPreview.style.display = 'block';
            analyzeBtn.disabled = false;
            resetBtn.disabled = false;
        };
        reader.readAsDataURL(file);
    }

    // Show error message
    function showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'alert alert-danger';
        errorDiv.innerHTML = `<i class="fas fa-exclamation-circle me-2"></i>${message}`;
        
        const container = document.querySelector('.upload-container');
        container.insertBefore(errorDiv, container.firstChild);
        
        setTimeout(() => {
            errorDiv.remove();
        }, 3000);
    }

    // Reset upload
    function resetUpload() {
        previewImg.src = '';
        uploadPreview.style.display = 'none';
        uploadPlaceholder.style.display = 'block';
        fileInput.value = '';
        analyzeBtn.disabled = true;
        resetBtn.disabled = true;
        
        // Clear results if shown
        resultsContainer.innerHTML = '';
    }

    // Analyze plant
    async function analyzePlant() {
        if (!fileInput.files[0]) return;

        // Show loading
        loadingOverlay.style.display = 'flex';
        
        try {
            // Create form data
            const formData = new FormData();
            formData.append('plant_image', fileInput.files[0]);

            // Replace with your actual endpoint
            const response = await axios.post('/api/analyze-plant', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            displayResults(response.data);
            addToHistory(response.data);
            
        } catch (error) {
            console.error('Error analyzing plant:', error);
            showError('Failed to analyze plant. Please try again.');
        } finally {
            // Hide loading overlay
            loadingOverlay.style.display = 'none';
        }
    }

    // Display results
    function displayResults(data) {
        resultsContainer.innerHTML = `
            <div class="card">
                <div class="card-header">
                    <h3 class="mb-0"><i class="fas fa-leaf me-2"></i>Plant Analysis Results</h3>
                </div>
                <div class="card-body">
                    <div class="row">
                        <div class="col-md-4">
                            <img src="${previewImg.src}" class="img-fluid rounded" alt="Plant image">
                            <div class="confidence-level mt-3">
                                <div class="d-flex justify-content-between">
                                    <span>Confidence:</span>
                                    <span class="fw-bold">${Math.round(data.confidence * 100)}%</span>
                                </div>
                                <div class="progress">
                                    <div class="progress-bar" style="width: ${data.confidence * 100}%"></div>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-8">
                            <h2 class="plant-name">${data.plant_name}</h2>
                            <p class="scientific-name">${data.scientific_name}</p>
                            
                            <div class="info-section">
                                <h5 class="section-title"><i class="fas fa-mortar-pestle me-2"></i>Medicinal Properties</h5>
                                <ul class="medicinal-properties">
                                    ${data.medicinal_properties.map(prop => `<li>${prop}</li>`).join('')}
                                </ul>
                            </div>
                            
                            <div class="info-section mt-4">
                                <h5 class="section-title"><i class="fas fa-history me-2"></i>Traditional Uses</h5>
                                <p>${data.traditional_uses}</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="card-footer">
                    <button class="btn btn-outline-primary" id="new-analysis">
                        <i class="fas fa-search me-2"></i>New Analysis
                    </button>
                </div>
            </div>
        `;

        // Add event listener for the "New Analysis" button
        document.getElementById('new-analysis').addEventListener('click', resetUpload);
    }
    
    // Add results to history
    function addToHistory(data) {
        // Get history container
        const historyItems = document.getElementById('history-items');
        const emptyHistory = document.getElementById('empty-history');
        
        if (emptyHistory) {
            emptyHistory.style.display = 'none';
        }
        
        // Create a new history item
        const historyItem = document.createElement('div');
        historyItem.className = 'col-md-4 mb-4';
        historyItem.innerHTML = `
            <div class="card">
                <div class="card-body">
                    <h5 class="card-title">${data.plant_name}</h5>
                    <p class="card-text">${data.scientific_name}</p>
                    <p class="card-text"><small class="text-muted">${new Date().toLocaleDateString()}</small></p>
                    <button class="btn btn-sm btn-outline-primary view-details-btn">View Details</button>
                </div>
            </div>
        `;
        
        // Add to history
        historyItems.insertBefore(historyItem, historyItems.firstChild);
        
        // Update profile stats
        const plantsIdentified = document.getElementById('plants-identified');
        if (plantsIdentified) {
            plantsIdentified.textContent = parseInt(plantsIdentified.textContent || '0') + 1;
        }
        
        // Add event listener to the view details button
        const viewDetailsBtn = historyItem.querySelector('.view-details-btn');
        viewDetailsBtn.addEventListener('click', function() {
            showSection('detect-section');
            navLinks.forEach(link => link.parentElement.classList.remove('active'));
            document.querySelector('[data-section="detect-section"]').parentElement.classList.add('active');
            displayResults(data);
        });
        
        // Update plants identified count in Firestore
        updatePlantStats();
    }

    // Fetch the user's profile data from Firestore
    async function fetchUserProfile() {
        try {
            // Show loading indicator in profile section
            const profileSection = document.querySelector('#profile-section .profile-card');
            if (profileSection) {
                profileSection.classList.add('loading');
            }
            
            // Get current authenticated user
            const user = await getCurrentUser();
            
            if (!user) {
                showNotification('You must be logged in to view profile', 'error');
                return;
            }
            
            // Fetch user data from Firestore
            const userDoc = await db.collection('users').doc(user.uid).get();
            
            let userData;
            
            if (userDoc.exists) {
                // Get user data from Firestore
                userData = userDoc.data();
            } else {
                // Create a new user document if it doesn't exist
                userData = {
                    username: user.displayName || 'User',
                    email: user.email,
                    joinDate: new Date().toISOString(),
                    plantsIdentified: 0,
                    plantsSaved: 0,
                    plantsShared: 0,
                    profileImage: user.photoURL || null
                };
                
                // Save the new user to Firestore
                await db.collection('users').doc(user.uid).set(userData);
            }
            
            // Update UI with user data
            updateProfileUI(userData);
            
        } catch (error) {
            console.error('Error fetching user profile:', error);
            showNotification('Failed to load profile data', 'error');
        } finally {
            // Remove loading state
            const profileSection = document.querySelector('#profile-section .profile-card');
            if (profileSection) {
                profileSection.classList.remove('loading');
            }
        }
    }

    // Update the profile UI with user data
    function updateProfileUI(userData) {
        // Update username and email
        const profileName = document.getElementById('profile-name');
        const profileEmail = document.getElementById('profile-email');
        
        if (profileName) {
            profileName.textContent = userData.username;
        }
        
        if (profileEmail) {
            profileEmail.textContent = userData.email;
        }
        
        // Update stats counts
        const plantsIdentified = document.getElementById('plants-identified');
        const plantsSaved = document.getElementById('plants-saved');
        const plantsShared = document.getElementById('plants-shared');
        
        if (plantsIdentified) {
            plantsIdentified.textContent = userData.plantsIdentified || 0;
        }
        
        if (plantsSaved) {
            plantsSaved.textContent = userData.plantsSaved || 0;
        }
        
        if (plantsShared) {
            plantsShared.textContent = userData.plantsShared || 0;
        }
        
        // Update profile image if available
        const profileAvatar = document.querySelector('.profile-avatar');
        if (profileAvatar && userData.profileImage) {
            profileAvatar.innerHTML = `<img src="${userData.profileImage}" alt="${userData.username}" class="profile-img">`;
        }
        
        // Set values in edit form
        const editNameInput = document.getElementById('edit-name');
        const editEmailInput = document.getElementById('edit-email');
        
        if (editNameInput) {
            editNameInput.value = userData.username;
        }
        
        if (editEmailInput) {
            editEmailInput.value = userData.email;
        }
    }
    
    // Initialize profile edit functionality with Firestore updates
    function initProfileEdit() {
        const editProfileBtn = document.getElementById('edit-profile-btn');
        const profileForm = document.getElementById('profile-form');
        const profileDisplay = document.getElementById('profile-display');
        const cancelEditBtn = document.getElementById('cancel-profile-edit');
        
        if (editProfileBtn) {
            editProfileBtn.addEventListener('click', function() {
                // Show edit form
                if (profileForm) profileForm.classList.add('active');
                if (profileDisplay) profileDisplay.classList.add('hidden');
            });
        }
        
        if (cancelEditBtn) {
            cancelEditBtn.addEventListener('click', function(e) {
                e.preventDefault();
                // Hide edit form and reset to original values
                if (profileForm) profileForm.classList.remove('active');
                if (profileDisplay) profileDisplay.classList.remove('hidden');
                fetchUserProfile(); // Refetch to discard changes
            });
        }
        
        // Handle profile form submission with Firestore update
        const saveProfileForm = document.getElementById('save-profile-form');
        if (saveProfileForm) {
            saveProfileForm.addEventListener('submit', async function(e) {
                e.preventDefault();
                
                const nameInput = document.getElementById('edit-name');
                const emailInput = document.getElementById('edit-email');
                const profileImageInput = document.getElementById('profile-image-upload');
                
                // Simple validation
                if (!nameInput.value.trim()) {
                    showNotification('Name cannot be empty', 'error');
                    return;
                }
                
                if (!emailInput.value.trim() || !isValidEmail(emailInput.value)) {
                    showNotification('Please enter a valid email', 'error');
                    return;
                }
                
                try {
                    // Show loading indicator
                    const profileSection = document.querySelector('#profile-section .profile-card');
                    if (profileSection) {
                        profileSection.classList.add('loading');
                    }
                    
                    // Get current authenticated user
                    const user = await getCurrentUser();
                    
                    if (!user) {
                        showNotification('You must be logged in to update profile', 'error');
                        return;
                    }
                    
                    let profileImageData = null;
                    
                    // Process profile image if one was selected
                    if (profileImageInput.files.length > 0) {
                        const file = profileImageInput.files[0];
                        profileImageData = await readFileAsDataURL(file);
                        
                        // In a real app, you would upload this to Firebase Storage
                        // and get a public URL instead of storing as data URL
                    }
                    
                    // Update data to send to Firestore
                    const updatedData = {
                        username: nameInput.value.trim(),
                        email: emailInput.value.trim(),
                    };
                    
                    if (profileImageData) {
                        updatedData.profileImage = profileImageData;
                    }
                    
                    // Update user profile in Firestore
                    await db.collection('users').doc(user.uid).update(updatedData);
                    
                    // Update Firebase auth user profile if email or name changed
                    if (user.email !== updatedData.email) {
                        await user.updateEmail(updatedData.email);
                    }
                    
                    if (user.displayName !== updatedData.username) {
                        await user.updateProfile({
                            displayName: updatedData.username
                        });
                    }
                    
                    // Hide edit form
                    if (profileForm) profileForm.classList.remove('active');
                    if (profileDisplay) profileDisplay.classList.remove('hidden');
                    
                    // Refetch user data to update UI
                    fetchUserProfile();
                    
                    showNotification('Profile updated successfully', 'success');
                    
                } catch (error) {
                    console.error('Error updating profile:', error);
                    showNotification('Failed to update profile: ' + error.message, 'error');
                } finally {
                    // Remove loading state
                    const profileSection = document.querySelector('#profile-section .profile-card');
                    if (profileSection) {
                        profileSection.classList.remove('loading');
                    }
                }
            });
        }
    }
    
    // Update plant identification stats in Firestore
    async function updatePlantStats() {
        try {
            const user = await getCurrentUser();
            if (user) {
                // Increment the plantsIdentified field using Firestore atomic operation
                await db.collection('users').doc(user.uid).update({
                    plantsIdentified: firebase.firestore.FieldValue.increment(1)
                });
            }
        } catch (error) {
            console.error('Error updating plant stats:', error);
        }
    }
    
    // Read file as data URL (for profile image)
    function readFileAsDataURL(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = e => resolve(e.target.result);
            reader.onerror = error => reject(error);
            reader.readAsDataURL(file);
        });
    }
    
    // Email validation function
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    // Call the function to initialize profile edit functionality
    initProfileEdit();
});
