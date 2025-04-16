async function checkOutOfStockProducts() {
    // Get the pharmacy's email and name from sessionStorage
    const pharmacyEmail = sessionStorage.getItem('pharmacyEmail');
    const pharmacyName = sessionStorage.getItem('pharmacyName');

    // Check if the pharmacy information is available
    if (!pharmacyEmail || !pharmacyName) {
        console.error("Pharmacy details are missing. User may not be logged in.");
        return;
    }

    // Initialize the count of out-of-stock medicines
    let outOfStockProductCount = 0;

    try {
        // Set up a real-time listener for changes in the essential_storage collection
        const unsubscribe = db.collection('essential_storage')
            .where('pharmacyEmail', '==', pharmacyEmail)
            .onSnapshot(snapshot => {
                // Reset the outOfStock count each time the snapshot is received
                outOfStockProductCount = 0;

                snapshot.forEach(doc => {
                    const productData = doc.data();

                    // Check if stockQuantity is less than or equal to reorderLevel
                    if (productData.essentialstockQuantity <= productData.essentialreorderLevel) {
                        // Increase the count and display pharmacy info for this medicine
                        outOfStockProductCount++;

                        // Optionally, log pharmacy details if needed
                        console.log(`Out of Stock - Pharmacy Name: ${productData.pharmacyName}`);
                        console.log(`Out of Stock - Pharmacy Email: ${productData.pharmacyEmail}`);
                    }
                });

                // Update the "Out of Stock" count on the page
                document.getElementById('essential-outofstock-count').textContent = outOfStockProductCount;

                // If there are no out-of-stock medicines, show a message
                if (outOfStockProductCount === 0) {
                    document.getElementById('essential-outofstock-count').textContent = '0';
                }
            });

        // This returns the function to stop listening when you no longer need the real-time updates
        return unsubscribe;

    } catch (error) {
        console.error("Error fetching medicine data:", error);
    }
}

// Call the function to start checking for out-of-stock medicines
checkOutOfStockProducts();
