// activity-log.js - Tracks and records player actions throughout the simulation

// Log storage - array of action records
var actionLog = [];

// Initialize the logging system
function initLogging() {
    actionLog = [];
    
    // Create a minimized log display that can be expanded
    createLogUI();
}

// Create the UI for viewing the log
function createLogUI() {
    // Create a button to show/hide log
    const logButton = document.createElement("button");
    logButton.id = "logButton";
    logButton.className = "button-action log-button";
    logButton.textContent = "Activity Log";
    
    // Create the log panel
    const logPanel = document.createElement("div");
    logPanel.id = "logPanel";
    logPanel.className = "log-panel hidden";
    
    // Add close button and log content container
    logPanel.innerHTML = `
        <div class="log-header">
            <h3>Player Activity Log</h3>
            <button class="close-log button-action">Close</button>
        </div>
        <div id="logEntries" class="log-entries"></div>
    `;
    
    // Add to simulation area
    const simElement = document.getElementById("simulation");
    if (simElement) {
        // Add button to button container
        const buttonContainer = simElement.querySelector(".button-container");
        if (buttonContainer) {
            buttonContainer.appendChild(logButton);
        }
        
        // Add panel to body
        document.body.appendChild(logPanel);
        
        // Add event listeners
        logButton.addEventListener("click", toggleLogPanel);
        logPanel.querySelector(".close-log").addEventListener("click", toggleLogPanel);
    }
}

// Toggle log panel visibility
function toggleLogPanel() {
    const panel = document.getElementById("logPanel");
    if (panel) {
        panel.classList.toggle("hidden");
        
        // If showing panel, update log entries
        if (!panel.classList.contains("hidden")) {
            updateLogDisplay();
        }
    }
}

// Update the log display with current entries
function updateLogDisplay() {
    const logEntries = document.getElementById("logEntries");
    if (!logEntries) return;
    
    logEntries.innerHTML = "";
    
    if (actionLog.length === 0) {
        logEntries.innerHTML = "<p>No actions recorded yet.</p>";
        return;
    }
    
    // Group log entries by turn
    let currentTurnGroup = null;
    let currentTurnNumber = -1;
    
    actionLog.forEach(entry => {
        // Check if we need a new turn group
        if (entry.turn !== currentTurnNumber) {
            currentTurnNumber = entry.turn;
            
            // Create a new turn group
            currentTurnGroup = document.createElement("div");
            currentTurnGroup.className = "log-turn-group";
            currentTurnGroup.innerHTML = `<h4>Turn ${currentTurnNumber}</h4>`;
            logEntries.appendChild(currentTurnGroup);
        }
        
        // Create entry element
        const entryElement = document.createElement("div");
        entryElement.className = "log-entry";
        
        // Format timestamp
        const timestamp = new Date(entry.timestamp);
        const timeString = timestamp.toLocaleTimeString();
        
        // Set entry content
        entryElement.innerHTML = `
            <div class="log-time">${timeString}</div>
            <div class="log-action">${entry.action}</div>
        `;
        
        // Add to current turn group
        currentTurnGroup.appendChild(entryElement);
    });
}

// Log a player action
function logAction(action) {
    // Create log entry
    const entry = {
        turn: currentTurn,
        action: action,
        timestamp: new Date().toISOString()
    };
    
    // Add to log
    actionLog.push(entry);
    
    // If log panel is visible, update it
    if (document.getElementById("logPanel") && 
        !document.getElementById("logPanel").classList.contains("hidden")) {
        updateLogDisplay();
    }
}

// Get specific log information for analysis
function getActionsByType(actionType) {
    return actionLog.filter(entry => entry.action.includes(actionType));
}

// Get the entire log
function getLog() {
    return actionLog;
}

// Log a risk event occurrence
function logRiskEvent(risk) {
    logAction(`Risk occurred: ${risk.name} (${risk.type}, Likelihood: ${risk.likelihood}, Impact: ${risk.impact})`);
}

// Log a risk response
function logRiskResponse(risk, response) {
    logAction(`Responded to risk "${risk.name}" with ${response} strategy`);
}

// Log project status at each turn
function logProjectStatus() {
    const budgetPercent = Math.round((project.budget / project.originalBudget) * 100);
    const contingencyPercent = Math.round((project.riskContingencyBudget / project.originalRiskContingencyBudget) * 100);
    
    logAction(`Project status: Budget ${budgetPercent}%, Quality ${project.quality}%, Contingency ${contingencyPercent}%`);
}

// Export log to Excel format
function getLogForExport() {
    // Format data for Excel export
    const logData = [
        ["Turn", "Timestamp", "Action"]
    ];
    
    // Add each log entry
    actionLog.forEach(entry => {
        // Format the timestamp
        const timestamp = new Date(entry.timestamp);
        const formattedTime = timestamp.toLocaleString();
        
        logData.push([
            entry.turn,
            formattedTime,
            entry.action
        ]);
    });
    
    return logData;
}

// Add event listeners for existing game functions
function setupLogEventListeners() {
    // Hook into risk response
    const originalRespondToRisk = window.respondToRisk;
    window.respondToRisk = function() {
        // Get response before function executes
        const response = document.getElementById('riskResponse').value;
        
        // Log the response if valid
        if (response && currentRiskEvent) {
            logRiskResponse(currentRiskEvent, response);
        }
        
        // Call original function
        originalRespondToRisk.apply(this, arguments);
    };
    
    // Hook into next turn
    const originalNextTurn = window.nextTurn;
    window.nextTurn = function() {
        // Log turn start
        logAction(`Starting turn ${currentTurn + 1}`);
        
        // Call original function
        originalNextTurn.apply(this, arguments);
        
        // Log project status after turn
        if (!gameOver) {
            logProjectStatus();
        }
    };
}