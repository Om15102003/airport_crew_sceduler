from flask import Flask, request, jsonify
from app.scheduler import schedule_tasks

app = Flask(__name__)

@app.route("/schedule", methods=["POST"])
def create_schedule():
    data = request.json
    tasks = data.get("tasks", [])
    crew_members = data.get("crew_members", [])
    
    schedule = schedule_tasks(tasks, crew_members)
    
    return jsonify(schedule)

# Add this part to start the Flask server and check the logs
if __name__ == "__main__":
    print("Starting Flask server...")  # Debugging print statement
    app.run(debug=True)
