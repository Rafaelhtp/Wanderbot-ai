const chatForm = document.getElementById('chat-form');
const userInput = document.getElementById('user-input');
const chatBox = document.getElementById('chat-box');

let conversationHistory = [];

function appendMessage(role, text) {
    const msgDiv = document.createElement('div');
    msgDiv.classList.add('message', role);
    msgDiv.innerText = text;
    chatBox.appendChild(msgDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}

chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const message = userInput.value.trim();
    if (!message) return;

    appendMessage('user', message);
    userInput.value = '';
    conversationHistory.push({ role: 'user', text: message });

    // Tampilkan indikator loading
    const thinkingDiv = document.createElement('div');
    thinkingDiv.classList.add('message', 'bot');
    thinkingDiv.innerText = 'WanderBot lagi mikir... 🤔';
    chatBox.appendChild(thinkingDiv);

    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ conversation: conversationHistory })
        });

        const data = await response.json();
        chatBox.removeChild(thinkingDiv);

        if (data.result) {
            appendMessage('bot', data.result);
            conversationHistory.push({ role: 'model', text: data.result });
        } else {
            appendMessage('bot', 'Aduh, sepertinya WanderBot lagi lowbat. Coba lagi ya! 🪫');
        }
    } catch (error) {
        chatBox.removeChild(thinkingDiv);
        appendMessage('bot', 'Waduh, koneksinya lagi macet nih. 🚦');
    }
});