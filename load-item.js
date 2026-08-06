import { db } from "./config.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

async function renderHomepage() {
    const grid = document.getElementById('itemsContainer');
    if (!grid) return;

    try {
        const snapshot = await getDocs(collection(db, "items"));

        if (snapshot.empty) {
            grid.innerHTML = `<p class="empty-state">No items found in Firestore 'items' collection.</p>`;
            return;
        }

        let html = '';
        snapshot.forEach((doc) => {
            const data = doc.data();
            
            // Extract fields exactly as named in your screenshot
            const name = data.name || "No Name";
            const category = data.category || "General";
            const price = data.price !== undefined ? data.price : 0;
            const img = data.imageUrl || "https://via.placeholder.com/150";

            html += `
                <a href="viewitem.html?id=${doc.id}" class="item-card-link">
                    <div class="item-card">
                        <div class="item-img-box">
                            <img src="${img}" alt="${name}">
                        </div>
                        <div>
                            <span class="item-category">${category}</span>
                            <h3 class="item-name">${name}</h3>
                        </div>
                        <div class="item-price">₹${price}</div>
                    </div>
                </a>
            `;
        });

        grid.innerHTML = html;

    } catch (err) {
        grid.innerHTML = `<p class="empty-state" style="color:red;">Error fetching data: ${err.message}</p>`;
    }
}

// Run immediately
renderHomepage();
