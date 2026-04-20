// js/charts.js

/**
 * Chart Visualization Renderer
 */

class ChartRenderer {
    constructor() {
        this.charts = {};

        // Theme colors matched to CSS
        this.colors = {
            sage: '#8da488',
            sageLight: '#e0eee0',
            sageDark: '#5c7059',
            accent: '#d8b88d',
            info: '#4eb5d2',
            danger: '#e2726e',
            gray: '#e5e7eb'
        };

        // Standard Chart.js styling
        Chart.defaults.font.family = "'Inter', sans-serif";
        Chart.defaults.color = '#6b7280';
        Chart.defaults.scale.grid.color = '#f3f4f6';
        Chart.defaults.plugins.tooltip.backgroundColor = '#1f2937';
        Chart.defaults.plugins.tooltip.padding = 12;
        Chart.defaults.plugins.tooltip.cornerRadius = 8;
    }

    renderAll(metrics) {
        this.renderGenderChart(metrics.maleCount, metrics.femaleCount);
        this.renderBMIChart(metrics.bmiCategories);
        this.renderGoalChart(metrics.goalCounts);
        this.renderWeightChart(metrics.weightDistribution);
        this.renderAgeChart(metrics.ageDistribution);
        this.renderScatterChart(metrics.scatterData);
    }

    destroyChart(id) {
        if (this.charts[id]) {
            this.charts[id].destroy();
        }
    }

    renderGenderChart(males, females) {
        this.destroyChart('gender-chart');
        const ctx = document.getElementById('gender-chart').getContext('2d');

        this.charts['gender-chart'] = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Male', 'Female'],
                datasets: [{
                    data: [males, females],
                    backgroundColor: [this.colors.sage, this.colors.accent],
                    borderWidth: 0,
                    hoverOffset: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '70%',
                plugins: {
                    legend: { position: 'bottom' }
                }
            }
        });
    }

    renderBMIChart(categories) {
        this.destroyChart('bmi-chart');
        const ctx = document.getElementById('bmi-chart').getContext('2d');

        const labels = Object.keys(categories);
        const data = Object.values(categories);

        const bgColors = labels.map(l => {
            if (l === 'Healthy') return this.colors.sage;
            if (l === 'Overweight') return this.colors.danger;
            return this.colors.info;
        });

        this.charts['bmi-chart'] = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Clients',
                    data: data,
                    backgroundColor: bgColors,
                    borderRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: { beginAtZero: true, ticks: { stepSize: 1 } }
                }
            }
        });
    }

    renderGoalChart(goalCounts) {
        this.destroyChart('goal-chart');
        const ctx = document.getElementById('goal-chart').getContext('2d');

        // Sort goals by count
        const sortedGoals = Object.entries(goalCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5); // top 5

        this.charts['goal-chart'] = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: sortedGoals.map(g => g[0]),
                datasets: [{
                    label: 'Clients',
                    data: sortedGoals.map(g => g[1]),
                    backgroundColor: this.colors.sageDark,
                    borderRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: 'y', // Horizontal bar
                plugins: { legend: { display: false } },
                scales: {
                    x: { beginAtZero: true, ticks: { stepSize: 1 } }
                }
            }
        });
    }

    renderWeightChart(distribution) {
        this.destroyChart('weight-chart');
        const ctx = document.getElementById('weight-chart').getContext('2d');

        // Sort bin labels keys numerically
        const sortedBins = Object.keys(distribution).sort((a, b) => parseInt(a) - parseInt(b));
        const data = sortedBins.map(k => distribution[k]);

        this.charts['weight-chart'] = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: sortedBins,
                datasets: [{
                    label: 'Clients',
                    data: data,
                    backgroundColor: this.colors.sageLight,
                    hoverBackgroundColor: this.colors.sage,
                    borderWidth: 0,
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: { beginAtZero: true, ticks: { stepSize: 1 } },
                    x: { grid: { display: false } }
                }
            }
        });
    }

    renderAgeChart(distribution) {
        this.destroyChart('age-chart');
        const canvas = document.getElementById('age-chart');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        const sortedBins = Object.keys(distribution).sort((a, b) => parseInt(a) - parseInt(b));
        const data = sortedBins.map(k => distribution[k]);

        this.charts['age-chart'] = new Chart(ctx, {
            type: 'line',
            data: {
                labels: sortedBins,
                datasets: [{
                    label: 'Clients',
                    data: data,
                    borderColor: this.colors.accent,
                    backgroundColor: this.colors.accent + '33', // 20% opacity
                    fill: true,
                    tension: 0.4,
                    pointRadius: 4,
                    pointBackgroundColor: this.colors.accent
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: { beginAtZero: true, ticks: { stepSize: 1 } },
                    x: { grid: { display: false } }
                }
            }
        });
    }

    renderScatterChart(scatterData) {
        this.destroyChart('scatter-chart');
        const canvas = document.getElementById('scatter-chart');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        this.charts['scatter-chart'] = new Chart(ctx, {
            type: 'scatter',
            data: {
                datasets: [{
                    label: 'Clients',
                    data: scatterData,
                    backgroundColor: this.colors.info + '99', // With opacity
                    borderColor: this.colors.info,
                    borderWidth: 1,
                    pointRadius: 6,
                    pointHoverRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                const pt = context.raw;
                                return `${pt.client}: ${pt.y}kg, ${pt.x}cm`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        title: { display: true, text: 'Height (cm)' },
                        grid: { color: this.colors.gray }
                    },
                    y: {
                        title: { display: true, text: 'Weight (kg)' },
                        grid: { color: this.colors.gray }
                    }
                }
            }
        });
    }
}

window.ChartRenderEngine = new ChartRenderer();
