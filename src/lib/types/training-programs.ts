// Base program card for widget display
export interface ProgramCard {
  id: string;
  title: string;
  managerName: string;
  deadline: string;
  enrollmentCount: number;
}

// Base program details (all roles)
export interface ProgramBase {
  id: string;
  title: string;
  notes: string | null;
  manager_id: string;
  managerName: string;
  deadline: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Session with trainer info
export interface ProgramSession {
  id: string;
  program_id: string;
  trainer_id: string | null;
  trainerName: string | null;
  session_datetime: string;
  duration_minutes: number;
  notes: string | null;
  is_active: boolean;
  isOwner?: boolean; // For trainers - marks if they own this session
}

// Employee info for assignments/enrollments
export interface EmployeeInfo {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  fullName: string;
}

// Program assignment (manager view)
export interface ProgramAssignment {
  id: string;
  employee: EmployeeInfo;
  assigned_by_manager_id: string;
  notes: string | null;
  created_at: string;
}

// Session enrollment (trainer/employee view)
export interface SessionEnrollmentInfo {
  id: string;
  employee: EmployeeInfo;
  session_id: string;
  completed: boolean;
  completion_date: string | null;
  notes: string | null;
}

// Stats objects by role
export interface AdminStats {
  totalEnrolled: number;
  completed: number;
  overdue: number;
}

export interface TrainerStats {
  totalEnrolled: number;
  completed: number;
}

export interface EmployeeStats {
  enrolled: number;
  completed: number;
  available: number;
}

// Role-specific detail responses
export interface AdminProgramDetail extends ProgramBase {
  sessions: ProgramSession[];
  enrolledEmployees: SessionEnrollmentInfo[];
  stats: AdminStats;
}

export interface ManagerProgramDetail extends ProgramBase {
  assignedEmployees: ProgramAssignment[];
  availableEmployees: EmployeeInfo[];
}

export interface TrainerProgramDetail extends ProgramBase {
  sessions: ProgramSession[];
  enrolledEmployees: SessionEnrollmentInfo[];
  stats: TrainerStats;
}

export interface EmployeeProgramDetail extends ProgramBase {
  sessions: ProgramSession[];
  myEnrollments: SessionEnrollmentInfo[];
  stats: EmployeeStats;
}

export type ProgramDetail =
  | AdminProgramDetail
  | ManagerProgramDetail
  | TrainerProgramDetail
  | EmployeeProgramDetail;

// Upcoming session for employee dashboard
export interface UpcomingSession {
  enrollmentId: string;
  sessionId: string;
  sessionDatetime: string;
  durationMinutes: number;
  notes: string | null;
  trainerName: string | null;
  programId: string;
  programTitle: string;
}
