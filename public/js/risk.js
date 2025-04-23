function addRisk() {
    var riskName = document.getElementById('riskName').value;
    var riskType = document.getElementById('riskType').value;
    var likelihood = parseInt(document.getElementById('likelihood').value);
    var impact = parseInt(document.getElementById('impact').value);
    var minCost = parseFloat(document.getElementById('minCost').value);
    var costPercentage = parseFloat(document.getElementById('costPercentage').value);
    var riskResponseDescription = document.getElementById('riskResponseDescription').value;

    if (riskName === "") {
        alert("Please enter a risk name.");
        return;
    }

    if (riskResponseDescription.trim() === "") {
        alert("Please enter a risk response description.");
        return;
    }

    var riskScore = likelihood * impact;
    var riskLevel = getRiskLevel(riskScore);

    var risk = {
        name: riskName,
        type: riskType,
        likelihood: likelihood,
        impact: impact,
        minCost: minCost,
        costPercentage: costPercentage,
        score: riskScore,
        level: riskLevel,
        occurred: false,
        responseDescription: riskResponseDescription
    };

    risks.push(risk);
    updateRiskTable();
    document.getElementById('riskName').value = "";
    document.getElementById('minCost').value = "5000";
    document.getElementById('costPercentage').value = "5";
    document.getElementById('riskResponseDescription').value = "";
    
    // Log and award points for adding a risk
    logAction(`Added risk: ${risk.name} (${risk.type})`);
    if (typeof awardPoints === "function") {
        awardPoints(5, "Added risk to register");
    }
}

function getRiskLevel(score) {
    if (score <= 4) return "Low";
    else if (score <= 9) return "Medium";
    else if (score <= 15) return "High";
    else return "Critical";
}

function updateRiskTable() {
    var table = document.getElementById('riskTable');
    table.innerHTML = `
        <tr>
            <th>Risk Name</th>
            <th>Type</th>
            <th>Likelihood</th>
            <th>Impact</th>
            <th>Min Cost (€)</th>
            <th>Cost (% of Budget)</th>
            <th>Risk Score</th>
            <th>Risk Level</th>
            <th>Risk Response Description</th>
        </tr>
    `;

    risks.forEach(function (risk) {
        var row = table.insertRow();
        row.innerHTML = `
            <td class="left-align">${risk.name}</td>
            <td>${risk.type}</td>
            <td>${risk.likelihood}</td>
            <td>${risk.impact}</td>
            <td class="right-align">${risk.minCost.toLocaleString()}</td>
            <td>${risk.costPercentage}%</td>
            <td>${risk.score}</td>
            <td>${risk.level}</td>
            <td class="left-align">${risk.responseDescription}</td>
        `;
        row.classList.add(getRiskLevelClass(risk.level));
    });
}

function getRiskLevelClass(level) {
    switch (level) {
        case "Low": return "low";
        case "Medium": return "medium";
        case "High": return "high";
        case "Critical": return "critical";
        default: return "";
    }
}

function addRiskResponseListener() {
    var riskResponseSelect = document.getElementById('riskResponse');
    riskResponseSelect.addEventListener('change', function () {
        var response = riskResponseSelect.value;
        var explanationDiv = document.getElementById('responseExplanation');
        var explanation = getResponseExplanation(response);
        explanationDiv.innerHTML = explanation;
    });
}

function getResponseExplanation(response) {
    switch (response) {
        case "Mitigate":
            return `
                <strong>Mitigate:</strong> Take actions to reduce the likelihood or impact of the risk.<br>
                <em>Example:</em> Implement code reviews and refactoring sessions.
            `;
        case "Avoid":
            return `
                <strong>Avoid:</strong> Change plans to eliminate the risk entirely.<br>
                <em>Example:</em> Modify project scope to exclude high-risk features.
            `;
        case "Transfer":
            return `
                <strong>Transfer:</strong> Shift the risk to a third party, such as outsourcing or insurance.<br>
                <em>Example:</em> Outsource non-core functionalities to mitigate risk.
            `;
        case "Accept":
            return `
                <strong>Accept:</strong> Acknowledge the risk and decide to manage it if it occurs.<br>
                <em>Example:</em> Proceed without additional measures for minor risks.
            `;
        default:
            return "";
    }
}