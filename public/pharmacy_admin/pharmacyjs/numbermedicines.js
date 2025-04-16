// Function to fetch and update the medicine count in real-time
async function updateMedicineCount() {
    const pharmacyEmail = sessionStorage.getItem('pharmacyEmail');
    const pharmacyName = sessionStorage.getItem('pharmacyName');

    const medicineCountElement = document.getElementById("medicine-count");
    
    // Query Firestore to count the medicines for the specific pharmacy
    const medicineRef = db.collection('medicine_storage')
                          .where("pharmacyEmail", "==", pharmacyEmail)
                          .where("pharmacyName", "==", pharmacyName);

    // Use Firestore's real-time listener to automatically update the count
    medicineRef.onSnapshot(snapshot => {
        const count = snapshot.size;  // Get the number of documents in the query snapshot
        medicineCountElement.textContent = count; // Update the count in the UI
    });
}

// Call the function to initiate real-time count updates
updateMedicineCount();