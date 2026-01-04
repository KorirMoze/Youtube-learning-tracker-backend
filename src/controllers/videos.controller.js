//import { Video } from '../domain/video.js';
import * as repo from '../repositories/video.repository.js';

export async function logVideo(userId, payload) {
  const video = new Video({
    userId,
    ...payload,
  });

  video.updateWatchTime(payload.watchTime ?? 0);

  return repo.upsert(video);
}

export async function listVideos(userId, filters) {
  return repo.findAll(userId, {
    limit: filters.limit ?? 50,
    offset: filters.offset ?? 0,
    category: filters.category,
    search: filters.search,
  });
}

export async function getVideo(userId, id) {
  return repo.findById(userId, id);
}

export async function updateVideo(userId, id, updates) {
  return repo.update(userId, id, updates);
}

export async function deleteVideo(userId, id) {
  return repo.remove(userId, id);
}
