// Function to Sort the Essential Table
function sortessentialTable(columnIndex, order, clickedButton) {
    products.sort((a, b) => {
        let valueA, valueB;

        switch (columnIndex) {
            case 4: // Size/Unit (Could contain text like "500mg", so compare as a string)
                valueA = extractNumericValue(a.productsizeunit);
                valueB = extractNumericValue(b.productsizeunit);
                break;
            case 5: // Stock (Convert to integer)
                valueA = parseInt(a.productstock);
                valueB = parseInt(b.productstock);
                break;
            case 6: // Price (Remove ₱ and parse as float)
                valueA = parseFloat(a.productprice.replace("₱", ""));
                valueB = parseFloat(b.productprice.replace("₱", ""));
                break;
            case 7: // Expiry Date (Convert to Date object)
                valueA = new Date(a.productexpiry);
                valueB = new Date(b.productexpiry);
                break;
            default:
                return 0;
        }

        return order === "asc" ? valueA - valueB : valueB - valueA;
    });

    updateEssentialSortButtonStyles(clickedButton);
    renderessentialTable(); // Re-render the table
}

function extractNumericValue(sizeUnit) {
    let match = sizeUnit.match(/^(\d+(\.\d+)?)/); // Extract number from the beginning
    return match ? parseFloat(match[0]) : 0; // Convert to float, default to 0 if no match
}

// Function to Update Essential Sort Button Styles
function updateEssentialSortButtonStyles(activeButton) {
    document.querySelectorAll(".essential-sort-button").forEach(button => {
        button.style.background = "#ddd"; // Reset background
        button.style.color = "#777"; // Reset icon color
    });

    if (activeButton) {
        activeButton.style.background = "#687BEB";
        activeButton.style.color = "white";
    }
}

// Add Event Listeners to Essential Sort Buttons
document.querySelectorAll(".essential-sort-button").forEach(button => {
    button.addEventListener("click", function () {
        let columnIndex = parseInt(this.getAttribute("data-column"));
        let order = this.getAttribute("data-order");

        // Toggle sorting order on each click
        this.setAttribute("data-order", order === "asc" ? "desc" : "asc");

        sortessentialTable(columnIndex, order, this);
    });
});
