const defaultChats = [
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
const stickerToggle = document.querySelector("#sticker-toggle");
const stickerPicker = document.querySelector("#sticker-picker");
const stickerGrid = document.querySelector("#sticker-grid");
const chatSearchInput = document.querySelector("#chat-search");
const searchResultsList = document.querySelector("#search-results");
const autoTranslateInput = document.querySelector("#auto-translate");
const improveMessageButton = document.querySelector("#improve-message");
const recordVoiceButton = document.querySelector("#record-voice");
const featureStatus = document.querySelector("#feature-status");
const createGroupButton = document.querySelector("#create-group-button");
const groupForm = document.querySelector("#group-form");
const groupNameInput = document.querySelector("#group-name");
const groupMembersSelect = document.querySelector("#group-members");
const cancelGroupButton = document.querySelector("#cancel-group");
const groupMembersButton = document.querySelector("#group-members-button");
const groupMembersPanel = document.querySelector("#group-members-panel");
const groupMemberList = document.querySelector("#group-member-list");
const editGroupMembersButton = document.querySelector("#edit-group-members");
const groupEditForm = document.querySelector("#group-edit-form");
const groupEditMembersSelect = document.querySelector("#group-edit-members");
const cancelGroupEditButton = document.querySelector("#cancel-group-edit");
const profileToggle = document.querySelector("#profile-toggle");
const profileForm = document.querySelector("#profile-form");
const profileNameInput = document.querySelector("#profile-name");
const profilePhoneInput = document.querySelector("#profile-phone");
const profileEmailInput = document.querySelector("#profile-email");
const profileAvatarInput = document.querySelector("#profile-avatar");
const profileColorInput = document.querySelector("#profile-color");
const profileCodeInput = document.querySelector("#profile-code");
const profilePreviewAvatar = document.querySelector("#profile-preview-avatar");
const profilePreviewName = document.querySelector("#profile-preview-name");
const generateCodeButton = document.querySelector("#generate-code");
const addContactButton = document.querySelector("#add-contact-button");
const contactForm = document.querySelector("#contact-form");
const contactNameInput = document.querySelector("#contact-name");
const contactPhoneInput = document.querySelector("#contact-phone");
const contactEmailInput = document.querySelector("#contact-email");
const contactCodeInput = document.querySelector("#contact-code");
const cancelContactButton = document.querySelector("#cancel-contact");
const storageKey = "teamchat-state-v1";
const stickers = [
  "😀", "😃", "😄", "😁", "😆", "😅", "😂", "🙂", "🙃", "😉", "😊", "😍",
  "🥰", "😘", "😎", "🤩", "🥳", "🤗", "🤔", "😴", "😭", "😡", "🤯", "😱",
  "🥺", "👍", "👎", "👏", "🙌", "🤝", "💪", "👋", "🙏", "❤️", "🧡", "💛",
  "💚", "💙", "💜", "🖤", "💖", "💯", "🔥", "✨", "🎉", "🎂", "🌟", "🌈",
  "🍕", "☕", "🐱", "🐶", "🌸", "🚀", "🎁", "💐",
];
const serviceEndpoints = {
  improve: "/api/improve",
  translate: "/api/translate",
};
let chats = JSON.parse(JSON.stringify(defaultChats));
let profile = {
  name: "Мій профіль",
  phone: "",
  email: "",
  avatar: "В",
  color: "blue",
  code: "",
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

function isValidSavedState(state) {
  return state
    && Array.isArray(state.chats)
    && state.chats.length > 0
    && state.chats.every((chat) => (
      chat
      && typeof chat.id === "string"
      && typeof chat.name === "string"
      && Array.isArray(chat.messages)
      && chat.messages.every((message) => (
        message
        && typeof message.text === "string"
        && (message.sender === "you" || message.sender === "contact")
      ))
    ))
    && state.profile
    && typeof state.profile.name === "string";
}

function restoreSavedState() {
  try {
    const savedState = localStorage.getItem(storageKey);

    if (!savedState) {
      return;
    }

    const state = JSON.parse(savedState);
    if (!isValidSavedState(state)) {
      throw new Error("Збережені дані чату мають неочікуваний формат.");
    }

    chats = state.chats;
    profile = { ...profile, ...state.profile };
    activeChatId = chats.some((chat) => chat.id === state.activeChatId)
      ? state.activeChatId
      : chats[0].id;
  } catch (error) {
    showFeatureStatus(`Не вдалося відновити збережені дані: ${getErrorMessage(error)}`);
  }
}

function persistState() {
  try {
    localStorage.setItem(storageKey, JSON.stringify({ chats, profile, activeChatId }));
    return true;
  } catch (error) {
    showFeatureStatus(`Не вдалося зберегти зміни: ${getErrorMessage(error)}`);
    return false;
  }
}

function generateSecretCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const randomValues = new Uint8Array(10);

  if (!globalThis.crypto?.getRandomValues) {
    throw new Error("Генератор секретного коду недоступний у цьому браузері.");
  }

  globalThis.crypto.getRandomValues(randomValues);
  return Array.from(randomValues, (value) => alphabet[value % alphabet.length]).join("");
}

function updateProfilePreview() {
  const name = profileNameInput.value.trim() || "Мій профіль";
  profilePreviewAvatar.className = `avatar avatar-${profileColorInput.value}`;
  profilePreviewAvatar.textContent = profileAvatarInput.value.trim() || name.slice(0, 2).toUpperCase();
  profilePreviewName.textContent = name;
}

function populateProfileForm() {
  profileNameInput.value = profile.name;
  profilePhoneInput.value = profile.phone;
  profileEmailInput.value = profile.email;
  profileAvatarInput.value = profile.avatar;
  profileColorInput.value = profile.color;
  profileCodeInput.value = profile.code;
  profileToggle.textContent = profile.name === "Мій профіль" ? "Мій профіль" : `Мій профіль · ${profile.name}`;
  updateProfilePreview();
}

function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("Не вдалося підготувати аудіо до збереження."));
      }
    });
    reader.addEventListener("error", () => reject(new Error("Не вдалося прочитати аудіоповідомлення.")));
    reader.readAsDataURL(blob);
  });
}

function showFeatureStatus(message, isLoading = false) {
  featureStatus.textContent = message;
  featureStatus.setAttribute("aria-busy", String(isLoading));
  featureStatus.classList.toggle("is-loading", isLoading);
}

function closeStickerPicker() {
  stickerPicker.hidden = true;
  stickerToggle.setAttribute("aria-expanded", "false");
}

function insertSticker(sticker) {
  const start = messageInput.selectionStart ?? messageInput.value.length;
  const end = messageInput.selectionEnd ?? start;

  messageInput.setRangeText(sticker, start, end, "end");
  closeStickerPicker();
  messageInput.dispatchEvent(new Event("input", { bubbles: true }));
  messageInput.focus();
}

stickers.forEach((sticker, index) => {
  const button = document.createElement("button");
  button.className = "sticker-option";
  button.type = "button";
  button.textContent = sticker;
  button.setAttribute("aria-label", `Додати стікер ${index + 1}: ${sticker}`);
  button.addEventListener("click", () => insertSticker(sticker));
  stickerGrid.append(button);
});

stickerToggle.addEventListener("click", () => {
  const isOpening = stickerPicker.hidden;
  stickerPicker.hidden = !isOpening;
  stickerToggle.setAttribute("aria-expanded", String(isOpening));

  if (isOpening) {
    stickerGrid.querySelector("button")?.focus();
  }
});

document.addEventListener("click", (event) => {
  if (!stickerPicker.hidden && !stickerPicker.contains(event.target) && !stickerToggle.contains(event.target)) {
    closeStickerPicker();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !stickerPicker.hidden) {
    closeStickerPicker();
    stickerToggle.focus();
  }
});

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

  let result;
  try {
    result = await response.json();
  } catch {
    throw new Error("Сервіс повернув некоректну відповідь. Спробуйте ще раз.");
  }

  if (!response.ok) {
    const message = result && typeof result.error === "string"
      ? result.error
      : `Сервіс повернув помилку (${response.status}).`;
    throw new Error(message);
  }

  if (!result || typeof result[resultField] !== "string" || !result[resultField].trim()) {
    throw new Error("Сервіс повернув відповідь у неочікуваному форматі.");
  }

  return result[resultField].trim();
}

function getErrorMessage(error) {
  return error instanceof Error ? error.message : "Сталася невідома помилка.";
}

function renderSearchResults() {
  const normalizedQuery = searchQuery.trim().toLowerCase();
  const chatMatches = chats.filter((chat) => chat.name.toLowerCase().includes(normalizedQuery));
  const messageMatches = [];

  chats.forEach((chat) => {
    chat.messages.forEach((message, messageIndex) => {
      if (
        message.text.toLowerCase().includes(normalizedQuery)
        || (typeof message.translatedText === "string"
          && message.translatedText.toLowerCase().includes(normalizedQuery))
      ) {
        messageMatches.push({ chat, message, messageIndex });
      }
    });
  });

  searchResultsList.replaceChildren();
  const matchingChats = new Set([
    ...chatMatches,
    ...messageMatches.map(({ chat }) => chat),
  ]);
  chatCount.textContent = String(matchingChats.size);
  chatCount.setAttribute("aria-label", "Кількість чатів у результатах пошуку");

  if (chatMatches.length === 0 && messageMatches.length === 0) {
    const emptyItem = document.createElement("li");
    const emptyMessage = document.createElement("p");

    emptyItem.className = "chat-empty";
    emptyMessage.textContent = "Чатів або повідомлень не знайдено";
    emptyItem.append(emptyMessage);
    searchResultsList.append(emptyItem);
    return;
  }

  const appendResult = (chat, previewText, timeText, onClick) => {
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
    button.addEventListener("click", onClick);

    avatar.className = `avatar avatar-${chat.color}`;
    avatar.setAttribute("aria-hidden", "true");
    avatar.textContent = chat.avatar || chat.initials;
    status.className = `user-status status-${chat.isGroup ? "group" : chat.status}`;
    status.setAttribute("aria-label", getChatStatus(chat));
    status.title = getChatStatus(chat);
    avatar.append(status);

    details.className = "chat-details";
    name.className = "chat-name";
    name.textContent = chat.name;
    preview.className = "chat-preview";
    preview.textContent = previewText;
    time.className = "chat-time";
    time.textContent = timeText;

    details.append(name, preview);
    button.append(avatar, details, time);
    item.append(button);
    searchResultsList.append(item);
  };

  chatMatches.forEach((chat) => {
    appendResult(chat, "Відкрити чат", "", () => selectChat(chat.id));
  });

  messageMatches.forEach(({ chat, message, messageIndex }) => {
    const sender = message.sender === "you" ? "Ви" : (message.author || chat.name);
    appendResult(chat, `${sender}: ${message.text}`, message.time, () => {
      selectChat(chat.id);
      const target = messagesList.querySelector(`[data-message-index="${messageIndex}"]`);

      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "center" });
        target.classList.add("message-search-match");
        window.setTimeout(() => target.classList.remove("message-search-match"), 2000);
      }
    });
  });
}

function getChatStatus(chat) {
  if (!chat.isGroup) {
    return statusLabels[chat.status] || statusLabels.offline;
  }

  const onlineMembers = chat.members.filter((member) => member.status === "online").length;
  return `${chat.members.length} учасники · ${onlineMembers} онлайн`;
}

function populateMemberSelect(select, selectedMemberIds = []) {
  select.replaceChildren();

  chats.filter((chat) => !chat.isGroup).forEach((chat) => {
    const option = document.createElement("option");
    option.value = chat.id;
    option.textContent = `${chat.name} (${statusLabels[chat.status]})`;
    option.selected = selectedMemberIds.includes(chat.id);
    select.append(option);
  });
}

function populateGroupMembers() {
  populateMemberSelect(groupMembersSelect);
}

function renderGroupMembers(chat) {
  groupMemberList.replaceChildren();

  chat.members.forEach((member) => {
    const item = document.createElement("li");
    const avatar = document.createElement("span");
    const name = document.createElement("span");
    const status = document.createElement("span");

    item.className = "group-member";
    avatar.className = `avatar avatar-${member.color || "blue"}`;
    avatar.textContent = member.initials || member.name.slice(0, 2).toUpperCase();
    avatar.setAttribute("aria-hidden", "true");
    name.className = "group-member-name";
    name.textContent = member.name;
    status.className = `group-member-status status-text-${member.status || "offline"}`;
    status.textContent = statusLabels[member.status] || statusLabels.offline;
    item.append(avatar, name, status);
    groupMemberList.append(item);
  });
}

function openGroupMembersPanel(chat) {
  groupMembersPanel.hidden = false;
  groupEditForm.hidden = true;
  renderGroupMembers(chat);
}

function openGroupMembersEditor(chat) {
  populateMemberSelect(groupEditMembersSelect, chat.members.map((member) => member.id));
  groupEditForm.hidden = false;
}

function renderChatList() {
  const normalizedQuery = searchQuery.trim();

  if (normalizedQuery) {
    chatList.hidden = true;
    searchResultsList.hidden = false;
    renderSearchResults();
    return;
  }

  chatList.hidden = false;
  searchResultsList.hidden = true;
  const visibleChats = chats;
  chatCount.textContent = String(visibleChats.length);
  chatCount.setAttribute("aria-label", "Кількість чатів");
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
    avatar.textContent = chat.avatar || chat.initials;
    status.className = `user-status status-${chat.isGroup ? "group" : chat.status}`;
    status.setAttribute("aria-label", getChatStatus(chat));
    status.title = getChatStatus(chat);

    details.className = "chat-details";
    name.className = "chat-name";
    name.textContent = chat.name;
    preview.className = "chat-preview";
    preview.textContent = lastMessage?.text || "Почніть розмову";
    time.className = "chat-time";
    time.dateTime = lastMessage?.datetime || "";
    time.textContent = lastMessage?.time || "";

    details.append(name, preview);
    avatar.append(status);
    button.append(avatar, details, time);
    item.append(button);
    chatList.append(item);
  });
}

function renderMessages(chat) {
  messagesList.replaceChildren();

  chat.messages.forEach((message, messageIndex) => {
    const item = document.createElement("li");
    const article = document.createElement("article");
    const sender = document.createElement("p");
    const text = document.createElement("p");
    const time = document.createElement("time");

    item.className = `message message-${message.sender}`;
    item.dataset.messageIndex = String(messageIndex);
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
    persistState();
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

  showFeatureStatus("Перекладаю повідомлення...", true);
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

  const stateSaved = persistState();
  if (activeChatId === chat.id) {
    renderMessages(chat);
  }

  if (failures.length > 0) {
    showFeatureStatus(failures[0]);
    return;
  }

  if (stateSaved) {
    showFeatureStatus("Переклад готовий.");
  }
}

function selectChat(chatId, shouldPersist = true) {
  const chat = chats.find((item) => item.id === chatId);

  if (!chat) {
    return;
  }

  activeChatId = chatId;
  if (shouldPersist) {
    persistState();
  }
  conversationAvatar.className = `avatar avatar-${chat.color}`;
  conversationAvatar.textContent = chat.avatar || chat.initials;
  conversationHeading.textContent = chat.name;
  conversationStatus.textContent = getChatStatus(chat);
  conversationStatus.className = `conversation-status status-text-${chat.isGroup ? "group" : chat.status}`;
  groupMembersButton.hidden = !chat.isGroup;
  groupMembersButton.setAttribute("aria-expanded", "false");
  groupMembersPanel.hidden = true;
  groupEditForm.hidden = true;
  renderChatList();
  renderMessages(chat);

  if (autoTranslateInput.checked) {
    translateMessages(chat);
  }
}

chatSearchInput.addEventListener("input", (event) => {
  searchQuery = event.target.value;
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
  persistState();
  messageInput.value = "";
  resizeMessageInput();
  renderChatList();
  renderMessages(chat);
  messageInput.focus();
});

function resizeMessageInput() {
  messageInput.style.height = "auto";
  messageInput.style.height = `${Math.min(messageInput.scrollHeight, 144)}px`;
  messageInput.style.overflowY = messageInput.scrollHeight > 144 ? "auto" : "hidden";
}

messageInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !event.shiftKey && !event.isComposing) {
    event.preventDefault();
    messageForm.requestSubmit();
  }
});

createGroupButton.addEventListener("click", () => {
  populateGroupMembers();
  groupForm.hidden = false;
  createGroupButton.hidden = true;
  groupNameInput.focus();
});

groupMembersButton.addEventListener("click", () => {
  const chat = chats.find((item) => item.id === activeChatId);
  if (!chat?.isGroup) {
    return;
  }

  const isOpening = groupMembersPanel.hidden;
  groupMembersPanel.hidden = !isOpening;
  groupMembersButton.setAttribute("aria-expanded", String(isOpening));
  if (isOpening) {
    openGroupMembersPanel(chat);
  }
});

editGroupMembersButton.addEventListener("click", () => {
  const chat = chats.find((item) => item.id === activeChatId);
  if (chat?.isGroup) {
    openGroupMembersEditor(chat);
  }
});

cancelGroupEditButton.addEventListener("click", () => {
  groupEditForm.hidden = true;
});

groupEditForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const chat = chats.find((item) => item.id === activeChatId);
  const memberIds = [...groupEditMembersSelect.selectedOptions].map((option) => option.value);

  if (!chat?.isGroup || memberIds.length === 0) {
    showFeatureStatus("Оберіть хоча б одного учасника групи.");
    return;
  }

  chat.members = chats
    .filter((item) => !item.isGroup && memberIds.includes(item.id))
    .map(({ id, name, initials, color, status }) => ({ id, name, initials, color, status }));

  const stateSaved = persistState();
  groupEditForm.hidden = true;
  renderGroupMembers(chat);
  conversationStatus.textContent = getChatStatus(chat);
  renderChatList();
  if (stateSaved) {
    showFeatureStatus("Склад групи збережено.");
  }
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

  const members = chats
    .filter((chat) => memberIds.includes(chat.id))
    .map(({ id, name: memberName, status }) => ({ id, name: memberName, status }));
  const now = new Date();
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
        time: now.toLocaleTimeString("uk-UA", { hour: "2-digit", minute: "2-digit" }),
        datetime: now.toISOString(),
      },
    ],
  };

  chats.push(group);
  persistState();
  groupForm.reset();
  groupForm.hidden = true;
  createGroupButton.hidden = false;
  selectChat(group.id);
});

profileToggle.addEventListener("click", () => {
  profileForm.hidden = !profileForm.hidden;
  contactForm.hidden = true;
  if (!profileForm.hidden) {
    profileNameInput.focus();
  }
});

profileForm.addEventListener("submit", (event) => {
  event.preventDefault();
  profile = {
    ...profile,
    name: profileNameInput.value.trim(),
    phone: profilePhoneInput.value.trim(),
    email: profileEmailInput.value.trim(),
    avatar: profileAvatarInput.value.trim(),
    color: profileColorInput.value,
    code: profileCodeInput.value.trim(),
  };

  if (!profile.code) {
    try {
      profile.code = generateSecretCode();
    } catch (error) {
      showFeatureStatus(getErrorMessage(error));
      return;
    }
  }

  profileCodeInput.value = profile.code;
  profileToggle.textContent = `Мій профіль · ${profile.name}`;
  const stateSaved = persistState();
  profileForm.hidden = true;
  if (stateSaved) {
    showFeatureStatus(`Профіль збережено. Ваш секретний код: ${profile.code}`);
  }
});

generateCodeButton.addEventListener("click", () => {
  try {
    profileCodeInput.value = generateSecretCode();
  } catch (error) {
    showFeatureStatus(getErrorMessage(error));
  }
});

addContactButton.addEventListener("click", () => {
  contactForm.hidden = !contactForm.hidden;
  profileForm.hidden = true;
  if (!contactForm.hidden) {
    contactNameInput.focus();
  }
});

cancelContactButton.addEventListener("click", () => {
  contactForm.reset();
  contactForm.hidden = true;
});

contactForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const name = contactNameInput.value.trim();
  const phone = contactPhoneInput.value.trim();
  const email = contactEmailInput.value.trim().toLowerCase();
  const code = contactCodeInput.value.trim().toUpperCase();

  if (!phone && !email && !code) {
    showFeatureStatus("Укажіть номер телефону, імейл або секретний код контакту.");
    return;
  }

  const normalizePhone = (value) => value.replace(/\D/g, "");
  const duplicate = chats.find((chat) => !chat.isGroup && (
    (phone && chat.phone && normalizePhone(phone) === normalizePhone(chat.phone))
    || (email && chat.email?.toLowerCase() === email)
    || (code && chat.code?.toUpperCase() === code)
  ));
  if (duplicate) {
    showFeatureStatus(`${duplicate.name} уже є у списку контактів.`);
    return;
  }

  const now = new Date();
  const colors = ["coral", "blue", "purple", "green", "gold"];
  const contact = {
    id: `contact-${Date.now()}`,
    name,
    initials: name.slice(0, 2).toUpperCase(),
    phone,
    email,
    code,
    color: colors[chats.filter((chat) => !chat.isGroup).length % colors.length],
    status: "offline",
    messages: [{
      sender: "contact",
      author: "Система",
      text: "Контакт додано. Напишіть перше повідомлення.",
      time: now.toLocaleTimeString("uk-UA", { hour: "2-digit", minute: "2-digit" }),
      datetime: now.toISOString(),
    }],
  };

  chats.push(contact);
  const stateSaved = persistState();
  contactForm.reset();
  contactForm.hidden = true;
  renderChatList();
  selectChat(contact.id);
  if (stateSaved) {
    showFeatureStatus("Контакт додано.");
  }
});

improveMessageButton.addEventListener("click", async () => {
  const text = messageInput.value.trim();

  if (!text) {
    showFeatureStatus("Спочатку введіть повідомлення для покращення.");
    messageInput.focus();
    return;
  }

  improveMessageButton.disabled = true;
  showFeatureStatus("Готую покращений варіант...", true);

  try {
    const improvedText = await requestService(
      serviceEndpoints.improve,
      { text, language: "uk" },
      "suggestion"
    );
    messageInput.value = improvedText;
    resizeMessageInput();
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
    recorder.addEventListener("stop", async () => {
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

      let audioUrl;
      try {
        audioUrl = await blobToDataUrl(new Blob(audioChunks, { type: recorder.mimeType }));
      } catch (error) {
        showFeatureStatus(getErrorMessage(error));
        return;
      }

      const now = new Date();
      chat.messages.push({
        sender: "you",
        text: "Голосове повідомлення",
        audioUrl,
        time: now.toLocaleTimeString("uk-UA", { hour: "2-digit", minute: "2-digit" }),
        datetime: now.toISOString(),
      });

      renderChatList();
      if (activeChatId === chat.id) {
        renderMessages(chat);
      }
      if (persistState()) {
        showFeatureStatus("Голосове повідомлення додано до чату.");
      }
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
  resizeMessageInput();
});

profileNameInput.addEventListener("input", updateProfilePreview);
profileAvatarInput.addEventListener("input", updateProfilePreview);
profileColorInput.addEventListener("change", updateProfilePreview);

restoreSavedState();
populateProfileForm();
selectChat(activeChatId, false);
resizeMessageInput();
