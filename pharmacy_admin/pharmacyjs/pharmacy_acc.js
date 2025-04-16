 $(document).ready(function() {
    // Toggle Sidebar
    $('#toggleSidebar').click(function() {
        $('#sidebar').toggleClass('collapsed');
        $('.navbar').toggleClass('collapsed');
        $('.content').toggleClass('collapsed');
        

        // Toggle the arrow icon direction
        if ($('#sidebar').hasClass('collapsed')) {
            $('#toggleSidebar').removeClass('fa-angle-left').addClass('fa-angle-right');
        } else {
            $('#toggleSidebar').removeClass('fa-angle-right').addClass('fa-angle-left');
        }
    });

    // Toggle Theme (Light/Dark Mode)
    $('#lightIcon').click(function() {
        $('body').removeClass('dark-mode');
        $('#lightIcon').addClass('active');
        $('#darkIcon').removeClass('active');
        $('table').removeClass('dark-mode');
    });

    $('#darkIcon').click(function() {
        $('body').addClass('dark-mode');
        $('#darkIcon').addClass('active');
        $('#lightIcon').removeClass('active');
        $('table').addClass('dark-mode');
    });

    document.getElementById("medicine-dropdown").addEventListener("click", function() {
        var dropdownMenu = document.getElementById("medicine-menu");
        var icon = this.querySelector(".dropdown-icon");
        
        if (dropdownMenu.style.display === "block") {
            dropdownMenu.style.display = "none";
            icon.classList.remove("bx-chevron-down");
            icon.classList.add("bx-chevron-right");
        } else {
            dropdownMenu.style.display = "block";
            icon.classList.remove("bx-chevron-right");
            icon.classList.add("bx-chevron-down");
        }
    });

    document.getElementById("archive-dropdown").addEventListener("click", function() {
        var archivedropdownMenu = document.getElementById("archive-menu");
        var archiveicon = this.querySelector(".dropdown-icon");
        
        if (archivedropdownMenu.style.display === "block") {
            archivedropdownMenu.style.display = "none";
            archiveicon.classList.remove("bx-chevron-down");
            archiveicon.classList.add("bx-chevron-right");
        } else {
            archivedropdownMenu.style.display = "block";
            archiveicon.classList.remove("bx-chevron-right");
            archiveicon.classList.add("bx-chevron-down");
        }
    });

    // Get pharmacy name from sessionStorage
    const pharmacyName = sessionStorage.getItem('pharmacyName');
        document.getElementById('pharmacy-name').textContent = pharmacyName ? pharmacyName : 'Guest';
    });

    document.addEventListener("DOMContentLoaded", function() {
        // Monthly Progress Chart
        var ctx1 = document.getElementById('monthlyProgressChart').getContext('2d');
        new Chart(ctx1, {
            type: 'bar',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                datasets: [{
                    label: 'Monthly Sales',
                    data: [60, 40, 50, 80, 20, 30, 100, 50, 70, 50, 80, 40],
                    backgroundColor: ['#4CAF50', '#4CAF50', '#4CAF50', '#4CAF50', '#4CAF50', '#4CAF50', 'black', '#4CAF50', '#4CAF50', '#4CAF50', '#4CAF50', '#4CAF50'],
                    borderRadius: 0, // Removes rounded corners
                    borderSkipped: false,
                    barPercentage: 0.6, // Adjusts bar width
                    categoryPercentage: 0.6, // Adjusts space between bars
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: { 
                        beginAtZero: true, 
                        max: 120, 
                        ticks: { font: { size: 10 }, stepSize: 30 },
                        grid: { display: false } // Removes grid lines
                    },
                    x: { 
                        ticks: { font: { size: 10 } },
                        grid: { display: false } // Removes grid lines
                    }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `${context.dataset.data[context.dataIndex]}k`;
                            }
                        }
                    },
                    legend: { display: false } // Hides legend
                }
            }
        });
    
        // Today's Report Chart
        var ctx2 = document.getElementById('todaysReportChart').getContext('2d');
        new Chart(ctx2, {
            type: 'doughnut',
            data: {
                labels: ['Sold Product', 'Reserve Product', 'Out of Stack', 'Remaining Product'],
                datasets: [{
                    data: [40, 30, 20, 10],
                    backgroundColor: ['#2196F3','#FFEB3B','#D32F2F', '#4CAF50'],
                    borderWidth: 2,
                    hoverOffset: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '70%',
                plugins: {
                    legend: { display: false }
                }
            }
        });
    });
