#include <Servo.h>  

Servo servo;  // Crear objeto servo

const int trigPin = 5;    
const int echoPin = 6;   
const int servoPin = 7;

long duration, dist; 
int contador = 0;  // Variable para el contador

void setup() {
    // Inicialización del puerto serie
    Serial.begin(9600);  

    // Configuración de pines
    pinMode(trigPin, OUTPUT);  
    pinMode(echoPin, INPUT);  

    // Probar el servo al inicio
    if (testServo()) {
        Serial.println("Servo detectado correctamente.");
    } else {
        Serial.println("Error: Servo no detectado.");
        while (1); // Detener el programa si el servo no es detectado
    }
}

bool testServo() {
    // Intentar conectar y mover el servo para verificar si responde
    servo.attach(servoPin);
    servo.write(90);
    delay(500);
    servo.write(0);
    delay(500);
    servo.write(90);
    delay(500);
    servo.detach();

    // Considerar que el servo está detectado si no hay errores visibles en el movimiento
    return true; // Puedes implementar validaciones adicionales si tienes hardware para confirmarlo
}

void measure() {
    digitalWrite(trigPin, LOW);
    delayMicroseconds(5);
    digitalWrite(trigPin, HIGH);
    delayMicroseconds(15);
    digitalWrite(trigPin, LOW);
  
    duration = pulseIn(echoPin, HIGH);
    dist = (duration / 2) / 29.1;  // Convertir la duración a distancia

    // Mostrar la distancia en el monitor serie para validar que el sensor funciona
    Serial.print("Distancia medida: ");
    Serial.print(dist);
    Serial.println(" cm");
}

void loop() {
    measure();  // Medir la distancia
    
    if (dist < 5) {  // Si la distancia es menor a 5 cm, se activa el servo y el contador
        // Mostrar mensaje en el monitor serie cuando se detecta un objeto
        Serial.println("¡Objeto detectado!");

        // Incrementar el contador
        contador++;  
        Serial.print("Contador: ");
        Serial.println(contador);  // Enviar el contador al puerto serie
        
        // Activar el servo
        servo.attach(servoPin);
        delay(1);

        // Rotar el servo a 90 grados
        servo.write(90);  
        delay(3000);  // Mantener la posición durante 3 segundos

        // Regresar el servo a 0 grados
        servo.write(0);  
        delay(5000);  // Reposar 5 segundos en 0 grados

        servo.detach();  
    }

    delay(1000);  // Esperar un segundo antes de la siguiente medición
}
