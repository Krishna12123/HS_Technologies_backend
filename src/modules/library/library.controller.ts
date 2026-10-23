import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { LibraryService } from './library.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { BookEntity } from '../../infrastructure/repositories/interfaces/library-repository.interface';

@ApiTags('Library Management & Circulation')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('library')
export class LibraryController {
  constructor(private readonly service: LibraryService) {}

  @Get('books')
  @Roles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'LIBRARIAN', 'TEACHER', 'STUDENT')
  @ApiOperation({ summary: 'List books in library catalog' })
  async findAllBooks() {
    return this.service.findAllBooks();
  }

  @Post('books')
  @Roles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'LIBRARIAN')
  @ApiOperation({ summary: 'Add a new book to the library catalog' })
  async createBook(@Body() body: Omit<BookEntity, 'id' | 'availableCopies' | 'createdAt' | 'updatedAt'>) {
    return this.service.createBook(body);
  }

  @Post('loans')
  @Roles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'LIBRARIAN')
  @ApiOperation({ summary: 'Issue a book to student/staff (validates borrowing limits & available copies)' })
  async issueBook(
    @Body() body: { bookId: string; borrowerId: string; borrowerType: 'STUDENT' | 'STAFF' },
  ) {
    return this.service.issueBook(body.bookId, body.borrowerId, body.borrowerType);
  }

  @Post('loans/:id/return')
  @Roles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'LIBRARIAN')
  @ApiOperation({ summary: 'Return a borrowed book (automatically calculates overdue fines)' })
  async returnBook(@Param('id') loanId: string) {
    return this.service.returnBook(loanId);
  }

  @Get('overdue')
  @Roles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'LIBRARIAN')
  @ApiOperation({ summary: 'List books that have passed due return date' })
  async getOverdueLoans() {
    return this.service.getOverdueLoans();
  }
}
