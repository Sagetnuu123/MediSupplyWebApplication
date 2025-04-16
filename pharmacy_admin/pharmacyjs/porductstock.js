async function fetchStockProductData() {
    try {
        const querySnapshot = await db.collection('essential_storage')
            .where('pharmacyName', '==', pharmacyName)
            .where('pharmacyEmail', '==', pharmacyEmail)
            .get();

        if (querySnapshot.empty) {
            console.log('No products found for this pharmacy.');
            const stockproductCardsContainer = document.getElementById('product-stock-cards-container');
            stockproductCardsContainer.innerHTML = '<p>No products available for this pharmacy.</p>';
            return;
        }

        const stockproductCardsContainer = document.getElementById('product-stock-cards-container');
        stockproductCardsContainer.innerHTML = ''; // Clear previous content

        let lowproductStockAlert = false;

        querySnapshot.forEach((doc) => {
            const productData = doc.data();
            console.log(productData); // Log product data to ensure it's correct
            createproductStockCard(productData, doc.id, stockproductCardsContainer);

            if (productData.essentialstockQuantity <= productData.essentialreorderLevel) {
                lowproductStockAlert = true;
            }
        });

        if (lowproductStockAlert) {
            document.getElementById('product-stock-alerts').classList.add('shake-animation');
        }

        listenToproductStockUpdates();
    } catch (error) {
        console.error("Error fetching product stock data: ", error);
    }
}

// Real-time listener for stock updates
function listenToproductStockUpdates() {
    
    db.collection('essential_storage')
        .where('pharmacyName', '==', pharmacyName)
        .where('pharmacyEmail', '==', pharmacyEmail)
        .onSnapshot((querySnapshot) => {
            const stockproductCardsContainer = document.getElementById('product-stock-cards-container');
            
            // Check if the query is empty again (in case medicines were deleted or cleared)
            if (querySnapshot.empty) {
                stockproductCardsContainer.innerHTML = '<p>No product yet available for this pharmacy.</p>';
                return;
            }

            stockproductCardsContainer.innerHTML = ''; // Clear previous content

            querySnapshot.forEach((doc) => {
                const productData = doc.data();
                updateproductStockCard(productData, doc.id, stockproductCardsContainer);
            });
        });
}

// Function to update stock card if stock is updated
function updateproductStockCard(productData, docId, container) {
    const productcard = container.querySelector(`[data-doc-id="${docId}"]`);
    
    if (!productcard) {
        createproductStockCard(productData, docId, container);
        return;
    }

    const productstockQuantity = productcard.querySelector('.stock-quantity');
    const productreorderLevel = productcard.querySelector('.reorder-level');
    const productoutOfStockMessage = productcard.querySelector('.out-of-stock');
    
    // Update stock quantity
    productstockQuantity.innerText = productData.essentialstockQuantity;

    // Update reorder level
    productreorderLevel.innerText = productData.essentialreorderLevel;

    // If stock is above reorder level, remove the "Out of Stock" message
    if (productData.essentialstockQuantity > productData.essentialreorderLevel && productoutOfStockMessage) {
        productoutOfStockMessage.remove();
    }

    // If stock is low, show "Out of Stock" message
    if (productData.stockQuantity <= productData.essentialreorderLevel && !productoutOfStockMessage) {
        const newproductOutOfStockMessage = document.createElement('div');
        newproductOutOfStockMessage.classList.add('out-of-stock');
        newproductOutOfStockMessage.innerText = 'Out of Stock';
        productcard.querySelector('.product-info').appendChild(newproductOutOfStockMessage);
    }
}

// Function to create stock card and append to container
function createproductStockCard(productData, docId, container) {
    const productcard = document.createElement('div');
    productcard.classList.add('product-card');
    productcard.setAttribute('data-doc-id', docId); // Set unique attribute for real-time update

    // Create image element
    const productimage = document.createElement('img');
    productimage.src = productData.productImageBase64; // Assuming image is stored as base64
    productimage.alt = productData.productName;
    productimage.classList.add('medicine-image');

    // Create medicine info section
    const productinfo = document.createElement('div');
    productinfo.classList.add('product-info');
    productinfo.innerHTML = `
        <h4>${productData.productName}</h4>
        <div class="info-row">
            <span><strong>Stock:</strong></span>
            <span class="stock-quantity">${productData.essentialstockQuantity}</span>
        </div>
        <div class="info-row">
            <span><strong>Reorder Level:</strong></span>
            <span class="reorder-level">${productData.essentialreorderLevel}</span>
        </div>
        <div class="info-row">
            <span><strong>Expiry Date:</strong></span>
            <span>${new Date(productData.essentialexpirationDate).toLocaleDateString()}</span>
        </div>
    `;

    // Check if stock is low and show out of stock message
    if (productData.essentialstockQuantity <= productData.essentialreorderLevel) {
        const productoutOfStockMessage = document.createElement('div');
        productoutOfStockMessage.classList.add('out-of-stock');
        productoutOfStockMessage.innerText = 'Out of Stock';
        productinfo.appendChild(productoutOfStockMessage);
    }

    // Create action buttons section
    const productactions = document.createElement('div');
    productactions.classList.add('action-buttons');
    productactions.innerHTML = `
         <button onclick="updateproductStock('${docId}')" title="Edit Stock">
        <i class="bx bxs-edit-alt"></i> <!-- Update Stock Icon -->
        </button>
    `;

    // Append elements to the card
    productcard.appendChild(productimage);
    productcard.appendChild(productinfo);
    productcard.appendChild(productactions);

    // Append card to the container
    container.appendChild(productcard);
}

function searchProduct() {
    const productsearchTerm = document.getElementById('product-search-bar').value.toLowerCase();
    const productstockCards = document.querySelectorAll('.product-card');
    const productclearBtn = document.getElementById('product-clear-search-btn');

    let productcardsFound = false;

    productstockCards.forEach(productcard => {
        // Check if the element exists before trying to access innerText
        const productNameElement = productcard.querySelector('.product-info h4');
        
        if (productNameElement) {
            const productName = productNameElement.innerText.toLowerCase();

            if (productName.includes(productsearchTerm)) {
                productcard.style.display = 'block'; // Show matching card
                productcardsFound = true;
            } else {
                productcard.style.display = 'none'; // Hide non-matching card
            }
        }
    });

    // Show/hide the clear button based on input
    if (productsearchTerm && productcardsFound) {
        productclearBtn.style.display = 'block';
    } else {
        productclearBtn.style.display = 'none';
    }
}

function clearproductSearch() {
    const productsearchInput = document.getElementById('product-search-bar');
    productsearchInput.value = ''; // Clear the input field
    const productclearBtn = document.getElementById('product-clear-search-btn');
    productclearBtn.style.display = 'none'; // Hide the clear button

    // Show all stock cards
    const productstockCards = document.querySelectorAll('.product-card');
    productstockCards.forEach(card => {
        card.style.display = 'block'; // Correcting `productcard` to `card`
    });
}

// Add event listener to the search bar for input events
document.getElementById('product-search-bar').addEventListener('input', searchProduct);

// Add event listener to the clear button
document.getElementById('product-clear-search-btn').addEventListener('click', clearproductSearch);


let currentProductDocId = null;

function updateproductStock(docId) {
    const productcard = document.querySelector(`[data-doc-id="${docId}"]`);
    const productName = productcard.querySelector('.product-info h4').innerText;

    currentProductDocId = docId;  // Set the global document ID to be used later

    // Fetch the medicine data from Firestore to get the batch number
    db.collection('essential_storage').doc(docId).get().then((doc) => {
        if (doc.exists) {
            const productData = doc.data();
            
            // Populate the modal fields
            document.getElementById('product-name').innerText = productName;
            document.getElementById('new-essential-batch-number').value = productData.essentialbatchNumber || ''; // Set batch number (or empty if not available)
            document.getElementById('new-essential-stock-quantity').value = productData.essentialstockQuantity;
            document.getElementById('new-essential-reorder-level').value = productData.essentialreorderLevel;
            document.getElementById('new-essential-expiry-date').value = new Date(productData.essentialexpirationDate).toLocaleDateString('en-CA'); // Format as YYYY-MM-DD

            document.getElementById('update-product-stock-modal').style.display = 'block';
        } else {
            console.log("No such document!");
        }
    }).catch((error) => {
        console.error("Error getting document: ", error);
    });
}

// Function to close the modal
function productstockcloseModal() {
    document.getElementById('update-product-stock-modal').style.display = 'none';
}

// Add an event listener to handle form submission
document.getElementById('update-product-stock-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const productbatchNumber = document.getElementById('new-essential-batch-number').value;
    const productstockQuantity = document.getElementById('new-essential-stock-quantity').value;
    const productreorderLevel = document.getElementById('new-essential-reorder-level').value;
    const productexpiryDate = document.getElementById('new-essential-expiry-date').value;

    try {
        // Update the Firestore document
        await db.collection('essential_storage').doc(currentProductDocId).update({
            essentialbatchNumber: productbatchNumber,
            essentialstockQuantity: parseInt(productstockQuantity),
            essentialreorderLevel: parseInt(productreorderLevel),
            essentialexpirationDate: productexpiryDate 
        });

        // Close the modal after successful update
        productcloseModal();

        // Optionally, you can trigger a notification or success message here
        notyf.success('Stock updated successfully!');
    } catch (error) {
        console.error("Error updating stock: ", error);
        alert('Error updating stock!');
    }
});

// Open modal
function productopenModal() {
    document.getElementById('update-product-stock-modal').classList.add('open');
    document.querySelector('.stock-modal-content').classList.add('open');
}

// Close modal
function productcloseModal() {
    document.getElementById('update-product-stock-modal').classList.remove('open');
    document.querySelector('.stock-modal-content').classList.remove('open');
}



document.addEventListener('DOMContentLoaded', fetchStockProductData);