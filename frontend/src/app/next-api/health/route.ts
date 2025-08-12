import { NextResponse } from 'next/server';

async function checkServiceHealth(url: string, timeout = 5000) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const response = await fetch(url, {
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    return { status: 'healthy', details: await response.json() };
  } catch (error) {
    return { status: 'unhealthy', error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

function isRunningInDocker() {
  try {
    return process.env.NODE_ENV === 'production';
  } catch {
    return false;
  }
}

export async function GET() {
  try {
    const isDocker = isRunningInDocker();
    
    console.log(`Running in ${isDocker ? 'Docker' : 'local'} environment`);
    // Configure URLs based on environment
    const apiUrl = isDocker ? 'http://backend:5000/api' : 'http://localhost:5000/api';
    const mqttUrl = isDocker ? 'http://mqtt-broker:1883/health' : 'http://localhost:1883/health';
    const memory = process.memoryUsage();

    // Check all services
    const [backendHealth, mqttHealth, mysqlHealth] = await Promise.all([
      checkServiceHealth(`${apiUrl}/health`),
      checkServiceHealth(mqttUrl).catch(() => ({ 
        status: 'unhealthy', 
        error: 'MQTT broker unreachable' 
      })),
      checkServiceHealth(`${apiUrl}/health/mysql`).catch(() => ({ 
        status: 'unhealthy', 
        error: 'MySQL unreachable' 
      }))
    ]);

    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: isDocker ? 'docker' : 'local',
      memory: {
        heapUsed: Math.round(memory.heapUsed / 1024 / 1024) + 'MB',
        heapTotal: Math.round(memory.heapTotal / 1024 / 1024) + 'MB',
        rss: Math.round(memory.rss / 1024 / 1024) + 'MB',
      },
      services: {
        backend: backendHealth,
        mqtt: mqttHealth,
        mysql: mysqlHealth,
        frontend: { 
          status: 'healthy',
          uptime: process.uptime() + 's'
        }
      }
    });
  } catch (error) {
    return NextResponse.json(
      { 
        status: 'error', 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
