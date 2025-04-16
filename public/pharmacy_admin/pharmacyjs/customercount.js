async function listenToCustomerCount() {
    const pharmacyEmail = sessionStorage.getItem("pharmacyEmail");
    const pharmacyName = sessionStorage.getItem("pharmacyName");

    if (!pharmacyEmail || !pharmacyName) {
        console.error("Pharmacy information is missing in sessionStorage.");
        return;
    }

    try {
        // Get today's date
        const todayDate = new Date().toISOString().split('T')[0];  // Format: YYYY-MM-DD

        // Set up the start and end of the day
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0); // Set to 12:00 AM of the current day

        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999); // Set to 11:59 PM of the current day

        // Listen to real-time changes in Firestore for today's transactions
        const customerCountRef = db.collection("customer_count")
            .where("pharmacyEmail", "==", pharmacyEmail)
            .where("pharmacyName", "==", pharmacyName)
            .where("transactionDate", "==", todayDate);

        // Reset the daily customer count at the end of the day
        const resetCustomerCount = () => {
            const now = new Date();
            if (now >= endOfDay) {
                console.log("Resetting daily customer count.");
                db.collection("customer_count")
                    .doc("daily_total")
                    .set({
                        pharmacyEmail,
                        pharmacyName,
                        customerCount: 0,
                        resetDate: todayDate
                    })
                    .then(() => {
                        console.log("Daily customer count reset successfully.");
                    })
                    .catch((error) => {
                        console.error("Error resetting daily count:", error);
                    });
            }
        };

        // Call resetCustomerCount at the end of each day
        setInterval(resetCustomerCount, 60000); // Check every minute if it's time to reset

        // Listen to the snapshot to display the real-time customer count
        customerCountRef.onSnapshot(snapshot => {
            // If there are no transactions today, reset the count to 0
            const customerCount = snapshot.empty ? 0 : snapshot.size;

            // Update the UI with the customer count
            document.getElementById("customer-count").textContent = customerCount;
        });

    } catch (error) {
        console.error("Error fetching customer count:", error);
        document.getElementById("customer-count").textContent = "Error loading data";
    }
}

// Call the function to listen for updates and automatically display the customer count
listenToCustomerCount();
