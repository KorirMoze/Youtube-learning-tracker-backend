import * as videoService from '../services/videos.service.js';

export async function createVideo(req, res, next) {
  try {
    const userId = req.user.userId;
    const video = await videoService.logVideo(userId, req.body);

    res.status(201).json({
      status: 'success',
      data: video,
    });
  } catch (err) {
    next(err);
  }
}

export async function listVideos(req, res, next) {
  try {
    const userId = req.user.userId;
    const result = await videoService.listVideos(userId, req.query);

    res.json({
      status: 'success',
      ...result,
    });
  } catch (err) {
    next(err);
  }
}

export async function getVideo(req, res, next) {
  try {
    const userId = req.user.userId;
    const video = await videoService.getVideo(userId, req.params.id);

    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    res.json({
      status: 'success',
      data: video,
    });
  } catch (err) {
    next(err);
  }
}

export async function updateVideo(req, res, next) {
  try {
    const userId = req.user.userId;
    const video = await videoService.updateVideo(
      userId,
      req.params.id,
      req.body
    );

    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    res.json({
      status: 'success',
      data: video,
    });
  } catch (err) {
    next(err);
  }
}

export async function removeVideo(req, res, next) {
  try {
    const userId = req.user.userId;
    const deleted = await videoService.deleteVideo(
      userId,
      req.params.id
    );

    if (!deleted) {
      return res.status(404).json({ error: 'Video not found' });
    }

    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
