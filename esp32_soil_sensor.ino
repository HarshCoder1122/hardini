/*
 * ESP32 SoilProbe IoT Sensor
 * Connects to Hardini Backend API to send soil sensor data
 *
 * Hardware Required:
 * - ESP32 Development Board
 * - DHT11 Temperature & Humidity Sensor
 * - Soil Moisture Sensor
 * - Jumper wires
 *
 * Connections:
 * - DHT11: Pin 4 (Data)
 * - Soil Moisture: Pin 34 (Analog)
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include "DHT.h"

// ===== CONFIGURATION =====

// WiFi Credentials
const char* WIFI_SSID = "YOUR_WIFI_SSID";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";

// API Configuration
const char* API_BASE_URL = "https://backend-iota-livid-46.vercel.app"; // Vercel backend URL
const char* API_ENDPOINT = "/api/soil-readings";

// Device Configuration
const char* DEVICE_ID = "soilprobe1"; // Unique identifier for this sensor

// Sensor Pins
#define DHT_PIN 4          // DHT11 data pin
#define SOIL_MOISTURE_PIN 34 // Soil moisture analog pin

// Sensor Types
#define DHT_TYPE DHT11     // DHT sensor type

// Timing Configuration
const unsigned long READING_INTERVAL = 30000; // 30 seconds between readings
const unsigned long WIFI_RETRY_DELAY = 5000;  // 5 seconds between WiFi retries

// ===== GLOBAL VARIABLES =====
DHT dht(DHT_PIN, DHT_TYPE);
unsigned long lastReadingTime = 0;
int wifiRetryCount = 0;
const int MAX_WIFI_RETRIES = 10;

// ===== FUNCTIONS =====

void setup() {
  Serial.begin(115200);
  Serial.println("\n🌱 ESP32 SoilProbe IoT Sensor Starting...");

  // Initialize sensors
  dht.begin();
  pinMode(SOIL_MOISTURE_PIN, INPUT);

  // Connect to WiFi
  connectToWiFi();

  Serial.println("✅ Setup complete!");
}

void loop() {
  // Check WiFi connection
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("❌ WiFi disconnected, attempting reconnection...");
    connectToWiFi();
    return;
  }

  // Check if it's time to take a reading
  if (millis() - lastReadingTime >= READING_INTERVAL) {
    takeSensorReading();
    lastReadingTime = millis();
  }

  // Small delay to prevent overwhelming the loop
  delay(1000);
}

void connectToWiFi() {
  Serial.printf("🔗 Connecting to WiFi: %s\n", WIFI_SSID);

  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  wifiRetryCount = 0;

  while (WiFi.status() != WL_CONNECTED && wifiRetryCount < MAX_WIFI_RETRIES) {
    delay(WIFI_RETRY_DELAY);
    Serial.print(".");
    wifiRetryCount++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n✅ WiFi connected!");
    Serial.printf("📡 IP Address: %s\n", WiFi.localIP().toString().c_str());
    Serial.printf("📶 Signal Strength (RSSI): %d dBm\n", WiFi.RSSI());
  } else {
    Serial.println("\n❌ Failed to connect to WiFi!");
    Serial.println("🔄 Will retry in next loop...");
  }
}

void takeSensorReading() {
  Serial.println("\n🌱 Taking sensor readings...");

  // Read DHT11 sensor (Temperature & Humidity)
  float ambient_temp_c = dht.readTemperature();
  float ambient_humidity_pct = dht.readHumidity();

  // Read soil moisture sensor
  int soilMoistureRaw = analogRead(SOIL_MOISTURE_PIN);
  float soil_moist_pct = map(soilMoistureRaw, 0, 4095, 100, 0); // Convert to percentage (dry = 0%, wet = 100%)

  // Check if readings are valid
  if (isnan(ambient_temp_c) || isnan(ambient_humidity_pct)) {
    Serial.println("❌ Failed to read from DHT sensor!");
    return;
  }

  // Set soil sensors to 0.0 when not connected
  // TODO: Replace with actual sensor readings when soil sensors are connected
  float soil_temp_c = 0.0; // Soil temperature sensor not connected
  soil_moist_pct = 0.0;   // Soil moisture sensor not connected

  // Get WiFi signal strength
  int rssi = WiFi.RSSI();

  // Display readings
  Serial.println("📊 Sensor Readings:");
  Serial.printf("  🌡️  Soil Temperature: %.1f°C\n", soil_temp_c);
  Serial.printf("  💧  Soil Moisture: %.1f%%\n", soil_moist_pct);
  Serial.printf("  🌤️  Ambient Temperature: %.1f°C\n", ambient_temp_c);
  Serial.printf("  💨  Ambient Humidity: %.1f%%\n", ambient_humidity_pct);
  Serial.printf("  📶  WiFi RSSI: %d dBm\n", rssi);

  // Send data to API
  sendDataToAPI(soil_temp_c, soil_moist_pct, ambient_temp_c, ambient_humidity_pct, rssi);
}

void sendDataToAPI(float soil_temp_c, float soil_moist_pct, float ambient_temp_c, float ambient_humidity_pct, int rssi) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("❌ Cannot send data: WiFi not connected!");
    return;
  }

  HTTPClient http;
  String url = String(API_BASE_URL) + API_ENDPOINT;

  Serial.printf("📤 Sending data to: %s\n", url.c_str());

  // Prepare JSON payload
  StaticJsonDocument<256> jsonDoc;
  jsonDoc["device_id"] = DEVICE_ID;
  jsonDoc["soil_temp_c"] = soil_temp_c;
  jsonDoc["soil_moist_pct"] = soil_moist_pct;
  jsonDoc["ambient_temp_c"] = ambient_temp_c;
  jsonDoc["ambient_humidity_pct"] = ambient_humidity_pct;
  jsonDoc["rssi"] = rssi;

  String jsonString;
  serializeJson(jsonDoc, jsonString);

  // Configure HTTP request
  http.begin(url);
  http.addHeader("Content-Type", "application/json");

  // Send POST request
  int httpResponseCode = http.POST(jsonString);

  if (httpResponseCode > 0) {
    String responsePayload = http.getString();
    Serial.printf("✅ API Response Code: %d\n", httpResponseCode);
    Serial.printf("📄 Response: %s\n", responsePayload.c_str());

    if (httpResponseCode == 201) {
      Serial.println("🎉 Data sent successfully!");
    } else {
      Serial.printf("⚠️  Unexpected response code: %d\n", httpResponseCode);
    }
  } else {
    Serial.printf("❌ HTTP Error: %d\n", httpResponseCode);
    Serial.printf("    Error: %s\n", http.errorToString(httpResponseCode).c_str());
  }

  http.end();
}

/*
 * SETUP INSTRUCTIONS:
 *
 * 1. Install Required Libraries in Arduino IDE:
 *    - Go to Tools > Manage Libraries
 *    - Search for and install:
 *      * "DHT sensor library" by Adafruit
 *      * "ArduinoJson" by Benoit Blanchon
 *
 * 2. Hardware Connections:
 *    - DHT11 Sensor:
 *      * VCC → 3.3V or 5V
 *      * GND → GND
 *      * DATA → GPIO 4
 *    - Soil Moisture Sensor:
 *      * VCC → 3.3V or 5V
 *      * GND → GND
 *      * AOUT → GPIO 34 (Analog)
 *
 * 3. Configuration:
 *    - Update WIFI_SSID and WIFI_PASSWORD
 *    - Update API_BASE_URL with your backend server IP/port
 *    - Optionally change DEVICE_ID for multiple sensors
 *
 * 4. Upload and Monitor:
 *    - Upload the code to ESP32
 *    - Open Serial Monitor (115200 baud)
 *    - Watch for connection and data transmission logs
 *
 * 5. Testing:
 *    - Check backend server logs for incoming data
 *    - Verify data appears in Supabase soil_readings table
 *    - Check SoilProbe dashboard for real-time updates
 */
