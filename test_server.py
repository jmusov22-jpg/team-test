import json
import os
import threading
import unittest
import tempfile
from io import BytesIO
from http.server import ThreadingHTTPServer
from pathlib import Path
from unittest.mock import patch
from urllib.error import HTTPError
from urllib.request import Request, urlopen

import server


class AiServiceEndpointTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.temp_directory = tempfile.TemporaryDirectory(ignore_cleanup_errors=True)
        server.DB_PATH = Path(cls.temp_directory.name) / "test-teamchat.db"
        server.init_database()
        cls.http_server = ThreadingHTTPServer(("127.0.0.1", 0), server.TeamChatRequestHandler)
        cls.thread = threading.Thread(target=cls.http_server.serve_forever, daemon=True)
        cls.thread.start()
        cls.base_url = f"http://127.0.0.1:{cls.http_server.server_port}"

    @classmethod
    def tearDownClass(cls):
        cls.http_server.shutdown()
        cls.http_server.server_close()
        cls.thread.join()
        cls.temp_directory.cleanup()

    def post(self, path, payload):
        request = Request(
            f"{self.base_url}{path}",
            data=json.dumps(payload).encode("utf-8"),
            headers={"Content-Type": "application/json"},
            method="POST",
        )
        try:
            response = urlopen(request, timeout=2)
        except HTTPError as error:
            response = error
        with response:
            return response.status, json.loads(response.read().decode("utf-8"))

    def test_improve_and_translate_return_expected_fields(self):
        with patch.object(server, "call_ai", return_value="Оброблений текст") as call_ai:
            status, improve_result = self.post("/api/improve", {"text": "покращи це", "language": "uk"})
            self.assertEqual((status, improve_result), (200, {"suggestion": "Оброблений текст"}))
            self.assertIn("Покращи", call_ai.call_args.args[0])

            status, translation_result = self.post("/api/translate", {"text": "hello", "targetLanguage": "uk"})
            self.assertEqual((status, translation_result), (200, {"translation": "Оброблений текст"}))
            self.assertIn("Переклади", call_ai.call_args.args[0])

    def test_empty_text_returns_readable_client_error(self):
        with patch.object(server, "call_ai") as call_ai:
            status, result = self.post("/api/translate", {"text": "  "})

        self.assertEqual(status, 400)
        self.assertEqual(result["error"], "Введіть текст для обробки.")
        call_ai.assert_not_called()

    def test_missing_api_key_returns_configuration_error(self):
        with patch.dict("os.environ", {"OPENAI_API_KEY": ""}):
            status, result = self.post("/api/improve", {"text": "текст"})

        self.assertEqual(status, 503)
        self.assertIn("OPENAI_API_KEY", result["error"])

    def test_provider_key_is_sent_from_server(self):
        response_body = json.dumps({
            "choices": [{"message": {"content": "Готовий текст"}}],
        }).encode("utf-8")
        with patch.dict(os.environ, {"OPENAI_API_KEY": "test-key"}):
            with patch.object(server, "urlopen", return_value=BytesIO(response_body)) as urlopen_mock:
                result = server.call_ai("system prompt", "user text")

        request = urlopen_mock.call_args.args[0]
        self.assertEqual(result, "Готовий текст")
        self.assertEqual(request.get_header("Authorization"), "Bearer test-key")

    def test_database_state_round_trip(self):
        state = {
            "activeChatId": "chat-1",
            "profile": {
                "name": "Тест",
                "phone": "+380",
                "email": "test@example.com",
                "avatar": "Т",
                "color": "blue",
                "code": "ABC123",
            },
            "chats": [
                {
                    "id": "chat-1",
                    "name": "Тестовий чат",
                    "initials": "ТЧ",
                    "color": "coral",
                    "status": "online",
                    "messages": [
                        {
                            "sender": "you",
                            "text": "Привіт",
                            "time": "12:00",
                            "datetime": "2026-11-21T12:00",
                        },
                    ],
                },
            ],
        }

        put_request = Request(
            f"{self.base_url}/api/state",
            data=json.dumps(state).encode("utf-8"),
            headers={"Content-Type": "application/json"},
            method="PUT",
        )
        with urlopen(put_request, timeout=2) as response:
            put_result = json.loads(response.read().decode("utf-8"))
            self.assertEqual(response.status, 200)
            self.assertTrue(put_result["saved"])

        get_request = Request(f"{self.base_url}/api/state")
        with urlopen(get_request, timeout=2) as response:
            loaded = json.loads(response.read().decode("utf-8"))

        self.assertEqual(loaded["profile"]["name"], "Тест")
        self.assertEqual(loaded["activeChatId"], "chat-1")
        self.assertEqual(loaded["chats"][0]["messages"][0]["text"], "Привіт")


if __name__ == "__main__":
    unittest.main()
