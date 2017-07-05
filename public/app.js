"use strict";

const UPDATE_FORM_IDENTIFIER = '#updateForm';
const DELETE_CONFIRMATION_IDENTIFIER = '.deleteConfirmation';
const RESULTS_FROM_REQUEST_IDENTIFIER = '.resultsFromRequest';


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
    // we use a `setTimeout` to make this asynchronous
    // as it would be with a real AJAX call.
	setTimeout(function(){ callbackFn(MOCK_MAINTENANCE_RECORD);}, 1);
}

function deleteMaintenanceRecord(id, callbackFn) {
    // we use a `setTimeout` to make this asynchronous
    // as it would be with a real AJAX call.   
    setTimeout(function(){ callbackFn(MOCK_MAINTENANCE_RECORD);}, 1);  
}

function UpdateMaintenanceRecord(record, callbackFn) {
    // we use a `setTimeout` to make this asynchronous
    // as it would be with a real AJAX call. 
    setTimeout(function(){ callbackFn(MOCK_MAINTENANCE_RECORD);}, 1);  
}

function getSingleMaintenanceRecords(id, callbackFn) {
    // we use a `setTimeout` to make this asynchronous
    // as it would be with a real AJAX call. 
    setTimeout(function(){ callbackFn(MOCK_MAINTENANCE_RECORD.maintenanceRecords.find((element)=>{return(element.id == id)}));}, 1);
}

// this function stays the same when we connect
// to real API later
function displayMaintenanceRecords(data) {
    resetScreens();
    $('#filterPart').show();
    for (var index in data.maintenanceRecords) {
	   $('#listTable').append(
        '<tr>' +
        '<td>' + data.maintenanceRecords[index].part + '</td>' +
        '<td>' + data.maintenanceRecords[index].status + '</td>' +
        '<td>' + data.maintenanceRecords[index].needsRepair + '</td>' +
        '<td>' + data.maintenanceRecords[index].lastMaintenance + '</td>' +
        '<td>' + data.maintenanceRecords[index].frequency + '</td>' +
        '<td>' + 
            '<button type="button" onclick="viewUpdateRecord(' + data.maintenanceRecords[index].id  + ')">Update</button>' + 
            '<button type="button" onclick="viewDeleteRecord(' + data.maintenanceRecords[index].id  + ')">Delete</button>' + 
        '</td>' +
        '</tr>');
    }
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
        '<input type="submit" value="Submit">'
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

function displayDeleteResults(data) {
    resetScreens();
    $(RESULTS_FROM_REQUEST_IDENTIFIER).empty().append(
        '<p>Delete: DELETE SUCCESSFULL ---MAYBE</p>' +
        '<br><br><input class="js-show-maintenance-record-btn" type="button" value="Show Maintenance Recordes">'
    );
}

function displayUpdateResults(data) {
    resetScreens();
    $(RESULTS_FROM_REQUEST_IDENTIFIER).empty().append(
        '<p>Delete: Update SUCCESSFULL ---MAYBE</p>' +
        '<br><br><input class="js-show-maintenance-record-btn" type="button" value="Show Maintenance Recordes">'
    );
}

function viewUpdateRecord(id) {
    getSingleMaintenanceRecords(id, displayUpdateRecord);
}

function viewDeleteRecord(id) {
    getSingleMaintenanceRecords(id, displayDeleteRecord);
}

function getAndDisplayMaintenanceRecords() {
    console.log("Hello Brandon");
	getMaintenanceRecords(displayMaintenanceRecords);
}

function deleteRecord(id) {
    deleteMaintenanceRecord(id, displayDeleteResults);
}

function updateRecord(record) {
    console.log(record);
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
    $(DELETE_CONFIRMATION_IDENTIFIER).empty();
}

function watchSubmitBtn() {
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

//  on page load do this
$(function() {
    watchSubmitBtn();
    watchDeleteBtn();
    watchShowMaintenanceBtn();
    getAndDisplayMaintenanceRecords();
});