import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const SYNC_FILE = path.join(process.cwd(), 'data', 'jobs-sync.json');

async function readSyncFile() {
  try {
    const data = await fs.readFile(SYNC_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

async function writeSyncFile(jobs: any[]) {
  try {
    await fs.writeFile(SYNC_FILE, JSON.stringify(jobs, null, 2));
  } catch (error) {
    console.error('Error writing sync file:', error);
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const since = searchParams.get('since');
  
  try {
    const allJobs = await readSyncFile();
    const sinceTime = since ? parseInt(since) : 0;
    const recentJobs = allJobs.filter((job: any) => job.syncTimestamp > sinceTime);
    
    return NextResponse.json({
      success: true,
      jobs: recentJobs,
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('Error fetching synced jobs:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch jobs' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { job, action } = await request.json();
    
    if (action === 'create') {
      const allJobs = await readSyncFile();
      
      // Add new job to file storage
      const syncedJob = {
        ...job,
        syncTimestamp: Date.now()
      };
      
      allJobs.unshift(syncedJob);
      
      // Keep only last 100 jobs
      const recentJobs = allJobs.slice(0, 100);
      await writeSyncFile(recentJobs);
      
      console.log('📡 Job synced globally:', job.title);
      
      return NextResponse.json({
        success: true,
        message: 'Job synced successfully',
        job: syncedJob
      });
    }
    
    if (action === 'update') {
      const allJobs = await readSyncFile();
      const { jobId, updates } = job;
      const jobIndex = allJobs.findIndex((j: any) => j.id === jobId);
      
      if (jobIndex !== -1) {
        allJobs[jobIndex] = {
          ...allJobs[jobIndex],
          ...updates,
          syncTimestamp: Date.now()
        };
        
        await writeSyncFile(allJobs);
        
        console.log('📡 Job update synced globally:', jobId);
        
        return NextResponse.json({
          success: true,
          message: 'Job update synced successfully'
        });
      }
    }
    
    return NextResponse.json(
      { success: false, error: 'Invalid action or job not found' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error syncing job:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to sync job' },
      { status: 500 }
    );
  }
}
