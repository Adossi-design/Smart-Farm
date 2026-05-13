const { User, Report } = require('../models');

// Create a new report
exports.createReport = async (req, res) => {
  try {
    const { reportedSellerId, orderId, reason, description } = req.body;
    const reporterId = req.user.id;

    // Validate input
    if (!reportedSellerId || !reason || !description) {
      return res.status(400).json({ message: 'Please provide reportedSellerId, reason, and description' });
    }

    // Check if seller exists
    const seller = await User.findByPk(reportedSellerId);
    if (!seller) {
      return res.status(404).json({ message: 'Seller not found' });
    }

    // Check if already reported by this user
    const existingReport = await Report.findOne({
      where: { reporterId, reportedSellerId, status: ['pending', 'reviewed'] }
    });

    if (existingReport) {
      return res.status(400).json({ message: 'You have already submitted a report for this seller' });
    }

    // Create report
    const report = await Report.create({
      reporterId,
      reportedSellerId,
      orderId,
      reason,
      description
    });

    res.status(201).json({
      message: 'Report submitted successfully',
      report
    });
  } catch (error) {
    console.error('Create report error:', error);
    res.status(500).json({ message: 'Error creating report', error: error.message });
  }
};

// Get all reports (admin only)
exports.getAllReports = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can view all reports' });
    }

    const { status } = req.query;
    const where = {};
    if (status) {
      where.status = status;
    }

    const reports = await Report.findAll({
      where,
      include: [
        {
          model: User,
          as: 'reporter',
          attributes: ['id', 'name', 'email']
        },
        {
          model: User,
          as: 'reportedSeller',
          attributes: ['id', 'name', 'profession', 'email', 'averageRating']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({ reports });
  } catch (error) {
    console.error('Get all reports error:', error);
    res.status(500).json({ message: 'Error fetching reports', error: error.message });
  }
};

// Get reports for a specific seller (admin or the seller themselves)
exports.getSellerReports = async (req, res) => {
  try {
    const { sellerId } = req.params;

    // Check if user is the seller or admin
    if (req.user.id !== parseInt(sellerId) && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You do not have permission to view these reports' });
    }

    const reports = await Report.findAll({
      where: { reportedSellerId: sellerId },
      include: [
        {
          model: User,
          as: 'reporter',
          attributes: ['id', 'name', 'email']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({ reports });
  } catch (error) {
    console.error('Get seller reports error:', error);
    res.status(500).json({ message: 'Error fetching reports', error: error.message });
  }
};

// Update report status (admin only)
exports.updateReportStatus = async (req, res) => {
  try {
    const { reportId } = req.params;
    const { status, adminNotes } = req.body;

    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can update report status' });
    }

    // Validate status
    const validStatuses = ['pending', 'reviewed', 'resolved', 'dismissed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: `Status must be one of: ${validStatuses.join(', ')}` });
    }

    const report = await Report.findByPk(reportId);
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    await report.update({
      status,
      adminNotes: adminNotes || report.adminNotes
    });

    res.status(200).json({
      message: 'Report updated successfully',
      report
    });
  } catch (error) {
    console.error('Update report status error:', error);
    res.status(500).json({ message: 'Error updating report', error: error.message });
  }
};

// Get buyer's submitted reports
exports.getBuyerReports = async (req, res) => {
  try {
    const reporterId = req.user.id;

    const reports = await Report.findAll({
      where: { reporterId },
      include: [
        {
          model: User,
          as: 'reportedSeller',
          attributes: ['id', 'name', 'profession', 'email']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({ reports });
  } catch (error) {
    console.error('Get buyer reports error:', error);
    res.status(500).json({ message: 'Error fetching reports', error: error.message });
  }
};
