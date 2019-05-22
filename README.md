# binary-server
二进制文件服务器 （辅助组件二进制化）

## 环境配置

- 安装 node
- 安装 MongoDB
- 启动 MongoDB
  -  brew services start mongodb

## 运行
- npm install
- npm start

## 路由

```node
.get('/frameworks', frameworks.show)
.get('/frameworks/:names', frameworks.show)
.get('/frameworks/:name/:version', frameworks.show)
.del('/frameworks/:name/:version', frameworks.destroy)
.get('/frameworks/:name/:version/zip', frameworks.download)
.post('/frameworks', frameworks.create)
```

以下说明以 `http://localhost:8080` 为服务器地址，操作 PodA 组件。

获取组件信息：

```
curl http://localhost:8080/frameworks/PodA
> {"PodA":["0.2.4"]}

curl http://localhost:8080/frameworks
> {"TDFCoreProtocol":["1.2.4","1.2.5"],"PodA":["0.2.4-binary","0.2.4"]}
```

推送组件 zip 包：

```
curl http://localhost:8080/frameworks -F "name=PodA" -F "version=0.2.4" -F
  "annotate=Mergebranch'release/0.2.3'into'master'" -F
  "file=@/Users/songruiwang/Work/TDF/cocoapods-tdfire-binary/example/PodA/PodA.framework.zip"
  -F "sha=7bf2c8f3ce1184580abfea7129d1648e499d080e"
> 保存成功 PodA (0.2.4)
```

zip 包存储在 server 根目录的 `.binary` 目录下

获取组件 zip 包：

```
curl http://localhost:8080/frameworks/PodA/0.2.4/zip > PodA.framework.zip
```

删除组件：

```
curl -X 'DELETE' http://localhost:8080/frameworks/PodA/0.2.4 -O -J
```
