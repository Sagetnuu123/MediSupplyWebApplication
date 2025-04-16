const searchInput = document.getElementById("medicine-search");
const searchWrapper = document.querySelector(".search-wrapper");

// Create clear (X) button dynamically
const clearButton = document.createElement("i");
clearButton.classList.add("bx", "bx-x", "clear-icon");
clearButton.style.position = "absolute";
clearButton.style.right = "35px";
clearButton.style.top = "50%";
clearButton.style.transform = "translateY(-50%)";
clearButton.style.cursor = "pointer";
clearButton.style.color = "#888";
clearButton.style.display = "none"; // Initially hidden
searchWrapper.appendChild(clearButton);

// Search function
searchInput.addEventListener("input", function () {
    let searchText = this.value.trim().toLowerCase();

    // Show or hide clear button
    clearButton.style.display = searchText ? "block" : "none";

    // Filter medicines based on search
    let filteredMedicines = medicines.filter(med => 
        med.name.toLowerCase().includes(searchText)
    );

    renderTable(filteredMedicines);
});

// Clear search input when "X" is clicked
clearButton.addEventListener("click", function () {
    searchInput.value = "";
    clearButton.style.display = "none";
    renderTable(medicines); // Reset table to show all medicines
});

// Modified renderTable to accept filtered data
function renderTable(data = medicines) {
    tableBody.innerHTML = ""; // Clear table

    if (data.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="8" style="text-align: center; padding: 10px; font-weight: bold; color: #888;">No results found</td></tr>`;
        return;
    }

    let start = (currentPage - 1) * rowsPerPage;
    let end = start + rowsPerPage;
    let paginatedItems = data.slice(start, end);

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
                <td data-label="Expiry">${medicine.expiry}</td>
                <td class="action-buttons">
                    <button class="edit-btn" title="Edit"  onclick="openEditModal(this)"><i class="bx bx-edit"></i></button>
                    <button class="view-btn" title="View All"><i class="bx bx-show"></i></button>
                    <button class="delete-btn" title="Delete" onclick="openArchiveModal(this)"><i class="bx bx-trash"></i></button>
                </td>
            </tr>
        `;
        tableBody.innerHTML += row;
    });

    updatePaginationInfo();
}


