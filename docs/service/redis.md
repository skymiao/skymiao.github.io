# redis主备高可用

## 一、环境规划
| 软件  |  版本  |
| ------------ | ------------ |
| centos  | 7.9  |
| redis  | v5.0.8  |
| keepalived  | vv1.3.5  |

| ip  |  角色  |  组件  |
| ------------ | ------------ | ------------ |
| 192.168.40.121  | 主 | redis  keepalived  |
| 192.168.40.122  | 从 | redis  keepalived  |
| 192.168.40.199  |VIP |   |

网络拓扑图:
![](../images/fxgj-nanjingbank-redis2.png)

## 二、安装
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


## 三、redis配置文件
主节点
```
cat   >>   /opt/redis/etc/redis.conf  <<  EOF
daemonize yes
bind 0.0.0.0
port 6379
pidfile /opt/redis/redis.pid
dir /opt/redis/data/
logfile /opt/redis/logs/redis.log
dbfilename dump.rdb
requirepass 123.com
EOF
```

从节点
```
cat   >>   /opt/redis/etc/redis.conf  <<  EOF
daemonize yes
bind  0.0.0.0
port 6379
pidfile /opt/redis/redis.pid
dir /opt/redis/data/
logfile /opt/redis/logs/redis.log
dbfilename dump.rdb
# 绑定master的ip和port
replicaof  192.168.40.121  6379
# master的认证口令
masterauth  123.com
EOF
```

## 四、redis启动
```
/opt/redis/bin/redis-server      /opt/redis/etc/redis.conf   &
```

客户端连接
```
redis-cli   -h 192.168.40.121   -p  6379  -a 123.com
```

查看主从信息
```
192.168.40.121:6379> info replication
# Replication
role:master
connected_slaves:1
slave0:ip=192.168.40.122,port=6379,state=online,offset=2874,lag=1

```

```
192.168.40.122:6379> info replication
# Replication
role:slave
master_host:192.168.40.121
master_port:6379
master_link_status:up
master_last_io_seconds_ago:10
```

## 五、Keepalived
主配置文件
```
vrrp_script chk_redis {
    script "/etc/keepalived/scripts/redis_check.sh"
}

vrrp_instance VI_1 {
    state MASTER
    interface eth0
    virtual_router_id 168
    priority 100
    advert_int 1
    authentication {
        auth_type PASS
        auth_pass 1111
    }

    track_script {
        chk_redis
    }

    virtual_ipaddress {
        192.168.40.199
    }
     notify_master /etc/keepalived/scripts/redis_master.sh
     notify_fault  /etc/keepalived/scripts/redis_fault.sh
     notify_backup /etc/keepalived/scripts/redis_backup.sh
     notify_stop  /etc/keepalived/scripts/redis_stop.sh

}
```
从配置文件
```
vrrp_script chk_redis {
    script "/etc/keepalived/scripts/redis_check.sh"
}

vrrp_instance VI_1 {
    state BACKUP
    interface eth0
    virtual_router_id 168
    priority 90
    advert_int 1
    authentication {
        auth_type PASS
        auth_pass 1111
    }

    track_script {
        chk_redis
    }

    virtual_ipaddress {
        192.168.40.199
    }
     notify_master /etc/keepalived/scripts/redis_master.sh
     notify_backup /etc/keepalived/scripts/redis_backup.sh
     notify_fault  /etc/keepalived/scripts/redis_fault.sh
     notify_stop  /etc/keepalived/scripts/redis_stop.sh
}
```

## 六、脚本
创建脚本目录
```
mkdir  -p  /etc/keepalived/scripts
touch   /etc/keepalived/keepalived-redis-state.log
```
主节点脚本
cat /etc/keepalived/scripts/redis_master.sh
```
#!/bin/bash

REDISCLI="/opt/redis/bin/redis-cli -a 123.com"
LOGFILE="/etc/keepalived/keepalived-redis-state.log"

echo "[master]" >> $LOGFILE
date >> $LOGFILE
echo "Being master...." >> $LOGFILE 2>&1

echo "Run SLAVEOF cmd ..." >> $LOGFILE

$REDISCLI -p 6379  SLAVEOF 192.168.40.122 6379 >> $LOGFILE  2>&1
sleep 10 #延迟10秒以后待数据同步完成后再取消同步状态

echo "Run SLAVEOF NO ONE cmd ..." >> $LOGFILE
$REDISCLI -p 6379 SLAVEOF NO ONE >> $LOGFILE 2>&1
```

cat  /etc/keepalived/scripts/redis_backup.sh
```
#!/bin/bash

REDISCLI="/opt/redis/bin/redis-cli  -a 123.com"
LOGFILE="/etc/keepalived/keepalived-redis-state.log"

echo "[backup]" >> $LOGFILE
date >> $LOGFILE
echo "Being slave...." >> $LOGFILE 2>&1

sleep 15 #延迟15秒待数据被对方同步完成之后再切换主从角色
echo "Run SLAVEOF cmd ..." >> $LOGFILE
$REDISCLI -p 6379  SLAVEOF 192.168.40.122 6379 >> $LOGFILE  2>&1
```

cat /etc/keepalived/scripts/redis_fault.sh
```
#!/bin/bash

LOGFILE="/etc/keepalived/keepalived-redis-state.log"

echo "[fault]" >> $LOGFILE
date >> $LOGFILE
```

cat  /etc/keepalived/scripts/redis_stop.sh
```
#!/bin/bash

LOGFILE="/etc/keepalived/keepalived-redis-state.log"

echo "[stop]" >> $LOGFILE
date >> $LOGFILE
```
cat  /etc/keepalived/scripts/redis_check.sh
```
#!/bin/bash

ALIVE=$(/opt/redis/bin/redis-cli  -p 6379 -a 123.com  PING)
LOGFILE="/etc/keepalived/keepalived-redis-state.log"

if [ $ALIVE = "PONG" ];then
    echo $ALIVE
    exit 0
else
    echo "killall -9 keepalived"
    systemctl  stop keepalived
    exit 1
fi
```

```
chmod   +x  /etc/keepalived/scripts/*.sh
```

从节点脚本
cat /etc/keepalived/scripts/redis_master.sh
```
#!/bin/bash
REDISCLI="/opt/redis/bin/redis-cli  -a 123.com"
LOGFILE="/etc/keepalived/keepalived-redis-state.log"

echo "[master]" >> $LOGFILE
date >> $LOGFILE
echo "Being master...." >> $LOGFILE 2>&1

echo "Run SLAVEOF cmd ..." >> $LOGFILE
$REDISCLI -p 6379 SLAVEOF 192.168.40.121 6379>> $LOGFILE  2>&1
sleep 10 #延迟10秒以后待数据同步完成后再取消同步状态

echo "Run SLAVEOF NO ONE cmd ..." >> $LOGFILE
$REDISCLI -p 6380 SLAVEOF NO ONE >> $LOGFILE 2>&1
```

cat /etc/keepalived/scripts/redis_backup.sh
```
#!/bin/bash
REDISCLI="/opt/redis/bin/redis-cli -a 123.com "
LOGFILE="/etc/keepalived/keepalived-redis-state.log"

echo "[backup]" >> $LOGFILE
date >> $LOGFILE
echo "Being slave...." >> $LOGFILE 2>&1

sleep 15 #延迟15秒待数据被对方同步完成之后再切换主从角色
echo "Run SLAVEOF cmd ..." >> $LOGFILE
$REDISCLI -p 6379  SLAVEOF 192.168.40.121 6379 >> $LOGFILE  2>&1
```

cat  /etc/keepalived/scripts/redis_fault.sh
```
#!/bin/bash

LOGFILE="/etc/keepalived/keepalived-redis-state.log"

echo "[fault]" >> $LOGFILE
date >> $LOGFILE
```

cat  /etc/keepalived/scripts/redis_stop.sh
```
#!/bin/bash

LOGFILE="/etc/keepalived/keepalived-redis-state.log"

echo "[stop]" >> $LOGFILE
date >> $LOGFILE
```

cat  /etc/keepalived/scripts/redis_check.sh
```
#!/bin/bash

ALIVE=$(/opt/redis/bin/redis-cli -p 6379   -a 123.com  PING)

LOGFILE="/etc/keepalived/keepalived-redis-state.log"

if [ $ALIVE = "PONG" ];then
        echo $ALIVE
        exit 0
else
        echo "killall -9 keepalived"
        systemctl stop keepalived
        exit 1
fi
```

```
chmod   +x  /etc/keepalived/scripts/*.sh
```
