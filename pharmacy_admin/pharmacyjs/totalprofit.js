// Assuming `db` is your Firestore instance
async function calculateDailyProfit() {
    const pharmacyEmail = sessionStorage.getItem("pharmacyEmail");
    const pharmacyName = sessionStorage.getItem("pharmacyName");

    let totalProfit = 0;

    // Fetch today's date
    const todayDate = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD

    // Listen for changes to the transactions collection for today's date
    const transactionsRef = db.collection("customer_count")
        .where("pharmacyName", "==", pharmacyName)
        .where("pharmacyEmail", "==", pharmacyEmail)
        .where("transactionDate", "==", todayDate); // Only today's transactions

    transactionsRef.onSnapshot(async (transactionsSnapshot) => {
        // Reset the total profit each time we recalculate
        totalProfit = 0;

        // Loop through each transaction
        for (let doc of transactionsSnapshot.docs) {
            const transactionData = doc.data();
            
            // Loop through each item in the transaction
            for (let item of transactionData.items) {
                const productName = item.productName;
                const quantityPurchased = item.quantity;
                const salePrice = item.price;

                // Fetch product's purchase price from either medicine_storage or essential_storage
                let purchasePrice = 0;

                // Check if the product is in the medicine_storage
                const medicineSnapshot = await db.collection("medicine_storage")
                    .where("brandName", "==", productName)
                    .where("pharmacyName", "==", pharmacyName)
                    .where("pharmacyEmail", "==", pharmacyEmail)
                    .get();

                // If found in medicine_storage, get the purchase price
                if (!medicineSnapshot.empty) {
                    purchasePrice = medicineSnapshot.docs[0].data().purchasePrice;
                } else {
                    // Otherwise, check in the essential_storage
                    const essentialSnapshot = await db.collection("essential_storage")
                        .where("productName", "==", productName)
                        .where("pharmacyName", "==", pharmacyName)
                        .where("pharmacyEmail", "==", pharmacyEmail)
                        .get();
                    
                    // If found in essential_storage, get the purchase price
                    if (!essentialSnapshot.empty) {
                        purchasePrice = essentialSnapshot.docs[0].data().essentialpurchasePrice;
                    }
                }

                // If a purchase price was found, calculate the profit
                if (purchasePrice > 0) {
                    const profit = (salePrice - purchasePrice) * quantityPurchased;
                    totalProfit += profit;
                }
            }
        }

        // Display the total profit on the UI
        document.getElementById("total-profit").textContent = `₱${totalProfit.toFixed(2)}`;
    });
}

// Call the function to start listening to changes in the database
calculateDailyProfit();
