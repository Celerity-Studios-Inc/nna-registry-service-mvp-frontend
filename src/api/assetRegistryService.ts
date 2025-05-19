/**
 * Asset Registry Service
 * A client-side mock service to track registered assets for development purposes
 */

import { Asset } from '../types/asset.types';

interface AssetFingerprint {
  name: string;
  size: number;
  type: string;
  hash: string;
  lastModified?: number;
}

interface RegisteredAsset {
  asset: Asset;
  fingerprint: AssetFingerprint;
  registeredAt: Date;
}

class AssetRegistryService {
  private registeredAssets: RegisteredAsset[] = [];
  private storageKey = 'nna_registry_assets';

  constructor() {
    this.loadFromStorage();
  }

  /**
   * Save the registered assets to localStorage
   */
  private saveToStorage(): void {
    try {
      localStorage.setItem(
        this.storageKey,
        JSON.stringify(this.registeredAssets)
      );
    } catch (error) {
      console.error('Failed to save registered assets to storage:', error);
    }
  }

  /**
   * Load registered assets from localStorage
   */
  private loadFromStorage(): void {
    try {
      const storedData = localStorage.getItem(this.storageKey);
      if (storedData) {
        this.registeredAssets = JSON.parse(storedData);

        // Convert string dates back to Date objects
        this.registeredAssets.forEach(item => {
          item.registeredAt = new Date(item.registeredAt);
        });
      }
    } catch (error) {
      console.error('Failed to load registered assets from storage:', error);
      this.registeredAssets = [];
    }
  }

  /**
   * Register a new asset with its fingerprint
   * @param asset The asset to register
   * @param fingerprint The asset's fingerprint
   * @returns The registered asset
   */
  registerAsset(asset: Asset, fingerprint: AssetFingerprint): RegisteredAsset {
    // Create a new registered asset entry
    const registeredAsset: RegisteredAsset = {
      asset,
      fingerprint,
      registeredAt: new Date(),
    };

    // Add to the registry
    this.registeredAssets.push(registeredAsset);

    // Save to storage
    this.saveToStorage();

    return registeredAsset;
  }

  /**
   * Update an existing asset
   * @param assetId The ID of the asset to update
   * @param updatedAsset The updated asset data
   * @param fingerprint Optional updated fingerprint
   * @returns The updated registered asset or null if not found
   */
  updateAsset(
    assetId: string,
    updatedAsset: Asset,
    fingerprint?: AssetFingerprint
  ): RegisteredAsset | null {
    const index = this.registeredAssets.findIndex(
      item => item.asset.id === assetId
    );

    if (index === -1) {
      return null;
    }

    // Update the asset
    this.registeredAssets[index] = {
      ...this.registeredAssets[index],
      asset: updatedAsset,
      fingerprint: fingerprint || this.registeredAssets[index].fingerprint,
      // Don't update registeredAt on updates
    };

    // Save to storage
    this.saveToStorage();

    return this.registeredAssets[index];
  }

  /**
   * Find assets by fingerprint
   * @param fingerprint The asset fingerprint to search for
   * @returns Array of matching registered assets
   */
  findAssetsByFingerprint(
    fingerprint: Partial<AssetFingerprint>
  ): RegisteredAsset[] {
    return this.registeredAssets.filter(item => {
      // Match each provided fingerprint property
      for (const key in fingerprint) {
        if (key in fingerprint && key in item.fingerprint) {
          const k = key as keyof AssetFingerprint;
          if (
            fingerprint[k] !== undefined &&
            fingerprint[k] !== item.fingerprint[k]
          ) {
            return false;
          }
        }
      }
      return true;
    });
  }

  /**
   * Find exact asset match by fingerprint
   * @param fingerprint The complete asset fingerprint
   * @returns The matching registered asset or null if not found
   */
  findExactAssetMatch(fingerprint: AssetFingerprint): RegisteredAsset | null {
    const matches = this.registeredAssets.filter(
      item =>
        item.fingerprint.name === fingerprint.name &&
        item.fingerprint.size === fingerprint.size &&
        item.fingerprint.type === fingerprint.type &&
        item.fingerprint.hash === fingerprint.hash
    );

    // Return the most recently registered match if there are multiple
    return matches.length > 0
      ? matches.sort(
          (a, b) => b.registeredAt.getTime() - a.registeredAt.getTime()
        )[0]
      : null;
  }

  /**
   * Get all registered assets
   * @returns Array of all registered assets
   */
  getAllAssets(): RegisteredAsset[] {
    return [...this.registeredAssets];
  }

  /**
   * Get an asset by ID
   * @param id The asset ID
   * @returns The registered asset or null if not found
   */
  getAssetById(id: string): RegisteredAsset | null {
    return this.registeredAssets.find(item => item.asset.id === id) || null;
  }

  /**
   * Get assets by NNA address
   * @param nnaAddress The NNA address
   * @returns Array of matching registered assets
   */
  getAssetsByNNAAddress(nnaAddress: string): RegisteredAsset[] {
    return this.registeredAssets.filter(
      item =>
        item.asset.nnaAddress === nnaAddress ||
        item.asset.metadata?.machineFriendlyAddress === nnaAddress
    );
  }

  /**
   * Remove an asset from the registry
   * @param id The asset ID
   * @returns True if successful, false if not found
   */
  removeAsset(id: string): boolean {
    const initialLength = this.registeredAssets.length;
    this.registeredAssets = this.registeredAssets.filter(
      item => item.asset.id !== id
    );

    if (this.registeredAssets.length !== initialLength) {
      this.saveToStorage();
      return true;
    }

    return false;
  }

  /**
   * Clear all registered assets
   */
  clearRegistry(): void {
    this.registeredAssets = [];
    this.saveToStorage();
  }
}

// Create a singleton instance
const assetRegistryService = new AssetRegistryService();
export default assetRegistryService;
