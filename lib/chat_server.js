var socketio = require('socket.io');
var io;
var guestNumber = 1;
var nickNames = {};
var nameUsed = [];
var currentRoom = {};

function assignGuestName(socket,guestNumber,nickNames,nameUsed) {
    var name='Guest'+guestNumber;
    nickNames[socket.id]=name;
    socket.emit('nameResult',{
       success:true,
       name:name
    });
    nameUsed.push(name);
    return guestNumber+1;
}

function joinRoom(socket,room) {
    socket.join(room);
    currentRoom[socket.id]=room;
    socket.emit('joinResult',{room:room});
    socket.broadcast.to(room).emit('message',{
        user:'',
        text:nickNames[socket.id]+' has joined '+room+'.'
    });

    var usersInRoom=io.sockets.clients(socket.room);
    var usersInRoomSummary;
    if(usersInRoom.length>1){
        usersInRoomSummary='Users currently in '+room+":";
        for(var index in usersInRoom){
            var userSocketId=usersInRoom[index].id;
            if(userSocketId !=socket.id){
                if(index>0){
                    usersInRoomSummary+=' ,';
                }
                usersInRoomSummary+=nickNames[userSocketId];
            }
        }
    }
    usersInRoomSummary+='.';
    socket.emit('message',{user:'',text:'有人加入了房间'});
}

function handleMessageBroadcasting(socket,nickNames) {
    socket.on('message',function (message) {
        socket.broadcast.to(message.room).emit('message',{
            user:nickNames[socket.id]+': ',
            text:message.text
        })
    })
}

function handleRoomJoining(socket) {
    socket.on('join',function (room) {
        socket.leave(currentRoom[socket.id]);
        joinRoom(socket,room.newRoom)
    })
}

function handleClientDisconnection(socket,nickNames,nameUsed) {
    socket.on('disconnect',function () {
        var nameIndex=nameUsed.indexOf(nickNames[socket.id]);
        delete nameUsed[nameIndex];
        delete nickNames[socket.id];
    })
}

exports.listen = function (server) {
    io = socketio.listen(server);
    //io.set('log level', 1);
    io.sockets.on('connection',function (socket) {
        guestNumber=assignGuestName(socket,guestNumber,nickNames,nameUsed);
        joinRoom(socket,'room1');

        handleMessageBroadcasting(socket,nickNames);
        //handleNameChangeAttempts(socket,nickNames,nameUsed);
        handleRoomJoining(socket);

        socket.on('rooms',function () {
            socket.emit('rooms',io.sockets.rooms);
        });

        handleClientDisconnection(socket,nickNames,nameUsed);
    })

};


