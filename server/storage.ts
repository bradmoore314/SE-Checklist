import { 
  User, InsertUser, 
  Project, InsertProject, 
  AccessPoint, InsertAccessPoint,
  Camera, InsertCamera,
  Elevator, InsertElevator,
  Intercom, InsertIntercom
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Projects
  getProjects(): Promise<Project[]>;
  getProject(id: number): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: number, project: Partial<InsertProject>): Promise<Project | undefined>;
  deleteProject(id: number): Promise<boolean>;
  
  // Access Points
  getAccessPoints(projectId: number): Promise<AccessPoint[]>;
  getAccessPoint(id: number): Promise<AccessPoint | undefined>;
  createAccessPoint(accessPoint: InsertAccessPoint): Promise<AccessPoint>;
  updateAccessPoint(id: number, accessPoint: Partial<InsertAccessPoint>): Promise<AccessPoint | undefined>;
  deleteAccessPoint(id: number): Promise<boolean>;
  
  // Cameras
  getCameras(projectId: number): Promise<Camera[]>;
  getCamera(id: number): Promise<Camera | undefined>;
  createCamera(camera: InsertCamera): Promise<Camera>;
  updateCamera(id: number, camera: Partial<InsertCamera>): Promise<Camera | undefined>;
  deleteCamera(id: number): Promise<boolean>;
  
  // Elevators
  getElevators(projectId: number): Promise<Elevator[]>;
  getElevator(id: number): Promise<Elevator | undefined>;
  createElevator(elevator: InsertElevator): Promise<Elevator>;
  updateElevator(id: number, elevator: Partial<InsertElevator>): Promise<Elevator | undefined>;
  deleteElevator(id: number): Promise<boolean>;
  
  // Intercoms
  getIntercoms(projectId: number): Promise<Intercom[]>;
  getIntercom(id: number): Promise<Intercom | undefined>;
  createIntercom(intercom: InsertIntercom): Promise<Intercom>;
  updateIntercom(id: number, intercom: Partial<InsertIntercom>): Promise<Intercom | undefined>;
  deleteIntercom(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private projects: Map<number, Project>;
  private accessPoints: Map<number, AccessPoint>;
  private cameras: Map<number, Camera>;
  private elevators: Map<number, Elevator>;
  private intercoms: Map<number, Intercom>;
  
  private currentUserId: number;
  private currentProjectId: number;
  private currentAccessPointId: number;
  private currentCameraId: number;
  private currentElevatorId: number;
  private currentIntercomId: number;

  constructor() {
    this.users = new Map();
    this.projects = new Map();
    this.accessPoints = new Map();
    this.cameras = new Map();
    this.elevators = new Map();
    this.intercoms = new Map();
    
    this.currentUserId = 1;
    this.currentProjectId = 1;
    this.currentAccessPointId = 1;
    this.currentCameraId = 1;
    this.currentElevatorId = 1;
    this.currentIntercomId = 1;
    
    // Initialize with sample data
    this.initSampleData();
  }

  private initSampleData() {
    // Create a sample user
    this.createUser({
      username: "admin",
      password: "password",
      name: "John Doe",
      role: "Project Manager"
    });
    
    // Create a sample project
    this.createProject({
      name: "Building Security Upgrade",
      client: "Acme Corporation",
      site_address: "123 Business Ave, Suite 500",
      se_name: "Sarah Johnson",
      bdm_name: "Michael Chen",
      replace_readers: true,
      pull_wire: true,
      install_locks: true,
    });
  }

  // Users
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const now = new Date();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Projects
  async getProjects(): Promise<Project[]> {
    return Array.from(this.projects.values());
  }

  async getProject(id: number): Promise<Project | undefined> {
    return this.projects.get(id);
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    const id = this.currentProjectId++;
    const now = new Date();
    const project: Project = { 
      ...insertProject, 
      id, 
      created_at: now, 
      updated_at: now 
    };
    this.projects.set(id, project);
    return project;
  }

  async updateProject(id: number, updateProject: Partial<InsertProject>): Promise<Project | undefined> {
    const project = this.projects.get(id);
    if (!project) {
      return undefined;
    }
    
    const updatedProject: Project = { 
      ...project, 
      ...updateProject, 
      updated_at: new Date() 
    };
    
    this.projects.set(id, updatedProject);
    return updatedProject;
  }

  async deleteProject(id: number): Promise<boolean> {
    return this.projects.delete(id);
  }

  // Access Points
  async getAccessPoints(projectId: number): Promise<AccessPoint[]> {
    return Array.from(this.accessPoints.values()).filter(
      (ap) => ap.project_id === projectId
    );
  }

  async getAccessPoint(id: number): Promise<AccessPoint | undefined> {
    return this.accessPoints.get(id);
  }

  async createAccessPoint(insertAccessPoint: InsertAccessPoint): Promise<AccessPoint> {
    const id = this.currentAccessPointId++;
    const now = new Date();
    const accessPoint: AccessPoint = { 
      ...insertAccessPoint, 
      id, 
      created_at: now, 
      updated_at: now 
    };
    this.accessPoints.set(id, accessPoint);
    return accessPoint;
  }

  async updateAccessPoint(id: number, updateAccessPoint: Partial<InsertAccessPoint>): Promise<AccessPoint | undefined> {
    const accessPoint = this.accessPoints.get(id);
    if (!accessPoint) {
      return undefined;
    }
    
    const updatedAccessPoint: AccessPoint = { 
      ...accessPoint, 
      ...updateAccessPoint, 
      updated_at: new Date() 
    };
    
    this.accessPoints.set(id, updatedAccessPoint);
    return updatedAccessPoint;
  }

  async deleteAccessPoint(id: number): Promise<boolean> {
    return this.accessPoints.delete(id);
  }

  // Cameras
  async getCameras(projectId: number): Promise<Camera[]> {
    return Array.from(this.cameras.values()).filter(
      (camera) => camera.project_id === projectId
    );
  }

  async getCamera(id: number): Promise<Camera | undefined> {
    return this.cameras.get(id);
  }

  async createCamera(insertCamera: InsertCamera): Promise<Camera> {
    const id = this.currentCameraId++;
    const now = new Date();
    const camera: Camera = { 
      ...insertCamera, 
      id, 
      created_at: now, 
      updated_at: now 
    };
    this.cameras.set(id, camera);
    return camera;
  }

  async updateCamera(id: number, updateCamera: Partial<InsertCamera>): Promise<Camera | undefined> {
    const camera = this.cameras.get(id);
    if (!camera) {
      return undefined;
    }
    
    const updatedCamera: Camera = { 
      ...camera, 
      ...updateCamera, 
      updated_at: new Date() 
    };
    
    this.cameras.set(id, updatedCamera);
    return updatedCamera;
  }

  async deleteCamera(id: number): Promise<boolean> {
    return this.cameras.delete(id);
  }

  // Elevators
  async getElevators(projectId: number): Promise<Elevator[]> {
    return Array.from(this.elevators.values()).filter(
      (elevator) => elevator.project_id === projectId
    );
  }

  async getElevator(id: number): Promise<Elevator | undefined> {
    return this.elevators.get(id);
  }

  async createElevator(insertElevator: InsertElevator): Promise<Elevator> {
    const id = this.currentElevatorId++;
    const now = new Date();
    const elevator: Elevator = { 
      ...insertElevator, 
      id, 
      created_at: now, 
      updated_at: now 
    };
    this.elevators.set(id, elevator);
    return elevator;
  }

  async updateElevator(id: number, updateElevator: Partial<InsertElevator>): Promise<Elevator | undefined> {
    const elevator = this.elevators.get(id);
    if (!elevator) {
      return undefined;
    }
    
    const updatedElevator: Elevator = { 
      ...elevator, 
      ...updateElevator, 
      updated_at: new Date() 
    };
    
    this.elevators.set(id, updatedElevator);
    return updatedElevator;
  }

  async deleteElevator(id: number): Promise<boolean> {
    return this.elevators.delete(id);
  }

  // Intercoms
  async getIntercoms(projectId: number): Promise<Intercom[]> {
    return Array.from(this.intercoms.values()).filter(
      (intercom) => intercom.project_id === projectId
    );
  }

  async getIntercom(id: number): Promise<Intercom | undefined> {
    return this.intercoms.get(id);
  }

  async createIntercom(insertIntercom: InsertIntercom): Promise<Intercom> {
    const id = this.currentIntercomId++;
    const now = new Date();
    const intercom: Intercom = { 
      ...insertIntercom, 
      id, 
      created_at: now, 
      updated_at: now 
    };
    this.intercoms.set(id, intercom);
    return intercom;
  }

  async updateIntercom(id: number, updateIntercom: Partial<InsertIntercom>): Promise<Intercom | undefined> {
    const intercom = this.intercoms.get(id);
    if (!intercom) {
      return undefined;
    }
    
    const updatedIntercom: Intercom = { 
      ...intercom, 
      ...updateIntercom, 
      updated_at: new Date() 
    };
    
    this.intercoms.set(id, updatedIntercom);
    return updatedIntercom;
  }

  async deleteIntercom(id: number): Promise<boolean> {
    return this.intercoms.delete(id);
  }
}

export const storage = new MemStorage();
