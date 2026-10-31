const chats = [
  {
    id: "olena",
    name: "Олена Мельник",
    initials: "ОМ",
    color: "coral",
    messages: [
      { sender: "contact", text: "Привіт! Як справи?", time: "14:10", datetime: "2026-10-31T14:10" },
      { sender: "you", text: "Привіт! Усе добре, дякую. А в тебе?", time: "14:12", datetime: "2026-10-31T14:12" },
      { sender: "contact", text: "Чудово! Може, вип'ємо кави цього тижня?", time: "14:15", datetime: "2026-10-31T14:15" },
    ],
  },
  {
    id: "andrii",
    name: "Андрій Коваль",
    initials: "АК",
    color: "blue",
    messages: [
      { sender: "contact", text: "Дякую за допомогу!", time: "13:42", datetime: "2026-10-31T13:42" },
      { sender: "you", text: "Радий був допомогти!", time: "13:45", datetime: "2026-10-31T13:45" },
      { sender: "contact", text: "Наступного разу пригощу кавою 🙂", time: "13:47", datetime: "2026-10-31T13:47" },
    ],
  },
  {
    id: "iryna",
    name: "Ірина Петренко",
    initials: "ІП",
    color: "purple",
    messages: [
      { sender: "contact", text: "До зустрічі завтра", time: "Вчора", datetime: "2026-10-30T18:25" },
      { sender: "you", text: "Так, до зустрічі! Буду вчасно.", time: "Вчора", datetime: "2026-10-30T18:28" },
      { sender: "contact", text: "Чудово, тоді до завтра!", time: "Вчора", datetime: "2026-10-30T18:30" },
    ],
  },
  {
    id: "maksym",
    name: "Максим Бондар",
    initials: "МБ",
    color: "green",
    messages: [
      { sender: "contact", text: "Надіслав тобі фото з подорожі 📸", time: "12:18", datetime: "2026-10-31T12:18" },
      { sender: "you", text: "Краєвид неймовірний! Де це?", time: "12:21", datetime: "2026-10-31T12:21" },
      { sender: "contact", text: "Це Карпати, біля озера Синевир.", time: "12:24", datetime: "2026-10-31T12:24" },
    ],
  },
  {
    id: "sofia",
    name: "Софія Шевченко",
    initials: "СШ",
    color: "gold",
    messages: [
      { sender: "contact", text: "План на вихідні ще в силі?", time: "11:06", datetime: "2026-10-31T11:06" },
      { sender: "you", text: "Так! Зустрінемось у суботу о 12?", time: "11:10", datetime: "2026-10-31T11:10" },
      { sender: "contact", text: "Домовились, до зустрічі!", time: "11:12", datetime: "2026-10-31T11:12" },
    ],
  },
];

const chatList = document.querySelector("#chat-list");
const chatCount = document.querySelector("#chat-count");
const conversationAvatar = document.querySelector("#conversation-avatar");
const conversationHeading = document.querySelector("#conversation-heading");
const messagesList = document.querySelector("#messages");
const messageForm = document.querySelector("#message-form");
const messageInput = document.querySelector("#message");
let activeChatId = chats[0].id;

function renderChatList() {
  chatCount.textContent = chats.length;
  chatList.replaceChildren();

  chats.forEach((chat) => {
    const lastMessage = chat.messages[chat.messages.length - 1];
    const item = document.createElement("li");
    const button = document.createElement("button");
    const avatar = document.createElement("span");
    const details = document.createElement("span");
    const name = document.createElement("span");
    const preview = document.createElement("span");
    const time = document.createElement("time");

    button.type = "button";
    button.className = "chat-item";
    button.setAttribute("aria-pressed", String(chat.id === activeChatId));
    button.addEventListener("click", () => selectChat(chat.id));

    avatar.className = `avatar avatar-${chat.color}`;
    avatar.setAttribute("aria-hidden", "true");
    avatar.textContent = chat.initials;

    details.className = "chat-details";
    name.className = "chat-name";
    name.textContent = chat.name;
    preview.className = "chat-preview";
    preview.textContent = lastMessage.text;
    time.className = "chat-time";
    time.dateTime = lastMessage.datetime;
    time.textContent = lastMessage.time;

    details.append(name, preview);
    button.append(avatar, details, time);
    item.append(button);
    chatList.append(item);
  });
}

function renderMessages(chat) {
  messagesList.replaceChildren();

  chat.messages.forEach((message) => {
    const item = document.createElement("li");
    const article = document.createElement("article");
    const sender = document.createElement("p");
    const text = document.createElement("p");
    const time = document.createElement("time");

    item.className = `message message-${message.sender}`;
    article.className = "message-bubble";
    sender.className = "message-sender";
    sender.textContent = message.sender === "you" ? "Ви" : chat.name;
    text.className = "message-text";
    text.textContent = message.text;
    time.className = "message-time";
    time.dateTime = message.datetime;
    time.textContent = message.time;

    article.append(sender, text, time);
    item.append(article);
    messagesList.append(item);
  });

  messagesList.scrollTop = messagesList.scrollHeight;
}

function selectChat(chatId) {
  activeChatId = chatId;
  const chat = chats.find((item) => item.id === chatId);
  conversationAvatar.className = `avatar avatar-${chat.color}`;
  conversationAvatar.textContent = chat.initials;
  conversationHeading.textContent = chat.name;
  renderChatList();
  renderMessages(chat);
}

messageForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const text = messageInput.value.trim();

  if (!text) {
    return;
  }

  const now = new Date();
  const time = now.toLocaleTimeString("uk-UA", { hour: "2-digit", minute: "2-digit" });
  const chat = chats.find((item) => item.id === activeChatId);
  chat.messages.push({
    sender: "you",
    text,
    time,
    datetime: now.toISOString(),
  });

  messageInput.value = "";
  renderChatList();
  renderMessages(chat);
  messageInput.focus();
});

selectChat(activeChatId);