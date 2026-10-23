import { Module } from '@nestjs/common';
import { ResultsGradingController } from './results-grading.controller';
import { ResultsGradingService } from './results-grading.service';
import { ExaminationsModule } from '../examinations/examinations.module';

@Module({
  imports: [ExaminationsModule],
  controllers: [ResultsGradingController],
  providers: [ResultsGradingService],
  exports: [ResultsGradingService],
})
export class ResultsGradingModule {}
