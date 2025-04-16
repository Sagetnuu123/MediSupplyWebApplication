function openViewProductModal(button) {
    let productrow = button.closest("tr");
    let productId = productrow.getAttribute("data-id");

    db.collection("essential_storage").doc(productId).get().then(doc => {
        if (doc.exists) {
            let data = doc.data();
            document.getElementById("view-product-name").textContent = data.productName || "N/A";
            document.getElementById("batch-essential-value").textContent = data.essentialbatchNumber || "N/A";
            document.getElementById("view-essential-brand-name").textContent = data.essentialbrandName || "N/A";
            document.getElementById("view-product-category").textContent = data.category || "N/A";
            document.getElementById("view-size-unit").textContent = data.size || "N/A";
            document.getElementById("view-product-description").textContent = data.essentialdescriptionUsage || "N/A";
            document.getElementById("view-storage-instructions").textContent = data.storageInstructions || "No information";
            document.getElementById("view-product-contraindicatins").textContent = 
            (Array.isArray(data.essentialcontraindications) && data.essentialcontraindications.length > 0) 
            ? data.essentialcontraindications.join(", ") 
            : "No information";        

            document.getElementById("view-product-image").src = data.productImageBase64 || "";

            document.getElementById("view-product-stock-quantity").textContent = data.essentialstockQuantity || "N/A";
            document.getElementById("view-product-reorder-level").textContent = data.essentialreorderLevel || "N/A";
            document.getElementById("view-product-supplier").textContent = data.essentialsupplier || "N/A";
            document.getElementById("view-product-expiry-date").textContent = data.essentialexpirationDate || "N/A";
            
            function formatPrice(price) {
                return `₱${parseFloat(price).toFixed(2)}`;
            }
            
            document.getElementById("view-product-purchase-price").textContent = data.essentialpurchasePrice 
                ? formatPrice(data.essentialpurchasePrice) 
                : "N/A";
            
            document.getElementById("view-product-selling-price").textContent = data.essentialsellingPrice 
                ? formatPrice(data.essentialsellingPrice) 
                : "N/A";
            
            document.getElementById("view-product-discounted-price").textContent = data.essentialdiscountPrice 
                ? formatPrice(data.essentialdiscountPrice) 
                : "No information";
            

            document.getElementById("view-product-modal").style.display = "flex";
        } else {
            console.error("No such document!");
        }
    }).catch(error => {
        console.error("Error fetching document: ", error);
    });
}

function closeViewProductModal() {
    document.getElementById("view-product-modal").style.display = "none";
}

document.addEventListener("click", function (event) {
    if (event.target.closest(".essential-view-btn")) {
        openViewProductModal(event.target.closest(".essential-view-btn"));
    }
});