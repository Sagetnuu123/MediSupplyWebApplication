function handleButtonClick(button, type) {
    const icon = button.querySelector("i");
    const spinner = button.querySelector(".spinner");
    const btnText = button.querySelector(".btn-text");

    // Hide icon and show spinner
    icon.style.display = "none";
    spinner.style.visibility = "visible";

    // Simulate a loading process
    setTimeout(() => {
        if (type === "login") {
            window.location.href = "login_pharmacy.html";
        } else if (type === "home") {
            window.location.href = "home.html";
        }
    }, 2000);
}