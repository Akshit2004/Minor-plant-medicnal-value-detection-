// Global variables
let model;
let plantClassLabels = [];
let medicinalInfo = {};

// DOM Elements
const uploadArea = document.getElementById('upload-area');
const fileInput = document.getElementById('file-input');
const previewSection = document.getElementById('preview-section');
const previewImage = document.getElementById('preview-image');
const analyzeBtn = document.getElementById('analyze-btn');
const resultsSection = document.getElementById('results-section');
const plantNameElement = document.getElementById('plant-name');
const confidenceElement = document.getElementById('confidence-value');
const medicinalValueElement = document.getElementById('medicinal-value');
const newUploadBtn = document.getElementById('new-upload-btn');
const loadingOverlay = document.getElementById('loading-overlay');

// Initialize the application
async function initApp() {
    try {
        // Load plant class labels and medicinal information
        await loadPlantInfo();
        
        // Load the model
        await loadModel();
        
        // Set up event listeners
        setupEventListeners();
        
    } catch (error) {
        console.error("Error initializing application:", error);
        alert("Failed to initialize the application. Please refresh and try again.");
    }
}

// Load the TensorFlow model
async function loadModel() {
    loadingOverlay.style.display = 'flex';
    try {
        // Option 1: Load model from a URL (for converted models)
        model = await tf.loadLayersModel('assets/model/model.json');
        
        // Option 2: If you need to convert from .ipynb, you'll need a server-side process
        // and load the converted model here
        
        console.log("Model loaded successfully!");
    } catch (error) {
        console.error("Error loading model:", error);
        alert("Failed to load the plant identification model. Please refresh and try again.");
    } finally {
        loadingOverlay.style.display = 'none';
    }
}

// Load plant class labels and medicinal information
async function loadPlantInfo() {
    try {
        // Load labels and medicinal info from a JSON file
        const response = await fetch('assets/data/plant_info.json');
        const data = await response.json();
        
        plantClassLabels = data.labels;
        medicinalInfo = data.medicinalInfo;
    } catch (error) {
        console.error("Error loading plant information:", error);
        // Fallback with some examples if loading fails
        plantClassLabels = ["Tulsi", "Neem", "Aloe Vera"];
        medicinalInfo = {
            "Tulsi": "Known for its antibacterial, anti-inflammatory properties. Used for coughs, colds, and respiratory disorders.",
            "Neem": "Has antimicrobial properties, used in skin treatments and as an insect repellent.",
            "Aloe Vera": "Used for skin conditions and has healing properties for burns and wounds."
        };
    }
}

// Set up event listeners
function setupEventListeners() {
    // Upload area click handler
    uploadArea.addEventListener('click', () => {
        fileInput.click();
    });
    
    // File input change handler
    fileInput.addEventListener('change', handleFileSelect);
    
    // Drag and drop handlers
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('active');
    });
    
    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('active');
    });
    
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('active');
        
        if (e.dataTransfer.files.length) {
            handleFiles(e.dataTransfer.files);
        }
    });
    
    // Analyze button click handler
    analyzeBtn.addEventListener('click', async () => {
        await identifyPlant();
    });
    
    // New upload button click handler
    newUploadBtn.addEventListener('click', () => {
        resetUI();
    });
}

// Handle file selection
function handleFileSelect(e) {
    if (e.target.files.length) {
        handleFiles(e.target.files);
    }
}

// Process the selected files
function handleFiles(files) {
    const file = files[0];
    
    // Check if the file is an image
    if (!file.type.match('image.*')) {
        alert('Please select an image file (JPG, PNG)');
        return;
    }
    
    // Display preview
    const reader = new FileReader();
    reader.onload = (e) => {
        previewImage.src = e.target.result;
        previewSection.style.display = 'block';
        uploadArea.style.display = 'none';
        resultsSection.style.display = 'none';
    };
    reader.readAsDataURL(file);
}

// Process image and make prediction
async function identifyPlant() {
    loadingOverlay.style.display = 'flex';
    
    try {
        // Ensure model is loaded
        if (!model) {
            throw new Error("Model not loaded yet");
        }
        
        // Preprocess the image for the model
        const imageElement = document.getElementById('preview-image');
        const tensor = preprocessImage(imageElement);
        
        // Make prediction
        const predictions = await model.predict(tensor).data();
        
        // Get the highest confidence prediction
        const highestIndex = predictions.indexOf(Math.max(...predictions));
        const confidence = predictions[highestIndex] * 100;
        
        // Display results
        displayResults(highestIndex, confidence);
        
        // Cleanup tensor to free memory
        tensor.dispose();
        
    } catch (error) {
        console.error("Error during plant identification:", error);
        alert("An error occurred while identifying the plant. Please try again.");
    } finally {
        loadingOverlay.style.display = 'none';
    }
}

// Preprocess image for the model
function preprocessImage(imgElement) {
    // Convert image to tensor
    const imgTensor = tf.browser.fromPixels(imgElement);
    
    // Resize image to match model input shape (example: 224x224)
    const resized = tf.image.resizeBilinear(imgTensor, [224, 224]);
    
    // Normalize image values to [0, 1]
    const normalized = resized.div(255.0);
    
    // Add batch dimension
    const batched = normalized.expandDims(0);
    
    return batched;
}

// Display the identification results
function displayResults(labelIndex, confidence) {
    // Get the plant name from the label list
    const plantName = plantClassLabels[labelIndex] || "Unknown Plant";
    
    // Get medicinal information
    const medicinalValue = medicinalInfo[plantName] || "No medicinal information available for this plant.";
    
    // Update the UI
    plantNameElement.textContent = plantName;
    confidenceElement.textContent = `${confidence.toFixed(2)}%`;
    medicinalValueElement.textContent = medicinalValue;
    
    // Show the results section
    previewSection.style.display = 'block';
    resultsSection.style.display = 'block';
    
    // Re-initialize Feather icons after adding new content
    if (window.feather) {
        feather.replace();
    }
    
    // Scroll to results
    setTimeout(() => {
        resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
}

// Reset the UI for a new upload
function resetUI() {
    uploadArea.style.display = 'block';
    previewSection.style.display = 'none';
    resultsSection.style.display = 'none';
    fileInput.value = '';
}

// Initialize the app when the page loads
window.addEventListener('DOMContentLoaded', initApp);
