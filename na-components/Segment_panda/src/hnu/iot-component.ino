int num;
byte Seven[10][7]=
    {{1,1,1,1,1,1,0},
    {0,1,1,0,0,0,0},
    {1,1,0,1,1,0,1},
    {1,1,1,1,0,0,1},
    {0,1,1,0,0,1,1},
    {1,0,1,1,0,1,1},
    {0,0,1,1,1,1,1},
    {1,1,1,1,1,1,1},
    {1,1,1,0,0,1,1}};


void setup(){
    pinMode(3,OUTPUT);
    pinMode(4,OUTPUT);
    pinMode(5,OUTPUT);
    pinMode(6,OUTPUT);
    pinMode(7,OUTPUT);
    pinMode(8,OUTPUT);
    pinMode(9,OUTPUT);
    pinMode(10,OUTPUT);
    Serial.begin(9600);
}
void loop(){
    while(Serial.available()){
        num = Serial.parsInt();
    }
    displayDigit(num);
    delay(100);
}
void displayDigit(int val){
    int pin =3;
    for(int i=0; i<7; i++){
        digitalWrite(pin+i, Seven[num][i]);
}
