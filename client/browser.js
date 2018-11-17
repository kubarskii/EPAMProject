if (!window.WebSocket) {
    document.body.innerHTML = 'WebSocket в этом браузере не поддерживается.';
}

let onNavItemClick;
let wsstatus = false;
let socket;
const WSData = function (type, data) {
    this.data = data;
    this.type = type;
};
WSData.prototype.prepareToSend = function () {
    return JSON.stringify({type: this.type, data: this.data})
};

function changeButtonName() {
    if (localStorage.getItem('token') != undefined) {
        document.querySelector('a[data="login-button"]').innerText = 'Личный кабинет';
    } else {
        document.querySelector('a[data="login-button"]').innerText = 'Вход';
    }
}

function connect(adress = "ws://localhost:8081") {
    socket = new ReconnectingWebSocket(adress);
    socket.timeoutInterval = 5000;
}


window.onpopstate = (e) => {
    onNavItemClick(window.location.pathname);
    changeButtonName();
};

window.onload = function () {
    changeButtonName();
    connect();
    socket.onopen = function () {
        wsstatus = true;
        onNavItemClick(window.location.pathname);
    };
    let time;
    onNavItemClick = function (pathName) {
        day = undefined;
        order_time = undefined;
        month=undefined;
        master= undefined;
        service = undefined;
        changeButtonName();
        window.history.pushState({}, pathName, window.location.origin + pathName);
        setTimeout(() => {
            if (wsstatus === true) {
                socket.send(JSON.stringify({
                    'type': 'route', 'data': {
                        path: pathName,
                        token: localStorage.getItem('token')
                    }
                }));
            }
        }, 50);
    };

    let contentDiv = document.querySelector('div[data-type="content"]');

    let day;
    let year = new Date().getFullYear();
    let order_time;
    let month;
    let master, service, ser_id, mas_id;
    const button = document.querySelector('div[data-type="content"]').addEventListener('click', function (e) {
        const target = e.target;
        if (Object.values(target.classList).indexOf('day') !== -1) {
            day = parseInt(((target.parentNode.parentNode.parentNode.getAttribute('data-type') === 'calendar')
                && (!isNaN(parseInt(target.innerText)))) ? target.innerText : 0);
            console.log(day);
            if (day !== 0) {
                socket.send(JSON.stringify({
                    type: "time", data: {
                        year: year,
                        month: month,
                        day: day,
                        service: service,
                        master: master
                    }
                }));
            }
            order_time = undefined;
        }

        if (target.classList[0] === 'service_p') {
            service = target.innerText;
            ser_id = target.getAttribute('data-id');
        }

        if ((target.getAttribute('data') === 'service') &&
            ((year === undefined) ||
                (month === undefined) ||
                (day === undefined) ||
                (order_time === undefined)) &&
            (master === undefined)
        ) {
            //service = target.innerText;
            socket.send(JSON.stringify({
                type: "service", data: {
                    time: null,
                    service: ""
                }
            }));
        } else if ((target.getAttribute('data') === 'service') &&
            ((year === undefined) ||
                (month === undefined) ||
                (day === undefined) ||
                (order_time === undefined)) &&
            (master !== undefined)) {
            socket.send(JSON.stringify({
                type: "service", data: {
                    time: null,
                    master: master
                }
            }));
        } else if ((target.getAttribute('data') === 'service') && (year !== undefined) &&
            (month !== undefined) &&
            (day !== undefined) &&
            (order_time !== undefined)) {
            socket.send(JSON.stringify({
                type: "service", data: {
                    time: new Date(year,month,day,order_time.split(':')[0],order_time.split(':')[1]),
                    service: null
                }
            }));
        }

        if (Object.values(target.classList).indexOf('time_point') !== -1) {
            order_time = target.innerText;
            console.log(year, month, day, order_time);
            if ((year !== undefined) &&
                (month !== undefined) &&
                (day !== undefined) &&
                (order_time !== undefined)) {

                document.querySelector('div[data-type="chosen-time"]').innerText = new Date(year,month,day,order_time.split(':')[0],order_time.split(':')[1]);
                console.log(new Date(year,month,day,order_time.split(':')[0],order_time.split(':')[1]));
            }
            // showList('', 'div[data-content="master"]');
        }

        if (target.getAttribute('data-content') === "by-master") {
            console.log('by-master');
            if (((year === undefined) ||
                (month === undefined) ||
                (day === undefined) ||
                (order_time === undefined))) {
                console.log(3);
                socket.send(JSON.stringify({
                    type: "master", data: {
                        time: undefined,
                        service: service
                    }
                }));
            } else if ((year !== undefined) &&
                (month !== undefined) &&
                (day !== undefined) &&
                (order_time !== undefined)) {
                console.log(2);
                socket.send(JSON.stringify({
                    type: "master", data: {
                        time: new Date(year,month,day,order_time.split(':')[0],order_time.split(':')[1]),
                        service: service
                    }
                }));
            } else if (
                ((month !== undefined) ||
                    (day !== undefined) ||
                    (order_time !== undefined)) &&
                (master === undefined)) {
                console.log(1);
                socket.send(JSON.stringify({
                    type: "master", data: {
                        service: service
                    }
                }));
            } else {

            }

        }
        if (target.classList[0] === 'master_n') {
            master = target.innerText;
            mas_id = target.getAttribute('data-id');
            console.log(mas_id);
        }
        if (target.getAttribute('data-type') === "register") {
            let login = document.querySelector('input[data-content="login"]').value;
            let pass = document.querySelector('input[data-content="password"]').value;
            let email = document.querySelector('input[data-content="email"]').value;
            let phone = document.querySelector('input[data-content="phone"]').value;
            console.log(login, pass, email, phone);
            socket.send(JSON.stringify({
                type: "register", data: {
                    "login": login,
                    "pass": pass,
                    "email": email,
                    "phone": phone,
                }
            }));
        }
        if (target.getAttribute('data-type') === "login") {
            let login = document.querySelector('input[data-content="login_l"]').value;
            let pass = document.querySelector('input[data-content="password_l"]').value;
            socket.send(JSON.stringify({
                type: "login", data: {
                    "login": login,
                    "pass": pass,
                }
            }));
        }

        if (target.getAttribute('data-type') === "make_order") {
            let phone;
            console.log(year, service, day, order_time);
            if (localStorage.getItem('token') === null) {
                phone = prompt('Введите номер телефона!');
            }
            if ((year !== undefined) &&
                (month !== undefined) &&
                (day !== undefined) &&
                (order_time !== undefined) &&
                (service !== undefined)) {

                socket.send(JSON.stringify({
                    type: "create_order",
                    data: {
                        service: service,
                        service_id: ser_id,
                        time: new Date(year,month,day,order_time.split(':')[0],order_time.split(':')[1]),
                        master: master,
                        master_id: mas_id,
                        token: ((localStorage.getItem('token') !== undefined) ? localStorage.getItem('token') : ''),
                        phone: phone
                    }
                }));
            }
        }

        if (target.getAttribute('data-type') === "exit") {
            localStorage.clear();
            changeButtonName();
        }

        if (target.getAttribute('data-type') === "delete-time") {
            month = undefined;
            day = undefined;
            order_time = undefined;
            showList('', 'div[data-type="time"]');
            showList('', 'div[data-type="calendar"]');
            showList('', 'div[data-type="chosen-time"]');
        }
        if (target.getAttribute('data-type') === "delete-master") {
            showList('', 'div[data-content="master"]');
            master = undefined;
        }
        if (target.getAttribute('data-type') === "delete-service") {
            showList('', 'div[data-content="service"]');
            service = undefined;
        }

    });

    const orderFORM = document.querySelector('div[data-type="content"]').addEventListener('change', (e) => {
        month = parseInt(e.target.value);
        createCalendar("calendar", (new Date()).getFullYear(), month);
        order_time = undefined;
        document.querySelector('div[data-type="chosen-time"]').innerText = '';
    });
    socket.onmessage = function processMessage(event) {
        let message = JSON.parse(event.data);
        console.log(message);
        let wsdata = new WSData(message.type, message.data);
        switch (message.type) {
            case ("time"):
                showList((function () {
                    let Dom = [];
                    for (time in message.data) {
                        Dom.push(message.data[time].time.join((message.data[time].time[1] === 0) ? ":0" : ":"));
                    }
                    console.log(message.data[0].time);
                    return Dom;
                })(message.data), 'div[data-type="time"]');
                break;
            case ("service"):
                showService(message.data, 'div[data-content="service"]');
                break;
            case ("master"):
                console.log(message.data);
                showMaster(message.data, 'div[data-content="master"]');
                break;
            case ("master_all"):
                console.log(message.data);
                showMaster(message.data, 'div[data-content="master"]');
                break;
            case ("view"):
                renderHTML(message.data);
                break;
            case ("register"):
                renderHTML(message.data);
                break;
            case ("login"):
                localStorage.setItem('token', message.data.token);
                break;
            case ("register"):
                alert(message.data.message);
                break;
            case ("order_creation"):
                alert(message.data.message);
                break;
            default:
                break;
        }

    };


    ///////////Сделать 1 функцию/////////////////////
    function showService(data, element) {
        let content = document.querySelector(element);
        console.log(data, 'Показываем сервисы');
        let toDOM = ``;
        for (let ser in data) {
            toDOM += `<div class = 'col-sm-12-flex' ><div class="service_p" data-id="${data[ser].service_id}">${data[ser]._id}</div></div>`;
        }
        content.innerHTML = toDOM;
    }

    function showMaster(data, element) {
        let content = document.querySelector(element);
        let toDOM = ``;
        for (let master in data) {

            toDOM += `<div class = 'col-sm-12-flex cursor '>
                        <div class="master_n"  data-id="${data[master].name_id}">${data[master].name} ${data[master].surname}
                        </div>
                    </div>`;

        }
        content.innerHTML = toDOM;
    }

    function showList(data, element, className = '') {
        let content = document.querySelector(element);
        if (typeof data !== 'string') {
            let toDOM = '';
            for (let val of data) {
                toDOM += `<div class ='col-sm-2-flex'><div class="time_point">${val}</div></div>`;
            }
            content.innerHTML = toDOM;
        } else {
            content.innerHTML = data;
        }


    }
//////////////////////////////


    if (window.location.pathname === 'order') {
        const calendar = document.querySelector('#calendar');
        calendar.addEventListener('mousedown', function (e) {
            let target = e.target;
        });
    }


    function renderHTML(data) {
        contentDiv.innerHTML = data;
    }

    socket.onclose = (e) => {
        console.log('close');
    };
    socket.onerror = (e) => {
        console.log(e);
    };


}();


