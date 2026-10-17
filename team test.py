from logging import root
import tkinter as tk
from tkinter import messagebox


class TextToolApp:
    def __init__(self, root):
        self.root = root
        self.root.title("Мультитул Tkinter")
        self.root.geometry("400x420")
        self.root.resizable(False, False)

        self._create_widgets()

    def _create_widgets(self):
        tk.Label(self.root, text="Введіть текст:", font=("Arial", 12)).pack(pady=10)

        self.entry_input = tk.Entry(self.root, font=("Arial", 12), width=25, justify="center")
        self.entry_input.pack(pady=5)

        btn_style = {"font": ("Arial", 10, "bold"), "width": 22, "pady": 4, "fg": "white"}
        buttons = [
            ("Привітатися", "#4CAF50", self.greet_user),
            ("Порахувати символи", "#2196F3", self.count_chars),
            ("Перевернути текст", "#FF9800", self.reverse_text),
            ("У великі літери", "#9C27B0", self.to_upper),
            ("Очистити", "#F44336", self.reset_all),
        ]

        for text, bg, command in buttons:
            tk.Button(self.root, text=text, bg=bg, command=command, **btn_style).pack(pady=4)

        self.label_result = tk.Label(self.root, text="", font=("Arial", 12, "bold"), fg="#333")
        self.label_result.pack(pady=15)

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

def buttons():
    btn_style = {"font": ("Arial", 10, "bold"), "width": 22, "pady": 4, "fg": "white"}
    tk.Button(root, text="Привітатися", bg="#4CAF50", command=greet_user, **btn_style).pack(pady=4)
    tk.Button(root, text="Порахувати символи", bg="#2196F3", command=count_chars, **btn_style).pack(pady=4)
    tk.Button(root, text="Перевернути текст", bg="#FF9800", command=reverse_text, **btn_style).pack(pady=4)
    tk.Button(root, text="У великі літери", bg="#9C27B0", command=to_upper, **btn_style).pack(pady=4)
    tk.Button(root, text="Очистити", bg="#F44336", command=reset_all, **btn_style).pack(pady=4)

def widgets():
    tk.Label(root, text="Введіть текст:", font=("Arial", 12)).pack(pady=10)

    entry_input = tk.Entry(root, font=("Arial", 12), width=25, justify="center")
    entry_input.pack(pady=5)
