document.addEventListener('DOMContentLoaded', () => {
  const generateButton = document.getElementById('generate-flowchart');
  generateButton.addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: "generateFlowchart" }, (response) => {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError.message);
      } else {
        console.log('Received response from background script:', response);
      }
    });
  });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "flowchartData") {
    const flowchartContainer = document.getElementById('flowchart-container');
    flowchartContainer.innerHTML = '';
    const mermaidCode = request.data.replace(/```mermaid\n/g, '').replace(/```/g, '');
    flowchartContainer.innerHTML = mermaidCode;
  } else if (request.action === "flowchartError") {
    const flowchartContainer = document.getElementById('flowchart-container');
    flowchartContainer.innerHTML = `<p>Error: ${request.error}</p>`;
  }
});
