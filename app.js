const app = require('express')();
const server = require('http').Server(app);
const io = require('socket.io')(server);

const users = [];

server.listen(3000, () => {
    console.log('server is runing');
});
app.use(require('express').static('public'))

app.get('/', (req, res) => {
    res.redirect('/index.html')
});

io.on('connection', socket => {
    socket.on('login', data => {
        // 如果data在users中存在，说名用户已登陆
        let user = users.find(item => item.username === data.username)
        if (user) {
            socket.emit('loginError', {
                msg: '‘登陆失败',
            })
        } else {
            users.push(data);
            socket.emit('loginSuccess', data);
            io.emit('addUser', data)
            io.emit('userList', users)

            socket.username = data.username;
            socket.avatar = data.avatar;
        }
    });
    // 用户断开连接
    socket.on("disconnect", (reason) => {
        let idx = users.findIndex(item => item.username === socket.username)
        users.splice(idx, 1);
        io.emit('delUser', {
            username: socket.username,
            avatar: socket.avatar
        });
        io.emit('userList', users)
    });


    // 监听聊天
    socket.on('sendMessage',msg => {
        // 广播给所有用户
        io.emit('recieveMessage',msg)
    });

    socket.on('sendImage',msg => {
        // 广播给所有用户
        io.emit('recieveImage',msg)
    });
});

// 用户断开连接
// io.on('disconnect', () => {
//     console.log(1111)
//     let idx = users.findIndex(item => item.username === socket.username)
//     users.splice(idx, 1);
//     io.emit('delUser',{
//         username: socket.username,
//         avatar: socket.avatar
//     });
//     io.emit('userList',users)
// })