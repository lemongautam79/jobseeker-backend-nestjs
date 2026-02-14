import { Injectable } from '@nestjs/common';
import { Histogram, Counter, Registry, collectDefaultMetrics } from 'prom-client';

@Injectable()
export class PrometheusService {
    private readonly register = new Registry();

    public readonly httpDuration: Histogram<string>;
    public readonly httpRequests: Counter<string>;

    constructor() {
        this.register.setDefaultLabels({ app: 'nestjs-prometheus' });

        //! Collect Node.js default metrics (CPU, memory, event loop, etc.)
        collectDefaultMetrics({
            register: this.register,
        });

        //! Request latency histogram
        this.httpDuration = new Histogram({
            name: 'http_request_duration_seconds',
            help: 'HTTP request latency',
            labelNames: ['method', 'route', 'status'],
            buckets: [0.05, 0.1, 0.2, 0.4, 0.5, 1, 2, 5],
            registers: [this.register],
        });

        //! Request counter
        this.httpRequests = new Counter({
            name: 'http_requests_total',
            help: 'Total HTTP requests',
            labelNames: ['method', 'route', 'status'],
            registers: [this.register],
        });

        
    }

    getMetrics(): Promise<string> {
        return this.register.metrics();
    }
}