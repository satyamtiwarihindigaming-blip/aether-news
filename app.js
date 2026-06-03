/* ==========================================================================
   AETHERNEWS - Application Logic & Dynamic UI
   ========================================================================== */

let postsData = [];
let activeCategory = 'all';

// DOM Elements
const postsGrid = document.getElementById('posts-grid');
const filterBtns = document.querySelectorAll('.filter-btn');
const postModal = document.getElementById('post-modal');
const modalClose = document.getElementById('modal-close');
const modalImg = document.getElementById('modal-img');
const modalTag = document.getElementById('modal-tag');
const modalDate = document.getElementById('modal-date');
const modalTitle = document.getElementById('modal-title');
const modalContent = document.getElementById('modal-content');
const modalSourceBtn = document.getElementById('modal-source-btn');

// Stats Elements
const statPosts = document.getElementById('stat-posts');

// Initial Setup
async function initApp() {
  // Setup icon pack
  lucide.createIcons();
  
  // Setup listeners for category filtering
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Toggle active states
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      activeCategory = btn.dataset.category;
      renderPosts();
    });
  });

  // Modal close listeners
  modalClose.addEventListener('click', closeModal);
  postModal.addEventListener('click', (e) => {
    if (e.target === postModal) closeModal();
  });
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });

  // Fetch dynamic content
  await fetchPosts();
}

// Fetch Content from posts.json database
async function fetchPosts() {
  try {
    // Add small timeout simulation for aesthetic skeleton loading experience
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // We add cache busting parameter to prevent browser caching of scraped data
    const response = await fetch(`posts.json?t=${Date.now()}`);
    if (!response.ok) throw new Error('Failed to load news posts.');
    
    postsData = await response.json();
    
    // Update stats counter
    statPosts.textContent = postsData.length;
    
    renderPosts();
  } catch (error) {
    console.error('Error fetching posts:', error);
    postsGrid.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 3rem; background: rgba(255,0,0,0.05); border: 1px dashed rgba(255,0,0,0.2); border-radius: 20px;">
        <i data-lucide="alert-triangle" style="width: 40px; height: 40px; color: #ff5252; margin-bottom: 1rem;"></i>
        <h3 style="font-family: var(--font-display); font-size: 1.25rem; margin-bottom: 0.5rem;">Connection error</h3>
        <p style="color: var(--text-secondary); font-size: 0.9rem;">Could not load news feed. Running local python server? (py -m http.server)</p>
      </div>
    `;
    lucide.createIcons();
  }
}

// Render dynamic posts grid
function renderPosts() {
  postsGrid.innerHTML = '';
  
  // Filter posts by category
  const filteredPosts = activeCategory === 'all' 
    ? postsData 
    : postsData.filter(p => p.category.toLowerCase() === activeCategory);

  if (filteredPosts.length === 0) {
    postsGrid.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 4rem 2rem; color: var(--text-muted);">
        <i data-lucide="search-code" style="width: 48px; height: 48px; margin-bottom: 1rem; stroke-width: 1.5;"></i>
        <p style="font-family: var(--font-display); font-size: 1.1rem;">No articles found in this category.</p>
      </div>
    `;
    lucide.createIcons();
    return;
  }

  filteredPosts.forEach(post => {
    const card = document.createElement('div');
    card.className = 'post-card';
    card.innerHTML = `
      <div class="card-img-wrapper">
        <img src="${post.imageUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=60'}" 
             alt="${post.title}" 
             class="post-img" 
             loading="lazy"
             onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=60';">
      </div>
      <div class="post-content">
        <div class="post-meta">
          <span class="post-tag tag-${post.category.toLowerCase()}">${post.category}</span>
          <span class="post-date">${formatDate(post.date)}</span>
        </div>
        <h3 class="post-title">${post.title}</h3>
        <p class="post-desc">${post.summary || post.content}</p>
        <div class="post-footer">
          Read Story <i data-lucide="arrow-right"></i>
        </div>
      </div>
    `;

    // Click handler to open details modal
    card.addEventListener('click', () => openModal(post));
    postsGrid.appendChild(card);
  });

  // Initialize newly rendered icons
  lucide.createIcons();
}

// Modal management
function openModal(post) {
  modalImg.style.backgroundImage = `url('${post.imageUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80'}')`;
  modalTag.textContent = post.category;
  modalTag.className = `post-tag tag-${post.category.toLowerCase()}`;
  modalDate.textContent = formatDate(post.date);
  modalTitle.textContent = post.title;
  
  // Format body text paragraphs
  const paragraphs = post.content.split('\n\n');
  modalContent.innerHTML = paragraphs.map(p => `<p style="margin-bottom: 1.25rem;">${p}</p>`).join('');
  
  modalSourceBtn.href = post.sourceUrl || '#';
  
  postModal.classList.remove('hidden');
  // force layout reflow for CSS scale-up transition
  void postModal.offsetWidth;
  postModal.classList.add('active');
  
  // disable body scrolling when modal is open
  document.body.style.overflow = 'hidden';
  lucide.createIcons();
}

function closeModal() {
  postModal.classList.remove('active');
  document.body.style.overflow = '';
  setTimeout(() => {
    postModal.classList.add('hidden');
  }, 300); // match transition timing
}

// Date helper format
function formatDate(dateString) {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  } catch (e) {
    return dateString;
  }
}

// Load
window.addEventListener('DOMContentLoaded', initApp);
