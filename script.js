// script.js
document.addEventListener("DOMContentLoaded", () => {
  // DOM Elements
  const chatWindow = document.getElementById("chat-window");
  const chatForm = document.getElementById("chat-form");
  const messageInput = document.getElementById("message-input");
  const personaName = document.getElementById("persona-name");
  const hiteshBtn = document.getElementById("hitesh-btn");
  const piyushBtn = document.getElementById("piyush-btn");

  let currentPersona = "hitesh"; // Default persona

  // Load chat histories from localStorage or create a new object
  let chatHistories = JSON.parse(localStorage.getItem("chatHistories")) || {
    hitesh: [],
    piyush: [],
  };

  // --- Functions ---

  // Function to add a message to the UI
  const addMessageToUI = (sender, text) => {
    const messageElement = document.createElement("div");
    messageElement.classList.add("message", sender);
    messageElement.textContent = text;
    chatWindow.appendChild(messageElement);
    chatWindow.scrollTop = chatWindow.scrollHeight; // Auto-scroll to bottom
  };

  // Function to render the chat history for the current persona
  const renderChatHistory = () => {
    chatWindow.innerHTML = ""; // Clear the window first
    chatHistories[currentPersona].forEach((msg) => {
      const sender = msg.role === "user" ? "user" : "bot";
      addMessageToUI(sender, msg.content);
    });
  };

  // Function to switch persona
  const switchPersona = (persona) => {
    currentPersona = persona;
    personaName.textContent =
      persona.charAt(0).toUpperCase() + persona.slice(1);

    // Update active button style
    hiteshBtn.classList.toggle("active", persona === "hitesh");
    piyushBtn.classList.toggle("active", persona === "piyush");

    renderChatHistory(); // Show the chat for the selected persona
  };

  // Function to handle form submission
  const handleFormSubmit = async (event) => {
    event.preventDefault();
    const userMessage = messageInput.value.trim();

    if (!userMessage) return;

    // 1. Add user message to UI and history
    addMessageToUI("user", userMessage);
    chatHistories[currentPersona].push({ role: "user", content: userMessage });
    localStorage.setItem("chatHistories", JSON.stringify(chatHistories));
    messageInput.value = "";

    try {
      // 2. Send history to backend
      const response = await fetch("http://localhost:3000/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          persona: currentPersona,
          messages: chatHistories[currentPersona],
        }),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      const botReply = data.reply;

      // 3. Add bot message to UI and history
      addMessageToUI("bot", botReply);
      chatHistories[currentPersona].push({
        role: "assistant",
        content: botReply,
      });
      localStorage.setItem("chatHistories", JSON.stringify(chatHistories));
    } catch (error) {
      console.error("Error:", error);
      addMessageToUI("bot", "Sorry, something went wrong. Please try again.");
    }
  };

  // --- Event Listeners ---
  chatForm.addEventListener("submit", handleFormSubmit);
  hiteshBtn.addEventListener("click", () => switchPersona("hitesh"));
  piyushBtn.addEventListener("click", () => switchPersona("piyush"));

  // --- Initial Load ---
  switchPersona("hitesh"); // Load the default chat on page load
});
