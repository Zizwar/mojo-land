const deviceTime = document.querySelector(".status-bar .time");
const messageTime = document.querySelectorAll(".message .time");

deviceTime.innerHTML = moment().format("h:mm");

messageTime.forEach((time) => {
  time.innerHTML = moment().format("h:mm A");
});

/* Message */

const form = document.querySelector(".conversation-compose");
const conversation = document.querySelector(".conversation-container");

form.addEventListener("submit", (e) => {
  const input = e.target.input;

  if (input.value) {
    const message = buildMessage(input.value);
    conversation.appendChild(message);
    animateMessage(message);
    
    fetchThis(input.value);
  }

  input.value = "";
  conversation.scrollTop = conversation.scrollHeight;

  e.preventDefault();
});

const fetchThis = (text) => {
  setTimeout(async () => {
    const response = await fetch(`/api/send`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ prompt: text })
    });

    if (response.ok) {
      const message = buildMessage(response.text());
      conversation.appendChild(message);
      animateMessage(message);
    }
  }, 500);
};

function buildMessage(text, received) {
  const element = document.createElement("div");
  element.classList.add("message", received ? "received" : "sent");

  element.innerHTML = `${text}<span class="metadata"><span class="time">${moment().format(
    "h:mm A"
  )}</span><span class="tick tick-animation"></span></span>`;

  return element;
}

function animateMessage(message) {
  setTimeout(() => {
    const tick = message.querySelector(".tick");
    tick.classList.remove("tick-animation");
  }, 1500);
}
