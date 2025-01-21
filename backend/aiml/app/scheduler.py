from pulp import LpProblem, LpVariable, LpBinary, LpMinimize, lpSum

def schedule_tasks(tasks, crew_members):
    # Create the LP problem
    prob = LpProblem("Task_Scheduling", LpMinimize)
    
    # Define task IDs and crew member IDs for easy reference
    task_ids = [task["id"] for task in tasks]
    crew_ids = [crew["id"] for crew in crew_members]
    
    # Debugging: Print the task and crew IDs
    print(f"Task IDs: {task_ids}")
    print(f"Crew IDs: {crew_ids}")

    # Create a dictionary of role names for tasks and crew members
    task_roles = {task["id"]: task["role_name"] for task in tasks}
    crew_roles = {crew["id"]: crew["role_name"] for crew in crew_members}
    
    # Debugging: Print task roles and crew roles
    print(f"Task Roles: {task_roles}")
    print(f"Crew Roles: {crew_roles}")
    
    # Create the decision variables: whether task t is assigned to crew c
    assignment = LpVariable.dicts("assign", (task_ids, crew_ids), cat=LpBinary)
    
    # Debugging: Check the initial assignment variables
    print(f"Assignment Variables: {assignment}")

    # Define the objective: minimize the total task assignment (or another relevant objective)
    prob += lpSum(assignment[t][c] for t in task_ids for c in crew_ids), "Minimize_Assignment"

    # Add constraints

    # 1. A task can only be assigned to crew members who are available and whose role matches
    for t in task_ids:
        for c in crew_ids:
            if crew_roles[c] != task_roles[t]:  # Ensure the role matches
                prob += assignment[t][c] == 0  # Don't assign the task to this crew member
                print(f"Task {t} is not assigned to Crew {c} because roles don't match.")
    
    # 2. A crew member can be assigned only one task at a time
    for c in crew_ids:
        prob += lpSum(assignment[t][c] for t in task_ids) <= 1, f"One_Task_Per_Crew_{c}"
        print(f"Added constraint: Crew {c} can only be assigned one task.")

    # 3. Task should be assigned to the required number of crew members
    for t in task_ids:
        task = next(task for task in tasks if task["id"] == t)  # Find the task object for the current task ID
        prob += lpSum(assignment[t][c] for c in crew_ids) == task["crew_required"], f"Task_{t}_Crew_Required"
        print(f"Added constraint: Task {t} requires {task['crew_required']} crew members.")

    # 4. Other constraints such as availability and task duration can also be added
    # (you can include additional constraints as necessary here)

    # Solve the problem
    prob.solve()

    # Debugging: Print the status of the problem after solving
    print(f"Problem Status: {prob.status}")

    # Generate the result (task assignments)
    task_assignments = []
    for t in task_ids:
        for c in crew_ids:
            if assignment[t][c].varValue == 1:  # If assigned, include in the result
                task_assignments.append({
                    "task_assignment_id": t,
                    "crew_member_id": c
                })
                print(f"Assigned Task {t} to Crew {c}")

    return task_assignments
