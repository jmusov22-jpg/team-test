const chats = [
  {
    id: "olena",
    name: "Олена Мельник",
    initials: "ОМ",
    color: "coral",
    status: "online",
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
    status: "away",
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
    status: "offline",
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
    status: "busy",
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
    status: "online",
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
const conversationStatus = document.querySelector("#conversation-status");
const messagesList = document.querySelector("#messages");
const messageForm = document.querySelector("#message-form");
const messageInput = document.querySelector("#message");
const chatSearchInput = document.querySelector("#chat-search");
const autoTranslateInput = document.querySelector("#auto-translate");
const improveMessageButton = document.querySelector("#improve-message");
const recordVoiceButton = document.querySelector("#record-voice");
const featureStatus = document.querySelector("#feature-status");
const createGroupButton = document.querySelector("#create-group-button");
const groupForm = document.querySelector("#group-form");
const groupNameInput = document.querySelector("#group-name");
const groupMembersSelect = document.querySelector("#group-members");
const cancelGroupButton = document.querySelector("#cancel-group");
// Configure same-origin routes returning { suggestion } / { translation }; keep API keys on the server.
const serviceEndpoints = {
  improve: null,
  translate: null,
};
let activeChatId = chats[0].id;
let searchQuery = "";
let activeRecorder = null;
let activeAudioStream = null;
const statusLabels = {
  online: "онлайн",
  away: "відійшов",
  busy: "не турбувати",
  offline: "офлайн",
};

function showFeatureStatus(message) {
  featureStatus.textContent = message;
}

async function requestService(endpoint, payload, resultField) {
  if (!endpoint) {
    throw new Error("Підключіть відповідний сервіс на сервері, щоб скористатися цією функцією.");
  }

  let response;

  try {
    response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new Error("Не вдалося з'єднатися із сервісом. Перевірте сервер і повторіть спробу.");
  }

  if (!response.ok) {
    throw new Error(`Сервіс повернув помилку (${response.status}).`);
  }

  const result = await response.json();

  if (!result || typeof result[resultField] !== "string" || !result[resultField].trim()) {
    throw new Error("Сервіс повернув відповідь у неочікуваному форматі.");
  }

  return result[resultField].trim();
}

function getErrorMessage(error) {
  return error instanceof Error ? error.message : "Сталася невідома помилка.";
}

function getFilteredChats() {
  const normalizedQuery = searchQuery.trim().toLowerCase();

  if (!normalizedQuery) {
    return chats;
  }

  return chats.filter((chat) => chat.name.toLowerCase().includes(normalizedQuery));
}

function getChatStatus(chat) {
  if (!chat.isGroup) {
    return statusLabels[chat.status] || statusLabels.offline;
  }

  const onlineMembers = chat.members.filter((member) => member.status === "online").length;
  return `${chat.members.length} учасники · ${onlineMembers} онлайн`;
}

function populateGroupMembers() {
  groupMembersSelect.replaceChildren();

  chats.filter((chat) => !chat.isGroup).forEach((chat) => {
    const option = document.createElement("option");
    option.value = chat.id;
    option.textContent = `${chat.name} (${statusLabels[chat.status]})`;
    groupMembersSelect.append(option);
  });
}

function renderChatList() {
  const visibleChats = getFilteredChats();
  chatCount.textContent = String(visibleChats.length);
  chatList.replaceChildren();

  if (visibleChats.length === 0) {
    const emptyItem = document.createElement("li");
    const emptyMessage = document.createElement("p");

    emptyItem.className = "chat-empty";
    emptyMessage.textContent = "Чатів не знайдено";
    emptyItem.append(emptyMessage);
    chatList.append(emptyItem);
    return;
  }

  visibleChats.forEach((chat) => {
    const lastMessage = chat.messages[chat.messages.length - 1];
    const item = document.createElement("li");
    const button = document.createElement("button");
    const avatar = document.createElement("span");
    const status = document.createElement("span");
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
    status.className = `user-status status-${chat.isGroup ? "group" : chat.status}`;
    status.setAttribute("aria-label", getChatStatus(chat));
    status.title = getChatStatus(chat);

    details.className = "chat-details";
    name.className = "chat-name";
    name.textContent = chat.name;
    preview.className = "chat-preview";
    preview.textContent = lastMessage.text;
    time.className = "chat-time";
    time.dateTime = lastMessage.datetime;
    time.textContent = lastMessage.time;

    details.append(name, preview);
    avatar.append(status);
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
    sender.textContent = `${message.sender === "you" ? "Ви" : (message.author || chat.name)}${message.edited ? " · змінено" : ""}`;
    time.className = "message-time";
    time.dateTime = message.datetime;
    time.textContent = message.time;

    article.append(sender);

    if (message.audioUrl) {
      const audio = document.createElement("audio");
      audio.className = "message-audio";
      audio.controls = true;
      audio.preload = "metadata";
      audio.src = message.audioUrl;
      audio.setAttribute("aria-label", "Голосове повідомлення");
      article.append(audio);
    } else {
      text.className = "message-text";
      text.textContent = message.text;
      article.append(text);

      if (message.translatedText) {
        const translation = document.createElement("p");
        const translationLabel = document.createElement("span");

        translation.className = "message-translation";
        translationLabel.className = "message-translation-label";
        translationLabel.textContent = "Переклад українською";
        translation.append(translationLabel, document.createTextNode(message.translatedText));
        article.append(translation);
      }

      if (message.sender === "you") {
        const editButton = document.createElement("button");
        editButton.className = "message-edit-button";
        editButton.type = "button";
        editButton.textContent = "Редагувати";
        editButton.setAttribute("aria-label", "Редагувати своє повідомлення");
        editButton.addEventListener("click", () => openMessageEditor(chat, message, article));
        article.append(editButton);
      }
    }

    article.append(time);
    item.append(article);
    messagesList.append(item);
  });

  messagesList.scrollTop = messagesList.scrollHeight;
}

function openMessageEditor(chat, message, article) {
  if (!article) {
    return;
  }

  const form = document.createElement("form");
  const textarea = document.createElement("textarea");
  const actions = document.createElement("div");
  const saveButton = document.createElement("button");
  const cancelButton = document.createElement("button");

  form.className = "message-edit-form";
  textarea.className = "message-edit-input";
  textarea.value = message.text;
  textarea.setAttribute("aria-label", "Відредагувати повідомлення");
  actions.className = "message-edit-actions";
  saveButton.className = "message-action-button";
  saveButton.type = "submit";
  saveButton.textContent = "Зберегти";
  cancelButton.className = "message-action-button";
  cancelButton.type = "button";
  cancelButton.textContent = "Скасувати";

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const updatedText = textarea.value.trim();

    if (!updatedText) {
      textarea.setCustomValidity("Повідомлення не може бути порожнім.");
      textarea.reportValidity();
      return;
    }

    message.text = updatedText;
    message.edited = true;
    renderChatList();
    renderMessages(chat);
  });

  textarea.addEventListener("input", () => textarea.setCustomValidity(""));
  textarea.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      renderMessages(chat);
    }
  });
  cancelButton.addEventListener("click", () => renderMessages(chat));

  actions.append(saveButton, cancelButton);
  form.append(textarea, actions);
  article.replaceChildren(form);
  textarea.focus();
  textarea.setSelectionRange(textarea.value.length, textarea.value.length);
}

async function translateMessages(chat) {
  const messagesToTranslate = chat.messages.filter(
    (message) => message.sender === "contact" && !message.translatedText
  );

  if (messagesToTranslate.length === 0) {
    showFeatureStatus("Немає нових повідомлень для перекладу.");
    return;
  }

  showFeatureStatus("Перекладаю повідомлення...");
  const failures = [];

  for (const message of messagesToTranslate) {
    try {
      message.translatedText = await requestService(
        serviceEndpoints.translate,
        { text: message.text, targetLanguage: "uk" },
        "translation"
      );
    } catch (error) {
      failures.push(getErrorMessage(error));
    }
  }

  if (activeChatId === chat.id) {
    renderMessages(chat);
  }

  if (failures.length > 0) {
    showFeatureStatus(failures[0]);
    return;
  }

  showFeatureStatus("Переклад готовий.");
}

function selectChat(chatId) {
  const chat = chats.find((item) => item.id === chatId);

  if (!chat) {
    return;
  }

  activeChatId = chatId;
  conversationAvatar.className = `avatar avatar-${chat.color}`;
  conversationAvatar.textContent = chat.initials;
  conversationHeading.textContent = chat.name;
  conversationStatus.textContent = getChatStatus(chat);
  conversationStatus.className = `conversation-status status-text-${chat.isGroup ? "group" : chat.status}`;
  renderChatList();
  renderMessages(chat);

  if (autoTranslateInput.checked) {
    translateMessages(chat);
  }
}

chatSearchInput.addEventListener("input", (event) => {
  searchQuery = event.target.value;
  const filteredChats = getFilteredChats();

  if (filteredChats.length === 0) {
    renderChatList();
    return;
  }

  if (!filteredChats.some((chat) => chat.id === activeChatId)) {
    selectChat(filteredChats[0].id);
    return;
  }

  renderChatList();
});

messageForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const text = messageInput.value.trim();

  if (!text) {
    return;
  }

  const now = new Date();
  const time = now.toLocaleTimeString("uk-UA", { hour: "2-digit", minute: "2-digit" });
  const chat = chats.find((item) => item.id === activeChatId);
  if (!chat) {
    return;
  }

  chat.messages.push({
    sender: "you",
    text,
    time,
    datetime: now.toISOString(),
  });

  createGroupButton.addEventListener("click", () => {
    populateGroupMembers();
    groupForm.hidden = false;
    createGroupButton.hidden = true;
    groupNameInput.focus();
  });

  cancelGroupButton.addEventListener("click", () => {
    groupForm.reset();
    groupForm.hidden = true;
    createGroupButton.hidden = false;
  });

  groupForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const name = groupNameInput.value.trim();
    const memberIds = [...groupMembersSelect.selectedOptions].map((option) => option.value);

    if (!name || memberIds.length === 0) {
      return;
    }

    const members = chats.filter((chat) => memberIds.includes(chat.id));
    const group = {
      id: `group-${Date.now()}`,
      name,
      initials: name.slice(0, 2).toUpperCase(),
      color: "blue",
      isGroup: true,
      members,
      messages: [
        {
          sender: "contact",
          author: "Система",
          text: `Групу створено. Учасники: ${members.map((member) => member.name).join(", ")}.`,
          time: new Date().toLocaleTimeString("uk-UA", { hour: "2-digit", minute: "2-digit" }),
          datetime: new Date().toISOString(),
        },
      ],
    };

    chats.push(group);
    groupForm.reset();
    groupForm.hidden = true;
    createGroupButton.hidden = false;
    selectChat(group.id);
  });

  messageInput.value = "";
  renderChatList();
  renderMessages(chat);
  messageInput.focus();
});

improveMessageButton.addEventListener("click", async () => {
  const text = messageInput.value.trim();

  if (!text) {
    showFeatureStatus("Спочатку введіть повідомлення для покращення.");
    messageInput.focus();
    return;
  }

  improveMessageButton.disabled = true;
  showFeatureStatus("Готую покращений варіант...");

  try {
    messageInput.value = await requestService(
      serviceEndpoints.improve,
      { text, language: "uk" },
      "suggestion"
    );
    showFeatureStatus("Перегляньте й за потреби відредагуйте запропонований текст.");
  } catch (error) {
    showFeatureStatus(getErrorMessage(error));
  } finally {
    improveMessageButton.disabled = false;
  }
});

autoTranslateInput.addEventListener("change", () => {
  if (!autoTranslateInput.checked) {
    showFeatureStatus("");
    return;
  }

  const chat = chats.find((item) => item.id === activeChatId);
  if (chat) {
    translateMessages(chat);
  }
});

async function startVoiceRecording() {
  if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
    showFeatureStatus("Запис голосу не підтримується цим браузером. Спробуйте HTTPS або localhost.");
    return;
  }

  recordVoiceButton.disabled = true;

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);
    const recordingChatId = activeChatId;
    const audioChunks = [];

    activeAudioStream = stream;
    activeRecorder = recorder;
    recorder.addEventListener("dataavailable", (event) => {
      if (event.data.size > 0) {
        audioChunks.push(event.data);
      }
    });
    recorder.addEventListener("stop", () => {
      stream.getTracks().forEach((track) => track.stop());
      activeAudioStream = null;
      activeRecorder = null;
      recordVoiceButton.textContent = "Записати голос";
      recordVoiceButton.disabled = false;

      if (audioChunks.length === 0) {
        showFeatureStatus("Не вдалося записати аудіо. Спробуйте ще раз.");
        return;
      }

      const chat = chats.find((item) => item.id === recordingChatId);
      if (!chat) {
        showFeatureStatus("Чат для записаного повідомлення більше недоступний.");
        return;
      }

      const now = new Date();
      chat.messages.push({
        sender: "you",
        text: "Голосове повідомлення",
        audioUrl: URL.createObjectURL(new Blob(audioChunks, { type: recorder.mimeType })),
        time: now.toLocaleTimeString("uk-UA", { hour: "2-digit", minute: "2-digit" }),
        datetime: now.toISOString(),
      });

      renderChatList();
      if (activeChatId === chat.id) {
        renderMessages(chat);
      }
      showFeatureStatus("Голосове повідомлення додано до чату.");
    });

    recorder.start();
    recordVoiceButton.disabled = false;
    recordVoiceButton.textContent = "Зупинити запис";
    showFeatureStatus("Запис триває. Натисніть кнопку ще раз, щоб зупинити.");
  } catch (error) {
    activeAudioStream?.getTracks().forEach((track) => track.stop());
    activeAudioStream = null;
    activeRecorder = null;
    recordVoiceButton.disabled = false;

    if (error instanceof Error && error.name === "NotAllowedError") {
      showFeatureStatus("Надайте браузеру дозвіл на використання мікрофона.");
    } else if (error instanceof Error && error.name === "NotFoundError") {
      showFeatureStatus("Мікрофон не знайдено.");
    } else {
      showFeatureStatus(getErrorMessage(error));
    }
  }
}

recordVoiceButton.addEventListener("click", () => {
  if (activeRecorder?.state === "recording") {
    activeRecorder.stop();
    return;
  }

  startVoiceRecording();
});

messageInput.addEventListener("input", () => {
  showFeatureStatus("");
});

selectChat(activeChatId);