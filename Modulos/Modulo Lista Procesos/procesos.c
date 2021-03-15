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

#define FileProc "procesos"

struct task_struct *task;                //esta es la estructura en la que aparece  info del proceso
struct task_struct *task_child;
struct list_head   *list;               //estructura que nos ayuda a jalar la info del sibling   

//NOTA:
//En Linux, cada proceso del sistema tiene dos estructuras que lo identifican: el PCB que es una estructura del tipo struct task_struct y una estructura del tipo struct thread_info.
//En Linux, el PCB es la estructura struct task_struct [include/linux/sched.h#0528]. En esta estructura aparece todo tipo de información sobre un proceso.

int Mextra;   //bandera para generacion del reporte
int Mextra2;

static int proc_llenar_archivo(struct seq_file *m, void *v) {    //mandamos de parametro la funcion con la que escribiremos y el puntero que es en donde esta la funcion

    seq_printf(m, "[\n");
    Mextra2 = 0;

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
	    	seq_printf(m, "\n { \"PID\" : %d, \"Nombre\" : \"%s\" ,\"FATHER PID\" : %d, \"Estado\" : %ld }", task_child->pid, task_child->comm,task_child->parent->pid, task_child->state); // va escribiendo en el archivo
		}
			
		Mextra = 0;
		seq_printf(m,"]\n}\n");
	}
    seq_printf(m, "\n]\n");
        return 0;
}




// procedimiento que se llama para abrir el archivo
static int proc_abrir_archivo(struct inode *inode, struct  file *file) {
  return single_open(file, proc_llenar_archivo, NULL);
}




//Seran las funciones que tendremos ala mano para cuando ya tengamos los datos poder verlos
static struct file_operations myops ={
        .owner = THIS_MODULE,
        .open = proc_abrir_archivo,
        .read = seq_read,
        .llseek = seq_lseek,
        .release = single_release,
};



static int inicializando(void){
    proc_create(FileProc,0,NULL,&myops);  //Se crea un proceso para poder elegir alguna opcion de lectura, etc.
    printk(KERN_INFO "INICIAR LISTA PROCESOS");
    return 0;
}

static void finalizando(void){

    printk(KERN_INFO "FINALIZAR LISTA PROCESOS");
    remove_proc_entry(FileProc,NULL);
}



module_init(inicializando);
module_exit(finalizando);
MODULE_LICENSE("GPL");
MODULE_AUTHOR("Proyecto 1 Sopes");
MODULE_DESCRIPTION("Lista de Procesos");
