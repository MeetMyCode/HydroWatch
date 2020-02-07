// Include the libraries we need
#include <OneWire.h>
#include <DallasTemperature.h>

// Which port is the data wire plugged into on the arduino?
#define ONE_WIRE_BUS 8

// Setup a oneWire instance to communicate with any OneWire devices (not just Maxim/Dallas temperature ICs)
OneWire oneWire(ONE_WIRE_BUS);

// Pass our oneWire reference to Dallas Temperature. 
DallasTemperature sensors(&oneWire);

//Address of Temperature Sensor
DeviceAddress TEMP_ADDRESS = { 0x28, 0xC6, 0xAB, 0x79, 0x97, 0x06, 0x03, 0x51 };

/*
 * Wiring for Temperature Probe:
 * Red 5v
 * Black GND
 * Yellow Data
 * 4.7kOhm between 5v and Data
*/

// the setup function runs once when you press reset or power the board
void setup() {
  // start serial port
  Serial.begin(9600);

  // Start up the library
  sensors.begin();
  //stTempProbeAddress = sensors.getAddress(0);
}

// the loop function runs over and over again forever
void loop() {

  GetTemperature();

  //Sensor takes approx 750ms to get temperature reading so delay is
  //modified accordingly
  delay(1000);// wait for a second
}

void GetTemperature(){

  // get the temperature from the specified probe address
  sensors.requestTemperaturesByAddress(TEMP_ADDRESS);   

  // We use the function ByIndex, and as an example get the temperature from the first sensor only.
  float tempC = sensors.getTempCByIndex(0);
  
  // Check if reading was successful
  if(tempC != DEVICE_DISCONNECTED_C) 
  {
    //PREPEND 'P' (P = PH, O=ORP, E=EC, T=TEMP) FOR FILTERING OUT AT FRONTEND
    String prefix = "t";
    String tempString = String(tempC); //temp is of type float - convert to string here.  
    String stringToSend = prefix + tempString;
    
    //Serial.print("Temperature for the device 1 (index 0) is: ");
    Serial.println(stringToSend);
  } 
  else
  {
    Serial.println("Error: Could not read temperature data");
  }


  
}
