// Initialize cart from localStorage or set to an empty array
let cart = JSON.parse(localStorage.getItem('amazon_cart')) || [];

// --------------------------------------------------------
// Global Navigation & Cart Count
// --------------------------------------------------------

function updateCartCount() {
    const cartCountElement = document.getElementById('cart-count');
    if (cartCountElement) {
        cartCountElement.textContent = cart.length;
    }
}

// --------------------------------------------------------
// Index / Products Page Functions
// --------------------------------------------------------

function addToCart(event) {
    const productCard = event.target.closest('.product-card');
    
    const title = productCard.querySelector('h3').textContent;
    const priceText = productCard.querySelector('.price').textContent;
    const imageSrc = productCard.querySelector('img').src;
    
    // Convert ₹1500 format to a clean number for calculations
    const numericPrice = parseInt(priceText.replace(/[^0-9]/g, ''));
    
    const product = {
        id: Date.now(), // Unique ID for removal
        title: title,
        priceText: priceText,
        price: numericPrice,
        image: imageSrc
    };
    
    cart.push(product);
    localStorage.setItem('amazon_cart', JSON.stringify(cart));
    
    updateCartCount();
    
    // Visual feedback for the Add to Cart button
    const btn = event.target;
    const originalText = btn.textContent;
    btn.textContent = "Added!";
    btn.style.backgroundColor = "#e3e6e6"; 
    
    setTimeout(() => {
        btn.textContent = originalText;
        btn.style.backgroundColor = "#ffd814"; 
    }, 1000);
}

// --------------------------------------------------------
// Cart Page Functions
// --------------------------------------------------------

function renderCart() {
    const cartList = document.getElementById('cart-list');
    const summaryCount = document.getElementById('summary-count');
    const summaryTotal = document.getElementById('summary-total');
    
    if (!cartList) return; // Exit if we are not on the cart.html page

    cartList.innerHTML = '';
    let total = 0;

    if (cart.length === 0) {
        cartList.innerHTML = '<p style="padding: 20px 0;">Your Amazon Cart is empty.</p>';
    } else {
        cart.forEach(item => {
            total += item.price;
            cartList.innerHTML += `
                <div class="cart-item">
                    <img src="${item.image}" alt="${item.title}">
                    <div class="cart-item-info">
                        <h3>${item.title}</h3>
                        <p style="font-weight: bold; font-size: 1.2rem; margin-top: 5px;">${item.priceText}</p>
                        <button class="remove-btn" onclick="removeFromCart(${item.id})">Delete</button>
                    </div>
                </div>
            `;
        });
    }

    if (summaryCount) summaryCount.textContent = cart.length;
    if (summaryTotal) summaryTotal.textContent = `₹${total}`;
}

function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    localStorage.setItem('amazon_cart', JSON.stringify(cart));
    updateCartCount();
    renderCart();
}

// --------------------------------------------------------
// Checkout & Payment Page Functions
// --------------------------------------------------------

function renderCheckoutSummary() {
    const checkoutItemsTotal = document.getElementById('checkout-items-total');
    const checkoutFinalTotal = document.getElementById('checkout-final-total');
    
    if (!checkoutItemsTotal) return; // Exit if not on the payment/checkout page

    let total = 0;
    cart.forEach(item => {
        total += item.price;
    });
    
    checkoutItemsTotal.textContent = total;
    
    // Add ₹40 for flat delivery fee if cart is not empty
    const finalTotal = total > 0 ? total + 40 : 0;
    if (checkoutFinalTotal) checkoutFinalTotal.textContent = finalTotal;
}

function toggleAddressForm() {
    const form = document.getElementById('new-address-form');
    if (form) {
        form.style.display = form.style.display === 'none' ? 'block' : 'none';
    }
}

function saveNewAddress() {
    // Grab the values the user typed into the form
    const name = document.getElementById('new-name').value || 'New User';
    const street = document.getElementById('new-street').value || 'Address not provided';
    const city = document.getElementById('new-city').value || 'City not provided';
    const pin = document.getElementById('new-pin').value || '000000';
    
    // Create a new HTML block for the address
    const newAddressHTML = `
        <div class="address-box">
            <input type="radio" name="address" checked>
            <div class="address-details">
                <p class="fw-bold">${name}</p>
                <p>${street}</p>
                <p>${city} ${pin}</p>
                <p>India</p>
                <button class="use-address-btn" onclick="alert('Address Selected!')">Use this address</button>
            </div>
        </div>
    `;
    
    const addressList = document.getElementById('address-list');
    
    // Uncheck previously checked addresses
    const existingRadios = addressList.querySelectorAll('input[type="radio"]');
    existingRadios.forEach(radio => radio.checked = false);
    
    // Add the new address to the top of the list
    addressList.insertAdjacentHTML('beforeend', newAddressHTML);
    
    // Clear the form fields
    document.getElementById('new-name').value = '';
    document.getElementById('new-street').value = '';
    document.getElementById('new-city').value = '';
    document.getElementById('new-pin').value = '';
    
    // Hide the form again
    toggleAddressForm();
}

function processPayment() {
    // 1. Get the selected Payment Method
    const selectedPaymentRadio = document.querySelector('input[name="payment"]:checked');
    const paymentMethod = selectedPaymentRadio ? selectedPaymentRadio.value : "Unknown Payment";
    
    // 2. Get the selected Address Name to confirm
    const selectedAddressRadio = document.querySelector('input[name="address"]:checked');
    let deliveryName = "your address";
    if (selectedAddressRadio) {
        const addressBox = selectedAddressRadio.closest('.address-box');
        if (addressBox) {
            deliveryName = addressBox.querySelector('.fw-bold').textContent;
        }
    }
    
    // 3. Show confirmation alert with the dynamic data
    alert(`Order processing...\n\nDelivering to: ${deliveryName}\nPayment Method: ${paymentMethod}`);
    
    // Clear the cart and redirect to success page
    localStorage.removeItem('amazon_cart');
    window.location.href = 'confirmation.html';
}

// --------------------------------------------------------
// Initialization (Runs when the page loads)
// --------------------------------------------------------

document.addEventListener('DOMContentLoaded', () => {
    // 1. Always update cart count in the navbar
    updateCartCount(); 
    
    // 2. Attach listeners to "Add to Cart" buttons (Index page)
    const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');
    addToCartButtons.forEach(button => {
        button.addEventListener('click', addToCart);
    });

    // 3. Render dynamic content based on which page is active
    renderCart();
    renderCheckoutSummary();
});