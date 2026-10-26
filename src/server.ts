import { app } from './app';
import { env } from './config/env';

const server = app.listen(env.PORT, () => {
  console.log(`===============================================`);
  console.log(`  School ERP Backend Service Running`);
  console.log(`  Environment: ${env.NODE_ENV}`);
  console.log(`  Port:        ${env.PORT}`);
  console.log(`  API Base:    http://localhost:${env.PORT}${env.API_PREFIX}`);
  console.log(`  Swagger UI:  http://localhost:${env.PORT}/api-docs`);
  console.log(`===============================================`);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});
