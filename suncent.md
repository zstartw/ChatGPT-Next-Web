
## 打包docker 镜像文件 


docker build -t suncent-chat:ai -f ./Dockerfile .



## 导出镜像文件

```
docker save -o suncent-chat.tar suncent-chat:ai
```


## 查看当前镜像文件

```
docker images
```

## docker导镜像文件

```
docker load -i suncent-chat.tar
```