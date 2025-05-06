import { Router } from 'express';
import { db } from '../db';
import { eq, and } from 'drizzle-orm';
import { gateways, streams, streamImages } from '@shared/schema';
import { randomUUID } from 'crypto';
import { WebSocketServer } from 'ws';
import { Server } from 'http';

// Set up websocket connections for streams
export function setupStreamWebsockets(server: Server) {
  const wss = new WebSocketServer({ server, path: '/ws/streams' });
  
  wss.on('connection', (ws, req) => {
    // Extract stream ID from URL path
    const url = new URL(req.url || '', `http://${req.headers.host}`);
    const pathSegments = url.pathname.split('/');
    const streamId = pathSegments[pathSegments.length - 1];
    
    if (!streamId || pathSegments[1] !== 'ws' || pathSegments[2] !== 'streams') {
      ws.close(1008, 'Invalid stream endpoint');
      return;
    }
    
    console.log(`WebSocket connection established for stream ${streamId}`);
    
    // Example: Simulate sending images every few seconds
    // In a real implementation, this would be connected to a video stream server
    const interval = setInterval(() => {
      if (ws.readyState === ws.OPEN) {
        ws.send(JSON.stringify({
          type: 'image',
          image_data: 'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', // Empty GIF base64
          timestamp: new Date().toISOString()
        }));
      }
    }, 2000);
    
    ws.on('close', () => {
      console.log(`WebSocket connection closed for stream ${streamId}`);
      clearInterval(interval);
    });
    
    ws.on('error', (error) => {
      console.error(`WebSocket error for stream ${streamId}:`, error);
      clearInterval(interval);
    });
  });
}

export const gatewayRoutes = Router();

// Get all gateways for a project
gatewayRoutes.get('/projects/:projectId/gateways', async (req, res) => {
  try {
    const projectId = parseInt(req.params.projectId);
    
    // Get gateways for the project
    const gatewayList = await db.select().from(gateways).where(eq(gateways.project_id, projectId));
    
    // Get streams for each gateway
    const result = await Promise.all(gatewayList.map(async (gateway) => {
      const streamList = await db.select().from(streams).where(eq(streams.gateway_id, gateway.id));
      return {
        ...gateway,
        streams: streamList
      };
    }));
    
    res.json(result);
  } catch (error) {
    console.error('Error fetching gateways:', error);
    res.status(500).json({ error: 'Failed to retrieve gateways' });
  }
});

// Create a new gateway
gatewayRoutes.post('/projects/:projectId/gateways', async (req, res) => {
  try {
    const projectId = parseInt(req.params.projectId);
    const { name, ip_address, port, username, password } = req.body;
    
    // Validate required fields
    if (!name || !ip_address || !port || !username || !password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const [newGateway] = await db.insert(gateways).values({
      project_id: projectId,
      name,
      ip_address,
      port,
      username,
      password,
      status: 'unknown'
    }).returning();
    
    res.status(201).json(newGateway);
  } catch (error) {
    console.error('Error creating gateway:', error);
    res.status(500).json({ error: 'Failed to create gateway' });
  }
});

// Get a specific gateway
gatewayRoutes.get('/gateways/:id', async (req, res) => {
  try {
    const gatewayId = parseInt(req.params.id);
    
    const [gateway] = await db.select().from(gateways).where(eq(gateways.id, gatewayId));
    
    if (!gateway) {
      return res.status(404).json({ error: 'Gateway not found' });
    }
    
    const streamList = await db.select().from(streams).where(eq(streams.gateway_id, gatewayId));
    
    res.json({
      ...gateway,
      streams: streamList
    });
  } catch (error) {
    console.error('Error fetching gateway:', error);
    res.status(500).json({ error: 'Failed to retrieve gateway' });
  }
});

// Update a gateway
gatewayRoutes.patch('/gateways/:id', async (req, res) => {
  try {
    const gatewayId = parseInt(req.params.id);
    const { name, ip_address, port, username, password, status } = req.body;
    
    // Get the existing gateway
    const [existingGateway] = await db.select().from(gateways).where(eq(gateways.id, gatewayId));
    
    if (!existingGateway) {
      return res.status(404).json({ error: 'Gateway not found' });
    }
    
    // Prepare update data, keep existing password if not provided
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (ip_address !== undefined) updateData.ip_address = ip_address;
    if (port !== undefined) updateData.port = port;
    if (username !== undefined) updateData.username = username;
    if (password !== undefined && password.trim() !== '') updateData.password = password;
    if (status !== undefined) updateData.status = status;
    
    // Update the gateway
    const [updatedGateway] = await db.update(gateways)
      .set(updateData)
      .where(eq(gateways.id, gatewayId))
      .returning();
    
    res.json(updatedGateway);
  } catch (error) {
    console.error('Error updating gateway:', error);
    res.status(500).json({ error: 'Failed to update gateway' });
  }
});

// Delete a gateway
gatewayRoutes.delete('/gateways/:id', async (req, res) => {
  try {
    const gatewayId = parseInt(req.params.id);
    
    // First, delete all associated streams
    await db.delete(streams).where(eq(streams.gateway_id, gatewayId));
    
    // Then delete the gateway
    await db.delete(gateways).where(eq(gateways.id, gatewayId));
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting gateway:', error);
    res.status(500).json({ error: 'Failed to delete gateway' });
  }
});

// Test gateway connection
gatewayRoutes.post('/gateways/:id/test', async (req, res) => {
  try {
    const gatewayId = parseInt(req.params.id);
    
    // Get the gateway
    const [gateway] = await db.select().from(gateways).where(eq(gateways.id, gatewayId));
    
    if (!gateway) {
      return res.status(404).json({ error: 'Gateway not found' });
    }
    
    // This would be a real connection test in production
    // For now, we'll simulate a successful connection most of the time
    const success = Math.random() > 0.2; // 80% success rate

    // Update gateway status based on the test result
    await db.update(gateways)
      .set({ status: success ? 'online' : 'offline' })
      .where(eq(gateways.id, gatewayId));
    
    res.json({ 
      success, 
      message: success 
        ? 'Successfully connected to the gateway' 
        : 'Failed to connect to the gateway'
    });
  } catch (error) {
    console.error('Error testing gateway connection:', error);
    res.status(500).json({ error: 'Failed to test gateway connection' });
  }
});

// Create a new stream for a gateway
gatewayRoutes.post('/gateways/:gatewayId/streams', async (req, res) => {
  try {
    const gatewayId = parseInt(req.params.gatewayId);
    const { name, url, enabled, audio_enabled } = req.body;
    
    // Validate required fields
    if (!name || !url) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Verify gateway exists
    const [gateway] = await db.select().from(gateways).where(eq(gateways.id, gatewayId));
    if (!gateway) {
      return res.status(404).json({ error: 'Gateway not found' });
    }
    
    const [newStream] = await db.insert(streams).values({
      gateway_id: gatewayId,
      name,
      url,
      enabled: enabled !== undefined ? enabled : true,
      audio_enabled: audio_enabled !== undefined ? audio_enabled : false
    }).returning();
    
    res.status(201).json(newStream);
  } catch (error) {
    console.error('Error creating stream:', error);
    res.status(500).json({ error: 'Failed to create stream' });
  }
});

// Get a specific stream
gatewayRoutes.get('/streams/:id', async (req, res) => {
  try {
    const streamId = parseInt(req.params.id);
    
    const [stream] = await db.select().from(streams).where(eq(streams.id, streamId));
    
    if (!stream) {
      return res.status(404).json({ error: 'Stream not found' });
    }
    
    res.json(stream);
  } catch (error) {
    console.error('Error fetching stream:', error);
    res.status(500).json({ error: 'Failed to retrieve stream' });
  }
});

// Update a stream
gatewayRoutes.patch('/streams/:id', async (req, res) => {
  try {
    const streamId = parseInt(req.params.id);
    const { name, url, enabled, audio_enabled } = req.body;
    
    // Get the existing stream
    const [existingStream] = await db.select().from(streams).where(eq(streams.id, streamId));
    
    if (!existingStream) {
      return res.status(404).json({ error: 'Stream not found' });
    }
    
    // Prepare update data
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (url !== undefined) updateData.url = url;
    if (enabled !== undefined) updateData.enabled = enabled;
    if (audio_enabled !== undefined) updateData.audio_enabled = audio_enabled;
    
    // Update the stream
    const [updatedStream] = await db.update(streams)
      .set(updateData)
      .where(eq(streams.id, streamId))
      .returning();
    
    res.json(updatedStream);
  } catch (error) {
    console.error('Error updating stream:', error);
    res.status(500).json({ error: 'Failed to update stream' });
  }
});

// Delete a stream
gatewayRoutes.delete('/streams/:id', async (req, res) => {
  try {
    const streamId = parseInt(req.params.id);
    
    // First delete any stream images
    await db.delete(streamImages).where(eq(streamImages.stream_id, streamId));
    
    // Then delete the stream
    await db.delete(streams).where(eq(streams.id, streamId));
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting stream:', error);
    res.status(500).json({ error: 'Failed to delete stream' });
  }
});

// Start a stream
gatewayRoutes.post('/streams/:id/start', async (req, res) => {
  try {
    const streamId = parseInt(req.params.id);
    
    // Get the stream
    const [stream] = await db.select().from(streams).where(eq(streams.id, streamId));
    
    if (!stream) {
      return res.status(404).json({ error: 'Stream not found' });
    }
    
    // In a real implementation, this would start the stream on the gateway
    // For now, we'll just return a success message
    res.json({ success: true, message: 'Stream started successfully' });
  } catch (error) {
    console.error('Error starting stream:', error);
    res.status(500).json({ error: 'Failed to start stream' });
  }
});

// Stop a stream
gatewayRoutes.post('/streams/:id/stop', async (req, res) => {
  try {
    const streamId = parseInt(req.params.id);
    
    // Get the stream
    const [stream] = await db.select().from(streams).where(eq(streams.id, streamId));
    
    if (!stream) {
      return res.status(404).json({ error: 'Stream not found' });
    }
    
    // In a real implementation, this would stop the stream on the gateway
    // For now, we'll just return a success message
    res.status(204).send();
  } catch (error) {
    console.error('Error stopping stream:', error);
    res.status(500).json({ error: 'Failed to stop stream' });
  }
});

// Get stream images
gatewayRoutes.get('/streams/:id/images', async (req, res) => {
  try {
    const streamId = parseInt(req.params.id);
    
    // Get the stream
    const [stream] = await db.select().from(streams).where(eq(streams.id, streamId));
    
    if (!stream) {
      return res.status(404).json({ error: 'Stream not found' });
    }
    
    // Get images for the stream
    const images = await db.select()
      .from(streamImages)
      .where(eq(streamImages.stream_id, streamId))
      .orderBy(streamImages.timestamp);
    
    // If no images, return empty array
    if (images.length === 0) {
      // Create a sample image for demo purposes
      const sampleImages = [
        {
          id: 1,
          stream_id: streamId,
          image_data: 'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', // Empty GIF base64
          timestamp: new Date().toISOString(),
          label: 'Sample Image'
        }
      ];
      return res.json(sampleImages);
    }
    
    res.json(images);
  } catch (error) {
    console.error('Error fetching stream images:', error);
    res.status(500).json({ error: 'Failed to retrieve stream images' });
  }
});

// Add image to stream
gatewayRoutes.post('/streams/:id/images', async (req, res) => {
  try {
    const streamId = parseInt(req.params.id);
    const { image_data, label } = req.body;
    
    // Validate image data
    if (!image_data) {
      return res.status(400).json({ error: 'Missing image data' });
    }
    
    // Get the stream
    const [stream] = await db.select().from(streams).where(eq(streams.id, streamId));
    
    if (!stream) {
      return res.status(404).json({ error: 'Stream not found' });
    }
    
    // Create image
    const [newImage] = await db.insert(streamImages).values({
      stream_id: streamId,
      image_data,
      timestamp: new Date().toISOString(),
      label: label || null
    }).returning();
    
    res.status(201).json(newImage);
  } catch (error) {
    console.error('Error adding stream image:', error);
    res.status(500).json({ error: 'Failed to add stream image' });
  }
});