const API_BASE_URL = 'http://localhost:8000';

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
// AUTH SYSTEM (API & LocalStorage)
// ==========================================
function logout() {
    localStorage.removeItem('token');
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

    if ((path.includes('student.html') || path.includes('company.html') || path.includes('match.html'))) {
        if (!user) {
            window.location.href = 'index.html';
        }
        else if (path.includes('student') && user.role !== 'applicant') {
            window.location.href = 'company.html';
        }
        else if (path.includes('company') && user.role !== 'recruiter') {
            window.location.href = 'student.html';
        }
    }
}

function updateNavbarUser() {
    const user = getUser();
    const logoBadge = document.querySelector('.logo .badge');
    if (user && logoBadge) {
        logoBadge.textContent = user.role === 'recruiter' ? 'Recruiter' : 'Applicant';
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

    if (btnLoginNav) btnLoginNav.addEventListener('click', () => openModal('login'));
    if (btnRegisterNav) btnRegisterNav.addEventListener('click', () => openModal('register'));
    if (btnGetStarted) btnGetStarted.addEventListener('click', () => openModal('register'));
    if (closeModal) closeModal.addEventListener('click', closeModalFunc);
    window.addEventListener('click', (e) => { if (e.target === modal) closeModalFunc(); });

    if (switchToRegister) switchToRegister.addEventListener('click', (e) => { e.preventDefault(); showRegister(); });
    if (switchToLogin) switchToLogin.addEventListener('click', (e) => { e.preventDefault(); showLogin(); });

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;

            try {
                const response = await fetch(`${API_BASE_URL}/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password, role: 'applicant' })
                });

                if (response.ok) {
                    const data = await response.json();
                    localStorage.setItem('token', data.access_token);
                    localStorage.setItem('currentUser', JSON.stringify({ email, role: data.role, id: data.id || email }));
                    window.location.href = data.role === 'recruiter' ? 'company.html' : 'student.html';
                } else {
                    alert('Login failed. Please check your credentials.');
                }
            } catch (error) {
                console.error('Login error:', error);
                alert('Connection error. Is the backend running?');
            }
        });
    }

    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const role_val = document.getElementById('register-role').value;
            const role = role_val === 'company' ? 'recruiter' : 'applicant';
            const email = document.getElementById('register-email').value;
            const password = document.getElementById('register-password').value;

            try {
                const response = await fetch(`${API_BASE_URL}/auth/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password, role })
                });

                if (response.ok) {
                    alert('Registration successful! Please login.');
                    showLogin();
                } else {
                    const data = await response.json();
                    alert(`Registration failed: ${data.detail || 'Unknown error'}`);
                }
            } catch (error) {
                console.error('Registration error:', error);
                alert('Connection error. Is the backend running?');
            }
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

    const user = getUser();

    // Initial load
    fetchJobs();

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

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!fileInput.files.length) { alert('Please select a PDF file first.'); return; }

        const btn = form.querySelector('button');
        btn.innerText = 'Analyzing...';
        btn.disabled = true;

        const formData = new FormData();
        formData.append('file', fileInput.files[0]);

        try {
            const response = await fetch(`${API_BASE_URL}/resumes/?user_id=${user.email}`, {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                const data = await response.json();
                renderProfile(data);
                alert('Resume Analyzed! Now you can see match percentages for jobs.');
                fetchJobs();
            } else {
                alert('Failed to analyze resume.');
            }
        } catch (error) {
            console.error('Upload error:', error);
            alert('Connection error.');
        } finally {
            btn.innerText = 'Analyze Resume';
            btn.disabled = false;
        }
    });

    async function fetchJobs() {
        try {
            const response = await fetch(`${API_BASE_URL}/jobs/`);
            if (response.ok) {
                const jobs = await response.json();
                renderJobs(jobs);
            }
        } catch (error) {
            console.error('Fetch jobs error:', error);
        }
    }

    function renderProfile(data) {
        profileCard.classList.remove('hidden');
        skillsList.innerHTML = '';
        data.skills.forEach(skill => {
            const tag = document.createElement('span');
            tag.className = 'tag';
            tag.innerText = skill;
            skillsList.appendChild(tag);
        });
        experienceText.innerText = `${data.experience_years} Years`;
        educationText.innerText = 'Extracted from Resume';
    }

    function renderJobs(jobs) {
        if (jobs.length > 0) emptyState.classList.add('hidden');
        matchesGrid.innerHTML = '';

        jobs.forEach(job => {
            const card = document.createElement('div');
            card.className = 'match-card';

            card.innerHTML = `
                <div class="match-header">
                    <div>
                        <div class="job-title">${job.title}</div>
                        <div class="company-name">Experience Req: ${job.required_experience}y</div>
                    </div>
                </div>
                <div class="match-body">
                    <p class="match-summary">${job.description.substring(0, 100)}...</p>
                    <button class="btn btn-primary btn-block mt-1 apply-btn" data-id="${job.id}">Calculate Match</button>
                </div>
            `;
            matchesGrid.appendChild(card);

            card.querySelector('.apply-btn').addEventListener('click', async () => {
                const btn = card.querySelector('.apply-btn');
                btn.innerText = 'Matching...';
                try {
                    const matchResponse = await fetch(`${API_BASE_URL}/matches/${job.id}?applicant_id=${user.email}`, {
                        method: 'POST'
                    });
                    if (matchResponse.ok) {
                        const matchData = await matchResponse.json();
                        localStorage.setItem('selectedMatch', JSON.stringify({ ...matchData, title: job.title }));
                        window.location.href = 'match.html';
                    } else {
                        const err = await matchResponse.json();
                        alert(err.detail || 'Could not calculate match. Did you upload a resume?');
                    }
                } catch (error) {
                    console.error('Match error:', error);
                } finally {
                    btn.innerText = 'Calculate Match';
                }
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
    const user = getUser();

    fetchMyJobs();

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const title = document.getElementById('job-title').value;
            const description = document.getElementById('job-description').value;
            const expInput = prompt("Required Years of Experience?", "2");
            const skillsInput = prompt("Required Skills (comma separated)?", "Python, React");

            if (!expInput || !skillsInput) return;

            const exp = parseInt(expInput);
            const skills = skillsInput.split(',').map(s => s.trim());

            try {
                const response = await fetch(`${API_BASE_URL}/jobs/?recruiter_id=${user.email}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        title,
                        description,
                        required_skills: skills,
                        required_experience: exp
                    })
                });

                if (response.ok) {
                    alert('Job Posted Successfully!');
                    form.reset();
                    fetchMyJobs();
                }
            } catch (error) {
                console.error('Post job error:', error);
            }
        });
    }

    async function fetchMyJobs() {
        try {
            const response = await fetch(`${API_BASE_URL}/jobs/`);
            if (response.ok) {
                const jobs = await response.json();
                renderJobs(jobs);
            }
        } catch (error) {
            console.error('Fetch jobs error:', error);
        }
    }

    function renderJobs(jobs) {
        if (!jobsGrid) return;
        jobsGrid.innerHTML = '';
        jobs.forEach(job => {
            const card = document.createElement('div');
            card.className = 'match-card';
            card.innerHTML = `
                <div class="match-header">
                    <div>
                        <div class="job-title">${job.title}</div>
                        <div class="company-name">Required Exp: ${job.required_experience}y</div>
                    </div>
                </div>
                <div class="match-body">
                     <p>${job.description.substring(0, 100)}...</p>
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
    const storedMatch = localStorage.getItem('selectedMatch');
    if (!storedMatch) {
        window.location.href = 'student.html';
        return;
    }

    const matchData = JSON.parse(storedMatch);

    document.getElementById('job-title').textContent = matchData.title;
    document.getElementById('company-name').textContent = matchData.experience_gap || 'Analysis Complete';
    document.getElementById('score-text').textContent = `${matchData.score}%`;
    document.getElementById('ai-summary').textContent = `Fit Score is based on 70% skills match and 30% experience alignment.`;

    const matchedContainer = document.getElementById('matched-skills');
    const missingContainer = document.getElementById('missing-skills');
    const scoreCircle = document.getElementById('score-circle');

    if (matchData.score >= 80) scoreCircle.style.borderColor = '#10b981';
    else if (matchData.score >= 50) scoreCircle.style.borderColor = '#eab308';
    else scoreCircle.style.borderColor = '#ef4444';

    matchedContainer.innerHTML = '';
    matchData.matched_skills.forEach(skill => {
        const span = document.createElement('span');
        span.className = 'tag success';
        span.textContent = skill;
        matchedContainer.appendChild(span);
    });

    missingContainer.innerHTML = '';
    matchData.missing_skills.forEach(skill => {
        const div = document.createElement('div');
        div.style.background = '#f9fafb';
        div.style.padding = '1rem';
        div.style.borderRadius = '8px';
        div.style.marginBottom = '1rem';

        const span = document.createElement('span');
        span.className = 'tag missing';
        span.textContent = skill;
        div.appendChild(span);

        // Course recommendations
        const rec = matchData.course_recommendations.find(r => r.skill === skill);
        if (rec) {
            const p = document.createElement('p');
            p.textContent = 'Recommended Courses:';
            p.style.fontSize = '0.75rem';
            p.style.fontWeight = 'bold';
            p.style.marginTop = '0.5rem';
            p.style.marginBottom = '0.2rem';
            div.appendChild(p);

            const ul = document.createElement('ul');
            ul.style.fontSize = '0.8rem';
            ul.style.color = '#444';
            ul.style.paddingLeft = '1.2rem';
            rec.courses.forEach(c => {
                const li = document.createElement('li');
                li.textContent = c;
                ul.appendChild(li);
            });
            div.appendChild(ul);
        }

        missingContainer.appendChild(div);
    });
}
