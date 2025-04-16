let productImageBase64 = "";

function essentialhandleImageUpload() {
    const fileInput = document.getElementById("product-image");
    const file = fileInput.files[0];

    if (file) {
        const reader = new FileReader();

        reader.onloadend = function () {
            productImageBase64 = reader.result; // Store Base64 string

            let container = document.getElementById("product-image-preview-container");
            container.innerHTML = ""; // Clear previous preview

            let wrapper = document.createElement("div");
            wrapper.className = "image-wrapper";

            let imgPreview = document.createElement("img");
            imgPreview.id = "essential-medicine-image-preview";
            imgPreview.style.maxWidth = "100px";
            imgPreview.style.maxHeight = "100px";
            imgPreview.src = productImageBase64; // Set Base64 as image source

            let removeBtn = document.createElement("button");
            removeBtn.className = "remove-btn";
            removeBtn.innerHTML = "&times;";
            removeBtn.onclick = function () {
                container.innerHTML = "";
                fileInput.value = "";
                productImageBase64 = ""; // Reset Base64 string
            };

            wrapper.appendChild(imgPreview);
            wrapper.appendChild(removeBtn);
            container.appendChild(wrapper);
        };

        reader.readAsDataURL(file); // Convert image to Base64
    }
}


function essentialvalidateForm() {
    let isesssentialValid = true;

    // Check each required field (Ensure the errorId is correctly named)
    const requiredFields = [
        { id: 'product-name', errorId: 'product-name-error', message: 'This field is required' },
        { id: 'essential-brand-name', errorId: 'essential-brand-name-error', message: 'This field is required' },
        { id: 'product-image', errorId: 'product-image-error', message: 'This field is required' },
        { id: 'product-category', errorId: 'product-category-error', message: 'This field is required' },
        { id: 'size', errorId: 'size-error', message: 'This field is required and must be greater than 0' },
        { id: 'unit-of-measure', errorId: 'unit-of-measure-error', message: 'This field is required' },
        { id: 'essential-description-usage', errorId: 'essential-description-usage-error', message: 'This field is required' },
        { id: 'essential-expiration-date', errorId: 'essential-expiration-date-error', message: 'This field is required' },
        { id: 'essential-stock-quantity', errorId: 'essential-stock-quantity-error', message: 'This field is required and must be greater than 0' }, // ✅ Fixed
        { id: 'essential-reorder-level', errorId: 'essential-reorder-level-error', message: 'This field is required and must be greater than 0' }, // ✅ Fixed
        { id: 'essential-batch-number', errorId: 'essential-batch-number-error', message: 'This field is required and must be a positive number' },
        { id: 'essential-purchase-price', errorId: 'essential-purchase-price-error', message: 'This field is required and must be greater than 0' },
        { id: 'essential-selling-price', errorId: 'essential-selling-price-error', message: 'This field is required and must be greater than 0' },
    ];

    requiredFields.forEach(field => {
        const input = document.getElementById(field.id);
        const errorMessage = document.getElementById(field.errorId);

        if (!input || !errorMessage) return;

        if (input.tagName === "INPUT" && (input.type === "text" || input.type === "number")) {
            const value = input.value.trim();

            if (!value) {
                errorMessage.textContent = field.message;
                errorMessage.style.display = 'block';
                isesssentialValid = false;
            } else if (
                ['size', 'essential-stock-quantity', 'essential-reorder-level', 'essential-selling-price', 'essential-purchase-price'].includes(field.id) &&
                (isNaN(value) || Number(value) <= 0)
            ) {
                errorMessage.textContent = 'Value must be greater than 0';
                errorMessage.style.display = 'block';
                isesssentialValid = false;
            } else if (
                field.id === 'essential-batch-number' &&
                (isNaN(value) || Number(value) <= 0)
            ) {
                errorMessage.textContent = 'Batch number must be a positive number';
                errorMessage.style.display = 'block';
                isesssentialValid = false;
            } else {
                errorMessage.style.display = 'none';
            }
        }

        else if (input.type === "file") {
            if (input.files.length === 0) {
                errorMessage.textContent = field.message;
                errorMessage.style.display = 'block';
                isesssentialValid = false;
            } else {
                errorMessage.style.display = 'none';
            }
        }

        else if (input.classList.contains('custom-dropdown')) {
            const selectedOption = input.querySelector('.selected-option');
            if (!selectedOption || selectedOption.textContent.trim().startsWith("Choose")) {
                errorMessage.textContent = field.message;
                errorMessage.style.display = 'block';
                isesssentialValid = false;
            } else {
                errorMessage.style.display = 'none';
            }
        }

        else if (input.tagName === "TEXTAREA") {
            if (!input.value.trim()) {
                errorMessage.textContent = field.message;
                errorMessage.style.display = 'block';
                isesssentialValid = false;
            } else {
                errorMessage.style.display = 'none';
            }
        }
    });


    // ✅ Fix for QR Code Validation
    let essentialqrCodeImg = document.getElementById("essential-qr-code-img");
    let essentialqrErrorMsg = document.getElementById("essential-qr-code-error");

    if (!essentialqrCodeImg || !essentialqrCodeImg.src || essentialqrCodeImg.src === "" || essentialqrCodeImg.src.startsWith("file:///") || !essentialqrCodeImg.src.startsWith("data:image/png;base64")) {
        essentialqrErrorMsg.textContent = "Please generate the QR Code before saving.";
        essentialqrErrorMsg.style.display = "block";
        essentialqrErrorMsg.style.color = "red";
        isesssentialValid = false;
    } else {
        essentialqrErrorMsg.style.display = "none";
    }

    return isesssentialValid;
}


document.addEventListener("DOMContentLoaded", function () {
    const contraindicationsDropdown = document.getElementById("essential-contraindications");
    const selectedOption = contraindicationsDropdown.querySelector(".selected-option");
    const dropdownOptions = contraindicationsDropdown.querySelector(".dropdown-options");
    const checkboxes = dropdownOptions.querySelectorAll("input[type='checkbox']");

    // Toggle dropdown visibility
    contraindicationsDropdown.addEventListener("click", function (event) {
        event.stopPropagation();
        dropdownOptions.style.display = dropdownOptions.style.display === "block" ? "none" : "block";
    });

    // Prevent closing when clicking inside the dropdown
    dropdownOptions.addEventListener("click", function (event) {
        event.stopPropagation();
    });

    // Update the selected option text when checkboxes change
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener("change", function () {
            updateSelectedContraindications();
        });
    });

    function updateSelectedContraindications() {
        const selectedValues = Array.from(checkboxes)
            .filter(checkbox => checkbox.checked)
            .map(checkbox => checkbox.value);

        selectedOption.textContent = selectedValues.length ? selectedValues.join(", ") : "Choose Contraindications";
    }

    // Close dropdown when clicking outside
    document.addEventListener("click", function () {
        dropdownOptions.style.display = "none";
    });
});

// Event listener for saving the medicine data
document.querySelector('.essential-save-btn').addEventListener('click', saveEssentialData);

let isSubmitting = false; // Prevents multiple submissions

async function saveEssentialData(event) {
    event.preventDefault(); // Prevent default form submission

    if (isSubmitting) return; // Prevent multiple submissions
    isSubmitting = true; // Set flag to prevent duplicates

    const saveButton = document.querySelector('.essential-save-btn');
    saveButton.disabled = true; // Disable the button

    if (!essentialvalidateForm()) {
        isSubmitting = false; // Allow submission again
        saveButton.disabled = false;
        return;
    }

    // Get the logged-in user's email and pharmacy name
    const pharmacyEmail = sessionStorage.getItem('pharmacyEmail');
    const pharmacyName = sessionStorage.getItem('pharmacyName');
    const latitude = sessionStorage.getItem('latitude');  // Get latitude from sessionStorage
    const longitude = sessionStorage.getItem('longitude'); // Get longitude from sessionStorage

    if (!pharmacyEmail) {
        notyf.error('You need to be logged in to add medicine.');
        isSubmitting = false;
        saveButton.disabled = false;
        return;
    }

    // Collect form data
    let productName = document.getElementById("product-name").value.trim();
    let essentialbrandName = document.getElementById("essential-brand-name").value.trim();
    let category = document.querySelector("#product-category .selected-option").textContent.trim();
    let size = document.getElementById("size").value.trim();
    let unitOfMeasure = document.querySelector("#unit-of-measure .selected-option").textContent.trim();
    let essentialdescriptionUsage = document.getElementById("essential-description-usage").value.trim();
    let storageInstructions = document.getElementById("storage-instructions").value.trim();
    let essentialbatchNumber = document.getElementById("essential-batch-number").value.trim();
    let essentialexpirationDate = document.getElementById("essential-expiration-date").value.trim();
    let essentialsupplier = document.getElementById("essential-supplier").value.trim();
    let essentialstockQuantity = document.getElementById("essential-stock-quantity").value.trim();
    let essentialreorderLevel = document.getElementById("essential-reorder-level").value.trim();
    let essentialpurchasePrice = document.getElementById("essential-purchase-price").value.trim();
    let essentialsellingPrice = document.getElementById("essential-selling-price").value.trim();
    let essentialdiscountPrice = document.getElementById("essential-discount-price").value.trim();
    let essentialcontraindications = Array.from(document.querySelectorAll('#essential-contraindications .dropdown-options input[type="checkbox"]:checked'))
        .map(input => input.value);
    let essentialqrCodeDataUrl = document.getElementById("essential-qr-code-img").src.trim();

    // Ensure all required fields are filled
    if (!productName || !essentialbrandName || !category || !size || !unitOfMeasure || !essentialdescriptionUsage || !essentialstockQuantity || !essentialreorderLevel || !essentialexpirationDate || !essentialbatchNumber || !essentialpurchasePrice || !essentialsellingPrice || !essentialqrCodeDataUrl) {
        notyf.error("Please fill all required fields before saving.");
        isSubmitting = false;
        saveButton.disabled = false;
        return;
    }

    if (!productImageBase64) {
        notyf.error('Please upload an image.');
        isSubmitting = false;
        saveButton.disabled = false;
        return;
    }

    try {
        // 🔹 **Check if the medicine already exists before adding**
        const querySnapshot = await db.collection('essential_storage')
            .where('productName', '==', productName)
            .where('pharmacyEmail', '==', pharmacyEmail)
            .get();

        if (!querySnapshot.empty) {
            notyf.error('This product already exists in the database.');
            isSubmitting = false;
            saveButton.disabled = false;
            return;
        }

        // 🔹 **Prepare the medicine data object**
        const essentialData = {
            productName,
            essentialbrandName,
            category,
            size,
            unitOfMeasure,
            essentialdescriptionUsage,
            storageInstructions,
            essentialbatchNumber,
            essentialexpirationDate,
            essentialsupplier,
            essentialstockQuantity,
            essentialreorderLevel,
            essentialpurchasePrice,
            essentialsellingPrice,
            essentialcontraindications,
            essentialdiscountPrice,
            productImageBase64,
            essentialqrCodeDataUrl,
            pharmacyName,
            pharmacyEmail,
            latitude, // Save latitude
            longitude, // Save longitude
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        };

        // 🔹 **Save to Firestore**
        await db.collection('essential_storage').add(essentialData);

        // 🔹 **Notify the user**
        notyf.success('Medicine saved successfully!');

        clearessentialFormFields();

        // 🔹 **Reset the form**
        document.querySelector('.essential-form').reset();
        document.getElementById("essential-qr-code-img").src = "";
        document.getElementById("product-image-preview-container").innerHTML = "";
        productImageBase64 = "";

        const imagePreviewContainer = document.getElementById("image-preview-container");
        imagePreviewContainer.innerHTML = "";
        imagePreviewContainer.style.display = "none";

        const removeBtn = document.querySelector(".remove-btn");
        if (removeBtn) {
            removeBtn.style.display = "none";
        }

        // Optionally, reset focus to the first input field
    document.getElementById("product-name").focus();


    } catch (error) {
        console.error("Error adding document: ", error);
        notyf.error('An error occurred while saving the medicine.');
    }

    // 🔹 **Re-enable the button after processing**
    isSubmitting = false;
    saveButton.disabled = false;
}


document.body.addEventListener('click', function(event) {
    if (event.target.classList.contains('essential-save-btn')) {
        saveEssentialData(event);
    }
});


const essentialformFields = document.querySelectorAll('.essential-form input, .essential-form select, .essential-form textarea, .essential-form .custom-dropdown');
essentialformFields.forEach(field => {
    field.addEventListener('input', () => {
        // Hide all error messages when any field is modified
        const errorMessages = document.querySelectorAll('.error-input-message');
        errorMessages.forEach(errorMessage => {
            errorMessage.style.display = 'none'; // Hide all error messages
        });
    });
});


// Function to clear all fields
function clearessentialFormFields() {
    document.getElementById("product-name").value = "";
    document.getElementById("essential-brand-name").value = "";

    // Manually set default labels for dropdowns
    document.querySelector("#product-category .selected-option").textContent = "Choose Category";
    document.querySelector("#unit-of-measure .selected-option").textContent = "Choose Unit of Measure";
    
    // Reset the Contraindications dropdown selections
    const contraindicationCheckboxes = document.querySelectorAll("#essential-contraindications .dropdown-options input[type='checkbox']");
    contraindicationCheckboxes.forEach(checkbox => checkbox.checked = false);
    document.querySelector("#essential-contraindications .selected-option").textContent = "Choose Contraindications";

    // Other form fields to reset
    document.getElementById("size").value = "";
    document.getElementById("essential-description-usage").value = "";
    document.getElementById("storage-instructions").value = "";
    document.getElementById("essential-batch-number").value = "";
    document.getElementById("essential-expiration-date").value = "";
    document.getElementById("essential-supplier").value = "";
    document.getElementById("essential-stock-quantity").value = "";
    document.getElementById("essential-reorder-level").value = "";
    document.getElementById("essential-purchase-price").value = "";
    document.getElementById("essential-selling-price").value = "";
    document.getElementById("essential-discount-price").value = "";

    // Reset any custom dropdowns to the default option
    const dropdowns = document.querySelectorAll('.custom-dropdown');
    dropdowns.forEach(dropdown => {
        const id = dropdown.getAttribute('id');
        if (id === "product-category") {
            dropdown.querySelector('.selected-option').textContent = "Choose Category";
        } else if (id === "unit-of-measure") {
            dropdown.querySelector('.selected-option').textContent = "Choose Unit of Measure";
        } else if (id === "essential-contraindications") {
            dropdown.querySelector('.selected-option').textContent = "Choose Contraindications";
        }
    });

    // Clear any uploaded file (if needed)
    document.getElementById("product-image").value = "";

    // Reset the QR code image
    document.getElementById("essential-qr-code-img").src = "";
}

document.querySelector(".essential-clear-btn").addEventListener("click", function () {
    // Select all input fields and clear their values
    document.querySelectorAll(".essential-form input").forEach(input => {
        if (input.type === "checkbox" || input.type === "radio") {
            input.checked = false; // Uncheck checkboxes and radio buttons
        } else {
            input.value = ""; // Clear text, number, and date inputs
        }
    });

    // Select all textareas and clear them
    document.querySelectorAll(".essential-form textarea").forEach(textarea => {
        textarea.value = "";
    });

    // Reset dropdowns to default
    document.querySelectorAll(".custom-dropdown .selected-option").forEach(dropdown => {
        dropdown.textContent = dropdown.getAttribute("data-default") || "Choose an option";
    });

    // Clear error messages
    document.querySelectorAll(".error-input-message").forEach(error => {
        error.textContent = "";
    });

    // Clear image previews and QR code
    document.getElementById("product-image-preview-container").innerHTML = "";
    document.getElementById("essential-qr-code-img").src = "";

    // Optionally, reset focus to the first input field
    document.getElementById("product-name").focus();
});


// Add QR code generation functionality if necessary
function essential_generateQR() {
    let productName = document.getElementById("product-name").value;
    let essentialbrandName = document.getElementById("essential-brand-name").value;
    let productCategory = document.querySelector("#product-category .selected-option").textContent;
    let size = document.getElementById("size").value;
    let unitOfMeasure = document.querySelector("#unit-of-measure .selected-option").textContent;
    let essentialdescriptionUsage = document.getElementById("essential-description-usage").value;
    let storageInstructions = document.getElementById("storage-instructions").value;
    let essentialbatchNumber = document.getElementById("essential-batch-number").value;
    let essentialsupplier = document.getElementById("essential-supplier").value;
    let essentialexpirationDate = document.getElementById("essential-expiration-date").value;

    // Ensure all required fields are filled before generating QR code
    if (!productName || !essentialbrandName || !productCategory || !size || !unitOfMeasure || !essentialdescriptionUsage || !essentialbatchNumber || !essentialexpirationDate) {
        notyf.error("Please fill all required fields before generating the QR Code.");
        return;
    }

    // Create a structured QR data string
    let qrData = `
Medicine Information:
- Name of Product: ${productName}
- Name of Brand: ${essentialbrandName}
- Product Category: ${productCategory}
- Product Size: ${size}
- Unit of Measure: ${unitOfMeasure}
- Description/Usage: ${essentialdescriptionUsage}
- Storage Instructions: ${storageInstructions || 'N/A'}
- Batch Number: ${essentialbatchNumber}
- Supplier/Manufacturer: ${essentialsupplier || 'N/A'}
- Expiry Date: ${essentialexpirationDate}
`;

    let qrCode = new QRious({
        value: qrData,
        size: 140
    });

    // Get the data URL of the generated QR code
    let qrCodeImg = qrCode.toDataURL();

    // Set the image source to the QR code data URL
    document.getElementById("essential-qr-code-img").src = qrCodeImg;
}
