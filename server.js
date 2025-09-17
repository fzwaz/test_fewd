import express from "express";
import fs from "fs";
import cors from "cors";
import { v4 as uuidv4 } from "uuid";

const app = express();
app.use(express.json());
app.use(cors());

const filePath = "./data/students.json";

// Helper: read students from file
const readStudents = () => {
  if (!fs.existsSync(filePath)) return [];
  const data = fs.readFileSync(filePath);
  return JSON.parse(data);
};

// Helper: write students to file
const writeStudents = (students) => {
  fs.writeFileSync(filePath, JSON.stringify(students, null, 2));
};

// POST /api/students
app.post("/api/students", (req, res) => {
  const { name, age, course, year, status } = req.body;

  // Validate required fields
  if (!name || !course || !year) {
    return res.status(400).json({ error: "name, course, and year are required" });
  }

  // Validate age
  if (typeof age !== "number" || age <= 0) {
    return res.status(400).json({ error: "age must be a number greater than 0" });
  }

  // Generate new student object
  const newStudent = {
    id: uuidv4(), // or Date.now()
    name,
    age,
    course,
    year,
    status: status || "active",
  };

  // Read existing students, add new one
  const students = readStudents();
  students.push(newStudent);

  // Save to file
  writeStudents(students);

  res.status(201).json(newStudent);
});

// Start server
app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
