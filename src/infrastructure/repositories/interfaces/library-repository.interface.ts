import { IBaseRepository } from './base-repository.interface';

export interface BookEntity {
  id: string;
  isbn: string;
  title: string;
  author: string;
  publisher: string;
  category: string;
  totalCopies: number;
  availableCopies: number;
  shelfLocation: string;
  schoolId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface BookLoanEntity {
  id: string;
  bookId: string;
  borrowerId: string;
  borrowerType: 'STUDENT' | 'STAFF';
  issueDate: string;
  dueDate: string;
  returnDate?: string;
  fineAmount: number;
  status: 'ISSUED' | 'RETURNED' | 'OVERDUE' | 'LOST';
}

export interface ILibraryRepository extends IBaseRepository<BookEntity> {
  findByIsbn(isbn: string): Promise<BookEntity | null>;
  createLoan(loan: Omit<BookLoanEntity, 'id'>): Promise<BookLoanEntity>;
  findLoanById(id: string): Promise<BookLoanEntity | null>;
  updateLoan(id: string, updates: Partial<BookLoanEntity>): Promise<BookLoanEntity>;
  findActiveLoansByBorrower(borrowerId: string): Promise<BookLoanEntity[]>;
  findOverdueLoans(): Promise<BookLoanEntity[]>;
}
