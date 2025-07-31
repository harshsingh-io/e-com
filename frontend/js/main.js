// Configuration
const API_BASE_URL = 'http://127.0.0.1:5000';

// Main JavaScript for product list page
document.addEventListener('DOMContentLoaded', function() {
    const loadingElement = document.getElementById('loading');
    const errorElement = document.getElementById('error');
    const errorMessageElement = document.getElementById('error-message');
    const productsContainer = document.getElementById('products-container');
    const departmentFilter = document.getElementById('department-filter');
    const productsCountElement = document.getElementById('products-count');
    const paginationContainer = document.getElementById('pagination-container');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const paginationText = document.getElementById('pagination-text');
    const paginationSummaryText = document.getElementById('pagination-summary-text');
    const searchBox = document.getElementById('search-box');
    const searchBtn = document.getElementById('search-btn');

    // State management
    let currentPage = 1;
    let currentDepartmentId = null;
    let currentSearchQuery = '';
    let paginationData = null;
    let searchTimeout = null;

    // Function to show error message
    function showError(message) {
        loadingElement.style.display = 'none';
        errorMessageElement.textContent = message;
        errorElement.style.display = 'block';
    }

    // Function to hide loading and error messages
    function hideMessages() {
        loadingElement.style.display = 'none';
        errorElement.style.display = 'none';
    }

    // Function to get product icon based on department
    function getProductIcon(department) {
        const icons = {
            'electronics': 'fas fa-laptop',
            'clothing': 'fas fa-tshirt',
            'books': 'fas fa-book',
            'home goods': 'fas fa-home',
            'beauty': 'fas fa-heart',
            'sports': 'fas fa-dumbbell',
            'toys': 'fas fa-gamepad',
            'automotive': 'fas fa-car'
        };
        return icons[department.toLowerCase()] || 'fas fa-box';
    }

    // Function to create a product card element
    function createProductCard(product) {
        const productCard = document.createElement('a');
        productCard.className = 'product-card';
        productCard.href = `product.html?id=${product.id}`;
        
        const icon = getProductIcon(product.department);
        
        productCard.innerHTML = `
            <div class="product-image">
                <i class="${icon}"></i>
                <div class="product-badge">${escapeHtml(product.department)}</div>
            </div>
            <div class="product-content">
                <div class="product-name">${escapeHtml(product.name)}</div>
                <div class="product-price">$${product.price.toFixed(2)}</div>
            </div>
            <div class="product-actions">
                <button class="btn-primary" onclick="event.preventDefault(); addToCart(${product.id})">
                    <i class="fas fa-shopping-cart"></i>
                    Add to Cart
                </button>
            </div>
        `;
        
        return productCard;
    }

    // Function to escape HTML to prevent XSS
    function escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, function(m) { return map[m]; });
    }

    // Function to update pagination display
    function updatePaginationDisplay(pagination) {
        paginationData = pagination;
        
        // Update pagination text
        paginationText.textContent = `Page ${pagination.page} of ${pagination.total_pages}`;
        
        // Update summary text
        const startItem = ((pagination.page - 1) * pagination.per_page) + 1;
        const endItem = Math.min(pagination.page * pagination.per_page, pagination.total);
        paginationSummaryText.textContent = `Showing ${startItem}-${endItem} of ${pagination.total} products`;
        
        // Update button states
        prevBtn.disabled = !pagination.has_prev;
        nextBtn.disabled = !pagination.has_next;
        
        // Show pagination container if there are multiple pages
        if (pagination.total_pages > 1) {
            paginationContainer.style.display = 'flex';
        } else {
            paginationContainer.style.display = 'none';
        }
    }

    // Function to update products count with search context
    function updateProductsCount(pagination, isFiltered = false, filterName = '', searchQuery = '') {
        let text = `${pagination.total} products`;
        
        if (searchQuery && isFiltered && filterName) {
            text = `${pagination.total} products for "${searchQuery}" in ${filterName}`;
        } else if (searchQuery) {
            text = `${pagination.total} products for "${searchQuery}"`;
        } else if (isFiltered && filterName) {
            text = `${pagination.total} products in ${filterName}`;
        }
        
        productsCountElement.textContent = text;
    }

    // Function to render products with search context
    function renderProducts(data, isFiltered = false, filterName = '', searchQuery = '') {
        hideMessages();
        productsContainer.innerHTML = '';
        
        const products = data.products;
        const pagination = data.pagination;
        
        updateProductsCount(pagination, isFiltered, filterName, searchQuery);
        updatePaginationDisplay(pagination);
        
        if (products.length === 0) {
            let emptyMessage = 'No products found';
            let emptySubtext = 'Try adjusting your filters or search for something else.';
            
            if (searchQuery) {
                emptyMessage = `No products found for "${searchQuery}"`;
                emptySubtext = 'Try a different search term or check your spelling.';
            }
            
            productsContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-search"></i>
                    <h3>${emptyMessage}</h3>
                    <p>${emptySubtext}</p>
                </div>
            `;
            return;
        }

        products.forEach(product => {
            const productCard = createProductCard(product);
            productsContainer.appendChild(productCard);
        });
    }

    // Function to fetch and display products with search, filters, and pagination
    function loadProducts(departmentId = null, page = 1, searchQuery = '') {
        // Show loading while fetching
        loadingElement.style.display = 'block';
        hideMessages();
        productsCountElement.textContent = 'Loading products...';
        paginationContainer.style.display = 'none';
        
        // Update current state
        currentPage = page;
        currentDepartmentId = departmentId;
        currentSearchQuery = searchQuery;
        
        // Build API URL with all parameters
        let apiUrl = `${API_BASE_URL}/api/products?page=${page}&per_page=12`;
        if (departmentId) {
            apiUrl += `&department_id=${departmentId}`;
        }
        if (searchQuery.trim()) {
            apiUrl += `&search=${encodeURIComponent(searchQuery.trim())}`;
        }

        fetch(apiUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                const selectedOption = departmentFilter.options[departmentFilter.selectedIndex];
                const filterName = selectedOption.text !== 'All Products' ? selectedOption.text : '';
                const isFiltered = departmentId !== null;
                
                renderProducts(data, isFiltered, filterName, searchQuery);
            })
            .catch(error => {
                console.error('Error fetching products:', error);
                showError('Failed to load products. Please try again later.');
                productsCountElement.textContent = 'Error loading products';
                paginationContainer.style.display = 'none';
            });
    }

    // Debounced search function
    function debounceSearch(searchQuery) {
        // Clear existing timeout
        if (searchTimeout) {
            clearTimeout(searchTimeout);
        }
        
        // Set new timeout for 300ms delay
        searchTimeout = setTimeout(() => {
            loadProducts(currentDepartmentId, 1, searchQuery); // Reset to page 1 on search
        }, 300);
    }

    // Function to load and populate departments dropdown
    function loadDepartments() {
        fetch(`${API_BASE_URL}/api/departments`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(departments => {
                // Clear existing options (except "All Products")
                departmentFilter.innerHTML = '<option value="">All Products</option>';
                
                // Add department options
                departments.forEach(department => {
                    const option = document.createElement('option');
                    option.value = department.id;
                    option.textContent = department.name;
                    departmentFilter.appendChild(option);
                });
            })
            .catch(error => {
                console.error('Error fetching departments:', error);
                // Don't show error for departments as it's not critical
            });
    }

    // Event listener for department filter change
    departmentFilter.addEventListener('change', function() {
        const selectedDepartmentId = this.value;
        loadProducts(selectedDepartmentId || null, 1, currentSearchQuery); // Keep search query
    });

    // Event listeners for search functionality
    searchBox.addEventListener('input', function() {
        const searchQuery = this.value;
        debounceSearch(searchQuery);
    });

    searchBtn.addEventListener('click', function() {
        const searchQuery = searchBox.value;
        loadProducts(currentDepartmentId, 1, searchQuery);
    });

    // Allow search on Enter key
    searchBox.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            const searchQuery = this.value;
            loadProducts(currentDepartmentId, 1, searchQuery);
        }
    });

    // Event listeners for pagination buttons
    prevBtn.addEventListener('click', function() {
        if (paginationData && paginationData.has_prev) {
            loadProducts(currentDepartmentId, currentPage - 1, currentSearchQuery);
        }
    });

    nextBtn.addEventListener('click', function() {
        if (paginationData && paginationData.has_next) {
            loadProducts(currentDepartmentId, currentPage + 1, currentSearchQuery);
        }
    });

    // Initialize page
    loadDepartments(); // Load departments for the dropdown
    loadProducts();    // Load all products initially (page 1)
});

// Global function to add product to cart (placeholder)
function addToCart(productId) {
    // This would typically make an API call to add the product to cart
    // For now, just show a simple alert
    alert(`Product ${productId} added to cart! (This is just a demo)`);
}