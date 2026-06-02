/* =====================================================
   THE MYTHOS CRADLE - SHOPPING CART
   ---------------------------------------------------------
   This is my shopping cart code.
   It has three parts:
     1) The data    -> the cartItems list holds what the user picked.
     2) The logic   -> functions that add, change and remove things.
     3) The view    -> a popup (modal) that shows the cart on screen.
   I keep all the money in whole Rands, for example 2500 means R 2 500.00.
   ===================================================== */


// ---- Product catalogue --------------------------------------------------
// This is a big object that lists every creature we sell.
// I use the same id that the about.html page uses (like "azuron"),
// so when a button is clicked I can look the product up very easily.
// unitPrice is the price in Rands.
let products = {
    azuron:   { productId: "azuron",   name: "Blue Dragon – Azuron",  unitPrice: 2500 },
    yuki:     { productId: "yuki",     name: "Kitsune – Yuki",        unitPrice: 4500 },
    aurelia:  { productId: "aurelia",  name: "Griffin – Aurelia",     unitPrice: 6500 },
    lumina:   { productId: "lumina",   name: "Water Wisp – Lumina",   unitPrice: 40000 },
    starwind: { productId: "starwind", name: "Pegasus – Starwind",    unitPrice: 5000 },
    briar:    { productId: "briar",    name: "Forest Spirit – Briar", unitPrice: 3500 }
};


// ---- Data layer ---------------------------------------------------------
// This is the list (array) that holds everything the user added.
// localStorage is like a tiny box inside the browser where we can keep
// some text, and it stays there even after the page is closed.
// We save the cart under the key "cartItems".
//
// When the page loads we try to read it straight back out of storage:
//   - localStorage.getItem("cartItems") gives us the saved text (or null).
//   - JSON.parse turns that text back into a real list.
//   - the "|| []" part means "if there was nothing saved, start empty".
// There is only one cart for the whole site (not one cart per user),
// so we only ever use this single "cartItems" key.
let cartItems = JSON.parse(localStorage.getItem("cartItems")) || [];

// This object holds all the totals so the view can read them.
// I set them all to 0 to begin with.
let cartTotal = 0;


// ---- Helpers ------------------------------------------------------------

// This function turns a number of Rands into a nice text label.
// For example 2500 becomes "R 2 500.00".
function moneyToText(rands) {
    // toFixed(2) gives me two numbers after the dot, like "2500.00".
    // Then split it into the part before the dot and the part after.
    var bothParts = rands.toFixed(2).split(".");
    var wholePart = bothParts[0];
    var centsPart = bothParts[1];

    // Put a space every three numbers so big numbers are easy to read.
    // Walk through the whole-number text from right to left, and after
    // every third digit drop a space in front of it.
    var spaced = "";
    var count = 0;
    for (var i = wholePart.length - 1; i >= 0; i--) {
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

// A small helper that just gives back the cart list if some other code needs it.
function getCart() {
    return cartItems;
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
    let qty = 1 
    if (quantity && quantity>0){
        qty = quantity 
    }

    let existing = null;
    for (let i=0; i<cartItems.length; i++){
        if (cartItems[i].productId === item.productId){
            existing = cartItems[i];
            break;
        }
    }

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

    recalculateCart();
    localStorage.setItem("cartItems", JSON.stringify(cartItems));
    renderCart();
}

// This function changes how many of one item we have.
// lineItemId tells me which line, and quantity is the new amount.
function updateItem(lineItemId, quantity) {

}

// This function takes one item completely out of the cart.
function removeItem(lineItemId) {

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
    let count = 0;
    for (let i=0; i<cartItems.length; i++) {
        count = count + cartItems[i].quantity;
    }
    
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

    let html = "";
    for (let i=0; i<cartItems.length; i++) {
        let item = cartItems[i];
        let lineTotal = item.unitPrice * item.quantity;

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
                '<button type="button" class="cart-item-remove" data-id="' + item.productId + '">&times;</button>' +
            '</li>';
    }

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
}

// Wire up the ways to close the popup: clicking the dark background,
// clicking the X button, or pressing the Escape key.
function wireCloseControls(overlay) {
    overlay.addEventListener("click", function (event) {
        if (event.target === overlay || event.target.closest(".cart-modal-close")) {
            closeCart();
        }
    });

    // Also close the popup if the user presses the Escape key.
    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape") {
            closeCart();
        }
    });
}

// Wire up the two big buttons at the bottom of the popup.
function wireActionButtons(modal) {
}

// Wire up the plus, minus and remove buttons inside the cart list.
// Instead of adding an event to every single button, Add one event to
// the whole list and then check which button was clicked.
function wireCartItemButtons(modal) {
}

// Wire up the little "- number +" stepper on one creature card.
function wireCardStepper(card) {
}

// Wire up the "Add to Cradle" button on one creature card.
function wireCardAddButton(card) {
}

// On the adoption page each creature card has a quantity stepper and an
// "Add to Cradle" button. Loop through every card and set them both up.
function wireCreatureCards() {
}

// This function runs once the HTML page is ready.
function setupCart() {
    // Build the popup, work out the totals from the saved cart, and
    // draw it for the first time. The cart itself was already read from
    // localStorage at the top of this file.
    buildCartModal();
    recalculateCart();
    renderCart();

    // Connect the navigation basket buttons.
    wireNavButtons();

    // Grab the popup so we can attach the popup events to it.
    let modal = document.getElementById("cart-modal-overlay");
    wireCloseControls(modal);
    wireActionButtons(modal);
    wireCartItemButtons(modal);

    // Connect the creature cards on the adoption page.
    wireCreatureCards();
}

// Tell the browser to run setupCart once the page has loaded.
document.addEventListener("DOMContentLoaded", setupCart);
