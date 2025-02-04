from pulp import LpProblem, LpVariable, LpBinary, LpMinimize, lpSum

def schedule_tasks(tasks, crew_members):
    # Preprocess tasks to add updated_requirement
    for task in tasks:
        # Use 'crew_required' if it exists, otherwise default to 1
        task['updated_requirement'] = task.get('crew_required', 1)
    
    # Create the LP problem
    prob = LpProblem("Task_Scheduling", LpMinimize)
    
    # Extract task IDs and unique crew member IDs
    task_ids = [task["id"] for task in tasks]
    crew_ids = list(set(crew["id"] for crew in crew_members))  # Ensure unique crew members

    # Map roles for tasks and crew members
    task_roles = {task["id"]: task["role_name"].lower() for task in tasks}
    crew_roles = {crew["id"]: crew["role_name"].lower() for crew in crew_members}
    
    # Decision variables: assign[t][c] = 1 if crew c is assigned to task t
    assignment = LpVariable.dicts("assign", (task_ids, crew_ids), cat=LpBinary)

    # Objective: Minimize total task assignment
    prob += lpSum(assignment[t][c] for t in task_ids for c in crew_ids), "Minimize_Assignment"

    # Constraints

    # 1. Role Matching: Assign crew only if their role matches the task
    for t in task_ids:
        for c in crew_ids:
            if crew_roles.get(c, "") != task_roles.get(t, ""):  # Role mismatch
                prob += assignment[t][c] == 0, f"Role_Mismatch_Task_{t}_Crew_{c}"

    # 2. A crew member can only be assigned one task
    for c in crew_ids:
        prob += lpSum(assignment[t][c] for t in task_ids) <= 1, f"One_Task_Per_Crew_{c}"

    # 3. Task should be assigned to the required number of distinct crew members
    for t in task_ids:
        task = next(task for task in tasks if task["id"] == t)
        prob += lpSum(assignment[t][c] for c in crew_ids) == task["updated_requirement"], f"Task_{t}_updated_requirement"

    # Solve the problem
    prob.solve()

    # Generate results without duplicates
    assigned_crew = set()  # Track already assigned crew
    task_assignments = []

    for t in task_ids:
        assigned_for_task = 0
        for c in crew_ids:
            if assignment[t][c].varValue == 1 and c not in assigned_crew:
                task_assignments.append({
                    "task_assignment_id": t,
                    "crew_member_id": c
                })
                assigned_crew.add(c)  # Prevent duplicate assignment
                assigned_for_task += 1
                
                # Stop if we've assigned enough crew for this task
                if assigned_for_task == task['updated_requirement']:
                    break

    return task_assignments