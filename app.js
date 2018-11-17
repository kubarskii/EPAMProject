const http = require('http');
const WebSocketServer = new require('ws');
const fs = require('fs');
const express = require('express');
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const jwt = require('jsonwebtoken');

const dbUrl = 'mongodb://localhost:27017';
const dbName = 'cutter';

// Create a new MongoClient
const client = new MongoClient(dbUrl);
let db;
// Use connect method to connect to the Server
const privateKEY = fs.readFileSync('./private.key', 'utf8'); // to sign JWT
const publicKEY = fs.readFileSync('./public.key', 'utf8'); 	// to verify JWT

let payload = {
    data1: "Data 1",
    data2: "Data 2",
    data3: "Data 3",
};
/*console.log("\n\n");*/

const signOptions = {
    expiresIn: "12h",
    algorithm: "RS256" 			// RSASSA options[ "RS256", "RS384", "RS512" ]
};
var token = jwt.sign(payload, privateKEY, signOptions);
console.log("Token :" + token);

const verifyOptions = {
    expiresIn: "12h",
    algorithm: ["RS256"]
};

let legit = jwt.verify(token, publicKEY, verifyOptions);
/*
console.log("\nJWT verification result: " + JSON.stringify(legit));
*/

let decoded = jwt.decode(token, {complete: true});
/*console.log("\nDecoded jwt: " + JSON.stringify(decoded));
console.log("\n");
console.log(token);
console.log("\n\n");*/

const TemplateEngine = function (html, options) {
    let re = /<%([^%>]+)?%>/g, reExp = /(^( )?(if|for|else|switch|case|break|{|}))(.*)?/g, code = 'var r=[];\n',
        cursor = 0, match;
    const add = function (line, js) {
        js ? (code += line.match(reExp) ? line + '\n' : 'r.push(' + line + ');\n') :
            (code += line != '' ? 'r.push("' + line.replace(/"/g, '\\"') + '");\n' : '');
        return add;
    };
    while (match = re.exec(html)) {
        add(html.slice(cursor, match.index))(match[1], true);
        cursor = match.index + match[0].length;
    }
    add(html.substr(cursor, html.length - cursor));
    code += 'return r.join("");';
    return new Function(code.replace(/[\r\t\n]/g, '')).apply(options);
};

client.connect(function (err) {
    assert.equal(null, err);
    console.log("Connected successfully to server");
    db = client.db(dbName);

    //client.close();
});
///////
let clients = {};
const app = express();
app.use(express.static(__dirname));
const webSocketServer = new WebSocketServer.Server({port: 8081});

webSocketServer.on('connection', function (ws) {

    let id = Math.random();

    clients[id] = ws;
    console.log("новое соединение " + id);

    function sendToClient(message) {
        clients[id].send(message);
        //for (var key in clients) {
        //clients[key].send(message);
        //}
    }

    let message = {};

    ws.on('message', function (message) {
            //console.log('получено сообщение ' + message, JSON.parse(message));
            message = JSON.parse(message);
            if (message.type !== 'route') {
                if (message.type === 'service') {
                    let query = (message.data.master === undefined || '' || null) ?
                        [
                            {
                                $lookup: {
                                    from: "orders",
                                    localField: "name_id",
                                    foreignField: "master_id",
                                    as: "mas"
                                }
                            },
                            {
                                $unwind: {
                                    path: "$mas",
                                    preserveNullAndEmptyArrays: true
                                }
                            },
                            {
                                $match: {
                                    "mas.date": {$ne: new Date(message.data.time)}
                                }
                            },
                            {
                                $lookup: {
                                    from: "services",
                                    localField: "name_id",
                                    foreignField: "masters",
                                    as: "final"
                                }
                            },
                            {
                                $unwind: {
                                    path: "$final",
                                    preserveNullAndEmptyArrays: true
                                }
                            },
                            {
                                $project: {
                                    "service": "$final.name",
                                    service_id: "$final.service_id"
                                }
                            },
                            {
                                $group: {
                                    _id: "$service",
                                    service_id: {$first: "$service_id"}
                                }
                            }
                        ] : [
                            {
                                $lookup: {
                                    from: "services",
                                    localField: "name_id",
                                    foreignField: "masters",
                                    as: "final"
                                }
                            },
                            {
                                $unwind: {
                                    path: "$final",
                                    preserveNullAndEmptyArrays: true
                                }
                            },
                            {
                                $match: {
                                    "name": message.data.master.split(' ')[0],
                                    "surname": message.data.master.split(' ')[1]
                                }
                            },
                            {
                                $project: {
                                    service: "$final.name",
                                    service_id: "$final.service_id"
                                }
                            },
                            {
                                $group: {
                                    _id: "$service",
                                    service_id: {$first: "$service_id"}
                                }
                            }
                        ];
                    db.collection('masters').aggregate(query).toArray((err, result) => {
                        if (err) throw err;
                        sendToClient(JSON.stringify({type: "service", data: result}));
                    });
                }
                else if (message.type === 'master') {
                    //console.log(message.data.service);
                    let query = [
                        {
                            $lookup: {
                                from: "orders",
                                localField: "name_id",
                                foreignField: "master_id",
                                as: "mas"
                            }
                        },
                        {
                            $unwind: {
                                path: "$mas",
                                preserveNullAndEmptyArrays: true
                            }
                        },
                        {
                            $group: {
                                _id: "$name_id",
                                name: {$first: "$name"},
                                name_id: {$first: "$name_id"},
                                surname: {$first: "$surname"},
                                date: {$push: {date: "$mas.date"}}
                            }
                        },
                        {
                            $unwind: {
                                path: "$date"
                            }
                        }

                    ];
                    if (message.data.time !== undefined) {
                        query.push({
                            $match: {
                                'date.date': {$ne: new Date(message.data.time)}
                            }
                        });
                    }
                    query.push(
                        {
                            $lookup: {
                                from: "services",
                                localField: "_id",
                                foreignField: "masters",
                                as: "ser"
                            }
                        },
                        {
                            $unwind: {
                                path: "$ser",
                                preserveNullAndEmptyArrays: true
                            }
                        },
                        {
                            $project: {
                                name: "$name",
                                name_id: "$name_id",
                                mas_id: "$name_id",
                                surname: "$surname",
                                service: "$ser.name",
                                ser_id: "$ser.service_id"
                            }
                        },
                        {
                            $group: {
                                _id: "$_id",
                                name: {$first: "$name"},
                                name_id: {$first: "$name_id"},
                                mas_id: {$first: "$mas_id"},
                                surname: {$first: "$surname"},
                                service: {$first: "$service"},
                                service_id: {$first: "$ser_id"}
                            }
                        }
                    );
                    if ((message.data.service !== undefined)) {
                        query.push({
                            $match: {
                                'service': {$eq: message.data.service}
                            }
                        });
                    } else if (message.data.time === undefined) {
                        query = [];
                    }
                    //console.log(query);
                    db.collection('masters').aggregate(query).toArray((err, result) => {
                        if (err) throw err;
                        sendToClient(JSON.stringify({type: "master", data: result}));
                        console.log(result);
                    });
                } else if (message.type === 'time') {
                    let query = [
                        {
                            $lookup: {
                                from: "orders",
                                localField: "time",
                                foreignField: "hour",
                                as: "order"
                            }
                        },
                        {
                            $unwind: {
                                path: "$order",
                                preserveNullAndEmptyArrays: true
                            }
                        },
                        {
                            $lookup: {
                                from: "masters",
                                localField: "order.master_id",
                                foreignField: "name_id",
                                as: "mas"
                            }
                        },

                        {
                            $unwind: {
                                path: "$mas",
                                preserveNullAndEmptyArrays: true
                            }
                        },
                        {
                            $project: {
                                timeEq: {$eq: ['$minutes', '$order.minutes']},
                                time: "$time",
                                minutes: "$minutes",
                                order: "$order",
                                mas: "$mas",

                            }
                        },
                        {
                            $lookup: {
                                from: "services",
                                localField: "order.service_id",
                                foreignField: "service_id",
                                as: "service"
                            }
                        },
                        {
                            $unwind: {
                                path: "$service",
                                preserveNullAndEmptyArrays: true
                            }
                        },
                        {
                            $match: {
                                timeEq: {$eq: true}
                            }
                        },
                        {
                            $project: {
                                time: "$time",
                                minutes: "$minutes",
                                year: {$year: "$order.date"},
                                month: {$month: "$order.date"},
                                day: {$dayOfMonth: "$order.date"},
                                name: "$mas.name",
                                surname: "$mas.surname",
                                service: "$service.name",
                            }
                        },
                        {
                            $match: {
                                year: {$eq: message.data.year},
                                month: {$eq: message.data.month},
                                day: {$eq: message.data.day}

                            }
                        }
                    ];
                    if (message.data.master !== undefined) {
                        query.push({
                            $match: {
                                $and: [
                                    {name: {$eq: message.data.master.split(' ')[0]}},
                                    {surname: {$eq: message.data.master.split(' ')[1]}}
                                ]
                            }
                        });
                    }

                    db.collection('time').aggregate(query).toArray((err, result) => {
                        if (err) throw err;
                        if (((message.data.service === undefined) && (message.data.master === undefined)) ||
                            ((message.data.service !== undefined) && (message.data.master === undefined))) {
                            result = [];
                        }
                        let usedTime = [];
                        for (let order in result) {
                            usedTime.push([result[order].time, result[order].minutes]);
                        }
                        db.collection('time').aggregate([
                            {
                                $project: {
                                    time: ["$time", "$minutes"]
                                }
                            },
                            {
                                $match: {
                                    time: {$nin: usedTime}
                                }
                            }
                        ]).toArray((err, res) => {
                            if (err) throw err;

                            sendToClient(JSON.stringify({type: "time", data: res}));
                        });
                    });


                } else if (message.type === 'register') {
                    let login = message.data.login;
                    let pass = message.data.pass;
                    let email = message.data.email;
                    let phone = message.data.phone;
                    db.collection('users').insert({
                        login: login,
                        password: pass,
                        email: email,
                        phone: phone
                    });
                    sendToClient(JSON.stringify({
                        type: "register",
                        data: {
                            message: "Регистрация завершена",
                            userData: ""
                        }
                    }));
                } else if (message.type === 'create_order') {
                    console.log(message);
                    let master = message.data.master;
                    let master_id = message.data.master_id;
                    let service = message.data.service;
                    let service_id = message.data.service_id;
                    let time = message.data.time;
                    let token = message.data.token;
                    let phone, email;
                    console.log(message);
                    console.log("\nTOKEN:",token,'\n');
                    if ((token != null) || (token != undefined)) {
                        console.log("\nTOKEN:",token,'\n');
                        let decoded = jwt.decode(token, {complete: true});
                        phone = decoded.payload.data.phone;
                        email = decoded.payload.data.email;
                    } else {
                        phone = message.data.phone;
                    }

                    db.collection('orders').insertOne({
                        master: master,
                        service: service,
                        time: new Date(time),
                        phone: phone,
                        email: email,
                        service_id: service_id,
                        master_id: master_id,
                        hour: new Date(time).getHours(),
                        minutes: new Date(time).getMinutes()
                    });
                    sendToClient(JSON.stringify({
                        type: "order_creation",
                        data: {
                            message: "Заказ сделан",
                            userData: ""
                        }
                    }));
                    sendToClient(JSON.stringify({
                        type: "view",
                        data: `${(getView('index'))}`
                    }));

                } else if (message.type === 'login') {
                    db.collection('users').find({
                        login: message.data.login,
                        password: message.data.pass
                    }, {_id: 1}).limit(1).toArray((err, res) => {
                        if (err) throw err;
                        if ((res[0]) !== undefined) {
                            console.log(res);
                            payload.data = res[0];
                            let token = jwt.sign(payload, privateKEY, signOptions);
                            sendToClient(JSON.stringify({
                                type: "login", data: {
                                    token: token,
                                    name: res[0].login,
                                }
                            }));
                            sendToClient(JSON.stringify({
                                "type": "view", "data": `${(getView("account", res))}`
                            }));
                        }

                    });
                }
            } else {
                let path = (message.data.path === '/') ? 'index' : message.data.path;
                let token = message.data.token;
                if ((token !== null) && (path === "/login")) {
                    let decoded = jwt.decode(token, {complete: true});
                    console.log(decoded, '\n', token);
                    console.log('DB:', db, '\n');

                    function getUser() {
                        if (db !== undefined) {
                            db.collection('users').find({
                                login: decoded.payload.data.login,
                                password: decoded.payload.data.password
                            }, {_id: 1}).limit(1).toArray((err, res) => {
                                if (err) throw err;

                                if ((res[0]) !== undefined) {
                                    path = "account";
                                }
                                console.log(path);
                                sendToClient(JSON.stringify({
                                    type: "view",
                                    data: `${(getView(path, res))}`
                                }));
                            });

                        } else {
                            setTimeout(() => {
                                getUser()
                            }, 100);
                        }

                    }

                    getUser();
                } else {
                    sendToClient(JSON.stringify({type: "view", "data": `${(getView(path))}`}));
                }
            }
        }
    );

    ws.on('close', function () {
        console.log('соединение закрыто ' + id);
        delete clients[id];
    });
});

function readJSON(type) {
    let data = fs.readFileSync(`${type}.json`);
    return (JSON.parse(data));
}

function getView(data, res = '') {

    try {
        let view = require(`${__dirname}/views/${data}.js`);
        console.log(`${__dirname}/views/${data}.js`);
        let layout = view.view;
        console.log(res);
        if (data === 'account') {
            let data = {
                login: res[0].login,
                phone: res[0].phone,
                photo: res[0].photo,
                email: res[0].email
            };
            return TemplateEngine(layout, data);
        } else {
            return layout;
        }


    } catch (e) {
        console.log('File not found');
        let view = require(`${__dirname}/views/404.js`);
        return view.view;
    }

}

app.get('*', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});
app.listen(8080, function () {

});
console.log("Сервер запущен на портах 8080, 8081");

