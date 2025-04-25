# adafruit_helper.py
import requests
from config import USERNAME, AIO_KEY

BASE_URL = f"https://io.adafruit.com/api/v2/{USERNAME}/feeds"

# Gửi dữ liệu ON/OFF
def publish_to_adafruit(value, feed):
    url = f"{BASE_URL}/{feed}/data"
    headers = {
        "X-AIO-Key": AIO_KEY,
        "Content-Type": "application/json"
    }
    data = {"value": value}

    try:
        response = requests.post(url, headers=headers, json=data)
        print(f"✅ Đã gửi '{value}' tới feed '{feed}' | Status: {response.status_code}")
    except Exception as e:
        print(f"❌ Lỗi gửi đến Adafruit IO: {e}")

# Lấy giá trị mới nhất từ feed
def get_latest_value(feed):
    url = f"{BASE_URL}/{feed}/data?limit=1"
    headers = {"X-AIO-Key": AIO_KEY}

    try:
        res = requests.get(url, headers=headers)
        if res.ok:
            data = res.json()
            return data[0]["value"]
        else:
            return f"Lỗi khi gọi API: {res.status_code}"
    except Exception as e:
        return f"Lỗi: {e}"
