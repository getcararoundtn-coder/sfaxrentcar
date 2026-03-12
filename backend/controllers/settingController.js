const Setting = require('../models/Setting');

// @desc جلب إعدادات الموقع
// @route GET /api/settings
// @access Public
exports.getSettings = async (req, res) => {
  try {
    let settings = await Setting.findOne();
    if (!settings) {
      settings = new Setting();
      await settings.save();
    }
    res.json({ success: true, data: settings });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc تحديث إعدادات الموقع
// @route PUT /api/settings
// @access Private/Admin
exports.updateSettings = async (req, res) => {
  try {
    let settings = await Setting.findOne();
    if (!settings) {
      settings = new Setting(req.body);
    } else {
      Object.assign(settings, req.body);
    }
    await settings.save();
    res.json({ success: true, data: settings });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};