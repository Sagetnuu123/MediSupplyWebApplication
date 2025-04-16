async function getEssentialProductCount() {
    const productCountElement = document.getElementById("essential-product-count");

    try {
        // Firestore query to count documents for a specific pharmacy
        const querySnapshot = await db.collection('essential_storage')
            .where("pharmacyEmail", "==", pharmacyEmail)
            .where("pharmacyName", "==", pharmacyName)
            .get();

        const productCount = querySnapshot.size;
        productCountElement.textContent = productCount;
    } catch (error) {
        console.error("Error getting product count: ", error);
        productCountElement.textContent = "Error loading count";
    }
}

// Function to listen to real-time changes and update count
function listenForProductChanges() {
    const productCountElement = document.getElementById("essential-product-count");

    db.collection('essential_storage')
        .where("pharmacyEmail", "==", pharmacyEmail)
        .where("pharmacyName", "==", pharmacyName)
        .onSnapshot(snapshot => {
            const productCount = snapshot.size;
            productCountElement.textContent = productCount;
        });
}

// Call the function to listen for changes
listenForProductChanges();