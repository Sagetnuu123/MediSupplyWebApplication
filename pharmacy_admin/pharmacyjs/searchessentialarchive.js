const archiveessentialsearchInput = document.getElementById("archive-essentials-search");
const archiveessentialsearchWrapper = document.querySelector(".archive-essential-search-wrapper");

// Create clear (X) button dynamically
const archiveessentialclearButton = document.createElement("i");
archiveessentialclearButton.classList.add("bx", "bx-x", "archive-essential-clear-icon");
archiveessentialclearButton.style.position = "absolute";
archiveessentialclearButton.style.right = "35px";
archiveessentialclearButton.style.top = "50%";
archiveessentialclearButton.style.transform = "translateY(-50%)";
archiveessentialclearButton.style.cursor = "pointer";
archiveessentialclearButton.style.color = "#888";
archiveessentialclearButton.style.display = "none"; // Initially hidden
archiveessentialsearchWrapper.appendChild(archiveessentialclearButton);

// Search function
archiveessentialsearchInput.addEventListener("input", function () {
    let archiveessentialsearchText = this.value.trim().toLowerCase();

    // Show or hide clear button
    archiveessentialclearButton.style.display = archiveessentialsearchText ? "block" : "none";

    // Filter medicines based on search
    let filteredArchiveProducts = archiveEssentialProducts.filter(pro => 
        pro.productname.toLowerCase().includes(archiveessentialsearchText)
    );

    renderEssentialArchiveTable(filteredArchiveProducts);
});

// Clear search input when "X" is clicked
archiveessentialclearButton.addEventListener("click", function () {
    archiveessentialsearchInput.value = "";
    archiveessentialclearButton.style.display = "none";
    renderEssentialArchiveTable(archiveEssentialProducts); // Reset table to show all medicines
});

// Modified renderTable to accept filtered data
function renderEssentialArchiveTable(data = archiveEssentialProducts) {
    archiveEssentialTableBody.innerHTML = ""; // Clear table

    if (data.length === 0) {
        archiveEssentialTableBody.innerHTML = `<tr><td colspan="8" style="text-align: center; padding: 10px; font-weight: bold; color: #888;">No results found</td></tr>`;
        return;
    }

    let archiveEssentialStart = (archiveEssentialCurrentPage - 1) * archiveEssentialRowsPerPage;
    let archiveEssentialEnd = archiveEssentialStart + archiveEssentialRowsPerPage;
    let archiveEssentialPaginatedItems = data.slice(archiveEssentialStart, archiveEssentialEnd); 

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

        updateArchiveEssentailPaginationInfo();
}
