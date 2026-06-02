/* =====================================================
   THE MYTHOS CRADLE - SHOPPING CART
   ===================================================== */

let products = {
    azuron:   { productId: "azuron",   name: "Blue Dragon – Azuron",  unitPrice: 2500 },
    yuki:     { productId: "yuki",     name: "Kitsune – Yuki",        unitPrice: 4500 },
    aurelia:  { productId: "aurelia",  name: "Griffin – Aurelia",     unitPrice: 6500 },
    lumina:   { productId: "lumina",   name: "Water Wisp – Lumina",   unitPrice: 40000 },
    starwind: { productId: "starwind", name: "Pegasus – Starwind",    unitPrice: 5000 },
    briar:    { productId: "briar",    name: "Forest Spirit – Briar", unitPrice: 3500 }
};

let cartItems = JSON.parse(localStorage.getItem("cartItems")) || [];

let cartTotal = 0;

// ---- Helpers ------------------------------------------------------------

// This function turns a number of Rands into a nice text label.
// For example 2500 becomes "R 2 500.00".
function moneyToText(rands) {
    // toFixed(2) gives me two numbers after the dot, like "2500.00".
    // Then split it into the part before the dot and the part after.
    let bothParts = rands.toFixed(2).split(".");
    let wholePart = bothParts[0];
    let centsPart = bothParts[1];

    // Put a space every three numbers so big numbers are easy to read.
    // Walk through the whole-number text from right to left, and after
    // every third digit drop a space in front of it.
    let spaced = "";
    let count = 0;
    for (let i = wholePart.length - 1; i >= 0; i--) {
        // Once we have copied three digits, add a space before the next one.
        if (count > 0 && count % 3 === 0) {
            spaced = " " + spaced;
        }
        spaced = wholePart.charAt(i) + spaced;
        count = count + 1;
    }

    // Now glue it all back together with an "R" in front.
    return "R " + spaced + "." + centsPart;
}

// This function works out the right link back to the home page.
// On the Home page itself index.html sits right next to us, but the
// Adopt and Contact pages live inside the "pages" folder, so from there
// we have to go up one level first with "../".
function homePageUrl() {
    if (window.location.pathname.indexOf("/pages/") !== -1) {
        return "../index.html";
    }
    return "index.html";
}


// ---- Logic layer --------------------------------------------------------

// This function adds a product to the cart.
// item is the product, and quantity is how many we want.
function addItem(item, quantity) {
    // Use quantity if provided and positive, otherwise default to 1.
    let qty = 1 
    if (quantity && quantity>0){
        qty = quantity 
    }

    // Check if this product is already in the cart.
    let existing = null;
    for (let i=0; i<cartItems.length; i++){
        if (cartItems[i].productId === item.productId){
            existing = cartItems[i];
            break;
        }
    }

    // If it's already there, just add to the quantity. Otherwise create a new line item.
    if (existing){
        existing.quantity = existing.quantity+qty;
    } else {
        let lineItem = {
            productId: item.productId,
            name: item.name,
            unitPrice: item.unitPrice,
            quantity: qty
        }
        cartItems.push(lineItem);
    }

    // Update totals, save to storage, and redraw the cart on screen.
    recalculateCart();
    localStorage.setItem("cartItems", JSON.stringify(cartItems));
    renderCart();
}

// This function changes how many of one item we have.
// productId identifies which item to change, and quantity is the new amount.
function updateItem(productId, quantity) {
    // Find the item in the cart.
    let item = null;
    for (let i=0; i<cartItems.length; i++) {
        if (cartItems[i].productId === productId){
            item= cartItems[i];
            break;
        }
    } 

    // If we couldn't find it, there's nothing to update.
    if (!item) {
        return;
    }

    // Don't allow quantity to go below 1 — user should remove the item instead.
    if (quantity<1) {
        item.quantity=1;
    } else {
        item.quantity = quantity 
    }

    // Update totals, save to storage, and redraw the cart on screen.
    recalculateCart();
    localStorage.setItem("cartItems", JSON.stringify(cartItems));
    renderCart();

}

// This function takes one item completely out of the cart.
function removeItem(productId) {
    // Find the position of the item in the cart array.
    let index = -1;
    for (let i=0; i<cartItems.length; i++){
        if (cartItems[i].productId === productId){
            index=i;
            break;
        }
    }

    // If we didn't find it, there's nothing to remove.
    if (index === -1){
        return;
    }

    // Remove the item at that position and update everything.
    cartItems.splice(index, 1);
    recalculateCart();
    localStorage.setItem("cartItems", JSON.stringify(cartItems));
    renderCart();
}

// This function adds up all the money in the cart.
function recalculateCart() {
    cartTotal = 0;
    for (let i=0; i<cartItems.length; i++) {
        let subTotal = cartItems[i].unitPrice * cartItems[i].quantity;
        cartTotal = cartTotal+subTotal;
    }
}

// This function pretends to place the order.
function checkout() {
    // If the cart is empty, just go back to the home page.
    if (cartItems.length === 0) {
        window.location.href = homePageUrl();
        return;
    }

    alert("Thank you! Your cradle order has been created.");
    window.location.href = homePageUrl();
}


// ---- View layer ---------------------------------------------------------

// This function builds the cart popup and puts it on the page.
// It only builds it once, so if it already exists we just stop.
function buildCartModal() {
    if (document.getElementById("cart-modal-overlay")) {
        return;
    }

    let modal = document.createElement("div");
    modal.id = "cart-modal-overlay";
    modal.className = "cart-modal-overlay";
    modal.setAttribute ("hidden", "");

    modal.innerHTML = 
        '<div class="cart-modal">' +
            '<div class="cart-modal-header">' +
                '<h2>Your Cradle <span id="cart-count">0</span></h2>' +
                '<button type="button" class="cart-modal-close">&times;</button>' +
            '</div>' +
            '<ul id="cart-items" class="cart-items"></ul>' +
            '<div class="cart-total">' +
                '<p><strong><span>Total</span> <span id="cart-total">R 0.00</span></strong></p>' +
            '</div>' +
            '<div class="cart-modal-actions">' +
                '<button type="button" id="continue-btn" class="cart-continue-btn">Continue Shopping</button>' +
                '<button type="button" id="checkout-btn" class="cart-checkout-btn">Check Out</button>' +            
            '</div>' +
        '</div>';

        document.body.appendChild(modal);

}

// This function draws the cart on the screen using the data we have.
function renderCart() {
    // Count the total number of items (sum of all quantities) for the badge.
    let count = 0;
    for (let i=0; i<cartItems.length; i++) {
        count = count + cartItems[i].quantity;
    }
    
    // Update all the little badges in the navigation bar to show the count.
    let badges = document.querySelectorAll(".navBadge");
    for (let b=0; b<badges.length; b++) {
        badges[b].textContent=count;
    }

    let modal = document.getElementById("cart-modal-overlay");
    if (!modal) {
        return; 
    }

    modal.querySelector("#cart-count").textContent=count;
    modal.querySelector("#cart-total").textContent=moneyToText(cartTotal);

    let list = modal.querySelector("#cart-items");

    if (cartItems.length === 0) {
        list.innerHTML='<li class="cartEmpty">Your Cradle is empty. Adopt a little legend to begin.</li>';
        return; 
    }

    // Build HTML for each item in the cart.
    let html = "";
    for (let i=0; i<cartItems.length; i++) {
        let item = cartItems[i];
        // Work out the line total (price × quantity).
        let lineTotal = item.unitPrice * item.quantity;

        // Create one list item for this product with all the controls.
        html = html + 
            '<li class="cart-item" data-id="' + item.productId + '">' +
                '<div class="cart-item-info">' +
                    '<strong>' + item.name + '</strong>' +
                    '<span class="cart-item-unit">' + moneyToText(item.unitPrice) + ' each</span>' +
                '</div>' +
                '<div class="cart-item-qty">' +
                    '<button type="button" data-action="decrease" data-id="' + item.productId + '">-</button>' +
                    '<span>' + item.quantity + '</span>' + 
                    '<button type="button" data-action="increase" data-id="' + item.productId + '">+</button>' +                    
                '</div>' +
                '<span class="cart-item-line">' + moneyToText(lineTotal) + '</span>' +
                '<button type="button" class="cart-item-remove" data-action="remove" data-id="' + item.productId + '">&times;</button>' +
            '</li>';
    }

    // Put all the HTML into the list on the page.
    list.innerHTML= html; 
}

// This function shows the popup on the screen.
function openCart() {
    let modal= document.getElementById("cart-modal-overlay")
    if (!modal){
        return;
    }

    renderCart();

    modal.removeAttribute("hidden");
}

// This function hides the popup again.
function closeCart() {
    let modal= document.getElementById("cart-modal-overlay")
    if (!modal){
        return;
    }

    modal.setAttribute("hidden", "");
}


// ---- Wiring -------------------------------------------------------------
// This is where I connect all the buttons to my functions.
// I wait for the page to finish loading first, then set everything up.

// Make every basket button in the navigation bar open the cart.
function wireNavButtons() {
    let navButtons = document.querySelectorAll(".navCart button");
    for (let i = 0; i < navButtons.length; i++) {
        navButtons[i].addEventListener("click", openCart);
    }

    let viewBtn = document.getElementById("viewCradleBtn");
    viewBtn.addEventListener("click", openCart);
    
}

// Wire up the ways to close the popup: clicking the dark background,
// clicking the X button, or pressing the Escape key.
function wireCloseControls(overlay) {
    overlay.addEventListener("click", function (event) {
        if (event.target === overlay || event.target.closest(".cart-modal-close")) {
            closeCart();
        }
    });
}

// Wire up the two big buttons at the bottom of the popup.
function wireActionButtons(modal) {
    modal.querySelector("#checkout-btn").addEventListener("click", checkout);
    modal.querySelector("#continue-btn").addEventListener("click", closeCart);
}

// Wire up the plus, minus and remove buttons inside the cart list.
// Instead of adding an event to every single button, add one event to
// the whole list and then check which button was clicked (event delegation).
function wireCartItemButtons(modal) {
    modal.querySelector("#cart-items").addEventListener("click", (event) => {
        // Only respond if a button with a data-action was clicked.
        let button = event.target.closest("button[data-action]");
        if (!button){
            return;
        }

        // Get the action and product ID from the button's data attributes.
        let action = button.dataset.action;
        let id = button.dataset.id;

        // Find the item in the cart.
        let item = null;
        for (let i=0; i<cartItems.length; i++){
            if (cartItems[i].productId === id ){
                item = cartItems[i];
                break;
            }
        }

        // If we couldn't find the item, do nothing.
        if (!item){
            return;
        }

        // Handle the three types of actions.
        if (action === "increase"){
            updateItem(id, item.quantity + 1);
        }

        if (action === "decrease"){
            // If quantity is 1, remove the item instead of going to 0.
            if (item.quantity > 1){
                updateItem(id, item.quantity - 1);
            } else {
                removeItem(id);
            }
        }

        if (action === "remove") {
            removeItem(id);
        }
    });
}

// Wire up the little "- number +" stepper on one creature card.
// This lets users pick how many of a creature they want before adding to the cart.
function wireCardStepper(card) {
    let qty = card.querySelector(".qtyValue");
    let minus = card.querySelector(".qtyBtn.minus");
    let plus = card.querySelector(".qtyBtn.plus");

    // If the stepper doesn't exist on this card, do nothing.
    if (!(qty && minus && plus)){
        return;
    }

    // Decrease the quantity, but don't go below 1.
    minus.addEventListener("click", (event) => {
        let number = event.currentTarget.closest(".creatureDetail").querySelector(".qtyValue");
        let current = parseInt(number.textContent, 10) || 1;

        if (current>1) {
            number.textContent = current - 1;
        }
    });

    // Increase the quantity with no upper limit.
    plus.addEventListener("click", (event) => {
        let number = event.currentTarget.closest(".creatureDetail").querySelector(".qtyValue");
        let current = parseInt(number.textContent, 10) || 1;

        number.textContent = current + 1;
    });
}

// Wire up the "Add to Cradle" button on one creature card.
// When clicked, add the product to the cart with the selected quantity.
function wireCardAddButton(card) {
    let addBtn = card.querySelector(".cradleBtnOdd, .cradleBtnEven");
    if (!addBtn){
        return; 
    }

    addBtn.addEventListener("click", (event) => {
        // Get the creature card container and its product ID.
        let thisCart= event.currentTarget.closest(".creatureDetail");

        // Look up the product from our catalogue.
        let product = products[thisCart.id];
        if (!product){
            return;
        }

        // Get the quantity the user selected (default to 1 if there's no stepper).
        let number = thisCart.querySelector(".qtyValue");
        let qty = 1;
        if (number){
            qty = parseInt(number.textContent, 10) || 1;
        }

        // Add the item(s) to the cart.
        addItem(product, qty);

        // Reset the stepper back to 1 for the next creature.
        if (number){
            number.textContent=1;
        }
    });
}

// On the adoption page each creature card has a quantity stepper and an
// "Add to Cradle" button. Loop through every card and set them both up.
function wireCreatureCards() {
    let cards = document.querySelectorAll(".creatureDetail");
    for (let i= 0; i<cards.length; i++){
        wireCardStepper(cards[i]);
        wireCardAddButton(cards[i]);
    }

}

// This function runs once the HTML page is ready.
// It sets up the cart system and wires up all the buttons.
function setupCart() {
    // Build the popup, work out the totals from the saved cart, and
    // draw it for the first time. The cart itself was already read from
    // localStorage at the top of this file.
    buildCartModal();
    recalculateCart();
    renderCart();

    // Connect the navigation basket buttons so they open the cart.
    wireNavButtons();


    // Grab the popup so we can attach the popup events to it.
    let modal = document.getElementById("cart-modal-overlay");
    // Wire up the close button and clicking the dark background.
    wireCloseControls(modal);
    // Wire up the two main buttons (Check Out and Continue Shopping).
    wireActionButtons(modal);
    // Wire up the plus/minus/remove buttons inside the cart list.
    wireCartItemButtons(modal);

    // Connect the creature cards on the adoption page.
    wireCreatureCards();
}

// Tell the browser to run setupCart once the page has loaded.
document.addEventListener("DOMContentLoaded", setupCart);
