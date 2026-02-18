/*
 * ESP32 SoilProbe IoT Sensor - Hardini Cloud Connected
 * WITH BLE PROVISIONING
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <EEPROM.h>
#include <BLEDevice.h>
#include <BLEUtils.h>
#include <BLEServer.h>
#include <DHT.h>

// ==========================================
// 🔧 CONSTANTS & PIN DEFS
// ==========================================
#define DHT_PIN 4
#define DHT_TYPE DHT11
#define SOIL_PIN 34

#define EEPROM_SIZE 512

// BLE UUIDs
#define SERVICE_UUID        "4fafc201-1fb5-459e-8fcc-c5c9c331914b"
#define CHAR_SSID_UUID      "beb5483e-36e1-4688-b7f5-ea07361b26a8"
#define CHAR_PASS_UUID      "823d06dc-255a-4720-953e-51c367ee2733"
#define CHAR_UID_UUID       "c730e61d-847e-4009-9768-45b73679469e"
#define CHAR_STATUS_UUID    "91107567-2777-4581-9b5b-209074092453"

DHT dht(DHT_PIN, DHT_TYPE);

// Runtime Variables
String wifi_ssid = "";
String wifi_pass = "";
String user_uid = "";

String device_id = "esp32_" + String((uint32_t)ESP.getEfuseMac(), HEX);

bool deviceConnected = false;
bool wifiConfigured = false;

// API
const char* API_BASE_URL = "https://hardini-backend.onrender.com"; // UPDATE THIS WITH YOUR RENDER URL

// ==========================================
// 💾 EEPROM HELPERS
// ==========================================

void writeString(int addr, String data) {
  for (int i = 0; i < data.length(); i++) {
    EEPROM.write(addr + i, data[i]);
  }
  EEPROM.write(addr + data.length(), '\0');
}

String readString(int addr) {
  char data[100];
  int len = 0;
  unsigned char k = EEPROM.read(addr);

  while (k != '\0' && len < 99) {
    data[len++] = k;
    k = EEPROM.read(addr + len);
  }

  data[len] = '\0';
  return String(data);
}

void loadCredentials() {
  wifi_ssid = readString(0);
  wifi_pass = readString(100);
  user_uid = readString(200);

  Serial.println("Loaded Credentials:");
  Serial.println("SSID: " + wifi_ssid);
  Serial.println("UID: " + user_uid);

  if (wifi_ssid.length() > 0 && user_uid.length() > 0) {
    wifiConfigured = true;
  }
}

void saveCredentials() {
  Serial.println("Saving Credentials...");

  for (int i = 0; i < EEPROM_SIZE; i++) EEPROM.write(i, 0);

  writeString(0, wifi_ssid);
  writeString(100, wifi_pass);
  writeString(200, user_uid);

  EEPROM.commit();
}

// ==========================================
// 📡 BLE CALLBACKS
// ==========================================

class MyServerCallbacks : public BLEServerCallbacks {
  void onConnect(BLEServer* pServer) {
    deviceConnected = true;
    Serial.println("BLE Client Connected");
  }

  void onDisconnect(BLEServer* pServer) {
    deviceConnected = false;
    Serial.println("BLE Client Disconnected");
    pServer->getAdvertising()->start();
  }
};

class MyCallbacks : public BLECharacteristicCallbacks {

  void onWrite(BLECharacteristic *pCharacteristic) {

    String value = pCharacteristic->getValue();   // ✅ FIXED

    if (value.length() == 0) return;

    String uuid = pCharacteristic->getUUID().toString();

    if (uuid == CHAR_SSID_UUID) {
      wifi_ssid = value;
      Serial.println("RCV SSID: " + wifi_ssid);

    } else if (uuid == CHAR_PASS_UUID) {
      wifi_pass = value;
      Serial.println("RCV PASS: [Hidden]");

    } else if (uuid == CHAR_UID_UUID) {
      user_uid = value;
      Serial.println("RCV UID: " + user_uid);

      if (wifi_ssid.length() > 0) {
        saveCredentials();
        Serial.println("Restarting in 2s...");
        delay(2000);
        ESP.restart();
      }
    }
  }
};

// ==========================================
// 📡 BLE START
// ==========================================

void startBLE() {

  Serial.println("Starting BLE Provisioning Mode...");

  BLEDevice::init("Hardini-Probe");
  BLEDevice::setPower(ESP_PWR_LVL_P9);

  BLEServer *pServer = BLEDevice::createServer();
  pServer->setCallbacks(new MyServerCallbacks());

  BLEService *pService = pServer->createService(SERVICE_UUID);

  BLECharacteristic *pCharSSID =
    pService->createCharacteristic(CHAR_SSID_UUID, BLECharacteristic::PROPERTY_WRITE);

  BLECharacteristic *pCharPass =
    pService->createCharacteristic(CHAR_PASS_UUID, BLECharacteristic::PROPERTY_WRITE);

  BLECharacteristic *pCharUID =
    pService->createCharacteristic(CHAR_UID_UUID, BLECharacteristic::PROPERTY_WRITE);

  BLECharacteristic *pCharStatus =
    pService->createCharacteristic(
      CHAR_STATUS_UUID,
      BLECharacteristic::PROPERTY_READ | BLECharacteristic::PROPERTY_NOTIFY
    );

  MyCallbacks *callbacks = new MyCallbacks();

  pCharSSID->setCallbacks(callbacks);
  pCharPass->setCallbacks(callbacks);
  pCharUID->setCallbacks(callbacks);

  pCharStatus->setValue("Waiting for Config");

  pService->start();

  BLEAdvertising *pAdvertising = BLEDevice::getAdvertising();
  pAdvertising->addServiceUUID(SERVICE_UUID);
  pAdvertising->setScanResponse(true);

  BLEDevice::startAdvertising();

  Serial.println("BLE Advertising started...");
}

// ==========================================
// 🚀 SETUP
// ==========================================

void setup() {

  Serial.begin(115200);

  EEPROM.begin(EEPROM_SIZE);

  dht.begin();

  pinMode(SOIL_PIN, INPUT);

  delay(1000);

  Serial.println("Booting Hardini Probe: " + device_id);

  // ✅ BLE ALWAYS ACTIVE (per user request)
  startBLE();

  loadCredentials();

  if (wifiConfigured) {
    WiFi.begin(wifi_ssid.c_str(), wifi_pass.c_str());

    Serial.print("Connecting to WiFi");

    int retries = 0;
    while (WiFi.status() != WL_CONNECTED && retries < 20) {
      delay(500);
      Serial.print(".");
      retries++;
    }

    if (WiFi.status() == WL_CONNECTED) {
      Serial.println("\n✅ WiFi Connected!");
      Serial.print("IP: ");
      Serial.println(WiFi.localIP());
    } else {
      Serial.println("\n⚠️ WiFi Failed (BLE remains active)");
    }
  } else {
    Serial.println("No WiFi Credentials. BLE waiting for config...");
  }
}

// ==========================================
// 🔁 LOOP
// ==========================================

void loop() {

  if (WiFi.status() != WL_CONNECTED) {
    delay(100);
    return;
  }

  static unsigned long lastTime = 0;

  if (millis() - lastTime > 30000) {
    sendSensorData();
    lastTime = millis();
  }
}

// ==========================================
// 📊 SENSOR + API
// ==========================================

void sendSensorData() {

  Serial.println("\nReading Sensors...");

  float humidity = dht.readHumidity();
  float temp = dht.readTemperature();

  int soilRaw = analogRead(SOIL_PIN);

  int soilPct = map(soilRaw, 4095, 0, 0, 100);
  soilPct = constrain(soilPct, 0, 100);

  if (isnan(humidity)) humidity = 0;
  if (isnan(temp)) temp = 0;

  StaticJsonDocument<512> doc;

  doc["user_uid"] = user_uid;
  doc["device_id"] = device_id;
  doc["soil_temp_c"] = temp;
  doc["soil_moist_pct"] = soilPct;
  doc["ambient_temp_c"] = temp;
  doc["ambient_humidity_pct"] = humidity;
  doc["rssi"] = WiFi.RSSI();

  String jsonString;
  serializeJson(doc, jsonString);

  HTTPClient http;

  String endpoint = String(API_BASE_URL) + "/api/soil-readings";

  http.begin(endpoint);
  http.addHeader("Content-Type", "application/json");

  int httpResponseCode = http.POST(jsonString);

  if (httpResponseCode > 0) {
    Serial.printf("✅ Data Sent: %d\n", httpResponseCode);
  } else {
    Serial.printf("❌ Error: %s\n",
                  http.errorToString(httpResponseCode).c_str());
  }

  http.end();
}