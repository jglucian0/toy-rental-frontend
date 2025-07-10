import { RequestHandler } from "express";
import {
  ClientRepository,
  CreateClientData,
  UpdateClientData,
} from "../models/Client";

/**
 * GET /api/clients - Get all clients
 */
export const getAllClients: RequestHandler = (req, res) => {
  try {
    const { status, search, includeStats } = req.query;

    const filters = {
      status: status as string,
      search: search as string,
      includeStats: includeStats === "true",
    };

    const clients = ClientRepository.getAll(filters);

    res.json({
      success: true,
      data: clients,
      total: clients.length,
    });
  } catch (error) {
    console.error("Error fetching clients:", error);
    res.status(500).json({
      success: false,
      error: "FETCH_ERROR",
      message: "Failed to fetch clients",
    });
  }
};

/**
 * GET /api/clients/:id - Get client by ID
 */
export const getClientById: RequestHandler = (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: "INVALID_ID",
        message: "Invalid client ID",
      });
    }

    const includeStats = req.query.includeStats === "true";
    const client = ClientRepository.getById(id, includeStats);

    if (!client) {
      return res.status(404).json({
        success: false,
        error: "NOT_FOUND",
        message: "Client not found",
      });
    }

    res.json({
      success: true,
      data: client,
    });
  } catch (error) {
    console.error("Error fetching client:", error);
    res.status(500).json({
      success: false,
      error: "FETCH_ERROR",
      message: "Failed to fetch client",
    });
  }
};

/**
 * POST /api/clients - Create new client
 */
export const createClient: RequestHandler = (req, res) => {
  try {
    const clientData: CreateClientData = req.body;

    // Validation
    if (!clientData.name?.trim()) {
      return res.status(400).json({
        success: false,
        error: "VALIDATION_ERROR",
        message: "Client name is required",
      });
    }

    if (!clientData.email?.trim()) {
      return res.status(400).json({
        success: false,
        error: "VALIDATION_ERROR",
        message: "Client email is required",
      });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(clientData.email)) {
      return res.status(400).json({
        success: false,
        error: "VALIDATION_ERROR",
        message: "Invalid email format",
      });
    }

    // Check if email already exists
    const existingClient = ClientRepository.getByEmail(clientData.email);
    if (existingClient) {
      return res.status(409).json({
        success: false,
        error: "DUPLICATE_EMAIL",
        message: "Client with this email already exists",
      });
    }

    const newClient = ClientRepository.create(clientData);

    res.status(201).json({
      success: true,
      data: newClient,
      message: "Client created successfully",
    });
  } catch (error) {
    console.error("Error creating client:", error);
    res.status(500).json({
      success: false,
      error: "CREATE_ERROR",
      message: "Failed to create client",
    });
  }
};

/**
 * PUT /api/clients/:id - Update client
 */
export const updateClient: RequestHandler = (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: "INVALID_ID",
        message: "Invalid client ID",
      });
    }

    const updateData: UpdateClientData = req.body;

    // Email format validation if provided
    if (updateData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(updateData.email)) {
        return res.status(400).json({
          success: false,
          error: "VALIDATION_ERROR",
          message: "Invalid email format",
        });
      }

      // Check if email already exists for different client
      const existingClient = ClientRepository.getByEmail(updateData.email);
      if (existingClient && existingClient.id !== id) {
        return res.status(409).json({
          success: false,
          error: "DUPLICATE_EMAIL",
          message: "Another client with this email already exists",
        });
      }
    }

    const updatedClient = ClientRepository.update(id, updateData);

    if (!updatedClient) {
      return res.status(404).json({
        success: false,
        error: "NOT_FOUND",
        message: "Client not found",
      });
    }

    res.json({
      success: true,
      data: updatedClient,
      message: "Client updated successfully",
    });
  } catch (error) {
    console.error("Error updating client:", error);
    res.status(500).json({
      success: false,
      error: "UPDATE_ERROR",
      message: "Failed to update client",
    });
  }
};

/**
 * DELETE /api/clients/:id - Delete client
 */
export const deleteClient: RequestHandler = (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: "INVALID_ID",
        message: "Invalid client ID",
      });
    }

    const success = ClientRepository.delete(id);

    if (!success) {
      return res.status(404).json({
        success: false,
        error: "NOT_FOUND",
        message: "Client not found",
      });
    }

    res.json({
      success: true,
      message: "Client deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting client:", error);
    res.status(500).json({
      success: false,
      error: "DELETE_ERROR",
      message: "Failed to delete client",
    });
  }
};

/**
 * GET /api/clients/stats - Get client statistics
 */
export const getClientStats: RequestHandler = (req, res) => {
  try {
    const stats = ClientRepository.getStats();

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Error fetching client stats:", error);
    res.status(500).json({
      success: false,
      error: "STATS_ERROR",
      message: "Failed to fetch client statistics",
    });
  }
};
