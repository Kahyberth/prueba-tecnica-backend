import { Cache } from 'cache-manager';

export const invalidateMerchantsCache = async (
  cacheManager: Cache,
): Promise<void> => {
  try {
    const keysToDelete = [
      'merchants:page:1:limit:5',
      'merchants:page:1:limit:10',
      'merchants:page:1:limit:20',
    ];

    await Promise.all(keysToDelete.map((key) => cacheManager.del(key)));
  } catch (error) {
    console.error('Error invalidating cache:', error);
  }
};
