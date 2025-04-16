const tableBody = document.getElementById("medicine-tbody");
const rowsPerPageSelect = document.getElementById("rows-per-page");
const prevPageButton = document.getElementById("prev-page");
const nextPageButton = document.getElementById("next-page");
const pageInfo = document.getElementById("page-info");

let currentPage = 1;
let rowsPerPage = parseInt(rowsPerPageSelect.value);
let medicines = [];

// 🔹 Get logged-in pharmacy's email & name
const pharmacyEmail = sessionStorage.getItem('pharmacyEmail');
const pharmacyName = sessionStorage.getItem('pharmacyName');

// 🔹 Prevent unauthorized access
if (!pharmacyEmail || !pharmacyName) {
    console.warn("No pharmacy is logged in. Restricting data access.");
    tableBody.innerHTML = `
        <tr id="no-access-row">
            <td colspan="8" style="text-align: center; padding: 10px; font-weight: bold; color: #888;">
                You must be logged in to view medicine records.
            </td>
        </tr>
    `;
} else {
    // 🔹 Real-time Firestore Listener (Filter by pharmacy)
    db.collection("medicine_storage")
        .where("pharmacyEmail", "==", pharmacyEmail) // Restrict by email
        .where("pharmacyName", "==", pharmacyName) // Restrict by name
        .onSnapshot(snapshot => {
            if (snapshot.empty) {
                // 🔹 Show message if no medicines are found
                tableBody.innerHTML = `
                    <tr id="no-data-row">
                        <td colspan="8" style="text-align: center; padding: 10px; font-weight: bold; color: #888;">
                            No medicine records found. Please add medicines.
                        </td>
                    </tr>
                `;
                medicines = [];
                updatePaginationInfo();
                return;
            }

            // 🔹 Map Firestore data into array
            medicines = snapshot.docs.map(doc => ({
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

            renderTable();
        });
}

// 🔹 Render Table with Pagination & "No Data Found"
function renderTable() {
    tableBody.innerHTML = ""; // Clear table

    let start = (currentPage - 1) * rowsPerPage;
    let end = start + rowsPerPage;
    let paginatedItems = medicines.slice(start, end);

    if (paginatedItems.length === 0) {
        tableBody.innerHTML = `
            <tr id="no-results-row">
                <td colspan="8" style="text-align: center; padding: 10px; font-weight: bold; color: #888;">
                    No medicine records found. Please add medicines.
                </td>
            </tr>
        `;
    } else {
        paginatedItems.forEach(medicine => {
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
                        <button class="edit-btn" title="Edit" onclick="openEditModal(this)"><i class="bx bx-edit"></i></button>
                        <button class="view-btn" title="View All"><i class="bx bx-show"></i></button>
                         <button class="delete-btn" title="Delete" onclick="openArchiveModal(this)"><i class="bx bx-trash"></i></button>
                    </td>
                </tr>
            `;
            tableBody.innerHTML += row;
        });
    }

    updatePaginationInfo();
}

// 🔹 Update Pagination Info
function updatePaginationInfo() {
    let totalPages = Math.ceil(medicines.length / rowsPerPage);
    pageInfo.innerText = `Page ${medicines.length > 0 ? currentPage : 0} of ${totalPages || 1}`;
    prevPageButton.disabled = currentPage === 1;
    nextPageButton.disabled = currentPage === totalPages || medicines.length === 0;
}

// 🔹 Handle Page Change
rowsPerPageSelect.addEventListener("change", function () {
    rowsPerPage = parseInt(this.value);
    currentPage = 1;
    renderTable();
});

prevPageButton.addEventListener("click", function () {
    if (currentPage > 1) {
        currentPage--;
        renderTable();
    }
});

nextPageButton.addEventListener("click", function () {
    if (currentPage * rowsPerPage < medicines.length) {
        currentPage++;
        renderTable();
    }
});

