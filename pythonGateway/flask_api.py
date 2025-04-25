# flask_api.py
from flask import Flask, request, jsonify
from adafruit_helper import publish_to_adafruit, get_latest_value
from flask_cors import CORS


app = Flask(__name__)
CORS(app)


@app.route("/control", methods=["POST"])
def control():
    data = request.json
    feed = data.get("feed")
    status = data.get("status")

    if not feed or not status:
        return jsonify({"error": "Thiếu 'feed' hoặc 'status'"}), 400

    publish_to_adafruit(status, feed)
    return jsonify({"message": f"Đã gửi '{status}' tới feed '{feed}'"})

@app.route("/sensor/<feed>", methods=["GET"])
def read_sensor(feed):
    value = get_latest_value(feed)
    return jsonify({"feed": feed, "value": value})

if __name__ == "__main__":
    app.run(port=5000)