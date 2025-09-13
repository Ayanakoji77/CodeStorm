// ui.js - Updated to handle exact database schema fields
export function renderNewsArticles(articles) {
    const newsContainer = document.getElementById('news-container');
    if (!articles || articles.length === 0) {
        newsContainer.innerHTML = '<p class="text-slate-400">No recent news alerts found.</p>';
        return;
    }

    const articlesHTML = articles.slice(0, 5).map(article => `
        <li class="flex items-start space-x-3 p-3 bg-slate-700/50 rounded-lg">
            <i class="fa-solid fa-triangle-exclamation text-xl text-yellow-400 mt-1"></i>
            <div class="flex-1">
                <a href="${article.url}" target="_blank" rel="noopener noreferrer" 
                   class="font-semibold text-slate-100 hover:text-emerald-400 transition block mb-1 leading-tight">
                   ${article.title}
                </a>
                <div class="text-slate-400 text-xs">
                    ${new Date(article.publishedAt).toLocaleString()} - ${article.source.name}
                </div>
                ${article.description ? `<p class="text-slate-300 text-xs mt-1 line-clamp-2">${article.description.substring(0, 120)}...</p>` : ''}
            </div>
        </li>
    `).join('');
    newsContainer.innerHTML = articlesHTML;
}

export function renderKitItems(items) {
    const kitList = document.getElementById('kit-list');
    if (!items || items.length === 0) {
        kitList.innerHTML = '<li class="text-slate-400">No kit items available.</li>';
        return;
    }
    
    // Group items by category if available
    const groupedItems = {};
    items.forEach(item => {
        const category = item.category || 'General';
        if (!groupedItems[category]) {
            groupedItems[category] = [];
        }
        groupedItems[category].push(item);
    });

    let html = '';
    Object.keys(groupedItems).forEach(category => {
        html += `<li class="mb-3">
            <h4 class="text-emerald-400 font-semibold text-sm mb-2">${category}</h4>
            <ul class="space-y-1 ml-4">`;
        
        groupedItems[category].forEach(item => {
            html += `<li class="flex items-start space-x-2">
                <i class="fa-solid fa-check text-emerald-400 text-xs mt-1 flex-shrink-0"></i>
                <div>
                    <span class="text-slate-200">${item.item_name}</span>
                    ${item.description ? `<p class="text-slate-400 text-xs mt-1">${item.description}</p>` : ''}
                </div>
            </li>`;
        });
        
        html += `</ul></li>`;
    });
    
    kitList.innerHTML = html;
}

export function renderInstructions(instructions) {
    const container = document.getElementById('instructions-container');
    if (!instructions || instructions.length === 0) {
        container.innerHTML = '<p class="text-slate-400">No instructions available.</p>';
        return;
    }

    // Group by disaster_type if available
    const groupedInstructions = {};
    instructions.forEach(inst => {
        const type = inst.disaster_type || 'General';
        if (!groupedInstructions[type]) {
            groupedInstructions[type] = [];
        }
        groupedInstructions[type].push(inst);
    });

    let html = '';
    Object.keys(groupedInstructions).forEach(type => {
        html += `<div class="mb-4">
            <h4 class="text-blue-400 font-semibold text-sm mb-3 flex items-center">
                <i class="fa-solid fa-${getDisasterIcon(type)} mr-2"></i>
                ${type.charAt(0).toUpperCase() + type.slice(1)}
            </h4>
            <div class="space-y-3">`;
        
        groupedInstructions[type].forEach(inst => {
            html += `<div class="p-4 bg-slate-700/50 rounded-lg border-l-4 border-blue-400">
                <h5 class="font-bold text-slate-100 mb-2">${inst.title}</h5>
                <p class="text-slate-300 text-sm leading-relaxed">${inst.content}</p>
            </div>`;
        });
        
        html += `</div></div>`;
    });
    
    container.innerHTML = html;
}

function getDisasterIcon(type) {
    const icons = {
        'earthquake': 'house-crack',
        'flood': 'water',
        'fire': 'fire',
        'cyclone': 'wind',
        'heatwave': 'temperature-high',
        'general': 'info-circle',
        'default': 'exclamation-triangle'
    };
    return icons[type?.toLowerCase()] || icons.default;
}

export function renderOrganizations(organizations) {
    const container = document.getElementById('organizations-container');
    if (!organizations || organizations.length === 0) {
        container.innerHTML = '<p class="text-slate-400">No organizations found.</p>';
        return;
    }

    // Group by type
    const groupedOrgs = {};
    organizations.forEach(org => {
        const type = org.type || 'Other';
        if (!groupedOrgs[type]) {
            groupedOrgs[type] = [];
        }
        groupedOrgs[type].push(org);
    });

    let html = '';
    Object.keys(groupedOrgs).forEach(type => {
        html += `<div class="mb-6">
            <h4 class="text-emerald-400 font-semibold text-sm mb-3 flex items-center">
                <i class="fa-solid fa-${getOrgIcon(type)} mr-2"></i>
                ${type.charAt(0).toUpperCase() + type.slice(1)} Organizations
            </h4>
            <div class="space-y-3">`;
        
        groupedOrgs[type].forEach(org => {
            html += `<div class="p-4 bg-slate-700/50 rounded-lg hover:bg-slate-700/70 transition-colors">
                <div class="flex items-start justify-between">
                    <div class="flex-1 min-w-0">
                        <h5 class="font-bold text-slate-100 flex items-center mb-1">
                            <i class="fa-solid fa-${getOrgIcon(org.type)} mr-2 text-emerald-400 flex-shrink-0"></i>
                            <span class="truncate">${org.name}</span>
                        </h5>
                        
                        ${org.description ? `<p class="text-slate-300 text-sm mb-3 leading-relaxed">${org.description}</p>` : ''}
                        
                        <div class="space-y-1 text-xs text-slate-400">
                            ${org.contact ? `<div class="flex items-center"><i class="fa-solid fa-phone mr-2 w-3"></i> ${org.contact}</div>` : ''}
                            ${org.email ? `<div class="flex items-center"><i class="fa-solid fa-envelope mr-2 w-3"></i> ${org.email}</div>` : ''}
                            ${org.website ? `<div class="flex items-center"><i class="fa-solid fa-globe mr-2 w-3"></i> <a href="${org.website}" target="_blank" class="text-emerald-400 hover:underline truncate">${org.website}</a></div>` : ''}
                            ${org.address ? `<div class="flex items-start"><i class="fa-solid fa-location-dot mr-2 w-3 mt-0.5"></i> <span class="leading-tight">${org.address}</span></div>` : ''}
                        </div>
                    </div>
                    
                    <div class="flex flex-col space-y-2 ml-4 flex-shrink-0">
                        ${org.contact ? `<a href="tel:${org.contact}" 
                            class="bg-emerald-500 text-slate-900 px-3 py-1 rounded text-xs font-medium hover:bg-emerald-600 transition-colors text-center">
                            <i class="fa-solid fa-phone mr-1"></i>Call
                        </a>` : ''}
                        ${org.email ? `<a href="mailto:${org.email}" 
                            class="bg-blue-500 text-white px-3 py-1 rounded text-xs font-medium hover:bg-blue-600 transition-colors text-center">
                            <i class="fa-solid fa-envelope mr-1"></i>Email
                        </a>` : ''}
                    </div>
                </div>
            </div>`;
        });
        
        html += `</div></div>`;
    });
    
    container.innerHTML = html;
}

function getOrgIcon(type) {
    const icons = {
        'government': 'landmark',
        'ngo': 'heart',
        'hospital': 'hospital',
        'emergency': 'truck-medical',
        'police': 'shield-halved',
        'fire': 'fire-extinguisher',
        'rescue': 'helicopter',
        'medical': 'user-doctor',
        'relief': 'hand-holding-heart',
        'default': 'building'
    };
    return icons[type?.toLowerCase()] || icons.default;
}

// Enhanced message function with better styling
export function showMessage(message, type = 'success') {
    const messageEl = document.getElementById('error-message');
    if (messageEl) {
        const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500';
        const icon = type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle';
        
        messageEl.className = `fixed top-20 left-1/2 -translate-x-1/2 px-6 py-3 rounded-lg shadow-lg z-[3000] ${bgColor} text-white max-w-md text-center`;
        messageEl.innerHTML = `<i class="fa-solid ${icon} mr-2"></i>${message}`;
        messageEl.style.display = 'block';
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            messageEl.style.display = 'none';
        }, 5000);
        
        // Allow manual dismissal by clicking
        messageEl.onclick = () => {
            messageEl.style.display = 'none';
        };
    }
}

// Utility function to render location-specific news
export function renderLocationNews(articles, containerId = 'location-news-container') {
    const container = document.getElementById(containerId);
    if (!articles || articles.length === 0) {
        container.innerHTML = '<li class="text-slate-400">No recent alerts found for this location.</li>';
        return;
    }

    const articlesHTML = articles.slice(0, 3).map(article => `
        <li class="flex items-start space-x-3 p-3 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors">
            <i class="fa-solid fa-location-dot text-lg text-emerald-400 mt-1 flex-shrink-0"></i>
            <div class="flex-1 min-w-0">
                <a href="${article.url}" target="_blank" rel="noopener noreferrer" 
                   class="font-semibold text-slate-100 hover:text-emerald-400 transition text-sm block mb-1 leading-tight">
                   ${article.title}
                </a>
                <div class="text-slate-400 text-xs">
                    ${new Date(article.publishedAt).toLocaleString()} - ${article.source.name}
                </div>
            </div>
        </li>
    `).join('');
    container.innerHTML = articlesHTML;
}
