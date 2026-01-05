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
document.addEventListener('DOMContentLoaded', () => {
    fetchBooksFromSupabase();
    checkPendingSuccess(); // Check if user has a pending success popup
});

async function fetchBooksFromSupabase() {
    const { data, error } = await supabaseClient
        .from('books')
        .select('*');

    if (error) {
        console.error('Error fetching books:', error);
    } else {
        books = data;
    }
}

// --- CHECK LOCAL STORAGE FOR PERSISTENT POPUP ---
function checkPendingSuccess() {
    // If the flag exists in local storage
    if (localStorage.getItem('pendingOrderSuccess') === 'true') {
        const form = document.getElementById('purchase-form');
        const successMsg = document.getElementById('success-msg');
        const modalTitle = document.getElementById('modal-title');
        
        // Setup UI
        if(form) form.style.display = 'none';
        if(successMsg) successMsg.style.display = 'block';
        if(modalTitle) modalTitle.innerText = "Order Successful";
        
        // Show Modal
        purchaseModal.classList.add('active');
    }
}

// --- CLOSE SUCCESS POPUP (Clears Local Storage) ---
function closeSuccessPopup() {
    // Remove the flag so it doesn't show again
    localStorage.removeItem('pendingOrderSuccess');
    
    // Reset UI
    const form = document.getElementById('purchase-form');
    const successMsg = document.getElementById('success-msg');
    
    purchaseModal.classList.remove('active');
    
    // Reset form display for next time
    setTimeout(() => {
        if(form) form.style.display = 'block';
        if(successMsg) successMsg.style.display = 'none';
    }, 300);
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
        grid.innerHTML = '<p style="grid-column:1/-1; text-align:center; color:#888; padding: 40px;">No notes uploaded yet. Check back soon!</p>';
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
        
        // Store price for the form logic
        const form = document.getElementById('purchase-form');
        if(form) {
            form.dataset.price = book.price;
            // Ensure form is visible (in case it was hidden by success state previously)
            form.style.display = 'block';
        }
        document.getElementById('success-msg').style.display = 'none';
        
        purchaseModal.classList.add('active');
    }
}

function closePurchaseModal() {
    // Only close if it's NOT the success screen (user must click the specific button to clear storage)
    // Or we can just close it, but the storage remains until they click the specific button.
    purchaseModal.classList.remove('active');
}

// Close modals on outside click
window.onclick = function(event) {
    if (event.target == classModal) closeClassModal();
    // We allow closing purchase modal by clicking outside, 
    // but if it was a success state, the flag remains in localStorage until they click "Close Window"
    if (event.target == purchaseModal) closePurchaseModal();
}

// --- FORM SUBMISSION (Supabase -> Web3Forms -> LocalStorage -> UPI) ---
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
        const amount = this.dataset.price || '99'; // Default to 99 if missing

        // 1. SAVE TO SUPABASE
        const { error } = await supabaseClient
            .from('orders')
            .insert({
                customer_name: formObject.name,
                customer_phone: formObject.phone,
                customer_email: formObject.email,
                book_title: formObject.book_details,
                amount: amount
            });

        if (error) {
            console.error("Supabase Error:", error);
            alert("Connection error. Please try again.");
            btn.innerText = originalText;
            btn.disabled = false;
            return;
        }

        // 2. SEND EMAIL (WEB3FORMS)
        try {
            await fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(formObject)
            });
        } catch (err) {
            console.log("Email trigger failed, but database saved.");
        }

        // 3. SET LOCAL STORAGE FLAG (For persistent popup)
        localStorage.setItem('pendingOrderSuccess', 'true');

        // 4. UPDATE UI
        purchaseForm.style.display = 'none';
        const successMsg = document.getElementById('success-msg');
        if(successMsg) successMsg.style.display = 'block';
        btn.innerText = originalText;
        btn.disabled = false;

        // 5. REDIRECT TO UPI APP
        // We use a small timeout to allow the UI to update first
        setTimeout(() => {
            // Dynamic Link: uses the actual book price
            // Format: upi://pay?pa=ADDRESS&pn=NAME&am=AMOUNT&cu=INR
            const upiUrl = `upi://pay?pa=gurjotsingh0602@fam&pn=PaadhaiHub&am=${amount}&cu=INR`;
            
            // Redirect user
            window.location.href = upiUrl;
        }, 1000);
    });
}
