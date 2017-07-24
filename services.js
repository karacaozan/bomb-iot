String.prototype.toDOM = function () {
    var d = document
       , i
       , a = d.createElement("div")
       , b = d.createDocumentFragment();
    a.innerHTML = this;
    while (i = a.firstChild) b.appendChild(i);
    return b;
};
function HTTPRequestHelper(url, successHandler, failHandler,timeout) {
    return HTTPRequestHelper(url, successHandler, failHandler, timeout, true);
}
function HTTPRequestHelper(url, successHandler, failHandler) {
    return HTTPRequestHelper(url, successHandler, failHandler, 2000, true);
}
function HTTPRequestHelper(url, successHandler, failHandler, timeout, asynchronous) {
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState == 4) {
            if (xmlhttp.status == 200) {
                doneHandler(xmlhttp.responseText);
            }
            else { errorHandler(xmlhttp.responseText); }
        }
    }
    xmlhttp.open("GET", url, asynchronous);
    if (asynchronous)
        xmlhttp.timeout = timeout;
    xmlhttp.send();
    function doneHandler(response) {
        successHandler(response);
    };
    function errorHandler(response) {
        failHandler(response);
    };
    return xmlhttp;
}
function $args(func) {
    return (func + '')
      .replace(/[/][/].*$/mg, '') // strip single-line comments
      .replace(/\s+/g, '') // strip white space
      .replace(/[/][*][^/*]*[*][/]/g, '') // strip multi-line comments  
      .split('){', 1)[0].replace(/^[^(]*[(]/, '') // extract the parameters  
      .replace(/=[^,]+/g, '') // strip any ES6 defaults  
      .split(',').filter(Boolean); // split & filter [""]
}
function generateUUID() { // Public Domain/MIT
    var d = new Date().getTime();
    if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
        d += performance.now(); //use high-precision timer if available
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
}
function count(arr) {
    var o = {}, i;
    for (i = 0; i < arr.length; ++i) {
        if (o[arr[i]])++o[arr[i]];
        else o[arr[i]] = 1;
    }
    return o;
}
function weight(arr_in) {
    var o = count(arr_in),
        arr = [], i;
    for (i in o) arr.push({ value: +i, weight: o[i] });
    arr.sort(function (a, b) {
        return a.weight < b.weight;
    });
    return arr;
}
function dynamicSort(property) {
    var sortOrder = 1;
    if (property[0] === "-") {
        sortOrder = -1;
        property = property.substr(1);
    }
    return function (a, b) {
        var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
        return result * sortOrder;
    }
}


var Pins = { D0: 16, D1: 5, D2: 4, D3: 0, D4: 2, D5: 14, D6: 12, D7: 13, D8: 15, A0: 17, TX: 1, RX: 3 };
var _accessories = new Array();

var Services = {
    RF433Transmitter: {
        name: "RF433 Transmitter",
        //get : function(){return null},
        set: function (sender) {

            
            var newstate;

            if (!sender.value)
                newstate = 0;
            else {

                if (sender.actions.length == 1) {
                    newstate = 0;
                }
                else {
                    for (j = 0; j < sender.actions.length; j++) {
                        if (sender.actions[j].state == sender.value) {
                            newstate = j == sender.actions.length - 1 ? 0 : j + 1;
                            break;
                        }
                    }
                }
            }
            var url = "/api/" + this.id + "/set?code=" + sender.actions[newstate].data;
            if (!sender.isLocal)
                url = "http://" + sender.ip + url;

            HTTPRequestHelper(url, successHandler, failHandler);
            function successHandler(response) {
                sender.value = sender.actions[newstate].state;

                if (LocalStorage.isAvailable)
                    LocalStorage.set(sender.id, sender.value);

                var d = document.getElementById(sender.id);
                if (d) {
                    d.setAttribute("state", sender.actions[newstate].state);
                    d.setAttribute("class", "command-buttons_" + sender.actions[newstate].state);
                    d.childNodes[2].innerHTML = sender.actions[newstate].state;
                }
            };
            function failHandler(response) {
            };          
        },
        eventOnly: false
    },
    RF433Receiver: {
        name: "RF433 Receiver",
        get: function (isMultiple) { //get(false) for last, get(true) for all latest
            return "code(s)";
        },
        eventOnly: true
    },
    Servo: {
        name: "Thermostat",
        set: function (angle) {
            var url = "/api/" + this.id + "/set?angle=" + angle;
            alert(url);
        },
        get: function () {
            var url = "/api/" + this.id + "/get";
            alert(url);
        },
        eventOnly: false
    },
    DHT22: {
        name: "DHT22",
        readOnly: false,
        eventOnly: false,
        get: function (sender) {
            var url = "/api/" + Services.DHT22.id + "/get";

           
            if (!sender.isLocal)
                url = "http://" + sender.ip + url;

            HTTPRequestHelper(url, successHandler, failHandler,2000,true);
            function successHandler(response) {
                var d = document.getElementById(sender.id);
                console.log(sender.id);
                if (d) {
                    var sensorDiv = d.getElementsByClassName("sensor")[0];
                    sensorDiv.innerHTML = response.substr(0, 4);
                };
            }
            function failHandler(response) {
            };
        },
    },


    Relay: { name: "Relay", data: ["state"], callback: "/api/Relay?$data", readOnly: false, eventOnly: false },
    
    IRReceiver: { name: "IR Receiver", data: [], callback: "/api/DHT22?value", readOnly: false, eventOnly: false },
    IRTransmitter: { name: "IR Transmitter", data: [], callback: "/api/DHT22?value", readOnly: false, eventOnly: false },
    WebRequest: {
        name: "Web Request",
        data: [],
        callback: "",
        readOnly: false,
        eventOnly: false,
        set: function (sender) {


            if (sender.actions.length == 0) {
                return;
            }
            var url = sender.actions[0].data;
            HTTPRequestHelper(url, successHandler, failHandler);
            function successHandler(response) {
            };
            function failHandler(response) {
            };
        }
    }
    

};
for (service in Services) { Services[service].id = service };

var Accessories = {

    RF433Switch: {
        name: "RF433 Switch",
        service: Services.RF433Transmitter,
        numberofClickActions: 2,
        states: { Off: "Off", On: "On" },
        value: null,
        click: function (accessory) {
            alert("Transmittor Click");

            return "On";
        },
        load: function () {
            //when DOM loading
            this.value = "Ozan";
            return this.value;
        }
    },
    TemperatureSensor: {
        name: "Temperature Sensor",
        service: Services.DHT22,
        states: []
    },
    HTTPWebRequest: {
        name: "HTTP Web Request",
        service: Services.WebRequest,
        states: []
    },
    Thermostat: {
        name: "Thermostat",
        service: Services.Servo,
        numberofClickActions: 5,
        states: ["On", "Off"],
        value: null,
    },
    TVRemote: {},
    HDMIMatrixRemote: {},
    AcRemote: {},


}
for (key in Accessories) { Accessories[key].eventOnly = function () { return Accessories[key].service.eventOnly; } };


var Accessory = function (id, name, icon, isLocal, defaultState, ip) {
    var accessory = new Object();
    accessory.AddAction = function (state, data) {
        var action = new Object();
        action.state = state;
        action.data = data;
        accessory.actions.push(action);
    };
    accessory.SetActionData = function (state, data) {
        for (j = 0; j < accessory.actions.length; j++) {
            if (accessory.actions[j].state == state) {
                accessory.actions[j].data = data;
                break;
            }
        }
    };
    accessory.GetAction = function (state) {
        for (j = 0; j < accessory.actions.length; j++) {
            if (accessory.actions[j].state == state) {
                return accessory.actions[j];
            }
        }
    };
    if (id == "")
        accessory.id = generateUUID();
    else
        accessory.id = id;
    accessory.name = name;
    accessory.icon = icon;
    accessory.isLocal = isLocal;
    accessory.defaultstate = defaultState;
    accessory.ip = ip;
    accessory.value = null;
    accessory.actions = new Array();
    return accessory;
};
var RF433Switch = function (id, name, icon, isLocal, defaultState, ip) {
    var acc = Accessory(id, name, icon, isLocal, defaultState, ip);

    acc.type = "RF433Switch";
    acc.defaultstate = defaultState;
    acc.AddAction("On", "");
    acc.AddAction("Off", "");
    return acc;
};

var HTTPWebRequest = function (id, name, icon, isLocal, defaultState, ip) {
    var acc = Accessory(id, name, icon, isLocal, defaultState, ip);

    acc.type = "HTTPWebRequest";
    acc.defaultstate = defaultState;
    acc.AddAction("Callback", "");
    return acc;
};

var TemperatureSensor = function (id, name, icon, isLocal, defaultState, ip) {
    var acc = Accessory(id, name, icon, isLocal, defaultState, ip);
    acc.type = "TemperatureSensor";
    acc.icon = "sensor";
    acc.defaultstate = defaultState;
    return acc;
};
var RelaySwitch = function (id, name, icon, isLocal, defaultState, ip) {
    var acc = Accessory(id, name, icon, isLocal, defaultState, ip);
    acc.type = "Relay";
    acc.defaultstate = defaultState;
    acc.AddCallback("On", "");
    acc.AddCallback("Off", "");
    return acc;
};
var RelayTimerSwitch = function (id, name, icon, isLocal, defaultState, ip) {
    var acc = Accessory(id, name, icon, isLocal, defaultState, ip);
    acc.type = "Relay";
    acc.defaultstate = defaultState;
    acc.AddCallback("On", "");
    acc.AddCallback("Off", "");
    return acc;
};

function LoadAccessories() {
    var url = "/accessories.json?" + Math.floor((Math.random() * 10000) + 1);
    HTTPRequestHelper(url, successHandler, failHandler, 1500);
    function successHandler(response) {
        var arr = JSON.parse(response);
        _accessories = arr;
        RefreshAccessories();
    };
    function failHandler(response) {
    };
}

var LocalStorage = {
    set: function (key, value) {
        localStorage.setItem(key, value);
    },
    get: function (key) {
        localStorage.getItem(key);
    }
}
Object.defineProperty(LocalStorage, 'isAvailable', {
    get: function () {
        return typeof (Storage) !== "undefined";
    },
});