
function accessory_onClick(sender) {

    var id = sender.getAttribute("id");
    var state = sender.getAttribute("state");
    var acc;
    for (i = 0; i < _accessories.length; i++) {
        if (id == _accessories[i].id)
            acc = _accessories[i];
    }

    if (acc.type == "TemperatureSensor")
    {
        Accessories[acc.type].service.get(acc);
        return;
    }
        
    if (acc.type == "RF433Switch") {
        Accessories[acc.type].service.set(acc);
        return;
    }

    if (acc.type == "HTTPWebRequest") {
        Accessories[acc.type].service.set(acc);
        return;
    }
}
function LoadPage() {
    //LoadCommandList2();
    GetDeviceInformation();
    LoadAccessories();
    return;
}
LoadPage();
function GetDeviceInformation() {
    var xmlhttp = new XMLHttpRequest();
    var url = "/api/device/info";

    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            myFunction(xmlhttp.responseText);
        }
    }
    xmlhttp.open("GET", url, true);
    xmlhttp.send();
    function myFunction(response) {
        var arr = JSON.parse(response);
        var date = new Date(parseInt(arr["uptime"]));
        var str = '';
        str += date.getUTCDate() - 1 + " days, ";
        str += date.getUTCHours() + " hours, ";
        str += date.getUTCMinutes() + " min, ";
        str += date.getUTCSeconds() + " sec ";
        //str += date.getUTCMilliseconds() + " millis";
        document.getElementById("uptimespan").innerHTML = str;
    }
}

function RefreshAccessories() {
    commandListDiv.innerHTML = "";
    for (i = 0; i < _accessories.length; i++) {

        if (typeof (Storage) !== "undefined") {
            var value = localStorage.getItem(_accessories[i].id);
            if (value)
                _accessories[i].value = value;
            else
                _accessories[i].value = _accessories[i].defaultstate;
        }

        var foo = '<div class="divTableCell"><div id="" class="" state="" onclick="accessory_onClick(this);"><div class="light">&nbsp;</div><div class="name">Label</div><div class="state">Off</div></div></div>'.toDOM();
        var div = foo.childNodes[0].childNodes[0];
        
        div.setAttribute("state", _accessories[i].value);
        div.setAttribute("id", _accessories[i].id);
        div.setAttribute("class", "command-buttons_" + _accessories[i].value);

        div.childNodes[0].setAttribute("class", _accessories[i].icon);
        div.childNodes[1].innerHTML = _accessories[i].name;
        div.childNodes[2].innerHTML = _accessories[i].value;


        if (_accessories[i].type == "TemperatureSensor") {
            div.setAttribute("class", "command-buttons_Off");
            div.childNodes[2].innerHTML = "";

            setTimeout(Accessories[_accessories[i].type].service.get(_accessories[i]), 2000);

            //div.childNodes[0].innerHTML = Accessories[_accessories[i].type].service.get(_accessories[i]).substr(0, 4);
        }

        if (_accessories[i].type == "HTTPWebRequest") {
            div.setAttribute("class", "command-buttons_Off");
            div.childNodes[2].innerHTML = "";

            

            //div.childNodes[0].innerHTML = Accessories[_accessories[i].type].service.get(_accessories[i]).substr(0, 4);
        }


        commandListDiv.appendChild(foo);
        if (i % 3 == 2) {
            commandListDiv.innerHTML += '</div><div class="divTableRow">';
        }
    }
}

