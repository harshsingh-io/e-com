// JavaScript for product detail page
document.addEventListener('DOMContentLoaded', function() {
    const loadingElement = document.getElementById('loading');
    const errorElement = document.getElementById('error');
    const productContainer = document.getElementById('product-container');

    // Function to get URL parameters
    function getUrlParameter(name) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(name);
    }

    // Function to show error message
    function showError(message) {
        loadingElement.style.display = 'none';
        errorElement.textContent = message;
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

    // Function to render product details
    function renderProduct(product) {
        hideMessages();
        
        // Update page title
        document.title = `${product.name} - E-Commerce Store`;
        
        // Create product detail HTML
        productContainer.innerHTML = `
            <div class="product-detail">
                <div class="product-name">${escapeHtml(product.name)}</div>
                <div class="product-price">$${product.price.toFixed(2)}</div>
                <div class="product-department">${escapeHtml(product.department)}</div>
                <div class="product-description">${escapeHtml(product.description)}</div>
                <div class="product-info">
                    <div class="info-item">
                        <span class="info-label">Product ID:</span> ${product.id}
                    </div>
                    <div class="info-item">
                        <span class="info-label">Department:</span> ${escapeHtml(product.department)}
                    </div>
                    <div class="info-item">
                        <span class="info-label">Price:</span> $${product.price.toFixed(2)}
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

        fetch(`/api/products/${productId}`)
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