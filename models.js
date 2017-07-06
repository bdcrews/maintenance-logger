const mongoose = require('mongoose');

const maintenanceRecordSchema = mongoose.Schema({
  part: {type: String},
  status: {type: String},
  needsRepair: {type: String},
  lastMaintenance: {type: Date, default: Date.now},
  frequency: {type: Number}
});

maintenanceRecordSchema.methods.apiRepr = function() {
  return {
    id: this._id,
    part: this.part,
    status: this.status,
    needsRepair: this.needsRepair,
    lastMaintenance: this.lastMaintenance,
    frequency: this.frequency
  };
}

const MaintenanceLog = mongoose.model('MaintenanceLog', maintenanceRecordSchema);

module.exports = {MaintenanceLog};