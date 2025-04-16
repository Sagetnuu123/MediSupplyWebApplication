// 🔹 Get elements for the modal and buttons
const restoreEssentialModal = document.getElementById("essential-archive-restore-modal");
const cancelEssentialRestoreButton = document.getElementById("cancel-essential-archive-restore");
const confirmEssentialRestoreButton = document.getElementById("confirm-essential-archive-restore");
const productNameTextRestore = document.getElementById("product-name-restore");

// Variables for the medicine data to be archived
let productToRestore = null;

// 🔹 Open the Archive Modal when the delete button is clicked
// 🔹 Open the Archive Modal when the delete button is clicked
function openRestoreEssentialModal(restoreButton) {
    // Get the row data (you can change these based on the columns of your table)
    const restoreessentialrow = restoreButton.closest("tr");
    const restoreproductId = restoreessentialrow.getAttribute("data-id");
    const restoreproductName = restoreessentialrow.querySelector(".product-name span").innerText;

    // Retrieve full medicine data from the medicines array based on the ID
    const restoreproduct = archiveEssentialProducts.find(pro => pro.id === restoreproductId);

    if (restoreproduct) {
        // Set the medicine to archive
        productToRestore = { ...restoreproduct }; // Spread to copy full object

        // Display the medicine name in the modal
        productNameTextRestore.innerText = `Product: ${restoreproductName}`;

        // Show the modal
        restoreEssentialModal.classList.add('show');
    }
}

// 🔹 Archive the medicine records (move all medicine data of the current pharmacy to archive)
confirmEssentialRestoreButton.addEventListener("click", async () => {
    if (productToRestore) {
        try {
            // Fetch all medicines belonging to the current pharmacy
            const pharmacyEmail = sessionStorage.getItem('pharmacyEmail');
            const pharmacyName = sessionStorage.getItem('pharmacyName');

            if (!pharmacyEmail || !pharmacyName) {
                alert("No pharmacy is logged in.");
                return;
            }

            const restoreproductId = productToRestore.id;
            if (!restoreproductId) {
                alert("No medicine selected to archive.");
                return;
            }

            // 1. Get all medicines related to the current pharmacy
            const productRestoreRef = db.collection("archive_essential").doc(restoreproductId);
            const productRestoreDoc = await productRestoreRef.get();

           if (!productRestoreDoc.exists) {
                alert("Medicine not found.");
                return;
            }

            const restoreproduct = productRestoreDoc.data();// Use a batch to ensure atomicity (all or nothing)

            if (restoreproduct.pharmacyEmail !== pharmacyEmail || restoreproduct.pharmacyName !== pharmacyName) {
                alert("You are not authorized to archive this medicine.");
                return;
            }

            // Add medicine to archive collection
            const restoreEssentialRef = db.collection("essential_storage").doc(restoreproductId);
            await restoreEssentialRef.set({
                ...restoreproduct,  // Use all the data from the medicine
                archivedAt: firebase.firestore.FieldValue.serverTimestamp(), // Add timestamp for archiving
            });

            // 3. Commit the batch operation (move and delete)
            await productRestoreRef.delete();

            // 4. Close the modal and reset
            restoreEssentialModal.classList.remove('show');
            productToRestore = null;

            // 5. Optionally, refresh the table to reflect changes
            renderEssentialArchiveTable();
            notyf.success("Medicine has already restore to medicine list.");
        } catch (error) {
            console.error("Error archiving the medicines:", error);
            alert("An error occurred. Please try again.");
        }
    }
});


cancelEssentialRestoreButton.addEventListener("click", () => {
    // Hide the modal
    restoreEssentialModal.classList.remove('show');

    // Reset the medicine to archive
    productToRestore = null;
});
