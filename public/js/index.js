var socket = io('http://localhost:3000');
var username, avatar;

// 登录功能
$('#login_avatar li').on('click', function () {
    $(this)
        .addClass('now')
        .siblings()
        .removeClass('now')
})

// 点击按钮登陆

$('#loginBtn').on('click', function () {
    var username = $('#username').val().trim();
    if (!username) {
        return alert('请填写用户名')
    };
    var avatar = $('#login_avatar li.now img').attr('src');


    // 告诉告诉socket.io 服务， 登陆
    socket.emit('login', {
        username,
        avatar
    })


});

// 监听登陆失败
socket.on('loginErrpr', function (msg) {
    alert('登陆失败')
})

// 监听登陆成功
socket.on('loginSuccess', function (msg) {
    $('.login_box').fadeOut();
    $('.container').fadeIn();


    // 设置个人信息 

    $(".avatar_url").attr('src', msg.avatar);
    $('.username').text(msg.username);
    username = msg.username;
    avatar = msg.avatar;
})


// 监听添加用户

socket.on('addUser', function (msg) {
    $('.box-bd').append(`
    <div class="system">
    <p class="message_system">
      <span class="content">${msg.username}加入了群聊</span>
    </p>
  </div>
    `);
    scrillIntoView()
})


// 用户列表
socket.on('userList', function (data) {
    $('#user-list-ul').html('')
    data.map(item => {
        $('#user-list-ul').append(`
        <li class="user">
        <div class="avatar"><img src="${item.avatar}" alt/></div>
        <div class="name">${item.username}</div>
        <li>
        `)
    })
    $('.user-length').text(`聊天室(${data.length}人)`)
})


// 监听用户离开

socket.on('delUser', function (msg) {
    $('.box-bd').append(`
    <div class="system">
    <p class="message_system">
      <span class="content">${msg.username}离开了群聊</span>
    </p>
  </div>
    `);
    scrillIntoView()

});

$('.btn-send').on('click', function () {
    var content = $('#content')
        .html()
        .trim();
    socket.emit('sendMessage', {
        msg: content,
        username,
        avatar,
    });
    $('#content').html('');
})


// 聊天

socket.on('recieveMessage', data => {
    if (data.username === username) {
        $('.box-bd').append(`
        <div class="message-box">
        <div class="my message">
          <img class="avatar" src=${data.avatar} alt="" />
          <div class="content">
            <div class="bubble">

              <div class="bubble_cont">${data.msg}</div>
            </div>
          </div>
        </div>
      </div>`)
    } else {
        $('.box-bd').append(`
<div class="message-box">
    <div class="other message">
  <img class="avatar" src=${data.avatar} alt="" />
  <div class="content">
    <div class="nickname">${data.username}</div>
    <div class="bubble">
      <div class="bubble_cont">${data.msg}</div>
    </div>
  </div>
</div>
</div> `)
    };
    scrillIntoView()
})


function scrillIntoView() {
    // 将元素底部滚动到可视区
    $('.box-bd')
        .children(':last')
        .get(0)
        .scrollIntoView(false)
}


// 发送图片
$('#file').on('change', function () {
    var file = this.files[0];
    var fr = new FileReader();
    fr.readAsDataURL(file);
    fr.onload = function () {
        socket.emit('sendImage', {
            username,
            avatar,
            img: fr.result,
        })
    }
});


// 监听图片聊天

socket.on('recieveImage', data => {
    if (data.username === username) {
        $('.box-bd').append(`
        <div class="message-box">
        <div class="my message">
          <img class="avatar" src=${data.avatar} alt="" />
          <div class="content">
            <div class="bubble">

              <div class="bubble_cont">
              <img src="${data.img}"</div>
              </div>
            </div>
          </div>
        </div>
      </div>`)
    } else {
        $('.box-bd').append(`
<div class="message-box">
    <div class="other message">
  <img class="avatar" src=${data.avatar} alt="" />
  <div class="content">
    <div class="nickname">${data.username}</div>
    <div class="bubble">
      <div class="bubble_cont">
      <img src="${data.img}"</div>
      </div>
    </div>
  </div>
</div>
</div> `)
    };
    $('.box-bd img:last').on('load', function () {
        scrillIntoView()
    })
})

// 初始化jquery-emoji
$('.face').on('click',function() {
    $('#content').emoji({
        button: '.face',
        showTab: false,
        animation: 'slide',
        position: 'topLeft',
        icons: [
            {
                name: 'QQ表情',
                path: '../lib/jquery-emoji/img/qq/',
                maxNum: 91,
                excludeNums: [41,45,54],
                file: '.gif'
            }
        ]
    })
})