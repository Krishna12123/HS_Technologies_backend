import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import {
  ILibraryRepository,
  BookEntity,
  BookLoanEntity,
} from '../../infrastructure/repositories/interfaces/library-repository.interface';

@Injectable()
export class LibraryService {
  constructor(
    @Inject('ILibraryRepository')
    private readonly libraryRepository: ILibraryRepository,
  ) {}

  async findAllBooks(): Promise<BookEntity[]> {
    return this.libraryRepository.findAll();
  }

  async createBook(data: Omit<BookEntity, 'id' | 'availableCopies' | 'createdAt' | 'updatedAt'>): Promise<BookEntity> {
    const existing = await this.libraryRepository.findByIsbn(data.isbn);
    if (existing) {
      throw new BadRequestException(`Book with ISBN '${data.isbn}' already cataloged.`);
    }

    return this.libraryRepository.create({
      ...data,
      availableCopies: data.totalCopies,
      schoolId: 'SCH-001',
    });
  }

  async issueBook(bookId: string, borrowerId: string, borrowerType: 'STUDENT' | 'STAFF') {
    const book = await this.libraryRepository.findById(bookId);
    if (!book) {
      throw new NotFoundException(`Book '${bookId}' not found`);
    }

    // Business Rule 1: Copy Availability
    if (book.availableCopies <= 0) {
      throw new BadRequestException(`No available physical copies for '${book.title}'. All copies currently on loan.`);
    }

    // Business Rule 2: Max active loans limit (e.g. 3 books per student)
    const activeLoans = await this.libraryRepository.findActiveLoansByBorrower(borrowerId);
    if (borrowerType === 'STUDENT' && activeLoans.length >= 3) {
      throw new BadRequestException('Borrowing limit reached: Students can hold a maximum of 3 books at a time.');
    }

    const today = new Date();
    const dueDate = new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000); // 14-day borrowing period

    return this.libraryRepository.createLoan({
      bookId,
      borrowerId,
      borrowerType,
      issueDate: today.toISOString().split('T')[0],
      dueDate: dueDate.toISOString().split('T')[0],
      fineAmount: 0,
      status: 'ISSUED',
    });
  }

  async returnBook(loanId: string) {
    const loan = await this.libraryRepository.findLoanById(loanId);
    if (!loan) {
      throw new NotFoundException(`Loan record '${loanId}' not found`);
    }

    if (loan.status === 'RETURNED') {
      return { loan, message: 'Book already marked as returned.' };
    }

    const today = new Date().toISOString().split('T')[0];
    let fine = 0;

    // Overdue Fine Calculation ($2 per overdue day)
    if (today > loan.dueDate) {
      const msDiff = new Date(today).getTime() - new Date(loan.dueDate).getTime();
      const daysOverdue = Math.ceil(msDiff / (1000 * 60 * 60 * 24));
      fine = daysOverdue * 2;
    }

    const updated = await this.libraryRepository.updateLoan(loanId, {
      returnDate: today,
      fineAmount: fine,
      status: 'RETURNED',
    });

    return {
      loan: updated,
      fineLevied: fine,
      message: fine > 0 ? `Book returned with $${fine} overdue fine levied.` : 'Book returned on time without fines.',
    };
  }

  async getOverdueLoans(): Promise<BookLoanEntity[]> {
    return this.libraryRepository.findOverdueLoans();
  }
}
