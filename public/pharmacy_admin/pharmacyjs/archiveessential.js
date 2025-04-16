// 🔹 Get elements for the modal and buttons
const essentialarchiveModal = document.getElementById("archive-essential-modal");
const essentialcancelArchiveButton = document.getElementById("essential-cancel-archive");
const essentialconfirmArchiveButton = document.getElementById("essential-confirm-archive");
const essentialmedicineNameText = document.getElementById("essential-medicine-name");

// Variables for the medicine data to be archived
let productToArchive = null;

// 🔹 Open the Archive Modal when the delete button is clicked
// 🔹 Open the Archive Modal when the delete button is clicked
function openArchiveEssentialModal(deleteproductButton) {
    // Get the row data (you can change these based on the columns of your table)
    const essentialrow = deleteproductButton.closest("tr");
    console.log(essentialrow);
    const productId = essentialrow.getAttribute("data-id");
    const productName = essentialrow.querySelector(".product-name span").innerText;

    console.log(productName);

    // Retrieve full medicine data from the medicines array based on the ID
    const product = products.find(pro => pro.id === productId);

    if (product) {
        // Set the medicine to archive
        productToArchive = { ...product }; // Spread to copy full object

        // Display the medicine name in the modal
        essentialmedicineNameText.innerText = `Medicine: ${productName}`;

        // Show the modal
        essentialarchiveModal.classList.add('show');
    }else {
        console.error("Product not found.");
        alert("Error: Product data could not be found.");
    }
}

// 🔹 Archive the medicine records (move all medicine data of the current pharmacy to archive)
essentialconfirmArchiveButton.addEventListener("click", async () => {
    if (productToArchive) {
        try {
            // Fetch all medicines belonging to the current pharmacy
            const pharmacyEmail = sessionStorage.getItem('pharmacyEmail');
            const pharmacyName = sessionStorage.getItem('pharmacyName');

            if (!pharmacyEmail || !pharmacyName) {
                alert("No pharmacy is logged in.");
                return;
            }

            const productId = productToArchive.id;
            if (!productId) {
                alert("No medicine selected to archive.");
                return;
            }

            // 1. Get all medicines related to the current pharmacy
            const productRef = db.collection("essential_storage").doc(productId);
            const productDoc = await productRef.get();

            if (!productDoc.exists) {
                alert("Medicine not found.");
                return;
            }

           // 2. Move all medicine data to 'archive_medicine' collection
           const product = productDoc.data();// Use a batch to ensure atomicity (all or nothing)

           if (product.pharmacyEmail !== pharmacyEmail || product.pharmacyName !== pharmacyName) {
               alert("You are not authorized to archive this medicine.");
               return;
           }
               // Add medicine to archive collection
               const archiveEssentialRef = db.collection("archive_essential").doc(productId);
               await archiveEssentialRef.set({
                   ...product,  // Use all the data from the medicine
                   archivedAt: firebase.firestore.FieldValue.serverTimestamp(), // Add timestamp for archiving
               });

           // 3. Commit the batch operation (move and delete)
           await productRef.delete();

            // 4. Close the modal and reset
            essentialarchiveModal.classList.remove('show');
            productToArchive = null;

            // 5. Optionally, refresh the table to reflect changes
            renderessentialTable();
            notyf.success("Medicine has already move to archive table.");
        } catch (error) {
            console.error("Error archiving the medicines:", error);
            alert("An error occurred. Please try again.");
        }
    }
});


essentialcancelArchiveButton.addEventListener("click", () => {
    // Hide the modal
    essentialarchiveModal.classList.remove('show');

    // Reset the medicine to archive
    productToArchive = null;
});
