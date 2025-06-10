// Mobile Navigation Toggle
document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', function() {
            const nav = document.querySelector('nav ul');
            nav.classList.toggle('show');
        });
    }

    // Initialize cart from localStorage
    initializeCart();

    // Add to Cart functionality
    const addToCartButtons = document.querySelectorAll('.btn-add-cart');
    addToCartButtons.forEach(button => {
        button.addEventListener('click', function() {
            const productCard = this.closest('.product-card');
            const productName = productCard.querySelector('h3').textContent;
            const productPrice = productCard.querySelector('.price').textContent;
            // Ambil gambar dari .product-image img, bukan hanya img pertama
            let productImage = '';
            const imgEl = productCard.querySelector('.product-image img');
            if (imgEl) {
                productImage = imgEl.getAttribute('src');
            }
            addToCart(productName, productPrice, productImage);
            
            // Show notification
            showNotification(`${productName} telah ditambahkan ke keranjang!`);
        });
    });

    // Cart quantity buttons
    setupCartQuantityButtons();

    // Remove from cart buttons
    setupRemoveFromCartButtons();

    // Update cart total on page load
    updateCartTotal();
    
    // If on cart page, render cart items
    if (window.location.pathname.includes('cart.html')) {
        renderCartItems();
    }
});

// Cart functionality
let cart = [];

// Initialize cart from localStorage
function initializeCart() {
    const savedCart = localStorage.getItem('kireiCart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
        updateCartCount();
        updateCartTotal();
    }
}

// Add to cart function - DIPERBAIKI
function addToCart(name, price, image) {
    // Clean price string (remove 'Rp ' and '.', replace with numeric value)
    const cleanPrice = parseInt(price.replace('Rp ', '').replace(/\./g, ''));
    
    // Pastikan path gambar relatif yang benar
    let imagePath = image;
    if (image.includes('http') || image.includes('blob:')) {
        // Jika gambar dari URL absolut, gunakan placeholder
        imagePath = '/placeholder.svg?height=80&width=80';
    } else if (!image.startsWith('image/')) {
        // Jika path tidak dimulai dengan 'image/', tambahkan
        imagePath = image.startsWith('/') ? image.substring(1) : image;
        if (!imagePath.startsWith('image/')) {
            imagePath = 'image/' + imagePath;
        }
    }
    
    // Check if product already in cart
    const existingItem = cart.find(item => item.name === name);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            name: name,
            price: cleanPrice,
            image: imagePath, // Gunakan path yang sudah diperbaiki
            quantity: 1
        });
    }
    
    // Save to localStorage
    saveCart();
    
    // Update cart count and total
    updateCartCount();
    updateCartTotal();
}

// Save cart to localStorage
function saveCart() {
    localStorage.setItem('kireiCart', JSON.stringify(cart));
}

// Update cart count
function updateCartCount() {
    const cartCountElements = document.querySelectorAll('.cart-count');
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    
    cartCountElements.forEach(element => {
        element.textContent = totalItems;
    });
}

// Show notification
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Hide and remove notification
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Setup cart quantity buttons
function setupCartQuantityButtons() {
    const quantityButtons = document.querySelectorAll('.quantity-btn');
    if (quantityButtons.length > 0) {
        quantityButtons.forEach(button => {
            button.addEventListener('click', function() {
                const action = this.dataset.action;
                const itemRow = this.closest('.cart-item');
                const productName = itemRow.dataset.product;
                const quantityElement = itemRow.querySelector('.quantity-value');
                
                // Find the item in cart
                const cartItem = cart.find(item => item.name === productName);
                if (!cartItem) return;
                
                if (action === 'increase') {
                    cartItem.quantity += 1;
                } else if (action === 'decrease') {
                    cartItem.quantity = Math.max(1, cartItem.quantity - 1);
                }
                
                // Update display
                quantityElement.textContent = cartItem.quantity;
                
                // Update item subtotal
                const itemPrice = cartItem.price;
                const subtotalElement = itemRow.querySelector('.item-subtotal');
                subtotalElement.textContent = `Rp ${(itemPrice * cartItem.quantity).toLocaleString('id-ID')}`;
                
                // Save cart and update total
                saveCart();
                updateCartTotal();
                updateCartCount();
                
                // Update checkout button
                updateCheckoutButton();
            });
        });
    }
}

// Setup remove from cart buttons
function setupRemoveFromCartButtons() {
    const removeButtons = document.querySelectorAll('.remove-item');
    if (removeButtons.length > 0) {
        removeButtons.forEach(button => {
            button.addEventListener('click', function() {
                const itemRow = this.closest('.cart-item');
                const productName = itemRow.dataset.product;
                
                // Remove from cart array
                cart = cart.filter(item => item.name !== productName);
                
                // Remove from DOM
                itemRow.remove();
                
                // Save cart and update total
                saveCart();
                updateCartTotal();
                updateCartCount();
                
                // Show empty cart message if cart is empty
                const cartItems = document.querySelector('.cart-items');
                if (cartItems && cart.length === 0) {
                    cartItems.innerHTML = `
                        <div class="cart-header">
                            <div>Produk</div>
                            <div>Harga</div>
                            <div>Jumlah</div>
                            <div>Subtotal</div>
                            <div></div>
                        </div>
                        <div class="empty-cart">
                            <div class="empty-cart-icon"><i class="fas fa-shopping-cart"></i></div>
                            <p>Keranjang belanja Anda kosong</p>
                            <p>Silakan tambahkan produk ke keranjang</p>
                        </div>
                    `;
                    
                    // Reset totals
                    updateCartTotal();
                }
                
                // Update checkout button
                updateCheckoutButton();
            });
        });
    }
}

// Update cart total
function updateCartTotal() {
    // Get current cart from localStorage if cart array is empty
    if (cart.length === 0) {
        const savedCart = localStorage.getItem('kireiCart');
        if (savedCart) {
            cart = JSON.parse(savedCart);
        }
    }
    
    // Calculate subtotal
    const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    
    // Update subtotal display
    const subtotalElement = document.getElementById('order-subtotal');
    if (subtotalElement) {
        subtotalElement.textContent = `Rp ${subtotal.toLocaleString('id-ID')}`;
    }
    
    // Get shipping cost
    const shippingElement = document.getElementById('order-shipping');
    let shippingCost = 10000; // Default shipping cost
    
    if (shippingElement) {
        const shippingText = shippingElement.textContent.replace('Rp ', '').replace(/\./g, '');
        shippingCost = parseInt(shippingText) || 10000;
    }
    
    // Calculate grand total
    const grandTotal = subtotal + shippingCost;
    
    // Update grand total display
    const grandTotalElement = document.getElementById('order-total');
    if (grandTotalElement) {
        grandTotalElement.textContent = `Rp ${grandTotal.toLocaleString('id-ID')}`;
    }
    
    // Update cart total in other pages
    const cartTotalElement = document.getElementById('cart-total');
    if (cartTotalElement) {
        cartTotalElement.textContent = `Rp ${subtotal.toLocaleString('id-ID')}`;
    }
    
    console.log('Cart updated:', {
        items: cart.length,
        subtotal: subtotal,
        shipping: shippingCost,
        total: grandTotal
    });
}

// Render cart items (for cart page) - DIPERBAIKI
function renderCartItems() {
    const cartItemsContainer = document.querySelector('.cart-items');
    if (!cartItemsContainer) return;
    cartItemsContainer.innerHTML = '';
    const cartHeader = document.createElement('div');
    cartHeader.className = 'cart-header';
    cartHeader.innerHTML = `
        <div>Produk</div>
        <div>Harga</div>
        <div>Jumlah</div>
        <div>Subtotal</div>
        <div></div>
    `;
    cartItemsContainer.appendChild(cartHeader);
    let savedCartRaw = localStorage.getItem('kireiCart');
    let cartData = [];
    if (savedCartRaw) {
        try {
            cartData = JSON.parse(savedCartRaw);
        } catch (e) {
            cartData = [];
        }
    }
    // Bersihkan item yang price null/NaN
    let changed = false;
    cartData.forEach(item => {
        if (typeof item.price !== 'number' || isNaN(item.price) || item.price === null) {
            item.price = 0;
            changed = true;
        }
    });
    if (changed) {
        localStorage.setItem('kireiCart', JSON.stringify(cartData));
    }
    if (!Array.isArray(cartData) || cartData.length === 0) {
        const emptyCart = document.createElement('div');
        emptyCart.className = 'empty-cart';
        emptyCart.innerHTML = `
            <div class="empty-cart-icon"><i class="fas fa-shopping-cart"></i></div>
            <p>Keranjang belanja Anda kosong</p>
            <p>Silakan tambahkan produk ke keranjang</p>
        `;
        cartItemsContainer.appendChild(emptyCart);
        updateCartTotal();
        updateCheckoutButton();
        return;
    }
    cart = cartData; // update global cart
    cart.forEach(item => {
        let qty = (typeof item.quantity === 'number' && item.quantity > 0) ? item.quantity : 1;
        if (!item.quantity || item.quantity < 1) {
            item.quantity = 1;
        }
        let price = (typeof item.price === 'number' && !isNaN(item.price)) ? item.price : 0;
        const subtotal = price * qty;
        // Hapus kolom foto: tidak perlu render <img> lagi
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.dataset.product = item.name;
        cartItem.innerHTML = `
            <div class="item-info">
                <div class="item-details">
                    <h3>${item.name}</h3>
                </div>
            </div>
            <div class="item-price">Rp ${price.toLocaleString('id-ID')}</div>
            <div class="item-quantity">
                <button class="quantity-btn" data-action="decrease">-</button>
                <span class="quantity-value">${qty}</span>
                <button class="quantity-btn" data-action="increase">+</button>
            </div>
            <div class="item-subtotal">Rp ${subtotal.toLocaleString('id-ID')}</div>
            <button class="remove-item"><i class="fas fa-times"></i></button>
        `;
        cartItemsContainer.appendChild(cartItem);
    });
    setupCartQuantityButtons();
    setupRemoveFromCartButtons();
    updateCartTotal();
    updateCartCount();
    updateCheckoutButton();
}

// Clear cart
function clearCart() {
    if (confirm('Apakah Anda yakin ingin mengosongkan keranjang?')) {
        cart = [];
        saveCart();
        updateCartCount();
        updateCartTotal();
        
        // Reload page if on cart page
        if (window.location.pathname.includes('cart.html')) {
            renderCartItems();
        }
        
        updateCheckoutButton();
    }
}

// Update checkout button state based on cart - DITAMBAHKAN
function updateCheckoutButton() {
    const checkoutButton = document.getElementById('checkout-button');
    const savedCart = localStorage.getItem('kireiCart');
    let cart = [];
    
    if (savedCart) {
        cart = JSON.parse(savedCart);
    }
    
    if (checkoutButton) {
        if (cart.length === 0) {
            checkoutButton.disabled = true;
            checkoutButton.innerHTML = '<i class="fas fa-shopping-cart"></i> Keranjang Kosong';
        } else {
            checkoutButton.disabled = false;
            checkoutButton.innerHTML = '<i class="fab fa-whatsapp"></i> Checkout via WhatsApp';
        }
    }
}

// Checkout function - Send to WhatsApp
function checkout() {
    // Get current cart from localStorage
    const savedCart = localStorage.getItem('kireiCart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
    }
    if (!cart || cart.length === 0) {
        alert('Keranjang belanja Anda kosong');
        return;
    }
    // Get customer information (optional)
    const customerName = document.getElementById('customer-name')?.value || '';
    const customerPhone = document.getElementById('customer-phone')?.value || '';
    const customerAddress = document.getElementById('customer-address')?.value || '';
    // Calculate subtotal
    const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    // Diskon 10% jika subtotal >= 100.000
    let discount = 0;
    let discountText = '';
    if (subtotal >= 100000) {
        discount = Math.floor(subtotal * 0.10);
        discountText = `Diskon 10%: -Rp ${discount.toLocaleString('id-ID')}`;
    }
    const shippingCost = 10000; // Default shipping cost
    const grandTotal = subtotal - discount + shippingCost;
    // Format cart items for WhatsApp message
    let cartItemsText = '';
    cart.forEach(item => {
        const itemSubtotal = item.price * item.quantity;
        cartItemsText += `- ${item.name} (${item.quantity}x) @ Rp ${item.price.toLocaleString('id-ID')} = Rp ${itemSubtotal.toLocaleString('id-ID')}` + "\n";
    });
    // Compose WhatsApp message
    let message = `*PESANAN BARU - KIREI'S MART*\n\n`;
    if (customerName) {
        message += `*Data Pelanggan:*\n`;
        message += `Nama: ${customerName}\n`;
        message += `Telepon: ${customerPhone}\n`;
        message += `Alamat: ${customerAddress}\n\n`;
    }
    message += `*Detail Pesanan:*\n`;
    message += cartItemsText;
    message += `\n*Ringkasan Pembayaran:*\n`;
    message += `Subtotal: Rp ${subtotal.toLocaleString('id-ID')}\n`;
    if (discount > 0) {
        message += `${discountText}\n`;
    }
    message += `Ongkos Kirim: Rp ${shippingCost.toLocaleString('id-ID')}\n`;
    message += `Total: Rp ${grandTotal.toLocaleString('id-ID')}\n\n`;
    message += `Terima kasih telah berbelanja di Kirei's Mart!`;
    // Encode and open WhatsApp
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/6287879060790?text=${encodedMessage}`, '_blank');
    // Clear cart after successful checkout
    if (confirm('Pesanan Anda telah dikirim ke WhatsApp. Apakah Anda ingin mengosongkan keranjang?')) {
        clearCart();
        window.location.href = 'index.html';
    }
}
