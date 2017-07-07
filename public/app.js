"use strict";

const ADD_FORM_IDENTIFIER = '#addForm';
const UPDATE_FORM_IDENTIFIER = '#updateForm';
const DELETE_CONFIRMATION_IDENTIFIER = '.deleteConfirmation';
const RESULTS_FROM_REQUEST_IDENTIFIER = '.resultsFromRequest';
const ADD_BUTTON_IDENTIFIER = '.addButton';
const MAINTENANCE_LOGGER_URL = '/records';


// this is mock data, but when we create our API
// we'll have it return data that looks like this
var MOCK_MAINTENANCE_RECORD = {
	"maintenanceRecords": [
        {
            "id": "111111",
            "part": "Flux Capaciter",
            "status": "working",
            "needsRepair": "false",
            "lastMaintenance": 1470016976609,
            "frequency": 90
        },
        {
            "id": "222222",
            "part": "Light Saber",
            "status": "flickering",
            "needsRepair": "true",
            "lastMaintenance": 1470016976609,
            "frequency": 30
        },
        {
            "id": "333333",
            "part": "Teleporter",
            "status": "ocasional loss of limb",
            "needsRepair": "true",
            "lastMaintenance": 1470016976609,
            "frequency": 180
        },
        {
            "id": "4444444",
            "part": "Backup Camera",
            "status": "working",
            "needsRepair": "false",
            "lastMaintenance": 1470016976609,
            "frequency": -1
        }
    ]
};


function getMaintenanceRecords(callbackFn) {
    $.getJSON(MAINTENANCE_LOGGER_URL, callbackFn);
}

function addMaintenanceRecord() {

}

function addMaintenanceRecord(record, callbackFn) {
    console.log("AddResults:");
    console.log(JSON.stringify(record));
    $.ajax({
        method: 'POST',
        url: MAINTENANCE_LOGGER_URL,
        data: JSON.stringify(record),
        success: callbackFn,
        dataType: 'json',
        contentType: 'application/json'
    });  
}

function deleteMaintenanceRecord(id, callbackFn) {
    console.log("deleteMaintenanceRecord:");
    $.ajax({
        method: 'DELETE',
        url: MAINTENANCE_LOGGER_URL + "/"+ id,
        data: JSON.stringify({id: id}),
        success: callbackFn,
        dataType: 'json',
        contentType: 'application/json'
    }); 
}

function UpdateMaintenanceRecord(record, callbackFn) {
    // we use a `setTimeout` to make this asynchronous
    // as it would be with a real AJAX call. 
    setTimeout(function(){ callbackFn(MOCK_MAINTENANCE_RECORD);}, 1);  
}

function getSingleMaintenanceRecords(id, callbackFn) {
    console.log("getSingleMaintenanceRecords");
    $.ajax({
        method: 'GET',
        url: MAINTENANCE_LOGGER_URL + "/"+ id,
        //data: JSON.stringify({id: id}),
        success: callbackFn,
        dataType: 'json',
        contentType: 'application/json'
    }); 
}

// this function stays the same when we connect
// to real API later
function displayMaintenanceRecords(data) {
    console.log(data);
    resetScreens();
    $('#filterPart').show();
    for (var index in data) {
	   $('#listTable').append(
        '<tr>' +
        '<td>' + data[index].part + '</td>' +
        '<td>' + data[index].status + '</td>' +
        '<td>' + data[index].needsRepair + '</td>' +
        '<td>' + data[index].lastMaintenance + '</td>' +
        '<td>' + data[index].frequency + '</td>' +
        '<td>' + 
            '<button type="button" onclick=viewUpdateRecord("' + data[index].id + '")>Update</button>' + 
            '<button type="button" onclick=viewDeleteRecord("' + data[index].id + '")>Delete</button>' + 
        '</td>' +
        '</tr>');
    }
}

Date.prototype.toDateInputValue = (function() {
    var local = new Date(this);
    local.setMinutes(this.getMinutes() - this.getTimezoneOffset());
    return local.toJSON().slice(0,10);
});

function displayAddRecord(data) {
    resetScreens();
    console.log(Date());
    $(ADD_FORM_IDENTIFIER).append(
        'Part Name: <br>' + 
        '<input type="text" name="part" placeholder=""> <br>' +
        'Status: <br>' + 
        '<input type="text" name="status" placeholder=""> <br>' +
        'Needs repair?: <br>' + 
        '<input type="checkbox" name="repair" placeholder=""> <br>' +
        'Last Maintenance: <br>' + 
        `<input type="date" name="lastMaintenance"> <br>` +
        'Freq (days): <br>' + 
        '<input type="text" name="frequency" placeholder="0"> <br>' + 
        '<br><br>' +
        '<input type="submit" value="Add">'
    );
    $("input[name='lastMaintenance']").val(new Date().toDateInputValue());
}

function displayUpdateRecord(data) {
    resetScreens();
    $(UPDATE_FORM_IDENTIFIER).append(
        'Part Name: <br>' + 
        '<input type="text" name="part" value="' + data.part + '"> <br>' +
        'Status: <br>' + 
        '<input type="text" name="status" value="' + data.status + '"> <br>' +
        'Repair: <br>' + 
        '<input type="text" name="repair" value="' + data.needsRepair + '"> <br>' +
        'Last Maintenance: <br>' + 
        '<input type="text" name="lastMaintenance" value="' + data.lastMaintenance + '"> <br>' +
        'Freq: <br>' + 
        '<input type="text" name="frequency" value="' + data.frequency + '"> <br>' + 
        '<br><br>' +
        '<input type="submit" value="Update">'
    );
}

function displayDeleteRecord(data) {
    resetScreens();
    $(DELETE_CONFIRMATION_IDENTIFIER).append(
        '<p>Part Name: ' + data.part + '</p>' +
        '<p>Status: ' + data.status + '</p>' +
        '<p>Repair: ' + data.needsRepair + '</p>' +
        '<p>Last Maintenance: ' + data.lastMaintenance + '</p>' +
        '<p>Freq: ' + data.frequency + '</p>' +
        '<br><br><input class="js-delete-record-btn" id=' + data.id + '" type="button" value="Delete">'
    );
}

function displayAddResults(data) {
    resetScreens();
    $(RESULTS_FROM_REQUEST_IDENTIFIER).empty().append(
        '<p>record added </p>'
    );
    getAndDisplayMaintenanceRecords();
}

function displayDeleteResults(data) {
    resetScreens();
    $(RESULTS_FROM_REQUEST_IDENTIFIER).empty().append(
        '<p>Deleted record </p>'
    );
}

function displayUpdateResults(data) {
    resetScreens();
    $(RESULTS_FROM_REQUEST_IDENTIFIER).empty().append(
        '<p>Updated record</p>'
    );
}

function viewAddRecord() {
    displayAddRecord();
}

function viewUpdateRecord(id) {
    getSingleMaintenanceRecords(id, displayUpdateRecord);
}

function viewDeleteRecord(id) {
    console.log("viewDeleteRecord");
    getSingleMaintenanceRecords(id, displayDeleteRecord);
}

function getAndDisplayMaintenanceRecords() {
	getMaintenanceRecords(displayMaintenanceRecords);
}

function addRecord(record){
    console.log(record);
    addMaintenanceRecord(record, displayAddResults);
}

function deleteRecord(id) {
    deleteMaintenanceRecord(id, displayDeleteResults);
}

function updateRecord(record) {
    UpdateMaintenanceRecord(record, displayUpdateResults);
}

function filterByPart() {
  // Declare variables 
  var input, filter, table, tr, td, i;
  input = document.getElementById("filterPart");
  filter = input.value.toUpperCase();
  table = document.getElementById("listTable");
  tr = table.getElementsByTagName("tr");

  // Loop through all table rows, and hide those who don't match the search query
  for (i = 0; i < tr.length; i++) {
    td = tr[i].getElementsByTagName("td")[0];
    if (td) {
      if (td.innerHTML.toUpperCase().indexOf(filter) > -1) {
        tr[i].style.display = "";
      } else {
        tr[i].style.display = "none";
      }
    } 
  }
}

function resetScreens() {
    $('#filterPart').hide();
    $('#listTable').empty();
    $(UPDATE_FORM_IDENTIFIER).empty();
    $(ADD_FORM_IDENTIFIER).empty();
    $(DELETE_CONFIRMATION_IDENTIFIER).empty();
}

function watchAddBtn() {
  $(ADD_FORM_IDENTIFIER).submit(function(event) {
    event.preventDefault();
    // get data from api
    var data = $(ADD_FORM_IDENTIFIER).serializeArray().reduce(function(m,o){ m[o.name] = o.value; return m;}, {});
    addRecord(data);
  });
}

function watchUpdateBtn() {
  $(UPDATE_FORM_IDENTIFIER).submit(function(event) {
    event.preventDefault();
    // get data from api
    updateRecord($(UPDATE_FORM_IDENTIFIER).serialize());
  });
}

function watchDeleteBtn() {
  $(DELETE_CONFIRMATION_IDENTIFIER).on("click", ".js-delete-record-btn", function(event) {
    event.preventDefault();
    // get data from api
    console.log($(event.currentTarget));
    deleteRecord(event.currentTarget.id);
  });
}

function watchShowMaintenanceBtn() {
  $(RESULTS_FROM_REQUEST_IDENTIFIER).on("click", ".js-show-maintenance-record-btn", function(event) {
    event.preventDefault();
    // get data from api
    getAndDisplayMaintenanceRecords();
  });
}

function watchAddMaintenanceBtn() {
  $(ADD_BUTTON_IDENTIFIER).click((event) => {
    event.preventDefault();
    // get data from api
    displayAddRecord();
  });
}

//  on page load do this
$(function() {
    watchUpdateBtn();
    watchDeleteBtn();
    watchAddBtn();
    watchShowMaintenanceBtn();
    watchAddMaintenanceBtn();
    getAndDisplayMaintenanceRecords();
});