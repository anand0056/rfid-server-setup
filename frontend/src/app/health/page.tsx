'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';

interface ServiceHealth {
  service: string;
  status: 'healthy' | 'unhealthy' | 'unknown';
  lastChecked: string;
  details?: any;
  error?: string;
  memory?: {
    heapUsed: string;
    heapTotal: string;
    rss: string;
  };
}

export default function HealthPage() {
  const [services, setServices] = useState<ServiceHealth[]>([
    { service: 'Frontend', status: 'unknown', lastChecked: '-' },
    { service: 'Backend API', status: 'unknown', lastChecked: '-' },
    { service: 'MySQL Database', status: 'unknown', lastChecked: '-' },
    { service: 'MQTT Broker', status: 'unknown', lastChecked: '-' }
  ]);

  const [systemMemory, setSystemMemory] = useState<{
    heapUsed: string;
    heapTotal: string;
    rss: string;
  } | null>(null);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await fetch('/next-api/health');
        const data = await response.json();
        
        const currentTime = new Date().toLocaleTimeString();
        
        setSystemMemory(data.memory);
        
        // Update services based on the health check response
        setServices([
          {
            service: 'Frontend',
            status: data.services.frontend.status,
            lastChecked: currentTime,
            details: { uptime: data.services.frontend.uptime }
          },
          {
            service: 'Backend API',
            status: data.services.backend.status,
            lastChecked: currentTime,
            error: data.services.backend.error,
            details: data.services.backend.details
          },
          {
            service: 'MySQL Database',
            status: data.services.mysql.status,
            lastChecked: currentTime,
            error: data.services.mysql.error,
            details: data.services.mysql.details
          },
          {
            service: 'MQTT Broker',
            status: data.services.mqtt.status,
            lastChecked: currentTime,
            error: data.services.mqtt.error,
            details: data.services.mqtt.details
          }
        ]);
      } catch (error) {
        // Update all services as unhealthy if the health check fails
        const currentTime = new Date().toLocaleTimeString();
        setServices(prev => prev.map(service => ({
          ...service,
          status: 'unhealthy',
          lastChecked: currentTime,
          error: 'Health check failed'
        })));
      }
    };

    // Check health immediately and then every 30 seconds
    checkHealth();
    const interval = setInterval(checkHealth, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">System Health Status</h1>
      
      {systemMemory && (
        <Card className="p-4 mb-6">
          <h2 className="text-lg font-semibold mb-2">System Memory</h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600">Heap Used</p>
              <p className="font-medium">{systemMemory.heapUsed}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Heap Total</p>
              <p className="font-medium">{systemMemory.heapTotal}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">RSS</p>
              <p className="font-medium">{systemMemory.rss}</p>
            </div>
          </div>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
        {services.map((service) => (
          <Card key={service.service} className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-lg font-semibold">{service.service}</h2>
                <div className="mt-2">
                  <span
                    className={`inline-block px-2 py-1 rounded-full text-sm ${
                      service.status === 'healthy'
                        ? 'bg-green-100 text-green-800'
                        : service.status === 'unhealthy'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {service.status.charAt(0).toUpperCase() + service.status.slice(1)}
                  </span>
                </div>
              </div>
              <p className="text-sm text-gray-500">
                Last checked: {service.lastChecked}
              </p>
            </div>
            
            {service.error && (
              <p className="mt-2 text-sm text-red-600">
                Error: {service.error}
              </p>
            )}
            
            {service.details && service.status === 'healthy' && (
              <div className="mt-2 text-sm text-gray-600">
                {service.details.uptime && (
                  <p>Uptime: {service.details.uptime}</p>
                )}
              </div>
            )}
          </Card>
        ))}
      </div>

      <div className="mt-6 flex justify-between items-center">
        <button
          onClick={() => window.location.reload()}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          Refresh Status
        </button>
        <p className="text-sm text-gray-500">
          Auto-refreshes every 30 seconds
        </p>
      </div>
    </div>
  );
}
