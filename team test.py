import tkinter as tk
from tkinter import messagebox


class TextToolApp:
    def __init__(self, root):
        self.root = root
        self.root.title("Мультитул Tkinter")
        self.root.geometry("420x500")
        self.root.resizable(False, False)
        self.root.configure(bg="#F4F6F5")

        self._create_widgets()

    def _create_widgets(self):
        tk.Label(
            self.root,
            text="Введіть текст:",
            font=("Arial", 12),
            bg="#F4F6F5",
            fg="#34413F",
        ).pack(pady=10)

        self.entry_input = tk.Entry(self.root, font=("Arial", 12), width=25, justify="center")
        self.entry_input.pack(pady=5)

        btn_style = {
            "font": ("Arial", 10, "bold"),
            "width": 22,
            "pady": 4,
            "fg": "white",
            "bg": "#668F8B",
            "activebackground": "#587D79",
            "activeforeground": "white",
            "relief": "flat",
            "bd": 0,
            "cursor": "hand2",
        }
        buttons = [
            ("Привітатися", self.greet_user),
            ("Порахувати символи", self.count_chars),
            ("Перевернути текст", self.reverse_text),
            ("У великі літери", self.to_upper),
            ("Очистити", self.reset_all),
        ]

        for text, command in buttons:
            tk.Button(self.root, text=text, command=command, **btn_style).pack(pady=4)

        self.result_frame = tk.Frame(self.root, bg="#E8EEEC", bd=0, padx=10, pady=10)
        self.result_frame.pack(fill="x", padx=20, pady=(10, 0))

        tk.Label(
            self.result_frame,
            text="Результат:",
            font=("Arial", 11, "bold"),
            bg="#E8EEEC",
            fg="#34413F",
        ).pack(anchor="w")
        self.label_result = tk.Label(
            self.result_frame,
            text="",
            font=("Arial", 12, "bold"),
            fg="#34413F",
            bg="#E8EEEC",
            justify="center",
            wraplength=300,
        )
        self.label_result.pack(anchor="center", pady=(8, 0))

    def get_text(self):
        return self.entry_input.get()

    def set_result(self, text):
        self.label_result.config(text=text)

    def greet_user(self):
        text = self.get_text().strip()
        if not text:
            messagebox.showwarning("Попередження", "Введіть текст!")
            return
        self.set_result(f"Привіт, {text}!")

    def count_chars(self):
        text = self.get_text()
        self.set_result(f"Символів: {len(text)}")

    def reverse_text(self):
        text = self.get_text()
        self.set_result(f"Навпаки: {text[::-1]}")

    def to_upper(self):
        text = self.get_text()
        self.set_result(text.upper())

    def reset_all(self):
        self.entry_input.delete(0, tk.END)
        self.set_result("")


def main():
    root = tk.Tk()
    TextToolApp(root)
    root.mainloop()


if __name__ == "__main__":
    main()
