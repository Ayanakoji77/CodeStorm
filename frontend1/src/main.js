import * as api from './api.js';
import * as ui from './ui.js';
import { initMap, addShelterMarkers, invalidateMapSize } from './modules/map.js';

const loader = document.getElementById('loader');
const errorMessage = document.getElementById('error-message');
let mapInitialized = false;

// --- APP INITIALIZATION ---
document.addEventListener('DOMContentLoaded', initApp);

function initApp() {
    console.log('Initializing ClimaAid application...');
    
    // Small delay to ensure DOM is fully ready
    setTimeout(() => {
        setupNavigation();
        setupForms();
        setupLocationNews();
        setupGeolocation();
        
        // Load data for the default page (Dashboard)
        loadPageData('dashboard');
    }, 100);
}

// --- DATA LOADING LOGIC ---
async function loadPageData(pageId) {
    console.log(`Loading page data for: ${pageId}`);
    const pageElement = document.getElementById(pageId);
    
    if (!pageElement) {
        console.error(`Page element not found: ${pageId}`);
        return;
    }
    
    if (pageElement.dataset.loaded === 'true') {
        if (pageId === 'dashboard') invalidateMapSize();
        return;
    }

    showLoader();
    
    try {
        switch (pageId) {
            case 'dashboard':
                await loadDashboardData();
                break;
                
            case 'prepare':
                await loadPrepareData();
                break;
                
            case 'recovery':
                await loadRecoveryData();
                break;
                
            case 'respond':
                // No async data loading needed for respond page
                console.log('Respond page loaded');
                break;
                
            default:
                console.warn(`Unknown page: ${pageId}`);
        }
        
        pageElement.dataset.loaded = 'true';
        console.log(`Page data loaded successfully for: ${pageId}`);
        
    } catch (error) {
        console.error(`Failed to load data for ${pageId}:`, error);
        showError(error.message || 'Failed to load page data');
    } finally {
        hideLoader();
    }
}

async function loadDashboardData() {
    console.log('Loading dashboard data...');
    
    try {
        // Initialize map first
        if (!mapInitialized) {
            console.log('Initializing map...');
            initMap();
            mapInitialized = true;
        }
        
        // Load news and shelters in parallel
        const [newsResponse, sheltersResponse] = await Promise.allSettled([
            api.getNews('India'),
            api.getShelters()
        ]);
        
        // Handle news data
        if (newsResponse.status === 'fulfilled') {
            console.log('News data loaded:', newsResponse.value?.length || 0, 'articles');
            ui.renderNewsArticles(newsResponse.value);
        } else {
            console.error('Failed to load news:', newsResponse.reason);
            ui.renderNewsArticles([]); // Show empty state
        }
        
        // Handle shelters data
        if (sheltersResponse.status === 'fulfilled') {
            console.log('Shelters data loaded:', sheltersResponse.value?.length || 0, 'shelters');
            addShelterMarkers(sheltersResponse.value);
        } else {
            console.error('Failed to load shelters:', sheltersResponse.reason);
            addShelterMarkers([]); // Show empty state
        }
        
        // Ensure map is properly sized
        invalidateMapSize();
        
    } catch (error) {
        console.error('Error in loadDashboardData:', error);
        throw error;
    }
}

async function loadPrepareData() {
    console.log('Loading prepare data...');
    
    const [kitResponse, instructionsResponse] = await Promise.allSettled([
        api.getKitItems(),
        api.getInstructions()
    ]);
    
    // Handle kit items
    if (kitResponse.status === 'fulfilled') {
        console.log('Kit items loaded:', kitResponse.value?.length || 0, 'items');
        ui.renderKitItems(kitResponse.value);
    } else {
        console.error('Failed to load kit items:', kitResponse.reason);
        ui.renderKitItems([]);
    }
    
    // Handle instructions
    if (instructionsResponse.status === 'fulfilled') {
        console.log('Instructions loaded:', instructionsResponse.value?.length || 0, 'instructions');
        ui.renderInstructions(instructionsResponse.value);
    } else {
        console.error('Failed to load instructions:', instructionsResponse.reason);
        ui.renderInstructions([]);
    }
}

async function loadRecoveryData() {
    console.log('Loading recovery data...');
    
    try {
        const organizations = await api.getOrganizations();
        console.log('Organizations loaded:', organizations?.length || 0, 'organizations');
        ui.renderOrganizations(organizations);
        
        // Setup forms if not already done
        setupForms();
        
    } catch (error) {
        console.error('Failed to load recovery data:', error);
        ui.renderOrganizations([]);
        throw error;
    }
}

// --- LOCATION-SPECIFIC NEWS ---
function setupLocationNews() {
    const updateBtn = document.getElementById('updateLocationBtn');
    const locationInput = document.getElementById('locationInput');
    
    if (updateBtn && locationInput) {
        updateBtn.addEventListener('click', async () => {
            const location = locationInput.value.trim();
            if (!location) {
                ui.showMessage('Please enter a location', 'error');
                return;
            }
            
            updateBtn.disabled = true;
            updateBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
            
            try {
                const locationNews = await api.getLocationNews(location);
                ui.renderLocationNews(locationNews);
                ui.showMessage(`News updated for ${location}`, 'success');
            } catch (error) {
                console.error('Error fetching location news:', error);
                ui.showMessage('Failed to fetch location news', 'error');
                ui.renderLocationNews([]); // Show empty state
            } finally {
                updateBtn.disabled = false;
                updateBtn.innerHTML = '<i class="fa-solid fa-search"></i>';
            }
        });
        
        // Allow Enter key to trigger update
        locationInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !updateBtn.disabled) {
                updateBtn.click();
            }
        });
    }
}

// --- GEOLOCATION FOR SOS ---
function setupGeolocation() {
    const getLocationBtn = document.getElementById('getLocationBtn');
    const sosLocationInput = document.getElementById('sosLocation');
    
    if (getLocationBtn && sosLocationInput) {
        getLocationBtn.addEventListener('click', () => {
            if (!navigator.geolocation) {
                ui.showMessage('Geolocation is not supported by this browser', 'error');
                return;
            }
            
            getLocationBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
            getLocationBtn.disabled = true;
            
            const options = {
                enableHighAccuracy: true,
                timeout: 15000, // 15 seconds
                maximumAge: 60000 // 1 minute
            };
            
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude, accuracy } = position.coords;
                    sosLocationInput.value = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
                    getLocationBtn.innerHTML = '<i class="fa-solid fa-location-dot"></i>';
                    getLocationBtn.disabled = false;
                    ui.showMessage(`Location detected (±${Math.round(accuracy)}m accuracy)`, 'success');
                },
                (error) => {
                    let errorMsg = 'Could not get your location';
                    switch (error.code) {
                        case error.PERMISSION_DENIED:
                            errorMsg = 'Location access denied by user';
                            break;
                        case error.POSITION_UNAVAILABLE:
                            errorMsg = 'Location information unavailable';
                            break;
                        case error.TIMEOUT:
                            errorMsg = 'Location request timed out';
                            break;
                    }
                    
                    console.error('Geolocation error:', error);
                    getLocationBtn.innerHTML = '<i class="fa-solid fa-location-dot"></i>';
                    getLocationBtn.disabled = false;
                    ui.showMessage(errorMsg, 'error');
                },
                options
            );
        });
    }
}

// --- NAVIGATION ---
function setupNavigation() {
    const sidebar = document.getElementById('sidebar');
    const menuBtn = document.getElementById('menuBtn');
    const closeBtn = document.getElementById('closeBtn');

    console.log('Setting up navigation...', { 
        sidebar: !!sidebar, 
        menuBtn: !!menuBtn, 
        closeBtn: !!closeBtn 
    });

    if (!menuBtn || !closeBtn || !sidebar) {
        console.error('Navigation elements not found');
        return;
    }

    // Open sidebar
    menuBtn.addEventListener('click', () => {
        sidebar.classList.add('open');
    });
    
    // Close sidebar
    closeBtn.addEventListener('click', () => {
        sidebar.classList.remove('open');
    });

    // Close sidebar when clicking outside
    document.addEventListener('click', (e) => {
        if (sidebar.classList.contains('open') && 
            !sidebar.contains(e.target) && 
            !menuBtn.contains(e.target)) {
            sidebar.classList.remove('open');
        }
    });

    // Handle page navigation
    document.querySelectorAll('.page-link').forEach((link) => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const pageId = link.getAttribute('data-page');
            
            if (!pageId) {
                console.error('Page ID not found for link:', link);
                return;
            }
            
            // Update active states
            document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
            document.querySelectorAll('.page-link').forEach(l => l.classList.remove('bg-slate-700'));
            
            const newPage = document.getElementById(pageId);
            if (newPage) {
                newPage.classList.add('active');
                link.classList.add('bg-slate-700');
                
                // Update page title
                const pageTitle = link.textContent.trim();
                document.title = `ClimaAid - ${pageTitle}`;
            }

            loadPageData(pageId);
            sidebar.classList.remove('open');
        });
    });
}

// --- FORM HANDLERS ---
function setupForms() {
    // Aid request form
    const aidForm = document.getElementById('aidRequestForm');
    if (aidForm && !aidForm.hasAttribute('data-setup')) {
        aidForm.addEventListener('submit', handleAidFormSubmit);
        aidForm.setAttribute('data-setup', 'true');
    }
    
    // SOS alert form
    const sosForm = document.getElementById('sosForm');
    if (sosForm && !sosForm.hasAttribute('data-setup')) {
        sosForm.addEventListener('submit', handleSOSFormSubmit);
        sosForm.setAttribute('data-setup', 'true');
    }
}

async function handleAidFormSubmit(event) {
    event.preventDefault();
    console.log('Submitting aid request...');
    
    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-2"></i>Submitting...';
    
    const formData = {
        name: document.getElementById('requesterName').value.trim(),
        location: document.getElementById('locationDescription').value.trim(),
        aid_needed: document.getElementById('aidNeeded').value.trim(),
    };

    try {
        const result = await api.submitAidRequest(formData);
        console.log('Aid request submitted successfully:', result);
        ui.showMessage('Your aid request has been submitted successfully! Our team will contact you soon.', 'success');
        event.target.reset();
    } catch (error) {
        console.error('Error submitting aid request:', error);
        ui.showMessage(error.message || 'Failed to submit aid request', 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
}

async function handleSOSFormSubmit(event) {
    event.preventDefault();
    console.log('Sending SOS alert...');
    
    // Show confirmation dialog
    if (!confirm('⚠️ Are you sure you want to send an SOS alert?\n\nThis will notify emergency services immediately. Only proceed if this is a real emergency.')) {
        return;
    }
    
    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-2"></i>Sending Alert...';

    const sosData = {
        name: document.getElementById('sosName').value.trim(),
        phone: document.getElementById('sosPhone').value.trim(),
        location: document.getElementById('sosLocation').value.trim(),
        emergency_type: document.getElementById('sosEmergency').value,
        message: document.getElementById('sosMessage').value.trim(),
    };

    try {
        const result = await api.sendSOSAlert(sosData);
        console.log('SOS alert sent successfully:', result);
        ui.showMessage('🚨 SOS ALERT SENT! Emergency services have been notified. Help is on the way!', 'success');
        event.target.reset();
    } catch (error) {
        console.error('Error sending SOS alert:', error);
        ui.showMessage(error.message || 'Failed to send SOS alert', 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
}

// --- UI HELPERS ---
function showLoader() {
    if (loader) {
        loader.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
}

function hideLoader() {
    if (loader) {
        loader.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

function showError(message) {
    console.error('Application Error:', message);
    ui.showMessage(message, 'error');
}

// --- ERROR HANDLING ---
window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
    showError('An unexpected error occurred. Please refresh the page.');
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    showError('A network error occurred. Please check your connection.');
    event.preventDefault();
});

// --- APP STATE MANAGEMENT ---
const AppState = {
    currentPage: 'dashboard',
    isLoading: false,
    lastNewsUpdate: null,
    
    setCurrentPage(pageId) {
        this.currentPage = pageId;
    },
    
    setLoading(loading) {
        this.isLoading = loading;
        if (loading) {
            showLoader();
        } else {
            hideLoader();
        }
    }
};

// Export for debugging
window.ClimaAid = {
    AppState,
    api,
    ui,
    loadPageData,
    showError
};

