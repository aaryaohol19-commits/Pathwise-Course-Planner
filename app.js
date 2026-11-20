const API = "http://127.0.0.1:8000";

// Get HTML elements
const courseList = document.getElementById("courseList");
const roadmapList = document.getElementById("roadmapList");
const targetCourse = document.getElementById("targetCourse");
const planButton = document.getElementById("planButton");
const planResult = document.getElementById("planResult");
const progressText = document.getElementById("progressText");
const progressBar = document.getElementById("progressBar");

// Store completed courses
let completedCourses = JSON.parse(
    localStorage.getItem("completedCourses") || "[]"
);

// Safely display text
function escapeHTML(text) {
    return String(text ?? "").replace(/[&<>"']/g, function(character) {
        const characters = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        };

        return characters[character];
    });
}


// LOAD COURSES
async function loadCourses() {
    try {
        const response = await fetch(`${API}/courses`);

        if (!response.ok) {
            throw new Error("Unable to load courses");
        }

        const courses = await response.json();

        courseList.innerHTML = "";
        targetCourse.innerHTML = '<option value="">Select a course</option>';

        courses.forEach(function(course) {

            // Add course to course list
            const card = document.createElement("div");
            card.className = "course-card";

            const isCompleted = completedCourses.includes(course.id);

            card.innerHTML = `
                <h3>${escapeHTML(course.name)}</h3>
                <p>Course ID: ${escapeHTML(course.id)}</p>
                <p>Prerequisites: ${
                    course.prerequisites.length
                    ? course.prerequisites.map(escapeHTML).join(", ")
                    : "None"
                }</p>

                <label>
                    <input
                        type="checkbox"
                        class="course-checkbox"
                        value="${escapeHTML(course.id)}"
                        ${isCompleted ? "checked" : ""}
                    >
                    Completed
                </label>
            `;

            courseList.appendChild(card);

            // Add course to dropdown
            const option = document.createElement("option");
            option.value = course.id;
            option.textContent = course.name;

            targetCourse.appendChild(option);
        });

        // Track completed courses
        document.querySelectorAll(".course-checkbox").forEach(function(checkbox) {
            checkbox.addEventListener("change", function() {

                const courseId = this.value;

                if (this.checked) {
                    if (!completedCourses.includes(courseId)) {
                        completedCourses.push(courseId);
                    }
                } else {
                    completedCourses = completedCourses.filter(
                        id => id !== courseId
                    );
                }

                localStorage.setItem(
                    "completedCourses",
                    JSON.stringify(completedCourses)
                );

                updateProgress();
            });
        });

        updateProgress();

    } catch (error) {
        courseList.innerHTML = "<p>Unable to load courses. Please try again.</p>";
        console.error("Course loading error:", error);
    }
}


// LOAD ROADMAP
async function loadRoadmap() {
    try {
        const response = await fetch(`${API}/roadmap`);

        if (!response.ok) {
            throw new Error("Unable to load roadmap");
        }

        const roadmap = await response.json();

        const courses = Array.isArray(roadmap)
            ? roadmap
            : roadmap.roadmap || roadmap.learning_order || [];

        roadmapList.innerHTML = "";

        courses.forEach(function(course, index) {

            const item = document.createElement("div");
            item.className = "roadmap-item";

            item.innerHTML = `
                <h3>${index + 1}. ${escapeHTML(course.name)}</h3>
                <p>Course ID: ${escapeHTML(course.id)}</p>
            `;

            roadmapList.appendChild(item);
        });

    } catch (error) {
        roadmapList.innerHTML = "<p>Unable to load roadmap.</p>";
        console.error("Roadmap loading error:", error);
    }
}


// GENERATE LEARNING PLAN
async function generatePlan() {

    const selectedCourse = targetCourse.value;

    if (!selectedCourse) {
        planResult.innerHTML = "<p>Please select a course first.</p>";
        return;
    }

    planResult.innerHTML = "<p>Generating your learning plan...</p>";

    try {
        const response = await fetch(`${API}/plan`, {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                target_course: selectedCourse
            })
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.detail || "Unable to generate plan");
        }

        // Get courses from the API response
        const plan = Array.isArray(result)
            ? result
            : result.plan ||
              result.learning_path ||
              result.prerequisite_path ||
              result.roadmap ||
              [];

        if (!Array.isArray(plan) || plan.length === 0) {
            planResult.innerHTML = "<p>No learning plan found.</p>";
            return;
        }

        let html = "<h2>Your Learning Plan</h2>";

        plan.forEach(function(course, index) {

            html += `
                <div class="roadmap-item">
                    <h3>${index + 1}. ${escapeHTML(course.name)}</h3>
                    <p>Course ID: ${escapeHTML(course.id)}</p>
                </div>
            `;
        });

        planResult.innerHTML = html;

    } catch (error) {
        planResult.innerHTML = `<p>${escapeHTML(error.message)}</p>`;
        console.error("Plan generation error:", error);
    }
}


// UPDATE PROGRESS
function updateProgress() {

    const checkboxes = document.querySelectorAll(".course-checkbox");

    const totalCourses = checkboxes.length;
    const completedCount = completedCourses.length;

    let percentage = 0;

    if (totalCourses > 0) {
        percentage = Math.round(
            (completedCount / totalCourses) * 100
        );
    }

    if (progressText) {
        progressText.textContent =
            `${completedCount} / ${totalCourses} Courses Completed (${percentage}%)`;
    }

    if (progressBar) {
        progressBar.style.width = `${percentage}%`;
    }
}


// BUTTON EVENT
if (planButton) {
    planButton.addEventListener("click", generatePlan);
}


// LOAD EVERYTHING WHEN PAGE OPENS
document.addEventListener("DOMContentLoaded", function() {

    loadCourses();

    loadRoadmap();

});