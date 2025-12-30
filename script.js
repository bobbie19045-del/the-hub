// --- DATA ---
const books = [
    // Mathematics
    { id: 1, subject: 'math', class: '10', title: "Class 10 Math Formula Book", price: 99, img: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400" },
    { id: 2, subject: 'math', class: '12', title: "Class 12 Calculus Guide", price: 99, img: "https://images.unsplash.com/photo-1596495578065-6e0763fa1178?w=400" },
    
    // Science
    { id: 3, subject: 'science', class: '10', title: "Class 10 Science Lab Manual", price: 99, img: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=400" },
    { id: 4, subject: 'science', class: '12', title: "Physics Vol 1: Mechanics", price: 99, img: "https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=400" },

    // SST
    { id: 5, subject: 'sst', class: '10', title: "History & Civics Mind Maps", price: 99, img: "https://images.unsplash.com/photo-1447069387593-a5de0862481e?w=400" },

    // English
    { id: 6, subject: 'english', class: '12', title: "Flamingo & Vistas Summary", price: 99, img: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400" },
    { id: 7, subject: 'english', class: '10', title: "English Grammar Handbook", price: 99, img: "https://images.unsplash.com/photo-1474932430478-367dbb6832c1?w=400" },

    // Hindi
    { id: 8, subject: 'hindi', class: '10', title: "Hindi Kshitij Quick Notes", price: 99, img: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400" },
    { id: 9, subject: 'hindi', class: '12', title: "Hindi Aroh & Vitan Guide", price: 99, img: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=400" },

    // Punjabi
    { id: 10, subject: 'punjabi', class: '10', title: "Punjabi Vyakaran (Grammar)", price: 99, img: "https://images.unsplash.com/photo-1535905557558-afc4877a26fc?w=400" },
    { id: 11, subject: 'punjabi', class: '12', title: "Punjabi Literature Summary", price: 99, img: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400" }
];

// --- STATE VARIABLES ---
let currentSubject = '';
let currentClass = '';

// --- DOM ELEMENTS ---
const grid = document.getElementById('book-grid');
const resultsSection = document.getElementById('results-section');
const classModal = document.getElementById('class-modal');
const purchaseModal = document.getElementById('purchase-modal');

// --- SCROLL ACTION ---
function scrollToSubjects() {
    document.getElementById('subject-section').scrollIntoView({ behavior: 'smooth' });
}

// --- MOBILE MENU ---
function toggleMenu() {
    document.getElementById('mobile-menu').classList.toggle('active');
}

// --- CLASS MODAL LOGIC ---
function openClassModal(subject) {
    currentSubject = subject;
    classModal.classList.add('active');
}

function closeClassModal() {
    classModal.classList.remove('active');
}

// --- CLASS SELECTION & RENDERING ---
function selectClass(cls) {
    currentClass = cls;
    closeClassModal(); // Close modal
    
    // Filter
    const filtered = books.filter(b => b.subject === currentSubject && b.class === cls);
    
    // Update Title
    const subTitle = currentSubject.charAt(0).toUpperCase() + currentSubject.slice(1);
    document.getElementById('grid-title').innerText = `${subTitle} (Class ${cls})`;
    
    renderGrid(filtered);
    
    // Show results
    resultsSection.style.display = 'block';
    resultsSection.scrollIntoView({ behavior: 'smooth' });
}

// --- RENDER GRID ---
function renderGrid(data) {
    if(data.length === 0) {
        grid.innerHTML = `<p style="grid-column:1/-1; text-align:center; color:#888; padding: 40px;">No notes uploaded for this combination yet. Check back soon!</p>`;
        return;
    }
    
    grid.innerHTML = data.map(book => `
        <div class="book-card" onclick="openBuyModal(${book.id})">
            <div class="book-thumb">
                <img src="${book.img}" alt="${book.title}">
            </div>
            <div class="book-info">
                <div class="book-title">${book.title}</div>
                <div class="price-row">
                    <span class="price">₹${book.price}</span>
                    <button class="buy-btn">BUY</button>
                </div>
            </div>
        </div>
    `).join('');
}

// --- SEARCH ---
function searchBooks(query) {
    if(!query) {
        if(resultsSection.style.display !== 'none') {
             // Optional: Do nothing or hide if you want
        }
        return;
    }
    
    query = query.toLowerCase();
    const filtered = books.filter(b => b.title.toLowerCase().includes(query));
    
    document.getElementById('grid-title').innerText = `Search Results for "${query}"`;
    resultsSection.style.display = 'block';
    renderGrid(filtered);
}

function resetFilters() {
    resultsSection.style.display = 'none';
    const heroInput = document.getElementById('hero-search-input');
    const deskInput = document.getElementById('desktop-search');
    if(heroInput) heroInput.value = '';
    if(deskInput) deskInput.value = '';
}

// --- PURCHASE MODAL ---
function openBuyModal(id) {
    const book = books.find(b => b.id === id);
    if(book) {
        document.getElementById('modal-img').src = book.img;
        document.getElementById('modal-title').innerText = book.title;
        document.getElementById('hidden-book-name').value = book.title;
        purchaseModal.classList.add('active');
    }
}

function closePurchaseModal() {
    purchaseModal.classList.remove('active');
}

// Close modals on outside click
window.onclick = function(event) {
    if (event.target == classModal) closeClassModal();
    if (event.target == purchaseModal) closePurchaseModal();
}

// --- FORM SUBMISSION ---
document.getElementById('purchase-form').addEventListener('submit', function(e) {
    // Note: To use Web3Forms properly, remove e.preventDefault() in production
    e.preventDefault(); 
    
    const btn = this.querySelector('button[type="submit"]');
    const originalText = btn.innerText;
    btn.innerText = 'Processing...';
    btn.disabled = true;
    
    setTimeout(() => {
        this.style.display = 'none';
        document.getElementById('success-msg').style.display = 'block';
        btn.innerText = originalText;
        btn.disabled = false;
    }, 1500);
});
