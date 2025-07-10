import { CepResponse } from "@shared/api";

/**
 * CEP API service for Brazilian postal code lookup
 * Uses ViaCEP API which is free and reliable
 */
class CepApiService {
  private baseUrl = "https://viacep.com.br/ws";

  /**
   * Fetch address data by CEP
   * @param cep - Brazilian postal code (CEP)
   * @returns Promise with address data or null if not found
   */
  async fetchAddressByCep(cep: string): Promise<CepResponse | null> {
    try {
      // Remove any non-numeric characters from CEP
      const cleanCep = cep.replace(/\D/g, "");

      // Validate CEP format (8 digits)
      if (cleanCep.length !== 8) {
        throw new Error("CEP deve ter 8 dígitos");
      }

      const response = await fetch(`${this.baseUrl}/${cleanCep}/json/`);

      if (!response.ok) {
        throw new Error("Erro ao consultar CEP");
      }

      const data: CepResponse = await response.json();

      // Check if CEP was found
      if (data.erro) {
        return null;
      }

      return data;
    } catch (error) {
      console.error("Error fetching CEP:", error);
      throw error;
    }
  }

  /**
   * Format CEP for display (adds dash)
   * @param cep - CEP string
   * @returns Formatted CEP string
   */
  formatCep(cep: string): string {
    const cleanCep = cep.replace(/\D/g, "");
    if (cleanCep.length === 8) {
      return `${cleanCep.slice(0, 5)}-${cleanCep.slice(5)}`;
    }
    return cep;
  }

  /**
   * Validate CEP format
   * @param cep - CEP string
   * @returns true if valid format
   */
  isValidCep(cep: string): boolean {
    const cleanCep = cep.replace(/\D/g, "");
    return cleanCep.length === 8;
  }

  /**
   * Clean CEP removing formatting
   * @param cep - CEP string with or without formatting
   * @returns Clean CEP string
   */
  cleanCep(cep: string): string {
    return cep.replace(/\D/g, "");
  }
}

export const cepApi = new CepApiService();
