import { Module } from '@nestjs/common';
import { PrometheusService } from './prometheus.service';
import { MetricsInterceptor } from '../interceptors/metrics.interceptor';
import { PrometheusController } from './prometheus.controller';

@Module({
    providers: [PrometheusService, MetricsInterceptor],
    controllers: [PrometheusController],
    exports: [MetricsInterceptor],
})
export class PrometheusModule { }
