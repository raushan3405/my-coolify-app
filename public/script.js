document.addEventListener("DOMContentLoaded", () => {
    // Payment Mode in % - Pie Chart
    const paymentModePieCtx = document.getElementById('paymentModePieChart').getContext('2d');
    new Chart(paymentModePieCtx, {
        type: 'doughnut',
        data: {
            labels: ['Cash', 'UPI'],
            datasets: [{
                label: 'Payment Mode',
                data: [57, 43],
                backgroundColor: [
                    '#28a745',
                    '#000000'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom',
                }
            }
        }
    });

    // Payment Mode in ₹ - Bar Chart
    const paymentModeBarCtx = document.getElementById('paymentModeBarChart').getContext('2d');
    new Chart(paymentModeBarCtx, {
        type: 'bar',
        data: {
            labels: ['UPI', 'Cash', 'Card', 'Bank Transfer'],
            datasets: [{
                label: 'Payment in ₹',
                data: [180, 240, 0, 0],
                backgroundColor: [
                    '#000000',
                    '#28a745',
                    '#cccccc',
                    '#cccccc'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });

    // Top 5 Services - Table
    const topServicesTable = document.getElementById('topServicesTable').getElementsByTagName('tbody')[0];
    const services = [
        { name: 'BIHAR TECHNICAL SERVICE COMMIS', value: 2 },
        { name: 'CTET - SC/ST/PH FOR CLASS 6 TO 8', value: 1 },
        { name: 'CTET - OBC/EBC/UR FOR ALL', value: 1 },
        { name: 'BIO DATA SIMPLE', value: 1 },
        { name: 'GD - UR/OBC/EBC (PRE REGISTRATION)', value: 1 }
    ];
    let grandTotal = 0;
    services.forEach((service, index) => {
        let row = topServicesTable.insertRow();
        let cell1 = row.insertCell(0);
        let cell2 = row.insertCell(1);
        let cell3 = row.insertCell(2);
        cell1.innerHTML = index + 1;
        cell2.innerHTML = service.name;
        cell3.innerHTML = service.value;
        grandTotal += service.value;
    });
    let footerRow = topServicesTable.insertRow();
    let footerCell1 = footerRow.insertCell(0);
    let footerCell2 = footerRow.insertCell(1);
    let footerCell3 = footerRow.insertCell(2);
    footerCell2.innerHTML = '<strong>Grand Total</strong>';
    footerCell3.innerHTML = `<strong>${grandTotal}</strong>`;

});
