document.addEventListener("DOMContentLoaded", () => {
  const chatWindow = document.getElementById("chat-window");
  const chatForm = document.getElementById("chat-form");
  const messageInput = document.getElementById("message-input");
  const personaName = document.getElementById("persona-name");
  const hiteshBtn = document.getElementById("hitesh-btn");
  const piyushBtn = document.getElementById("piyush-btn");

  let currentPersona = "hitesh";

  let chatHistories = JSON.parse(localStorage.getItem("chatHistories")) || {
    hitesh: [],
    piyush: [],
  };

  const addMessageToUI = (sender, text) => {
    const messageElement = document.createElement("div");
    messageElement.classList.add("message", sender);
    messageElement.textContent = text;
    chatWindow.appendChild(messageElement);
    chatWindow.scrollTop = chatWindow.scrollHeight;
  };

  const renderChatHistory = () => {
    chatWindow.innerHTML = "";
    chatHistories[currentPersona].forEach((msg) => {
      const sender = msg.role === "user" ? "user" : "bot";
      addMessageToUI(sender, msg.content);
    });
  };

  const switchPersona = (persona) => {
    currentPersona = persona;
    personaName.textContent =
      persona.charAt(0).toUpperCase() + persona.slice(1);

    hiteshBtn.classList.toggle("active", persona === "hitesh");
    piyushBtn.classList.toggle("active", persona === "piyush");

    renderChatHistory();
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    const userMessage = messageInput.value.trim();

    if (!userMessage) return;

    addMessageToUI("user", userMessage);
    chatHistories[currentPersona].push({ role: "user", content: userMessage });
    localStorage.setItem("chatHistories", JSON.stringify(chatHistories));
    messageInput.value = "";

    try {
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

  chatForm.addEventListener("submit", handleFormSubmit);
  hiteshBtn.addEventListener("click", () => switchPersona("hitesh"));
  piyushBtn.addEventListener("click", () => switchPersona("piyush"));

  switchPersona("hitesh");
});
