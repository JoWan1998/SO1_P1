# MANUAL - módulo de kernel - RAM
##### por **Abner Hernández**

# Construyendo un módulo de kernel

## Dependencias necesarias

Necesitamos antes de que todos ejecuten el comando `apt-get update`
más tarde:
 * `apt-get install make gcc build-essential linux-headers-$(uname -r)`
 * `make`: used to compile the file **"C"**
 * `uname-r`: used to get the kernel version

## Archivos necesarios

Necesitamos tener la codificación del módulo en ** "C" ** y el archivo ** "Makefile" **

luego, ejecutamos el siguiente comando:
* `make` para compilar el archivo en **" C "**
* `insmod <nombre> .ko` para agregar el módulo compilado al sistema

para listar todos los módulos en el sistema, usaremos: `lsmod`

para eliminar cualquier módulo del sistema, usaremos: `rmmod <nombre>`

nuestro módulo genera un archivo dentro de la carpeta `/ proc` podemos listarlo con` cat / proc / <nombre> ` 

## Crear nuestro modulo de kernel
Procedemos a crear nuestro archivo **ram-module.c**.

```
  //////////////////////////////////////////////////////////
  //// incluimos nuestras dependencia
  
  #include <linux/module.h>
  #include <linux/sched.h>
  #include <linux/uaccess.h>
  #include <linux/sysinfo.h>
  #include <linux/slab.h>
  #include <linux/fs.h>
  #include <linux/init.h>
  #include <linux/kernel.h>
  #include <linux/mm.h>
  #include <linux/hugetlb.h>
  #include <linux/mman.h>
  #include <linux/mmzone.h>
  #include <linux/proc_fs.h>
  #include <linux/percpu.h>
  #include <linux/seq_file.h>
  #include <linux/swap.h>
  #include <linux/vmstat.h>
  #include <linux/atomic.h>
  #include <linux/vmalloc.h>
  #ifdef CONFIG_CMA
  #include <linux/cma.h>
  #endif
  #include <asm/page.h>
  #include <asm/pgtable.h>

  //////////////////////////////////////////////////////////
  //// Metodo a ejecutarse cuando queramos ver nuestro modulo
  
  static int my_proc_show(struct seq_file *m, void *v){
  
          //////////////////////////////////////////////////////////
          //// Definimos una estructura tipo sysinfo, la cual nos permitira acceder a informacion del sistema, en este caso necesitamos la informacion del status de la ram.
          //// i.totalram: atributo que tiene el valor de la cantidad de ram con la que cuenta nuestro equipo
          //// i.mem_unit: atributo que nos permitira obtener en un valor comprensible de los datos de memoria.
          //// i.freeram: atributo que nos indica la memoria libre con la que cuenta nuestro equipo.
          
          struct sysinfo i;
          si_meminfo(&i);
          seq_printf(m, "%lu\n%lu\n%lu\n%lu\n",(i.totalram * i.mem_unit)/1024, ((i.totalram - i.freeram) * i.mem_unit)/1024, (i.freeram * i.mem_unit)/1024,((i.totalram - i.freeram)*100)/i.totalram);
      return 0;
  }

  //////////////////////////////////////////////////////////
  //// Metodo a ejecutarse cuando queramos escribir nuestro modulo

  static ssize_t my_proc_write(struct file* file, const char __user *buffer, size_t count, loff_t *f_pos){
      return 0;
  }

  //////////////////////////////////////////////////////////
  //// Metodo a ejecutarse cuando queramos abrir nuestro modulo

  static int my_proc_open(struct inode *inode, struct file *file){
          return single_open(file, my_proc_show, NULL);
  }

  //////////////////////////////////////////////////////////
  //// Estructura que almacenara informacion correspondiente a nuestro modulo

  static struct file_operations my_fops={
          .owner = THIS_MODULE,
          .open = my_proc_open,
          .release = single_release,
          .read = seq_read,
          .llseek = seq_lseek,
          .write = my_proc_write
  };

  //////////////////////////////////////////////////////////
  //// funcion que se ejecutara cuando cargemos nuestro modulo
  
  static int __init initModule(void){
          struct proc_dir_entry *entry;
          entry = proc_create("ram-module", 0777, NULL, &my_fops);
          if(!entry) {
                  return -1;      
          } else {
                  printk(KERN_INFO "Init_Module_Ram\n");
          }
          return 0;
  }
  
  //////////////////////////////////////////////////////////
  //// funcion que se ejecutara cuando finalice nuestro modulo
  
  static void __exit exitModule(void){
          remove_proc_entry("ram-module",NULL);
          printk(KERN_INFO "End_Module_Ram\n");
  }

  module_init(initModule);
  module_exit(exitModule);
  MODULE_LICENSE("GPL");
```

## Crear nuestro modulo de kernel
Procedemos a crear nuestro archivo **Makefile**.

```
  obj-m += ram-module.o
  all:
    make -C /lib/modules/$(shell uname -r)/build M=$(PWD) 
  modulesclean:
    make -C /lib/modules/$(shell uname -r)/build M=$(PWD) clean
```

## Compilacion de nuestro Modulo

Ejecutamos el siguiente codigo en la carpeta donde se encuentra nuestro archivo.c

```
  $ make
```
Luego de esto en nuestra carpeta podremos observar varios archivos creados como resultado de la compilacion de nuestro archivo.c, el archivo que nos sirve sera el archivo.ko

Cargamos nuestro modulo

```
  $ insmode ram-module.ko
```

Para poder ver Nuestro modulo ejecutamos

```
  $ cat /proc/ram-module
```
