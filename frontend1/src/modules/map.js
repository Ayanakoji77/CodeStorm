// modules/map.js - Fixed to use global Leaflet object
let map;

export function initMap() {
    try {
        // Check if Leaflet is loaded
        if (typeof L === 'undefined') {
            throw new Error('Leaflet is not loaded');
        }

        map = L.map('map').setView([20.2961, 85.8245], 10); // Centered on Bhubaneswar
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '© OpenStreetMap'
        }).addTo(map);
        
        console.log('Map initialized successfully');
    } catch (error) {
        console.error('Error initializing map:', error);
    }
}

export function addShelterMarkers(shelters) {
    if (!map || !shelters) {
        console.warn('Map not initialized or no shelter data');
        return;
    }
    
    // Clear existing markers before adding new ones
    map.eachLayer((layer) => {
        if (layer instanceof L.Marker) {
            map.removeLayer(layer);
        }
    });

    shelters.forEach(shelter => {
        try {
            const iconColor = shelter.is_open ? '#10b981' : '#ef4444'; // emerald-500 : red-500
            
            // Create custom icon
            const shelterIcon = L.divIcon({
                className: 'custom-div-icon',
                html: `
                    <div style="
                        background-color: ${iconColor};
                        width: 20px;
                        height: 20px;
                        border-radius: 50%;
                        border: 2px solid white;
                        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 10px;
                        color: white;
                    ">
                        <i class="fa-solid fa-house-chimney-medical"></i>
                    </div>
                `,
                iconSize: [24, 24],
                iconAnchor: [12, 12]
            });

            const marker = L.marker([shelter.latitude, shelter.longitude], { icon: shelterIcon })
                .addTo(map);
            
            // Create popup content
            const popupContent = `
                <div class="text-slate-900">
                    <h4 class="font-bold text-lg mb-2">${shelter.name}</h4>
                    <p class="mb-1"><strong>Status:</strong> 
                        <span class="px-2 py-1 rounded text-xs ${shelter.is_open ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
                            ${shelter.is_open ? 'Open' : 'Closed'}
                        </span>
                    </p>
                    <p><strong>Capacity:</strong> ${shelter.capacity} people</p>
                </div>
            `;
            
            marker.bindPopup(popupContent);
        } catch (error) {
            console.error('Error adding shelter marker:', error, shelter);
        }
    });
}

export function invalidateMapSize() {
    if (map) {
        setTimeout(() => {
            map.invalidateSize();
            console.log('Map size invalidated');
        }, 100);
    }
}
