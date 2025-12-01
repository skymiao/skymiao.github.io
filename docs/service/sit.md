# SIT环境服务安装
## 一、Consul注册中心服务
下载与解压
```
wget  --no-check-certificate  https://releases.hashicorp.com/consul/1.9.3/consul_1.9.3_linux_amd64.zip
unzip  consul_1.9.3_linux_amd64.zip
```
创建数据和日志相关目录
```
mkdir  -p /opt/consul/{bin,conf,data,log}
mv   consul   /opt/consul/bin
```
配置环境变量
```
cat  >>  /etc/profile  <<  EOF
export CONSUL_HOME=/opt/consul
export PATH=\${PATH}:\${CONSUL_HOME}/bin
EOF
source /etc/profile
```
consul配置文件
```
cat  >>   /opt/consul/conf/server.json    << EOF
{
 "bind_addr": "0.0.0.0",
 "client_addr": "0.0.0.0",
 "data_dir": "/opt/consul/data",
 "log_level": "INFO",
 "log_file": "/opt/consul/log/consul.log",
 "log_rotate_duration": "24h",
 "node_name": "192.168.40.121",
 "server": true,
 "ui": true,
 "bootstrap_expect": 1,
}
EOF
```

consul启动
```
consul   agent   -config-dir=/opt/consul/conf    &
```

查看consul成员信息
```
consul  members
```
consul 运行状态信息
```
consul info
```

## 二、Rabbitmq消息队列服务
安装依赖包
```
yum -y install make gcc gcc-c++ kernel-devel m4 ncurses-devel libxml2-utils libxml2 libxslt openssl-devel unixODBC unixODBC-devel unixODBC-bin gtk2 fop gtk2-devel binutils-devel mesa-libGLU-devel
```
erlang源码编译
```
tar -xvf otp_src_20.1.tar.gz
mkdir   /opt/erlang
cd otp_src_20.1
./configure --prefix=/opt/erlang
make  &&  make  install
```

rabbitmq下载与解压
```
tar  -xvf  rabbitmq-server-generic-unix-3.7.17.tar
mv     rabbitmq_server-3.7.17   /opt
```

配置环境变量
```
cat  >>   ~/.bash_profile   <<  EOF
export ERLANG_HOME=/opt/erlang
export PATH=\${PATH}:\${ERLANG_HOME}/bin
export RABBITMQ_HOME=/opt/rabbitmq_server-3.7.17
export PATH=\${PATH}:\${RABBITMQ_HOME}/sbin
EOF
source  ~/.bash_profile
```

启动Rabbitmq
```
rabbitmq-server  &
```
开启Rabbitmq管理控制台
```
cat   >>    /opt/rabbitmq_server-3.7.17/etc/rabbitmq/rabbitmq.config  << EOF
[{rabbit, [{loopback_users, []}]}].
EOF
```

启用管理控制台
```
rabbitmq-plugins enable rabbitmq_management
```

重启 rabbitmq 是配置生效
```
rabbitmqctl stop
rabbitmq-server &
```
打开浏览器访问:http://192.168.40.121:15672，用户名guest，密码guest


安装延迟队列插件
上传延迟队列插件
```
cp  rabbitmq_delayed_message_exchange-3.8.0.ez    /opt/rabbitmq_server-3.7.17/plugins/
```

开启插件：
```
rabbitmq-plugins enable rabbitmq_delayed_message_exchange
```

查询安装的所有插件：
```
rabbitmq-plugins list
```
看到这个查看rabbitmq_delayed_message_exchange 3.8.0表示安装成功

重启使延迟队列插件生效
```
rabbitmqctl stop
rabbitmq-server   &
```

## 三、Mongodb数据库

mongodb安装
```
wget    --no-check-certificate   https://fastdl.mongodb.org/linux/mongodb-linux-x86_64-rhel70-4.4.4.tgz
tar  -xzvf  mongodb-linux-x86_64-rhel70-4.4.4.tgz   -C  /opt/
cd /opt
mv  mongodb-linux-x86_64-rhel70-4.4.4   mongodb
```

创建数据和日志目录
```
mkdir  -p /opt/mongodb/{conf,data,log}
```

配置环境变量
```
cat  >>  ~/.bash_profile   << EOF
export  MONGODB_HOME=/opt/mongodb
export  PATH=\${PATH}:\${MONGODB_HOME}/bin
EOF
source ~/.bash_profile
```

mongod配置文件
```
cat   >>  /opt/mongodb/conf/config.conf   <<  EOF
systemLog:
  destination: file
  logAppend: true
  path: /opt/mongodb/log/mongodb.log
storage:
  dbPath: /opt/mongodb/data/
  journal:
    enabled: true
processManagement:
  fork: true
net:
  port: 27017
  bindIp: 0.0.0.0
EOF
```

启动
```
/opt/mongodb/bin/mongod   -f    /opt/mongodb/conf/config.conf
```

连接客户端
```
mongo  127.0.0.1:27017
```

## 四、Redis缓存服务

安装依赖
```
yum -y install gcc
```

编译安装
```
wget http://download.redis.io/releases/redis-5.0.8.tar.gz
tar -xzvf redis-5.0.8.tar.gz
mkdir  -p      /opt/redis
cd   redis-5.0.8
make CFLAGS="-march=x86-64"     PREFIX=/opt/redis install
```

创建数据和日志目录
```
mkdir   -p    mkdir  -p  /opt/redis/{data,logs,etc}
```

配置环境变量
```
cat  >>    ~/.bash_profile  << EOF
export REDIS_HOME=/opt/redis
export PATH=\$PATH:\$REDIS_HOME/bin
EOF
source  ~/.bash_profile
```

redis配置文件
```
cat   >>   /opt/redis/etc/redis.conf  <<  EOF
daemonize yes
bind 0.0.0.0
port 6379
pidfile /opt/redis/redis.pid
dir /opt/redis/data/
logfile /opt/redis/logs/redis.log
dbfilename dump.rdb
EOF
```

redis启动
```
/opt/redis/bin/redis-server       /opt/redis/etc/redis.conf   &
```

客户端连接
```
redis-cli   -h 127.0.0.1   -p  6379
```

初始化Redis密码：

在配置文件中有个参数： requirepass  这个就是配置redis访问密码的参数；

比如 requirepass test123；

（Ps:需重启Redis才能生效）

redis的查询速度是非常快的，外部用户一秒内可以尝试多大150K个密码；所以密码要尽量长（对于DBA 没有必要必须记住密码）；

不重启Redis设置密码：

在配置文件中配置requirepass的密码（当redis重启时密码依然有效）。

redis 127.0.0.1:6379> config set requirepass test123

查询密码：
redis 127.0.0.1:6379> config get requirepass
 (error) ERR operation not permitted

 密码验证：
redis 127.0.0.1:6379> auth test123
 OK
 
再次查询：

redis 127.0.0.1:6379> config get requirepass
1) "requirepass"
2) "test123"

PS：如果配置文件中没添加密码 那么redis重启后，密码失效


## 五、Mysql数据库
软件包下载与解压
```
tar  -xzvf      mysql-5.6.51-linux-glibc2.12-x86_64.tar.gz
mv   mysql-5.6.51-linux-glibc2.12-x86_64   /opt/mysql
```

创建数据和日志目录
```
mkdir   -p /opt/mysql/data
mkdir   -p  /opt/mysql/logs
```

```
useradd  mysql
chown    -R mysql:mysql   /opt/mysql
```


配置MySQL环境变量
```
cat   >>  /etc/profile  << EOF
export    PATH=\$PATH:/opt/mysql/bin
EOF
source  /etc/profile
```

初始化数据库
```
/opt/mysql/scripts/mysql_install_db    --user=mysql    --basedir=/opt/mysql   --datadir=/opt/mysql/data
```

初始化数据库报错：
- 1、FATAL ERROR: please install the following Perl modules before executing /opt/mysql/scripts/mysql_install_db:
Data::Dumpe
```
yum -y install autoconf
```

- 2、Installing MySQL system tables.../opt/mysql/bin/mysqld: error while loading shared libraries: libaio.so.1: cannot open shared object file: No such file or directory
```
yum install libaio* -y
```

MySQL配置文件
```
cat  >>   /opt/mysql/my.cnf   << EOF
[mysql]
socket=/tmp/mysql.sock
character-set-server=utf8
[client]
socket=/tmp/mysql.sock
[mysqld]
user = mysql
port=3306
socket=/tmp/mysql.sock
pid-file=/opt/mysql/mysqld.pid
character-set-server=utf8
collation-server = utf8_general_ci
basedir=/opt/mysql
datadir=/opt/mysql/data
log-error=/opt/mysql/logs/mysqld.log
default_storage_engine=Innodb
max_connections = 1024
EOF
```

使用mysql.server命令去启动mysql
```
cp   /opt/mysql/support-files/mysql.server   /opt/mysql/bin
```
在mysql.server命令里面添加basedir和datadir的路径
```
cat   mysql.server
basedir=/opt/mysql
datadir=/opt/mysql/data
```

启动mysql
```
mysql.server   start
mysql.server   status
```

mysql密码设置
```
mysqladmin    -uroot  password    '2wsx#EDC'
```
mysql 登录
```
mysql   -uroot -p
```

创建root远程登录用户
```
GRANT ALL PRIVILEGES ON *.* TO 'root'@'%' IDENTIFIED BY '123456' WITH GRANT OPTION;
flush  privilieges;
```

## 六、Docker容器服务
安装依赖
```
sudo yum install -y yum-utils   device-mapper-persistent-data   lvm2
```

添加阿里云Docker源
```
curl -o /etc/yum.repos.d/docker-ce.repo https://mirrors.aliyun.com/docker-ce/linux/centos/docker-ce.repo
```
安装Docker
```
sudo yum -y  install docker-ce
```

迁移docker容器默认存放目录
```
mv /var/lib/docker /opt/docker
ln -s /opt/docker /var/lib/docker
```

配置Docker镜像加速
```
curl -sSL https://get.daocloud.io/daotools/set_mirror.sh | sh -s http://f1361db2.m.daocloud.io
```

查看镜像加速配置
```
cat  /etc/docker/daemon.json
```

启动Docker服务并设置开机启动
```
systemctl enable docker
systemctl start docker
```

开启路由转发功能
否则容器中的实例上不了网。
```
echo 1 > /proc/sys/net/ipv4/ip_forward
```
使用非 root 用户管理docker


默认情况下，docker只能在root用户权限下运行，非root用户需要使用sudo才能运行。最新版的Docker通过添加docker用户组来实现非root权限用户操作docker的功能。需要注意的是，docker用户组实质上和root用户是一样的，因此其对系统安全的影响也是一样的。要使用非root用户管理docker。

首先创建 docker 用户组：
```
sudo groupadd docker
```
然后将当前用户添加到 docker 用户组中：
```
sudo usermod -aG docker $USER
```
注销当前用户并重新登录（或者重启电脑）后，用户即可被添加到 docker 用户组中。在linux系统中，也可以通过以下命令快速激活 docker 用户组。
```
newgrp docker
```
## 七、Docker容器管理
下载 Docker Compose 的当前稳定版本：
```
sudo curl -L "https://github.com/docker/compose/releases/download/1.28.5/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
```

将可执行权限应用于二进制文件：
```
sudo chmod +x /usr/local/bin/docker-compose
```
测试是否安装成功：
```
docker-compose --version
```


## 八、TFTP文件服务脚本
cat  ftp.sh
```shell
#!/bin/bash
export  JAVA_HOME=/root/ftp/jdk1.8.0_231/bin
client_primary=/home/admin/www/njbank/wageftp
client_success=/home/admin/www/njbank/wagepay
for  i  in   $(ls     ${client_primary})
do
  date=$(echo   "$i"  |  cut  -d "_" -f 4  |  cut  -c  1-8)
  count=$(java  -Desb.cfg.path=/root/ftp/TFTClient/config   -jar  /root/ftp/TFTClient/tftclient.jar   -h 1   -dup  -cf $client_primary/$i   -sf   $i)
  if  [ $count -eq  0 ] ; then
  mkdir -p  ${client_success}/$date
  mv  $client_primary/$i   $client_success/$date
  fi
done
```
Client有三个目录：临时目录、上传目录、备份目录
代码会在临时目录里面生成写入的文件，当文件写入完成，代码会移动到上传目录，ftp.sh脚本会定时扫描上传目录是否有文件，如果有就上传，上传成功的同时会把文件移动到备份目录

client_primary 上传文件目录的路径

client_success 备份目录路径

要指定JDK的命令路径,脚本里面可能找不到java命令
```
export  JAVA_HOME=/root/ftp/jdk1.8.0_231/bin
```

Client安装在/root/ftp/TFTClient/下
JAVA 在调取jar包时是要指定绝对路径/root/ftp/TFTClient/tftclient.jar、/root/ftp/TFTClient/config

每分钟执行ftp.sh脚本
```
* *  * * * /bin/sh   /root/ftp/ftp.sh
```

## 九、数据库信息

| 用途             | 数据类型             | 数据库名              | 用户          | 密码 |
| ---------------- | -------------------- | --------------------- | ------------- | ---- |
| mysql 业务库      | mysql                | sit_kayak_nanjingbank | nanjing       |      |
| mongo 业务库      | mongodb              | kayaknanjingbank      | nanjing       |      |
| mongo 日志        | mongodblogs          | nanjingbanklogs       | nanjinglogs   |      |
| mongo 分析库      | nanjingbankdatacount | nanjingbankdatacount  | nanjingdata   |      |
| mongo 消息库      | nanjingbanknews      | nanjingbanknews       | nanjingnews   |      |
| mongo ids统一认证      | nanjingbankids       | nanjingbankids        | nanjingids    |      |
| mongo 经放薪理库 | nanjingbankmanager   | nanjingbankmanager    | anjingmanager |      |

## 十、放薪经理同步python脚本定时任务
1、python3.7环境安装

注意：需要root权限
 
查看python版本:

python --version
 
下载Python-3.7.10

wget https://www.python.org/ftp/python/3.7.10/Python-3.7.10.tgz

压缩包附带软件包
 
解压

tar   zxvf   Python-3.7.10.tgz
 
更改工作目录

cd Python-3.7.10

安装系统依赖

yum install zlib* openssl-*

修改安装文件

Python-3.7.10/Modules/Setup.dist

找到SSL 具体行数为211,打开211-214行的注释

修改SSL=/etc/ssl 保存记录

然后确认下路径/etc/ssl 路径有内容 不需要自己创建 系统默认安装有的
 
安装

./configure  --with-ssl
make all             
make install  
make clean  
make distclean  
 
 
查看版本信息

/usr/local/bin/python3.7 -V 

安装依赖

pip3 install --no-index --find-links=/tmp/packages  -r requirments.txt 
 

2、脚本配置方法

数据指标计算 自动化部署
```
经理指标数据跑批部署，操作流程
前置条件：
    服务器上需要按照python3环境、mongo环境
1.将 njcb 文件夹拷贝到服务器对应用户下，位置自定义
2.修改以下两个文件的对应变量
    【修改 python 命令路径、mongodb 命令路径、数据库地址、用户目录等，详见代码注释】
    ①/njcb/csv/csvlinux.py
    ②/njcb/count/countlinux.py
3.修改完之后
    执行①csvlinux.py 对应生成 ③datacount_days.sh
    执行②countlinux.py 对应生成 ④fxjl_days.sh
    ③④脚本在 host_user 变量指定目录下生成
4.配置定时任务，按顺序执行脚本 ③datacount_days.sh、④fxjl_days.sh 
    并且③和④脚本的执行间隔一小时(根据数据量大小调整时间)
```
```
windows 平台下执行countwindows.py脚本
linux 平台下执行countlinux.py脚本
```
环境要求
```
linux、window 服务环境下必须安装mongodb数据库、python3环境
```

配置修改
```
1.修改mongodb相关配置
mongo_path：mongodb 命令，环境变量所在的目录
mongo_db_host：mongodb 数据库连接
mongo_db_host1：mongodb 数据库连接（备份节点1，如果只有一个节点，将三个配置成一样）
mongo_db_host2：mongodb 数据库连接（备份节点2）
mongo_db_user：数据库用户名
mongo_db_password：数据库密码

2.修改python执行配置
python_path：python命令，环境变量所在的目录

3.修改服务器主目录
host_user：window下，任意目录即可。linux环境下，须指定home目录下用户的根目录，例如:root用户，则host_user=/home/root
```
定时任务配置
```
配置定时任务：入口 fxjl_days.sh 文件
将fxjl_days.sh 脚本配置成定时跑批任务
```

## 十一、员工信息同步
```
#!/bin/bash
export  JAVA_HOME=/root/ftp/jdk1.8.0_231
client_primary=/home/admin/www/upload/data_extracting/empsyn
client_backup=/home/admin/www/upload/data_extracting/empsyn/backup
for  i  in   $(ls     ${client_primary} | grep  .csv)
do
  count=$(java  -Desb.cfg.path=/root/ftp/TFTClient/config   -jar  /root/ftp/TFTClient/tftclient.jar   -h 1   -dup  -cf $client_primary/$i   -sf   $i)
  if  [ $count -eq  0 ] ; then
  mv  $client_primary/$i   $client_backup
  fi
done
```
