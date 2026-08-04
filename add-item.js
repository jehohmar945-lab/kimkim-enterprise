import { db } from "./firebase-config.js";
import { collection, addDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Cloudinary Configuration
const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/c11eiy6u/image/upload";
const CLOUDINARY_PRESET = "kimkim_preset"; 

const form = document.getElementById('addItemForm');

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const category = document.getElementById('categorySelect').value;
    const name = document.getElementById('itemName').value.trim();
    const price = document.getElementById('itemPrice').value;
    const imageInput = document.getElementById('imageInput');
    const submitBtn = form.querySelector('.btn-upload');

    if (!category || !name || !price || !imageInput.files[0]) {
        alert('All fields including an image are required!');
        return;
    }

    try {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Uploading...';

        // 1. Upload image to Cloudinary
        const file = imageInput.files[0];
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', CLOUDINARY_PRESET);

        const uploadRes = await fetch(CLOUDINARY_URL, {
            method: 'POST',
            body: formData
        });
        
        const uploadData = await uploadRes.json();
        
        if (!uploadData.secure_url) {
            throw new Error('Failed to upload image to Cloudinary.');
        }

        const imageUrl = uploadData.secure_url;

        // 2. Save item details to Firestore
        await addDoc(collection(db, "items"), {
            name: name,
            category: category,
            price: Number(price),
            imageUrl: imageUrl,
            createdAt: new Date()
        });

        alert('Item uploaded successfully!');
        window.location.href = "homepage.html"; // Go home to see the new item

    } catch (error) {
        console.error("Upload failed: ", error);
        alert('Failed to upload item. Check console for details.');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Upload Item';
    }
});
