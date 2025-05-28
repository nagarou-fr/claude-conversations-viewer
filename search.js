// search.js


// Global variables for search
let currentHighlightIndex = -1;
let searchHighlights = [];
let toastTimeout = null;

// initialize search navigation
function initSearchNavigation() {
  const toast = document.createElement('div');
  toast.className = 'search-toast';
  toast.style.display = 'none';
  document.body.appendChild(toast);
  
  // Add keyboard event listener for the whole document
  document.addEventListener('keydown', handleKeyNavigation);
}

// handle keyboard navigation
function handleKeyNavigation(e) {
  // Only process if we have search highlights or filtered conversations
  const allConversations = document.querySelectorAll('.conversation-item');
  if (allConversations.length === 0) return;
  
  // Next match (Cmd+G, Enter, F3)
  if ((e.key === 'g' && e.metaKey && !e.shiftKey) || 
      (e.key === 'Enter' && !e.shiftKey) || 
      (e.key === 'F3' && !e.shiftKey)) {
    e.preventDefault();

            // If we have highlights in the current conversation and not at the last one
if (searchHighlights.length > 0 && currentHighlightIndex < searchHighlights.length - 1) {
    navigateToNextHighlight();
} 
            // If we're at the last highlight or no highlights, move to next conversation
else {
    navigateToNextConversation();
}
}

  // Previous match (Cmd+Shift+G, Shift+Enter, Shift+F3)
if ((e.key === 'g' && e.metaKey && e.shiftKey) || 
  (e.key === 'Enter' && e.shiftKey) || 
  (e.key === 'F3' && e.shiftKey)) {
    e.preventDefault();

    // If we have highlights in the current conversation and not at the first one
if (searchHighlights.length > 0 && currentHighlightIndex > 0) {
  navigateToPrevHighlight();
} 
    // If we're at the first highlight or no highlights, move to previous conversation
else {
  navigateToPrevConversation();
}
}
}

// navigate to the next conversation
function navigateToNextConversation() {
  const activeItem = document.querySelector('.conversation-item.active');
  if (!activeItem) return;
  
  const currentIndex = parseInt(activeItem.getAttribute('data-index'));
  const totalConversations = document.querySelectorAll('.conversation-item').length;
  
  // Calculate next index with wrapping
  const nextIndex = (currentIndex + 1) % totalConversations;
  
  // Find and select the next conversation
  const nextConversation = document.querySelector(`.conversation-item[data-index="${nextIndex}"]`);
  if (nextConversation) {
    // Remove active class from current conversation
    activeItem.classList.remove('active');
    
    // Add active class to next conversation
    nextConversation.classList.add('active');
    
    // Simulate click to load the conversation (if needed)
    nextConversation.click();
    
    nextConversation.scrollIntoView({behavior: 'smooth',block: 'nearest'});


    // After content loads, apply highlighting and navigate to first match
    setTimeout(() => {
      // Reset highlight index for the new conversation
      currentHighlightIndex = -1;
            
      // Update highlights and navigate to first one
      updateSearchHighlights();
    }, 100); // Short delay to ensure content is loaded
}
}

// navigate to the previous conversation
function navigateToPrevConversation() {
  const activeItem = document.querySelector('.conversation-item.active');
  if (!activeItem) return;
  
  const currentIndex = parseInt(activeItem.getAttribute('data-index'));
  const totalConversations = document.querySelectorAll('.conversation-item').length;
  
  // Calculate previous index with wrapping
  const prevIndex = (currentIndex - 1 + totalConversations) % totalConversations;
  
  // Find and select the previous conversation
  const prevConversation = document.querySelector(`.conversation-item[data-index="${prevIndex}"]`);
  if (prevConversation) {
    // Remove active class from current conversation
    activeItem.classList.remove('active');
    
    // Add active class to previous conversation
    prevConversation.classList.add('active');
    
    // Simulate click to load the conversation (if needed)
    prevConversation.click();
    
    prevConversation.scrollIntoView({
    behavior: 'smooth',
    block: 'nearest'
});

    // After content loads, apply highlighting and navigate to last match
    setTimeout(() => {
      
      // Get all highlights in the new conversation
      searchHighlights = Array.from(document.querySelectorAll('.search-highlight'));
      
      // Set index to last highlight
      currentHighlightIndex = searchHighlights.length - 1;
      
      // If we have highlights, navigate to the last one
      if (searchHighlights.length > 0) {
        navigateToHighlight(currentHighlightIndex);
    } else {
        showToast('No matches in this conversation');
    }
    }, 100); // Short delay to ensure content is loaded
}
}

// update search highlights
function updateSearchHighlights() {
  // Get all highlight elements
  searchHighlights = Array.from(document.querySelectorAll('.search-highlight'));
  
  if (searchHighlights.length > 0) {
    // Show toast with navigation instructions
    showToast(`${searchHighlights.length} matches found. ⌘G (next), ⇧⌘G (previous)`);
    
    // Navigate to the first match
    currentHighlightIndex = 0;
    navigateToHighlight(currentHighlightIndex);
} else {
    const totalConversations = document.querySelectorAll('.conversation-item').length;
    if (totalConversations > 0) {
      showToast('No matches in this conversation. Try another conversation.');
  }
}
}



// navigate to a specific highlight by index
function navigateToHighlight(index) {
  if (!searchHighlights || searchHighlights.length === 0) return;
  if (index < 0 || index >= searchHighlights.length) return;
  
  // Remove current highlight styling from all highlights
  searchHighlights.forEach(h => h.classList.remove('current-highlight'));
  
  // Apply current highlight styling
  searchHighlights[index].classList.add('current-highlight');
  
  // Show toast with position
  showToast(`Match ${index + 1} of ${searchHighlights.length}`, 1500);
  
  // Scroll to the highlight
  searchHighlights[index].scrollIntoView({
    behavior: 'smooth',
    block: 'center'
});
}



// navigate to the next highlight
function navigateToNextHighlight() {
  if (searchHighlights.length === 0) return;
  
  // Move to next highlight
  currentHighlightIndex = (currentHighlightIndex + 1) % searchHighlights.length;
  
  // Navigate to that highlight
  navigateToHighlight(currentHighlightIndex);
}

// navigate to the previous highlight
function navigateToPrevHighlight() {
  if (searchHighlights.length === 0) return;
  
  // Move to previous highlight
  currentHighlightIndex = (currentHighlightIndex - 1 + searchHighlights.length) % searchHighlights.length;
  
  // Navigate to that highlight
  navigateToHighlight(currentHighlightIndex);
}



function showToast(message, duration = 3000) {
  const toast = document.querySelector('.search-toast');
  if (!toast) return;
  
  // Clear any existing timeout
  if (toastTimeout) {
    clearTimeout(toastTimeout);
  }
  
  // Update message and show toast
  toast.textContent = message;
  toast.style.display = 'block';
  
  // Delay to ensure transition works
  setTimeout(() => {
    toast.classList.add('visible');
  }, 10);
  
  // Set timeout to hide toast
  toastTimeout = setTimeout(() => {
    toast.classList.remove('visible');
    
    // Remove from DOM after transition
    setTimeout(() => {
      toast.style.display = 'none';
    }, 300);
  }, duration);
}


    // for a given convo, create an efficient search string:
    // pre-lowercased - done once, not on every search 
    // and pre-collect all the messages.

function prepareSearch(allConversations) {

    allConversations.forEach(conversation => {
        const allMessages = conversation?.chat_messages?.map(msg => msg.text);
        const content = allMessages?.join(" ").normalize('NFD').toLowerCase();
        conversation.searchableContent = content;
    });
}

     // filter by search String
function searchFilter(request) {
    const searchString = request.searchString
    const data = request.data
    const mode = request.mode

    if (searchString == "") {
        return data;
    }

    lowerSearchString = searchString.normalize('NFD').toLowerCase()
            // search all conversations


    let filteredData = []
    if (mode == 'anywhere') {
     filteredData = data.filter(conversation =>  
        conversation?.searchableContent?.includes(lowerSearchString)
        );
 }
     else if (mode == 'title') {
     filteredData = data.filter(conversation =>  
        conversation.name?.toLowerCase().includes(lowerSearchString)
        );
}
else {
}
return filteredData
}

// handle general input in search field
function searchFieldInput(searchFieldContents) {

// Show/hide clear button based on search content
    const clearButton = document.getElementById('clear-search');

    if (searchFieldContents == "") {
        clearButton.style.display = 'none';
    } else {
        clearButton.style.display = 'flex';
    }
}

// highlight search terms in HTML without breaking tags
function highlightSearchTerms(html) {

    const searchString = document.getElementById('text-search').value;

    if (!searchString || searchString.trim() === '') {
        return html; // No search string, return original
    }
    
    // Escape special regex characters and create search pattern
    const escapedSearchString = searchString.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escapedSearchString, 'gi');
    
    // Split HTML by tags to avoid breaking HTML structure
    const parts = html.split(/(<[^>]*>)/g);
    
    // Process each part - only apply highlighting to text between tags
    for (let i = 0; i < parts.length; i++) {
        // Only modify text nodes (odd indices in the array)
        if (i % 2 === 0) {
            parts[i] = parts[i].replace(regex, match => 
        `<span class="search-highlight">${match}</span>`
        );
        }
    }
    
    return parts.join('');
}


