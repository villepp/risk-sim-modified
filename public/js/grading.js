// grading.js - Handles the grading system for teacher evaluation

// Grading criteria and weights
const GRADING_CRITERIA = {
    BUDGET_MANAGEMENT: { weight: 0.3, description: "Budget Management" },
    QUALITY_MANAGEMENT: { weight: 0.3, description: "Quality Management" },
    RISK_RESPONSES: { weight: 0.2, description: "Risk Response Effectiveness" },
    CONTINGENCY_USAGE: { weight: 0.1, description: "Contingency Budget Usage" },
    ACHIEVEMENTS: { weight: 0.1, description: "Achievements Unlocked" }
};

// Initialize the grading system
function initGradingSystem() {
    // Nothing to initialize yet - grading happens at the end
}

// Calculate the final grade on a scale of 0-5
function calculateFinalGrade() {
    if (!gameOver) return null;
    
    // Calculate individual scores for each criterion
    const budgetScore = calculateBudgetScore();
    const qualityScore = calculateQualityScore();
    const riskResponseScore = calculateRiskResponseScore();
    const contingencyScore = calculateContingencyScore();
    const achievementsScore = calculateAchievementsScore();
    
    // Apply weights to each criterion
    const weightedBudgetScore = budgetScore * GRADING_CRITERIA.BUDGET_MANAGEMENT.weight;
    const weightedQualityScore = qualityScore * GRADING_CRITERIA.QUALITY_MANAGEMENT.weight;
    const weightedRiskResponseScore = riskResponseScore * GRADING_CRITERIA.RISK_RESPONSES.weight;
    const weightedContingencyScore = contingencyScore * GRADING_CRITERIA.CONTINGENCY_USAGE.weight;
    const weightedAchievementsScore = achievementsScore * GRADING_CRITERIA.ACHIEVEMENTS.weight;
    
    // Calculate total weighted score (0-1)
    const totalWeightedScore = 
        weightedBudgetScore + 
        weightedQualityScore + 
        weightedRiskResponseScore + 
        weightedContingencyScore + 
        weightedAchievementsScore;
    
    // Convert to 0-5 scale
    const finalGrade = Math.round(totalWeightedScore * 5 * 10) / 10;
    
    // Log the final grade
    logAction(`Final grade calculated: ${finalGrade} / 5`);
    
    // Return detailed grading breakdown
    return {
        finalGrade: Math.min(finalGrade, 5),
        breakdown: {
            budgetManagement: {
                score: budgetScore,
                weight: GRADING_CRITERIA.BUDGET_MANAGEMENT.weight,
                weightedScore: weightedBudgetScore,
                description: GRADING_CRITERIA.BUDGET_MANAGEMENT.description
            },
            qualityManagement: {
                score: qualityScore,
                weight: GRADING_CRITERIA.QUALITY_MANAGEMENT.weight,
                weightedScore: weightedQualityScore,
                description: GRADING_CRITERIA.QUALITY_MANAGEMENT.description
            },
            riskResponses: {
                score: riskResponseScore,
                weight: GRADING_CRITERIA.RISK_RESPONSES.weight,
                weightedScore: weightedRiskResponseScore,
                description: GRADING_CRITERIA.RISK_RESPONSES.description
            },
            contingencyUsage: {
                score: contingencyScore,
                weight: GRADING_CRITERIA.CONTINGENCY_USAGE.weight,
                weightedScore: weightedContingencyScore,
                description: GRADING_CRITERIA.CONTINGENCY_USAGE.description
            },
            achievements: {
                score: achievementsScore,
                weight: GRADING_CRITERIA.ACHIEVEMENTS.weight,
                weightedScore: weightedAchievementsScore,
                description: GRADING_CRITERIA.ACHIEVEMENTS.description
            }
        }
    };
}

// Calculate budget management score (0-1)
function calculateBudgetScore() {
    // How much of the original budget remains
    const budgetPercentageRemaining = project.budget / project.originalBudget;
    
    // Score based on percentage remaining (0-1)
    // 0% remaining = 0 score, 70%+ remaining = 1 score
    return Math.min(budgetPercentageRemaining / 0.7, 1);
}

// Calculate quality management score (0-1)
function calculateQualityScore() {
    // Quality is already 0-100
    return project.quality / 100;
}

// Calculate risk response effectiveness score (0-1)
function calculateRiskResponseScore() {
    // Count optimal responses from the log
    const optimalResponseCount = getLog().filter(entry => 
        entry.action.includes("Optimal response")).length;
    
    // Count total risks that occurred
    const risksOccurred = risks.filter(risk => risk.occurred).length;
    
    // If no risks occurred, return 1
    if (risksOccurred === 0) return 1;
    
    // Calculate ratio of optimal responses to total risks
    return Math.min(optimalResponseCount / risksOccurred, 1);
}

// Calculate contingency budget usage score (0-1)
function calculateContingencyScore() {
    // Percentage of contingency budget remaining
    const contingencyPercentageRemaining = 
        project.riskContingencyBudget / project.originalRiskContingencyBudget;
    
    // Ideal range is 20-80% used (80-20% remaining)
    if (contingencyPercentageRemaining > 0.8) {
        // Penalty for not using enough of the contingency (over-allocation)
        return 0.5 + (0.5 * (1 - contingencyPercentageRemaining));
    } else if (contingencyPercentageRemaining < 0.2) {
        // Penalty for using too much contingency
        return 0.5 * (contingencyPercentageRemaining / 0.2);
    } else {
        // Optimal usage is 20-80% remaining
        return 1;
    }
}

// Calculate achievements score (0-1)
function calculateAchievementsScore() {
    // Count unlocked achievements
    const unlockedCount = playerAchievements.filter(a => a.unlocked).length;
    
    // Calculate percentage of achievements unlocked
    return unlockedCount / playerAchievements.length;
}

// Add grading information to final results
function displayGradeInResults() {
    const gradeInfo = calculateFinalGrade();
    
    if (!gradeInfo) return;
    
    // Create grade display element
    const gradeDisplay = document.createElement("div");
    gradeDisplay.id = "gradeDisplay";
    gradeDisplay.className = "grade-display";
    
    // Get letter grade based on numerical score
    const letterGrade = getLetterGrade(gradeInfo.finalGrade);
    
    // Format the breakdown information
    let breakdownHTML = "";
    for (const [key, criteria] of Object.entries(gradeInfo.breakdown)) {
        // Create a progress bar for the criteria score
        const scorePercent = Math.round(criteria.score * 100);
        breakdownHTML += `
            <div class="grade-criteria">
                <div class="criteria-name">${criteria.description}</div>
                <div class="criteria-score-container">
                    <div class="criteria-score-bar" style="width: ${scorePercent}%"></div>
                </div>
                <div class="criteria-score-value">${scorePercent}%</div>
                <div class="criteria-weighted">(${Math.round(criteria.weight * 100)}% weight)</div>
            </div>
        `;
    }
    
    // Set the grade display content
    gradeDisplay.innerHTML = `
        <h3>Teacher Grading (0-5 Scale)</h3>
        <div class="final-grade">
            <div class="grade-number">Grade: <strong>${gradeInfo.finalGrade.toFixed(1)}</strong></div>
            <div class="grade-letter">${letterGrade}</div>
        </div>
        <div class="grade-breakdown">
            <h4>Grading Criteria Breakdown</h4>
            ${breakdownHTML}
        </div>
    `;
    
    // Add to final results
    const finalResult = document.getElementById("finalResult");
    if (finalResult) {
        finalResult.appendChild(gradeDisplay);
    }
}

function getLetterGrade(grade) {
    if (grade >= 4.5) return "Excellent";
    if (grade >= 3.5) return "Very Good";
    if (grade >= 2.5) return "Good";
    if (grade >= 1.5) return "Satisfactory";
    if (grade >= 0.5) return "Poor";
    return "Fail";
}

// Export grade information to Excel
function exportGradeData() {
    const gradeInfo = calculateFinalGrade();
    if (!gradeInfo) return null;
    
    // Format grade data for Excel export
    return [
        ["Grading Information", ""],
        ["Final Grade (0-5)", gradeInfo.finalGrade.toFixed(1)],
        ["Budget Management Score", Math.round(gradeInfo.breakdown.budgetManagement.score * 100) + "%"],
        ["Quality Management Score", Math.round(gradeInfo.breakdown.qualityManagement.score * 100) + "%"],
        ["Risk Responses Score", Math.round(gradeInfo.breakdown.riskResponses.score * 100) + "%"],
        ["Contingency Usage Score", Math.round(gradeInfo.breakdown.contingencyUsage.score * 100) + "%"],
        ["Achievements Score", Math.round(gradeInfo.breakdown.achievements.score * 100) + "%"]
    ];
}