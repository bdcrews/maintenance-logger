'use strict';

const ADD_FORM_IDENTIFIER = '#addForm';
const UPDATE_FORM_IDENTIFIER = '#updateForm';
const RESULT_POPUP_IDENTIFIER = '#resultPopup';
const RESULT_FROM_REQUEST_IDENTIFIER = '.resultFromRequest';
const ADD_BUTTON_IDENTIFIER = '.addButton';
const NEXT_BUTTON_IDENTIFIER = '.nextButton';
const PREV_BUTTON_IDENTIFIER = '.prevButton';
const SEARCH_BUTTON_IDENTIFIER = '.searchButton';
const SHOW_FILTERS_BUTTON_IDENTIFIER = '.showFiltersButton';
const FILTER_FORM_IDENTIFIER = '#filterForm';
const MAINTENANCE_LOGGER_URL = '/records';
const RECORDS_TABLE_IDENTIFIER = '#listTable';
const RECORDS_TABLE_BODY_IDENTIFIER = '#listTable Tbody';
const RECORDS_PER_PAGE_IDENTIFIER = '#recordsPerPage';
const CURRENT_PAGE_IDENTIFIER = '.currentPage';
const ADD_OVERLAY_IDENTIFIER = '.addOverlay';

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
  $(RECORDS_TABLE_BODY_IDENTIFIER).empty();
  $(RECORDS_TABLE_BODY_IDENTIFIER).append(
    data.map((record) => { return(`
      <tr data-id='${record.id}' >
      <td> ${record.part} </td>
      <td> ${record.status} </td>
      <td> ${record.needsRepair} </td>
      <td> ${new Date(record.lastMaintenance)} </td>
      <td> ${record.frequency} </td>
      </tr>
    `)})
  );
}

Date.prototype.toDateInputValue = (function() {
  var local = new Date(this);
  local.setMinutes(this.getMinutes() - this.getTimezoneOffset());
  return local.toJSON().slice(0,10);
});

function displayFilter(show, instant = false ) {
  if(show) {
    $(FILTER_FORM_IDENTIFIER).slideDown( instant ? 0 : 'fast');
    $(SHOW_FILTERS_BUTTON_IDENTIFIER).css('background-image', 'url(/filter-up.png)');
  }
  else {
    $(FILTER_FORM_IDENTIFIER).slideUp(instant ? 0 : 'fast');
    $(SHOW_FILTERS_BUTTON_IDENTIFIER).css('background-image', 'url(/filter-down.png)');
  }
}

function displayAddRecord(data) {
  $('#addOverlay').css('display','flex');
  $(ADD_FORM_IDENTIFIER + ' input[name="lastMaintenance"]').val(new Date().toDateInputValue());

  $(ADD_FORM_IDENTIFIER + ' input[name="part"]').focus();
}

function displayUpdateRecord(data) {
  $('#updateOverlay').css('display','flex');

  $(UPDATE_FORM_IDENTIFIER + ' input[name="part"]').val(data.part);
  $(UPDATE_FORM_IDENTIFIER + ' input[name="status"]').val(data.status);
  $(UPDATE_FORM_IDENTIFIER + ' input[name="needsRepair"][value=true]').prop('checked', data.needsRepair);
  $(UPDATE_FORM_IDENTIFIER + ' input[name="needsRepair"][value=false]').prop('checked', !data.needsRepair);
  $(UPDATE_FORM_IDENTIFIER + ' input[name="lastMaintenance"]').val(data.lastMaintenance.substring(0,10));
  $(UPDATE_FORM_IDENTIFIER + ' input[name="frequency"]').val(data.frequency);
  $(UPDATE_FORM_IDENTIFIER + ' input[name="id"]').val(data.id);
  $('.js-delete-record-btn').attr('id',data.id);

  $(UPDATE_FORM_IDENTIFIER + ' input[name="part"]').focus();
}

function createFiltersForm(data) {
  $(FILTER_FORM_IDENTIFIER).append(`
    <ul>
    <h2>Filter Search</h2>
    <li><label>Part name: </label><input type='text' name='part' placeholder='all parts'></li>
    <li><label>Status: </label><input type='text' name='status' placeholder='any status'></li>
    <li><label>Needs repair: </label><input type='radio' name='needsRepair' value=true>true <input type='radio' name='needsRepair' value=false>false<input type='radio' name='needsRepair' value='any' checked='checked'>any</li>
    <li><label>Begin date: </label><input type='date' name='beginDate' placeholder='begin date'></li>
    <li><label>End date: </label><input type='date' name='endDate' placeholder='end date'></li>
    <button type='button' class='searchButton'>Search</button>
    </ul>
  `);
  displayFilter(false, true);
}

function displayAddResult(data) {
  $('#addOverlay').css('display','none');
  displayResult('Added new record successfully.');
}

function displayDeleteResult(data) {
  $('#deleteOverlay').css('display','none');
  displayResult('Deleted record successfully.');
}

function displayUpdateResult(data) {
  $('#updateOverlay').css('display','none');
  displayResult('Updated record successfully.');
}

function displayResult(resultString, data) {
  $(RESULT_FROM_REQUEST_IDENTIFIER).text(resultString);

  $('#resultOverlay').css('display','flex');
  getAndDisplayMaintenanceRecords();
}

function displayResult(resultString, data) {
  $('#updateOverlay').css('display','none');
  $(RESULT_FROM_REQUEST_IDENTIFIER).text(resultString);

  $('#resultOverlay').css('display','flex');
  getAndDisplayMaintenanceRecords();
}

function viewAddRecord() {
  displayAddRecord();
}

function viewUpdateRecord(id) {
  getSingleMaintenanceRecords(id, displayUpdateRecord);
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
    currentPage: $(CURRENT_PAGE_IDENTIFIER).text(),
    pageQuantity: $(RECORDS_PER_PAGE_IDENTIFIER).find(':selected').attr('value')
  };

  let query = {
    filter: filter,
    location: location,
    sort: sortState
  }

	getMaintenanceRecords(query, displayMaintenanceRecords);
}

function addRecord(record){
  addMaintenanceRecord(record, displayAddResult);
}

function deleteRecord(id) {
  deleteMaintenanceRecord(id, displayDeleteResult);
}

function updateRecord(record) {
  UpdateMaintenanceRecord(record, displayUpdateResult);
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
  $(UPDATE_FORM_IDENTIFIER).on('click', '.js-delete-record-btn', function(event) {
  event.preventDefault();
  if(confirm('Are you sure you want to delete this record?')) deleteRecord(event.currentTarget.id);
  });
}

function watchCancelBtn() {
  $(UPDATE_FORM_IDENTIFIER).on('click', '.js-cancel-btn', function(event) {
  event.preventDefault();
  $('#updateOverlay').css('display','none');
  });

  $(ADD_FORM_IDENTIFIER).on('click', '.js-cancel-btn', function(event) {
  event.preventDefault();
  $('#addOverlay').css('display','none');
  });

  $(RESULT_POPUP_IDENTIFIER).on('click', '.js-cancel-btn', function(event) {
  event.preventDefault();
  $('#resultOverlay').css('display','none');
  });
}

function watchAddMaintenanceBtn() {
  $(ADD_BUTTON_IDENTIFIER).click((event) => {
  event.preventDefault();
  displayAddRecord();
  });
}
function watchNextPageBtn() {
  $(NEXT_BUTTON_IDENTIFIER).click((event) => {
  event.preventDefault();
   $(PREV_BUTTON_IDENTIFIER).attr('disabled', false);
  $(CURRENT_PAGE_IDENTIFIER).text(+$(CURRENT_PAGE_IDENTIFIER).text()+1);
  getAndDisplayMaintenanceRecords();
  });
}
function watchPrevPageBtn() {
  $(PREV_BUTTON_IDENTIFIER).click((event) => {
  event.preventDefault();
  let newCurrentPage = +$(CURRENT_PAGE_IDENTIFIER).text()-1;
  $(CURRENT_PAGE_IDENTIFIER).text(newCurrentPage);
  if(newCurrentPage <= 0)  $(PREV_BUTTON_IDENTIFIER).attr('disabled', true);
  getAndDisplayMaintenanceRecords();
  });
}

function watchSearchBtn() {
  $(FILTER_FORM_IDENTIFIER).on('click', SEARCH_BUTTON_IDENTIFIER, function(event) {
  event.preventDefault();
  getAndDisplayMaintenanceRecords();
  });
}

function watchShowFiltersBtn() {
  $(SHOW_FILTERS_BUTTON_IDENTIFIER).click((event) => {
  event.preventDefault();
  displayFilter($(FILTER_FORM_IDENTIFIER).css('display') == 'none');
  });
}

function watchTableRow() {
  $(RECORDS_TABLE_IDENTIFIER).on('click', 'tbody tr', function(event) {
  viewUpdateRecord($(event.currentTarget).data('id'));
  event.preventDefault();
  });
}

let sortState = {part: 1};
function watchHeaders() {
  $('th').click((event) => {
  event.preventDefault();
  let sortByField = $(event.currentTarget).data('sort');

  let sortDirection;
  if(sortByField in sortState) {
    sortDirection = sortState[sortByField] * -1; // toggle between 1 & -1 for sort order
  }
  else {
    sortDirection = 1;
  }

  //clear old sort header's image, then update new sort header's image
  $(`th[data-sort=${Object.keys(sortState)[0]}] img`).attr('src','');
  $(`th[data-sort=${sortByField}] img`).attr('src', (sortDirection == 1) ? 'sort-down.png' : 'sort-up.png');

  sortState = {};
  sortState[sortByField] = sortDirection;
  getAndDisplayMaintenanceRecords();
  });
}

function watchRecordsPerPage() {
  $(RECORDS_PER_PAGE_IDENTIFIER).change((event) => {
  event.preventDefault();
  $(CURRENT_PAGE_IDENTIFIER).text(0),
  getAndDisplayMaintenanceRecords();
  });
}

//  on page load do this
$(function() {
  watchUpdateBtn();
  watchDeleteBtn();
  watchCancelBtn();
  watchAddBtn();
  watchAddMaintenanceBtn();
  watchSearchBtn();
  watchShowFiltersBtn();
  watchHeaders();
  createFiltersForm();
  watchTableRow();
  watchRecordsPerPage();
  watchRecordsPerPage();
  watchPrevPageBtn();
  watchNextPageBtn();

  getAndDisplayMaintenanceRecords();
});