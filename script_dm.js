

/* FILE MANAGER */
var _freebytes = 0;

function RefreshFileList() {
    var url = "/api/filemanager/list";
    HTTPRequestHelper(url, successHandler, failHandler);
    function successHandler(response) {
        var arr = JSON.parse(response);
        _freebytes = arr.freebytes;
        freeSpaceSpan.innerHTML = _freebytes;
        var percent = Math.round(100 * arr.usedBytes / arr.totalBytes);
        document.getElementById("freeSpace").setAttribute("value", arr.usedBytes);
        document.getElementById("freeSpace").setAttribute("max", arr.totalBytes);
        document.getElementById("freeSpace").setAttribute("data-label", percent + "%");
        var i;
        var out = "<table>";
        for (i = 0; i < arr.files.length; i++) {
            out += "<tr><td>" + "<a href='" + arr.files[i].Name + "' target='_blank'>" + arr.files[i].Name + "</a>" + "</td><td width='5%'>" + arr.files[i].Size + "</td><td  width='5%'><a class=\"buttons delete\" name=\"" + arr.files[i].Name + "\" href=\"void(0);\" onclick=\"DeleteFile(this.name); return false;\">Delete</a>" +
            "</td></tr>";
        }
        out += "</table>";
        document.getElementById("id02").innerHTML = out;
    };
    function failHandler(response) {
    };
}
function DeleteFile(filename) {
    var url = "/api/filemanager/delete?file=" + filename;
    HTTPRequestHelper(url, successHandler, failHandler);
    function successHandler(response) {
        alert(filename + " is now deleted... Free space: " + response);
        RefreshFileList();
    };
    function failHandler(response) {
    };
}
function AlertFilesize() {
    if (window.ActiveXObject) {
        var fso = new ActiveXObject("Scripting.FileSystemObject");
        var filepath = document.getElementById('fileToUpload').value;
        var thefile = fso.getFile(filepath);
        var sizeinbytes = thefile.size;
    } else {
        var sizeinbytes = document.getElementById('fileToUpload').files[0].size;
    }
    if (sizeinbytes > _freebytes)
        alert("Not enough space");
}
/* FILE MANAGER */



/* SETTINGS */


function PopulateDropdown(control, numberOfOptions) {
    control.innerHTML = "";
    control.innerHTML += '<option value="-1">Please Select</option>';
    for (i = 0; i < numberOfOptions; i++)
        control.innerHTML += '<option value="' + i + '">' + ("00" + i).slice(-2) + '</option>';
}
function LoadNetworkList() {
    var url = "/api/wifi/list";
    HTTPRequestHelper(url, successHandler, failHandler, 10000);
    function successHandler(response) {
        networkDropdownList.innerHTML = '<option value="0">Please Select</option>';
        var i;
        var arr = JSON.parse(response);
        for (i = 0; i < arr.length; i++) {
            networkDropdownList.innerHTML += "<option value='" + arr[i].Name + "'>" + arr[i].Name + "</option>";
        }
    };
    function failHandler(response) {
    };
}
function RefreshNetworkList_onClick() {
    LoadNetworkList();
}
function LoadDeviceInfo() {
    var url = "/api/device/info";
    HTTPRequestHelper(url, successHandler, failHandler);
    function successHandler(response) {
        var i;
        var arr = JSON.parse(response);
        document.getElementById("ipSpan").innerHTML = "( " + arr["IP"] + " )";
        document.getElementById("ssidSpan").innerHTML = arr["SSID"];
        var date = new Date(parseInt(arr["uptime"]));
        var str = '';
        str += date.getUTCDate() - 1 + " days, ";
        str += date.getUTCHours() + " hours, ";
        str += date.getUTCMinutes() + " min, ";
        str += date.getUTCSeconds() + " sec ";
        //str += date.getUTCMilliseconds() + " millis";
        document.getElementById("uptimeSpan").innerHTML = str;
        document.getElementById("macSpan").innerHTML = arr["MAC"];
        document.getElementById("datetimeSpan").innerHTML = arr["datetime"];
    };
    function failHandler(response) { console.error(response); };
}

function LoadServices() {
    var services = CreateTable(count = Object.keys(Services).length, 2, "servicesTable");
    i = 0;
    for (key in Services) {
        Services[key].id = key;
        var orderSelect = '<select id="' + key + '_Pin" class="networkList"><option value="None">None</option>';
        for (pin in Pins)
            orderSelect += '<option value="' + Pins[pin] + '">' + pin + '</option>';
        orderSelect += '</select>';
        services.ChangeCellContent(i, 0, Services[key].name);
        services.ChangeCellContent(i, 1, orderSelect);
        i++;
    };
    document.getElementById("servicesDiv").innerHTML = services.view.innerHTML;
    var url = "/services.json";
    HTTPRequestHelper(url, successHandler, failHandler, 10000);
    function successHandler(response) {
        var arr = JSON.parse(response);

        for (key in arr) {
            var dropdown = document.getElementById(key + "_Pin");
            dropdown.value = arr[key];
        }
    };
    function failHandler(response) {
    };
}

function RestartButton_onClick() {
    var r = confirm("Your connectivity will be lost, are you sure?");
    if (r == true)
        HTTPRequestHelper("/api/device/restart", successHandler, failHandler);
    function successHandler(response) {
        alert("Restarting now... Please reconnect...");
    }
    function failHandler(response) {
        alert("Failed to access to the device, try again...");
    }
    return false;
}
function ConnectToWiFi() {
    var url = "/api/wifi/set?" + "ssid=" + networkDropdownList.value + "&password=" + passwordTextbox.value;
    HTTPRequestHelper(url, successHandler, failHandler);
    function successHandler(response) {
        alert("Network Settings has been updated..");
    };
    function failHandler(response) {
    };
}
function SetDate() {
    var url = "/api/device?command=set&devicename=rtc&" + "year=" + dateyear.value + "&month=" + datemonth.value + "&day=" + dateday.value + "&hour=" + time_hour.value + "&minute=" + time_minute.value;
    HTTPRequestHelper(url, successHandler, failHandler);

    function successHandler(response) {
        alert("Date/Time has been updated..");
    };
    function failHandler(response) {
    };
}
function SaveButton_onClick() {
    var settings = new Object();
    for (i = 0; i < 7; i++) {
        var day = document.getElementById("weekdays_" + i.toString());
        settings[i] = day.checked;
    }
    settings["hostname"] = hostnameTextbox.value;
    settings["timer1_hour"] = timer1_hour.value;
    settings["timer1_minute"] = timer1_minute.value;
    settings["timer2_hour"] = timer2_hour.value;
    settings["timer2_minute"] = timer2_minute.value;
    settings["timerAction"] = timerActionDropdownList.value;
    settings["IFTTT_NotificationEnabled"] = IFTTT_EnabledCheckBox.checked;
    settings["IFTTT_Key"] = IFTTT_KeyTextbox.value;
    settings["IFTTT_StartUpEventName"] = IFTTT_StartupEventNameTextbox.value;
    settings["IFTTT_TimerEventName"] = IFTTT_TimerEventNameTextbox.value;
    settings["IFTTT_CheckWaterEventName"] = IFTTT_CheckWaterEventNameTextbox.value;
    settings["wifi_mode"] = wifimodeDropdownList.value;
    var myJsonString = JSON.stringify(settings);
    saveJsonToFile("/settings.json", myJsonString);

    var services = {  };
    for (key in Services) {        
        var dropdown = document.getElementById(key + "_Pin");
        if (dropdown.options[dropdown.selectedIndex].text != "None") {
            services[key] = dropdown.options[dropdown.selectedIndex].value;
        }
    };

    var serviceListJSON = JSON.stringify(services);
    saveJsonToFile("/services.json", serviceListJSON);


    return false;
}
function saveJsonToFile(filename, json) {

    var formData = new FormData();
    var blob = new Blob([json], { type: 'plain/text' });
    formData.append('file', blob, filename);
    var xhr = new XMLHttpRequest();
    xhr.timeout = 10000;
    xhr.open("POST", "/spiffsupload", true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {
            if (xhr.status == 200) {
                console.log(filename + " has been updated.");
            }
            else { alert("Failed! Try again.."); }
        }            
    }
    xhr.send(formData);
}
function CreateTable(rows, columns, className) {
    var obj = {};
    obj.ChangeCellContent = function (row, column, content) {
        var table = obj.view.childNodes[0];
        table.childNodes[row].childNodes[column].innerHTML = content;
    }
    obj.ChangeCellObject = function (row, column, object) {
        var table = obj.view.childNodes[0];
        table.childNodes[row].childNodes[column].appendChild(object);
    }
    var containerDiv = document.createElement("div");
    var table = document.createElement("table");
    table.setAttribute("class", className);

    for (i = 0; i < rows; i++) {
        var trow = document.createElement("tr");
        for (j = 0; j < columns; j++) {
            tcell = document.createElement("td");
            trow.appendChild(tcell);
        }
        table.appendChild(trow);
    }
    containerDiv.appendChild(table);
    obj.view = containerDiv;
    return obj;
}

