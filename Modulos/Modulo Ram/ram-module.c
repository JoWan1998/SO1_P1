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

static int my_proc_show(struct seq_file *m, void *v){
        struct sysinfo i;
        si_meminfo(&i);
        seq_printf(m, "%lu\n%lu\n%lu\n%lu\n",(i.totalram * i.mem_unit)/1024, ((i.totalram - i.freeram) * i.mem_unit)/1024, (i.freeram * i.mem_unit)/1024,((i.totalram - i.freeram)*100)/i.totalram);
    return 0;
}

static ssize_t my_proc_write(struct file* file, const char __user *buffer, size_t count, loff_t *f_pos){
    return 0;
}

static int my_proc_open(struct inode *inode, struct file *file){
        return single_open(file, my_proc_show, NULL);
}

static struct file_operations my_fops={
        .owner = THIS_MODULE,
        .open = my_proc_open,
        .release = single_release,
        .read = seq_read,
        .llseek = seq_lseek,
        .write = my_proc_write
};

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

static void __exit exitModule(void){
        remove_proc_entry("ram-module",NULL);
        printk(KERN_INFO "End_Module_Ram\n");
}

module_init(initModule);
module_exit(exitModule);
MODULE_LICENSE("GPL");
