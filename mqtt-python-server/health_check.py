import json
import time
import threading
from http.server import HTTPServer, BaseHTTPRequestHandler
from datetime import datetime
import psutil
import paho.mqtt.client as mqtt
import logging

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class HealthCheckHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/health':
            try:
                # Get process info
                process = psutil.Process()
                memory_info = process.memory_info()

                # Check MySQL connection
                db_status = "ok" if ensure_db_connection() else "error"

                # Check MQTT connection
                mqtt_status = "ok" if client and client.is_connected() else "error"

                health_data = {
                    "status": "ok" if db_status == "ok" and mqtt_status == "ok" else "error",
                    "timestamp": datetime.now().isoformat(),
                    "memory": {
                        "rss": f"{memory_info.rss / 1024 / 1024:.2f}MB",
                        "vms": f"{memory_info.vms / 1024 / 1024:.2f}MB",
                    },
                    "cpu_percent": process.cpu_percent(),
                    "connections": {
                        "mysql": db_status,
                        "mqtt": mqtt_status
                    },
                    "uptime": time.time() - process.create_time()
                }

                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps(health_data).encode())
            except Exception as e:
                error_response = {
                    "status": "error",
                    "timestamp": datetime.now().isoformat(),
                    "error": str(e)
                }
                self.send_response(500)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps(error_response).encode())
        else:
            self.send_response(404)
            self.end_headers()

def start_health_server(port=8080):
    server = HTTPServer(('', port), HealthCheckHandler)
    server_thread = threading.Thread(target=server.serve_forever)
    server_thread.daemon = True
    server_thread.start()
    logger.info(f"Health check server started on port {port}")

# Add this to your main.py after mqtt client setup
start_health_server()
