所有操作均在root用下进行操作

确认docker服务目录
```
docker info
```
找到Docker Root Dir项目，目录是否为/var/lib/docker

## 一、docker服务默认目录调整
1、停止docker服务
```
 systemctl stop docker
``` 
2、拷贝原docker容器目录文件到新挂载磁盘目录
```
 cp -a /var/lib/docker /data/docker(自定义目录)
```
3、修改配置文件
```
vim /etc/docker/daemon.json 没有可以创建
{
   "data-root": "/data/docker"
}
```    
4、重新启动docker
```
systemctl daemon-reload
systemctl restart docker
``` 
5、验证目录
```
docker info
找到Docker Root Dir项目确认目录修改成功
```     
## 二、docker服务配置优化
1、新增日志配置
```
vim /etc/docker/daemon.json
{
   "log-driver": "json-file",
   "log-level": "warn",
   "log-opts": {
      "max-size": "2G",
      "max-file": "3"
   }
}
``` 
2、重新启动docker
```
systemctl daemon-reload
systemctl restart docker
```

## 三、docker服务最终配置
```
vim /etc/docker/daemon.json
{
    "max-concurrent-downloads": 10,
    "log-driver": "json-file",
    "log-level": "warn",
    "log-opts": {
      "max-size": "10m",
      "max-file": "3"
     },
    "data-root": "/data/docker"
}
```
