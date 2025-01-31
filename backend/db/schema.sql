admin(id INT (PK),name VARCHAR(100), email VARCHAR(100), password_hash VARCHAR(255), airline VARCHAR(100), city VARCHAR(30));
airline_recent_activities(activity_id INT (PK), airline_name VARCHAR(100), activity_description TEXT, activity_time TIMESTAMP WITHOUT TIME ZONE );
availability(crew_member_id INT (PK), date DATE (PK), available BOOLEAN , start_time TIME WITHOUT TIME ZONE, end_time  TIME WITHOUT TIME ZONE);
crew_members(id INT(PK), name VARCHAR(100), email VARCHAR(100), phone_number VARCHAR(15), hire_date DATE, status VARCHAR(20) IN ("Active", "Inactive"), password VARCHAR(255), airline VARCHAR(100), city VARCHAR(30));
crew_roles(crew_member_id INT (PK), role_id INT (PK));
crew_task_assignments(id INT(PK), task_assignment_id INT, crew_member_id INT, status VARCHAR(20) IN ("Assigned", "Not Assigned"), notifications BOOLEAN, flight_number VARCHAR(20));
flight_performance_report(id INT (PK),flight_number VARCHAR(255), airline VARCHAR(255), on_time_departure BOOLEAN, on_time_arrival BOOLEAN, customer_satisfaction VARCHAR(10) IN ("bad", "great", "good"));
flights(id INT (PK), flight_number VARCHAR(20), departure_time TIMESTAMP WITHOUT TIME ZONE, arrival_time TIMESTAMP WITHOUT TIME ZONE, origin VARCHAR(100), destination VARCHAR(100), airline VARCHAR(100));
roles(id INT(PK), role_name VARCHAR(100), description TEXT);
schedules(id INT(PK), flight_id INT, schedule_date DATE, status VARCHAR(20) IN ("Pending", "Confirmed"));
task_assignments(id INT (PK), flight_id INT, task_id INT, crew_required INT, updated_requirement INT);
tasks(id INT (PK), task_name VARCHAR(100), description TEXT, crew_required INT, updated_requirement INT);


-- Admin Table
CREATE TABLE admin (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    airline VARCHAR(100) NOT NULL,
    city VARCHAR(30) NOT NULL
);

-- Airline Recent Activities Table
CREATE TABLE airline_recent_activities (
    activity_id SERIAL PRIMARY KEY,
    airline_name VARCHAR(100) NOT NULL,
    activity_description TEXT NOT NULL,
    activity_time TIMESTAMP WITHOUT TIME ZONE
);

-- Availability Table
CREATE TABLE availability (
    crew_member_id INT NOT NULL,
    date DATE NOT NULL,
    available BOOLEAN NOT NULL,
    start_time TIME WITHOUT TIME ZONE ,
    end_time TIME WITHOUT TIME ZONE ,
    PRIMARY KEY (crew_member_id, date),
    FOREIGN KEY (crew_member_id) REFERENCES crew_members(id) ON DELETE CASCADE
);

-- Crew Members Table
CREATE TABLE crew_members (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone_number VARCHAR(15) NOT NULL,
    hire_date DATE ,
    status VARCHAR(20) CHECK (status IN ('Active', 'Inactive')) NOT NULL,
    password VARCHAR(255) NOT NULL,
    airline VARCHAR(100) NOT NULL,
    city VARCHAR(30) NOT NULL
);

-- Crew Roles Table
CREATE TABLE crew_roles (
    crew_member_id INT NOT NULL,
    role_id INT NOT NULL,
    PRIMARY KEY (crew_member_id, role_id),
    FOREIGN KEY (crew_member_id) REFERENCES crew_members(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
);

-- Crew Task Assignments Table
CREATE TABLE crew_task_assignments (
    id SERIAL PRIMARY KEY,
    task_assignment_id INT NOT NULL,
    crew_member_id INT NOT NULL,
    status VARCHAR(20) CHECK (status IN ('Assigned', 'Not Assigned')) NOT NULL,
    notifications BOOLEAN ,
    flight_number VARCHAR(20) NOT NULL,
    FOREIGN KEY (task_assignment_id) REFERENCES task_assignments(id) ON DELETE CASCADE,
    FOREIGN KEY (crew_member_id) REFERENCES crew_members(id) ON DELETE CASCADE
);

-- Flight Performance Report Table
CREATE TABLE flight_performance_report (
    id SERIAL PRIMARY KEY,
    flight_number VARCHAR(255) NOT NULL,
    airline VARCHAR(255) NOT NULL,
    on_time_departure BOOLEAN ,
    on_time_arrival BOOLEAN ,
    customer_satisfaction VARCHAR(10) CHECK (customer_satisfaction IN ('bad', 'great', 'good')) 
);

-- Flights Table
CREATE TABLE flights (
    id SERIAL PRIMARY KEY,
    flight_number VARCHAR(20) NOT NULL,
    departure_time TIMESTAMP WITHOUT TIME ZONE ,
    arrival_time TIMESTAMP WITHOUT TIME ZONE ,
    origin VARCHAR(100) ,
    destination VARCHAR(100) ,
    airline VARCHAR(100) NOT NULL
);

-- Roles Table
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    role_name VARCHAR(100) NOT NULL,
    description TEXT 
);

-- Schedules Table
CREATE TABLE schedules (
    id SERIAL PRIMARY KEY,
    flight_id INT NOT NULL,
    schedule_date DATE ,
    status VARCHAR(20) CHECK (status IN ('Pending', 'Confirmed')) ,
    FOREIGN KEY (flight_id) REFERENCES flights(id) ON DELETE CASCADE
);

-- Task Assignments Table
CREATE TABLE task_assignments (
    id SERIAL PRIMARY KEY,
    flight_id INT NOT NULL,
    task_id INT NOT NULL,
    crew_required INT NOT NULL,
    updated_requirement INT ,
    FOREIGN KEY (flight_id) REFERENCES flights(id) ON DELETE CASCADE,
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
);

-- Tasks Table
CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    task_name VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    crew_required INT NOT NULL,
    updated_requirement INT 
);