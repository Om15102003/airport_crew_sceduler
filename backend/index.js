import bodyParser  from "body-parser";
import pg from "pg";
import bcrypt from "bcrypt";
import passport from "passport";
import { Strategy } from "passport-local";
import GoogleStrategy from "passport-google-oauth2";
import session from "express-session";
import env from "dotenv";
import cors from "cors";
import express from "express";
import jwt from "jsonwebtoken";

import solver from "javascript-lp-solver"

env.config();


const app = express();
const port = 4000;
const saltRounds = 10;
app.use(express.json());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
const JWT_SECRET = process.env.JWT_SECRET;


const db = new pg.Client({
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    database: process.env.PG_DATABASE,
    password: process.env.PG_PASSWORD,
    port: process.env.PG_PORT,
  });
db.connect();
//api to enter a new admin
app.post("/admin/signup", async(req,res)=>{
    const {name, email, password_hash, airline, city}=req.body;
    if(!name||!email||!password_hash||!airline||!city){
        return res.status(400).json({error: 'Name, email, password,airline and city are required.'});
    }
    try{
        const query=`INSERT INTO admin(name, email, password_hash, airline, city) VALUES ($1,$2,$3,$4,$5)`;
        await db.query(query,[name,email,password_hash,airline,city]);
        res.status(200).json({
            success:true,
            message:"Sign up successful"
        });
    }catch(err){
        console.error('Error during signing up:',err);
        res.status(500).json({error:'Failed to sign up'});
    }
})



// Crew Signup Route
app.post("/crew/signup", async (req, res) => {
    try {
        const { name, email, phone_number, password, airline, city, roles } = req.body;
        
        if (!name || !email || !phone_number || !password || !airline || !city || !roles || roles.length === 0) {
            return res.status(400).json({ error: "All fields including roles are required" });
        }

        // Hash the password before storing it
        //const hashedPassword = await bcrypt.hash(password, 10);
        
        // Insert into crew_members with hire_date as current date and status as 'Active'
        const crewMemberResult = await db.query(
            `INSERT INTO crew_members (name, email, phone_number, hire_date, status, password, airline, city) 
             VALUES ($1, $2, $3, CURRENT_DATE, 'Active', $4, $5, $6) RETURNING id`,
            [name, email, phone_number, password, airline, city]
        );

        const crewMemberId = crewMemberResult.rows[0].id;

        // Process roles
        for (let role of roles) {
            let {roleName, description}=role
            let roleResult = await db.query("SELECT id FROM roles WHERE role_name = $1", [roleName]);

            let roleId;
            if (roleResult.rows.length > 0) {
                // Role exists, use the existing id
                roleId = roleResult.rows[0].id;
            } else {
                // Role does not exist, insert it and retrieve the id
                const newRole = await db.query(
                    "INSERT INTO roles (role_name, description) VALUES ($1, $2) RETURNING id",
                    [roleName,description]
                );
                roleId = newRole.rows[0].id;
            }

            // Insert into crew_roles table
            await db.query(
                "INSERT INTO crew_roles (crew_member_id, role_id) VALUES ($1, $2)",
                [crewMemberId, roleId]
            );
        }

        // Insert availability for the crew member
        await db.query(
            `INSERT INTO availability (crew_member_id, date, available, start_time, end_time)
             VALUES ($1, CURRENT_DATE, TRUE, '08:00:00', '16:00:00')`,
            [crewMemberId]
        );

        res.status(201).json({ message: "Crew member registered successfully", crew_member_id: crewMemberId });
    } catch (error) {
        console.error("Error in crew signup:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});







//api call for login of admins and crew_members
app.post('/login', async (req, res) => {
    const { email, password, role } = req.body; // `role` specifies whether it's admin or crew

    if (!email || !password || !role) {
        return res.status(400).json({ error: 'Email, password, and role are required.' });
    }

    try {
        let table, query;
        if (role === 'admin') {
            table = 'admin';
            query = `
                SELECT id, name, email, airline, password_hash 
                FROM admin 
                WHERE email = $1;
            `;
        } else if (role === 'crew') {
            table = 'crew_members';
            query = `
                SELECT id,name, email,hire_date, status, airline, password 
                FROM crew_members 
                WHERE email = $1;
            `;
        } else {
            return res.status(400).json({ error: 'Invalid role. Must be either "admin" or "crew".' });
        }

        // Fetch user data
        const result = await db.query(query, [email]);

        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials.' });
        }

        const user = result.rows[0];

        // Verify password
        if(role==='admin'){
            if (password!==result.rows[0].password_hash) {
                return res.status(401).json({ error: 'Invalid credentials.' });
            }
            // Remove sensitive data (e.g., password) before returning the user object
            delete user.password_hash;
        }else if(role==='crew'){
            if (password!==result.rows[0].password) {
                return res.status(401).json({ error: 'Invalid credentials.' });
            }
            // Remove sensitive data (e.g., password) before returning the user object
            delete user.password;
        }
        // Generate JWT token
        const token = jwt.sign({ id: user.id, role }, process.env.JWT_SECRET, {
            expiresIn: '1h',
        });

       

        res.status(200).json({
            success:true,
            message: 'Login successful!',
            token,
            user, // Return full user data
        });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ error: 'Failed to log in.' });
    }
});


//API to get the details of the admin with particular id
app.get('/admin',async(req,res)=>{
    const adminId=req.query.adminId;
    
    if (!adminId) {
        return res.status(400).json({ error: 'Email, password, and role are required.' });
    }
    try {
        let query;
        
        query = `
                SELECT id, name, email, airline, password_hash 
                FROM admin 
                WHERE id = $1;
            `;
        // Fetch user data
        const result = await db.query(query, [adminId]);

        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid id.' });
        }

        const user = result.rows[0];


        delete user.password_hash;

        res.status(200).json({
            success:true,
            user, // Return full user data
        });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ error: 'Failed to log in.' });
    }
})


//api call to get all the details related to the flight of a particular airline for the admin
app.get('/flights',async(req,res)=>{
    const airline=req.query.airline;
    console.log(airline);
    
    if(!airline){
        console.log("No query");
        return res.status(400).json({error:'Airline name is required'});
    }
    try{
        const query=`SELECT 
                    f.id AS flight_id,
                    f.airline,
                    f.flight_number,
                    f.departure_time,
                    f.arrival_time,
                    f.destination,
                    f.origin,
                    s.schedule_date,
                    COALESCE(s.status,'PENDING') AS schedule_status
                    FROM flights f 
                    LEFT JOIN schedules s ON f.id=s.flight_id
                    WHERE f.airline=$1
                    ORDER BY f.departure_time`;
        const result=await db.query(query,[airline]);
        console.log(result.rows);
        res.status(200).json(result.rows);
    }catch(error){
        console.error('Error fetching flight details for airline:',error);
        res.status(500).json({error:'Failed to fetch flight details for the specified airline'});
    }
});


//api call for the admin to post any new upcoming flight details
app.post('/flights',async(req,res)=>{
    const {
        airline,
        flight_number,
        departure_time,
        arrival_time,
        destination,
        origin,
        schedule_date
    }=req.body;
    if(!airline ||
        !flight_number ||
        !departure_time ||
        !arrival_time ||
        !destination ||
        !origin ||
        !schedule_date){
            return res.status(400).json({error:'All fields are required'});
        }
    try{
        console.log("inside try");
        const flightInsertQuery=`INSERT INTO flights (airline,flight_number,departure_time,arrival_time,destination,origin) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id`;
        const flightResult=await db.query(flightInsertQuery,[airline,flight_number,departure_time,arrival_time,destination,origin]);
        const flightId=flightResult.rows[0].id;
        const scheduleInsertQuery=`INSERT INTO schedules (flight_id,schedule_date,status) VALUES ($1,$2,'Pending')`;
        await db.query(scheduleInsertQuery,[flightId,schedule_date]);
        const taskQuery=`INSERT INTO tasks(task_name, description,crew_required, updated_requirement) VALUES ($1,$2,$3,$4) RETURNING id`;
        const task1=await db.query(taskQuery,["Baggage Handling", "Loads and unloads the baggages of the passenger into the plane",2,2]);
        const task2=await db.query(taskQuery,["Aircraft Maintenance", "Checks the plane's engine if it is fit for the next take-off",3,3]);
        const task1Id=task1.rows[0].id;
        const task2Id=task2.rows[0].id;
        const taskAssign=`INSERT INTO task_assignments (flight_id, task_id, crew_required, updated_requirement) VALUES ($1,$2,$3,$4)`;
        await db.query(taskAssign,[flightId, task1Id,2,2]);
        await db.query(taskAssign,[flightId, task2Id,3,3]);
        res.status(201).json({ message: 'Flight and schedule added successfully!'});
    }catch(error){
        console.error('Error adding flight and schedule:',error);
        res.status(500).json({error:'Failed to add flight and schedule'});
    }
})


//api call to show the admin the details of all the crew_members along with their availablity
app.get('/crew-members', async (req, res) => {
    const adminId = req.query.adminId;

    if (!adminId) {
        return res.status(400).json({ error: 'Admin ID is required' });
    }
    try {
        // Fetch admin's airline
        const adminQuery = `
            SELECT airline, city 
            FROM admin 
            WHERE id = $1;
        `;
        const adminResult = await db.query(adminQuery, [adminId]);

        if (adminResult.rows.length === 0) {
            return res.status(404).json({ error: 'Admin not found.' });
        }

        const airline = adminResult.rows[0].airline;
        const city=adminResult.rows[0].city;
        // Query to fetch crew members, their availability, and roles
        const crewQuery = `
            SELECT 
                cm.id AS crew_id,
                cm.name AS crew_name,
                cm.email AS crew_email,
                cm.phone_number AS Phn_no,
                cm.airline,
                ca.date AS availability_date,
                ca.available,
                ca.start_time,
                ca.end_time,
                r.role_name AS role_name,
                r.description AS role_description
            FROM 
                crew_members cm
            LEFT JOIN 
                availability ca ON cm.id = ca.crew_member_id
            LEFT JOIN 
                crew_roles cr ON cm.id = cr.crew_member_id
            LEFT JOIN 
                roles r ON cr.role_id = r.id
            WHERE 
                cm.airline = $1 AND cm.city=$2
            ORDER BY 
                cm.id, ca.date;
        `;
        const crewResult = await db.query(crewQuery, [airline,city]);
        res.setHeader('Content-Type', 'application/json'); // Explicitly set Content-Type
        res.status(200).json(crewResult.rows);
        
    } catch (error) {
        console.error('Error fetching crew members:', error);
        res.status(500).json({ error: 'Failed to fetch crew members.' });
    }
});
//api call to show the admin the details of all the crew_members along with their who are availabe
app.get('/crew-members/available', async (req, res) => {
    const adminId = req.query.adminId;

    if (!adminId) {
        return res.status(400).json({ error: 'Admin ID is required' });
    }
    try {
        // Fetch admin's airline
        const adminQuery = `
            SELECT airline, city 
            FROM admin 
            WHERE id = $1;
        `;
        const adminResult = await db.query(adminQuery, [adminId]);

        if (adminResult.rows.length === 0) {
            return res.status(404).json({ error: 'Admin not found.' });
        }

        const airline = adminResult.rows[0].airline;
        const city=adminResult.rows[0].city;
        // Query to fetch crew members, their availability, and roles
        const crewQuery = `
            SELECT 
                cm.id AS crew_id,
                cm.name AS crew_name,
                cm.email AS crew_email,
                cm.phone_number AS Phn_no,
                cm.airline,
                ca.date AS availability_date,
                ca.available,
                ca.start_time,
                ca.end_time,
                r.role_name AS role_name,
                r.description AS role_description
            FROM 
                crew_members cm
            LEFT JOIN 
                availability ca ON cm.id = ca.crew_member_id
            LEFT JOIN 
                crew_roles cr ON cm.id = cr.crew_member_id
            LEFT JOIN 
                roles r ON cr.role_id = r.id
            WHERE 
                cm.airline = $1 AND cm.city=$2 AND ca.available=$3
            ORDER BY 
                cm.id, ca.date;
        `;
        const crewResult = await db.query(crewQuery, [airline,city,true]);
        res.setHeader('Content-Type', 'application/json'); // Explicitly set Content-Type
        res.status(200).json(crewResult.rows);
        
    } catch (error) {
        console.error('Error fetching crew members:', error);
        res.status(500).json({ error: 'Failed to fetch crew members.' });
    }
});



//api call to get all the tasks associated with a particular flight
app.get('/tasks/flight', async (req, res) => {
    const  flightNumber  = req.query.flightNumber;
    if (!flightNumber) {
        return res.status(400).json({ error: 'flight_number is required' });
    }
    try {
        const flight_id_raw=await db.query('SELECT id FROM flights WHERE flight_number=$1',[flightNumber]);
        const flight_id=flight_id_raw.rows[0].id;


        // Fetch all tasks associated with the given flight_id
        const taskQuery = `
            SELECT ta.id, ta.flight_id, t.task_name, t.description, ta.updated_requirement
            FROM task_assignments ta
            JOIN tasks t ON ta.task_id = t.id
            WHERE ta.flight_id = $1 AND ta.updated_requirement!= $2;
        `;

        const tasks = await db.query(taskQuery, [flight_id,0]);

        // Return the tasks to the client
        //console.log(tasks);
        
        if(tasks.rows.length>0){
        res.status(200).json({ tasks: tasks.rows });
        }
    } catch (error) {
        console.error('Error fetching tasks:', error);
        res.status(500).json({ error: 'Failed to fetch tasks for the flight.' });
    }
});


//API to get the report of past flights
app.get('/flights/airline/:airline', async (req, res) => {
    const { airline } = req.params;

    try {
        // Query to fetch flight data based on the airline
        const flightQuery = `
            SELECT 
                id, 
                report_date, 
                on_time_departure, 
                on_time_arrival, 
                crew_satisfaction, 
                customer_satisfaction
            FROM flight_performance_report
            WHERE airline = $1;
        `;

        // Execute the query with the provided airline parameter
        const flights = await db.query(flightQuery, [airline]);

        // Return the flight data to the client
        res.status(200).json({ flights: flights.rows });
    } catch (error) {
        console.error('Error fetching flight data:', error);
        res.status(500).json({ error: 'Failed to fetch flight data for the airline.' });
    }
});


//API call to fetch the flights and tasks related data from the database
app.get('/flight-tasks', async (req, res) => {
    const adminId = req.query.adminId; // Get the admin's ID from query parameters
  
    if (!adminId) {
      return res.status(400).json({ error: 'Admin ID parameter is required' });
    }
  
    try {
      // Step 1: Get admin details (city and airline) using adminId
      const adminResult = await db.query(`
        SELECT city, airline FROM admin WHERE id = $1
      `, [adminId]);
  
      // If no admin is found, return an error
      if (adminResult.rows.length === 0) {
        return res.status(404).json({ error: 'Admin not found' });
      }
  
      const { city, airline } = adminResult.rows[0];
      console.log(city);
      console.log(airline);
      
      
      // Step 2: Get flight and task details based on the admin's city and airline
      const result = await db.query(`
        SELECT 
            flights.flight_number, 
            flights.departure_time, 
            flights.arrival_time, 
            flights.destination, 
            flights.origin,
            tasks.id,
            tasks.task_name, 
            tasks.description, 
            task_assignments.updated_requirement,
            schedules.status
        FROM 
            flights
        JOIN 
            task_assignments ON flights.id = task_assignments.flight_id
        JOIN 
            tasks ON task_assignments.task_id = tasks.id
        JOIN 
            schedules ON flights.id = schedules.flight_id
        WHERE 
            (flights.origin = $1 OR flights.destination = $1) 
            AND flights.airline = $2
            AND schedules.status = 'Pending'
            AND task_assignments.updated_requirement>0
      `, [city, airline]);
      console.log(city);
      console.log(airline);
      
      
        console.log(result.rows);
        
      // If no data is found
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'No pending tasks for flights in this city and airline' });
      }
  
      // Step 3: Group the data by flight_number
      const groupedFlights = {};

      result.rows.forEach(row => {
        // If the flight_number is not already in the groupedFlights object, create it
        if (!groupedFlights[row.flight_number]) {
          groupedFlights[row.flight_number] = {
            flight_number: row.flight_number,
            departure_time: row.departure_time,
            arrival_time: row.arrival_time,
            destination: row.destination,
            origin: row.origin,
            pending_tasks: []  // Initialize an empty array to hold tasks
          };
        }

        // Add the task information to the corresponding flight_number's pending_tasks array
        groupedFlights[row.flight_number].pending_tasks.push({
          task_id:row.id,
          task_name: row.task_name,
          description: row.description,
          crew_required: row.updated_requirement,
          status: row.status
        });
       
        
      });

      // Convert the grouped object back to an array for the response
      const flightData = Object.values(groupedFlights);
      res.setHeader('Content-Type', 'application/json');
      console.log(flightData);
      // Step 4: Return the grouped data
      return res.status(200).json(flightData);
  
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Internal server error' });
    }
});




//API to fetch the recent activities related to a particular airlne
app.get('/recent-activities/:airline_name',async (req,res)=>{
    const {airline_name}=req.params;
    try{
        const activityQuery=`SELECT activity_id,airline_name, activity_description, activity_time FROM airline_recent_activities WHERE airline_name= $1 ORDER BY activity_time DESC`;
        const activities=await db.query(activityQuery,[airline_name]);
        if(activities.rows.length===0){
            return res.status(404).json({message:'No activities found for this airline'});
        }
        res.status(200).json({recent_activities:activities.rows});
    }catch(error){
        console.error('Error fetching recent activities:',error);
        res.status(500).json({error:'Failed to fetch recent activites'});      
    }
});





app.post('/assign-tasks', async (req, res) => {
    const { flight_number, assignments } = req.body;
    
    if (!flight_number || !assignments || assignments.length === 0) {
        return res.status(400).json({ message: "flight_number and assignments array are required" });
    }

    try {
        // Check if the flight_number already exists
        const existingFlight = await db.query(
            'SELECT * FROM crew_task_assignments WHERE flight_number = $1',
            [flight_number]
        );

        if (existingFlight.rows.length > 0) {
            // Delete all existing task assignments for this flight
            await db.query(
                'DELETE FROM crew_task_assignments WHERE flight_number = $1',
                [flight_number]
            );
        }

        // Insert new task assignments
        const insertValues = assignments.map(({ crew_member_id, task_assignment_id }) => 
            `(${task_assignment_id}, ${crew_member_id}, 'Assigned', false, '${flight_number}')`
        ).join(',');

        const insertQuery = `
            INSERT INTO crew_task_assignments (task_assignment_id, crew_member_id, status, notifications, flight_number)
            VALUES ${insertValues} RETURNING *;
        `;

        const insertedAssignments = await db.query(insertQuery);

        // Extract the list of crew_member_ids from the assignments
        const crewMemberIds = assignments.map(({ crew_member_id }) => crew_member_id);

        // Update the availability table to set available = false for the crew members in the assignments
        const updateAvailabilityQuery = `
            UPDATE availability
            SET available = false
            WHERE crew_member_id = ANY($1);
        `;
        await db.query(updateAvailabilityQuery, [crewMemberIds]);

        // Count unique crew members assigned per task
        const countQuery = `
            SELECT task_assignment_id, COUNT(DISTINCT crew_member_id) as unique_crew_count
            FROM crew_task_assignments
            WHERE flight_number = $1
            GROUP BY task_assignment_id;
        `;
        const crewCount = await db.query(countQuery, [flight_number]);

        // Modify response to match the expected frontend format
        const formattedResponse = {
            flight_number: flight_number,
            assignments: insertedAssignments.rows.map(row => ({
                crew_member_id: row.crew_member_id,
                task_assignment_id: row.task_assignment_id
            })),
            uniqueCrewCount: crewCount.rows
        };

        res.status(201).json(formattedResponse);

    } catch (error) {
        console.error('Error handling task assignment:', error);
        res.status(500).json({ message: 'Error handling task assignment' });
    }
});

app.post('/update-crew-requirement', async (req, res) => {
    console.log('Request Body:', req.body); // Log the request body
    const { flight_number, uniqueCrewCount } = req.body;

    // Validate request body
    if (!flight_number || !Array.isArray(uniqueCrewCount)) {
        return res.status(400).json({ message: 'Invalid request body. Ensure flight_number and uniqueCrewCount are provided.' });
    }

    try {
        await db.query('BEGIN'); // Start transaction

        // Step 1: Process crew count updates for task assignments
        const updatePromises = uniqueCrewCount.map(async ({ task_assignment_id, unique_crew_count }) => {
            // Convert unique_crew_count to a number (if it's a string)
            unique_crew_count = Number(unique_crew_count);

            // Validate task_assignment_id and unique_crew_count
            if (!task_assignment_id || typeof unique_crew_count !== 'number' || isNaN(unique_crew_count)) {
                throw new Error('Invalid task_assignment_id or unique_crew_count');
            }

            // Update crew_required in task_assignments
            const updateTaskAssignment = await db.query(
                'UPDATE task_assignments SET updated_requirement = GREATEST(0, crew_required - $1) WHERE id = $2 RETURNING updated_requirement, task_id, flight_id',
                [unique_crew_count, task_assignment_id]
            );

            if (updateTaskAssignment.rows.length > 0) {
                const { updated_requirement, task_id, flight_id } = updateTaskAssignment.rows[0];

                // Update crew_required in tasks
                await db.query(
                    'UPDATE tasks SET updated_requirement = GREATEST(-1, crew_required - $1) WHERE id = $2',
                    [unique_crew_count, task_id]
                );

                // Step 2: After updating task assignments, check if all updated_requirement for the flight_id are zero
                if (updated_requirement === 0) {
                    const taskCheckQuery = `
                        SELECT COUNT(*) FROM task_assignments
                        WHERE flight_id = $1 AND updated_requirement > 0;
                    `;
                    const taskCheck = await db.query(taskCheckQuery, [flight_id]);

                    // If all updated_requirement values are zero, update the schedule status
                    if (parseInt(taskCheck.rows[0].count) === 0) {
                        await db.query(
                            'UPDATE schedules SET status = $1 WHERE flight_id = $2',
                            ['Confirmed', flight_id]
                        );
                    }
                }
            }
        });

        // Wait for all updates to complete
        await Promise.all(updatePromises);
        await db.query('COMMIT'); // Commit transaction

        res.status(200).json({ message: 'Crew requirements updated successfully!' });

    } catch (error) {
        await db.query('ROLLBACK'); // Rollback transaction on error
        console.error('Error updating crew requirements:', error);
        res.status(500).json({ message: 'Error updating crew requirements', error: error.message });
    }
});


app.post('/notify-crew-tasks', async (req, res) => {
    try {
        // Get all crew tasks with status 'assigned' and notification false
        const tasksToNotify = await db.query(
            'SELECT * FROM crew_task_assignments WHERE status = $1 AND notifications = $2',
            ['Assigned', false]
        );
        
        if (tasksToNotify.rows.length === 0) {
            return res.status(404).json({ message: 'No tasks to notify.' });
        }

        // Notify all crew members and update the notification to true
        for (const task of tasksToNotify.rows) {
            const { crew_member_id, task_assignment_id } = task;

            // Get task and flight details using the task_assignment_id
            const taskDetails = await db.query(
                'SELECT * FROM task_assignments WHERE id = $1',
                [task_assignment_id]
            );

            if (taskDetails.rows.length > 0) {
                const taskInfo = taskDetails.rows[0];
                const { flight_id, task_id } = taskInfo;

                // Here you can integrate any notification system (like email or push notification)
                console.log(`Notifying Crew Member ID: ${crew_member_id} for Task ID: ${task_id}, Flight ID: ${flight_id}`);

                // Update notification status to true after sending the notification
                await db.query(
                    'UPDATE crew_task_assignments SET notifications = $1 WHERE crew_member_id = $2 AND task_assignment_id = $3',
                    [true, crew_member_id, task_assignment_id]
                );
            }
        }

        res.status(200).json({ message: 'Crew members notified successfully!' });
    } catch (error) {
        console.error('Error notifying crew members:', error);
        res.status(500).json({ message: 'Error notifying crew members' });
    }
});


// API to post new tasks 
app.post('/add-task', async (req, res) => {
    const { flight_number, task_name, description, updated_requirement } = req.body;
  
    if (!flight_number || !task_name || !description || !updated_requirement) {
      return res.status(400).json({ error: 'All task details are required' });
    }
  
    try {
      // Step 1: Fetch the flight_id using the flight_number
      const flightResult = await db.query(`
        SELECT id FROM flights WHERE flight_number = $1
      `, [flight_number]);
  
      // Check if the flight exists
      if (flightResult.rows.length === 0) {
        return res.status(404).json({ error: 'Flight not found' });
      }
  
      const flight_id = flightResult.rows[0].id;
  
      // Step 2: Insert a new task into the tasks table
      const taskResult = await db.query(`
        INSERT INTO tasks (task_name, description, crew_required,updated_requirement) 
        VALUES ($1, $2, $3,$4) 
        RETURNING id
      `, [task_name, description, updated_requirement, updated_requirement]);
  
      const task_id = taskResult.rows[0].id;
        console.log(task_id);
        
      // Step 3: Insert a row into the task_assignments table
      await db.query(`
        INSERT INTO task_assignments (flight_id, task_id, crew_required, updated_requirement) 
        VALUES ($1, $2, $3,$4)
      `, [flight_id, task_id, updated_requirement, updated_requirement]);
  
      // Return a success message
      res.status(201).json({ message: 'Task added successfully', task_id });
  
    } catch (error) {
      console.error('Error adding task:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
});
  


//Api to delete a task taking the flight number and the task name
app.delete('/delete-task', async (req, res) => {
    const { flight_number, task_name } = req.body;
  
    if (!flight_number || !task_name) {
      return res.status(400).json({ error: 'flight_number and task_name are required' });
    }
  
    try {
      // Step 1: Get the flight_id using flight_number
      const flightResult = await db.query(
        'SELECT id FROM flights WHERE flight_number = $1',
        [flight_number]
      );
  
      if (flightResult.rows.length === 0) {
        return res.status(404).json({ error: 'Flight not found' });
      }
      const flight_id = flightResult.rows[0].id;
  
      // Step 2: Get all task_ids using task_name
      const taskResult = await db.query(
        'SELECT id FROM tasks WHERE task_name = $1',
        [task_name]
      );
  
      if (taskResult.rows.length === 0) {
        return res.status(404).json({ error: 'Task not found' });
      }
  
      // Step 3: For each task_id, delete from task_assignments
      for (const task of taskResult.rows) {
        const task_id = task.id;
        
        // Delete from task_assignments
        await db.query(
          'DELETE FROM task_assignments WHERE flight_id = $1 AND task_id = $2',
          [flight_id, task_id]
        );
      }
  
      // Step 4: Optionally, delete the task from tasks table if no more assignments exist
      // Check if any other task_assignments for the given task_name exist
      for (const task of taskResult.rows) {
        const task_id = task.id;
        const assignmentCheckResult = await db.query(
          'SELECT 1 FROM task_assignments WHERE task_id = $1 LIMIT 1',
          [task_id]
        );
  
        // If no other assignments exist, delete the task from tasks table
        if (assignmentCheckResult.rows.length === 0) {
          await db.query('DELETE FROM tasks WHERE id = $1', [task_id]);
        }
      }
  
      return res.status(200).json({ message: 'Task deleted successfully' });
    } catch (error) {
      console.error('Error deleting task:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });



//api to get crew details for the crew endpoint
  app.get('/about-crew', async (req, res) => {
    const crewId = req.query.crewId;
    
    if (!crewId) {
        return res.status(400).json({ error: 'Crew ID is required.' });
    }

    try {
        // Query to get crew member details along with their roles
        const query = `
            SELECT 
                cm.id,
                cm.name,
                cm.email,
                cm.phone_number,
                cm.status,
                cm.airline,
                cm.city,
                json_agg(
                    json_build_object(
                        'role_id', r.id,
                        'role_name', r.role_name,
                        'description', r.description
                    )
                ) as roles
            FROM crew_members cm
            LEFT JOIN crew_roles cr ON cm.id = cr.crew_member_id
            LEFT JOIN roles r ON cr.role_id = r.id
            WHERE cm.id = $1
            GROUP BY cm.id, cm.name, cm.email, cm.phone_number, cm.status, cm.airline, cm.city;
        `;

        // Fetch crew member data
        const result = await db.query(query, [crewId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Crew member not found.' });
        }

        const crewMember = result.rows[0];

        // Handle case where crew member has no roles
        if (crewMember.roles[0] === null) {
            crewMember.roles = [];
        }

        res.status(200).json({
            success: true,
            crewMember,
        });
    } catch (error) {
        console.error('Error fetching crew member:', error);
        res.status(500).json({ error: 'Failed to fetch crew member details.' });
    }
});



app.get('/crew-work', async (req, res) => {
    const crewId = req.query.crewId;

    if (!crewId) {
        return res.status(400).json({ error: 'Crew ID is required.' });
    }

    try {
        // Query to get tasks assigned to the crew member
        const query = `
            SELECT 
                t.id AS task_id,
                t.task_name,
                t.description,
                f.flight_number
            FROM crew_task_assignments cta
            JOIN task_assignments ta ON cta.task_assignment_id = ta.id
            JOIN tasks t ON ta.task_id = t.id
            JOIN flights f ON ta.flight_id = f.id
            WHERE cta.crew_member_id = $1;
        `;

        // Execute the query
        const result = await db.query(query, [crewId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'No tasks found for this crew member.' });
        }

        res.status(200).json({
            success: true,
            tasks: result.rows,
        });
    } catch (error) {
        console.error('Error fetching crew member tasks:', error);
        res.status(500).json({ error: 'Failed to fetch crew member tasks.' });
    }
});


app.delete('/remove-crew-task', async (req, res) => {
    const {  crewId } = req.body;

    if ( !crewId) {
        return res.status(400).json({ error: 'Crew ID are required.' });
    }

    try {
        // Start transaction
        await db.query('BEGIN');

        // Delete the crew task assignment
        const deleteQuery = `
            DELETE FROM crew_task_assignments 
            WHERE crew_member_id = $1
            RETURNING crew_member_id;
        `;
        const deleteResult = await db.query(deleteQuery, [crewId]);

        if (deleteResult.rowCount === 0) {
            await db.query('ROLLBACK');
            return res.status(404).json({ error: 'Task assignment not found.' });
        }

        // Get current timestamp
        const now = new Date();
        now.setHours(now.getHours() + 1); // current_time + 1 hour
        const currentDate = now.toISOString().split('T')[0]; // Format YYYY-MM-DD
        const currentTime = now.toTimeString().split(' ')[0]; // Format HH:MM:SS

        // Determine start_time and date
        let startTime, updatedDate;
        if (now.getHours() >= 20) {
            startTime = '09:00:00';
            now.setDate(now.getDate() + 1);
            updatedDate = now.toISOString().split('T')[0];
        } else {
            startTime = currentTime;
            updatedDate = currentDate;
        }

        const endTime = '20:00:00';
        const available = true;

        // Update the crew member's availability
        const updateQuery = `
            UPDATE availability
            SET date = $1, available = $2, start_time = $3, end_time = $4
            WHERE crew_member_id = $5;
        `;
        await db.query(updateQuery, [updatedDate, available, startTime, endTime, crewId]);

        // Commit transaction
        await db.query('COMMIT');

        res.status(200).json({
            success: true,
            message: 'Task assignment deleted, and crew member availability updated.',
        });
    } catch (error) {
        await db.query('ROLLBACK');
        console.error('Error deleting task and updating crew:', error);
        res.status(500).json({ error: 'Failed to update crew member data.' });
    }
});



app.get("/",(req,res)=>{
    res.send("Express app is running")
})






app.listen(port,(error)=>{
    if(!error){
        console.log("Server running on port "+port);
    }else{
        console.log("Error :"+error)
    }
})