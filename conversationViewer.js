    document.addEventListener('DOMContentLoaded', function () {
        let conversationsData = [];
        let currentLanguage = 'en'; // Default language is English

        const translations = {
            en: {
                appTitle: 'Claude Conversations Viewer',
                fileLabel: 'Select your conversations.json file',
                loadButton: 'Load Conversations',
                emptyStateText: 'Please load your conversations.json file to begin.',
                emptyStateDesc: 'This file comes from a Claude AI export and contains the history of your conversations.',
                errorLoading: 'Error loading JSON file:',
                noConversations: 'No conversations found in the file.',
                selectConversation: 'Select a conversation to view messages.',
                conversationsFound: 'conversations found',
                noMessages: 'No messages in this conversation.',
                createdDate: 'Created:',
                updatedDate: 'Last updated:',
                you: 'You',
                untitled: 'Untitled',
                placeHolder: 'Search Conversations...',
                searchButton: 'Anywhere',
                searchOptions: {
                    'anywhere': 'Anywhere',
                    'title': 'Title',
                    'message': 'Message Text',
                    'code': 'Code'
                    }

            },
            fr: {
                appTitle: 'Visualiseur de Conversations Claude',
                fileLabel: 'Sélectionnez votre fichier conversations.json',
                loadButton: 'Charger les conversations',
                emptyStateText: 'Veuillez charger votre fichier conversations.json pour commencer.',
                emptyStateDesc: 'Ce fichier provient d\'un export de Claude AI et contient l\'historique de vos conversations.',
                errorLoading: 'Erreur lors du chargement du fichier JSON:',
                noConversations: 'Aucune conversation trouvée dans le fichier.',
                selectConversation: 'Sélectionnez une conversation pour afficher les messages.',
                conversationsFound: 'conversations trouvées',
                noMessages: 'Aucun message dans cette conversation.',
                createdDate: 'Date de création:',
                updatedDate: 'Dernière mise à jour:',
                you: 'Vous',
                untitled: 'Sans titre',
                placeHolder: 'Rechercher des conversations...',
                searchButton: 'Partout',
                searchOptions: {
                    'anywhere': 'Partout',
                    'title': 'Titre',
                    'message': 'Messages',
                    'code': 'Code'
                    }
                }
            };

        const fileInput = document.getElementById('file-input');
        const loadButton = document.getElementById('load-button');
        const conversationsContainer = document.getElementById('conversations-container');
        const statsElement = document.getElementById('stats');
        const enButton = document.getElementById('en-btn');
        const frButton = document.getElementById('fr-btn');
        

        // Setup for the search type dropdown
        const searchTypeButton = document.querySelector('.search-type-button');
        const searchTypeDropdown = document.querySelector('.search-type-dropdown');

            // language independant search types - matches field names of translations[searchOptions]
        const searchTypes = ['anywhere', 'title', 'message', 'code'];

        let currentSearchType = 'anywhere'; // Default search type

        const searchField = document.getElementById('text-search')
        const searchClearButton = document.getElementById('clear-search')


// Toggle dropdown visibility
        searchTypeButton.addEventListener('click', function(e) {
            e.stopPropagation();
            const isHidden = searchTypeDropdown.hidden;
            searchTypeDropdown.hidden = !isHidden;
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', function() {
            searchTypeDropdown.hidden = true;
        });


        function setupSearchOptionListeners(){
            const searchTypeOptions = document.querySelectorAll('.search-type-option');
// Handle option selection
            searchTypeOptions.forEach(option => {
                option.addEventListener('click', function() {
                // Update the button text
                    currentSearchType = this.dataset.value;

                    const buttonText = translations[currentLanguage].searchOptions[currentSearchType] + ' ▾';
                    searchTypeButton.textContent = buttonText;

                // Update active state
                    searchTypeOptions.forEach(opt => opt.classList.remove('active'));
                    this.classList.add('active');

                // Hide the dropdown
                    searchTypeDropdown.hidden = true;

                    performSearch();
                });
            });
        }

        function clearSearch() {
            renderConversations(conversationsData);
        }

        function performSearch(){
            if (searchField.value == "") return

             const request = {
                searchString:searchField.value,
                mode:currentSearchType,
                data:conversationsData
            }

            const filteredData = searchFilter(request);

            if (false) { //(filteredData.length == 0) {
                console.log("empty search - provide feedback")
            }
            else {
                renderConversations(filteredData);
            }
        }

        // Clear button functionality
        searchClearButton.addEventListener('click', function() {
            searchField.value = '';
            this.style.display = 'none';
                //clear Search
            renderConversations(conversationsData)
        });

        searchField.addEventListener('input', function() {
            searchFieldInput(this.value);

        //handle live search here instead of keydown because this is called after key has been inserted.

            const searchOnKeypress = true // live search

            if ( searchOnKeypress) {
                performSearch()
                if (searchField.value == "") {
                    clearSearch()
                }
            }

        });


        searchField.addEventListener('keydown', function(event) {
          searchFieldKeyDown(event);
        });


        // Language toggle functionality
        enButton.addEventListener('click', function () {
            setLanguage('en');
        });

        frButton.addEventListener('click', function () {
            setLanguage('fr');
        });
	
		
		// Add event listener for the 'change' event
		fileInput.addEventListener('change', handleFileSelect);
		
		// Function to handle file selection
		function handleFileSelect(event) {
			const file = event.target.files[0]; // Get the selected file
			if (file) {
			readConversations();
			}
		}


        function setLanguage(lang) {
            currentLanguage = lang;

            // Update UI to reflect language
            if (lang === 'en') {
                enButton.classList.add('active');
                frButton.classList.remove('active');
            } else {
                enButton.classList.remove('active');
                frButton.classList.add('active');
            }

            // Update all text elements
            document.getElementById('app-title').textContent = translations[lang].appTitle;
            document.getElementById('file-label').textContent = translations[lang].fileLabel;
            document.getElementById('load-button').textContent = translations[lang].loadButton;
            searchField.placeholder = translations[lang].placeHolder;

         // Update search button text
            const buttonText = translations[lang].searchOptions[currentSearchType] + ' ▾';
            searchTypeButton.textContent = buttonText
            
            // Update dropdown options
            buildSearchDropdown()
            
            // Update search placeholder
            document.getElementById('text-search').placeholder = translations[lang].placeHolder;

            // Update empty state text if it's currently showing
            const emptyStateElement = document.querySelector('.empty-state');
            if (emptyStateElement) {
                const paragraphs = emptyStateElement.querySelectorAll('p');
                if (paragraphs.length >= 2) {
                    paragraphs[0].textContent = translations[lang].emptyStateText;
                    paragraphs[1].textContent = translations[lang].emptyStateDesc;
                }
            }

            // If conversations are loaded, update the stats text and redisplay current conversation
            if (conversationsData.length > 0) {
                statsElement.textContent = `${conversationsData.length} ${translations[lang].conversationsFound}`;

                // If a conversation is selected, redisplay it with the new language
                const activeItem = document.querySelector('.conversation-item.active');
                if (activeItem) {
                    const conversationIndex = parseInt(activeItem.getAttribute('data-index'));
                    displayMessages(conversationsData[conversationIndex]);
                }
            }
        }

        function buildSearchDropdown() {
            searchTypeDropdown.innerHTML = ''; // Clear existing options
            
            // Add options based on searchTypes array
            searchTypes.forEach(value => {
                const option = document.createElement('div');
                option.className = 'search-type-option';
                option.dataset.value = value;
                option.textContent = translations[currentLanguage].searchOptions[value];
                
                // Set active state for current search type
                if (value === currentSearchType) {
                    option.classList.add('active');
                }
                
                searchTypeDropdown.appendChild(option);
            });
        
        // Set event listeners for new options
        setupSearchOptionListeners();
    }


        // Configure marked.js options
        marked.setOptions({
            breaks: true,          // Add line breaks on single line breaks
            gfm: true,             // Enable GitHub Flavored Markdown
            headerIds: false,      // Disable adding IDs to headings
            mangle: false          // Disable escaping certain characters
        });

        loadButton.addEventListener('click',readConversations);

		function readConversations() {
            const file = fileInput.files[0];
            if (!file) {
                alert(translations[currentLanguage].fileLabel);
                return;
            }

            const loadingText = currentLanguage === 'en' ? 'Loading conversations...' : 'Chargement des conversations...';
            conversationsContainer.innerHTML = `<div class="loading">${loadingText}</div>`;

            const reader = new FileReader();
            reader.onload = function (e) {
                try {
                    conversationsData = JSON.parse(e.target.result);
                    // cache some searching info
                    prepareSearch(conversationsData)
                    renderConversations(conversationsData);
                } catch (error) {
                    alert(`${translations[currentLanguage].errorLoading} ${error.message}`);
                    const errorText = currentLanguage === 'en'
                        ? 'An error occurred while loading. Please check that the file is in the correct format.'
                        : 'Une erreur est survenue lors du chargement. Veuillez vérifier que le fichier est au bon format.';
                    conversationsContainer.innerHTML = `<div class="empty-state"><p>${errorText}</p></div>`;
                }
            };
            reader.readAsText(file);
        	}

        function renderConversations(data) {
            if (!Array.isArray(data) || data.length === 0) {
                conversationsContainer.innerHTML = `<div class="empty-state"><p>${translations[currentLanguage].noConversations}</p></div>`;
                return;
            }

            // Display statistics
            statsElement.textContent = `${data.length} ${translations[currentLanguage].conversationsFound}`;

            // Create UI elements
            conversationsContainer.innerHTML = `
                <div class="conversation-list" id="conversation-list"></div>
                <div class="messages-container" id="messages-container">
                    <div class="empty-state">
                        <p>${translations[currentLanguage].selectConversation}</p>
                    </div>
                </div>
            `;

             const conversationList = document.getElementById('conversation-list');
            // Sort conversations by date (newest first)
            data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

            
            // Add conversations to the list
            data.forEach((conversation, index) => {
            
                const conversationItem = document.createElement('div');
                conversationItem.className = 'conversation-item';
                conversationItem.setAttribute('data-index', index);

                const date = new Date(conversation.created_at);
                const formattedDate = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();

                conversationItem.innerHTML = `
                    <div class="conversation-title">${conversation.name || translations[currentLanguage].untitled}</div>
                    <div class="conversation-date">${formattedDate}</div>
                `;

                if (currentSearchType == 'title') {
                    conversationItem.innerHTML = highlightSearchTerms(conversationItem.innerHTML)
                }

                conversationItem.addEventListener('click', function () {
                    // Deselect previously active item
                    const activeItems = document.querySelectorAll('.conversation-item.active');
                    activeItems.forEach(item => item.classList.remove('active'));

                    // Select this item
                    this.classList.add('active');

                    // Display messages for this conversation
                    const conversationIndex = parseInt(this.getAttribute('data-index'));
                    displayMessages(data[conversationIndex]);
                });

                conversationList.appendChild(conversationItem);
            });

            // Automatically select the first conversation
            if (conversationList.firstChild) {
                conversationList.firstChild.click();
            }
        } // function renderConversations

        function displayMessages(conversation) {
            const messagesContainer = document.getElementById('messages-container');

            if (!conversation || !conversation.chat_messages || conversation.chat_messages.length === 0) {
                messagesContainer.innerHTML = `<div class="empty-state"><p>${translations[currentLanguage].noMessages}</p></div>`;
                return;
            }

            let messagesHTML = `
                <div class="conversation-info">
                    <h2>${conversation.name || translations[currentLanguage].untitled}</h2>
                    <div>${translations[currentLanguage].createdDate} ${formatDate(conversation.created_at)}</div>
                    <div>${translations[currentLanguage].updatedDate} ${formatDate(conversation.updated_at)}</div>
                </div>
            `;

            conversation.chat_messages.forEach(message => {
                const isUser = message.sender === 'human';
                const messageClass = isUser ? 'user' : 'assistant';
                const senderName = isUser ? translations[currentLanguage].you : 'Claude';

                messagesHTML += `
                    <div class="message ${messageClass}">
                        <div class="message-header">
                            <span class="message-sender">${senderName}</span>
                            <span class="message-time">${formatDate(message.created_at)}</span>
                        </div>
                        <div class="message-content">
                `;

                if (message.content && Array.isArray(message.content)) {
                    messagesHTML += processMessageContent(message.content);
                } else if (message.text) {
                    messagesHTML += formatMessageContent(message.text);
                }

                messagesHTML += `
                        </div>
                    </div>
                `;
            });

            messagesContainer.innerHTML = messagesHTML;

            // Apply syntax highlighting to all code blocks
            document.querySelectorAll('pre code').forEach((block) => {
                hljs.highlightElement(block);
            });

            // Scroll to the bottom to see the most recent messages
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }

        // This code should be integrated into the processMessageContent function

        function processMessageContent(contentArray) {
            let result = '';

            contentArray.forEach(contentItem => {
                if (contentItem.type === 'text') {
                    // Get the original text
                    let text = contentItem.text;

                    // Parse and extract artifacts from the text
                    let parts = extractArtifacts(text);

                    // Process each part (either regular text or artifact)
                    parts.forEach(part => {
                        if (part.type === 'text') {
                            result += `<div class="message-section">${formatMessageContent(part.content)}</div>`;
                        } else if (part.type === 'artifact') {
                            result += generateArtifactHTML(part.artifact);
                        }
                    });
                } else if (contentItem.type === 'tool_use') {
                    if (contentItem.name === 'artifacts') {
                        result += processArtifact(contentItem);
                    } else if (contentItem.name === 'repl') {
                        // Handle repl tool use
                        result += `<div class="message-section"><strong>Analysis</strong><pre><code class="language-javascript">${escapeHtml(contentItem.input.code.trim())}</code></pre></div>`;
                    }
                } else if (contentItem.type === 'tool_result') {
                    if (contentItem.name !== 'artifacts') {
                        try {
                            // Try to parse the logs from the tool result
                            let logs = JSON.parse(contentItem.content[0].text).logs;
                            result += `<div class="message-section"><strong>Result</strong><pre>${escapeHtml(logs.join("\n"))}</pre></div>`;
                        } catch (e) {
                            // Fallback if parsing fails
                            result += `<div class="message-section"><strong>Result</strong><pre>${escapeHtml(contentItem.content[0].text)}</pre></div>`;
                        }
                    }
                }
            });

            return result;
        }

        // Function to extract artifacts from text content
        function extractArtifacts(text) {
            const parts = [];
            let currentIndex = 0;

            // Regular expression to match antArtifact tags
            const artifactRegex = /<antArtifact([^>]*)>([\s\S]*?)<\/antArtifact>/g;
            let match;

            while ((match = artifactRegex.exec(text)) !== null) {
                // If there's text before the artifact, add it
                if (match.index > currentIndex) {
                    parts.push({
                        type: 'text',
                        content: text.substring(currentIndex, match.index)
                    });
                }

                // Extract artifact attributes
                const attributesStr = match[1];
                const attributesRegex = /(\w+)=["']([^"']*)["']/g;
                const artifact = {
                    content: match[2],
                    attributes: {}
                };

                let attrMatch;
                while ((attrMatch = attributesRegex.exec(attributesStr)) !== null) {
                    artifact.attributes[attrMatch[1]] = attrMatch[2];
                }

                // Add the artifact
                parts.push({
                    type: 'artifact',
                    artifact: artifact
                });

                // Update current position
                currentIndex = match.index + match[0].length;
            }

            // Add any remaining text
            if (currentIndex < text.length) {
                parts.push({
                    type: 'text',
                    content: text.substring(currentIndex)
                });
            }

            return parts;
        }

        // Function to generate HTML for an artifact
        function generateArtifactHTML(artifact) {
            const {attributes, content} = artifact;

            let artifactHTML = '<div class="artifact">';

            // Display identifier as header if available
            if (attributes.identifier) {
                artifactHTML += `<div class="artifact-header">Artifact: ${attributes.identifier}</div>`;
            }

            // Display title if available
            if (attributes.title) {
                artifactHTML += `<div class="artifact-file">${attributes.title}</div>`;
            }

            // Process content based on type
            const type = attributes.type || 'text/plain';

            if (type === 'text/markdown') {
                artifactHTML += `<div class="artifact-content">${formatMessageContent(content)}</div>`;
            } else if (type === 'application/vnd.ant.code' || type.startsWith('text/')) {
                // Determine language for syntax highlighting
                let language = '';
                if (type === 'text/html') language = 'html';
                else if (type === 'text/css') language = 'css';
                else if (type === 'text/javascript') language = 'javascript';

                artifactHTML += `<div class="artifact-content">
                    <pre><code class="${language}">${escapeHtml(content)}</code></pre>
                </div>`;
            } else {
                // Default display for unknown types
                artifactHTML += `<div class="artifact-content"><pre><code>${escapeHtml(content)}</code></pre></div>`;
            }

            artifactHTML += '</div>';
            return artifactHTML;
        }

        function processArtifact(artifact) {
            if (!artifact.input) return '';

            const typeLookup = {
                'text/markdown': 'markdown',
                'application/vnd.ant.code': '',
                'text/html': 'html',
                'image/svg+xml': 'svg',
                'application/vnd.ant.mermaid': 'mermaid',
                'application/vnd.ant.react': 'jsx'
            };

            let artifactHTML = '<div class="artifact">';
            artifactHTML += `<div class="artifact-header">Artifact: ${artifact.input.id}</div>`;

            const command = artifact.input.command;

            // Display title or file type
            if (artifact.input.title) {
                artifactHTML += `<div class="artifact-file">${artifact.input.title}</div>`;
            } else if (artifact.input.language) {
                artifactHTML += `<div class="artifact-file">File type: ${artifact.input.language}</div>`;
            }

            // Process based on command (create, rewrite, update)
            if (command === 'create' || command === 'rewrite') {
                if (artifact.input.content) {
                    if (artifact.input.type === 'text/markdown') {
                        artifactHTML += `<div class="artifact-content">${formatMessageContent(artifact.input.content)}</div>`;
                    } else if (artifact.input.type === 'application/vnd.ant.code' || artifact.input.language) {
                        // Determine language for syntax highlighting
                        let language = '';
                        if (artifact.input.language) {
                            language = artifact.input.language.toLowerCase();
                        } else if (artifact.input.type) {
                            language = typeLookup[artifact.input.type] || '';
                        }

                        artifactHTML += `<div class="artifact-content">
                            <pre><code class="${language}">${escapeHtml(artifact.input.content)}</code></pre>
                        </div>`;
                    } else {
                        artifactHTML += `<div class="artifact-content"><pre><code>${escapeHtml(artifact.input.content)}</code></pre></div>`;
                    }
                }
            } else if (command === 'update') {
                // Special display for updates
                const findHeader = currentLanguage === 'en' ? 'Find this:' : 'Trouver ceci:';
                const replaceHeader = currentLanguage === 'en' ? 'Replace with this:' : 'Remplacer par ceci:';

                artifactHTML += `<div class="artifact-update">
                    <div class="update-section">
                        <h4>${findHeader}</h4>
                        <pre><code>${escapeHtml(artifact.input.old_str)}</code></pre>
                    </div>
                    <div class="update-section">
                        <h4>${replaceHeader}</h4>
                        <pre><code>${escapeHtml(artifact.input.new_str)}</code></pre>
                    </div>
                </div>`;
            }

            artifactHTML += '</div>';
            return artifactHTML;
        }

        function formatDate(dateString) {
            if (!dateString) return 'N/A';
            const date = new Date(dateString);
            return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
        }

        function formatMessageContent(text) {
            if (!text) return '';
            text = text.replace("```php", "```html");
            // Simplified approach for HTML detection and display
            const hasHtmlMarkup = (str) => {
                return /<(!DOCTYPE|html|head|body|div|nav|section|script|style)[^>]*>/i.test(str);
            };

            // If it's obviously HTML and not in a markdown code block
            if (hasHtmlMarkup(text) && !text.includes('```html')) {
                let htmlBlock = `<pre><code class="language-html">${escapeHtml(text)}</code></pre>`;
                if (currentSearchType == "anywhere") {
                  htmlBlock =  highlightSearchTerms(htmlBlock);
              } 
              return htmlBlock
          }

            // Configure markdown renderer
            const renderer = new marked.Renderer();

            // Handle code blocks
            renderer.code = function (code, language) {
                // Make sure language isn't undefined
                const validLanguage = language || '';
                const escapedCode = escapeHtml(code.text);

                try {
                    if (validLanguage && hljs.getLanguage(validLanguage)) {
                        const highlighted = hljs.highlight(escapedCode, {
                            language: validLanguage,
                            ignoreIllegals: true
                        }).value;
                        return `<pre><code class="hljs ${validLanguage}">${highlighted}</code></pre>`;
                    } else {
                        // If language isn't specified or not supported
                        return `<pre><code class="hljs">${escapedCode}</code></pre>`;
                    }
                } catch (e) {
                    console.error("Highlight error:", e);
                    return `<pre><code class="hljs">${escapedCode}</code></pre>`;
                }
            };

            // Set marked options
            marked.setOptions({
                renderer: renderer,
                gfm: true,
                breaks: true,
                sanitize: false,
                smartypants: false
            });

            let html = marked.parse(text);
            if (currentSearchType == "anywhere") {
              html =  highlightSearchTerms(html);
            } 
            return html
        }

        // Robust HTML escape function
        function escapeHtml(text) {
            if (!text) return '';

            if (typeof text !== 'string') {
                text = String(text);
            }

            return text
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#039;");
        }

        // Initialize highlight.js
        hljs.configure({
            languages: ['javascript', 'python', 'java', 'html', 'css', 'xml', 'json', 'bash', 'typescript', 'sql', 'php']
        });

        // handle keypress in search field. 
        function searchFieldKeyDown(event) {
            const searchOnKeypress = true // live search

            if (event.key == 'Escape') {
                searchField.blur();
                searchField.value = "";
                // restore
                clearSearch();
            }

            else if (event.key === 'Enter' || searchOnKeypress) {
                if (event.key == 'Enter') {
            // force defocus of field so Enter key can be used to navigate
                    searchField.blur();
                }
                const searchString = searchField.value
                performSearch();
            }
        }

        function autoload(path) {
            // auto loading in Safari/Mac requires enable Developer settings, 
            //in preferences->Developer, check "Disable Local File Restrictions"
            fetch(path)
            .then(response => response.json())
            .then(data => {
                try {
                    conversationsData = data;
                    // cache some searching info
                    prepareSearch(conversationsData)
                    renderConversations(conversationsData);
                } catch (error) {
                    alert(`${translations[currentLanguage].errorLoading} ${error.message}`);
                    const errorText = currentLanguage === 'en'
                    ? 'An error occurred while loading. Please check that the file is in the correct format.'
                    : 'Une erreur est survenue lors du chargement. Veuillez vérifier que le fichier est au bon format.';
                    conversationsContainer.innerHTML = `<div class="empty-state"><p>${errorText}</p></div>`;
                }
            }
            )
        }
       buildSearchDropdown()
       initSearchNavigation()
       // uncomment to load conversations automatically. specify path.
     //  autoload('conversations.json')
}); // addEventListener('DOMContentLoaded
