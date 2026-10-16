const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Project = require('../models/Project');
const Request = require('../models/Request');
const Announcement = require('../models/Announcement');
const { protect, adminOnly } = require('../middleware/auth');

// @route   GET /api/admin/metrics
// @desc    Get overall website operational telemetry
// @access  Admin Only
router.get('/metrics', protect, adminOnly, async (req, res) => {
    try {
        const totalStudents = await User.countDocuments({ role: 'student' });
        const activeStudents = await User.countDocuments({ role: 'student', status: 'active' });
        const suspendedStudents = await User.countDocuments({ status: 'suspended' });
        const totalProjects = await Project.countDocuments();
        const activePartnerships = await Request.countDocuments({ status: 'accepted' });
        const pendingRequests = await Request.countDocuments({ status: 'pending' });
        const flaggedProjects = await Project.countDocuments({ isFlagged: true });

        // Department distribution
        const departmentStats = await Project.aggregate([
            { $group: { _id: '$department', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        res.json({
            totalStudents,
            activeStudents,
            suspendedStudents,
            totalProjects,
            activePartnerships,
            pendingRequests,
            flaggedProjects,
            departmentStats,
            privacyShieldStatus: 'Active - Zero Knowledge Telemetry Enforced',
            systemUptime: process.uptime()
        });
    } catch (error) {
        console.error('Admin metrics error:', error);
        res.status(500).json({ message: 'Server error retrieving metrics' });
    }
});

// @route   GET /api/admin/accounts/anonymous
// @desc    Monitor all student accounts completely ANONYMOUSLY (Zero PII, no names or emails)
// @access  Admin Only
router.get('/accounts/anonymous', protect, adminOnly, async (req, res) => {
    try {
        const students = await User.find({ role: 'student' })
            .select('-password -name -email -bio') // STRICTLY scrub personal identifying info!
            .sort({ createdAt: -1 });

        // Augment with activity telemetry without exposing personal data
        const anonymousAccounts = await Promise.all(students.map(async (student) => {
            const projectCount = await Project.countDocuments({ user: student._id });
            const partnershipsFormed = await Request.countDocuments({
                $or: [
                    { fromUser: student._id, status: 'accepted' },
                    { toUser: student._id, status: 'accepted' }
                ]
            });
            const requestsDispatched = await Request.countDocuments({ fromUser: student._id });

            // Generate deterministic display pseudonym if anonToken not set
            const anonPseudonym = student.anonToken || ('STU_' + student._id.toString().slice(-6).toUpperCase());

            return {
                id: student._id,
                anonToken: anonPseudonym,
                department: student.department,
                year: student.year,
                universityType: student.university ? (student.university.includes('IIT') || student.university.includes('NIT') ? 'Govt Institute / University' : 'Accredited Institution') : 'Higher Education',
                skillsCount: student.skills ? student.skills.length : 0,
                skillsSample: student.skills ? student.skills.slice(0, 3) : [],
                status: student.status || 'active',
                projectCount,
                partnershipsFormed,
                requestsDispatched,
                joinedAt: student.createdAt
            };
        }));

        res.json({
            count: anonymousAccounts.length,
            privacyMode: 'ANONYMOUS_TELEMETRY',
            privacyNote: 'Student real names, contact emails, and personal bios are securely hidden to prevent surveillance bias.',
            accounts: anonymousAccounts
        });
    } catch (error) {
        console.error('Anonymous accounts error:', error);
        res.status(500).json({ message: 'Server error retrieving anonymous accounts' });
    }
});

// @route   PATCH /api/admin/accounts/:id/status
// @desc    Update account status (e.g. suspend or restore) anonymously
// @access  Admin Only
router.patch('/accounts/:id/status', protect, adminOnly, async (req, res) => {
    try {
        const { status } = req.body;
        if (!['active', 'suspended', 'flagged'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status provided.' });
        }

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        ).select('-password -name -email');

        if (!user) {
            return res.status(404).json({ message: 'Account not found' });
        }

        res.json({
            message: `Account status updated to ${status} anonymously`,
            accountId: user._id,
            status: user.status
        });
    } catch (error) {
        console.error('Update account status error:', error);
        res.status(500).json({ message: 'Server error updating account status' });
    }
});

// @route   GET /api/admin/projects
// @desc    Monitor project catalog with moderation metadata (private ideas hidden)
// @access  Admin Only
router.get('/projects', protect, adminOnly, async (req, res) => {
    try {
        const projects = await Project.find()
            .select('-description') // Protect student idea blueprint even from admin!
            .sort({ createdAt: -1 });

        res.json(projects);
    } catch (error) {
        console.error('Admin projects error:', error);
        res.status(500).json({ message: 'Server error retrieving projects' });
    }
});

// @route   DELETE /api/admin/projects/:id
// @desc    Admin moderation removal of offensive or spam project
// @access  Admin Only
router.delete('/projects/:id', protect, adminOnly, async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        await Request.deleteMany({ project: project._id });
        await Project.findByIdAndDelete(req.params.id);

        res.json({ message: 'Project moderated and removed successfully' });
    } catch (error) {
        console.error('Admin delete project error:', error);
        res.status(500).json({ message: 'Server error deleting project' });
    }
});

// @route   POST /api/admin/announcements
// @desc    Broadcast a new platform announcement
// @access  Admin Only
router.post('/announcements', protect, adminOnly, async (req, res) => {
    try {
        const { title, message, category } = req.body;
        if (!title || !message) {
            return res.status(400).json({ message: 'Title and message are required' });
        }

        const announcement = await Announcement.create({
            title,
            message,
            category: category || 'announcement',
            createdBy: req.user._id
        });

        res.status(201).json(announcement);
    } catch (error) {
        console.error('Announcement create error:', error);
        res.status(500).json({ message: 'Server error creating announcement' });
    }
});

// @route   GET /api/admin/announcements
// @desc    Get all platform announcements (Public to all students)
// @access  Public
router.get('/announcements', async (req, res) => {
    try {
        const announcements = await Announcement.find({ active: true })
            .sort({ createdAt: -1 })
            .limit(5);

        res.json(announcements);
    } catch (error) {
        console.error('Announcement get error:', error);
        res.status(500).json({ message: 'Server error retrieving announcements' });
    }
});

module.exports = router;
