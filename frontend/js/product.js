// Configuration
const API_BASE_URL = 'http://127.0.0.1:5000';

// JavaScript for product detail page
document.addEventListener('DOMContentLoaded', function() {
    const loadingElement = document.getElementById('loading');
    const errorElement = document.getElementById('error');
    const errorMessageElement = document.getElementById('error-message');
    const productContainer = document.getElementById('product-container');
    const breadcrumbProduct = document.getElementById('breadcrumb-product');

    // Function to get URL parameters
    function getUrlParameter(name) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(name);
    }

    // Function to show error message
    function showError(message) {
        loadingElement.style.display = 'none';
        errorMessageElement.textContent = message;
        errorElement.style.display = 'block';
        productContainer.style.display = 'none';
    }

    // Function to hide loading and error messages
    function hideMessages() {
        loadingElement.style.display = 'none';
        errorElement.style.display = 'none';
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

    // Function to render product details
    function renderProduct(product) {
        hideMessages();
        
        // Update page title and breadcrumb
        document.title = `${product.name} - ShopEase`;
        breadcrumbProduct.textContent = product.name;
        
        const icon = getProductIcon(product.department);
        
        // Create product detail HTML
        productContainer.innerHTML = `
            <div class="product-detail">
                <div class="product-image-section">
                    <i class="${icon}"></i>
                    <div class="product-badge">${escapeHtml(product.department)}</div>
                </div>
                <div class="product-info-section">
                    <div>
                        <h1 class="product-name">${escapeHtml(product.name)}</h1>
                        <div class="product-price">$${product.price.toFixed(2)}</div>
                        <div class="product-department-tag">${escapeHtml(product.department)}</div>
                        <div class="product-description">${escapeHtml(product.description)}</div>
                        
                        <div class="product-meta">
                            <div class="meta-item">
                                <span class="meta-label">
                                    <i class="fas fa-tag"></i>
                                    Product ID
                                </span>
                                <span class="meta-value">#${product.id}</span>
                            </div>
                            <div class="meta-item">
                                <span class="meta-label">
                                    <i class="fas fa-list"></i>
                                    Category
                                </span>
                                <span class="meta-value">${escapeHtml(product.department)}</span>
                            </div>
                            <div class="meta-item">
                                <span class="meta-label">
                                    <i class="fas fa-dollar-sign"></i>
                                    Price
                                </span>
                                <span class="meta-value">$${product.price.toFixed(2)}</span>
                            </div>
                            <div class="meta-item">
                                <span class="meta-label">
                                    <i class="fas fa-truck"></i>
                                    Availability
                                </span>
                                <span class="meta-value" style="color: #27ae60; font-weight: 600;">In Stock</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="product-actions">
                        <button class="btn btn-primary" onclick="addToCart(${product.id})">
                            <i class="fas fa-shopping-cart"></i>
                            Add to Cart
                        </button>
                        <button class="btn btn-secondary" onclick="addToWishlist(${product.id})">
                            <i class="fas fa-heart"></i>
                            Wishlist
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        productContainer.style.display = 'block';
    }

    // Function to fetch and display product details
    function loadProduct(productId) {
        if (!productId) {
            showError('No product ID specified. Please select a product from the main page.');
            return;
        }

        fetch(`${API_BASE_URL}/api/products/${productId}`)
            .then(response => {
                if (!response.ok) {
                    if (response.status === 404) {
                        throw new Error('Product not found');
                    }
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(product => {
                renderProduct(product);
            })
            .catch(error => {
                console.error('Error fetching product:', error);
                if (error.message === 'Product not found') {
                    showError('Product not found. It may have been removed or the ID is incorrect.');
                } else {
                    showError('Failed to load product details. Please try again later.');
                }
            });
    }

    // Get product ID from URL and load product
    const productId = getUrlParameter('id');
    loadProduct(productId);
});

// Global functions for cart and wishlist (placeholders)
function addToCart(productId) {
    // This would typically make an API call to add the product to cart
    // For now, just show a simple notification
    showNotification(`Product ${productId} added to cart!`, 'success');
}

function addToWishlist(productId) {
    // This would typically make an API call to add the product to wishlist
    // For now, just show a simple notification
    showNotification(`Product ${productId} added to wishlist!`, 'success');
}

// Simple notification function
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#27ae60' : '#667eea'};
        color: white;
        padding: 15px 25px;
        border-radius: 8px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        z-index: 1000;
        font-weight: 600;
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    
    // Add slide in animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
    `;
    document.head.appendChild(style);
    
    // Add to page
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideIn 0.3s ease reverse';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}