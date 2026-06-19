"use strict";

  const toggleButton = document.getElementById('toggle-btn')
  const sidebar = document.getElementById('sidebar')


function toggleSidebar() {
  sidebar.classList.toggle('close')
  toggleButton.classList.toggle('rotate')

  closeAllSubMenus()
}


function calculateResult() {
  // Extracting form input values
  const plantType = parseFloat(document.getElementById("plantType").value);
  const location = parseFloat(document.getElementById("location").value);
  const interval = parseFloat(document.getElementById("interval").value);
  const areaSize = parseFloat(document.getElementById("areaSize").value);
  const dripType = parseFloat(document.getElementById("dripType").value);
  const dripFlow = parseFloat(document.getElementById("dripFlow").value);

  // Calculating results
  const waterPortion = plantType * location * interval * (areaSize / 1000);
  const dripPresCount = areaSize / dripType ** 2;
  const drippersFlow = (dripPresCount * dripFlow) / 1000;
  const timeInHours = waterPortion / drippersFlow;

  // Convert time to hours, minutes, and seconds
  const hours = Math.floor(timeInHours);
  const minutes = Math.floor((timeInHours - hours) * 60);
  const seconds = Math.floor(((timeInHours - hours) * 60 - minutes) * 60);

  // Show the result container if hidden
  const resultContainer = document.getElementById("resultContainer");
  resultContainer.classList.remove("hidden");

  // Create a new result entry and add it to the top
  const resultItem = document.createElement("div");
  resultItem.className = "project-container";
  resultItem.innerHTML = `
    <strong>yearly amount of water:</strong> ${waterPortion.toFixed(2)}mkh<br>
    <strong class="duration">⏱</strong> ${hours}h ${minutes}m ${seconds}s
    <strong>Drippers/Plants:</strong> ${dripPresCount.toFixed(2)}<br>
    <strong>Dripper Flow:</strong> ${drippersFlow.toFixed(2)}mkh<br>
    
  `;

  // Prepend the new result to the container
  resultContainer.insertAdjacentElement("afterbegin", resultItem);
}
