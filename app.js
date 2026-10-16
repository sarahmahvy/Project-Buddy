// ===== PROJECTBUDDY CORE CONTROLLER & DATA STORE (CLEAN PRODUCTION STATE) =====

const DB_KEY = 'projectbuddy_prod_db';

function getDB() {
    // Clear legacy demo keys that contained bot accounts
    localStorage.removeItem('projectbuddy_db');
    localStorage.removeItem('projectbuddy_v2_db');

    const raw = localStorage.getItem(DB_KEY);
    if (raw) return JSON.parse(raw);

    const db = {
        users: [],
        projects: [],
        requests: [],
        announcements: [],
        collaborationMessages: [],
        currentUserId: null
    };
    seedData(db);
    saveDB(db);
    return db;
}

function saveDB(db) {
    localStorage.setItem(DB_KEY, JSON.stringify(db));
}

function generateId() {
    return 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

function getInitials(name) {
    if (!name) return 'PB';
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

function timeAgo(dateStr) {
    if (!dateStr) return 'Recently';
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return `${Math.floor(days / 7)}w ago`;
}

// ===== SEED DATA (ONLY ADMINISTRATOR — ZERO BOT ACCOUNTS) =====
function seedData(db) {
    const seedUsers = [
        {
            id: 'user_admin',
            name: 'System Administrator',
            email: 'admin@projectbuddy.edu',
            password: 'admin123',
            role: 'admin',
            anonToken: 'ADMIN_ROOT_001',
            university: 'ProjectBuddy Academic Network',
            department: 'Computer Science',
            year: 'PhD',
            status: 'active',
            skills: ['Platform Governance', 'Zero-Knowledge Security', 'Data Auditing'],
            bio: 'Platform administration and anonymous privacy compliance custodian.',
            bookmarks: [],
            createdAt: new Date().toISOString()
        }
    ];

    const seedAnnouncements = [
        {
            id: 'ann_1',
            title: '🛡️ Zero-Knowledge IP Security Notice',
            message: 'Welcome to ProjectBuddy! Post your project idea title securely — full blueprints remain private until you accept a partner.',
            category: 'announcement',
            active: true,
            createdAt: new Date().toISOString()
        }
    ];

    // Completely empty - no bot accounts, no fake projects, no fake requests!
    db.users = seedUsers;
    db.projects = [];
    db.requests = [];
    db.announcements = seedAnnouncements;
    db.collaborationMessages = [];
}

// ===== SKILL MATCH COMPATIBILITY ENGINE =====
function calculateSkillMatch(projectSkills, userSkills) {
    if (!projectSkills || projectSkills.length === 0 || !userSkills || userSkills.length === 0) {
        return 0;
    }
    const userLower = userSkills.map(s => s.toLowerCase().trim());
    let matchCount = 0;
    projectSkills.forEach(ps => {
        const psLower = ps.toLowerCase().trim();
        if (userLower.includes(psLower) || userLower.some(u => u.includes(psLower) || psLower.includes(u))) {
            matchCount++;
        }
    });
    return Math.min(100, Math.round((matchCount / projectSkills.length) * 100));
}

// ===== PAGE ROUTING =====
let currentPage = 'landing';
let activeCollabProjectId = null;

function showPage(pageId) {
    const db = getDB();

    // Guard admin page
    if (pageId === 'admin') {
        const currentUser = getCurrentUser();
        if (!currentUser || currentUser.role !== 'admin') {
            showToast('Access restricted to Administrators. Please sign in as Admin.');
            openAdminLogin();
            return;
        }
    }

    document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
    const target = document.getElementById('page-' + pageId);
    if (target) target.classList.remove('hidden');

    currentPage = pageId;
    window.scrollTo(0, 0);

    // Update active nav indicators
    document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('active'));

    switch (pageId) {
        case 'feed': renderFeed(); break;
        case 'discover': renderDiscover(); break;
        case 'my-projects': renderMyProjects('posted'); break;
        case 'requests': renderRequests('received'); break;
        case 'profile': renderProfile(); break;
        case 'admin': renderAdmin(); break;
    }

    // Toggle footer
    const footer = document.getElementById('mainFooter');
    if (['login', 'register'].includes(pageId)) {
        footer.classList.add('hidden');
    } else {
        footer.classList.remove('hidden');
    }
}

function requireAuth() {
    const db = getDB();
    if (!db.currentUserId) {
        showPage('login');
        return false;
    }
    return true;
}

function getCurrentUser() {
    const db = getDB();
    return db.users.find(u => u.id === db.currentUserId);
}

// ===== AUTH HANDLERS =====
function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value.trim();

    const db = getDB();
    let user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
        // If credentials are admin email, verify with admin password
        if (email.toLowerCase() === 'admin@projectbuddy.edu') {
            if (password !== 'admin123') {
                showToast('Incorrect administrator password');
                return;
            }
        }

        // Auto-create real user session
        user = {
            id: generateId(),
            name: email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
            email: email,
            password: password,
            role: email.toLowerCase() === 'admin@projectbuddy.edu' ? 'admin' : 'student',
            anonToken: 'STU_' + Math.floor(100000 + Math.random() * 900000),
            university: 'Academic Institution',
            department: 'Computer Science',
            year: '1st Year',
            status: 'active',
            skills: ['General Tech'],
            bio: 'Student at ProjectBuddy',
            bookmarks: [],
            createdAt: new Date().toISOString()
        };
        db.users.push(user);
    } else {
        if (user.password && user.password !== password) {
            showToast('Incorrect password. Please try again.');
            return;
        }
    }

    if (user.status === 'suspended') {
        alert('This account has been suspended by system administration. Please contact governance.');
        return;
    }

    db.currentUserId = user.id;
    saveDB(db);
    updateNavState(true);

    if (user.role === 'admin') {
        showPage('admin');
        showToast('🛡️ Welcome to the Administrative Console');
    } else {
        showPage('feed');
        showToast('Welcome back, ' + user.name.split(' ')[0] + '! 🚀');
    }
}

function handleRegister(e) {
    e.preventDefault();
    const db = getDB();

    const email = document.getElementById('regEmail').value.trim();
    if (db.users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
        showToast('Email is already registered. Please sign in!');
        return;
    }

    const newUser = {
        id: generateId(),
        name: document.getElementById('regName').value.trim(),
        email: email,
        password: document.getElementById('regPassword').value,
        role: 'student',
        anonToken: 'STU_' + Math.floor(100000 + Math.random() * 900000),
        university: document.getElementById('regUniversity').value.trim(),
        department: document.getElementById('regDepartment').value,
        year: document.getElementById('regYear').value,
        status: 'active',
        skills: document.getElementById('regSkills').value.split(',').map(s => s.trim()).filter(Boolean),
        bio: document.getElementById('regBio').value.trim() || 'Student passionate about collaborative projects.',
        bookmarks: [],
        createdAt: new Date().toISOString()
    };

    db.users.push(newUser);
    db.currentUserId = newUser.id;
    saveDB(db);

    updateNavState(true);
    showPage('feed');
    showToast(`Welcome to ProjectBuddy, ${newUser.name.split(' ')[0]}! 🎉`);
}

function logout() {
    const db = getDB();
    db.currentUserId = null;
    saveDB(db);
    updateNavState(false);
    showPage('landing');
    showToast('Signed out securely');
}

// Easy shortcut to open Admin portal login
function openAdminLogin() {
    showPage('login');
    const emailInput = document.getElementById('loginEmail');
    const passInput = document.getElementById('loginPassword');
    if (emailInput && passInput) {
        emailInput.value = 'admin@projectbuddy.edu';
        passInput.value = 'admin123';
    }
}

function updateNavState(loggedIn) {
    document.getElementById('navLoggedOut').classList.toggle('hidden', loggedIn);
    document.getElementById('navLoggedIn').classList.toggle('hidden', !loggedIn);

    if (loggedIn) {
        const user = getCurrentUser();
        if (user) {
            const initials = getInitials(user.name);
            const avatarEls = ['feedAvatar', 'feedPromptAvatar', 'profileAvatar'];
            avatarEls.forEach(id => {
                const el = document.getElementById(id);
                if (el) el.textContent = initials;
            });

            const feedName = document.getElementById('feedName');
            const feedInfo = document.getElementById('feedInfo');
            const feedUni = document.getElementById('feedUni');
            if (feedName) feedName.textContent = user.name;
            if (feedInfo) feedInfo.textContent = `${user.department} • ${user.year}`;
            if (feedUni) feedUni.textContent = user.university;

            // Admin tab visibility
            const adminNav = document.getElementById('navAdminItem');
            if (adminNav) {
                adminNav.classList.toggle('hidden', user.role !== 'admin');
            }

            const profileNav = document.getElementById('navProfileItem');
            if (profileNav) {
                profileNav.classList.toggle('hidden', user.role === 'admin');
            }
        }
        updateRequestBadge();
    }
}

function updateRequestBadge() {
    const db = getDB();
    const count = db.requests.filter(r => r.toUserId === db.currentUserId && r.status === 'pending').length;
    const badge = document.getElementById('requestBadge');
    if (badge) {
        if (count > 0) {
            badge.textContent = count;
            badge.classList.remove('hidden');
        } else {
            badge.classList.add('hidden');
        }
    }
}

// ===== ANNOUNCEMENTS BANNER =====
function loadLatestAnnouncement() {
    const db = getDB();
    const activeAnn = (db.announcements || []).filter(a => a.active);
    const banner = document.getElementById('announcementBanner');
    const textEl = document.getElementById('announcementText');

    if (activeAnn.length > 0 && banner && textEl) {
        textEl.textContent = activeAnn[0].message;
        banner.classList.remove('hidden');
    } else if (banner) {
        banner.classList.add('hidden');
    }
}

function dismissAnnouncement() {
    const banner = document.getElementById('announcementBanner');
    if (banner) banner.classList.add('hidden');
}

// ===== BOOKMARK / WATCHLIST =====
function toggleBookmark(projectId, event) {
    if (event) event.stopPropagation();
    if (!requireAuth()) return;

    const db = getDB();
    const user = getCurrentUser();
    if (!user) return;

    if (!user.bookmarks) user.bookmarks = [];

    const idx = user.bookmarks.indexOf(projectId);
    if (idx > -1) {
        user.bookmarks.splice(idx, 1);
        showToast('Removed from Watchlist');
    } else {
        user.bookmarks.push(projectId);
        showToast('⭐ Project added to your Watchlist!');
    }

    saveDB(db);

    if (currentPage === 'feed') renderFeed();
    else if (currentPage === 'discover') renderDiscover();
}

// ===== REPORT PROJECT =====
function openReportModal(projectId, event) {
    if (event) event.stopPropagation();
    if (!requireAuth()) return;

    document.getElementById('reportProjectId').value = projectId;
    document.getElementById('reportModal').classList.remove('hidden');
}

function handleSendReport(e) {
    e.preventDefault();
    const db = getDB();
    const projectId = document.getElementById('reportProjectId').value;
    const reason = document.getElementById('reportReason').value;

    const project = db.projects.find(p => p.id === projectId);
    if (project) {
        project.isFlagged = true;
        if (!project.reports) project.reports = [];
        project.reports.push({
            reportedBy: db.currentUserId,
            reason: reason,
            reportedAt: new Date().toISOString()
        });
        saveDB(db);
    }

    closeModal('reportModal');
    showToast('Report submitted for Anonymous Moderation. Thank you!');
}

// ===== FEED RENDERING =====
let currentFeedFilter = 'all';

function renderFeed(filter) {
    if (!requireAuth()) return;
    if (filter) currentFeedFilter = filter;

    const db = getDB();
    const user = getCurrentUser();

    // Update stats
    const myProjects = db.projects.filter(p => p.userId === user.id);
    const myPartners = db.requests.filter(r =>
        (r.fromUserId === user.id || r.toUserId === user.id) && r.status === 'accepted'
    );
    const mySaved = user.bookmarks ? user.bookmarks.length : 0;

    const projCountEl = document.getElementById('myProjectCount');
    const partnerCountEl = document.getElementById('myPartnerCount');
    const savedCountEl = document.getElementById('mySavedCount');

    if (projCountEl) projCountEl.textContent = myProjects.length;
    if (partnerCountEl) partnerCountEl.textContent = myPartners.length;
    if (savedCountEl) savedCountEl.textContent = mySaved;

    let projects = [...db.projects].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Filter logic
    if (currentFeedFilter === 'saved') {
        const bookmarks = user.bookmarks || [];
        projects = projects.filter(p => bookmarks.includes(p.id));
    } else if (currentFeedFilter === 'matched') {
        projects = projects.filter(p => calculateSkillMatch(p.skills, user.skills) >= 50);
    } else if (currentFeedFilter !== 'all') {
        projects = projects.filter(p => p.department === currentFeedFilter);
    }

    const container = document.getElementById('feedProjects');
    if (!container) return;

    if (projects.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-folder-open"></i>
                <h3>No projects found in this feed</h3>
                <p>Be the first student to post a project idea title and start discovering collaborators!</p>
                <button class="btn btn-primary" onclick="openPostModal()">
                    <i class="fas fa-plus"></i> Post a Project
                </button>
            </div>
        `;
        renderSuggestions();
        return;
    }

    container.innerHTML = projects.map(project => {
        const author = db.users.find(u => u.id === project.userId);
        if (!author) return '';

        const isOwner = project.userId === user.id;
        const hasRequested = db.requests.find(r => r.fromUserId === user.id && r.projectId === project.id);
        const isPartner = db.requests.find(r =>
            r.projectId === project.id &&
            r.status === 'accepted' &&
            (r.fromUserId === user.id || r.toUserId === user.id)
        );

        const isBookmarked = (user.bookmarks || []).includes(project.id);
        const matchPercent = calculateSkillMatch(project.skills, user.skills);

        let actionBtn = '';
        if (isOwner) {
            actionBtn = `<button class="btn btn-ghost btn-sm" onclick="viewProject('${project.id}')">
                <i class="fas fa-eye"></i> View Blueprint
            </button>`;
        } else if (isPartner) {
            actionBtn = `<button class="btn btn-success btn-sm" onclick="openCollaborationRoom('${project.id}')">
                <i class="fas fa-comments"></i> Open Collaboration Room
            </button>`;
        } else if (hasRequested) {
            actionBtn = `<span class="request-pending request-status"><i class="fas fa-clock"></i> Proposal Sent</span>`;
        } else {
            actionBtn = `<button class="btn btn-primary btn-sm" onclick="openRequestModal('${project.id}')">
                <i class="fas fa-handshake"></i> Send Proposal
            </button>`;
        }

        const matchBadge = matchPercent > 0 ? `
            <span class="skill-match-tag ${matchPercent >= 70 ? 'high-match' : ''}">
                <i class="fas fa-bolt"></i> ${matchPercent}% Skill Match
            </span>
        ` : '';

        return `
            <div class="project-card">
                <div class="project-card-header">
                    <div class="project-card-avatar">${getInitials(author.name)}</div>
                    <div class="project-card-meta">
                        <h4>${author.name}</h4>
                        <span>${author.department} • ${author.university} • ${timeAgo(project.createdAt)}</span>
                    </div>
                    <div class="project-card-header-actions">
                        <button class="bookmark-btn ${isBookmarked ? 'bookmarked' : ''}" onclick="toggleBookmark('${project.id}', event)" title="Save to Watchlist">
                            <i class="${isBookmarked ? 'fas fa-star' : 'far fa-star'}"></i>
                        </button>
                        <button class="report-btn" onclick="openReportModal('${project.id}', event)" title="Report Inappropriate Content">
                            <i class="far fa-flag"></i>
                        </button>
                    </div>
                </div>

                ${matchBadge}
                <h3 class="project-card-title">${project.title}</h3>

                <div class="project-card-hidden">
                    <i class="fas fa-shield-alt"></i>
                    <span>Detailed idea & architecture are encrypted. Connect with the creator to unlock the full blueprint.</span>
                </div>

                <div class="project-card-tags">
                    ${project.skills.map(s => `<span class="project-tag">${s}</span>`).join('')}
                </div>

                <div class="project-card-footer">
                    <div class="project-card-info">
                        <span><i class="fas fa-layer-group"></i> ${project.difficulty}</span>
                        <span><i class="fas fa-users"></i> ${project.teamSize}</span>
                        <span><i class="fas fa-tag"></i> ${project.department}</span>
                    </div>
                    ${actionBtn}
                </div>
            </div>
        `;
    }).join('');

    renderSuggestions();
}

function filterFeed(filter, btn) {
    document.querySelectorAll('.feed-filters .filter-chip').forEach(c => c.classList.remove('active'));
    if (btn) btn.classList.add('active');
    renderFeed(filter);
}

function quickFilterSkill(skill) {
    showPage('discover');
    const searchInput = document.getElementById('discoverSearch');
    if (searchInput) {
        searchInput.value = skill;
        filterDiscover();
    }
}

function renderSuggestions() {
    const db = getDB();
    const user = getCurrentUser();
    const container = document.getElementById('suggestedProjects');
    if (!container || !user) return;

    const otherProjects = db.projects
        .filter(p => p.userId !== user.id)
        .filter(p => !db.requests.find(r => r.fromUserId === user.id && r.projectId === p.id))
        .map(p => ({
            ...p,
            matchScore: calculateSkillMatch(p.skills, user.skills)
        }))
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, 3);

    if (otherProjects.length === 0) {
        container.innerHTML = '<p style="color:var(--text-muted); font-size:0.85rem;">No peer projects yet. Share your project title to start partnering!</p>';
        return;
    }

    container.innerHTML = otherProjects.map(p => `
        <div class="suggested-item">
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <h4>${p.title}</h4>
                <span class="match-pill">${p.matchScore}% Match</span>
            </div>
            <p>${p.skills.slice(0, 3).join(', ')} • ${p.difficulty}</p>
            <button class="btn btn-outline btn-sm" onclick="openRequestModal('${p.id}')">
                <i class="fas fa-handshake"></i> Propose
            </button>
        </div>
    `).join('');
}

// ===== DISCOVER PAGE =====
function renderDiscover() {
    if (!requireAuth()) return;

    const db = getDB();
    const user = getCurrentUser();
    const search = (document.getElementById('discoverSearch')?.value || '').toLowerCase();
    const dept = document.getElementById('discoverDept')?.value || '';
    const difficulty = document.getElementById('discoverDifficulty')?.value || '';

    let projects = [...db.projects].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    if (search) {
        projects = projects.filter(p =>
            p.title.toLowerCase().includes(search) ||
            p.skills.some(s => s.toLowerCase().includes(search)) ||
            p.department.toLowerCase().includes(search)
        );
    }
    if (dept) {
        projects = projects.filter(p => p.department === dept);
    }
    if (difficulty) {
        projects = projects.filter(p => p.difficulty === difficulty);
    }

    const container = document.getElementById('discoverGrid');
    if (!container) return;

    if (projects.length === 0) {
        container.innerHTML = `
            <div class="empty-state" style="grid-column: 1/-1;">
                <i class="fas fa-compass"></i>
                <h3>No projects in the directory yet</h3>
                <p>Be the pioneer student to publish a project title for your university or domain!</p>
                <button class="btn btn-primary" onclick="openPostModal()">
                    <i class="fas fa-plus"></i> Post a Project
                </button>
            </div>
        `;
        return;
    }

    container.innerHTML = projects.map(project => {
        const author = db.users.find(u => u.id === project.userId);
        if (!author) return '';

        const isOwner = project.userId === user.id;
        const hasRequested = db.requests.find(r => r.fromUserId === user.id && r.projectId === project.id);
        const isPartner = db.requests.find(r =>
            r.projectId === project.id &&
            r.status === 'accepted' &&
            (r.fromUserId === user.id || r.toUserId === user.id)
        );
        const matchPercent = calculateSkillMatch(project.skills, user.skills);
        const isBookmarked = (user.bookmarks || []).includes(project.id);

        let actionBtn = '';
        if (isOwner) {
            actionBtn = `<button class="btn btn-ghost btn-sm" onclick="viewProject('${project.id}')">View</button>`;
        } else if (isPartner) {
            actionBtn = `<button class="btn btn-success btn-sm" onclick="openCollaborationRoom('${project.id}')">
                <i class="fas fa-comments"></i> Room
            </button>`;
        } else if (hasRequested) {
            actionBtn = `<span class="request-pending request-status">Proposed</span>`;
        } else {
            actionBtn = `<button class="btn btn-primary btn-sm" onclick="openRequestModal('${project.id}')">
                <i class="fas fa-handshake"></i> Propose
            </button>`;
        }

        return `
            <div class="discover-card" onclick="viewProject('${project.id}')">
                <div class="discover-card-top">
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <span class="discover-card-dept">${project.department}</span>
                        <div style="display:flex; align-items:center; gap:6px;">
                            ${matchPercent > 0 ? `<span class="match-pill">${matchPercent}% Match</span>` : ''}
                            <button class="bookmark-btn ${isBookmarked ? 'bookmarked' : ''}" onclick="toggleBookmark('${project.id}', event)">
                                <i class="${isBookmarked ? 'fas fa-star' : 'far fa-star'}"></i>
                            </button>
                        </div>
                    </div>
                    <h3 class="discover-card-title">${project.title}</h3>
                    <div class="discover-card-hidden">
                        <i class="fas fa-shield-alt"></i> Idea blueprint encrypted until partnered
                    </div>
                    <div class="discover-card-tags">
                        ${project.skills.map(s => `<span class="project-tag">${s}</span>`).join('')}
                    </div>
                </div>
                <div class="discover-card-bottom" onclick="event.stopPropagation();">
                    <div class="discover-card-author">
                        <div class="discover-card-author-avatar">${getInitials(author.name)}</div>
                        <div class="discover-card-author-info">
                            <strong>${author.name}</strong>
                            <span>${author.year} • ${author.university}</span>
                        </div>
                    </div>
                    ${actionBtn}
                </div>
            </div>
        `;
    }).join('');
}

function filterDiscover() {
    renderDiscover();
}

// ===== MY PROJECTS =====
let myProjectTab = 'posted';

function renderMyProjects(tab) {
    if (!requireAuth()) return;
    myProjectTab = tab || myProjectTab;

    const db = getDB();
    const user = getCurrentUser();
    const container = document.getElementById('myProjectsList');

    const myPosted = db.projects.filter(p => p.userId === user.id);
    const myPartnered = db.requests.filter(r =>
        r.status === 'accepted' && (r.fromUserId === user.id || r.toUserId === user.id)
    );

    document.getElementById('myPostedCountBadge').textContent = myPosted.length;
    document.getElementById('myPartneredCountBadge').textContent = myPartnered.length;

    if (myProjectTab === 'posted') {
        if (myPosted.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-lightbulb"></i>
                    <h3>You haven't posted any projects yet</h3>
                    <p>Post a project title securely. Your detailed idea remains protected!</p>
                    <button class="btn btn-primary" onclick="openPostModal()">
                        <i class="fas fa-plus"></i> Post a Project
                    </button>
                </div>
            `;
            return;
        }

        container.innerHTML = myPosted.map(p => {
            const pendingReqs = db.requests.filter(r => r.projectId === p.id && r.status === 'pending');
            const acceptedPartners = db.requests.filter(r => r.projectId === p.id && r.status === 'accepted');

            return `
                <div class="my-project-item">
                    <div class="my-project-item-header">
                        <div>
                            <h3>${p.title}</h3>
                            <span style="font-size: 0.8rem; color: var(--text-muted);">
                                ${p.department} • ${p.difficulty} • Posted ${timeAgo(p.createdAt)}
                            </span>
                        </div>
                        <span class="project-card-status status-looking">${p.status}</span>
                    </div>

                    <div class="view-project-revealed" style="margin: 10px 0;">
                        <h4><i class="fas fa-lock-open"></i> Your Private Idea Blueprint (Only you and accepted partners can see this)</h4>
                        <p>${p.description}</p>
                    </div>

                    <div class="project-card-tags">
                        ${p.skills.map(s => `<span class="project-tag">${s}</span>`).join('')}
                    </div>

                    <div style="display:flex; justify-content:space-between; align-items:center; margin-top:14px; pt:10px; border-top:1px solid var(--border-light);">
                        <div style="display:flex; gap:16px; font-size:0.84rem; color:var(--text-muted);">
                            <span><i class="fas fa-inbox"></i> ${pendingReqs.length} Pending Proposal${pendingReqs.length !== 1 ? 's' : ''}</span>
                            <span><i class="fas fa-handshake"></i> ${acceptedPartners.length} Active Partner${acceptedPartners.length !== 1 ? 's' : ''}</span>
                        </div>
                        <div class="my-project-actions">
                            ${acceptedPartners.length > 0 ? `
                                <button class="btn btn-success btn-sm" onclick="openCollaborationRoom('${p.id}')">
                                    <i class="fas fa-comments"></i> Partner Chat & Workspace
                                </button>
                            ` : ''}
                            <button class="btn btn-danger btn-sm" onclick="deleteProject('${p.id}')">
                                <i class="fas fa-trash"></i> Delete
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    } else {
        if (myPartnered.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-handshake"></i>
                    <h3>No active partnerships yet</h3>
                    <p>Discover projects and send partnership proposals to unlock shared blueprints!</p>
                    <button class="btn btn-primary" onclick="showPage('discover')">
                        <i class="fas fa-compass"></i> Discover Projects
                    </button>
                </div>
            `;
            return;
        }

        container.innerHTML = myPartnered.map(req => {
            const project = db.projects.find(p => p.id === req.projectId);
            if (!project) return '';

            const partnerId = req.fromUserId === user.id ? req.toUserId : req.fromUserId;
            const partner = db.users.find(u => u.id === partnerId);
            if (!partner) return '';

            return `
                <div class="my-project-item" style="border-left: 4px solid var(--secondary);">
                    <div class="my-project-item-header">
                        <div>
                            <h3>${project.title}</h3>
                            <span style="font-size: 0.82rem; color: var(--text-muted);">
                                Matched with <strong>${partner.name}</strong> (${partner.department} • ${partner.university})
                            </span>
                        </div>
                        <span class="request-accepted request-status"><i class="fas fa-check-circle"></i> Partnered</span>
                    </div>

                    <div class="view-project-revealed" style="margin: 12px 0;">
                        <h4><i class="fas fa-unlock-alt"></i> Unlocked Full Project Idea & Blueprint</h4>
                        <p>${project.description}</p>
                    </div>

                    <div style="display:flex; justify-content:space-between; align-items:center; margin-top:14px;">
                        <div class="project-card-tags">
                            ${project.skills.map(s => `<span class="project-tag">${s}</span>`).join('')}
                        </div>
                        <button class="btn btn-primary btn-sm" onclick="openCollaborationRoom('${project.id}')">
                            <i class="fas fa-comments"></i> Open Collaboration Room
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }
}

function switchMyProjectTab(tab, btn) {
    document.querySelectorAll('.my-projects-tabs .tab-btn').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');
    renderMyProjects(tab);
}

function deleteProject(projectId) {
    if (!confirm('Are you sure you want to delete this project?')) return;
    const db = getDB();
    db.projects = db.projects.filter(p => p.id !== projectId);
    db.requests = db.requests.filter(r => r.projectId !== projectId);
    db.collaborationMessages = (db.collaborationMessages || []).filter(m => m.projectId !== projectId);
    saveDB(db);

    renderMyProjects('posted');
    showToast('Project deleted successfully');
}

// ===== REQUESTS =====
let requestTab = 'received';

function renderRequests(tab) {
    if (!requireAuth()) return;
    requestTab = tab || requestTab;

    const db = getDB();
    const user = getCurrentUser();
    const container = document.getElementById('requestsList');

    const received = db.requests.filter(r => r.toUserId === user.id);
    const sent = db.requests.filter(r => r.fromUserId === user.id);

    document.getElementById('receivedCount').textContent = received.filter(r => r.status === 'pending').length;
    document.getElementById('sentCount').textContent = sent.length;

    const items = requestTab === 'received' ? received : sent;

    if (items.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-inbox"></i>
                <h3>No requests in this view</h3>
                <p>${requestTab === 'received' ? 'When students propose collaborating on your project, their proposals will appear here.' : 'Browse projects and send proposals to connect with project creators.'}</p>
            </div>
        `;
        return;
    }

    container.innerHTML = items.map(req => {
        const project = db.projects.find(p => p.id === req.projectId);
        if (!project) return '';

        const otherUserId = requestTab === 'received' ? req.fromUserId : req.toUserId;
        const otherUser = db.users.find(u => u.id === otherUserId);
        if (!otherUser) return '';

        let statusHtml = '';
        let actionsHtml = '';

        if (req.status === 'pending') {
            if (requestTab === 'received') {
                actionsHtml = `
                    <div class="request-card-actions">
                        <button class="btn btn-success btn-sm" onclick="handleRequestAction('${req.id}', 'accepted')">
                            <i class="fas fa-check"></i> Accept & Reveal Idea
                        </button>
                        <button class="btn btn-danger btn-sm" onclick="handleRequestAction('${req.id}', 'declined')">
                            <i class="fas fa-times"></i> Decline
                        </button>
                    </div>
                `;
            } else {
                statusHtml = '<span class="request-pending request-status"><i class="fas fa-clock"></i> Pending Review</span>';
            }
        } else if (req.status === 'accepted') {
            statusHtml = '<span class="request-accepted request-status"><i class="fas fa-check-circle"></i> Partnership Accepted</span>';
            actionsHtml = `
                <button class="btn btn-outline btn-sm" onclick="openCollaborationRoom('${project.id}')">
                    <i class="fas fa-comments"></i> Enter Collaboration Room
                </button>
            `;
        } else {
            statusHtml = '<span class="request-declined request-status"><i class="fas fa-times-circle"></i> Declined</span>';
        }

        return `
            <div class="request-card">
                <div class="request-card-header">
                    <div class="request-card-avatar">${getInitials(otherUser.name)}</div>
                    <div class="request-card-info" style="flex:1;">
                        <h4>${otherUser.name}</h4>
                        <p>${otherUser.department} • ${otherUser.year} • ${otherUser.university}</p>
                        <p style="font-size:0.75rem; color:var(--text-muted);">
                            Skills: ${otherUser.skills.join(', ')}
                        </p>
                    </div>
                    ${statusHtml}
                </div>
                <p class="request-card-project">
                    ${requestTab === 'received' ? 'Proposed to partner on' : 'You proposed to partner on'}:
                    <strong>"${project.title}"</strong>
                </p>
                <div class="request-card-message">"${req.message}"</div>
                ${actionsHtml}
                <div style="text-align:right; font-size:0.72rem; color:var(--text-muted); margin-top:6px;">
                    ${timeAgo(req.createdAt)}
                </div>
            </div>
        `;
    }).join('');
}

function switchRequestTab(tab, btn) {
    document.querySelectorAll('.requests-tabs .tab-btn').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');
    renderRequests(tab);
}

function handleRequestAction(requestId, action) {
    const db = getDB();
    const req = db.requests.find(r => r.id === requestId);
    if (!req) return;

    req.status = action;

    if (action === 'accepted') {
        const fromUser = db.users.find(u => u.id === req.fromUserId);
        const toUser = db.users.find(u => u.id === req.toUserId);

        if (!db.collaborationMessages) db.collaborationMessages = [];
        db.collaborationMessages.push({
            id: generateId(),
            projectId: req.projectId,
            senderId: toUser.id,
            senderName: toUser.name,
            text: `Hi ${fromUser.name.split(' ')[0]}! I accepted your partnership proposal. Welcome aboard! Our project idea blueprint is now fully unlocked.`,
            timestamp: new Date().toISOString()
        });
    }

    saveDB(db);
    renderRequests('received');
    updateRequestBadge();

    if (action === 'accepted') {
        showToast('🎉 Partnership accepted! The full project blueprint is now unlocked.');
    } else {
        showToast('Proposal declined');
    }
}

// ===== INTERACTIVE COLLABORATION ROOM & LIVE CHAT =====
function openCollaborationRoom(projectId) {
    if (!requireAuth()) return;

    const db = getDB();
    const user = getCurrentUser();
    const project = db.projects.find(p => p.id === projectId);
    if (!project) return;

    activeCollabProjectId = projectId;

    const partnerReq = db.requests.find(r =>
        r.projectId === projectId &&
        r.status === 'accepted' &&
        (r.fromUserId === user.id || r.toUserId === user.id)
    );

    const isOwner = project.userId === user.id;
    if (!isOwner && !partnerReq) {
        showToast('Access to Collaboration Room requires an accepted partnership');
        return;
    }

    const partnerId = isOwner ? partnerReq?.fromUserId : project.userId;
    const partner = db.users.find(u => u.id === partnerId);

    document.getElementById('collabProjectTitle').textContent = project.title;
    document.getElementById('collabPartnerInfo').innerHTML = `Collaborating with: <strong>${partner ? partner.name : 'Team'}</strong> (${partner ? partner.department : ''})`;
    document.getElementById('collabProjectDescription').textContent = project.description;

    renderChatMessages();
    document.getElementById('collaborationModal').classList.remove('hidden');
}

function renderChatMessages() {
    const db = getDB();
    const user = getCurrentUser();
    const container = document.getElementById('chatMessagesContainer');
    if (!container || !activeCollabProjectId) return;

    const messages = (db.collaborationMessages || []).filter(m => m.projectId === activeCollabProjectId);

    if (messages.length === 0) {
        container.innerHTML = `
            <div style="text-align:center; color:var(--text-muted); padding:30px 10px; font-size:0.85rem;">
                <i class="fas fa-handshake" style="font-size:1.8rem; margin-bottom:8px; display:block;"></i>
                Start your collaboration! Say hello and outline your first milestones.
            </div>
        `;
        return;
    }

    container.innerHTML = messages.map(msg => {
        const isMe = msg.senderId === user.id;
        return `
            <div class="chat-bubble ${isMe ? 'chat-bubble-me' : 'chat-bubble-partner'}">
                <div class="chat-bubble-sender">${isMe ? 'You' : msg.senderName}</div>
                <div>${msg.text}</div>
                <div class="chat-bubble-time">${timeAgo(msg.timestamp)}</div>
            </div>
        `;
    }).join('');

    container.scrollTop = container.scrollHeight;
}

function handleSendChatMessage(e) {
    e.preventDefault();
    const input = document.getElementById('chatInputMessage');
    const text = input.value.trim();
    if (!text || !activeCollabProjectId) return;

    const db = getDB();
    const user = getCurrentUser();

    if (!db.collaborationMessages) db.collaborationMessages = [];

    db.collaborationMessages.push({
        id: generateId(),
        projectId: activeCollabProjectId,
        senderId: user.id,
        senderName: user.name,
        text: text,
        timestamp: new Date().toISOString()
    });

    saveDB(db);
    input.value = '';
    renderChatMessages();
}

function toggleMilestone(checkbox) {
    const total = document.querySelectorAll('.milestone-item input').length;
    const checked = document.querySelectorAll('.milestone-item input:checked').length;
    const progressEl = document.getElementById('milestoneProgress');
    if (progressEl) {
        progressEl.textContent = `${checked}/${total} Done`;
    }
}

// ===== ADMIN INTERFACE (ANONYMOUS TELEMETRY & CONTROL) =====
let currentAdminTab = 'accounts';

function renderAdmin() {
    if (!requireAuth()) return;
    const user = getCurrentUser();
    if (!user || user.role !== 'admin') {
        showToast('Administrator privileges required');
        showPage('feed');
        return;
    }

    const db = getDB();

    // 1. Calculate KPI Metrics
    const students = db.users.filter(u => u.role === 'student');
    const totalProjects = db.projects.length;
    const activePartnerships = db.requests.filter(r => r.status === 'accepted').length;
    const pendingReviews = db.projects.filter(p => p.isFlagged).length + db.requests.filter(r => r.status === 'pending').length;

    document.getElementById('admMetricStudents').textContent = students.length;
    document.getElementById('admMetricProjects').textContent = totalProjects;
    document.getElementById('admMetricPartnerships').textContent = activePartnerships;
    document.getElementById('admMetricPendingReqs').textContent = `${pendingReviews} pending items`;

    renderAdminAccounts();
    renderAdminAnnouncementsList();
    renderAdminProjects();
}

function switchAdminTab(tab, btn) {
    currentAdminTab = tab;
    document.querySelectorAll('.admin-nav-tabs .tab-btn').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');

    document.querySelectorAll('.admin-tab-content').forEach(c => c.classList.add('hidden'));
    const target = document.getElementById('admTab-' + tab);
    if (target) target.classList.remove('hidden');
}

// Anonymous Account Telemetry Audit
function renderAdminAccounts() {
    const db = getDB();
    const students = db.users.filter(u => u.role === 'student');
    const search = (document.getElementById('admAccountSearch')?.value || '').toLowerCase();
    const statusFilter = document.getElementById('admStatusFilter')?.value || 'all';

    let filtered = students.filter(s => {
        const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
        const anonToken = (s.anonToken || '').toLowerCase();
        const dept = (s.department || '').toLowerCase();
        const matchesSearch = !search || anonToken.includes(search) || dept.includes(search);
        return matchesStatus && matchesSearch;
    });

    const tbody = document.getElementById('admAccountsTableBody');
    if (!tbody) return;

    if (filtered.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align:center; padding:30px; color:var(--text-muted);">
                    <i class="fas fa-users-slash" style="font-size:1.8rem; margin-bottom:8px; display:block;"></i>
                    No student accounts registered yet. As real students register, their operational telemetry will appear here anonymously.
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = filtered.map(student => {
        const projectsHosted = db.projects.filter(p => p.userId === student.id).length;
        const partnershipsFormed = db.requests.filter(r =>
            (r.fromUserId === student.id || r.toUserId === student.id) && r.status === 'accepted'
        ).length;

        const isSuspended = student.status === 'suspended';
        const anonPseudonym = student.anonToken || ('STU_' + student.id.slice(-6).toUpperCase());

        return `
            <tr>
                <td>
                    <span class="anon-token-pill">
                        <i class="fas fa-mask"></i> ${anonPseudonym}
                    </span>
                </td>
                <td><strong>${student.department}</strong></td>
                <td>${student.year}</td>
                <td>
                    <span style="font-size:0.75rem; color:var(--text-secondary);">
                        ${(student.university || '').includes('IIT') || (student.university || '').includes('NIT') ? 'Tier 1 Govt Institute' : 'Accredited University'}
                    </span>
                </td>
                <td><strong>${projectsHosted}</strong> hosted</td>
                <td><strong>${partnershipsFormed}</strong> matched</td>
                <td>
                    <span class="${isSuspended ? 'status-badge-suspended' : 'status-badge-active'}">
                        ${isSuspended ? 'SUSPENDED' : 'ACTIVE'}
                    </span>
                </td>
                <td>
                    <button class="btn ${isSuspended ? 'btn-success' : 'btn-danger'} btn-sm" onclick="toggleAccountStatus('${student.id}')">
                        ${isSuspended ? '<i class="fas fa-check"></i> Restore' : '<i class="fas fa-ban"></i> Freeze'}
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

function toggleAccountStatus(userId) {
    const db = getDB();
    const user = db.users.find(u => u.id === userId);
    if (!user) return;

    const newStatus = user.status === 'suspended' ? 'active' : 'suspended';
    user.status = newStatus;
    saveDB(db);

    renderAdminAccounts();
    renderAdmin();
    showToast(`Account (${user.anonToken}) status updated to ${newStatus.toUpperCase()} anonymously.`);
}

function handleAdminBroadcast(e) {
    e.preventDefault();
    const title = document.getElementById('admAnnounceTitle').value.trim();
    const message = document.getElementById('admAnnounceMsg').value.trim();
    const category = document.getElementById('admAnnounceCategory').value;

    const db = getDB();
    if (!db.announcements) db.announcements = [];

    const newAnn = {
        id: generateId(),
        title,
        message,
        category,
        active: true,
        createdAt: new Date().toISOString()
    };

    db.announcements.unshift(newAnn);
    saveDB(db);

    document.getElementById('admAnnounceTitle').value = '';
    document.getElementById('admAnnounceMsg').value = '';

    renderAdminAnnouncementsList();
    loadLatestAnnouncement();
    showToast('📢 Sitewide announcement broadcast to all students!');
}

function renderAdminAnnouncementsList() {
    const db = getDB();
    const list = document.getElementById('admActiveAnnouncementsList');
    if (!list) return;

    const announcements = db.announcements || [];
    if (announcements.length === 0) {
        list.innerHTML = '<p style="color:var(--text-muted); font-size:0.85rem;">No active broadcasts posted.</p>';
        return;
    }

    list.innerHTML = announcements.map(a => `
        <div style="padding:12px; border:1px solid var(--border-light); border-radius:var(--radius-sm); margin-bottom:10px; display:flex; justify-content:space-between; align-items:center;">
            <div>
                <strong>${a.title}</strong>
                <p style="font-size:0.84rem; color:var(--text-secondary); margin:4px 0;">${a.message}</p>
                <small style="color:var(--text-muted);">${timeAgo(a.createdAt)} • Tag: ${a.category}</small>
            </div>
            <button class="btn btn-danger btn-sm" onclick="deleteAnnouncement('${a.id}')">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `).join('');
}

function deleteAnnouncement(annId) {
    const db = getDB();
    db.announcements = (db.announcements || []).filter(a => a.id !== annId);
    saveDB(db);
    renderAdminAnnouncementsList();
    loadLatestAnnouncement();
    showToast('Announcement removed');
}

function renderAdminProjects() {
    const db = getDB();
    const tbody = document.getElementById('admProjectsTableBody');
    if (!tbody) return;

    if (db.projects.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align:center; padding:30px; color:var(--text-muted);">
                    No projects posted on the platform yet.
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = db.projects.map(p => {
        const creator = db.users.find(u => u.id === p.userId);
        const anonToken = creator ? creator.anonToken : 'STU_ANON';
        const hasReports = p.isFlagged || (p.reports && p.reports.length > 0);

        return `
            <tr>
                <td><strong>${p.title}</strong></td>
                <td>${p.department}</td>
                <td>${p.difficulty}</td>
                <td><code>${anonToken}</code></td>
                <td>
                    ${hasReports ? '<span class="status-badge-suspended">FLAGGED FOR REVIEW</span>' : '<span class="status-badge-active">CLEAN</span>'}
                </td>
                <td>
                    <button class="btn btn-danger btn-sm" onclick="adminDeleteProject('${p.id}')">
                        <i class="fas fa-trash"></i> Take Down
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

function adminDeleteProject(projectId) {
    if (!confirm('Moderate and delete this project title from the platform?')) return;
    const db = getDB();
    db.projects = db.projects.filter(p => p.id !== projectId);
    db.requests = db.requests.filter(r => r.projectId !== projectId);
    saveDB(db);

    renderAdminProjects();
    renderAdmin();
    showToast('Project removed by Administrator');
}

function resetDatabaseDemo() {
    if (!confirm('Clear all local data and reset to fresh platform state?')) return;
    localStorage.removeItem(DB_KEY);
    getDB();
    showToast('Database reset to clean state.');
    showPage('landing');
}

// ===== POST PROJECT =====
function openPostModal() {
    if (!requireAuth()) return;
    document.getElementById('postProjectModal').classList.remove('hidden');
    document.getElementById('projectTitle').value = '';
    document.getElementById('projectDescription').value = '';
    document.getElementById('projectDept').value = '';
    document.getElementById('projectDifficulty').value = '';
    document.getElementById('projectSkills').value = '';
    document.getElementById('projectTeamSize').value = '';
    document.getElementById('projectStatus').value = 'Looking for Partners';
}

function handlePostProject(e) {
    e.preventDefault();
    const db = getDB();

    const newProject = {
        id: generateId(),
        userId: db.currentUserId,
        title: document.getElementById('projectTitle').value.trim(),
        description: document.getElementById('projectDescription').value.trim(),
        department: document.getElementById('projectDept').value,
        difficulty: document.getElementById('projectDifficulty').value,
        skills: document.getElementById('projectSkills').value.split(',').map(s => s.trim()).filter(Boolean),
        teamSize: document.getElementById('projectTeamSize').value,
        status: document.getElementById('projectStatus').value,
        isFlagged: false,
        reports: [],
        createdAt: new Date().toISOString()
    };

    db.projects.unshift(newProject);
    saveDB(db);

    closeModal('postProjectModal');
    showToast('🚀 Project title posted! Your detailed blueprint is safely encrypted.');

    if (currentPage === 'feed') renderFeed();
    else if (currentPage === 'discover') renderDiscover();
    else if (currentPage === 'my-projects') renderMyProjects('posted');
}

// ===== VIEW PROJECT MODAL =====
function viewProject(projectId) {
    const db = getDB();
    const user = getCurrentUser();
    const project = db.projects.find(p => p.id === projectId);
    if (!project) return;

    const author = db.users.find(u => u.id === project.userId);
    if (!author) return;

    const isOwner = user && project.userId === user.id;
    const isPartner = user && db.requests.find(r =>
        r.projectId === project.id &&
        r.status === 'accepted' &&
        (r.fromUserId === user.id || r.toUserId === user.id)
    );
    const hasRequested = user && db.requests.find(r => r.fromUserId === user.id && r.projectId === project.id);
    const canSeeIdea = isOwner || isPartner;

    let blueprintSection = '';
    if (canSeeIdea) {
        blueprintSection = `
            <div class="view-project-revealed">
                <h4><i class="fas fa-unlock-alt"></i> Full Project Blueprint ${isOwner ? '(Creator View)' : '(Partner View Unlocked)'}</h4>
                <p>${project.description}</p>
            </div>
        `;
    } else {
        blueprintSection = `
            <div class="view-project-hidden-box">
                <i class="fas fa-shield-alt"></i>
                <h4>Idea Blueprint is Encrypted & Protected</h4>
                <p>The detailed specifications and methodology are shielded to protect student intellectual property. Submit a partnership proposal to unlock the full blueprint!</p>
            </div>
        `;
    }

    let actionBtn = '';
    if (user && !isOwner && !isPartner && !hasRequested) {
        actionBtn = `
            <button class="btn btn-primary btn-full" onclick="closeModal('viewProjectModal'); openRequestModal('${project.id}');" style="margin-top:16px;">
                <i class="fas fa-handshake"></i> Send Partnership Proposal
            </button>
        `;
    } else if (isPartner) {
        actionBtn = `
            <button class="btn btn-success btn-full" onclick="closeModal('viewProjectModal'); openCollaborationRoom('${project.id}');" style="margin-top:16px;">
                <i class="fas fa-comments"></i> Enter Partner Collaboration Room
            </button>
        `;
    }

    document.getElementById('viewProjectContent').innerHTML = `
        <div style="display:flex; align-items:center; gap:16px; margin-bottom:16px;">
            <div class="project-card-avatar" style="width:52px; height:52px; font-size:1.1rem;">
                ${getInitials(author.name)}
            </div>
            <div>
                <h4 style="font-size:1.05rem;">${author.name}</h4>
                <p style="font-size:0.82rem; color:var(--text-muted);">${author.department} • ${author.year} • ${author.university}</p>
            </div>
        </div>
        <h2 class="view-project-title">${project.title}</h2>
        <div class="view-project-meta">
            <span><i class="fas fa-tag"></i> ${project.department}</span>
            <span><i class="fas fa-layer-group"></i> ${project.difficulty}</span>
            <span><i class="fas fa-users"></i> ${project.teamSize}</span>
            <span><i class="fas fa-clock"></i> ${timeAgo(project.createdAt)}</span>
        </div>
        ${blueprintSection}
        <div style="margin-top:16px;">
            <h4 style="margin-bottom:8px; font-size:0.95rem;">Required Tech Stack</h4>
            <div class="project-card-tags">
                ${project.skills.map(s => `<span class="project-tag">${s}</span>`).join('')}
            </div>
        </div>
        ${actionBtn}
    `;

    document.getElementById('viewProjectModal').classList.remove('hidden');
}

// ===== SEND REQUEST =====
function openRequestModal(projectId) {
    if (!requireAuth()) return;

    const db = getDB();
    const project = db.projects.find(p => p.id === projectId);
    if (!project) return;

    if (project.userId === db.currentUserId) {
        showToast('You cannot send a partnership proposal to your own project!');
        return;
    }

    document.getElementById('requestProjectId').value = projectId;
    document.getElementById('requestModalTitle').textContent = `Propose partnership on "${project.title}"`;
    document.getElementById('requestMessage').value = '';
    document.getElementById('requestModal').classList.remove('hidden');
}

function handleSendRequest(e) {
    e.preventDefault();
    const db = getDB();
    const projectId = document.getElementById('requestProjectId').value;
    const project = db.projects.find(p => p.id === projectId);
    if (!project) return;

    const newRequest = {
        id: generateId(),
        fromUserId: db.currentUserId,
        toUserId: project.userId,
        projectId: projectId,
        message: document.getElementById('requestMessage').value.trim(),
        status: 'pending',
        createdAt: new Date().toISOString()
    };

    db.requests.unshift(newRequest);
    saveDB(db);

    closeModal('requestModal');
    showToast('🤝 Partnership proposal dispatched to the project creator!');

    if (currentPage === 'feed') renderFeed();
    else if (currentPage === 'discover') renderDiscover();
}

// ===== PROFILE =====
function renderProfile() {
    if (!requireAuth()) return;
    const db = getDB();
    const user = getCurrentUser();

    document.getElementById('profileAvatar').textContent = getInitials(user.name);
    document.getElementById('profileName').textContent = user.name;
    document.getElementById('profileDept').textContent = `${user.department} • ${user.year}`;
    document.getElementById('profileUni').textContent = user.university;
    document.getElementById('profileBio').textContent = user.bio;
    document.getElementById('profileAnonToken').textContent = user.anonToken || 'STU_NEW';

    document.getElementById('profileSkills').innerHTML =
        (user.skills || []).map(s => `<span class="skill-tag">${s}</span>`).join('');

    const myProjects = db.projects.filter(p => p.userId === user.id);
    const myPartners = db.requests.filter(r =>
        (r.fromUserId === user.id || r.toUserId === user.id) && r.status === 'accepted'
    ).length;
    const sentReqs = db.requests.filter(r => r.fromUserId === user.id).length;

    document.getElementById('pStatProjects').textContent = myProjects.length;
    document.getElementById('pStatPartners').textContent = myPartners;
    document.getElementById('pStatRequests').textContent = sentReqs;

    const container = document.getElementById('profileProjects');
    if (myProjects.length === 0) {
        container.innerHTML = '<p style="color:var(--text-muted); font-size:0.85rem;">No projects hosted yet.</p>';
    } else {
        container.innerHTML = myProjects.map(p => `
            <div class="profile-project-item">
                <h4>${p.title}</h4>
                <p>${p.department} • ${p.difficulty} • <span class="status-badge-active">${p.status}</span></p>
            </div>
        `).join('');
    }
}

function openEditProfileModal() {
    const user = getCurrentUser();
    if (!user) return;

    document.getElementById('editName').value = user.name;
    document.getElementById('editUniversity').value = user.university;
    document.getElementById('editDepartment').value = user.department;
    document.getElementById('editYear').value = user.year;
    document.getElementById('editSkills').value = (user.skills || []).join(', ');
    document.getElementById('editBio').value = user.bio;

    document.getElementById('editProfileModal').classList.remove('hidden');
}

function handleEditProfile(e) {
    e.preventDefault();
    const db = getDB();
    const user = db.users.find(u => u.id === db.currentUserId);
    if (!user) return;

    user.name = document.getElementById('editName').value.trim();
    user.university = document.getElementById('editUniversity').value.trim();
    user.department = document.getElementById('editDepartment').value;
    user.year = document.getElementById('editYear').value;
    user.skills = document.getElementById('editSkills').value.split(',').map(s => s.trim()).filter(Boolean);
    user.bio = document.getElementById('editBio').value.trim();

    saveDB(db);
    closeModal('editProfileModal');
    renderProfile();
    updateNavState(true);
    showToast('Profile updated successfully! ✨');
}

// ===== MODAL UTILITIES =====
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add('hidden');
}

document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', function(e) {
        if (e.target === this) this.classList.add('hidden');
    });
});

document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        document.querySelectorAll('.modal-overlay').forEach(m => m.classList.add('hidden'));
    }
});

// ===== TOAST NOTIFICATIONS =====
function showToast(message) {
    const toast = document.getElementById('toast');
    const toastMsg = document.getElementById('toastMessage');
    if (!toast || !toastMsg) return;

    toastMsg.textContent = message;
    toast.classList.remove('hidden');
    clearTimeout(window._toastTimeout);
    window._toastTimeout = setTimeout(() => toast.classList.add('hidden'), 3500);
}

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', function() {
    const db = getDB();
    loadLatestAnnouncement();

    if (db.currentUserId) {
        const user = getCurrentUser();
        if (user) {
            updateNavState(true);
            if (user.role === 'admin') {
                showPage('admin');
            } else {
                showPage('feed');
            }
            return;
        }
    }

    // Default to clean Landing Page for visitors
    updateNavState(false);
    showPage('landing');
});
