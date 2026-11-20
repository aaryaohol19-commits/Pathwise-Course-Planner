from collections import defaultdict, deque


class CourseGraph:

    def __init__(self):
        self.courses = {}
        self.graph = defaultdict(list)

    # Add a course and its prerequisites
    def add_course(self, course_id, name, prerequisites=None):

        prerequisites = prerequisites or []

        if course_id in self.courses:
            raise ValueError("Duplicate course ID")

        for item in prerequisites:
            if item not in self.courses:
                raise ValueError(f"Unknown prerequisite: {item}")

        self.courses[course_id] = {
            "id": course_id,
            "name": name,
            "prerequisites": prerequisites
        }

        self.graph[course_id]

        for item in prerequisites:
            self.graph[item].append(course_id)

    # Get all courses
    def get_courses(self):
        return list(self.courses.values())

    # Find the correct learning order using Kahn's Algorithm
    def get_learning_order(self):

        degree = {key: 0 for key in self.courses}

        for children in self.graph.values():
            for child in children:
                degree[child] += 1

        queue = deque(
            key for key in self.courses if degree[key] == 0
        )

        order = []

        while queue:
            current = queue.popleft()
            order.append(current)

            for child in self.graph[current]:
                degree[child] -= 1

                if degree[child] == 0:
                    queue.append(child)

        if len(order) != len(self.courses):
            raise ValueError("Circular dependency detected")

        return [
            {
                "position": i,
                "id": key,
                "name": self.courses[key]["name"],
                "prerequisites": self.courses[key]["prerequisites"]
            }
            for i, key in enumerate(order, 1)
        ]

    # Detect circular dependencies
    def detect_cycle(self):
        try:
            self.get_learning_order()
            return False
        except ValueError:
            return True

    # Find all prerequisites needed for a selected course
    def get_prerequisite_path(self, target_id):

        if target_id not in self.courses:
            raise ValueError("Course not found")

        required = set()

        def collect(course_id):
            for prerequisite in self.courses[course_id]["prerequisites"]:

                if prerequisite not in required:
                    required.add(prerequisite)
                    collect(prerequisite)

        collect(target_id)
        required.add(target_id)

        return [
            course for course in self.get_learning_order()
            if course["id"] in required
        ]