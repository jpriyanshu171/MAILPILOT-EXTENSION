console.log("📩 MailPilot AI - Content Script Loaded");

function createAIButton() {
    const button = document.createElement('div');
    button.className = 'T-I J-J5-Ji aoO v7 T-I-atl L3 ai-reply-button';
    button.innerHTML = 'AI Reply';
    button.style.backgroundColor = "#221f1fff";
    button.style.color = "white";
    button.style.border = "none";
    button.style.borderRadius = "20px";
    button.style.padding = "6px 16px";
    button.style.fontSize = "14px";
    button.style.fontWeight = "bold";
    button.style.cursor = "pointer";
    button.style.marginLeft = "8px";
    button.style.boxShadow = "0 2px 5px rgba(0,0,0,0.2)";
    button.style.transition = "all 0.2s ease";
    button.setAttribute('role', 'button');
    button.setAttribute('data-tooltip', 'Generate AI Reply');

    // Hover effect
    button.addEventListener("mouseover", () => {
        button.style.backgroundColor = "#3c3a3aff";
    });
    button.addEventListener("mouseout", () => {
        button.style.backgroundColor = "#221f1fff";
    });

    return button;
}

function getEmailContent() {
    const selectors = ['.h7', '.a3s.aiL', '.gmail_quote', '[role="presentation"]'];
    for (const selector of selectors) {
        const content = document.querySelector(selector);
        if (content) {
            return content.innerText.trim();
        }
    }
    return '';
}

function findComposeToolbar() {
    const selectors = ['.btC', '.aDh', '[role="toolbar"]', '.gU.Up'];
    for (const selector of selectors) {
        const toolbar = document.querySelector(selector);
        if (toolbar) return toolbar;
    }
    return null;
}

function injectButton() {
    if (document.querySelector('.ai-reply-button')) return; // avoid duplicates

    const toolbar = findComposeToolbar();
    if (!toolbar) {
        console.log("Toolbar not found");
        return;
    }

    console.log("Toolbar found, creating AI button");
    const button = createAIButton();

    button.addEventListener('click', async () => {
        try {
            button.innerHTML = '⏳ Generating...';
            button.style.opacity = "0.6";
            button.disabled = true;

            const emailContent = getEmailContent();
            if (!emailContent) {
                alert("⚠️ No email content found!");
                return;
            }

            const response = await fetch('http://localhost:8080/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    emailText: emailContent,
                    tone: "professional"
                })
            });

            if (!response.ok) throw new Error('API Request Failed');

            const data = await response.json();
            const generatedReply = data.reply;

            const composeBox = document.querySelector('[role="textbox"][g_editable="true"]');
            if (composeBox) {
                composeBox.focus();
                document.execCommand('insertText', false, generatedReply);
            } else {
                console.error('Compose box not found');
                alert("⚠️ Could not find compose box.");
            }
        } catch (error) {
            console.error(error);
            alert('❌ Failed to generate reply. Is backend running?');
        } finally {
            button.innerHTML = 'AI Reply';
            button.style.opacity = "1";
            button.disabled = false;
        }
    });

    toolbar.insertBefore(button, toolbar.firstChild);
}

const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
        const addedNodes = Array.from(mutation.addedNodes);
        const hasComposeElements = addedNodes.some(node =>
            node.nodeType === Node.ELEMENT_NODE &&
            (node.matches('.aDh, .btC, [role="dialog"]') ||
             node.querySelector('.aDh, .btC, [role="dialog"]'))
        );

        if (hasComposeElements) {
            console.log("✉️ Compose Window Detected");
            setTimeout(injectButton, 500);
        }
    }
});

observer.observe(document.body, { childList: true, subtree: true });
