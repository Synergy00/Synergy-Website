import { createClient } from "@supabase/supabase-js";

// Realistic Mock Seed Data for PROTOHACK 2026
const seedParticipants = [
  { id: "11111111-1111-1111-1111-111111111001", fullName: "Aarav Sharma", regNo: "RA2311003010001", college: "SRM IST Kattankulathur", branch: "CSE", department: "Computing", section: "A1", contact: "+91 9876543210", email: "aarav.sharma@srmist.edu.in" },
  { id: "11111111-1111-1111-1111-111111111002", fullName: "Priya Nair", regNo: "RA2311003010002", college: "SRM IST Kattankulathur", branch: "CSE", department: "Computing", section: "A1", contact: "+91 9876543211", email: "priya.nair@srmist.edu.in" },
  { id: "11111111-1111-1111-1111-111111111003", fullName: "Rohan Gupta", regNo: "23BCE1045", college: "VIT Chennai", branch: "CSE", department: "Computer Engineering", section: "C", contact: "+91 9876543212", email: "rohan.gupta2023@vitstudent.ac.in" },
  { id: "11111111-1111-1111-1111-111111111004", fullName: "Kavya Iyer", regNo: "23BCE1046", college: "VIT Chennai", branch: "CSE", department: "Computer Engineering", section: "C", contact: "+91 9876543213", email: "kavya.iyer@vitstudent.ac.in" },
  { id: "11111111-1111-1111-1111-111111111005", fullName: "Aditya Roy", regNo: "23BCE1047", college: "VIT Chennai", branch: "CSE", department: "Computer Engineering", section: "C", contact: "+91 9876543214", email: "aditya.roy@vitstudent.ac.in" },
  { id: "11111111-1111-1111-1111-111111111006", fullName: "Vikram Malhotra", regNo: "23BEE0120", college: "SSN College of Engineering", branch: "ECE", department: "Electronics", section: "A", contact: "+91 9876543215", email: "vikram.m@ssn.edu.in" },
  { id: "11111111-1111-1111-1111-111111111007", fullName: "Deepak Verma", regNo: "RA2311003010045", college: "SRM IST Kattankulathur", branch: "IT", department: "Computing", section: "B2", contact: "+91 9876543216", email: "deepak.v@srmist.edu.in" },
  { id: "11111111-1111-1111-1111-111111111008", fullName: "Neha Singh", regNo: "RA2311003010046", college: "SRM IST Kattankulathur", branch: "IT", department: "Computing", section: "B2", contact: "+91 9876543217", email: "neha.s@srmist.edu.in" },
  { id: "11111111-1111-1111-1111-111111111009", fullName: "Tarun Kumar", regNo: "RA2311003010047", college: "SRM IST Kattankulathur", branch: "IT", department: "Computing", section: "B2", contact: "+91 9876543218", email: "tarun.k@srmist.edu.in" },
  { id: "11111111-1111-1111-1111-111111111010", fullName: "Sneha Reddy", regNo: "23BCS089", college: "IIITDM Kancheepuram", branch: "CSE", department: "Computer Science", section: "1", contact: "+91 9876543219", email: "sneha.reddy@iiitdm.ac.in" },
];

export async function runSeed() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.log("Supabase credentials not configured in environment. Skipping remote database seed.");
    return;
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);

  console.log("Seeding PROTOHACK participants and teams...");

  for (const p of seedParticipants) {
    await supabase.from("profiles").upsert({
      id: p.id,
      full_name: p.fullName,
      reg_no: p.regNo,
      college: p.college,
      branch: p.branch,
      department: p.department,
      section: p.section,
      contact: p.contact,
      email: p.email,
    });
  }

  console.log("Seed finished successfully!");
}

if (require.main === module) {
  runSeed();
}
