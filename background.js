chrome.runtime.onInstalled.addListener(() => {
  console.log('Article to Flowchart extension installed.');
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "generateFlowchart") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const activeTab = tabs[0];
      if (activeTab) {
        chrome.scripting.executeScript({
          target: { tabId: activeTab.id },
          files: ["content.js"]
        });
      }
    });
    sendResponse({ status: "processing" });
  } else if (request.action === "articleText") {
    chrome.storage.sync.get('apiKey', (data) => {
      if (!data.apiKey) {
        chrome.runtime.openOptionsPage();
        return;
      }

      const apiKey = data.apiKey;
      const prompt = `Please create a flowchart in Mermaid.js format that summarizes the following article:\n\n${request.content}`;

      fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        })
      })
      .then(response => response.json())
      .then(data => {
        if (data && data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0]) {
          const flowchart = data.candidates[0].content.parts[0].text;
          chrome.runtime.sendMessage({ action: "flowchartData", data: flowchart });
        } else {
            console.error("Unexpected response format from Gemini API:", data);
            chrome.runtime.sendMessage({ action: "flowchartError", error: "Unexpected API response" });
        }
      })
      .catch(error => {
        console.error('Error calling Gemini API:', error);
      });
    });
  }
  return true;
});
