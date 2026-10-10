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
