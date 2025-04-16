// Function to fetch real-time daily sales
async function getRealTimeTotalSales() {
    const pharmacyEmail = sessionStorage.getItem("pharmacyEmail");
    const pharmacyName = sessionStorage.getItem("pharmacyName");

    if (!pharmacyEmail || !pharmacyName) {
        console.log("Pharmacy data is missing.");
        return;
    }

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0); // Set to 12:00 AM of the current day

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999); // Set to 11:59 PM of the current day

    // Listen for changes to the customer_count collection for this pharmacy
    db.collection("customer_count")
        .where("pharmacyEmail", "==", pharmacyEmail)
        .where("pharmacyName", "==", pharmacyName)
        .where("timestamp", ">=", startOfDay)
        .where("timestamp", "<=", endOfDay)
        .onSnapshot((querySnapshot) => {
            let totalSales = 0;

            querySnapshot.forEach((doc) => {
                totalSales += doc.data().totalAmount; // Add up all the sales amounts
            });

            // Update the UI with the total sales
            document.getElementById("total-sales").textContent = `₱${totalSales.toFixed(2)}`;
        });
}

// Call this function to start listening for updates to daily sales
getRealTimeTotalSales();


// Function to reset daily sales (without affecting transaction dates)
async function resetDailySales() {
    const pharmacyEmail = sessionStorage.getItem("pharmacyEmail");
    const pharmacyName = sessionStorage.getItem("pharmacyName");

    if (!pharmacyEmail || !pharmacyName) {
        console.log("Pharmacy data is missing.");
        return;
    }

    const currentDate = new Date().toLocaleDateString(); // Get today's date (e.g. "2025-04-05")
    
    try {
        // Get the last reset date from the database
        const resetDoc = await db.collection("sales_reset_date")
            .doc(pharmacyEmail)
            .get();

        let lastResetDate = null;
        if (resetDoc.exists) {
            lastResetDate = resetDoc.data().lastResetDate;
        }

        if (lastResetDate !== currentDate) {
            // If the sales haven't been reset today, update the reset date
            await db.collection("sales_reset_date").doc(pharmacyEmail).set({
                lastResetDate: currentDate,
            });

            // Reset the daily sales for the new day without changing the transaction date
            await db.collection("customer_count")
                .where("pharmacyEmail", "==", pharmacyEmail)
                .where("pharmacyName", "==", pharmacyName)
                .where("timestamp", ">=", new Date().setHours(0, 0, 0, 0)) // Start of today
                .where("timestamp", "<=", new Date().setHours(23, 59, 59, 999)) // End of today
                .get()
                .then(async (querySnapshot) => {
                    querySnapshot.forEach(async (doc) => {
                        // Update only the dailyTotalSales field to reset it
                        await doc.ref.update({
                            dailyTotalSales: 0,  // Reset daily total sales to 0
                        });
                    });
                });

            console.log("Sales have been reset for the new day.");
        } else {
            console.log("Sales already reset for today.");
        }
    } catch (error) {
        console.error("Error resetting daily sales:", error);
    }
}

// Call this function at the start of the app or once a day
resetDailySales();
