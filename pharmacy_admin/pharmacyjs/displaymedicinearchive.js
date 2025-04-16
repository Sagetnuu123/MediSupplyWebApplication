const archiveTableBody = document.getElementById("archivemedicine-tbody");
const archiveRowsPerPageSelect = document.getElementById("archive-rows-per-page");
const archivePrevPageButton = document.getElementById("archive-prev-page");
const archiveNextPageButton = document.getElementById("archive-next-page");
const archivePageInfo = document.getElementById("archive-page-info");

let archiveCurrentPage = 1;
let archiveRowsPerPage = parseInt(archiveRowsPerPageSelect.value);
let archiveMedicines = [];

// 🔹 Prevent unauthorized access
if (!pharmacyEmail || !pharmacyName) {
    console.warn("No pharmacy is logged in. Restricting data access.");
    archiveTableBody.innerHTML = ` 
        <tr id="no-access-row">
            <td colspan="8" style="text-align: center; padding: 10px; font-weight: bold; color: #888;">
                You must be logged in to view archived medicine records.
            </td>
        </tr>
    `;
} else {
    // 🔹 Real-time Firestore Listener (Filter by pharmacy)
    db.collection("archive_medicine") // Use "archive_medicine" collection
        .where("pharmacyEmail", "==", pharmacyEmail) // Restrict by email
        .where("pharmacyName", "==", pharmacyName) // Restrict by name
        .onSnapshot(snapshot => {
            if (snapshot.empty) {
                // 🔹 Show message if no archived medicines are found
                archiveTableBody.innerHTML = `
                    <tr id="no-data-row">
                        <td colspan="8" style="text-align: center; padding: 10px; font-weight: bold; color: #888;">
                            No archived medicine records found. Please archive medicines.
                        </td>
                    </tr>
                `;
                archiveMedicines = [];
                updateArchivePaginationInfo();
                return;
            }

            // 🔹 Map Firestore data into array
            archiveMedicines = snapshot.docs.map(doc => ({
                id: doc.id,
                image: doc.data().medicineImageBase64, // Base64 Image
                name: doc.data().brandName,
                category: doc.data().medicineCategory,
                formulation: doc.data().formulationType,
                dosage: doc.data().dosageStrength,
                stock: doc.data().stockQuantity,
                price: `₱${parseFloat(doc.data().sellingPrice).toFixed(2)}`,
                expiry: doc.data().expirationDate
            }));

            renderArchiveTable();
        });
}

// 🔹 Render Archive Table with Pagination & "No Data Found"
function renderArchiveTable() {
    archiveTableBody.innerHTML = ""; // Clear table

    let archivestart = (archiveCurrentPage - 1) * archiveRowsPerPage;
    let archiveend = archivestart + archiveRowsPerPage;
    let archivepaginatedItems = archiveMedicines.slice(archivestart, archiveend);

    if (archivepaginatedItems.length === 0) {
        archiveTableBody.innerHTML = `
            <tr id="no-results-row">
                <td colspan="8" style="text-align: center; padding: 10px; font-weight: bold; color: #888;">
                    No archived medicine records found. Please add archived medicines.
                </td>
            </tr>
        `;
    } else {
        archivepaginatedItems.forEach(medicine => {
            let row = `
                <tr data-id="${medicine.id}">
                    <td class="medicine-name">
                        <img src="${medicine.image}" alt="Medicine Image" class="medicine-img">
                        <span>${medicine.name}</span>
                    </td>
                    <td data-label="Category">${medicine.category}</td>
                    <td data-label="Formulation">${medicine.formulation}</td>
                    <td data-label="Dosage">${medicine.dosage}</td>
                    <td data-label="Stock">${medicine.stock}</td>
                    <td class="medicine-info">
                        <span data-label="Price" class="medicine-price">${medicine.price}</span>
                    </td>
                    <td data-label="Expiry Date">${medicine.expiry}</td>
                    <td class="action-buttons">
                        <button class="archive-view-btn" title="View All"><i class="bx bx-show"></i></button>
                        <button class="restore-btn" title="Restore" onclick="openRestoreModal(this)"><i class="bx bx-undo"></i></button>
                    </td>
                </tr>
            `;
            archiveTableBody.innerHTML += row;
        });
    }

    updateArchivePaginationInfo();
}

// 🔹 Update Archive Pagination Info
function updateArchivePaginationInfo() {
    let totalPages = Math.ceil(archiveMedicines.length / archiveRowsPerPage);
    archivePageInfo.innerText = `Page ${archiveMedicines.length > 0 ? archiveCurrentPage : 0} of ${totalPages || 1}`;
    archivePrevPageButton.disabled = archiveCurrentPage === 1;
    archiveNextPageButton.disabled = archiveCurrentPage === totalPages || archiveMedicines.length === 0;
}

// 🔹 Handle Archive Page Change
archiveRowsPerPageSelect.addEventListener("change", function () {
    archiveRowsPerPage = parseInt(this.value);
    archiveCurrentPage = 1;
    renderArchiveTable();
});

archivePrevPageButton.addEventListener("click", function () {
    if (archiveCurrentPage > 1) {
        archiveCurrentPage--;
        renderArchiveTable();
    }
});

archiveNextPageButton.addEventListener("click", function () {
    if (archiveCurrentPage * archiveRowsPerPage < archiveMedicines.length) {
        archiveCurrentPage++;
        renderArchiveTable();
    }
});
