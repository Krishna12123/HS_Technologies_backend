import { Module } from '@nestjs/common';
import { ClassesSectionsController } from './classes-sections.controller';
import { ClassesSectionsService } from './classes-sections.service';

@Module({
  controllers: [ClassesSectionsController],
  providers: [ClassesSectionsService],
  exports: [ClassesSectionsService],
})
export class ClassesSectionsModule {}
