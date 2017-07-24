
var _devices = new Array();
var _found = 0;
var _error = 0;
var _sent = 0;

function PageLoad(event) {
    LoadAccessories();
    Scan();
}

if (window.attachEvent) {
    window.attachEvent('onload', yourFunctionName);
} else {
    if (window.onload) {
        var curronload = window.onload;
        var newonload = function (evt) {
            curronload(evt);
            PageLoad(evt);
        };
        window.onload = newonload;
    } else {
        window.onload = PageLoad;
    }
}



function AddCommand_onClick() {

    var type = document.getElementById("accessoryType").value;

    if (type == "RF433") {

        var accessory = RF433Switch("", commandName.value, commandType.value, true, "Off", "");
        accessory.SetCallbackData("On", commandOnValue.value);
        accessory.SetCallbackData("Off", commandOffValue.value);
    }
    else if (type == "TemperatureSensor") {
        var accessory = TemperatureSensor("", commandName.value, "sensor", true, "Get", "");
    }
    _accessories.push(accessory);
    RefreshAccessories();

    var myJsonString = JSON.stringify(_accessories);
    saveJsonToFile("accessories.json", myJsonString);
    return false;
}
function AddRemote(sender) {

    var index = sender.getAttribute("arrayIndex");

    var remoteAccessory = _devices[index];

    for (k = 0; k < _accessories.length; k++) {
        if (_accessories[k].id == remoteAccessory.id) {
            alert("Cannot add! Already existing...");
            return;
        }
    }

    var accessory;


    if (_devices[index].type && _devices[index].type == "RF433Switch") {

        accessory = RF433Switch(remoteAccessory.id, remoteAccessory.name, "RF433Switch", false, "Off", remoteAccessory.ip);
        accessory.SetActionData("On", commandOnValue.value);
        accessory.SetActionData("Off", commandOffValue.value);
    }
    else if (_devices[index].type && _devices[index].type == "TemperatureSensor") {
        accessory = TemperatureSensor(remoteAccessory.id, remoteAccessory.name, remoteAccessory.icon, false, "Off", remoteAccessory.ip);
    }

    else if (_devices[index].type && _devices[index].type == "HTTPWebRequest") {
        accessory = HTTPWebRequest(remoteAccessory.id, remoteAccessory.name, "sensor", false, "Get", remoteAccessory.ip);
        accessory.SetActionData("Callback", HTTPWebRequestCallback.data);
    }


    accessory.isLocal = false;
    _accessories.push(accessory);
    RefreshAccessories();

    var myJsonString = JSON.stringify(_accessories);
    saveJsonToFile("accessories.json", myJsonString);
    return false;
}

function addCodeValue_onFocus(sender) {
    var cbx;
    var cbxs = document.getElementById('recentCodesList').getElementsByTagName('input'), i = cbxs.length;
    while (i--) {
        if (cbxs[i].type && cbxs[i].type == 'checkbox' && cbxs[i].checked) {
            cbx = cbxs[i];
        }
    }
    if (!cbx) {
        return;
    }
    code = cbx.getAttribute("value");
    sender.value = code;
    return false;
}
function TestCode_onClick(code) {

    var cbx;
    var cbxs = document.getElementById('recentCodesList').getElementsByTagName('input'), i = cbxs.length;
    while (i--) {
        if (cbxs[i].type && cbxs[i].type == 'checkbox' && cbxs[i].checked) {
            cbx = cbxs[i];
        }
    }
    if (!cbx) {
        alert("nothing selected...");
        return;
    }

    code = cbx.getAttribute("value");
    var url = "/api/RF433Transmitter/send?code=" + code;
    HTTPRequestHelper(url, successHandler, failHandler);
    function successHandler(response) {
        alert("Operation has been completed.");
    };
    function failHandler(response) {
    };
}

function TestCode(sender) {
    var url = sender.getAttribute("href");
    HTTPRequestHelper(url, successHandler, failHandler);
    function successHandler(response) {
    };
    function failHandler(response) {
    };
    return false;
}


function orderSelect_oncChange(sender) {
    var oldvalue = sender.getAttribute("oldvalue");
    var newvalue = sender.value;

    _accessories[oldvalue - 1].order = newvalue - 1;
    _accessories[newvalue - 1].order = oldvalue - 1;

    _accessories = _accessories.sort(dynamicSort("order"));
    var myJsonString = JSON.stringify(_accessories);
    saveJsonToFile("accessories.json", myJsonString);
    RefreshAccessories();

    return false;
}

//var refreshReceived = setInterval(RefreshCodes_onClick, 2500);

function RefreshCodes_onClick() {
    var url = "/api/RF433Receiver/latestcodes";
    recentCodesList.innerHTML = "";
    HTTPRequestHelper(url, successHandler, failHandler, 2000);
    function successHandler(response) {
        var arr = JSON.parse(response);
        var sorted = weight(arr);
        if (sorted.length == 0)
            recentCodesList.innerHTML = "Nothing to show...";
        else
            for (i = 0; i < sorted.length; i++) {
                recentCodesList.innerHTML += '<input type="checkbox" id="cb' + sorted[i].value + '" value="' + sorted[i].value + '" />' + sorted[i].value + ' (' + sorted[i].weight + ')' + '<br />';
            }
    };
    function failHandler(response) {
    };
    return false;
}


function cbclick(e) {
    e = e || event;
    var cb = e.srcElement || e.target;
    if (cb.type !== 'checkbox') { return true; }
    var cbxs = document.getElementById('recentCodesList').getElementsByTagName('input'), i = cbxs.length;
    while (i--) {
        if (cbxs[i].type && cbxs[i].type == 'checkbox' && cbxs[i].id !== cb.id) {
            cbxs[i].checked = false;
        }
    }
}

function Scan() {

    _found = 0;
    _error = 0;
    _sent = 0;

    for (i = 2; i < 255; i++) {

        if ("192.168.1." + i.toString() == window.location.host)
            continue;

        var url = "http://192.168.1." + i.toString() + "/accessories.json?" + Math.floor((Math.random() * 10000) + 1);
        getHHTP(url);
        _sent++;
        //}
    }
}


function getHHTP(url) {
    var xmlhttp = HTTPRequestHelper(url, successHandler, failHandler, 3000, true);
    function successHandler(response) {
        try {
            var arr = JSON.parse(response);
            for (j = 0; j < arr.length; j++) {
                arr[j].ip = xmlhttp.getResponseHeader("origin");
                _devices.push(arr[j]);
            }
            _found++;
            isCompleted();
        }
        catch (err) {
            _error = _error + 1;
        }
    };
    function failHandler(response) {
        _error = _error + 1;
        isCompleted();
    };
}

function isCompleted() {
    if (_found + _error == _sent) {
        remoteAccessories.innerHTML = "";
        function isLocal(device) {
            return device.isLocal == true;
        }
        localdevices = _devices.filter(isLocal);
        _devices = localdevices;

        var remoteDeviceTable = CreateTable(localdevices.length, 4, "accessoriesTable");
        for (i = 0; i < localdevices.length; i++) {

            remoteDeviceTable.ChangeCellContent(i, 0, localdevices[i].ip);
            remoteDeviceTable.ChangeCellContent(i, 1, localdevices[i].name);
            remoteDeviceTable.ChangeCellContent(i, 2, '<div class="' + localdevices[i].icon + '">&nbsp;</div>');
            remoteDeviceTable.ChangeCellContent(i, 3, '<div class="divTableCell" arrayindex="' + i + '" onclick="AddRemote(this);">Add</div>');

            //remoteAccessories.innerHTML += '<input type="checkbox" id="cb' + _devices[i].name + '" value="' + _devices[i].name + '" />' + _devices[i].name + ' (' + _devices[i].name + ')' + '<br />';
        }
        remoteAccessories.innerHTML = remoteDeviceTable.view.innerHTML;
    }
}
function Remove(sender) {
    var index = sender.getAttribute("arrayindex");
    _accessories.splice(index, 1);
    RefreshAccessories();
    var myJsonString = JSON.stringify(_accessories);
    saveJsonToFile("accessories.json", myJsonString);
}
function RefreshAccessories() {
    document.getElementById("commandListDiv").innerHTML = "";
    var orderSelect = '<select class="networkList" onchange="orderSelect_oncChange(this);">';

    for (i = 1; i <= _accessories.length; i++) {
        orderSelect += '<option value="' + i + '">' + i + '</option>';
    }
    orderSelect += '</select>';

    var accessories = CreateTable(_accessories.length, 5, "accessoriesTable");
    for (i = 0; i < _accessories.length; i++) {

        _accessories[i].order = i.toString();


        var select = orderSelect.toDOM();
        select.childNodes[0].setAttribute("oldvalue", i + 1);
        select.childNodes[0].childNodes[i].setAttribute("selected", true);

        var callbackDisplay = "";
        for (j = 0; j < _accessories[i].actions.length; j++) {
            callbackDisplay += "<a href='" + _accessories[i].actions[j].data + "' onclick='TestCode(this); return false;'>" + _accessories[i].actions[j].state + "</a>";
            callbackDisplay += "<br>"
        }

        accessories.ChangeCellObject(i, 0, select);
        accessories.ChangeCellContent(i, 1, _accessories[i].name + (_accessories[i].isLocal == false ? "*" : ""));
        accessories.ChangeCellContent(i, 2, '<div id="' + _accessories[i].id + '" ><div class="' + _accessories[i].icon + '"></div>&nbsp;</div>');
        accessories.ChangeCellContent(i, 3, callbackDisplay);
        accessories.ChangeCellContent(i, 4, '<div class="divTableCell" arrayindex="' + i + '" onclick="Remove(this);">Delete</div>');

      
        if (_accessories[i].type == "TemperatureSensor") {
            setTimeout(Accessories[_accessories[i].type].service.get(_accessories[i]), 2000);      
        }

    }
    commandListDiv.innerHTML = accessories.view.innerHTML;
}