import json
import os
import threading
import unittest
from io import BytesIO
from http.server import ThreadingHTTPServer
from unittest.mock import patch
from urllib.error import HTTPError
from urllib.request import Request, urlopen

import server


class AiServiceEndpointTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.http_server = ThreadingHTTPServer(("127.0.0.1", 0), server.TeamChatRequestHandler)
        cls.thread = threading.Thread(target=cls.http_server.serve_forever, daemon=True)
        cls.thread.start()
        cls.base_url = f"http://127.0.0.1:{cls.http_server.server_port}"

    @classmethod
    def tearDownClass(cls):
        cls.http_server.shutdown()
        cls.http_server.server_close()
        cls.thread.join()

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


if __name__ == "__main__":
    unittest.main()
