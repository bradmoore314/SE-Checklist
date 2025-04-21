import { 
  User, InsertUser, 
  Project, InsertProject, 
  AccessPoint, InsertAccessPoint,
  Camera, InsertCamera,
  Elevator, InsertElevator,
  Intercom, InsertIntercom,
  Image, InsertImage,
  Floorplan, InsertFloorplan,
  FloorplanMarker, InsertFloorplanMarker,
  CrmSettings, InsertCrmSettings,
  EquipmentImage, InsertEquipmentImage,
  KvgFormData, InsertKvgFormData,
  KvgStream, InsertKvgStream,
  StreamImage, InsertStreamImage
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  sessionStore: session.Store;
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByMicrosoftId(microsoftId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserRefreshToken(userId: number, refreshToken: string): Promise<User | undefined>;
  
  // Projects
  getProjects(): Promise<Project[]>;
  getProject(id: number): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: number, project: Partial<InsertProject>): Promise<Project | undefined>;
  deleteProject(id: number): Promise<boolean>;
  
  // Access Points
  getAccessPoints(projectId: number): Promise<AccessPoint[]>;
  getAccessPointsByProject(projectId: number): Promise<AccessPoint[]>; // Alias for getAccessPoints for consistent naming
  getAccessPoint(id: number): Promise<AccessPoint | undefined>;
  createAccessPoint(accessPoint: InsertAccessPoint): Promise<AccessPoint>;
  updateAccessPoint(id: number, accessPoint: Partial<InsertAccessPoint>): Promise<AccessPoint | undefined>;
  deleteAccessPoint(id: number): Promise<boolean>;
  
  // Cameras
  getCameras(projectId: number): Promise<Camera[]>;
  getCamerasByProject(projectId: number): Promise<Camera[]>; // Alias for getCameras for consistent naming
  getCamera(id: number): Promise<Camera | undefined>;
  createCamera(camera: InsertCamera): Promise<Camera>;
  updateCamera(id: number, camera: Partial<InsertCamera>): Promise<Camera | undefined>;
  deleteCamera(id: number): Promise<boolean>;
  
  // Elevators
  getElevators(projectId: number): Promise<Elevator[]>;
  getElevatorsByProject(projectId: number): Promise<Elevator[]>; // Alias for getElevators
  getElevator(id: number): Promise<Elevator | undefined>;
  createElevator(elevator: InsertElevator): Promise<Elevator>;
  updateElevator(id: number, elevator: Partial<InsertElevator>): Promise<Elevator | undefined>;
  deleteElevator(id: number): Promise<boolean>;
  
  // Intercoms
  getIntercoms(projectId: number): Promise<Intercom[]>;
  getIntercomsByProject(projectId: number): Promise<Intercom[]>; // Alias for getIntercoms
  getIntercom(id: number): Promise<Intercom | undefined>;
  createIntercom(intercom: InsertIntercom): Promise<Intercom>;
  updateIntercom(id: number, intercom: Partial<InsertIntercom>): Promise<Intercom | undefined>;
  deleteIntercom(id: number): Promise<boolean>;
  
  // Images for Equipment
  saveImage(image: InsertImage): Promise<Image>;
  getImages(equipmentType: string, equipmentId: number): Promise<Image[]>;
  deleteImage(id: number): Promise<boolean>;
  
  // Floorplans
  getFloorplans(projectId: number): Promise<Floorplan[]>;
  getFloorplan(id: number): Promise<Floorplan | undefined>;
  createFloorplan(floorplan: InsertFloorplan): Promise<Floorplan>;
  updateFloorplan(id: number, floorplan: Partial<InsertFloorplan>): Promise<Floorplan | undefined>;
  deleteFloorplan(id: number): Promise<boolean>;
  
  // Floorplan Markers
  getFloorplanMarkers(floorplanId: number): Promise<FloorplanMarker[]>;
  getFloorplanMarker(id: number): Promise<FloorplanMarker | undefined>;
  createFloorplanMarker(marker: InsertFloorplanMarker): Promise<FloorplanMarker>;
  updateFloorplanMarker(id: number, marker: Partial<InsertFloorplanMarker>): Promise<FloorplanMarker | undefined>;
  deleteFloorplanMarker(id: number): Promise<boolean>;
  
  // CRM Settings
  getCrmSettings(): Promise<CrmSettings[]>;
  getCrmSetting(id: number): Promise<CrmSettings | undefined>;
  getCrmSettingByType(type: string): Promise<CrmSettings | undefined>;
  createCrmSettings(settings: InsertCrmSettings): Promise<CrmSettings>;
  updateCrmSettings(id: number, settings: Partial<InsertCrmSettings>): Promise<CrmSettings | undefined>;
  deleteCrmSettings(id: number): Promise<boolean>;
  
  // Equipment Images (with SharePoint integration)
  getEquipmentImages(projectId: number, equipmentType: string, equipmentId?: number): Promise<EquipmentImage[]>;
  getEquipmentImage(id: number): Promise<EquipmentImage | undefined>;
  createEquipmentImage(image: InsertEquipmentImage): Promise<EquipmentImage>;
  updateEquipmentImage(id: number, image: Partial<InsertEquipmentImage>): Promise<EquipmentImage | undefined>;
  deleteEquipmentImage(id: number): Promise<boolean>;
  
  // KVG Form Data
  getKvgFormData(projectId: number): Promise<KvgFormData | undefined>;
  createKvgFormData(formData: InsertKvgFormData): Promise<KvgFormData>;
  updateKvgFormData(id: number, formData: Partial<InsertKvgFormData>): Promise<KvgFormData | undefined>;
  
  // KVG Streams
  getKvgStreams(projectId: number): Promise<KvgStream[]>;
  getKvgStream(id: number): Promise<KvgStream | undefined>;
  createKvgStream(stream: InsertKvgStream): Promise<KvgStream>;
  updateKvgStream(id: number, stream: Partial<InsertKvgStream>): Promise<KvgStream | undefined>;
  deleteKvgStream(id: number): Promise<boolean>;
  
  // Stream Images
  getStreamImages(streamId: number): Promise<StreamImage[]>;
  createStreamImage(image: InsertStreamImage): Promise<StreamImage>;
  deleteStreamImage(id: number): Promise<boolean>;
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
  private floorplans: Map<number, Floorplan>;
  private floorplanMarkers: Map<number, FloorplanMarker>;
  private crmSettings: Map<number, CrmSettings>;
  private equipmentImages: Map<number, EquipmentImage>;
  private kvgFormData: Map<number, KvgFormData>;
  private kvgStreams: Map<number, KvgStream>;
  private streamImages: Map<number, StreamImage>;
  
  private currentUserId: number;
  private currentProjectId: number;
  private currentAccessPointId: number;
  private currentCameraId: number;
  private currentElevatorId: number;
  private currentIntercomId: number;
  private currentImageId: number;
  private currentFloorplanId: number;
  private currentFloorplanMarkerId: number;
  private currentCrmSettingsId: number;
  private currentEquipmentImageId: number;
  private currentKvgFormDataId: number;
  private currentKvgStreamId: number;
  private currentStreamImageId: number;

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
    this.floorplans = new Map();
    this.floorplanMarkers = new Map();
    this.crmSettings = new Map();
    this.equipmentImages = new Map();
    this.kvgFormData = new Map();
    this.kvgStreams = new Map();
    this.streamImages = new Map();
    
    this.currentUserId = 1;
    this.currentProjectId = 1;
    this.currentAccessPointId = 1;
    this.currentCameraId = 1;
    this.currentElevatorId = 1;
    this.currentIntercomId = 1;
    this.currentImageId = 1;
    this.currentFloorplanId = 1;
    this.currentFloorplanMarkerId = 1;
    this.currentCrmSettingsId = 1;
    this.currentEquipmentImageId = 1;
    this.currentKvgFormDataId = 1;
    this.currentKvgStreamId = 1;
    this.currentStreamImageId = 1;
    
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
      microsoftId: null,
      refreshToken: null,
      lastLogin: null,
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
      password: insertUser.password ?? null, // Ensure proper type
      email: insertUser.email,
      fullName: insertUser.fullName ?? null,
      role: insertUser.role ?? "user",
      microsoftId: insertUser.microsoftId ?? null,
      refreshToken: insertUser.refreshToken ?? null,
      lastLogin: insertUser.lastLogin ?? null,
      created_at: now,
      updated_at: now
    };
    
    this.users.set(id, user);
    return user;
  }
  
  async getUserByMicrosoftId(microsoftId: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.microsoftId === microsoftId
    );
  }
  
  async updateUserRefreshToken(userId: number, refreshToken: string): Promise<User | undefined> {
    const user = this.users.get(userId);
    if (!user) {
      return undefined;
    }
    
    const updatedUser: User = {
      ...user,
      refreshToken: refreshToken as string | null, // Ensure proper type
      lastLogin: new Date(),
      updated_at: new Date()
    };
    
    this.users.set(userId, updatedUser);
    return updatedUser;
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
      equipment_notes: insertProject.equipment_notes ?? null,
      scope_notes: insertProject.scope_notes ?? null,
      created_at: now,
      updated_at: now,
      // CRM Integration Fields
      crm_opportunity_id: insertProject.crm_opportunity_id ?? null,
      crm_opportunity_name: insertProject.crm_opportunity_name ?? null,
      crm_account_id: insertProject.crm_account_id ?? null,
      crm_account_name: insertProject.crm_account_name ?? null,
      crm_last_synced: insertProject.crm_last_synced ?? null,
      // SharePoint Integration Fields
      sharepoint_folder_url: insertProject.sharepoint_folder_url ?? null,
      sharepoint_site_id: insertProject.sharepoint_site_id ?? null,
      sharepoint_drive_id: insertProject.sharepoint_drive_id ?? null,
      sharepoint_folder_id: insertProject.sharepoint_folder_id ?? null,
      // Configuration options
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
  
  // Alias for getAccessPoints with consistent naming
  async getAccessPointsByProject(projectId: number): Promise<AccessPoint[]> {
    return this.getAccessPoints(projectId);
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
  
  // Alias for getCameras with consistent naming
  async getCamerasByProject(projectId: number): Promise<Camera[]> {
    return this.getCameras(projectId);
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
  
  // Alias for getElevators with consistent naming
  async getElevatorsByProject(projectId: number): Promise<Elevator[]> {
    return this.getElevators(projectId);
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
      controller_type: insertElevator.controller_type ?? null,
      interface_type: insertElevator.interface_type ?? null,
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
  
  // Alias for getIntercoms with consistent naming
  async getIntercomsByProject(projectId: number): Promise<Intercom[]> {
    return this.getIntercoms(projectId);
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

  // Images
  async saveImage(insertImage: InsertImage): Promise<Image> {
    const id = this.currentImageId++;
    const now = new Date();
    
    // Ensure we have consistent null values for optional fields
    const image: Image = {
      id,
      equipment_type: insertImage.equipment_type,
      equipment_id: insertImage.equipment_id,
      image_data: insertImage.image_data,
      filename: insertImage.filename ?? null,
      created_at: now
    };
    
    this.images.set(id, image);
    return image;
  }

  async getImages(equipmentType: string, equipmentId: number): Promise<Image[]> {
    return Array.from(this.images.values()).filter(
      (image) => image.equipment_type === equipmentType && image.equipment_id === equipmentId
    );
  }

  async deleteImage(id: number): Promise<boolean> {
    return this.images.delete(id);
  }

  // Floorplans
  async getFloorplans(projectId: number): Promise<Floorplan[]> {
    return Array.from(this.floorplans.values()).filter(
      (floorplan) => floorplan.project_id === projectId
    );
  }

  async getFloorplan(id: number): Promise<Floorplan | undefined> {
    return this.floorplans.get(id);
  }

  async createFloorplan(insertFloorplan: InsertFloorplan): Promise<Floorplan> {
    const id = this.currentFloorplanId++;
    const now = new Date();
    
    // Ensure we have consistent null values for optional fields
    const floorplan: Floorplan = {
      id,
      project_id: insertFloorplan.project_id,
      name: insertFloorplan.name,
      pdf_data: insertFloorplan.pdf_data,
      page_count: insertFloorplan.page_count ?? 1,
      created_at: now,
      updated_at: now
    };
    
    this.floorplans.set(id, floorplan);
    return floorplan;
  }

  async updateFloorplan(id: number, updateFloorplan: Partial<InsertFloorplan>): Promise<Floorplan | undefined> {
    const floorplan = this.floorplans.get(id);
    if (!floorplan) {
      return undefined;
    }
    
    const updatedFloorplan: Floorplan = { 
      ...floorplan, 
      ...updateFloorplan, 
      updated_at: new Date() 
    };
    
    this.floorplans.set(id, updatedFloorplan);
    return updatedFloorplan;
  }

  async deleteFloorplan(id: number): Promise<boolean> {
    return this.floorplans.delete(id);
  }

  // Floorplan Markers
  async getFloorplanMarkers(floorplanId: number): Promise<FloorplanMarker[]> {
    return Array.from(this.floorplanMarkers.values()).filter(
      (marker) => marker.floorplan_id === floorplanId
    );
  }

  async getFloorplanMarker(id: number): Promise<FloorplanMarker | undefined> {
    return this.floorplanMarkers.get(id);
  }

  async createFloorplanMarker(insertMarker: InsertFloorplanMarker): Promise<FloorplanMarker> {
    const id = this.currentFloorplanMarkerId++;
    const now = new Date();
    
    // Ensure we have consistent null values for optional fields
    const marker: FloorplanMarker = {
      id,
      floorplan_id: insertMarker.floorplan_id,
      page: insertMarker.page ?? 1,
      marker_type: insertMarker.marker_type,
      equipment_id: insertMarker.equipment_id,
      position_x: insertMarker.position_x,
      position_y: insertMarker.position_y,
      label: insertMarker.label ?? null,
      created_at: now
    };
    
    this.floorplanMarkers.set(id, marker);
    return marker;
  }

  async updateFloorplanMarker(id: number, updateMarker: Partial<InsertFloorplanMarker>): Promise<FloorplanMarker | undefined> {
    const marker = this.floorplanMarkers.get(id);
    if (!marker) {
      return undefined;
    }
    
    const updatedMarker: FloorplanMarker = { 
      ...marker, 
      ...updateMarker 
    };
    
    this.floorplanMarkers.set(id, updatedMarker);
    return updatedMarker;
  }

  async deleteFloorplanMarker(id: number): Promise<boolean> {
    return this.floorplanMarkers.delete(id);
  }

  // CRM Settings
  async getCrmSettings(): Promise<CrmSettings[]> {
    return Array.from(this.crmSettings.values());
  }

  async getCrmSetting(id: number): Promise<CrmSettings | undefined> {
    return this.crmSettings.get(id);
  }

  async getCrmSettingByType(type: string): Promise<CrmSettings | undefined> {
    return Array.from(this.crmSettings.values()).find(
      (setting) => setting.crm_type === type
    );
  }

  async createCrmSettings(insertSettings: InsertCrmSettings): Promise<CrmSettings> {
    const id = this.currentCrmSettingsId++;
    const now = new Date();
    
    // Ensure we have consistent null values for optional fields
    const settings: CrmSettings = {
      id,
      crm_type: insertSettings.crm_type,
      api_url: insertSettings.api_url,
      api_key: insertSettings.api_key ?? null,
      client_id: insertSettings.client_id ?? null,
      client_secret: insertSettings.client_secret ?? null,
      tenant_id: insertSettings.tenant_id ?? null,
      is_active: insertSettings.is_active ?? true,
      settings_json: insertSettings.settings_json ?? null,
      last_sync: insertSettings.last_sync ?? null,
      created_at: now,
      updated_at: now
    };
    
    this.crmSettings.set(id, settings);
    return settings;
  }

  async updateCrmSettings(id: number, updateSettings: Partial<InsertCrmSettings>): Promise<CrmSettings | undefined> {
    const settings = this.crmSettings.get(id);
    if (!settings) {
      return undefined;
    }
    
    const updatedSettings: CrmSettings = {
      ...settings,
      ...updateSettings,
      updated_at: new Date()
    };
    
    this.crmSettings.set(id, updatedSettings);
    return updatedSettings;
  }

  async deleteCrmSettings(id: number): Promise<boolean> {
    return this.crmSettings.delete(id);
  }

  // Equipment Images (with SharePoint integration)
  async getEquipmentImages(projectId: number, equipmentType: string, equipmentId?: number): Promise<EquipmentImage[]> {
    return Array.from(this.equipmentImages.values()).filter(
      (image) => {
        const matchesProject = image.project_id === projectId;
        const matchesType = image.equipment_type === equipmentType;
        if (equipmentId !== undefined) {
          return matchesProject && matchesType && image.equipment_id === equipmentId;
        }
        return matchesProject && matchesType;
      }
    );
  }

  async getEquipmentImage(id: number): Promise<EquipmentImage | undefined> {
    return this.equipmentImages.get(id);
  }

  async createEquipmentImage(insertImage: InsertEquipmentImage): Promise<EquipmentImage> {
    const id = this.currentEquipmentImageId++;
    const now = new Date();
    
    // Ensure we have consistent null values for optional fields
    const image: EquipmentImage = {
      id,
      project_id: insertImage.project_id,
      equipment_type: insertImage.equipment_type,
      equipment_id: insertImage.equipment_id ?? null,
      image_data: insertImage.image_data,
      thumbnail_data: insertImage.thumbnail_data ?? null,
      filename: insertImage.filename ?? null,
      sharepoint_file_id: insertImage.sharepoint_file_id ?? null,
      sharepoint_url: insertImage.sharepoint_url ?? null,
      created_at: now,
      updated_at: now
    };
    
    this.equipmentImages.set(id, image);
    return image;
  }

  async updateEquipmentImage(id: number, updateImage: Partial<InsertEquipmentImage>): Promise<EquipmentImage | undefined> {
    const image = this.equipmentImages.get(id);
    if (!image) {
      return undefined;
    }
    
    const updatedImage: EquipmentImage = {
      ...image,
      ...updateImage,
      updated_at: new Date()
    };
    
    this.equipmentImages.set(id, updatedImage);
    return updatedImage;
  }

  async deleteEquipmentImage(id: number): Promise<boolean> {
    return this.equipmentImages.delete(id);
  }
  
  // KVG Form Data
  async getKvgFormData(projectId: number): Promise<KvgFormData | undefined> {
    return Array.from(this.kvgFormData.values()).find(
      (formData) => formData.project_id === projectId
    );
  }

  async createKvgFormData(insertFormData: InsertKvgFormData): Promise<KvgFormData> {
    const id = this.currentKvgFormDataId++;
    const now = new Date();
    
    const formData: KvgFormData = {
      id,
      project_id: insertFormData.project_id,
      
      // Pricing tab fields
      customer_type: insertFormData.customer_type ?? null,
      voc_escalations: insertFormData.voc_escalations ?? 0,
      dispatch_responses: insertFormData.dispatch_responses ?? 0,
      gdods_patrols: insertFormData.gdods_patrols ?? 0,
      sgpp_patrols: insertFormData.sgpp_patrols ?? 0,
      forensic_investigations: insertFormData.forensic_investigations ?? 0,
      app_users: insertFormData.app_users ?? 0,
      audio_devices: insertFormData.audio_devices ?? 0,
      
      // Discovery tab fields
      bdm_owner: insertFormData.bdm_owner ?? null,
      sales_engineer: insertFormData.sales_engineer ?? null,
      kvg_sme: insertFormData.kvg_sme ?? null,
      customer_name: insertFormData.customer_name ?? null,
      site_address: insertFormData.site_address ?? null,
      city: insertFormData.city ?? null,
      state: insertFormData.state ?? null,
      zip_code: insertFormData.zip_code ?? null,
      crm_opportunity: insertFormData.crm_opportunity ?? null,
      quote_date: insertFormData.quote_date ?? null,
      time_zone: insertFormData.time_zone ?? null,
      opportunity_stage: insertFormData.opportunity_stage ?? null,
      opportunity_type: insertFormData.opportunity_type ?? null,
      site_environment: insertFormData.site_environment ?? null,
      region: insertFormData.region ?? null,
      customer_vertical: insertFormData.customer_vertical ?? null,
      property_category: insertFormData.property_category ?? null,
      
      // Project Deployment - PM tab fields
      pm_name: insertFormData.pm_name ?? null,
      deployment_date: insertFormData.deployment_date ?? null,
      opportunity_number: insertFormData.opportunity_number ?? null,
      project_manager: insertFormData.project_manager ?? null,
      site_supervisor: insertFormData.site_supervisor ?? null,
      technician: insertFormData.technician ?? null,
      project_scope_description: insertFormData.project_scope_description ?? null,
      deployment_requirements: insertFormData.deployment_requirements ?? null,
      installation_requirements: insertFormData.installation_requirements ?? null,
      parts_list_credentials: insertFormData.parts_list_credentials ?? null,
      gateway_ip_address: insertFormData.gateway_ip_address ?? null,
      gateway_port: insertFormData.gateway_port ?? null,
      gateway_username: insertFormData.gateway_username ?? null,
      gateway_password: insertFormData.gateway_password ?? null,
      stream_names_ids: insertFormData.stream_names_ids ?? null,
      stream_health_verification: insertFormData.stream_health_verification ?? null,
      speaker_verification: insertFormData.speaker_verification ?? null,
      
      // Technology fields
      technology: insertFormData.technology ?? null,
      technology_deployed: insertFormData.technology_deployed ?? null,
      camera_type: insertFormData.camera_type ?? null,
      rspndr_gdods: insertFormData.rspndr_gdods ?? null,
      rspndr_subscriptions: insertFormData.rspndr_subscriptions ?? null,
      install_type: insertFormData.install_type ?? null,
      
      // Stream counts
      event_video_trigger_streams: insertFormData.event_video_trigger_streams ?? 0,
      virtual_patrol_streams: insertFormData.virtual_patrol_streams ?? 0,
      event_action_clip_streams: insertFormData.event_action_clip_streams ?? 0,
      event_action_multi_view_streams: insertFormData.event_action_multi_view_streams ?? 0,
      health_streams: insertFormData.health_streams ?? 0,
      audio_talk_down_speakers: insertFormData.audio_talk_down_speakers ?? 0,
      
      // Monitoring details
      total_events_per_month: insertFormData.total_events_per_month ?? 0,
      total_virtual_patrols_per_month: insertFormData.total_virtual_patrols_per_month ?? 0,
      patrol_frequency: insertFormData.patrol_frequency ?? null,
      total_health_patrols_per_month: insertFormData.total_health_patrols_per_month ?? 30,
      
      // Site Assessment fields
      lighting_requirements: insertFormData.lighting_requirements ?? null,
      lighting_notes: insertFormData.lighting_notes ?? null,
      camera_field_of_view: insertFormData.camera_field_of_view ?? null,
      fov_notes: insertFormData.fov_notes ?? null,
      network_connectivity: insertFormData.network_connectivity ?? null,
      network_notes: insertFormData.network_notes ?? null,
      site_assessment_notes: insertFormData.site_assessment_notes ?? null,
      total_event_action_multi_views_per_month: insertFormData.total_event_action_multi_views_per_month ?? 0,
      total_escalations_maximum: insertFormData.total_escalations_maximum ?? 0,
      gdods_dispatches_per_month: insertFormData.gdods_dispatches_per_month ?? 0,
      sgpp_scheduled_patrols_per_month: insertFormData.sgpp_scheduled_patrols_per_month ?? 0,
      
      // Patrol details
      on_demand_guard_dispatch_detail: insertFormData.on_demand_guard_dispatch_detail ?? null,
      sgpp_scheduled_guard_patrol_detail: insertFormData.sgpp_scheduled_guard_patrol_detail ?? null,
      sgpp_scheduled_guard_patrols_schedule_detail: insertFormData.sgpp_scheduled_guard_patrols_schedule_detail ?? null,
      
      // Use Case tab fields
      use_case_commitment: insertFormData.use_case_commitment ?? null,
      use_case_response: insertFormData.use_case_response ?? null,
      sow_detailed_outline: insertFormData.sow_detailed_outline ?? null,
      schedule_details: insertFormData.schedule_details ?? null,
      quote_with_sow_attached: insertFormData.quote_with_sow_attached ?? null,
      quote_design_attached: insertFormData.quote_design_attached ?? null,
      
      // VOC Protocol tab fields
      am_name: insertFormData.am_name ?? null,
      project_id_value: insertFormData.project_id_value ?? null,
      voc_script: insertFormData.voc_script ?? null,
      voc_contact_name: insertFormData.voc_contact_name ?? null,
      type_of_install_account: insertFormData.type_of_install_account ?? null,
      
      // Escalation Process 1 fields
      escalation_process1: insertFormData.escalation_process1 ?? null,
      escalation_process1_events: insertFormData.escalation_process1_events ?? null,
      escalation_process1_days_of_week: insertFormData.escalation_process1_days_of_week ?? null,
      escalation_process1_start_time: insertFormData.escalation_process1_start_time ?? null,
      escalation_process1_end_time: insertFormData.escalation_process1_end_time ?? null,
      escalation_process1_cameras: insertFormData.escalation_process1_cameras ?? null,
      escalation_process1_scene_observation: insertFormData.escalation_process1_scene_observation ?? null,
      escalation_process1_process: insertFormData.escalation_process1_process ?? null,
      escalation_process1_use_talk_down: insertFormData.escalation_process1_use_talk_down ?? null,
      escalation_process1_contact_site_personnel: insertFormData.escalation_process1_contact_site_personnel ?? null,
      escalation_process1_contact_police: insertFormData.escalation_process1_contact_police ?? null,
      escalation_process1_escalate_to_branch: insertFormData.escalation_process1_escalate_to_branch ?? null,
      escalation_process1_create_security_report: insertFormData.escalation_process1_create_security_report ?? null,
      escalation_process1_rspndr_dispatch: insertFormData.escalation_process1_rspndr_dispatch ?? null,
      escalation_process1_audio_response: insertFormData.escalation_process1_audio_response ?? null,
      escalation_process1_audio_message: insertFormData.escalation_process1_audio_message ?? null,
      
      // Escalation Process 2 fields
      escalation_process2: insertFormData.escalation_process2 ?? null,
      escalation_process2_events: insertFormData.escalation_process2_events ?? null,
      escalation_process2_days_of_week: insertFormData.escalation_process2_days_of_week ?? null,
      escalation_process2_start_time: insertFormData.escalation_process2_start_time ?? null,
      escalation_process2_end_time: insertFormData.escalation_process2_end_time ?? null,
      escalation_process2_scene_observation: insertFormData.escalation_process2_scene_observation ?? null,
      escalation_process2_process: insertFormData.escalation_process2_process ?? null,
      escalation_process2_audio_response: insertFormData.escalation_process2_audio_response ?? null,
      escalation_process2_audio_message: insertFormData.escalation_process2_audio_message ?? null,
      
      // Escalation Process 3 fields
      escalation_process3: insertFormData.escalation_process3 ?? null,
      escalation_process3_events: insertFormData.escalation_process3_events ?? null,
      escalation_process3_days_of_week: insertFormData.escalation_process3_days_of_week ?? null,
      escalation_process3_start_time: insertFormData.escalation_process3_start_time ?? null,
      escalation_process3_end_time: insertFormData.escalation_process3_end_time ?? null,
      escalation_process3_scene_observation: insertFormData.escalation_process3_scene_observation ?? null,
      escalation_process3_process: insertFormData.escalation_process3_process ?? null,
      escalation_process3_audio_response: insertFormData.escalation_process3_audio_response ?? null,
      escalation_process3_audio_message: insertFormData.escalation_process3_audio_message ?? null,
      
      // Incident Types and Price Streams data as JSON
      incident_types: insertFormData.incident_types ?? null,
      price_streams: insertFormData.price_streams ?? null,
      
      created_at: now,
      updated_at: now
    };
    
    this.kvgFormData.set(id, formData);
    return formData;
  }

  async updateKvgFormData(id: number, updateFormData: Partial<InsertKvgFormData>): Promise<KvgFormData | undefined> {
    const formData = this.kvgFormData.get(id);
    if (!formData) {
      return undefined;
    }
    
    const updatedFormData: KvgFormData = { 
      ...formData, 
      ...updateFormData, 
      updated_at: new Date() 
    };
    
    this.kvgFormData.set(id, updatedFormData);
    return updatedFormData;
  }
  
  // KVG Streams
  async getKvgStreams(projectId: number): Promise<KvgStream[]> {
    return Array.from(this.kvgStreams.values()).filter(
      (stream) => stream.project_id === projectId
    );
  }

  async getKvgStream(id: number): Promise<KvgStream | undefined> {
    return this.kvgStreams.get(id);
  }

  async createKvgStream(insertStream: InsertKvgStream): Promise<KvgStream> {
    const id = this.currentKvgStreamId++;
    const now = new Date();
    
    const stream: KvgStream = {
      id,
      project_id: insertStream.project_id ?? null,
      location: insertStream.location ?? null,
      fov_accessibility: insertStream.fov_accessibility ?? null,
      camera_accessibility: insertStream.camera_accessibility ?? null,
      camera_type: insertStream.camera_type ?? null,
      environment: insertStream.environment ?? null,
      use_case_problem: insertStream.use_case_problem ?? null,
      speaker_association: insertStream.speaker_association ?? null,
      audio_talk_down: insertStream.audio_talk_down ?? null,
      event_monitoring: insertStream.event_monitoring ?? null,
      monitoring_start_time: insertStream.monitoring_start_time ?? null,
      monitoring_end_time: insertStream.monitoring_end_time ?? null,
      monitoring_days: insertStream.monitoring_days ?? null,
      created_at: now,
      updated_at: now
    };
    
    this.kvgStreams.set(id, stream);
    return stream;
  }

  async updateKvgStream(id: number, updateStream: Partial<InsertKvgStream>): Promise<KvgStream | undefined> {
    const stream = this.kvgStreams.get(id);
    if (!stream) {
      return undefined;
    }
    
    const updatedStream: KvgStream = { 
      ...stream, 
      ...updateStream, 
      updated_at: new Date() 
    };
    
    this.kvgStreams.set(id, updatedStream);
    return updatedStream;
  }

  async deleteKvgStream(id: number): Promise<boolean> {
    return this.kvgStreams.delete(id);
  }
  
  // Stream Images
  async getStreamImages(streamId: number): Promise<StreamImage[]> {
    return Array.from(this.streamImages.values()).filter(
      (image) => image.stream_id === streamId
    );
  }

  async createStreamImage(insertImage: InsertStreamImage): Promise<StreamImage> {
    const id = this.currentStreamImageId++;
    const now = new Date();
    
    const image: StreamImage = {
      id,
      stream_id: insertImage.stream_id,
      project_id: insertImage.project_id ?? null,
      image_data: insertImage.image_data,
      thumbnail_data: insertImage.thumbnail_data ?? null,
      filename: insertImage.filename ?? null,
      created_at: now
    };
    
    this.streamImages.set(id, image);
    return image;
  }

  async deleteStreamImage(id: number): Promise<boolean> {
    return this.streamImages.delete(id);
  }
}

export const storage = new MemStorage();