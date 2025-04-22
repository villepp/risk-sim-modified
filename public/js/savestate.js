function saveTurn() {
	window['save' + currentTurn] = project;
	window['risk' + currentTurn] = currentRiskEvent;
}

function goBack() {
	project = window['save' + (currentTurn - 1)];
	currentRiskEvent = window['risk' + (currentTurn - 1)];
	currentTurn--;
	updateProjectStatus();
    updateCharts();
    checkWinCondition();
	redoTurn();
}