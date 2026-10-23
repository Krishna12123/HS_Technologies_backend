import { Injectable } from '@nestjs/common';
import { BaseInMemoryRepository } from './base-in-memory.repository';
import {
  ILibraryRepository,
  BookEntity,
  BookLoanEntity,
} from '../interfaces/library-repository.interface';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class InMemoryLibraryRepository
  extends BaseInMemoryRepository<BookEntity>
  implements ILibraryRepository
{
  private readonly loans = new Map<string, BookLoanEntity>();

  constructor() {
    super('InMemoryLibraryRepository');
    this.seedDevBooks();
  }

  private async seedDevBooks() {
    await this.create({
      id: 'bk-001',
      isbn: '978-0132350884',
      title: 'Clean Code: A Handbook of Agile Software Craftsmanship',
      author: 'Robert C. Martin',
      publisher: 'Prentice Hall',
      category: 'Computer Science',
      totalCopies: 5,
      availableCopies: 5,
      shelfLocation: 'Shelf-CS-01',
      schoolId: 'SCH-001',
    });
  }

  async findByIsbn(isbn: string): Promise<BookEntity | null> {
    const all = Array.from(this.items.values());
    const match = all.find((b) => b.isbn.replace(/[^0-9X]/gi, '') === isbn.replace(/[^0-9X]/gi, ''));
    return match ? { ...match } : null;
  }

  async createLoan(loan: Omit<BookLoanEntity, 'id'>): Promise<BookLoanEntity> {
    const id = uuidv4();
    const newLoan: BookLoanEntity = { ...loan, id };
    this.loans.set(id, newLoan);

    // Deduct available copy
    const book = this.items.get(loan.bookId);
    if (book && book.availableCopies > 0) {
      book.availableCopies -= 1;
      this.items.set(loan.bookId, book);
    }

    return { ...newLoan };
  }

  async findLoanById(id: string): Promise<BookLoanEntity | null> {
    const loan = this.loans.get(id);
    return loan ? { ...loan } : null;
  }

  async updateLoan(id: string, updates: Partial<BookLoanEntity>): Promise<BookLoanEntity> {
    const existing = this.loans.get(id);
    if (!existing) {
      throw new Error(`Loan '${id}' not found`);
    }
    const updated = { ...existing, ...updates };
    this.loans.set(id, updated);

    // Restore available copy if returned
    if (updates.status === 'RETURNED' && existing.status !== 'RETURNED') {
      const book = this.items.get(existing.bookId);
      if (book) {
        book.availableCopies += 1;
        this.items.set(existing.bookId, book);
      }
    }

    return { ...updated };
  }

  async findActiveLoansByBorrower(borrowerId: string): Promise<BookLoanEntity[]> {
    return Array.from(this.loans.values()).filter(
      (l) => l.borrowerId === borrowerId && (l.status === 'ISSUED' || l.status === 'OVERDUE'),
    );
  }

  async findOverdueLoans(): Promise<BookLoanEntity[]> {
    const today = new Date().toISOString().split('T')[0];
    return Array.from(this.loans.values()).filter(
      (l) => l.status === 'ISSUED' && l.dueDate < today,
    );
  }
}
