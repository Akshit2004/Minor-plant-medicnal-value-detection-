document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
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
    
    // Initialize sections
    initSections();
    
    // Add event listeners
    uploadArea.addEventListener('click', () => fileInput.click());
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('dragleave', handleDragLeave);
    uploadArea.addEventListener('drop', handleDrop);
    fileInput.addEventListener('change', handleFileSelect);
    analyzeBtn.addEventListener('click', analyzePlant);
    resetBtn.addEventListener('click', resetUpload);

    // Initialize sections and navigation
    function initSections() {
        // Set up navigation links
        navLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const targetSectionId = this.getAttribute('data-section');
                showSection(targetSectionId);
                
                // Update active state in navigation
                navLinks.forEach(link => link.classList.remove('active'));
                this.classList.add('active');
            });
        });
        
        // Set default active section
        showSection('detect-section');
        document.querySelector('[data-section="detect-section"]').classList.add('active');
        
        // Connect "Start Identifying Plants" button in history section
        const goToDetectBtn = document.getElementById('go-to-detect');
        if (goToDetectBtn) {
            goToDetectBtn.addEventListener('click', function() {
                showSection('detect-section');
                document.querySelector('[data-section="detect-section"]').classList.add('active');
                navLinks.forEach(link => link.classList.remove('active'));
                document.querySelector('[data-section="detect-section"]').classList.add('active');
            });
        }
    }
    
    // Show a specific section and hide others
    function showSection(sectionId) {
        // First set all sections to hidden
        sections.forEach(section => {
            if (section.id === sectionId) {
                // Prepare the target section to show (but still invisible)
                section.style.display = 'block';
                
                // Force a reflow to make sure the display change takes effect
                section.offsetHeight;
                
                // Now make it visible with opacity
                setTimeout(() => {
                    section.classList.add('active');
                }, 10);
            } else {
                // Hide other sections
                section.classList.remove('active');
                
                // After transition completes, set display to none
                setTimeout(() => {
                    if (!section.classList.contains('active')) {
                        section.style.display = 'none';
                    }
                }, 400); // Match this to the CSS transition time
            }
        });
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

        // Show preview with smooth transition
        uploadPlaceholder.style.opacity = '0';
        setTimeout(() => {
            uploadPlaceholder.style.display = 'none';
            
            const reader = new FileReader();
            reader.onload = function(e) {
                previewImg.src = e.target.result;
                uploadPreview.style.display = 'block';
                // Fade in the preview
                setTimeout(() => {
                    uploadPreview.style.opacity = '1';
                }, 50);
                analyzeBtn.disabled = false;
                resetBtn.disabled = false;
            };
            reader.readAsDataURL(file);
        }, 300);
    }

    // Show error message
    function showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'alert alert-danger animate__animated animate__fadeIn';
        errorDiv.innerHTML = `<i class="fas fa-exclamation-circle me-2"></i>${message}`;
        
        const container = document.querySelector('.upload-container');
        container.insertBefore(errorDiv, container.firstChild);
        
        setTimeout(() => {
            errorDiv.classList.add('animate__fadeOut');
            setTimeout(() => {
                errorDiv.remove();
            }, 600);
        }, 3000);
    }

    // Reset upload with smooth transition
    function resetUpload() {
        uploadPreview.style.opacity = '0';
        
        setTimeout(() => {
            previewImg.src = '';
            uploadPreview.style.display = 'none';
            uploadPlaceholder.style.display = 'block';
            
            // Fade in the placeholder
            setTimeout(() => {
                uploadPlaceholder.style.opacity = '1';
            }, 50);
            
            fileInput.value = '';
            analyzeBtn.disabled = true;
            resetBtn.disabled = true;
        }, 300);
        
        // Smooth scroll back to top if results are shown
        if (resultsContainer.innerHTML !== '') {
            window.scrollTo({
                top: uploadArea.offsetTop - 100,
                behavior: 'smooth'
            });
            
            // Clear results with fade-out animation
            resultsContainer.style.opacity = '0';
            setTimeout(() => {
                resultsContainer.innerHTML = '';
                resultsContainer.style.opacity = '1';
            }, 500);
        }
    }

    // Analyze plant
    async function analyzePlant() {
        if (!fileInput.files[0]) return;

        // Smooth transition to loading state
        loadingOverlay.style.display = 'flex';
        loadingOverlay.style.opacity = '0';
        setTimeout(() => {
            loadingOverlay.style.opacity = '1';
        }, 10);
        
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
            
            // After displaying results, update history section
            addToHistory(response.data);
            
            // Smooth scroll to results
            setTimeout(() => {
                resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 500);
        } catch (error) {
            console.error('Error analyzing plant:', error);
            showError('Failed to analyze plant. Please try again.');
        } finally {
            // Hide loading overlay with smooth transition
            loadingOverlay.style.opacity = '0';
            setTimeout(() => {
                loadingOverlay.style.display = 'none';
            }, 300);
        }
    }

    // Display results with enhanced UI
    function displayResults(data) {
        // Create a more modern and visually appealing result card
        resultsContainer.innerHTML = `
            <div class="card">
                <div class="card-header bg-success text-white">
                    <h3 class="mb-0"><i class="fas fa-leaf me-2"></i>Plant Analysis Results</h3>
                </div>
                <div class="card-body">
                    <div class="row">
                        <div class="col-md-4">
                            <img src="${previewImg.src}" class="img-fluid rounded shadow" alt="Plant image">
                            <div class="confidence-level mt-3">
                                <div class="d-flex justify-content-between">
                                    <span>Identification Confidence:</span>
                                    <span class="fw-bold">${Math.round(data.confidence * 100)}%</span>
                                </div>
                                <div class="progress">
                                    <div class="progress-bar bg-success" style="width: ${data.confidence * 100}%"></div>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-8">
                            <div class="plant-info">
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
                </div>
                <div class="card-footer">
                    <div class="d-flex justify-content-between">
                        <div>
                            <button class="btn btn-primary" id="download-result">
                                <i class="fas fa-download me-2"></i>Download Result
                            </button>
                            <button class="btn btn-outline-secondary ms-2" id="share-result">
                                <i class="fas fa-share-alt me-2"></i>Share
                            </button>
                        </div>
                        <button class="btn btn-outline-success" id="new-analysis">
                            <i class="fas fa-search me-2"></i>New Analysis
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Add event listener for the "New Analysis" button
        document.getElementById('new-analysis').addEventListener('click', resetUpload);
        
        // Add event listeners for download and share buttons
        document.getElementById('download-result').addEventListener('click', () => downloadResult(data));
        document.getElementById('share-result').addEventListener('click', () => shareResult(data));
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
            <div class="history-item">
                <div class="history-item-image">
                    <img src="${previewImg.src}" alt="${data.plant_name}">
                    <span class="confidence-badge">${Math.round(data.confidence * 100)}%</span>
                </div>
                <div class="history-item-body">
                    <h5 class="history-item-title">${data.plant_name}</h5>
                    <div class="history-item-subtitle">${data.scientific_name}</div>
                    <div class="history-item-date">${new Date().toLocaleDateString()}</div>
                    <div class="mt-2">
                        <button class="btn btn-sm btn-outline-primary view-details-btn">View Details</button>
                    </div>
                </div>
            </div>
        `;
        
        // Add to history and attach event listener
        historyItems.insertBefore(historyItem, historyItems.firstChild);
        
        // Update profile stats
        updateProfileStats();
        
        // Add event listener to the view details button
        const viewDetailsBtn = historyItem.querySelector('.view-details-btn');
        viewDetailsBtn.addEventListener('click', function() {
            // Show detection section with the results
            showSection('detect-section');
            navLinks.forEach(link => link.classList.remove('active'));
            document.querySelector('[data-section="detect-section"]').classList.add('active');
            
            // Redisplay the results
            displayResults(data);
        });
    }
    
    // Update profile statistics
    function updateProfileStats() {
        const plantsIdentified = document.getElementById('plants-identified');
        const plantsSaved = document.getElementById('plants-saved');
        
        if (plantsIdentified) {
            plantsIdentified.textContent = parseInt(plantsIdentified.textContent || '0') + 1;
        }
    }
    
    // Save result function (placeholder)
    function saveResult(data) {
        // Implementation would depend on your backend
        showMessage('Result saved successfully!', 'success');
        
        // Update saved plants count
        const plantsSaved = document.getElementById('plants-saved');
        if (plantsSaved) {
            plantsSaved.textContent = parseInt(plantsSaved.textContent || '0') + 1;
        }
    }
    
    // Download result function (client-side only, no database)
    function downloadResult(data) {
        // Create a JSON blob with the data
        const resultData = {
            plant_name: data.plant_name,
            scientific_name: data.scientific_name,
            confidence: data.confidence,
            medicinal_properties: data.medicinal_properties,
            traditional_uses: data.traditional_uses,
            date_analyzed: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(resultData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        // Create a temporary link and trigger download
        const link = document.createElement('a');
        link.href = url;
        link.download = `plant-analysis-${data.plant_name.toLowerCase().replace(/\s+/g, '-')}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        showMessage('Result downloaded successfully!', 'success');
    }
    
    // Share result function (client-side only)
    function shareResult(data) {
        if (navigator.share) {
            navigator.share({
                title: `MediPlant: ${data.plant_name}`,
                text: `I identified ${data.plant_name} (${data.scientific_name}) using MediPlant Detector!`,
                url: window.location.href,
            })
            .catch((error) => console.log('Error sharing', error));
        } else {
            showMessage('Sharing is not available in your browser', 'info');
        }
        
        // Update shared plants count
        const plantsShared = document.getElementById('plants-shared');
        if (plantsShared) {
            plantsShared.textContent = parseInt(plantsShared.textContent || '0') + 1;
        }
    }
    
    // Show message toast
    function showMessage(message, type) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `alert alert-${type} position-fixed bottom-0 end-0 m-3`;
        messageDiv.style.zIndex = '9999';
        messageDiv.style.minWidth = '250px';
        messageDiv.innerHTML = message;
        document.body.appendChild(messageDiv);
        
        setTimeout(() => {
            messageDiv.style.opacity = '0';
            setTimeout(() => {
                messageDiv.remove();
            }, 500);
        }, 3000);
    }

    // Initialize - add CSS for smooth transitions
    const style = document.createElement('style');
    style.textContent = `
        .upload-placeholder, .upload-preview {
            transition: opacity 0.3s ease;
        }
        .results-container {
            transition: opacity 0.5s ease;
        }
        .loading-overlay {
            transition: opacity 0.3s ease;
        }
        .alert {
            transition: opacity 0.6s ease;
        }
    `;
    document.head.appendChild(style);
});
