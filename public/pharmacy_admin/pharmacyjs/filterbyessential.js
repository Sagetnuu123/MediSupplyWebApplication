// Toggle dropdown visibility for Essential Table
document.querySelectorAll('.essential-filter-btn').forEach(button => {
    button.addEventListener('click', function (event) {
        event.stopPropagation(); // Prevents event bubbling issues
        this.parentElement.classList.toggle('active');
    });
});

// Select filter option for Essential Table
document.querySelectorAll('.essential-filter-options li').forEach(option => {
    option.addEventListener('click', function () {
        let filterType = this.parentElement.parentElement.id;
        let selectedValue = this.getAttribute("data-value");

        // Find the button and its icon
        let button = this.parentElement.previousElementSibling;
        
        // Update button text while keeping the icon
        button.innerHTML = `${selectedValue ? selectedValue : `Filter by ${filterType.includes("category") ? "Category" : "Unit"}`} <i class="bx bx-chevron-down select-icon"></i>`;

        // Remove active class from dropdown
        this.parentElement.parentElement.classList.remove("active");

        // Apply filtering function
        filterEssentialTable(filterType, selectedValue);
    });
});

// Close essential dropdowns when clicking outside
document.addEventListener("click", function (e) {
    document.querySelectorAll('.essential-filter-dropdown').forEach(dropdown => {
        if (!dropdown.contains(e.target)) {
            dropdown.classList.remove("active");
        }
    });
});

function filterEssentialTable(filterType, filterValue) {
    let rows = document.querySelectorAll("#essential-tbody tr");
    let visibleCount = 0;

    // Remove existing "No Results Found" row before filtering
    let noResultsRow = document.getElementById("essential-no-results-row");
    if (noResultsRow) {
        noResultsRow.remove();
    }

    rows.forEach(row => {
        let categoryCell = row.cells[2] ? row.cells[2].textContent.trim() : "";
        let sizeUnitCell = row.cells[3] ? row.cells[3].textContent.trim() : ""; // Combined size/unit column

        // Extract just the unit from the combined column
        let unitValue = sizeUnitCell.split(" ").pop(); // Gets the last word (unit)

        let showRow = true;

        if (filterType === "essential-category-filter" && filterValue && categoryCell !== filterValue) {
            showRow = false;
        }
        if (filterType === "unit-filter" && filterValue && unitValue !== filterValue) {
            showRow = false;
        }

        row.style.display = showRow ? "" : "none";

        if (showRow) {
            visibleCount++;
        }
    });

    // If no rows are visible, add "No Results Found"
    if (visibleCount === 0) {
        let tbody = document.getElementById("essential-tbody");
        let noResultsRow = document.createElement("tr");
        noResultsRow.id = "essential-no-results-row";
        noResultsRow.innerHTML = `<td colspan="8" style="text-align: center; padding: 10px; font-weight: bold; color: #888;">No results found</td>`;
        tbody.appendChild(noResultsRow);
    }
}
