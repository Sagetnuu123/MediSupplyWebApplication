// Function to fetch stock data with real-time updates
async function fetchStockData() {
    try {
        const querySnapshot = await db.collection('medicine_storage')
            .where('pharmacyName', '==', pharmacyName)
            .where('pharmacyEmail', '==', pharmacyEmail)
            .get();

        if (querySnapshot.empty) {
            console.log('No medicines found for this pharmacy.');
            // Display message saying no medicines are available
            const stockCardsContainer = document.getElementById('stock-cards-container');
            stockCardsContainer.innerHTML = '<p>No medicine yet available for this pharmacy.</p>';

            return;
        }

        const stockCardsContainer = document.getElementById('stock-cards-container');
        stockCardsContainer.innerHTML = ''; // Clear previous content

        let lowStockAlert = false; // Variable to track if any stock is low

        // Iterate through each document in the Firestore collection
        querySnapshot.forEach((doc) => {
            const medicineData = doc.data();
            createStockCard(medicineData, doc.id, stockCardsContainer);

            // Check if stock is low for any medicine
            if (medicineData.stockQuantity <= medicineData.reorderLevel) {
                lowStockAlert = true;
            }
        });

        // If there is any low stock, trigger shake animation on bell icon
        if (lowStockAlert) {
            document.getElementById('stock-alerts').classList.add('shake-animation');
        }

        // Set up real-time listener for stock changes
        listenToStockUpdates();

    } catch (error) {
        console.error("Error fetching stock data: ", error);
    }
}

// Real-time listener for stock updates
function listenToStockUpdates() {
    
    db.collection('medicine_storage')
        .where('pharmacyName', '==', pharmacyName)
        .where('pharmacyEmail', '==', pharmacyEmail)
        .onSnapshot((querySnapshot) => {
            const stockCardsContainer = document.getElementById('stock-cards-container');
            
            // Check if the query is empty again (in case medicines were deleted or cleared)
            if (querySnapshot.empty) {
                stockCardsContainer.innerHTML = '<p>No medicine yet available for this pharmacy.</p>';
                return;
            }

            stockCardsContainer.innerHTML = ''; // Clear previous content

            querySnapshot.forEach((doc) => {
                const medicineData = doc.data();
                updateStockCard(medicineData, doc.id, stockCardsContainer);
            });
        });
}

// Function to update stock card if stock is updated
function updateStockCard(medicineData, docId, container) {
    const card = container.querySelector(`[data-doc-id="${docId}"]`);
    
    if (!card) {
        createStockCard(medicineData, docId, container);
        return;
    }

    const stockQuantity = card.querySelector('.stock-quantity');
    const reorderLevel = card.querySelector('.reorder-level');
    const outOfStockMessage = card.querySelector('.out-of-stock');
    
    // Update stock quantity
    stockQuantity.innerText = medicineData.stockQuantity;

    // Update reorder level
    reorderLevel.innerText = medicineData.reorderLevel;

    // If stock is above reorder level, remove the "Out of Stock" message
    if (medicineData.stockQuantity > medicineData.reorderLevel && outOfStockMessage) {
        outOfStockMessage.remove();
    }

    // If stock is low, show "Out of Stock" message
    if (medicineData.stockQuantity <= medicineData.reorderLevel && !outOfStockMessage) {
        const newOutOfStockMessage = document.createElement('div');
        newOutOfStockMessage.classList.add('out-of-stock');
        newOutOfStockMessage.innerText = 'Out of Stock';
        card.querySelector('.medicine-info').appendChild(newOutOfStockMessage);
    }
}

// Function to create stock card and append to container
function createStockCard(medicineData, docId, container) {
    const card = document.createElement('div');
    card.classList.add('stock-card');
    card.setAttribute('data-doc-id', docId); // Set unique attribute for real-time update

    // Create image element
    const image = document.createElement('img');
    image.src = medicineData.medicineImageBase64; // Assuming image is stored as base64
    image.alt = medicineData.brandName;
    image.classList.add('medicine-image');

    // Create medicine info section
    const info = document.createElement('div');
    info.classList.add('medicine-info');
    info.innerHTML = `
        <h4>${medicineData.brandName}</h4>
        <div class="info-row">
            <span><strong>Stock:</strong></span>
            <span class="stock-quantity">${medicineData.stockQuantity}</span>
        </div>
        <div class="info-row">
            <span><strong>Reorder Level:</strong></span>
            <span class="reorder-level">${medicineData.reorderLevel}</span>
        </div>
        <div class="info-row">
            <span><strong>Expiry Date:</strong></span>
            <span>${new Date(medicineData.expirationDate).toLocaleDateString()}</span>
        </div>
    `;

    // Check if stock is low and show out of stock message
    if (medicineData.stockQuantity <= medicineData.reorderLevel) {
        const outOfStockMessage = document.createElement('div');
        outOfStockMessage.classList.add('out-of-stock');
        outOfStockMessage.innerText = 'Out of Stock';
        info.appendChild(outOfStockMessage);
    }

    // Create action buttons section
    const actions = document.createElement('div');
    actions.classList.add('action-buttons');
    actions.innerHTML = `
         <button onclick="updateStock('${docId}')" title="Edit Stock">
        <i class="bx bxs-edit-alt"></i> <!-- Update Stock Icon -->
        </button>
        <button onclick="postMedicine('${docId}', this.closest('.stock-card'))" title="Post Medicine">
        <i class="fas fa-paper-plane"></i> <!-- Post Medicine Icon -->
        </button>
        <button onclick="postMedicine('${docId}', this.closest('.stock-card'))" title="Unpost Medicine" style="display:none;">
            <i class="fas fa-times-circle"></i> <!-- Unpost Icon -->
        </button>
    `;

    // Append elements to the card
    card.appendChild(image);
    card.appendChild(info);
    card.appendChild(actions);

    // Append card to the container
    container.appendChild(card);
}

// Function to search medicines based on the search input
function searchMedicine() {
    const searchTerm = document.getElementById('stock-search-bar').value.toLowerCase();
    const stockCards = document.querySelectorAll('.stock-card');
    const clearBtn = document.getElementById('clear-search-btn');

    let cardsFound = false;

    stockCards.forEach(card => {
        const medicineName = card.querySelector('.medicine-info h4').innerText.toLowerCase();

        if (medicineName.includes(searchTerm)) {
            card.style.display = 'block'; // Show matching card
            cardsFound = true;
        } else {
            card.style.display = 'none'; // Hide non-matching card
        }
    });

    // Show/hide the clear button based on input
    if (searchTerm && cardsFound) {
        clearBtn.style.display = 'block';
    } else {
        clearBtn.style.display = 'none';
    }

    const noResultsMessage = document.getElementById('no-results-message');
    if (!cardsFound && searchTerm !== '') {
        if (!noResultsMessage) {
            const message = document.createElement('div');
            message.id = 'no-results-message';
            message.style.textAlign = 'center';
            message.style.marginTop = '20px';
            message.innerText = 'No results found for your search.';
            document.getElementById('stock-cards-container').appendChild(message);
        }
    } else {
        // If there are results or search is cleared, remove the "No Results" message
        if (noResultsMessage) {
            noResultsMessage.remove();
        }
    }

}

// Function to clear the search input and reset the stock cards
function clearSearch() {
    const searchInput = document.getElementById('stock-search-bar');
    searchInput.value = ''; // Clear the input field
    const clearBtn = document.getElementById('clear-search-btn');
    clearBtn.style.display = 'none'; // Hide the clear button

    // Show all stock cards
    const stockCards = document.querySelectorAll('.stock-card');
    stockCards.forEach(card => {
        card.style.display = 'block';
    });
}

// Add event listener to the search bar for input events
document.getElementById('stock-search-bar').addEventListener('input', searchMedicine);

// Add event listener to the clear button
document.getElementById('clear-search-btn').addEventListener('click', clearSearch);


// Function for updating stock (you can implement the logic for updating stock here)
// Function for updating stock
let currentMedicineDocId = null;

function updateStock(docId) {
    const card = document.querySelector(`[data-doc-id="${docId}"]`);
    const medicineName = card.querySelector('.medicine-info h4').innerText;

    currentMedicineDocId = docId;  // Set the global document ID to be used later

    // Fetch the medicine data from Firestore to get the batch number
    db.collection('medicine_storage').doc(docId).get().then((doc) => {
        if (doc.exists) {
            const medicineData = doc.data();
            
            // Populate the modal fields
            document.getElementById('medicine-name').innerText = medicineName;
            document.getElementById('new-batch-number').value = medicineData.batchNumber || ''; // Set batch number (or empty if not available)
            document.getElementById('new-stock-quantity').value = medicineData.stockQuantity;
            document.getElementById('new-reorder-level').value = medicineData.reorderLevel;
            document.getElementById('new-expiry-date').value = new Date(medicineData.expirationDate).toLocaleDateString('en-CA'); // Format as YYYY-MM-DD

            document.getElementById('update-stock-modal').style.display = 'block';
        } else {
            console.log("No such document!");
        }
    }).catch((error) => {
        console.error("Error getting document: ", error);
    });
}

// Function to close the modal
function stockcloseModal() {
    document.getElementById('update-stock-modal').style.display = 'none';
}

// Add an event listener to handle form submission
document.getElementById('update-stock-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const batchNumber = document.getElementById('new-batch-number').value;
    const stockQuantity = document.getElementById('new-stock-quantity').value;
    const reorderLevel = document.getElementById('new-reorder-level').value;
    const expiryDate = document.getElementById('new-expiry-date').value;

    try {
        // Update the Firestore document
        await db.collection('medicine_storage').doc(currentMedicineDocId).update({
            batchNumber: batchNumber,
            stockQuantity: parseInt(stockQuantity),
            reorderLevel: parseInt(reorderLevel),
            expirationDate: expiryDate 
        });

        // Close the modal after successful update
        closeModal();

        // Optionally, you can trigger a notification or success message here
        notyf.success('Stock updated successfully!');
    } catch (error) {
        console.error("Error updating stock: ", error);
        alert('Error updating stock!');
    }
});

// Open modal
function openModal() {
    document.getElementById('update-stock-modal').classList.add('open');
    document.querySelector('.stock-modal-content').classList.add('open');
}

// Close modal
function closeModal() {
    document.getElementById('update-stock-modal').classList.remove('open');
    document.querySelector('.stock-modal-content').classList.remove('open');
}


// Function for posting selected medicine to 'post_medicine_storage' collection
async function postMedicine(docId, cardElement) {
    try {
        // Fetch medicine data based on the docId from 'medicine_storage' collection
        const docSnapshot = await db.collection('medicine_storage')
            .doc(docId)
            .get();

        if (!docSnapshot.exists) {
            console.error('Medicine not found.');
            return;
        }

        const medicineData = docSnapshot.data();

        if (!cardElement) {
            console.error('Card element is not passed or found.');
            return;
        }

        // Check if this medicine has already been posted
        const existingMedicine = await db.collection('post_medicine_storage')
            .where('brandName', '==', medicineData.brandName)
            .where('pharmacyEmail', '==', pharmacyEmail) // Ensure this belongs to the same pharmacy
            .get();

        if (!existingMedicine.empty) {
            notyf.error('This medicine has already been posted.');
            // Change button to "Unpost"
            updatePostButton(cardElement, false);
            return; // Prevent posting again
        }

        // Prepare the data to be posted
        const medicineToPost = {
            brandName: medicineData.brandName,
            contraindications: medicineData.contraindications,
            descriptionUsage: medicineData.descriptionUsage,
            dosageFrequency: medicineData.dosageFrequency,
            dosageStrength: medicineData.dosageStrength,
            expirationDate: medicineData.expirationDate,
            formulationType: medicineData.formulationType,
            genericName: medicineData.genericName,
            latitude: medicineData.latitude,
            longitude: medicineData.longitude,
            medicineCategory: medicineData.medicineCategory,
            medicineImageBase64: medicineData.medicineImageBase64,
            prescriptionRequired: medicineData.prescriptionRequired,
            sellingPrice: medicineData.sellingPrice,
            pharmacyName: pharmacyName,
            pharmacyEmail: pharmacyEmail,
            postedAt: new Date(),
        };

        // Save the data to 'post_medicine_storage' collection
        await db.collection('post_medicine_storage').add(medicineToPost);

        console.log('Medicine posted successfully:', medicineData.brandName);

        // Change the Post button to Unpost button after posting
        updatePostButton(cardElement, true);

        updatePostButton(cardElement, true); 
        notyf.success(`${medicineData.brandName} has been successfully posted.`);
        
    } catch (error) {
        console.error('Error posting medicine:', error);
    }
}

// Function for unposting medicine (removing from 'post_medicine_storage')
async function unpostMedicine(docId, cardElement) {
    try {
        // Fetch medicine data based on docId
        const docSnapshot = await db.collection('medicine_storage')
            .doc(docId)
            .get();

        if (!docSnapshot.exists) {
            console.error('Medicine not found.');
            return;
        }

        const medicineData = docSnapshot.data();

        // Find the medicine in 'post_medicine_storage' by matching brandName and pharmacyEmail
        const existingMedicineQuery = await db.collection('post_medicine_storage')
            .where('brandName', '==', medicineData.brandName)
            .where('pharmacyEmail', '==', pharmacyEmail)
            .get();

        if (existingMedicineQuery.empty) {
            console.log('This medicine was not found in post_medicine_storage.');
            return;
        }

        // Delete the medicine from the 'post_medicine_storage' collection
        existingMedicineQuery.forEach(async (doc) => {
            await db.collection('post_medicine_storage').doc(doc.id).delete();
        });

        console.log('Medicine removed from post_medicine_storage:', medicineData.brandName);

        // Change the Unpost button back to Post button
        updatePostButton(cardElement, false);

        alert(`${medicineData.brandName} has been successfully unposted.`);
        
    } catch (error) {
        console.error('Error unposting medicine:', error);
    }
}

// Function to update Post/Unpost button based on whether the medicine is posted or not
// Function to update Post/Unpost button based on whether the medicine is posted or not
function updatePostButton(cardElement, isPosted) {
    // Ensure that cardElement exists
    if (!cardElement) {
        console.error('Card element is not found.');
        return;
    }

    // Try to get the actions container
    const actions = cardElement.querySelector('.action-buttons');

    // If actions container is not found, log an error and exit
    if (!actions) {
        console.error('Action buttons container not found.');
        return;
    }

    // Get the post and unpost buttons
    const postButton = actions.querySelector('button[title="Post Medicine"]');
    const unpostButton = actions.querySelector('button[title="Unpost Medicine"]');

    if (isPosted) {
        // Change button to Unpost
        if (postButton) {
            postButton.style.display = 'none'; // Hide the Post button
        }

        // Create the Unpost button if it doesn't already exist
        if (!unpostButton) {
            const newUnpostButton = document.createElement('button');
            newUnpostButton.setAttribute('title', 'Unpost Medicine');
            newUnpostButton.innerHTML = `<i class="fas fa-times-circle"></i> Unpost`;
            newUnpostButton.onclick = function() {
                unpostMedicine(cardElement.getAttribute('data-doc-id'), cardElement);
            };
            actions.appendChild(newUnpostButton);
        }
    } else {
        // Change button to Post
        if (unpostButton) {
            unpostButton.style.display = 'none'; // Hide the Unpost button
        }

        if (postButton) {
            postButton.style.display = 'inline-block'; // Show the Post button
        }
    }
}


// Call the function to fetch data on page load
document.addEventListener('DOMContentLoaded', fetchStockData);



