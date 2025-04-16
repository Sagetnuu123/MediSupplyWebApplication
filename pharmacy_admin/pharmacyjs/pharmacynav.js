document.addEventListener("DOMContentLoaded", function() {
    const buttons = document.querySelectorAll("button[data-target]");
    const sections = document.querySelectorAll(".menu-content");

    // Function to hide all sections
    function hideAllSections() {
        sections.forEach(section => section.style.display = "none");
    }

    // Function to show the selected section
    function showSection(sectionId) {
        hideAllSections();
        document.getElementById(sectionId).style.display = "block";
    }

    // Default: Show Dashboard on Load
    showSection("dashboard-content");

    // Event Listener for Sidebar Buttons
    buttons.forEach(button => {
        button.addEventListener("click", function() {
            const target = this.getAttribute("data-target");
            if (target) {
                showSection(target);
            }
        });
    });
});

document.querySelectorAll(".custom-dropdown ul").forEach((select) => {
    select.addEventListener("focus", function () {
        this.parentNode.classList.add("active");
    });

    select.addEventListener("blur", function () {
        this.parentNode.classList.remove("active");
    });
});

document.addEventListener("DOMContentLoaded", function () {
    // Select all dropdowns
    document.querySelectorAll(".custom-dropdown").forEach(dropdown => {
        const selectedOption = dropdown.querySelector(".selected-option");
        const optionsList = dropdown.querySelector(".dropdown-options");

        dropdown.addEventListener("click", function (event) {
            // Close all dropdowns first
            document.querySelectorAll(".custom-dropdown").forEach(d => {
                if (d !== dropdown) {
                    d.classList.remove("active");
                }
            });

            dropdown.classList.toggle("active");
            event.stopPropagation(); // Prevent event bubbling
        });

        optionsList.querySelectorAll("li").forEach(option => {
            option.addEventListener("click", function () {
                selectedOption.textContent = this.textContent;
                dropdown.classList.remove("active");
            });
        });
    });

    // Close dropdown when clicking outside
    document.addEventListener("click", function (e) {
        document.querySelectorAll(".custom-dropdown").forEach(dropdown => {
            if (!dropdown.contains(e.target)) {
                dropdown.classList.remove("active");
            }
        });
    });
});

document.addEventListener("DOMContentLoaded", function () {
    // Select all expiration date inputs and their respective buttons
    const dateInputs = document.querySelectorAll("#expiration-date, #essential-expiration-date");
    const dateButtons = document.querySelectorAll(".date-picker-btn");

    // Iterate over inputs to initialize AirDatepicker for each
    dateInputs.forEach(input => {
        new AirDatepicker(input, {
            autoClose: true,
            dateFormat: "yyyy-MM-dd",
            position: "bottom left",
            buttons: ['clear'],
            locale: {
                days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
                daysShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
                daysMin: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
                months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
                monthsShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                today: 'Today',
                clear: 'Clear',
                dateFormat: 'yyyy-MM-dd',
                firstDay: 0
            },
            minDate: new Date() // Disables past dates
        });
    });

    // Ensure each button opens its respective date picker
    dateButtons.forEach((button, index) => {
        button.addEventListener("click", function () {
            dateInputs[index].focus(); // Open corresponding date picker
        });
    });
});


const dateInputs = document.querySelectorAll("#edit-expiration-date, #edit-essential-expiration-date");
const dateButtons = document.querySelectorAll(".edit-date-picker-btn");

dateInputs.forEach((input, index) => {
    const calendar = flatpickr(input, {
        enableTime: false,
        dateFormat: "Y-m-d",
        minDate: "today",
        position: "auto center",
        allowInput: true,
        clickOpens: false,
        theme: "dark"
    });

    // Ensure button opens the date picker
    dateButtons[index].addEventListener("click", function () {
        calendar.open();
    });
});
