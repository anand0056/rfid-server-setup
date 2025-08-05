import paho.mqtt.client as mqtt
import mysql.connector
import json
import os
import logging
import time
import signal
import sys
from datetime import datetime
from health_check import start_health_server

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Global variables
db = None
cursor = None
client = None
running = True

def signal_handler(signum, frame):
    """Handle shutdown signals gracefully"""
    global running
    logger.info("Received shutdown signal. Cleaning up...")
    running = False
    if client:
        client.disconnect()
    if db:
        db.close()
    sys.exit(0)

# Register signal handlers
signal.signal(signal.SIGINT, signal_handler)
signal.signal(signal.SIGTERM, signal_handler)

# Database connection with retry logic
def connect_to_db():
    global db, cursor
    retry_count = 0
    max_retries = 5
    
    while retry_count < max_retries and running:
        try:
            db = mysql.connector.connect(
                host=os.getenv("DB_HOST", "localhost"),
                user=os.getenv("DB_USER", "root"),
                password=os.getenv("DB_PASSWORD", ""),
                database=os.getenv("DB_NAME", "rfid_db"),
                autocommit=True,
                charset='utf8mb4'
            )
            cursor = db.cursor()
            logger.info("Connected to database successfully")
            return True
        except mysql.connector.Error as err:
            retry_count += 1
            logger.error(f"Database connection failed (attempt {retry_count}): {err}")
            if retry_count < max_retries:
                time.sleep(5)  # Wait 5 seconds before retry
    
    logger.error("Failed to connect to database after maximum retries")
    return False

def ensure_db_connection():
    """Check if the database connection is alive, and reconnect if necessary"""
    global db, cursor
    
    try:
        # Check if connection is established
        if db is None or cursor is None:
            logger.warning("Database connection not established, connecting...")
            return connect_to_db()
            
        # Check if connection is alive by executing a simple query
        cursor.execute("SELECT 1")
        cursor.fetchone()
        return True
    except mysql.connector.Error as err:
        logger.warning(f"Database connection lost: {err}. Reconnecting...")
        try:
            # Close existing connection if it exists
            if db:
                try:
                    db.close()
                except:
                    pass
            
            # Reconnect
            return connect_to_db()
        except Exception as e:
            logger.error(f"Failed to reconnect to database: {e}")
            return False

def log_error(error_type, error_message, raw_data=None, source_topic=None, stack_trace=None, tenant_id=None):
    """Log errors to the error_logs table, ensuring all data is saved"""
    if not ensure_db_connection():
        logger.error("Cannot log error - database not connected")
        # Log to stdout as backup
        logger.error(f"Error details that couldn't be logged to DB:")
        logger.error(f"Type: {error_type}")
        logger.error(f"Message: {error_message}")
        logger.error(f"Raw data: {raw_data}")
        logger.error(f"Source topic: {source_topic}")
        return
    
    try:
        # Always convert raw_data to a JSON string that includes all information
        json_data = None
        if raw_data is not None:
            if isinstance(raw_data, str):
                try:
                    # Try to parse as JSON first
                    parsed = json.loads(raw_data)
                    json_data = json.dumps({
                        "parsed_data": parsed,
                        "original_string": raw_data
                    })
                except:
                    # If not valid JSON, store as raw text
                    json_data = json.dumps({
                        "raw_text": raw_data,
                        "parse_error": "Could not parse as JSON"
                    })
            else:
                # For non-string data, store as-is
                json_data = json.dumps({
                    "data": raw_data,
                    "type": str(type(raw_data))
                })

        # Use tenant_id=1 as default when no tenant is specified
        tenant_id_value = tenant_id if tenant_id is not None else 1
        
        # Create a detailed error message that includes validation info
        detailed_message = {
            "error_message": error_message,
            "error_type": error_type,
            "source_topic": source_topic,
            "timestamp": datetime.now().isoformat()
        }
        
        if stack_trace:
            detailed_message["stack_trace"] = stack_trace
            
        detailed_message_json = json.dumps(detailed_message)
        
        cursor.execute("""
            INSERT INTO error_logs 
            (tenant_id, error_type, error_message, raw_data, source_topic, stack_trace, created_at)
            VALUES (%s, %s, %s, %s, %s, %s, NOW())
        """, (
            tenant_id_value, 
            error_type, 
            error_message, 
            json_data, 
            source_topic,
            stack_trace
        ))
        
        logger.info(f"📝 Logged message - Type: {error_type}, Message: {error_message}")
        
    except Exception as e:
        logger.error(f"Failed to log to database: {e}")
        # Log everything to stdout as backup
        logger.error("Error details that failed to log to DB:")
        logger.error(f"Type: {error_type}")
        logger.error(f"Message: {error_message}")
        logger.error(f"Raw data: {raw_data}")
        logger.error(f"Source topic: {source_topic}")
        logger.error(f"Stack trace: {stack_trace}")
        logger.error(f"Tenant ID: {tenant_id}")
        logger.error(f"Database error: {str(e)}")

def validate_binimise_format(data):
    """Strictly validate the binimise RFID data format"""
    required_fields = ['deviceSn', 'deviceID', 'tagNum', 'tagID']
    
    # Return immediately if data is not a dict
    if not isinstance(data, dict):
        return False, "Data is not a valid JSON object"

    # Check all required fields strictly
    missing_fields = []
    for field in required_fields:
        if field not in data:
            missing_fields.append(field)
        elif data[field] is None or data[field] == '':
            missing_fields.append(f"{field} (empty)")
    
    if missing_fields:
        return False, f"Missing required fields: {', '.join(missing_fields)}"

    # Strict type validation
    if not isinstance(data['tagNum'], int):
        return False, "tagNum must be an integer"
    
    if not isinstance(data['deviceSn'], str) or not data['deviceSn'].strip():
        return False, "deviceSn must be a non-empty string"
    
    if not isinstance(data['deviceID'], str) or not data['deviceID'].strip():
        return False, "deviceID must be a non-empty string"
    
    if not isinstance(data['tagID'], str) or not data['tagID'].strip():
        return False, "tagID must be a non-empty string"
    
    return True, "Valid format"

def get_tenant_for_card(card_uid):
    """Get the tenant_id for a given card_uid"""
    if not ensure_db_connection():
        logger.error("Cannot determine tenant - database not connected")
        return None
    
    try:
        cursor.execute(
            "SELECT tenant_id FROM rfid_cards WHERE card_uid = %s", 
            (card_uid,)
        )
        result = cursor.fetchone()
        if result:
            return result[0]
        return None
    except Exception as e:
        logger.error(f"Error getting tenant for card {card_uid}: {e}")
        return None

def get_tenant_for_reader(reader_id):
    """Get the tenant_id for a given reader_id"""
    if not ensure_db_connection():
        logger.error("Cannot determine tenant - database not connected")
        return None
    
    try:
        cursor.execute(
            "SELECT tenant_id FROM rfid_readers WHERE id = %s", 
            (reader_id,)
        )
        result = cursor.fetchone()
        if result:
            return result[0]
        return None
    except Exception as e:
        logger.error(f"Error getting tenant for reader {reader_id}: {e}")
        return None

# Error type constants
ERROR_MQTT_PARSE = 'mqtt_parse_error'
ERROR_DATABASE = 'database_error'
ERROR_VALIDATION = 'validation_error'
ERROR_UNKNOWN_READER = 'unknown_reader'
ERROR_UNKNOWN_CARD = 'unknown_card'
ERROR_GENERAL = 'general_error'
ERROR_SYSTEM = 'system_error'
ERROR_PARSE = 'parse_error'

def process_rfid_scan(payload, topic):
    """Process RFID scan data and insert into database"""
    if not ensure_db_connection():
        log_error(ERROR_DATABASE, "Cannot process RFID scan - database not connected", 
                 payload.decode(), topic)
        return
        
    # First, save the raw data
    raw_data = payload.decode()
    logger.info(f"📨 Received message on {topic}: {raw_data}")
    
    try:
        # Try to parse JSON payload
        try:
            data = json.loads(raw_data)
        except json.JSONDecodeError as e:
            # Log invalid JSON to error_logs and stop processing
            log_error(ERROR_PARSE, f"Invalid JSON: {str(e)}", raw_data, topic)
            return

        # Look for alternate field names and log as error if found
        if 'devicelater' in data:
            log_error(
                ERROR_VALIDATION,
                "Found 'devicelater' instead of required 'deviceID'",
                raw_data,
                topic,
                tenant_id=1
            )
            return

        # Strictly validate the format
        is_valid, validation_message = validate_binimise_format(data)
        if not is_valid:
            # Log validation error and stop processing
            log_error(
                ERROR_VALIDATION,
                f"Invalid format: {validation_message}",
                raw_data,
                topic,
                tenant_id=1
            )
            return

        # At this point, we have valid data with all required fields
        card_uid = data['tagID']
        reader_id = data['deviceID']
        device_sn = data['deviceSn']
        scan_time = datetime.now()

        # Get reader information
        cursor.execute("""
            SELECT r.tenant_id, r.id, r.name, r.location
            FROM rfid_readers r 
            WHERE r.reader_id = %s
        """, (reader_id,))
        reader_info = cursor.fetchone()

        if not reader_info:
            # Log unknown reader to error_logs and stop processing
            log_error(
                ERROR_UNKNOWN_READER,
                f"Reader not found in database: {reader_id}",
                raw_data,
                topic,
                tenant_id=1
            )
            return

        tenant_id = reader_info[0]

        # Get card information
        cursor.execute("""
            SELECT c.is_active, c.tenant_id, 
                   COALESCE(s.first_name, v.owner_name) as owner_name,
                   CASE 
                     WHEN s.id IS NOT NULL THEN 'staff'
                     WHEN v.id IS NOT NULL THEN 'vehicle'
                     ELSE c.card_type
                   END as type
            FROM rfid_cards c
            LEFT JOIN staff s ON c.staff_id = s.id
            LEFT JOIN vehicles v ON c.vehicle_id = v.id
            WHERE c.card_uid = %s
        """, (card_uid,))
        card_result = cursor.fetchone()

        if not card_result:
            # Log unknown card to error_logs
            log_error(
                ERROR_UNKNOWN_CARD,
                f"Card not found in database: {card_uid}",
                raw_data,
                topic,
                tenant_id=tenant_id
            )
            is_authorized = False
            card_type = 'unknown'
            owner_name = None
        else:
            is_authorized = card_result[0]
            card_type = card_result[3]
            owner_name = card_result[2]

        # Insert the validated scan into rfid_logs
        try:
            cursor.execute("""
                INSERT INTO rfid_logs (
                    card_uid, reader_id, is_authorized, timestamp, tenant_id, 
                    event_type, raw_data, notes
                ) VALUES (%s, %s, %s, %s, %s, 'scan', %s, %s)
            """, (
                card_uid, 
                reader_id, 
                is_authorized,
                scan_time.strftime('%Y-%m-%d %H:%M:%S'),
                tenant_id,
                raw_data,
                f"Card Type: {card_type}, Owner: {owner_name if owner_name else 'Unknown'}"
            ))
            
            # Update reader heartbeat
            cursor.execute("""
                UPDATE rfid_readers 
                SET last_heartbeat = %s, is_online = TRUE
                WHERE reader_id = %s
            """, (scan_time, reader_id))

            logger.info(f"✅ Successfully logged scan for card {card_uid} at reader {reader_id}")

        except Exception as e:
            # Log database errors but don't continue
            log_error(
                ERROR_DATABASE,
                f"Failed to save scan: {str(e)}",
                raw_data,
                topic,
                tenant_id=tenant_id
            )
            return

    except Exception as e:
        # Log any unexpected errors
        log_error(
            ERROR_SYSTEM,
            f"Unexpected error: {str(e)}",
            raw_data,
            topic,
            stack_trace=str(e)
        )

def on_connect(client, userdata, flags, rc):
    if rc == 0:
        logger.info("Connected to MQTT broker")
        # Subscribe to the new binimise/rfid topic
        client.subscribe("binimise/rfid")
        # Keep legacy topics for backward compatibility
        client.subscribe("rfid/scan")
        client.subscribe("rfid/+/scan")  # Subscribe to reader-specific topics
        client.subscribe("rfid/heartbeat")
        logger.info("Subscribed to MQTT topics: binimise/rfid, rfid/scan, rfid/+/scan, rfid/heartbeat")
    else:
        logger.error(f"Failed to connect to MQTT broker: {rc}")

def on_message(client, userdata, msg):
    logger.info(f"📨 Received message on {msg.topic}: {msg.payload}")
    
    if not ensure_db_connection():
        logger.error("Database not connected - skipping message")
        return
    
    try:
        if msg.topic == "binimise/rfid":
            # Handle new binimise RFID format
            process_rfid_scan(msg.payload, msg.topic)
        elif msg.topic.startswith("rfid/") and msg.topic.endswith("/scan"):
            process_rfid_scan(msg.payload, msg.topic)
        elif msg.topic == "rfid/scan":
            process_rfid_scan(msg.payload, msg.topic)
        elif msg.topic == "rfid/heartbeat":
            # Handle reader heartbeat
            data = json.loads(msg.payload.decode())
            reader_id = data.get('reader_id')
            if reader_id:
                # Try to determine the tenant_id for this reader
                tenant_id = get_tenant_for_reader(reader_id)
                
                cursor.execute("""
                    UPDATE rfid_readers 
                    SET last_heartbeat = NOW(), status = 'online' 
                    WHERE id = %s
                """, (reader_id,))
                
                # If reader doesn't exist, create it with the appropriate tenant_id
                if cursor.rowcount == 0:
                    try:
                        cursor.execute("""
                            INSERT INTO rfid_readers (id, name, location, status, tenant_id, reader_group_id)
                            VALUES (%s, %s, %s, 'online', %s, 1)
                        """, (reader_id, f"Auto-created {reader_id}", f"Location for {reader_id}", tenant_id))
                        logger.info(f"Auto-created reader entry for {reader_id} from heartbeat with tenant_id: {tenant_id if tenant_id else 'NULL'}")
                    except Exception as e:
                        logger.error(f"Could not auto-create reader {reader_id} from heartbeat: {e}")
                else:
                    logger.info(f"💓 Updated heartbeat for reader: {reader_id} - Tenant: {tenant_id if tenant_id else 'Unknown'}")
    except Exception as e:
        logger.error(f"Error handling message: {e}")
        import traceback
        traceback.print_exc()

def on_disconnect(client, userdata, rc):
    logger.warning("⚠️ Disconnected from MQTT broker")
    if rc != 0:
        logger.error("Unexpected disconnection. Attempting to reconnect...")

def main():
    """Main function to run the MQTT client"""
    global client, running
    
    # Start health check server
    start_health_server(port=8081)
    
    # Initialize database connection
    if not connect_to_db():
        logger.error("Cannot start without database connection")
        return
    
    # MQTT Client setup
    client = mqtt.Client()
    client.on_connect = on_connect
    client.on_message = on_message
    client.on_disconnect = on_disconnect
    
    # Connect to MQTT broker with retry logic
    broker_host = os.getenv("MQTT_BROKER", "localhost")
    broker_port = int(os.getenv("MQTT_PORT", "1883"))
    
    retry_count = 0
    max_retries = 5
    
    while retry_count < max_retries and running:
        try:
            logger.info(f"🔄 Attempting to connect to MQTT broker at {broker_host}:{broker_port}")
            client.connect(broker_host, broker_port, 60)
            break
        except Exception as e:
            retry_count += 1
            logger.error(f"Failed to connect to MQTT broker (attempt {retry_count}): {e}")
            if retry_count < max_retries:
                time.sleep(5)
    
    if retry_count >= max_retries:
        logger.error("Failed to connect to MQTT broker after maximum retries")
        return
    
    # Start the loop
    logger.info("🚀 Starting MQTT client loop...")
    try:
        client.loop_forever()
    except KeyboardInterrupt:
        logger.info("Received keyboard interrupt")
    except Exception as e:
        logger.error(f"Error in MQTT loop: {e}")
    finally:
        if client:
            client.disconnect()
        if db:
            db.close()

if __name__ == "__main__":
    try:
        # Start health check server
        start_health_server(port=8081)
        
        # Connect to database
        if not connect_to_db():
            logger.error("Failed to connect to database. Exiting.")
            sys.exit(1)

        # Setup MQTT client
        client = mqtt.Client()
        client.on_connect = on_connect
        client.on_message = on_message

        # Connect to MQTT broker
        mqtt_host = os.getenv("MQTT_BROKER", "localhost")
        client.connect(mqtt_host, 1883, 60)

        # Start MQTT loop
        client.loop_forever()

    except Exception as e:
        logger.error(f"Fatal error: {e}")
        sys.exit(1)
