const sideLinks = document.querySelectorAll('.sidebar .side-menu li a:not(.logout)');

sideLinks.forEach(item => {
    const li = item.parentElement;
    item.addEventListener('click', () => {
        sideLinks.forEach(i => {
            i.parentElement.classList.remove('active');
        })
        li.classList.add('active');
    })
});

const menuBar = document.querySelector('.content nav .bx.bx-menu');
const sideBar = document.querySelector('.sidebar');

menuBar.addEventListener('click', () => {
    sideBar.classList.toggle('close');
});

const searchBtn = document.querySelector('.content nav form .form-input button');
const searchBtnIcon = document.querySelector('.content nav form .form-input button .bx');
const searchForm = document.querySelector('.content nav form');

searchBtn.addEventListener('click', function (e) {
    if (window.innerWidth < 576) {
        e.preventDefault;
        searchForm.classList.toggle('show');
        if (searchForm.classList.contains('show')) {
            searchBtnIcon.classList.replace('bx-search', 'bx-x');
        } else {
            searchBtnIcon.classList.replace('bx-x', 'bx-search');
        }
    }
});

window.addEventListener('resize', () => {
    if (window.innerWidth < 768) {
        sideBar.classList.add('close');
    } else {
        sideBar.classList.remove('close');
    }
    if (window.innerWidth > 576) {
        searchBtnIcon.classList.replace('bx-x', 'bx-search');
        searchForm.classList.remove('show');
    }
});

const toggler = document.getElementById('theme-toggle');

toggler.addEventListener('change', function () {
    if (this.checked) {
        document.body.classList.add('dark');
    } else {
        document.body.classList.remove('dark');
    }
});

// Function to format the date and time
function formatDate(date) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString(undefined, options);
}

function formatTime(date) {
    return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

// Function to update the date and time
function updateDateTime() {
    const now = new Date();
    document.getElementById('current-date').textContent = formatDate(now);
    document.getElementById('current-time').textContent = formatTime(now);
}

// Initialize and keep updating the time every second
updateDateTime();
setInterval(updateDateTime, 1000);

document.addEventListener("DOMContentLoaded", () => {
    const dashboardContent = document.querySelector(".dashboard_content");
    const manageMedicineContent = document.querySelector(".managemedicine_content");
    const sideMenuItems = document.querySelectorAll(".side-menu li a");

    sideMenuItems.forEach((menuItem) => {
        menuItem.addEventListener("click", (event) => {
            const isDashboard = menuItem.textContent.trim() === "Overview";
            const isManageMedicine = menuItem.textContent.trim() === "Manage Medicine";

            // Toggle visibility of content based on menu item
            if (isDashboard) {
                dashboardContent.style.display = "block";
                manageMedicineContent.style.display = "none";
            } else if (isManageMedicine) {
                manageMedicineContent.style.display = "block";
                dashboardContent.style.display = "none";
            } else {
                dashboardContent.style.display = "none";
                manageMedicineContent.style.display = "none";
            }

            // Highlight the active menu item
            sideMenuItems.forEach((item) => item.parentElement.classList.remove("active"));
            menuItem.parentElement.classList.add("active");
        });
    });

    // Default: show dashboard content
    dashboardContent.style.display = "block";
    manageMedicineContent.style.display = "none"; // Hide Manage Medicine initially
});

function setMinDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0'); // Get month, ensuring two digits
    const day = String(today.getDate()).padStart(2, '0'); // Get day, ensuring two digits
    const todayString = `${year}-${month}-${day}`; // Format as yyyy-mm-dd

    // Set the min attribute of the expiry-date input to today's date
    document.getElementById('expiry-date').setAttribute('min', todayString);
}

// Call the function to set the min date when the page loads
window.onload = setMinDate;

document.getElementById('add_medicine-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    // Collect form data
    const drugName = document.getElementById('product-name').value;
    const manufacturer = document.getElementById('manufacturer').value;
    const category = document.getElementById('category').value;
    const price = parseFloat(document.getElementById('price').value);
    const quantity = parseInt(document.getElementById('quantity').value);
    const expiryDate = document.getElementById('expiry-date').value;
    const description = document.getElementById('description').value;
    const pictureFile = document.getElementById('medicine-picture').files[0];

    const overallPrice = price * quantity;

    try {
        // Upload picture to Firebase Storage
        let pictureURL = "";
        if (pictureFile) {
            const sanitizedFileName = pictureFile.name.replace(/[^a-zA-Z0-9.\-_]/g, "_"); // Replace unsupported characters
            const storageRef = storage.ref(`medicine_picture/${sanitizedFileName}`); // Create storage reference
            const snapshot = await storageRef.put(pictureFile); // Upload the file
            pictureURL = await snapshot.ref.getDownloadURL(); // Get the file's URL
        }

        // Save data to Firestore
        await db.collection("add_medicine").add({
            drug_name: drugName,
            manufacturer: manufacturer,
            category: category,
            price: price,
            quantity: quantity,
            expiry_date: expiryDate,
            med_picture: pictureURL,
            description: description,
            overall_price: overallPrice
        });

        alert("Medicine information successfully saved!");
        document.getElementById('add_medicine-form').reset();
    } catch (error) {
        console.error("Error adding document: ", error);
        alert("Failed to save medicine information.");
    }
});

document.addEventListener("click", (event) => {
    if (event.target && event.target.classList.contains("edit-btn")) {

        document.querySelector(".med-view").style.display = "none";
        document.querySelector(".med-edit").style.display = "block";

        const drugName = event.target.closest('.med-details').querySelector('h3').textContent;

        // Fetch the corresponding data for the selected medicine
        db.collection("add_medicine").where("drug_name", "==", drugName).get()
            .then(querySnapshot => {
                if (!querySnapshot.empty) {
                    const doc = querySnapshot.docs[0];
                    const medicine = doc.data();
                    const docId = doc.id; // Document ID for updating

                    // Fill the edit form with the fetched data
                    document.getElementById("edit-product-name").value = medicine.drug_name;
                    document.getElementById("edit-manufacturer").value = medicine.manufacturer;
                    document.getElementById("edit-category").value = medicine.category;
                    document.getElementById("edit-price").value = medicine.price;
                    document.getElementById("edit-quantity").value = medicine.quantity;
                    document.getElementById("edit-expiry-date").value = medicine.expiry_date;
                    document.getElementById("edit-description").value = medicine.description;
                    // Handle the image field if needed
                    // document.getElementById("medicine-picture").value = medicine.med_picture;

                    // Set up the form submission for updating the data
                    document.getElementById("edit_medicine-form").onsubmit = function(event) {
                        event.preventDefault();
                        
                        const updatedMedicine = {
                            drug_name: document.getElementById("edit-product-name").value,
                            manufacturer: document.getElementById("edit-manufacturer").value,
                            category: document.getElementById("edit-category").value,
                            price: parseFloat(document.getElementById("edit-price").value),
                            quantity: parseInt(document.getElementById("edit-quantity").value),
                            expiry_date: document.getElementById("edit-expiry-date").value,
                            description: document.getElementById("edit-description").value,
                            // Add more fields if necessary
                        };

                        // Update the document in Firestore
                        db.collection("add_medicine").doc(docId).update(updatedMedicine)
                            .then(() => {
                                alert("Medicine data updated successfully!");
                                // Hide med-edit and show med-info or med-view again
                                document.querySelector(".med-edit").style.display = "none";
                                document.querySelector(".med-info").style.display = "block";
                                fetchMedicineData(); // Refresh the data table
                            })
                            .catch((error) => {
                                console.error("Error updating document: ", error);
                                alert("An error occurred while updating the medicine.");
                            });
                    };
                }
            })
            .catch(error => {
                console.error("Error fetching medicine data: ", error);
            });
    }
});


// Function to fetch and display medicine data in real-time
function fetchMedicineData() {
    const tableBody = document.getElementById("medicine-table-body");

    db.collection("add_medicine").onSnapshot((querySnapshot) => {
        tableBody.innerHTML = ""; // Clear the table

        querySnapshot.forEach((doc) => {
            const medicine = doc.data();
            const docId = doc.id; // Document ID

            // Create a new row
            const row = document.createElement("tr");

            // Product name with image
            const productCell = document.createElement("td");
            const productContainer = document.createElement("div");
            productContainer.style.display = "flex";
            productContainer.style.alignItems = "center";
            productContainer.style.gap = "10px";

            const productImage = document.createElement("img");
            productImage.src = medicine.med_picture || "default-image.png";
            productImage.alt = medicine.drug_name || "Unknown";
            productImage.style.width = "40px";
            productImage.style.height = "40px";

            const productName = document.createElement("p");
            productName.textContent = medicine.drug_name || "Unnamed Product";

            productContainer.appendChild(productImage);
            productContainer.appendChild(productName);
            productCell.appendChild(productContainer);

            // Category
            const categoryCell = document.createElement("td");
            categoryCell.textContent = medicine.category || "Unknown";

            // Price
            const priceCell = document.createElement("td");
            priceCell.textContent = medicine.price
                ? `₱${parseFloat(medicine.price).toFixed(2)}`
                : "Price not available";

            // Add the kebab menu
            const kebabCell = document.createElement("td");
            const kebabMenu = document.createElement("div");
            kebabMenu.className = "kebab-menu";

            const kebabButton = document.createElement("button");
            kebabButton.textContent = "⋮"; // Kebab menu icon
            kebabButton.className = "kebab-btn";
            kebabMenu.appendChild(kebabButton);

            // Dropdown content for the kebab menu
            const dropdown = document.createElement("div");
            dropdown.className = "dropdown-content";
            dropdown.style.display = "none";

            // View All functionality
            const editOption = document.createElement("a");
            editOption.href = "#";
            editOption.textContent = "View All";
            editOption.onclick = () => {
                // Show med-view and hide med-info
                document.querySelector(".med-info").style.display = "none";
                document.querySelector(".med-view").style.display = "block";

                // Populate med-view with selected row details
                const medViewHeader = document.querySelector(".med-view .header h1");
                const medViewDetails = document.querySelector(".med-view .bottom-data .orders");

                medViewHeader.textContent = `View Data on ${medicine.drug_name}`;
                medViewDetails.innerHTML = `
                    <div class="med-details">
                    <div class="med-container">
                        <img src="${medicine.med_picture || 'default-image.png'}" alt="${medicine.drug_name || 'Unknown'}" style="width: 100px; height: 100px;  border-radius: 50%; margin-bottom: 10px;">
                        <h3>${medicine.drug_name || 'Unnamed Product'}</h3>
                        </div>
                        <div class="form-row">
                        <p><strong>Category:</strong> ${medicine.category || 'Unknown'}</p>
                        <p><strong>Price:</strong> ₱${medicine.price ? parseFloat(medicine.price).toFixed(2) : 'Price not available'}</p>
                        <p><strong>Brand:</strong> ${medicine.manufacturer || 'Not specified'}</p>
                        </div>
                        <div class="form-row">
                        <p><strong>Indication:</strong> ${medicine.description || 'No description available'}</p>
                        <p><strong>Quantity:</strong> ${medicine.quantity || 'Not specified'}</p>
                        <p><strong>Expiry Date:</strong> ${medicine.expiry_date || 'Not specified'}</p>
                        </div>
                    </div>
                    <div class="button-container">
                    <div class="button-group">
                        <button class="edit-btn">Edit</button>
                        <button class="close-btn">Close</button>
                    </div>
                    </div>
                `;
            };

            // Delete functionality
            const deleteOption = document.createElement("a");
            deleteOption.href = "#";
            deleteOption.textContent = "Delete";
            deleteOption.onclick = async () => {
                const confirmation = confirm(
                    `Are you sure you want to delete ${medicine.drug_name}?`
                );
                if (confirmation) {
                    try {
                        // Delete the document from Firestore
                        await db.collection("add_medicine").doc(docId).delete();
                        alert(`${medicine.drug_name} has been deleted.`);
                    } catch (error) {
                        console.error("Error deleting document: ", error);
                        alert("An error occurred while deleting the item.");
                    }
                }
            };

            dropdown.appendChild(editOption);
            dropdown.appendChild(deleteOption);

            kebabMenu.appendChild(dropdown);

            // Toggle dropdown on click
            kebabButton.onclick = (e) => {
                e.stopPropagation(); // Prevent click from bubbling
                dropdown.style.display = dropdown.style.display === "block" ? "none" : "block";
            };

            // Close dropdown when clicking outside
            document.addEventListener("click", () => {
                dropdown.style.display = "none";
            });

            kebabCell.appendChild(kebabMenu);

            // Append cells to the row
            row.appendChild(productCell);
            row.appendChild(categoryCell);
            row.appendChild(priceCell);
            row.appendChild(kebabCell);

            // Append row to the table
            tableBody.appendChild(row);
        });
    });
}


// Add event listener for the Close button
document.addEventListener("click", (event) => {
    if (event.target && event.target.classList.contains("close-btn")) {
        // Hide the med-view section
        document.querySelector(".med-view").style.display = "none";

        // Show the med-info section
        document.querySelector(".med-info").style.display = "block";
    }
});


document.querySelector(".med-info").style.display = "block";
document.querySelector(".med-view").style.display = "none";


// Function to update the inventory status in real-time
function updateInventoryStatus() {
    db.collection("add_medicine").onSnapshot((querySnapshot) => {
        let totalOverallPrice = 0;

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            if (data.overall_price) {
                totalOverallPrice += data.overall_price;
            }
        });

        // Update the inventory status with the total overall price
        document.querySelector(".info h3").textContent = totalOverallPrice.toLocaleString();
    });
}

// Initialize real-time updates for medicine data and inventory status
fetchMedicineData();
updateInventoryStatus();

// Function to save memo data to localStorage
function saveMemosToLocalStorage(memos) {
    localStorage.setItem('memos', JSON.stringify(memos));
}

// Function to get memo data from localStorage
function getMemosFromLocalStorage() {
    const savedMemos = localStorage.getItem('memos');
    return savedMemos ? JSON.parse(savedMemos) : [];
}

// Function to render all memos from localStorage
function renderMemos() {
    const memoList = document.getElementById('memo-list');
    memoList.innerHTML = ''; // Clear existing content
    const memos = getMemosFromLocalStorage();

    memos.forEach((memoText, index) => {
        const memoItem = document.createElement('li');

        // Memo text
        const memoTextElement = document.createElement('span');
        memoTextElement.className = 'memo-text';
        memoTextElement.textContent = memoText;

        // Delete button
        const deleteButton = document.createElement('i');
        deleteButton.className = 'bx bx-trash delete-memo';
        deleteButton.addEventListener('click', function () {
            removeMemo(index);
        });

        // Append elements
        memoItem.appendChild(memoTextElement);
        memoItem.appendChild(deleteButton);
        memoList.appendChild(memoItem);
    });
}

// Function to add a new memo
function addMemo(memoText) {
    const memos = getMemosFromLocalStorage();
    memos.push(memoText);
    saveMemosToLocalStorage(memos);
    renderMemos();
}

// Function to remove a memo by index
function removeMemo(index) {
    const memos = getMemosFromLocalStorage();
    memos.splice(index, 1); // Remove the memo at the given index
    saveMemosToLocalStorage(memos);
    renderMemos();
}

// Event listener for adding a memo
document.getElementById('add-memo-button').addEventListener('click', function () {
    const memoInput = document.getElementById('memo-input');
    const memoText = memoInput.value.trim();

    if (memoText === '') {
        alert('Please enter a memorandum!');
        return;
    }

    addMemo(memoText); // Add the memo
    memoInput.value = ''; // Clear the input field
});

// Render memos on page load
document.addEventListener('DOMContentLoaded', renderMemos);



