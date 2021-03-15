
# MANUAL - MODULO - LISTA DE PROCESOS 

##### por **Jonathan Hidalgo**

-----------------------------------------------------------
# MODULO LISTA DE PROCESOS

* Pasos para la insercion de un modulo  entre otros se encuentra en el siguiente Repositorio

> pasos para la insercion de modulo e instalacion de dependecias se encuentran en el siguiente repositoriio.

```
  https://github.com/leoaguilar97/so1-course/tree/main/Clase%203
```

* CONSTRUCCION DEL MODULO CON SU EXPLICACION. 

1. Se importaron las siguientes librerias para poder hacer uso de la construccion de los diferentes modulos 

```
#include <linux/module.h>   
#include <linux/kernel.h> 
#include <linux/init.h>    
#include <linux/sched.h>
#include <linux/proc_fs.h>
#include <asm/uaccess.h> 
#include <linux/hugetlb.h>
#include <linux/string.h>
#include <linux/fs.h>
#include <linux/seq_file.h>
#include <linux/list.h>
#include <linux/types.h>
#include <linux/slab.h>
#include <linux/signal.h>
#include <linux/sched.h>

```

> Explicacion de algunos de los modulos mas importantes 


```

<linux/module.h> 
Carga dinámica de módulos en el kernel. 
Encabezado del núcleo para cargar LKM en el kernel


<linux/kernel.h> 
Contiene tipos, macros, funciones para el kernel.


<linux/init.h>
Macros utilizadas para marcar funciones, p. Ej. __init __exit
 

<linux/list.h>
Es usado para el uso de las listas en Linux


<linux/types.h>
utilizado para indexar en un disco o partición de disco. 


<linux/slab.h>
La asignación de memoria se usa a menudo en el desarrollo del módulo del núcleo o el desarrollo del controlador. La forma común es llamar a la interfaz kmalloc para asignar memoria.


<linux/sched.h>
El encabezado define la estructura sched_param, que contiene los parámetros de programación. 


<linux/string.h>
Es utilizado para  el kernel de Linux y otros proyectos de bajo nivel 


<linux/fs.h>
Encabezado para el soporte del sistema de archivos de Linux


<linux/seq_file.h>
La interfaz seq_file está disponible a través de <linux / seq_file.h>. Hay tres aspectos de seq_file:
•	Una interfaz de iterador que permite que la implementación de un archivo virtual recorra los objetos que presenta.
•	Algunas funciones de utilidad para formatear objetos para la salida sin necesidad de preocuparse por cosas como los búferes de salida.
•	Un conjunto de operaciones de archivo enlatadas que implementan la mayoría de las operaciones en el archivo virtual.


<linux/proc_fs.h>
Desplazamiento de los proceso en el directorio por punteros.


<asm/uaccess.h> 
Requerido para la función de copia al usuario


<linux/hugetlb.h>
particularmente útil para el kernel de Linux y otros proyectos de bajo nivel.


<linux/sched/signal.h>
El modulo al compilar tira error ya que depende dela versión del kernel  si es menor a la 10.11  se coloca solo <Linux/signal.h>

```




>  Explicacion de otros datos

```
List_Head:
Esta estructura contiene un solo puntero al primer elemento de la lista. Los elementos están doblemente vinculados para que un elemento arbitrario se pueda eliminar sin tener que atravesar la lista. Se pueden agregar nuevos elementos a la lista después de un elemento existente o al principio de la lista. Una estructura LIST_HEAD se declara de la siguiente manera:

task_struct:
http://sop.upv.es/gii-dso/es/t3-procesos-en-linux/gen-t3-procesos-en-linux.html


list_entry: obtenga la estructura para esta entrada
Sinopsis
list_entry (	ptr ,
 	type ,
 	member) ;
 
Argumentos:

ptr:
el puntero struct list_head .
type:
el tipo de estructura en la que está incrustado.
member:
el nombre de list_head dentro de la estructura.


```

2. Definicion del modulo  y otras declaraciones

```
  #define FileProc "procesos"

  struct task_struct *task;                //esta es la estructura en la que aparece  info del proceso
  struct task_struct *task_child;
  struct list_head   *list;               //estructura que nos ayuda a jalar la info del sibling   

  //NOTA:
  //En Linux, cada proceso del sistema tiene dos estructuras que lo identifican: el PCB que es una estructura del tipo struct task_struct y una estructura del tipo struct thread_info.
  //En Linux, el PCB es la estructura struct task_struct [include/linux/sched.h#0528]. En esta estructura aparece todo tipo de información sobre un proceso.


```


3. Declaracion de variables a utilizar para el proceso

```

  int Mextra;   //bandera para generacion del reporte
  int Mextra2;


```

4. funcion  para lectura de los procesos.

```

  static int proc_llenar_archivo(struct seq_file *m, void *v) {    //mandamos de parametro la funcion con la que escribiremos y el puntero que es en donde esta la funcion

```


5. Inicio de la escritura del archivo , e inicializacion de las variables a iniciar.
```
    seq_printf(m, "[\n");
    Mextra2 = 0;

```

6. Ciclos que recorren la lista de procesos para escribir el archivo de recoleccion de informacion para nuestras necesidades.

```
	for_each_process(task)    //Se recorre la lista de procesos 
	{    
		if(Mextra2 == 0){
			Mextra2 = 1;
		}else{
			seq_printf(m,",");	
		}

        seq_printf(m, "\n{ \"PID\" : %d, \"Nombre\" : \"%s\",\"FATHER PID\" : %d, \"Estado\" : %ld }", task->pid, task->comm, task->parent->pid, task->state);
		seq_printf(m,"\"sub\": [");
		Mextra = 0;
		list_for_each(list, &task->children){
			if(Mextra == 0){
				Mextra = 1;
			}else{
				seq_printf(m,","); //imprime en el archivo en la posicion del puntero m  va separando por ,
			}
			task_child = list_entry(list, struct task_struct, sibling); 
												        //sibling es la lista de procesos con el mismo proceso padre que este proceso, list tiene que ser de tipo head
														    //task_struct que obtiene la info 
	    	seq_printf(m, "\n { \"PID\" : %d, \"Nombre\" : \"%s\" ,\"FATHER PID\" : %d, \"Estado\" : %ld }", task_child->pid, task_child->comm,task_child->parent->pid, task_child->state); 
        // va escribiendo en el archivo
		}
			
		Mextra = 0;
		seq_printf(m,"]\n}\n");
	}
    seq_printf(m, "\n]\n");
        return 0;
```


7. Procedimiento que se llama para abrir el archivo

```
static int proc_abrir_archivo(struct inode *inode, struct  file *file) {
  return single_open(file, proc_llenar_archivo, NULL);
}

```

8. Seran las funciones que tendremos ala mano para cuando ya tengamos los datos poder verlos

```
static struct file_operations myops ={
        .owner = THIS_MODULE,
        .open = proc_abrir_archivo,
        .read = seq_read,
        .llseek = seq_lseek,
        .release = single_release,
};


```


9.  funcion para Iniciar el proceso

```
static int inicializando(void){
    proc_create(FileProc,0,NULL,&myops);  //Se crea un proceso para poder elegir alguna opcion de lectura, etc.
    printk(KERN_INFO "INICIAR LISTA PROCESOS");
    return 0;
}

```


10. funcion para finalizar el proceso
```
static void finalizando(void){

    printk(KERN_INFO "FINALIZAR LISTA PROCESOS");
    remove_proc_entry(FileProc,NULL);
}
```


11. Data necesaria para el modulo 

```
  module_init(inicializando);
  module_exit(finalizando);
  MODULE_LICENSE("GPL");
  MODULE_AUTHOR("Proyecto 1 Sopes");
  MODULE_DESCRIPTION("Lista de Procesos");

```


* Salida del mismo 


```
{ "PID" : 1670, "Nombre" : "ibus-daemon","FATHER PID" : 1294, "Estado" : 1 }"sub": [
 { "PID" : 1789, "Nombre" : "ibus-dconf" ,"FATHER PID" : 1670, "Estado" : 1 },
 { "PID" : 1790, "Nombre" : "ibus-ui-gtk3" ,"FATHER PID" : 1670, "Estado" : 1 },
 { "PID" : 1921, "Nombre" : "ibus-engine-sim" ,"FATHER PID" : 1670, "Estado" : 1 }]
}
,
{ "PID" : 1682, "Nombre" : "gvfsd","FATHER PID" : 1294, "Estado" : 1 }"sub": []
}
,
{ "PID" : 1692, "Nombre" : "gnome-keyring-d","FATHER PID" : 1294, "Estado" : 1 }"sub": []
}
,
{ "PID" : 1695, "Nombre" : "apache2","FATHER PID" : 1, "Estado" : 1 }"sub": [
 { "PID" : 2986, "Nombre" : "apache2" ,"FATHER PID" : 1695, "Estado" : 1 },
 { "PID" : 2987, "Nombre" : "apache2" ,"FATHER PID" : 1695, "Estado" : 1 }]
}
,
{ "PID" : 1768, "Nombre" : "bamfdaemon","FATHER PID" : 1294, "Estado" : 1 }"sub": []
}
,
{ "PID" : 1781, "Nombre" : "gvfsd-fuse","FATHER PID" : 1294, "Estado" : 1 }"sub": []
}
,
{ "PID" : 1787, "Nombre" : "gpg-agent","FATHER PID" : 1294, "Estado" : 1 }"sub": []
}
,
{ "PID" : 1789, "Nombre" : "ibus-dconf","FATHER PID" : 1670, "Estado" : 1 }"sub": []
}
,
{ "PID" : 1790, "Nombre" : "ibus-ui-gtk3","FATHER PID" : 1670, "Estado" : 1 }"sub": []
}
,
{ "PID" : 1806, "Nombre" : "ibus-x11","FATHER PID" : 1294, "Estado" : 1 }"sub": []
}
,
{ "PID" : 1811, "Nombre" : "hud-service","FATHER PID" : 1294, "Estado" : 1 }"sub": []
}
,
{ "PID" : 1814, "Nombre" : "unity-settings-","FATHER PID" : 1294, "Estado" : 1 }"sub": [
 { "PID" : 1920, "Nombre" : "check_gl_textur" ,"FATHER PID" : 1814, "Estado" : 64 }]
}
,
{ "PID" : 1822, "Nombre" : "at-spi-bus-laun","FATHER PID" : 1294, "Estado" : 1 }"sub": [
 { "PID" : 1834, "Nombre" : "dbus-daemon" ,"FATHER PID" : 1822, "Estado" : 1 }]
}
,
{ "PID" : 1823, "Nombre" : "gnome-session-b","FATHER PID" : 1294, "Estado" : 1 }"sub": [
 { "PID" : 2132, "Nombre" : "gnome-software" ,"FATHER PID" : 1823, "Estado" : 1 },
 { "PID" : 2141, "Nombre" : "nm-applet" ,"FATHER PID" : 1823, "Estado" : 1 },
 { "PID" : 2149, "Nombre" : "nautilus" ,"FATHER PID" : 1823, "Estado" : 1 },
 { "PID" : 2248, "Nombre" : "polkit-gnome-au" ,"FATHER PID" : 1823, "Estado" : 1 },
 { "PID" : 2309, "Nombre" : "unity-fallback-" ,"FATHER PID" : 1823, "Estado" : 1 },
 { "PID" : 2549, "Nombre" : "zeitgeist-datah" ,"FATHER PID" : 1823, "Estado" : 1 },
 { "PID" : 2622, "Nombre" : "update-notifier" ,"FATHER PID" : 1823, "Estado" : 1 },
 { "PID" : 2719, "Nombre" : "deja-dup-monito" ,"FATHER PID" : 1823, "Estado" : 1 }]
}

```


>. Tendremos el modulo funcionando correctamente! 



* Archivo para la construccion de nuestro modulo 

```
    obj-m += procesos.o
    all:
    make -C /lib/modules/$(shell uname -r)/build M=$(shell pwd)
    modulesclean:
    make -C /lib/modules/$(shell uname -r)/build M=$(shell pwd) clean

```