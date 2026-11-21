import json
import os
import sqlite3
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.parse import urlsplit
from urllib.request import Request, urlopen


ROOT = Path(__file__).resolve().parent
MAX_REQUEST_SIZE = 16 * 1024 * 1024
MAX_TEXT_LENGTH = 5000
DB_PATH = Path(os.environ.get("TEAMCHAT_DB", str(ROOT / "teamchat.db")))


class ServiceError(Exception):
    def __init__(self, message, status_code):
        super().__init__(message)
        self.status_code = status_code


def init_database():
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    with sqlite3.connect(DB_PATH) as connection:
        connection.execute("PRAGMA foreign_keys = ON")
        connection.executescript(
            """
            CREATE TABLE IF NOT EXISTS app_state (
                id INTEGER PRIMARY KEY CHECK (id = 1),
                active_chat_id TEXT
            );

            CREATE TABLE IF NOT EXISTS profile (
                id INTEGER PRIMARY KEY CHECK (id = 1),
                name TEXT NOT NULL,
                phone TEXT NOT NULL DEFAULT '',
                email TEXT NOT NULL DEFAULT '',
                avatar TEXT NOT NULL DEFAULT 'В',
                color TEXT NOT NULL DEFAULT 'blue',
                code TEXT NOT NULL DEFAULT ''
            );

            CREATE TABLE IF NOT EXISTS chats (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                initials TEXT NOT NULL DEFAULT '',
                avatar TEXT,
                color TEXT NOT NULL DEFAULT 'blue',
                status TEXT NOT NULL DEFAULT 'offline',
                is_group INTEGER NOT NULL DEFAULT 0,
                phone TEXT,
                email TEXT,
                code TEXT
            );

            CREATE TABLE IF NOT EXISTS messages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                chat_id TEXT NOT NULL,
                sender TEXT NOT NULL CHECK (sender IN ('you', 'contact')),
                author TEXT,
                text TEXT NOT NULL,
                translated_text TEXT,
                audio_url TEXT,
                time TEXT,
                datetime TEXT,
                edited INTEGER NOT NULL DEFAULT 0,
                FOREIGN KEY (chat_id) REFERENCES chats(id) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS group_members (
                group_id TEXT NOT NULL,
                member_id TEXT NOT NULL,
                PRIMARY KEY (group_id, member_id),
                FOREIGN KEY (group_id) REFERENCES chats(id) ON DELETE CASCADE,
                FOREIGN KEY (member_id) REFERENCES chats(id) ON DELETE CASCADE
            );

            CREATE INDEX IF NOT EXISTS idx_messages_chat_id ON messages(chat_id, id);
            """
        )


def get_database():
    connection = sqlite3.connect(DB_PATH)
    connection.row_factory = sqlite3.Row
    connection.execute("PRAGMA foreign_keys = ON")
    return connection


def load_state():
    with get_database() as connection:
        profile_row = connection.execute("SELECT * FROM profile WHERE id = 1").fetchone()
        chat_rows = connection.execute("SELECT * FROM chats ORDER BY rowid").fetchall()
        if profile_row is None and not chat_rows:
            return None

        profile = {
            "name": "Мій профіль",
            "phone": "",
            "email": "",
            "avatar": "В",
            "color": "blue",
            "code": "",
        }
        if profile_row:
            profile = {
                "name": profile_row["name"],
                "phone": profile_row["phone"],
                "email": profile_row["email"],
                "avatar": profile_row["avatar"],
                "color": profile_row["color"],
                "code": profile_row["code"],
            }

        chats = []
        for chat_row in chat_rows:
            chat = {
                "id": chat_row["id"],
                "name": chat_row["name"],
                "initials": chat_row["initials"],
                "color": chat_row["color"],
                "status": chat_row["status"],
            }
            if chat_row["avatar"]:
                chat["avatar"] = chat_row["avatar"]
            if chat_row["phone"]:
                chat["phone"] = chat_row["phone"]
            if chat_row["email"]:
                chat["email"] = chat_row["email"]
            if chat_row["code"]:
                chat["code"] = chat_row["code"]
            if chat_row["is_group"]:
                chat["isGroup"] = True
                member_rows = connection.execute(
                    """
                    SELECT c.id, c.name, c.initials, c.avatar, c.color, c.status
                    FROM group_members gm
                    JOIN chats c ON c.id = gm.member_id
                    WHERE gm.group_id = ?
                    """,
                    (chat["id"],),
                ).fetchall()
                chat["members"] = [
                    {
                        "id": member["id"],
                        "name": member["name"],
                        "initials": member["initials"],
                        "avatar": member["avatar"] if member["avatar"] else None,
                        "color": member["color"],
                        "status": member["status"],
                    }
                    for member in member_rows
                ]

            message_rows = connection.execute(
                "SELECT * FROM messages WHERE chat_id = ? ORDER BY id",
                (chat["id"],),
            ).fetchall()
            chat["messages"] = [
                {
                    key: value
                    for key, value in {
                        "sender": message["sender"],
                        "author": message["author"],
                        "text": message["text"],
                        "translatedText": message["translated_text"],
                        "audioUrl": message["audio_url"],
                        "time": message["time"],
                        "datetime": message["datetime"],
                        "edited": bool(message["edited"]),
                    }.items()
                    if value is not None and value != "" and not (key == "edited" and not value)
                }
                for message in message_rows
            ]
            chats.append(chat)

        state_row = connection.execute("SELECT active_chat_id FROM app_state WHERE id = 1").fetchone()
        return {
            "chats": chats,
            "profile": profile,
            "activeChatId": state_row["active_chat_id"] if state_row else None,
        }


def save_state(state):
    if not isinstance(state, dict):
        raise ServiceError("Стан чату має бути JSON-об’єктом.", 400)
    chats = state.get("chats")
    profile = state.get("profile")
    if not isinstance(chats, list) or not isinstance(profile, dict):
        raise ServiceError("Некоректна структура стану чату.", 400)

    with get_database() as connection:
        connection.execute("BEGIN")
        connection.execute("DELETE FROM group_members")
        connection.execute("DELETE FROM messages")
        connection.execute("DELETE FROM chats")
        connection.execute("DELETE FROM profile")

        connection.execute(
            """
            INSERT INTO profile (id, name, phone, email, avatar, color, code)
            VALUES (1, ?, ?, ?, ?, ?, ?)
            """,
            (
                str(profile.get("name", "Мій профіль"))[:40],
                str(profile.get("phone", ""))[:100],
                str(profile.get("email", ""))[:254],
                str(profile.get("avatar", "В"))[:4],
                str(profile.get("color", "blue"))[:20],
                str(profile.get("code", ""))[:24],
            ),
        )

        for chat in chats:
            if not isinstance(chat, dict) or not isinstance(chat.get("id"), str) or not isinstance(chat.get("name"), str):
                raise ServiceError("Некоректний формат чату.", 400)
            connection.execute(
                """
                INSERT INTO chats (id, name, initials, avatar, color, status, is_group, phone, email, code)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    chat["id"][:100],
                    chat["name"][:40],
                    str(chat.get("initials", chat["name"][:2]))[:10],
                    chat.get("avatar") if isinstance(chat.get("avatar"), str) else None,
                    str(chat.get("color", "blue"))[:20],
                    str(chat.get("status", "offline"))[:20],
                    1 if chat.get("isGroup") else 0,
                    str(chat.get("phone", ""))[:100] if chat.get("phone") is not None else None,
                    str(chat.get("email", ""))[:254] if chat.get("email") is not None else None,
                    str(chat.get("code", ""))[:24] if chat.get("code") is not None else None,
                ),
            )

            messages = chat.get("messages", [])
            if not isinstance(messages, list):
                raise ServiceError("Некоректний формат повідомлень.", 400)
            for message in messages:
                if not isinstance(message, dict) or message.get("sender") not in ("you", "contact"):
                    raise ServiceError("Некоректний формат повідомлення.", 400)
                text = message.get("text")
                if not isinstance(text, str):
                    raise ServiceError("Текст повідомлення має бути рядком.", 400)
                connection.execute(
                    """
                    INSERT INTO messages
                    (chat_id, sender, author, text, translated_text, audio_url, time, datetime, edited)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """,
                    (
                        chat["id"],
                        message["sender"],
                        str(message["author"])[:100] if isinstance(message.get("author"), str) else None,
                        text[:MAX_TEXT_LENGTH],
                        str(message["translatedText"])[:MAX_TEXT_LENGTH] if isinstance(message.get("translatedText"), str) else None,
                        str(message["audioUrl"])[:16 * 1024 * 1024] if isinstance(message.get("audioUrl"), str) else None,
                        str(message["time"])[:30] if isinstance(message.get("time"), str) else None,
                        str(message["datetime"])[:100] if isinstance(message.get("datetime"), str) else None,
                        1 if message.get("edited") else 0,
                    ),
                )

        for chat in chats:
            members = chat.get("members", []) if chat.get("isGroup") else []
            if isinstance(members, list):
                for member in members:
                    if isinstance(member, dict) and isinstance(member.get("id"), str):
                        connection.execute(
                            "INSERT OR IGNORE INTO group_members (group_id, member_id) VALUES (?, ?)",
                            (chat["id"], member["id"]),
                        )

        active_chat_id = state.get("activeChatId")
        if not isinstance(active_chat_id, str):
            active_chat_id = None
        connection.execute("DELETE FROM app_state")
        connection.execute(
            "INSERT INTO app_state (id, active_chat_id) VALUES (1, ?)",
            (active_chat_id,),
        )


init_database()


def call_ai(system_prompt, text):
    api_key = os.environ.get("OPENAI_API_KEY", "").strip()
    if not api_key:
        raise ServiceError(
            "AI-сервіс не налаштовано. Додайте OPENAI_API_KEY у середовище сервера.",
            503,
        )

    base_url = os.environ.get("OPENAI_BASE_URL", "https://api.openai.com/v1").rstrip("/")
    payload = {
        "model": os.environ.get("OPENAI_MODEL", "gpt-4o-mini"),
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": text},
        ],
        "temperature": 0.3,
        "max_tokens": 1200,
    }
    request = Request(
        f"{base_url}/chat/completions",
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
        method="POST",
    )

    try:
        with urlopen(request, timeout=30) as response:
            result = json.loads(response.read().decode("utf-8"))
    except HTTPError as error:
        if error.code == 401:
            raise ServiceError("Ключ доступу до AI-сервісу недійсний.", 502) from error
        if error.code == 429:
            raise ServiceError("AI-сервіс перевантажений. Спробуйте трохи пізніше.", 503) from error
        raise ServiceError("AI-сервіс тимчасово недоступний. Спробуйте ще раз.", 502) from error
    except (URLError, TimeoutError, OSError) as error:
        raise ServiceError("Не вдалося з’єднатися з AI-сервісом. Перевірте сервер і повторіть спробу.", 502) from error
    except (UnicodeDecodeError, json.JSONDecodeError) as error:
        raise ServiceError("AI-сервіс повернув некоректну відповідь.", 502) from error

    try:
        content = result["choices"][0]["message"]["content"]
    except (KeyError, IndexError, TypeError) as error:
        raise ServiceError("AI-сервіс повернув відповідь у неочікуваному форматі.", 502) from error

    if not isinstance(content, str) or not content.strip():
        raise ServiceError("AI-сервіс не повернув текст. Спробуйте ще раз.", 502)
    return content.strip()


class TeamChatRequestHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def do_GET(self):
        if urlsplit(self.path).path == "/api/state":
            try:
                state = load_state()
                self._send_json(state if state is not None else {}, 200)
            except Exception:
                self.log_error("Unexpected error while loading state")
                self._send_json({"error": "Не вдалося завантажити дані з бази."}, 500)
            return
        super().do_GET()

    def do_PUT(self):
        if urlsplit(self.path).path != "/api/state":
            self._send_json({"error": "Такий ресурс не знайдено."}, 404)
            return
        try:
            state = self._read_json()
            save_state(state)
            self._send_json({"saved": True})
        except ServiceError as error:
            self._send_json({"error": str(error)}, error.status_code)
        except (UnicodeDecodeError, json.JSONDecodeError):
            self._send_json({"error": "Надішліть коректний JSON-запит."}, 400)
        except sqlite3.IntegrityError as error:
            self.log_error("Database integrity error: %s", error)
            self._send_json({"error": "Не вдалося зберегти стан через некоректні зв’язки даних."}, 400)
        except Exception:
            self.log_error("Unexpected error while saving state")
            self._send_json({"error": "Не вдалося зберегти дані в базу."}, 500)

    def do_POST(self):
        routes = {
            "/api/improve": (
                "Покращи повідомлення українською, зберігаючи його зміст і тон. "
                "Поверни лише покращений текст.",
                "suggestion",
            ),
            "/api/translate": (
                "Переклади повідомлення українською. Збережи зміст і тон. "
                "Поверни лише переклад.",
                "translation",
            ),
        }
        route = routes.get(urlsplit(self.path).path)
        if route is None:
            self._send_json({"error": "Такий сервіс не знайдено."}, 404)
            return

        try:
            text = self._read_text()
            result = call_ai(route[0], text)
            self._send_json({route[1]: result})
        except ServiceError as error:
            self._send_json({"error": str(error)}, error.status_code)
        except (UnicodeDecodeError, json.JSONDecodeError):
            self._send_json({"error": "Надішліть коректний JSON-запит."}, 400)
        except Exception:
            self.log_error("Unexpected error while handling an AI request")
            self._send_json({"error": "Не вдалося обробити запит. Спробуйте ще раз."}, 500)

    def _read_text(self):
        payload = self._read_json()
        if not isinstance(payload, dict):
            raise ServiceError("Запит має бути JSON-об’єктом.", 400)
        text = payload.get("text")
        if not isinstance(text, str) or not text.strip():
            raise ServiceError("Введіть текст для обробки.", 400)
        text = text.strip()
        if len(text) > MAX_TEXT_LENGTH:
            raise ServiceError("Текст не може перевищувати 5000 символів.", 413)
        return text

    def _read_json(self):
        try:
            content_length = int(self.headers.get("Content-Length", ""))
        except ValueError as error:
            raise ServiceError("Некоректний розмір запиту.", 400) from error
        if content_length < 0:
            raise ServiceError("Некоректний розмір запиту.", 400)
        if content_length > MAX_REQUEST_SIZE:
            raise ServiceError("Запит завеликий.", 413)

        return json.loads(self.rfile.read(content_length).decode("utf-8"))

    def _send_json(self, payload, status=200):
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body)


def main():
    host = os.environ.get("HOST", "127.0.0.1")
    port = int(os.environ.get("PORT", "8000"))
    init_database()
    server = ThreadingHTTPServer((host, port), TeamChatRequestHandler)
    print(f"TeamChat server running at http://{host}:{port}")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nStopping TeamChat server.")
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
