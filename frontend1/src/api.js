// api.js - Enhanced API functions with better error handling
const API_BASE_URL = 'https://codestorm-backend.onrender.com/api';

// Generic fetch function with enhanced error handling
async function fetchFromAPI(endpoint, options = {}) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            signal: controller.signal,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            }
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
            let errorData;
            try {
                errorData = await response.json();
            } catch (e) {
                errorData = { error: `HTTP ${response.status}: ${response.statusText}` };
            }
            
            throw new Error(errorData.error || `Request failed with status ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        clearTimeout(timeoutId);
        
        if (error.name === 'AbortError') {
            throw new Error('Request timed out. Please check your connection.');
        }
        
        if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
            throw new Error('Unable to connect to server. Please check if the server is running.');
        }
        
        throw error;
    }
}

// --- PREPARE ENDPOINTS ---
export const getNews = async (location = 'India') => {
    try {
        const encodedLocation = encodeURIComponent(location);
        return await fetchFromAPI(`/prepare/news?location=${encodedLocation}`);
    } catch (error) {
        console.error('Error fetching news:', error);
        throw new Error(`Failed to fetch news: ${error.message}`);
    }
};

export const getKitItems = async () => {
    try {
        return await fetchFromAPI('/prepare/kit');
    } catch (error) {
        console.error('Error fetching kit items:', error);
        throw new Error(`Failed to fetch emergency kit items: ${error.message}`);
    }
};

export const getInstructions = async () => {
    try {
        return await fetchFromAPI('/prepare/instructions');
    } catch (error) {
        console.error('Error fetching instructions:', error);
        throw new Error(`Failed to fetch safety instructions: ${error.message}`);
    }
};

// --- RESPOND ENDPOINTS ---
export const getShelters = async () => {
    try {
        return await fetchFromAPI('/respond/shelters');
    } catch (error) {
        console.error('Error fetching shelters:', error);
        throw new Error(`Failed to fetch shelter information: ${error.message}`);
    }
};

export async function sendSOSAlert(sosData) {
    // Validate required fields on frontend
    const requiredFields = ['name', 'phone', 'location', 'emergency_type', 'message'];
    const missingFields = requiredFields.filter(field => !sosData[field] || !sosData[field].toString().trim());
    
    if (missingFields.length > 0) {
        throw new Error(`Please fill in all required fields: ${missingFields.join(', ')}`);
    }
    
    // Validate phone number format
    const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
    if (!phoneRegex.test(sosData.phone)) {
        throw new Error('Please enter a valid phone number');
    }
    
    try {
        return await fetchFromAPI('/respond/sos', {
            method: 'POST',
            body: JSON.stringify(sosData)
        });
    } catch (error) {
        console.error('Error sending SOS alert:', error);
        throw new Error(`Failed to send SOS alert: ${error.message}`);
    }
}

// --- RECOVER ENDPOINTS ---
export const getOrganizations = async () => {
    try {
        return await fetchFromAPI('/recover/organizations');
    } catch (error) {
        console.error('Error fetching organizations:', error);
        throw new Error(`Failed to fetch recovery organizations: ${error.message}`);
    }
};

export async function submitAidRequest(requestData) {
    // Validate required fields
    const requiredFields = ['name', 'location', 'aid_needed'];
    const missingFields = requiredFields.filter(field => !requestData[field] || !requestData[field].toString().trim());
    
    if (missingFields.length > 0) {
        throw new Error(`Please fill in all required fields: ${missingFields.join(', ')}`);
    }
    
    // Validate field lengths
    if (requestData.name.length > 255) {
        throw new Error('Name must be less than 255 characters');
    }
    
    if (requestData.location.length > 1000) {
        throw new Error('Location description must be less than 1000 characters');
    }
    
    if (requestData.aid_needed.length > 1000) {
        throw new Error('Aid description must be less than 1000 characters');
    }
    
    try {
        return await fetchFromAPI('/recover/request-aid', {
            method: 'POST',
            body: JSON.stringify(requestData)
        });
    } catch (error) {
        console.error('Error submitting aid request:', error);
        throw new Error(`Failed to submit aid request: ${error.message}`);
    }
}

// --- UTILITY FUNCTIONS ---
export const getLocationNews = async (location, category = 'disaster') => {
    if (!location || !location.trim()) {
        throw new Error('Location is required');
    }
    
    try {
        const encodedLocation = encodeURIComponent(location.trim());
        const encodedCategory = encodeURIComponent(category);
        return await fetchFromAPI(`/prepare/news?location=${encodedLocation}&category=${encodedCategory}`);
    } catch (error) {
        console.error('Error fetching location news:', error);
        throw new Error(`Failed to fetch news for ${location}: ${error.message}`);
    }
};

// Health check function
export const healthCheck = async () => {
    try {
        return await fetchFromAPI('/health');
    } catch (error) {
        console.error('Health check failed:', error);
        throw error;
    }
};

// Test database connection
export const testDatabaseConnection = async () => {
    try {
        return await fetchFromAPI('/test/db');
    } catch (error) {
        console.error('Database test failed:', error);
        throw error;
    }
};

// Configuration object for easy modification
export const API_CONFIG = {
    BASE_URL: API_BASE_URL,
    TIMEOUT: 10000,
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000
};

// Utility function to retry failed requests
async function retryRequest(requestFn, maxAttempts = API_CONFIG.RETRY_ATTEMPTS) {
    let lastError;
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            return await requestFn();
        } catch (error) {
            lastError = error;
            
            if (attempt === maxAttempts) {
                break;
            }
            
            // Don't retry on validation errors (4xx status codes)
            if (error.message.includes('400') || error.message.includes('404')) {
                break;
            }
            
            // Wait before retrying
            await new Promise(resolve => setTimeout(resolve, API_CONFIG.RETRY_DELAY * attempt));
        }
    }
    
    throw lastError;
}

// Enhanced versions with retry logic (optional usage)
export const getNewsWithRetry = (location) => retryRequest(() => getNews(location));
export const getKitItemsWithRetry = () => retryRequest(() => getKitItems());
export const getInstructionsWithRetry = () => retryRequest(() => getInstructions());
export const getSheltersWithRetry = () => retryRequest(() => getShelters());
export const getOrganizationsWithRetry = () => retryRequest(() => getOrganizations());
