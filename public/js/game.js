// Variables for project and game state
var project = {};
var risks = [];
var currentTurn = 0;
var gameOver = false;

window.onload = function () {
    setDefaultProjectName();
    updateBaselineCost();
    // Initialize new systems
    initPointsSystem();
    initGradingSystem();
    initLogging();
    setupLogEventListeners();
    setupHelpModal();
};

function setDefaultProjectName() {
    var projectNames = [
        "Turing",
        "Ada",
        "Grace",
        "Linus",
        "Jobs",
        "Gates",
        "Von Neumann",
        "Tesla",
        "Dijkstra",
        "Knuth",
    ];
    var randomName =
        projectNames[Math.floor(Math.random() * projectNames.length)];
    var currentDate = new Date();
    var dateString = formatDate(currentDate);
    var timeString = formatTime(currentDate);
    var defaultProjectName = randomName + " " + dateString + " " + timeString;
    document.getElementById("projectName").value = defaultProjectName;
}

function formatDate(date) {
    var day = date.getDate();
    var month = date.getMonth() + 1;
    var year = date.getFullYear();
    return day + "." + month + "." + year;
}

function formatTime(date) {
    var hours = date.getHours();
    var minutes = date.getMinutes();
    if (minutes < 10) minutes = "0" + minutes;
    return hours + ":" + minutes;
}

function updateBaselineCost() {
    // Convert project budget from €k to €
    var projectBudget =
        parseFloat(document.getElementById("projectBudget").value) * 1000;
    var projectDuration = parseInt(
        document.getElementById("projectDuration").value
    );
    if (isNaN(projectBudget) || isNaN(projectDuration) || projectDuration === 0) {
        document.getElementById("baselineCost").value = "";
        return;
    }
    // Calculate baseline cost per turn then convert back to €k for display
    var baselineCostPerTurn =
        projectBudget / projectDuration - 0.01 * projectBudget;
    baselineCostPerTurn = baselineCostPerTurn / 1000;
    document.getElementById("baselineCost").value =
        baselineCostPerTurn.toFixed(2);
}

function startGame() {
    var projectNameInput = document.getElementById("projectName").value;
    var projectBudget =
        parseFloat(document.getElementById("projectBudget").value) * 1000;
    var projectDuration = parseInt(
        document.getElementById("projectDuration").value
    );
    var baselineCostPerTurn =
        parseFloat(document.getElementById("baselineCost").value) * 1000;
    var riskContingencyPercentage = parseFloat(
        document.getElementById("riskContingencyPercentage").value
    );

    if (projectNameInput === "") {
        alert("Please enter a project name.");
        return;
    }

    if (isNaN(baselineCostPerTurn) || baselineCostPerTurn <= 0) {
        alert(
            "Invalid Baseline Cost per Turn. Please check your Project Budget and Duration."
        );
        return;
    }

    // Cheat function activation (if project name is "tv")
    if (projectNameInput.trim().toLowerCase() === "tv") {
        var currentDate = new Date();
        var dateString = formatDate(currentDate);
        var timeString = formatTime(currentDate);
        projectNameInput += " " + dateString + " " + timeString;
        generateCheatRisks();
    }

    var riskContingencyBudget = (riskContingencyPercentage / 100) * projectBudget;

    project = {
        name: projectNameInput,
        budget: projectBudget,
        originalBudget: projectBudget,
        riskContingencyBudget: riskContingencyBudget,
        originalRiskContingencyBudget: riskContingencyBudget,
        baselineCostPerTurn: baselineCostPerTurn,
        duration: projectDuration,
        originalDuration: projectDuration,
        quality: 100,
    };

    document.getElementById("setup").classList.add("hidden");
    document.getElementById("game").classList.remove("hidden");
    updateRiskTable();

    // Reset game state
    currentTurn = 0;
    gameOver = false;

    // Log game start
    logAction(`Started new project: ${projectNameInput}`);
}

function generateCheatRisks() {
    var cheatRisks = [
        {
            name: "Requirement Creep",
            type: "Scope",
            likelihood: 4,
            impact: 3,
            minCost: 5000,
            costPercentage: 5,
            responseDescription:
                "Implement agile practices and regular backlog reviews to control scope.",
        },
        {
            name: "Technical Debt Accumulation",
            type: "Technical",
            likelihood: 3,
            impact: 4,
            minCost: 4000,
            costPercentage: 4,
            responseDescription:
                "Plan refactoring cycles and enforce code reviews to reduce technical debt.",
        },
        {
            name: "Integration Issues",
            type: "Technical",
            likelihood: 3,
            impact: 3,
            minCost: 3000,
            costPercentage: 3,
            responseDescription:
                "Conduct early prototyping and thorough integration testing.",
        },
        {
            name: "Security Vulnerability",
            type: "Security",
            likelihood: 2,
            impact: 5,
            minCost: 6000,
            costPercentage: 6,
            responseDescription:
                "Perform regular security audits and implement robust security measures.",
        },
        {
            name: "Team Turnover",
            type: "Operational",
            likelihood: 4,
            impact: 2,
            minCost: 2000,
            costPercentage: 2,
            responseDescription:
                "Enhance team retention through competitive incentives and a positive culture.",
        },
    ];

    cheatRisks.forEach(function (riskData) {
        var riskScore = riskData.likelihood * riskData.impact;
        var riskLevel = getRiskLevel(riskScore);

        var risk = {
            name: riskData.name,
            type: riskData.type,
            likelihood: riskData.likelihood,
            impact: riskData.impact,
            minCost: riskData.minCost,
            costPercentage: riskData.costPercentage,
            score: riskScore,
            level: riskLevel,
            occurred: false,
            responseDescription: riskData.responseDescription,
        };

        risks.push(risk);

        // Log cheat risk added
        logAction(`Added cheat risk: ${riskData.name}`);
    });
}

function proceedToSimulation() {
    if (risks.length < 5) {
        alert("Please add at least 5 risks before proceeding.");
        return;
    }

    document.getElementById("game").classList.add("hidden");
    document.getElementById("simulation").classList.remove("hidden");
    updateProjectStatus();
    document.getElementById(
        "simulationInfo"
    ).innerText = `Managing Software Project: ${project.name}`;
    initializeCharts();

    // Log proceeding to simulation
    logAction("Proceeded to simulation phase");
}

function nextTurn() {
    // Always check if game is already over first
    if (gameOver) {
        return;
    }

    // Check if we've reached the project duration limit
    if (currentTurn >= project.originalDuration) {
        showEndGamePrompt();
        return;
    }

    // Log starting the turn
    logAction(`Starting turn ${currentTurn + 1}`);

    // Increment turn counter
    currentTurn++;
    
    // Deduct baseline costs
    project.budget -= project.baselineCostPerTurn;
    
    // Check for risk events
    var riskEvent = checkForRiskEvent();
    
    if (riskEvent) {
        // Handle risk event
        document.getElementById("riskEvent").classList.remove("hidden");
        document.getElementById("riskEventDescription").innerHTML = `
            <p>Risk "<strong>${riskEvent.name}</strong>" has occurred!</p>
            <p>Type: ${riskEvent.type}</p>
            <p>Likelihood: ${riskEvent.likelihood}</p>
            <p>Impact: ${riskEvent.impact}</p>
            <p>Minimum Cost if Occurs: €${riskEvent.minCost.toLocaleString()}</p>
            <p>Cost as % of Budget: ${riskEvent.costPercentage}%</p>
            <p>Risk Response Description: ${riskEvent.responseDescription}</p>
        `;
        document.getElementById("nextTurnButton").disabled = true;
        currentRiskEvent = riskEvent;
    } else {
        // No risk event occurred
        updateProjectStatus();
        updateCharts();
        saveTurn();
        
        // Award points for completing turn without incident
        if (typeof awardTurnCompletionPoints === "function") {
            awardTurnCompletionPoints();
        }
        
        // Check if we've reached the project duration after this turn
        if (currentTurn >= project.originalDuration) {
            showEndGamePrompt();
        }
    }
}

function redoTurn() {
    if (gameOver) return;

    if (currentTurn > project.duration) {
        checkWinCondition();
        return;
    }

    project.budget -= project.baselineCostPerTurn;
    var riskEvent = currentRiskEvent;
    if (riskEvent) {
        document.getElementById("riskEvent").classList.remove("hidden");
        document.getElementById("riskEventDescription").innerHTML = `
            <p>Risk "<strong>${riskEvent.name}</strong>" has occurred!</p>
            <p>Type: ${riskEvent.type}</p>
            <p>Likelihood: ${riskEvent.likelihood}</p>
            <p>Impact: ${riskEvent.impact}</p>
            <p>Minimum Cost if Occurs: €${riskEvent.minCost.toLocaleString()}</p>
            <p>Cost as % of Budget: ${riskEvent.costPercentage}%</p>
            <p>Risk Response Description: ${riskEvent.responseDescription}</p>
        `;
        document.getElementById("nextTurnButton").disabled = true;
        currentRiskEvent = riskEvent;
    } else {
        updateProjectStatus();
        updateCharts();
        checkWinCondition();
        saveTurn();
    }
}

var currentRiskEvent = null;

function checkForRiskEvent() {
    var shuffledRisks = risks.slice().sort(() => 0.5 - Math.random());
    for (var i = 0; i < shuffledRisks.length; i++) {
        var risk = shuffledRisks[i];
        if (!risk.occurred) {
            var probability = risk.likelihood / 5;
            if (Math.random() < probability) {
                risk.occurred = true;
                // Log the risk event
                logRiskEvent(risk);
                return risk;
            }
        }
    }
    return null;
}

function respondToRisk() {
    // Prevent responding if game is over
    if (gameOver) return;
    
    var response = document.getElementById("riskResponse").value;
    if (response === "") {
        alert("Please select a risk response action.");
        return;
    }

    // Evaluate response quality and award points
    if (typeof evaluateRiskResponse === "function") {
        evaluateRiskResponse(response, currentRiskEvent);
    }

    var costFromMin = currentRiskEvent.minCost;
    var costFromPercentage = (currentRiskEvent.costPercentage / 100) * project.originalBudget;
    var costImpact = Math.max(costFromMin, costFromPercentage);

    switch (response) {
        case "Mitigate":
            costImpact *= 0.5;
            break;
        case "Avoid":
            costImpact *= 0.75;
            break;
        case "Transfer":
            costImpact *= 0.25;
            break;
        case "Accept":
            break;
    }

    if (project.riskContingencyBudget >= costImpact) {
        project.riskContingencyBudget -= costImpact;
    } else {
        var remainingCost = costImpact - project.riskContingencyBudget;
        project.riskContingencyBudget = 0;
        project.budget -= remainingCost;
    }

    var timeImpact = currentRiskEvent.impact * 0.02 * project.originalDuration;
    switch (response) {
        case "Mitigate":
            project.duration += timeImpact * 0.5;
            break;
        case "Avoid":
            project.duration += timeImpact * 0.75;
            break;
        case "Transfer":
            project.duration += timeImpact * 0.25;
            break;
        case "Accept":
            project.duration += timeImpact;
            break;
    }

    project.quality -= currentRiskEvent.impact * 2;

    document.getElementById("riskEvent").classList.add("hidden");
    document.getElementById("nextTurnButton").disabled = false;
    
    updateProjectStatus();
    updateCharts();
    saveTurn();
    
    // Check if we've reached the project duration after handling this risk
    if (currentTurn >= project.originalDuration) {
        showEndGamePrompt();
    }
}

function updateProjectStatus() {
    var budgetPercent = (project.budget / project.originalBudget) * 100;
    var qualityPercent = project.quality;
    var riskContingencyPercent = (project.riskContingencyBudget / project.originalRiskContingencyBudget) * 100;

    document.getElementById("budgetProgress").style.width = budgetPercent + "%";
    document.getElementById("qualityProgress").style.width = qualityPercent + "%";
    document.getElementById("riskContingencyProgress").style.width = riskContingencyPercent + "%";

    var timeRemaining = Math.max(project.originalDuration - currentTurn, 0);
    timeRemaining = timeRemaining.toFixed(1);

    var status = `
        <p>Turn: ${currentTurn} / ${project.originalDuration}</p>
        <p>Budget Remaining: €${project.budget.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}</p>
        <p>Risk Contingency Remaining: €${project.riskContingencyBudget.toLocaleString(
            undefined,
            { minimumFractionDigits: 2, maximumFractionDigits: 2 }
        )}</p>
        <p>Time Remaining: ${timeRemaining} months</p>
        <p>Quality: ${project.quality}%</p>
    `;
    document.getElementById("projectStatus").innerHTML = status;

    // Log project status
    if (typeof logProjectStatus === "function") {
        logProjectStatus();
    }
    
    // Check for game-ending conditions
    if (project.budget <= 0 || project.quality <= 0) {
        gameOver = true;
        finalizeGame(false);
    }
}

function checkWinCondition() {
    // Only proceed if game is not already over
    if (gameOver) return;
    
    // Check if we've reached the end condition
    if (currentTurn >= project.duration || project.budget <= 0 || project.quality <= 0) {
        // Determine if project is successful
        var isSuccess = (project.budget > 0 && project.quality > 50);
        
        // Log the outcome
        logAction(`Project ${isSuccess ? "succeeded" : "failed"} after ${currentTurn} turns`);
        
        // Set game over flag BEFORE calling finalizeGame to prevent recursion
        gameOver = true;
        
        // Call finalizeGame with the success/failure state
        finalizeGame(isSuccess);
    }
}

function finalizeGame(isSuccess) {
    document.getElementById('simulation').classList.add('hidden');

    let finalScore = calculateFinalScore();

    let budgetRemaining = (project.budget / project.originalBudget) * 100;
    let riskContingencyRemaining = (project.riskContingencyBudget / project.originalRiskContingencyBudget) * 100;
    let finalInfo = `
        <p><strong>Final Budget Remaining:</strong> €${project.budget.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (${budgetRemaining.toFixed(2)}%)</p>
        <p><strong>Final Risk Contingency Remaining:</strong> €${project.riskContingencyBudget.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (${riskContingencyRemaining.toFixed(2)}%)</p>
        <p><strong>Final Quality Percentage:</strong> ${project.quality}%</p>
    `;

    let message;
    if (isSuccess) {
        message = `
            <h2>Congratulations! Project Completed Successfully</h2>
            <p>You delivered the software project on budget and maintained high quality.</p>
            <img src="https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExYnd2d3lrZGhxbm5zZDdkYmI1Zng5Y2VjZGdjYW02dHc3eDdiaHk5cyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/hcnh1VGMNW3Sb8c5aX/giphy.gif" alt="Success GIF">
        `;
        // Log success
        logAction("Project completed successfully!");
    } else {
        var failureReason = '';
        if (project.budget <= 0 && project.quality <= 50) {
            failureReason = 'Your project ran out of budget and quality fell below acceptable levels.';
        } else if (project.budget <= 0) {
            failureReason = 'Your project ran out of budget before completion.';
        } else if (project.quality <= 50) {
            failureReason = 'Your project quality was too low.';
        } else {
            failureReason = 'Your project could not be completed successfully.';
        }

        message = `
            <h2>Game Over: Project Failed</h2>
            <p>${failureReason}</p>
            <img src="https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExcnRqcmNzZGhoc2ZidGs5bWN2MWI0MXVucjVqcWozM294a3Vid3NvNSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/BGlGy3pD9THOFVzdtf/giphy.gif" alt="Failure GIF">
        `;
        // Log failure
        logAction(`Project failed: ${failureReason}`);
    }

    // Create points and achievements summary
    let pointsHTML = '';
    if (typeof playerPoints !== 'undefined') {
        pointsHTML = `
            <div class="points-summary">
                <h3>Points & Achievements</h3>
                <p class="total-points">Total Points Earned: <strong>${playerPoints}</strong></p>
                <div class="achievements-summary">
                    <h4>Achievements Unlocked:</h4>
                    <div class="achieved-items">
        `;
        
        // Add unlocked achievements
        let unlockedCount = 0;
        if (Array.isArray(playerAchievements)) {
            playerAchievements.forEach(achievement => {
                if (achievement.unlocked) {
                    unlockedCount++;
                    pointsHTML += `
                        <div class="achievement-item unlocked">
                            <div class="achievement-title">${achievement.title}</div>
                            <div class="achievement-description">${achievement.description}</div>
                            <div class="achievement-points">+${achievement.points} points</div>
                        </div>
                    `;
                }
            });
        }
        
        // If no achievements unlocked
        if (unlockedCount === 0) {
            pointsHTML += '<p>No achievements unlocked in this playthrough.</p>';
        }
        
        pointsHTML += `
                    </div>
                </div>
            </div>
        `;
    }

    // Create the final result content
    document.getElementById('finalResult').innerHTML = `
        <h2>Simulation Results</h2>
        ${finalInfo}
        <h3>Your Overall Score</h3>
        <p class="final-score"><strong>${finalScore}%</strong></p>
        ${message}
        ${pointsHTML}
        <div class="results-actions">
            <button class="button-action" onclick="window.print()">Print Results</button>
            <button class="button-action" id="viewLogButton">View Activity Log</button>
            <button class="button-action" onclick="exportCurrentState()">Export to Excel</button>
        </div>
    `;
    
    // Add grading display for teachers
    if (typeof displayGradeInResults === "function") {
        displayGradeInResults();
    }
    
    // Set up log button event listener
    const viewLogButton = document.getElementById('viewLogButton');
    if (viewLogButton) {
        viewLogButton.addEventListener('click', function() {
            if (typeof toggleLogPanel === 'function') {
                toggleLogPanel();
            }
        });
    }
    
    document.getElementById('finalResult').classList.remove('hidden');
}

function calculateFinalScore() {
    let budgetRemaining = (project.budget / project.originalBudget) * 100;
    let riskContingencyRemaining = (project.riskContingencyBudget / project.originalRiskContingencyBudget) * 100;
    let qualityRemaining = project.quality;

    let score = (budgetRemaining * 0.4) + (qualityRemaining * 0.4) + (riskContingencyRemaining * 0.2);
    return Math.min(score.toFixed(2), 100);
}

function showEndGamePrompt() {
    // Hide other UI elements that might be showing
    document.getElementById("riskEvent").classList.add("hidden");
    
    // Show the end game prompt
    document.getElementById("endGamePrompt").classList.remove("hidden");
    
    // Disable the next turn button
    document.getElementById("nextTurnButton").disabled = true;
}

function hideEndGamePrompt() {
    // Hide the prompt
    document.getElementById("endGamePrompt").classList.add("hidden");
    
    // Enable the next turn button
    document.getElementById("nextTurnButton").disabled = false;
}

function endGame(isSuccess) {
    // Set game over flag
    gameOver = true;
    
    // Hide the prompt
    document.getElementById("endGamePrompt").classList.add("hidden");
    
    // Call finalizeGame with the success state
    finalizeGame(isSuccess);
}