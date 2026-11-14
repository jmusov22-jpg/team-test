import json
import os
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.parse import urlsplit
from urllib.request import Request, urlopen


ROOT = Path(__file__).resolve().parent
MAX_REQUEST_SIZE = 64 * 1024
MAX_TEXT_LENGTH = 5000


class ServiceError(Exception):
    def __init__(self, message, status_code):
        super().__init__(message)
        self.status_code = status_code


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
        try:
            content_length = int(self.headers.get("Content-Length", ""))
        except ValueError as error:
            raise ServiceError("Некоректний розмір запиту.", 400) from error
        if content_length < 0:
            raise ServiceError("Некоректний розмір запиту.", 400)
        if content_length > MAX_REQUEST_SIZE:
            raise ServiceError("Запит завеликий.", 413)

        payload = json.loads(self.rfile.read(content_length).decode("utf-8"))
        if not isinstance(payload, dict):
            raise ServiceError("Запит має бути JSON-об’єктом.", 400)
        text = payload.get("text")
        if not isinstance(text, str) or not text.strip():
            raise ServiceError("Введіть текст для обробки.", 400)
        text = text.strip()
        if len(text) > MAX_TEXT_LENGTH:
            raise ServiceError("Текст не може перевищувати 5000 символів.", 413)
        return text

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
