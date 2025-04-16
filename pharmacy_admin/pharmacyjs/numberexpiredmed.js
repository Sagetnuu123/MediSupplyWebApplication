// Get the current date, reset the time to midnight
const currentDate = new Date();
currentDate.setHours(0, 0, 0, 0);  // Set time to 00:00:00

// Query to get medicines from Firestore
const expiredMedicinesQuery = db.collection('medicine_storage')
    .where('pharmacyEmail', '==', pharmacyEmail)
    .where('pharmacyName', '==', pharmacyName);

// Listen for changes to the query in real-time
expiredMedicinesQuery.onSnapshot((querySnapshot) => {
    // Filter documents where the expiration date is less than the current date
    const expiredMedicinesCount = querySnapshot.docs.filter(doc => {
        const expirationDate = new Date(doc.data().expirationDate);  // Convert to Date object
        expirationDate.setHours(0, 0, 0, 0);  // Reset expiration time to midnight
        return expirationDate < currentDate;
    }).length;

    // Display the updated count in the HTML element with ID 'expired-medicine-count'
    document.getElementById('expired-medicine-count').textContent = expiredMedicinesCount;
}, (error) => {
    console.error("Error listening for expired medicines: ", error);
});
