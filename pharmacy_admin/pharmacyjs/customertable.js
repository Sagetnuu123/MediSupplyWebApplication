const customertableBody = document.getElementById("customer-tbody");
const customerrowsPerPageSelect = document.getElementById("customer-rows-per-page");
const customerprevPageButton = document.getElementById("customer-prev-page");
const customernextPageButton = document.getElementById("customer-next-page");
const customerpageInfo = document.getElementById("customer-page-info");

let customercurrentPage = 1;
let customerrowsPerPage = parseInt(customerrowsPerPageSelect.value);
let customers = [];

// 🔹 Prevent unauthorized access
if (!pharmacyEmail || !pharmacyName) {
    console.warn("No pharmacy is logged in. Restricting data access.");
    customertableBody.innerHTML = `
        <tr id="no-access-row">
            <td colspan="6" style="text-align: center; padding: 10px; font-weight: bold; color: #888;">
                You must be logged in to view medicine records.
            </td>
        </tr>
    `;
} else {
    // 🔹 Real-time Firestore Listener (Filter by pharmacy)
    db.collection("customer_count")
        .where("pharmacyEmail", "==", pharmacyEmail) // Restrict by email
        .where("pharmacyName", "==", pharmacyName) // Restrict by name
        .onSnapshot(snapshot => {
            if (snapshot.empty) {
                // 🔹 Show message if no medicines are found
                customertableBody.innerHTML = `
                    <tr id="no-data-row">
                        <td colspan="8" style="text-align: center; padding: 10px; font-weight: bold; color: #888;">
                            No medicine records found. Please add medicines.
                        </td>
                    </tr>
                `;
                customers = [];
                updatecustomerPaginationInfo();
                return;
            }

            // 🔹 Map Firestore data into array
            customers = snapshot.docs.map(doc => ({
                id: doc.id,
                customer: doc.data().customer, // Base64 Image
                items: doc.data().items,
                totalAmount: doc.data().totalAmount,
                cashPaid: doc.data().cashPaid,
                change: doc.data().change,
                transactionDate: doc.data().transactionDate
            }));

            customers.sort((a, b) => new Date(b.transactionDate) - new Date(a.transactionDate));

            rendercustomerTable();
        });
}

// 🔹 Render Table with Pagination & "No Data Found"
function rendercustomerTable() {
    customertableBody.innerHTML = ""; // Clear table

    let customerstart = (customercurrentPage - 1) * customerrowsPerPage;
    let customerend = customerstart + customerrowsPerPage;
    let customerpaginatedItems = customers.slice(customerstart, customerend);

    if (customerpaginatedItems.length === 0) {
        customertableBody.innerHTML = `
            <tr id="no-results-row">
                <td colspan="8" style="text-align: center; padding: 10px; font-weight: bold; color: #888;">
                    No medicine records found. Please add medicines.
                </td>
            </tr>
        `;
    } else {
        customerpaginatedItems.forEach(customer => {
            let itemString = Array.isArray(customer.items)
            ? customer.items.map(item => `${item.productName} (x${item.quantity})`).join(", ")
            : "No items";

            let row = `
                <tr>
                    <td data-label="Category">${customer.customer}</td>
                     <td data-label="Items">${itemString}</td>
                    <td data-label="Formulation">${customer.totalAmount}</td>
                    <td data-label="Dosage">${customer.cashPaid}</td>
                    <td data-label="Stock">${customer.change}</td>
                    <td data-label="Expiry Date">${customer.transactionDate}</td>
                </tr>
            `;
            customertableBody.innerHTML += row;
        });
    }

    updatecustomerPaginationInfo();
}

// 🔹 Update Pagination Info
function updatecustomerPaginationInfo() {
    let customertotalPages = Math.ceil(customers.length / customerrowsPerPage);
    customerpageInfo.innerText = `Page ${customers.length > 0 ? customercurrentPage : 0} of ${customertotalPages || 1}`;
    customerprevPageButton.disabled = customercurrentPage === 1;
    customernextPageButton.disabled = customercurrentPage === customertotalPages || customers.length === 0;
}

// 🔹 Handle Page Change
customerrowsPerPageSelect.addEventListener("change", function () {
    customerrowsPerPage = parseInt(this.value);
    customercurrentPage = 1;
    rendercustomerTable();
});

customerprevPageButton.addEventListener("click", function () {
    if (customercurrentPage > 1) {
        customercurrentPage--;
        rendercustomerTable();
    }
});

customernextPageButton.addEventListener("click", function () {
    if (customercurrentPage * customerrowsPerPage < customers.length) {
        customercurrentPage++;
        rendercustomerTable();
    }
});

