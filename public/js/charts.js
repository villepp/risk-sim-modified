var budgetData = [];
var qualityData = [];
var turnLabels = [];

var budgetChart;
var qualityChart;

function initializeCharts() {
    turnLabels.push("0");
    budgetData.push(project.budget);
    qualityData.push(project.quality);

    var ctxBudget = document.getElementById('budgetChart').getContext('2d');
    budgetChart = new Chart(ctxBudget, {
        type: 'line',
        data: {
            labels: turnLabels,
            datasets: [{
                label: 'Budget Remaining (€)',
                data: budgetData,
                borderColor: 'rgba(75, 192, 192, 1)',
                fill: false,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: { display: true, title: { display: true, text: 'Turn' } },
                y: { display: true, title: { display: true, text: 'Budget (€)' }, beginAtZero: true }
            }
        }
    });

    var ctxQuality = document.getElementById('qualityChart').getContext('2d');
    qualityChart = new Chart(ctxQuality, {
        type: 'line',
        data: {
            labels: turnLabels,
            datasets: [{
                label: 'Project Quality (%)',
                data: qualityData,
                borderColor: 'rgba(255, 99, 132, 1)',
                fill: false,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: { display: true, title: { display: true, text: 'Turn' } },
                y: { display: true, title: { display: true, text: 'Quality (%)' }, min: 0, max: 100 }
            }
        }
    });
}

function updateCharts() {
    turnLabels.push(currentTurn.toString());
    budgetData.push(project.budget);
    qualityData.push(project.quality);
    budgetChart.update();
    qualityChart.update();
} 