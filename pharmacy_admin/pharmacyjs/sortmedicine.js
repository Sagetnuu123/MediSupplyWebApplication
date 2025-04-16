// Function to Sort the Table
function sortTable(columnIndex, order, clickedButton) {
    medicines.sort((a, b) => {
        let valueA, valueB;

        switch (columnIndex) {
            case 4: // Dosage
                valueA = parseFloat(a.dosage);
                valueB = parseFloat(b.dosage);
                break;
            case 5: // Stock
                valueA = parseInt(a.stock);
                valueB = parseInt(b.stock);
                break;
            case 6: // Price (Remove ₱ and parse as float)
                valueA = parseFloat(a.price.replace("₱", ""));
                valueB = parseFloat(b.price.replace("₱", ""));
                break;
            case 7: // Expiry Date (Convert to Date object)
                valueA = new Date(a.expiry);
                valueB = new Date(b.expiry);
                break;
            default:
                return 0;
        }

        return order === "asc" ? valueA - valueB : valueB - valueA;
    });

    updateSortButtonStyles(clickedButton);
    renderTable();
}

// Function to Update Button Styles
function updateSortButtonStyles(activeButton) {
    document.querySelectorAll(".sort-button").forEach(button => {
        button.style.background = "#ddd"; // Reset background
        button.style.color = "#777"; // Reset icon color
    });

    // Highlight active button
    if (activeButton) {
        activeButton.style.background = "#687BEB";
        activeButton.style.color = "white";
    }
}

// Add Event Listeners to Sort Buttons
document.querySelectorAll(".sort-button").forEach(button => {
    button.addEventListener("click", function () {
        let columnIndex = parseInt(this.getAttribute("data-column"));
        let order = this.getAttribute("data-order");

        // Toggle sorting order on each click
        if (order === "asc") {
            this.setAttribute("data-order", "desc");
        } else {
            this.setAttribute("data-order", "asc");
        }

        sortTable(columnIndex, order, this);
    });
});
