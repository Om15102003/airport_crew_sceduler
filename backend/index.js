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
            if (password!=result.rows[0].password_hash) {
                return res.status(401).json({ error: 'Invalid credentials.' });
            }
            // Remove sensitive data (e.g., password) before returning the user object
            delete user.password_hash;
        }else if(role==='crew'){
            if (password!=result.rows[0].password) {
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
            SELECT airline 
            FROM admin 
            WHERE id = $1;
        `;
        const adminResult = await db.query(adminQuery, [adminId]);

        if (adminResult.rows.length === 0) {
            return res.status(404).json({ error: 'Admin not found.' });
        }

        const airline = adminResult.rows[0].airline;

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
                cm.airline = $1
            ORDER BY 
                cm.id, ca.date;
        `;
        const crewResult = await db.query(crewQuery, [airline]);
        res.setHeader('Content-Type', 'application/json'); // Explicitly set Content-Type
        res.status(200).json(crewResult.rows);
        
    } catch (error) {
        console.error('Error fetching crew members:', error);
        res.status(500).json({ error: 'Failed to fetch crew members.' });
    }
});



//api call to get all the tasks associated with a particular flight
app.get('/tasks/flight/:flight_id', async (req, res) => {
    const { flight_id } = req.params;

    try {
        // Fetch all tasks associated with the given flight_id
        const taskQuery = `
            SELECT ta.id, ta.flight_id, t.task_name, t.description, ta.crew_required
            FROM task_assignments ta
            JOIN tasks t ON ta.task_id = t.id
            WHERE ta.flight_id = $1;
        `;

        const tasks = await db.query(taskQuery, [flight_id]);

        // Return the tasks to the client
        res.status(200).json({ tasks: tasks.rows });
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
})

// API to add task assignment for crew members
app.post('/assign-tasks', async (req, res) => {
    const { crew_member_id, task_id } = req.body;
    
    try {
        // Insert task assignments for each crew member
        const newAssignments = await db.query(
            'INSERT INTO crew_task_assignments (crew_member_id, task_assignment_id, status, notifications) VALUES ($1, $2, $3, $4) RETURNING *',
            [crew_member_id, task_id, 'Assigned', false]
        );
        
        res.status(201).json({ message: 'Task assignments created successfully!', data: newAssignments.rows });
    } catch (error) {
        console.error('Error creating task assignments:', error);
        res.status(500).json({ message: 'Error creating task assignments' });
    }
});


// API to notify crew members about their tasks
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