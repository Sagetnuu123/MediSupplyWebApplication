let step = 1;
const totalSteps = 3;
const modalText = document.getElementById("modal-text");
const stepIndicators = document.querySelectorAll(".step");
const progressBar = document.getElementById("progress");

const instructions = [
    "Provide a 1 copy of your business license, business permit, and Tax Payment Identification Number (TIN) for the requirements of your registration.",
    "Kindly submit your copies to the Admin's Office located in San Isidro, Calape, Bohol, or contact the hotline at 0938-077-2919 for more information.",
    "You may now proceed with your registration and await confirmation of approval."
];

function nextStep() {
    if (step < totalSteps) {
        step++;
        updateModal();
    } else {
        showSpinner();
        setTimeout(() => {
            window.location.href = "register_pharmacy.html"; 
        }, 1000); // Delay for spinner animation
    }
}

function prevStep() {
    if (step > 1) {
        step--;
        updateModal();
    }
}

function updateModal() {
    modalText.textContent = `Step ${step}: ${instructions[step - 1]}`;

    stepIndicators.forEach((el, index) => {
        el.classList.toggle("active", index < step);
        el.innerHTML = index < step ? `<span>&#10003;</span>` : index + 1;
    });

    const progressPercentage = ((step - 1) / (totalSteps - 1)) * 100;
    progressBar.style.width = `${progressPercentage}%`;

    document.getElementById("prevBtn").disabled = step === 1;
    
    // Update button text without removing the spinner container
    document.getElementById("nextBtnText").textContent = step === totalSteps ? "Start Registration" : "Next";
}

function showSpinner() {
    document.getElementById("spinner").style.display = "inline-block";
    document.getElementById("nextBtn").disabled = true; // Disable button to prevent multiple clicks
}

function closeModal() {
    document.getElementById("confirmBackModal").style.display = "flex";
}

// Function to close the confirmation modal
function closeConfirmModal() {
    document.getElementById("confirmBackModal").style.display = "none";
}

// Redirect to home if user confirms
function redirectToHome() {
    window.location.href = "home.html";
}

