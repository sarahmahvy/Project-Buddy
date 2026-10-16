/**
 * Seed Script — Initializes the database with Administrator credentials
 * Run with: npm run seed
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('./config/db');
const User = require('./models/User');
const Project = require('./models/Project');
const Request = require('./models/Request');
const Announcement = require('./models/Announcement');
const CollaborationMessage = require('./models/CollaborationMessage');

const seedUsers = [
    {
        name: 'System Administrator',
        email: 'admin@projectbuddy.edu',
        password: 'admin123',
        role: 'admin',
        anonToken: 'ADMIN_ROOT_001',
        university: 'ProjectBuddy Academic Network',
        department: 'Computer Science',
        year: 'PhD',
        skills: ['Platform Moderation', 'System Security', 'Analytics'],
        bio: 'Platform administration and privacy compliance custodian.'
    }
];

const seedAnnouncements = [
    {
        title: '🛡️ Zero-Knowledge IP Security Notice',
        message: 'Welcome to ProjectBuddy! Post your project idea title securely — full blueprints remain private until you accept a partner.',
        category: 'announcement',
        active: true
    }
];

async function seed() {
    try {
        await connectDB();

        console.log('🗑️  Clearing all existing bot data...');
        await User.deleteMany({});
        await Project.deleteMany({});
        await Request.deleteMany({});
        await Announcement.deleteMany({});
        await CollaborationMessage.deleteMany({});

        console.log('👤 Initializing Administrator account...');
        const createdUsers = [];
        for (const userData of seedUsers) {
            const user = await User.create(userData);
            createdUsers.push(user);
            console.log(`   ✅ [ADMIN] ${user.name} (${user.email})`);
        }

        console.log('\n📢 Initializing system announcements...');
        const adminUser = createdUsers.find(u => u.role === 'admin');
        for (const ann of seedAnnouncements) {
            await Announcement.create({
                ...ann,
                createdBy: adminUser ? adminUser._id : null
            });
            console.log(`   ✅ "${ann.title}"`);
        }

        console.log('\n🎉 Clean setup complete! All bot accounts have been removed.');
        console.log('📌 Real students can now sign up freely on the platform.');
        console.log('🛡️ Admin Portal: admin@projectbuddy.edu / admin123\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Seed error:', error);
        process.exit(1);
    }
}

seed();
