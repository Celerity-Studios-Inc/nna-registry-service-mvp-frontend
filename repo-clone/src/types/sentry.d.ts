declare module '@sentry/nestjs' {
    export function init(options: any): void;
    export const SentryExceptionCaptured: () => MethodDecorator;
}

declare module '@sentry/nestjs/setup' {
    import { DynamicModule } from '@nestjs/common';
    
    export class SentryModule {
        static forRoot(): DynamicModule;
    }
    
    export class SentryGlobalFilter {
        catch(exception: any, host: any): void;
    }
} 