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

    function updateDashboard(period) {
        const data = simulatedData[period];
        
        // Update summary cards
        document.getElementById('totalOrders').textContent = data.totalOrders;
        document.getElementById('totalRevenue').textContent = `฿${data.totalRevenue.toLocaleString()}`;
        document.getElementById('avgOrderValue').textContent = `฿${data.avgOrderValue.toFixed(2)}`;

        // Update charts
        updateRevenueChart(data.revenueData, period);
        updateItemPerformanceChart();

        // Update top selling items
        updateTopSellingItems();
    }

    function updateRevenueChart(data, period) {
        const ctx = document.getElementById('revenueChart').getContext('2d');
        
        if (revenueChart) {
            revenueChart.destroy();
        }

        const labels = data.map(d => d[Object.keys(d)[0]]);
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
                    },
                    x: {
                        title: {
                            display: true,
                            text: period === 'today' ? 'Hour' : period === 'week' ? 'Day' : period === 'month' ? 'Date' : 'Month'
                        }
                    }
                }
            }
        });
    }

    function updateItemPerformanceChart() {
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

    function updateTopSellingItems() {
        const topSellingList = document.getElementById('topSellingList');
        topSellingList.innerHTML = '';
        topSellingItems.forEach(item => {
            const li = document.createElement('li');
            li.innerHTML = `
                <div class="item-image">
                    <img src="profile-picture.jpg" alt="${item.name}" width="50" height="50">
                </div>
                <div class="item-details">
                    <h3>${item.name}</h3>
                    <p>Sold: ${item.sold}</p>
                </div>
            `;
            topSellingList.appendChild(li);
        });
    }

    function initializeDashboard() {
        // Set up the date range selector
        const dateRangeSelect = document.getElementById('dateRangeSelect');
        dateRangeSelect.addEventListener('change', function() {
            updateDashboard(this.value);
        });

        // Initialize with today's data
        updateDashboard('today');
    }

    initializeDashboard();
});