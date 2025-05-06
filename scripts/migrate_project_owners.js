/**
 * Migration script to associate existing projects with user accounts
 * This script will ensure all existing projects are properly linked to users
 */

import { storage } from '../server/storage.js';

// Helper function to get all users (since storage.getUsers() doesn't exist)
async function getAllUsers() {
  // Grab the users from the storage's users Map
  // This is a workaround since there's no direct method in storage
  return Array.from(storage.users.values());
}

async function migrateProjectOwners() {
  try {
    console.log('Starting project ownership migration...');
    
    // Get all users
    const users = await getAllUsers();
    if (users.length === 0) {
      console.log('No users found in the system. Migration stopped.');
      return;
    }
    
    // Get all projects
    const projects = await storage.getProjects();
    if (projects.length === 0) {
      console.log('No projects found in the system. Migration stopped.');
      return;
    }
    
    console.log(`Found ${users.length} users and ${projects.length} projects`);
    
    // For each project, check if it has owners
    for (const project of projects) {
      const collaborators = await storage.getProjectCollaborators(project.id);
      
      if (collaborators.length === 0) {
        console.log(`Project ID ${project.id} (${project.name}) has no owners. Adding default owner...`);
        
        // Find the admin user
        const adminUser = users.find(user => user.role === 'admin');
        
        if (adminUser) {
          // Add the admin user as the owner
          await storage.addProjectCollaborator({
            project_id: project.id,
            user_id: adminUser.id,
            permission: 'admin'
          });
          console.log(`Added user ${adminUser.username} (ID: ${adminUser.id}) as admin for project ${project.id}`);
        } else {
          // If no admin, add the first user
          const firstUser = users[0];
          await storage.addProjectCollaborator({
            project_id: project.id,
            user_id: firstUser.id,
            permission: 'admin'
          });
          console.log(`Added user ${firstUser.username} (ID: ${firstUser.id}) as admin for project ${project.id}`);
        }
      } else {
        console.log(`Project ID ${project.id} already has ${collaborators.length} collaborators. Skipping.`);
      }
    }
    
    console.log('Project ownership migration completed successfully!');
  } catch (error) {
    console.error('Error during migration:', error);
  }
}

// Run the migration
migrateProjectOwners().catch(console.error);