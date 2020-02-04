//MONITOR READINGS IN EC

//THESE CONSTATNT WON'T CHANGE. THEY'RE USED TO GIVE NAMES TO THE PINS USED:
const int analogInPin = A1; //ANALOG INPUT PIN THAT THE SENSOR OUTPUT IS ATTACHED TO.
const int analogOutPin = 9; //ANALOG OUTPUT PIN 

int sensorValue = 0; //VALUE READ FROM SENSOR.
int outputValue = 0; //VALUE OUTPUT TO THE PWM (ANALOG OUT)

void setup() {
  // INITIALISE SERIAL COMMUNICATIONS AT 9600 BPS.
  Serial.begin(9600);

}

void loop() {
  //READ THE ANALOG IN VALUE
  sensorValue = analogRead(analogInPin);

  //MAP IT TO THE RANGE OF THE ANALOG OUT
  //TO READ ppm, replace 5000 WITH 3200 TO READ ppm AND TO CALIBRATE TO ppm.
  outputValue = map(sensorValue, 0, 1023, 0, 5000);

  //CHANGE THE ANALOG OUT VALUE.
  analogWrite(analogOutPin, outputValue);

  //PRINT THE RESULTS TO THE SERIAL MONITOR.
  Serial.print("sensor = ");
  Serial.print(sensorValue);
  Serial.println("\t output = ");

  //TO READ microS, REPLACE 5.00 WITH 5000. 
  //TO READ ppm, replace 5.0 WITH 3200 TO READ ppm AND TO CALIBRATE TO ppm.
  Serial.print(analogRead(1)*5.00/1024, 2); 

  //WAIT FOR 10 MILLISECONDS BEFORE THE NEXT LOOP
  //FOR THE ANALOG TO DIGITAL CONVERTER TO SETTLE
  //AFTER THE LAST READING.
  delay(500);

}

//TO READ ppm, replace 5.0 WITH 3200 TO READ ppm AND TO CALIBRATE TO ppm.
