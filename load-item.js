import { db } from "./firebase-config.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Global array to cache fetched items
let allItems = [];
let currentCategory = 'all';

// Helper function to remove spaces, capitalization, and special characters
function normalizeText(text) {
    return (text || '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

// Fetch items from Firestore on page load
async function fetchItems() {
    const itemsContainer = document.getElementById('itemsContainer');
    
    try {
        const querySnapshot = await getDocs(collection(db, "items"));
        allItems = [];
        
        querySnapshot.forEach((doc) => {
            allItems.push({
                id: doc.id,
                ...doc.data()
            });
        });

        renderGrid(allItems);
        setupSearchAndCategories();

    } catch (error) {
        console.error("Error fetching items: ", error);
        itemsContainer.innerHTML = `<p class="empty-state">Failed to load items. Please refresh.</p>`;
    }
}

// Render grid cards dynamically
function renderGrid(itemsToDisplay) {
    const itemsContainer = document.getElementById('itemsContainer');
    
    if (!itemsContainer) return;

    if (itemsToDisplay.length === 0) {
        itemsContainer.innerHTML = `<p class="empty-state">No items found</p>`;
        return;
    }

    itemsContainer.innerHTML = itemsToDisplay.map(item => `
        <a href="viewitem.html?id=${item.id}" class="item-card-link">
            <div class="item-card">
                <div style="width:100%; height:90px; border-radius:8px; overflow:hidden; margin-bottom:8px; background:#111;">
                    <img src="${item.imageUrl || item.image || 'https://via.placeholder.com/150'}" alt="${item.name}" style="width:100%; height:100%; object-fit:cover;">
                </div>
                <div>
                    <span class="item-category">${item.category || 'General'}</span>
                    <h3 class="item-name">${item.name || 'Unnamed Item'}</h3>
                </div>
                <div class="item-price">₹${item.price || '0'}</div>
            </div>
        </a>
    `).join('');
}

// Setup live search, auto-suggestions, and category chip filtering
function setupSearchAndCategories() {
    const searchInput = document.getElementById('searchInput');
    const suggestionsBox = document.getElementById('suggestionsBox');
    const categoryContainer = document.getElementById('categoryContainer');

    if (!searchInput) return;

    // 1. Live Typing & Auto-Suggestions Logic
    searchInput.addEventListener('input', (e) => {
        const query = normalizeText(e.target.value);

        if (!query) {
            if (suggestionsBox) suggestionsBox.style.display = 'none';
            filterAndDisplay();
            return;
        }

        // Search across item names and categories flexible match
        const matchingItems = allItems.filter(item => {
            const nameMatch = normalizeText(item.name).includes(query);
            const categoryMatch = normalizeText(item.category).includes(query);
            
            // Check category filter constraint if active
            const passesCategory = currentCategory === 'all' || 
                normalizeText(item.category).includes(normalizeText(currentCategory));

            return (nameMatch || categoryMatch) && passesCategory;
        });

        // Generate 3-4 suggestions
        if (suggestionsBox) {
            const topSuggestions = matchingItems.slice(0, 4);

            if (topSuggestions.length > 0) {
                suggestionsBox.innerHTML = topSuggestions.map(item => `
                    <div class="suggestion-item" data-name="${item.name}">
                        ${item.name}
                    </div>
                `).join('');
                suggestionsBox.style.display = 'block';
            } else {
                suggestionsBox.style.display = 'none';
            }
        }

        renderGrid(matchingItems);
    });

    // 2. Click suggestion item to select
    if (suggestionsBox) {
        suggestionsBox.addEventListener('click', (e) => {
            if (e.target.classList.contains('suggestion-item')) {
                const selectedName = e.target.getAttribute('data-name');
                searchInput.value = selectedName;
                suggestionsBox.style.display = 'none';

                const selectedMatch = allItems.filter(item => 
                    normalizeText(item.name) === normalizeText(selectedName)
                );
                renderGrid(selectedMatch);
            }
        });
    }

    // Close suggestions box when tapping outside
    document.addEventListener('click', (e) => {
        if (suggestionsBox && !e.target.closest('.search-wrapper')) {
            suggestionsBox.style.display = 'none';
        }
    });

    // 3. Category Chip Filter Click Logic
    if (categoryContainer) {
        categoryContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('category-chip')) {
                // Toggle active style
                document.querySelectorAll('.category-chip').forEach(chip => chip.classList.remove('active'));
                e.target.classList.add('active');

                currentCategory = e.target.getAttribute('data-cat') || 'all';
                filterAndDisplay();
            }
        });
    }
}

// Master filter logic combining search input and active category
function filterAndDisplay() {
    const searchInput = document.getElementById('searchInput');
    const query = searchInput ? normalizeText(searchInput.value) : '';

    let filtered = allItems;

    // Filter by category
    if (currentCategory !== 'all') {
        filtered = filtered.filter(item => 
            normalizeText(item.category).includes(normalizeText(currentCategory))
        );
    }

    // Filter by search query
    if (query) {
        filtered = filtered.filter(item => 
            normalizeText(item.name).includes(query) || 
            normalizeText(item.category).includes(query)
        );
    }

    renderGrid(filtered);
}

// Initialize on page load
fetchItems();
