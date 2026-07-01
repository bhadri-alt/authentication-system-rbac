const API = "http://localhost:5000/api/auth";

const token = localStorage.getItem("token");

if (!token) {
    window.location = "login.html";
}

const payload = JSON.parse(atob(token.split(".")[1]));

const loggedInUserId = payload.id;

loadUsers();

/* ==========================================
            LOAD USERS
========================================== */

async function loadUsers() {

    try {

        const response = await fetch(API + "/users", {

            headers: {
                Authorization: "Bearer " + token
            }

        });

        if (response.status === 403) {

            alert("Access Denied");

            window.location = "dashboard.html";

            return;

        }

        const data = await response.json();

        document.getElementById("totalUsers").innerHTML =
            data.totalUsers;

        const tbody = document.getElementById("usersBody");

        tbody.innerHTML = "";

        data.users.forEach(user => {

            const row = document.createElement("tr");

            row.innerHTML = `

                <td>${user.username}</td>

                <td>${user.email}</td>

                <td>

                    <span class="${user.role === "admin" ? "adminBadge" : "userBadge"}">

                        ${user.role.toUpperCase()}

                    </span>

                </td>

                <td>

                ${
                    user._id === loggedInUserId

                    ?

                    `<button disabled class="disabledBtn">

                        Current Admin

                    </button>`

                    :

                    `

                    <button onclick="changeRole('${user._id}','${user.role}')">

                        ${user.role === "admin"

                            ? "Make User"

                            : "Make Admin"}

                    </button>

                    <button class="deleteBtn"

                        onclick="deleteUser('${user._id}')">

                        Delete

                    </button>

                    `

                }

                </td>

            `;

            tbody.appendChild(row);

        });

    }

    catch (err) {

        console.log(err);

        alert("Unable to load users.");

    }

}

/* ==========================================
        CHANGE ROLE
========================================== */

async function changeRole(id, currentRole) {

    const newRole = currentRole === "admin"

        ? "user"

        : "admin";

    if (!confirm(`Change role to ${newRole}?`)) return;

    try {

        const response = await fetch(

            API + "/users/" + id + "/role",

            {

                method: "PATCH",

                headers: {

                    "Content-Type": "application/json",

                    Authorization: "Bearer " + token

                },

                body: JSON.stringify({

                    role: newRole

                })

            }

        );

        const data = await response.json();

        alert(data.message);

        loadUsers();

    }

    catch (err) {

        console.log(err);

    }

}

/* ==========================================
        DELETE USER
========================================== */

async function deleteUser(id) {

    if (!confirm("Delete this user permanently?"))

        return;

    try {

        const response = await fetch(

            API + "/users/" + id,

            {

                method: "DELETE",

                headers: {

                    Authorization: "Bearer " + token

                }

            }

        );

        const data = await response.json();

        alert(data.message);

        loadUsers();

    }

    catch (err) {

        console.log(err);

    }

}