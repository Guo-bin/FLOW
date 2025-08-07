const paragraphs = Array.from(document.querySelectorAll('p'));
const articleText = paragraphs.map(p => p.textContent).join('\n');

chrome.runtime.sendMessage({ action: "articleText", content: articleText });
