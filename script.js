// Mobile Menu Logic
function toggleMenu() {
    const menu = document.getElementById('mobile-menu');
    menu.classList.toggle('active');
}

// Scroll to Grid
function scrollToGrid() {
    document.getElementById('grid-title').scrollIntoView({ behavior: 'smooth' });
}

// Data: 4 Books for 4 Subjects, all ₹99
const books = [
    {
        id: 1,
        category: 'math',
        title: "Mathematics: The Ultimate Cheat Sheet",
        author: "Toppers' Academy",
        image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=600&auto=format&fit=crop",
        pages: "150 pgs",
        rating: "4.9"
    },
    {
        id: 2,
        category: 'science',
        title: "Science Lab: Complete Formulas",
        author: "Prof. H. Verma",
        image: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?q=80&w=600&auto=format&fit=crop",
        pages: "120 pgs",
        rating: "4.8"
    },
    {
        id: 3,
        category: 'sst',
        title: "Social Science: History & Civics Map",
        author: "UPSC Mentors",
        image: "https://images.unsplash.com/photo-1447069387593-a5de0862481e?q=80&w=600&auto=format&fit=crop",
        pages: "90 pgs",
        rating: "4.7"
    },
    {
        id: 4,
        category: 'english',
        title: "English Grammar & Literature Guide",
        author: "Oxford Prep",
        image: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=600&auto=format&fit=crop",
        pages: "200 pgs",
        rating: "4.9"
    }
];

const grid = document.getElementById('book-grid');
const gridTitle = document.getElementById('grid-title');

// 1. Filter Logic
function filterBooks(category, btnElement) {
    if (btnElement) {
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        btnElement.classList.add('active');
    }

    let filteredBooks = [];
    if (category === 'all') {
        filteredBooks = books;
        gridTitle.innerText = "All Study Material";
    } else {
        filteredBooks = books.filter(book => book.category === category);
        const titles = { 'math': 'Mathematics', 'science': 'Science', 'sst': 'Social Science', 'english': 'English' };
        gridTitle.innerText = titles[category] + " Material";
    }

    renderGrid(filteredBooks);
}

// 2. Render Grid
function renderGrid(data) {
    if (data.length === 0) {
        grid.innerHTML = `<p style="color:#666; width:100%; grid-column:1/-1; text-align:center;">No books found in this category.</p>`;
        return;
    }

    grid.innerHTML = data.map(book => `
        <div class="book-card" onclick="openModal(${book.id})">
            <div class="book-thumb">
                <img src="${book.image}" alt="${book.title}">
            </div>
            <div class="book-info">
                <div class="book-meta">
                    <span style="text-transform:uppercase; font-size:10px; color:var(--accent); font-weight:bold;">${book.category}</span>
                    <span><i class="ri-star-fill" style="color:gold"></i> ${book.rating}</span>
                </div>
                <h3 class="book-title">${book.title}</h3>
                <p style="color:#666; font-size:12px; margin-bottom:10px;">By ${book.author} • ${book.pages}</p>
                <div class="price-row">
                    <span class="price">₹99</span>
                    <button class="buy-btn">BUY NOW</button>
                </div>
            </div>
        </div>
    `).join('');
}

// 3. Modal Logic
const modal = document.getElementById('modal-overlay');
const form = document.getElementById('purchase-form');
const successMsg = document.getElementById('success-msg');

window.openModal = (id) => {
    const book = books.find(b => b.id === id);
    if(book) {
        document.getElementById('modal-img').src = book.image;
        document.getElementById('modal-title').innerText = book.title;
        document.getElementById('hidden-book-name').value = `Book: ${book.title} | Price: ₹99`;
        
        form.style.display = 'block';
        successMsg.style.display = 'none';
        modal.classList.add('active');
    }
}

window.closeModal = () => {
    modal.classList.remove('active');
}

modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
});

// 4. Handle Form
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    const originalText = btn.innerText;
    btn.innerText = "Processing...";
    btn.disabled = true;

    const formData = new FormData(form);
    
    try {
        const response = await fetch("https://api.web3forms.com/submit", {
            method: "POST",
            body: formData
        });

        if (response.status === 200) {
            form.style.display = 'none';
            successMsg.style.display = 'block';
        } else {
            alert("Error submitting form.");
        }
    } catch (error) {
        alert("Connection error.");
    } finally {
        btn.innerText = originalText;
        btn.disabled = false;
        form.reset();
    }
});

// Init
renderGrid(books);
