import tkinter as tk
from tkinter import messagebox

def greet_user():
    text = entry_input.get().strip()
    if not text:
        messagebox.showwarning("Попередження", "Введіть текст!")
        return
    label_result.config(text=f"Привіт, {text}!")
    
def count_chars():
    text = entry_input.get()
    label_result.config(text=f"Символів: {len(text)}")
def reverse_text():
    text = entry_input.get()
    label_result.config(text=f"Навпаки: {text[::-1]}")

def to_upper():
    text = entry_input.get()
    label_result.config(text=text.upper())

def reset_all():
    entry_input.delete(0, tk.END)
    label_result.config(text="")
root = tk.Tk()
root.title("Мультитул Tkinter")
root.geometry("400x420")
root.resizable(False, False)

tk.Label(root, text="Введіть текст:", font=("Arial", 12)).pack(pady=10)

entry_input = tk.Entry(root, font=("Arial", 12), width=25, justify="center")
entry_input.pack(pady=5)

btn_style = {"font": ("Arial", 10, "bold"), "width": 22, "pady": 4, "fg": "white"}

tk.Button(root, text="Привітатися", bg="#4CAF50", command=greet_user, **btn_style).pack(pady=4)
tk.Button(root, text="Порахувати символи", bg="#2196F3", command=count_chars, **btn_style).pack(pady=4)
tk.Button(root, text="Перевернути текст", bg="#FF9800", command=reverse_text, **btn_style).pack(pady=4)
tk.Button(root, text="У великі літери", bg="#9C27B0", command=to_upper, **btn_style).pack(pady=4)
tk.Button(root, text="Очистити", bg="#F44336", command=reset_all, **btn_style).pack(pady=4)

label_result = tk.Label(root, text="", font=("Arial", 12, "bold"), fg="#333")
label_result.pack(pady=15)

# Запуск програми
if __name__ == "__main__":
    root.mainloop()
