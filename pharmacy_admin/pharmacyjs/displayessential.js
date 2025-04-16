const essentialtableBody = document.getElementById("essential-tbody");
const essentialrowsPerPageSelect = document.getElementById("essential-rows-per-page");
const essentialprevPageButton = document.getElementById("essential-prev-page");
const essentialnextPageButton = document.getElementById("essential-next-page");
const essentialpageInfo = document.getElementById("essential-page-info");

let essentialcurrentPage = 1;
let essentialrowsPerPage = parseInt(essentialrowsPerPageSelect.value);
let products = [];

// 🔹 Get logged-in pharmacy's email & name
const essentialpharmacyEmail = sessionStorage.getItem('pharmacyEmail');
const essentialpharmacyName = sessionStorage.getItem('pharmacyName');

// 🔹 Prevent unauthorized access
if (!essentialpharmacyEmail || !essentialpharmacyName) {
    console.warn("No pharmacy is logged in. Restricting data access.");
    essentialtableBody.innerHTML = `
        <tr id="essential-no-access-row">
            <td colspan="8" style="text-align: center; padding: 10px; font-weight: bold; color: #888;">
                You must be logged in to view medicine records.
            </td>
        </tr>
    `;
} else {
    // 🔹 Real-time Firestore Listener (Filter by pharmacy)
    db.collection("essential_storage")
        .where("pharmacyEmail", "==", essentialpharmacyEmail) // Restrict by email
        .where("pharmacyName", "==", essentialpharmacyName) // Restrict by name
        .onSnapshot(snapshot => {
            if (snapshot.empty) {
                // 🔹 Show message if no medicines are found
                essentialtableBody.innerHTML = `
                    <tr id="essential-no-data-row">
                        <td colspan="8" style="text-align: center; padding: 10px; font-weight: bold; color: #888;">
                            No medicine records found. Please add medicines.
                        </td>
                    </tr>
                `;
                products = [];
                updateessentialPaginationInfo();
                return;
            }

            // 🔹 Map Firestore data into array
            products = snapshot.docs.map(doc => {
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
            
            renderessentialTable();
        });
}

// 🔹 Render Table with Pagination & "No Data Found"
function renderessentialTable() {
    essentialtableBody.innerHTML = ""; // Clear table

    let essentialstart = (essentialcurrentPage - 1) * essentialrowsPerPage;
    let essentialend = essentialstart + essentialrowsPerPage;
    let essentialpaginatedItems = products.slice(essentialstart, essentialend); // Fixed variable name

    if (essentialpaginatedItems.length === 0) {
        essentialtableBody.innerHTML = `
            <tr id="essential-no-results-row">
                <td colspan="8" style="text-align: center; padding: 10px; font-weight: bold; color: #888;">
                    No medicine records found. Please add medicines.
                </td>
            </tr>
        `;
    } else {
        essentialpaginatedItems.forEach(product => {
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
                        <button class="essential-edit-btn" title="Edit" onclick="openEditEssentialModal(this)"><i class="bx bx-edit"></i></button>
                        <button class="essential-view-btn" title="View"><i class="bx bx-show"></i></button>
                        <button class="essential-delete-btn" title="Delete" onclick="openArchiveEssentialModal(this)"><i class="bx bx-trash"></i></button>
                    </td>
                </tr>
            `;
            essentialtableBody.innerHTML += row;
        });
    }

    updateessentialPaginationInfo();
}

// 🔹 Update Pagination Info
function updateessentialPaginationInfo() {
    let essentialtotalPages = Math.ceil(products.length / essentialrowsPerPage);
    essentialpageInfo.innerText = `Page ${products.length > 0 ? essentialcurrentPage : 0} of ${essentialtotalPages || 1}`;
    essentialprevPageButton.disabled = essentialcurrentPage === 1;
    essentialnextPageButton.disabled = essentialcurrentPage === essentialtotalPages || products.length === 0;
}

// 🔹 Handle Page Change
essentialrowsPerPageSelect.addEventListener("change", function () {
    essentialrowsPerPage = parseInt(this.value);
    essentialcurrentPage = 1;
    renderessentialTable();
});

essentialprevPageButton.addEventListener("click", function () {
    if (essentialcurrentPage > 1) {
        essentialcurrentPage--;
        renderessentialTable();
    }
});

essentialnextPageButton.addEventListener("click", function () {
    if (essentialcurrentPage * essentialrowsPerPage < products.length) {
        essentialcurrentPage++;
        renderessentialTable();
    }
});
