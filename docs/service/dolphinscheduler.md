# 定时任务调度平台

先安装 docker-compose , docker-compose 的安装请参考SIT环境安装[Docker容器管理](/service/sit.html)章节

## 一、导入镜像
```
docker load < dolphinscheduler.tar

注：安装软件包已经提供同名镜像压缩包

导入完成后,执行docker images 确认镜像导入成功，如下图示例

REPOSITORY                TAG        IMAGE ID       CREATED         SIZE
bitnami/zookeeper         latest     50e37f589df3   8 weeks ago     466MB
apache/dolphinscheduler   latest     843e3e74b8df   2 months ago    692MB
bitnami/postgresql        latest     c6e34729e2db   2 months ago    253MB
```

## 二、下载源码 zip 包
```
请下载最新版本的源码包并进行解压
# 创建源码存放目录
mkdir -p /opt/soft/dolphinscheduler;
cd /opt/soft/dolphinscheduler;

# 通过wget下载源码包
wget https://mirrors.tuna.tsinghua.edu.cn/apache/incubator/dolphinscheduler/1.3.5/apache-dolphinscheduler-incubating-1.3.5-src.zip

# 通过curl下载源码包
curl -O https://mirrors.tuna.tsinghua.edu.cn/apache/incubator/dolphinscheduler/1.3.5/apache-dolphinscheduler-incubating-1.3.5-src.zip

注：安装软件包已经提供同名软件压缩包

# 解压缩
unzip apache-dolphinscheduler-incubating-1.3.5-src.zip

mv apache-dolphinscheduler-incubating-1.3.5-src-release dolphinscheduler-src
```

## 三、安装并启动服务
```
cd dolphinscheduler-src/docker/docker-swarm
docker-compose up -d
```
## 四、登录系统
访问前端页面： http://192.168.xx.xx:12345/dolphinscheduler

默认的用户是admin，默认的密码是dolphinscheduler123

## 五、用户操作手册
[用户操作手册](https://dolphinscheduler.apache.org/zh-cn/docs/latest/user_doc/quick-start.html?_blank)
