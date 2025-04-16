// 🔹 Get elements for the modal and buttons
const restoreModal = document.getElementById("archive-restore-modal");
const cancelRestoreButton = document.getElementById("cancel-archive-restore");
const confirmRestoreButton = document.getElementById("confirm-archive-restore");
const medicineNameTextRestore = document.getElementById("medicine-name-restore");

// Variables for the medicine data to be archived
let medicineToRestore = null;

// 🔹 Open the Archive Modal when the delete button is clicked
// 🔹 Open the Archive Modal when the delete button is clicked
function openRestoreModal(restoreButton) {
    // Get the row data (you can change these based on the columns of your table)
    const restorerow = restoreButton.closest("tr");
    const restoremedicineId = restorerow.getAttribute("data-id");
    const restoremedicineName = restorerow.querySelector(".medicine-name span").innerText;

    // Retrieve full medicine data from the medicines array based on the ID
    const restoremedicine = archiveMedicines.find(med => med.id === restoremedicineId);

    if (restoremedicine) {
        // Set the medicine to archive
        medicineToRestore = { ...restoremedicine }; // Spread to copy full object

        // Display the medicine name in the modal
        medicineNameTextRestore.innerText = `Medicine: ${restoremedicineName}`;

        // Show the modal
        restoreModal.classList.add('show');
    }
}

// 🔹 Archive the medicine records (move all medicine data of the current pharmacy to archive)
confirmRestoreButton.addEventListener("click", async () => {
    if (medicineToRestore) {
        try {
            // Fetch all medicines belonging to the current pharmacy
            const pharmacyEmail = sessionStorage.getItem('pharmacyEmail');
            const pharmacyName = sessionStorage.getItem('pharmacyName');

            if (!pharmacyEmail || !pharmacyName) {
                alert("No pharmacy is logged in.");
                return;
            }

            const restoremedicineId = medicineToRestore.id;
            if (!restoremedicineId) {
                alert("No medicine selected to archive.");
                return;
            }

            // 1. Get all medicines related to the current pharmacy
            const medicineRestoreRef = db.collection("archive_medicine").doc(restoremedicineId);
            const medicineRestoreDoc = await medicineRestoreRef.get();

           if (!medicineRestoreDoc.exists) {
                alert("Medicine not found.");
                return;
            }

            const restoremedicine = medicineRestoreDoc.data();// Use a batch to ensure atomicity (all or nothing)

            if (restoremedicine.pharmacyEmail !== pharmacyEmail || restoremedicine.pharmacyName !== pharmacyName) {
                alert("You are not authorized to archive this medicine.");
                return;
            }

            // Add medicine to archive collection
            const restoreRef = db.collection("medicine_storage").doc(restoremedicineId);
            await restoreRef.set({
                ...restoremedicine,  // Use all the data from the medicine
                archivedAt: firebase.firestore.FieldValue.serverTimestamp(), // Add timestamp for archiving
            });

            // 3. Commit the batch operation (move and delete)
            await medicineRestoreRef.delete();

            // 4. Close the modal and reset
            restoreModal.classList.remove('show');
            medicineToRestore = null;

            // 5. Optionally, refresh the table to reflect changes
            renderArchiveTable();
            notyf.success("Medicine has already restore to medicine list.");
        } catch (error) {
            console.error("Error archiving the medicines:", error);
            alert("An error occurred. Please try again.");
        }
    }
});


cancelRestoreButton.addEventListener("click", () => {
    // Hide the modal
    restoreModal.classList.remove('show');

    // Reset the medicine to archive
    medicineToRestore = null;
});
