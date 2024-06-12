import tkinter as tk
from tkinter import ttk, filedialog, messagebox
import pygame
import pickle
import threading
import random
import time
import numpy as np

# Initialize Pygame
pygame.init()
pygame.mixer.set_num_channels(1)  # Ensure only one sound can play at a time

# Load elements from the file
with open('elements.pkl', 'rb') as f:
    elements = pickle.load(f)

# Sound generator function
def generate_bangy_sounds(num_sounds=16, length=0.1, sample_rate=44100):
    sounds = []
    for _ in range(num_sounds):
        frequency = random.uniform(300, 1200)
        volume = random.uniform(0.1, 0.3)  # Adjust volume to be lower
        samples = np.linspace(0, length, int(sample_rate * length), endpoint=False)
        waveform = volume * np.sign(np.sin(2 * np.pi * frequency * samples))  # More bangy square wave
        waveform = np.int16(waveform * 32767)
        waveform_stereo = np.repeat(waveform[:, np.newaxis], 2, axis=1)
        sound = pygame.sndarray.make_sound(waveform_stereo)
        sounds.append(sound)
    return sounds

# Generate 16 bangy collision sounds
collision_sounds = generate_bangy_sounds()

class PeriodicTableSimulator:
    def __init__(self, root):
        self.root = root
        self.root.title("Periodic Table Simulator")
        self.root.geometry("1200x800")
        self.root.configure(bg='black')

        self.selected_element = None
        self.simulation_running = False
        self.floor_active = True
        self.holding_lmb = False

        self.setup_gui()
        self.start_simulation()

    def setup_gui(self):
        # Create main frame
        self.main_frame = tk.Frame(self.root, bg="black")
        self.main_frame.pack(fill=tk.BOTH, expand=True)

        # Create frame for particle menu
        self.pt_frame = tk.Frame(self.main_frame, bg="black")
        self.pt_frame.pack(side=tk.LEFT, fill=tk.Y)

        # Add a scrollbar for the particle menu
        self.pt_canvas = tk.Canvas(self.pt_frame, bg="black", highlightthickness=0)
        self.pt_canvas.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)

        style = ttk.Style()
        style.theme_use("clam")
        style.configure("Vertical.TScrollbar", troughcolor='black', background='gray30', bordercolor='black', arrowcolor='white')
        self.scrollbar = ttk.Scrollbar(self.pt_frame, orient="vertical", command=self.pt_canvas.yview, style="Vertical.TScrollbar")
        self.scrollbar.pack(side=tk.RIGHT, fill=tk.Y)

        self.pt_canvas.configure(yscrollcommand=self.scrollbar.set)
        self.pt_canvas.bind('<Configure>', lambda e: self.pt_canvas.configure(scrollregion=self.pt_canvas.bbox("all")))
        self.pt_canvas.bind_all("<MouseWheel>", self._on_mousewheel)

        self.pt_inner_frame = tk.Frame(self.pt_canvas, bg="black")
        self.pt_canvas.create_window((0, 0), window=self.pt_inner_frame, anchor="nw")

        # Create particle menu buttons
        for symbol, properties in elements.items():
            btn = tk.Button(self.pt_inner_frame, text=symbol, bg=properties['color'],
                            fg="white", width=5, height=2,
                            font=("Helvetica", 12, "bold"),
                            command=lambda s=symbol: self.select_element(s),
                            relief="flat", highlightthickness=0, borderwidth=0)
            btn.pack(side=tk.TOP, fill=tk.X)  # Ensure no padding or spacing
            self.create_tooltip(btn, properties['name'])

        # Create frame for simulation area
        self.sim_frame = tk.Frame(self.main_frame, bg="black")
        self.sim_frame.pack(side=tk.RIGHT, fill=tk.BOTH, expand=True)

        # Add simulation canvas
        self.sim_canvas = tk.Canvas(self.sim_frame, bg="black", highlightthickness=1, highlightbackground="white")
        self.sim_canvas.pack(fill=tk.BOTH, expand=True)
        self.sim_canvas.bind("<Button-1>", self.start_placing_elements)
        self.sim_canvas.bind("<ButtonRelease-1>", self.stop_placing_elements)

        # Create control buttons frame
        self.control_frame = tk.Frame(self.sim_frame, bg="black")
        self.control_frame.pack(side=tk.BOTTOM, fill=tk.X, pady=5)

        self.save_btn = tk.Button(self.control_frame, text="Save Simulation", command=self.save_simulation, bg="gray30", fg="white")
        self.save_btn.pack(side=tk.LEFT, padx=5, pady=5)

        self.load_btn = tk.Button(self.control_frame, text="Load Simulation", command=self.load_simulation, bg="gray30", fg="white")
        self.load_btn.pack(side=tk.LEFT, padx=5, pady=5)

        self.clear_btn = tk.Button(self.control_frame, text="Clear Simulation", command=self.clear_simulation, bg="gray30", fg="white")
        self.clear_btn.pack(side=tk.LEFT, padx=5, pady=5)

        self.floor_btn = tk.Button(self.control_frame, text="Toggle Floor", command=self.toggle_floor, bg="gray30", fg="white")
        self.floor_btn.pack(side=tk.LEFT, padx=5, pady=5)

        self.floor_status_label = tk.Label(self.control_frame, text="Floor: ON", bg="black", fg="green", font=("Helvetica", 12))
        self.floor_status_label.pack(side=tk.LEFT, padx=5, pady=5)

    def _on_mousewheel(self, event):
        self.pt_canvas.yview_scroll(int(-1*(event.delta/120)), "units")

    def create_tooltip(self, widget, text):
        tooltip = tk.Toplevel(widget)
        tooltip.withdraw()
        tooltip.wm_overrideredirect(True)
        tooltip.wm_geometry("+0+0")
        label = tk.Label(tooltip, text=text, bg="yellow", fg="black", relief="solid", borderwidth=1, font=("Helvetica", 10, "normal"))
        label.pack()

        def on_enter(event):
            x, y, _, _ = widget.bbox("insert")
            x += widget.winfo_rootx() + 25
            y += widget.winfo_rooty() + 25
            tooltip.wm_geometry(f"+{x}+{y}")
            tooltip.deiconify()

        def on_leave(event):
            tooltip.withdraw()

        widget.bind("<Enter>", on_enter)
        widget.bind("<Leave>", on_leave)

    def select_element(self, symbol):
        self.selected_element = symbol
        print(f"Selected element: {elements[symbol]['name']}")

    def start_placing_elements(self, event):
        self.holding_lmb = True
        self.mouse_x, self.mouse_y = event.x, event.y
        self.place_element(event)

    def stop_placing_elements(self, event):
        self.holding_lmb = False

    def place_element(self, event):
        if self.selected_element and self.holding_lmb:
            x, y = event.x, event.y
            size = 5  # Adjusted particle size for visibility
            color = elements[self.selected_element]['color']
            weight = elements[self.selected_element]['weight']

            element = {'symbol': self.selected_element, 'x': x, 'y': y, 'vx': 0, 'vy': 0, 'size': size, 'color': color, 'weight': weight, 'on_ground': False}
            self.simulation_data.append(element)
            self.update_simulation_canvas()

            if self.holding_lmb:
                self.root.after(50, self.place_element, event)

    def toggle_floor(self):
        self.floor_active = not self.floor_active
        self.floor_status_label.config(text=f"Floor: {'ON' if self.floor_active else 'OFF'}")

    def start_simulation(self):
        self.simulation_data = []
        self.simulation_running = True
        threading.Thread(target=self.run_simulation).start()

    def run_simulation(self):
        while self.simulation_running:
            self.update_physics()
            self.update_simulation_canvas()
            time.sleep(0.05)

    def update_physics(self):
        for element in self.simulation_data:
            element['vy'] += 0.1 * element['weight']  # Gravity effect
            element['vx'] += random.uniform(-0.5, 0.5)  # Wind effect
            element['x'] += element['vx']
            element['y'] += element['vy']

            if self.floor_active and element['y'] >= self.sim_canvas.winfo_height() - element['size']:
                element['y'] = self.sim_canvas.winfo_height() - element['size']
                element['vy'] = 0
                element['vx'] = 0
                element['on_ground'] = True
            else:
                element['on_ground'] = False

            if element['x'] >= self.sim_canvas.winfo_width() - element['size']:
                element['x'] = self.sim_canvas.winfo_width() - element['size']
                element['vx'] = 0

            if element['y'] < 0 or element['x'] < 0 or element['y'] > self.sim_canvas.winfo_height() or element['x'] > self.sim_canvas.winfo_width():
                self.simulation_data.remove(element)

            for other in self.simulation_data:
                if other is not element:
                    if abs(element['x'] - other['x']) < element['size'] and abs(element['y'] - other['y']) < element['size']:
                        if element['y'] < self.sim_canvas.winfo_height() and other['y'] < self.sim_canvas.winfo_height():
                            if not element['on_ground'] and not other['on_ground']:
                                element['vx'], other['vx'] = other['vx'], element['vx']
                                element['vy'], other['vy'] = other['vy'], element['vy']
                                if not pygame.mixer.get_busy():
                                    random.choice(collision_sounds).play()

    def update_simulation_canvas(self):
        self.sim_canvas.delete("all")
        for element in self.simulation_data:
            self.sim_canvas.create_oval(
                element['x'] - element['size'], element['y'] - element['size'],
                element['x'] + element['size'], element['y'] + element['size'],
                fill=element['color'], outline=element['color']
            )

    def save_simulation(self):
        file_path = filedialog.asksaveasfilename(defaultextension=".pkl", filetypes=[("Pickle files", "*.pkl")])
        if file_path:
            with open(file_path, 'wb') as f:
                pickle.dump(self.simulation_data, f)
            messagebox.showinfo("Save Simulation", "Simulation saved successfully!")

    def load_simulation(self):
        file_path = filedialog.askopenfilename(filetypes=[("Pickle files", "*.pkl")])
        if file_path:
            with open(file_path, 'rb') as f:
                self.simulation_data = pickle.load(f)
            self.update_simulation_canvas()
            messagebox.showinfo("Load Simulation", "Simulation loaded successfully!")

    def clear_simulation(self):
        self.simulation_data = []
        self.update_simulation_canvas()
        messagebox.showinfo("Clear Simulation", "Simulation cleared successfully!")

if __name__ == "__main__":
    root = tk.Tk()
    app = PeriodicTableSimulator(root)
    root.mainloop()