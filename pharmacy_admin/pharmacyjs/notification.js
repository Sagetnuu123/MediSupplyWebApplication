function toggleUserMenu(event) {
    const menu = event.target.closest('td').querySelector('.dropdown-menu');
    menu.classList.toggle('hidden');
}