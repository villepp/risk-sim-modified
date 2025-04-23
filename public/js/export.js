function exportCurrentState() {
    var wb = XLSX.utils.book_new();
    var timestamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");

    // Export Risk Register
    if (risks.length > 0) {
        var riskData = [
            ["Risk Name", "Type", "Likelihood", "Impact", "Min Cost (€)", "Cost (% of Budget)", "Risk Score", "Risk Level", "Risk Response Description", "Occurred"]
        ];

        risks.forEach(function (risk) {
            riskData.push([
                risk.name,
                risk.type,
                risk.likelihood,
                risk.impact,
                risk.minCost,
                risk.costPercentage + "%",
                risk.score,
                risk.level,
                risk.responseDescription,
                risk.occurred ? "Yes" : "No"
            ]);
        });

        var ws = XLSX.utils.aoa_to_sheet(riskData);
        XLSX.utils.book_append_sheet(wb, ws, "Risk Register");
    }

    // Export Project Status
    if (project && project.name) {
        var projectData = [
            ["Project Information", ""],
            ["Project Name", project.name],
            ["Original Budget", project.originalBudget.toLocaleString() + " €"],
            ["Current Budget", project.budget.toLocaleString() + " €"],
            ["Original Duration", project.originalDuration + " months"],
            ["Current Duration", project.duration + " months"],
            ["Current Turn", currentTurn],
            ["Original Risk Contingency", project.originalRiskContingencyBudget.toLocaleString() + " €"],
            ["Current Risk Contingency", project.riskContingencyBudget.toLocaleString() + " €"],
            ["Project Quality", project.quality + "%"],
            ["Game Status", gameOver ? "Completed" : "In Progress"]
        ];

        var ws = XLSX.utils.aoa_to_sheet(projectData);
        XLSX.utils.book_append_sheet(wb, ws, "Project Status");
    }

    // Export Game History
    if (budgetData && budgetData.length > 0) {
        var historyData = [
            ["Turn", "Budget (€)", "Quality (%)", "Risk Contingency (€)"]
        ];

        for (var i = 0; i < budgetData.length; i++) {
            historyData.push([
                i,
                budgetData[i].toLocaleString(),
                qualityData[i],
                project.originalRiskContingencyBudget.toLocaleString()
            ]);
        }

        var ws = XLSX.utils.aoa_to_sheet(historyData);
        XLSX.utils.book_append_sheet(wb, ws, "Game History");
    }
    
    // Export Activity Log
    if (typeof getLogForExport === "function" && getLogForExport()) {
        var logData = getLogForExport();
        var ws = XLSX.utils.aoa_to_sheet(logData);
        XLSX.utils.book_append_sheet(wb, ws, "Activity Log");
    }

    // Export Grading Data if game is over
    if (gameOver && typeof exportGradeData === "function") {
        var gradeData = exportGradeData();
        if (gradeData) {
            var ws = XLSX.utils.aoa_to_sheet(gradeData);
            XLSX.utils.book_append_sheet(wb, ws, "Grading");
        }
    }

    // Save the workbook
    XLSX.writeFile(wb, "risk_simulation_" + timestamp + ".xlsx");
    
    // Log export action
    if (typeof logAction === "function") {
        logAction("Exported project state to Excel");
    }
}

// Keep the original exportRiskRegister function for backward compatibility
function exportRiskRegister() {
    if (risks.length === 0) {
        alert("No risks to export.");
        return;
    }

    var wb = XLSX.utils.book_new();
    var ws_data = [
        ["Risk Name", "Type", "Likelihood", "Impact", "Min Cost (€)", "Cost (% of Budget)", "Risk Score", "Risk Level", "Risk Response Description"]
    ];

    risks.forEach(function (risk) {
        ws_data.push([
            risk.name,
            risk.type,
            risk.likelihood,
            risk.impact,
            risk.minCost,
            risk.costPercentage + "%",
            risk.score,
            risk.level,
            risk.responseDescription
        ]);
    });

    var ws = XLSX.utils.aoa_to_sheet(ws_data);
    XLSX.utils.book_append_sheet(wb, ws, "Risk Register");
    var timestamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
    XLSX.writeFile(wb, "risk_register_" + timestamp + ".xlsx");
    
    // Log export action
    if (typeof logAction === "function") {
        logAction("Exported risk register to Excel");
    }
}