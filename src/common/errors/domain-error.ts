export class DomainError extends Error {
  constructor(message: string, public readonly code: string = 'DOMAIN_ERROR') {
    super(message);
    this.name = 'DomainError';
  }
}

export class EntityNotFoundError extends DomainError {
  constructor(entityName: string, identifier: string | number) {
    super(`${entityName} with identifier '${identifier}' was not found.`, 'ENTITY_NOT_FOUND');
    this.name = 'EntityNotFoundError';
  }
}

export class BusinessRuleViolationError extends DomainError {
  constructor(message: string) {
    super(message, 'BUSINESS_RULE_VIOLATION');
    this.name = 'BusinessRuleViolationError';
  }
}

export class ConcurrencyConflictError extends DomainError {
  constructor(message: string = 'Resource state was modified by another operation.') {
    super(message, 'CONCURRENCY_CONFLICT');
    this.name = 'ConcurrencyConflictError';
  }
}
