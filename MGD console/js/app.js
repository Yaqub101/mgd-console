// js/app.js

/**
 * Controller: Manages UI states, events, and data binding
 */

document.addEventListener('DOMContentLoaded', () => {

    // --- Navigation Logic ---
    const navItems = document.querySelectorAll('.nav-item');
    const views = document.querySelectorAll('.view');

    function switchView(targetId) {
        // Update nav styling
        navItems.forEach(item => {
            if (item.dataset.target === targetId) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });

        // Toggle view visibility
        views.forEach(view => {
            if (view.id === `view-${targetId}`) {
                view.classList.remove('hidden');
            } else {
                view.classList.add('hidden');
            }
        });
    }

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            switchView(item.dataset.target);
        });
    });

    // Default view
    switchView('upload');

    // --- Local Storage Initialization ---
    const savedData = localStorage.getItem('mgd_data');
    if (savedData) {
        try {
            window.LAST_RESULT = JSON.parse(savedData);
            
            // Re-hydrate Date objects since JSON stringifies them to strings
            if (window.LAST_RESULT && window.LAST_RESULT.clients) {
                window.LAST_RESULT.clients.forEach(c => {
                    c.Date = new Date(c.Date);
                    if (c.weightHistory) {
                        c.weightHistory.forEach(h => h.date = new Date(h.date));
                    }
                });
            }

            // Populate dashboard and jump straight to it
            updateDashboard(window.LAST_RESULT.metrics, window.LAST_RESULT.insights);
            updateClientTable(window.LAST_RESULT.clients);
            populatePredictionDropdown(window.LAST_RESULT.clients);
            switchView('dashboard');
            document.getElementById('drop-zone').classList.add('hidden');
        } catch (e) {
            console.error("Failed to load saved data", e);
            localStorage.removeItem('mgd_data'); // Clear corrupt data
        }
    }


    // --- File Upload Logic ---
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('csv-file-input');
    const statusMsg = document.getElementById('upload-status');

    dropZone.addEventListener('click', () => fileInput.click());

    ['dragover', 'dragenter'].forEach(e => {
        dropZone.addEventListener(e, (evt) => {
            evt.preventDefault();
            dropZone.classList.add('dragover');
        });
    });

    ['dragleave', 'dragend', 'drop'].forEach(e => {
        dropZone.addEventListener(e, (evt) => {
            evt.preventDefault();
            dropZone.classList.remove('dragover');
        });
    });

    dropZone.addEventListener('drop', (evt) => {
        const file = evt.dataTransfer.files[0];
        if (file) handleFile(file);
    });

    fileInput.addEventListener('change', (evt) => {
        const file = evt.target.files[0];
        if (file) handleFile(file);
    });

    async function handleFile(file) {
        if (!file.name.endsWith('.csv')) {
            showStatus('Error: Please upload a .csv file', 'error');
            return;
        }

        showStatus('Processing...', 'info');

        try {
            const resultState = await window.MGD_Engine.processCSV(file);
            showStatus(`Success! Processed ${resultState.clients.length} clients.`, 'success');

            // Store state globally for export and local storage
            window.LAST_RESULT = resultState;
            localStorage.setItem('mgd_data', JSON.stringify(resultState));

            // Populate Review Summary
            updateReviewSummary(resultState.summary);
            
            // Populate Dashboard (in background)
            updateDashboard(resultState.metrics, resultState.insights);
            updateClientTable(resultState.clients);
            populatePredictionDropdown(resultState.clients);

        } catch (error) {
            showStatus(error.message, 'error');
        }
    }

    function updateReviewSummary(summary) {
        document.getElementById('stat-total-raw').textContent = summary.totalRaw;
        document.getElementById('stat-duplicates').textContent = summary.duplicatesRemoved;
        document.getElementById('stat-outliers').textContent = summary.outliersCorrected;
        document.getElementById('stat-missing').textContent = summary.missingGoalsFilled;
        
        document.getElementById('drop-zone').classList.add('hidden');
        document.getElementById('cleaning-review').classList.remove('hidden');
        document.getElementById('cleaning-note').style.display = 'flex';
        lucide.createIcons();
    }

    document.getElementById('btn-approve-dashboard').addEventListener('click', () => {
        switchView('dashboard');
        // Reset upload view for next time
        setTimeout(() => {
            document.getElementById('drop-zone').classList.remove('hidden');
            document.getElementById('cleaning-review').classList.add('hidden');
            document.getElementById('cleaning-note').style.display = 'none';
            statusMsg.classList.add('hidden');
        }, 500);
        window.dispatchEvent(new Event('resize'));
    });

    function showStatus(msg, type) {
        statusMsg.textContent = msg;
        statusMsg.className = `status-message ${type}`;
        statusMsg.classList.remove('hidden');
    }


    // --- UI Update Logic ---

    function updateDashboard(metrics, insights) {
        // Update number metric cards
        document.getElementById('metric-total-clients').textContent = metrics.totalClients || 0;
        document.getElementById('metric-avg-bmi').textContent = metrics.avgBMI || 0;
        document.getElementById('metric-avg-weight').textContent = `${metrics.avgWeight || 0} kg`;
        document.getElementById('metric-common-goal').textContent = metrics.mostCommonGoal || '--';

        // Update Charts
        if (metrics.totalClients > 0) {
            window.ChartRenderEngine.renderAll(metrics);
        }

        // Update Insights
        const insightsList = document.getElementById('insights-list');
        insightsList.innerHTML = '';

        insights.forEach(insight => {
            const el = document.createElement('div');
            el.className = 'insight-item';

            // Map types to lucide icons
            let icon = 'info';
            if (insight.type === 'warning') icon = 'alert-triangle';
            if (insight.type === 'danger') icon = 'alert-circle';
            if (insight.type === 'success') icon = 'check-circle';

            el.innerHTML = `<i data-lucide="${icon}" class="text-${insight.type}"></i> <span>${insight.text}</span>`;
            el.style.display = 'flex'; el.style.alignItems = 'center'; el.style.gap = '8px';
            insightsList.appendChild(el);
        });
        lucide.createIcons(); // refresh icons
    }

    function getBadgeClass(category) {
        if (category === 'Healthy') return 'badge-success';
        if (category === 'Overweight') return 'badge-danger'; // mapped to red text locally
        return 'badge-warning';
    }

    function updateClientTable(clients) {
        const tbody = document.getElementById('client-table-body');
        tbody.innerHTML = '';

        clients.forEach((client, idx) => {
            const tr = document.createElement('tr');

            // Add custom data-index for click handling
            tr.innerHTML = `
                <td><span class="client-name-cell" data-idx="${idx}">${client.Name}</span></td>
                <td>${client.Age}</td>
                <td>${client.Gender}</td>
                <td>${client.Weight.toFixed(1)}</td>
                <td>${client.Height}</td>
                <td>${client.BMI}</td>
                <td><span class="badge ${getBadgeClass(client.BMI_Category)}">${client.BMI_Category}</span></td>
                <td>${client.Goal}</td>
            `;
            tbody.appendChild(tr);
        });

        // Attach click listeners to names
        document.querySelectorAll('.client-name-cell').forEach(cell => {
            cell.addEventListener('click', (e) => {
                const idx = e.target.getAttribute('data-idx');
                showClientDetail(clients[idx]);
            });
        });
    }

    // --- DAA Features (Search & Sort) ---
    const searchInput = document.getElementById('client-search');
    const sortSelect = document.getElementById('client-sort');
    const filterBmi = document.getElementById('filter-bmi');
    const filterGoal = document.getElementById('filter-goal');
    const searchIndicator = document.getElementById('search-indicator');

    function applyDaaFilters() {
        if (!window.LAST_RESULT) return;
        
        let processedClients = [...window.LAST_RESULT.clients];
        
        // --- 1. Filtering ---
        const smiVal = filterBmi ? filterBmi.value : 'All';
        const goalVal = filterGoal ? filterGoal.value : 'All';
        
        if (smiVal !== 'All') {
            processedClients = processedClients.filter(c => c.BMI_Category === smiVal);
        }
        if (goalVal !== 'All') {
            processedClients = processedClients.filter(c => c.Goal === goalVal);
        }

        const sortKey = sortSelect ? sortSelect.value : 'Name';
        const searchTerm = searchInput ? searchInput.value.trim() : '';

        // Step 2: Sorting always happens first using Merge Sort
        processedClients = window.MGD_Engine.mergeSort(processedClients, sortKey, true);

        // Step 3: Searching using Binary Search
        if (searchTerm) {
            searchIndicator.style.display = 'block';
            
            // Binary search requires the array to be sorted by the search key (Name)
            if (sortKey !== 'Name') {
                processedClients = window.MGD_Engine.mergeSort(processedClients, 'Name', true);
            }
            processedClients = window.MGD_Engine.binarySearch(processedClients, 'Name', searchTerm);
            
            // Re-apply original sort if it wasn't Name
            if (sortKey !== 'Name') {
                processedClients = window.MGD_Engine.mergeSort(processedClients, sortKey, true);
            }
        } else {
            searchIndicator.style.display = 'none';
        }

        updateClientTable(processedClients);
    }

    if (searchInput) {
        searchInput.addEventListener('input', () => {
            applyDaaFilters();
        });
    }

    if (sortSelect) {
        sortSelect.addEventListener('change', () => {
            applyDaaFilters();
        });
    }
    
    if (filterBmi) filterBmi.addEventListener('change', () => applyDaaFilters());
    if (filterGoal) filterGoal.addEventListener('change', () => applyDaaFilters());

    // --- Modal Logic ---
    const modal = document.getElementById('client-modal');
    const closeBtn = document.getElementById('close-modal');

    closeBtn.addEventListener('click', () => {
        modal.classList.add('hidden');
    });

    // Close on backdrop click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.add('hidden');
        }
    });

    function showClientDetail(client) {
        document.getElementById('modal-client-name').textContent = client.Name;

        const detailsObj = [
            { label: 'Age', val: `${client.Age} yrs` },
            { label: 'Gender', val: client.Gender },
            { label: 'Weight', val: `${client.Weight} kg` },
            { label: 'Height', val: `${client.Height} cm` },
            { label: 'BMI', val: client.BMI },
            { label: 'Category', val: `<span class="badge ${getBadgeClass(client.BMI_Category)}">${client.BMI_Category}</span>` },
            { label: 'Body Fat', val: client.BodyFat ? `${client.BodyFat}%` : 'N/A' },
            { label: 'Primary Goal', val: client.Goal }
        ];

        const detailsHtml = `
            <div class="detail-grid">
                ${detailsObj.map(d => `
                    <div class="detail-item">
                        <div class="detail-label">${d.label}</div>
                        <div class="detail-val">${d.val}</div>
                    </div>
                `).join('')}
            </div>
        `;

        document.getElementById('modal-client-details').innerHTML = detailsHtml;
        
        // --- Render Weight Timeline ---
        const chartSection = document.getElementById('modal-chart-section');
        const ctx = document.getElementById('client-weight-chart');
        
        if (client.weightHistory && client.weightHistory.length > 0) {
            chartSection.style.display = 'block';
            
            if (window.clientModalChart) {
                window.clientModalChart.destroy();
            }
            
            const labels = client.weightHistory.map(h => h.dateStr);
            const data = client.weightHistory.map(h => h.weight);
            
            // Calculate min/max for better y-axis scaling
            const minWeight = Math.min(...data);
            const maxWeight = Math.max(...data);
            const padding = (maxWeight - minWeight) * 0.2 || 2;
            
            // Theme colors
            const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim() || '#4361ee';
            const primaryLight = primaryColor + '33'; // 20% opacity
            
            window.clientModalChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Weight (kg)',
                        data: data,
                        borderColor: primaryColor,
                        backgroundColor: primaryLight,
                        borderWidth: 2,
                        pointBackgroundColor: '#ffffff',
                        pointBorderColor: primaryColor,
                        pointBorderWidth: 2,
                        pointRadius: 4,
                        pointHoverRadius: 6,
                        fill: true,
                        tension: 0.3 // Smooth curves
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    return context.parsed.y + ' kg';
                                }
                            }
                        }
                    },
                    scales: {
                        y: {
                            min: Math.max(0, minWeight - padding),
                            max: maxWeight + padding,
                            ticks: {
                                stepSize: Math.ceil((padding * 2) / 4) || 1
                            },
                            grid: {
                                color: 'rgba(0,0,0,0.05)'
                            }
                        },
                        x: {
                            grid: { display: false }
                        }
                    }
                }
            });
        } else {
            chartSection.style.display = 'none';
        }

        modal.classList.remove('hidden');
    }

    // --- Prediction Engine Logic ---
    const predClientSelect = document.getElementById('pred-client-select');
    const predTargetWeight = document.getElementById('pred-target-weight');
    const btnAnalyzePrediction = document.getElementById('btn-analyze-prediction');
    
    function populatePredictionDropdown(clients) {
        if (!predClientSelect) return;
        predClientSelect.innerHTML = '<option value="">-- Choose a Client --</option>';
        
        // Sort alphabetically for easy finding
        const sorted = [...clients].sort((a,b) => a.Name.localeCompare(b.Name));
        
        sorted.forEach((c, idx) => {
            const opt = document.createElement('option');
            opt.value = c.Name;
            opt.textContent = `${c.Name} (Curr: ${c.Weight}kg, Goal: ${c.Goal})`;
            // Store reference to the client obj
            opt.dataset.clientStr = JSON.stringify(c);
            predClientSelect.appendChild(opt);
        });
    }

    if (predClientSelect) {
        predClientSelect.addEventListener('change', (e) => {
            const selectedOpt = e.target.selectedOptions[0];
            if (!selectedOpt || !selectedOpt.value) return;
            
            const client = JSON.parse(selectedOpt.dataset.clientStr);
            
            // Suggest a target weight (Healthy BMI = 22)
            const heightInMeters = client.Height / 100;
            const healthyWeight = 22 * (heightInMeters * heightInMeters);
            
            predTargetWeight.value = Math.round(healthyWeight);
        });
    }

    if (btnAnalyzePrediction) {
        btnAnalyzePrediction.addEventListener('click', () => {
            const selectedOpt = predClientSelect.selectedOptions[0];
            if (!selectedOpt || !selectedOpt.value) {
                alert("Please select a client first.");
                return;
            }

            const client = JSON.parse(selectedOpt.dataset.clientStr);
            const targetWeight = parseFloat(predTargetWeight.value);
            const timeframe = parseInt(document.getElementById('pred-timeframe').value);
            const diet = document.getElementById('pred-diet').value;
            const workout = document.getElementById('pred-workout').value;

            if (isNaN(targetWeight) || isNaN(timeframe)) {
                alert("Please enter a valid target weight and timeframe.");
                return;
            }

            const result = window.MGD_Engine.predictGoal(client, diet, workout, targetWeight, timeframe);
            
            if (result) {
                // Update UI
                document.getElementById('pred-placeholder').classList.add('hidden');
                const outContainer = document.getElementById('pred-output');
                outContainer.classList.remove('hidden');
                
                // Animate or set score
                document.getElementById('pred-score-val').textContent = `${result.score}%`;
                document.getElementById('pred-verdict').textContent = result.verdict;
                document.getElementById('pred-verdict').className = result.colorClass;
                
                // Ring color
                const ring = document.getElementById('pred-score-ring');
                if (result.score >= 80) ring.style.borderColor = 'var(--success)';
                else if (result.score >= 50) ring.style.borderColor = 'var(--warning)';
                else ring.style.borderColor = 'var(--danger)';
                
                // Details
                document.getElementById('pred-out-current').textContent = `${client.Weight} kg`;
                document.getElementById('pred-out-req').textContent = `${result.requiredChange} kg`;
            }
        });
    }

    // --- Export & Reset Logic ---
    window.exportToCSV = function() {
        if (!window.LAST_RESULT || !window.LAST_RESULT.clients) {
            alert('No data available to export.');
            return;
        }

        const data = window.LAST_RESULT.clients;
        const csvContent = "data:text/csv;charset=utf-8," 
            + ["Name,Age,Gender,Weight,Height,BMI,BMI_Category,Goal,BodyFat"].join(",") + "\n"
            + data.map(c => [
                `"${c.Name}"`, 
                c.Age, 
                c.Gender, 
                c.Weight, 
                c.Height, 
                c.BMI, 
                c.BMI_Category, 
                `"${c.Goal}"`, 
                c.BodyFat || ''
            ].join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "mgd_cleaned_data.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    window.clearAllData = function() {
        if (confirm("Are you sure you want to clear all data? This will reset the application.")) {
            localStorage.removeItem('mgd_data');
            location.reload();
        }
    };
});
