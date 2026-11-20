const API_URL = "http://127.0.0.1:8000";

document.addEventListener("DOMContentLoaded", function () {
loadCourses();
loadGraph();

```
document.getElementById("generateButton").addEventListener("click", generateRoadmap);
```

});

async function loadCourses() {
const select = document.getElementById("targetCourse");
const courseList = document.getElementById("courseList");

```
try {
    const response = await fetch(API_URL + "/courses");
    if (!response.ok) throw new Error("Backend error");

    const data = await response.json();

    select.innerHTML = '<option value="">Choose a course</option>';

    data.courses.forEach(function (course) {
        const option = document.createElement("option");
        option.value = course.id;
        option.textContent = course.name;
        select.appendChild(option);
    });

    courseList.innerHTML = "";

    data.courses.forEach(function (course) {
        const card = document.createElement("article");
        card.className = "course-card";

        const title = document.createElement("h3");
        title.textContent = course.name;
        card.appendChild(title);

        const description = document.createElement("p");
        description.textContent = course.prerequisites.length
            ? "Prerequisites: " + course.prerequisites.join(", ")
            : "No prerequisites";
        card.appendChild(description);

        courseList.appendChild(card);
    });

    document.getElementById("totalCourses").textContent = data.courses.length;

} catch (error) {
    console.error(error);
    select.innerHTML = '<option value="">Backend connection failed</option>';
    courseList.textContent = "Please check that the backend is running.";
}
```

}

async function generateRoadmap() {
const select = document.getElementById("targetCourse");
const roadmap = document.getElementById("roadmap");
const message = document.getElementById("message");

```
if (!select.value) {
    message.textContent = "Please select a course first.";
    return;
}

try {
    message.textContent = "Generating roadmap...";

    const response = await fetch(API_URL + "/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target_course: select.value })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.detail || "Could not generate roadmap.");

    roadmap.innerHTML = "<h3>Your Learning Roadmap</h3>";

    const list = document.createElement("ol");

    data.learning_path.forEach(function (course) {
        const item = document.createElement("li");
        item.textContent = course.name;
        list.appendChild(item);
    });

    roadmap.appendChild(list);
    message.textContent = "Roadmap generated successfully!";

} catch (error) {
    console.error(error);
    message.textContent = "Error: " + error.message;
}
```

}

async function loadGraph() {
const graphView = document.getElementById("graphView");

```
try {
    const response = await fetch(API_URL + "/graph");
    if (!response.ok) throw new Error("Could not load graph");

    const data = await response.json();
    graphView.innerHTML = "";

    data.courses.forEach(function (course) {
        const item = document.createElement("p");

        item.textContent = course.prerequisites.length
            ? course.prerequisites.join(", ") + " → " + course.name
            : "Start → " + course.name;

        graphView.appendChild(item);
    });

} catch (error) {
    console.error(error);
    graphView.textContent = "Could not load course dependencies.";
}
```

}
