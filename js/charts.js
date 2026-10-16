// js/charts.js

/**
 * Chart Visualization Renderer for MyGymDiary Console
 * High-Contrast, Older-Monitor Compatible, Fully Aligned with Lab Manual Practicals
 */

class ChartRenderer {
    constructor() {
        this.charts = {};

        // Older-Monitor & High-Contrast Friendly Color Palette
        this.colors = {
            primary: '#15803d',        // Deep forest emerald
            primaryLight: '#dcfce7',
            primaryDark: '#14532d',
            blue: '#1d4ed8',           // Vivid high-contrast blue
            amber: '#b45309',          // Rich bronze amber
            danger: '#b91c1c',         // Crimson alert
            purple: '#6d28d9',         // Royal violet
            teal: '#0f766e',           // Deep teal
            orange: '#c2410c',         // Deep orange
            neutralGray: '#94a3b8',    // For de-emphasized decluttered bars
            gridColor: '#cbd5e1',      // Clearly visible 1.5px grid on low-contrast screens
            textColor: '#0f172a'       // Pure deep text
        };

        this.applyDefaults();
    }

    applyDefaults() {
        Chart.defaults.font.family = "'Inter', system-ui, -apple-system, sans-serif";
        Chart.defaults.font.size = 12;
        Chart.defaults.font.weight = 600;
        Chart.defaults.color = this.colors.textColor;
        Chart.defaults.borderColor = this.colors.gridColor;
        Chart.defaults.plugins.tooltip.backgroundColor = '#0f172a';
        Chart.defaults.plugins.tooltip.titleColor = '#ffffff';
        Chart.defaults.plugins.tooltip.bodyColor = '#f8fafc';
        Chart.defaults.plugins.tooltip.padding = 10;
        Chart.defaults.plugins.tooltip.cornerRadius = 6;
        Chart.defaults.plugins.tooltip.borderColor = '#475569';
        Chart.defaults.plugins.tooltip.borderWidth = 1.5;
    }

    destroyChart(id) {
        if (this.charts[id]) {
            this.charts[id].destroy();
            delete this.charts[id];
        }
    }

    renderAll(metrics) {
        this.renderGenderChart(metrics.maleCount, metrics.femaleCount, metrics.otherCount);
        this.renderBMIChart(metrics.bmiCategories);
        this.renderGoalChart(metrics.goalCounts);
        this.renderWeightChart(metrics.weightDistribution);
        this.renderAgeChart(metrics.ageDistribution);
        this.renderScatterChart(metrics.scatterData);
    }

    /* =========================================================================
       CORE DASHBOARD CHARTS
       ========================================================================= */

    renderGenderChart(males, females, others = 0) {
        this.destroyChart('gender-chart');
        const canvas = document.getElementById('gender-chart');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        const labels = ['Male', 'Female'];
        const data = [males, females];
        const colors = [this.colors.blue, this.colors.primary];

        if (others > 0) {
            labels.push('Other');
            data.push(others);
            colors.push(this.colors.amber);
        }

        this.charts['gender-chart'] = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: colors,
                    borderColor: '#ffffff',
                    borderWidth: 2,
                    hoverOffset: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '65%',
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: { boxWidth: 14, font: { weight: 700 } }
                    }
                }
            }
        });
    }

    renderBMIChart(categories) {
        this.destroyChart('bmi-chart');
        const canvas = document.getElementById('bmi-chart');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        const labels = Object.keys(categories);
        const data = Object.values(categories);

        const bgColors = labels.map(l => {
            if (l === 'Healthy') return this.colors.primary;
            if (l === 'Overweight') return this.colors.amber;
            if (l === 'Obese') return this.colors.danger;
            return this.colors.blue;
        });

        this.charts['bmi-chart'] = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Clients',
                    data: data,
                    backgroundColor: bgColors,
                    borderColor: '#0f172a',
                    borderWidth: 1.5,
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { stepSize: 1, font: { weight: 700 } },
                        grid: { color: this.colors.gridColor }
                    },
                    x: {
                        ticks: { font: { weight: 700 } },
                        grid: { display: false }
                    }
                }
            }
        });
    }

    renderGoalChart(goalCounts) {
        this.destroyChart('goal-chart');
        const canvas = document.getElementById('goal-chart');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        const sortedGoals = Object.entries(goalCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);

        this.charts['goal-chart'] = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: sortedGoals.map(g => g[0]),
                datasets: [{
                    label: 'Clients',
                    data: sortedGoals.map(g => g[1]),
                    backgroundColor: this.colors.teal,
                    borderColor: '#0f172a',
                    borderWidth: 1.5,
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: 'y',
                plugins: { legend: { display: false } },
                scales: {
                    x: {
                        beginAtZero: true,
                        ticks: { stepSize: 1, font: { weight: 700 } },
                        grid: { color: this.colors.gridColor }
                    },
                    y: {
                        ticks: { font: { weight: 700 } },
                        grid: { display: false }
                    }
                }
            }
        });
    }

    renderWeightChart(distribution) {
        this.destroyChart('weight-chart');
        const canvas = document.getElementById('weight-chart');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        const sortedBins = Object.keys(distribution).sort((a, b) => parseInt(a) - parseInt(b));
        const data = sortedBins.map(k => distribution[k]);

        this.charts['weight-chart'] = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: sortedBins,
                datasets: [{
                    label: 'Clients',
                    data: data,
                    backgroundColor: this.colors.primaryLight,
                    hoverBackgroundColor: this.colors.primary,
                    borderColor: this.colors.primaryDark,
                    borderWidth: 1.5,
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { stepSize: 1, font: { weight: 700 } },
                        grid: { color: this.colors.gridColor }
                    },
                    x: {
                        ticks: { font: { weight: 600 } },
                        grid: { display: false }
                    }
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
                    borderColor: this.colors.blue,
                    backgroundColor: 'rgba(29, 78, 216, 0.15)',
                    borderWidth: 2.5,
                    fill: true,
                    tension: 0.3,
                    pointRadius: 5,
                    pointBackgroundColor: this.colors.blue,
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { stepSize: 1, font: { weight: 700 } },
                        grid: { color: this.colors.gridColor }
                    },
                    x: {
                        ticks: { font: { weight: 600 } },
                        grid: { display: false }
                    }
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
                    label: 'Gym Clients',
                    data: scatterData,
                    backgroundColor: 'rgba(21, 128, 61, 0.8)',
                    borderColor: this.colors.primaryDark,
                    borderWidth: 1.5,
                    pointRadius: 6,
                    pointHoverRadius: 9
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
                                return `${pt.client}: ${pt.y} kg, ${pt.x} cm`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        title: { display: true, text: 'Height (cm)', font: { weight: 700 } },
                        grid: { color: this.colors.gridColor }
                    },
                    y: {
                        title: { display: true, text: 'Weight (kg)', font: { weight: 700 } },
                        grid: { color: this.colors.gridColor }
                    }
                }
            }
        });
    }

    /* =========================================================================
       LAB MANUAL PRACTICALS CHARTS (P1 - P10)
       ========================================================================= */

    /**
     * Practical 3: Clutter vs. Clean Visualization Comparison
     */
    renderClutterComparison(canvasClutteredId, canvasCleanId, categories) {
        this.destroyChart(canvasClutteredId);
        this.destroyChart(canvasCleanId);

        const canvasCluttered = document.getElementById(canvasClutteredId);
        const canvasClean = document.getElementById(canvasCleanId);
        if (!canvasCluttered || !canvasClean) return;

        const labels = Object.keys(categories);
        const values = Object.values(categories);

        // 1. Cluttered Chart: 3D-like, rainbow noise, heavy gridlines everywhere, angled labels
        const rainbowColors = ['#ff0055', '#00ffcc', '#ffff00', '#ff00ff', '#00ff00', '#ff9900'];
        this.charts[canvasClutteredId] = new Chart(canvasCluttered.getContext('2d'), {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'RAW CLIENT POPULATION DATA (CLUTTERED)',
                    data: values,
                    backgroundColor: rainbowColors.slice(0, labels.length),
                    borderColor: '#000000',
                    borderWidth: 3
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: true, position: 'top' },
                    title: { display: true, text: '!!! VISUAL CLUTTER EXAMPLE (DO NOT DO THIS) !!!', font: { size: 14, weight: 'bold' } }
                },
                scales: {
                    x: {
                        grid: { color: '#ff0000', lineWidth: 2, display: true },
                        ticks: { maxRotation: 60, minRotation: 45, color: '#000000', font: { weight: 'bold' } }
                    },
                    y: {
                        grid: { color: '#0000ff', lineWidth: 2, display: true },
                        ticks: { color: '#000000', font: { weight: 'bold' } }
                    }
                }
            }
        });

        // 2. Clean Decluttered Chart: Pre-attentive focus highlighting on the highest category!
        let maxVal = Math.max(...values);
        let maxIdx = values.indexOf(maxVal);

        const cleanColors = labels.map((l, idx) => idx === maxIdx ? this.colors.primary : this.colors.neutralGray);

        this.charts[canvasCleanId] = new Chart(canvasClean.getContext('2d'), {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Clients',
                    data: values,
                    backgroundColor: cleanColors,
                    borderColor: labels.map((l, idx) => idx === maxIdx ? this.colors.primaryDark : '#64748b'),
                    borderWidth: 2,
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    title: { display: true, text: 'Clean & Decluttered: Pre-Attentive Focus on Primary Cohort', font: { size: 13, weight: 700 } }
                },
                scales: {
                    x: {
                        grid: { display: false },
                        ticks: { font: { weight: 700 } }
                    },
                    y: {
                        grid: { color: this.colors.gridColor },
                        ticks: { stepSize: 1, font: { weight: 700 } }
                    }
                }
            }
        });
    }

    /**
     * Practical 4: Gym Operations Incident Retention Trend Timeline
     */
    renderIncidentTimeline(canvasId) {
        this.destroyChart(canvasId);
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        const weeks = ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8 (Incident)', 'W9', 'W10', 'W11', 'W12'];
        const adheringRetention = [100, 98, 97, 95, 94, 93, 92, 91, 90, 89, 88, 87];
        const atRiskCohort = [100, 96, 92, 85, 78, 68, 59, 48, 42, 38, 35, 32];

        this.charts[canvasId] = new Chart(ctx, {
            type: 'line',
            data: {
                labels: weeks,
                datasets: [
                    {
                        label: 'Adhering Cohort (Balanced 50min sessions)',
                        data: adheringRetention,
                        borderColor: this.colors.primary,
                        backgroundColor: 'rgba(21, 128, 61, 0.1)',
                        borderWidth: 2.5,
                        pointRadius: 4,
                        fill: false
                    },
                    {
                        label: 'At-Risk Dropoff Cohort (Unmonitored 85+min burnout)',
                        data: atRiskCohort,
                        borderColor: this.colors.danger,
                        backgroundColor: 'rgba(185, 28, 28, 0.1)',
                        borderWidth: 2.5,
                        borderDash: [5, 5],
                        pointRadius: 5,
                        fill: false
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'top', labels: { font: { weight: 700 } } },
                    tooltip: {
                        callbacks: {
                            label: (ctx) => `${ctx.dataset.label}: ${ctx.parsed.y}% retention`
                        }
                    }
                },
                scales: {
                    y: {
                        title: { display: true, text: 'Member Retention Rate (%)', font: { weight: 700 } },
                        min: 20,
                        max: 105,
                        grid: { color: this.colors.gridColor }
                    },
                    x: {
                        grid: { display: false }
                    }
                }
            }
        });
    }

    /**
     * Practical 7: Data Profiler & Missing Value Matrix Chart
     */
    renderDataProfileMatrix(canvasId, profiling) {
        this.destroyChart(canvasId);
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        const labels = profiling.map(p => p.field);
        const completeness = profiling.map(p => p.completenessPct);

        this.charts[canvasId] = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Completeness %',
                    data: completeness,
                    backgroundColor: completeness.map(c => c === 100 ? this.colors.primary : (c >= 80 ? this.colors.amber : this.colors.danger)),
                    borderColor: '#0f172a',
                    borderWidth: 1.5,
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: {
                        min: 0,
                        max: 100,
                        title: { display: true, text: 'Data Completeness (%)', font: { weight: 700 } },
                        grid: { color: this.colors.gridColor }
                    },
                    x: {
                        ticks: { font: { weight: 700 } },
                        grid: { display: false }
                    }
                }
            }
        });
    }

    /**
     * Practical 8: Dynamic Histogram with Configurable Bins & Normal Curve Overlay
     */
    renderDynamicHistogram(canvasId, distData) {
        this.destroyChart(canvasId);
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        this.charts[canvasId] = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: distData.labels,
                datasets: [
                    {
                        type: 'line',
                        label: 'Theoretical Normal Curve (Bell Curve)',
                        data: distData.normalCurve,
                        borderColor: this.colors.danger,
                        borderWidth: 2.5,
                        pointRadius: 0,
                        fill: false,
                        tension: 0.4
                    },
                    {
                        type: 'bar',
                        label: `Empirical Frequency (${distData.binCount} Bins)`,
                        data: distData.counts,
                        backgroundColor: 'rgba(29, 78, 216, 0.7)',
                        borderColor: this.colors.blue,
                        borderWidth: 1.5,
                        borderRadius: 3
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'top', labels: { font: { weight: 700 } } }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: { display: true, text: 'Frequency (Count of Clients)', font: { weight: 700 } },
                        grid: { color: this.colors.gridColor }
                    },
                    x: {
                        title: { display: true, text: `${distData.field} Intervals (Bin Width = ${distData.binWidth})`, font: { weight: 700 } },
                        grid: { display: false }
                    }
                }
            }
        });
    }

    /**
     * Practical 9: Comparative Grouped Bar Chart (Gender x Goal)
     */
    renderComparativeGrouped(canvasId, compData) {
        this.destroyChart(canvasId);
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        const goals = compData.goals;
        const maleData = goals.map(goal => compData.groupedGoals['Male'][goal] || 0);
        const femaleData = goals.map(goal => compData.groupedGoals['Female'][goal] || 0);

        this.charts[canvasId] = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: goals,
                datasets: [
                    {
                        label: 'Male Members',
                        data: maleData,
                        backgroundColor: this.colors.blue,
                        borderColor: '#0f172a',
                        borderWidth: 1.5,
                        borderRadius: 4
                    },
                    {
                        label: 'Female Members',
                        data: this.colors.purple,
                        data: femaleData,
                        backgroundColor: this.colors.purple,
                        borderColor: '#0f172a',
                        borderWidth: 1.5,
                        borderRadius: 4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'top', labels: { font: { weight: 700 } } }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { stepSize: 1, font: { weight: 700 } },
                        grid: { color: this.colors.gridColor }
                    },
                    x: {
                        ticks: { font: { weight: 700 } },
                        grid: { display: false }
                    }
                }
            }
        });
    }

    /**
     * Practical 9: Box Plot Range Visualization (Five-Number Summary)
     */
    renderBoxPlotSummary(canvasId, boxSummaries) {
        this.destroyChart(canvasId);
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        const genders = Object.keys(boxSummaries);
        const medians = genders.map(g => boxSummaries[g].median);
        const mins = genders.map(g => boxSummaries[g].min);
        const maxs = genders.map(g => boxSummaries[g].max);
        const q1s = genders.map(g => boxSummaries[g].q1);
        const q3s = genders.map(g => boxSummaries[g].q3);

        this.charts[canvasId] = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: genders,
                datasets: [
                    {
                        label: 'Q1 to Q3 (Interquartile Range - 50% of Population)',
                        data: genders.map((g, i) => [q1s[i], q3s[i]]),
                        backgroundColor: 'rgba(21, 128, 61, 0.4)',
                        borderColor: this.colors.primaryDark,
                        borderWidth: 2,
                        borderRadius: 4
                    },
                    {
                        label: 'Median Weight (kg)',
                        data: medians,
                        type: 'scatter',
                        backgroundColor: this.colors.danger,
                        borderColor: '#000000',
                        borderWidth: 2,
                        pointRadius: 8,
                        pointStyle: 'rectRot'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'top', labels: { font: { weight: 700 } } },
                    tooltip: {
                        callbacks: {
                            afterLabel: (ctx) => {
                                const idx = ctx.dataIndex;
                                const g = genders[idx];
                                const b = boxSummaries[g];
                                return `Min: ${b.min}kg | Q1: ${b.q1}kg | Median: ${b.median}kg | Q3: ${b.q3}kg | Max: ${b.max}kg`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        title: { display: true, text: 'Weight (kg)', font: { weight: 700 } },
                        grid: { color: this.colors.gridColor }
                    },
                    x: {
                        grid: { display: false },
                        ticks: { font: { weight: 700 } }
                    }
                }
            }
        });
    }

    /**
     * Practical 10: Proportional Donut & Horizontal Bar Chart Comparison
     */
    renderPieVsBarComparison(canvasPieId, canvasBarId, propData) {
        this.destroyChart(canvasPieId);
        this.destroyChart(canvasBarId);

        const canvasPie = document.getElementById(canvasPieId);
        const canvasBar = document.getElementById(canvasBarId);
        if (!canvasPie || !canvasBar) return;

        const sliceColors = [
            this.colors.primary,
            this.colors.blue,
            this.colors.amber,
            this.colors.purple,
            this.colors.teal,
            this.colors.orange
        ];

        // 1. Proportional Donut / Pie Chart
        this.charts[canvasPieId] = new Chart(canvasPie.getContext('2d'), {
            type: 'doughnut',
            data: {
                labels: propData.categories,
                datasets: [{
                    data: propData.percentages,
                    backgroundColor: sliceColors.slice(0, propData.categories.length),
                    borderColor: '#ffffff',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'bottom', labels: { boxWidth: 12, font: { weight: 700 } } },
                    tooltip: {
                        callbacks: {
                            label: (ctx) => `${ctx.label}: ${ctx.raw}% share`
                        }
                    }
                }
            }
        });

        // 2. Linear Comparative Horizontal Bar Chart (Winner for cognitive clarity!)
        this.charts[canvasBarId] = new Chart(canvasBar.getContext('2d'), {
            type: 'bar',
            data: {
                labels: propData.categories,
                datasets: [{
                    label: 'Proportional Share (%)',
                    data: propData.percentages,
                    backgroundColor: sliceColors.slice(0, propData.categories.length),
                    borderColor: '#0f172a',
                    borderWidth: 1.5,
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: 'y',
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: (ctx) => `${ctx.parsed.x}% of total client base`
                        }
                    }
                },
                scales: {
                    x: {
                        beginAtZero: true,
                        max: Math.max(...propData.percentages) + 10,
                        title: { display: true, text: 'Percentage (%)', font: { weight: 700 } },
                        grid: { color: this.colors.gridColor }
                    },
                    y: {
                        ticks: { font: { weight: 700 } },
                        grid: { display: false }
                    }
                }
            }
        });
    }
}

window.ChartRenderEngine = new ChartRenderer();
