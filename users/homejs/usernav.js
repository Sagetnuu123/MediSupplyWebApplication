 // JavaScript for toggle menu
 document.getElementById('menuToggle').addEventListener('click', function() {
    const nav = document.querySelector('.navigation ul');
    nav.classList.toggle('active');
});


document.addEventListener("DOMContentLoaded", function() {
    // Get all buttons and content sections
    const locateBtn = document.getElementById("locateBtn");
    const reserveBtn = document.getElementById("reserveBtn");
    const notifyBtn = document.getElementById("notifyBtn");
    const accountBtn = document.getElementById("accountBtn");

    const locateContent = document.getElementById("locateContent");
    const reserveContent = document.getElementById("reserveContent");
    const notifyContent = document.getElementById("notifyContent");
    const accountContent = document.getElementById("accountContent");

    // Function to hide all content sections
    function hideAllContent() {
        locateContent.style.display = "none";
        reserveContent.style.display = "none";
        notifyContent.style.display = "none";
        accountContent.style.display = "none";

        // Optionally remove 'active' class from buttons
        locateBtn.classList.remove("active");
        reserveBtn.classList.remove("active");
        notifyBtn.classList.remove("active");
        accountBtn.classList.remove("active");
    }

    // Add click event for each button
    locateBtn.addEventListener("click", function() {
        hideAllContent();
        locateContent.style.display = "block";
        locateBtn.classList.add("active");
    });

    reserveBtn.addEventListener("click", function() {
        hideAllContent();
        reserveContent.style.display = "block";
        reserveBtn.classList.add("active");
    });

    notifyBtn.addEventListener("click", function() {
        hideAllContent();
        notifyContent.style.display = "block";
        notifyBtn.classList.add("active");
    });

    accountBtn.addEventListener("click", function() {
        hideAllContent();
        accountContent.style.display = "block";
        accountBtn.classList.add("active");
    });    
});


const userData = JSON.parse(localStorage.getItem('userData'));

    // Display username and avatar
    if (userData) {
        const firstName = userData.firstName || '';
        const lastName = userData.lastName || '';
        const username = `${firstName} ${lastName}`.trim();

        // Set username in profile
        document.getElementById('username').textContent = username;

        // Create initials (first letter of first name and last name)
        const initials = `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase();

        // Set initials inside avatar
        document.getElementById('avatarText').textContent = initials;
    } else {
        document.getElementById('username').textContent = 'Guest';
        document.getElementById('avatarText').textContent = 'G';
    }