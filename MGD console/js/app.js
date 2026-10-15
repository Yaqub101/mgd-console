// js/app.js

/**
 * Controller: Manages UI states, events, data binding, audio effects,
 * and the complete Data Storytelling Lab Suite (Practicals 1 to 10).
 */

document.addEventListener('DOMContentLoaded', () => {

    // --- Audio Feedback Manager (Using Assets/downmusic) ---
    class SoundManager {
        constructor() {
            this.enabled = true;
            this.sounds = {
                click: new Audio('Assets/downmusic/set_log.mp3'),
                complete: new Audio('Assets/downmusic/workout_complete.mp3'),
                streak: new Audio('Assets/downmusic/streak.mp3'),
                pr: new Audio('Assets/downmusic/pr.mp3'),
                timer: new Audio('Assets/downmusic/rest_timer_alert.mp3')
            };

            // Preload volume
            Object.values(this.sounds).forEach(audio => {
                audio.volume = 0.6;
            });
        }

        play(soundKey) {
            if (!this.enabled || !this.sounds[soundKey]) return;
            try {
                const s = this.sounds[soundKey];
                s.currentTime = 0;
                s.play().catch(() => {
                    // Browser autoplay policy catch
                });
            } catch (e) {
                // Ignore audio errors
            }
        }

        toggle() {
            this.enabled = !this.enabled;
            return this.enabled;
        }
    }

    const sound = new SoundManager();

    // Toggle Sound Button in Sidebar
    const btnToggleSound = document.getElementById('btn-toggle-sound');
    const soundLabel = document.getElementById('sound-label');
    const soundIcon = document.getElementById('sound-icon');

    if (btnToggleSound) {
        btnToggleSound.addEventListener('click', () => {
            const isEnabled = sound.toggle();
            soundLabel.textContent = isEnabled ? 'Audio: ON' : 'Audio: OFF';
            if (isEnabled) {
                btnToggleSound.classList.add('active');
                if (soundIcon) soundIcon.setAttribute('data-lucide', 'volume-2');
                sound.play('click');
            } else {
                btnToggleSound.classList.remove('active');
                if (soundIcon) soundIcon.setAttribute('data-lucide', 'volume-x');
            }
            lucide.createIcons();
        });
    }

    // --- Older Monitor / High-Contrast Mode Toggle ---
    const btnToggleContrast = document.getElementById('btn-toggle-contrast');
    const contrastLabel = document.getElementById('contrast-label');
    let isHighContrast = localStorage.getItem('mgd_contrast') === 'high';

    function setContrastMode(enable) {
        isHighContrast = enable;
        if (enable) {
            document.documentElement.setAttribute('data-contrast', 'high');
            if (contrastLabel) contrastLabel.textContent = 'Display: High';
            if (btnToggleContrast) btnToggleContrast.classList.add('active');
            localStorage.setItem('mgd_contrast', 'high');
        } else {
            document.documentElement.removeAttribute('data-contrast');
            if (contrastLabel) contrastLabel.textContent = 'Display: Std';
            if (btnToggleContrast) btnToggleContrast.classList.remove('active');
            localStorage.setItem('mgd_contrast', 'std');
        }
    }

    if (isHighContrast) setContrastMode(true);

    if (btnToggleContrast) {
        btnToggleContrast.addEventListener('click', () => {
            sound.play('click');
            setContrastMode(!isHighContrast);
        });
    }

    // --- Main View Navigation Logic ---
    const navItems = document.querySelectorAll('.sidebar-nav .nav-item');
    const views = document.querySelectorAll('.main-content > .view');

    window.switchView = function(targetId) {
        sound.play('click');

        navItems.forEach(item => {
            if (item.dataset.target === targetId) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });

        views.forEach(view => {
            if (view.id === `view-${targetId}`) {
                view.classList.remove('hidden');
            } else {
                view.classList.add('hidden');
            }
        });

        // Trigger chart redraw when switching
        window.dispatchEvent(new Event('resize'));
    };

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            window.switchView(item.dataset.target);
        });
    });

    // Default view
    window.switchView('dashboard');

    // --- File Upload & Sample Loader ---
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('csv-file-input');
    const statusMsg = document.getElementById('upload-status');
    const btnLoadSample = document.getElementById('btn-load-sample');

    if (dropZone && fileInput) {
        dropZone.addEventListener('click', (e) => {
            if (e.target.tagName !== 'BUTTON' && e.target.tagName !== 'INPUT') {
                fileInput.click();
            }
        });
        const browseBtn = dropZone.querySelector('button');
        if (browseBtn) {
            browseBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                fileInput.click();
            });
        }

        ['dragover', 'dragenter'].forEach(ev => {
            dropZone.addEventListener(ev, (evt) => {
                evt.preventDefault();
                dropZone.classList.add('dragover');
            });
        });

        ['dragleave', 'dragend', 'drop'].forEach(ev => {
            dropZone.addEventListener(ev, (evt) => {
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
    }

    if (btnLoadSample) {
        btnLoadSample.addEventListener('click', async () => {
            showStatus('Loading perfect sample dataset with time-series...', 'info');
            try {
                const resp = await fetch('data/perfect_sample.csv');
                if (!resp.ok) throw new Error("Could not find data/perfect_sample.csv");
                const text = await resp.text();
                const resultState = await window.MGD_Engine.processCSVText(text);
                handleProcessedResult(resultState, "Loaded perfect_sample.csv successfully!");
                sound.play('complete');
            } catch (err) {
                showStatus(err.message, 'error');
            }
        });
    }

    async function handleFile(file) {
        if (!file.name.endsWith('.csv')) {
            showStatus('Error: Please upload a .csv file', 'error');
            return;
        }

        showStatus('Processing dataset & running cleaning pipeline...', 'info');

        try {
            const resultState = await window.MGD_Engine.processCSV(file);
            handleProcessedResult(resultState, `Success! Processed ${resultState.clients.length} active athletes.`);
            sound.play('complete');
        } catch (error) {
            showStatus(error.message, 'error');
        }
    }

    function handleProcessedResult(resultState, message) {
        showStatus(message, 'success');
        window.LAST_RESULT = resultState;
        try {
            localStorage.setItem('mgd_data', JSON.stringify(resultState));
        } catch (e) {
            console.warn("Storage quota exceeded", e);
        }

        updateReviewSummary(resultState.summary);
        updateDashboard(resultState.metrics, resultState.insights);
        updateClientTable(resultState.clients);
        populatePredictionDropdown(resultState.clients);
        updatePracticals(resultState);
    }

    function showStatus(msg, type) {
        if (!statusMsg) return;
        statusMsg.textContent = msg;
        statusMsg.className = `status-message ${type}`;
        statusMsg.classList.remove('hidden');
    }

    function updateReviewSummary(summary) {
        const rawEl = document.getElementById('stat-total-raw');
        if (rawEl) rawEl.textContent = summary.totalRaw;
        const dupEl = document.getElementById('stat-duplicates');
        if (dupEl) dupEl.textContent = summary.duplicatesRemoved;
        const outEl = document.getElementById('stat-outliers');
        if (outEl) outEl.textContent = summary.outliersCorrected;
        const missEl = document.getElementById('stat-missing');
        if (missEl) missEl.textContent = summary.missingGoalsFilled;

        const revContainer = document.getElementById('cleaning-review');
        if (revContainer) revContainer.classList.remove('hidden');
        lucide.createIcons();
    }

    const btnApproveDashboard = document.getElementById('btn-approve-dashboard');
    if (btnApproveDashboard) {
        btnApproveDashboard.addEventListener('click', () => {
            sound.play('click');
            window.switchView('dashboard');
        });
    }

    // --- UI Update Dashboard Logic ---
    function updateDashboard(metrics, insights) {
        if (!metrics) return;

        const cTotal = document.getElementById('metric-total-clients');
        if (cTotal) cTotal.textContent = metrics.totalClients || 0;
        const cBMI = document.getElementById('metric-avg-bmi');
        if (cBMI) cBMI.textContent = metrics.avgBMI || 0;
        const cWeight = document.getElementById('metric-avg-weight');
        if (cWeight) cWeight.textContent = `${metrics.avgWeight || 0} kg`;
        const cGoal = document.getElementById('metric-common-goal');
        if (cGoal) cGoal.textContent = metrics.mostCommonGoal || '--';

        if (metrics.totalClients > 0 && window.ChartRenderEngine) {
            window.ChartRenderEngine.renderAll(metrics);
        }

        const insightsList = document.getElementById('insights-list');
        if (insightsList && insights) {
            insightsList.innerHTML = '';
            insights.forEach(insight => {
                const el = document.createElement('div');
                el.className = 'insight-item';

                let icon = 'info';
                if (insight.type === 'warning') icon = 'alert-triangle';
                if (insight.type === 'danger') icon = 'alert-circle';
                if (insight.type === 'success') icon = 'check-circle';

                el.innerHTML = `<i data-lucide="${icon}" class="text-${insight.type}"></i> <span>${insight.text}</span>`;
                insightsList.appendChild(el);
            });
            lucide.createIcons();
        }
    }

    function getBadgeClass(category) {
        if (category === 'Healthy') return 'badge-success';
        if (category === 'Overweight' || category === 'Obese') return 'badge-danger';
        return 'badge-warning';
    }

    function updateClientTable(clients) {
        const tbody = document.getElementById('client-table-body');
        if (!tbody || !clients) return;
        tbody.innerHTML = '';

        clients.forEach((client, idx) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><span class="client-name-cell" data-idx="${idx}">${client.Name}</span></td>
                <td>${client.Age}</td>
                <td>${client.Gender}</td>
                <td>${typeof client.Weight === 'number' ? client.Weight.toFixed(1) : client.Weight}</td>
                <td>${client.Height}</td>
                <td>${client.BMI}</td>
                <td><span class="badge ${getBadgeClass(client.BMI_Category)}">${client.BMI_Category}</span></td>
                <td>${client.Goal}</td>
            `;
            tbody.appendChild(tr);
        });

        tbody.querySelectorAll('.client-name-cell').forEach(cell => {
            cell.addEventListener('click', (e) => {
                sound.play('click');
                const idx = e.target.getAttribute('data-idx');
                showClientDetail(clients[idx]);
            });
        });
    }

    // --- DAA Client Filtering & Searching (Merge Sort + Binary Search) ---
    const searchInput = document.getElementById('client-search');
    const sortSelect = document.getElementById('client-sort');
    const filterBmi = document.getElementById('filter-bmi');
    const filterGoal = document.getElementById('filter-goal');
    const searchIndicator = document.getElementById('search-indicator');

    function applyDaaFilters() {
        if (!window.LAST_RESULT || !window.LAST_RESULT.clients) return;

        let processedClients = [...window.LAST_RESULT.clients];
        const bmiVal = filterBmi ? filterBmi.value : 'All';
        const goalVal = filterGoal ? filterGoal.value : 'All';

        if (bmiVal !== 'All') {
            processedClients = processedClients.filter(c => c.BMI_Category === bmiVal);
        }
        if (goalVal !== 'All') {
            processedClients = processedClients.filter(c => c.Goal === goalVal);
        }

        const sortKey = sortSelect ? sortSelect.value : 'Name';
        const searchTerm = searchInput ? searchInput.value.trim() : '';

        // Merge Sort
        processedClients = window.MGD_Engine.mergeSort(processedClients, sortKey, true);

        // Binary Search
        if (searchTerm) {
            if (searchIndicator) searchIndicator.style.display = 'block';
            if (sortKey !== 'Name') {
                processedClients = window.MGD_Engine.mergeSort(processedClients, 'Name', true);
            }
            processedClients = window.MGD_Engine.binarySearch(processedClients, 'Name', searchTerm);
            if (sortKey !== 'Name') {
                processedClients = window.MGD_Engine.mergeSort(processedClients, sortKey, true);
            }
        } else {
            if (searchIndicator) searchIndicator.style.display = 'none';
        }

        updateClientTable(processedClients);
    }

    if (searchInput) searchInput.addEventListener('input', applyDaaFilters);
    if (sortSelect) sortSelect.addEventListener('change', applyDaaFilters);
    if (filterBmi) filterBmi.addEventListener('change', applyDaaFilters);
    if (filterGoal) filterGoal.addEventListener('change', applyDaaFilters);

    // --- Athlete Modal Details ---
    const modal = document.getElementById('client-modal');
    const closeBtn = document.getElementById('close-modal');

    if (closeBtn) closeBtn.addEventListener('click', () => modal.classList.add('hidden'));
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.classList.add('hidden');
        });
    }

    function showClientDetail(client) {
        if (!client) return;
        document.getElementById('modal-client-name').textContent = `${client.Name}'s Athletic Dossier`;

        const detailsObj = [
            { label: 'Chronological Age', val: `${client.Age} yrs` },
            { label: 'Gender Category', val: client.Gender },
            { label: 'Current Weight', val: `${typeof client.Weight === 'number' ? client.Weight.toFixed(1) : client.Weight} kg` },
            { label: 'Stature / Height', val: `${client.Height} cm` },
            { label: 'Calculated BMI', val: `${client.BMI}` },
            { label: 'WHO Classification', val: `<span class="badge ${getBadgeClass(client.BMI_Category)}">${client.BMI_Category}</span>` },
            { label: 'Est. Basal Metabolic Rate', val: `${client.EstimatedBMR || Math.round(client.Weight * 24)} kcal/day` },
            { label: 'Primary Ambition', val: client.Goal }
        ];

        document.getElementById('modal-client-details').innerHTML = `
            <div class="detail-grid">
                ${detailsObj.map(d => `
                    <div class="detail-item">
                        <div class="detail-label">${d.label}</div>
                        <div class="detail-val">${d.val}</div>
                    </div>
                `).join('')}
            </div>
        `;

        const chartSection = document.getElementById('modal-chart-section');
        const ctx = document.getElementById('client-weight-chart');

        if (client.weightHistory && client.weightHistory.length > 0 && ctx) {
            chartSection.style.display = 'block';
            if (window.clientModalChart) window.clientModalChart.destroy();

            const labels = client.weightHistory.map(h => h.dateStr);
            const data = client.weightHistory.map(h => h.weight);

            window.clientModalChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Weight Progression (kg)',
                        data: data,
                        borderColor: '#15803d',
                        backgroundColor: 'rgba(21, 128, 61, 0.15)',
                        borderWidth: 2.5,
                        pointBackgroundColor: '#ffffff',
                        pointBorderColor: '#14532d',
                        pointBorderWidth: 2,
                        pointRadius: 5,
                        fill: true,
                        tension: 0.25
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                        y: {
                            title: { display: true, text: 'Weight (kg)', font: { weight: 700 } },
                            grid: { color: '#cbd5e1' }
                        },
                        x: { grid: { display: false } }
                    }
                }
            });
        } else if (chartSection) {
            chartSection.style.display = 'none';
        }

        modal.classList.remove('hidden');
    }

    // --- Goal Prediction Engine Logic ---
    const predClientSelect = document.getElementById('pred-client-select');
    const predTargetWeight = document.getElementById('pred-target-weight');
    const btnAnalyzePrediction = document.getElementById('btn-analyze-prediction');

    function populatePredictionDropdown(clients) {
        if (!predClientSelect || !clients) return;
        predClientSelect.innerHTML = '<option value="">-- Choose an Athlete --</option>';

        const sorted = [...clients].sort((a,b) => a.Name.localeCompare(b.Name));
        sorted.forEach(c => {
            const opt = document.createElement('option');
            opt.value = c.Name;
            opt.textContent = `${c.Name} (Curr: ${c.Weight}kg, Goal: ${c.Goal})`;
            opt.dataset.clientStr = JSON.stringify(c);
            predClientSelect.appendChild(opt);
        });
    }

    if (predClientSelect) {
        predClientSelect.addEventListener('change', (e) => {
            const selectedOpt = e.target.selectedOptions[0];
            if (!selectedOpt || !selectedOpt.value) return;

            const client = JSON.parse(selectedOpt.dataset.clientStr);
            const heightInMeters = client.Height / 100;
            const targetBMI = client.Goal === 'Muscle Gain' ? 24 : 22;
            predTargetWeight.value = Math.round(targetBMI * (heightInMeters * heightInMeters));
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
                document.getElementById('pred-placeholder').classList.add('hidden');
                document.getElementById('pred-output').classList.remove('hidden');

                document.getElementById('pred-score-val').textContent = `${result.score}%`;
                document.getElementById('pred-verdict').textContent = result.verdict;
                document.getElementById('pred-verdict').className = result.colorClass;

                const ring = document.getElementById('pred-score-ring');
                if (result.score >= 80) {
                    ring.style.borderColor = 'var(--success)';
                    sound.play('pr'); // Celebration fanfare!
                } else if (result.score >= 50) {
                    ring.style.borderColor = 'var(--warning)';
                    sound.play('click');
                } else {
                    ring.style.borderColor = 'var(--danger)';
                    sound.play('click');
                }

                document.getElementById('pred-out-current').textContent = `${client.Weight} kg`;
                document.getElementById('pred-out-req').textContent = `${result.requiredChange} kg/week`;
            }
        });
    }

    // =========================================================================
    // LAB PRACTICALS SUITE CONTROLLER (Practicals 1 through 10)
    // =========================================================================

    const practicalNavBtns = document.querySelectorAll('.practical-tab-btn');
    const practicalSections = document.querySelectorAll('.practical-section');

    practicalNavBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            sound.play('click');
            const targetP = btn.dataset.ptarget;

            practicalNavBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            practicalSections.forEach(sec => {
                if (sec.id === `psection-${targetP}`) {
                    sec.classList.remove('hidden');
                } else {
                    sec.classList.add('hidden');
                }
            });

            window.dispatchEvent(new Event('resize'));
        });
    });

    function updatePracticals(resultState) {
        if (!resultState || !resultState.clients.length) return;

        // P1: Stake & Big Idea
        const blueprint = window.MGD_Engine.generateStoryBlueprint();
        const p1Ben = document.getElementById('p1-benefits');
        if (p1Ben) p1Ben.textContent = blueprint.stake.benefits;
        const p1Risk = document.getElementById('p1-risks');
        if (p1Risk) p1Risk.textContent = blueprint.stake.risks;
        const p1Idea = document.getElementById('p1-bigidea');
        if (p1Idea) p1Idea.textContent = `"${blueprint.bigIdea}"`;

        // P2: Audience & Tone
        setupP2AudienceTone();

        // P3: Clutter Elimination
        if (window.ChartRenderEngine) {
            window.ChartRenderEngine.renderClutterComparison('cluttered-demo-chart', 'clean-demo-chart', resultState.metrics.bmiCategories);
        }

        // P4: Incident Data Story
        setupP4IncidentStory();

        // P5: Video Presentation Script & Narration
        setupP5VideoPrompter();

        // P6: MyGymDiary Wrapped
        setupP6Wrapped(resultState.clients);

        // P7: Dataset Profiling Matrix & IQR
        setupP7DataProfiling();

        // P8: Dynamic Histogram with Slider
        setupP8DynamicHistogram();

        // P9: Comparative Box Plot & Multi-distribution
        setupP9ComparativeDistributions();

        // P10: Proportional Pie vs. Bar Arena
        setupP10ProportionalArena();
    }

    // P1 Copy Button
    const btnCopyBigIdea = document.getElementById('btn-copy-bigidea');
    if (btnCopyBigIdea) {
        btnCopyBigIdea.addEventListener('click', () => {
            const text = document.getElementById('p1-bigidea').textContent;
            navigator.clipboard.writeText(text);
            sound.play('click');
            btnCopyBigIdea.innerHTML = '<i data-lucide="check"></i> Copied!';
            lucide.createIcons();
            setTimeout(() => {
                btnCopyBigIdea.innerHTML = '<i data-lucide="copy"></i> Copy';
                lucide.createIcons();
            }, 2000);
        });
    }

    // P2 Audience & Tone Controller
    function setupP2AudienceTone() {
        const audSelect = document.getElementById('p2-audience-select');
        const toneSelect = document.getElementById('p2-tone-select');

        function refreshP2() {
            if (!audSelect || !toneSelect) return;
            const aud = audSelect.value;
            const tone = toneSelect.value;
            const analysis = window.MGD_Engine.getAudienceToneAnalysis(aud, tone);

            document.getElementById('p2-profile-title').textContent = `${analysis.profile.audienceName} Adaption`;
            document.getElementById('p2-takeaway').textContent = analysis.profile.keyTakeaway;
            document.getElementById('p2-rec-visual').innerHTML = `<strong>Best Mechanism:</strong> ${analysis.profile.recommendedVisual}`;
            document.getElementById('p2-tone-label').innerHTML = `<strong>Tone Guideline:</strong> ${analysis.toneDescription}`;
        }

        if (audSelect) audSelect.addEventListener('change', () => { sound.play('click'); refreshP2(); });
        if (toneSelect) toneSelect.addEventListener('change', () => { sound.play('click'); refreshP2(); });
        refreshP2();
    }

    // P4 Incident Story
    function setupP4IncidentStory() {
        const incident = window.MGD_Engine.getIncidentDataStory();
        const titleEl = document.getElementById('p4-incident-title');
        if (titleEl) titleEl.textContent = incident.title;
        const descEl = document.getElementById('p4-incident-desc');
        if (descEl) descEl.textContent = incident.incidentContext;

        if (window.ChartRenderEngine) {
            window.ChartRenderEngine.renderIncidentTimeline('incident-timeline-chart');
        }

        const obsContainer = document.getElementById('p4-observations');
        if (obsContainer) {
            obsContainer.innerHTML = incident.observations.map(obs => `
                <div class="card" style="padding: var(--space-2); background: var(--bg-card-subtle);">
                    <h5 style="color: var(--primary-dark); font-size: 0.85rem;"><i data-lucide="search" style="width: 14px; height: 14px;"></i> ${obs.observation}</h5>
                    <p style="font-size: 0.82rem; color: var(--text-secondary); margin-top: 4px;">${obs.finding}</p>
                </div>
            `).join('');
            lucide.createIcons();
        }
    }

    // P5 Video Script & Narration Prompter
    let narrationUtterance = null;
    let presentationTimerInterval = null;

    function setupP5VideoPrompter() {
        const scripts = window.MGD_Engine.generateVideoPresentationScript();
        const container = document.getElementById('p5-script-container');
        if (!container) return;

        container.innerHTML = scripts.map(s => `
            <div class="card" style="padding: var(--space-3); border-left: 5px solid var(--primary);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                    <h4 style="color: var(--primary-dark); font-size: 0.95rem;">${s.part}</h4>
                    <span class="badge badge-info">Target Time: ${s.durationSec}s</span>
                </div>
                <p style="font-size: 0.9rem; line-height: 1.5; color: var(--text-primary); margin-bottom: 8px;">"${s.script}"</p>
                <div style="font-size: 0.78rem; font-weight: 700; color: var(--text-muted); background: var(--bg-card-subtle); padding: 4px 8px; border-radius: var(--radius-sm);">
                    <i data-lucide="monitor" style="width: 12px; height: 12px;"></i> Visual Cue: ${s.visualCue}
                </div>
            </div>
        `).join('');
        lucide.createIcons();

        const btnNarrate = document.getElementById('btn-narrate-story');
        const btnStop = document.getElementById('btn-stop-narration');
        const timerEl = document.getElementById('presentation-timer');

        if (btnNarrate) {
            btnNarrate.onclick = () => {
                if ('speechSynthesis' in window) {
                    window.speechSynthesis.cancel();
                    sound.play('timer');

                    let elapsed = 0;
                    clearInterval(presentationTimerInterval);
                    presentationTimerInterval = setInterval(() => {
                        elapsed++;
                        const mins = String(Math.floor(elapsed / 60)).padStart(2, '0');
                        const secs = String(elapsed % 60).padStart(2, '0');
                        if (timerEl) timerEl.textContent = `${mins}:${secs}`;
                    }, 1000);

                    const fullScript = scripts.map(s => s.script).join(' ... ');
                    narrationUtterance = new SpeechSynthesisUtterance(fullScript);
                    narrationUtterance.rate = 0.95;
                    narrationUtterance.onend = () => {
                        clearInterval(presentationTimerInterval);
                        sound.play('complete');
                    };
                    window.speechSynthesis.speak(narrationUtterance);
                } else {
                    alert("Speech synthesis is not supported in this browser.");
                }
            };
        }

        if (btnStop) {
            btnStop.onclick = () => {
                if ('speechSynthesis' in window) window.speechSynthesis.cancel();
                clearInterval(presentationTimerInterval);
                if (timerEl) timerEl.textContent = '00:00';
            };
        }
    }

    // P6 Gym Wrapped (Spotify-Style Personalized Storytelling)
    function setupP6Wrapped(clients) {
        const select = document.getElementById('wrapped-client-select');
        const output = document.getElementById('wrapped-output-container');
        if (!select || !output || !clients.length) return;

        select.innerHTML = '';
        clients.forEach(c => {
            const opt = document.createElement('option');
            opt.value = c.Name;
            opt.textContent = `${c.Name} (${c.Goal})`;
            select.appendChild(opt);
        });

        function renderWrapped(clientName) {
            const wrapped = window.MGD_Engine.generateGymWrapped(clientName);
            if (!wrapped) return;

            sound.play('streak'); // Celebration music!

            output.innerHTML = `
                <div class="wrapped-card highlight">
                    <div class="wrapped-badge">${wrapped.personaEmoji}</div>
                    <div style="font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.08em; color: #86efac; font-weight: 700;">
                        MyGymDiary Wrapped • Personal Athletic Persona
                    </div>
                    <div class="wrapped-persona">${wrapped.persona}</div>
                    <p style="font-size: 0.9rem; color: #f0fdf4; margin-bottom: var(--space-3);">${wrapped.personaDesc}</p>

                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; margin-top: 14px;">
                        ${wrapped.stats.map(s => `
                            <div style="background: rgba(0, 0, 0, 0.35); padding: 10px; border-radius: var(--radius-md); border: 1px solid rgba(255, 255, 255, 0.1);">
                                <div style="font-size: 0.74rem; color: #cbd5e1; text-transform: uppercase;">${s.label}</div>
                                <div style="font-size: 1.15rem; font-weight: 800; color: #ffffff; margin-top: 2px;">${s.value}</div>
                            </div>
                        `).join('')}
                    </div>

                    <div style="margin-top: 16px; display: flex; justify-content: flex-end;">
                        <button class="primary-button" style="background: #22c55e; color: #052e16; font-weight: 800; border: none;" onclick="window.print()">
                            <i data-lucide="share-2"></i> Print / Share Wrapped Story Card
                        </button>
                    </div>
                </div>
            `;
            lucide.createIcons();
        }

        select.onchange = (e) => renderWrapped(e.target.value);
        renderWrapped(clients[0].Name);
    }

    // P7 Data Profiling & Quality
    function setupP7DataProfiling() {
        const prof = window.MGD_Engine.getDatasetProfile();
        if (!prof) return;

        if (window.ChartRenderEngine) {
            window.ChartRenderEngine.renderDataProfileMatrix('profile-matrix-chart', prof.profiling);
        }

        const outContainer = document.getElementById('p7-outlier-stats');
        if (outContainer) {
            outContainer.innerHTML = `
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 10px;">
                    <div><strong>Q1 (25th Percentile):</strong> ${prof.outliers.q1} kg</div>
                    <div><strong>Q3 (75th Percentile):</strong> ${prof.outliers.q3} kg</div>
                    <div><strong>Interquartile Range:</strong> ${prof.outliers.iqr} kg</div>
                    <div><strong>Outlier Thresholds:</strong> [${prof.outliers.lowerFence} - ${prof.outliers.upperFence}] kg</div>
                </div>
                <div style="padding: 8px; background: var(--bg-main); border-radius: var(--radius-sm); border: 1.5px solid var(--border-color);">
                    <span class="badge ${prof.outliers.detectedOutliers === 0 ? 'badge-success' : 'badge-warning'}">
                        ${prof.outliers.detectedOutliers} Outliers Detected
                    </span>
                    <span style="margin-left: 8px; font-weight: 700;">Data Health Score: ${prof.dataQualityScore}/100</span>
                </div>
            `;
        }
    }

    // P8 Dynamic Histogram with Live Slider
    function setupP8DynamicHistogram() {
        const varSelect = document.getElementById('p8-variable-select');
        const slider = document.getElementById('p8-bin-slider');
        const binVal = document.getElementById('p8-bin-val');
        const statsGrid = document.getElementById('p8-stats-grid');
        if (!varSelect || !slider || !window.ChartRenderEngine) return;

        function refreshP8() {
            const field = varSelect.value;
            const bins = parseInt(slider.value);
            if (binVal) binVal.textContent = bins;

            const distData = window.MGD_Engine.calculateSingleDistribution(field, bins);
            if (!distData) return;

            window.ChartRenderEngine.renderDynamicHistogram('p8-dynamic-histogram', distData);

            if (statsGrid) {
                statsGrid.innerHTML = `
                    <div class="metric-card">
                        <div class="metric-title">Mean (Average)</div>
                        <div class="metric-value" style="font-size: 1.6rem;">${distData.stats.mean}</div>
                        <div class="metric-subtitle">Range: [${distData.stats.min} - ${distData.stats.max}]</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-title">Median (50th %ile)</div>
                        <div class="metric-value" style="font-size: 1.6rem;">${distData.stats.median}</div>
                        <div class="metric-subtitle">Robust central tendency</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-title">Standard Deviation</div>
                        <div class="metric-value" style="font-size: 1.6rem;">${distData.stats.stdDev}</div>
                        <div class="metric-subtitle">Variance: ${distData.stats.variance}</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-title">Pearson Skewness</div>
                        <div class="metric-value" style="font-size: 1.6rem;">${distData.stats.skewness}</div>
                        <div class="metric-subtitle" style="font-weight: 700; color: var(--primary-dark);">${distData.stats.skewType}</div>
                    </div>
                `;
            }
        }

        varSelect.onchange = () => { sound.play('click'); refreshP8(); };
        slider.oninput = refreshP8;
        refreshP8();
    }

    // P9 Comparative Multi-Distribution
    function setupP9ComparativeDistributions() {
        const comp = window.MGD_Engine.calculateComparativeDistributions();
        if (!comp || !window.ChartRenderEngine) return;

        window.ChartRenderEngine.renderComparativeGrouped('p9-grouped-chart', comp);
        window.ChartRenderEngine.renderBoxPlotSummary('p9-boxplot-chart', comp.boxPlotSummaries);
    }

    // P10 Proportional Arena (Pie vs Bar)
    function setupP10ProportionalArena() {
        const fieldSelect = document.getElementById('p10-field-select');
        const insightEl = document.getElementById('p10-cognitive-insight');
        if (!fieldSelect || !window.ChartRenderEngine) return;

        function refreshP10() {
            const field = fieldSelect.value;
            const propData = window.MGD_Engine.calculateProportionalAnalysis(field);
            if (!propData) return;

            window.ChartRenderEngine.renderPieVsBarComparison('p10-pie-chart', 'p10-bar-chart', propData);
            if (insightEl) insightEl.textContent = propData.comparisonInsights;
        }

        fieldSelect.onchange = () => { sound.play('click'); refreshP10(); };
        refreshP10();
    }

    // --- Export CSV Logic ---
    window.exportToCSV = function() {
        sound.play('click');
        if (!window.LAST_RESULT || !window.LAST_RESULT.clients) {
            alert('No data available to export. Please upload or load a dataset first.');
            return;
        }

        const data = window.LAST_RESULT.clients;
        const csvContent = "data:text/csv;charset=utf-8," 
            + ["Name,Age,Gender,Weight,Height,BMI,BMI_Category,Goal,BodyFat"].join(",") + "\n"
            + data.map(c => [
                `"${c.Name}"`, 
                c.Age, 
                c.Gender, 
                typeof c.Weight === 'number' ? c.Weight.toFixed(1) : c.Weight, 
                c.Height, 
                c.BMI, 
                c.BMI_Category, 
                `"${c.Goal}"`, 
                c.BodyFat || ''
            ].join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "mygymdiary_cleaned_data.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        sound.play('complete');
    };

    window.clearAllData = function() {
        if (confirm("Are you sure you want to clear all data? This will reset the application state.")) {
            sound.play('click');
            localStorage.removeItem('mgd_data');
            location.reload();
        }
    };

    // --- Local Storage Auto-Hydration with Schema Version Invalidation ---
    const CURRENT_SCHEMA_VER = 'v2.5_storytelling_suite';
    if (localStorage.getItem('mgd_schema_version') !== CURRENT_SCHEMA_VER) {
        localStorage.removeItem('mgd_data');
        localStorage.setItem('mgd_schema_version', CURRENT_SCHEMA_VER);
    }

    const savedData = localStorage.getItem('mgd_data');
    if (savedData) {
        try {
            window.LAST_RESULT = JSON.parse(savedData);
            if (window.LAST_RESULT && window.LAST_RESULT.clients) {
                window.LAST_RESULT.clients.forEach(c => {
                    c.Date = new Date(c.Date);
                    if (c.weightHistory) {
                        c.weightHistory.forEach(h => h.date = new Date(h.date));
                    }
                });
            }
            updateDashboard(window.LAST_RESULT.metrics, window.LAST_RESULT.insights);
            updateClientTable(window.LAST_RESULT.clients);
            populatePredictionDropdown(window.LAST_RESULT.clients);
            updatePracticals(window.LAST_RESULT);
            window.switchView('dashboard');
        } catch (e) {
            console.error("Failed to re-hydrate saved data", e);
            localStorage.removeItem('mgd_data');
        }
    } else {
        // Automatically load perfect sample if no data yet for instantaneous demonstration
        if (btnLoadSample) {
            btnLoadSample.click();
        }
    }

    lucide.createIcons();
});
