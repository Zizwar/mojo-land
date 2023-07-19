const deviceTime = document.querySelector(".status-bar .time");
const messageTime = document.querySelectorAll(".message .time");

deviceTime.innerHTML = moment().format("h:mm");

messageTime.forEach((time) => {
  time.innerHTML = moment().format("h:mm A");
});

/* Message */

const form = document.querySelector(".conversation-compose");
const conversation = document.querySelector(".conversation-container");
const memory = [];
form.addEventListener("submit", (e) => {
  const input = e.target.input;
  memory.push({
    role: "user",
    content: input.value, //`question --${input.value}-- If my question or query or any part of it has nothing to do with what's in the data you have or has nothing to do with the products, or not matching your description,just answer that it's not my specialty or my scope, Answer me in the language of the question.`,//also Answer as much as the question only without additional information
  });
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

// deno-lint-ignore require-await
const fetchThis = async (text) => {
  const slug = document.getElementById("slug") || [];
  setTimeout(async () => {
    const response = await fetch(`/api/send`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: text,
        memory,
        slug: slug.value,
      }),
    });

    if (response.ok) {
      const responseText = await response.text();
      memory.push({ role: "assistant", content: responseText });
      //console.log({ memory });
      const message = buildMessage(responseText, "received");
      conversation.appendChild(message);
      animateMessage(message);
    }
  }, 5);
};

function buildMessage(text, receivedOrSent = "sent") {
  //alert(text)
  const element = document.createElement("div");
  element.classList.add("message", receivedOrSent);

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
