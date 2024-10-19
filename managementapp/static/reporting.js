document.addEventListener('DOMContentLoaded', function() {
    const simulatedData = {
        today: {
            totalOrders: 34,
            totalRevenue: 2547,
            avgOrderValue: 74.91,
            revenueData: [
                { hour: '9AM', revenue: 250 },
                { hour: '12PM', revenue: 600 },
                { hour: '3PM', revenue: 875 },
                { hour: '6PM', revenue: 1150 },
                { hour: '9PM', revenue: 2547 }
            ]
        },
        week: {
            totalOrders: 238,
            totalRevenue: 17856,
            avgOrderValue: 75.02,
            revenueData: [
                { day: 'Mon', revenue: 2500 },
                { day: 'Tue', revenue: 3200 },
                { day: 'Wed', revenue: 2800 },
                { day: 'Thu', revenue: 3500 },
                { day: 'Fri', revenue: 3100 },
                { day: 'Sat', revenue: 4200 },
                { day: 'Sun', revenue: 3800 }
            ]
        },
        month: {
            totalOrders: 476,
            totalRevenue: 35457,
            avgOrderValue: 74.49,
            revenueData: [
                { date: '1', revenue: 1200 },
                { date: '5', revenue: 5400 },
                { date: '10', revenue: 12000 },
                { date: '15', revenue: 18700 },
                { date: '20', revenue: 25500 },
                { date: '25', revenue: 31000 },
                { date: '30', revenue: 35457 }
            ]
        },
        year: {
            totalOrders: 5712,
            totalRevenue: 425484,
            avgOrderValue: 74.49,
            revenueData: [
                { month: 'Jan', revenue: 35000 },
                { month: 'Feb', revenue: 32000 },
                { month: 'Mar', revenue: 37000 },
                { month: 'Apr', revenue: 35457 },
                { month: 'May', revenue: 38000 },
                { month: 'Jun', revenue: 41000 },
                { month: 'Jul', revenue: 39000 },
                { month: 'Aug', revenue: 42000 },
                { month: 'Sep', revenue: 40000 },
                { month: 'Oct', revenue: 43000 },
                { month: 'Nov', revenue: 41000 },
                { month: 'Dec', revenue: 425484 }
            ]
        }
    };

    const topSellingItems = [
        { name: 'Papaya Salad', sold: 50, image: 'papaya-salad.jpg' },
        { name: 'Pad Thai', sold: 42, image: 'pad-thai.jpg' },
        { name: 'Green Curry', sold: 35, image: 'green-curry.jpg' },
        { name: 'Mango Sticky Rice', sold: 30, image: 'mango-sticky-rice.jpg' }
    ];

    let revenueChart, itemPerformanceChart;

    // Function to get CSRF token from cookies
    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                // Does this cookie string begin with the name we want?
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }

    // Get CSRF token
    const csrftoken = getCookie('csrftoken');

    // Fetch dashboard data
    function fetchDashboardData(period) {
        fetch(`/dashboard/?period=${period}`, {
            method: 'GET',
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
                'X-CSRFToken': csrftoken,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            credentials: 'same-origin'
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                console.log(data);
                updateDashboard(data.dashboardData, data.topSellingItems);
            })
            .catch(error => {
                console.error('Error fetching dashboard data:', error);
                showErrorMessage('No data.');
            });
    }
    function showErrorMessage(message) {
        // Create or update error message element
        let errorDiv = document.getElementById('dashboard-error');
        if (!errorDiv) {
            errorDiv = document.createElement('div');
            errorDiv.id = 'dashboard-error';
            errorDiv.className = 'error-message';
            document.querySelector('.reporting-container').prepend(errorDiv);
        }
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';

        // Hide error message after 5 seconds
        setTimeout(() => {
            errorDiv.style.display = 'none';
        }, 5000);
    }

    function updateDashboard(data, topSellingItems) {
        // Update summary cards
        document.getElementById('totalOrders').textContent = data.totalOrders;
        document.getElementById('totalRevenue').textContent =
            `฿${parseFloat(data.totalRevenue).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

        document.getElementById('preparationTime').textContent = data.preparation_time_data;

        // Update charts
        updateRevenueChart(data.revenueData);
        updateItemPerformanceChart(topSellingItems);

        // Update top selling items
        updateTopSellingItems(topSellingItems);
    }


    function updateRevenueChart(data) {
        const ctx = document.getElementById('revenueChart').getContext('2d');

        if (revenueChart) {
            revenueChart.destroy();
        }

        const timeKey = Object.keys(data[0])[0]; // 'hour', 'day', 'date', or 'month'
        const labels = data.map(d => d[timeKey]);
        const revenues = data.map(d => d.revenue);

        revenueChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Revenue',
                    data: revenues,
                    borderColor: 'rgb(255, 99, 132)',
                    tension: 0.1,
                    fill: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Revenue (฿)'
                        }
                    }
                }
            }
        });
    }

    function updateItemPerformanceChart(topSellingItems) {
        const ctx = document.getElementById('itemPerformanceChart').getContext('2d');

        if (itemPerformanceChart) {
            itemPerformanceChart.destroy();
        }

        itemPerformanceChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: topSellingItems.map(item => item.name),
                datasets: [{
                    label: 'Items Sold',
                    data: topSellingItems.map(item => item.sold),
                    backgroundColor: 'rgba(75, 192, 192, 0.8)',
                    borderColor: 'rgb(75, 192, 192)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Items Sold'
                        }
                    }
                }
            }
        });
    }

    function updateTopSellingItems(topSellingItems) {
        const topSellingList = document.getElementById('topSellingList');
        topSellingList.innerHTML = '';

        topSellingItems.forEach(item => {
            const imageUrl = item.image || 'path/to/default/image.png';
            console.log(imageUrl);  // Check if the correct URL is logged

            const li = document.createElement('li');
            li.innerHTML = `
                <div class="item-image">
                    <img src="${imageUrl}" 
                         alt="${item.name}" 
                         width="50" 
                         height="50">
                </div>
                <div class="item-details">
                    <h3>${item.name}</h3>
                    <p>Sold: ${item.sold}</p>
                </div>
            `;
            topSellingList.appendChild(li);
        });
    }
    
    const dateRangeSelect = document.getElementById('dateRangeSelect');
    dateRangeSelect.addEventListener('change', function () {
        const selectedDateRange = this.value;
        fetchDashboardData(selectedDateRange);
    });

    // Initial load
    fetchDashboardData('today');
});