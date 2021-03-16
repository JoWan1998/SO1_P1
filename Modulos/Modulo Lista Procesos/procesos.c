#include <linux/module.h> 
#include <linux/kernel.h> 
#include <linux/init.h>
#include <linux/list.h>
#include <linux/types.h>
#include <linux/slab.h>
#include <linux/sched.h>
#include <linux/string.h>
#include <linux/fs.h>
#include <linux/seq_file.h>
#include <linux/proc_fs.h>
#include <asm/uaccess.h> 
#include <linux/hugetlb.h>
#include <linux/sched/signal.h>
#include <linux/sched.h>

#define FileProc "procesos"


struct task_struct *task;
struct task_struct *task_child;
struct list_head *list;
int mextra;
int mextra2;

static int proc_llenar_archivo(struct seq_file *m, void *v) {

    seq_printf(m, "[\n");
    mextra2 = 0;
	for_each_process(task){

		if(mextra2 == 0){
			mextra2 = 1;
		}else{
			seq_printf(m,",");	
		}
       		seq_printf(m, "\n{ \"PID\" : %d, \"Name\" : \"%s\",\"Father PID\" : %d, \"Status\" : %ld }", task->pid, task->comm, task->parent->pid, task->state);
		}
    seq_printf(m, "\n]\n");
        return 0;
}




static int proc_abrir_archivo(struct inode *inode, struct  file *file) {
  return single_open(file, proc_llenar_archivo, NULL);
}



static struct file_operations myops ={
        .owner = THIS_MODULE,
        .open = proc_abrir_archivo,
        .read = seq_read,
        .llseek = seq_lseek,
        .release = single_release,
};



static int inicializando(void){
    proc_create(FileProc,0,NULL,&myops);  
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