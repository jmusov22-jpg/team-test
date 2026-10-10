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