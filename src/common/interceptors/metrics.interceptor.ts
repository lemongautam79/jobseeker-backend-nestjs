import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { PrometheusService } from '../prometheus/prometheus.service';

@Injectable()
export class MetricsInterceptor implements NestInterceptor {
    constructor(private metrics: PrometheusService) { }

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const req = context.switchToHttp().getRequest();
        const res = context.switchToHttp().getResponse();

        const method = req.method;
        const route = req.route?.path || req.url;

        const start = process.hrtime();

        return next.handle().pipe(
            tap(() => {
                const diff = process.hrtime(start);
                const duration = diff[0] + diff[1] / 1e9;
                const status = res.statusCode.toString();

                this.metrics.httpDuration
                    .labels(method, route, status)
                    .observe(duration);

                this.metrics.httpRequests
                    .labels(method, route, status)
                    .inc();
            }),
        );
    }
}
