from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from graph import CourseGraph
from database import initialize_db
from auth import router as auth_router


# Create FastAPI application
app = FastAPI(title="Pathwise Course Planner")


# Allow frontend to communicate with backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Include authentication routes
app.include_router(auth_router)


# Initialize database
@app.on_event("startup")
def startup():
    initialize_db()


# Store all course information
COURSES = [
    ("programming", "Programming Basics", []),
    ("c", "C Programming", ["programming"]),
    ("cpp", "C++ Programming", ["c"]),
    ("python", "Python Programming", ["programming"]),
    ("oop", "Object-Oriented Programming", ["cpp"]),
    ("dsa", "Data Structures", ["programming"]),
    ("linkedlist", "Linked Lists", ["dsa"]),
    ("stacksqueues", "Stacks and Queues", ["dsa"]),
    ("treesgraphs", "Trees and Graphs", ["dsa"]),
    ("algorithms", "Algorithms", ["dsa"]),
    ("searchsort", "Searching and Sorting", ["algorithms"]),
    ("dp", "Dynamic Programming", ["algorithms"]),
    ("htmlcss", "HTML and CSS", ["programming"]),
    ("javascript", "JavaScript", ["htmlcss"]),
    ("frontend", "Frontend Development", ["javascript"]),
    ("database", "Database Management", ["programming"]),
    ("backend", "Backend Development", ["javascript", "database"]),
    ("fullstack", "Full-Stack Development", ["frontend", "backend"]),
    ("mathai", "Mathematics for AI", ["programming"]),
    ("statistics", "Statistics for Data Science", ["mathai"]),
    ("ml", "Machine Learning", ["python", "statistics"]),
    ("deeplearning", "Deep Learning", ["ml"]),
    ("nlp", "Natural Language Processing", ["ml"]),
    ("ai", "Advanced AI", ["deeplearning", "algorithms"]),
    ("coa", "Computer Organization", ["programming"]),
    ("os", "Operating Systems", ["coa", "dsa"]),
    ("networks", "Computer Networks", ["programming"]),
    ("dbms", "Database Systems", ["database"]),
    ("cloud", "Cloud Computing", ["networks", "os"]),
    ("cybersecurity", "Cybersecurity", ["networks", "os"]),
]


# Build graph using adjacency list
def build_graph():
    graph = CourseGraph()

    for course_id, name, prerequisites in COURSES:
        graph.add_course(course_id, name, prerequisites)

    return graph


# Create graph object
course_graph = build_graph()


# Request model for learning plan
class PlanRequest(BaseModel):
    target_course: str


# Home route
@app.get("/")
def home():
    return {
        "message": "Welcome to Pathwise Smart Course Prerequisite Planner"
    }


# Backend health check
@app.get("/health")
def health():
    return {"status": "Backend is running"}


# Get all available courses
@app.get("/courses")
def get_courses():
    return course_graph.get_courses()


# Get complete learning roadmap
@app.get("/roadmap")
def get_roadmap():
    return course_graph.get_learning_order()


# Get graph information
@app.get("/graph")
def get_graph():
    nodes = course_graph.get_courses()

    edges = []

    for course_id, name, prerequisites in COURSES:
        for prerequisite in prerequisites:
            edges.append({
                "from": prerequisite,
                "to": course_id
            })

    return {
        "nodes": nodes,
        "edges": edges,
        "has_cycle": course_graph.detect_cycle()
    }


# Generate learning plan for selected course
@app.post("/plan")
def generate_plan(request: PlanRequest):

    target_course = request.target_course

    try:
        result = course_graph.get_prerequisite_path(target_course)

        return result

    except (ValueError, KeyError) as error:
        raise HTTPException(
            status_code=404,
            detail=str(error)
        )