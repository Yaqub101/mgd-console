// js/engine.js

/**
 * Processing Engine for MGD Console
 * Stateless, in-memory processing.
 */

class AnalyticsEngine {
    constructor() {
        this.rawData = [];
        this.processedData = [];
        this.metrics = {};
        this.insights = [];
        this.requiredColumns = ['Name', 'Age', 'Gender', 'Weight', 'Height', 'Goal'];
        this.summary = {
            totalRaw: 0,
            duplicatesRemoved: 0,
            outliersCorrected: 0,
            missingGoalsFilled: 0
        };
    }

    /**
     * 1. CSV Validation & Parsing
     */
    async processCSV(file) {
        return new Promise((resolve, reject) => {
            Papa.parse(file, {
                header: true,
                skipEmptyLines: true,
                complete: (results) => {
                    if (results.errors.length && results.data.length === 0) {
                        return reject(new Error("Failed to parse CSV file."));
                    }

                    const headers = results.meta.fields;
                    const missingCols = this.requiredColumns.filter(col => !headers.includes(col));

                    if (missingCols.length > 0) {
                        return reject(new Error(`Missing required columns: ${missingCols.join(', ')}`));
                    }

                    this.rawData = results.data;
                    this.summary.totalRaw = results.data.length;
                    this.executePipeline();
                    resolve(this.getState());
                }
            });
        });
    }

    /**
     * Data Flow Pipeline Execution
     */
    executePipeline() {
        this.resetSummary();
        this.cleanData();
        this.deduplicate();
        this.calculateFeatures();
        this.calculateMetrics();
        this.generateInsights();
    }

    resetSummary() {
        this.summary = {
            totalRaw: this.rawData.length,
            duplicatesRemoved: 0,
            outliersCorrected: 0,
            missingGoalsFilled: 0
        };
    }

    /**
     * 2. Data Cleaning
     */
    cleanData() {
        this.processedData = this.rawData.filter(row => {
            // Remove rows missing absolutely critical values
            return row.Name && row.Name.trim() !== '';
        }).map(row => {
            // Trim and standardize
            let goal = row.Goal ? row.Goal.trim() : '';
            if (!goal) {
                goal = 'General Fitness'; // Default
                this.summary.missingGoalsFilled++;
            }

            let parsedDate = new Date();
            if (row.Date && row.Date.trim() !== '') {
                const d = new Date(row.Date);
                if (!isNaN(d.valueOf())) {
                    parsedDate = d;
                }
            }

            const cleaned = {
                Name: row.Name.trim(),
                Date: parsedDate,
                Age: this.handleNumeric(row.Age, 18, 100, 'Age'),
                Gender: this.standardizeGender(row.Gender || 'Other'),
                Weight: this.handleNumeric(row.Weight, 30, 300, 'Weight'),
                Height: this.handleNumeric(row.Height, 50, 250, 'Height'),
                Goal: this.standardizeGoal(goal),
                BodyFat: row.BodyFat && row.BodyFat.trim() !== '' ? this.handleNumeric(row.BodyFat, 2, 60, 'BodyFat') : null
            };
            return cleaned;
        });
    }

    handleNumeric(val, min, max, label) {
        let num = parseFloat(val);
        if (isNaN(num)) return min; // Default to min for safety

        if (num < min || num > max) {
            this.summary.outliersCorrected++;
            return num < min ? min : max;
        }
        return num;
    }

    deduplicate() {
        const clientGroups = new Map();

        this.processedData.forEach(item => {
            // Group primarily by Name (case-insensitive) for tracking history
            const key = item.Name.toLowerCase();

            if (!clientGroups.has(key)) {
                // First time seeing client, initialize
                clientGroups.set(key, {
                    ...item,
                    weightHistory: [{ date: item.Date, weight: item.Weight }]
                });
            } else {
                // Existing client, append to history
                const client = clientGroups.get(key);
                client.weightHistory.push({ date: item.Date, weight: item.Weight });

                // Keep the most recent data as the main record based on Date
                if (item.Date > client.Date) {
                    client.Age = item.Age;
                    client.Weight = item.Weight;
                    client.Height = item.Height;
                    client.Goal = item.Goal;
                    client.BodyFat = item.BodyFat;
                    client.Date = item.Date;
                }
            }
        });

        // Convert grouped data back to array
        const groupedData = Array.from(clientGroups.values());

        // Prepare simulation engine for historical data (if only 1 record)
        groupedData.forEach(client => {
            // Sort history ascending by date
            client.weightHistory.sort((a, b) => a.date - b.date);

            // Format dates for display
            client.weightHistory = client.weightHistory.map(h => ({
                ...h,
                dateStr: h.date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
            }));
        });

        const initialCount = this.processedData.length;
        this.processedData = groupedData;

        // "duplicatesRemoved" now reflects rows grouped into existing clients
        this.summary.duplicatesRemoved = initialCount - this.processedData.length;
    }

    standardizeGoal(goal) {
        const g = goal.toLowerCase();
        if (g.includes('fat') || g.includes('weight loss')) return 'Weight Loss';
        if (g.includes('muscle') || g.includes('gain') || g.includes('bulk')) return 'Muscle Gain';
        if (g.includes('sport') || g.includes('performance')) return 'Performance';
        if (g.includes('maintain') || g.includes('health')) return 'Maintenance';
        return goal; // Return original if no match
    }

    standardizeGender(genderStr) {
        const g = genderStr.trim().toLowerCase();
        if (g.startsWith('m')) return 'Male';
        if (g.startsWith('f')) return 'Female';
        return 'Other'; // Fallback
    }

    /**
     * 3. Feature Engineering
     */
    calculateFeatures() {
        this.processedData = this.processedData.map(client => {
            // BMI = Weight(kg) / (Height(m))^2
            const heightInMeters = client.Height / 100;
            const bmi = client.Weight / (heightInMeters * heightInMeters);

            client.BMI = parseFloat(bmi.toFixed(2));
            client.BMI_Category = this.classifyBMI(client.BMI);

            return client;
        });
    }

    classifyBMI(bmi) {
        if (bmi < 18.5) return 'Underweight';
        if (bmi >= 18.5 && bmi < 25) return 'Healthy';
        if (bmi >= 25) return 'Overweight';
        return 'Unknown';
    }

    /**
     * 4. Dashboard Metrics Aggregation
     */
    calculateMetrics() {
        const total = this.processedData.length;
        if (total === 0) return;

        let maleCount = 0;
        let femaleCount = 0;
        let totalWeight = 0;
        let totalBMI = 0;
        const goalCounts = {};

        this.processedData.forEach(c => {
            if (c.Gender === 'Male') maleCount++;
            if (c.Gender === 'Female') femaleCount++;

            totalWeight += c.Weight;
            totalBMI += c.BMI;

            goalCounts[c.Goal] = (goalCounts[c.Goal] || 0) + 1;
        });

        // Find most common goal
        let mostCommonGoal = '--';
        let maxGoalCount = 0;
        for (const [goal, count] of Object.entries(goalCounts)) {
            if (count > maxGoalCount) {
                mostCommonGoal = goal;
                maxGoalCount = count;
            }
        }

        this.metrics = {
            totalClients: total,
            maleCount,
            femaleCount,
            avgWeight: (totalWeight / total).toFixed(1),
            avgBMI: (totalBMI / total).toFixed(1),
            mostCommonGoal,
            goalCounts,
            bmiCategories: this.aggregateCategories('BMI_Category'),
            weightDistribution: this.createHistogramData('Weight', 10),
            ageDistribution: this.createHistogramData('Age', 10),
            scatterData: this.processedData.map(c => ({ x: c.Height, y: c.Weight, client: c.Name })),
            cleaningSummary: this.summary
        };
    }

    aggregateCategories(field) {
        const counts = {};
        this.processedData.forEach(c => {
            counts[c[field]] = (counts[c[field]] || 0) + 1;
        });
        return counts;
    }

    createHistogramData(field, binSize) {
        const bins = {};
        this.processedData.forEach(c => {
            const val = c[field];
            const binStart = Math.floor(val / binSize) * binSize;
            const binLabel = `${binStart}-${binStart + binSize - 1}`;
            bins[binLabel] = (bins[binLabel] || 0) + 1;
        });
        return bins;
    }

    /**
     * 8. Insight Engine (Rule-Based)
     */
    generateInsights() {
        this.insights = [];
        const total = this.metrics.totalClients;
        if (total === 0) return;

        // Rule 1: Overweight > 50%
        const overweightCount = this.metrics.bmiCategories['Overweight'] || 0;
        if ((overweightCount / total) > 0.5) {
            this.insights.push({
                type: 'warning',
                text: "Majority of clients fall in the overweight category."
            });
        }

        // Rule 2: Fat Loss Goal > 60%
        // We do a loose match for 'fat loss' to be robust
        let fatLossCount = 0;
        for (const [goal, count] of Object.entries(this.metrics.goalCounts)) {
            if (goal.toLowerCase().includes('fat loss') || goal.toLowerCase().includes('weight loss')) {
                fatLossCount += count;
            }
        }

        if ((fatLossCount / total) > 0.6) {
            this.insights.push({
                type: 'info',
                text: "Most clients are focused on fat reduction."
            });
        }

        // Rule 3: Avg BMI > 25
        if (parseFloat(this.metrics.avgBMI) > 25) {
            this.insights.push({
                type: 'danger',
                text: "Overall BMI trend indicates elevated weight levels."
            });
        }

        if (this.insights.length === 0) {
            this.insights.push({
                type: 'success',
                text: "Client metrics are balanced. No critical alerts detected."
            });
        }
    }


    /**
     * DAA Algorithms (Sorting & Searching)
     */
    // Merge Sort (stable sort, O(N log N))
    mergeSort(arr, key, ascending = true) {
        if (arr.length <= 1) return arr;

        const mid = Math.floor(arr.length / 2);
        const left = this.mergeSort(arr.slice(0, mid), key, ascending);
        const right = this.mergeSort(arr.slice(mid), key, ascending);

        return this.merge(left, right, key, ascending);
    }

    merge(left, right, key, ascending) {
        let result = [];
        let i = 0, j = 0;

        while (i < left.length && j < right.length) {
            let valA = left[i][key];
            let valB = right[j][key];

            // Handle numeric vs string
            if (typeof valA === 'string') valA = valA.toLowerCase();
            if (typeof valB === 'string') valB = valB.toLowerCase();

            let condition = ascending ? (valA <= valB) : (valA >= valB);

            if (condition) {
                result.push(left[i]);
                i++;
            } else {
                result.push(right[j]);
                j++;
            }
        }

        return result.concat(left.slice(i)).concat(right.slice(j));
    }

    // Binary Search (O(log N))
    // Requires array sorted by the same key
    binarySearch(arr, key, target) {
        if (!target) return arr; // empty search

        target = target.toLowerCase();

        let left = 0;
        let right = arr.length - 1;
        let matchIndex = -1;

        while (left <= right) {
            const mid = Math.floor((left + right) / 2);
            const val = String(arr[mid][key]).toLowerCase();

            if (val.startsWith(target)) {
                matchIndex = mid;
                break; // Found an anchor
            }

            if (val < target) {
                left = mid + 1;
            } else {
                right = mid - 1;
            }
        }

        if (matchIndex === -1) return [];

        // Expand left and right to get ALL prefix matches
        let results = [];
        let i = matchIndex;
        while (i >= 0 && String(arr[i][key]).toLowerCase().startsWith(target)) {
            results.push(arr[i]);
            i--;
        }

        let j = matchIndex + 1;
        while (j < arr.length && String(arr[j][key]).toLowerCase().startsWith(target)) {
            results.push(arr[j]);
            j++;
        }

        // Re-sort results to maintain stable alphabetical order
        return this.mergeSort(results, key, true);
    }


    /**
     * Prediction Engine
     */
    predictGoal(clientData, dietQuality, workoutFreq, targetWeight, weeks) {
        if (!clientData || !targetWeight || !weeks || weeks <= 0) return null;

        const currentWeight = clientData.Weight;
        const weightDiff = targetWeight - currentWeight;
        const isLoss = weightDiff < 0;

        // Required change per week
        const requiredChangePerWeek = Math.abs(weightDiff) / weeks;

        // Physiological limits (approximate safe/realistic limits)
        const maxSafeLossPerWeek = currentWeight * 0.01; // ~1% of body weight per week is generally safe
        const maxSafeGainPerWeek = 0.5; // Muscle gain is slow, ~0.5kg per week maximum for most organically

        let baseSuccessRate = 50; // Start at 50%

        // Evaluate based on realistic limits
        if (isLoss) {
            if (requiredChangePerWeek > maxSafeLossPerWeek) {
                baseSuccessRate -= 40; // Highly unrealistic
            } else if (requiredChangePerWeek <= maxSafeLossPerWeek * 0.5) {
                baseSuccessRate += 20; // Very achievable
            }
        } else { // Gain
            if (requiredChangePerWeek > maxSafeGainPerWeek) {
                baseSuccessRate -= 40; // Unlikely to be pure muscle
            } else if (requiredChangePerWeek <= maxSafeGainPerWeek * 0.5) {
                baseSuccessRate += 20; // Achievable
            }
        }

        // Adjust for Diet Quality
        if (dietQuality === 'Strict') baseSuccessRate += 20;
        else if (dietQuality === 'Poor') baseSuccessRate -= 30;

        // Adjust for Workout Frequency
        if (workoutFreq === '5+') baseSuccessRate += 15;
        else if (workoutFreq === '1-2') baseSuccessRate -= 15;

        // Cap between 0 and 100
        const finalScore = Math.max(0, Math.min(100, Math.round(baseSuccessRate)));

        // Determine Verdict
        let verdict = '';
        let colorClass = '';

        if (finalScore >= 80) {
            verdict = 'Highly Likely';
            colorClass = 'text-success';
        } else if (finalScore >= 50) {
            verdict = 'Possible';
            colorClass = 'text-warning';
        } else {
            verdict = 'Unlikely';
            colorClass = 'text-danger';
        }

        return {
            score: finalScore,
            verdict: verdict,
            colorClass: colorClass,
            requiredChange: requiredChangePerWeek.toFixed(2),
            isLoss: isLoss
        };
    }

    /**
     * Return Processed State
     */
    getState() {
        return {
            clients: this.processedData,
            metrics: this.metrics,
            insights: this.insights,
            summary: this.summary
        };
    }
}

// Global instance
window.MGD_Engine = new AnalyticsEngine();
