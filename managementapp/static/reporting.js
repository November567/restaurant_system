document.addEventListener('DOMContentLoaded', function () {
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
                showErrorMessage('Failed to load dashboard data. Please try again later.');
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
            `฿${data.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        document.getElementById('avgOrderValue').textContent =
            `฿${data.avgOrderValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

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
    

    // Set up the date range selector
    const dateRangeSelect = document.getElementById('dateRangeSelect');
    dateRangeSelect.addEventListener('change', function () {
        fetchDashboardData(this.value);
    });

    // Initial load
    fetchDashboardData('today');
});