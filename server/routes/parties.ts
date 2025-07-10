import { RequestHandler } from "express";
import {
  PartyRepository,
  CreatePartyData,
  UpdatePartyData,
} from "../models/Party";
import { ClientRepository } from "../models/Client";

/**
 * GET /api/parties - Get all parties
 */
export const getAllParties: RequestHandler = (req, res) => {
  try {
    const { status, type, clientId, startDate, endDate, includeClient } =
      req.query;

    const filters = {
      status: status as string,
      type: type as string,
      clientId: clientId ? parseInt(clientId as string) : undefined,
      startDate: startDate as string,
      endDate: endDate as string,
      includeClient: includeClient === "true",
    };

    const parties = PartyRepository.getAll(filters);

    res.json({
      success: true,
      data: parties,
      total: parties.length,
    });
  } catch (error) {
    console.error("Error fetching parties:", error);
    res.status(500).json({
      success: false,
      error: "FETCH_ERROR",
      message: "Failed to fetch parties",
    });
  }
};

/**
 * GET /api/parties/:id - Get party by ID
 */
export const getPartyById: RequestHandler = (req, res) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: "INVALID_ID",
        message: "Invalid party ID",
      });
    }

    const includeClient = req.query.includeClient === "true";
    const party = PartyRepository.getById(id, includeClient);

    if (!party) {
      return res.status(404).json({
        success: false,
        error: "NOT_FOUND",
        message: "Party not found",
      });
    }

    res.json({
      success: true,
      data: party,
    });
  } catch (error) {
    console.error("Error fetching party:", error);
    res.status(500).json({
      success: false,
      error: "FETCH_ERROR",
      message: "Failed to fetch party",
    });
  }
};

/**
 * POST /api/parties - Create new party
 */
export const createParty: RequestHandler = (req, res) => {
  try {
    const partyData: CreatePartyData = req.body;

    // Debug: Log the received data
    console.log("Received party data:", JSON.stringify(partyData, null, 2));

    // Basic validation
    if (!partyData.title?.trim()) {
      return res.status(400).json({
        success: false,
        error: "VALIDATION_ERROR",
        message: "Party title is required",
      });
    }

    if (!partyData.client_id) {
      return res.status(400).json({
        success: false,
        error: "VALIDATION_ERROR",
        message: "Client ID is required",
      });
    }

    if (!partyData.date) {
      return res.status(400).json({
        success: false,
        error: "VALIDATION_ERROR",
        message: "Party date is required",
      });
    }

    if (!partyData.time) {
      return res.status(400).json({
        success: false,
        error: "VALIDATION_ERROR",
        message: "Party time is required",
      });
    }

    // Validate date format
    if (isNaN(Date.parse(partyData.date))) {
      return res.status(400).json({
        success: false,
        error: "VALIDATION_ERROR",
        message: "Invalid date format",
      });
    }

    // Validate guests number
    if (partyData.guests !== undefined && partyData.guests < 0) {
      return res.status(400).json({
        success: false,
        error: "VALIDATION_ERROR",
        message: "Number of guests must be positive",
      });
    }

    // Validate value
    if (partyData.value < 0) {
      return res.status(400).json({
        success: false,
        error: "VALIDATION_ERROR",
        message: "Party value must be positive",
      });
    }

    // Check if client exists
    const client = ClientRepository.getById(partyData.client_id);
    if (!client) {
      return res.status(400).json({
        success: false,
        error: "VALIDATION_ERROR",
        message: "Client not found",
      });
    }

    const newParty = PartyRepository.create(partyData);

    res.status(201).json({
      success: true,
      data: newParty,
      message: "Party created successfully",
    });
  } catch (error) {
    console.error("Error creating party:", error);
    res.status(500).json({
      success: false,
      error: "CREATE_ERROR",
      message: "Failed to create party",
    });
  }
};

/**
 * PUT /api/parties/:id - Update party
 */
export const updateParty: RequestHandler = (req, res) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: "INVALID_ID",
        message: "Invalid party ID",
      });
    }

    const updates: UpdatePartyData = req.body;

    // Validate date if provided
    if (updates.date && isNaN(Date.parse(updates.date))) {
      return res.status(400).json({
        success: false,
        error: "VALIDATION_ERROR",
        message: "Invalid date format",
      });
    }

    // Validate guests if provided
    if (updates.guests !== undefined && updates.guests < 0) {
      return res.status(400).json({
        success: false,
        error: "VALIDATION_ERROR",
        message: "Number of guests must be positive",
      });
    }

    // Validate value if provided
    if (updates.value !== undefined && updates.value < 0) {
      return res.status(400).json({
        success: false,
        error: "VALIDATION_ERROR",
        message: "Party value must be positive",
      });
    }

    // Check if client exists if being updated
    if (updates.client_id) {
      const client = ClientRepository.getById(updates.client_id);
      if (!client) {
        return res.status(400).json({
          success: false,
          error: "VALIDATION_ERROR",
          message: "Client not found",
        });
      }
    }

    const updatedParty = PartyRepository.update(id, updates);

    if (!updatedParty) {
      return res.status(404).json({
        success: false,
        error: "NOT_FOUND",
        message: "Party not found",
      });
    }

    res.json({
      success: true,
      data: updatedParty,
      message: "Party updated successfully",
    });
  } catch (error) {
    console.error("Error updating party:", error);
    res.status(500).json({
      success: false,
      error: "UPDATE_ERROR",
      message: "Failed to update party",
    });
  }
};

/**
 * DELETE /api/parties/:id - Delete party
 */
export const deleteParty: RequestHandler = (req, res) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: "INVALID_ID",
        message: "Invalid party ID",
      });
    }

    const success = PartyRepository.delete(id);

    if (!success) {
      return res.status(404).json({
        success: false,
        error: "NOT_FOUND",
        message: "Party not found",
      });
    }

    res.json({
      success: true,
      message: "Party deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting party:", error);
    res.status(500).json({
      success: false,
      error: "DELETE_ERROR",
      message: "Failed to delete party",
    });
  }
};

/**
 * GET /api/parties/stats - Get party statistics
 */
export const getPartyStats: RequestHandler = (req, res) => {
  try {
    const stats = PartyRepository.getStats();

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Error fetching party stats:", error);
    res.status(500).json({
      success: false,
      error: "STATS_ERROR",
      message: "Failed to fetch party statistics",
    });
  }
};
