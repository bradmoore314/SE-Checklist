import { 
  User, InsertUser, 
  Project, InsertProject, 
  AccessPoint, InsertAccessPoint,
  Camera, InsertCamera,
  Elevator, InsertElevator,
  Intercom, InsertIntercom,
  Image, InsertImage
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  sessionStore: session.Store;
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
  
  // Images for Equipment
  saveImage(image: InsertImage): Promise<Image>;
  getImages(equipmentType: string, equipmentId: number): Promise<Image[]>;
  deleteImage(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  public sessionStore: session.Store;
  private users: Map<number, User>;
  private projects: Map<number, Project>;
  private accessPoints: Map<number, AccessPoint>;
  private cameras: Map<number, Camera>;
  private elevators: Map<number, Elevator>;
  private intercoms: Map<number, Intercom>;
  private images: Map<number, Image>;
  
  private currentUserId: number;
  private currentProjectId: number;
  private currentAccessPointId: number;
  private currentCameraId: number;
  private currentElevatorId: number;
  private currentIntercomId: number;
  private currentImageId: number;

  constructor() {
    // Initialize session store
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // prune expired entries every 24h
    });
    
    this.users = new Map();
    this.projects = new Map();
    this.accessPoints = new Map();
    this.cameras = new Map();
    this.elevators = new Map();
    this.intercoms = new Map();
    this.images = new Map();
    
    this.currentUserId = 1;
    this.currentProjectId = 1;
    this.currentAccessPointId = 1;
    this.currentCameraId = 1;
    this.currentElevatorId = 1;
    this.currentIntercomId = 1;
    this.currentImageId = 1;
    
    // Initialize with sample data
    this.initSampleData();
  }

  private initSampleData() {
    // Create a sample admin user with hashed password (hashed version of "password")
    this.users.set(1, {
      id: 1,
      username: "admin",
      password: "1c1c737e65afa38ef7bd9c90832e657eb53442a11e68fd7e621a75fd7648045e8fb84b887c511873879d26fd952270b2b186cfc1efacf36e0cf2d78a342fd307.37a5435ee0a77fd9",
      email: "admin@example.com",
      fullName: "Admin User",
      role: "admin",
      created_at: new Date(),
      updated_at: new Date()
    });
    this.currentUserId = 2;
    
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
    
    // Ensure we have consistent null values for optional fields
    const user: User = { 
      id,
      username: insertUser.username,
      password: insertUser.password,
      email: insertUser.email,
      fullName: insertUser.fullName ?? null,
      role: insertUser.role ?? "user",
      created_at: now,
      updated_at: now
    };
    
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
    
    // Ensure we have consistent null values for optional fields
    const project: Project = {
      id,
      name: insertProject.name,
      client: insertProject.client ?? null,
      site_address: insertProject.site_address ?? null,
      se_name: insertProject.se_name ?? null,
      bdm_name: insertProject.bdm_name ?? null,
      building_count: insertProject.building_count ?? null,
      progress_percentage: insertProject.progress_percentage ?? 0,
      progress_notes: insertProject.progress_notes ?? null,
      created_at: now,
      updated_at: now,
      replace_readers: insertProject.replace_readers ?? false,
      need_credentials: insertProject.need_credentials ?? false,
      takeover: insertProject.takeover ?? false,
      pull_wire: insertProject.pull_wire ?? false,
      visitor: insertProject.visitor ?? false,
      install_locks: insertProject.install_locks ?? false,
      ble: insertProject.ble ?? false,
      ppi_quote_needed: insertProject.ppi_quote_needed ?? false,
      guard_controls: insertProject.guard_controls ?? false,
      floorplan: insertProject.floorplan ?? false,
      test_card: insertProject.test_card ?? false,
      conduit_drawings: insertProject.conduit_drawings ?? false,
      reports_available: insertProject.reports_available ?? false,
      photo_id: insertProject.photo_id ?? false,
      on_site_security: insertProject.on_site_security ?? false,
      photo_badging: insertProject.photo_badging ?? false,
      kastle_connect: insertProject.kastle_connect ?? false,
      wireless_locks: insertProject.wireless_locks ?? false,
      rush: insertProject.rush ?? false,
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
    
    // Ensure we have consistent null values for optional fields
    const accessPoint: AccessPoint = {
      id,
      project_id: insertAccessPoint.project_id,
      location: insertAccessPoint.location,
      quick_config: insertAccessPoint.quick_config,
      reader_type: insertAccessPoint.reader_type,
      lock_type: insertAccessPoint.lock_type,
      monitoring_type: insertAccessPoint.monitoring_type,
      lock_provider: insertAccessPoint.lock_provider ?? null,
      takeover: insertAccessPoint.takeover ?? null,
      interior_perimeter: insertAccessPoint.interior_perimeter ?? null,
      // Hidden fields
      exst_panel_location: insertAccessPoint.exst_panel_location ?? null,
      exst_panel_type: insertAccessPoint.exst_panel_type ?? null,
      exst_reader_type: insertAccessPoint.exst_reader_type ?? null,
      new_panel_location: insertAccessPoint.new_panel_location ?? null,
      new_panel_type: insertAccessPoint.new_panel_type ?? null,
      new_reader_type: insertAccessPoint.new_reader_type ?? null,
      noisy_prop: insertAccessPoint.noisy_prop ?? null,
      crashbars: insertAccessPoint.crashbars ?? null,
      real_lock_type: insertAccessPoint.real_lock_type ?? null,
      notes: insertAccessPoint.notes ?? null,
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
    
    // Ensure we have consistent null values for optional fields
    const camera: Camera = {
      id,
      project_id: insertCamera.project_id,
      location: insertCamera.location,
      camera_type: insertCamera.camera_type,
      mounting_type: insertCamera.mounting_type ?? null,
      resolution: insertCamera.resolution ?? null,
      field_of_view: insertCamera.field_of_view ?? null,
      notes: insertCamera.notes ?? null,
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
    
    // Ensure we have consistent null values for optional fields
    const elevator: Elevator = {
      id,
      project_id: insertElevator.project_id,
      location: insertElevator.location,
      elevator_type: insertElevator.elevator_type,
      floor_count: insertElevator.floor_count ?? null,
      notes: insertElevator.notes ?? null,
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
    
    // Ensure we have consistent null values for optional fields
    const intercom: Intercom = {
      id,
      project_id: insertIntercom.project_id,
      location: insertIntercom.location,
      intercom_type: insertIntercom.intercom_type,
      notes: insertIntercom.notes ?? null,
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
  
  // Image management
  async saveImage(insertImage: InsertImage): Promise<Image> {
    const id = this.currentImageId++;
    const now = new Date();
    
    const image: Image = {
      id,
      equipment_type: insertImage.equipment_type,
      equipment_id: insertImage.equipment_id,
      project_id: insertImage.project_id,
      image_data: insertImage.image_data,
      filename: insertImage.filename ?? null,
      created_at: now
    };
    
    this.images.set(id, image);
    return image;
  }
  
  async getImages(equipmentType: string, equipmentId: number): Promise<Image[]> {
    return Array.from(this.images.values()).filter(
      (image) => 
        image.equipment_type === equipmentType && 
        image.equipment_id === equipmentId
    );
  }
  
  async deleteImage(id: number): Promise<boolean> {
    return this.images.delete(id);
  }
}

export const storage = new MemStorage();
