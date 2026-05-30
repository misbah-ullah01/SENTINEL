/*
  Smart Street Lighting system - stage 1 firmware
  Hardware: Arduino Uno R3

  Pin Map:
    Pin 8 -> LED (via 220 ohm resistor to GND)
    Pin 7 -> fault simulation (Jumper to GND = fault)

  Serial protocol (9600 baud)
    recieves: "LIGHTS_ON\n" | "LIGHT_OFF\n"
    sends:    "STATUS:ON\n" | "STATUS:OFF\n"  | "STATUS:FAULT\n"

  Fault Logic:
    LedState=true AND faultPin=LOW -> FAULT
    LedState=true AND faultPIN=HIGH -> ON
    LedState=false -> OFF
*/


const int LED_PIN = 8;
const int FAULT_PIN = 7;

bool ledState = false;

void setup() {
  pinMode(LED_PIN, OUTPUT);
  pinMode(FAULT_PIN, INPUT_PULLUP); // HIGH = healthy, Low = fault
  Serial.begin(9600);
  delay(200);
  Serial.println("BOOT:OK");  // This lets the backend know that firmware is alive
}

void loop() {
  // --- RECIEVE COMMANDS ---------------
  if (Serial.available()) {
    String command = Serial.readStringUntil('\n');
    command.trim();

    if (command == "LIGHT_ON") {
      digitalWrite(LED_PIN, HIGH);
      ledState = true;
    }
    else if (command == "LIGHT_OFF") {
      digitalWrite(LED_PIN, LOW);
      ledState = false;
    }
    else if (command == "PING") {
      Serial.println("PONG");   // Health check from backend
    }
  }


  // --- READ FAULT STATE --------------
  int faultState = digitalRead(FAULT_PIN);

  // --- SEND STATUS -------------------
  if (ledState == true && faultState == LOW) {
    Serial.println("STATUS:FAULT");
  }
  else if (ledState == true) {
    Serial.println("STATUS:ON");
  }
  else {
    Serial.println("STATUS:OFF");
  }

  delay(1000); // report every 1 second
}
