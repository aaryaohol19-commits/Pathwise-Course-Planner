const API = "http://127.0.0.1:8000";

// Function to open dashboard
function openDashboard(user) {
    localStorage.setItem("loggedInUser", JSON.stringify(user));
    window.location.href = "./index.html";
}


// REGISTER
const registerForm = document.getElementById("registerForm");

if (registerForm) {
    registerForm.addEventListener("submit", async function(event) {
        event.preventDefault();

        const name = document.getElementById("registerName").value.trim();
        const email = document.getElementById("registerEmail").value.trim();
        const password = document.getElementById("registerPassword").value;
        const confirmPassword = document.getElementById("confirmPassword").value;
        const message = document.getElementById("registerMessage");

        if (password !== confirmPassword) {
            message.textContent = "Passwords do not match!";
            return;
        }

        try {
            const response = await fetch(`${API}/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    full_name: name,
                    email: email,
                    password: password
                })
            });

            const result = await response.json();

            if (response.ok) {
                message.textContent = "Registration successful! Opening Pathwise...";

                openDashboard({
                    full_name: name,
                    email: email,
                    guest: false
                });

            } else {
                message.textContent = result.detail || "Registration failed.";
            }

        } catch (error) {
            message.textContent = "Cannot connect to server.";
        }
    });
}


// LOGIN
const loginForm = document.getElementById("loginForm");

if (loginForm) {
    loginForm.addEventListener("submit", async function(event) {
        event.preventDefault();

        const email = document.getElementById("loginEmail").value.trim();
        const password = document.getElementById("loginPassword").value;
        const message = document.getElementById("loginMessage");

        try {
            const response = await fetch(`${API}/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email: email,
                    password: password
                })
            });

            const result = await response.json();

            if (response.ok) {
                message.textContent = "Login successful! Opening Pathwise...";

                openDashboard({
                    ...result.user,
                    guest: false
                });

            } else {
                message.textContent = result.detail || "Invalid login details.";
            }

        } catch (error) {
            message.textContent = "Cannot connect to server.";
        }
    });
}


// CONTINUE AS GUEST
function continueAsGuest() {
    openDashboard({
        full_name: "Guest",
        email: "",
        guest: true
    });
}

const guestLogin = document.getElementById("guestLogin");
const guestRegister = document.getElementById("guestRegister");

if (guestLogin) {
    guestLogin.addEventListener("click", continueAsGuest);
}

if (guestRegister) {
    guestRegister.addEventListener("click", continueAsGuest);
}