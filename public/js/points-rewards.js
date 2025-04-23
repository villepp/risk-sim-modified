// points-rewards.js - Manages points and rewards for good risk management decisions

// Global variables for points and rewards system
var playerPoints = 0;
var playerAchievements = [];

// Initialize points and rewards system
function initPointsSystem() {
    playerPoints = 0;
    playerAchievements = [];
    
    // Add default achievements
    playerAchievements = [
        {
            id: "budget_master",
            title: "Budget Master",
            description: "Maintain at least 80% of your budget by halfway point",
            points: 100,
            unlocked: false
        },
        {
            id: "quality_guardian",
            title: "Quality Guardian",
            description: "Keep quality above 90% for the first half",
            points: 100,
            unlocked: false
        },
        {
            id: "risk_manager",
            title: "Risk Manager",
            description: "Successfully handle 3 risks in a row",
            points: 150,
            unlocked: false
        },
        {
            id: "contingency_planner",
            title: "Contingency Planner",
            description: "End with 60% contingency remaining",
            points: 200,
            unlocked: false
        }
    ];
    
    createPointsUI();
    updatePointsDisplay();
}

// Create the UI elements for points system
function createPointsUI() {
    const pointsContainer = document.createElement("div");
    pointsContainer.id = "pointsContainer";
    pointsContainer.className = "points-container";
    
    // Simplified UI with just the points counter - no notification area
    pointsContainer.innerHTML = `
        <div class="points-header">
            <span id="pointsDisplay">0 Points</span>
            <button id="achievementsButton" class="button-action">Achievements</button>
        </div>
    `;
    
    // Add to the simulation section
    const simElement = document.getElementById("simulation");
    if (simElement) {
        simElement.insertBefore(pointsContainer, simElement.firstChild);
    }
    
    // Create achievements panel
    const achievementsPanel = document.createElement("div");
    achievementsPanel.id = "achievementsPanel";
    achievementsPanel.className = "achievements-panel hidden";
    achievementsPanel.innerHTML = `
        <div class="achievements-header">
            <h3>Achievements</h3>
            <button class="close-achievements button-action">Close</button>
        </div>
        <div id="achievementsList" class="achievements-list"></div>
    `;
    
    document.body.appendChild(achievementsPanel);
    
    // Add event listeners
    document.getElementById("achievementsButton").addEventListener("click", toggleAchievementsPanel);
    document.querySelector(".close-achievements").addEventListener("click", toggleAchievementsPanel);
    
    // Update achievements list
    updateAchievementsList();
}

// Toggle achievements panel visibility
function toggleAchievementsPanel() {
    const panel = document.getElementById("achievementsPanel");
    if (panel) {
        panel.classList.toggle("hidden");
        updateAchievementsList();
    }
}

// Update the achievements list display
function updateAchievementsList() {
    const achievementsList = document.getElementById("achievementsList");
    if (!achievementsList) return;
    
    achievementsList.innerHTML = "";
    
    playerAchievements.forEach(achievement => {
        const achievementItem = document.createElement("div");
        achievementItem.className = `achievement-item ${achievement.unlocked ? 'unlocked' : 'locked'}`;
        
        achievementItem.innerHTML = `
            <div class="achievement-title">${achievement.title}</div>
            <div class="achievement-description">${achievement.description}</div>
            <div class="achievement-points">+${achievement.points} points</div>
        `;
        
        achievementsList.appendChild(achievementItem);
    });
}

// Update the points display
function updatePointsDisplay() {
    const pointsDisplay = document.getElementById("pointsDisplay");
    if (pointsDisplay) {
        pointsDisplay.textContent = `${playerPoints} Points`;
    }
}

// Award points to the player with a reason (without notification)
function awardPoints(amount, reason) {
    playerPoints += amount;
    updatePointsDisplay();
    
    // Log the points award but don't show notification
    logAction(`Awarded ${amount} points: ${reason}`);
}

// Check for and award achievements
function checkAchievements() {
    // Budget Master
    if (!isAchievementUnlocked("budget_master") && 
        currentTurn >= Math.floor(project.originalDuration / 2) && 
        (project.budget / project.originalBudget) >= 0.8) {
        unlockAchievement("budget_master");
    }
    
    // Quality Guardian
    if (!isAchievementUnlocked("quality_guardian") && 
        currentTurn >= Math.floor(project.originalDuration / 2) && 
        project.quality >= 90) {
        unlockAchievement("quality_guardian");
    }
    
    // Contingency Planner (check at end)
    if (gameOver && 
        !isAchievementUnlocked("contingency_planner") && 
        (project.riskContingencyBudget / project.originalRiskContingencyBudget) >= 0.6) {
        unlockAchievement("contingency_planner");
    }
    
    // Risk Manager (tracked separately via consecutiveRisksHandled)
    if (window.consecutiveRisksHandled >= 3 && !isAchievementUnlocked("risk_manager")) {
        unlockAchievement("risk_manager");
    }
}

// Check if achievement is unlocked
function isAchievementUnlocked(id) {
    const achievement = playerAchievements.find(a => a.id === id);
    return achievement ? achievement.unlocked : false;
}

// Unlock an achievement (without notification)
function unlockAchievement(id) {
    const achievement = playerAchievements.find(a => a.id === id);
    if (achievement && !achievement.unlocked) {
        achievement.unlocked = true;
        // Add points silently
        playerPoints += achievement.points;
        updatePointsDisplay();
        
        // Update achievements list if visible
        updateAchievementsList();
        
        // Log the achievement
        logAction(`Unlocked achievement: ${achievement.title}`);
    }
}

// Award points based on risk response quality
function evaluateRiskResponse(response, risk) {
    // Track consecutive risks handled
    window.consecutiveRisksHandled = (window.consecutiveRisksHandled || 0) + 1;
    
    let pointsAwarded = 0;
    let reason = "";
    
    // Check if response matches recommended response for risk type
    const isOptimalResponse = (
        (risk.type === "Technical" && response === "Mitigate") ||
        (risk.type === "Operational" && (response === "Transfer" || response === "Mitigate")) ||
        (risk.type === "Security" && (response === "Avoid" || response === "Mitigate")) ||
        (risk.type === "Scope" && response === "Avoid") ||
        (risk.type === "Management" && response === "Mitigate")
    );
    
    if (isOptimalResponse) {
        pointsAwarded = 50;
        reason = `Optimal response to ${risk.type} risk`;
    } else {
        pointsAwarded = 10;
        reason = `Handled ${risk.type} risk`;
        // Reset consecutive counter for non-optimal responses
        window.consecutiveRisksHandled = 0;
    }
    
    // Award the points (silently)
    playerPoints += pointsAwarded;
    updatePointsDisplay();
    
    // Log the action
    logAction(`Awarded ${pointsAwarded} points: ${reason}`);
    
    // Check for new achievements
    checkAchievements();
    
    return pointsAwarded;
}

// Add points for completing a turn without incident
function awardTurnCompletionPoints() {
    // Award points silently
    playerPoints += 10;
    updatePointsDisplay();
    
    // Log silently
    logAction("Awarded 10 points: Turn completed without incident");
    
    // Check for any achievements
    checkAchievements();
}

// Get total points for final score calculation
function getTotalPoints() {
    return playerPoints;
}