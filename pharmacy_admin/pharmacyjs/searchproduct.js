const essentialsearchInput = document.getElementById("essentials-search");
const essentialsearchWrapper = document.querySelector(".essential-search-wrapper");

// Create clear (X) button dynamically
const essentialclearButton = document.createElement("i");
essentialclearButton.classList.add("bx", "bx-x", "essential-clear-icon");
essentialclearButton.style.position = "absolute";
essentialclearButton.style.right = "35px";
essentialclearButton.style.top = "50%";
essentialclearButton.style.transform = "translateY(-50%)";
essentialclearButton.style.cursor = "pointer";
essentialclearButton.style.color = "#888";
essentialclearButton.style.display = "none"; // Initially hidden
essentialsearchWrapper.appendChild(essentialclearButton);

// Search function
essentialsearchInput.addEventListener("input", function () {
    let essentialsearchText = this.value.trim().toLowerCase();

    // Show or hide clear button
    essentialclearButton.style.display = essentialsearchText ? "block" : "none";

    // Filter medicines based on search
    let filteredProducts = products.filter(pro => 
        pro.productname.toLowerCase().includes(essentialsearchText)
    );

    renderessentialTable(filteredProducts);
});

// Clear search input when "X" is clicked
essentialclearButton.addEventListener("click", function () {
    essentialsearchInput.value = "";
    essentialclearButton.style.display = "none";
    renderessentialTable(products); // Reset table to show all medicines
});

// Modified renderTable to accept filtered data
function renderessentialTable(data = products) {
    essentialtableBody.innerHTML = ""; // Clear table

    if (data.length === 0) {
        essentialtableBody.innerHTML = `<tr><td colspan="8" style="text-align: center; padding: 10px; font-weight: bold; color: #888;">No results found</td></tr>`;
        return;
    }

    let essentialstart = (essentialcurrentPage - 1) * essentialrowsPerPage;
    let essentialend = essentialstart + essentialrowsPerPage;
    let essentialpaginatedItems = data.slice(essentialstart, essentialend);

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

        updateessentialPaginationInfo();
}
