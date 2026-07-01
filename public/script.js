const API = "http://localhost:5000/api/auth";

/* ==========================================
            REGISTER
========================================== */

async function register() {

    const username = document.getElementById("username").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!username || !email || !password) {
        return alert("Please fill all fields.");
    }

    try {

        const response = await fetch(API + "/register", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({

                username,
                email,
                password

            })

        });

        const data = await response.json();

        alert(data.message);

        if (data.success) {

            window.location = "login.html";

        }

    }

    catch (err) {

        alert("Registration Failed");

    }

}

/* ==========================================
            LOGIN
========================================== */

async function login() {

    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value.trim();

    if (!email || !password) {

        return alert("Please enter email and password.");

    }

    try {

        const response = await fetch(API + "/login", {

            method: "POST",

            headers: {

                "Content-Type": "application/json"

            },

            body: JSON.stringify({

                email,
                password

            })

        });

        const data = await response.json();

        if (!data.success) {

            return alert(data.message);

        }

        localStorage.setItem("token", data.token);
        localStorage.setItem("username", data.username);
        localStorage.setItem("role", data.role);

        window.location = "dashboard.html";

    }

    catch (err) {

        alert("Login Failed");

    }

}

/* ==========================================
            LOAD PROFILE
========================================== */

async function loadProfile() {

    const token = localStorage.getItem("token");

    if (!token) {

        window.location = "login.html";

        return;

    }

    try {

        const response = await fetch(API + "/profile", {

            headers: {

                Authorization: "Bearer " + token

            }

        });

        const data = await response.json();

        if (!data.success) {

            logout();

            return;

        }

        document.getElementById("welcome").innerHTML =
            "Welcome, " + data.user.username;

        document.getElementById("role").innerHTML =
            "Role : " + data.user.role.toUpperCase();

    }

    catch (err) {

        console.log(err);

    }

}

/* ==========================================
            CHECK ADMIN
========================================== */

async function checkAdmin() {

    const token = localStorage.getItem("token");

    if (!token) return;

    try {

        const response = await fetch(API + "/admin", {

            headers: {

                Authorization: "Bearer " + token

            }

        });

        if (response.status === 403) {

            document.getElementById("adminPanel").style.display = "none";

            return;

        }

        document.getElementById("adminPanel").style.display = "block";

        loadStats();

    }

    catch (err) {

        console.log(err);

    }

}

/* ==========================================
        DASHBOARD STATS
========================================== */

async function loadStats() {

    const token = localStorage.getItem("token");

    const response = await fetch(API + "/stats", {

        headers: {

            Authorization: "Bearer " + token

        }

    });

    const data = await response.json();

    if (!data.success) return;

    document.getElementById("totalUsers").innerHTML =
        data.totalUsers;

    document.getElementById("totalAdmins").innerHTML =
        data.totalAdmins;

    document.getElementById("totalNormalUsers").innerHTML =
        data.totalNormalUsers;

}

/* ==========================================
            LOGOUT
========================================== */

function logout() {

    localStorage.clear();

    window.location = "login.html";

}

/* ==========================================
        AUTO LOAD DASHBOARD
========================================== */

if (window.location.pathname.includes("dashboard")) {

    loadProfile();

    checkAdmin();

}