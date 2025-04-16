const archiveEssentialTableBody = document.getElementById("archive-essential-tbody");
const archiveEssentialRowsPerPageSelect = document.getElementById("archive-essential-rows-per-page");
const archiveEssentialPrevPageButton = document.getElementById("archive-essential-prev-page");
const archiveEssentialNextPageButton = document.getElementById("archive-essential-next-page");
const archiveEssentialPageInfo = document.getElementById("archive-essential-page-info");

let archiveEssentialCurrentPage = 1;
let archiveEssentialRowsPerPage = parseInt(archiveEssentialRowsPerPageSelect.value);
let archiveEssentialProducts = [];

// 🔹 Get logged-in pharmacy's email & name
const archivePharmacyEmail = sessionStorage.getItem('pharmacyEmail');
const archivePharmacyName = sessionStorage.getItem('pharmacyName');

// 🔹 Prevent unauthorized access
if (!archivePharmacyEmail || !archivePharmacyName) {
    console.warn("No pharmacy is logged in. Restricting data access.");
    archiveEssentialTableBody.innerHTML = `
        <tr id="archive-no-access-row">
            <td colspan="8" style="text-align: center; padding: 10px; font-weight: bold; color: #888;">
                You must be logged in to view archived medicine records.
            </td>
        </tr>
    `;
} else {
    // 🔹 Real-time Firestore Listener for Archived Products (Filter by pharmacy)
    db.collection("archive_essential")
        .where("pharmacyEmail", "==", archivePharmacyEmail) // Restrict by email
        .where("pharmacyName", "==", archivePharmacyName) // Restrict by name
        .onSnapshot(snapshot => {
            if (snapshot.empty) {
                // 🔹 Show message if no archived medicines are found
                archiveEssentialTableBody.innerHTML = `
                    <tr id="archive-no-data-row">
                        <td colspan="8" style="text-align: center; padding: 10px; font-weight: bold; color: #888;">
                            No archived medicine records found.
                        </td>
                    </tr>
                `;
                archiveEssentialProducts = [];
                updateArchiveEssentailPaginationInfo();
                return;
            }

            // 🔹 Map Firestore data into array for archived products
            archiveEssentialProducts = snapshot.docs.map(doc => {
                let data = doc.data();
                return {
                    id: doc.id,
                    productimage: data.productImageBase64 || "default-image.jpg",
                    productname: data.productName || "N/A",
                    productbrand: data.essentialbrandName || "N/A",
                    productcategory: data.category || "N/A",
                    productsizeunit: `${data.size || "N/A"} ${data.unitOfMeasure || ""}`.trim(),
                    productstock: data.essentialstockQuantity || 0,
                    productprice: `₱${parseFloat(data.essentialsellingPrice || 0).toFixed(2)}`,
                    productexpiry: data.essentialexpirationDate || "N/A"
                };
            });
            
            renderEssentialArchiveTable();
        });
}

// 🔹 Render Archive Table with Pagination & "No Data Found"
function renderEssentialArchiveTable() {
    archiveEssentialTableBody.innerHTML = ""; // Clear table

    let archiveEssentialStart = (archiveEssentialCurrentPage - 1) * archiveEssentialRowsPerPage;
    let archiveEssentialEnd = archiveEssentialStart + archiveEssentialRowsPerPage;
    let archiveEssentialPaginatedItems = data.slice(archiveEssentialStart, archiveEssentialEnd); // Fixed variable name

    if (archiveEssentialPaginatedItems.length === 0) {
        archiveEssentialTableBody.innerHTML = `
            <tr id="archive-no-results-row">
                <td colspan="8" style="text-align: center; padding: 10px; font-weight: bold; color: #888;">
                    No archived medicine records found.
                </td>
            </tr>
        `;
    } else {
        archiveEssentialPaginatedItems.forEach(product => {
            let row = `
                <tr data-id="${product.id}">
                    <td class="product-name">
                        <img src="${product.productimage}" alt="Medicine Image" class="medicine-img">
                        <span>${product.productname}</span>
                    </td>
                    <td data-label="Brand">${product.productbrand}</td>
                    <td data-label="Category">${product.productcategory}</td>
                    <td data-label="Size/Unit">${product.productsizeunit}</td>
                    <td data-label="Stock">${product.productstock}</td>
                    <td class="medicine-info">
                        <span data-label="Price" class="medicine-price">${product.productprice}</span>
                    </td>
                    <td data-label="Expiry Date">${product.productexpiry}</td>
                    <td class="action-buttons">
                        <button class="essential-archive-view-btn" title="View All"><i class="bx bx-show"></i></button>
                        <button class="restore-btn" title="Restore" onclick="openRestoreEssentialModal(this)"><i class="bx bx-undo"></i></button>
                    </td>
                </tr>
            `;
            archiveEssentialTableBody.innerHTML += row;
        });
    }

    updateArchiveEssentailPaginationInfo();
}

// 🔹 Update Archive Pagination Info
function updateArchiveEssentailPaginationInfo() {
    let archiveEssentialTotalPages = Math.ceil(archiveEssentialProducts.length / archiveEssentialRowsPerPage);
    archiveEssentialPageInfo.innerText = `Page ${archiveEssentialProducts.length > 0 ? archiveEssentialCurrentPage : 0} of ${archiveEssentialTotalPages || 1}`;
    archiveEssentialPrevPageButton.disabled = archiveEssentialCurrentPage === 1;
    archiveEssentialNextPageButton.disabled = archiveEssentialCurrentPage === archiveEssentialTotalPages || archiveEssentialProducts.length === 0;
}

// 🔹 Handle Page Change for Archive Table
archiveEssentialRowsPerPageSelect.addEventListener("change", function () {
    archiveEssentialRowsPerPage = parseInt(this.value);
    archiveEssentialCurrentPage = 1;
    renderEssentialArchiveTable();
});

archiveEssentialPrevPageButton.addEventListener("click", function () {
    if (archiveEssentialCurrentPage > 1) {
        archiveEssentialCurrentPage--;
        renderEssentialArchiveTable();
    }
});

archiveEssentialNextPageButton.addEventListener("click", function () {
    if (archiveEssentialCurrentPage * archiveEssentialRowsPerPage < archiveEssentialProducts.length) {
        archiveEssentialCurrentPage++;
        renderEssentialArchiveTable();
    }
});
