int num;
void setup(){
    Serial.begin(9600);
    pinMode(3,OUTPUT);
    digitalWrite(3,LOW);
    pinMode(4,OUTPUT);
    digitalWrite(4,LOW);
    pinMode(5,OUTPUT);
    digitalWrite(5,LOW);
}

void loop(){
    while(Serial.available()){
        num = Serial.parseInt();
    }
String res = "none";
if (num>=0 and num<=3){
    res = "green";
    }
else if (num<=6){
    res = "yellow";
    }
else if(num<=9){
    res = "red";
    }
if(res == green){
    digitalWrite(3,HIGH);
    digitalWrite(4, LOW);
    digitalWrite(5, LOW);
}
}else if(res == yellow){
    digitalWrite(3, LOW);
    digitalWrite(4,HIGH);
    digitalWrite(5, LOW);
}
}else if(res == red){
    digitalWrite(3, LOW);
    digitalWrite(4, LOW);
    digitalWrite(5,HIGH);
}
}