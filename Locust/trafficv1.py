import json
from random import random, randrange
from sys import getsizeof
from locust import HttpUser, task, between, events


class User():
    
    def __init__(self):
        self.next = 0
        self.array = []
        self.aun = True
        self.passd = True
        self.users = 1
         
    def cargar(self):
        print(">> Reader: Iniciando con la carga de datos")
        try:
            with open("traffic.json", 'r') as data_file:
                self.array = json.loads(data_file.read())
            print(f'>> Reader: Datos cargados correctamente, {len(self.array)} datos -> {getsizeof(self.array)} bytes.')
        except Exception as e:
            print(f'>> Reader: No se cargaron los datos {e}')
            
    def yanain(self):
        self.aun = False
        self.passd = False
            
    def getUser(self):
        print(">> Consultando Usuario Anterior")
        
        try:
            with open("usuario.txt", 'r') as info:
                lineas = info.readlines()
                for line in lineas:
                    self.next = int(line)
                    print(self.next)
                    
            with open("usuario.txt", 'w') as info:
                info.write(str(self.next+1))
         
            if(self.aun and len(self.array) > self.next):
                self.users = self.users + 1
                return self.array[self.next]  
            else:
                return None
        except Exception as e:
            print(f'>>GetUser: Error {e}')
            

class MessageTraffic(HttpUser):

    wait_time = between(0.1,10)
    host = "http://34.120.55.27:8080"
    

    def on_start(self):
        print(">> MessageTraffic: Iniciando el envio de tráfico")
        self.general = User()
        self.general.cargar()
        
    @events.spawning_complete.add_listener
    def nietUser(self):
        print("ya van 4 bb");
        

    @task
    def PostMessage(self):
            if(self.general.passd):
                data = self.general.getUser()
                if (data is not None):
                    data_to_send = json.dumps(data)
                    print(data_to_send)
                    self.client.post("/", json=data)
                    self.general.yanain()
                else:
                    self.stop(True);
            else:
                print(f'Usuarios ejecutados: {self.general.users}')
                self.stop(True)
