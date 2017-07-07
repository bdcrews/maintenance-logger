'use strict';

const ADD_FORM_IDENTIFIER = '#addForm';
const UPDATE_FORM_IDENTIFIER = '#updateForm';
const DELETE_CONFIRMATION_IDENTIFIER = '.deleteConfirmation';
const RESULTS_FROM_REQUEST_IDENTIFIER = '.resultsFromRequest';
const ADD_BUTTON_IDENTIFIER = '.addButton';
const MAINTENANCE_LOGGER_URL = '/records';

function getMaintenanceRecords(callbackFn) {
    $.getJSON(MAINTENANCE_LOGGER_URL, callbackFn);
}

function addMaintenanceRecord(record, callbackFn) {
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
    $.ajax({
        method: 'DELETE',
        url: MAINTENANCE_LOGGER_URL + '/'+ id,
        success: callbackFn
    }); 
}

function UpdateMaintenanceRecord(record, callbackFn) {
    $.ajax({
        method: 'PUT',
        url: MAINTENANCE_LOGGER_URL + '/' + record.id,
        data: JSON.stringify(record),
        success: callbackFn,
        dataType: 'json',
        contentType: 'application/json'
    });
}

function getSingleMaintenanceRecords(id, callbackFn) {
    $.ajax({
        method: 'GET',
        url: MAINTENANCE_LOGGER_URL + '/'+ id,
        success: callbackFn,
        dataType: 'json',
        contentType: 'application/json'
    }); 
}

function displayMaintenanceRecords(data) {
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
    $(ADD_FORM_IDENTIFIER).append(
        'Part Name: <br>' + 
        '<input type="text" name="part" placeholder="part name" required> <br>' +
        'Status: <br>' + 
        '<input type="text" name="status" placeholder="current status" required> <br>' +
        'Needs repair?: <br>' + 
        '<input type="checkbox" name="repair" placeholder="off"> <br>' +
        'Last Maintenance: <br>' + 
        '<input type="date" name="lastMaintenance" required> <br>' +
        'Freq (days): <br>' + 
        '<input type="text" name="frequency" value="0" required> <br>' + 
        '<br><br>' +
        '<input type="submit" value="Add">'
    );
    $('input[name="lastMaintenance"]').val(new Date().toDateInputValue());
}

function displayUpdateRecord(data) {
    resetScreens();
    $(UPDATE_FORM_IDENTIFIER).append(
        'Part Name: <br>' + 
        '<input type="text" name="part" value="' + data.part + '" required> <br>' +
        'Status: <br>' + 
        '<input type="text" name="status" value="' + data.status + '" required> <br>' +
        'Repair: <br>' + 
        '<input type="checkbox" name="repair" value="' + data.needsRepair + '"> <br>' +
        'Last Maintenance: <br>' + 
        '<input type="date" name="lastMaintenance" value=' + data.lastMaintenance.substring(0,10) + ' required> <br>' +
        'Frequency: <br>' + 
        '<input type="text" name="frequency" value=' + data.frequency + ' required> <br>' + 
        'id: <br>' + 
        '<input type="text" name="id" value="' + data.id + '" readonly> <br>' + 
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
        '<br><br><input class="js-delete-record-btn" id=' + data.id + ' type="button" value="Delete">'
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
    getAndDisplayMaintenanceRecords();
}

function displayUpdateResults(data) {
    resetScreens();
    $(RESULTS_FROM_REQUEST_IDENTIFIER).empty().append(
        '<p>Updated record</p>'
    );
    getAndDisplayMaintenanceRecords();
}

function viewAddRecord() {
    displayAddRecord();
}

function viewUpdateRecord(id) {
    getSingleMaintenanceRecords(id, displayUpdateRecord);
}

function viewDeleteRecord(id) {
    getSingleMaintenanceRecords(id, displayDeleteRecord);
}

function getAndDisplayMaintenanceRecords() {
	getMaintenanceRecords(displayMaintenanceRecords);
}

function addRecord(record){
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
  input = document.getElementById('filterPart');
  filter = input.value.toUpperCase();
  table = document.getElementById('listTable');
  tr = table.getElementsByTagName('tr');

  // Loop through all table rows, and hide those who don't match the search query
  for (i = 0; i < tr.length; i++) {
    td = tr[i].getElementsByTagName('td')[0];
    if (td) {
      if (td.innerHTML.toUpperCase().indexOf(filter) > -1) {
        tr[i].style.display = '';
      } else {
        tr[i].style.display = 'none';
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
    var data = $(UPDATE_FORM_IDENTIFIER).serializeArray().reduce(function(m,o){ m[o.name] = o.value; return m;}, {});
    updateRecord(data);
  });
}

function watchDeleteBtn() {
  $(DELETE_CONFIRMATION_IDENTIFIER).on('click', '.js-delete-record-btn', function(event) {
    event.preventDefault();
    // get data from api
    deleteRecord(event.currentTarget.id);
  });
}

function watchShowMaintenanceBtn() {
  $(RESULTS_FROM_REQUEST_IDENTIFIER).on('click', '.js-show-maintenance-record-btn', function(event) {
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