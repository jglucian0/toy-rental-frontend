import { Party } from "@shared/api";

/**
 * In-memory database for parties
 * In a real application, this would be replaced with a proper database
 */
export class PartiesDatabase {
  private parties: Party[] = [
    
  ];

  private nextId: number = 4;

  /**
   * Get all parties
   */
  getAll(): Party[] {
    return [...this.parties];
  }

  /**
   * Get party by ID
   */
  getById(id: number): Party | undefined {
    return this.parties.find((party) => party.id === id);
  }

  /**
   * Create a new party
   */
  create(partyData: Omit<Party, "id" | "createdAt" | "updatedAt">): Party {
    const now = new Date().toISOString();
    const newParty: Party = {
      ...partyData,
      id: this.nextId++,
      createdAt: now,
      updatedAt: now,
    };

    this.parties.push(newParty);
    return newParty;
  }

  /**
   * Update a party
   */
  update(
    id: number,
    updates: Partial<Omit<Party, "id" | "createdAt">>,
  ): Party | null {
    const partyIndex = this.parties.findIndex((party) => party.id === id);

    if (partyIndex === -1) {
      return null;
    }

    const updatedParty: Party = {
      ...this.parties[partyIndex],
      ...updates,
      id, // Ensure ID doesn't change
      updatedAt: new Date().toISOString(),
    };

    this.parties[partyIndex] = updatedParty;
    return updatedParty;
  }

  /**
   * Delete a party
   */
  delete(id: number): boolean {
    const partyIndex = this.parties.findIndex((party) => party.id === id);

    if (partyIndex === -1) {
      return false;
    }

    this.parties.splice(partyIndex, 1);
    return true;
  }

  /**
   * Filter parties by status
   */
  getByStatus(status: Party["status"]): Party[] {
    return this.parties.filter((party) => party.status === status);
  }

  /**
   * Filter parties by type
   */
  getByType(type: Party["type"]): Party[] {
    return this.parties.filter((party) => party.type === type);
  }

  /**
   * Get parties count by status
   */
  getStatusCounts(): Record<Party["status"], number> {
    return this.parties.reduce(
      (counts, party) => {
        counts[party.status] = (counts[party.status] || 0) + 1;
        return counts;
      },
      {} as Record<Party["status"], number>,
    );
  }

  /**
   * Get total revenue
   */
  getTotalRevenue(): number {
    return this.parties.reduce((total, party) => total + party.value, 0);
  }
}

// Export singleton instance
export const partiesDb = new PartiesDatabase();
