let editProductImageBase64 = "";

function essentialhandleeditImageUpload() {
    const fileInput = document.getElementById("edit-product-image");
    const file = fileInput.files[0];

    const imageErrorMessage = document.getElementById("edit-product-image-error");
    if (imageErrorMessage) {
        imageErrorMessage.style.display = 'none'; // Hide the error message
    }

    if (file) {
        const reader = new FileReader();
        reader.onloadend = function () {
            editProductImageBase64 = reader.result; // Store Base64 string

            let container = document.getElementById("edit-product-image-preview-container");
            container.innerHTML = ""; // Clear previous preview

            let wrapper = document.createElement("div");
            wrapper.className = "image-wrapper";

            let imgPreview = document.createElement("img");
            imgPreview.id = "edit-product-image-preview";
            imgPreview.style.maxWidth = "100px";
            imgPreview.style.maxHeight = "100px";
            imgPreview.src = editProductImageBase64; // Set new image

            let removeBtn = document.createElement("button");
            removeBtn.className = "remove-btn";
            removeBtn.innerHTML = "&times;";
            removeBtn.onclick = function () {
                resetEditForm();
            };

            wrapper.appendChild(imgPreview);
            wrapper.appendChild(removeBtn);
            container.appendChild(wrapper);
        };

        reader.readAsDataURL(file); // Convert to Base64
    }
}

let selectedProductId = null; // Stores the selected product ID

// Function to open the edit modal and populate fields
async function openEditEssentialModal(button) {
    const row = button.closest("tr"); // Get the row where the button was clicked
    selectedProductId = row.dataset.id; // Get the product ID from the row
    if (!selectedProductId) {
        console.error("No product ID found.");
        return;
    }

    console.log("Fetching product with ID:", selectedProductId);
    try {
        // Fetch product data from Firestore
        const doc = await db.collection("essential_storage").doc(selectedProductId).get();
        if (!doc.exists) {
            console.error("No product found with this ID.");
            return;
        }

        const product = doc.data(); // Get product details
        console.log("Fetched document:", doc.data());

        // Populate the edit modal fields with the fetched data
        document.getElementById("edit-product-name").value = product.productName || "";
        document.getElementById("edit-essential-brand-name").value = product.essentialbrandName || "";
        document.getElementById("edit-size").value = product.size || "";
       
        document.querySelector("#edit-product-category .selected-option").textContent = product.category || "Choose Category";
        document.querySelector("#edit-unit-of-measure .selected-option").textContent = product.unitOfMeasure || "Choose Unit of Measure";

        const essentialcontraindicationCheckboxes = document.querySelectorAll("#edit-essential-contraindications .dropdown-options input[type='checkbox']");
        let selectedessentialContraindications = [];

        essentialcontraindicationCheckboxes.forEach(checkbox => {
            if (product.essentialcontraindications.includes(checkbox.value)) {
                checkbox.checked = true;
                selectedessentialContraindications.push(checkbox.value);
            } else {
                checkbox.checked = false;
            }
        });

        // Update the dropdown display text
        document.querySelector("#edit-essential-contraindications .selected-option").textContent = 
        selectedessentialContraindications.length ? selectedessentialContraindications.join(", ") : "Choose Contraindications";


        document.getElementById("edit-essential-description-usage").value = product.essentialdescriptionUsage || "";
        document.getElementById("edit-storage-instructions").value = product.storageInstructions || "";
        document.getElementById("edit-essential-stock-quantity").value = product.essentialstockQuantity || "";
        document.getElementById("edit-essential-reorder-level").value = product.essentialreorderLevel || "";
        document.getElementById("edit-essential-expiration-date").value = product.essentialexpirationDate || "";
        document.getElementById("edit-essential-batch-number").value = product.essentialbatchNumber || "";
        document.getElementById("edit-essential-supplier").value = product.essentialsupplier || "";
        document.getElementById("edit-essential-purchase-price").value = product.essentialpurchasePrice || "";
        document.getElementById("edit-essential-selling-price").value = product.essentialsellingPrice || "";
        document.getElementById("edit-essential-discount-price").value = product.essentialdiscountPrice || "";

        let editessentialImagePreviewContainer = document.getElementById("edit-product-image-preview-container");
        editessentialImagePreviewContainer.innerHTML = ""; // Clear previous image
        if (product.productImageBase64) {
            let container = document.getElementById("edit-product-image-preview-container");
            container.innerHTML = ""; // Clear previous preview
        
            let wrapper = document.createElement("div");
            wrapper.className = "image-wrapper"; // Ensure it follows the same design
        
            let imgPreview = document.createElement("img");
            imgPreview.id = "edit-product-image-preview";
            imgPreview.style.maxWidth = "100px";
            imgPreview.style.maxHeight = "100px";
            imgPreview.src = product.productImageBase64; // Populate with base64 image
        
            let removeBtn = document.createElement("button");
            removeBtn.className = "remove-btn";
            removeBtn.innerHTML = "&times;";
            removeBtn.onclick = function () {
                container.innerHTML = "";
                document.getElementById("edit-product-image").value = ""; // Reset file input
                editProductImageBase64 = ""; // Clear the base64 string
            };
        
            wrapper.appendChild(imgPreview);
            wrapper.appendChild(removeBtn);
            container.appendChild(wrapper);

            editProductImageBase64 = product.productImageBase64; 
        } else {
            editProductImageBase64 = ""; // If no image exists, keep it empty
        }

        document.getElementById("edit-essential-qr-code-img").src = "";

        // Show the modal
        document.getElementById("edit-essential-modal").style.display = "block";

    } catch (error) {
        console.error("Error fetching medicine details: ", error);
    }
}

// Function to close the edit modal
function closeEssentialEditModal() {
    document.getElementById("edit-essential-modal").style.display = "none";
    selectedProductId = null; // Reset the selected product ID
}


function validateessentialEditForm() {
    let isEditEssentialValid = true;

    // Check each required field
    const requiredFields = [
        { id: 'edit-product-name', errorId: 'edit-product-name-error', message: 'This field is required' },
        { id: 'edit-essential-brand-name', errorId: 'edit-essential-brand-name-error', message: 'This field is required' },
        { id: 'edit-product-image', errorId: 'edit-product-image-error', message: 'This field is required' },
        { id: 'edit-product-category', errorId: 'edit-product-category-error', message: 'This field is required' },
        { id: 'edit-size', errorId: 'edit-size-error', message: 'This field is required' },
        { id: 'edit-unit-of-measure', errorId: 'edit-unit-of-measure-error', message: 'This field is required' },
        { id: 'edit-essential-description-usage', errorId: 'edit-essential-description-usage-error', message: 'This field is required' },
        { id: 'edit-essential-expiration-date', errorId: 'edit-essential-expiration-date-error', message: 'This field is required' },
        { id: 'edit-essential-stock-quantity', errorId: 'edit-essential-stock-quantity-error', message: 'This field is required' }, // ✅ Fixed
        { id: 'edit-essential-reorder-level', errorId: 'edit-essential-reorder-level-error', message: 'This field is required' }, // ✅ Fixed
        { id: 'edit-essential-batch-number', errorId: 'edit-essential-batch-number-error', message: 'This field is required' },
        { id: 'edit-essential-purchase-price', errorId: 'edit-essential-purchase-price-error', message: 'This field is required' },
        { id: 'edit-essential-selling-price', errorId: 'edit-essential-selling-price-error', message: 'This field is required' },
    ];

    requiredFields.forEach(field => {
        const input = document.getElementById(field.id);
        const errorMessage = document.getElementById(field.errorId);

        if (!input || !errorMessage) return; // Skip if the element does not exist

        // Check for text, number, and textarea fields
        if (input.tagName === "INPUT" && (input.type === "text" || input.type === "number")) {
            if (!input.value.trim()) {
                errorMessage.textContent = field.message;
                errorMessage.style.display = 'block';
                isEditEssentialValid = false;
            } else {
                errorMessage.style.display = 'none';
            }
        }

        // Check for file input
        else if (input.type === "file") {
            if (input.files.length === 0) {
                errorMessage.textContent = field.message;
                errorMessage.style.display = 'block';
                isEditEssentialValid = false;
            } else {
                errorMessage.style.display = 'none';
            }
        }

        // ✅ Fix for dropdowns with class 'custom-dropdown'
        else if (input.classList.contains('custom-dropdown')) {
            const selectedOption = input.querySelector('.selected-option');
            if (!selectedOption || selectedOption.textContent.trim() === "Choose Formulation/Type" || selectedOption.textContent.trim().startsWith("Choose")) {
                errorMessage.textContent = field.message;
                errorMessage.style.display = 'block';
                isEditEssentialValid = false;
            } else {
                errorMessage.style.display = 'none';
            }
        }

        // Check for textarea fields
        else if (input.tagName === "TEXTAREA") {
            if (!input.value.trim()) {
                errorMessage.textContent = field.message;
                errorMessage.style.display = 'block';
                isEditEssentialValid = false;
            } else {
                errorMessage.style.display = 'none';
            }
        }
    });

    // ✅ Fix for QR Code Validation
    let editessentialqrCodeImg = document.getElementById("edit-essential-qr-code-img");
    let editessentialqrErrorMsg = document.getElementById("edit-essential-qr-code-error");

    if (!editessentialqrCodeImg || !editessentialqrCodeImg.src || editessentialqrCodeImg.src === "" || editessentialqrCodeImg.src.startsWith("file:///") || !editessentialqrCodeImg.src.startsWith("data:image/png;base64")) {
        editessentialqrErrorMsg.textContent = "Please generate the QR Code before saving.";
        editessentialqrErrorMsg.style.display = "block";
        editessentialqrErrorMsg.style.color = "red";
        isEditEssentialValid = false;
    } else {
        editessentialqrErrorMsg.style.display = "none";
    }

    return isEditEssentialValid;
}


document.querySelector(".edit-essential-save-btn").addEventListener("click", async function (event) {
    event.preventDefault(); // Prevent default form submission

    if (!validateessentialEditForm()) {
        return; // If validation fails, stop the function execution
    }

    if (!selectedProductId) {
        console.error("No medicine ID selected for update.");
        return;
    }
    
    const saveessentialButton = document.querySelector(".edit-essential-save-btn");
    saveessentialButton.disabled = true;
    saveessentialButton.textContent = "Saving..."; 

    
    // Get updated data from input fields
    const updatedProduct = {
        productName: document.getElementById("edit-product-name").value,
        essentialbrandName: document.getElementById("edit-essential-brand-name").value,
        category: document.querySelector("#edit-product-category .selected-option").textContent,
        size: document.getElementById("edit-size").value,
        unitOfMeasure: document.querySelector("#edit-unit-of-measure .selected-option").textContent,
        essentialcontraindications: Array.from(document.querySelectorAll("#edit-essential-contraindications .dropdown-options input[type='checkbox']:checked"))
            .map(checkbox => checkbox.value),
        essentialdescriptionUsage: document.getElementById("edit-essential-description-usage").value,
        storageInstructions: document.getElementById("edit-storage-instructions").value,
        essentialstockQuantity: document.getElementById("edit-essential-stock-quantity").value,
        essentialreorderLevel: document.getElementById("edit-essential-reorder-level").value,
        essentialexpirationDate: document.getElementById("edit-essential-expiration-date").value,
        essentialbatchNumber: document.getElementById("edit-essential-batch-number").value,
        essentialsupplier: document.getElementById("edit-essential-supplier").value,
        essentialpurchasePrice: document.getElementById("edit-essential-purchase-price").value,
        essentialsellingPrice: document.getElementById("edit-essential-selling-price").value,
        essentialdiscountPrice: document.getElementById("edit-essential-discount-price").value,
        productImageBase64: editProductImageBase64, // Updated image if changed
        essentialqrCodeDataUrl: edit_essential_generateQR()
    };

    
    try {
        // Update the document in Firestore
        await db.collection("essential_storage").doc(selectedProductId).update(updatedProduct);
        console.log("Product Successfully Updated!");
        
        // Close the modal after successful update
        closeEssentialEditModal();
        
        // Optionally, refresh the table or update UI
        notyf.success("Product Successfully Updated!"); // Replace with a success message modal if needed
    } catch (error) {
        console.error("Error updating product: ", error);
        alert("Failed to update product details.");
    }finally {
        // Re-enable the save button after the operation completes
        saveessentialButton.disabled = false;
        saveessentialButton.textContent = "Save Changes"; // Reset text back to original
    }
});


document.querySelectorAll('.edit-product-form input, .edit-product-form select, .edit-product-form textarea, .edit-product-form .custom-dropdown').forEach(field => {
    field.addEventListener('input', hideAllErrors);
    field.addEventListener('click', hideAllErrors);
});

// ✅ Fix: Hide all error messages when selecting a dropdown option
document.querySelectorAll('.custom-dropdown .dropdown-options li').forEach(option => {
    option.addEventListener('click', function () {
        hideAllErrors(); // Hide all errors when selecting an option
        const dropdown = this.closest('.custom-dropdown');
        const selectedOption = dropdown.querySelector('.selected-option');
        selectedOption.textContent = this.textContent; // Update selected option text
    });
});

// ✅ Function to hide all error messages at once
function hideAllErrors() {
    document.querySelectorAll('.error-input-message').forEach(errorMessage => {
        errorMessage.style.display = 'none';
    });
}


// Add QR code generation functionality if necessary
function edit_essential_generateQR() {
    let editproductName = document.getElementById("edit-product-name").value;
    let editessentialbrandName = document.getElementById("edit-essential-brand-name").value;
    let editproductCategory = document.querySelector("#edit-product-category .selected-option").textContent;
    let editsize = document.getElementById("edit-size").value;
    let editunitOfMeasure = document.querySelector("#edit-unit-of-measure .selected-option").textContent;
    let editessentialdescriptionUsage = document.getElementById("edit-essential-description-usage").value;
    let editstorageInstructions = document.getElementById("edit-storage-instructions").value;
    let editessentialbatchNumber = document.getElementById("edit-essential-batch-number").value;
    let editessentialsupplier = document.getElementById("edit-essential-supplier").value;
    let editessentialexpirationDate = document.getElementById("edit-essential-expiration-date").value;

    // Ensure all required fields are filled before generating QR code
    if (!editproductName || !editessentialbrandName || !editproductCategory || !editsize || !editunitOfMeasure || !editessentialdescriptionUsage || !editessentialbatchNumber || !editessentialexpirationDate) {
        notyf.error("Please fill all required fields before generating the QR Code.");
        return;
    }

    // Create a structured QR data string
    let qrData = `
Medicine Information:
- Name of Product: ${editproductName}
- Name of Brand: ${editessentialbrandName}
- Product Category: ${editproductCategory}
- Product Size: ${editsize}
- Unit of Measure: ${editunitOfMeasure}
- Description/Usage: ${editessentialdescriptionUsage}
- Storage Instructions: ${editstorageInstructions || 'N/A'}
- Batch Number: ${editessentialbatchNumber}
- Supplier/Manufacturer: ${editessentialsupplier || 'N/A'}
- Expiry Date: ${editessentialexpirationDate}
`;

    let qrCode = new QRious({
        value: qrData,
        size: 140
    });

    // Get the data URL of the generated QR code
    let editessentialqrCodeImg = qrCode.toDataURL();

    // Set the image source to the QR code data URL
    document.getElementById("edit-essential-qr-code-img").src = editessentialqrCodeImg;

    let editessentialqrErrorMsg = document.getElementById("edit-essential-qr-code-error");
    if (editessentialqrErrorMsg) {
        editessentialqrErrorMsg.style.display = "none";
    }

    return editessentialqrCodeImg;
}



function resetEditEssentialForm() {
    // Reset all text inputs
    const textInputs = document.querySelectorAll("#edit-essential-modal input[type='text'], #edit-essential-modal input[type='number'], #edit-essential-modal textarea");
    textInputs.forEach(input => input.value = "");

    // Reset file input
    const fileInput = document.getElementById("edit-product-image");
    fileInput.value = "";

    // Reset dropdowns
    const dropdowns = document.querySelectorAll("#edit-essential-modal .custom-dropdown .selected-option");
    dropdowns.forEach(dropdown => {
        dropdown.textContent = "Choose Option";
    });

    // Reset checkboxes (contraindications)
    const checkboxes = document.querySelectorAll("#edit-essential-contraindications .dropdown-options input[type='checkbox']");
    checkboxes.forEach(checkbox => checkbox.checked = false);

    // Reset image preview
    const imagePreviewContainer = document.getElementById("edit-product-image-preview-container");
    imagePreviewContainer.innerHTML = "";

    // Reset the Base64 string
    editProductImageBase64 = "";

    // Reset QR code image
    const qrCodeImage = document.getElementById("edit-essential-qr-code-img");
    qrCodeImage.src = "";

    // Reset all error messages
    const editerrorMessage = document.querySelectorAll("#edit-essential-modal .error-message");
    editerrorMessage.forEach(error => error.style.display = "none");

    const requiredFields = [
        'edit-product-name', 'edit-essential-brand-name', 'edit-product-image', 'edit-product-category', 
        'edit-size', 'edit-unit-of-measure', 'edit-essential-description-usage', 'edit-essential-expiration-date', 
        'edit-essential-stock-quantity', 'edit-essential-reorder-level', 'edit-essential-batch-number', 'edit-essential-purchase-price', 
        'edit-essential-selling-price'
    ];

    requiredFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        const errorMessage = document.getElementById(`${fieldId}-error`);
        if (errorMessage) {
            errorMessage.style.display = 'none';  // Ensure error messages are hidden
        }

        // Reset validation class if any field has it
        if (field && field.classList.contains('invalid')) {
            field.classList.remove('invalid');  // Remove invalid class
        }
    });

    // Reset QR code error message (if any)
    const editessentialqrErrorMsg = document.getElementById("edit-essential-qr-code-error");
    if (editessentialqrErrorMsg) {
        editessentialqrErrorMsg.style.display = 'none';
    }

}
