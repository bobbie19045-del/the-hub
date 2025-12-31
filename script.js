// --- SUPABASE CONFIGURATION ---
const SUPABASE_URL = 'https://kooylsdmfsxqeejcwefp.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtvb3lsc2RtZnN4cWVlamN3ZWZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcxNzMzNjksImV4cCI6MjA4Mjc0OTM2OX0.PA4U9v_t70c4n5sZhKIqTSe2jxxMeStLTdgax-19BHA';
// FIX: We named this 'supabaseClient' instead of 'supabase' to avoid the name conflict
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// --- STATE VARIABLES ---
let books = []; 
let currentSubject = '';
let currentClass = '';

// --- DOM ELEMENTS ---
const grid = document.getElementById('book-grid');
const resultsSection = document.getElementById('results-section');
const classModal = document.getElementById('class-modal');
const purchaseModal = document.getElementById('purchase-modal');

// --- INITIAL LOAD ---
document.addEventListener('DOMContentLoaded', fetchBooksFromSupabase);

async function fetchBooksFromSupabase() {
    // FIX: Updated to use 'supabaseClient'
    const { data, error } = await supabaseClient
        .from('books')
        .select('*');

    if (error) {
        console.error('Error fetching books:', error);
    } else {
        books = data;
        console.log("Books loaded:", books);
    }
}

// --- SCROLL ACTION ---
function scrollToSubjects() {
    const section = document.getElementById('subject-section');
    if(section) section.scrollIntoView({ behavior: 'smooth' });
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
    closeClassModal();

    // Filter using the data from Supabase
    const filtered = books.filter(b => b.subject === currentSubject && b.class === cls);

    const subTitle = currentSubject.charAt(0).toUpperCase() + currentSubject.slice(1);
    const titleEl = document.getElementById('grid-title');
    if(titleEl) titleEl.innerText = `${subTitle} (Class ${cls})`;

    renderGrid(filtered);

    if(resultsSection) {
        resultsSection.style.display = 'block';
        resultsSection.scrollIntoView({ behavior: 'smooth' });
    }
}

// --- RENDER GRID ---
function renderGrid(data) {
    if(!grid) return;

    if(data.length === 0) {
        grid.innerHTML = '<p style="grid-column:1/-1; text-align:center; color:#888; padding: 40px;">No notes uploaded yet. </p>';
        return;
    }

    grid.innerHTML = data.map(book => `
        <div class="book-card" onclick="openBuyModal(${book.id})">
            <div class="book-thumb">
                <img src="${book.img_url}" alt="${book.title}" onerror="this.src='https://placehold.co/400x500?text=No+Image'">
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

// --- RESET FILTER ---
function resetFilters() {
    if(resultsSection) resultsSection.style.display = 'none';
}

// --- PURCHASE MODAL ---
function openBuyModal(id) {
    const book = books.find(b => b.id === id);
    if(book) {
        document.getElementById('modal-img').src = book.img_url;
        document.getElementById('modal-title').innerText = book.title;
        document.getElementById('hidden-book-name').value = book.title;
        
        // Store price for the form
        const form = document.getElementById('purchase-form');
        if(form) form.dataset.price = book.price;
        
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
const purchaseForm = document.getElementById('purchase-form');

if(purchaseForm) {
    purchaseForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        const btn = this.querySelector('button[type="submit"]');
        const originalText = btn.innerText;
        btn.innerText = 'Processing...';
        btn.disabled = true;

        const formData = new FormData(purchaseForm);
        const formObject = Object.fromEntries(formData);

        // FIX: Updated to use 'supabaseClient'
        const { error } = await supabaseClient
            .from('orders')
            .insert({
                customer_name: formObject.name,
                customer_phone: formObject.phone,
                customer_email: formObject.email,
                book_title: formObject.book_details,
                amount: this.dataset.price
            });

        if (error) {
            console.error("Supabase Error:", error);
            alert("Error saving order. Please try again.");
            btn.innerText = originalText;
            btn.disabled = false;
            return;
        }

        // Backup: Send Email via Web3Forms
        try {
            await fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(formObject)
            });
        } catch (err) {
            console.log("Email failed, but database saved.");
        }

        // Success UI
        purchaseForm.style.display = 'none';
        const successMsg = document.getElementById('success-msg');
        if(successMsg) successMsg.style.display = 'block';
        
        btn.innerText = originalText;
        btn.disabled = false;
    });
}
