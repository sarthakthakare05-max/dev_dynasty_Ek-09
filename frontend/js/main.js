document.addEventListener('DOMContentLoaded', () => {

    // --- GLOBAL AUTH CHECK ---
    checkAuthProtection();
    updateNavbarUser();

    // --- AUTH LOGIC (Index.html) ---
    const modal = document.getElementById('auth-modal');
    if (modal) {
        initAuthLogic();
    }

    // --- STUDENT DASHBOARD LOGIC (Student.html) ---
    const resumeUploadForm = document.getElementById('resume-upload-form');
    if (resumeUploadForm) {
        initStudentDashboard();
    }

    // --- COMPANY DASHBOARD LOGIC (Company.html) ---
    const createJobForm = document.getElementById('create-job-form');
    // Also run if we are just viewing the company dashboard
    if (createJobForm || window.location.pathname.includes('company.html')) {
        initCompanyDashboard();
    }

    // --- MATCH REPORT LOGIC (Match.html) ---
    const matchedSkillsContainer = document.getElementById('matched-skills');
    if (matchedSkillsContainer) {
        initMatchReport();
    }

    // --- SHARED LOGIC ---
    const btnLogout = document.getElementById('btn-logout');
    if (btnLogout) {
        btnLogout.addEventListener('click', () => {
            logout();
        });
    }
});

// ==========================================
// SIMULATED AUTH SYSTEM (LocalStorage)
// ==========================================
function login(email, role) {
    const user = { email, role };
    localStorage.setItem('currentUser', JSON.stringify(user));
}

function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}

function getUser() {
    const userStr = localStorage.getItem('currentUser');
    return userStr ? JSON.parse(userStr) : null;
}

function checkAuthProtection() {
    const path = window.location.pathname;
    const user = getUser();

    // If on protected pages and not logged in
    if ((path.includes('student.html') || path.includes('company.html') || path.includes('match.html'))) {
        if (!user) {
            window.location.href = 'index.html';
        }
        // Simple role protection (Optional for MVP but good practice)
        else if (path.includes('student') && user.role !== 'student') {
            alert('Access Denied: Student Area');
            window.location.href = 'company.html';
        }
        else if (path.includes('company') && user.role !== 'company') {
            alert('Access Denied: Company Area');
            window.location.href = 'student.html';
        }
    }

    // If on auth page (index) and already logged in
    if ((path.endsWith('/') || path.includes('index.html')) && user) {
        // Optional: Auto-redirect if already logged in? 
        // Let's NOT auto-redirect to allow landing page access, but maybe show "Go to Dashboard" button
    }
}

function updateNavbarUser() {
    const user = getUser();
    const logoBadge = document.querySelector('.logo .badge');
    if (user && logoBadge) {
        // Just ensuring badge matches role (visual polish)
        if (user.role === 'company') {
            logoBadge.textContent = 'Recruiter';
            logoBadge.style.background = '#e0e7ff';
            logoBadge.style.color = '#3730a3';
        } else {
            logoBadge.textContent = 'Student';
            logoBadge.style.background = '#f3f4f6';
            logoBadge.style.color = '#1f2937';
        }
    }
}


// ==========================================
// AUTH PAGE LOGIC
// ==========================================
function initAuthLogic() {
    const modal = document.getElementById('auth-modal');
    const btnLoginNav = document.getElementById('btn-login-nav');
    const btnRegisterNav = document.getElementById('btn-register-nav');
    const btnGetStarted = document.getElementById('btn-get-started');
    const closeModal = document.getElementById('close-modal');

    const loginFormContainer = document.getElementById('login-form-container');
    const registerFormContainer = document.getElementById('register-form-container');
    const switchToRegister = document.getElementById('switch-to-register');
    const switchToLogin = document.getElementById('switch-to-login');

    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');

    // State
    const openModal = (view = 'login') => {
        modal.classList.remove('hidden');
        view === 'login' ? showLogin() : showRegister();
    };

    const closeModalFunc = () => modal.classList.add('hidden');
    const showLogin = () => {
        loginFormContainer.classList.remove('hidden');
        registerFormContainer.classList.add('hidden');
    };
    const showRegister = () => {
        loginFormContainer.classList.add('hidden');
        registerFormContainer.classList.remove('hidden');
    };

    // Listeners
    if (btnLoginNav) btnLoginNav.addEventListener('click', () => openModal('login'));
    if (btnRegisterNav) btnRegisterNav.addEventListener('click', () => openModal('register'));
    if (btnGetStarted) btnGetStarted.addEventListener('click', () => openModal('register'));
    if (closeModal) closeModal.addEventListener('click', closeModalFunc);
    window.addEventListener('click', (e) => { if (e.target === modal) closeModalFunc(); });

    if (switchToRegister) {
        switchToRegister.addEventListener('click', (e) => { e.preventDefault(); showRegister(); });
    }
    if (switchToLogin) {
        switchToLogin.addEventListener('click', (e) => { e.preventDefault(); showLogin(); });
    }

    // Login Submit
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value;

            // Heuristic Role Determination
            let role = 'student';
            if (email.includes('company') || email.includes('recruiter') || email.includes('hr')) {
                role = 'company';
            }

            login(email, role); // Save to LocalStorage

            if (role === 'student') window.location.href = 'student.html';
            else window.location.href = 'company.html';
        });
    }

    // Register Submit
    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const role = document.getElementById('register-role').value;
            const email = document.getElementById('register-email').value;

            login(email, role); // Save to LocalStorage

            if (role === 'student') window.location.href = 'student.html';
            else window.location.href = 'company.html';
        });
    }
}

// ==========================================
// STUDENT DASHBOARD LOGIC
// ==========================================
function initStudentDashboard() {
    const form = document.getElementById('resume-upload-form');
    const fileInput = document.getElementById('resume-file');
    const profileCard = document.getElementById('profile-card');
    const skillsList = document.getElementById('skills-list');
    const experienceText = document.getElementById('experience-text');
    const educationText = document.getElementById('education-text');
    const matchesGrid = document.getElementById('matches-grid');
    const emptyState = document.getElementById('empty-state');
    const dropArea = document.getElementById('drop-area');

    // Drag & Drop
    if (dropArea) {
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropArea.addEventListener(eventName, (e) => { e.preventDefault(); e.stopPropagation(); }, false);
        });
        dropArea.addEventListener('dragover', () => dropArea.style.borderColor = '#2563eb');
        dropArea.addEventListener('dragleave', () => dropArea.style.borderColor = '#cbd5e1');
        dropArea.addEventListener('drop', () => dropArea.style.borderColor = '#cbd5e1');
        fileInput.addEventListener('change', () => {
            if (fileInput.files.length) document.querySelector('.file-msg').textContent = fileInput.files[0].name;
        });
    }

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        if (!fileInput.files.length) { alert('Please select a PDF file first.'); return; }

        const btn = form.querySelector('button');
        const originalText = btn.innerText;
        btn.innerText = 'Analyzing...';
        btn.disabled = true;

        setTimeout(() => {
            btn.innerText = originalText;
            btn.disabled = false;

            // Mock Data
            renderProfile({
                skills: ['Python', 'JavaScript', 'React', 'FastAPI', 'HTML/CSS', 'Git'],
                experience: '2 Years',
                education: 'B.Tech Computer Science'
            });

            // Mock Matches
            const matches = [
                {
                    id: 1,
                    title: 'Junior Frontend Developer',
                    company: 'TechFlow Solutions',
                    score: 92,
                    summary: 'Excellent match! Your React and CSS skills align perfectly. Missing only TypeScript.',
                    matched: ['React', 'JavaScript', 'HTML5', 'CSS3', 'Git'],
                    missing: ['TypeScript']
                },
                {
                    id: 2,
                    title: 'Full Stack Engineer',
                    company: 'StartUp Inc',
                    score: 78,
                    summary: 'Good potential. Strong backend fit with Python/FastAPI, but role requires 3+ years experience.',
                    matched: ['Python', 'FastAPI', 'Git'],
                    missing: ['Docker', 'AWS', '3+ Years Exp']
                },
                {
                    id: 3,
                    title: 'React Intern',
                    company: 'WebWizards',
                    score: 85,
                    summary: 'Perfect entry-level fit. You have all required technical skills.',
                    matched: ['React', 'JavaScript', 'HTML/CSS'],
                    missing: ['Redux']
                }
            ];

            renderMatches(matches);
            alert('Resume Analysis Complete!');
        }, 1500);
    });

    function renderProfile(data) {
        profileCard.classList.remove('hidden');
        skillsList.innerHTML = '';
        data.skills.forEach(skill => {
            const tag = document.createElement('span');
            tag.className = 'tag';
            tag.innerText = skill;
            skillsList.appendChild(tag);
        });
        experienceText.innerText = data.experience;
        educationText.innerText = data.education;
    }

    function renderMatches(matches) {
        emptyState.classList.add('hidden');
        matchesGrid.innerHTML = '';

        matches.forEach(match => {
            const card = document.createElement('div');
            card.className = 'match-card';
            const scoreClass = match.score >= 85 ? 'high' : match.score >= 70 ? 'medium' : 'low';

            card.innerHTML = `
                <div class="match-header">
                    <div>
                        <div class="job-title">${match.title}</div>
                        <div class="company-name">${match.company}</div>
                    </div>
                    <div class="match-score ${scoreClass}">${match.score}% Match</div>
                </div>
                <div class="match-body">
                    <p class="match-summary">${match.summary}</p>
                    <button class="btn btn-primary btn-block mt-1 view-details-btn" data-id="${match.id}">View Details</button>
                </div>
            `;
            matchesGrid.appendChild(card);

            // Click Handler for "View Details"
            // We use a closure here to capture 'match' data effectively
            card.querySelector('.view-details-btn').addEventListener('click', () => {
                // SAVE MATCH DATA TO LOCAL STORAGE
                localStorage.setItem('selectedMatch', JSON.stringify(match));
                window.location.href = 'match.html';
            });
        });
    }
}

// ==========================================
// COMPANY DASHBOARD LOGIC
// ==========================================
function initCompanyDashboard() {
    const form = document.getElementById('create-job-form');
    const jobsGrid = document.getElementById('jobs-grid');

    // Load jobs from LocalStorage or use default
    let myJobs = JSON.parse(localStorage.getItem('companyJobs')) || [
        { title: 'Senior Backend Engineer', applicants: 12, topMatch: 95 },
        { title: 'UI/UX Designer', applicants: 5, topMatch: 88 }
    ];

    if (jobsGrid) renderJobs(myJobs);

    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const title = document.getElementById('job-title').value;
            const description = document.getElementById('job-description').value;

            if (title && description) {
                const newJob = { title: title, applicants: 0, topMatch: 0 };
                myJobs.unshift(newJob);

                // Save to Storage
                localStorage.setItem('companyJobs', JSON.stringify(myJobs));

                renderJobs(myJobs);
                form.reset();
                alert('Job Posted Successfully!');
            }
        });
    }

    function renderJobs(jobs) {
        if (!jobsGrid) return;
        jobsGrid.innerHTML = '';
        jobs.forEach(job => {
            const card = document.createElement('div');
            card.className = 'match-card';
            const scoreClass = job.topMatch >= 90 ? 'high' : job.topMatch >= 75 ? 'medium' : 'low';
            card.innerHTML = `
                <div class="match-header">
                    <div>
                        <div class="job-title">${job.title}</div>
                        <div class="company-name">${job.applicants} Applicants</div>
                    </div>
                    ${job.topMatch > 0 ? `<div class="match-score ${scoreClass}">Top: ${job.topMatch}%</div>` : '<div class="badge">New</div>'}
                </div>
                <div class="match-body">
                     <div style="display: flex; gap: 0.5rem; margin-top: 1rem;">
                        <button class="btn btn-primary" style="flex: 1; font-size: 0.9rem;">View Matches</button>
                        <button class="btn btn-secondary" style="font-size: 0.9rem;">Edit</button>
                    </div>
                </div>
            `;
            jobsGrid.appendChild(card);
        });
    }
}

// ==========================================
// MATCH REPORT LOGIC
// ==========================================
function initMatchReport() {
    // Retrieve data from LocalStorage
    const storedMatch = localStorage.getItem('selectedMatch');

    if (!storedMatch) {
        // Fallback if accessed directly
        alert('No match selected. Redirecting to Dashboard.');
        window.location.href = 'student.html';
        return;
    }

    const matchData = JSON.parse(storedMatch);

    // Hydrate DOM
    document.getElementById('job-title').textContent = matchData.title; // Note: key is 'title' in object
    document.getElementById('company-name').textContent = matchData.company;
    document.getElementById('score-text').textContent = `${matchData.score}%`;
    document.getElementById('ai-summary').textContent = matchData.summary;

    const matchedContainer = document.getElementById('matched-skills');
    const missingContainer = document.getElementById('missing-skills');
    const scoreCircle = document.getElementById('score-circle');

    // Color code circle
    if (matchData.score >= 90) scoreCircle.style.borderColor = '#10b981';
    else if (matchData.score >= 70) scoreCircle.style.borderColor = '#eab308';
    else scoreCircle.style.borderColor = '#ef4444';

    // Render Skills
    // Fallback if array is missing in mock data (safeguard)
    const matched = matchData.matched || ['React', 'HTML'];
    const missing = matchData.missing || ['TypeScript'];

    matched.forEach(skill => {
        const span = document.createElement('span');
        span.className = 'tag success';
        span.textContent = skill;
        matchedContainer.appendChild(span);
    });

    missing.forEach(skill => {
        const span = document.createElement('span');
        span.className = 'tag missing';
        span.textContent = skill;
        missingContainer.appendChild(span);
    });
}
