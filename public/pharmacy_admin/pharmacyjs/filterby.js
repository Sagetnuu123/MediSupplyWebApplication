// Toggle dropdown visibility
document.querySelectorAll('.filter-btn').forEach(button => {
    button.addEventListener('click', function () {
        this.parentElement.classList.toggle('active');
    });
});

// Select filter option
document.querySelectorAll('.filter-options li').forEach(option => {
    option.addEventListener('click', function () {
        let filterType = this.parentElement.parentElement.id;
        let selectedValue = this.getAttribute("data-value");

        // Find the button and its icon
        let button = this.parentElement.previousElementSibling;
        let icon = button.querySelector(".select-icon");

        // Update only the text inside the button, keeping the icon
        button.innerHTML = `${selectedValue ? selectedValue : `Filter by ${filterType.includes("category") ? "Category" : "Formulation"}`} <i class="bx bx-chevron-down select-icon"></i>`;

        // Remove active class from dropdown
        this.parentElement.parentElement.classList.remove("active");

        // Apply filtering function
        filterMedicineTable(filterType, selectedValue);
    });
});

// Close dropdowns when clicking outside
document.addEventListener("click", function (e) {
    document.querySelectorAll('.filter-dropdown').forEach(dropdown => {
        if (!dropdown.contains(e.target)) {
            dropdown.classList.remove("active");
        }
    });
});

// Filtering Function with "No Results Found"
function filterMedicineTable(filterType, filterValue) {
    let rows = document.querySelectorAll("#medicine-tbody tr");
    let visibleCount = 0;

    // Remove existing "No Results Found" row before filtering
    let noResultsRow = document.getElementById("no-results-row");
    if (noResultsRow) {
        noResultsRow.remove();
    }

    rows.forEach(row => {
        // Skip if this is the "No Results Found" row
        if (row.id === "no-results-row") return;

        // Ensure the cells exist before trying to access their text content
        let categoryCell = row.cells[2] ? row.cells[2].textContent.trim() : "";
        let formulationCell = row.cells[3] ? row.cells[3].textContent.trim() : "";

        let showRow = true;

        if (filterType === "category-filter" && filterValue && categoryCell !== filterValue) {
            showRow = false;
        }
        if (filterType === "formulation-filter" && filterValue && formulationCell !== filterValue) {
            showRow = false;
        }

        row.style.display = showRow ? "" : "none";

        if (showRow) {
            visibleCount++;
        }
    });

    // If no rows are visible, add "No Results Found"
    if (visibleCount === 0) {
        let tbody = document.getElementById("medicine-tbody");
        let noResultsRow = document.createElement("tr");
        noResultsRow.id = "no-results-row";
        noResultsRow.innerHTML = `<td colspan="8" style="text-align: center; padding: 10px; font-weight: bold; color: #888;">No results found</td>`;
        tbody.appendChild(noResultsRow);
    }
}

