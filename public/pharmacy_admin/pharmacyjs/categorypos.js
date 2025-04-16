document.addEventListener("DOMContentLoaded", async function () {
    const searchBar = document.getElementById("search-bar");
    const medicineButton = document.getElementById("medicine-btn");
    const essentialsButton = document.getElementById("essentials-btn");
    const productContainer = document.getElementById("product-container");
    const cartContainer = document.getElementById("cart-container");
    const checkoutButton = document.getElementById("checkout-btn"); // Checkout Button
    const totalPriceDisplay = document.getElementById("total-price");
    const totalQuantityDisplay = document.getElementById("total-quantity"); // Total quantity display
    const totalPayedInput = document.getElementById("total-payed"); // Cash Paid input field
    const totalChangeDisplay = document.getElementById("total-change"); // Change display

    // Get pharmacy details from sessionStorage
    const pharmacyEmail = sessionStorage.getItem("pharmacyEmail");
    const pharmacyName = sessionStorage.getItem("pharmacyName");

    async function fetchProducts(collection, searchQuery = '') {
        const pharmacyEmail = sessionStorage.getItem("pharmacyEmail");
        const pharmacyName = sessionStorage.getItem("pharmacyName");

        if (!pharmacyEmail || !pharmacyName) {
            productContainer.innerHTML = "<p>Error: Pharmacy details not found. Please log in again.</p>";
            return;
        }

        productContainer.innerHTML = "<p>Loading products...</p>";

        const querySnapshot = await db.collection(collection)
            .where("pharmacyEmail", "==", pharmacyEmail)
            .where("pharmacyName", "==", pharmacyName)
            .get();

        productContainer.innerHTML = "";

        if (querySnapshot.empty) {
            productContainer.innerHTML = "<p>No products available for this pharmacy.</p>";
            return;
        }

        let resultsFound = false;

        querySnapshot.forEach((doc) => {
            const product = doc.data();
            const productCard = document.createElement("div");
            productCard.classList.add("product-card");
            productCard.dataset.id = doc.id;
            productCard.dataset.collection = collection;

            // Check if the product matches the search query
            const productName = product.brandName || product.productName;
            const productCategory = collection === "medicine_storage" ? "medicine" : "essential";
            const searchMatch = productName.toLowerCase().includes(searchQuery.toLowerCase());

            if (searchQuery && !searchMatch) {
                return; // Skip this product if it doesn't match the search query
            }

            resultsFound = true; 

            let price = collection === "medicine_storage"
                ? parseFloat(product.sellingPrice)
                : parseFloat(product.essentialsellingPrice);
            
            if (isNaN(price)) {
                price = 0;
            }

            let stock = collection === "medicine_storage" 
                ? product.stockQuantity 
                : product.essentialstockQuantity;
            let stockText = stock === 0 ? "Out of stock" : `${stock} in stock`;

            productCard.innerHTML = `
                <img src="${product.medicineImageBase64 || product.productImageBase64}" alt="${product.brandName || product.productName}">
                <h4>${product.brandName || product.productName}</h4>
                <p>${product.genericName || product.essentialbrandName}</p>
                <p>${product.formulationType || (product.size + ' ' + product.unitOfMeasure)}</p>
                <p>Price: ₱${price.toFixed(2)}</p>
                <p>Stock: <span class="stock-qty">${stockText}</span></p>
                <button onclick="addToCart('${doc.id}', '${collection}', '${product.brandName || product.productName}', ${price}, ${stock})" 
                        ${stock === 0 ? 'disabled' : ''}>
                    Add to Cart
                </button>
            `;
            productContainer.appendChild(productCard);
        });

        if (!resultsFound && searchQuery) {
            productContainer.innerHTML = "<p>No products found matching your search term.</p>";
        }
    }


    // Use Firestore real-time listeners to auto-update product list
    function listenForProductChanges(collection) {
        const pharmacyEmail = sessionStorage.getItem("pharmacyEmail");
        const pharmacyName = sessionStorage.getItem("pharmacyName");

        if (!pharmacyEmail || !pharmacyName) {
            return;
        }

        db.collection(collection)
            .where("pharmacyEmail", "==", pharmacyEmail)
            .where("pharmacyName", "==", pharmacyName)
            .onSnapshot(snapshot => {
                productContainer.innerHTML = "<p>Loading products...</p>";
                snapshot.docChanges().forEach(change => {
                    if (change.type === "added" || change.type === "modified" || change.type === "removed") {
                        fetchProducts(collection);
                    }
                });
            });
    }

    // Auto-fetch and listen for changes in medicine and essentials products
    await fetchProducts("medicine_storage");
    listenForProductChanges("medicine_storage");

    await fetchProducts("essential_storage");
    listenForProductChanges("essential_storage");

    searchBar.addEventListener("input", function () {
        const searchQuery = searchBar.value.trim();  // Get the search term
        const activeCategory = document.querySelector(".category-btn.active");  // Get active category button
        const collection = activeCategory.id === "medicine-btn" ? "medicine_storage" : "essential_storage";  // Get collection based on active button
        fetchProducts(collection, searchQuery);  // Fetch products with the search term
    });

    // Auto-fetch medicine products on page load
    await fetchProducts("medicine_storage");

    // Add item to cart
    window.addToCart = function (id, collection, name, price, stock) {
        if (stock <= 0) {
            notyf.error(`${name} is out of stock.`);
            return;
        }

        // Check if the item is already in the cart
        let existingItem = document.querySelector(`.cart-item[data-id='${id}']`);
        if (existingItem) {
            let quantityInput = existingItem.querySelector(".quantity");
            let newQuantity = parseInt(quantityInput.value) + 1;
            if (newQuantity > stock) {
                alert("Not enough stock available.");
                return;
            }
            quantityInput.value = newQuantity;
        } else {
            const cartItem = document.createElement("div");
            cartItem.classList.add("cart-item");
            cartItem.dataset.id = id; // Store Firestore document ID
            cartItem.dataset.collection = collection; // Store collection name

            cartItem.innerHTML = ` 
                <span class="item-name">${name}</span>
                <input type="number" value="1" min="1" max="${stock}" class="quantity" onchange="updateTotal()">
                <span class="price">₱${price.toFixed(2)}</span>
                <button class="cart-remove-btn" onclick="removeFromCart(this)">
                    <i class="fas fa-times"></i>
                </button>
            `;
            cartContainer.appendChild(cartItem);
        }
        updateTotal();
    };

    // Remove item from cart
    window.removeFromCart = function (button) {
        button.parentElement.remove();
        updateTotal();
    };

    document.addEventListener("input", function (e) {
        if (e.target && e.target.classList.contains("quantity")) {
            updateTotal(); // Recalculate total when quantity input changes
        }
    });

    // Update total price, quantity, and change
    function updateTotal() {
        let totalPrice = 0;
        let totalQuantity = 0;

        document.querySelectorAll(".cart-item").forEach(item => {
            const quantity = parseInt(item.querySelector(".quantity").value);
            const price = parseFloat(item.querySelector(".price").textContent.replace("₱", ""));
            totalPrice += quantity * price;
            totalQuantity += quantity;
        });

        // Update total price and total quantity display
        totalPriceDisplay.textContent = `Total: ₱${totalPrice.toFixed(2)}`;
        totalQuantityDisplay.textContent = totalQuantity;

        window.totalQuantity = totalQuantity; 

        // Update change when cash paid input changes
        updateChange(totalPrice);
    }

    // Update change when cash paid value changes
        // Update change when cash paid value changes
    totalPayedInput.addEventListener("input", function () {
        let totalPrice = parseFloat(totalPriceDisplay.textContent.replace("Total: ₱", "")); // Get total price
        let cashPaid = parseFloat(totalPayedInput.value); // Get cash paid value

        // Only update change if cash paid is a valid number
        if (!isNaN(cashPaid)) {
            if (cashPaid >= totalPrice) {
                updateChange(totalPrice, cashPaid); // Update change when cash paid is sufficient
            } else {
                totalChangeDisplay.textContent = "Insufficient balance"; // Show message if cash is insufficient
            }
        } else {
            totalChangeDisplay.textContent = "₱0.00"; // Reset to 0 if cash paid is invalid
        }
    });

    // Update change when cash paid value changes
    function updateChange(totalPrice, cashPaid = 0) {
        // Calculate change only if cashPaid is valid
        if (cashPaid > totalPrice) {
            let change = cashPaid - totalPrice;
            totalChangeDisplay.textContent = `₱${change.toFixed(2)}`;
        } else if (cashPaid >= totalPrice) {
            totalChangeDisplay.textContent = "₱0.00"; // No change
        }
    }



    // Proceed to Checkout (Update Stock in Firestore)
checkoutButton.addEventListener("click", async function () {
    let cartItems = document.querySelectorAll(".cart-item");
    let cashPaid = parseFloat(totalPayedInput.value); // Get the value from the "Cash Paid" input
    let totalPrice = parseFloat(totalPriceDisplay.textContent.replace("Total: ₱", "")); // Get the total price

    if (cartItems.length === 0) {
        notyf.error("Your cart is empty.");
        return;
    }

    // Validate cash paid input
    if (isNaN(cashPaid) || cashPaid <= 0) {
        notyf.error("Please enter a valid amount for Cash Paid.");
        return;
    }

    // Check if cash paid is sufficient
    if (cashPaid < totalPrice) {
        notyf.error("Insufficient balance. Please enter enough cash to cover the total price.");
        return;
    }

    let batch = db.batch(); // Use Firestore batch to update multiple docs at once
    let updates = [];

    let transactionItems = []; // Array to store transaction details

    for (let item of cartItems) {
        let docId = item.dataset.id;
        let collection = item.dataset.collection;
        let quantityPurchased = parseInt(item.querySelector(".quantity").value);

        let productRef = db.collection(collection).doc(docId);
        let productDoc = await productRef.get();

        if (!productDoc.exists) {
            alert("One or more products do not exist.");
            return;
        }

        let productData = productDoc.data();
        let currentStock;

        // Check for the correct stock field depending on the product type (medicine or essentials)
        if (collection === "medicine_storage") {
            currentStock = productData.stockQuantity; // Medicine stock quantity
        } else if (collection === "essential_storage") {
            currentStock = productData.essentialstockQuantity; // Essentials stock quantity
        }

        if (quantityPurchased > currentStock) {
            alert(`Not enough stock for ${productData.brandName || productData.productName}.`);
            return;
        }

        let newStock = currentStock - quantityPurchased;

        // Update the correct stock field based on the collection
        if (collection === "medicine_storage") {
            batch.update(productRef, { stockQuantity: newStock });
        } else if (collection === "essential_storage") {
            batch.update(productRef, { essentialstockQuantity: newStock });
        }

        transactionItems.push({
            productName: productData.brandName || productData.productName,
            quantity: quantityPurchased,
            price: parseFloat(item.querySelector(".price").textContent.replace("₱", "")),
            total: quantityPurchased * parseFloat(item.querySelector(".price").textContent.replace("₱", ""))
        });

        updates.push({ id: docId, collection, newStock });
    }

    // Commit the batch update
    try {
        await batch.commit();
        notyf.success("Successful Purchase");

        updateTotal();
        showReceiptModal(cartItems, totalPrice, cashPaid, totalQuantity);

        // Update stock display in product container
        updates.forEach(update => {
            let productCard = document.querySelector(`.product-card[data-id='${update.id}']`);
            if (productCard) {
                let stockField = update.collection === "medicine_storage" ? ".stock-qty" : ".stock-qty";
                productCard.querySelector(stockField).textContent = update.newStock;
            }
        });

        // Clear cart
        cartContainer.innerHTML = "";
        updateTotal();

        totalPayedInput.value = ""; // Reset cash paid input
        totalChangeDisplay.textContent = "₱0.00"; // Reset change display

        // Now, save the transaction to Firestore under "customer_count" collection
        const transactionRef = db.collection("customer_count").doc(); // Create a new document with a unique ID
        const localDate = new Date();

        const year = localDate.getFullYear();
        const month = String(localDate.getMonth() + 1).padStart(2, '0'); // getMonth() returns 0-11, so add 1
        const day = String(localDate.getDate()).padStart(2, '0');

        const formattedDate = `${year}-${month}-${day}`;

        await transactionRef.set({
            customer: `customer ${new Date().getTime()}`, // Use timestamp as unique customer ID
            pharmacyName: sessionStorage.getItem("pharmacyName"),
            pharmacyEmail: sessionStorage.getItem("pharmacyEmail"),
            items: transactionItems,
            totalAmount: totalPrice,
            cashPaid: cashPaid,
            change: cashPaid - totalPrice,
            timestamp: localDate, 
            transactionDate: formattedDate
        });

    } catch (error) {
        console.error("Error updating stock:", error);
        alert("An error occurred while processing your purchase.");
    }
});  

    // Function to show receipt modal
    function showReceiptModal(cartItems, totalPrice, cashPaid) {
        const receiptModal = document.getElementById("receipt-modal");
        const receiptContent = document.getElementById("receipt-content");

        // Populate receipt details
        document.getElementById("receipt-pharmacy-name").textContent = pharmacyName || "Pharmacy Name";
        document.getElementById("transaction-date").textContent = new Date().toLocaleDateString();
        document.getElementById("transaction-time").textContent = new Date().toLocaleTimeString();

        // Populate purchased items
        const itemsList = document.getElementById('items-list');
        itemsList.innerHTML = ''; // Clear existing items
        cartItems.forEach(item => {
            const itemName = item.querySelector(".item-name").textContent;
            const quantity = item.querySelector(".quantity").value;
            const price = item.querySelector(".price").textContent;

            const itemDiv = document.createElement("div");

            itemDiv.innerHTML = `
                <span class="item-left">${itemName} (x${quantity})</span>
                <span class="item-price">${price}</span>
            `;

            // Append the created div to the #items-list container
            itemsList.appendChild(itemDiv);
        });

        // Populate total amount, cash paid, and change
        document.getElementById("total-price-receipt").textContent = totalPrice.toFixed(2);
        document.getElementById("cash-paid-receipt").textContent = cashPaid.toFixed(2);
        document.getElementById("change-receipt").textContent = (cashPaid - totalPrice).toFixed(2);

        const totalQuantityReceipt = document.getElementById("total-quantity-receipt");
        totalQuantityReceipt.textContent = totalQuantity;

        // Show the receipt modal
        receiptModal.style.display = "block";

        document.body.classList.add('modal-open');

         // Close modal when clicking the close button
        const closeBtn = document.querySelector(".receipt-close-btn");
        closeBtn.addEventListener("click", function () {
            receiptModal.style.display = "none";
            document.body.classList.remove('modal-open');  // Re-enable background scrolling
        });
    }

    // Event listeners for buttons
    medicineButton.addEventListener("click", () => {
        medicineButton.classList.add("active");
        essentialsButton.classList.remove("active");
        searchBar.value = '';  // Clear the search field when switching categories
        fetchProducts("medicine_storage");
    });

    essentialsButton.addEventListener("click", () => {
        essentialsButton.classList.add("active");
        medicineButton.classList.remove("active");
        searchBar.value = '';  // Clear the search field when switching categories
        fetchProducts("essential_storage");
    });
});
