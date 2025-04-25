firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
        const notificationsRef = db.collection("notifications")
            .where("userUid", "==", user.uid)
            .orderBy("timestamp", "desc");

        notificationsRef.onSnapshot((snapshot) => {
            const notificationContainer = document.querySelector(".notification-message");
            notificationContainer.innerHTML = ""; // Clear existing

            snapshot.forEach(doc => {
                const data = doc.data();
                const timeAgo = getTimeAgo(data.timestamp?.toDate());

                const notificationHTML = `
                    <div class="notification-message-item">
                        <p>${data.message}</p>
                        <p>${timeAgo}</p>
                    </div>
                `;

                notificationContainer.innerHTML += notificationHTML;
            });
        });
    }
});

function getTimeAgo(timestamp) {
    if (!timestamp) return "Just now";
    const secondsAgo = Math.floor((new Date() - timestamp) / 1000);

    if (secondsAgo < 60) return "Just now";
    if (secondsAgo < 3600) return `${Math.floor(secondsAgo / 60)} minute(s) ago`;
    if (secondsAgo < 86400) return `${Math.floor(secondsAgo / 3600)} hour(s) ago`;

    return timestamp.toLocaleString(); // Fallback
}
