// Main JavaScript for product list page
document.addEventListener('DOMContentLoaded', function() {
    const loadingElement = document.getElementById('loading');
    const errorElement = document.getElementById('error');
    const productsContainer = document.getElementById('products-container');

    // Function to show error message
    function showError(message) {
        loadingElement.style.display = 'none';
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }

    // Function to hide loading and error messages
    function hideMessages() {
        loadingElement.style.display = 'none';
        errorElement.style.display = 'none';
    }

    // Function to create a product card element
    function createProductCard(product) {
        const productCard = document.createElement('a');
        productCard.className = 'product-card';
        productCard.href = `product.html?id=${product.id}`;
        
        productCard.innerHTML = `
            <div class="product-name">${escapeHtml(product.name)}</div>
            <div class="product-price">$${product.price.toFixed(2)}</div>
            <div class="product-department">${escapeHtml(product.department)}</div>
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

    // Function to render products
    function renderProducts(products) {
        hideMessages();
        productsContainer.innerHTML = '';
        
        if (products.length === 0) {
            productsContainer.innerHTML = '<div class="loading">No products found.</div>';
            return;
        }

        products.forEach(product => {
            const productCard = createProductCard(product);
            productsContainer.appendChild(productCard);
        });
    }

    // Function to fetch and display all products
    function loadProducts() {
        fetch('/api/products')
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(products => {
                renderProducts(products);
            })
            .catch(error => {
                console.error('Error fetching products:', error);
                showError('Failed to load products. Please try again later.');
            });
    }

    // Load products when page loads
    loadProducts();
});