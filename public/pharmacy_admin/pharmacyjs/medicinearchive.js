// 🔹 Get elements for the modal and buttons
const archiveModal = document.getElementById("archive-modal");
const cancelArchiveButton = document.getElementById("cancel-archive");
const confirmArchiveButton = document.getElementById("confirm-archive");
const medicineNameText = document.getElementById("medicine-name");

// Variables for the medicine data to be archived
let medicineToArchive = null;

// 🔹 Open the Archive Modal when the delete button is clicked
// 🔹 Open the Archive Modal when the delete button is clicked
function openArchiveModal(deleteButton) {
    // Get the row data (you can change these based on the columns of your table)
    const row = deleteButton.closest("tr");
    const medicineId = row.getAttribute("data-id");
    const medicineName = row.querySelector(".medicine-name span").innerText;

    // Retrieve full medicine data from the medicines array based on the ID
    const medicine = medicines.find(med => med.id === medicineId);

    if (medicine) {
        // Set the medicine to archive
        medicineToArchive = { ...medicine }; // Spread to copy full object

        // Display the medicine name in the modal
        medicineNameText.innerText = `Medicine: ${medicineName}`;

        // Show the modal
        archiveModal.classList.add('show');
    }
}

// 🔹 Archive the medicine records (move all medicine data of the current pharmacy to archive)
confirmArchiveButton.addEventListener("click", async () => {
    if (medicineToArchive) {
        try {
            // Fetch all medicines belonging to the current pharmacy
            const pharmacyEmail = sessionStorage.getItem('pharmacyEmail');
            const pharmacyName = sessionStorage.getItem('pharmacyName');
            if (!pharmacyEmail || !pharmacyName) {
                alert("No pharmacy is logged in.");
                return;
            }

            const medicineId = medicineToArchive.id;
            if (!medicineId) {
                alert("No medicine selected to archive.");
                return;
            }


            // 1. Get all medicines related to the current pharmacy
            const medicineRef = db.collection("medicine_storage").doc(medicineId);
            const medicineDoc = await medicineRef.get();

           if (!medicineDoc.exists) {
                alert("Medicine not found.");
                return;
            }

            // 2. Move all medicine data to 'archive_medicine' collection
            const medicine = medicineDoc.data();// Use a batch to ensure atomicity (all or nothing)

            if (medicine.pharmacyEmail !== pharmacyEmail || medicine.pharmacyName !== pharmacyName) {
                alert("You are not authorized to archive this medicine.");
                return;
            }
                // Add medicine to archive collection
                const archiveRef = db.collection("archive_medicine").doc(medicineId);
                await archiveRef.set({
                    ...medicine,  // Use all the data from the medicine
                    archivedAt: firebase.firestore.FieldValue.serverTimestamp(), // Add timestamp for archiving
                });

            // 3. Commit the batch operation (move and delete)
            await medicineRef.delete();

            // 4. Close the modal and reset
            archiveModal.classList.remove('show');
            medicineToArchive = null;

            // 5. Optionally, refresh the table to reflect changes
            renderTable();
            notyf.success("Medicine has already move to archive table.");
        } catch (error) {
            console.error("Error archiving the medicines:", error);
            alert("An error occurred. Please try again.");
        }
    }
});


cancelArchiveButton.addEventListener("click", () => {
    // Hide the modal
    archiveModal.classList.remove('show');

    // Reset the medicine to archive
    medicineToArchive = null;
});
