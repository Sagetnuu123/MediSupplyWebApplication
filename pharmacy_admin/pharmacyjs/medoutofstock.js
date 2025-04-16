async function checkOutOfStockMedicines() {
    // Get the pharmacy's email and name from sessionStorage
    const pharmacyEmail = sessionStorage.getItem('pharmacyEmail');
    const pharmacyName = sessionStorage.getItem('pharmacyName');

    // Check if the pharmacy information is available
    if (!pharmacyEmail || !pharmacyName) {
        console.error("Pharmacy details are missing. User may not be logged in.");
        return;
    }

    // Function to update the out-of-stock count
    function updateOutOfStockCount(snapshot) {
        let outOfStockCount = 0;

        snapshot.forEach(doc => {
            const medicineData = doc.data();

            // Check if stockQuantity is less than or equal to reorderLevel
            if (medicineData.stockQuantity <= medicineData.reorderLevel) {
                // Increase the count
                outOfStockCount++;
            }
        });

        // Update the "Out of Stock" count on the page
        document.getElementById('outofstack-count').textContent = outOfStockCount;

        // If there are no out-of-stock medicines, show a message
        if (outOfStockCount === 0) {
            document.getElementById('outofstack-count').textContent = '0';
        }
    }

    // Set up a real-time listener for the medicine_storage collection for this pharmacy
    try {
        const medicinesRef = db.collection('medicine_storage').where('pharmacyEmail', '==', pharmacyEmail);

        // Real-time listener to update count when the data changes
        medicinesRef.onSnapshot((snapshot) => {
            updateOutOfStockCount(snapshot);
        });

    } catch (error) {
        console.error("Error setting up real-time listener:", error);
    }
}

// Call the function to start listening for updates
checkOutOfStockMedicines();
