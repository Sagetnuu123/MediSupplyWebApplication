const archivesearchInput = document.getElementById("medicinearchive-search");
const archivesearchWrapper = document.querySelector(".archive-search-wrapper");

// Create clear (X) button dynamically
const archiveclearButton = document.createElement("i");
archiveclearButton.classList.add("bx", "bx-x", "archive-clear-icon");
archiveclearButton.style.position = "absolute";
archiveclearButton.style.right = "35px";
archiveclearButton.style.top = "50%";
archiveclearButton.style.transform = "translateY(-50%)";
archiveclearButton.style.cursor = "pointer";
archiveclearButton.style.color = "#888";
archiveclearButton.style.display = "none"; // Initially hidden
archivesearchWrapper.appendChild(archiveclearButton);

// Search function
archivesearchInput.addEventListener("input", function () {
    let archivesearchText = this.value.trim().toLowerCase();

    // Show or hide clear button
    archiveclearButton.style.display = archivesearchText ? "block" : "none";

    // Filter medicines based on search
    let filteredarchiveMedicines = archiveMedicines.filter(med => 
        med.name.toLowerCase().includes(archivesearchText)
    );

    renderArchiveTable(filteredarchiveMedicines);
    updateArchivePaginationInfo(filteredarchiveMedicines);
});

// Clear search input when "X" is clicked
archiveclearButton.addEventListener("click", function () {
    archivesearchInput.value = "";
    archiveclearButton.style.display = "none";
    renderArchiveTable(archiveMedicines); // Reset table to show all medicines
});

// Modified renderTable to accept filtered data
function renderArchiveTable(data = archiveMedicines) {
    archiveTableBody.innerHTML = ""; // Clear table

    if (data.length === 0) {
        archiveTableBody.innerHTML = `<tr><td colspan="8" style="text-align: center; padding: 10px; font-weight: bold; color: #888;">No results found</td></tr>`;
        return;
    }

    let archivestart = (archiveCurrentPage - 1) * archiveRowsPerPage;
    let archiveend = archivestart + archiveRowsPerPage;
    let archivepaginatedItems = data.slice(archivestart, archiveend);

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
                <td data-label="Expiry">${medicine.expiry}</td>
                <td class="action-buttons">
                    <button class="archive-view-btn" title="View All"><i class="bx bx-show"></i></button>
                    <button class="restore-btn" title="Restore" onclick="openRestoreModal(this)"><i class="bx bx-undo"></i></button>
                </td>
            </tr>
        `;
        archiveTableBody.innerHTML += row;
    });

    updateArchivePaginationInfo();
}


