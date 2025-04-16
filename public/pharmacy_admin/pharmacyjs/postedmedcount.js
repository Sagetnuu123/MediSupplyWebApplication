// Reference to the 'post_medicine_storage' collection
const medicineStorageRef = db.collection('post_medicine_storage');

// Query to get medicines posted by this pharmacy
const query = medicineStorageRef.where("pharmacyEmail", "==", pharmacyEmail)
                                .where("pharmacyName", "==", pharmacyName);

// Function to get and update the count of medicines
function countMedicines() {
    query.get().then((querySnapshot) => {
        const medicineCount = querySnapshot.size; // Get the number of documents in the query
        document.getElementById("posted-medicine-list").textContent = `${medicineCount} Medicines Posted`;
    }).catch((error) => {
        console.error("Error counting medicines: ", error);
    });
}

// Set up a real-time listener to automatically update the count
medicineStorageRef.where("pharmacyEmail", "==", pharmacyEmail)
                  .where("pharmacyName", "==", pharmacyName)
                  .onSnapshot((querySnapshot) => {
    const medicineCount = querySnapshot.size; // Get the updated number of documents
    document.getElementById("posted-medicine-list").textContent = `${medicineCount} Medicines Posted`;
});

// Call the function to count medicines when the page is ready
countMedicines();
