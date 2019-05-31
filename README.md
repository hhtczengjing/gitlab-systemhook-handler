### gitlab-systemhook-handler

> GitLab System Hooks Handler: gitlab system hooks解析

### Usage

#### (1) 安装

```
npm install gitlab-systemhook-handler --save
```

#### (2) 使用

```
var http = require('http')
var createHandler = require('gitlab-systemhook-handler')
var handler = createHandler({ path: '/webhook', secret: '123456' })
 
http.createServer(function (req, res) {
  handler(req, res, function (err) {
    res.statusCode = 404
    res.end('no such location')
  })
}).listen(7777)
 
console.log("Gitlab Hook Server running at http://0.0.0.0:7777/webhook");

//错误信息
handler.on('error', function (err) {
    console.error('Error:', err.message)
})

//监听指定的事件
handler.on('push', function (event) {
    console.log('Received a push event for %s : %s to %s',
    event.payload.user_name,
    event.payload.repository.name,
    event.payload.ref)
})

//监听全部的事件
handler.on('*', function (event) {
    console.log(event.payload)
})
```

支持的Event：

- project_create
- project_destroy
- project_rename
- project_transfer
- user_add_to_team
- user_remove_from_team
- user_create
- user_destroy
- key_create
- key_destroy
- group_create
- group_destroy
- user_add_to_group 
- user_remove_from_group
- tag_push