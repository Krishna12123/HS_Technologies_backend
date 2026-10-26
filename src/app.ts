import express, { Express, NextFunction, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';

import { env } from './config/env';
import { NotFoundError } from './common/errors/app-error';
import { ErrorCode } from './common/errors/error-codes';
import { authenticate } from './common/middleware/auth.middleware';
import { errorHandlerMiddleware } from './common/middleware/error.middleware';
import { requestIdMiddleware } from './common/middleware/request-id.middleware';
import { sendSuccess } from './common/utils/response.util';

// Academics Module
import { InMemoryAcademicsRepository } from './modules/academics/academics.repository';
import { AcademicsService } from './modules/academics/academics.service';
import { AcademicsController } from './modules/academics/academics.controller';
import { createAcademicsRouter } from './modules/academics/academics.routes';

// Examinations Module
import { InMemoryExamRepository } from './modules/examinations/examinations.repository';
import { ConflictDetectorService } from './modules/examinations/conflict-detector.service';
import { GradingCriteriaService } from './modules/examinations/grading-criteria.service';
import { SchedulingService } from './modules/examinations/scheduling.service';
import { ExaminationsService } from './modules/examinations/examinations.service';
import { ExaminationsController } from './modules/examinations/examinations.controller';
import { createExaminationsRouter } from './modules/examinations/examinations.routes';

// Results and Grading Module
import { InMemoryResultsRepository } from './modules/results-grading/results.repository';
import { MarksValidationService } from './modules/results-grading/marks-validation.service';
import { GradingEngineService } from './modules/results-grading/grading.service';
import { ResultComputationService } from './modules/results-grading/result-computation.service';
import { ResultPublishingService } from './modules/results-grading/result-publishing.service';
import { ReportCardService } from './modules/results-grading/report-card.service';
import { ResultsService } from './modules/results-grading/results.service';
import { ResultsController } from './modules/results-grading/results.controller';
import {
  createExamMarksRouter,
  createResultsRouter
} from './modules/results-grading/results.routes';

export interface AppRepositories {
  academicsRepo: InMemoryAcademicsRepository;
  examRepo: InMemoryExamRepository;
  resultsRepo: InMemoryResultsRepository;
}

export interface AppServices {
  academicsService: AcademicsService;
  conflictDetector: ConflictDetectorService;
  gradingCriteriaService: GradingCriteriaService;
  schedulingService: SchedulingService;
  examinationsService: ExaminationsService;
  marksValidationService: MarksValidationService;
  gradingEngineService: GradingEngineService;
  resultComputationService: ResultComputationService;
  resultPublishingService: ResultPublishingService;
  reportCardService: ReportCardService;
  resultsService: ResultsService;
}

export function createApp(customRepos?: Partial<AppRepositories>): {
  app: Express;
  repos: AppRepositories;
  services: AppServices;
} {
  const app = express();

  // 1. Instantiate Repositories
  const academicsRepo = customRepos?.academicsRepo || new InMemoryAcademicsRepository();
  const examRepo = customRepos?.examRepo || new InMemoryExamRepository();
  const resultsRepo = customRepos?.resultsRepo || new InMemoryResultsRepository();

  const repos: AppRepositories = {
    academicsRepo,
    examRepo,
    resultsRepo
  };

  // 2. Instantiate Services
  const academicsService = new AcademicsService(academicsRepo);
  const conflictDetector = new ConflictDetectorService();
  const gradingCriteriaService = new GradingCriteriaService();
  const schedulingService = new SchedulingService(examRepo, conflictDetector);
  const examinationsService = new ExaminationsService(examRepo);

  const marksValidationService = new MarksValidationService();
  const gradingEngineService = new GradingEngineService();
  const resultComputationService = new ResultComputationService(gradingEngineService);
  const resultPublishingService = new ResultPublishingService(
    resultsRepo,
    examRepo,
    resultComputationService
  );
  const reportCardService = new ReportCardService(resultsRepo, examRepo);
  const resultsService = new ResultsService(
    resultsRepo,
    examRepo,
    marksValidationService,
    resultComputationService
  );

  const services: AppServices = {
    academicsService,
    conflictDetector,
    gradingCriteriaService,
    schedulingService,
    examinationsService,
    marksValidationService,
    gradingEngineService,
    resultComputationService,
    resultPublishingService,
    reportCardService,
    resultsService
  };

  // 3. Controllers
  const academicsController = new AcademicsController(academicsService);
  const examinationsController = new ExaminationsController(
    examinationsService,
    schedulingService,
    gradingCriteriaService,
    examRepo
  );
  const resultsController = new ResultsController(
    resultsService,
    resultPublishingService,
    reportCardService,
    resultsRepo
  );

  // 4. Global Middlewares
  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(requestIdMiddleware);
  app.use(authenticate);

  // 5. Health Check endpoints
  const healthHandler = (_req: Request, res: Response) => {
    sendSuccess(res, {
      status: 'UP',
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    }, 200, 'Health check passed');
  };

  app.get('/health', healthHandler);
  app.get('/api/v1/health', healthHandler);

  // 6. Swagger Documentation (if available)
  try {
    const fs = require('fs');
    const possiblePaths = [
      path.resolve(__dirname, 'docs/openapi.yaml'),
      path.resolve(process.cwd(), 'src/docs/openapi.yaml'),
      path.resolve(process.cwd(), 'docs/openapi.yaml')
    ];
    const resolvedPath = possiblePaths.find((p) => fs.existsSync(p));
    if (resolvedPath) {
      const swaggerDocument = YAML.load(resolvedPath);
      app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
    }
  } catch (err) {
    // Non-fatal if docs are omitted
  }

  // 7. Mount API Modules with /api/v1 Prefix
  const apiRouter = express.Router();
  apiRouter.use('/academics', createAcademicsRouter(academicsController));
  apiRouter.use('/exams', createExamMarksRouter(resultsController));
  apiRouter.use('/exams', createExaminationsRouter(examinationsController));
  apiRouter.use('/results', createResultsRouter(resultsController));

  app.use(env.API_PREFIX, apiRouter);

  // 8. 404 Handler
  app.use((req: Request, _res: Response, next: NextFunction) => {
    next(
      new NotFoundError(
        `Resource not found for ${req.method} ${req.originalUrl}`,
        ErrorCode.NOT_FOUND
      )
    );
  });

  // 9. Centralized Error Handling
  app.use(errorHandlerMiddleware);

  return { app, repos, services };
}

export const defaultAppInstance = createApp();
export const app = defaultAppInstance.app;
