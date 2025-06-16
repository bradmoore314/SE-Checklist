import { 
  User, InsertUser,
  Project, InsertProject,
  AccessPoint, InsertAccessPoint,
  Camera, InsertCamera,
  Elevator, InsertElevator,
  Intercom, InsertIntercom,
  Feedback, InsertFeedback,
  ProjectCollaborator, InsertProjectCollaborator,
  PERMISSION, Permission,
  EquipmentImage, InsertEquipmentImage,
  users,
  projects,
  accessPoints,
  cameras,
  elevators,
  intercoms,
  feedback,
  projectCollaborators,
  gatewayCalculatorConfigs,
  equipmentImages
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";
import { and, eq, inArray } from "drizzle-orm";
import { db } from "./db";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  sessionStore: session.Store;
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByMicrosoftId(microsoftId: string): Promise<User | undefined>;
  getUsers(): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  updateUserRefreshToken(userId: number, refreshToken: string): Promise<User | undefined>;
  
  // Projects
  getProjects(): Promise<Project[]>;
  getProjectsForUser(userId: number): Promise<Project[]>;
  getProject(id: number): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: number, project: Partial<InsertProject>): Promise<Project | undefined>;
  deleteProject(id: number): Promise<boolean>;
  
  // Project Collaborators
  getProjectCollaborators(projectId: number): Promise<ProjectCollaborator[]>;
  getProjectCollaborator(id: number): Promise<ProjectCollaborator | undefined>;
  getUserProjectPermission(userId: number, projectId: number): Promise<Permission | undefined>;
  addProjectCollaborator(collaborator: InsertProjectCollaborator): Promise<ProjectCollaborator>;
  updateProjectCollaborator(id: number, collaborator: Partial<InsertProjectCollaborator>): Promise<ProjectCollaborator | undefined>;
  removeProjectCollaborator(id: number): Promise<boolean>;
  
  // Access Points
  getAccessPoints(projectId: number): Promise<AccessPoint[]>;
  getAccessPointsByProject(projectId: number): Promise<AccessPoint[]>;
  getAccessPoint(id: number): Promise<AccessPoint | undefined>;
  createAccessPoint(accessPoint: InsertAccessPoint): Promise<AccessPoint>;
  updateAccessPoint(id: number, accessPoint: Partial<InsertAccessPoint>): Promise<AccessPoint | undefined>;
  deleteAccessPoint(id: number): Promise<boolean>;
  
  // Cameras
  getCameras(projectId: number): Promise<Camera[]>;
  getCamerasByProject(projectId: number): Promise<Camera[]>;
  getCamera(id: number): Promise<Camera | undefined>;
  createCamera(camera: InsertCamera): Promise<Camera>;
  updateCamera(id: number, camera: Partial<InsertCamera>): Promise<Camera | undefined>;
  deleteCamera(id: number): Promise<boolean>;
  
  // Elevators
  getElevators(projectId: number): Promise<Elevator[]>;
  getElevatorsByProject(projectId: number): Promise<Elevator[]>;
  getElevator(id: number): Promise<Elevator | undefined>;
  createElevator(elevator: InsertElevator): Promise<Elevator>;
  updateElevator(id: number, elevator: Partial<InsertElevator>): Promise<Elevator | undefined>;
  deleteElevator(id: number): Promise<boolean>;
  
  // Intercoms
  getIntercoms(projectId: number): Promise<Intercom[]>;
  getIntercomsByProject(projectId: number): Promise<Intercom[]>;
  getIntercom(id: number): Promise<Intercom | undefined>;
  createIntercom(intercom: InsertIntercom): Promise<Intercom>;
  updateIntercom(id: number, intercom: Partial<InsertIntercom>): Promise<Intercom | undefined>;
  deleteIntercom(id: number): Promise<boolean>;
  
  // Feedback
  getFeedback(): Promise<Feedback[]>;
  getFeedbackById(id: number): Promise<Feedback | undefined>;
  createFeedback(feedback: InsertFeedback): Promise<Feedback>;
  updateFeedback(id: number, feedback: Partial<InsertFeedback>): Promise<Feedback | undefined>;
  updateFeedbackStatus(id: number, status: string): Promise<Feedback | undefined>;
  deleteFeedback(id: number): Promise<boolean>;
  
  // Gateway Calculator Configuration
  getGatewayCalculatorConfig(projectId: number): Promise<any>;
  saveGatewayCalculatorConfig(config: any): Promise<any>;
  updateGatewayCalculatorConfig(projectId: number, config: any): Promise<any>;
  
  // Equipment Images
  getEquipmentImages(equipmentType: string, equipmentId: number): Promise<EquipmentImage[]>;
  createEquipmentImage(image: InsertEquipmentImage): Promise<EquipmentImage>;
  deleteEquipmentImage(id: number): Promise<boolean>;
}

export class DbStorage implements IStorage {
  public sessionStore: session.Store;

  constructor() {
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // prune expired entries every 24h
    });
  }

  // Users
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }
  
  async getUserByMicrosoftId(microsoftId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.microsoftId, microsoftId));
    return user;
  }
  
  async updateUserRefreshToken(userId: number, refreshToken: string): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ 
        refreshToken: refreshToken,
        lastLogin: new Date(),
        updated_at: new Date()
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  // Projects
  async getProjects(): Promise<Project[]> {
    return await db.select().from(projects);
  }

  async getProject(id: number): Promise<Project | undefined> {
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    return project;
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    const [project] = await db.insert(projects).values(insertProject).returning();
    return project;
  }

  async updateProject(id: number, updateProject: Partial<InsertProject>): Promise<Project | undefined> {
    const [project] = await db
      .update(projects)
      .set({ ...updateProject, updated_at: new Date() })
      .where(eq(projects.id, id))
      .returning();
    return project;
  }

  async deleteProject(id: number): Promise<boolean> {
    const result = await db.delete(projects).where(eq(projects.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  async getProjectsForUser(userId: number): Promise<Project[]> {
    // Get all project IDs the user has access to
    const collaborations = await db
      .select({ project_id: projectCollaborators.project_id })
      .from(projectCollaborators)
      .where(eq(projectCollaborators.user_id, userId));
    
    if (collaborations.length === 0) {
      return [];
    }
    
    const projectIds = collaborations.map(c => c.project_id);
    return await db.select().from(projects).where(inArray(projects.id, projectIds));
  }

  // Project Collaborators
  async getProjectCollaborators(projectId: number): Promise<ProjectCollaborator[]> {
    return await db.select().from(projectCollaborators).where(eq(projectCollaborators.project_id, projectId));
  }

  async getProjectCollaborator(id: number): Promise<ProjectCollaborator | undefined> {
    const [collaborator] = await db.select().from(projectCollaborators).where(eq(projectCollaborators.id, id));
    return collaborator;
  }

  async getUserProjectPermission(userId: number, projectId: number): Promise<Permission | undefined> {
    const [collaborator] = await db
      .select({ permission: projectCollaborators.permission })
      .from(projectCollaborators)
      .where(
        and(
          eq(projectCollaborators.user_id, userId),
          eq(projectCollaborators.project_id, projectId)
        )
      );
    return collaborator?.permission as Permission;
  }

  async addProjectCollaborator(collaborator: InsertProjectCollaborator): Promise<ProjectCollaborator> {
    const [newCollaborator] = await db.insert(projectCollaborators).values(collaborator).returning();
    return newCollaborator;
  }

  async updateProjectCollaborator(id: number, updateCollaborator: Partial<InsertProjectCollaborator>): Promise<ProjectCollaborator | undefined> {
    const [collaborator] = await db
      .update(projectCollaborators)
      .set({ ...updateCollaborator, updated_at: new Date() })
      .where(eq(projectCollaborators.id, id))
      .returning();
    return collaborator;
  }

  async removeProjectCollaborator(id: number): Promise<boolean> {
    const result = await db.delete(projectCollaborators).where(eq(projectCollaborators.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  // Access Points
  async getAccessPoints(projectId: number): Promise<AccessPoint[]> {
    return await db.select().from(accessPoints).where(eq(accessPoints.project_id, projectId));
  }

  async getAccessPointsByProject(projectId: number): Promise<AccessPoint[]> {
    return this.getAccessPoints(projectId);
  }

  async getAccessPoint(id: number): Promise<AccessPoint | undefined> {
    const [accessPoint] = await db.select().from(accessPoints).where(eq(accessPoints.id, id));
    return accessPoint;
  }

  async createAccessPoint(insertAccessPoint: InsertAccessPoint): Promise<AccessPoint> {
    const [accessPoint] = await db.insert(accessPoints).values(insertAccessPoint).returning();
    return accessPoint;
  }

  async updateAccessPoint(id: number, updateAccessPoint: Partial<InsertAccessPoint>): Promise<AccessPoint | undefined> {
    const [accessPoint] = await db
      .update(accessPoints)
      .set({ ...updateAccessPoint, updated_at: new Date() })
      .where(eq(accessPoints.id, id))
      .returning();
    return accessPoint;
  }

  async deleteAccessPoint(id: number): Promise<boolean> {
    const result = await db.delete(accessPoints).where(eq(accessPoints.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  // Cameras
  async getCameras(projectId: number): Promise<Camera[]> {
    return await db.select().from(cameras).where(eq(cameras.project_id, projectId));
  }

  async getCamerasByProject(projectId: number): Promise<Camera[]> {
    return this.getCameras(projectId);
  }

  async getCamera(id: number): Promise<Camera | undefined> {
    const [camera] = await db.select().from(cameras).where(eq(cameras.id, id));
    return camera;
  }

  async createCamera(insertCamera: InsertCamera): Promise<Camera> {
    const [camera] = await db.insert(cameras).values(insertCamera).returning();
    return camera;
  }

  async updateCamera(id: number, updateCamera: Partial<InsertCamera>): Promise<Camera | undefined> {
    const [camera] = await db
      .update(cameras)
      .set({ ...updateCamera, updated_at: new Date() })
      .where(eq(cameras.id, id))
      .returning();
    return camera;
  }

  async deleteCamera(id: number): Promise<boolean> {
    const result = await db.delete(cameras).where(eq(cameras.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  // Elevators
  async getElevators(projectId: number): Promise<Elevator[]> {
    return await db.select().from(elevators).where(eq(elevators.project_id, projectId));
  }

  async getElevatorsByProject(projectId: number): Promise<Elevator[]> {
    return this.getElevators(projectId);
  }

  async getElevator(id: number): Promise<Elevator | undefined> {
    const [elevator] = await db.select().from(elevators).where(eq(elevators.id, id));
    return elevator;
  }

  async createElevator(insertElevator: InsertElevator): Promise<Elevator> {
    const [elevator] = await db.insert(elevators).values(insertElevator).returning();
    return elevator;
  }

  async updateElevator(id: number, updateElevator: Partial<InsertElevator>): Promise<Elevator | undefined> {
    const [elevator] = await db
      .update(elevators)
      .set({ ...updateElevator, updated_at: new Date() })
      .where(eq(elevators.id, id))
      .returning();
    return elevator;
  }

  async deleteElevator(id: number): Promise<boolean> {
    const result = await db.delete(elevators).where(eq(elevators.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  // Intercoms
  async getIntercoms(projectId: number): Promise<Intercom[]> {
    return await db.select().from(intercoms).where(eq(intercoms.project_id, projectId));
  }

  async getIntercomsByProject(projectId: number): Promise<Intercom[]> {
    return this.getIntercoms(projectId);
  }

  async getIntercom(id: number): Promise<Intercom | undefined> {
    const [intercom] = await db.select().from(intercoms).where(eq(intercoms.id, id));
    return intercom;
  }

  async createIntercom(insertIntercom: InsertIntercom): Promise<Intercom> {
    const [intercom] = await db.insert(intercoms).values(insertIntercom).returning();
    return intercom;
  }

  async updateIntercom(id: number, updateIntercom: Partial<InsertIntercom>): Promise<Intercom | undefined> {
    const [intercom] = await db
      .update(intercoms)
      .set({ ...updateIntercom, updated_at: new Date() })
      .where(eq(intercoms.id, id))
      .returning();
    return intercom;
  }

  async deleteIntercom(id: number): Promise<boolean> {
    const result = await db.delete(intercoms).where(eq(intercoms.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  // Feedback
  async getFeedback(): Promise<Feedback[]> {
    return await db.select().from(feedback);
  }

  async getFeedbackById(id: number): Promise<Feedback | undefined> {
    const [feedbackItem] = await db.select().from(feedback).where(eq(feedback.id, id));
    return feedbackItem;
  }

  async createFeedback(insertFeedback: InsertFeedback): Promise<Feedback> {
    const [feedbackItem] = await db.insert(feedback).values(insertFeedback).returning();
    return feedbackItem;
  }

  async updateFeedback(id: number, updateFeedback: Partial<InsertFeedback>): Promise<Feedback | undefined> {
    const [feedbackItem] = await db
      .update(feedback)
      .set({ ...updateFeedback, updated_at: new Date() })
      .where(eq(feedback.id, id))
      .returning();
    return feedbackItem;
  }

  async updateFeedbackStatus(id: number, status: string): Promise<Feedback | undefined> {
    const [feedbackItem] = await db
      .update(feedback)
      .set({ status: status, updated_at: new Date() })
      .where(eq(feedback.id, id))
      .returning();
    return feedbackItem;
  }

  async deleteFeedback(id: number): Promise<boolean> {
    const result = await db.delete(feedback).where(eq(feedback.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  // Gateway Calculator Configuration methods
  async getGatewayCalculatorConfig(projectId: number): Promise<any> {
    try {
      const result = await db.query.gatewayCalculatorConfigs?.findFirst({
        where: (configs: any, { eq }: any) => eq(configs.project_id, projectId)
      });
      
      if (!result) {
        return null;
      }

      return {
        id: result.id,
        project_id: result.project_id,
        cameras_config: JSON.parse(result.cameras_config),
        gateway_config: JSON.parse(result.gateway_config),
        calculations: JSON.parse(result.calculations),
        streams: JSON.parse(result.streams),
        created_at: result.created_at,
        updated_at: result.updated_at
      };
    } catch (error) {
      console.error("Error fetching gateway calculator config:", error);
      return null;
    }
  }

  async saveGatewayCalculatorConfig(config: any): Promise<any> {
    try {
      const configData = {
        project_id: config.project_id,
        cameras_config: JSON.stringify(config.cameras_config || []),
        gateway_config: JSON.stringify(config.gateway_config || {}),
        calculations: JSON.stringify(config.calculations || {}),
        streams: JSON.stringify(config.streams || [])
      };

      const [result] = await db.insert(gatewayCalculatorConfigs).values(configData).returning();
      return result;
    } catch (error) {
      console.error("Error saving gateway calculator config:", error);
      throw error;
    }
  }

  async updateGatewayCalculatorConfig(projectId: number, config: any): Promise<any> {
    try {
      const configData = {
        cameras_config: JSON.stringify(config.cameras_config || []),
        gateway_config: JSON.stringify(config.gateway_config || {}),
        calculations: JSON.stringify(config.calculations || {}),
        streams: JSON.stringify(config.streams || []),
        updated_at: new Date()
      };

      const [result] = await db
        .update(gatewayCalculatorConfigs)
        .set(configData)
        .where(eq(gatewayCalculatorConfigs.project_id, projectId))
        .returning();
      
      return result;
    } catch (error) {
      console.error("Error updating gateway calculator config:", error);
      throw error;
    }
  }

  // Equipment Images methods
  async getEquipmentImages(equipmentType: string, equipmentId: number): Promise<EquipmentImage[]> {
    try {
      const images = await db.select().from(equipmentImages)
        .where(and(
          eq(equipmentImages.equipment_type, equipmentType),
          eq(equipmentImages.equipment_id, equipmentId)
        ))
        .orderBy(equipmentImages.created_at);
      return images;
    } catch (error) {
      console.error("Error fetching equipment images:", error);
      return [];
    }
  }

  async createEquipmentImage(image: InsertEquipmentImage): Promise<EquipmentImage> {
    try {
      const [newImage] = await db.insert(equipmentImages).values(image).returning();
      return newImage;
    } catch (error) {
      console.error("Error creating equipment image:", error);
      throw error;
    }
  }

  async deleteEquipmentImage(id: number): Promise<boolean> {
    try {
      const result = await db.delete(equipmentImages).where(eq(equipmentImages.id, id));
      return result.rowCount !== null && result.rowCount > 0;
    } catch (error) {
      console.error("Error deleting equipment image:", error);
      return false;
    }
  }
}

export const storage = new DbStorage();