import { Module } from '@nestjs/common';
import { LibraryController } from './library.controller';
import { LibraryService } from './library.service';
import { InMemoryLibraryRepository } from '../../infrastructure/repositories/in-memory/in-memory-library.repository';

@Module({
  controllers: [LibraryController],
  providers: [
    LibraryService,
    {
      provide: 'ILibraryRepository',
      useClass: InMemoryLibraryRepository,
    },
  ],
  exports: [LibraryService, 'ILibraryRepository'],
})
export class LibraryModule {}
