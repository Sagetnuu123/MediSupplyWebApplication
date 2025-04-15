function toggleMenu() {
    const menu = document.getElementById('sideMenu');
    menu.classList.toggle('active');
}

// Close the side menu when clicking outside of it
document.addEventListener('click', function(event) {
    const menu = document.getElementById('sideMenu');
    const menuButton = document.querySelector('.menu-toggle');

    // Check if the click is outside the menu and not on the menu button
    if (!menu.contains(event.target) && !menuButton.contains(event.target)) {
        menu.classList.remove('active');
    }
});

window.addEventListener('resize', function() {
    if (window.innerWidth > 768) {
        document.getElementById('sideMenu').classList.remove('active');
    }
});

const buttons = document.querySelectorAll('.nav-btn');

buttons.forEach(button => {
    button.addEventListener('click', function() {
        // Remove "active" class from all buttons
        buttons.forEach(btn => btn.classList.remove('active'));
        // Add "active" class to the clicked button
        this.classList.add('active');
    });
});

function showSection(sectionId) {
    // Hide all sections
    const sections = document.querySelectorAll('.content-container');
    sections.forEach(section => {
        section.classList.remove('active');
    });

    // Show the selected section
    const selectedSection = document.getElementById(sectionId);
    if (selectedSection) {
        selectedSection.classList.add('active');
    }
}



const modal = document.getElementById("authModal");
const openModalBtn = document.getElementById("openModal");
const closeModal = document.querySelector(".close-modal");
const signupTab = document.getElementById("signupTab");
const loginTab = document.getElementById("loginTab");
const signupForm = document.getElementById("signupForm");
const loginForm = document.getElementById("loginForm");

// Open modal from the nav bar button
openModalBtn.onclick = () => {
    modal.style.display = "flex";
    document.body.style.overflow = "hidden";
};

// Open modal from the side menu button
const sideMenuOpenModalBtn = document.querySelector('.side-menu .signuplogin-btn');
sideMenuOpenModalBtn.onclick = () => {
    modal.style.display = "flex";
    document.body.style.overflow = "hidden";
};

// Close modal when clicking the close button
closeModal.onclick = () => {
    modal.style.display = "none";
    document.body.style.overflow = "auto";
};

// Prevent closing the modal when clicking outside of it
modal.addEventListener("click", (event) => {
    if (event.target.classList.contains("modal-overlay")) {
        return; // Do nothing
    }
});

// Switch to Sign Up tab
signupTab.onclick = () => {
    signupTab.classList.add("active");
    loginTab.classList.remove("active");
    signupForm.classList.add("active");
    loginForm.classList.remove("active");
};

// Switch to Login tab
loginTab.onclick = () => {
    loginTab.classList.add("active");
    signupTab.classList.remove("active");
    loginForm.classList.add("active");
    signupForm.classList.remove("active");
};


