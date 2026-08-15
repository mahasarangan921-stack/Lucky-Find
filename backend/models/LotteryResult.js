const mongoose = require('mongoose');

const LotteryResultSchema = new mongoose.Schema(
  {
    externalId: { type: String, required: true, unique: true },
    drawDate: { type: Date, required: true },
    categoryId: { type: String, required: true },
    categoryName: { type: String, required: true },
    series: { type: String },
    drawCode: { type: String },
    year: { type: Number },
    monthLabel: { type: String },
    type: { type: String },
    prizes: { type: [mongoose.Schema.Types.Mixed], default: [] },
    sourceUrl: { type: String, required: true },
    sourceTitle: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('LotteryResult', LotteryResultSchema);
