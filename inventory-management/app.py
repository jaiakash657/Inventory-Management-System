from flask import Flask, send_from_directory, render_template
import matplotlib.pyplot as plt

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('prediction.html') 

@app.route('/generate_plot')
def generate_plot():
    plt.figure(figsize=(10, 6))
    plt.plot([1, 2, 3, 4, 5], [5, 4, 3, 2, 1], label="Sample Data", marker="o")
    plt.title("Sample Plot")
    plt.xlabel("X-Axis")
    plt.ylabel("Y-Axis")
    plt.legend()

    plt.savefig('static/prediction_plot.png')
    plt.close()

    return "Plot generated successfully!"

@app.route('/static/<filename>')
def send_image(filename):
    return send_from_directory('static', filename)

if __name__ == '__main__':
    app.run(debug=True)
