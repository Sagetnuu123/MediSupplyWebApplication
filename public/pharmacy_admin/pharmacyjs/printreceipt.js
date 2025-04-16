// Function to print the receipt
function printReceipt() {
    const receiptContent = document.getElementById("receipt-content");

    // Open a new window for printing
    const printWindow = window.open('', '', 'height=600,width=800');
    
    // Inject styles for printing
    const printStyles = `
        <style>
            body {
                font-family: Arial, sans-serif;
                margin: 0;
                padding: 0;
                text-align: center;
            }
            .receipt-logo img {
                width: 100px;
            }
            h2 {
                font-size: 16px;
                font-weight: 600;
                text-transform: uppercase;
            }
            #receipt-content {
                padding: 20px;
                margin: 20px;
                border: 1px solid #ddd;
                background-color: #fff;
            }
            .receipt-footer {
                font-size: 10px;
                color: #777;
            }
            .receipt-footer a {
                text-decoration: none;
                color: #4CAF50;
            }
            .total-summary p {
                font-size: 12px;
                font-weight: bold;
            }
            #items-list {
                margin-top: 10px;
                text-align: left;
            }
            #items-list div {
                margin: 5px 0;
            }
        </style>
    `;

    // Create the HTML structure for the printed page
    let printHtml = `
        <html>
            <head>
                <title>Receipt</title>
                ${printStyles} <!-- Add the styles for printing -->
            </head>
            <body>
                <div id="receipt-content">
                    ${receiptContent.innerHTML}
                </div>
            </body>
        </html>
    `;

    // Write the receipt content to the new window
    printWindow.document.write(printHtml);

    // Wait for the document to load, then print it
    printWindow.document.close();
    printWindow.print();
}

// Event listener for the "Print Receipt" button
document.getElementById("print-receipt-btn").addEventListener("click", printReceipt);
