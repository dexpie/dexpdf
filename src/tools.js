// Tool handling logic
window.addEventListener('open-tool', (e) => {
  const toolId = e.detail;

  // Save last used tool
  localStorage.setItem('lastTool', toolId);

  // Update URL without page reload
  const url = new URL(window.location);
  url.searchParams.set('tool', toolId);
  window.history.pushState({}, '', url);

  // Open tool logic here
  console.log('Opening tool:', toolId);
  // You can add specific tool opening logic here
});