
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
#define Offset 0.00            //deviation compensate
#define samplingInterval 20
#define printInterval 800
#define ArrayLenth  40    //times of collection
int pHArray[ArrayLenth];   //Store the average value of the sensor feedback
int pHArrayIndex=0;


//********************************END OF CONSTANTS/PROPERTIES SECTION********************************


void setup() {
  // INITIALISE SERIAL COMMUNICATIONS AT 9600 BPS.
  Serial.begin(9600);

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


  delay(1000);
}

void GetPhReading(){

  static unsigned long samplingTime = millis();
  static unsigned long printTime = millis();
  static float pHValue, voltage;
   
  if(millis()-samplingTime > samplingInterval)
  {
      pHArray[pHArrayIndex++]=analogRead(SensorPin);
      if(pHArrayIndex==ArrayLenth)
        pHArrayIndex=0;
      voltage = avergearray(pHArray, ArrayLenth)*5.0/1024;
      pHValue = 3.5*voltage+Offset;
      samplingTime=millis();
  }
  if(millis() - printTime > printInterval)   //Every 800 milliseconds, print a numerical
  {
    String phPrefix = "p";
    Serial.print(phPrefix + String(pHValue) + "\r\n");
    printTime=millis();
  }

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

double avergearray(int* arr, int number){
  int i;
  int max,min;
  double avg;
  long amount=0;
  if(number<=0){
    Serial.println("Error number for the array to avraging!/n");
    return 0;
  }
  if(number<5){   //less than 5, calculated directly statistics
    for(i=0;i<number;i++){
      amount+=arr[i];
    }
    avg = amount/number;
    return avg;
  }else{
    if(arr[0]<arr[1]){
      min = arr[0];max=arr[1];
    }
    else{
      min=arr[1];max=arr[0];
    }
    for(i=2;i<number;i++){
      if(arr[i]<min){
        amount+=min;        //arr<min
        min=arr[i];
      }else {
        if(arr[i]>max){
          amount+=max;    //arr>max
          max=arr[i];
        }else{
          amount+=arr[i]; //min<=arr<=max
        }
      }//if
    }//for
    avg = (double)amount/(number-2);
  }//if
  return avg;
}
