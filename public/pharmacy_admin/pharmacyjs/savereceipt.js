// Function to save receipt to a file
function saveReceiptToFile() {
    const receiptContent = document.getElementById("receipt-content");

    // Prepare the receipt content in a text format
    let receiptText = `Medisupply Pharmacy Receipt\n`;
    receiptText += `Pharmacy Name: ${document.getElementById("receipt-pharmacy-name").textContent}\n`;
    receiptText += `Date: ${document.getElementById("transaction-date").textContent}\n`;
    receiptText += `Time: ${document.getElementById("transaction-time").textContent}\n\n`;

    receiptText += `Purchased Items:\n`;
    const itemsList = document.getElementById("items-list").children;
    for (let item of itemsList) {
        const itemName = item.querySelector(".item-left").textContent;
        const itemPrice = item.querySelector(".item-price").textContent;
        receiptText += `${itemName}: ${itemPrice}\n`;
    }

    receiptText += `\nTotal Quantity: ${document.getElementById("total-quantity-receipt").textContent}\n`;
    receiptText += `Total Price: ₱${document.getElementById("total-price-receipt").textContent}\n`;
    receiptText += `Cash Paid: ₱${document.getElementById("cash-paid-receipt").textContent}\n`;
    receiptText += `Change: ₱${document.getElementById("change-receipt").textContent}\n\n`;

    receiptText += `\nMedisupply Pharmacy\n1234 Pharmacy St., City, Country\n`;
    receiptText += `Contact: support@medisupply.com | +1 234 567 89\n`;
    receiptText += `Visit us: www.medisupply.com\n`;

    // Create a Blob and download it as a file
    const blob = new Blob([receiptText], { type: "text/plain;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "receipt.txt"; // The file name when downloading
    link.click();
}

// Event listener for the "Save Receipt" button
document.getElementById("save-receipt-btn").addEventListener("click", saveReceiptToFile);
