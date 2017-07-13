'use strict';

const ADD_FORM_IDENTIFIER = '#addForm';
const UPDATE_FORM_IDENTIFIER = '#updateForm';
const DELETE_CONFIRMATION_IDENTIFIER = '.deleteConfirmation';
const RESULTS_FROM_REQUEST_IDENTIFIER = '.resultsFromRequest';
const ADD_BUTTON_IDENTIFIER = '.addButton';
const LIST_RECORDS_BUTTON_IDENTIFIER = '.listRecordsButton';
const SHOW_FILTERS_BUTTON_IDENTIFIER = '.showFiltersButton';
const FILTER_FORM_IDENTIFIER = '#filterForm';
const MAINTENANCE_LOGGER_URL = '/records';
const RECORDS_TABLE_IDENTIFIER = '#listTable';

function getMaintenanceRecords(query, callbackFn) {
    $.ajax({
        method: 'GET',
        url: MAINTENANCE_LOGGER_URL,
        data: query,
        success: callbackFn,
        dataType: 'json',
        contentType: 'application/json'
    }); 
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

    $('#listTable tbody').append(
        data.map((record) => { return(`
            <tr>
            <td> ${record.part} </td>
            <td> ${record.status} </td>
            <td> ${record.needsRepair} </td>
            <td> ${new Date(record.lastMaintenance)} </td>
            <td> ${record.frequency} </td>
            <td> 
                <button type="button" onclick=viewUpdateRecord("${record.id}")>Update</button> 
                <button type="button" onclick=viewDeleteRecord("${record.id}")>Delete</button> 
            </td>
            </tr>
        `)})
    );
}

Date.prototype.toDateInputValue = (function() {
    var local = new Date(this);
    local.setMinutes(this.getMinutes() - this.getTimezoneOffset());
    return local.toJSON().slice(0,10);
});

function displayAddRecord(data) {
    resetScreens();
    $(ADD_BUTTON_IDENTIFIER).prop("disabled", true);
    $(ADD_FORM_IDENTIFIER).append(`
        Part Name: <br> 
        <input type="text" name="part" placeholder="part name" required> <br>
        Status: <br> 
        <input type="text" name="status" placeholder="current status" required> <br>
        Needs repair?: <br> 
        <input type="radio" name="needsRepair" value=true> true <br>
        <input type="radio" name="needsRepair" value=false checked> false <br>
        Last Maintenance: <br> 
        <input type="date" name="lastMaintenance" value required> <br>
        Freq (days): <br> 
        <input type="number" name="frequency" value="0" required> <br> 
        <br><br>
        <input type="submit" value="Add">
    `);
    $('input[name="lastMaintenance"]').val(new Date().toDateInputValue());
}

function displayUpdateRecord(data) {
    resetScreens();
    $(UPDATE_FORM_IDENTIFIER).append(`
        Part Name: <br> 
        <input type="text" name="part" value="${data.part}" required> <br>
        Status: <br> 
        <input type="text" name="status" value="${data.status}" required> <br>
        Repair: <br> 
        <input type="radio" name="needsRepair" value=true> true <br>
        <input type="radio" name="needsRepair" value=false> false <br>
        Last Maintenance: <br> 
        <input type="date" name="lastMaintenance" value=${data.lastMaintenance.substring(0,10)} required> <br>
        Frequency: <br> 
        <input type="number" name="frequency" value=${data.frequency}  required> <br> 
        id: <br> 
        <input type="text" name="id" value="${data.id}" readonly> <br> 
        <br><br>
        <input type="submit" value="Update">
    `);
    $(UPDATE_FORM_IDENTIFIER + ' input[name="needsRepair"][value=true]').prop("checked", data.needsRepair);
    $(UPDATE_FORM_IDENTIFIER + ' input[name="needsRepair"][value=false]').prop("checked", !data.needsRepair);
}

function displayDeleteRecord(data) {
    resetScreens();
    $(DELETE_CONFIRMATION_IDENTIFIER).append(`
        <p>Part Name:  ${data.part} </p>
        <p>Status: ${data.status} </p>
        <p>Repair: ${data.needsRepair} </p>
        <p>Last Maintenance: ${data.lastMaintenance} </p>
        <p>Freq: ${data.frequency} </p>
        <br><br><input class="js-delete-record-btn" id= ${data.id}  type="button" value="Delete">
    `);
}

function createFiltersForm(data) {
    $(FILTER_FORM_IDENTIFIER).hide();
    $(FILTER_FORM_IDENTIFIER).append(`
        <ul>
        <li><p>Part name: </p><input type="text" name="part" placeholder="all parts"></li>
        <li><p>Status: </p><input type="text" name="status" placeholder="any status"></li>
        <li><p>Needs repair: </p><input type="radio" name="needsRepair" value=true>true <input type="radio" name="needsRepair" value=false>false<input type="radio" name="needsRepair" value="any" checked="checked">any</li>
        <li><p>Begin date: </p><input type="date" name="beginDate" placeholder="begin date"></li>
        <li><p>End date: </p><input type="date" name="endDate" placeholder="end date"></li>
        </ul>
    `);
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

    let data = $(FILTER_FORM_IDENTIFIER).serializeArray().reduce(function(m,o){ m[o.name] = o.value; return m;}, {});

    let filter = {};
    if(data.part != '') filter.part = data.part;
    if(data.status != '') filter.status = data.status;
    if(data.needsRepair != 'any') filter.needsRepair = (data.needsRepair=='true');

    if (data.beginDate != '') {
        filter.lastMaintenance = {};
        filter.lastMaintenance.$gt =  data.beginDate;
    }
    if (data.endDate != '') {
        filter.lastMaintenance = filter.lastMaintenance || {};
        filter.lastMaintenance.$lt =  data.endDate;
    }

    let location = {
        currentPage: 0,
        pageQuantity: 20
    };

    let query = {
        filter: filter, 
        location: location
    }

	getMaintenanceRecords(query, displayMaintenanceRecords);
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

function resetScreens() {
    $(ADD_BUTTON_IDENTIFIER).prop('disabled', false);
//    $(LIST_RECORDS_BUTTON_IDENTIFIER).prop("disabled", false);
    $('#listTable tbody').empty();
    $(UPDATE_FORM_IDENTIFIER).empty();
    $(ADD_FORM_IDENTIFIER).empty();
    $(DELETE_CONFIRMATION_IDENTIFIER).empty();
}

function watchAddBtn() {
  $(ADD_FORM_IDENTIFIER).submit(function(event) {
    event.preventDefault();
    let data = $(ADD_FORM_IDENTIFIER).serializeArray().reduce(function(m,o){ m[o.name] = o.value; return m;}, {});
    if('needsRepair' in data) data.needsRepair = (data.needsRepair == 'true');
    addRecord(data);
  });
}

function watchUpdateBtn() {
  $(UPDATE_FORM_IDENTIFIER).submit(function(event) {
    event.preventDefault();
    let data = $(UPDATE_FORM_IDENTIFIER).serializeArray().reduce(function(m,o){ m[o.name] = o.value; return m;}, {});
    if('needsRepair' in data) data.needsRepair = (data.needsRepair == 'true');
    updateRecord(data);
  });
}

function watchDeleteBtn() {
  $(DELETE_CONFIRMATION_IDENTIFIER).on('click', '.js-delete-record-btn', function(event) {
    event.preventDefault();
    deleteRecord(event.currentTarget.id);
  });
}


function watchAddMaintenanceBtn() {
  $(ADD_BUTTON_IDENTIFIER).click((event) => {
    displayAddRecord();
  });
}

function watchListRecordsBtn() {
  $(LIST_RECORDS_BUTTON_IDENTIFIER).click((event) => {
    event.preventDefault();
    getAndDisplayMaintenanceRecords();
  });
}

function watchShowFiltersBtn() {
  $(SHOW_FILTERS_BUTTON_IDENTIFIER).click((event) => {
    event.preventDefault();
    $(FILTER_FORM_IDENTIFIER).toggle('fast');
    if($(FILTER_FORM_IDENTIFIER).css('display') == 'none') {
        $(SHOW_FILTERS_BUTTON_IDENTIFIER).text("Show filters");
    }
    else {
        $(SHOW_FILTERS_BUTTON_IDENTIFIER).text("Hide filters");
    }
  });
};

//  on page load do this
$(function() {
    createFiltersForm();
    watchUpdateBtn();
    watchDeleteBtn();
    watchAddBtn();
    watchAddMaintenanceBtn();
    watchListRecordsBtn();
    watchShowFiltersBtn();
    getAndDisplayMaintenanceRecords();
});