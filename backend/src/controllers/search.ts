import { Request, Response } from 'express'
import { Project } from '../models/Project'
import { Workspace } from '../models/Workspace'
import { Video } from '../models/Video'
import { AuthRequest } from '../middleware/auth'

export const globalSearch = async (req: AuthRequest, res: Response) => {
  try {
    const { q: query, limit = 15, types } = req.query
    const userId = req.user!._id

    if (!query || typeof query !== 'string' || query.trim().length < 2) {
      return res.json({
        success: true,
        data: {
          projects: [],
          workspaces: [],
          videos: [],
          total: 0
        }
      })
    }

    const searchRegex = new RegExp(query.trim(), 'i')
    const limitNum = Math.min(parseInt(limit as string) || 15, 50)
    const searchTypes = types ? (types as string).split(',') : ['projects', 'workspaces', 'videos']

    const results: {
      projects: any[]
      workspaces: any[]
      videos: any[]
      total: number
    } = {
      projects: [],
      workspaces: [],
      videos: [],
      total: 0
    }

    // Search Projects
    if (searchTypes.includes('projects')) {
      const projects = await Project.find({
        $and: [
          {
            $or: [
              { name: searchRegex },
              { description: searchRegex }
            ]
          },
          {
            $or: [
              { owner: userId },
              { 'collaborators.user': userId }
            ]
          }
        ]
      })
      .populate('workspace', 'name')
      .limit(limitNum)
      .sort({ updatedAt: -1 })
      .lean()

      results.projects = projects
      results.total += projects.length
    }

    // Search Workspaces
    if (searchTypes.includes('workspaces')) {
      const workspaces = await Workspace.find({
        $and: [
          {
            $or: [
              { name: searchRegex },
              { description: searchRegex }
            ]
          },
          {
            $or: [
              { owner: userId },
              { 'members.user': userId }
            ]
          }
        ]
      })
      .limit(limitNum)
      .sort({ updatedAt: -1 })
      .lean()

      results.workspaces = workspaces
      results.total += workspaces.length
    }

    // Search Videos
    if (searchTypes.includes('videos')) {
      // First get user's accessible projects
      const userProjects = await Project.find({
        $or: [
          { owner: userId },
          { 'collaborators.user': userId }
        ]
      }).select('_id')

      const projectIds = userProjects.map(p => p._id)

      const videos = await Video.find({
        $and: [
          {
            $or: [
              { title: searchRegex },
              { description: searchRegex }
            ]
          },
          { project: { $in: projectIds } }
        ]
      })
      .populate('project', 'name')
      .limit(limitNum)
      .sort({ updatedAt: -1 })
      .lean()

      results.videos = videos
      results.total += videos.length
    }

    res.json({
      success: true,
      data: results
    })
  } catch (error) {
    console.error('Global search error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to perform search'
    })
  }
}