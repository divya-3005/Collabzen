const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  text: { type: String, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  type: { type: String, enum: ['task_created', 'task_completed', 'comment_added', 'project_created'], default: 'task_created' },
}, { timestamps: true });

module.exports = mongoose.model('Activity', activitySchema);
