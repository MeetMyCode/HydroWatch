
//********************************TEMPERATURE SENSOR CONSTANTS/PROPERTIES********************************

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


//********************************EC SENSOR CONSTANTS/PROPERTIES********************************

//THESE CONSTATNT WON'T CHANGE. THEY'RE USED TO GIVE NAMES TO THE PINS USED:
const int analogInPin = A1; //ANALOG INPUT PIN THAT THE SENSOR OUTPUT IS ATTACHED TO.
const int analogOutPin = 9; //ANALOG OUTPUT PIN 

int sensorValue = 0; //VALUE READ FROM SENSOR.
int outputValue = 0; //VALUE OUTPUT TO THE PWM (ANALOG OUT)

//********************************PH SENSOR CONSTANTS/PROPERTIES********************************

#define SensorPin A2            //pH meter Analog output to Arduino Analog Input 0
unsigned long int avgValue;  //Store the average value of the sensor feedback
float b;
int buf[10],temp;

//********************************SETUP CONSTANTS/PROPERTIES********************************


int readingInterval = 5000; //Value in milliseconds
String readingIntervalPrefix = "0";


//********************************END OF CONSTANTS/PROPERTIES SECTION********************************


void setup() {
  
  // INITIALISE SERIAL COMMUNICATIONS AT 9600 BPS.
  Serial.begin(9600);

  //SEND THE READING INTERVAL VALUE TO THE WEBPAGE FOR UPDATING THE this.readEvery PROPERTY THAT INFORMS THE USER WHEN THE NEXT READING WILL BE.
  Serial.print(readingIntervalPrefix + String(readingInterval) + "\r\n");

  // TEMPERATURE - Start up the library
  sensors.begin();

}

void loop() {

  //TEMPERATURE CODE
  GetTemperature();

  //EC CODE
  GetEcReading();

  //PH CODE
  GetPhReading();

  //ORP CODE
  //GetOrpReading();


  delay(readingInterval);
}

void GetPhReading(){
  for(int i=0;i<10;i++)       //Get 10 sample value from the sensor for smooth the value
  { 
    buf[i]=analogRead(SensorPin);
    delay(10);
  }
  for(int i=0;i<9;i++)        //sort the analog from small to large
  {
    for(int j=i+1;j<10;j++)
    {
      if(buf[i]>buf[j])
      {
        temp=buf[i];
        buf[i]=buf[j];
        buf[j]=temp;
      }
    }
  }
  avgValue=0;
  for(int i=2;i<8;i++)                      //take the average value of 6 center sample
    avgValue+=buf[i];
  float phValue=(float)avgValue*5.0/1024/6; //convert the analog into millivolt
  phValue=3.5*phValue;                      //convert the millivolt into pH value
  
  //PREPEND 'P' (P = PH, O=ORP, E=EC, T=TEMP) FOR FILTERING OUT AT FRONTEND
  String pHPrefix = "p";
  String tempString = String(phValue); //pH is of type float - convert to string here.  
  String stringToSend = pHPrefix + tempString + "\r\n";

  Serial.println(stringToSend);
}

void GetEcReading(){
  
  //**READ THE ANALOG IN VALUE**
  sensorValue = analogRead(analogInPin);

  //**TO READ microS, REPLACE 5.00 WITH 5000.**
  //**TO READ ppm, replace 5.0 WITH 3200 TO READ ppm AND TO CALIBRATE TO ppm.**
  //PREPEND 'P' (P = PH, O=ORP, E=EC, T=TEMP) FOR FILTERING OUT AT FRONTEND
  String ecPrefix = "e";
  int reading = sensorValue*5/1024;
  Serial.print(ecPrefix + String(reading) + "\r\n"); 

  //**WAIT FOR 1 SECOND BEFORE THE NEXT LOOP**
  //**FOR THE ANALOG TO DIGITAL CONVERTER TO SETTLE**
  //**AFTER THE LAST READING.**
  //delay(1000);
}

void GetOrpReading(){

  //ORP SENSOR CODE GOES HERE.
  
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
    String tempPrefix = "t";
    String tempString = String(tempC); //temp is of type float - convert to string here.  
    String stringToSend = tempPrefix + tempString + "\r\n";
    
    //Serial.print("Temperature for the device 1 (index 0) is: ");
    Serial.println(stringToSend);
  } 
  else
  {
    Serial.println("Error: Could not read temperature data");
  }

}
