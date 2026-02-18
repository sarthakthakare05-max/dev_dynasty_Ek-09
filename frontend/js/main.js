document.addEventListener('DOMContentLoaded', () => {

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
    if (createJobForm) {
        initCompanyDashboard();
    }

    // --- SHARED LOGIC ---
    const btnLogout = document.getElementById('btn-logout');
    if (btnLogout) {
        btnLogout.addEventListener('click', () => {
            // Mock Logout
            window.location.href = 'index.html';
        });
    }
});

// ==========================================
// AUTH ENTITY
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
    let isLoginView = true;

    // Functions
    const openModal = (view = 'login') => {
        modal.classList.remove('hidden');
        if (view === 'login') {
            showLogin();
        } else {
            showRegister();
        }
    };

    const closeModalFunc = () => {
        modal.classList.add('hidden');
    };

    const showLogin = () => {
        loginFormContainer.classList.remove('hidden');
        registerFormContainer.classList.add('hidden');
        isLoginView = true;
    };

    const showRegister = () => {
        loginFormContainer.classList.add('hidden');
        registerFormContainer.classList.remove('hidden');
        isLoginView = false;
    };

    // Event Listeners
    if (btnLoginNav) btnLoginNav.addEventListener('click', () => openModal('login'));
    if (btnRegisterNav) btnRegisterNav.addEventListener('click', () => openModal('register'));
    if (btnGetStarted) btnGetStarted.addEventListener('click', () => openModal('register'));

    if (closeModal) closeModal.addEventListener('click', closeModalFunc);

    // Close modal if clicking outside content
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModalFunc();
        }
    });

    if (switchToRegister) {
        switchToRegister.addEventListener('click', (e) => {
            e.preventDefault();
            showRegister();
        });
    }

    if (switchToLogin) {
        switchToLogin.addEventListener('click', (e) => {
            e.preventDefault();
            showLogin();
        });
    }

    // Mock Submissions
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value;
            // Simple mock redirect
            if (email.includes('student')) {
                window.location.href = 'student.html';
            } else if (email.includes('company')) {
                window.location.href = 'company.html';
            } else {
                window.location.href = 'student.html'; // Default to student
            }
        });
    }

    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const role = document.getElementById('register-role').value;
            if (role === 'student') {
                window.location.href = 'student.html';
            } else {
                window.location.href = 'company.html';
            }
        });
    }
}

// ==========================================
// STUDENT DASHBOARD ENTITY
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

    // Drag and Drop Visuals
    const dropArea = document.getElementById('drop-area');

    if (dropArea) {
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropArea.addEventListener(eventName, preventDefaults, false);
        });

        function preventDefaults(e) {
            e.preventDefault();
            e.stopPropagation();
        }

        dropArea.addEventListener('dragover', () => dropArea.style.borderColor = '#2563eb');
        dropArea.addEventListener('dragleave', () => dropArea.style.borderColor = '#cbd5e1');
        dropArea.addEventListener('drop', () => dropArea.style.borderColor = '#cbd5e1');

        fileInput.addEventListener('change', () => {
            if (fileInput.files.length > 0) {
                document.querySelector('.file-msg').textContent = fileInput.files[0].name;
            }
        });
    }


    form.addEventListener('submit', (e) => {
        e.preventDefault();

        if (!fileInput.files.length) {
            alert('Please select a PDF file first.');
            return;
        }

        const btn = form.querySelector('button');
        const originalText = btn.innerText;
        btn.innerText = 'Analyzing...';
        btn.disabled = true;

        // Mock API Latency
        setTimeout(() => {
            btn.innerText = originalText;
            btn.disabled = false;

            // 1. Show Profile Data (Mock)
            renderProfile({
                skills: ['Python', 'JavaScript', 'React', 'FastAPI', 'HTML/CSS', 'Git'],
                experience: '2 Years',
                education: 'B.Tech Computer Science'
            });

            // 2. Show Matches (Mock)
            renderMatches([
                {
                    title: 'Junior Frontend Developer',
                    company: 'TechFlow Solutions',
                    score: 92,
                    summary: 'Excellent match! Your React and CSS skills align perfectly. Missing only TypeScript.'
                },
                {
                    title: 'Full Stack Engineer',
                    company: 'StartUp Inc',
                    score: 78,
                    summary: 'Good potential. Strong backend fit with Python/FastAPI, but role requires 3+ years experience.'
                },
                {
                    title: 'React Intern',
                    company: 'WebWizards',
                    score: 85,
                    summary: 'Perfect entry-level fit. You have all required technical skills.'
                }
            ]);

            alert('Resume Analysis Complete!');

        }, 1500);
    });

    function renderProfile(data) {
        // Show card
        profileCard.classList.remove('hidden');

        // Clear and add skills
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
        matchesGrid.innerHTML = ''; // Clear empty state or old matches

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
                    <button class="btn btn-primary btn-block mt-1" style="font-size: 0.9rem;">View Details</button>
                </div>
            `;
            matchesGrid.appendChild(card);
        });
    }
}

// ==========================================
// COMPANY DASHBOARD ENTITY
// ==========================================
function initCompanyDashboard() {
    const form = document.getElementById('create-job-form');
    const jobsGrid = document.getElementById('jobs-grid');

    // Mock initial jobs
    const myJobs = [
        {
            title: 'Senior Backend Engineer',
            applicants: 12,
            topMatch: 95
        },
        {
            title: 'UI/UX Designer',
            applicants: 5,
            topMatch: 88
        }
    ];

    renderJobs(myJobs);

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const title = document.getElementById('job-title').value;
        const description = document.getElementById('job-description').value;

        if (title && description) {
            // Mock Job Creation
            const newJob = {
                title: title,
                applicants: 0,
                topMatch: 0
            };

            myJobs.unshift(newJob);
            renderJobs(myJobs);
            form.reset();
            alert('Job Posted Successfully!');
        }
    });

    function renderJobs(jobs) {
        jobsGrid.innerHTML = '';

        jobs.forEach(job => {
            const card = document.createElement('div');
            card.className = 'match-card'; // Reusing match card style

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
