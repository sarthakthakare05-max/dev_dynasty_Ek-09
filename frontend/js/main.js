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
    if (matchedSkillsContainer && !document.getElementById('applicant-id')) { // Distinguish from details page
        initMatchReport();
    }

    // --- RECRUITER: APPLICANTS LIST (Applicants.html) ---
    if (document.getElementById('applicants-grid')) {
        initApplicantsList();
    }

    // --- RECRUITER: DETAILS (Applicant_details.html) ---
    if (document.getElementById('applicant-id')) {
        initApplicantDetails();
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

            // NEW: No need to guess role. Backend handles it.
            try {
                const response = await fetch(`${API_BASE_URL}/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
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
            // Align with Backend Enum: 'applicant' or 'recruiter'
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
            alert('Connection error: ' + error.message);
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

        // NEW: Display CGPA and Education
        const eduText = data.extracted_education || 'Not Available';
        const cgpaText = data.extracted_cgpa ? `CGPA: ${data.extracted_cgpa}` : 'CGPA: Not Available';

        educationText.innerHTML = `<strong>${eduText}</strong><br><span class="text-xs text-gray">${cgpaText}</span>`;
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
                        <div class="company-name">${job.company_name || 'Unknown Company'}</div>
                        <div class="text-xs text-gray">Exp: ${job.required_experience}y | Min CGPA: ${job.min_cgpa || 'N/A'}</div>
                    </div>
                </div>
                <div class="match-body">
                    <p class="match-summary">${job.description.substring(0, 100)}...</p>
                    <button class="btn btn-primary btn-block mt-1 apply-btn" data-id="${job.id || job._id}">Calculate Match</button>
                </div>
            `;
            matchesGrid.appendChild(card);

            card.querySelector('.apply-btn').addEventListener('click', async () => {
                const btn = card.querySelector('.apply-btn');
                btn.innerText = 'Matching...';
                const jobId = job.id || job._id; // Handle both id and _id
                try {
                    const matchResponse = await fetch(`${API_BASE_URL}/matches/${jobId}?applicant_id=${user.email}`, {
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
            const companyName = document.getElementById('company-name').value;
            const description = document.getElementById('job-description').value;
            const exp = parseInt(document.getElementById('min-experience').value);
            const cgpa = parseFloat(document.getElementById('min-cgpa').value);
            const skills = document.getElementById('job-skills').value.split(',').map(s => s.trim());

            try {
                const response = await fetch(`${API_BASE_URL}/jobs/?recruiter_id=${user.email}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        title,
                        company_name: companyName,
                        description,
                        required_skills: skills,
                        required_experience: exp,
                        min_cgpa: cgpa
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
                        <div class="company-name">${job.company_name || 'My Company'}</div>
                        <div class="text-xs text-gray">Exp: ${job.required_experience}y | Min CGPA: ${job.min_cgpa || 'N/A'}</div>
                    </div>
                </div>
                <div class="match-body">
                     <p>${job.description.substring(0, 100)}...</p>
                     <a href="applicants.html?job_id=${job.id || job._id}&title=${encodeURIComponent(job.title)}" class="btn btn-secondary btn-block mt-1">View Applicants</a>
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

    // --- RESUME VIEWER (NEW) ---
    const user = getUser();
    if (user) {
        // Fetch latest resume to get the file path
        fetch(`${API_BASE_URL}/resumes/${user.email}`)
            .then(time => time.json())
            .then(resume => {
                if (resume.file_path) {
                    // Normalize path (Windows backslash to forward slash)
                    const normalizedPath = resume.file_path.replace(/\\/g, '/');
                    const pdfUrl = `${API_BASE_URL}/${normalizedPath}`;

                    const iframe = document.getElementById('resume-frame');
                    const downloadLink = document.getElementById('resume-link');

                    if (iframe) iframe.src = pdfUrl;
                    if (downloadLink) downloadLink.href = pdfUrl;
                }
            })
            .catch(err => console.error("Could not load resume PDF:", err));
    }

    // --- APPLY FOR JOB LOGIC ---
    const btnApply = document.getElementById('btn-apply');
    if (btnApply) {
        btnApply.addEventListener('click', async () => {
            btnApply.innerText = 'Applying...';
            btnApply.disabled = true;

            try {
                const response = await fetch(`${API_BASE_URL}/applications/`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        job_id: matchData.job_id,
                        applicant_id: user.email,
                        score: matchData.score,
                        match_data: matchData
                    })
                });

                if (response.ok) {
                    alert('Application Submitted Successfully!');
                    btnApply.innerText = 'Applied';
                    btnApply.style.background = '#10b981';
                } else {
                    const err = await response.json();
                    alert(`Application failed: ${err.detail}`);
                    btnApply.innerText = 'Apply for Job';
                    btnApply.disabled = false;
                }
            } catch (error) {
                console.error('Apply error:', error);
                alert('Connection error.');
                btnApply.innerText = 'Apply for Job';
                btnApply.disabled = false;
            }
        });
    }
}

// ==========================================
// RECRUITER: APPLICANTS LIST
// ==========================================
function initApplicantsList() {
    const params = new URLSearchParams(window.location.search);
    const jobId = params.get('job_id');
    const jobTitle = params.get('title');

    if (!jobId) return;

    document.getElementById('job-titleed').textContent = jobTitle || 'Job';
    const grid = document.getElementById('applicants-grid');

    fetch(`${API_BASE_URL}/applications/job/${jobId}`)
        .then(res => res.json())
        .then(apps => {
            grid.innerHTML = '';
            if (apps.length === 0) {
                grid.innerHTML = '<div class="empty-state">No applicants yet.</div>';
                return;
            }

            apps.forEach(app => {
                const card = document.createElement('div');
                card.className = 'match-card';
                // Score Color
                let scoreColor = '#ef4444';
                if (app.score >= 80) scoreColor = '#10b981';
                else if (app.score >= 50) scoreColor = '#eab308';

                card.innerHTML = `
                    <div class="match-header">
                        <div style="flex: 1;">
                            <div class="job-title">${app.applicant_id}</div>
                            <div class="text-xs text-gray">Applied: ${new Date(app.created_at).toLocaleDateString()}</div>
                            <div class="text-xs" style="margin-top: 5px; font-weight: bold; color: ${app.status === 'shortlisted' ? '#10b981' : '#666'}">
                                Status: ${app.status.toUpperCase()}
                            </div>
                        </div>
                        <div style="text-align: right;">
                            <div style="font-size: 1.5rem; font-weight: bold; color: ${scoreColor};">${app.score}%</div>
                            <div class="text-xs text-gray">Match</div>
                        </div>
                    </div>
                    <div class="match-body">
                         <button class="btn btn-primary btn-block mt-1 view-btn" data-id="${app.id}">View Details</button>
                    </div>
                `;
                grid.appendChild(card);

                card.querySelector('.view-btn').addEventListener('click', () => {
                    // Store app data to avoid re-fetching
                    localStorage.setItem('selectedApplication', JSON.stringify(app));
                    window.location.href = 'applicant_details.html';
                });
            });
        })
        .catch(err => console.error("Error fetching applicants:", err));
}

// ==========================================
// RECRUITER: APPLICANT DETAILS
// ==========================================
function initApplicantDetails() {
    const storedApp = localStorage.getItem('selectedApplication');
    if (!storedApp) {
        window.location.href = 'company.html';
        return;
    }
    const app = JSON.parse(storedApp);
    const matchData = app.match_data;

    // Render Stats
    document.getElementById('applicant-id').textContent = app.applicant_id;
    document.getElementById('status-text').textContent = `Status: ${app.status.toUpperCase()}`;
    document.getElementById('score-text').textContent = `${app.score}%`;

    // Status color
    const scoreCircle = document.getElementById('score-circle');
    if (app.score >= 80) scoreCircle.style.borderColor = '#10b981';
    else if (app.score >= 50) scoreCircle.style.borderColor = '#eab308';

    // Skills
    const matchedContainer = document.getElementById('matched-skills');
    matchedContainer.innerHTML = '';
    matchData.matched_skills.forEach(skill => {
        const span = document.createElement('span');
        span.className = 'tag success';
        span.textContent = skill;
        matchedContainer.appendChild(span);
    });

    const missingContainer = document.getElementById('missing-skills');
    missingContainer.innerHTML = '';
    matchData.missing_skills.forEach(skill => {
        const span = document.createElement('span');
        span.className = 'tag missing';
        span.textContent = skill;
        missingContainer.appendChild(span);
    });

    // Resume PDF
    fetch(`${API_BASE_URL}/resumes/${app.applicant_id}`)
        .then(res => res.json())
        .then(resume => {
            if (resume.file_path) {
                const normalizedPath = resume.file_path.replace(/\\/g, '/');
                document.getElementById('resume-frame').src = `${API_BASE_URL}/${normalizedPath}`;
            }
        });

    // Buttons
    const btnShortlist = document.getElementById('btn-shortlist');
    const btnReject = document.getElementById('btn-reject');

    if (app.status === 'shortlisted') btnShortlist.disabled = true;
    if (app.status === 'rejected') btnReject.disabled = true;

    btnShortlist.addEventListener('click', () => updateStatus(app.id, 'shortlisted', btnShortlist));
    btnReject.addEventListener('click', () => updateStatus(app.id, 'rejected', btnReject));

    async function updateStatus(appId, status, btn) {
        btn.innerText = 'Updating...';
        try {
            const res = await fetch(`${API_BASE_URL}/applications/${appId}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });
            if (res.ok) {
                alert(`Applicant ${status}!`);
                btn.innerText = (status === 'shortlisted') ? 'Shortlisted' : 'Rejected';
                btn.disabled = true;
                document.getElementById('status-text').textContent = `Status: ${status.toUpperCase()}`;
            } else {
                alert('Update failed');
                btn.innerText = (status === 'shortlisted') ? 'Shortlist Candidate' : 'Reject';
            }
        } catch (e) {
            console.error(e);
            alert('Connection error');
        }
    }

    document.getElementById('back-link').addEventListener('click', () => {
        window.history.back();
    });
}
