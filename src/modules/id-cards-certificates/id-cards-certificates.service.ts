import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IStudentRepository } from '../../infrastructure/repositories/interfaces/student-repository.interface';
import { IStaffRepository } from '../../infrastructure/repositories/interfaces/staff-repository.interface';
import { IDocumentGenerator } from '../../infrastructure/document-generation/document-generator.interface';

@Injectable()
export class IdCardsCertificatesService {
  constructor(
    @Inject('IStudentRepository')
    private readonly studentRepository: IStudentRepository,
    @Inject('IStaffRepository')
    private readonly staffRepository: IStaffRepository,
    @Inject('IDocumentGenerator')
    private readonly documentGenerator: IDocumentGenerator,
  ) {}

  async generateStudentIdCard(studentId: string) {
    const student = await this.studentRepository.findById(studentId);
    if (!student) throw new NotFoundException(`Student '${studentId}' not found`);

    return this.documentGenerator.generatePdf({
      title: `Student ID Card - ${student.firstName} ${student.lastName}`,
      templateType: 'ID_CARD',
      data: {
        type: 'STUDENT',
        id: student.id,
        name: `${student.firstName} ${student.lastName}`,
        admissionNumber: student.admissionNumber,
        class: student.classId,
        section: student.sectionId,
        emergencyContact: student.parentPhone,
      },
    });
  }

  async generateStaffIdCard(staffId: string) {
    const staff = await this.staffRepository.findById(staffId);
    if (!staff) throw new NotFoundException(`Staff '${staffId}' not found`);

    return this.documentGenerator.generatePdf({
      title: `Staff ID Card - ${staff.firstName} ${staff.lastName}`,
      templateType: 'ID_CARD',
      data: {
        type: 'STAFF',
        id: staff.id,
        name: `${staff.firstName} ${staff.lastName}`,
        employeeCode: staff.employeeCode,
        department: staff.department,
        designation: staff.designation,
      },
    });
  }

  async generateTransferCertificate(studentId: string, reason: string) {
    const student = await this.studentRepository.findById(studentId);
    if (!student) throw new NotFoundException(`Student '${studentId}' not found`);

    const doc = await this.documentGenerator.generatePdf({
      title: `Transfer Certificate - ${student.firstName} ${student.lastName}`,
      templateType: 'TRANSFER_CERTIFICATE',
      data: {
        studentName: `${student.firstName} ${student.lastName}`,
        admissionNumber: student.admissionNumber,
        dateOfBirth: student.dateOfBirth,
        classLeft: student.classId,
        reasonForLeaving: reason,
        conduct: 'Good',
        leavingDate: new Date().toISOString().split('T')[0],
      },
    });

    await this.studentRepository.update(studentId, { status: 'TRANSFERRED' });

    return {
      certificate: doc,
      studentStatus: 'TRANSFERRED',
    };
  }

  async generateBonafideCertificate(studentId: string) {
    const student = await this.studentRepository.findById(studentId);
    if (!student) throw new NotFoundException(`Student '${studentId}' not found`);

    return this.documentGenerator.generatePdf({
      title: `Bonafide Certificate - ${student.firstName} ${student.lastName}`,
      templateType: 'BONAFIDE_CERTIFICATE',
      data: {
        studentName: `${student.firstName} ${student.lastName}`,
        admissionNumber: student.admissionNumber,
        classId: student.classId,
        academicYear: '2026-2027',
      },
    });
  }
}
