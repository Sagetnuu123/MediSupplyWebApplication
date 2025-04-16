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


document.addEventListener("DOMContentLoaded", function () {
    const toggler = document.getElementById("theme-toggle");

    // Check if the user has a stored theme preference
    const savedTheme = localStorage.getItem("theme") || "light"; // Default to light mode
    if (savedTheme === "dark") {
        document.body.classList.add("dark");
        toggler.checked = true;
    } else {
        document.body.classList.remove("dark");
        toggler.checked = false;
    }

    // Event listener to toggle theme and store preference
    toggler.addEventListener("change", function () {
        if (this.checked) {
            document.body.classList.add("dark");
            localStorage.setItem("theme", "dark");
        } else {
            document.body.classList.remove("dark");
            localStorage.setItem("theme", "light");
        }
    });
});


document.getElementById("profile").addEventListener("click", function(event) {
    event.stopPropagation();
    this.classList.add("clicked");

    // Remove the effect after animation completes
    setTimeout(() => {
        this.classList.remove("clicked");
    }, 400);

    document.getElementById("dropdown-menu").classList.toggle("active");
});

document.addEventListener("click", function(event) {
    if (!event.target.closest(".profile")) {
        document.getElementById("dropdown-menu").classList.remove("active");
    }
});


document.addEventListener("DOMContentLoaded", function() {
    // Get references to the modal and buttons
    const accountSettingsButton = document.getElementById("accountSettingsButton");
    const accountSettingsModal = document.getElementById("accountSettingsModal");
    const closeAccountModal = document.getElementById("closeAccountModal");
    const dropdownMenu = document.getElementById("dropdown-menu");

    // Function to open the modal
    function openModal() {
        accountSettingsModal.classList.add("show");
        // Hide the dropdown menu when opening the modal
        dropdownMenu.classList.remove("active");
    }

    // Function to close the modal
    function closeModal() {
        accountSettingsModal.classList.remove("show");
    }

    // Event listener for opening the modal
    accountSettingsButton.addEventListener("click", function(event) {
        event.stopPropagation();
        openModal();
    });

    // Event listener for closing the modal
    closeAccountModal.addEventListener("click", function(event) {
        event.stopPropagation();
        closeModal();
    });

    // Close the modal when clicking outside of it
    window.addEventListener("click", function(event) {
        if (event.target === accountSettingsModal) {
            closeModal();
        }
    });
});



function initializeAccountSettingsTabs() {
    const accountModal = document.querySelector('.account-modal');
    if (!accountModal) return;

    const tabs = accountModal.querySelectorAll('.modal-tabs .tab');
    const tabContents = accountModal.querySelectorAll('.modal-body .tab-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', function () {
            // Remove 'active' class from all tabs
            tabs.forEach(t => t.classList.remove('active'));
            // Add 'active' class to the clicked tab
            this.classList.add('active');

            const target = this.getAttribute('data-tab-target');

            // Hide all tab contents
            tabContents.forEach(content => {
                content.classList.remove('active');
            });

            // Show the targeted tab content
            const activeContent = accountModal.querySelector(`#${target}`);
            if (activeContent) {
                activeContent.classList.add('active');
            }
        });
    });
}

// Initialize the Account Settings tabs when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', initializeAccountSettingsTabs);

// Function to set up a real-time listener for user data
function setupUserDataListener() {
    const userEmail = localStorage.getItem("userEmail");
    if (!userEmail) {
        console.error("User email not found in localStorage.");
        return;
    }

    db.collection("admin_login")
        .where("useremail", "==", userEmail)
        .onSnapshot((snapshot) => {
            if (!snapshot.empty) {
                const userData = snapshot.docs[0].data();
                updateProfileFields(userData);
            } else {
                console.error("No user data found for the provided email.");
            }
        }, (error) => {
            console.error("Error listening to user data:", error);
        });
}

// Function to update profile fields with new data
function updateProfileFields(userData) {
    document.getElementById("firstName").value = userData.firstname || '';
    document.getElementById("lastName").value = userData.lastname || '';
    document.getElementById("useremail").value = userData.email || '';
    document.getElementById("current-password").value = userData.password || '';

    // Update localStorage with the new data
    localStorage.setItem("userFirstName", userData.firstname);
    localStorage.setItem("userLastName", userData.lastname);
    localStorage.setItem("userEmail", userData.email);
    localStorage.setItem("userPassword", userData.password);
}

// Call the function when the DOM is fully loaded
document.addEventListener("DOMContentLoaded", () => {
    populateProfileFields(); // Populate fields initially
    setupUserDataListener(); // Set up real-time listener
});


// Function to get user data from localStorage
function getUserData() {
    return {
        firstName: localStorage.getItem("userFirstName") || '',
        lastName: localStorage.getItem("userLastName") || '',
        email: localStorage.getItem("userEmail") || '',
        password: localStorage.getItem("userPassword") || ''
    };
}

// Function to populate profile fields
function populateProfileFields() {
    const userData = getUserData();

    document.getElementById("firstName").value = userData.firstName;
    document.getElementById("lastName").value = userData.lastName;
    document.getElementById("useremail").value = userData.email;
    document.getElementById("current-password").value = userData.password;
}

// Call the function when the DOM is fully loaded
document.addEventListener("DOMContentLoaded", populateProfileFields);


// Initialize Notyf
const notyf = new Notyf({
    duration: 4000, // Duration in milliseconds
    position: {
        x: 'center', // Position on the right
        y: 'top', // Position at the top
    },
    ripple: true, // Enable ripple effect
    dismissible: true // Allow dismissing notifications
});

document.querySelector(".save-edit-btn").addEventListener("click", async function() {
    // Get user input
    const updatedFirstName = document.getElementById("firstName").value.trim();
    const updatedLastName = document.getElementById("lastName").value.trim();
    const updatedEmail = document.getElementById("useremail").value.trim();
    const currentPassword = document.getElementById("current-password").value.trim();
    const newPassword = document.getElementById("new-password").value.trim();
    const confirmNewPassword = document.getElementById("confirm-new-password").value.trim();

    let isValid = true;

    // Helper function to set error messages
    function setError(fieldId, message) {
        const errorSpan = document.getElementById(`${fieldId}-error`);
        if (message) {
            errorSpan.textContent = message;
            errorSpan.style.display = "block";
            isValid = false;
        } else {
            errorSpan.textContent = "";
            errorSpan.style.display = "none";
        }
    }

    // Validate fields
    setError("firstName", updatedFirstName === "" ? "First Name is required." : "");
    setError("lastName", updatedLastName === "" ? "Last Name is required." : "");
    setError("useremail", updatedEmail === "" ? "Email Address is required." : "");
    setError("current-password", currentPassword === "" ? "Current Password is required." : "");

    // Validate New Password and Confirm New Password fields
    if (!newPassword) {
        setError("new-password", "New Password is required.");
    } else {
        setError("new-password", "");
    }

    if (!confirmNewPassword) {
        setError("confirm-new-password", "Confirm New Password is required.");
    } else {
        setError("confirm-new-password", "");
    }

    // Check if new passwords match
    if (newPassword && confirmNewPassword && newPassword !== confirmNewPassword) {
        setError("new-password", "New passwords do not match.");
        setError("confirm-new-password", "New passwords do not match.");
    } else if (newPassword && confirmNewPassword) {
        setError("new-password", "");
        setError("confirm-new-password", "");
    }

    // Check if new password meets length requirement
    if (newPassword && newPassword.length < 6) {
        setError("new-password", "New password must be at least 6 characters long.");
    }

    // Check if new password is the same as the current password
    if (newPassword && currentPassword && newPassword === currentPassword) {
        setError("new-password", "New password cannot be the same as the current password.");
    }

    // If any validation failed, prevent form submission
    if (!isValid) {
        return;
    }

    // Show spinner and disable the button
    const spinner = document.querySelector(".spinner");
    const btnText = document.querySelector(".btn-text");
    const saveBtn = document.querySelector(".save-edit-btn");

    spinner.style.display = "inline-block";
    btnText.textContent = "Saving Changes...";
    saveBtn.disabled = true;

    // Retrieve original email from localStorage
    const originalEmail = localStorage.getItem("userEmail");

    // Authenticate user with original credentials
    try {
        const snapshot = await db.collection("admin_login")
            .where("useremail", "==", originalEmail)
            .where("password", "==", currentPassword)
            .get();

        if (!snapshot.empty) {
            // Get the document ID
            const docId = snapshot.docs[0].id;

            // Prepare updated data
            const updatedData = {
                firstname: updatedFirstName,
                lastname: updatedLastName,
                email: updatedEmail
            };

            // Include password update if provided
            if (newPassword) {
                updatedData.password = newPassword;
            }

            // Update Firestore document
            await db.collection("admin_login").doc(docId).update(updatedData);

            // Update localStorage with the new data
            localStorage.setItem("userFirstName", updatedFirstName);
            localStorage.setItem("userLastName", updatedLastName);
            localStorage.setItem("userEmail", updatedEmail);
            if (newPassword) {
                localStorage.setItem("userPassword", newPassword);
            }

            // Show success notification
            notyf.success("Profile updated successfully.");

            // Clear the new password fields
            document.getElementById("new-password").value = "";
            document.getElementById("confirm-new-password").value = "";
        } else {
            // Show error if current password is incorrect
            setError("current-password", "Current password is incorrect.");
        }
    } catch (error) {
        console.error("Error updating profile:", error);
        // Show error if something went wrong with Firestore
        notyf.error("An error occurred. Please try again later.");
    } finally {
        // Reset button state and hide the spinner
        spinner.style.display = "none";
        btnText.textContent = "Save Changes";
        saveBtn.disabled = false;
    }
});



// Function to clear error message
function clearError(fieldId) {
    const errorSpan = document.getElementById(`${fieldId}-error`);
    if (errorSpan) {
        errorSpan.textContent = "";
        errorSpan.style.display = "none";
    }
}

// Function to add input event listeners to clear validation errors
function addInputEventListeners() {
    const fields = ["firstName", "lastName", "useremail", "current-password", "new-password", "confirm-new-password"];
    fields.forEach(fieldId => {
        const inputField = document.getElementById(fieldId);
        if (inputField) {
            inputField.addEventListener("input", () => clearError(fieldId));
        }
    });
}

// Call the function to add event listeners
addInputEventListeners();





document.addEventListener("DOMContentLoaded", function() {
    const userEmail = localStorage.getItem("userEmail");

    // If no email in localStorage, redirect to login page
    if (!userEmail) {
        window.location.href = "login.html"; // or any other URL to handle unauthenticated users
        return;
    }

    // Get user details from localStorage
    const fullName = localStorage.getItem("userFullName") || "Administrator";
    const initials = localStorage.getItem("userInitials") || "A";

    // Display full name in the profile name section
    document.getElementById("profile-name").textContent = fullName;

    // Display initials in the profile image placeholder
    document.getElementById("profile-initials").textContent = initials;

    // Display initials in the dropdown profile section
    document.getElementById("profile-initials-dropdown").textContent = initials;

    // Firebase Firestore real-time listener for user profile changes
    db.collection("admin_login")
        .where("useremail", "==", userEmail)
        .onSnapshot(snapshot => {
            if (!snapshot.empty) {
                const userData = snapshot.docs[0].data();
                const updatedFirstName = userData.firstname;
                const updatedLastName = userData.lastname;
                const updatedFullName = `${updatedFirstName} ${updatedLastName}`;
                const updatedInitials = `${updatedFirstName.charAt(0)}${updatedLastName.charAt(0)}`;

                // Update localStorage with the latest user data
                localStorage.setItem("userFullName", updatedFullName);
                localStorage.setItem("userInitials", updatedInitials);

                // Update the UI with the new details
                document.getElementById("profile-name").textContent = updatedFullName;
                document.getElementById("profile-initials").textContent = updatedInitials;
                document.getElementById("profile-initials-dropdown").textContent = updatedInitials;
            }
        });
});


document.querySelector(".logout").addEventListener("click", function() {
    // Show SweetAlert2 confirmation dialog
    Swal.fire({
        title: "Are you sure you want to log out?",
        text: "You will need to log in again to access your profile.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, log out",
        cancelButtonText: "Cancel",
        reverseButtons: true // this ensures the cancel button is on the left
    }).then((result) => {
        if (result.isConfirmed) {
            // Clear user data from localStorage
            localStorage.removeItem("userFullName");
            localStorage.removeItem("userInitials");
            localStorage.removeItem("userFirstName");
            localStorage.removeItem("userLastName");
            localStorage.removeItem("userEmail");
            localStorage.removeItem("userPassword");

            // Redirect to login page
            window.location.href = "login.html";
        } else if (result.isDismissed) {
            // If the user cancels the logout, show a simple info message
            Swal.fire({
                title: "Logout Cancelled",
                text: "You are still logged in.",
                icon: "info",
                timer: 1500
            });
        }
    });
});




document.addEventListener("DOMContentLoaded", () => {
    const modal = document.getElementById("addPharmacyModal");
    const openModal = document.getElementById("openModal");
    const closeModal = document.getElementById("closeModal");

    openModal.addEventListener("click", (event) => {
        event.preventDefault();

        // Ensure modal resets and displays properly
        modal.classList.add("show");
        modal.style.display = "flex"; // Ensure it's visible
        setTimeout(() => {
            modal.style.opacity = "1";
            modal.style.visibility = "visible";
        }, 10);
    });

    closeModal.addEventListener("click", () => {
        // Properly hide modal and reset visibility
        modal.style.opacity = "0";
        modal.style.visibility = "hidden";

        setTimeout(() => {
            modal.classList.remove("show");
            modal.style.display = "none"; // Hide after animation
        }, 300); // Delay matches transition time
    });

    window.addEventListener("click", (event) => {
        if (event.target === modal) {
            modal.style.opacity = "0";
            modal.style.visibility = "hidden";

            setTimeout(() => {
                modal.classList.remove("show");
                modal.style.display = "none";
            }, 300);
        }
    });
});


    
document.addEventListener("DOMContentLoaded", () => {
    const dashboardContent = document.querySelector(".dashboard_content");
    const manageMedicineContent = document.querySelector(".managemedicine_content");
    const manageUserContent = document.querySelector(".manageuser_content");
    const manageArchiveContent = document.querySelector(".managearchive_content");
    const notificationContent = document.querySelector(".notification_content");
    const sideMenuItems = document.querySelectorAll(".side-menu li button");
    const notifButton = document.querySelector(".notif");
    
    function showContent(contentName) {
        dashboardContent.style.display = contentName === "Dashboard" ? "block" : "none";
        manageMedicineContent.style.display = contentName === "Pharmacy" ? "block" : "none";
        manageUserContent.style.display = contentName === "Users" ? "block" : "none";
        manageArchiveContent.style.display = contentName === "Archive" ? "block" : "none";
        notificationContent.style.display = contentName === "Notification" ? "block" : "none";
    }

    function setActiveMenu(menuText) {
        sideMenuItems.forEach((item) => {
            item.parentElement.classList.remove("active");
            if (item.textContent.trim() === menuText) {
                item.parentElement.classList.add("active");
            }
        });
    }

    sideMenuItems.forEach((menuItem) => {
        menuItem.addEventListener("click", () => {
            const text = menuItem.textContent.trim();
            showContent(text);
            setActiveMenu(text);
        });
    });
    
    notifButton.addEventListener("click", () => {
        showContent("Notification");
        setActiveMenu("Notification");
    });

    // Default: show dashboard content
    showContent("Dashboard");
    setActiveMenu("Dashboard");
});



function setMinDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0'); // Get month, ensuring two digits
    const day = String(today.getDate()).padStart(2, '0'); // Get day, ensuring two digits
    const todayString = `${year}-${month}-${day}`; // Format as yyyy-mm-dd

    // Set the min attribute of the expiry-date input to today's date
    document.getElementById('license-expiry').setAttribute('min', todayString);
    document.getElementById('date-of-registration').setAttribute('min', todayString);
}

// Call the function to set the min date when the page loads
window.onload = setMinDate;

// Get today's date in YYYY-MM-DD format
let today = new Date().toISOString().split('T')[0];

// Set min attribute to prevent selecting past dates
document.getElementById("license-expiry").setAttribute("min", today);
document.getElementById("date-of-registration").setAttribute("min", today);

// Set min attribute to prevent selecting past dates
document.getElementById("edit-license-expiry").setAttribute("min", today);
document.getElementById("edit-date-of-registration").setAttribute("min", today);


// Reference to Firestore collections
const usersRef = db.collection("sign_up_user");

// Function to listen for real-time updates
function listenForUserCount() {
    usersRef.onSnapshot((snapshot) => {
        const userCount = snapshot.size; // Get the number of documents in the collection
        
        // Update the h3 tag with the user count
        document.getElementById("user-count").textContent = userCount;
    }, (error) => {
        console.error("Error fetching real-time user count:", error);
    });
}

// Function to listen for real-time updates in Firestore
function listenForPharmacyUpdates() {
    db.collection("register_pharmacy").onSnapshot((snapshot) => {
        let registeredCount = 0;
        let pendingCount = 0;
        let inactiveCount = 0;

        snapshot.forEach((doc) => {
            const pharmacyData = doc.data();
            const status = pharmacyData.status; // Ensure Firestore has a "status" field

            if (status === "Registered") {
                registeredCount++;
            } else if (status === "Pending") {
                pendingCount++;
            } else if (status === "Inactive") {
                inactiveCount++;
            }
        });

        // Update the dashboard counts dynamically
        document.getElementById("registered-pharmacy-count").textContent = registeredCount;
        document.getElementById("pending-pharmacy-count").textContent = pendingCount;
        document.getElementById("inactive-pharmacy-count").textContent = inactiveCount;
    }, (error) => {
        console.error("Error listening for pharmacy updates:", error);
    });
}

// Call the function to listen for real-time updates
listenForPharmacyUpdates();
// Call both functions when the page loads
listenForUserCount();



document.addEventListener("DOMContentLoaded", function () {
    const searchInput = document.getElementById("search-input");
    const clearIcon = document.getElementById("clear-search");
    const sortBy = document.getElementById("sortBy");

    let activeTab = "registered"; // Default active tab

    // Event Listener for Search Input
    searchInput.addEventListener("input", function () {
        const query = searchInput.value.trim().toLowerCase();
        filterTable(query);
        clearIcon.style.display = query ? "inline" : "none"; // Show clear icon if input is not empty
    });

    // Function to Filter Table Based on Search Input and Active Tab
    function filterTable(query) {
        let filteredData = pharmacyData.filter((data) => {
            return (
                data.pharmacy_name.toLowerCase().includes(query) ||
                data.email.toLowerCase().includes(query) ||
                `${data.street}, ${data.barangay}, ${data.municipality}, ${data.province}`.toLowerCase().includes(query)
            );
        });

        // Filter data according to active tab
        filteredData = filteredData.filter(data => data.status.toLowerCase() === activeTab);

        updateTable(filteredData);
    }

    // Event Listener for Sorting
    sortBy.addEventListener("change", function () {
        const sortOrder = sortBy.value;
        sortTable(sortOrder);
    });

    // Function to Sort Table by Registration Date
    function sortTable(order) {
        let sortedData = pharmacyData.filter(data => data.status.toLowerCase() === activeTab);

        sortedData.sort((a, b) => {
            const dateA = new Date(a.date_registration);
            const dateB = new Date(b.date_registration);

            return order === "asc" ? dateA - dateB : dateB - dateA;
        });

        updateTable(sortedData);
    }

    // Function to Update Table Data Based on Active Tab
    function updateTable(data) {
        const registerTableBody = document.getElementById("registertableBody");
        const pendingTableBody = document.getElementById("pendingtableBody");
        const inactiveTableBody = document.getElementById("inactivetableBody");

        // Clear all tables
        registerTableBody.innerHTML = "";
        pendingTableBody.innerHTML = "";
        inactiveTableBody.innerHTML = "";

        if (data.length === 0) {
            const emptyRow = `<tr class="no-data-row"><td colspan="7">No data found</td></tr>`;
            if (activeTab === "registered") registerTableBody.innerHTML = emptyRow;
            else if (activeTab === "pending") pendingTableBody.innerHTML = emptyRow;
            else if (activeTab === "inactive") inactiveTableBody.innerHTML = emptyRow;
            return;
        }

        data.forEach((pharmacy) => {
            const docId = pharmacy.id;
            const medPicture = pharmacy.med_picture || "default-image.png";
            const pharmacyName = pharmacy.pharmacy_name || "N/A";
            const pharmacyEmail = pharmacy.email || "N/A";
            const businessAddress = `${pharmacy.street}, ${pharmacy.barangay}, ${pharmacy.municipality}, ${pharmacy.province}` || "N/A";
            const dateOfRegistration = pharmacy.date_registration || "N/A";

            // Format Opening Schedule
            const daysOpen = pharmacy.days_open_from && pharmacy.days_open_to ? `${pharmacy.days_open_from}-${pharmacy.days_open_to}` : "N/A";
            const openingHours = pharmacy.start && pharmacy.close ? `${pharmacy.start}-${pharmacy.close}` : "N/A";
            const openingSchedule = (daysOpen !== "N/A" && openingHours !== "N/A") ? `${daysOpen}, ${openingHours}` : "N/A";

            const status = pharmacy.status || "N/A";
            let statusClass = "pending";
            if (status.toLowerCase() === "registered") statusClass = "completed";
            else if (status.toLowerCase() === "inactive") statusClass = "inactive";

            const row = `
                <tr>
                    <td>
                        <img src="${medPicture}" alt="Pharmacy Image" width="50" height="50">
                        <span>${pharmacyName}</span>
                    </td>
                    <td>${pharmacyEmail}</td>
                    <td>${businessAddress}</td>
                    <td>${dateOfRegistration}</td>
                    <td>${openingSchedule}</td>
                    <td><span class="status ${statusClass}">${status}</span></td>
                    <td>
                        <div class="action-buttons">
                            <button class="edit-btn" onclick="editRecord('${docId}')">
                                <i class="fas fa-pen"></i>
                            </button>
                            <button class="delete-btn" onclick="deleteRecord('${docId}')">
                                <i class="fas fa-trash-alt"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;

            // Append row to the correct table
            if (activeTab === "registered") registerTableBody.innerHTML += row;
            else if (activeTab === "pending") pendingTableBody.innerHTML += row;
            else if (activeTab === "inactive") inactiveTableBody.innerHTML += row;
        });
    }

    // Function to Handle Tab Switching
    document.querySelectorAll(".pharmacy-nav .tab").forEach(tab => {
        tab.addEventListener("click", function () {
            document.querySelectorAll(".pharmacy-nav .tab").forEach(t => t.classList.remove("active"));
            this.classList.add("active");

            activeTab = this.getAttribute("data-tab"); // Update active tab

            // Hide all tables
            document.getElementById("registerPharmacyTable").style.display = "none";
            document.getElementById("pendingPharmacyTable").style.display = "none";
            document.getElementById("inactivePharmacyTable").style.display = "none";

            // Show the selected table
            document.getElementById(`${activeTab}PharmacyTable`).style.display = "table";

            updateTable(pharmacyData.filter(data => data.status.toLowerCase() === activeTab));
        });
    });

    // Clear search input when clicking the clear (X) icon
    clearIcon.addEventListener("click", function () {
        searchInput.value = "";
        clearIcon.style.display = "none";
        filterTable(""); // Reset table
        searchInput.focus();
    });

    // Initialize table with default registered data
    updateTable(pharmacyData.filter(data => data.status.toLowerCase() === activeTab));
});



// Toggle Password Visibility Function
function togglePassword(fieldId, eyeIcon) {
    var passwordField = document.getElementById(fieldId);
    if (passwordField.type === "password") {
        passwordField.type = "text";
        eyeIcon.classList.remove("fa-eye-slash");
        eyeIcon.classList.add("fa-eye");
    } else {
        passwordField.type = "password";
        eyeIcon.classList.remove("fa-eye");
        eyeIcon.classList.add("fa-eye-slash");
    }
}

// Validation for Add Pharmacy Password
function validatePassword() {
    var password = document.getElementById("password").value;
    var confirmPassword = document.getElementById("confirm-password").value;
    var errorMessage = document.getElementById("password-error");

    if (confirmPassword.length > 0) { 
        if (password !== confirmPassword) {
            errorMessage.textContent = "Passwords do not match!";
            errorMessage.style.display = "block";
            return false; // Return false if passwords don't match
        } else {
            errorMessage.textContent = "";
            errorMessage.style.display = "none";
            return true; // Return true if passwords match
        }
    } else {
        errorMessage.textContent = "";
        errorMessage.style.display = "none";
        return false;
    }
}

// Validate Password Matching for Edit Form
function validateEditPassword() {
    var password = document.getElementById("edit-password").value;
    var confirmPassword = document.getElementById("edit-confirm-password").value;
    var errorMessage = document.getElementById("edit-password-error");

    if (confirmPassword.length > 0) {
        if (password !== confirmPassword) {
            errorMessage.textContent = "Passwords do not match!";
            errorMessage.style.display = "block";
            return false; // Prevents form submission
        } else {
            errorMessage.textContent = "";
            errorMessage.style.display = "none";
            return true; // Allow form submission
        }
    } else {
        errorMessage.textContent = "";
        errorMessage.style.display = "none";
        return false;
    }
}

// Check Password Strength for Add Pharmacy
function checkPasswordStrength() {
    var password = document.getElementById("password").value;
    var strengthMessage = document.getElementById("password-strength");

    var strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (password.length === 0) {
        strengthMessage.textContent = "";
        strengthMessage.style.display = "none";
    } else if (!strongRegex.test(password)) {
        strengthMessage.textContent = "Weak password! Use at least 8 characters, one uppercase, one lowercase, one number, and one special character.";
        strengthMessage.style.color = "red";
        strengthMessage.style.display = "block";
    } else {
        strengthMessage.textContent = "✅ Strong password!";
        strengthMessage.style.color = "green";
        strengthMessage.style.display = "block";

        setTimeout(() => {
            strengthMessage.style.display = "none";
        }, 2000);
    }
}

// Check Password Strength for Edit Pharmacy
function checkEditPasswordStrength() {
    var password = document.getElementById("edit-password").value;
    var strengthMessage = document.getElementById("edit-password-strength");

    var strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (password.length === 0) {
        strengthMessage.textContent = "";
        strengthMessage.style.display = "none";
    } else if (!strongRegex.test(password)) {
        strengthMessage.textContent = "Weak password! Use at least 8 characters, one uppercase, one lowercase, one number, and one special character.";
        strengthMessage.style.color = "red";
        strengthMessage.style.display = "block";
    } else {
        strengthMessage.textContent = "✅ Strong password!";
        strengthMessage.style.color = "green";
        strengthMessage.style.display = "block";

        setTimeout(() => {
            strengthMessage.style.display = "none";
        }, 2000);
    }
}




const locations = {
    "Bohol": {
        "Loon": ["Agsoso", "Badbad Occidenta", "Badbad Oriental", "Bagacay Katipunan", "Bagacay Katipunan",
            "Bagacay Saong", "Bahi", "Basac", "Basdacu", "Basdio","Canhangdon Oriental","Cogon Norte", 
            "Canigaan", "Canmanoc", "Cansuagwit", "Cansubayon", "Cantam-is Bago", "Cantam-is Baslay", "Cantaongon",
            "Cantumocad","Catagbacan Handig", "Catagbacan Norte", "Catagbacan Sur", "Cogon Norte (Pob.)", "Cogon Sur",
            "Cuasi", "Genomoan", "Lintuan", "Looc", "Mocpoc Norte", "Mocpoc Sur","Nagtuang", "Napo (Pob.)",
             "Ugpong",],
        "Calape": ["Abucayan Norte", "Abucayan Sur", "Banlasan", "Bentig", "Binogawan", "Bonbon", "Bentig",
             "Cabayugan", "Cabudburan", "Calunasan", "Camias", "Canguha", "Catmonan","Desamparados (Pob.)",
            "Kahayag", "Kinabag-an", "Labuon", "Lawis", "Liboron"," Lo-oc", "Lomboy", "Lucob", "Madangog",
             "Magtongtong", "Mandaug", "Mantatao", "Sampoangon", "San Isidro", "Santa Cruz (Pob.)", "Sohoton",
             "Talisay","Tinibgan", "Tultugan", "Ulbujan",]
    }
};

// Load Cities when "Bohol" is selected
function loadCities() {
    const provinceSelect = document.getElementById("province");
    const municipalitySelect = document.getElementById("municipality");
    municipalitySelect.innerHTML = '<option value="" disabled selected class="disabled-option">Select Municipality</option>';
    municipalitySelect.disabled = false;

    if (provinceSelect.value === "Bohol") {
        Object.keys(locations["Bohol"]).forEach(city => {
            let option = document.createElement("option");
            option.value = city;
            option.textContent = city;
            municipalitySelect.appendChild(option);
        });
    }
}

// Load Barangays when a city is selected
function loadBarangays() {
    const municipalitySelect = document.getElementById("municipality");
    const barangaySelect = document.getElementById("barangay");
    barangaySelect.innerHTML = '<option value="" disabled selected class="disabled-option">Select Barangay</option>';
    barangaySelect.disabled = false;

    const selectedMunicipality = municipalitySelect.value;
    if (selectedMunicipality) {
        locations["Bohol"][selectedMunicipality].forEach(barangay => {
            let option = document.createElement("option");
            option.value = barangay;
            option.textContent = barangay;
            barangaySelect.appendChild(option);
        });
    }
}

// Function to validate input fields for special characters
function validateInputField(inputId, errorId) {
    var input = document.getElementById(inputId);
    var errorMessage = document.getElementById(errorId);

    // Custom rules for specific fields
    let specialCharRegex;
    
    if (inputId === "owners-address") {
        specialCharRegex = /[^a-zA-Z0-9\s,]/; // Allows letters, numbers, spaces, and commas
    } else if (inputId === "email") {
        specialCharRegex = /[^a-zA-Z0-9@.]/; // Allows standard email characters
    } else if (inputId === "contact-number" || inputId === "zipcode") {
        specialCharRegex = /[^0-9]/; // **Ensures only numbers are allowed**
    } else if (inputId === "tax-id" || inputId === "cert-number" || inputId === "license-number") {
        specialCharRegex = /[^a-zA-Z0-9-]/; // **Allows numbers and dashes (-) only**
    } else if (inputId === "barangay") {
        specialCharRegex = /[^a-zA-Z0-9\s().-]/; // Allows letters, numbers, spaces, parentheses (), dots ., and dashes -
    } else {
        specialCharRegex = /[^a-zA-Z0-9\s]/; // Default: letters, numbers, spaces only
    }


    if (specialCharRegex.test(input.value)) {
        errorMessage.textContent = "Invalid character detected!";
        errorMessage.style.display = "block";
        return false;
    } else {
        errorMessage.textContent = "";
        errorMessage.style.display = "none";
        return true;
    }
}

// Attach validation to input fields on keyup
document.getElementById("pharmacy-name").addEventListener("keyup", function() {
    validateInputField("pharmacy-name", "pharmacy-error");
});

document.getElementById("owner-name").addEventListener("keyup", function() {
    validateInputField("owner-name", "owners-error");
});

document.getElementById("contact-number").addEventListener("keyup", function() {
    validateInputField("contact-number", "contact-error");
});

document.getElementById("owners-address").addEventListener("keyup", function() {
    validateInputField("owners-address", "owners-address-error");
});

document.getElementById("email").addEventListener("keyup", function() {
    validateInputField("email", "pharmacy-email-error");
});

document.getElementById("street").addEventListener("keyup", function() {
    validateInputField("street", "street-error");
});

document.getElementById("barangay").addEventListener("keyup", function() {
    validateInputField("barangay", "barangay-error");
});

document.getElementById("municipality").addEventListener("keyup", function() {
    validateInputField("municipality", "municipality-error");
});

document.getElementById("province").addEventListener("keyup", function() {
    validateInputField("province", "province-error");
});

document.getElementById("zipcode").addEventListener("keyup", function() {
    validateInputField("zipcode", "zipcode-error");
});

document.getElementById("tax-id").addEventListener("keyup", function() {
    validateInputField("tax-id", "tax-error");
});

document.getElementById("cert-number").addEventListener("keyup", function() {
    validateInputField("cert-number", "certification-error");
});

document.getElementById("license-number").addEventListener("keyup", function() {
    validateInputField("license-number", "license-error");
});


let map, marker;

document.getElementById("set-location-btn").addEventListener("click", function (event) {
    event.preventDefault(); // Prevent default button behavior
    const mapModal = document.getElementById("map-modal");

    // Ensure the modal is displayed
    mapModal.style.display = "flex";  
    setTimeout(() => {
        mapModal.style.opacity = "1";
        mapModal.style.visibility = "visible";
    }, 10); // Slight delay for smoother transition

    // Initialize map only when modal is opened
    if (!map) {
        initMap();
    }
});

document.getElementById("close-map").addEventListener("click", function () {
    const mapModal = document.getElementById("map-modal");
    mapModal.style.opacity = "0";
    mapModal.style.visibility = "hidden";
    setTimeout(() => {
        mapModal.style.display = "none";
    }, 300); // Matches transition duration
});

let selectedLocation = null;

function initMap() {
    const defaultLocation = { lat: 9.8, lng: 123.9 }; // Default coordinates
    map = new google.maps.Map(document.getElementById("map"), {
        center: defaultLocation,
        zoom: 12,
    });
    marker = new google.maps.Marker({
        position: defaultLocation,
        map: map,
        draggable: true,
    });

    google.maps.event.addListener(map, "click", (event) => {
        marker.setPosition(event.latLng);
        selectedLocation = { lat: event.latLng.lat(), lng: event.latLng.lng() };
    });
}

document.getElementById("save-location").addEventListener("click", () => {
    const saveButton = document.getElementById("save-location");
    const spinner = document.getElementById("save-location-spinner");

    // Show spinner and disable button
    spinner.style.visibility = "visible";
    saveButton.disabled = true;

    setTimeout(() => {
        const lat = marker.getPosition().lat();
        const lng = marker.getPosition().lng();
        
        // **Update the hidden fields**
        document.getElementById("latitude").value = lat;
        document.getElementById("longitude").value = lng;

        // **Update global selectedLocation**
        window.selectedLocation = { lat, lng };

        if (lat && lng) {
            const locationError = document.getElementById("location-error");
            if (locationError) {
                locationError.style.display = "none";
            }
            notyf.success("Location saved successfully!");
            
            // Hide modal properly
            document.getElementById("map-modal").style.opacity = "0";
            document.getElementById("map-modal").style.visibility = "hidden";
            setTimeout(() => {
                document.getElementById("map-modal").style.display = "none";
            }, 300); // Matches transition

        } else {
            notyf.error("Please select a location before saving.");
        }

        // Hide spinner and enable button
        spinner.style.visibility = "hidden";
        saveButton.disabled = false;
    }, 1000); // Simulating processing delay
});




// Update Firestore to store location
async function confirmAndProcessRegistration() {
    const lat = document.getElementById("latitude").value;
    const lng = document.getElementById("longitude").value;
    
    const data = { latitude: lat, longitude: lng };
    await db.collection("register_pharmacy").add(data);
}


// Initialize EmailJS
emailjs.init("bi4-vmk5tOL3A4IHO"); // Replace with your public API key

async function sendRegistrationEmail(userEmail, pharmacyName) {
    const templateParams = {
        user_email: userEmail,
        pharmacy_name: pharmacyName
    };

    try {
        const response = await emailjs.send("service_j1s3ssw", "template_wlbd8gb", templateParams);
        console.log("Email sent successfully:", response);

        Swal.fire({
            title: "Email Sent!",
            text: "A confirmation email has been sent to the registered email address.",
            icon: "success"
        });

    } catch (error) {
        console.error("Error sending email:", error);

        Swal.fire({
            title: "Email Sending Failed",
            text: "There was an issue sending the confirmation email.",
            icon: "error"
        });
    }
}


document.getElementById('add_pharmacy-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitButton = document.getElementById('submit-btn');
    const spinner = document.getElementById('spinner');
    const modal = document.getElementById('addPharmacyModal'); // Get modal reference

    submitButton.disabled = true;
    spinner.style.visibility = "visible";

    const notyf = new Notyf({
        duration: 5000,
        position: { x: 'right', y: 'top' },
        dismissible: true
    });

    // ✅ **Check password validation before proceeding**
    if (!validatePassword()) {
        setTimeout(() => {
            spinner.style.visibility = "hidden";
            submitButton.disabled = false;
        }, 800);
        return;
    }

    // ✅ **Validate all fields for special characters**
    const fieldsToValidate = [
        { id: "pharmacy-name", errorId: "pharmacy-error" },
        { id: "owner-name", errorId: "owners-error" },
        { id: "contact-number", errorId: "contact-error" },
        { id: "owners-address", errorId: "owners-address-error" },
        { id: "email", errorId: "pharmacy-email-error" },
        { id: "street", errorId: "street-error" },
        { id: "barangay", errorId: "barangay-error" },
        { id: "municipality", errorId: "municipality-error" },
        { id: "province", errorId: "province-error" },
        { id: "zipcode", errorId: "zipcode-error" },
        { id: "tax-id", errorId: "tax-error" },
        { id: "cert-number", errorId: "certification-error" },
        { id: "license-number", errorId: "license-error" }
    ];

    let isValid = true;

    fieldsToValidate.forEach(({ id, errorId }) => {
        if (!validateInputField(id, errorId)) {
            isValid = false;
        }
    });

    if (!isValid) {
        spinner.style.visibility = "hidden";
        submitButton.disabled = false;
        notyf.error("Invalid input detected. Remove special characters.");
        return;
    }

    // ✅ **Check if email already exists in Firestore**
    try {
        const emailInput = document.getElementById('email').value.trim().toLowerCase();
        const emailError = document.getElementById('pharmacy-email-error');
        const querySnapshot = await db.collection('register_pharmacy')
            .where('email', '==', emailInput)
            .get();

        if (!querySnapshot.empty) {
            emailError.textContent = "This email already exists. Please use a different one.";
            emailError.style.display = "block";
            notyf.error("Email is already in use. Please choose a different one.");
            spinner.style.visibility = "hidden";
            submitButton.disabled = false;
            return;
        } else {
            emailError.textContent = "";
            emailError.style.display = "none";
        }
    } catch (error) {
        console.error("Error checking email existence: ", error);
        notyf.error("Error verifying email. Please try again.");
        spinner.style.visibility = "hidden";
        submitButton.disabled = false;
        return;
    }

    // ✅ **Check if location is selected**
    const latitude = document.getElementById("latitude").value.trim();
    const longitude = document.getElementById("longitude").value.trim();
    const locationError = document.getElementById("location-error");

    if (!latitude || !longitude) {
        locationError.textContent = "Please select a location on the map.";
        locationError.style.display = "block";
        notyf.error("Please select a location before submitting.");
        spinner.style.visibility = "hidden";
        submitButton.disabled = false;
        return;
    } else {
        locationError.style.display = "none";
    }

    // ✅ **Get all form values**
    const pharmacyName = document.getElementById('pharmacy-name').value.trim();
    const ownerName = document.getElementById('owner-name').value.trim();
    const contactNumber = document.getElementById('contact-number').value.trim();
    const ownersAddress = document.getElementById('owners-address').value.trim();
    const email = document.getElementById('email').value.trim();
    const pharmacyType = document.getElementById('pharmacy-type').value;
    const street = document.getElementById('street').value.trim();
    const barangay = document.getElementById('barangay').value.trim();
    const municipality = document.getElementById('municipality').value.trim();
    const province = document.getElementById('province').value.trim();
    const zipcode = document.getElementById('zipcode').value.trim();
    const taxId = document.getElementById('tax-id').value.trim();
    const certNumber = document.getElementById('cert-number').value.trim();
    const licenseExpiry = document.getElementById('license-expiry').value;
    const licenseNumber = document.getElementById('license-number').value.trim();
    const dateReg = document.getElementById('date-of-registration').value;
    const password = document.getElementById('password').value;
    const status = document.getElementById('status').value;

    const pictureFile = document.getElementById('medicine-picture').files[0];

    function convertTo12HourFormat(time) {
        if (!time) return "";
        let [hours, minutes] = time.split(":");
        let ampm = hours >= 12 ? "PM" : "AM";
        hours = hours % 12 || 12;
        return `${hours}:${minutes} ${ampm}`;
    }

    const startTime = convertTo12HourFormat(document.getElementById('start').value);
    const closeTime = convertTo12HourFormat(document.getElementById('close').value);
    const daysFrom = document.getElementById('daysfrom').value;
    const daysTo = document.getElementById('daysto').value;

    // ✅ **Convert image to Base64**
    let pictureBase64 = "";
    if (pictureFile) {
        const reader = new FileReader();
        reader.readAsDataURL(pictureFile);
        reader.onload = async function () {
            pictureBase64 = reader.result;
            await saveToFirestore();
        };
    } else {
        await saveToFirestore();
    }

    async function saveToFirestore() {
        try {
            await db.collection("register_pharmacy").add({
                pharmacy_name: pharmacyName,
                license_number: licenseNumber,
                owners_name: ownerName,
                owners_address: ownersAddress,
                email: email,
                pharmacy_type: pharmacyType,
                street: street,
                barangay: barangay,
                municipality: municipality,
                province: province,
                zipcode: zipcode,
                contact_num: contactNumber,
                start: startTime,
                close: closeTime,
                days_open_from: daysFrom,
                days_open_to: daysTo,
                TIN: taxId,
                business_permit: certNumber,
                expiry_date: licenseExpiry,
                date_registration: dateReg,
                password: password,
                status: status,
                latitude: latitude,
                longitude: longitude,
                med_picture: pictureBase64
            });

            // ✅ **Close Modal**
            modal.style.display = "none";

            Swal.fire({
                title: "Successfully Registered!",
                text: "Your pharmacy has been added successfully.",
                icon: "success"
            });

            document.getElementById('add_pharmacy-form').reset();
        } catch (error) {
            console.error("Error adding document: ", error);
            Swal.fire({
                title: "Registration Failed",
                text: "There was an error saving the data.",
                icon: "error"
            });
        } finally {
            submitButton.disabled = false;
            spinner.style.visibility = "hidden";
        }
    }
});





document.addEventListener("DOMContentLoaded", function () {
    const tabs = document.querySelectorAll(".pharmacy-nav .tab");
    const registerTable = document.getElementById("registerPharmacyTable");
    const pendingTable = document.getElementById("pendingPharmacyTable");
    const inactiveTable = document.getElementById("inactivePharmacyTable");

    tabs.forEach(tab => {
        tab.addEventListener("click", function () {
            tabs.forEach(t => t.classList.remove("active")); // Remove active class from all tabs
            this.classList.add("active"); // Add active class to the clicked tab

            const tabType = this.getAttribute("data-tab");

            if (tabType === "registered") {
                registerTable.style.display = "table";
                pendingTable.style.display = "none";
                inactiveTable.style.display = "none";
            } else if (tabType === "pending") {
                registerTable.style.display = "none";
                pendingTable.style.display = "table";
                inactiveTable.style.display = "none";
            }  else if (tabType === "inactive") {
                registerTable.style.display = "none";
                pendingTable.style.display = "none";
                inactiveTable.style.display = "table";
            }
        });
    });
});


// Firestore Reference
const pharmacyRef = db.collection("register_pharmacy");

// Pagination Variables
let currentPage = 1;
let rowsPerPage = parseInt(document.getElementById("rowsPerPage").value);
let totalItems = 0;
let totalPages = 1;
let pharmacyData = [];
let activeTab = "registered"; // Default tab

// Function to Fetch and Display Data
function displayPharmacyData() {
    pharmacyRef.onSnapshot((snapshot) => {
        pharmacyData = []; // Reset data array
        snapshot.forEach((doc) => {
            const data = doc.data();
            pharmacyData.push({ id: doc.id, ...data }); // Store data for pagination
        });

        updateTable(); // Ensure data updates correctly per tab
    }, (error) => {
        console.error("Error fetching pharmacy data:", error);
    });
}

// Function to update the table based on current page & status
function updateTable() {
    const registerTableBody = document.getElementById("registertableBody");
    const pendingTableBody = document.getElementById("pendingtableBody");
    const inactiveTableBody = document.getElementById("inactivetableBody");

    // Clear tables
    registerTableBody.innerHTML = "";
    pendingTableBody.innerHTML = "";
    inactiveTableBody.innerHTML = "";

    let filteredData = pharmacyData.filter(data => {
        return data.status && data.status.toLowerCase() === activeTab.toLowerCase();
    });    

    // Update totalItems and totalPages based on filtered data
    totalItems = filteredData.length;
    totalPages = Math.ceil(totalItems / rowsPerPage) || 1;
    currentPage = Math.min(currentPage, totalPages) || 1; // Ensure valid page number

    // Paginate Data
    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    const paginatedData = filteredData.slice(start, end);

    if (paginatedData.length === 0) {
        const emptyRow = `<tr class="no-data-row"><td colspan="7">No data found</td></tr>`;
        if (activeTab === "registered") registerTableBody.innerHTML = emptyRow;
        else if (activeTab === "pending") pendingTableBody.innerHTML = emptyRow;
        else if (activeTab === "inactive") inactiveTableBody.innerHTML = emptyRow;
    } else {
        paginatedData.forEach((data) => {
            const docId = data.id;
            const medPicture = data.med_picture || "default-image.png";
            const pharmacyName = data.pharmacy_name || "N/A";
            const pharmacyEmail = data.email || "N/A";
            const businessAddress = `${data.street}, ${data.barangay}, ${data.municipality}, ${data.province}` || "N/A";
            const dateOfRegistration = data.date_registration || "N/A";

            // Format Opening Schedule
            const daysOpen = data.days_open_from && data.days_open_to ? `${data.days_open_from}-${data.days_open_to}` : "N/A";
            const openingHours = data.start && data.close ? `${data.start}-${data.close}` : "N/A";
            const openingSchedule = (daysOpen !== "N/A" && openingHours !== "N/A") ? `${daysOpen}, ${openingHours}` : "N/A";

            const status = data.status || "N/A";
            let statusClass = "pending";
            if (status.toLowerCase() === "registered") statusClass = "completed";
            else if (status.toLowerCase() === "inactive") statusClass = "inactive";

            const row = `
                <tr>
                    <td>
                        <img src="${medPicture}" alt="Pharmacy Image" width="50" height="50">
                        <span>${pharmacyName}</span>
                    </td>
                    <td>${pharmacyEmail}</td>
                    <td>${businessAddress}</td>
                    <td>${dateOfRegistration}</td>
                    <td>${openingSchedule}</td>
                    <td><span class="status ${statusClass}">${status}</span></td>
                    <td>
                        <div class="action-buttons">
                            <button class="edit-btn" onclick="editRecord('${docId}')">
                                <i class="fas fa-pen"></i>
                            </button>
                            <button class="view-btn" onclick="viewDetails('${docId}')">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="delete-btn" onclick="deleteRecord('${docId}')">
                                <i class="fas fa-trash-alt"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;

            console.log("Appending row for:", data.status, row);

        if (activeTab === "registered") {
            registerTableBody.innerHTML += row;
        } else if (activeTab === "pending") {
            pendingTableBody.innerHTML += row;
        } else if (activeTab === "inactive") {
            inactiveTableBody.innerHTML += row;
        }
        });
    }

    updatePaginationControls();
}

// Function to Handle Tab Switching
document.addEventListener("DOMContentLoaded", function () {
    const tabs = document.querySelectorAll(".pharmacy-nav .tab");
    const tables = {
        registered: document.getElementById("registerPharmacyTable"),
        pending: document.getElementById("pendingPharmacyTable"),
        inactive: document.getElementById("inactivePharmacyTable"),
    };

    tabs.forEach(tab => {
        tab.addEventListener("click", function () {
            tabs.forEach(t => t.classList.remove("active")); // Remove active class from all tabs
            this.classList.add("active"); // Add active class to clicked tab

            activeTab = this.getAttribute("data-tab"); // Update the active tab

            // Hide all tables first
            Object.values(tables).forEach(table => table.style.display = "none");

            // Show the selected table
            tables[activeTab].style.display = "table";

            updateTable(); // Update table based on selected tab
        });
    });

    // Default to show registered table on load
    updateTable();
});

// Function to Update Pagination Controls
function updatePaginationControls() {
    document.getElementById("pagination-text").innerText = 
        `${Math.min((currentPage - 1) * rowsPerPage + 1, totalItems)}-${Math.min(currentPage * rowsPerPage, totalItems)} of ${totalItems} items`;

    document.getElementById("prevPage").disabled = currentPage === 1;
    document.getElementById("nextPage").disabled = currentPage === totalPages;
}

// Event Listeners for Pagination Buttons
document.getElementById("prevPage").addEventListener("click", () => {
    if (currentPage > 1) {
        currentPage--;
        updateTable();
    }
});

document.getElementById("nextPage").addEventListener("click", () => {
    if (currentPage < totalPages) {
        currentPage++;
        updateTable();
    }
});

// Event Listener for Rows Per Page Selection
document.getElementById("rowsPerPage").addEventListener("change", (event) => {
    rowsPerPage = parseInt(event.target.value);
    totalPages = Math.ceil(totalItems / rowsPerPage);
    currentPage = 1; // Reset to first page
    updateTable();
});




// Function to validate input fields for special characters and numbers
function validateEditInputField(EditinputId, EditerrorId) {
    var input = document.getElementById(EditinputId);
    var errorMessage = document.getElementById(EditerrorId);
    let specialCharRegex;

    // Custom rules for specific fields
    if (EditinputId === "edit-owners-address") {
        specialCharRegex = /[^a-zA-Z0-9\s,]/; // Allows letters, numbers, spaces, and commas
    } else if (EditinputId === "edit-email") {
        specialCharRegex = /[^a-zA-Z0-9@._-]/; // Allows standard email characters
    } else if (EditinputId === "edit-contact-number" || EditinputId === "edit-zipcode") {
        specialCharRegex = /[^0-9]/; // Allows numbers only
    } else if (EditinputId === "edit-tax-id" || EditinputId === "edit-cert-number" || EditinputId === "edit-license-number") {
        specialCharRegex = /[^a-zA-Z0-9-]/; // Allows numbers and dashes (-) only
    } else if (EditinputId === "edit-barangay") {
        specialCharRegex = /[^a-zA-Z0-9\s().-]/; // Allows letters, numbers, spaces, parentheses (), dots ., and dashes -
    } else {
        specialCharRegex = /[^a-zA-Z0-9\s]/; // Default: letters, numbers, spaces only
    }

    // Check if input value contains invalid characters
    if (specialCharRegex.test(input.value)) {
        errorMessage.textContent = "Invalid character detected!";
        errorMessage.style.display = "block";
        return false;
    } else {
        errorMessage.textContent = "";
        errorMessage.style.display = "none";
        return true;
    }
}

// Attach validation to input fields on keyup
document.getElementById("edit-pharmacy-name").addEventListener("keyup", function() {
    validateInputField("edit-pharmacy-name", "edit-pharmacy-error");
});

document.getElementById("edit-owner-name").addEventListener("keyup", function() {
    validateInputField("edit-owner-name", "edit-owner-error");
});

document.getElementById("edit-contact-number").addEventListener("keyup", function() {
    validateInputField("edit-contact-number", "edit-contact-number-error");
});

document.getElementById("edit-owners-address").addEventListener("keyup", function() {
    validateInputField("edit-owners-address", "edit-owners-address-error");
});

document.getElementById("edit-email").addEventListener("keyup", function() {
    validateInputField("edit-email", "edit-pharmacy-email-error");
});

document.getElementById("edit-street").addEventListener("keyup", function() {
    validateInputField("edit-street", "edit-street-error");
});

document.getElementById("edit-barangay").addEventListener("keyup", function() {
    validateInputField("edit-barangay", "edit-barangay-error");
});

document.getElementById("edit-municipality").addEventListener("keyup", function() {
    validateInputField("edit-municipality", "edit-municipality-error");
});

document.getElementById("edit-province").addEventListener("keyup", function() {
    validateInputField("edit-province", "edit-province-error");
});

document.getElementById("edit-zipcode").addEventListener("keyup", function() {
    validateInputField("edit-zipcode", "edit-zipcode-error");
});

document.getElementById("edit-tax-id").addEventListener("keyup", function() {
    validateInputField("edit-tax-id", "edit-tax-id-error");
});

document.getElementById("edit-cert-number").addEventListener("keyup", function() {
    validateInputField("edit-cert-number", "edit-certification-number-error");
});

document.getElementById("edit-license-number").addEventListener("keyup", function() {
    validateInputField("edit-license-number", "edit-license-number-error");
});


// Initialize EmailJS (Replace with your Public Key)
emailjs.init("bi4-vmk5tOL3A4IHO"); 

async function sendRegistrationEmail(userEmail, pharmacyName) {
    const templateParams = {
        user_email: userEmail,
        pharmacy_name: pharmacyName
    };

    try {
        const response = await emailjs.send("service_j1s3ssw", "template_wlbd8gb", templateParams);
        console.log("Email sent successfully:", response);

        Swal.fire({
            title: "Email Sent!",
            text: "A confirmation email has been sent to the registered email address.",
            icon: "success"
        });

    } catch (error) {
        console.error("Error sending email:", error);

        Swal.fire({
            title: "Email Sending Failed",
            text: "There was an issue sending the confirmation email.",
            icon: "error"
        });
    }
}

// Updated Form Submission Handler
document.getElementById("edit_pharmacy-form").addEventListener("submit", async function (event) { 
    event.preventDefault(); // Prevent default form submission

    const submitButton = document.getElementById("submit-btn");
    const spinner = document.getElementById("edit-spinner");

    const notyf = new Notyf({
        duration: 5000,
        position: { x: 'right', y: 'top' },
        dismissible: true
    });

    // Show spinner when the button is clicked
    submitButton.disabled = true;
    spinner.style.visibility = "visible";
    spinner.classList.add("spin");

    // Validate password before proceeding
    if (!validateEditPassword()) {
        // Stop submission if passwords do not match
        setTimeout(() => {
            spinner.style.visibility = "hidden"; // Hide spinner after showing error
            spinner.classList.remove("spin");
            submitButton.disabled = false;
        }, 1000); // 1-second delay for better UX

        return; // Prevent further execution
    }

    // Get pharmacy document ID
    const docId = sessionStorage.getItem("editPharmacyId");
    if (!docId) {
        Swal.fire({
            title: "Error!",
            text: "No document ID found. Please try again.",
            icon: "error",
            confirmButtonColor: "#d33"
        });

        submitButton.disabled = false;
        spinner.style.visibility = "hidden";
        return;
    }

     // Validate email uniqueness
     try {
        const emailInput = document.getElementById('edit-email');
        const emailError = document.getElementById('edit-pharmacy-email-error');
        const email = emailInput.value.trim().toLowerCase();
        
        const querySnapshot = await db.collection('register_pharmacy')
            .where('email', '==', email)
            .get();

        if (!querySnapshot.empty) {
            const emailExists = querySnapshot.docs.some(doc => doc.id !== docId);
            if (emailExists) {
                emailError.textContent = "This email already exists. Please use a different one.";
                emailError.style.display = "block";
                notyf.error("Email is already in use. Please choose a different one.");
                spinner.style.visibility = "hidden";
                submitButton.disabled = false;
                return;
            }
        }
        emailError.textContent = "";
        emailError.style.display = "none";
    } catch (error) {
        console.error("Error checking email existence: ", error);
        notyf.error("Error verifying email. Please try again.");
        spinner.style.visibility = "hidden";
        submitButton.disabled = false;
        return;
    }

    // **Validate all fields for special characters before submission**
    const fieldsToValidate = [
        { id: "edit-pharmacy-name", errorId: "edit-pharmacy-error" },
        { id: "edit-owner-name", errorId: "edit-owner-error" },
        { id: "edit-contact-number", errorId: "edit-contact-number-error" },
        { id: "edit-owners-address", errorId: "edit-owners-address-error" },
        { id: "edit-email", errorId: "edit-pharmacy-email-error" },
        { id: "edit-street", errorId: "edit-street-error" },
        { id: "edit-barangay", errorId: "edit-barangay-error" },
        { id: "edit-municipality", errorId: "edit-municipality-error" },
        { id: "edit-province", errorId: "edit-province-error" },
        { id: "edit-zipcode", errorId: "edit-zipcode-error" },
        { id: "edit-tax-id", errorId: "edit-tax-id-error" },
        { id: "edit-cert-number", errorId: "edit-certification-number-error" },
        { id: "edit-license-number", errorId: "edit-license-number-error" }
    ];

    let isValid = true;

    fieldsToValidate.forEach(({ id, errorId }) => {
        if (!validateEditInputField(id, errorId)) {
            isValid = false;
        }
    });

    // **If validation fails, stop form submission and show notification**
    if (!isValid) {
        spinner.style.visibility = "hidden";
        submitButton.disabled = false;
        notyf.error("Invalid input detected. Please remove special characters.");
        return;
    }


    // Collect form data
    const updatedData = {
        pharmacy_name: document.getElementById("edit-pharmacy-name").value.trim(),
        owners_name: document.getElementById("edit-owner-name").value.trim(),
        contact_num: document.getElementById("edit-contact-number").value.trim(),
        owners_address: document.getElementById("edit-owners-address").value.trim(),
        email: document.getElementById("edit-email").value.trim(),
        pharmacy_type: document.getElementById("edit-pharmacy-type").value.trim(),
        street: document.getElementById("edit-street").value.trim(),
        barangay: document.getElementById("edit-barangay").value.trim(),
        municipality: document.getElementById("edit-municipality").value.trim(),
        province: document.getElementById("edit-province").value.trim(),
        zipcode: document.getElementById("edit-zipcode").value.trim(),
        TIN: document.getElementById("edit-tax-id").value.trim(),
        business_permit: document.getElementById("edit-cert-number").value.trim(),
        license_number: document.getElementById("edit-license-number").value.trim(),
        expiry_date: document.getElementById("edit-license-expiry").value.trim(),
        date_registration: document.getElementById("edit-date-of-registration").value.trim(),
        days_open_from: document.getElementById("edit-daysfrom").value.trim(),
        days_open_to: document.getElementById("edit-daysto").value.trim(),
        password: document.getElementById("edit-password").value.trim(),
        status: document.getElementById("edit-status").value.trim(),
        start: convertTo12HourFormat(document.getElementById("edit-start").value),
        close: convertTo12HourFormat(document.getElementById("edit-close").value),
    };

    // ✅ **Check if a new picture is uploaded**
    const fileInput = document.getElementById("edit-medicine-picture");
    if (fileInput.files.length > 0) {
        const reader = new FileReader();
        reader.readAsDataURL(fileInput.files[0]); // Convert image to Base64

        reader.onload = async function () {
            updatedData.med_picture = reader.result; // Store Base64 image
            await saveUpdatedData(); // Save data after image conversion
        };
    } else {
        await saveUpdatedData(); // Save data if no image is uploaded
    }

    async function saveUpdatedData() {
        try {
            await db.collection("register_pharmacy").doc(docId).update(updatedData);

            // If status is changed to "Registered", send email
            if (updatedData.status === "Registered") {
                await sendRegistrationEmail(updatedData.email, updatedData.pharmacy_name);
            }

            // ✅ **Close Modal and Show Success Message**
            setTimeout(() => {
                spinner.style.visibility = "hidden";
                spinner.classList.remove("spin");
                submitButton.disabled = false;
                document.getElementById("editPharmacyModal").classList.remove("show");

                Swal.fire({
                    title: "Successfully Updated!",
                    text: "Pharmacy details updated successfully.",
                    icon: "success",
                    confirmButtonColor: "#28a745"
                });

            }, 1000);
        } catch (error) {
            console.error("Error updating document:", error);
            Swal.fire({
                title: "Update Failed",
                text: "There was an error updating the data.",
                icon: "error",
                confirmButtonColor: "#d33"
            });
        }
    }
});

const editlocations = {
    "Bohol": {
        "Loon": ["Agsoso", "Badbad Occidenta", "Badbad Oriental", "Bagacay Katipunan", "Bagacay Saong", "Bahi",
            "Basac", "Basdacu", "Basdio", "Canhangdon Oriental", "Cogon Norte", "Canigaan", "Canmanoc", 
            "Cansuagwit", "Cansubayon", "Cantam-is Bago", "Cantam-is Baslay", "Cantaongon", "Cantumocad",
            "Catagbacan Handig", "Catagbacan Norte", "Catagbacan Sur", "Cogon Norte (Pob.)", "Cogon Sur",
            "Cuasi", "Genomoan", "Lintuan", "Looc", "Mocpoc Norte", "Mocpoc Sur", "Nagtuang", "Napo (Pob.)",
            "Ugpong"],
        "Calape": ["Abucayan Norte", "Abucayan Sur", "Banlasan", "Bentig", "Binogawan", "Bonbon", "Cabayugan",
            "Cabudburan", "Calunasan", "Camias", "Canguha", "Catmonan", "Desamparados (Pob.)", "Kahayag",
            "Kinabag-an", "Labuon", "Lawis", "Liboron", "Lo-oc", "Lomboy", "Lucob", "Madangog", "Magtongtong",
            "Mandaug", "Mantatao", "Sampoangon", "San Isidro", "Santa Cruz (Pob.)", "Sohoton", "Talisay",
            "Tinibgan", "Tultugan", "Ulbujan"]
    }
};

// Load Barangays when a municipality is selected
function loadEditBarangays() {
    const municipalitySelect = document.getElementById("edit-municipality");
    const barangaySelect = document.getElementById("edit-barangay");

    // Clear previous options and re-enable the select
    barangaySelect.innerHTML = '<option value="" disabled selected class="disabled-option">Select Barangay</option>';
    barangaySelect.disabled = false;

    // Get the selected municipality
    const selectedMunicipality = municipalitySelect.value;

    if (selectedMunicipality && editlocations["Bohol"][selectedMunicipality]) {
        editlocations["Bohol"][selectedMunicipality].forEach(barangay => {
            let option = document.createElement("option");
            option.value = barangay;
            option.textContent = barangay;
            barangaySelect.appendChild(option);
        });
    }
}

// Load Municipalities when province is selected
function loadEditCities() {
    const provinceSelect = document.getElementById("edit-province");
    const municipalitySelect = document.getElementById("edit-municipality");

    // Reset Municipality and Barangay dropdowns
    municipalitySelect.innerHTML = '<option value="" disabled selected class="disabled-option">Select Municipality</option>';
    municipalitySelect.disabled = false;
    document.getElementById("edit-barangay").innerHTML = '<option value="" disabled selected class="disabled-option">Select Barangay</option>';
    document.getElementById("edit-barangay").disabled = true;

    if (provinceSelect.value === "Bohol") {
        Object.keys(editlocations["Bohol"]).forEach(city => {
            let option = document.createElement("option");
            option.value = city;
            option.textContent = city;
            municipalitySelect.appendChild(option);
        });
    }
}

// Function to populate the Edit Pharmacy form with existing data
function populateEditPharmacyForm(existingData) {
    document.getElementById("edit-province").value = existingData.province || "Bohol";
    loadEditCities(existingData.municipality);

    const municipalitySelect = document.getElementById("edit-municipality");
    municipalitySelect.value = existingData.municipality;
    municipalitySelect.disabled = false;

    document.getElementById("edit-barangay").dataset.selectedBarangay = existingData.barangay;
    loadEditBarangays(existingData.municipality, existingData.barangay);

    document.getElementById("edit-street").value = existingData.street;
    document.getElementById("edit-zipcode").value = existingData.zipcode;
}

// Example: Call this function with existing data when the edit modal opens
document.addEventListener("DOMContentLoaded", function () {
    const existingData = {
        province: "Bohol",
        municipality: "Loon",
        barangay: "Cogon Norte (Pob.)",
        street: "123 Sample Street",
        zipcode: "6307"
    };

    populateEditPharmacyForm(existingData);
});


// Function to save docId when opening edit modal
function editRecord(docId) {
    sessionStorage.setItem("editPharmacyId", docId); // Store docId for later update

    const editModal = document.getElementById("editPharmacyModal");
    editModal.classList.add("show");

    db.collection("register_pharmacy").doc(docId).get()
        .then((doc) => {
            if (doc.exists) {
                const data = doc.data();

                document.getElementById("edit-pharmacy-name").value = data.pharmacy_name || "";
                document.getElementById("edit-owner-name").value = data.owners_name || "";
                document.getElementById("edit-contact-number").value = data.contact_num || "";
                document.getElementById("edit-owners-address").value = data.owners_address || "";
                document.getElementById("edit-email").value = data.email || "";
                document.getElementById("edit-pharmacy-type").value = data.pharmacy_type || "";
                document.getElementById("edit-street").value = data.street || "";
                document.getElementById("edit-barangay").value = data.barangay || "";
                document.getElementById("edit-municipality").value = data.municipality || "";
                document.getElementById("edit-province").value = data.province || "";
                document.getElementById("edit-zipcode").value = data.zipcode || "";
                document.getElementById("edit-tax-id").value = data.TIN || "";
                document.getElementById("edit-cert-number").value = data.business_permit || "";
                document.getElementById("edit-license-number").value = data.license_number || "";
                document.getElementById("edit-license-expiry").value = data.expiry_date || "";
                document.getElementById("edit-date-of-registration").value = data.date_registration || "";
                document.getElementById("edit-daysfrom").value = data.days_open_from || "";
                document.getElementById("edit-daysto").value = data.days_open_to || "";
                document.getElementById("edit-password").value = data.password || "";
                document.getElementById("edit-status").value = data.status || "";

                // Fix for time fields (Convert to 24-hour format)
                document.getElementById("edit-start").value = formatTime(data.start);
                document.getElementById("edit-close").value = formatTime(data.close);

                // Display existing medicine picture
                if (data.med_picture) {
                    document.getElementById("current-medicine-picture").src = data.med_picture;
                }
            } else {
                console.error("No document found!");
            }
        })
        .catch((error) => {
            console.error("Error fetching document:", error);
        });
}

// Function to convert Firestore time format (12-hour AM/PM) to 24-hour HH:MM
function formatTime(timeStr) {
    if (!timeStr) return ""; // Return empty if no data

    const match = timeStr.match(/^(\d+):(\d+) (\w{2})$/); // Match HH:MM AM/PM
    if (!match) return timeStr; // If already in 24-hour format, return as is

    let hours = parseInt(match[1], 10);
    const minutes = match[2];
    const meridian = match[3].toUpperCase();

    if (meridian === "PM" && hours < 12) hours += 12;
    if (meridian === "AM" && hours === 12) hours = 0;

    return `${String(hours).padStart(2, "0")}:${minutes}`; // Format as HH:MM
}

// Function to convert 24-hour format to 12-hour format for Firestore
function convertTo12HourFormat(timeStr) {
    if (!timeStr) return "";

    let [hours, minutes] = timeStr.split(":");
    hours = parseInt(hours, 10);
    const meridian = hours >= 12 ? "PM" : "AM";

    hours = hours % 12 || 12; // Convert 24-hour format to 12-hour

    return `${hours}:${minutes} ${meridian}`;
}

// Close modal when clicking the close button
document.getElementById("closeEditModal").addEventListener("click", function () {
    document.getElementById("editPharmacyModal").classList.remove("show");
});

// Close modal when clicking outside
window.addEventListener("click", function (event) {
    const modal = document.getElementById("editPharmacyModal");
    if (event.target === modal) {
        modal.classList.remove("show");
    }
});


function viewDetails(docId) {
    const data = pharmacyData.find(item => item.id === docId);
    if (data) {
        document.getElementById("view-med-picture").src = data.med_picture || "default-image.png";
        document.getElementById("view-pharmacy-name").textContent = data.pharmacy_name || "N/A";
        document.getElementById("view-license-number").textContent = data.license_number || "N/A";
        document.getElementById("view-owners-name").textContent = data.owners_name || "N/A";
        document.getElementById("view-owners-address").textContent = data.owners_address || "N/A";
        document.getElementById("view-email").textContent = data.email || "N/A";
        document.getElementById("view-pharmacy-type").textContent = data.pharmacy_type || "N/A";
        document.getElementById("view-address").textContent = `${data.street}, ${data.barangay}, ${data.municipality}, ${data.province}` || "N/A";
        document.getElementById("view-zipcode").textContent = data.zipcode || "N/A";
        document.getElementById("view-contact-number").textContent = data.contact_num || "N/A";
        document.getElementById("view-operating-hours").textContent = data.start && data.close ? `${data.start} - ${data.close}` : "N/A";
        document.getElementById("view-days-open").textContent = data.days_open_from && data.days_open_to ? `${data.days_open_from} - ${data.days_open_to}` : "N/A";
        document.getElementById("view-tin").textContent = data.TIN || "N/A";
        document.getElementById("view-business-permit").textContent = data.business_permit || "N/A";
        document.getElementById("view-expiry-date").textContent = data.expiry_date || "N/A";
        document.getElementById("view-date-registration").textContent = data.date_registration || "N/A";
        document.getElementById("view-status").textContent = data.status || "N/A";
        
        document.getElementById("viewModal").style.display = "flex";
    }
}

function closeViewModal() {
    document.getElementById("viewModal").style.display = "none";
}


function deleteRecord(docId) {
    Swal.fire({
        title: "Are you sure?",
        text: "This will be moved to archive before deletion!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, archive it!",
        customClass: {
            popup: "custom-swal-popup"
        }
    }).then((result) => {
        if (result.isConfirmed) {
            const deletedAt = new Date().toLocaleString('en-US', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: true
            });

            // Find the record in the pharmacyData array
            const record = pharmacyData.find(item => item.id === docId);

            if (!record) {
                Swal.fire({
                    title: "Error!",
                    text: "Record not found.",
                    icon: "error",
                    customClass: {
                        popup: "custom-swal-popup"
                    }
                });
                return;
            }

            // Create an archived record
            const archivedRecord = {
                ...record,
                deleted_at: deletedAt,
                original_status: record.status
            };

            // Move the record to the archive_data collection
            db.collection("archive_data").doc(docId).set(archivedRecord)
                .then(() => {
                    // Remove from the main database
                    return db.collection("register_pharmacy").doc(docId).delete();
                })
                .then(() => {
                    // Remove from the local pharmacyData array
                    pharmacyData = pharmacyData.filter(item => item.id !== docId);

                    // Update both tables dynamically
                    updateTable();
                    updateArchiveTable();

                    Swal.fire({
                        title: "Archived!",
                        text: "Your record has been moved to archive.",
                        icon: "success",
                        customClass: {
                            popup: "custom-swal-popup"
                        }
                    });
                })
                .catch(error => {
                    console.error("Error archiving record:", error);
                    Swal.fire({
                        title: "Error!",
                        text: "An error occurred while archiving the record.",
                        icon: "error",
                        customClass: {
                            popup: "custom-swal-popup"
                        }
                    });
                });
        }
    });
}

// Call the function when the page loads
displayPharmacyData();




let usersData = []; // Store fetched data for filtering & sorting
let usercurrentPage = 1;
let userrowsPerPage = 5;

// Function to listen to Firestore in real-time
function loadUsersRealtime() {
    db.collection("sign_up_user").onSnapshot((snapshot) => {
        usersData = []; // Reset users array

        snapshot.forEach((doc) => {
            let user = doc.data();
            user.username = `${user.firstName} ${user.lastName}`;
            usersData.push(user);
        });

        filterAndSortUsers(); // Update table after fetching data
    }, (error) => {
        console.error("Error fetching users: ", error);
    });
}

// Function to display users in the table with pagination
function displayUsers(users) {
    const tableBody = document.getElementById("tableuserBody");
    tableBody.innerHTML = ""; // Clear table before updating
    
    let start = (usercurrentPage - 1) * userrowsPerPage;
    let end = start + userrowsPerPage;
    let paginatedUsers = users.slice(start, end);

    if (paginatedUsers.length === 0) {
        tableBody.innerHTML = `<tr class="no-data-row"><td colspan="7">No data found</td></tr>`;
    }

    paginatedUsers.forEach((user) => {
        let row = `<tr>
            <td>${user.username}</td>
            <td>${user.email}</td>
            <td>${user.password}</td>
            <td>${user.gender}</td>
            <td>${user.ageRange}</td>
            <td>${user.phone}</td>
        </tr>`;
        tableBody.innerHTML += row;
    });

    updatePagination(users.length);
}

// Function to update pagination info and buttons
function updatePagination(totalItems) {
    document.getElementById("user-pagination-text").innerText = `${(usercurrentPage - 1) * userrowsPerPage + 1}-${Math.min(currentPage * rowsPerPage, totalItems)} of ${totalItems} items`;
    
    document.getElementById("userprevPage").disabled = usercurrentPage === 1;
    document.getElementById("usernextPage").disabled = usercurrentPage * userrowsPerPage >= totalItems;
}

// Function to filter and sort users with pagination
function filterAndSortUsers() {
    let searchQuery = document.getElementById("search-user-input").value.toLowerCase();
    let selectedGender = document.getElementById("user_filterByGender").value;
    let selectedAgeRange = document.getElementById("user_filterByAgeRange").value;

    let filteredUsers = usersData.filter(user => {
        // Check if user matches search query
        let matchesSearch = 
            user.username.toLowerCase().includes(searchQuery) ||
            user.email.toLowerCase().includes(searchQuery) ||
            user.password.toLowerCase().includes(searchQuery) ||
            user.gender.toLowerCase().includes(searchQuery) ||
            user.ageRange.toString().includes(searchQuery);
            user.phone.toString().includes(searchQuery);

        // Filter by gender
        let matchesGender = (selectedGender === "" || user.gender === selectedGender);

        // Filter by age range
        let matchesAgeRange = true;
        if (selectedAgeRange !== "") {
            let userAge = parseInt(user.ageRange);
            if (selectedAgeRange === "18-25") {
                matchesAgeRange = (userAge >= 18 && userAge <= 25);
            } else if (selectedAgeRange === "26-35") {
                matchesAgeRange = (userAge >= 26 && userAge <= 35);
            } else if (selectedAgeRange === "36-45") {
                matchesAgeRange = (userAge >= 36 && userAge <= 45);
            } else if (selectedAgeRange === "46+") {
                matchesAgeRange = (userAge >= 46);
            }
        }

        return matchesSearch && matchesGender && matchesAgeRange;
    });
    usercurrentPage = 1; // Reset to first page after filtering
    displayUsers(filteredUsers);
}

// Event listeners for search, filter, sorting, and pagination controls
document.getElementById("search-user-input").addEventListener("keyup", filterAndSortUsers);
document.getElementById("user_filterByGender").addEventListener("change", filterAndSortUsers);
document.getElementById("user_filterByAgeRange").addEventListener("change", filterAndSortUsers);
document.getElementById("user-rowsPerPage").addEventListener("change", function() {
    userrowsPerPage = parseInt(this.value);
    usercurrentPage = 1;
    filterAndSortUsers();
});
document.getElementById("userprevPage").addEventListener("click", function() {
    if (usercurrentPage > 1) {
        usercurrentPage--;
        displayUsers(usersData);
    }
});
document.getElementById("usernextPage").addEventListener("click", function() {
    if (usercurrentPage * userrowsPerPage < usersData.length) {
        usercurrentPage++;
        displayUsers(usersData);
    }
});

document.getElementById("search-user-input").addEventListener("input", function () {
    const clearButton = document.getElementById("clear-user-search");
    clearButton.style.display = this.value ? "inline-block" : "none";
});

// Ensure the clear button is hidden on page load
document.getElementById("clear-user-search").style.display = "none";

document.getElementById("clear-user-search").addEventListener("click", function() {
    const searchInput = document.getElementById("search-user-input");
    searchInput.value = "";
    this.style.display = "none"; // Hide the clear button
    filterAndSortUsers();
});

// Load users in real-time
window.onload = loadUsersRealtime;




// Global Variables for Pagination, Search, and Sorting
let archivecurrentPage = 1;
let archiverowsPerPage = 5;
let archivedData = []; // Store all data
let archivetotalItems = 0;
let archivetotalPages = 1;
let archiveSearchQuery = "";
let archiveSortOrder = "desc"; // Default to descending

// Function to Filter and Sort Data Before Display
function filterAndSortArchivedData() {
    let filteredData = archivedData;

    // Apply Search Filter
    if (archiveSearchQuery.trim() !== "") {
        const query = archiveSearchQuery.toLowerCase();
        filteredData = archivedData.filter(record => 
            record.pharmacy_name.toLowerCase().includes(query) || 
            record.email.toLowerCase().includes(query) || 
            record.business_address.toLowerCase().includes(query)
        );
    }

    // Sort by Deleted Date
    filteredData.sort((a, b) => {
        const dateA = new Date(a.deleted_at);
        const dateB = new Date(b.deleted_at);
        return archiveSortOrder === "asc" ? dateA - dateB : dateB - dateA;
    });

    return filteredData;
}

// Function to Update Archive Table with Pagination
function displayArchiveTableWithPagination() {
    const archiveTableBody = document.getElementById("archivetableBody");
    archiveTableBody.innerHTML = "";

    // Apply filtering and sorting
    const filteredData = filterAndSortArchivedData();

    // Update Total Items & Pages
    archivetotalItems = filteredData.length;
    archivetotalPages = Math.ceil(archivetotalItems / archiverowsPerPage) || 1;
    archivecurrentPage = Math.min(archivecurrentPage, archivetotalPages) || 1;

    // Slice Data for Pagination
    const start = (archivecurrentPage - 1) * archiverowsPerPage;
    const end = start + archiverowsPerPage;
    const paginatedData = filteredData.slice(start, end);

    // Display Paginated Data
    if (paginatedData.length === 0) {
        archiveTableBody.innerHTML = `<tr class="no-data-row"><td colspan="8">No matching records found</td></tr>`;
    } else {
        paginatedData.forEach((record) => {
            const row = `
                <tr>
                    <td>
                        <img src="${record.med_picture}" alt="Pharmacy Image" width="50" height="50">
                        <span>${record.pharmacy_name}</span>
                    </td>
                    <td>${record.email}</td>
                    <td>${record.business_address}</td>
                    <td>${record.date_registration}</td>
                    <td>${record.opening_schedule}</td>
                    <td>${record.deleted_at}</td>
                    <td>
                        <div class="action-buttons">
                            <button class="restore-btn" onclick="restoreRecord('${record.id}')">
                                <i class="fas fa-undo"></i>
                            </button>
                            <button class="permanent-delete-btn" onclick="permanentDeleteRecord('${record.id}')">
                                <i class="fas fa-trash-alt"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
            archiveTableBody.innerHTML += row;
        });
    }

    updateArchivePaginationControls();
}

// Function to Update Pagination Controls for Archive
function updateArchivePaginationControls() {
    const paginationText = document.getElementById("archive-pagination-text");
    const prevPageBtn = document.getElementById("archiveprevPage");
    const nextPageBtn = document.getElementById("archivenextPage");

    // If there are no archived records
    if (archivetotalItems === 0) {
        paginationText.textContent = `0-0 of 0 items`;
        prevPageBtn.disabled = true;
        nextPageBtn.disabled = true;
        return; // Exit early if no data is available
    }

    const startItem = (archivecurrentPage - 1) * archiverowsPerPage + 1;
    const endItem = Math.min(archivecurrentPage * archiverowsPerPage, archivetotalItems);

    paginationText.textContent = `${startItem}-${endItem} of ${archivetotalItems} items`;

    prevPageBtn.disabled = archivecurrentPage === 1;
    nextPageBtn.disabled = archivecurrentPage === archivetotalPages;
}

// Event Listeners for Pagination Controls
document.getElementById("archiveprevPage").addEventListener("click", function () {
    if (archivecurrentPage > 1) {
        archivecurrentPage--;
        displayArchiveTableWithPagination();
    }
});

document.getElementById("archivenextPage").addEventListener("click", function () {
    if (archivecurrentPage < archivetotalPages) {
        archivecurrentPage++;
        displayArchiveTableWithPagination();
    }
});

// Event Listener for Rows Per Page Selection
document.getElementById("archive-rowsPerPage").addEventListener("change", function () {
    archiverowsPerPage = parseInt(this.value);
    archivecurrentPage = 1; // Reset to first page when changing rows per page
    displayArchiveTableWithPagination();
});

// Search Bar Event Listener
document.getElementById("archive-search-input").addEventListener("input", function () {
    archiveSearchQuery = this.value;
    archivecurrentPage = 1; // Reset to first page when searching
    displayArchiveTableWithPagination();

    // Show clear button if input is not empty, otherwise hide it
    document.getElementById("clear-archive-search").style.display = this.value ? "block" : "none";
});

// Clear Search Input Button
document.getElementById("clear-archive-search").addEventListener("click", function () {
    document.getElementById("archive-search-input").value = "";
    archiveSearchQuery = "";
    archivecurrentPage = 1;
    displayArchiveTableWithPagination();

    // Hide the clear button after clearing the input
    this.style.display = "none";
});


// Sort By Deleted Date Event Listener
document.getElementById("archive_sortBy").addEventListener("change", function () {
    archiveSortOrder = this.value;
    displayArchiveTableWithPagination();
});

// Function to update the archive table after restoring data
function updateArchiveTable() {
    const archiveTableBody = document.getElementById("archivetableBody");
    archiveTableBody.innerHTML = ""; // Clear existing data

    db.collection("archive_data").get().then((querySnapshot) => {
        archivedData = []; // Reset array

        if (querySnapshot.empty) {
            archiveTableBody.innerHTML = `<tr class="no-data-row"><td colspan="8">No archived records</td></tr>`;
            archivetotalItems = 0; // Update total items when no records are found
            archivetotalPages = 1; // Reset total pages to 1
            archivecurrentPage = 1; // Reset to first page
            updateArchivePaginationControls(); // Update pagination control
            return;
        }

        querySnapshot.forEach((doc) => {
            const data = doc.data();

            // Retrieve opening schedule
            let openingSchedule = data.opening_schedule || "N/A";
            if (openingSchedule === "N/A") {
                const daysOpen = data.days_open_from && data.days_open_to ? `${data.days_open_from}-${data.days_open_to}` : "N/A";
                const openingHours = data.start && data.close ? `${data.start}-${data.close}` : "N/A";
                openingSchedule = (daysOpen !== "N/A" && openingHours !== "N/A") ? `${daysOpen}, ${openingHours}` : "N/A";
            }

            // Ensure med_picture is included
            const medPicture = data.med_picture || "default-image.png";

            archivedData.push({
                id: doc.id,
                pharmacy_name: data.pharmacy_name || "N/A",
                email: data.email || "N/A",
                business_address: `${data.street}, ${data.barangay}, ${data.municipality}, ${data.province}` || "N/A",
                date_registration: data.date_registration || "N/A",
                opening_schedule: openingSchedule,
                deleted_at: data.deleted_at || "N/A",
                med_picture: medPicture
            });
        });

        archivetotalItems = archivedData.length;
        archivetotalPages = Math.ceil(archivetotalItems / archiverowsPerPage) || 1; // Update total pages based on data
        archivecurrentPage = Math.min(archivecurrentPage, archivetotalPages) || 1; // Ensure valid current page

        displayArchiveTableWithPagination(); // Display paginated data
        updateArchivePaginationControls(); // Update pagination controls after data is loaded
    }).catch(error => {
        console.error("Error fetching archived records:", error);
        archiveTableBody.innerHTML = `<tr class="no-data-row"><td colspan="8">Error loading archive</td></tr>`;
        archivetotalItems = 0;
        archivetotalPages = 1;
        updateArchivePaginationControls();
    });
}

// Load archive records on page load
document.addEventListener("DOMContentLoaded", function () {
    updateArchiveTable();
});



// Function to Restore Archived Record
function restoreRecord(docId) {
    Swal.fire({
        title: "Restore Record?",
        text: "Are you sure you want to restore this record?",
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#28a745",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, Restore",
    }).then((result) => {
        if (result.isConfirmed) {
            db.collection("archive_data").doc(docId).get().then((doc) => {
                if (doc.exists) {
                    const restoredData = doc.data();
                    const originalStatus = restoredData.original_status || "registered";

                    // Restore record to original database
                    db.collection("register_pharmacy").doc(docId).set(restoredData)
                        .then(() => {
                            return db.collection("archive_data").doc(docId).delete(); // Remove from archive
                        })
                        .then(() => {
                            // Update tables dynamically
                            updateTable();
                            updateArchiveTable();

                            Swal.fire("Restored!", "Record has been successfully restored.", "success");
                        })
                        .catch((error) => {
                            console.error("Error restoring record:", error);
                            Swal.fire("Error!", "Failed to restore record.", "error");
                        });
                }
            });
        }
    });
}

// Function to Permanently Delete Record from Archive
function permanentDeleteRecord(docId) {
    Swal.fire({
        title: "Permanently Delete?",
        text: "This action cannot be undone. Do you want to proceed?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#990000",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, Delete Permanently",
    }).then((result) => {
        if (result.isConfirmed) {
            db.collection("archive_data").doc(docId).delete()
                .then(() => {
                    updateArchiveTable(); // Update the table after deletion
                    Swal.fire("Deleted!", "Record has been permanently deleted.", "success");
                })
                .catch((error) => {
                    console.error("Error deleting record:", error);
                    Swal.fire("Error!", "Failed to delete record.", "error");
                });
        }
    });
}



document.addEventListener("DOMContentLoaded", async () => {
    const notificationsContainer = document.querySelector(".notification_wrapper");
    const dbRef = db.collection("admin_notifications");

    function timeAgo(timestamp) {
        const now = new Date();
        const diff = Math.floor((now - timestamp) / 1000); // Difference in seconds

        if (diff < 60) return `${diff} seconds ago`;
        if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
        return `${Math.floor(diff / 86400)} days ago`;
    }

    async function loadNotifications() {
        const snapshot = await dbRef.orderBy("timestamp", "desc").limit(5).get();
        const notificationsList = document.querySelector(".notifications-list");
        
        // Clear old notifications but keep the default template
        notificationsList.innerHTML = "";

        if (snapshot.empty) {
            notificationsList.innerHTML = `<p class="no-notifications">No new notifications.</p>`;
            return;
        }

        snapshot.forEach(doc => {
            const data = doc.data();
            const time = timeAgo(data.timestamp.toDate());
            const docId = doc.id; // Get document ID

            const notificationHTML = `
                <div class="notification" data-id="${docId}">
                    <div class="notification-icon">
                        <i class="fas fa-bell"></i>
                    </div>
                    <div class="notification-info">
                        <h4>New Pharmacy Registration</h4>
                        <p>You have a new pending pharmacy named ${data.pharmacy_name}.</p>
                        <span class="timestamp">${time}</span>
                    </div>
                    <button class="not-close-btn">&times;</button>
                </div>
            `;

            notificationsList.insertAdjacentHTML("beforeend", notificationHTML);
        });

        // Add event listener for close buttons
        document.querySelectorAll(".not-close-btn").forEach(button => {
            button.addEventListener("click", async (event) => {
                const notificationElement = event.target.closest(".notification");
                const notificationId = notificationElement.getAttribute("data-id");
                
                Swal.fire({
                    title: "Are you sure you want to delete this notification?",
                    text: "This action cannot be undone.",
                    icon: "warning",
                    showCancelButton: true,
                    confirmButtonText: "Yes, delete it",
                    cancelButtonText: "Cancel",
                    reverseButtons: true
                }).then(async (result) => {
                    if (result.isConfirmed) {
                        await dbRef.doc(notificationId).delete(); // Delete from Firestore
                        notificationElement.remove(); // Remove from DOM
                        Swal.fire("Deleted!", "The notification has been removed.", "success");
                    }
                });
            });
        });
    }

    // Load notifications initially
    loadNotifications();

    // Auto-refresh notifications every 30 seconds
    setInterval(loadNotifications, 30000);
});



